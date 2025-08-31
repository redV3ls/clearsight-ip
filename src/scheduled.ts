import { Env } from './index';
import { JobScheduler } from './services/jobScheduler';
import { DataRetentionService } from './services/dataRetentionService';
import { NarrativeKVCache } from './services/narrativeKVCache';
import { kvStorage } from './utils/kvStorage';
import { logger } from './utils/logger';

export interface ScheduledEvent {
  scheduledTime: number;
  cron: string;
}

/**
 * Scheduled handler for processing async jobs and data retention
 * Runs every 5 minutes based on wrangler.toml configuration
 */
export default async function scheduled(
  event: ScheduledEvent,
  env: Env,
  ctx: ExecutionContext
): Promise<void> {
  const startTime = Date.now();
  
  logger.info(`Scheduled tasks started at ${new Date(event.scheduledTime).toISOString()}`);
  
  try {
    // Run monitoring and health checks first
    await runMonitoringTasks(env);

    // Run once-a-day cleanup for stale analyses
    await maybeRunDailyStaleAnalysisCleanup(env);
    
    // Run data retention purging
    await runDataRetentionPurge(env);
    
    // Clean up expired password reset tokens
    await cleanupPasswordResetTokens(env);
    
    // Process GDPR deletion requests
    await processGDPRDeletionRequests(env);
    
    // Clean up expired rate limit entries
    await cleanupRateLimitEntries(env);
    
    // Then process async jobs
    // Create job scheduler with appropriate configuration
    const scheduler = new JobScheduler(env, {
      maxConcurrentJobs: 10, // Process up to 10 jobs concurrently
      pollInterval: 1000, // Check for new jobs every second during this run
    });

    // Process jobs for a maximum of 4 minutes (leaving 1 minute buffer)
    const maxRunTime = 4 * 60 * 1000; // 4 minutes
    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => {
        logger.info('Scheduled job processor timeout reached');
        resolve();
      }, maxRunTime);
    });

    // Start the scheduler
    const schedulerPromise = scheduler.start();

    // Wait for either timeout or natural completion
    await Promise.race([schedulerPromise, timeoutPromise]);

    // Stop the scheduler gracefully
    await scheduler.stop();

    // Get and log statistics
    const stats = await scheduler.getStats();
    const duration = Date.now() - startTime;

    logger.info('Scheduled tasks completed', {
      duration,
      jobStats: {
        totalProcessed: stats.totalProcessed,
        totalFailed: stats.totalFailed,
        currentQueueSize: stats.currentQueueSize,
        jobsByType: stats.jobsByType,
        jobsByStatus: stats.jobsByStatus,
      },
    });

    // Store metrics for monitoring (disabled to avoid KV quota)
    // await storeScheduledRunMetrics(env, {
    //   timestamp: event.scheduledTime,
    //   duration,
    //   jobsProcessed: stats.totalProcessed,
    //   jobsFailed: stats.totalFailed,
    //   queueSize: stats.currentQueueSize,
    // });

  } catch (error) {
    logger.error('Scheduled tasks error:', error);
    
    // Store error metrics (disabled to avoid KV quota)
    // await storeScheduledRunMetrics(env, {
    //   timestamp: event.scheduledTime,
    //   duration: Date.now() - startTime,
    //   error: error instanceof Error ? error.message : 'Unknown error',
    // });
  }
}

/**
 * Run stale analysis cleanup at most once per day
 */
async function maybeRunDailyStaleAnalysisCleanup(env: Env): Promise<void> {
  try {
    const key = 'cleanup:stale_analyses:last_run';
    const lastRun = await env.CACHE.get(key);
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (lastRun) {
      const last = Date.parse(lastRun);
      if (!isNaN(last) && (now - last) < oneDayMs) {
        // Skip: already ran within 24h
        return;
      }
    }

    await cleanupStaleAnalyses(env);

    // Record run time
    await env.CACHE.put(key, new Date(now).toISOString(), { expirationTtl: 31 * 24 * 60 * 60 });
  } catch (error) {
    logger.error('Failed daily stale analysis cleanup gating', error);
  }
}

/**
 * Delete analyses stuck in processing/undefined for >10 minutes
 */
