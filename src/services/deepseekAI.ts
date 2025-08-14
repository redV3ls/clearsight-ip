import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { NarrativeJobAnalysisService } from './narrativeJobAnalysis';

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

export interface NarrativeAnalysis {
  narrative: string;
  analysisType: 'standalone' | 'job-comparison';
  wordCount: number;
  generatedAt: string;
}

export interface NarrativeMetadata {
  wordCount: number;
  characterCount: number;
  estimatedReadingTime: number; // in minutes
  analysisType: 'standalone' | 'job-comparison';
  generatedAt: string;
  processingTime?: number; // in milliseconds
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

/**
 * Utility functions for narrative analysis
 */
export class NarrativeUtils {
  /**
   * Calculate word count from text
   */
  static calculateWordCount(text: string): number {
    if (!text || typeof text !== 'string') return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Calculate character count (excluding whitespace)
   */
  static calculateCharacterCount(text: string): number {
    if (!text || typeof text !== 'string') return 0;
    return text.replace(/\s/g, '').length;
  }

  /**
   * Estimate reading time in minutes (average 200 words per minute)
   */
  static estimateReadingTime(wordCount: number): number {
    const wordsPerMinute = 200;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }

  /**
   * Generate comprehensive metadata for narrative analysis
   */
  static generateMetadata(
    narrative: string, 
    analysisType: 'standalone' | 'job-comparison',
    processingTime?: number
  ): NarrativeMetadata {
    const wordCount = this.calculateWordCount(narrative);
    const characterCount = this.calculateCharacterCount(narrative);
    const estimatedReadingTime = this.estimateReadingTime(wordCount);

    return {
      wordCount,
      characterCount,
      estimatedReadingTime,
      analysisType,
      generatedAt: new Date().toISOString(),
      processingTime
    };
  }

  /**
   * Validate narrative content
   */
  static validateNarrative(narrative: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!narrative || typeof narrative !== 'string') {
      errors.push('Narrative must be a non-empty string');
    } else {
      if (narrative.trim().length < 50) {
        errors.push('Narrative is too short (minimum 50 characters)');
      }
      if (narrative.trim().length > 10000) {
        errors.push('Narrative is too long (maximum 10,000 characters)');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Clean and format narrative text
   */
  static cleanNarrative(narrative: string): string {
    if (!narrative || typeof narrative !== 'string') return '';
    
    return narrative
      .trim()
      .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
      .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
      .replace(/^\s*[\r\n]/gm, '') // Remove empty lines
      .trim();
  }
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
   * Process CV text and return narrative analysis directly
   */
  async extractNarrativeFromCV(cvText: string, jobDescription?: string): Promise<NarrativeAnalysis> {
    try {
      const startTime = Date.now();
      const prompt = this.createNarrativeAnalysisPrompt(cvText, jobDescription);
      const response = await this.callDeepSeekAPI(prompt, 'narrative-analysis');
      const processingTime = Date.now() - startTime;
      
      return this.processNarrativeResponse(response, jobDescription ? 'job-comparison' : 'standalone', processingTime);
    } catch (error) {
      logger.error('AI narrative analysis failed:', error);
      throw new AppError('AI narrative analysis failed', 500, 'AI_NARRATIVE_ANALYSIS_FAILED');
    }
  }

  /**
   * Process CV text and return comprehensive narrative analysis with metadata
   */
  async extractNarrativeWithMetadata(cvText: string, jobDescription?: string): Promise<{ analysis: NarrativeAnalysis; metadata: NarrativeMetadata }> {
    try {
      const startTime = Date.now();
      const prompt = this.createNarrativeAnalysisPrompt(cvText, jobDescription);
      const response = await this.callDeepSeekAPI(prompt, 'narrative-analysis');
      const processingTime = Date.now() - startTime;
      
      const analysisType = jobDescription ? 'job-comparison' : 'standalone';
      const cleanedNarrative = NarrativeUtils.cleanNarrative(response);
      
      // Generate comprehensive metadata
      const metadata = NarrativeUtils.generateMetadata(cleanedNarrative, analysisType, processingTime);
      
      // Create analysis object
      const analysis: NarrativeAnalysis = {
        narrative: cleanedNarrative,
        analysisType,
        wordCount: metadata.wordCount,
        generatedAt: metadata.generatedAt
      };
      
      return { analysis, metadata };
    } catch (error) {
      logger.error('AI narrative analysis with metadata failed:', error);
      throw new AppError('AI narrative analysis failed', 500, 'AI_NARRATIVE_ANALYSIS_FAILED');
    }
  }

  /**
   * Process narrative response directly without parsing
   */
  private processNarrativeResponse(response: string, analysisType: 'standalone' | 'job-comparison', processingTime?: number): NarrativeAnalysis {
    // Clean up the response text using utility function
    const cleanedNarrative = NarrativeUtils.cleanNarrative(response);
    
    // Validate the narrative
    const validation = NarrativeUtils.validateNarrative(cleanedNarrative);
    if (!validation.isValid) {
      logger.warn('Narrative validation failed:', validation.errors);
      // Continue processing but log the issues
    }
    
    // Calculate word count using utility function
    const wordCount = NarrativeUtils.calculateWordCount(cleanedNarrative);
    
    return {
      narrative: cleanedNarrative,
      analysisType,
      wordCount,
      generatedAt: new Date().toISOString()
    };
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
      const matches = Array.from(cvText.matchAll(new RegExp(regex.source, 'gi')));
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
          existing.certifications = Array.from(new Set([...existing.certifications, ...skill.certifications]));
          existing.relatedSkills = Array.from(new Set([...existing.relatedSkills, ...skill.relatedSkills]));
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

        // Create AbortController for better timeout handling in Cloudflare Workers
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), dynamicTimeout);

        const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
            'User-Agent': 'ClearSight-AI/1.0', // Add user agent for better API compatibility
          },
          body: JSON.stringify({
            model: this.config.model,
            messages: [
              {
                role: 'system',
                content: 'You are an expert career coach providing CV analysis and improvement guidance. Format your response using markdown for better readability. Focus on actionable CV improvements and career development advice.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: Math.min(this.config.maxTokens, 1500), // Increased for complete responses
            temperature: Math.min(this.config.temperature, 0.1), // Lower temperature for faster, more focused responses
            stream: false // Ensure non-streaming response for Cloudflare Workers
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId); // Clear timeout if request completes

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
          error.name === 'AbortError' ||
          error.message.includes('timeout') ||
          error.message.includes('aborted') ||
          error.message.includes('The operation was aborted')
        );

        const isNetworkError = error instanceof Error && (
          error.message.includes('fetch') ||
          error.message.includes('network') ||
          error.message.includes('ECONNRESET') ||
          error.message.includes('ETIMEDOUT')
        );

        logger.warn(`DeepSeek API attempt ${attempt} failed:`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          errorName: error instanceof Error ? error.name : 'Unknown',
          isTimeout,
          isNetworkError,
          operation,
          promptLength: prompt.length,
          attempt,
          dynamicTimeout
        });

        // For timeout or network errors, increase delay more aggressively
        if (attempt < this.MAX_RETRIES) {
          const baseDelay = this.RETRY_DELAY * attempt;
          const delay = (isTimeout || isNetworkError) ? baseDelay * 3 : baseDelay;
          logger.info(`Retrying in ${delay}ms...`, { attempt, delay, operation });
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
    const baseTimeout = 45000; // 45 seconds base (optimized for Cloudflare Workers)
    const lengthMultiplier = Math.min(prompt.length / 1000, 2); // Max 2x multiplier (reduced for CF limits)

    const operationMultipliers = {
      'skills-extraction': 1.0,
      'job-analysis': 0.8,
      'gap-analysis': 1.5,
      'narrative-analysis': 1.1, // Reduced multiplier for CF Workers
      'health-check': 0.3
    };

    const operationMultiplier = operationMultipliers[operation as keyof typeof operationMultipliers] || 1.0;

    const calculatedTimeout = baseTimeout * lengthMultiplier * operationMultiplier;
    const maxTimeout = 90000; // 90 seconds max (Cloudflare Workers limit is 100s)

    return Math.min(calculatedTimeout, maxTimeout);
  }

  /**
   * Create optimized narrative-focused analysis prompt
   */
  private createNarrativeAnalysisPrompt(cvText: string, jobDescription?: string): string {
    if (jobDescription) {
      // Use enhanced job analysis for job comparison
      const jobInsights = NarrativeJobAnalysisService.extractJobInsights(jobDescription);
      return NarrativeJobAnalysisService.createEnhancedJobComparisonPrompt(cvText, jobDescription, jobInsights);
    }

    // Improved standalone analysis prompt with CV improvement focus
    const basePrompt = `You are a professional career coach analyzing this CV to provide actionable improvement guidance.

## Your Career Analysis

Based on your CV, provide a comprehensive analysis with specific recommendations for improvement.

### Career Strengths
Highlight 3-4 key strengths from their CV with specific examples.

### CV Improvement Areas
Identify 4-5 specific ways to improve their CV:
- Missing sections or information
- Better ways to present achievements (use numbers/metrics)
- Skills that should be highlighted more prominently
- Format and structure improvements

### Skills Gap Analysis
Based on current market demands:
- Skills they have that are in high demand
- Critical skills they're missing for their career level
- Emerging skills they should consider learning

### Actionable Steps
1. **Immediate CV improvements** (can do today)
2. **Short-term skill development** (1-3 months)
3. **Long-term career positioning** (6-12 months)

### Career Positioning Advice
How to better position themselves in the job market based on their experience.

Provide specific, actionable advice. Reference actual content from their CV. Focus on practical improvements they can implement immediately.

RESUME:
${cvText}

Write 400-500 words of detailed, practical guidance focused on CV improvement and career development.`;

    return basePrompt;
  }

  /**
   * Create skills extraction prompt (optimized for narrative output)
   */
  private createSkillsExtractionPrompt(cvText: string): string {
    return `You are an experienced career coach providing personalized resume feedback. Write a compelling narrative analysis of this professional's background.

**Professional Story**
Tell the story of their career journey, highlighting key experiences and growth.

**Core Strengths** 
Identify their unique skills and what makes them valuable in their field.

**Career Positioning**
Assess their current level and market competitiveness.

**Development Areas**
Suggest specific areas for growth with actionable guidance.

**Next Steps**
Provide 2-3 concrete recommendations for career advancement.

Write in a warm, encouraging tone as if speaking directly to the candidate. Focus on storytelling and career guidance rather than technical lists. Aim for 350-450 words of genuine insight.

RESUME:
${cvText}

Create a cohesive narrative that flows naturally and provides real value to the professional.`;
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
   * Parse skills analysis response (simplified for backward compatibility)
   */
  private parseSkillsAnalysisResponse(response: string): AISkillsAnalysis {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(response);
      if (parsed.skills && Array.isArray(parsed.skills)) {
        return parsed as AISkillsAnalysis;
      }
    } catch (jsonError) {
      // If JSON parsing fails, return a basic structure
      logger.info('JSON parsing failed, returning basic structure');
    }

    // Return a basic structure for backward compatibility
    return {
      skills: [],
      categories: [],
      overallExperience: response.substring(0, 500), // Use first part of response
      education: [],
      certifications: [],
      strengths: [],
      areasForImprovement: [],
      careerLevel: 'mid',
      reasoning: 'Simplified parsing for narrative response'
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