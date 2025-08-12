/**
 * KV Storage Utility with Retry Logic
 * Provides robust KV operations with automatic retries and error handling
 */

import { enhancedLogger } from './enhancedLogger';

export interface KVRetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  timeout?: number;
}

export interface KVStorageOptions {
  expirationTtl?: number;
  metadata?: Record<string, string>;
}

class KVStorage {
  private env: any;
  private defaultRetryOptions: KVRetryOptions = {
    maxRetries: 3,
    initialDelay: 100,
    maxDelay: 5000,
    backoffMultiplier: 2,
    timeout: 10000
  };

  constructor(env?: any) {
    this.env = env;
  }

  setEnv(env: any): void {
    this.env = env;
    enhancedLogger.setEnv(env);
  }

  /**
   * Calculate delay for exponential backoff
   */
  private calculateDelay(attempt: number, options: KVRetryOptions): number {
    const delay = Math.min(
      (options.initialDelay || 100) * Math.pow(options.backoffMultiplier || 2, attempt),
      options.maxDelay || 5000
    );
    // Add jitter to prevent thundering herd
    return delay + Math.random() * delay * 0.1;
  }

  /**
   * Sleep for specified milliseconds
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Put value to KV with retry logic
   */
  async put(
    key: string, 
    value: string, 
    options?: KVStorageOptions,
    retryOptions?: KVRetryOptions
  ): Promise<boolean> {
    const retry = { ...this.defaultRetryOptions, ...retryOptions };
    const startTime = Date.now();
    
    enhancedLogger.debug(`KV PUT attempt for key: ${key}`, {
      keyLength: key.length,
      valueLength: value.length,
      options
    });

    for (let attempt = 0; attempt <= (retry.maxRetries || 3); attempt++) {
      try {
        // Check timeout
        if (Date.now() - startTime > (retry.timeout || 10000)) {
          throw new Error('KV operation timeout exceeded');
        }

        if (!this.env?.CACHE) {
          enhancedLogger.warn('KV namespace not available', { key });
          return false;
        }

        // Attempt KV put
        await this.env.CACHE.put(key, value, {
          expirationTtl: options?.expirationTtl,
          metadata: options?.metadata
        });

        if (attempt > 0) {
          enhancedLogger.info(`KV PUT succeeded after retry`, {
            key,
            attempt,
            duration: Date.now() - startTime
          });
        }

        return true;

      } catch (error) {
        const isLastAttempt = attempt === retry.maxRetries;
        
        enhancedLogger.warn(`KV PUT failed (attempt ${attempt + 1}/${(retry.maxRetries || 3) + 1})`, {
          key,
          error: error instanceof Error ? error.message : 'Unknown error',
          isLastAttempt
        });

        if (isLastAttempt) {
          enhancedLogger.error('KV PUT failed after all retries', error, {
            key,
            attempts: attempt + 1,
            totalDuration: Date.now() - startTime
          });
          return false;
        }

        // Calculate and apply backoff delay
        const delay = this.calculateDelay(attempt, retry);
        enhancedLogger.debug(`Waiting ${delay}ms before retry`, { key, attempt });
        await this.sleep(delay);
      }
    }

    return false;
  }

  /**
   * Get value from KV with retry logic
   */
  async get(
    key: string,
    retryOptions?: KVRetryOptions
  ): Promise<string | null> {
    const retry = { ...this.defaultRetryOptions, ...retryOptions };
    const startTime = Date.now();
    
    enhancedLogger.debug(`KV GET attempt for key: ${key}`);

    for (let attempt = 0; attempt <= (retry.maxRetries || 3); attempt++) {
      try {
        // Check timeout
        if (Date.now() - startTime > (retry.timeout || 10000)) {
          throw new Error('KV operation timeout exceeded');
        }

        if (!this.env?.CACHE) {
          enhancedLogger.warn('KV namespace not available', { key });
          return null;
        }

        // Attempt KV get
        const value = await this.env.CACHE.get(key);

        if (attempt > 0 && value !== null) {
          enhancedLogger.info(`KV GET succeeded after retry`, {
            key,
            attempt,
            duration: Date.now() - startTime,
            found: value !== null
          });
        }

        return value;

      } catch (error) {
        const isLastAttempt = attempt === retry.maxRetries;
        
        enhancedLogger.warn(`KV GET failed (attempt ${attempt + 1}/${(retry.maxRetries || 3) + 1})`, {
          key,
          error: error instanceof Error ? error.message : 'Unknown error',
          isLastAttempt
        });

        if (isLastAttempt) {
          enhancedLogger.error('KV GET failed after all retries', error, {
            key,
            attempts: attempt + 1,
            totalDuration: Date.now() - startTime
          });
          return null;
        }

        // Calculate and apply backoff delay
        const delay = this.calculateDelay(attempt, retry);
        await this.sleep(delay);
      }
    }

    return null;
  }

