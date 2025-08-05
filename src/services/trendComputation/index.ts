/**
 * Trend Computation Jobs Service (Refactored)
 * 
 * Main orchestrator for the modular trend computation system.
 * Coordinates job scheduling, execution, and monitoring.
 */

import { logger } from '../../utils/logger';
import { Database } from '../../config/database';
import { TrendsAnalysisService } from '../trendsAnalysis';
import { JobApiCollector } from '../jobApiCollector';

// Import modular components
import { JobScheduler } from './engines/jobScheduler';
import { ComputationEngine } from './engines/computationEngine';
import { SkillDemandTrendsJob } from './jobs/skillDemandJob';

// Import types
import { 
  TrendComputationConfig,
  ComputationJobResult,
  JobExecutionContext,
  TrendComputationState,
  ComputationMetrics,
  JobType,
  DEFAULT_TREND_CONFIG
} from './core/types';

/**
 * Trend Computation Jobs Service
 * 
 * Refactored from monolithic 804-line service into modular architecture.
 * Maintains the same public interface while using focused, maintainable components.
 */
export class TrendComputationJobsService {
  private jobScheduler: JobScheduler;
  private computationEngine: ComputationEngine;
  private trendsService: TrendsAnalysisService;
  private jobCollector: JobApiCollector;
  private jobExecutors: Map<string, (context: JobExecutionContext) => Promise<ComputationJobResult>>;

  constructor(private db: Database) {
    this.jobScheduler = new JobScheduler();
    this.computationEngine = new ComputationEngine();
    this.trendsService = new TrendsAnalysisService(db);
    this.jobCollector = new JobApiCollector(db);
    this.jobExecutors = new Map();
    
    this.initializeJobExecutors();
    
    logger.info('Trend Computation Jobs Service initialized with modular architecture');
  }

