import { DeepSeekAIService, AISkillsAnalysis, AIJobAnalysis, AIGapAnalysis } from './deepseekAI';
import { createAIConfig, validateAIConfig } from '../config/ai';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

// Legacy interfaces for backward compatibility
import { UserSkill } from './skillMatching';
import { JobSkillRequirement } from './jobAnalysis';

export interface EnhancedAnalysisResult {
  analysis_id: string;
  user_id: string;
  timestamp: string;
  aiPowered: boolean;
  skillsAnalysis: {
    skills: Array<{
      name: string;
      category: string;
      level: string;
      confidence: number;
      yearsExperience: number;
      certifications: string[];
      context?: string;
      reasoning?: string;
    }>;
    totalSkills: number;
    categories: string[];
    experience: string;
    education: string[];
    certifications: string[];
    strengths: string[];
    areasForImprovement: string[];
    careerLevel: string;
  };
  skillsGap?: {
    overallMatch: number;
    missingSkills: Array<{
      name: string;
      category: string;
      currentLevel?: string;
      requiredLevel: string;
      priority: number;
      learningTime: number;
      difficulty: string;
      description: string;
      resources: string[];
      reasoning?: string;
    }>;
    strengths: Array<{
      name: string;
      level: string;
      yearsExperience: number;
      category: string;
      reasoning?: string;
    }>;
    transferableSkills?: Array<{
      from: string;
      to: string;
      reasoning: string;
    }>;
  };
  careerSuggestions?: {
    suggestions: Array<{
      title: string;
      description: string;
      matchScore: number;
      requiredSkills: string[];
      timeToTransition: number;
      salaryRange?: { min: number; max: number; currency: string };
      reasoning?: string;
    }>;
  };
  industryTrends?: {
    trends: Array<{
      skill: string;
      trend: string;
      demandGrowth: string;
      salaryImpact: string;
      description: string;
    }>;
  };
  learningPlan?: {
    immediate: Array<{
      skill: string;
      action: string;
      timeframe: string;
      resources: string[];
    }>;
    shortTerm: Array<{
      skill: string;
      action: string;
      timeframe: string;
      resources: string[];
    }>;
    longTerm: Array<{
      skill: string;
      action: string;
      timeframe: string;
      resources: string[];
    }>;
  };
  marketInsights?: string[];
  competitiveAdvantage?: string[];
  metadata: {
    processingTime: number;
    analysisOptions: {
      includeSkillsGap: boolean;
      includeCareerSuggestions: boolean;
      includeIndustryTrends: boolean;
    };
    aiProvider?: string;
    aiModel?: string;
    fallbackUsed?: boolean;
  };
}

export class AIAnalysisService {
  private deepseekAI: DeepSeekAIService | null = null;
  private isAIEnabled: boolean = false;

  constructor(private env: any) {
    this.initializeAI();
  }

  /**
   * Initialize AI service if configuration is available
   */
  private initializeAI(): void {
    try {
      const aiConfig = createAIConfig(this.env);
      const validation = validateAIConfig(aiConfig);

      if (validation.isValid) {
        this.deepseekAI = new DeepSeekAIService(aiConfig);
        this.isAIEnabled = true;
        logger.info('AI service initialized successfully');
      } else {
        logger.warn('AI service not available:', validation.errors);
        this.isAIEnabled = false;
      }
    } catch (error) {
      logger.error('Failed to initialize AI service:', error);
      this.isAIEnabled = false;
    }
  }

  /**
   * Perform comprehensive AI-powered CV analysis
   */
  async analyzeCV(
    cvContent: string,
    jobContent?: string,
    options: {
      includeSkillsGap: boolean;
      includeCareerSuggestions: boolean;
      includeIndustryTrends: boolean;
    } = {
      includeSkillsGap: true,
      includeCareerSuggestions: true,
      includeIndustryTrends: true,
    }
  ): Promise<EnhancedAnalysisResult> {
    const startTime = Date.now();
    const analysisId = crypto.randomUUID();

    try {
      // Try AI-powered analysis first
      if (this.isAIEnabled && this.deepseekAI) {
        return await this.performAIAnalysis(
          analysisId,
          cvContent,
          jobContent,
          options,
          startTime
        );
      } else {
        // Fallback to rule-based analysis
        return await this.performFallbackAnalysis(
          analysisId,
          cvContent,
          jobContent,
          options,
          startTime
        );
      }
    } catch (error) {
      logger.error('AI analysis failed, falling back to rule-based:', error);
      
      // Fallback to rule-based analysis on AI failure
      return await this.performFallbackAnalysis(
        analysisId,
        cvContent,
        jobContent,
        options,
        startTime
      );
    }
  }

