import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

export interface AIConfig {
  provider: 'deepseek';
  model: 'deepseek-reasoner';
  apiKey: string;
  baseUrl: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
}

export interface AISkill {
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsExperience: number;
  confidence: number;
  context: string;
  certifications: string[];
  relatedSkills: string[];
  reasoning: string;
}

export interface AIJobRequirement {
  skill: string;
  category: string;
  importance: 'critical' | 'important' | 'nice-to-have';
  minimumLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsRequired?: number;
  context: string;
  reasoning: string;
  confidence: number;
  marketDemand: 'high' | 'medium' | 'low';
  salaryImpact: 'high' | 'medium' | 'low' | 'neutral';
}

export interface AISkillGap {
  skillName: string;
  category: string;
  currentLevel?: string;
  requiredLevel: string;
  gapSeverity: 'critical' | 'moderate' | 'minor';
  priority: number;
  timeToCompetency: number;
  learningDifficulty: 'easy' | 'moderate' | 'hard' | 'very-hard';
  recommendations: string[];
  resources: string[];
  reasoning: string;
}

export interface AICareerPath {
  title: string;
  description: string;
  matchScore: number;
  requiredSkills: string[];
  timeToTransition: number;
  salaryRange: { min: number; max: number; currency: string };
  reasoning: string;
}

export interface AILearningPlan {
  immediate: Array<{ skill: string; action: string; timeframe: string; resources: string[] }>;
  shortTerm: Array<{ skill: string; action: string; timeframe: string; resources: string[] }>;
  longTerm: Array<{ skill: string; action: string; timeframe: string; resources: string[] }>;
}

export interface AISkillsAnalysis {
  skills: AISkill[];
  categories: string[];
  overallExperience: string;
  education: string[];
  certifications: string[];
  strengths: string[];
  areasForImprovement: string[];
  careerLevel: 'entry' | 'mid' | 'senior' | 'executive';
  reasoning: string;
}

export interface AIJobAnalysis {
  jobTitle: string;
  company?: string;
  industry: string;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  skillRequirements: AIJobRequirement[];
  softSkills: string[];
  responsibilities: string[];
  benefits: string[];
  salaryRange?: { min?: number; max?: number; currency?: string };
  workArrangement: 'remote' | 'hybrid' | 'onsite' | 'flexible';
  companySize?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  teamStructure?: 'individual' | 'small-team' | 'large-team' | 'cross-functional';
  growthOpportunities: string[];
  culturalFit: string[];
  urgencyLevel: 'urgent' | 'normal' | 'flexible';
  competitiveAdvantages: string[];
  redFlags: string[];
  implicitRequirements: Array<{
    skill: string;
    reasoning: string;
    confidence: number;
  }>;
  reasoning: string;
}

export interface AIGapAnalysis {
  overallMatch: number;
  skillGaps: AISkillGap[];
  strengths: AISkill[];
  transferableSkills: Array<{ from: string; to: string; reasoning: string }>;
  careerPaths: AICareerPath[];
  learningPlan: AILearningPlan;
  marketInsights: string[];
  competitiveAdvantage: string[];
  reasoning: string;
}

export class DeepSeekAIService {
  private config: AIConfig;
  private rateLimitTracker: Map<string, number> = new Map();
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  constructor(config: AIConfig) {
    this.config = config;
  }

  /**
   * Extract skills from CV text using DeepSeek AI with intelligent chunking
   */
  async extractSkillsFromCV(cvText: string): Promise<AISkillsAnalysis> {
    try {
      // Check if resume is too long and needs chunking
      const MAX_SINGLE_PROMPT_LENGTH = 8000; // Conservative limit for single prompt
      
      if (cvText.length <= MAX_SINGLE_PROMPT_LENGTH) {
        // Process normally for shorter resumes
        const prompt = this.createSkillsExtractionPrompt(cvText);
        const response = await this.callDeepSeekAPI(prompt, 'skills-extraction');
        return this.parseSkillsAnalysisResponse(response);
      } else {
        // Use chunking strategy for longer resumes
        logger.info('Resume is long, using chunking strategy', { length: cvText.length });
        return await this.extractSkillsWithChunking(cvText);
      }
    } catch (error) {
      logger.error('AI skills extraction failed:', error);
      throw new AppError('AI skills extraction failed', 500, 'AI_SKILLS_EXTRACTION_FAILED');
    }
  }

