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
   * Perform standalone CV analysis without job comparison
   */
  async performStandaloneCVAnalysis(skillsAnalysis: AISkillsAnalysis): Promise<any> {
    const prompt = this.createStandaloneCVAnalysisPrompt(skillsAnalysis);

    try {
      const response = await this.callDeepSeekAPI(prompt, 'standalone-cv-analysis');
      return this.parseStandaloneCVAnalysisResponse(response);
    } catch (error) {
      logger.error('AI standalone CV analysis failed:', error);
      throw new AppError('AI standalone CV analysis failed', 500, 'AI_STANDALONE_CV_ANALYSIS_FAILED');
    }
  }

  /**
   * Create standalone CV analysis prompt
   */
  private createStandaloneCVAnalysisPrompt(skillsAnalysis: AISkillsAnalysis): string {
    return `
You are a senior career coach providing a comprehensive review of a professional's resume. Your goal is to help them understand their current market position and provide actionable guidance for career advancement.

Current Profile:
${JSON.stringify(skillsAnalysis, null, 2)}

Provide a narrative-driven analysis that tells their career story and guides their next steps:

CAREER STORY ANALYSIS (3-4 paragraphs):
1. Current Position: Where they stand in their career journey
2. Strengths Assessment: What makes them valuable in the market
3. Growth Opportunities: Areas where they can improve their competitiveness
4. Future Potential: Where their career could go with the right moves

STRUCTURED RECOMMENDATIONS:
{
  "careerNarrative": "Your 3-4 paragraph career story analysis",
  "currentMarketPosition": {
    "level": "entry|mid|senior|executive",
    "competitiveness": "low|moderate|high|exceptional", 
    "marketValue": "assessment of their current market value",
    "uniqueSellingPoints": ["what makes them stand out"]
  },
  "strengthsAnalysis": [
    {
      "strength": "specific strength",
      "marketRelevance": "why this matters in today's market",
      "howToLeverage": "how to better showcase this strength",
      "potentialImpact": "what this could lead to"
    }
  ],
  "improvementAreas": [
    {
      "area": "specific area needing improvement",
      "currentImpact": "how this weakness currently affects them",
      "improvementStrategy": "specific steps to address this",
      "timeline": "realistic timeframe for improvement",
      "resources": ["specific learning resources"],
      "successMetrics": "how to measure progress"
    }
  ],
  "careerPathOptions": [
    {
      "path": "potential career direction",
      "description": "what this path involves",
      "fitScore": 0,
      "requiredDevelopment": ["skills/experience needed"],
      "timeline": "time to transition",
      "marketOutlook": "demand and growth prospects",
      "personalizedRoadmap": "step-by-step guidance for THIS person"
    }
  ],
  "skillDevelopmentPlan": {
    "immediate": [
      {
        "skill": "skill to develop",
        "rationale": "why this skill matters now",
        "learningApproach": "best way to learn this",
        "timeframe": "how long it should take",
        "resources": ["specific resources"],
        "applicationStrategy": "how to apply/showcase this skill"
      }
    ],
    "shortTerm": [...],
    "longTerm": [...]
  },
  "marketInsights": [
    {
      "trend": "relevant market trend",
      "personalRelevance": "how this affects their career",
      "actionableResponse": "what they should do about it"
    }
  ],
  "resumeOptimization": [
    {
      "section": "resume section to improve",
      "currentIssue": "what's wrong with it now",
      "improvement": "specific improvement suggestion",
      "impact": "how this will help their applications"
    }
  ],
  "networkingStrategy": {
    "currentNetworkAssessment": "assessment of their likely network strength",
    "targetConnections": ["types of people they should connect with"],
    "networkingApproach": "personalized networking strategy",
    "platforms": ["where they should be active"],
    "contentStrategy": "what they should share/discuss"
  },
  "motivationalMessage": "Encouraging, personalized message about their potential",
  "nextSteps": [
    {
      "action": "specific next step",
      "priority": "high|medium|low",
      "timeframe": "when to do this",
      "expectedOutcome": "what this will achieve"
    }
  ]
}

Make this feel like a comprehensive career consultation with a mentor who sees their potential and wants to help them succeed.
`;
  }

  /**
   * Parse standalone CV analysis response
   */
  private parseStandaloneCVAnalysisResponse(response: string): any {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // If no JSON found, create a structured response from the narrative
      return {
        careerNarrative: response,
        currentMarketPosition: {
          level: "mid",
          competitiveness: "moderate",
          marketValue: "Extracted from narrative analysis",
          uniqueSellingPoints: ["Analysis provided in narrative format"]
        },
        motivationalMessage: "Continue developing your skills and exploring new opportunities.",
        nextSteps: [
          {
            action: "Review the detailed analysis provided",
            priority: "high",
            timeframe: "immediately",
            expectedOutcome: "Better understanding of career position"
          }
        ]
      };
    } catch (error) {
      logger.error('Failed to parse standalone CV analysis response:', error);
      throw new AppError('Failed to parse CV analysis response', 500, 'PARSE_ERROR');
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
                content: 'You are an expert career-analysis model. Provide structured, accurate analysis based on the user\'s request. Be concise and factual. If a value is unknown, indicate it clearly. Do not invent information.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: this.config.maxTokens,
            temperature: this.config.temperature
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

        // Log the response for debugging
        logger.info(`DeepSeek response received`, {
          operation,
          contentLength: content?.length || 0,
          contentPreview: content?.substring(0, 200) || 'No content'
        });

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
You are a senior career coach analyzing a professional's resume. Your goal is to provide insightful, narrative feedback that tells their career story while extracting structured data.

Analyze this resume and provide both structured data AND narrative insights. Think of yourself as telling the story of this person's professional journey.

NARRATIVE ANALYSIS:
Write a compelling 2-3 paragraph narrative that:
1. Describes their professional journey and career progression
2. Highlights their unique strengths and what makes them stand out
3. Identifies areas where they could strengthen their profile
4. Provides encouraging but honest assessment of their current position

STRUCTURED DATA:
Then provide the technical extraction in this format:

SKILLS:
For each skill, provide: Name | Category | Level | Years | Confidence | Context | Story
Categories: Programming, Cloud, Data, Management, Design, DevOps, Security, Other
Levels: beginner, intermediate, advanced, expert
Confidence: 0.0 to 1.0
Story: Brief narrative about how this skill fits into their career journey

CATEGORIES:
List all skill categories found

EXPERIENCE:
Overall experience summary with narrative elements

EDUCATION:
List educational qualifications with context about how they support their career

CERTIFICATIONS:
List professional certifications with relevance to their career path

STRENGTHS:
Key strengths with explanations of why they matter

AREAS FOR IMPROVEMENT:
Areas for development with specific, actionable guidance

CAREER LEVEL:
entry, mid, senior, or executive with reasoning

Resume to analyze:
"""
${cvText}
"""

Provide both the narrative story and structured analysis. Make it personal, encouraging, and actionable.
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
You are a senior career coach conducting a personalized gap analysis. Your role is to provide honest, encouraging, and actionable feedback that tells the story of where this candidate stands and how they can bridge the gap to their target role.

NARRATIVE REQUIREMENTS:
1. Write a compelling narrative that explains the candidate's fit for this role
2. Be honest about weaknesses but frame them as growth opportunities
3. Highlight transferable skills and hidden strengths
4. Provide a clear roadmap for improvement
5. Make it personal and motivating

Candidate Profile:
${JSON.stringify(skillsAnalysis, null, 2)}

Target Role:
${JSON.stringify(jobAnalysis, null, 2)}

Provide your analysis in this enhanced format:

EXECUTIVE SUMMARY (2-3 paragraphs):
Write a narrative that:
- Assesses overall fit and potential
- Explains the candidate's unique value proposition
- Identifies the main challenges and opportunities
- Provides an encouraging but realistic outlook

DETAILED ANALYSIS:
Then provide structured data with narrative elements:

{
  "narrativeSummary": "Your executive summary here",
  "overallMatch": 0,
  "matchStory": "Narrative explanation of the match percentage",
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
      "personalizedStory": "Why this gap matters for THIS candidate specifically",
      "recommendations": ["specific, actionable steps"],
      "resources": ["tailored learning resources"],
      "motivationalNote": "Encouraging message about overcoming this gap"
    }
  ],
  "strengths": [
    { 
      "name": "string", 
      "category": "string", 
      "level": "LevelEnum", 
      "yearsExperience": 0, 
      "confidence": 0.0,
      "whyItMatters": "Why this strength is valuable for the target role",
      "howToLeverage": "How to highlight this in applications/interviews"
    }
  ],
  "transferableSkills": [
    { 
      "from": "string", 
      "to": "string", 
      "reasoning": "string",
      "storyConnection": "How this transfer makes sense in their career narrative"
    }
  ],
  "careerPaths": [
    { 
      "title": "string", 
      "description": "string", 
      "matchScore": 0, 
      "requiredSkills": ["string"], 
      "timeToTransition": 0, 
      "salaryRange": {"min": 0, "max": 0, "currency": "USD"},
      "personalizedRoadmap": "Step-by-step path for THIS candidate"
    }
  ],
  "learningPlan": {
    "immediate": [
      {
        "skill": "skill name",
        "action": "specific action to take",
        "timeframe": "timeframe", 
        "resources": ["specific resources"],
        "whyNow": "Why this should be prioritized immediately"
      }
    ],
    "shortTerm": [...],
    "longTerm": [...]
  },
  "marketInsights": ["current market trends with personal relevance"],
  "competitiveAdvantage": ["unique strengths that set candidate apart"],
  "weaknessesToAddress": [
    {
      "weakness": "specific weakness",
      "impact": "how it affects their candidacy", 
      "solution": "concrete steps to address it",
      "timeline": "realistic timeframe for improvement"
    }
  ],
  "encouragingMessage": "Personalized, motivating closing message",
  "reasoning": "overall reasoning for the gap analysis with narrative elements"
}