  /**
   * Perform AI-powered analysis using DeepSeek
   */
  private async performAIAnalysis(
    analysisId: string,
    cvContent: string,
    jobContent: string | undefined,
    options: any,
    startTime: number
  ): Promise<EnhancedAnalysisResult> {
    if (!this.deepseekAI) {
      throw new Error('AI service not initialized');
    }

    // Step 1: AI-powered skills extraction
    logger.info('Starting AI-powered skills extraction');
    const skillsAnalysis = await this.deepseekAI.extractSkillsFromCV(cvContent);

    // Step 2: Job analysis if job description provided
    let jobAnalysis: AIJobAnalysis | undefined;
    if (jobContent && options.includeSkillsGap) {
      logger.info('Starting AI-powered job analysis');
      jobAnalysis = await this.deepseekAI.analyzeJobDescription(jobContent);
    }

    // Step 3: Gap analysis if both CV and job are analyzed
    let gapAnalysis: AIGapAnalysis | undefined;
    if (skillsAnalysis && jobAnalysis && options.includeSkillsGap) {
      logger.info('Starting AI-powered gap analysis');
      gapAnalysis = await this.deepseekAI.performGapAnalysis(skillsAnalysis, jobAnalysis);
    }

    // Build enhanced result
    const result: EnhancedAnalysisResult = {
      analysis_id: analysisId,
      user_id: 'current-user', // Will be set by calling code
      timestamp: new Date().toISOString(),
      aiPowered: true,
      skillsAnalysis: {
        skills: skillsAnalysis.skills.map(skill => ({
          name: skill.name,
          category: skill.category,
          level: skill.level,
          confidence: skill.confidence,
          yearsExperience: skill.yearsExperience,
          certifications: skill.certifications,
          context: skill.context,
          reasoning: skill.reasoning,
        })),
        totalSkills: skillsAnalysis.skills.length,
        categories: skillsAnalysis.categories,
        experience: skillsAnalysis.overallExperience,
        education: skillsAnalysis.education,
        certifications: skillsAnalysis.certifications,
        strengths: skillsAnalysis.strengths,
        areasForImprovement: skillsAnalysis.areasForImprovement,
        careerLevel: skillsAnalysis.careerLevel,
      },
      metadata: {
        processingTime: Date.now() - startTime,
        analysisOptions: options,
        aiProvider: 'deepseek',
        aiModel: 'deepseek-reasoner',
        fallbackUsed: false,
      },
    };

    // Add gap analysis if available
    if (gapAnalysis) {
      result.skillsGap = {
        overallMatch: gapAnalysis.overallMatch,
        missingSkills: gapAnalysis.skillGaps.map(gap => ({
          name: gap.skillName,
          category: gap.category,
          currentLevel: gap.currentLevel,
          requiredLevel: gap.requiredLevel,
          priority: gap.priority,
          learningTime: gap.timeToCompetency,
          difficulty: gap.learningDifficulty,
          description: `Skill gap in ${gap.skillName}`,
          resources: gap.resources,
          reasoning: gap.reasoning,
        })),
        strengths: gapAnalysis.strengths.map(strength => ({
          name: strength.name,
          level: strength.level,
          yearsExperience: strength.yearsExperience,
          category: strength.category,
          reasoning: strength.reasoning,
        })),
        transferableSkills: gapAnalysis.transferableSkills,
      };

      // Add career suggestions
      if (options.includeCareerSuggestions) {
        result.careerSuggestions = {
          suggestions: gapAnalysis.careerPaths.map(path => ({
            title: path.title,
            description: path.description,
            matchScore: path.matchScore,
            requiredSkills: path.requiredSkills,
            timeToTransition: path.timeToTransition,
            salaryRange: path.salaryRange,
            reasoning: path.reasoning,
          })),
        };
      }

      // Add learning plan
      result.learningPlan = gapAnalysis.learningPlan;
      result.marketInsights = gapAnalysis.marketInsights;
      result.competitiveAdvantage = gapAnalysis.competitiveAdvantage;
    }

    // Add industry trends (simulated for now)
    if (options.includeIndustryTrends) {
      result.industryTrends = {
        trends: skillsAnalysis.skills.slice(0, 5).map(skill => ({
          skill: skill.name,
          trend: 'Growing',
          demandGrowth: '+15%',
          salaryImpact: 'Positive',
          description: `${skill.name} is in high demand in the current market`,
        })),
      };
    }

    logger.info('AI-powered analysis completed successfully', {
      analysisId,
      skillsFound: skillsAnalysis.skills.length,
      processingTime: Date.now() - startTime,
    });

    return result;
  }

