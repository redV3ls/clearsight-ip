import { Context, Next } from 'hono';
import { AppError } from '../middleware/errorHandler';
import { Env } from '../index';
import { logger } from '../utils/logger';

export interface RateLimitTier {
  name: string;
  windowMs: number;
  maxRequests: number;
  description: string;
}

export interface RateLimitResult {
  allowed: boolean;
  totalHits: number;
  remaining: number;
  resetTime: Date;
  tier: string;
}

export interface RateLimitHeaders {
  'X-RateLimit-Limit': string;
  'X-RateLimit-Remaining': string;
  'X-RateLimit-Reset': string;
  'X-RateLimit-Policy': string;
  'Retry-After'?: string;
}

// Rate limit tiers for different user types
export const RATE_LIMIT_TIERS: Record<string, RateLimitTier> = {
  ANONYMOUS: {
    name: 'anonymous',
    windowMs: 900000, // 15 minutes
    maxRequests: 100,
    description: 'Anonymous users'
  },
  AUTHENTICATED: {
    name: 'authenticated',
    windowMs: 900000, // 15 minutes
    maxRequests: 500,
    description: 'Authenticated users'
  },
  API_KEY_BASIC: {
    name: 'api_key_basic',
    windowMs: 900000, // 15 minutes
    maxRequests: 1000,
    description: 'Basic API key users'
  },
  API_KEY_PREMIUM: {
    name: 'api_key_premium',
    windowMs: 900000, // 15 minutes
    maxRequests: 5000,
    description: 'Premium API key users'
  },
  AUTH_ENDPOINTS: {
    name: 'auth_endpoints',
    windowMs: 1000, // 1 second
    maxRequests: 2,
    description: 'Authentication endpoints (bot protection - max 2 requests per second)'
  }
};

export class ProductionRateLimiterService {
  private kv: KVNamespace;

  constructor(env: Env) {
    this.kv = env.CACHE;
  }

  /**
   * Check rate limit for a request
   */
  async checkRateLimit(
    clientId: string, 
    tier: RateLimitTier, 
    context?: string
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = Math.floor(now / tier.windowMs) * tier.windowMs;
    const resetTime = new Date(windowStart + tier.windowMs);
    
    const key = this.getRateLimitKey(clientId, tier.name, windowStart, context);
    
    try {
      // Get current count from KV
      const currentCountStr = await this.kv.get(key);
      const currentCount = currentCountStr ? parseInt(currentCountStr, 10) : 0;
      
      const totalHits = currentCount + 1;
      const remaining = Math.max(0, tier.maxRequests - totalHits);
      const allowed = totalHits <= tier.maxRequests;
      
      return {
        allowed,
        totalHits,
        remaining,
        resetTime,
        tier: tier.name
      };
    } catch (error) {
      logger.error('Rate limit check failed:', error);
      // Fail open - allow request if we can't check rate limit
      return {
        allowed: true,
        totalHits: 1,
        remaining: tier.maxRequests - 1,
        resetTime,
        tier: tier.name
      };
    }
  }

  /**
   * Increment rate limit counter
   */
  async incrementCounter(
    clientId: string, 
    tier: RateLimitTier, 
    context?: string
  ): Promise<void> {
    const now = Date.now();
    const windowStart = Math.floor(now / tier.windowMs) * tier.windowMs;
    const key = this.getRateLimitKey(clientId, tier.name, windowStart, context);
    
    try {
      // Get current count
      const currentCountStr = await this.kv.get(key);
      const currentCount = currentCountStr ? parseInt(currentCountStr, 10) : 0;
      const newCount = currentCount + 1;
      
      // Store with TTL equal to the window duration plus buffer
      const ttl = Math.ceil(tier.windowMs / 1000) + 60; // Add 60 seconds buffer
      await this.kv.put(key, newCount.toString(), { expirationTtl: ttl });
    } catch (error) {
      logger.error('Rate limit increment failed:', error);
      // Don't throw error as this would block legitimate requests
    }
  }

