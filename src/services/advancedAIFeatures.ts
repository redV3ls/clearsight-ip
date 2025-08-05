import { DeepSeekAIService, AISkillsAnalysis, AIJobAnalysis, AIGapAnalysis } from './deepseekAI';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { LegacyAdvancedAIFeaturesAdapter } from './ai/migration/legacyAdapter';
import { Env } from '../index';

// Re-export all the existing interfaces for backward compatibility
export interface MultiLanguageAnalysis {
  originalLanguage: string;
  detectedLanguage: string;
  translatedContent?: string;
  analysisLanguage: string;
  culturalContext: {
    region: string;
    workCulture: string[];
    commonPractices: string[];
    educationSystem: string;
  };
  localizedSkills: Array<{
    skill: string;
    localTerms: string[];
    marketRelevance: 'high' | 'medium' | 'low';
  }>;
}

export interface IndustrySpecificAnalysis {
  industry: string;
  subSector?: string;
  specificRequirements: {
    regulations: string[];
    certifications: string[];
    tools: string[];
    methodologies: string[];
  };
  marketContext: {
    growthRate: number;
    competitionLevel: 'high' | 'medium' | 'low';
    salaryTrends: 'increasing' | 'stable' | 'decreasing';
    remoteFriendly: boolean;
  };
  careerPaths: Array<{
    path: string;
    timeframe: number;
    requirements: string[];
    salaryProgression: { min: number; max: number };
  }>;
}

export interface PersonalizedCoaching {
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  personalityType: string;
  careerGoals: string[];
  currentChallenges: string[];
  recommendations: {
    immediate: CoachingRecommendation[];
    shortTerm: CoachingRecommendation[];
    longTerm: CoachingRecommendation[];
  };
  mentorshipSuggestions: {
    mentorProfile: string;
    focusAreas: string[];
    meetingFrequency: string;
  };
}

export interface CoachingRecommendation {
  type: 'skill-development' | 'networking' | 'project' | 'certification' | 'experience';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  timeframe: string;
  resources: string[];
  successMetrics: string[];
  reasoning: string;
}

export interface SkillTrendPrediction {
  skill: string;
  currentDemand: 'high' | 'medium' | 'low';
  predictedDemand: {
    sixMonths: 'increasing' | 'stable' | 'decreasing';
    oneYear: 'increasing' | 'stable' | 'decreasing';
    threeYears: 'increasing' | 'stable' | 'decreasing';
  };
  factors: {
    technologyTrends: string[];
    industryShifts: string[];
    economicFactors: string[];
    regulatoryChanges: string[];
  };
  salaryImpact: {
    current: number;
    predicted: number;
    confidence: number;
  };
  learningRecommendation: {
    urgency: 'immediate' | 'soon' | 'future' | 'optional';
    reasoning: string;
    alternatives: string[];
  };
}

export interface CompetitiveAnalysis {
  candidateProfile: {
    uniqueStrengths: string[];
    marketPosition: 'top-tier' | 'competitive' | 'developing' | 'entry-level';
    differentiators: string[];
  };
  marketComparison: {
    similarProfiles: number;
    competitionLevel: 'high' | 'medium' | 'low';
    averageExperience: number;
    commonSkillGaps: string[];
  };
  competitiveAdvantages: Array<{
    advantage: string;
    rarity: 'very-rare' | 'rare' | 'uncommon' | 'common';
    marketValue: 'high' | 'medium' | 'low';
    reasoning: string;
  }>;
  improvementAreas: Array<{
    area: string;
    impact: 'high' | 'medium' | 'low';
    difficulty: 'easy' | 'moderate' | 'hard';
    timeToImprove: number;
  }>;
}

export interface InterviewPreparation {
  jobSpecific: {
    likelyQuestions: string[];
    technicalChallenges: string[];
    behavioralQuestions: string[];
    companySpecific: string[];
  };
  preparationPlan: {
    technical: Array<{
      topic: string;
      studyTime: number;
      resources: string[];
      practiceExercises: string[];
    }>;
    behavioral: Array<{
      question: string;
      framework: string;
      exampleScenarios: string[];
    }>;
    company: Array<{
      researchArea: string;
      keyPoints: string[];
      questions: string[];
    }>;
  };
  mockInterview: {
    questions: string[];
    evaluationCriteria: string[];
    improvementAreas: string[];
  };
}