  /**
   * Extract skills using intelligent chunking for long resumes
   */
  private async extractSkillsWithChunking(cvText: string): Promise<AISkillsAnalysis> {
    // Split resume into logical sections
    const sections = this.splitResumeIntoSections(cvText);
    logger.info('Split resume into sections', { sectionCount: sections.length });

    // Process each section
    const sectionResults: AISkillsAnalysis[] = [];
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      logger.info(`Processing section ${i + 1}/${sections.length}`, { 
        sectionType: section.type, 
        length: section.content.length 
      });

      try {
        const prompt = this.createSectionSkillsExtractionPrompt(section.content, section.type);
        const response = await this.callDeepSeekAPI(prompt, `skills-extraction-section-${i}`);
        const sectionResult = this.parseSkillsAnalysisResponse(response);
        sectionResults.push(sectionResult);
        
        // Add small delay between sections to avoid rate limiting
        if (i < sections.length - 1) {
          await this.delay(500);
        }
      } catch (error) {
        logger.warn(`Failed to process section ${i + 1}, continuing with others:`, error);
        // Continue processing other sections even if one fails
      }
    }

    // Combine results from all sections
    return this.combineSkillsAnalysisResults(sectionResults);
  }

  /**
   * Split resume into logical sections for processing
   */
  private splitResumeIntoSections(cvText: string): Array<{ type: string; content: string }> {
    const sections: Array<{ type: string; content: string }> = [];
    const MAX_SECTION_LENGTH = 6000; // Safe size per section

    // Common resume section headers (case insensitive)
    const sectionHeaders = [
      /(?:^|\n)\s*(?:PROFESSIONAL\s+)?(?:SUMMARY|PROFILE|OBJECTIVE)[\s:]/i,
      /(?:^|\n)\s*(?:WORK\s+)?(?:EXPERIENCE|EMPLOYMENT|CAREER\s+HISTORY)[\s:]/i,
      /(?:^|\n)\s*(?:TECHNICAL\s+)?(?:SKILLS|COMPETENCIES|EXPERTISE)[\s:]/i,
      /(?:^|\n)\s*(?:EDUCATION|ACADEMIC\s+BACKGROUND|QUALIFICATIONS)[\s:]/i,
      /(?:^|\n)\s*(?:PROJECTS|PORTFOLIO|ACHIEVEMENTS)[\s:]/i,
      /(?:^|\n)\s*(?:CERTIFICATIONS|CERTIFICATES|LICENSES)[\s:]/i,
      /(?:^|\n)\s*(?:LANGUAGES|PUBLICATIONS|AWARDS|VOLUNTEER)[\s:]/i,
    ];

    // Find section boundaries
    const boundaries: Array<{ index: number; type: string }> = [];
    
    sectionHeaders.forEach((regex, i) => {
      const sectionTypes = ['summary', 'experience', 'skills', 'education', 'projects', 'certifications', 'other'];
      const matches = [...cvText.matchAll(new RegExp(regex.source, 'gi'))];
      matches.forEach(match => {
        if (match.index !== undefined) {
          boundaries.push({ index: match.index, type: sectionTypes[i] });
        }
      });
    });

    // Sort boundaries by position
    boundaries.sort((a, b) => a.index - b.index);

    if (boundaries.length === 0) {
      // No clear sections found, split by length
      return this.splitByLength(cvText, MAX_SECTION_LENGTH);
    }

    // Extract sections based on boundaries
    for (let i = 0; i < boundaries.length; i++) {
      const start = boundaries[i].index;
      const end = i < boundaries.length - 1 ? boundaries[i + 1].index : cvText.length;
      const content = cvText.substring(start, end).trim();
      
      if (content.length > MAX_SECTION_LENGTH) {
        // Section is still too long, split it further
        const subSections = this.splitByLength(content, MAX_SECTION_LENGTH);
        subSections.forEach((subSection, j) => {
          sections.push({
            type: `${boundaries[i].type}-part${j + 1}`,
            content: subSection.content
          });
        });
      } else if (content.length > 100) { // Ignore very short sections
        sections.push({
          type: boundaries[i].type,
          content: content
        });
      }
    }

    return sections.length > 0 ? sections : this.splitByLength(cvText, MAX_SECTION_LENGTH);
  }

  /**
   * Split text by length when no logical sections are found
   */
  private splitByLength(text: string, maxLength: number): Array<{ type: string; content: string }> {
    const sections: Array<{ type: string; content: string }> = [];
    let currentIndex = 0;
    let partNumber = 1;

    while (currentIndex < text.length) {
      let endIndex = Math.min(currentIndex + maxLength, text.length);
      
      // Try to break at a natural boundary (paragraph, sentence)
      if (endIndex < text.length) {
        const lastParagraph = text.lastIndexOf('\n\n', endIndex);
        const lastSentence = text.lastIndexOf('.', endIndex);
        const lastSpace = text.lastIndexOf(' ', endIndex);
        
        if (lastParagraph > currentIndex + maxLength * 0.7) {
          endIndex = lastParagraph;
        } else if (lastSentence > currentIndex + maxLength * 0.7) {
          endIndex = lastSentence + 1;
        } else if (lastSpace > currentIndex + maxLength * 0.8) {
          endIndex = lastSpace;
        }
      }

      const content = text.substring(currentIndex, endIndex).trim();
      if (content.length > 50) { // Only add non-trivial sections
        sections.push({
          type: `part${partNumber}`,
          content: content
        });
        partNumber++;
      }
      
      currentIndex = endIndex;
    }

    return sections;
  }

  /**
   * Create section-specific skills extraction prompt
   */
  private createSectionSkillsExtractionPrompt(sectionContent: string, sectionType: string): string {
    const sectionContext = this.getSectionContext(sectionType);
    
    return `
Rules:
- This is a ${sectionType} section from a resume. ${sectionContext}
- Normalize skill names to Title Case; categories ∈ ["Programming","Cloud","Data","Management","Design","DevOps","Security","Other"].
- level ∈ ["beginner","intermediate","advanced","expert"]; confidence ∈ [0,1] with 2 decimals; yearsExperience ≥ 0 (int).
- Focus on skills most relevant to this section type. Use null/[] for unknowns. Return only the JSON object.

Output schema:
{
  "skills": [
    {
      "name": "string",
      "category": "CategoryEnum", 
      "level": "LevelEnum",
      "yearsExperience": 0,
      "confidence": 0.0,
      "context": "string|null",
      "certifications": ["string"],
      "relatedSkills": ["string"]
    }
  ],
  "categories": ["CategoryEnum"],
  "overallExperience": "string|null",
  "education": ["string"],
  "certifications": ["string"],
  "strengths": ["string"],
  "areasForImprovement": ["string"],
  "careerLevel": "LevelEnum"
}

Resume Section (${sectionType}):
"""
${sectionContent}
"""
`;
  }

  /**
   * Get context information for different section types
   */
  private getSectionContext(sectionType: string): string {
    const contexts = {
      'summary': 'Focus on high-level skills and experience mentioned in the professional summary.',
      'experience': 'Extract skills from job responsibilities, technologies used, and achievements.',
      'skills': 'This is the main skills section - extract all technical and professional skills listed.',
      'education': 'Focus on academic qualifications, relevant coursework, and educational achievements.',
      'projects': 'Extract skills and technologies used in projects and portfolio work.',
      'certifications': 'Focus on professional certifications and their associated skills.',
      'other': 'Extract any additional skills mentioned in this section.',
    };
    
    return contexts[sectionType] || contexts['other'];
  }

  /**
   * Combine results from multiple sections into a single analysis
   */
  private combineSkillsAnalysisResults(sectionResults: AISkillsAnalysis[]): AISkillsAnalysis {
    if (sectionResults.length === 0) {
      throw new Error('No section results to combine');
    }

    if (sectionResults.length === 1) {
      return sectionResults[0];
    }

    // Combine skills with deduplication and confidence merging
    const skillsMap = new Map<string, any>();
    const allCategories = new Set<string>();
    const allEducation = new Set<string>();
    const allCertifications = new Set<string>();
    const allStrengths = new Set<string>();
    const allAreasForImprovement = new Set<string>();

    let totalExperience = '';
    let highestCareerLevel = 'entry';

    sectionResults.forEach(result => {
      // Merge skills
      result.skills.forEach(skill => {
        const key = skill.name.toLowerCase();
        if (skillsMap.has(key)) {
          const existing = skillsMap.get(key);
          // Keep the higher confidence and experience
          if (skill.confidence > existing.confidence) {
            existing.confidence = skill.confidence;
            existing.level = skill.level;
            existing.context = skill.context;
          }
          existing.yearsExperience = Math.max(existing.yearsExperience, skill.yearsExperience);
          existing.certifications = [...new Set([...existing.certifications, ...skill.certifications])];
          existing.relatedSkills = [...new Set([...existing.relatedSkills, ...skill.relatedSkills])];
        } else {
          skillsMap.set(key, { ...skill });
        }
      });

      // Merge other fields
      result.categories.forEach(cat => allCategories.add(cat));
      result.education.forEach(edu => allEducation.add(edu));
      result.certifications.forEach(cert => allCertifications.add(cert));
      result.strengths.forEach(strength => allStrengths.add(strength));
      result.areasForImprovement.forEach(area => allAreasForImprovement.add(area));

      // Keep the most comprehensive experience description
      if (result.overallExperience && result.overallExperience.length > totalExperience.length) {
        totalExperience = result.overallExperience;
      }

      // Keep the highest career level
      const levelOrder = ['entry', 'mid', 'senior', 'executive'];
      if (levelOrder.indexOf(result.careerLevel) > levelOrder.indexOf(highestCareerLevel)) {
        highestCareerLevel = result.careerLevel;
      }
    });

    return {
      skills: Array.from(skillsMap.values()).sort((a, b) => b.confidence - a.confidence),
      categories: Array.from(allCategories),
      overallExperience: totalExperience,
      education: Array.from(allEducation),
      certifications: Array.from(allCertifications),
      strengths: Array.from(allStrengths),
      areasForImprovement: Array.from(allAreasForImprovement),
      careerLevel: highestCareerLevel as any,
      reasoning: `Combined analysis from ${sectionResults.length} resume sections`
    };
  }

  /**
   * Analyze job description using DeepSeek AI with length optimization
   */
  async analyzeJobDescription(jobText: string): Promise<AIJobAnalysis> {
    try {
      // Optimize job text length while preserving key information
      const optimizedJobText = this.optimizeJobText(jobText);
      const prompt = this.createJobAnalysisPrompt(optimizedJobText);
      
      const response = await this.callDeepSeekAPI(prompt, 'job-analysis');
      return this.parseJobAnalysisResponse(response);
    } catch (error) {
      logger.error('AI job analysis failed:', error);
      throw new AppError('AI job analysis failed', 500, 'AI_JOB_ANALYSIS_FAILED');
    }
  }

  /**
   * Optimize job text by focusing on key sections and removing redundancy
   */
  private optimizeJobText(jobText: string): string {
    const MAX_JOB_LENGTH = 6000; // Conservative limit for job descriptions
    
    if (jobText.length <= MAX_JOB_LENGTH) {
      return jobText;
    }

    // Extract key sections in order of importance
    const sections = [
      { regex: /(?:requirements?|qualifications?|skills?)[\s:]/i, priority: 1 },
      { regex: /(?:responsibilities?|duties|role)[\s:]/i, priority: 2 },
      { regex: /(?:experience|background)[\s:]/i, priority: 3 },
      { regex: /(?:benefits?|compensation|salary)[\s:]/i, priority: 4 },
      { regex: /(?:about|company|culture)[\s:]/i, priority: 5 },
    ];

    let optimizedText = '';
    let remainingLength = MAX_JOB_LENGTH;

    // Add sections by priority until we reach the limit
    sections.forEach(section => {
      if (remainingLength <= 0) return;

      const match = jobText.match(new RegExp(`(${section.regex.source}[\\s\\S]*?)(?=\\n\\s*[A-Z][^\\n]*:|$)`, 'i'));
      if (match && match[1]) {
        const sectionText = match[1].trim();
        if (sectionText.length <= remainingLength) {
          optimizedText += sectionText + '\n\n';
          remainingLength -= sectionText.length + 2;
        } else {
          // Take partial section if it's the requirements section (most important)
          if (section.priority === 1) {
            optimizedText += sectionText.substring(0, remainingLength - 50) + '...\n\n';
            remainingLength = 0;
          }
        }
      }
    });

    // If no sections found, take the beginning of the job description
    if (optimizedText.length < 500) {
      optimizedText = jobText.substring(0, MAX_JOB_LENGTH);
    }

    logger.info('Optimized job text', { 
      originalLength: jobText.length, 
      optimizedLength: optimizedText.length 
    });

    return optimizedText;
  }

  /**
   * Perform intelligent gap analysis using DeepSeek AI
   */
  async performGapAnalysis(
    skillsAnalysis: AISkillsAnalysis,
    jobAnalysis: AIJobAnalysis
  ): Promise<AIGapAnalysis> {
    const prompt = this.createGapAnalysisPrompt(skillsAnalysis, jobAnalysis);

    try {
      const response = await this.callDeepSeekAPI(prompt, 'gap-analysis');
      return this.parseGapAnalysisResponse(response);
    } catch (error) {
      logger.error('AI gap analysis failed:', error);
      throw new AppError('AI gap analysis failed', 500, 'AI_GAP_ANALYSIS_FAILED');
    }
  }

  /**
   * Call DeepSeek API with retry logic and rate limiting
   */
  private async callDeepSeekAPI(prompt: string, operation: string): Promise<string> {
    // Check rate limiting
    await this.checkRateLimit(operation);

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        // Dynamic timeout based on prompt length and operation type
        const dynamicTimeout = this.calculateTimeout(prompt, operation);
        
        const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({
            model: this.config.model,
            messages: [
              {
                role: 'system',
                content: 'You are an expert career-analysis model. Output must be a single valid JSON object that matches the user\'s schema exactly. Do not include any text outside the JSON. Do not use markdown or comments. If a value is unknown or not inferable, use null or an empty list. Do not invent facts. Deduplicate items and keep outputs concise.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: this.config.maxTokens,
            temperature: this.config.temperature,
            response_format: { type: 'json_object' }
          }),
          signal: AbortSignal.timeout(dynamicTimeout)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json() as {
          choices?: Array<{
            message?: {
              content?: string;
            };
          }>;
          usage?: {
            total_tokens?: number;
          };
        };

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          throw new Error('Invalid response format from DeepSeek API');
        }

        const content = data.choices[0].message.content;
        if (!content) {
          throw new Error('Empty response content from DeepSeek API');
        }

        // Validate JSON response
        try {
          JSON.parse(content);
        } catch (parseError) {
          throw new Error(`Invalid JSON response from DeepSeek: ${parseError}`);
        }

        // Update rate limit tracking
        this.updateRateLimit(operation);

        logger.info(`DeepSeek AI ${operation} completed successfully`, {
          attempt,
          tokensUsed: data.usage?.total_tokens || 0,
          promptLength: prompt.length,
          timeout: dynamicTimeout
        });

        return content;

      } catch (error) {
        lastError = error as Error;
        const isTimeout = error instanceof Error && (
          error.name === 'TimeoutError' || 
          error.message.includes('timeout') ||
          error.message.includes('aborted')
        );
        
        logger.warn(`DeepSeek API attempt ${attempt} failed:`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          isTimeout,
          operation,
          promptLength: prompt.length
        });

        // For timeout errors, increase delay more aggressively
        if (attempt < this.MAX_RETRIES) {
          const delay = isTimeout ? this.RETRY_DELAY * attempt * 2 : this.RETRY_DELAY * attempt;
          await this.delay(delay);
        }
      }
    }

    throw lastError || new Error('DeepSeek API failed after all retries');
  }

  /**
   * Calculate dynamic timeout based on prompt complexity
   */
  private calculateTimeout(prompt: string, operation: string): number {
    const baseTimeout = 30000; // 30 seconds base
    const lengthMultiplier = Math.min(prompt.length / 1000, 5); // Max 5x multiplier
    
    const operationMultipliers = {
      'skills-extraction': 1.0,
      'job-analysis': 0.8,
      'gap-analysis': 1.5,
      'health-check': 0.3
    };
    
    const operationMultiplier = operationMultipliers[operation as keyof typeof operationMultipliers] || 1.0;
    
    const calculatedTimeout = baseTimeout * lengthMultiplier * operationMultiplier;
    const maxTimeout = 90000; // 90 seconds max
    
    return Math.min(calculatedTimeout, maxTimeout);
  }

  /**
   * Create skills extraction prompt
   */
