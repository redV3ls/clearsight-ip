import { DeepSeekAIService, AISkillsAnalysis, AIJobAnalysis, AIGapAnalysis } from './deepseekAI';
import { createAIConfig, validateAIConfig } from '../config/ai';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { 
  AdvancedAIFeaturesService,
  MultiLanguageAnalysis,
  IndustrySpecificAnalysis,
  PersonalizedCoaching,
  SkillTrendPrediction,
  CompetitiveAnalysis,
  InterviewPreparation,
  // PortfolioOptimization,
  // NetworkingInsights
} from './advancedAIFeatures';

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
  // Standalone analysis (when no job description provided)
  standaloneAnalysis?: {
    careerNarrative: string;
    currentMarketPosition: any;
    strengthsAnalysis: any[];
    improvementAreas: any[];
    careerPathOptions: any[];
    skillDevelopmentPlan: any;
    marketInsights: any[];
    resumeOptimization: any[];
    networkingStrategy: any;
    motivationalMessage: string;
    nextSteps: any[];
  };
  // Advanced AI Features
  multiLanguageAnalysis?: MultiLanguageAnalysis;
  industrySpecificAnalysis?: IndustrySpecificAnalysis;
  personalizedCoaching?: PersonalizedCoaching;
  skillTrendPredictions?: SkillTrendPrediction[];
  competitiveAnalysis?: CompetitiveAnalysis;
  interviewPreparation?: InterviewPreparation;
  portfolioOptimization?: any; // PortfolioOptimization;
  networkingInsights?: any; // NetworkingInsights;
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
  private advancedAIFeatures: AdvancedAIFeaturesService | null = null;
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
        this.advancedAIFeatures = new AdvancedAIFeaturesService(this.deepseekAI, this.env);
        this.isAIEnabled = true;
        logger.info('AI service initialized successfully with advanced features');
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
   * Reinitialize AI service (useful for recovery from failures)
   */
  public reinitializeAI(): boolean {
    try {
      this.initializeAI();
      return this.isAIEnabled;
    } catch (error) {
      logger.error('Failed to reinitialize AI service:', error);
      return false;
    }
  }

  /**
   * Perform narrative-based AI-powered CV analysis
   */
  async analyzeNarrativeCV(
    cvContent: string,
    jobContent?: string,
    options: {
      includeMetadata?: boolean;
    } = {}
  ): Promise<{
    analysis_id: string;
    user_id: string;
    timestamp: string;
    status: string;
    narrative: string;
    analysis_type: 'standalone' | 'job-comparison';
    word_count: number;
    metadata?: any;
    aiPowered: boolean;
  }> {
    const startTime = Date.now();
    const analysisId = crypto.randomUUID();

    try {
      if (!this.isAIEnabled || !this.deepseekAI) {
        throw new Error('AI service is not available. Narrative analysis requires AI service.');
      }

      logger.info('Starting narrative CV analysis', {
        analysisId,
        contentLength: cvContent.length,
        hasJobDescription: !!jobContent
      });

      // Use the new narrative analysis method
      const narrativeResult = options.includeMetadata 
        ? await this.deepseekAI.extractNarrativeWithMetadata(cvContent, jobContent)
        : { 
            analysis: await this.deepseekAI.extractNarrativeFromCV(cvContent, jobContent),
            metadata: null
          };

      const processingTime = Date.now() - startTime;

      // Build narrative response
      const result = {
        analysis_id: analysisId,
        user_id: 'current-user', // Will be set by calling code
        timestamp: new Date().toISOString(),
        status: 'completed',
        narrative: narrativeResult.analysis.narrative,
        analysis_type: narrativeResult.analysis.analysisType,
        word_count: narrativeResult.analysis.wordCount,
        aiPowered: true,
        metadata: narrativeResult.metadata ? {
          ...narrativeResult.metadata,
          processingTime,
          aiProvider: 'deepseek',
          aiModel: 'deepseek-reasoner'
        } : {
          processingTime,
          aiProvider: 'deepseek',
          aiModel: 'deepseek-reasoner'
        }
      };

      logger.info('Narrative CV analysis completed', {
        analysisId,
        wordCount: result.word_count,
        analysisType: result.analysis_type,
        processingTime
      });

      return result;
    } catch (error) {
      logger.error('Narrative AI analysis failed:', error);
      throw error;
    }
  }

  /**
   * Perform comprehensive AI-powered CV analysis (legacy method)
   */
  async analyzeCV(
    cvContent: string,
    jobContent?: string,
    options: {
      includeSkillsGap: boolean;
      includeCareerSuggestions: boolean;
      includeIndustryTrends: boolean;
      // Advanced AI Features options
      includeMultiLanguage?: boolean;
      includeIndustrySpecific?: boolean;
      includePersonalizedCoaching?: boolean;
      includeSkillTrendPredictions?: boolean;
      includeCompetitiveAnalysis?: boolean;
      includeInterviewPreparation?: boolean;
      includePortfolioOptimization?: boolean;
      includeNetworkingInsights?: boolean;
      targetLanguage?: string;
      industry?: string;
      userPreferences?: {
        learningStyle?: string;
        careerGoals?: string[];
        timeAvailability?: string;
      };
      currentPortfolio?: string;
    } = {
      includeSkillsGap: true,
      includeCareerSuggestions: true,
      includeIndustryTrends: true,
      includeMultiLanguage: false,
      includeIndustrySpecific: false,
      includePersonalizedCoaching: false,
      includeSkillTrendPredictions: false,
      includeCompetitiveAnalysis: false,
      includeInterviewPreparation: false,
      includePortfolioOptimization: false,
      includeNetworkingInsights: false,
    }
  ): Promise<EnhancedAnalysisResult> {
    const startTime = Date.now();
    const analysisId = crypto.randomUUID();

    try {
      // Only use AI-powered analysis - no fallback
      if (!this.isAIEnabled || !this.deepseekAI) {
        throw new Error('AI service is not available. Pure LLM analysis required.');
      }

      return await this.performAIAnalysis(
        analysisId,
        cvContent,
        jobContent,
        options,
        startTime
      );
    } catch (error) {
      logger.error('AI analysis failed:', error);
      throw error; // Re-throw the error instead of falling back
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

    // Step 1: AI-powered skills extraction (with multi-language support if enabled)
    logger.info('Starting AI-powered skills extraction');
    let skillsAnalysis: AISkillsAnalysis;
    let multiLanguageAnalysis: MultiLanguageAnalysis | undefined;

    if (options.includeMultiLanguage && this.advancedAIFeatures) {
      logger.info('Performing multi-language analysis');
      const multiLangResult = await this.advancedAIFeatures.analyzeMultiLanguageCV(
        cvContent,
        options.targetLanguage
      );
      skillsAnalysis = multiLangResult.analysis;
      multiLanguageAnalysis = multiLangResult.languageAnalysis;
    } else {
      skillsAnalysis = await this.deepseekAI.extractSkillsFromCV(cvContent);
    }

    // Step 2: Job analysis if job description provided
    let jobAnalysis: AIJobAnalysis | undefined;
    if (jobContent && options.includeSkillsGap) {
      logger.info('Starting AI-powered job analysis');
      jobAnalysis = await this.deepseekAI.analyzeJobDescription(jobContent);
    }

    // Step 3: Gap analysis if both CV and job are analyzed, or standalone analysis if no job
    let gapAnalysis: AIGapAnalysis | undefined;
    let standaloneAnalysis: any | undefined;
    
    if (skillsAnalysis && jobAnalysis && options.includeSkillsGap) {
      logger.info('Starting AI-powered gap analysis');
      gapAnalysis = await this.deepseekAI.performGapAnalysis(skillsAnalysis, jobAnalysis);
    } else if (skillsAnalysis && !jobContent) {
      logger.info('Starting AI-powered standalone CV analysis');
      standaloneAnalysis = await this.deepseekAI.performStandaloneCVAnalysis(skillsAnalysis);
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

    // Add standalone analysis if no job description provided
    if (standaloneAnalysis) {
      result.standaloneAnalysis = standaloneAnalysis;
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

    // Add advanced AI features if enabled and available
    if (this.advancedAIFeatures) {
      // Multi-language analysis
      if (multiLanguageAnalysis) {
        result.multiLanguageAnalysis = multiLanguageAnalysis;
      }

      // Industry-specific analysis (temporarily disabled)
      // if (options.includeIndustrySpecific && jobAnalysis && options.industry) {
      //   logger.info('Performing industry-specific analysis');
      //   result.industrySpecificAnalysis = await this.advancedAIFeatures.performIndustrySpecificAnalysis(
      //     skillsAnalysis,
      //     jobAnalysis,
      //     options.industry
      //   );
      // }

      // Personalized coaching (temporarily disabled)
      // if (options.includePersonalizedCoaching && gapAnalysis) {
      //   logger.info('Generating personalized coaching recommendations');
      //   result.personalizedCoaching = await this.advancedAIFeatures.generatePersonalizedCoaching(
      //     skillsAnalysis,
      //     gapAnalysis,
      //     options.userPreferences
      //   );
      // }

      // Skill trend predictions
      if (options.includeSkillTrendPredictions) {
        logger.info('Predicting skill trends');
        const skillNames = skillsAnalysis.skills.map(skill => skill.name);
        result.skillTrendPredictions = await this.advancedAIFeatures.predictSkillTrends(
          skillNames,
          options.industry
        );
      }

      // Competitive analysis (temporarily disabled)
      // if (options.includeCompetitiveAnalysis && jobAnalysis && options.industry) {
      //   logger.info('Performing competitive analysis');
      //   result.competitiveAnalysis = await this.advancedAIFeatures.performCompetitiveAnalysis(
      //     skillsAnalysis,
      //     jobAnalysis,
      //     options.industry
      //   );
      // }

      // Interview preparation (temporarily disabled)
      // if (options.includeInterviewPreparation && jobAnalysis) {
      //   logger.info('Generating interview preparation suggestions');
      //   result.interviewPreparation = await this.advancedAIFeatures.generateInterviewPreparation(
      //     skillsAnalysis,
      //     jobAnalysis
      //   );
      // }

      // Portfolio optimization (temporarily disabled)
      // if (options.includePortfolioOptimization && jobAnalysis) {
      //   logger.info('Optimizing portfolio recommendations');
      //   result.portfolioOptimization = await this.advancedAIFeatures.optimizePortfolio(
      //     skillsAnalysis,
      //     jobAnalysis,
      //     options.currentPortfolio
      //   );
      // }

      // Networking insights (temporarily disabled)
      // if (options.includeNetworkingInsights && options.industry && options.userPreferences?.careerGoals) {
      //   logger.info('Generating networking insights');
      //   result.networkingInsights = await this.advancedAIFeatures.generateNetworkingInsights(
      //     skillsAnalysis,
      //     options.userPreferences.careerGoals,
      //     options.industry
      //   );
      // }
    }

    logger.info('AI-powered analysis completed successfully', {
      analysisId,
      skillsFound: skillsAnalysis.skills.length,
      processingTime: Date.now() - startTime,
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


}