/**
 * Advanced AI Features Service (Refactored)
 * 
 * This service now uses the new modular AI architecture while maintaining
 * backward compatibility with the existing interface.
 * 
 * MIGRATION STATUS:
 * - ✅ Multi-language analysis: Using new MultiLanguageAnalysisService
 * - 🔄 Industry-specific insights: Using legacy adapter (placeholder)
 * - 🔄 Personalized career coaching: Using legacy adapter (placeholder)
 * - 🔄 Skill trend prediction: Using legacy adapter (placeholder)
 * - 🔄 Competitive analysis: Using legacy adapter (placeholder)
 * - 🔄 Interview preparation: Using legacy adapter (placeholder)
 */
export class AdvancedAIFeaturesService {
  private deepseekAI: DeepSeekAIService;
  private legacyAdapter: LegacyAdvancedAIFeaturesAdapter;

  constructor(deepseekAI: DeepSeekAIService, env: Env) {
    this.deepseekAI = deepseekAI;
    this.legacyAdapter = new LegacyAdvancedAIFeaturesAdapter(env);
    
    logger.info('Advanced AI Features Service initialized with new modular architecture');
  }

  /**
   * Analyze CV with multi-language support
   */
  async analyzeMultiLanguageCV(
    cvContent: string,
    targetLanguage?: string
  ): Promise<{
    analysis: AISkillsAnalysis;
    languageAnalysis: MultiLanguageAnalysis;
  }> {
    try {
      logger.info('Starting multi-language CV analysis');

      // Use the new multi-language service
      const multiLangResult = await this.legacyAdapter.analyzeMultiLanguageResume(cvContent, {
        language: targetLanguage,
        includeTranslation: true,
        targetLanguages: targetLanguage ? [targetLanguage] : ['en']
      });

      // Transform the new result to the legacy format
      const languageAnalysis: MultiLanguageAnalysis = {
        originalLanguage: multiLangResult.analysis.language || 'en',
        detectedLanguage: multiLangResult.analysis.language || 'en',
        translatedContent: multiLangResult.analysis.translations?.[targetLanguage || 'en'],
        analysisLanguage: targetLanguage || 'en',
        culturalContext: {
          region: 'Unknown',
          workCulture: multiLangResult.analysis.culturalContext || [],
          commonPractices: [],
          educationSystem: 'Unknown'
        },
        localizedSkills: (multiLangResult.analysis.skills || []).map((skill: string) => ({
          skill,
          localTerms: [skill],
          marketRelevance: 'medium' as const
        }))
      };

      // Use the existing deepseek service for skills analysis
      const contentToAnalyze = languageAnalysis.translatedContent || cvContent;
      const analysis = await this.deepseekAI.extractSkillsFromCV(contentToAnalyze);

      return {
        analysis,
        languageAnalysis
      };

    } catch (error) {
      logger.error('Multi-language CV analysis failed:', error);
      throw new AppError('Multi-language CV analysis failed', 500, 'MULTILANG_ANALYSIS_FAILED');
    }
  }

  /**
   * Perform industry-specific analysis
   */
  async performIndustrySpecificAnalysis(
    skillsAnalysis: AISkillsAnalysis,
    jobAnalysis: AIJobAnalysis,
    industry: string
  ): Promise<IndustrySpecificAnalysis> {
    try {
      logger.info('Starting industry-specific analysis', { industry });

      const result = await this.legacyAdapter.analyzeIndustrySpecific(
        JSON.stringify({ skills: skillsAnalysis, job: jobAnalysis }),
        industry
      );

      // Transform to expected format
      return {
        industry,
        subSector: undefined,
        specificRequirements: {
          regulations: result.analysis.insights?.regulations || [],
          certifications: result.analysis.insights?.certifications || [],
          tools: result.analysis.insights?.tools || [],
          methodologies: result.analysis.insights?.methodologies || []
        },
        marketContext: {
          growthRate: 0,
          competitionLevel: 'medium',
          salaryTrends: 'stable',
          remoteFriendly: true
        },
        careerPaths: result.analysis.insights?.careerPaths?.map((path: string) => ({
          path,
          timeframe: 24,
          requirements: [],
          salaryProgression: { min: 50000, max: 100000 }
        })) || []
      };

    } catch (error) {
      logger.error('Industry-specific analysis failed:', error);
      throw new AppError('Industry-specific analysis failed', 500, 'INDUSTRY_ANALYSIS_FAILED');
    }
  }