  /**
   * Reset rate limit for a client (admin function)
   */
  async resetRateLimit(clientId: string, tier: RateLimitTier, context?: string): Promise<void> {
    const now = Date.now();
    const windowStart = Math.floor(now / tier.windowMs) * tier.windowMs;
    const key = this.getRateLimitKey(clientId, tier.name, windowStart, context);
    
    try {
      await this.kv.delete(key);
      logger.info(`Rate limit reset for client: ${clientId}, tier: ${tier.name}`);
    } catch (error) {
      logger.error('Rate limit reset failed:', error);
      throw new AppError('Failed to reset rate limit', 500, 'RATE_LIMIT_RESET_FAILED');
    }
  }

  /**
   * Get rate limit headers for response
   */
  getRateLimitHeaders(result: RateLimitResult): RateLimitHeaders {
    const headers: RateLimitHeaders = {
      'X-RateLimit-Limit': RATE_LIMIT_TIERS[result.tier.toUpperCase()]?.maxRequests.toString() || '100',
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': Math.floor(result.resetTime.getTime() / 1000).toString(),
      'X-RateLimit-Policy': `${RATE_LIMIT_TIERS[result.tier.toUpperCase()]?.maxRequests || 100};w=${Math.floor((RATE_LIMIT_TIERS[result.tier.toUpperCase()]?.windowMs || 900000) / 1000)}`
    };

    if (!result.allowed) {
      headers['Retry-After'] = Math.ceil((result.resetTime.getTime() - Date.now()) / 1000).toString();
    }

    return headers;
  }

  /**
   * Determine rate limit tier based on request context
   */
  determineRateLimitTier(c: Context): RateLimitTier {
    // Check for API key
    const apiKey = c.req.header('X-API-Key');
    if (apiKey) {
      // In production, you would check the API key tier from database
      // For now, we'll use a simple heuristic
      if (apiKey.startsWith('premium_')) {
        return RATE_LIMIT_TIERS.API_KEY_PREMIUM;
      }
      return RATE_LIMIT_TIERS.API_KEY_BASIC;
    }

    // Check for authentication
    const authHeader = c.req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return RATE_LIMIT_TIERS.AUTHENTICATED;
    }

    // Check for auth endpoints (stricter limits)
    if (c.req.path.includes('/auth/')) {
      return RATE_LIMIT_TIERS.AUTH_ENDPOINTS;
    }

    // Default to anonymous
    return RATE_LIMIT_TIERS.ANONYMOUS;
  }

  /**
   * Get client identifier
   */
  getClientId(c: Context): string {
    // Try to get user ID from context first
    const user = c.get('user');
    if (user?.id) {
      return `user:${user.id}`;
    }

    // Try to get API key
    const apiKey = c.req.header('X-API-Key');
    if (apiKey) {
      return `api_key:${apiKey.substring(0, 8)}...`;
    }

    // Fall back to IP address
    const cfConnectingIp = c.req.header('CF-Connecting-IP');
    const xForwardedFor = c.req.header('X-Forwarded-For');
    const xRealIp = c.req.header('X-Real-IP');
    
    const ip = cfConnectingIp || xForwardedFor?.split(',')[0].trim() || xRealIp || 'anonymous';
    return `ip:${ip}`;
  }

  /**
   * Clean up expired rate limit entries
   */
  async cleanupExpiredEntries(): Promise<void> {
    try {
      // List all rate limit keys
      const { keys } = await this.kv.list({ prefix: 'rate_limit:' });
      
      let cleanedCount = 0;
      for (const key of keys) {
        try {
          // KV automatically expires entries, but we can clean up manually if needed
          const value = await this.kv.get(key.name);
          if (!value) {
            cleanedCount++;
          }
        } catch (error) {
          // Key might have been deleted already
        }
      }

      logger.info(`Rate limit cleanup completed, processed ${keys.length} keys`);
    } catch (error) {
      logger.error('Rate limit cleanup failed:', error);
    }
  }

  /**
   * Get rate limit statistics
   */
  async getRateLimitStats(): Promise<{
    totalKeys: number;
    tierBreakdown: Record<string, number>;
  }> {
    try {
      const { keys } = await this.kv.list({ prefix: 'rate_limit:' });
      
      const tierBreakdown: Record<string, number> = {};
      
      for (const key of keys) {
        const parts = key.name.split(':');
        if (parts.length >= 3) {
          const tier = parts[2];
          tierBreakdown[tier] = (tierBreakdown[tier] || 0) + 1;
        }
      }

      return {
        totalKeys: keys.length,
        tierBreakdown
      };
    } catch (error) {
      logger.error('Failed to get rate limit stats:', error);
      return {
        totalKeys: 0,
        tierBreakdown: {}
      };
    }
  }

  /**
   * Generate rate limit key
   */
  private getRateLimitKey(
    clientId: string, 
    tier: string, 
    windowStart: number, 
    context?: string
  ): string {
    const baseKey = `rate_limit:${clientId}:${tier}:${windowStart}`;
    return context ? `${baseKey}:${context}` : baseKey;
  }
}

