/**
 * Cloudflare Free Plan Optimizer
 * Monitors and optimizes resource usage for Cloudflare free plan limits
 */

import { logger } from './logger';

export interface CloudflareLimits {
  // D1 Database limits (free plan)
  d1: {
    dailyReads: number;
    dailyWrites: number;
    storageRows: number;
    storageMB: number;
  };
  // KV Storage limits (free plan)
  kv: {
    dailyOperations: number;
    storageMB: number;
    keySize: number;
    valueSize: number;
  };
  // Worker limits (free plan)
  worker: {
    dailyRequests: number;
    cpuTimeMs: number;
    memoryMB: number;
  };
}

export const CLOUDFLARE_FREE_LIMITS: CloudflareLimits = {
  d1: {
    dailyReads: 25000,
    dailyWrites: 100000,
    storageRows: 100000,
    storageMB: 5
  },
  kv: {
    dailyOperations: 100000,
    storageMB: 1,
    keySize: 512, // bytes
    valueSize: 25 * 1024 * 1024 // 25MB
  },
  worker: {
    dailyRequests: 100000,
    cpuTimeMs: 10,
    memoryMB: 128
  }
};

export interface ResourceUsage {
  d1Reads: number;
  d1Writes: number;
  kvOperations: number;
  workerRequests: number;
  timestamp: string;
}

export class CloudflareOptimizer {
  private static instance: CloudflareOptimizer;
  private usage: ResourceUsage;
  private lastReset: Date;

  private constructor() {
    this.usage = {
      d1Reads: 0,
      d1Writes: 0,
      kvOperations: 0,
      workerRequests: 0,
      timestamp: new Date().toISOString()
    };
    this.lastReset = new Date();
  }

  static getInstance(): CloudflareOptimizer {
    if (!CloudflareOptimizer.instance) {
      CloudflareOptimizer.instance = new CloudflareOptimizer();
    }
    return CloudflareOptimizer.instance;
  }

  /**
   * Track D1 database read operation
   */
  trackD1Read(count: number = 1): void {
    this.usage.d1Reads += count;
    this.checkDailyReset();
    
    if (this.usage.d1Reads > CLOUDFLARE_FREE_LIMITS.d1.dailyReads * 0.9) {
      logger.warn('Approaching D1 daily read limit', {
        current: this.usage.d1Reads,
        limit: CLOUDFLARE_FREE_LIMITS.d1.dailyReads,
        percentage: (this.usage.d1Reads / CLOUDFLARE_FREE_LIMITS.d1.dailyReads) * 100
      });
    }
  }

  /**
   * Track D1 database write operation
   */
  trackD1Write(count: number = 1): void {
    this.usage.d1Writes += count;
    this.checkDailyReset();
    
    if (this.usage.d1Writes > CLOUDFLARE_FREE_LIMITS.d1.dailyWrites * 0.9) {
      logger.warn('Approaching D1 daily write limit', {
        current: this.usage.d1Writes,
        limit: CLOUDFLARE_FREE_LIMITS.d1.dailyWrites,
        percentage: (this.usage.d1Writes / CLOUDFLARE_FREE_LIMITS.d1.dailyWrites) * 100
      });
    }
  }

  /**
   * Track KV operation
   */
  trackKVOperation(count: number = 1): void {
    this.usage.kvOperations += count;
    this.checkDailyReset();
    
    if (this.usage.kvOperations > CLOUDFLARE_FREE_LIMITS.kv.dailyOperations * 0.9) {
      logger.warn('Approaching KV daily operations limit', {
        current: this.usage.kvOperations,
        limit: CLOUDFLARE_FREE_LIMITS.kv.dailyOperations,
        percentage: (this.usage.kvOperations / CLOUDFLARE_FREE_LIMITS.kv.dailyOperations) * 100
      });
    }
  }

  /**
   * Track Worker request
   */
  trackWorkerRequest(): void {
    this.usage.workerRequests += 1;
    this.checkDailyReset();
    
    if (this.usage.workerRequests > CLOUDFLARE_FREE_LIMITS.worker.dailyRequests * 0.9) {
      logger.warn('Approaching Worker daily requests limit', {
        current: this.usage.workerRequests,
        limit: CLOUDFLARE_FREE_LIMITS.worker.dailyRequests,
        percentage: (this.usage.workerRequests / CLOUDFLARE_FREE_LIMITS.worker.dailyRequests) * 100
      });
    }
  }

