/**
 * Async handler that works within Cloudflare Workers free tier limits
 * Falls back to synchronous execution if waitUntil fails
 */

import { enhancedLogger } from './enhancedLogger';

export interface AsyncExecutionOptions {
  timeout?: number;
  fallbackToSync?: boolean;
  maxSyncTime?: number;
}

/**
 * Execute an async function with fallback support for free tier limitations
 */
export async function executeAsync<T>(
  executionCtx: ExecutionContext | null,
  asyncFn: () => Promise<T>,
  options: AsyncExecutionOptions = {}
): Promise<{ success: boolean; async: boolean; result?: T; error?: any }> {
  const {
    timeout = 25000, // 25 seconds (safe for free tier)
    fallbackToSync = true,
    maxSyncTime = 10000 // 10 seconds max for sync execution
  } = options;

  // Try async execution with waitUntil if available
  if (executionCtx && executionCtx.waitUntil) {
    try {
      console.log('[ASYNC-HANDLER] Attempting waitUntil execution');
      
      // Wrap the async function with a timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('waitUntil timeout')), timeout);
      });

      // Create a promise that tracks if waitUntil works
      let waitUntilStarted = false;
      const trackingPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          waitUntilStarted = true;
          resolve();
        }, 100); // Check after 100ms if it started
      });

      executionCtx.waitUntil(
        Promise.race([
          asyncFn().catch(error => {
            console.error('[ASYNC-HANDLER] Async function error:', error);
            enhancedLogger.error('Async execution failed', error);
          }),
          timeoutPromise
        ])
      );

      await trackingPromise;

      if (waitUntilStarted) {
        console.log('[ASYNC-HANDLER] waitUntil accepted, async execution started');
        return { success: true, async: true };
      }
    } catch (error) {
      console.error('[ASYNC-HANDLER] waitUntil failed:', error);
      enhancedLogger.warn('waitUntil execution failed, considering fallback', { error });
    }
  }

  // Fallback to synchronous execution if configured
  if (fallbackToSync) {
    console.log('[ASYNC-HANDLER] Falling back to synchronous execution');
    try {
      // Execute with a shorter timeout for sync mode
      const result = await Promise.race([
        asyncFn(),
        new Promise<T>((_, reject) => 
          setTimeout(() => reject(new Error('Sync execution timeout')), maxSyncTime)
        )
      ]);
      
      console.log('[ASYNC-HANDLER] Synchronous execution completed');
      return { success: true, async: false, result };
    } catch (error) {
      console.error('[ASYNC-HANDLER] Synchronous execution failed:', error);
      return { success: false, async: false, error };
    }
  }

  return { success: false, async: false, error: 'No execution method available' };
}

/**
 * Execute a lightweight async task (suitable for free tier)
 */
export async function executeLightweightAsync(
  executionCtx: ExecutionContext | null,
  asyncFn: () => Promise<void>
): Promise<boolean> {
  if (!executionCtx || !executionCtx.waitUntil) {
    console.warn('[ASYNC-HANDLER] No execution context available for lightweight async');
    return false;
  }

  try {
    // For lightweight tasks, use a shorter timeout
    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => reject(new Error('Lightweight timeout')), 5000); // 5 seconds
    });

    executionCtx.waitUntil(
      Promise.race([
        asyncFn().catch(error => {
          console.error('[ASYNC-HANDLER] Lightweight async error:', error);
        }),
        timeoutPromise
      ])
    );

    return true;
  } catch (error) {
    console.error('[ASYNC-HANDLER] Lightweight async failed:', error);
    return false;
  }
}

/**
 * Break down a long-running task into smaller chunks
 */
export async function executeInChunks<T>(
  tasks: (() => Promise<T>)[],
  chunkSize: number = 3,
  delayBetweenChunks: number = 100
): Promise<T[]> {
  const results: T[] = [];
  
  for (let i = 0; i < tasks.length; i += chunkSize) {
    const chunk = tasks.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(chunk.map(task => task()));
    results.push(...chunkResults);
    
    // Add delay between chunks to avoid CPU limits
    if (i + chunkSize < tasks.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenChunks));
    }
  }
  
  return results;
}