/**
 * Production rate limiting middleware
 */
export const productionRateLimiter = () => {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    // Skip rate limiting for health checks and internal endpoints
    const skipPaths = ['/health', '/favicon.ico', '/openapi.json'];
    if (skipPaths.some(path => c.req.path.startsWith(path))) {
      return next();
    }

    // Skip if rate limiting is disabled in environment
    if (c.env.NODE_ENV === 'development' && !c.env.ENABLE_RATE_LIMITING) {
      return next();
    }

    if (!c.env.CACHE) {
      logger.error('Cache service unavailable for rate limiting');
      // Fail open in production to avoid blocking all requests
      return next();
    }

    const rateLimiter = new ProductionRateLimiterService(c.env);
    
    try {
      // Determine client and tier
      const clientId = rateLimiter.getClientId(c);
      const tier = rateLimiter.determineRateLimitTier(c);
      const context = c.req.path.split('/')[3]; // e.g., 'auth', 'analyze', etc.

      // Check rate limit
      const result = await rateLimiter.checkRateLimit(clientId, tier, context);
      
      // Set rate limit headers
      const headers = rateLimiter.getRateLimitHeaders(result);
      Object.entries(headers).forEach(([key, value]) => {
        if (value) c.header(key, value);
      });

      // Block if rate limited
      if (!result.allowed) {
        logger.warn(`Rate limit exceeded for client: ${clientId}, tier: ${tier.name}`, {
          path: c.req.path,
          totalHits: result.totalHits,
          limit: tier.maxRequests
        });

        throw new AppError(
          `Rate limit exceeded. Try again in ${Math.ceil((result.resetTime.getTime() - Date.now()) / 1000)} seconds.`,
          429,
          'RATE_LIMIT_EXCEEDED'
        );
      }

      // Increment counter for successful check
      await rateLimiter.incrementCounter(clientId, tier, context);

      // Continue to next middleware
      await next();

    } catch (error) {
      if (error instanceof AppError && error.statusCode === 429) {
        throw error;
      }
      
      logger.error('Rate limiting middleware error:', error);
      // Fail open - allow request if rate limiting fails
      await next();
    }
  };
};

/**
 * Specialized rate limiter for authentication endpoints
 */
export const authenticationRateLimiter = () => {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    if (!c.env.CACHE) {
      return next();
    }

    const rateLimiter = new ProductionRateLimiterService(c.env);
    const clientId = rateLimiter.getClientId(c);
    const tier = RATE_LIMIT_TIERS.AUTH_ENDPOINTS;

    try {
      const result = await rateLimiter.checkRateLimit(clientId, tier, 'auth');
      
      const headers = rateLimiter.getRateLimitHeaders(result);
      Object.entries(headers).forEach(([key, value]) => {
        if (value) c.header(key, value);
      });

      if (!result.allowed) {
        logger.warn(`Auth rate limit exceeded for client: ${clientId}`, {
          path: c.req.path,
          totalHits: result.totalHits
        });

        throw new AppError(
          'Too many authentication attempts. Please try again later.',
          429,
          'AUTH_RATE_LIMIT_EXCEEDED'
        );
      }

      await rateLimiter.incrementCounter(clientId, tier, 'auth');
      await next();

    } catch (error) {
      if (error instanceof AppError && error.statusCode === 429) {
        throw error;
      }
      
      logger.error('Auth rate limiting error:', error);
      await next();
    }
  };
};