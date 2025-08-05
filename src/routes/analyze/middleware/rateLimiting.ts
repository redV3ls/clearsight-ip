import { Context, Next } from 'hono';
import { AuthenticatedContext } from '../../../middleware/auth';
import { AppError } from '../../../middleware/errorHandler';

/**
 * Rate Limiting Middleware for Analysis Routes
 * 
 * Implements analysis-specific rate limiting to prevent abuse
 * and ensure fair resource usage across users.
 */

// Rate limiting configuration
const RATE_LIMITS = {
  ANALYSIS_COOLDOWN: 30000, // 30 seconds between analysis requests
  MAX_DAILY_ANALYSES: 50, // Maximum analyses per day per user
  MAX_HOURLY_ANALYSES: 10, // Maximum analyses per hour per user
} as const;

export async function rateLimitingMiddleware(c: AuthenticatedContext, next: Next) {
  try {
    const userId = c.user!.id;
    const now = Date.now();
    
    // Check analysis cooldown (30 seconds between requests)
    await checkAnalysisCooldown(c, userId, now);
    
    // Check hourly rate limit
    await checkHourlyRateLimit(c, userId, now);
    
    // Check daily rate limit
    await checkDailyRateLimit(c, userId, now);
    
    // Update rate limiting counters
    await updateRateLimitCounters(c, userId, now);
    
    await next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Rate limiting check failed', 500, 'RATE_LIMIT_ERROR');
  }
}

/**
 * Checks if user is within the analysis cooldown period
 */
async function checkAnalysisCooldown(c: AuthenticatedContext, userId: string, now: number) {
  const rateLimitKey = `analysis_cooldown:${userId}`;
  const lastAnalysis = await c.env.CACHE.get(rateLimitKey);
  
  if (lastAnalysis) {
    const timeSinceLastAnalysis = now - parseInt(lastAnalysis);
    
    if (timeSinceLastAnalysis < RATE_LIMITS.ANALYSIS_COOLDOWN) {
      const remainingTime = Math.ceil((RATE_LIMITS.ANALYSIS_COOLDOWN - timeSinceLastAnalysis) / 1000);
      throw new AppError(
        `Please wait ${remainingTime} seconds before starting another analysis`,
        429,
        'ANALYSIS_COOLDOWN'
      );
    }
  }
}

/**
 * Checks hourly rate limit for analyses
 */
async function checkHourlyRateLimit(c: AuthenticatedContext, userId: string, now: number) {
  const hourKey = `analysis_hour:${userId}:${Math.floor(now / (60 * 60 * 1000))}`;
  const hourlyCount = await c.env.CACHE.get(hourKey);
  
  if (hourlyCount && parseInt(hourlyCount) >= RATE_LIMITS.MAX_HOURLY_ANALYSES) {
    throw new AppError(
      `Hourly analysis limit exceeded. Maximum ${RATE_LIMITS.MAX_HOURLY_ANALYSES} analyses per hour`,
      429,
      'HOURLY_RATE_LIMIT'
    );
  }
}

/**
 * Checks daily rate limit for analyses
 */
async function checkDailyRateLimit(c: AuthenticatedContext, userId: string, now: number) {
  const dayKey = `analysis_day:${userId}:${Math.floor(now / (24 * 60 * 60 * 1000))}`;
  const dailyCount = await c.env.CACHE.get(dayKey);
  
  if (dailyCount && parseInt(dailyCount) >= RATE_LIMITS.MAX_DAILY_ANALYSES) {
    throw new AppError(
      `Daily analysis limit exceeded. Maximum ${RATE_LIMITS.MAX_DAILY_ANALYSES} analyses per day`,
      429,
      'DAILY_RATE_LIMIT'
    );
  }
}

/**
 * Updates rate limiting counters after successful validation
 */
async function updateRateLimitCounters(c: AuthenticatedContext, userId: string, now: number) {
  const promises = [];
  
  // Update cooldown timestamp
  const cooldownKey = `analysis_cooldown:${userId}`;
  promises.push(c.env.CACHE.put(cooldownKey, now.toString(), { expirationTtl: 60 }));
  
  // Update hourly counter
  const hourKey = `analysis_hour:${userId}:${Math.floor(now / (60 * 60 * 1000))}`;
  const currentHourlyCount = await c.env.CACHE.get(hourKey);
  const newHourlyCount = currentHourlyCount ? parseInt(currentHourlyCount) + 1 : 1;
  promises.push(c.env.CACHE.put(hourKey, newHourlyCount.toString(), { expirationTtl: 3600 }));
  
  // Update daily counter
  const dayKey = `analysis_day:${userId}:${Math.floor(now / (24 * 60 * 60 * 1000))}`;
  const currentDailyCount = await c.env.CACHE.get(dayKey);
  const newDailyCount = currentDailyCount ? parseInt(currentDailyCount) + 1 : 1;
  promises.push(c.env.CACHE.put(dayKey, newDailyCount.toString(), { expirationTtl: 86400 }));
  
  await Promise.all(promises);
}