Make this analysis feel like a conversation with a trusted mentor who believes in their potential.
`;
  }

  /**
   * Parse skills analysis response (handles both JSON and natural language)
   */
  private parseSkillsAnalysisResponse(response: string): AISkillsAnalysis {
    try {
      // First try to parse as JSON
      const parsed = JSON.parse(response);
      if (parsed.skills && Array.isArray(parsed.skills)) {
        return parsed as AISkillsAnalysis;
      }
    } catch (jsonError) {
      // If JSON parsing fails, parse as natural language
      logger.info('JSON parsing failed, attempting natural language parsing');
    }

    // Parse natural language response
    return this.parseNaturalLanguageSkillsResponse(response);
  }

  /**
   * Parse natural language skills analysis response
   */
  private parseNaturalLanguageSkillsResponse(response: string): AISkillsAnalysis {
    const skills: any[] = [];
    const categories = new Set<string>();
    let overallExperience = '';
    const education: string[] = [];
    const certifications: string[] = [];
    const strengths: string[] = [];
    const areasForImprovement: string[] = [];
    let careerLevel = 'mid';

    // Extract skills section
    const skillsMatch = response.match(/SKILLS:(.*?)(?=\n[A-Z]+:|$)/s);
    if (skillsMatch) {
      const skillsText = skillsMatch[1];
      const skillLines = skillsText.split('\n').filter(line => line.trim() && !line.includes('Name |'));

      skillLines.forEach(line => {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 4) {
          const skill = {
            name: parts[0] || 'Unknown Skill',
            category: parts[1] || 'Other',
            level: parts[2] || 'intermediate',
            yearsExperience: parseInt(parts[3]) || 0,
            confidence: parseFloat(parts[4]) || 0.7,
            context: parts[5] || null,
            certifications: [],
            relatedSkills: [],
            reasoning: `Extracted from resume analysis`
          };
          skills.push(skill);
          categories.add(skill.category);
        }
      });
    }

    // Extract other sections
    const experienceMatch = response.match(/EXPERIENCE:(.*?)(?=\n[A-Z]+:|$)/s);
    if (experienceMatch) {
      overallExperience = experienceMatch[1].trim();
    }

    const educationMatch = response.match(/EDUCATION:(.*?)(?=\n[A-Z]+:|$)/s);
    if (educationMatch) {
      education.push(...educationMatch[1].split('\n').filter(line => line.trim()).map(line => line.trim()));
    }

    const certificationsMatch = response.match(/CERTIFICATIONS:(.*?)(?=\n[A-Z]+:|$)/s);
    if (certificationsMatch) {
      certifications.push(...certificationsMatch[1].split('\n').filter(line => line.trim()).map(line => line.trim()));
    }

    const strengthsMatch = response.match(/STRENGTHS:(.*?)(?=\n[A-Z]+:|$)/s);
    if (strengthsMatch) {
      strengths.push(...strengthsMatch[1].split('\n').filter(line => line.trim()).map(line => line.trim()));
    }

    const areasMatch = response.match(/AREAS FOR IMPROVEMENT:(.*?)(?=\n[A-Z]+:|$)/s);
    if (areasMatch) {
      areasForImprovement.push(...areasMatch[1].split('\n').filter(line => line.trim()).map(line => line.trim()));
    }

    const careerMatch = response.match(/CAREER LEVEL:(.*?)(?=\n[A-Z]+:|$)/s);
    if (careerMatch) {
      const level = careerMatch[1].trim().toLowerCase();
      if (['entry', 'mid', 'senior', 'executive'].includes(level)) {
        careerLevel = level;
      }
    }

    // If no skills were extracted, create some basic ones from the response
    if (skills.length === 0) {
      const commonSkills = ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'AWS', 'Git'];
      commonSkills.forEach(skillName => {
        if (response.toLowerCase().includes(skillName.toLowerCase())) {
          skills.push({
            name: skillName,
            category: 'Programming',
            level: 'intermediate',
            yearsExperience: 2,
            confidence: 0.6,
            context: 'Mentioned in resume',
            certifications: [],
            relatedSkills: [],
            reasoning: 'Inferred from resume content'
          });
          categories.add('Programming');
        }
      });
    }

    return {
      skills,
      categories: Array.from(categories),
      overallExperience,
      education,
      certifications,
      strengths,
      areasForImprovement,
      careerLevel: careerLevel as any,
      reasoning: 'Parsed from natural language response'
    };
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
   * Health check for the AI service
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; message?: string }> {
    try {
      // Simple test call to verify API connectivity
      const testPrompt = "Test connection. Respond with 'OK'.";
      const response = await this.callDeepSeekAPI(testPrompt, 'health-check');

      if (response && response.length > 0) {
        return { status: 'healthy' };
      } else {
        return { status: 'unhealthy', message: 'Empty response from API' };
      }
    } catch (error) {
      logger.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}