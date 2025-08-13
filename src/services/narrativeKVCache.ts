/**
 * Narrative Analysis KV Cache Service
 * Optimized for Cloudflare Free Plan (100K operations/day)
 */

import { enhancedLogger } from '../utils/enhancedLogger';

export interface NarrativeCacheEntry {
  analysisId: string;
  userId: string;
  narrative: string;
  analysisType: 'standalone' | 'job-comparison';
  wordCount: number;
  status: 'processing' | 'completed' | 'failed';
  timestamp: string;
  processingTime?: number;
  error?: string;
}

export interface CacheStats {
  totalOperations: number;
  dailyOperations: number;
  hitRate: number;
  averageSize: number;
  lastCleanup: string;
}

export class NarrativeKVCache {
  private env: any;
  private readonly MAX_DAILY_OPERATIONS = 90000; // Leave 10K buffer for other operations
  private readonly CACHE_PREFIX = 'narrative:';
  private readonly STATS_KEY = 'narrative:stats';
  private readonly CLEANUP_KEY = 'narrative:cleanup';
  private readonly DEFAULT_TTL = 86400; // 24 hours
  private readonly PROCESSING_TTL = 3600; // 1 hour for processing status

  constructor(env?: any) {
    this.env = env;
  }

  setEnv(env: any): void {
    this.env = env;
  }

  /**
   * Generate cache key for analysis
   */
  private getCacheKey(analysisId: string): string {
    return `${this.CACHE_PREFIX}${analysisId}`;
  }

  /**
   * Generate user cache key for cleanup tracking
   */
  private getUserCacheKey(userId: string): string {
    return `${this.CACHE_PREFIX}user:${userId}`;
  }

  /**
   * Check if we're within daily operation limits
   */
  private async checkOperationLimit(): Promise<boolean> {
    try {
      if (!this.env?.CACHE) return false;

      const today = new Date().toISOString().split('T')[0];
      const dailyCountKey = `${this.CACHE_PREFIX}daily:${today}`;
      
      const currentCount = await this.env.CACHE.get(dailyCountKey);
      const count = currentCount ? parseInt(currentCount) : 0;
      
      return count < this.MAX_DAILY_OPERATIONS;
    } catch (error) {
      enhancedLogger.warn('Failed to check operation limit', { error });
      return true; // Allow operation if check fails
    }
  }

  /**
   * Increment daily operation counter
   */
  private async incrementOperationCount(): Promise<void> {
    try {
      if (!this.env?.CACHE) return;

      const today = new Date().toISOString().split('T')[0];
      const dailyCountKey = `${this.CACHE_PREFIX}daily:${today}`;
      
      const currentCount = await this.env.CACHE.get(dailyCountKey);
      const count = currentCount ? parseInt(currentCount) + 1 : 1;
      
      // Store with TTL until end of day
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const ttl = Math.floor((tomorrow.getTime() - Date.now()) / 1000);
      
      await this.env.CACHE.put(dailyCountKey, count.toString(), {
        expirationTtl: ttl
      });
    } catch (error) {
      enhancedLogger.warn('Failed to increment operation count', { error });
    }
  }

  /**
   * Store narrative analysis in cache (only completed analyses)
   */
  async storeAnalysis(entry: NarrativeCacheEntry): Promise<boolean> {
    try {
      // Only cache completed analyses to optimize operations
      if (entry.status !== 'completed') {
        enhancedLogger.debug('Skipping cache for non-completed analysis', {
          analysisId: entry.analysisId,
          status: entry.status
        });
        return false;
      }

      if (!await this.checkOperationLimit()) {
        enhancedLogger.warn('Daily KV operation limit reached, skipping cache', {
          analysisId: entry.analysisId
        });
        return false;
      }

      if (!this.env?.CACHE) return false;

      const key = this.getCacheKey(entry.analysisId);
      const value = JSON.stringify(entry);
      
      // Check size limit (KV has 25MB per value limit, but we want to be conservative)
      if (value.length > 1024 * 1024) { // 1MB limit
        enhancedLogger.warn('Analysis too large for KV cache', {
          analysisId: entry.analysisId,
          size: value.length
        });
        return false;
      }

      await this.env.CACHE.put(key, value, {
        expirationTtl: this.DEFAULT_TTL
      });

      await this.incrementOperationCount();

      enhancedLogger.info('Narrative analysis cached', {
        analysisId: entry.analysisId,
        wordCount: entry.wordCount,
        size: value.length
      });

      return true;
    } catch (error) {
      enhancedLogger.error('Failed to store analysis in cache', error, {
        analysisId: entry.analysisId
      });
      return false;
    }
  }

  /**
   * Store processing status (temporary, shorter TTL)
   */
  async storeProcessingStatus(analysisId: string, userId: string): Promise<boolean> {
    try {
      if (!await this.checkOperationLimit()) {
        return false;
      }

      if (!this.env?.CACHE) return false;

      const key = this.getCacheKey(analysisId);
      const entry: NarrativeCacheEntry = {
        analysisId,
        userId,
        narrative: '',
        analysisType: 'standalone',
        wordCount: 0,
        status: 'processing',
        timestamp: new Date().toISOString()
      };

      await this.env.CACHE.put(key, JSON.stringify(entry), {
        expirationTtl: this.PROCESSING_TTL
      });

      await this.incrementOperationCount();

      enhancedLogger.debug('Processing status cached', { analysisId });
      return true;
    } catch (error) {
      enhancedLogger.warn('Failed to store processing status', { error, analysisId });
      return false;
    }
  }

