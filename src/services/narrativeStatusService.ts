/**
 * Narrative Analysis Status Service
 * Handles status tracking and transitions for narrative CV analysis
 */

import { enhancedLogger } from '../utils/enhancedLogger';
import { NarrativeKVCache } from './narrativeKVCache';
import { NarrativeAnalysisService } from './narrativeAnalysisService';
import { createDatabase } from '../config/database';

export type NarrativeStatus = 'processing' | 'completed' | 'failed';

export interface NarrativeStatusInfo {
  analysisId: string;
  userId: string;
  status: NarrativeStatus;
  progress?: number; // 0-100
  message?: string;
  estimatedCompletion?: string;
  wordCount?: number;
  analysisType?: 'standalone' | 'job-comparison';
  error?: {
    code: string;
    message: string;
    userMessage: string;
    retryable: boolean;
  };
  timestamps: {
    created: string;
    lastUpdated: string;
    completed?: string;
  };
  metadata?: {
    processingTime?: number;
    source: 'cache' | 'database' | 'processing';
  };
}

export class NarrativeStatusService {
  private cache: NarrativeKVCache;
  private dbService: NarrativeAnalysisService;

  constructor(private env: any) {
    this.cache = new NarrativeKVCache(env);
    const database = createDatabase(env.DB);
    this.dbService = new NarrativeAnalysisService(database);
  }

  /**
   * Get comprehensive status for an analysis
   */
  async getAnalysisStatus(analysisId: string, userId: string): Promise<NarrativeStatusInfo | null> {
    try {
      // Try cache first (fastest)
      const cachedEntry = await this.cache.getAnalysis(analysisId);
      if (cachedEntry && cachedEntry.userId === userId) {
        return this.formatStatusFromCache(cachedEntry);
      }

      // Try database
      const dbEntry = await this.dbService.getById(analysisId, userId);
      if (dbEntry) {
        return this.formatStatusFromDatabase(dbEntry);
      }

      // Not found
      return null;
    } catch (error) {
      enhancedLogger.error('Failed to get analysis status', error, { analysisId, userId });
      return null;
    }
  }

  /**
   * Update analysis status during processing
   */
  async updateProcessingStatus(
    analysisId: string, 
    userId: string, 
    progress: number, 
    message?: string
  ): Promise<boolean> {
    try {
      // Only update cache for processing status (don't waste DB operations)
      const statusInfo: NarrativeStatusInfo = {
        analysisId,
        userId,
        status: 'processing',
        progress: Math.min(100, Math.max(0, progress)),
        message: message || this.getProgressMessage(progress),
        estimatedCompletion: this.calculateEstimatedCompletion(progress),
        timestamps: {
          created: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        },
        metadata: {
          source: 'processing'
        }
      };

      // Store in cache with short TTL
      const success = await this.cache.storeProcessingStatus(analysisId, userId);
      
      if (success) {
        enhancedLogger.debug('Processing status updated', {
          analysisId,
          progress,
          message
        });
      }

      return success;
    } catch (error) {
      enhancedLogger.warn('Failed to update processing status', { error, analysisId });
      return false;
    }
  }

  /**
   * Mark analysis as completed
   */
  async markCompleted(
    analysisId: string,
    userId: string,
    narrative: string,
    analysisType: 'standalone' | 'job-comparison',
    wordCount: number,
    processingTime?: number
  ): Promise<boolean> {
    try {
      const completedEntry = {
        analysisId,
        userId,
        narrative,
        analysisType,
        wordCount,
        status: 'completed' as const,
        timestamp: new Date().toISOString(),
        processingTime
      };

      // Store in cache
      await this.cache.storeAnalysis(completedEntry);

      enhancedLogger.info('Analysis marked as completed', {
        analysisId,
        wordCount,
        analysisType,
        processingTime
      });

      return true;
    } catch (error) {
      enhancedLogger.error('Failed to mark analysis as completed', error, { analysisId });
      return false;
    }
  }