private createSkillsExtractionPrompt(cvText: string): string {
    return `
Rules:
- Normalize skill names to Title Case; categories ∈ ["Programming","Cloud","Data","Management","Design","DevOps","Security","Other"].
- level ∈ ["beginner","intermediate","advanced","expert"]; confidence ∈ [0,1] with 2 decimals; yearsExperience ≥ 0 (int).
- Merge variants into one entry; variants go to relatedSkills. No soft skills unless explicitly stated.
- Max 100 skills; sort by confidence desc. Use null/[] for unknowns. Return only the JSON object.

Output schema:
{
  "skills": [
    {
      "name": "string",
      "category": "CategoryEnum",
      "level": "LevelEnum",
      "yearsExperience": 0,
      "confidence": 0.0,
      "context": "string|null",
      "certifications": ["string"],
      "relatedSkills": ["string"]
    }
  ],
  "categories": ["CategoryEnum"],
  "overallExperience": "string|null",
  "education": ["string"],
  "certifications": ["string"],
  "strengths": ["string"],
  "areasForImprovement": ["string"],
  "careerLevel": "LevelEnum"
}

CV:
"""
${cvText}
"""
`;
  }

  /**
   * Create job analysis prompt
   */
private createJobAnalysisPrompt(jobText: string): string {
    return `
Rules:
- Normalize skill names to Title Case; categories ∈ ["Programming","Cloud","Data","Management","Design","DevOps","Security","Other"].
- importance ∈ ["critical","important","nice-to-have"]. minimumLevel ∈ ["beginner","intermediate","advanced","expert"].
- Max 100 skillRequirements; de-duplicate by normalized name. Use null/[] for unknowns. Return only JSON.

Output schema:
{
  "jobTitle": "string|null",
  "company": "string|null",
  "industry": "string|null",
  "experienceLevel": "entry|mid|senior|executive|null",
  "skillRequirements": [
    {
      "skill": "string",
      "category": "CategoryEnum",
      "importance": "ImportanceEnum",
      "minimumLevel": "LevelEnum",
      "yearsRequired": 0,
      "context": "string|null",
      "confidence": 0.0,
      "marketDemand": "high|medium|low|null",
      "salaryImpact": "high|medium|low|neutral|null"
    }
  ],
  "softSkills": ["string"],
  "responsibilities": ["string"],
  "benefits": ["string"],
  "salaryRange": {"min": 0, "max": 0, "currency": "USD"},
  "workArrangement": "remote|hybrid|onsite|flexible|null",
  "companySize": "startup|small|medium|large|enterprise|null",
  "teamStructure": "individual|small-team|large-team|cross-functional|null",
  "growthOpportunities": ["string"],
  "culturalFit": ["string"],
  "urgencyLevel": "urgent|normal|flexible|null",
  "competitiveAdvantages": ["string"],
  "redFlags": ["string"],
  "implicitRequirements": [
    { "skill": "string", "reasoning": "string", "confidence": 0.0 }
  ]
}

Job Description:
"""
${jobText}
"""
`;
  }

  /**
   * Create gap analysis prompt
   */
