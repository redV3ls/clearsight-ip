/**
 * Job Scheduler Engine
 * 
 * Manages job scheduling, execution, and monitoring for trend computation jobs.
 * Handles dependencies, retries, and concurrent execution limits.
 */

import { logger } from '../../../utils/logger';
import { 
  TrendComputationConfig,
  ComputationJobResult,
  JobExecutionContext,
  JobSchedule,
  ComputationMetrics,
  TrendComputationState,
  JobType,
  JobPriority,
  ComputationError,
  DEFAULT_JOB_SCHEDULES
} from '../core/types';

export class JobScheduler {
  private isRunning: boolean = false;
  private currentJobs: Map<string, JobExecutionContext> = new Map();
  private jobQueue: string[] = [];
  private completedJobs: Set<string> = new Set();
  private failedJobs: Set<string> = new Set();
  private jobMetrics: Map<string, ComputationMetrics> = new Map();
  private schedules: Map<string, JobSchedule> = new Map();

  constructor() {
    this.initializeSchedules();
  }

  /**
   * Runs all enabled jobs according to configuration
   */
  async runAllJobs(
    config: TrendComputationConfig,
    jobExecutors: Map<string, (context: JobExecutionContext) => Promise<ComputationJobResult>>
  ): Promise<ComputationJobResult[]> {
    if (this.isRunning) {
      throw new Error('Job scheduler is already running');
    }

    this.isRunning = true;
    const results: ComputationJobResult[] = [];

    try {
      logger.info('Starting job scheduler with configuration', { 
        enabledJobs: config.enabledJobs,
        maxConcurrentJobs: config.maxConcurrentJobs 
      });

      // Reset state
      this.resetState();

      // Build execution plan
      const executionPlan = this.buildExecutionPlan(config.enabledJobs);
      logger.info('Job execution plan created', { 
        totalJobs: executionPlan.length,
        jobOrder: executionPlan 
      });

      // Execute jobs according to plan
      for (const batch of this.createExecutionBatches(executionPlan, config.maxConcurrentJobs || 3)) {
        const batchResults = await this.executeBatch(batch, config, jobExecutors);
        results.push(...batchResults);

        // Check if any critical jobs failed
        const criticalFailures = batchResults.filter(r => 
          r.status === 'error' && this.getJobPriority(r.jobName) === JobPriority.CRITICAL
        );

        if (criticalFailures.length > 0) {
          logger.error('Critical job failures detected, stopping execution', {
            failedJobs: criticalFailures.map(r => r.jobName)
          });
          break;
        }
      }

      // Update metrics
      this.updateJobMetrics(results);

      // Log summary
      const summary = this.generateExecutionSummary(results);
      logger.info('Job execution completed', summary);

      return results;

    } catch (error) {
      logger.error('Job scheduler execution failed', error);
      throw error;
    } finally {
      this.isRunning = false;
      this.currentJobs.clear();
    }
  }