  /**
   * Fallback to rule-based analysis
   */
  private async performFallbackAnalysis(
    analysisId: string,
    cvContent: string,
    jobContent: string | undefined,
    options: any,
    startTime: number
  ): Promise<EnhancedAnalysisResult> {
    // Perform basic rule-based analysis
    const resumeAnalysis = await this.performBasicAnalysis(cvContent);

    const result: EnhancedAnalysisResult = {
      analysis_id: analysisId,
      user_id: 'current-user',
      timestamp: new Date().toISOString(),
      aiPowered: false,
      skillsAnalysis: {
        skills: resumeAnalysis.skills.map(skill => ({
          name: skill.name,
          category: skill.category,
          level: skill.level,
          confidence: skill.confidence,
          yearsExperience: skill.yearsExperience,
          certifications: skill.certifications,
        })),
        totalSkills: resumeAnalysis.skills.length,
        categories: resumeAnalysis.categories,
        experience: resumeAnalysis.experience,
        education: resumeAnalysis.education,
        certifications: resumeAnalysis.certifications,
        strengths: ['Rule-based analysis completed'],
        areasForImprovement: ['Consider upgrading to AI-powered analysis'],
        careerLevel: 'mid', // Default assumption
      },
      metadata: {
        processingTime: Date.now() - startTime,
        analysisOptions: options,
        fallbackUsed: true,
      },
    };

    logger.info('Fallback analysis completed', {
      analysisId,
      skillsFound: resumeAnalysis.skills.length,
    });

    return result;
  }

  /**
   * Check if AI service is available and healthy
   */
  async isAIHealthy(): Promise<boolean> {
    if (!this.isAIEnabled || !this.deepseekAI) {
      return false;
    }

    try {
      const healthCheck = await this.deepseekAI.healthCheck();
      return healthCheck.status === 'healthy';
    } catch (error) {
      logger.error('AI health check failed:', error);
      return false;
    }
  }

  /**
   * Get AI service status
   */
  getAIStatus(): {
    enabled: boolean;
    healthy: boolean;
    provider?: string;
    model?: string;
  } {
    return {
      enabled: this.isAIEnabled,
      healthy: this.isAIEnabled, // Will be updated by health checks
      provider: this.isAIEnabled ? 'deepseek' : undefined,
      model: this.isAIEnabled ? 'deepseek-reasoner' : undefined,
    };
  }

  /**
   * Perform basic rule-based analysis as fallback
   */
  private async performBasicAnalysis(content: string): Promise<{
    skills: Array<{
      name: string;
      category: string;
      level: string;
      confidence: number;
      yearsExperience: number;
      certifications: string[];
    }>;
    categories: string[];
    experience: string;
    education: string[];
    certifications: string[];
  }> {
    // Basic skill extraction using keywords
    const skillKeywords = {
      'Programming': ['javascript', 'python', 'java', 'react', 'node.js', 'typescript', 'html', 'css', 'sql'],
      'Cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform'],
      'Data': ['machine learning', 'data analysis', 'pandas', 'numpy', 'tensorflow', 'pytorch'],
      'Management': ['project management', 'team leadership', 'agile', 'scrum', 'product management'],
      'Design': ['ui/ux', 'figma', 'photoshop', 'design thinking', 'user research']
    };
    
    const contentLower = content.toLowerCase();
    const extractedSkills: Array<{
      name: string;
      category: string;
      level: string;
      confidence: number;
      yearsExperience: number;
      certifications: string[];
    }> = [];
    
    // Extract skills based on keywords
    for (const [category, keywords] of Object.entries(skillKeywords)) {
      for (const keyword of keywords) {
        if (contentLower.includes(keyword)) {
          // Estimate experience level based on context
          const experienceMatch = contentLower.match(new RegExp(`(\\d+)\\s*(?:years?|yrs?).*?${keyword}`, 'i'));
          const yearsExp = experienceMatch ? parseInt(experienceMatch[1]) : 2;
          
          let level = 'Beginner';
          if (yearsExp >= 5) level = 'Expert';
          else if (yearsExp >= 3) level = 'Advanced';
          else if (yearsExp >= 1) level = 'Intermediate';
          
          extractedSkills.push({
            name: keyword.charAt(0).toUpperCase() + keyword.slice(1),
            category,
            level,
            confidence: 0.8,
            yearsExperience: yearsExp,
            certifications: []
          });
        }
      }
    }
    
    // Extract education
    const educationMatch = content.match(/(?:bachelor|master|phd|degree|university|college).*?(?:\n|$)/gi) || [];
    
    // Extract certifications
    const certificationMatch = content.match(/(?:certified|certification|certificate).*?(?:\n|$)/gi) || [];
    
    return {
      skills: extractedSkills,
      categories: [...new Set(extractedSkills.map(s => s.category))],
      experience: 'Extracted from content',
      education: educationMatch.map(e => e.trim()),
      certifications: certificationMatch.map(c => c.trim())
    };
  }
}