  /**
   * Retrieve analysis from cache
   */
  async getAnalysis(analysisId: string): Promise<NarrativeCacheEntry | null> {
    try {
      if (!await this.checkOperationLimit()) {
        return null;
      }

      if (!this.env?.CACHE) return null;

      const key = this.getCacheKey(analysisId);
      const value = await this.env.CACHE.get(key);

      await this.incrementOperationCount();

      if (!value) {
        return null;
      }

      const entry = JSON.parse(value) as NarrativeCacheEntry;
      
      enhancedLogger.debug('Cache hit for analysis', {
        analysisId,
        status: entry.status,
        wordCount: entry.wordCount
      });

      return entry;
    } catch (error) {
      enhancedLogger.warn('Failed to get analysis from cache', { error, analysisId });
      return null;
    }
  }

  /**
   * Delete analysis from cache
   */
  async deleteAnalysis(analysisId: string): Promise<boolean> {
    try {
      if (!await this.checkOperationLimit()) {
        return false;
      }

      if (!this.env?.CACHE) return false;

      const key = this.getCacheKey(analysisId);
      await this.env.CACHE.delete(key);

      await this.incrementOperationCount();

      enhancedLogger.debug('Analysis deleted from cache', { analysisId });
      return true;
    } catch (error) {
      enhancedLogger.warn('Failed to delete analysis from cache', { error, analysisId });
      return false;
    }
  }

  /**
   * Manual cleanup of old analyses for a user (no TTL on free plan)
   */
  async cleanupUserAnalyses(userId: string, keepCount: number = 10): Promise<number> {
    try {
      if (!this.env?.CACHE) return 0;

      // This is a simplified cleanup - in a real implementation, you'd need to
      // track user analyses separately since KV doesn't support listing by prefix
      // on the free plan
      
      enhancedLogger.info('Manual cleanup requested', { userId, keepCount });
      
      // For now, we'll just log the request and return 0
      // In a production system, you'd maintain a separate index of user analyses
      return 0;
    } catch (error) {
      enhancedLogger.error('Failed to cleanup user analyses', error, { userId });
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats | null> {
    try {
      if (!this.env?.CACHE) return null;

      const statsValue = await this.env.CACHE.get(this.STATS_KEY);
      
      if (statsValue) {
        return JSON.parse(statsValue) as CacheStats;
      }

      // Return default stats if none exist
      return {
        totalOperations: 0,
        dailyOperations: 0,
        hitRate: 0,
        averageSize: 0,
        lastCleanup: new Date().toISOString()
      };
    } catch (error) {
      enhancedLogger.warn('Failed to get cache stats', { error });
      return null;
    }
  }

  /**
   * Update cache statistics
   */
  async updateStats(stats: Partial<CacheStats>): Promise<boolean> {
    try {
      if (!this.env?.CACHE) return false;

      const currentStats = await this.getStats() || {
        totalOperations: 0,
        dailyOperations: 0,
        hitRate: 0,
        averageSize: 0,
        lastCleanup: new Date().toISOString()
      };

      const updatedStats = { ...currentStats, ...stats };

      await this.env.CACHE.put(this.STATS_KEY, JSON.stringify(updatedStats), {
        expirationTtl: 86400 * 7 // Keep stats for a week
      });

      return true;
    } catch (error) {
      enhancedLogger.warn('Failed to update cache stats', { error });
      return false;
    }
  }

  /**
   * Health check for narrative cache
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    operationsRemaining: number;
    cacheAvailable: boolean;
    error?: string;
  }> {
    try {
      const cacheAvailable = !!this.env?.CACHE;
      
      if (!cacheAvailable) {
        return {
          healthy: false,
          operationsRemaining: 0,
          cacheAvailable: false,
          error: 'KV namespace not available'
        };
      }

      // Check daily operations remaining
      const today = new Date().toISOString().split('T')[0];
      const dailyCountKey = `${this.CACHE_PREFIX}daily:${today}`;
      const currentCount = await this.env.CACHE.get(dailyCountKey);
      const operationsUsed = currentCount ? parseInt(currentCount) : 0;
      const operationsRemaining = Math.max(0, this.MAX_DAILY_OPERATIONS - operationsUsed);

      // Test basic operation
      const testKey = `${this.CACHE_PREFIX}health:${Date.now()}`;
      await this.env.CACHE.put(testKey, 'test', { expirationTtl: 60 });
      const testValue = await this.env.CACHE.get(testKey);
      await this.env.CACHE.delete(testKey);

      const healthy = testValue === 'test' && operationsRemaining > 1000; // Keep 1K buffer

      return {
        healthy,
        operationsRemaining,
        cacheAvailable: true
      };
    } catch (error) {
      return {
        healthy: false,
        operationsRemaining: 0,
        cacheAvailable: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Batch store multiple analyses (with operation limit checking)
   */
  async storeBatch(entries: NarrativeCacheEntry[]): Promise<{
    stored: number;
    skipped: number;
    failed: number;
  }> {
    const result = { stored: 0, skipped: 0, failed: 0 };

    for (const entry of entries) {
      if (!await this.checkOperationLimit()) {
        result.skipped++;
        continue;
      }

      const success = await this.storeAnalysis(entry);
      if (success) {
        result.stored++;
      } else {
        result.failed++;
      }
    }

    enhancedLogger.info('Batch cache operation completed', result);
    return result;
  }
}