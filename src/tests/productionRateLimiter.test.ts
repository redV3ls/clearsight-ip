import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductionRateLimiterService, RATE_LIMIT_TIERS } from '../services/productionRateLimiter';

// Mock environment
const mockEnv = {
  CACHE: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    list: vi.fn()
  }
};

describe('ProductionRateLimiterService', () => {
  let rateLimiter: ProductionRateLimiterService;

  beforeEach(() => {
    vi.clearAllMocks();
    rateLimiter = new ProductionRateLimiterService(mockEnv as any);
  });

  describe('checkRateLimit', () => {
    it('should allow requests within limit', async () => {
      mockEnv.CACHE.get.mockResolvedValue('5'); // 5 previous requests

      const result = await rateLimiter.checkRateLimit(
        'test-client',
        RATE_LIMIT_TIERS.ANONYMOUS
      );

      expect(result.allowed).toBe(true);
      expect(result.totalHits).toBe(6);
      expect(result.remaining).toBe(94); // 100 - 6
      expect(result.tier).toBe('anonymous');
    });

    it('should block requests over limit', async () => {
      mockEnv.CACHE.get.mockResolvedValue('100'); // At limit

      const result = await rateLimiter.checkRateLimit(
        'test-client',
        RATE_LIMIT_TIERS.ANONYMOUS
      );

      expect(result.allowed).toBe(false);
      expect(result.totalHits).toBe(101);
      expect(result.remaining).toBe(0);
    });

    it('should handle cache errors gracefully', async () => {
      mockEnv.CACHE.get.mockRejectedValue(new Error('Cache error'));

      const result = await rateLimiter.checkRateLimit(
        'test-client',
        RATE_LIMIT_TIERS.ANONYMOUS
      );

      // Should fail open
      expect(result.allowed).toBe(true);
    });
  });

  describe('incrementCounter', () => {
    it('should increment counter in cache', async () => {
      mockEnv.CACHE.get.mockResolvedValue('5');
      mockEnv.CACHE.put.mockResolvedValue(undefined);

      await rateLimiter.incrementCounter(
        'test-client',
        RATE_LIMIT_TIERS.ANONYMOUS
      );

      expect(mockEnv.CACHE.put).toHaveBeenCalledWith(
        expect.stringContaining('rate_limit:test-client:anonymous:'),
        '6',
        { expirationTtl: expect.any(Number) }
      );
    });

    it('should handle cache errors gracefully', async () => {
      mockEnv.CACHE.get.mockRejectedValue(new Error('Cache error'));

      // Should not throw
      await expect(rateLimiter.incrementCounter(
        'test-client',
        RATE_LIMIT_TIERS.ANONYMOUS
      )).resolves.not.toThrow();
    });
  });

  describe('getRateLimitHeaders', () => {
    it('should return correct headers for allowed request', () => {
      const result = {
        allowed: true,
        totalHits: 50,
        remaining: 50,
        resetTime: new Date('2024-01-20T15:00:00Z'),
        tier: 'anonymous'
      };

      const headers = rateLimiter.getRateLimitHeaders(result);

      expect(headers['X-RateLimit-Limit']).toBe('100');
      expect(headers['X-RateLimit-Remaining']).toBe('50');
      expect(headers['X-RateLimit-Reset']).toBe('1705762800');
      expect(headers['X-RateLimit-Policy']).toBe('100;w=900');
      expect(headers['Retry-After']).toBeUndefined();
    });

    it('should include Retry-After header for blocked request', () => {
      const result = {
        allowed: false,
        totalHits: 101,
        remaining: 0,
        resetTime: new Date(Date.now() + 300000), // 5 minutes from now
        tier: 'anonymous'
      };

      const headers = rateLimiter.getRateLimitHeaders(result);

      expect(headers['Retry-After']).toBeDefined();
      expect(parseInt(headers['Retry-After']!)).toBeGreaterThan(0);
    });
  });

  describe('cleanupExpiredEntries', () => {
    it('should list and process rate limit keys', async () => {
      mockEnv.CACHE.list.mockResolvedValue({
        keys: [
          { name: 'rate_limit:client1:anonymous:1234567890' },
          { name: 'rate_limit:client2:authenticated:1234567890' }
        ]
      });
      mockEnv.CACHE.get.mockResolvedValue(null);

      await rateLimiter.cleanupExpiredEntries();

      expect(mockEnv.CACHE.list).toHaveBeenCalledWith({ prefix: 'rate_limit:' });
    });
  });

  describe('getRateLimitStats', () => {
    it('should return statistics about rate limit usage', async () => {
      mockEnv.CACHE.list.mockResolvedValue({
        keys: [
          { name: 'rate_limit:client1:anonymous:1234567890' },
          { name: 'rate_limit:client2:authenticated:1234567890' },
          { name: 'rate_limit:client3:anonymous:1234567890' }
        ]
      });

      const stats = await rateLimiter.getRateLimitStats();

      expect(stats.totalKeys).toBe(3);
      expect(stats.tierBreakdown).toEqual({
        anonymous: 2,
        authenticated: 1
      });
    });
  });
});