async function cleanupStaleAnalyses(env: Env): Promise<void> {
  const start = Date.now();
  const cutoffMs = 10 * 60 * 1000; // 10 minutes
  const cutoffIso = new Date(Date.now() - cutoffMs).toISOString();

  logger.info('Starting stale analyses cleanup', { cutoffIso });

  try {
    const pageSize = 500;
    let offset = 0;
    let totalChecked = 0;
    let totalDeleted = 0;

    // Loop in pages to avoid large queries
    while (true) {
      const rows = await env.DB
        .prepare(`
          SELECT id, user_id, created_at, analysis_data
          FROM resume_analyses
          WHERE created_at < ?
          ORDER BY created_at ASC
          LIMIT ? OFFSET ?
        `)
        .bind(cutoffIso, pageSize, offset)
        .all() as any;

      const results = rows.results || [];
      if (results.length === 0) break;

      for (const row of results) {
        totalChecked++;
        let data: any = null;
        try { data = row.analysis_data ? JSON.parse(row.analysis_data) : null; } catch { data = null; }

        const rawStatus = (data?.status ?? '').toString();
        const statusLc = rawStatus ? rawStatus.toLowerCase() : '';
        const hasNarrative = Boolean(data?.narrative);

        // Consider stale if status is processing/undefined/unknown/empty and no narrative present
        const isStaleStatus = (
          statusLc === 'processing' ||
          statusLc === 'undefined' ||
          statusLc === 'unknown' ||
          statusLc === '' ||
          statusLc === 'null'
        );

        if (isStaleStatus && !hasNarrative) {
          // Delete from legacy and narrative tables, and clear caches
          try {
            const delLegacy = await env.DB
              .prepare('DELETE FROM resume_analyses WHERE id = ?')
              .bind(row.id)
              .run();

            // Best-effort delete from narrative table if any partial record exists
            await env.DB
              .prepare('DELETE FROM narrative_analysis WHERE id = ?')
              .bind(row.id)
              .run();

            // Clear KV caches
            const kv = new NarrativeKVCache(env);
            await kv.deleteAnalysis(row.id).catch(() => {});
            kvStorage.setEnv(env);
            await kvStorage.delete(`resume:${row.id}`).catch(() => {});

            const changes = (delLegacy?.changes || delLegacy?.meta?.changes || 0);
            if (changes > 0) totalDeleted++;
          } catch (delErr) {
            logger.warn('Failed to delete stale analysis', { id: row.id, error: delErr instanceof Error ? delErr.message : String(delErr) });
          }
        }
      }

      // Next page
      offset += results.length;
      if (results.length < pageSize) break;
    }

    const duration = Date.now() - start;
    logger.info('Stale analyses cleanup complete', { duration, totalChecked, totalDeleted });
    await env.CACHE.put('cleanup:stale_analyses:last_result', JSON.stringify({
      ranAt: new Date().toISOString(),
      duration,
      totalChecked,
      totalDeleted
    }), { expirationTtl: 30 * 24 * 60 * 60 });
  } catch (error) {
    logger.error('Stale analyses cleanup failed', error);
  }
}

/**
 * Store metrics about scheduled runs for monitoring
 */
async function storeScheduledRunMetrics(
  env: Env,
  metrics: any
): Promise<void> {
  try {
    if (!env.CACHE) {
      logger.error('CACHE binding not available for storing scheduled run metrics');
      return;
    }

    const key = `scheduled_run:${new Date(metrics.timestamp).toISOString()}`;
    await env.CACHE.put(key, JSON.stringify(metrics), {
      expirationTtl: 86400 * 7, // Keep for 7 days
    });

    // Update last run info
    await env.CACHE.put('scheduled_run:last', JSON.stringify({
      ...metrics,
      completedAt: new Date().toISOString(),
    }));
  } catch (error) {
    logger.error('Failed to store scheduled run metrics:', error);
  }
}

/**
 * Clean up expired password reset tokens
 */
async function cleanupPasswordResetTokens(env: Env): Promise<void> {
  const startTime = Date.now();
  logger.info('Starting password reset token cleanup');
  
  try {
    const { SecurePasswordResetService } = await import('./services/passwordResetService');
    const { DatabaseManager } = await import('./config/database');
    
    const db = DatabaseManager.initialize(env.DB);
    const resetService = new SecurePasswordResetService(db);
    
    await resetService.cleanupExpiredTokens();
    
    const duration = Date.now() - startTime;
    logger.info('Password reset token cleanup completed', { duration });
    
  } catch (error) {
    logger.error('Password reset token cleanup failed:', error);
  }
}

