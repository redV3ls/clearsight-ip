/**
 * Legacy Adapter for Advanced AI Features
 * 
 * Provides backward compatibility while transitioning from the monolithic
 * advancedAIFeatures.ts to the new modular AI services architecture.
 */

import { Env } from '../../../index';
import { logger } from '../../../utils/logger';
import { getAIServiceOrchestrator } from '../index';
import { MultiLanguageAnalysisService } from '../features/multiLanguage';

/**
 * Legacy Advanced AI Features Adapter
 * 
 * Maintains the same interface as the original advancedAIFeatures.ts
 * while delegating to the new modular services.
 */
export class LegacyAdvancedAIFeaturesAdapter {
  private orchestrator: any;
  private env: Env;

  constructor(env: Env) {
    this.env = env;
    this.orchestrator = getAIServiceOrchestrator(env);
  }

  /**
   * Multi-language resume analysis (legacy interface)
   */
  async analyzeMultiLanguageResume(resumeText: string, options: any = {}): Promise<any> {
    logger.info('Legacy multi-language resume analysis called');
    
    try {
      const multiLanguageService = this.orchestrator.getMultiLanguageService();
      if (!multiLanguageService) {
        throw new Error('Multi-language service not available');
      }

      const result = await multiLanguageService.analyze({
        text: resumeText,
        language: options.language,
        includeTranslation: options.includeTranslation || false,
        targetLanguages: options.targetLanguages || ['en'],
        context: options.context || {}
      }, {
        includeConfidence: true,
        includeExplanation: true,
        format: 'json'
      });

      // Transform to legacy format
      return this.transformToLegacyFormat(result, 'multiLanguage');

    } catch (error) {
      logger.error('Legacy multi-language analysis failed', error);
      throw error;
    }
  }

