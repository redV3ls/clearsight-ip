import { Env } from '../../index';
import { logger } from '../../utils/logger';
import { isFeatureEnabled } from './core/config';
import { ServiceHealthStatus } from './core/base';

// Import AI feature services
import { MultiLanguageAnalysisService } from './features/multiLanguage';
import { IndustrySpecificAnalysisService } from './features/industrySpecific';
// Note: Other services would be imported here as they're implemented
// import { PersonalizedCoachingService } from './features/personalizedCoaching';
// import { SkillTrendPredictionService } from './features/skillTrendPrediction';
// import { CompetitiveAnalysisService } from './features/competitiveAnalysis';
// import { InterviewPreparationService } from './features/interviewPreparation';

/**
 * AI Service Orchestrator
 * 
 * Central hub for all AI-powered features.
 * Manages service initialization, health monitoring, and feature routing.
 * Replaces the monolithic advancedAIFeatures.ts with modular architecture.
 */

export class AIServiceOrchestrator {
  private env: Env;
  private services: Map<string, any> = new Map();
  private healthStatus: Map<string, ServiceHealthStatus> = new Map();

  constructor(env: Env) {
    this.env = env;
    this.initializeServices();
  }

  /**
   * Initializes all enabled AI services
   */
  private initializeServices(): void {
    logger.info('Initializing AI services...');

    // Initialize Multi-Language Analysis Service
    if (isFeatureEnabled('MULTI_LANGUAGE_ENABLED')) {
      try {
        const multiLanguageService = new MultiLanguageAnalysisService(this.env);
        this.services.set('multiLanguage', multiLanguageService);
        logger.info('Multi-Language Analysis Service initialized');
      } catch (error) {
        logger.error('Failed to initialize Multi-Language Analysis Service', error);
      }
    }

    // Initialize Industry-Specific Analysis Service
    if (isFeatureEnabled('INDUSTRY_SPECIFIC_ENABLED')) {
      try {
        const industryService = new IndustrySpecificAnalysisService(this.env);
        this.services.set('industrySpecific', industryService);
        logger.info('Industry-Specific Analysis Service initialized');
      } catch (error) {
        logger.error('Failed to initialize Industry-Specific Analysis Service', error);
      }
    }

    // TODO: Initialize other services as they're implemented
    /*
    if (isFeatureEnabled('PERSONALIZED_COACHING_ENABLED')) {
      try {
        const coachingService = new PersonalizedCoachingService(this.env);
        this.services.set('personalizedCoaching', coachingService);
        logger.info('Personalized Coaching Service initialized');
      } catch (error) {
        logger.error('Failed to initialize Personalized Coaching Service', error);
      }
    }

    if (isFeatureEnabled('SKILL_TREND_PREDICTION_ENABLED')) {
      try {
        const trendService = new SkillTrendPredictionService(this.env);
        this.services.set('skillTrendPrediction', trendService);
        logger.info('Skill Trend Prediction Service initialized');
      } catch (error) {
        logger.error('Failed to initialize Skill Trend Prediction Service', error);
      }
    }

    if (isFeatureEnabled('COMPETITIVE_ANALYSIS_ENABLED')) {
      try {
        const competitiveService = new CompetitiveAnalysisService(this.env);
        this.services.set('competitiveAnalysis', competitiveService);
        logger.info('Competitive Analysis Service initialized');
      } catch (error) {
        logger.error('Failed to initialize Competitive Analysis Service', error);
      }
    }

    if (isFeatureEnabled('INTERVIEW_PREPARATION_ENABLED')) {
      try {
        const interviewService = new InterviewPreparationService(this.env);
        this.services.set('interviewPreparation', interviewService);
        logger.info('Interview Preparation Service initialized');
      } catch (error) {
        logger.error('Failed to initialize Interview Preparation Service', error);
      }
    }
    */

    logger.info(`AI Services initialized: ${this.services.size} services active`);
  }

  /**
   * Gets a specific AI service by name
   */
  getService<T>(serviceName: string): T | null {
    const service = this.services.get(serviceName);
    if (!service) {
      logger.warn(`AI service '${serviceName}' not found or not enabled`);
      return null;
    }
    return service as T;
  }

  /**
   * Gets multi-language analysis service
   */
  getMultiLanguageService(): MultiLanguageAnalysisService | null {
    return this.getService<MultiLanguageAnalysisService>('multiLanguage');
  }

  /**
   * Gets industry-specific analysis service
   */
  getIndustrySpecificService(): IndustrySpecificAnalysisService | null {
    return this.getService<IndustrySpecificAnalysisService>('industrySpecific');
  }