  /**
   * Check if we should reset daily counters
   */
  private checkDailyReset(): void {
    const now = new Date();
    const hoursSinceReset = (now.getTime() - this.lastReset.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceReset >= 24) {
      this.resetDailyCounters();
    }
  }

  /**
   * Reset daily usage counters
   */
  private resetDailyCounters(): void {
    logger.info('Resetting daily usage counters', this.usage);
    
    this.usage = {
      d1Reads: 0,
      d1Writes: 0,
      kvOperations: 0,
      workerRequests: 0,
      timestamp: new Date().toISOString()
    };
    this.lastReset = new Date();
  }

  /**
   * Get current usage statistics
   */
  getUsage(): ResourceUsage & {
    limits: CloudflareLimits;
    percentages: {
      d1Reads: number;
      d1Writes: number;
      kvOperations: number;
      workerRequests: number;
    };
  } {
    return {
      ...this.usage,
      limits: CLOUDFLARE_FREE_LIMITS,
      percentages: {
        d1Reads: (this.usage.d1Reads / CLOUDFLARE_FREE_LIMITS.d1.dailyReads) * 100,
        d1Writes: (this.usage.d1Writes / CLOUDFLARE_FREE_LIMITS.d1.dailyWrites) * 100,
        kvOperations: (this.usage.kvOperations / CLOUDFLARE_FREE_LIMITS.kv.dailyOperations) * 100,
        workerRequests: (this.usage.workerRequests / CLOUDFLARE_FREE_LIMITS.worker.dailyRequests) * 100
      }
    };
  }

  /**
   * Check if we can perform a D1 read operation
   */
  canPerformD1Read(count: number = 1): boolean {
    return (this.usage.d1Reads + count) <= CLOUDFLARE_FREE_LIMITS.d1.dailyReads;
  }

  /**
   * Check if we can perform a D1 write operation
   */
  canPerformD1Write(count: number = 1): boolean {
    return (this.usage.d1Writes + count) <= CLOUDFLARE_FREE_LIMITS.d1.dailyWrites;
  }

  /**
   * Check if we can perform a KV operation
   */
  canPerformKVOperation(count: number = 1): boolean {
    return (this.usage.kvOperations + count) <= CLOUDFLARE_FREE_LIMITS.kv.dailyOperations;
  }

  /**
   * Check if we can handle a Worker request
   */
  canHandleWorkerRequest(): boolean {
    return (this.usage.workerRequests + 1) <= CLOUDFLARE_FREE_LIMITS.worker.dailyRequests;
  }

  /**
   * Get remaining capacity for each service
   */
  getRemainingCapacity(): {
    d1Reads: number;
    d1Writes: number;
    kvOperations: number;
    workerRequests: number;
  } {
    return {
      d1Reads: Math.max(0, CLOUDFLARE_FREE_LIMITS.d1.dailyReads - this.usage.d1Reads),
      d1Writes: Math.max(0, CLOUDFLARE_FREE_LIMITS.d1.dailyWrites - this.usage.d1Writes),
      kvOperations: Math.max(0, CLOUDFLARE_FREE_LIMITS.kv.dailyOperations - this.usage.kvOperations),
      workerRequests: Math.max(0, CLOUDFLARE_FREE_LIMITS.worker.dailyRequests - this.usage.workerRequests)
    };
  }

  /**
   * Optimize database query based on current usage
   */
  optimizeD1Query(baseLimit: number): number {
    const remaining = this.getRemainingCapacity();
    const usagePercentage = (this.usage.d1Reads / CLOUDFLARE_FREE_LIMITS.d1.dailyReads) * 100;
    
    // Reduce query limits as we approach the daily limit
    if (usagePercentage > 80) {
      return Math.min(baseLimit, Math.floor(baseLimit * 0.5)); // 50% of base limit
    } else if (usagePercentage > 60) {
      return Math.min(baseLimit, Math.floor(baseLimit * 0.75)); // 75% of base limit
    }
    
    return baseLimit;
  }

  /**
   * Optimize KV cache usage based on current operations
   */
  shouldUseKVCache(): boolean {
    const usagePercentage = (this.usage.kvOperations / CLOUDFLARE_FREE_LIMITS.kv.dailyOperations) * 100;
    
    // Disable caching when approaching limit
    if (usagePercentage > 90) {
      logger.warn('KV cache disabled due to high usage', { usagePercentage });
      return false;
    }
    
    return true;
  }