  /**
   * Delete value from KV with retry logic
   */
  async delete(
    key: string,
    retryOptions?: KVRetryOptions
  ): Promise<boolean> {
    const retry = { ...this.defaultRetryOptions, ...retryOptions };
    const startTime = Date.now();
    
    for (let attempt = 0; attempt <= (retry.maxRetries || 3); attempt++) {
      try {
        if (!this.env?.CACHE) {
          return false;
        }

        await this.env.CACHE.delete(key);
        return true;

      } catch (error) {
        if (attempt === retry.maxRetries) {
          enhancedLogger.error('KV DELETE failed after all retries', error, {
            key,
            attempts: attempt + 1
          });
          return false;
        }

        const delay = this.calculateDelay(attempt, retry);
        await this.sleep(delay);
      }
    }

    return false;
  }

  /**
   * Store analysis status with automatic retries
   */
  async putAnalysisStatus(
    analysisId: string,
    status: any,
    ttl: number = 3600
  ): Promise<boolean> {
    const key = `resume:${analysisId}`;
    const value = JSON.stringify(status);
    
    enhancedLogger.info('Storing analysis status', {
      analysisId,
      status: status.status,
      key
    });

    const success = await this.put(key, value, {
      expirationTtl: ttl
    }, {
      maxRetries: 5, // More retries for critical data
      timeout: 15000
    });

    if (!success) {
      enhancedLogger.critical('Failed to store critical analysis status', {
        analysisId,
        status: status.status
      });
    }

    return success;
  }

  /**
   * Get analysis status with automatic retries
   */
  async getAnalysisStatus(analysisId: string): Promise<any | null> {
    const key = `resume:${analysisId}`;
    
    const value = await this.get(key, {
      maxRetries: 3,
      timeout: 10000
    });

    if (value) {
      try {
        return JSON.parse(value);
      } catch (error) {
        enhancedLogger.error('Failed to parse analysis status', error, {
          analysisId,
          key
        });
        return null;
      }
    }

    return null;
  }

  /**
   * Increment counter with retry logic
   */
  async incrementCounter(
    counterKey: string,
    ttl: number = 86400
  ): Promise<number> {
    const retry = 3;
    
    for (let attempt = 0; attempt <= retry; attempt++) {
      try {
        if (!this.env?.CACHE) return 0;

        // Get current value
        const current = await this.env.CACHE.get(counterKey);
        const count = current ? parseInt(current) + 1 : 1;

        // Store new value
        await this.env.CACHE.put(counterKey, count.toString(), {
          expirationTtl: ttl
        });

        return count;

      } catch (error) {
        if (attempt === retry) {
          enhancedLogger.error('Failed to increment counter', error, {
            counterKey,
            attempts: attempt + 1
          });
          return 0;
        }
        await this.sleep(100 * (attempt + 1));
      }
    }

    return 0;
  }

  /**
   * Batch operations with retry logic
   */
  async putBatch(
    items: Array<{ key: string; value: string; options?: KVStorageOptions }>,
    retryOptions?: KVRetryOptions
  ): Promise<{ success: number; failed: number; failures: string[] }> {
    const results = {
      success: 0,
      failed: 0,
      failures: [] as string[]
    };

    // Process in parallel with concurrency limit
    const concurrency = 5;
    const chunks = [];
    
    for (let i = 0; i < items.length; i += concurrency) {
      chunks.push(items.slice(i, i + concurrency));
    }

    for (const chunk of chunks) {
      const promises = chunk.map(async (item) => {
        const success = await this.put(
          item.key,
          item.value,
          item.options,
          retryOptions
        );
        
        if (success) {
          results.success++;
        } else {
          results.failed++;
          results.failures.push(item.key);
        }
      });

      await Promise.all(promises);
    }

    if (results.failed > 0) {
      enhancedLogger.warn('Some batch operations failed', results);
    }

    return results;
  }

  /**
   * Health check for KV namespace
   */
  async healthCheck(): Promise<{ healthy: boolean; latency: number; error?: string }> {
    const startTime = Date.now();
    const testKey = `health:check:${Date.now()}`;
    const testValue = 'test';

    try {
      if (!this.env?.CACHE) {
        return {
          healthy: false,
          latency: 0,
          error: 'KV namespace not configured'
        };
      }

      // Test write
      await this.env.CACHE.put(testKey, testValue, {
        expirationTtl: 60
      });

      // Test read
      const retrieved = await this.env.CACHE.get(testKey);
      
      // Test delete
      await this.env.CACHE.delete(testKey);

      const latency = Date.now() - startTime;
      const healthy = retrieved === testValue;

      if (!healthy) {
        enhancedLogger.warn('KV health check failed', {
          expected: testValue,
          received: retrieved,
          latency
        });
      }

      return {
        healthy,
        latency
      };

    } catch (error) {
      const latency = Date.now() - startTime;
      enhancedLogger.error('KV health check error', error, { latency });
      
      return {
        healthy: false,
        latency,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Create and export singleton instance
export const kvStorage = new KVStorage();

// Export class for testing
export { KVStorage };