/**
 * Process GDPR deletion requests
 */
async function processGDPRDeletionRequests(env: Env): Promise<void> {
  const startTime = Date.now();
  logger.info('Starting GDPR deletion request processing');
  
  try {
    const { SecureGDPRDeletionService } = await import('./services/gdprDeletionService');
    const { DatabaseManager } = await import('./config/database');
    
    const db = DatabaseManager.initialize(env.DB);
    const deletionService = new SecureGDPRDeletionService(db, env);
    
    await deletionService.cleanupExpiredRequests();
    
    const duration = Date.now() - startTime;
    logger.info('GDPR deletion request processing completed', { duration });
    
  } catch (error) {
    logger.error('GDPR deletion request processing failed:', error);
  }
}

/**
 * Clean up expired rate limit entries
 */
async function cleanupRateLimitEntries(env: Env): Promise<void> {
  const startTime = Date.now();
  logger.info('Starting rate limit cleanup');
  
  try {
    const { ProductionRateLimiterService } = await import('./services/productionRateLimiter');
    
    const rateLimiter = new ProductionRateLimiterService(env);
    await rateLimiter.cleanupExpiredEntries();
    
    const duration = Date.now() - startTime;
    logger.info('Rate limit cleanup completed', { duration });
    
  } catch (error) {
    logger.error('Rate limit cleanup failed:', error);
  }
}

/**
 * Run data retention purging
 */
async function runDataRetentionPurge(env: Env): Promise<void> {
  const startTime = Date.now();
  logger.info('Starting data retention purge');
  
  try {
    // Purge KV-based data per policies
    const retentionService = new DataRetentionService(env);
    const kvResults = await retentionService.purgeExpiredData();

    // Purge D1 data by age (analyses and comparisons)
    const d1Results = await purgeOldD1Records(env);
    
    const duration = Date.now() - startTime;
    logger.info('Data retention purge completed', {
      duration,
      kvResults,
      d1Results,
    });
    
    // Store retention metrics
    await env.CACHE.put('retention:last_run', JSON.stringify({
      timestamp: new Date().toISOString(),
      duration,
      kvResults,
      d1Results,
    }), {
      expirationTtl: 86400 * 30, // Keep for 30 days
    });
  } catch (error) {
    logger.error('Data retention purge failed:', error);
    throw error;
  }
}

/**
 * Purge D1 tables by age thresholds
 */
async function purgeOldD1Records(env: Env): Promise<any> {
  const { getD1RetentionConfig } = await import('./config/dataRetention');
  const config = getD1RetentionConfig(env);

  const now = Date.now();
  const cutoffs = {
    narrative: new Date(now - config.narrativeDays * 24 * 60 * 60 * 1000).toISOString(),
    resume: new Date(now - config.resumeDays * 24 * 60 * 60 * 1000).toISOString(),
    jobAnalyses: new Date(now - config.jobAnalysesDays * 24 * 60 * 60 * 1000).toISOString(),
    jobComparisons: new Date(now - config.jobComparisonsDays * 24 * 60 * 60 * 1000).toISOString(),
  };

  const stats = { narrativeDeleted: 0, resumeDeleted: 0, jobAnalysesDeleted: 0, jobComparisonsDeleted: 0 } as any;

  try {
    // narrative_analysis
    const delNarr = await env.DB.prepare('DELETE FROM narrative_analysis WHERE created_at < ?')
      .bind(cutoffs.narrative)
      .run();
    stats.narrativeDeleted = (delNarr as any)?.changes || (delNarr as any)?.meta?.changes || 0;
  } catch (e) {
    logger.warn('D1 purge: narrative_analysis failed', { error: e instanceof Error ? e.message : String(e) });
  }

  try {
    // resume_analyses
    const delRes = await env.DB.prepare('DELETE FROM resume_analyses WHERE created_at < ?')
      .bind(cutoffs.resume)
      .run();
    stats.resumeDeleted = (delRes as any)?.changes || (delRes as any)?.meta?.changes || 0;
  } catch (e) {
    logger.warn('D1 purge: resume_analyses failed', { error: e instanceof Error ? e.message : String(e) });
  }

  try {
    // job_analyses
    const delJA = await env.DB.prepare('DELETE FROM job_analyses WHERE created_at < ?')
      .bind(cutoffs.jobAnalyses)
      .run();
    stats.jobAnalysesDeleted = (delJA as any)?.changes || (delJA as any)?.meta?.changes || 0;
  } catch (e) {
    logger.warn('D1 purge: job_analyses failed', { error: e instanceof Error ? e.message : String(e) });
  }

  try {
    // job_comparisons
    const delJC = await env.DB.prepare('DELETE FROM job_comparisons WHERE created_at < ?')
      .bind(cutoffs.jobComparisons)
      .run();
    stats.jobComparisonsDeleted = (delJC as any)?.changes || (delJC as any)?.meta?.changes || 0;
  } catch (e) {
    logger.warn('D1 purge: job_comparisons failed', { error: e instanceof Error ? e.message : String(e) });
  }

  return { config, cutoffs, stats };
}