  /**
   * Generate personalized coaching recommendations
   */
  async generatePersonalizedCoaching(
    skillsAnalysis: AISkillsAnalysis,
    gapAnalysis: AIGapAnalysis,
    userPreferences?: {
      learningStyle?: string;
      careerGoals?: string[];
      timeAvailability?: string;
    }
  ): Promise<PersonalizedCoaching> {
    try {
      logger.info('Starting personalized coaching generation');

      const userProfile = {
        currentRole: 'Unknown',
        experience: 0,
        skills: skillsAnalysis.skills?.map(s => ({ name: s.name, level: 'intermediate' as const })) || [],
        goals: userPreferences?.careerGoals || []
      };

      const result = await this.legacyAdapter.generatePersonalizedCoaching(userProfile);

      // Transform to expected format
      return {
        learningStyle: (userPreferences?.learningStyle as any) || 'visual',
        personalityType: 'Unknown',
        careerGoals: userPreferences?.careerGoals || [],
        currentChallenges: [],
        recommendations: {
          immediate: result.coaching.shortTermGoals?.map((goal: string) => ({
            type: 'skill-development' as const,
            title: goal,
            description: goal,
            priority: 'medium' as const,
            timeframe: '1-3 months',
            resources: [],
            successMetrics: [],
            reasoning: 'Generated by AI coaching service'
          })) || [],
          shortTerm: [],
          longTerm: result.coaching.longTermGoals?.map((goal: string) => ({
            type: 'skill-development' as const,
            title: goal,
            description: goal,
            priority: 'low' as const,
            timeframe: '6-12 months',
            resources: [],
            successMetrics: [],
            reasoning: 'Generated by AI coaching service'
          })) || []
        },
        mentorshipSuggestions: {
          mentorProfile: 'Senior professional in your field',
          focusAreas: ['Career development', 'Skill enhancement'],
          meetingFrequency: 'Monthly'
        }
      };

    } catch (error) {
      logger.error('Personalized coaching generation failed:', error);
      throw new AppError('Personalized coaching generation failed', 500, 'COACHING_GENERATION_FAILED');
    }
  }

  /**
   * Predict skill trends and market demand
   */
  async predictSkillTrends(skills: string[], industry?: string): Promise<SkillTrendPrediction[]> {
    try {
      logger.info('Starting skill trend prediction', { skillCount: skills.length, industry });

      const result = await this.legacyAdapter.predictSkillTrends(skills, { industry });

      // Transform to expected format
      return result.trends.map((trend: any) => ({
        skill: trend.skill,
        currentDemand: trend.currentDemand,
        predictedDemand: {
          sixMonths: trend.projectedDemand,
          oneYear: trend.projectedDemand,
          threeYears: trend.projectedDemand
        },
        factors: {
          technologyTrends: trend.factors || [],
          industryShifts: [],
          economicFactors: [],
          regulatoryChanges: []
        },
        salaryImpact: {
          current: 0,
          predicted: 0,
          confidence: trend.confidence || 0.5
        },
        learningRecommendation: {
          urgency: 'soon',
          reasoning: 'Based on market analysis',
          alternatives: []
        }
      }));

    } catch (error) {
      logger.error('Skill trend prediction failed:', error);
      throw new AppError('Skill trend prediction failed', 500, 'TREND_PREDICTION_FAILED');
    }
  }