private createGapAnalysisPrompt(skillsAnalysis: AISkillsAnalysis, jobAnalysis: AIJobAnalysis): string {
    return `
Rules:
- Match skills by normalized name; if not matched, omit.
- priority ∈ 1..10; gapSeverity ∈ ["critical","moderate","minor"].
- Cap: skillGaps 50, strengths 25, recommendations/resources per gap 5. Use null/[] for unknowns. Return only JSON.

Candidate Skills:
${JSON.stringify(skillsAnalysis, null, 2)}

Job Requirements:
${JSON.stringify(jobAnalysis, null, 2)}

Output schema:
{
  "overallMatch": 0,
  "skillGaps": [
    {
      "skillName": "string",
      "category": "string",
      "currentLevel": "LevelEnum|null",
      "requiredLevel": "LevelEnum",
      "gapSeverity": "critical|moderate|minor",
      "priority": 1,
      "timeToCompetency": 0,
      "learningDifficulty": "easy|moderate|hard|very-hard",
      "recommendations": ["string"],
      "resources": ["string"]
    }
  ],
  "strengths": [
    { "name": "string", "category": "string", "level": "LevelEnum", "yearsExperience": 0, "confidence": 0.0 }
  ],
  "transferableSkills": [
    { "from": "string", "to": "string", "reasoning": "string" }
  ],
  "careerPaths": [
    { "title": "string", "description": "string", "matchScore": 0, "requiredSkills": ["string"], "timeToTransition": 0, "salaryRange": {"min": 0, "max": 0, "currency": "USD"} }
  ],
  "learningPlan": {
      {
        "skill": "skill name",
        "action": "specific action to take",
        "timeframe": "timeframe",
        "resources": ["specific resources"]
      }
    ],
    "shortTerm": [...],
    "longTerm": [...]
  },
  "marketInsights": ["current market trends relevant to this analysis"],
  "competitiveAdvantage": ["unique strengths that set candidate apart"],
  "reasoning": "overall reasoning for the gap analysis"
}

`;
  }

  /**
   * Parse skills analysis response
   */
  private parseSkillsAnalysisResponse(response: string): AISkillsAnalysis {
    try {
      const parsed = JSON.parse(response);

      // Validate required fields
      if (!parsed.skills || !Array.isArray(parsed.skills)) {
        throw new Error('Invalid skills array in response');
      }

      return parsed as AISkillsAnalysis;
    } catch (error) {
      logger.error('Failed to parse skills analysis response:', error);
      throw new AppError('Invalid AI response format', 500, 'AI_RESPONSE_PARSE_ERROR');
    }
  }

  /**
   * Parse job analysis response
   */
  private parseJobAnalysisResponse(response: string): AIJobAnalysis {
    try {
      const parsed = JSON.parse(response);

      // Validate required fields
      if (!parsed.skillRequirements || !Array.isArray(parsed.skillRequirements)) {
        throw new Error('Invalid skillRequirements array in response');
      }

      return parsed as AIJobAnalysis;
    } catch (error) {
      logger.error('Failed to parse job analysis response:', error);
      throw new AppError('Invalid AI response format', 500, 'AI_RESPONSE_PARSE_ERROR');
    }
  }

  /**
   * Parse gap analysis response
   */
  private parseGapAnalysisResponse(response: string): AIGapAnalysis {
    try {
      const parsed = JSON.parse(response);

      // Validate required fields
      if (typeof parsed.overallMatch !== 'number' || !parsed.skillGaps || !Array.isArray(parsed.skillGaps)) {
        throw new Error('Invalid gap analysis structure in response');
      }

      return parsed as AIGapAnalysis;
    } catch (error) {
      logger.error('Failed to parse gap analysis response:', error);
      throw new AppError('Invalid AI response format', 500, 'AI_RESPONSE_PARSE_ERROR');
    }
  }

  /**
   * Check rate limiting
   */
  private async checkRateLimit(operation: string): Promise<void> {
    const now = Date.now();
    const lastCall = this.rateLimitTracker.get(operation) || 0;
    const timeSinceLastCall = now - lastCall;
    const minInterval = 1000; // 1 second between calls

    if (timeSinceLastCall < minInterval) {
      const waitTime = minInterval - timeSinceLastCall;
      await this.delay(waitTime);
    }
  }

  /**
   * Update rate limit tracking
   */
  private updateRateLimit(operation: string): void {
    this.rateLimitTracker.set(operation, Date.now());
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Health check for AI service
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: string }> {
    try {
      const testPrompt = 'Respond with valid JSON: {"status": "ok", "message": "AI service is working"}';
      const response = await this.callDeepSeekAPI(testPrompt, 'health-check');
      const parsed = JSON.parse(response);

      if (parsed.status === 'ok') {
        return { status: 'healthy', details: 'AI service is responding correctly' };
      } else {
        return { status: 'unhealthy', details: 'AI service returned unexpected response' };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: `AI service error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}