  /**
   * Mark analysis as failed
   */
  async markFailed(
    analysisId: string,
    userId: string,
    errorCode: string,
    errorMessage: string,
    userMessage: string,
    retryable: boolean = true
  ): Promise<boolean> {
    try {
      const failedEntry = {
        analysisId,
        userId,
        narrative: `Analysis failed: ${userMessage}`,
        analysisType: 'standalone' as const,
        wordCount: 0,
        status: 'failed' as const,
        timestamp: new Date().toISOString(),
        error: errorMessage
      };

      // Store in cache
      await this.cache.storeAnalysis(failedEntry);

      enhancedLogger.info('Analysis marked as failed', {
        analysisId,
        errorCode,
        userMessage,
        retryable
      });

      return true;
    } catch (error) {
      enhancedLogger.error('Failed to mark analysis as failed', error, { analysisId });
      return false;
    }
  }

  /**
   * Check if analysis is retryable based on error type
   */
  isRetryable(errorCode: string): boolean {
    const nonRetryableErrors = [
      'CONTENT_PROCESSING_ERROR',
      'INVALID_RESUME_FORMAT',
      'CONTENT_TOO_LARGE'
    ];

    return !nonRetryableErrors.includes(errorCode);
  }

  /**
   * Get user-friendly progress message
   */
  private getProgressMessage(progress: number): string {
    if (progress < 20) return 'Analyzing resume content...';
    if (progress < 40) return 'Extracting career insights...';
    if (progress < 60) return 'Generating narrative analysis...';
    if (progress < 80) return 'Finalizing career recommendations...';
    if (progress < 95) return 'Completing analysis...';
    return 'Almost ready...';
  }

  /**
   * Calculate estimated completion time
   */
  private calculateEstimatedCompletion(progress: number): string {
    const baseTime = 45; // 45 seconds base estimate
    const remainingProgress = 100 - progress;
    const estimatedSeconds = Math.round((remainingProgress / 100) * baseTime);
    
    const completionTime = new Date(Date.now() + estimatedSeconds * 1000);
    return completionTime.toISOString();
  }

  /**
   * Format status from cache entry
   */
  private formatStatusFromCache(entry: any): NarrativeStatusInfo {
    return {
      analysisId: entry.analysisId,
      userId: entry.userId,
      status: entry.status,
      wordCount: entry.wordCount,
      analysisType: entry.analysisType,
      error: entry.error ? {
        code: 'CACHED_ERROR',
        message: entry.error,
        userMessage: entry.error,
        retryable: true
      } : undefined,
      timestamps: {
        created: entry.timestamp,
        lastUpdated: entry.timestamp,
        completed: entry.status === 'completed' ? entry.timestamp : undefined
      },
      metadata: {
        processingTime: entry.processingTime,
        source: 'cache'
      }
    };
  }

  /**
   * Format status from database entry
   */
  private formatStatusFromDatabase(entry: any): NarrativeStatusInfo {
    return {
      analysisId: entry.id,
      userId: entry.userId,
      status: 'completed', // Database entries are always completed
      wordCount: entry.wordCount,
      analysisType: entry.analysisType,
      timestamps: {
        created: entry.createdAt,
        lastUpdated: entry.updatedAt,
        completed: entry.createdAt
      },
      metadata: {
        processingTime: entry.processingTimeMs,
        source: 'database'
      }
    };
  }

  /**
   * Clean up old processing statuses
   */
  async cleanupOldProcessingStatuses(userId: string): Promise<number> {
    try {
      // This would require tracking processing statuses separately
      // For now, we rely on TTL in cache
      enhancedLogger.debug('Cleanup requested for old processing statuses', { userId });
      return 0;
    } catch (error) {
      enhancedLogger.warn('Failed to cleanup old processing statuses', { error, userId });
      return 0;
    }
  }

  /**
   * Get status statistics for monitoring
   */
  async getStatusStats(): Promise<{
    processing: number;
    completed: number;
    failed: number;
    averageProcessingTime: number;
  }> {
    try {
      // This would require maintaining counters
      // For now, return basic stats
      return {
        processing: 0,
        completed: 0,
        failed: 0,
        averageProcessingTime: 0
      };
    } catch (error) {
      enhancedLogger.warn('Failed to get status stats', { error });
      return {
        processing: 0,
        completed: 0,
        failed: 0,
        averageProcessingTime: 0
      };
    }
  }
}