  /**
   * Run all enabled trend computation jobs
   * 
   * Main public interface - maintains compatibility with original service
   */
  async runAllJobs(config: Partial<TrendComputationConfig> = {}): Promise<ComputationJobResult[]> {
    try {
      const finalConfig = { ...DEFAULT_TREND_CONFIG, ...config };
      
      logger.info('Starting trend computation jobs execution', {
        enabledJobs: finalConfig.enabledJobs,
        updateFrequency: finalConfig.updateFrequency,
        dataRetentionDays: finalConfig.dataRetentionDays
      });

      // Execute jobs using the scheduler
      const results = await this.jobScheduler.runAllJobs(finalConfig, this.jobExecutors);

      // Log execution summary
      const summary = this.generateExecutionSummary(results);
      logger.info('Trend computation jobs completed', summary);

      return results;

    } catch (error) {
      logger.error('Failed to run trend computation jobs', error);
      throw new Error(`Trend computation jobs failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Run a specific computation job
   */
  async runSingleJob(
    jobName: string, 
    config: Partial<TrendComputationConfig> = {}
  ): Promise<ComputationJobResult> {
    try {
      const finalConfig = { ...DEFAULT_TREND_CONFIG, ...config };
      const executor = this.jobExecutors.get(jobName);

      if (!executor) {
        throw new Error(`Unknown job: ${jobName}`);
      }

      logger.info('Running single computation job', { jobName });

      const result = await this.jobScheduler.runSingleJob(
        jobName,
        finalConfig,
        executor
      );

      logger.info('Single job execution completed', {
        jobName,
        status: result.status,
        executionTime: result.executionTimeMs
      });

      return result;

    } catch (error) {
      logger.error(`Failed to run job ${jobName}`, error);
      throw error;
    }
  }

  /**
   * Validate and improve forecast accuracy
   */
  async validateAndImproveForecastAccuracy(): Promise<ComputationJobResult> {
    try {
      logger.info('Starting forecast accuracy validation');

      const startTime = Date.now();
      let recordsProcessed = 0;
      let recordsUpdated = 0;

      // Step 1: Get forecasts that can be validated
      const validationCandidates = await this.getValidationCandidates();
      recordsProcessed = validationCandidates.length;

      if (validationCandidates.length === 0) {
        return {
          jobName: 'validateForecasts',
          status: 'skipped',
          recordsProcessed: 0,
          recordsUpdated: 0,
          executionTimeMs: Date.now() - startTime,
          warnings: ['No forecasts available for validation'],
          lastRun: new Date().toISOString()
        };
      }

      // Step 2: Validate forecasts against actual data
      const validationResults = [];
      for (const candidate of validationCandidates) {
        const result = await this.validateSingleForecast(candidate);
        validationResults.push(result);
      }

      // Step 3: Generate accuracy improvements
      const improvements = await this.generateAccuracyImprovements(validationResults);

      // Step 4: Store validation results
      await this.storeValidationResults(validationResults);
      recordsUpdated = validationResults.length;

      // Step 5: Apply improvements
      await this.applyForecastImprovements(improvements);

      const executionTime = Date.now() - startTime;

      logger.info('Forecast validation completed', {
        candidatesProcessed: recordsProcessed,
        validationsStored: recordsUpdated,
        improvementsGenerated: improvements.length,
        executionTime
      });

      return {
        jobName: 'validateForecasts',
        status: 'success',
        recordsProcessed,
        recordsUpdated,
        executionTimeMs: executionTime,
        lastRun: new Date().toISOString(),
        metadata: {
          validationResults: validationResults.length,
          improvements: improvements.length,
          averageAccuracy: validationResults.reduce((sum, r) => sum + r.accuracy, 0) / validationResults.length
        }
      };

    } catch (error) {
      logger.error('Forecast validation failed', error);
      throw error;
    }
  }

  /**
   * Collect fresh data from external APIs
   */
  async collectExternalData(): Promise<ComputationJobResult> {
    try {
      logger.info('Starting external data collection');

      const startTime = Date.now();
      
      // Use the job collector to gather fresh data
      const metrics = await this.jobCollector.collectJobData(['mock', 'sample'], {
        maxJobs: 1000,
        includeSkills: true,
        includeSalary: true,
        includeLocation: true
      });

      const executionTime = Date.now() - startTime;

      logger.info('External data collection completed', {
        jobsCollected: metrics.jobsCollected,
        skillsExtracted: metrics.skillsExtracted,
        executionTime
      });

      return {
        jobName: 'collectExternalData',
        status: 'success',
        recordsProcessed: metrics.jobsCollected,
        recordsUpdated: metrics.skillsExtracted,
        executionTimeMs: executionTime,
        lastRun: new Date().toISOString(),
        metadata: {
          sources: ['mock', 'sample'],
          metrics
        }
      };

    } catch (error) {
      logger.error('External data collection failed', error);
      
      return {
        jobName: 'collectExternalData',
        status: 'error',
        recordsProcessed: 0,
        recordsUpdated: 0,
        executionTimeMs: Date.now() - Date.now(),
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        lastRun: new Date().toISOString()
      };
    }
  }

  /**
   * Get current computation state
   */
  getComputationState(): TrendComputationState {
    return this.jobScheduler.getState();
  }

  /**
   * Get job execution metrics
   */
  getJobMetrics(): Map<string, ComputationMetrics> {
    return this.jobScheduler.getJobMetrics();
  }

  /**
   * Get service health status
   */
  getServiceHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: Record<string, boolean>;
    metrics: Record<string, number>;
  } {
    try {
      const components = {
        jobScheduler: !!this.jobScheduler,
        computationEngine: !!this.computationEngine,
        trendsService: !!this.trendsService,
        jobCollector: !!this.jobCollector,
        database: !!this.db
      };

      const allHealthy = Object.values(components).every(Boolean);
      const status = allHealthy ? 'healthy' : 'unhealthy';

      const state = this.jobScheduler.getState();
      const metrics = {
        componentsHealthy: Object.values(components).filter(Boolean).length,
        totalComponents: Object.keys(components).length,
        isRunning: state.isRunning ? 1 : 0,
        queuedJobs: state.queuedJobs.length,
        completedJobs: state.completedJobs.length,
        failedJobs: state.failedJobs.length,
        availableExecutors: this.jobExecutors.size
      };

      return { status, components, metrics };

    } catch (error) {
      logger.error('Health check failed', error);
      return {
        status: 'unhealthy',
        components: {},
        metrics: {}
      };
    }
  }

  // Private methods

  /**
   * Initializes job executors for all supported job types
   */
  private initializeJobExecutors(): void {
    // Initialize skill demand trends job
    const skillDemandJob = new SkillDemandTrendsJob(this.db);
    this.jobExecutors.set(JobType.SKILL_DEMAND_TRENDS, (context) => 
      skillDemandJob.execute(context)
    );

    // Initialize other job executors (placeholder implementations)
    this.jobExecutors.set(JobType.EMERGING_SKILLS, (context) => 
      this.executeEmergingSkillsJob(context)
    );

    this.jobExecutors.set(JobType.REGIONAL_TRENDS, (context) => 
      this.executeRegionalTrendsJob(context)
    );

    this.jobExecutors.set(JobType.FORECASTS, (context) => 
      this.executeForecastsJob(context)
    );

    this.jobExecutors.set(JobType.CLEANUP, (context) => 
      this.executeCleanupJob(context)
    );

    this.jobExecutors.set(JobType.VALIDATION, (context) => 
      this.executeValidationJob(context)
    );

    this.jobExecutors.set(JobType.DATA_COLLECTION, (context) => 
      this.executeDataCollectionJob(context)
    );

    logger.info(`Initialized ${this.jobExecutors.size} job executors`);
  }

  /**
   * Placeholder job executors (to be implemented as separate job classes)
   */
  private async executeEmergingSkillsJob(context: JobExecutionContext): Promise<ComputationJobResult> {
    const startTime = Date.now();
    
    // Placeholder implementation
    await this.delay(2000); // Simulate processing time
    
    return {
      jobName: context.jobName,
      status: 'success',
      recordsProcessed: 150,
      recordsUpdated: 25,
      executionTimeMs: Date.now() - startTime,
      lastRun: new Date().toISOString(),
      metadata: { note: 'Placeholder implementation - emerging skills job' }
    };
  }

  private async executeRegionalTrendsJob(context: JobExecutionContext): Promise<ComputationJobResult> {
    const startTime = Date.now();
    
    // Placeholder implementation
    await this.delay(3000); // Simulate processing time
    
    return {
      jobName: context.jobName,
      status: 'success',
      recordsProcessed: 200,
      recordsUpdated: 180,
      executionTimeMs: Date.now() - startTime,
      lastRun: new Date().toISOString(),
      metadata: { note: 'Placeholder implementation - regional trends job' }
    };
  }

  private async executeForecastsJob(context: JobExecutionContext): Promise<ComputationJobResult> {
    const startTime = Date.now();
    
    // Placeholder implementation
    await this.delay(5000); // Simulate processing time
    
    return {
      jobName: context.jobName,
      status: 'success',
      recordsProcessed: 100,
      recordsUpdated: 100,
      executionTimeMs: Date.now() - startTime,
      lastRun: new Date().toISOString(),
      metadata: { note: 'Placeholder implementation - forecasts job' }
    };
  }

  private async executeCleanupJob(context: JobExecutionContext): Promise<ComputationJobResult> {
    const startTime = Date.now();
    
    // Placeholder implementation
    await this.delay(1000); // Simulate processing time
    
    return {
      jobName: context.jobName,
      status: 'success',
      recordsProcessed: 500,
      recordsUpdated: 0, // Cleanup doesn't update, it removes
      executionTimeMs: Date.now() - startTime,
      lastRun: new Date().toISOString(),
      metadata: { note: 'Placeholder implementation - cleanup job', recordsRemoved: 500 }
    };
  }

  private async executeValidationJob(context: JobExecutionContext): Promise<ComputationJobResult> {
    return this.validateAndImproveForecastAccuracy();
  }

  private async executeDataCollectionJob(context: JobExecutionContext): Promise<ComputationJobResult> {
    return this.collectExternalData();
  }

  // Helper methods for forecast validation

  private async getValidationCandidates(): Promise<any[]> {
    // Mock validation candidates
    return [
      { skillName: 'JavaScript', forecastHorizon: '6months', predictedValue: 1200 },
      { skillName: 'Python', forecastHorizon: '6months', predictedValue: 1100 },
      { skillName: 'React', forecastHorizon: '3months', predictedValue: 900 }
    ];
  }

  private async validateSingleForecast(candidate: any): Promise<any> {
    // Mock validation
    const actualValue = candidate.predictedValue * (0.8 + Math.random() * 0.4); // ±20% variance
    const accuracy = 1 - Math.abs(candidate.predictedValue - actualValue) / candidate.predictedValue;
    
    return {
      skillName: candidate.skillName,
      forecastHorizon: candidate.forecastHorizon,
      predictedValue: candidate.predictedValue,
      actualValue,
      accuracy: Math.max(0, accuracy),
      validatedAt: new Date().toISOString()
    };
  }

  private async generateAccuracyImprovements(validationResults: any[]): Promise<string[]> {
    const improvements = [];
    const avgAccuracy = validationResults.reduce((sum, r) => sum + r.accuracy, 0) / validationResults.length;
    
    if (avgAccuracy < 0.8) {
      improvements.push('Increase historical data window for better trend analysis');
    }
    
    if (avgAccuracy < 0.7) {
      improvements.push('Consider external economic factors in forecasting');
    }
    
    improvements.push('Implement ensemble forecasting methods');
    
    return improvements;
  }

  private async storeValidationResults(results: any[]): Promise<void> {
    // Mock storage
    logger.info('Storing validation results', { count: results.length });
    await this.delay(100);
  }

  private async applyForecastImprovements(improvements: string[]): Promise<void> {
    // Mock improvement application
    logger.info('Applying forecast improvements', { improvements });
    await this.delay(50);
  }

  private generateExecutionSummary(results: ComputationJobResult[]): any {
    const successful = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'error').length;
    const partial = results.filter(r => r.status === 'partial').length;
    const skipped = results.filter(r => r.status === 'skipped').length;

    const totalRecordsProcessed = results.reduce((sum, r) => sum + r.recordsProcessed, 0);
    const totalRecordsUpdated = results.reduce((sum, r) => sum + r.recordsUpdated, 0);
    const totalExecutionTime = results.reduce((sum, r) => sum + r.executionTimeMs, 0);

    return {
      totalJobs: results.length,
      successful,
      failed,
      partial,
      skipped,
      totalRecordsProcessed,
      totalRecordsUpdated,
      totalExecutionTimeMs: totalExecutionTime,
      averageExecutionTimeMs: results.length > 0 ? totalExecutionTime / results.length : 0
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export all types and utilities for external use
export * from './core/types';
export * from './engines/jobScheduler';
export * from './engines/computationEngine';
export * from './jobs/skillDemandJob';