  /**
   * Industry-specific analysis (legacy interface)
   */
  async analyzeIndustrySpecific(content: string, industry: string, options: any = {}): Promise<any> {
    logger.info('Legacy industry-specific analysis called', { industry });
    
    try {
      const industryService = this.orchestrator.getIndustrySpecificService();
      if (!industryService) {
        throw new Error('Industry-specific service not available');
      }

      const result = await industryService.analyze({
        text: content,
        industry,
        jobRole: options.jobRole,
        companySize: options.companySize,
        location: options.location,
        context: options.context || {}
      }, {
        includeConfidence: true,
        includeExplanation: true,
        format: 'json'
      });

      // Transform to legacy format
      return this.transformToLegacyFormat(result, 'industrySpecific');

    } catch (error) {
      logger.error('Legacy industry-specific analysis failed', error);
      
      // Fallback response
      return {
        success: true,
        analysis: {
          industry,
          insights: {
            keySkills: ['Industry analysis service temporarily unavailable'],
            emergingTrends: ['Please try again later'],
            careerPaths: ['Service recovery in progress']
          },
          confidence: 0.3,
          explanation: 'Industry-specific analysis service encountered an error'
        },
        metadata: {
          provider: 'legacy-adapter-fallback',
          processingTime: 100,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Personalized coaching (legacy interface)
   */
  async generatePersonalizedCoaching(userProfile: any, options: any = {}): Promise<any> {
    logger.info('Legacy personalized coaching called');
    
    // Placeholder response
    return {
      success: true,
      coaching: {
        shortTermGoals: ['Coaching service under development'],
        longTermGoals: ['Advanced coaching features coming soon'],
        personalizedAdvice: ['Please check back for updated coaching features'],
        confidence: 0.5
      },
      metadata: {
        provider: 'legacy-adapter',
        processingTime: 100,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Skill trend prediction (legacy interface)
   */
  async predictSkillTrends(skills: string[], options: any = {}): Promise<any> {
    logger.info('Legacy skill trend prediction called', { skillCount: skills.length });
    
    // Placeholder response
    return {
      success: true,
      trends: skills.map(skill => ({
        skill,
        currentDemand: 'medium',
        projectedDemand: 'stable',
        growthRate: 0,
        factors: ['Trend analysis service under development'],
        confidence: 0.5
      })),
      metadata: {
        provider: 'legacy-adapter',
        processingTime: 100,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Competitive analysis (legacy interface)
   */
  async performCompetitiveAnalysis(userProfile: any, targetRole: string, options: any = {}): Promise<any> {
    logger.info('Legacy competitive analysis called', { targetRole });
    
    // Placeholder response
    return {
      success: true,
      analysis: {
        competitivePosition: {
          overallRanking: 'average',
          strengthAreas: ['Analysis service under development'],
          improvementAreas: ['Competitive analysis features coming soon'],
          uniqueAdvantages: ['Please check back for updated features']
        },
        confidence: 0.5
      },
      metadata: {
        provider: 'legacy-adapter',
        processingTime: 100,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Interview preparation (legacy interface)
   */
  async prepareForInterview(jobDescription: string, userProfile: any, options: any = {}): Promise<any> {
    logger.info('Legacy interview preparation called');
    
    // Placeholder response
    return {
      success: true,
      preparation: {
        keyTopics: ['Interview preparation service under development'],
        practiceQuestions: [{
          question: 'Interview preparation features are being migrated to new architecture',
          type: 'informational',
          difficulty: 'easy',
          hints: ['Please check back for updated interview preparation features']
        }],
        confidence: 0.5
      },
      metadata: {
        provider: 'legacy-adapter',
        processingTime: 100,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Enhanced resume analysis (legacy interface)
   */
  async enhancedResumeAnalysis(resumeText: string, options: any = {}): Promise<any> {
    logger.info('Legacy enhanced resume analysis called');
    
    try {
      // Try to use multi-language service for basic analysis
      const multiLanguageService = this.orchestrator.getMultiLanguageService();
      if (multiLanguageService) {
        const result = await multiLanguageService.analyze({
          text: resumeText,
          language: options.language || 'en',
          context: { type: 'resume', ...options.context }
        }, {
          includeConfidence: true,
          includeExplanation: true,
          format: 'json'
        });

        return this.transformToLegacyFormat(result, 'enhancedResume');
      }

      // Fallback response
      return {
        success: true,
        analysis: {
          skills: ['Enhanced analysis service under development'],
          experience: 'Analysis pending - service migration in progress',
          strengths: ['Please check back for updated analysis features'],
          improvements: ['Enhanced features coming soon'],
          confidence: 0.5
        },
        metadata: {
          provider: 'legacy-adapter',
          processingTime: 100,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      logger.error('Legacy enhanced resume analysis failed', error);
      throw error;
    }
  }

  /**
   * Transforms new service results to legacy format
   */
  private transformToLegacyFormat(result: any, analysisType: string): any {
    const baseResponse = {
      success: true,
      metadata: {
        provider: result.metadata.provider,
        model: result.metadata.model,
        processingTime: result.metadata.processingTime,
        tokensUsed: result.metadata.tokensUsed,
        timestamp: result.metadata.timestamp,
        analysisType
      }
    };

    switch (analysisType) {
      case 'multiLanguage':
        return {
          ...baseResponse,
          analysis: {
            detectedLanguage: result.data.detectedLanguage,
            languageConfidence: result.data.languageConfidence,
            proficiencyLevel: result.data.result.proficiencyLevel || 'intermediate',
            writingStyle: result.data.result.writingStyle || {},
            technicalTerminology: result.data.result.technicalTerminology || {},
            culturalContext: result.data.culturalContext || [],
            translations: result.data.translations || {},
            confidence: result.confidence,
            explanation: result.explanation,
            suggestions: result.data.suggestions || []
          }
        };

      case 'enhancedResume':
        return {
          ...baseResponse,
          analysis: {
            language: result.data.detectedLanguage,
            proficiency: result.data.result.proficiencyLevel || 'intermediate',
            skills: result.data.result.technicalTerminology?.terms || [],
            strengths: result.data.result.professionalEffectiveness?.strengths || [],
            improvements: result.data.result.professionalEffectiveness?.improvements || [],
            confidence: result.confidence,
            explanation: result.explanation,
            suggestions: result.data.suggestions || []
          }
        };

      case 'industrySpecific':
        return {
          ...baseResponse,
          analysis: {
            industry: result.data.industryInsights?.industry || 'Unknown',
            insights: {
              keySkills: result.data.industryInsights?.keySkills || [],
              emergingTrends: result.data.industryInsights?.emergingTrends || [],
              careerPaths: result.data.industryInsights?.careerPaths || [],
              certifications: result.data.industryInsights?.certifications || [],
              salaryBenchmarks: result.data.industryInsights?.salaryBenchmarks
            },
            competitiveAnalysis: result.data.competitiveAnalysis,
            confidence: result.confidence,
            explanation: result.explanation,
            suggestions: result.data.suggestions || []
          }
        };

      default:
        return {
          ...baseResponse,
          analysis: result.data
        };
    }
  }

  /**
   * Health check for legacy adapter
   */
  async healthCheck(): Promise<any> {
    try {
      const orchestratorHealth = await this.orchestrator.checkAllServicesHealth();
      const overallHealth = this.orchestrator.getOverallHealth();

      return {
        status: overallHealth.status,
        services: {
          total: overallHealth.services,
          healthy: overallHealth.healthy,
          unhealthy: overallHealth.unhealthy
        },
        capabilities: this.orchestrator.getAllCapabilities(),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Legacy adapter health check failed', error);
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Gets migration status
   */
  getMigrationStatus(): any {
    const availableServices = this.orchestrator.getAvailableServices();
    
    return {
      migrationProgress: {
        multiLanguageAnalysis: availableServices.includes('multiLanguage') ? 'completed' : 'pending',
        industrySpecificAnalysis: availableServices.includes('industrySpecific') ? 'completed' : 'pending',
        personalizedCoaching: 'pending',
        skillTrendPrediction: 'pending',
        competitiveAnalysis: 'pending',
        interviewPreparation: 'pending'
      },
      availableServices,
      totalServices: 6,
      migratedServices: availableServices.length,
      completionPercentage: Math.round((availableServices.length / 6) * 100)
    };
  }
}