  /**
   * Perform competitive analysis
   */
  async performCompetitiveAnalysis(
    skillsAnalysis: AISkillsAnalysis,
    targetRole: string,
    marketData?: any
  ): Promise<CompetitiveAnalysis> {
    try {
      logger.info('Starting competitive analysis', { targetRole });

      const userProfile = {
        skills: skillsAnalysis.skills?.map(s => s.name) || [],
        experience: skillsAnalysis.totalExperience || 0,
        achievements: [],
        education: []
      };

      const result = await this.legacyAdapter.performCompetitiveAnalysis(userProfile, targetRole);

      // Transform to expected format
      return {
        candidateProfile: {
          uniqueStrengths: result.analysis.competitivePosition?.strengthAreas || [],
          marketPosition: result.analysis.competitivePosition?.overallRanking || 'developing',
          differentiators: result.analysis.competitivePosition?.uniqueAdvantages || []
        },
        marketComparison: {
          similarProfiles: 100,
          competitionLevel: 'medium',
          averageExperience: 5,
          commonSkillGaps: result.analysis.competitivePosition?.improvementAreas || []
        },
        competitiveAdvantages: (result.analysis.competitivePosition?.strengthAreas || []).map((advantage: string) => ({
          advantage,
          rarity: 'uncommon' as const,
          marketValue: 'medium' as const,
          reasoning: 'Based on competitive analysis'
        })),
        improvementAreas: (result.analysis.competitivePosition?.improvementAreas || []).map((area: string) => ({
          area,
          impact: 'medium' as const,
          difficulty: 'moderate' as const,
          timeToImprove: 6
        }))
      };

    } catch (error) {
      logger.error('Competitive analysis failed:', error);
      throw new AppError('Competitive analysis failed', 500, 'COMPETITIVE_ANALYSIS_FAILED');
    }
  }

  /**
   * Generate interview preparation plan
   */
  async generateInterviewPreparation(
    jobDescription: string,
    skillsAnalysis: AISkillsAnalysis,
    companyInfo?: any
  ): Promise<InterviewPreparation> {
    try {
      logger.info('Starting interview preparation generation');

      const userProfile = {
        resume: JSON.stringify(skillsAnalysis),
        skills: skillsAnalysis.skills?.map(s => s.name) || [],
        experience: []
      };

      const result = await this.legacyAdapter.prepareForInterview(jobDescription, userProfile, {
        interviewType: 'mixed',
        company: companyInfo
      });

      // Transform to expected format
      return {
        jobSpecific: {
          likelyQuestions: result.preparation.keyTopics || [],
          technicalChallenges: [],
          behavioralQuestions: result.preparation.practiceQuestions?.map((q: any) => q.question) || [],
          companySpecific: []
        },
        preparationPlan: {
          technical: (result.preparation.keyTopics || []).map((topic: string) => ({
            topic,
            studyTime: 2,
            resources: [],
            practiceExercises: []
          })),
          behavioral: (result.preparation.practiceQuestions || []).map((q: any) => ({
            question: q.question,
            framework: 'STAR method',
            exampleScenarios: q.hints || []
          })),
          company: [{
            researchArea: 'Company culture and values',
            keyPoints: ['Research company mission', 'Understand team structure'],
            questions: ['What are the main challenges facing the team?']
          }]
        },
        mockInterview: {
          questions: result.preparation.practiceQuestions?.map((q: any) => q.question) || [],
          evaluationCriteria: ['Technical accuracy', 'Communication clarity', 'Problem-solving approach'],
          improvementAreas: ['Practice more technical questions', 'Improve storytelling']
        }
      };

    } catch (error) {
      logger.error('Interview preparation generation failed:', error);
      throw new AppError('Interview preparation generation failed', 500, 'INTERVIEW_PREP_FAILED');
    }
  }

  /**
   * Get service health and migration status
   */
  async getServiceHealth(): Promise<any> {
    try {
      const health = await this.legacyAdapter.healthCheck();
      const migrationStatus = this.legacyAdapter.getMigrationStatus();

      return {
        ...health,
        migration: migrationStatus
      };

    } catch (error) {
      logger.error('Service health check failed:', error);
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
}