/**
 * Run monitoring and health check tasks
 */
async function runMonitoringTasks(env: Env): Promise<void> {
  const startTime = Date.now();
  logger.info('Starting monitoring tasks');
  
  try {
    // Check performance thresholds
    const { PerformanceMetricsService } = await import('./services/performanceMetrics');
    const performanceService = new PerformanceMetricsService(env);
    await performanceService.checkPerformanceThresholds();
    
    // Clean up old errors and logs
    const { ErrorTrackingService } = await import('./services/errorTracking');
    const errorTracking = new ErrorTrackingService(env);
    const clearedErrors = await errorTracking.clearOldErrors(7); // Keep 7 days
    
    const { LoggingService } = await import('./services/logging');
    const logging = new LoggingService(env);
    const clearedLogs = await logging.cleanupOldLogs(7); // Keep 7 days
    
    // Perform health checks on critical services
    const { ErrorRecoveryService } = await import('./services/errorRecovery');
    const recoveryService = new ErrorRecoveryService(env);
    
    // Health check database
    const dbHealthy = await recoveryService.performHealthCheck('database', async () => {
      if (!env.DB) {
        throw new Error('DB binding not available');
      }
      await env.DB.prepare('SELECT 1').first();
      return true;
    });
    
    // Health check cache
    const cacheHealthy = await recoveryService.performHealthCheck('cache', async () => {
      const testKey = `health_${Date.now()}`;
      await env.CACHE.put(testKey, 'ok', { expirationTtl: 60 });
      const result = await env.CACHE.get(testKey);
      await env.CACHE.delete(testKey);
      return result === 'ok';
    });
    
    const duration = Date.now() - startTime;
    logger.info('Monitoring tasks completed', {
      duration,
      clearedErrors,
      clearedLogs,
      healthChecks: {
        database: dbHealthy,
        cache: cacheHealthy,
      },
    });
    
    // Store monitoring metrics
    await env.CACHE.put('monitoring:last_run', JSON.stringify({
      timestamp: new Date().toISOString(),
      duration,
      clearedErrors,
      clearedLogs,
      healthChecks: {
        database: dbHealthy,
        cache: cacheHealthy,
      },
    }), {
      expirationTtl: 86400 * 7, // Keep for 7 days
    });
    
  } catch (error) {
    logger.error('Monitoring tasks failed:', error);
    throw error;
  }
}

/**
 * Alternative implementation using Cloudflare Queues (requires paid plan)
 * This would be the preferred approach for production
 */
export async function handleQueueBatch(
  batch: MessageBatch,
  env: Env,
  ctx: ExecutionContext
): Promise<void> {
  logger.info(`Processing queue batch with ${batch.messages.length} messages`);

  for (const message of batch.messages) {
    try {
      // Process each message
      const job = message.body as any;
      
      // Use the job scheduler to process
      const scheduler = new JobScheduler(env);
      await scheduler.submitJob(
        job.type,
        job.userId,
        job.payload,
        {
          priority: job.priority,
          maxRetries: job.maxRetries,
        }
      );

      // Acknowledge successful processing
      message.ack();
    } catch (error) {
      logger.error(`Failed to process message ${message.id}:`, error);
      
      // Retry the message
      message.retry();
    }
  }
}

// Export types for Cloudflare Queues
interface MessageBatch {
  readonly queue: string;
  readonly messages: Message[];
}

interface Message {
  readonly id: string;
  readonly timestamp: Date;
  readonly body: any;
  ack(): void;
  retry(): void;
}