  /**
   * Calculate optimal cache TTL based on usage
   */
  getOptimalCacheTTL(baseTTL: number): number {
    const usagePercentage = (this.usage.kvOperations / CLOUDFLARE_FREE_LIMITS.kv.dailyOperations) * 100;
    
    // Increase TTL to reduce cache operations when usage is high
    if (usagePercentage > 70) {
      return baseTTL * 2; // Double TTL
    } else if (usagePercentage > 50) {
      return Math.floor(baseTTL * 1.5); // 1.5x TTL
    }
    
    return baseTTL;
  }

  /**
   * Get health status of all services
   */
  getHealthStatus(): {
    overall: 'healthy' | 'warning' | 'critical';
    services: {
      d1: 'healthy' | 'warning' | 'critical';
      kv: 'healthy' | 'warning' | 'critical';
      worker: 'healthy' | 'warning' | 'critical';
    };
    recommendations: string[];
  } {
    const percentages = this.getUsage().percentages;
    const recommendations: string[] = [];
    
    const getServiceStatus = (percentage: number): 'healthy' | 'warning' | 'critical' => {
      if (percentage > 90) return 'critical';
      if (percentage > 70) return 'warning';
      return 'healthy';
    };
    
    const d1Status = getServiceStatus(Math.max(percentages.d1Reads, percentages.d1Writes));
    const kvStatus = getServiceStatus(percentages.kvOperations);
    const workerStatus = getServiceStatus(percentages.workerRequests);
    
    // Generate recommendations
    if (d1Status === 'critical') {
      recommendations.push('D1 usage critical - implement aggressive query optimization');
    } else if (d1Status === 'warning') {
      recommendations.push('D1 usage high - consider reducing query frequency');
    }
    
    if (kvStatus === 'critical') {
      recommendations.push('KV usage critical - disable non-essential caching');
    } else if (kvStatus === 'warning') {
      recommendations.push('KV usage high - increase cache TTL');
    }
    
    if (workerStatus === 'critical') {
      recommendations.push('Worker requests critical - implement request throttling');
    } else if (workerStatus === 'warning') {
      recommendations.push('Worker requests high - optimize request handling');
    }
    
    const overallStatus = [d1Status, kvStatus, workerStatus].includes('critical') 
      ? 'critical' 
      : [d1Status, kvStatus, workerStatus].includes('warning') 
        ? 'warning' 
        : 'healthy';
    
    return {
      overall: overallStatus,
      services: {
        d1: d1Status,
        kv: kvStatus,
        worker: workerStatus
      },
      recommendations
    };
  }

  /**
   * Log current usage statistics
   */
  logUsageStats(): void {
    const usage = this.getUsage();
    const health = this.getHealthStatus();
    
    logger.info('Cloudflare resource usage', {
      usage: usage.percentages,
      remaining: this.getRemainingCapacity(),
      health: health.overall,
      recommendations: health.recommendations
    });
  }
}

/**
 * Middleware to track Worker requests
 */
export function trackWorkerRequest() {
  const optimizer = CloudflareOptimizer.getInstance();
  optimizer.trackWorkerRequest();
}

/**
 * Utility to check if operation is within limits
 */
export function checkResourceLimits(): {
  canProceed: boolean;
  reason?: string;
  suggestions: string[];
} {
  const optimizer = CloudflareOptimizer.getInstance();
  const health = optimizer.getHealthStatus();
  
  if (health.overall === 'critical') {
    return {
      canProceed: false,
      reason: 'Resource usage critical - operation blocked',
      suggestions: health.recommendations
    };
  }
  
  return {
    canProceed: true,
    suggestions: health.recommendations
  };
}

/**
 * Get optimized query parameters based on current usage
 */
export function getOptimizedQueryParams(baseParams: {
  limit?: number;
  useCache?: boolean;
  cacheTTL?: number;
}): {
  limit: number;
  useCache: boolean;
  cacheTTL: number;
} {
  const optimizer = CloudflareOptimizer.getInstance();
  
  return {
    limit: optimizer.optimizeD1Query(baseParams.limit || 10),
    useCache: baseParams.useCache !== false && optimizer.shouldUseKVCache(),
    cacheTTL: optimizer.getOptimalCacheTTL(baseParams.cacheTTL || 3600)
  };
}