  /**
   * Checks health of all AI services
   */
  async checkAllServicesHealth(): Promise<Map<string, ServiceHealthStatus>> {
    logger.info('Checking health of all AI services...');
    
    const healthChecks = Array.from(this.services.entries()).map(async ([name, service]) => {
      try {
        const health = await service.healthCheck();
        this.healthStatus.set(name, health);
        return { name, health };
      } catch (error) {
        const errorHealth: ServiceHealthStatus = {
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error',
          provider: 'unknown',
          model: 'unknown',
          timestamp: new Date().toISOString()
        };
        this.healthStatus.set(name, errorHealth);
        return { name, health: errorHealth };
      }
    });

    await Promise.all(healthChecks);
    
    logger.info('AI services health check completed', {
      totalServices: this.services.size,
      healthyServices: Array.from(this.healthStatus.values()).filter(h => h.status === 'healthy').length
    });

    return this.healthStatus;
  }

  /**
   * Gets health status for a specific service
   */
  getServiceHealth(serviceName: string): ServiceHealthStatus | null {
    return this.healthStatus.get(serviceName) || null;
  }

  /**
   * Gets overall system health status
   */
  getOverallHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: number;
    healthy: number;
    unhealthy: number;
    timestamp: string;
  } {
    const totalServices = this.services.size;
    const healthyServices = Array.from(this.healthStatus.values()).filter(h => h.status === 'healthy').length;
    const unhealthyServices = totalServices - healthyServices;

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (unhealthyServices === 0) {
      overallStatus = 'healthy';
    } else if (healthyServices > unhealthyServices) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'unhealthy';
    }

    return {
      status: overallStatus,
      services: totalServices,
      healthy: healthyServices,
      unhealthy: unhealthyServices,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Gets capabilities of all services
   */
  getAllCapabilities(): Record<string, any> {
    const capabilities: Record<string, any> = {};
    
    for (const [name, service] of this.services.entries()) {
      try {
        capabilities[name] = service.getCapabilities();
      } catch (error) {
        logger.warn(`Failed to get capabilities for service '${name}'`, error);
        capabilities[name] = { error: 'Capabilities unavailable' };
      }
    }
    
    return capabilities;
  }

  /**
   * Gets list of available services
   */
  getAvailableServices(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Gracefully shuts down all services
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down AI services...');
    
    // If services have cleanup methods, call them here
    for (const [name, service] of this.services.entries()) {
      try {
        if (typeof service.shutdown === 'function') {
          await service.shutdown();
        }
        logger.info(`Service '${name}' shut down successfully`);
      } catch (error) {
        logger.error(`Failed to shut down service '${name}'`, error);
      }
    }
    
    this.services.clear();
    this.healthStatus.clear();
    
    logger.info('AI services shutdown completed');
  }

  /**
   * Reloads a specific service
   */
  async reloadService(serviceName: string): Promise<boolean> {
    logger.info(`Reloading AI service '${serviceName}'...`);
    
    try {
      // Remove existing service
      const existingService = this.services.get(serviceName);
      if (existingService && typeof existingService.shutdown === 'function') {
        await existingService.shutdown();
      }
      
      this.services.delete(serviceName);
      this.healthStatus.delete(serviceName);
      
      // Reinitialize the service
      if (serviceName === 'multiLanguage' && isFeatureEnabled('MULTI_LANGUAGE_ENABLED')) {
        const newService = new MultiLanguageAnalysisService(this.env);
        this.services.set(serviceName, newService);
        
        // Check health of reloaded service
        const health = await newService.healthCheck();
        this.healthStatus.set(serviceName, health);
        
        logger.info(`Service '${serviceName}' reloaded successfully`);
        return true;
      }
      
      if (serviceName === 'industrySpecific' && isFeatureEnabled('INDUSTRY_SPECIFIC_ENABLED')) {
        const newService = new IndustrySpecificAnalysisService(this.env);
        this.services.set(serviceName, newService);
        
        // Check health of reloaded service
        const health = await newService.healthCheck();
        this.healthStatus.set(serviceName, health);
        
        logger.info(`Service '${serviceName}' reloaded successfully`);
        return true;
      }
      
      logger.warn(`Service '${serviceName}' not found or not enabled for reload`);
      return false;
      
    } catch (error) {
      logger.error(`Failed to reload service '${serviceName}'`, error);
      return false;
    }
  }
}

// Export service types for external use
export * from './core/base';
export * from './core/types';
export * from './core/config';
export * from './features/multiLanguage';
export * from './features/industrySpecific';
// TODO: Export other feature services as they're implemented

// Export singleton instance creator
let orchestratorInstance: AIServiceOrchestrator | null = null;

export function getAIServiceOrchestrator(env: Env): AIServiceOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new AIServiceOrchestrator(env);
  }
  return orchestratorInstance;
}

export function resetAIServiceOrchestrator(): void {
  orchestratorInstance = null;
}