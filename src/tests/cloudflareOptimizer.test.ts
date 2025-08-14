/**
 * Tests for Cloudflare Free Plan Optimizer
 * Tests resource monitoring and optimization features
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  CloudflareOptimizer, 
  CLOUDFLARE_FREE_LIMITS,
  trackWorkerRequest,
  checkResourceLimits,
  getOptimizedQueryParams
} from '../utils/cloudflareOptimizer';

describe('Cloudflare Free Plan Optimizer', () => {
  let optimizer: CloudflareOptimizer;

  beforeEach(() => {
    // Get fresh instance for each test
    optimizer = CloudflareOptimizer.getInstance();
    
    // Reset counters by creating a new instance (simulate daily reset)
    (optimizer as any).usage = {
      d1Reads: 0,
      d1Writes: 0,
      kvOperations: 0,
      workerRequests: 0,
      timestamp: new Date().toISOString()
    };
    (optimizer as any).lastReset = new Date();
  });

  describe('Resource Tracking', () => {
    it('should track D1 read operations', () => {
      optimizer.trackD1Read(5);
      const usage = optimizer.getUsage();
      
      expect(usage.d1Reads).toBe(5);
      expect(usage.percentages.d1Reads).toBe((5 / CLOUDFLARE_FREE_LIMITS.d1.dailyReads) * 100);
    });

    it('should track D1 write operations', () => {
      optimizer.trackD1Write(10);
      const usage = optimizer.getUsage();
      
      expect(usage.d1Writes).toBe(10);
      expect(usage.percentages.d1Writes).toBe((10 / CLOUDFLARE_FREE_LIMITS.d1.dailyWrites) * 100);
    });

    it('should track KV operations', () => {
      optimizer.trackKVOperation(15);
      const usage = optimizer.getUsage();
      
      expect(usage.kvOperations).toBe(15);
      expect(usage.percentages.kvOperations).toBe((15 / CLOUDFLARE_FREE_LIMITS.kv.dailyOperations) * 100);
    });

    it('should track Worker requests', () => {
      optimizer.trackWorkerRequest();
      optimizer.trackWorkerRequest();
      const usage = optimizer.getUsage();
      
      expect(usage.workerRequests).toBe(2);
      expect(usage.percentages.workerRequests).toBe((2 / CLOUDFLARE_FREE_LIMITS.worker.dailyRequests) * 100);
    });

    it('should accumulate operations correctly', () => {
      optimizer.trackD1Read(5);
      optimizer.trackD1Read(3);
      optimizer.trackD1Write(2);
      optimizer.trackKVOperation(10);
      
      const usage = optimizer.getUsage();
      expect(usage.d1Reads).toBe(8);
      expect(usage.d1Writes).toBe(2);
      expect(usage.kvOperations).toBe(10);
    });
  });

  describe('Limit Checking', () => {
    it('should check D1 read capacity correctly', () => {
      optimizer.trackD1Read(CLOUDFLARE_FREE_LIMITS.d1.dailyReads - 5);
      
      expect(optimizer.canPerformD1Read(3)).toBe(true);
      expect(optimizer.canPerformD1Read(10)).toBe(false);
    });

    it('should check D1 write capacity correctly', () => {
      optimizer.trackD1Write(CLOUDFLARE_FREE_LIMITS.d1.dailyWrites - 5);
      
      expect(optimizer.canPerformD1Write(3)).toBe(true);
      expect(optimizer.canPerformD1Write(10)).toBe(false);
    });

    it('should check KV operation capacity correctly', () => {
      optimizer.trackKVOperation(CLOUDFLARE_FREE_LIMITS.kv.dailyOperations - 5);
      
      expect(optimizer.canPerformKVOperation(3)).toBe(true);
      expect(optimizer.canPerformKVOperation(10)).toBe(false);
    });

    it('should check Worker request capacity correctly', () => {
      // Track requests up to near limit
      for (let i = 0; i < CLOUDFLARE_FREE_LIMITS.worker.dailyRequests - 5; i++) {
        optimizer.trackWorkerRequest();
      }
      
      expect(optimizer.canHandleWorkerRequest()).toBe(true);
      
      // Track remaining requests
      for (let i = 0; i < 5; i++) {
        optimizer.trackWorkerRequest();
      }
      
      expect(optimizer.canHandleWorkerRequest()).toBe(false);
    });
  });

  describe('Remaining Capacity', () => {
    it('should calculate remaining capacity correctly', () => {
      optimizer.trackD1Read(100);
      optimizer.trackD1Write(200);
      optimizer.trackKVOperation(500);
      optimizer.trackWorkerRequest();
      
      const remaining = optimizer.getRemainingCapacity();
      
      expect(remaining.d1Reads).toBe(CLOUDFLARE_FREE_LIMITS.d1.dailyReads - 100);
      expect(remaining.d1Writes).toBe(CLOUDFLARE_FREE_LIMITS.d1.dailyWrites - 200);
      expect(remaining.kvOperations).toBe(CLOUDFLARE_FREE_LIMITS.kv.dailyOperations - 500);
      expect(remaining.workerRequests).toBe(CLOUDFLARE_FREE_LIMITS.worker.dailyRequests - 1);
    });

    it('should not return negative remaining capacity', () => {
      // Exceed limits
      optimizer.trackD1Read(CLOUDFLARE_FREE_LIMITS.d1.dailyReads + 1000);
      
      const remaining = optimizer.getRemainingCapacity();
      expect(remaining.d1Reads).toBe(0);
    });
  });

  describe('Query Optimization', () => {
    it('should optimize D1 query limits based on usage', () => {
      const baseLimit = 50;
      
      // Low usage - no optimization
      optimizer.trackD1Read(1000); // ~4% usage
      expect(optimizer.optimizeD1Query(baseLimit)).toBe(baseLimit);
      
      // Reset and test medium usage (need >60%)
      (optimizer as any).usage.d1Reads = 0;
      optimizer.trackD1Read(16000); // ~64% usage (25000 * 0.64 = 16000)
      expect(optimizer.optimizeD1Query(baseLimit)).toBe(Math.floor(baseLimit * 0.75));
      
      // Reset and test high usage (need >80%)
      (optimizer as any).usage.d1Reads = 0;
      optimizer.trackD1Read(21000); // ~84% usage (25000 * 0.84 = 21000)
      expect(optimizer.optimizeD1Query(baseLimit)).toBe(Math.floor(baseLimit * 0.5));
    });

    it('should disable KV cache when usage is high', () => {
      // Low usage - cache enabled
      optimizer.trackKVOperation(10000); // ~10% usage
      expect(optimizer.shouldUseKVCache()).toBe(true);
      
      // Reset and test high usage
      (optimizer as any).usage.kvOperations = 0;
      optimizer.trackKVOperation(91000); // ~91% usage
      expect(optimizer.shouldUseKVCache()).toBe(false);
    });

    it('should optimize cache TTL based on usage', () => {
      const baseTTL = 3600; // 1 hour
      
      // Low usage - normal TTL
      optimizer.trackKVOperation(10000); // ~10% usage
      expect(optimizer.getOptimalCacheTTL(baseTTL)).toBe(baseTTL);
      
      // Reset and test medium usage (need >50%)
      (optimizer as any).usage.kvOperations = 0;
      optimizer.trackKVOperation(55000); // ~55% usage (100000 * 0.55 = 55000)
      expect(optimizer.getOptimalCacheTTL(baseTTL)).toBe(Math.floor(baseTTL * 1.5));
      
      // Reset and test high usage (need >70%)
      (optimizer as any).usage.kvOperations = 0;
      optimizer.trackKVOperation(75000); // ~75% usage (100000 * 0.75 = 75000)
      expect(optimizer.getOptimalCacheTTL(baseTTL)).toBe(baseTTL * 2);
    });
  });

  describe('Health Status', () => {
    it('should report healthy status with low usage', () => {
      optimizer.trackD1Read(1000);
      optimizer.trackKVOperation(5000);
      optimizer.trackWorkerRequest();
      
      const health = optimizer.getHealthStatus();
      
      expect(health.overall).toBe('healthy');
      expect(health.services.d1).toBe('healthy');
      expect(health.services.kv).toBe('healthy');
      expect(health.services.worker).toBe('healthy');
      expect(health.recommendations).toHaveLength(0);
    });

    it('should report warning status with medium usage', () => {
      optimizer.trackD1Read(18000); // ~72% usage
      optimizer.trackKVOperation(75000); // ~75% usage
      
      const health = optimizer.getHealthStatus();
      
      expect(health.overall).toBe('warning');
      expect(health.services.d1).toBe('warning');
      expect(health.services.kv).toBe('warning');
      expect(health.recommendations.length).toBeGreaterThan(0);
    });

    it('should report critical status with high usage', () => {
      optimizer.trackD1Read(23000); // ~92% usage
      optimizer.trackKVOperation(95000); // ~95% usage
      
      const health = optimizer.getHealthStatus();
      
      expect(health.overall).toBe('critical');
      expect(health.services.d1).toBe('critical');
      expect(health.services.kv).toBe('critical');
      expect(health.recommendations.length).toBeGreaterThan(0);
      expect(health.recommendations.some(r => r.includes('critical'))).toBe(true);
    });

    it('should generate appropriate recommendations', () => {
      optimizer.trackD1Read(23000); // Critical D1 usage
      optimizer.trackKVOperation(95000); // Critical KV usage
      
      const health = optimizer.getHealthStatus();
      
      expect(health.recommendations.some(r => r.includes('D1'))).toBe(true);
      expect(health.recommendations.some(r => r.includes('KV'))).toBe(true);
      expect(health.recommendations.some(r => r.includes('critical'))).toBe(true);
    });
  });

  describe('Utility Functions', () => {
    it('should track worker requests via utility function', () => {
      trackWorkerRequest();
      trackWorkerRequest();
      
      const usage = optimizer.getUsage();
      expect(usage.workerRequests).toBe(2);
    });

    it('should check resource limits via utility function', () => {
      // Normal usage
      let check = checkResourceLimits();
      expect(check.canProceed).toBe(true);
      expect(check.reason).toBeUndefined();
      
      // Critical usage
      optimizer.trackD1Read(23000);
      optimizer.trackKVOperation(95000);
      
      check = checkResourceLimits();
      expect(check.canProceed).toBe(false);
      expect(check.reason).toBeDefined();
      expect(check.suggestions.length).toBeGreaterThan(0);
    });

    it('should get optimized query parameters', () => {
      // Normal usage
      let params = getOptimizedQueryParams({
        limit: 20,
        useCache: true,
        cacheTTL: 3600
      });
      
      expect(params.limit).toBe(20);
      expect(params.useCache).toBe(true);
      expect(params.cacheTTL).toBe(3600);
      
      // High usage
      optimizer.trackD1Read(20000); // ~80% usage
      optimizer.trackKVOperation(92000); // ~92% usage
      
      params = getOptimizedQueryParams({
        limit: 20,
        useCache: true,
        cacheTTL: 3600
      });
      
      expect(params.limit).toBeLessThan(20); // Optimized down
      expect(params.useCache).toBe(false); // Disabled due to high KV usage
      expect(params.cacheTTL).toBeGreaterThan(3600); // Increased TTL
    });

    it('should handle default parameters in optimization', () => {
      const params = getOptimizedQueryParams({});
      
      expect(params.limit).toBe(10); // Default limit
      expect(params.useCache).toBe(true); // Default cache enabled
      expect(params.cacheTTL).toBe(3600); // Default TTL
    });
  });

  describe('Usage Statistics', () => {
    it('should provide comprehensive usage statistics', () => {
      optimizer.trackD1Read(1000);
      optimizer.trackD1Write(500);
      optimizer.trackKVOperation(2000);
      optimizer.trackWorkerRequest();
      
      const usage = optimizer.getUsage();
      
      expect(usage.d1Reads).toBe(1000);
      expect(usage.d1Writes).toBe(500);
      expect(usage.kvOperations).toBe(2000);
      expect(usage.workerRequests).toBe(1);
      expect(usage.timestamp).toBeDefined();
      expect(usage.limits).toEqual(CLOUDFLARE_FREE_LIMITS);
      expect(usage.percentages.d1Reads).toBeCloseTo((1000 / CLOUDFLARE_FREE_LIMITS.d1.dailyReads) * 100);
    });

    it('should log usage statistics without errors', () => {
      optimizer.trackD1Read(5000);
      optimizer.trackKVOperation(10000);
      
      // Should not throw
      expect(() => optimizer.logUsageStats()).not.toThrow();
    });
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = CloudflareOptimizer.getInstance();
      const instance2 = CloudflareOptimizer.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('should maintain state across getInstance calls', () => {
      const instance1 = CloudflareOptimizer.getInstance();
      instance1.trackD1Read(100);
      
      const instance2 = CloudflareOptimizer.getInstance();
      const usage = instance2.getUsage();
      
      expect(usage.d1Reads).toBe(100);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero operations correctly', () => {
      const usage = optimizer.getUsage();
      
      expect(usage.d1Reads).toBe(0);
      expect(usage.percentages.d1Reads).toBe(0);
      expect(optimizer.canPerformD1Read(1)).toBe(true);
    });

    it('should handle exact limit values', () => {
      optimizer.trackD1Read(CLOUDFLARE_FREE_LIMITS.d1.dailyReads);
      
      expect(optimizer.canPerformD1Read(1)).toBe(false);
      expect(optimizer.canPerformD1Read(0)).toBe(true);
      
      const remaining = optimizer.getRemainingCapacity();
      expect(remaining.d1Reads).toBe(0);
    });

    it('should handle large operation counts', () => {
      const largeCount = 50000;
      optimizer.trackKVOperation(largeCount);
      
      const usage = optimizer.getUsage();
      expect(usage.kvOperations).toBe(largeCount);
      expect(usage.percentages.kvOperations).toBe((largeCount / CLOUDFLARE_FREE_LIMITS.kv.dailyOperations) * 100);
    });
  });
});