  /**
   * Runs a single job with proper context and error handling
   */
  async runSingleJob(
    jobName: string,
    config: TrendComputationConfig,
    executor: (context: JobExecutionContext) => Promise<ComputationJobResult>,
    retryCount: number = 0
  ): Promise<ComputationJobResult> {
    const startTime = Date.now();
    
    const context: JobExecutionContext = {
      jobName,
      config,
      startTime,
      retryCount,
      dependencies: this.getJobDependencies(jobName)
    };

    this.currentJobs.set(jobName, context);

    try {
      logger.info(`Starting job execution: ${jobName}`, { 
        retryCount,
        dependencies: context.dependencies 
      });

      // Check dependencies
      const dependenciesResult = this.checkDependencies(jobName);
      if (!dependenciesResult.satisfied) {
        throw new Error(`Dependencies not satisfied: ${dependenciesResult.missing.join(', ')}`);
      }

      // Execute job with timeout
      const timeoutMs = config.jobTimeout || 3600000; // 1 hour default
      const result = await this.executeWithTimeout(executor(context), timeoutMs);

      // Validate result
      this.validateJobResult(result);

      // Mark as completed
      this.completedJobs.add(jobName);
      
      logger.info(`Job completed successfully: ${jobName}`, {
        executionTime: result.executionTimeMs,
        recordsProcessed: result.recordsProcessed,
        recordsUpdated: result.recordsUpdated
      });

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Job failed: ${jobName}`, { error: errorMessage, retryCount });

      // Handle retries
      if (retryCount < (config.retryAttempts || 3)) {
        const delay = this.calculateRetryDelay(retryCount);
        logger.info(`Retrying job ${jobName} in ${delay}ms`, { retryCount: retryCount + 1 });
        
        await this.delay(delay);
        return this.runSingleJob(jobName, config, executor, retryCount + 1);
      }

      // Mark as failed
      this.failedJobs.add(jobName);

      const failedResult: ComputationJobResult = {
        jobName,
        status: 'error',
        recordsProcessed: 0,
        recordsUpdated: 0,
        executionTimeMs: Date.now() - startTime,
        errors: [errorMessage],
        lastRun: new Date().toISOString()
      };

      return failedResult;

    } finally {
      this.currentJobs.delete(jobName);
    }
  }

  /**
   * Gets the current state of the job scheduler
   */
  getState(): TrendComputationState {
    return {
      isRunning: this.isRunning,
      currentJob: Array.from(this.currentJobs.keys())[0],
      queuedJobs: [...this.jobQueue],
      completedJobs: Array.from(this.completedJobs),
      failedJobs: Array.from(this.failedJobs),
      startTime: this.isRunning ? new Date().toISOString() : undefined
    };
  }

  /**
   * Gets job metrics for monitoring
   */
  getJobMetrics(): Map<string, ComputationMetrics> {
    return new Map(this.jobMetrics);
  }

  /**
   * Gets job schedules
   */
  getJobSchedules(): Map<string, JobSchedule> {
    return new Map(this.schedules);
  }

  /**
   * Updates job schedule
   */
  updateJobSchedule(jobName: string, schedule: Partial<JobSchedule>): void {
    const existing = this.schedules.get(jobName);
    if (existing) {
      this.schedules.set(jobName, { ...existing, ...schedule });
      logger.info(`Updated schedule for job: ${jobName}`, schedule);
    } else {
      logger.warn(`Attempted to update non-existent job schedule: ${jobName}`);
    }
  }

  // Private methods

  /**
   * Initializes default job schedules
   */
  private initializeSchedules(): void {
    for (const schedule of DEFAULT_JOB_SCHEDULES) {
      this.schedules.set(schedule.jobName, schedule);
    }

    // Initialize metrics
    for (const jobName of Object.values(JobType)) {
      this.jobMetrics.set(jobName, {
        jobName,
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        averageExecutionTime: 0,
        lastExecutionTime: 0,
        averageRecordsProcessed: 0,
        errorRate: 0
      });
    }

    logger.info(`Initialized ${this.schedules.size} job schedules`);
  }

  /**
   * Resets scheduler state
   */
  private resetState(): void {
    this.jobQueue = [];
    this.completedJobs.clear();
    this.failedJobs.clear();
    this.currentJobs.clear();
  }

  /**
   * Builds execution plan considering dependencies
   */
  private buildExecutionPlan(enabledJobs: string[]): string[] {
    const plan: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (jobName: string): void => {
      if (visiting.has(jobName)) {
        throw new Error(`Circular dependency detected involving job: ${jobName}`);
      }

      if (visited.has(jobName)) {
        return;
      }

      visiting.add(jobName);

      // Visit dependencies first
      const dependencies = this.getJobDependencies(jobName);
      for (const dep of dependencies) {
        if (enabledJobs.includes(dep)) {
          visit(dep);
        }
      }

      visiting.delete(jobName);
      visited.add(jobName);
      plan.push(jobName);
    };

    // Visit all enabled jobs
    for (const jobName of enabledJobs) {
      if (!visited.has(jobName)) {
        visit(jobName);
      }
    }

    return plan;
  }

  /**
   * Creates execution batches for parallel processing
   */
  private createExecutionBatches(executionPlan: string[], maxConcurrent: number): string[][] {
    const batches: string[][] = [];
    const dependencyMap = new Map<string, string[]>();

    // Build dependency map
    for (const jobName of executionPlan) {
      dependencyMap.set(jobName, this.getJobDependencies(jobName));
    }

    const remaining = new Set(executionPlan);
    const completed = new Set<string>();

    while (remaining.size > 0) {
      const batch: string[] = [];

      // Find jobs that can run (dependencies satisfied)
      for (const jobName of remaining) {
        const dependencies = dependencyMap.get(jobName) || [];
        const canRun = dependencies.every(dep => completed.has(dep) || !remaining.has(dep));

        if (canRun && batch.length < maxConcurrent) {
          batch.push(jobName);
        }
      }

      if (batch.length === 0) {
        throw new Error('Unable to create execution batch - possible dependency deadlock');
      }

      // Remove from remaining and add to completed
      for (const jobName of batch) {
        remaining.delete(jobName);
        completed.add(jobName);
      }

      batches.push(batch);
    }

    return batches;
  }

  /**
   * Executes a batch of jobs in parallel
   */
  private async executeBatch(
    batch: string[],
    config: TrendComputationConfig,
    jobExecutors: Map<string, (context: JobExecutionContext) => Promise<ComputationJobResult>>
  ): Promise<ComputationJobResult[]> {
    logger.info(`Executing job batch`, { jobs: batch, batchSize: batch.length });

    const promises = batch.map(async (jobName) => {
      const executor = jobExecutors.get(jobName);
      if (!executor) {
        throw new Error(`No executor found for job: ${jobName}`);
      }

      return this.runSingleJob(jobName, config, executor);
    });

    const results = await Promise.allSettled(promises);
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        const jobName = batch[index];
        logger.error(`Job batch execution failed for ${jobName}`, result.reason);
        
        return {
          jobName,
          status: 'error' as const,
          recordsProcessed: 0,
          recordsUpdated: 0,
          executionTimeMs: 0,
          errors: [result.reason?.message || 'Unknown error'],
          lastRun: new Date().toISOString()
        };
      }
    });
  }

  /**
   * Checks if job dependencies are satisfied
   */
  private checkDependencies(jobName: string): { satisfied: boolean; missing: string[] } {
    const dependencies = this.getJobDependencies(jobName);
    const missing = dependencies.filter(dep => !this.completedJobs.has(dep));

    return {
      satisfied: missing.length === 0,
      missing
    };
  }

  /**
   * Gets job dependencies from schedule
   */
  private getJobDependencies(jobName: string): string[] {
    const schedule = this.schedules.get(jobName);
    return schedule?.dependencies || [];
  }

  /**
   * Gets job priority from schedule
   */
  private getJobPriority(jobName: string): JobPriority {
    const schedule = this.schedules.get(jobName);
    return schedule?.priority || JobPriority.NORMAL;
  }

  /**
   * Executes a promise with timeout
   */
  private async executeWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Job execution timeout')), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  /**
   * Calculates retry delay with exponential backoff
   */
  private calculateRetryDelay(retryCount: number): number {
    const baseDelay = 1000; // 1 second
    const maxDelay = 300000; // 5 minutes
    const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
    
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000;
  }

  /**
   * Validates job result structure
   */
  private validateJobResult(result: ComputationJobResult): void {
    if (!result.jobName) {
      throw new Error('Job result missing jobName');
    }

    if (!['success', 'error', 'partial', 'skipped'].includes(result.status)) {
      throw new Error(`Invalid job status: ${result.status}`);
    }

    if (typeof result.recordsProcessed !== 'number' || result.recordsProcessed < 0) {
      throw new Error('Invalid recordsProcessed value');
    }

    if (typeof result.executionTimeMs !== 'number' || result.executionTimeMs < 0) {
      throw new Error('Invalid executionTimeMs value');
    }
  }

  /**
   * Updates job metrics based on results
   */
  private updateJobMetrics(results: ComputationJobResult[]): void {
    for (const result of results) {
      const metrics = this.jobMetrics.get(result.jobName);
      if (!metrics) continue;

      metrics.totalRuns++;
      metrics.lastExecutionTime = result.executionTimeMs;

      if (result.status === 'success') {
        metrics.successfulRuns++;
      } else if (result.status === 'error') {
        metrics.failedRuns++;
        metrics.lastError = result.errors?.[0];
      }

      // Update averages
      metrics.averageExecutionTime = 
        (metrics.averageExecutionTime * (metrics.totalRuns - 1) + result.executionTimeMs) / 
        metrics.totalRuns;

      metrics.averageRecordsProcessed = 
        (metrics.averageRecordsProcessed * (metrics.totalRuns - 1) + result.recordsProcessed) / 
        metrics.totalRuns;

      metrics.errorRate = metrics.failedRuns / metrics.totalRuns;

      if (result.status === 'success') {
        metrics.lastSuccess = result.lastRun;
      }
    }
  }

  /**
   * Generates execution summary
   */
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

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}