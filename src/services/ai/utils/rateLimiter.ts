/**
 * AI Service Rate Limiter
 * 
 * Manages rate limiting for AI service requests.
 * Prevents API quota exhaustion and ensures fair usage.
 */

import { logger } from '../../../utils/logger';
import { getRateLimitConfig } from '../core/config';

export interface RateLimitConfig {
  requestsPerHour: number;
  requestsPerDay: number;
  maxConcurrent: number;
}

export interface RateLimitStatus {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Rate Limiter for AI Services
 */
export class AIRateLimiter {
  private hourlyRequests: Map<string, { count: number; resetTime: number }> = new Map();
  private dailyRequests: Map<string, { count: number; resetTime: number }> = new Map();
  private concurrentRequests: Map<string, number> = new Map();
  private config: RateLimitConfig;

  constructor(tier: 'free' | 'premium' | 'enterprise' = 'free') {
    this.config = getRateLimitConfig(tier);
  }

  /**
   * Checks if request is allowed under rate limits
   */
  async checkRateLimit(userId: string, serviceName: string): Promise<RateLimitStatus> {
    const now = Date.now();
    
    // Check concurrent requests
    const concurrent = this.concurrentRequests.get(userId) || 0;
    if (concurrent >= this.config.maxConcurrent) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: now + 60000, // 1 minute
        retryAfter: 60
      };
    }

    // Check hourly limit
    const hourlyStatus = this.checkHourlyLimit(userId, now);
    if (!hourlyStatus.allowed) {
      return hourlyStatus;
    }

    // Check daily limit
    const dailyStatus = this.checkDailyLimit(userId, now);
    if (!dailyStatus.allowed) {
      return dailyStatus;
    }

    // All checks passed
    this.incrementCounters(userId, now);
    
    logger.info('Rate limit check passed', {
      userId,
      serviceName,
      hourlyRemaining: hourlyStatus.remaining,
      dailyRemaining: dailyStatus.remaining,
      concurrent: concurrent + 1
    });

    return {
      allowed: true,
      remaining: Math.min(hourlyStatus.remaining, dailyStatus.remaining),
      resetTime: Math.min(hourlyStatus.resetTime, dailyStatus.resetTime)
    };
  }

  /**
   * Increments request counters
   */
  private incrementCounters(userId: string, now: number): void {
    // Increment hourly counter
    const hourlyKey = userId;
    const hourlyData = this.hourlyRequests.get(hourlyKey);
    if (hourlyData && hourlyData.resetTime > now) {
      hourlyData.count++;
    } else {
      this.hourlyRequests.set(hourlyKey, {
        count: 1,
        resetTime: now + 3600000 // 1 hour
      });
    }

    // Increment daily counter
    const dailyData = this.dailyRequests.get(hourlyKey);
    if (dailyData && dailyData.resetTime > now) {
      dailyData.count++;
    } else {
      this.dailyRequests.set(hourlyKey, {
        count: 1,
        resetTime: now + 86400000 // 24 hours
      });
    }

    // Increment concurrent counter
    const concurrent = this.concurrentRequests.get(userId) || 0;
    this.concurrentRequests.set(userId, concurrent + 1);
  }

  /**
   * Checks hourly rate limit
   */
  private checkHourlyLimit(userId: string, now: number): RateLimitStatus {
    const hourlyData = this.hourlyRequests.get(userId);
    
    if (!hourlyData || hourlyData.resetTime <= now) {
      return {
        allowed: true,
        remaining: this.config.requestsPerHour - 1,
        resetTime: now + 3600000
      };
    }

    if (hourlyData.count >= this.config.requestsPerHour) {
      const retryAfter = Math.ceil((hourlyData.resetTime - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetTime: hourlyData.resetTime,
        retryAfter
      };
    }

    return {
      allowed: true,
      remaining: this.config.requestsPerHour - hourlyData.count - 1,
      resetTime: hourlyData.resetTime
    };
  }

  /**
   * Checks daily rate limit
   */
  private checkDailyLimit(userId: string, now: number): RateLimitStatus {
    const dailyData = this.dailyRequests.get(userId);
    
    if (!dailyData || dailyData.resetTime <= now) {
      return {
        allowed: true,
        remaining: this.config.requestsPerDay - 1,
        resetTime: now + 86400000
      };
    }

    if (dailyData.count >= this.config.requestsPerDay) {
      const retryAfter = Math.ceil((dailyData.resetTime - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetTime: dailyData.resetTime,
        retryAfter
      };
    }

    return {
      allowed: true,
      remaining: this.config.requestsPerDay - dailyData.count - 1,
      resetTime: dailyData.resetTime
    };
  }

  /**
   * Releases concurrent request slot
   */
  releaseRequest(userId: string): void {
    const concurrent = this.concurrentRequests.get(userId) || 0;
    if (concurrent > 0) {
      this.concurrentRequests.set(userId, concurrent - 1);
    }
  }

  /**
   * Gets current rate limit status for user
   */
  getRateLimitStatus(userId: string): {
    hourly: { used: number; limit: number; resetTime: number };
    daily: { used: number; limit: number; resetTime: number };
    concurrent: { used: number; limit: number };
  } {
    const now = Date.now();
    
    const hourlyData = this.hourlyRequests.get(userId);
    const dailyData = this.dailyRequests.get(userId);
    const concurrent = this.concurrentRequests.get(userId) || 0;

    return {
      hourly: {
        used: (hourlyData && hourlyData.resetTime > now) ? hourlyData.count : 0,
        limit: this.config.requestsPerHour,
        resetTime: (hourlyData && hourlyData.resetTime > now) ? hourlyData.resetTime : now + 3600000
      },
      daily: {
        used: (dailyData && dailyData.resetTime > now) ? dailyData.count : 0,
        limit: this.config.requestsPerDay,
        resetTime: (dailyData && dailyData.resetTime > now) ? dailyData.resetTime : now + 86400000
      },
      concurrent: {
        used: concurrent,
        limit: this.config.maxConcurrent
      }
    };
  }

  /**
   * Cleans up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    
    // Clean hourly requests
    for (const [key, data] of this.hourlyRequests.entries()) {
      if (data.resetTime <= now) {
        this.hourlyRequests.delete(key);
      }
    }

    // Clean daily requests
    for (const [key, data] of this.dailyRequests.entries()) {
      if (data.resetTime <= now) {
        this.dailyRequests.delete(key);
      }
    }

    // Clean zero concurrent requests
    for (const [key, count] of this.concurrentRequests.entries()) {
      if (count <= 0) {
        this.concurrentRequests.delete(key);
      }
    }
  }

  /**
   * Updates rate limit configuration
   */
  updateConfig(tier: 'free' | 'premium' | 'enterprise'): void {
    this.config = getRateLimitConfig(tier);
    logger.info('Rate limiter configuration updated', { tier, config: this.config });
  }
}