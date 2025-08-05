/**
 * Trends Analysis Routes
 * 
 * Standardized trends analysis endpoints using the new route builder system.
 * Provides consistent validation, error handling, and response formatting.
 */

import { Context } from 'hono';
import { createRouteBuilder } from '../common/routeBuilder';
import { CommonSchemas } from '../../middleware/common/validation';
import { createResponse } from '../../middleware/common/responseBuilder';
import { TrendsAnalysisService } from '../../services/trendsAnalysis';
import { createDatabase } from '../../config/database';
import { logger } from '../../utils/logger';

/**
 * Trends validation schemas
 */
const TrendsSchemas = {
  industryTrends: {
    type: 'object' as const,
    properties: {
      region: {
        type: 'string' as const,
        required: false,
        maxLength: 100
      },
      limit: {
        type: 'number' as const,
        required: false,
        min: 1,
        max: 50
      }
    }
  },

  emergingSkills: {
    type: 'object' as const,
    properties: {
      category: {
        type: 'string' as const,
        required: false,
        maxLength: 100
      },
      minGrowthRate: {
        type: 'number' as const,
        required: false,
        min: 0,
        max: 1
      },
      limit: {
        type: 'number' as const,
        required: false,
        min: 1,
        max: 50
      }
    }
  },

  regionalTrends: {
    type: 'object' as const,
    properties: {
      skillCategory: {
        type: 'string' as const,
        required: false,
        maxLength: 100
      },
      limit: {
        type: 'number' as const,
        required: false,
        min: 1,
        max: 50
      }
    }
  },

  forecast: {
    type: 'object' as const,
    required: true,
    properties: {
      skill_names: {
        type: 'array' as const,
        required: true,
        minLength: 1,
        maxLength: 20,
        items: {
          type: 'string' as const,
          minLength: 1,
          maxLength: 100
        }
      },
      industry: {
        type: 'string' as const,
        required: false,
        maxLength: 100
      },
      region: {
        type: 'string' as const,
        required: false,
        maxLength: 100
      }
    }
  },

  velocity: {
    type: 'object' as const,
    properties: {
      timeWindow: {
        type: 'number' as const,
        required: false,
        min: 1,
        max: 24
      }
    }
  },

  decliningSkills: {
    type: 'object' as const,
    properties: {
      threshold: {
        type: 'number' as const,
        required: false,
        min: -1,
        max: 0
      },
      timeWindow: {
        type: 'number' as const,
        required: false,
        min: 1,
        max: 24
      }
    }
  },

  industryParam: {
    type: 'object' as const,
    required: true,
    properties: {
      industry: {
        type: 'string' as const,
        required: true,
        minLength: 1,
        maxLength: 100
      }
    }
  }
};

/**
 * Trends route handlers
 */
class TrendsHandlers {
  /**
   * GET /trends/industry/:industry
   * Get industry-specific trends
   */
  static async getIndustryTrends(c: Context): Promise<Response> {
    const response = createResponse(c);
    
    try {
      const { industry } = c.get('validatedParams');
      const query = c.get('validatedQuery') || {};
      const { region, limit = 10 } = query;

      logger.info('Industry trends request', {
        requestId: c.get('requestId'),
        industry,
        region,
        limit
      });

      const db = createDatabase(c.env.DB);
      const trendsService = new TrendsAnalysisService(db, c.env.CACHE);

      const trends = await trendsService.getIndustryTrends(industry, {
        region,
        limit
      });

      return response.success({
        industry,
        region,
        trends,
        metadata: {
          count: trends.length,
          limit
        }
      });

    } catch (error) {
      logger.error('Industry trends request failed', {
        requestId: c.get('requestId'),
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return response.error(
        'INDUSTRY_TRENDS_ERROR',
        'Failed to retrieve industry trends',
        500
      );
    }
  }

  /**
   * GET /trends/emerging
   * Get emerging skills trends
   */
  static async getEmergingSkills(c: Context): Promise<Response> {
    const response = createResponse(c);
    
    try {
      const query = c.get('validatedQuery') || {};
      const { category, minGrowthRate = 0.2, limit = 20 } = query;

      logger.info('Emerging skills request', {
        requestId: c.get('requestId'),
        category,
        minGrowthRate,
        limit
      });

      const db = createDatabase(c.env.DB);
      const trendsService = new TrendsAnalysisService(db, c.env.CACHE);

      const emergingSkills = await trendsService.getEmergingSkills({
        category,
        minGrowthRate,
        limit
      });

      return response.success({
        emergingSkills,
        filters: {
          category,
          minGrowthRate,
          limit
        },
        metadata: {
          count: emergingSkills.length
        }
      });

    } catch (error) {
      logger.error('Emerging skills request failed', {
        requestId: c.get('requestId'),
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return response.error(
        'EMERGING_SKILLS_ERROR',
        'Failed to retrieve emerging skills',
        500
      );
    }
  }

  /**
   * GET /trends/regional
   * Get regional trends analysis
   */
  static async getRegionalTrends(c: Context): Promise<Response> {
    const response = createResponse(c);
    
    try {
      const query = c.get('validatedQuery') || {};
      const { skillCategory, limit = 10 } = query;

      logger.info('Regional trends request', {
        requestId: c.get('requestId'),
        skillCategory,
        limit
      });

      const db = createDatabase(c.env.DB);
      const trendsService = new TrendsAnalysisService(db, c.env.CACHE);

      const regionalTrends = await trendsService.getRegionalTrends({
        skillCategory,
        limit
      });

      return response.success({
        regionalTrends,
        filters: {
          skillCategory,
          limit
        },
        metadata: {
          count: regionalTrends.length
        }
      });

    } catch (error) {
      logger.error('Regional trends request failed', {
        requestId: c.get('requestId'),
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return response.error(
        'REGIONAL_TRENDS_ERROR',
        'Failed to retrieve regional trends',
        500
      );
    }
  }

  /**
   * POST /trends/forecast
   * Generate skills demand forecast
   */
  static async generateForecast(c: Context): Promise<Response> {
    const response = createResponse(c);
    
    try {
      const { skill_names, industry, region } = c.get('validatedBody');

      logger.info('Forecast request', {
        requestId: c.get('requestId'),
        skillCount: skill_names.length,
        industry,
        region
      });

      const db = createDatabase(c.env.DB);
      const trendsService = new TrendsAnalysisService(db, c.env.CACHE);

      const forecast = await trendsService.generateForecast({
        skill_names,
        industry,
        region
      });

      return response.success({
        forecast,
        parameters: {
          skills: skill_names,
          industry,
          region
        },
        metadata: {
          skillCount: skill_names.length,
          forecastPeriod: '12 months'
        }
      });

    } catch (error) {
      logger.error('Forecast request failed', {
        requestId: c.get('requestId'),
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return response.error(
        'FORECAST_ERROR',
        'Failed to generate forecast',
        500
      );
    }
  }

  /**
   * GET /trends/velocity
   * Get skills velocity analysis
   */
  static async getSkillsVelocity(c: Context): Promise<Response> {
    const response = createResponse(c);
    
    try {
      const query = c.get('validatedQuery') || {};
      const { timeWindow = 6 } = query;

      logger.info('Skills velocity request', {
        requestId: c.get('requestId'),
        timeWindow
      });

      const db = createDatabase(c.env.DB);
      const trendsService = new TrendsAnalysisService(db, c.env.CACHE);

      const velocity = await trendsService.getSkillsVelocity({
        timeWindow
      });

      return response.success({
        velocity,
        parameters: {
          timeWindow
        },
        metadata: {
          analysisWindow: `${timeWindow} months`
        }
      });

    } catch (error) {
      logger.error('Skills velocity request failed', {
        requestId: c.get('requestId'),
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return response.error(
        'VELOCITY_ERROR',
        'Failed to retrieve skills velocity',
        500
      );
    }
  }

  /**
   * GET /trends/declining
   * Get declining skills analysis
   */
  static async getDecliningSkills(c: Context): Promise<Response> {
    const response = createResponse(c);
    
    try {
      const query = c.get('validatedQuery') || {};
      const { threshold = -0.1, timeWindow = 12 } = query;

      logger.info('Declining skills request', {
        requestId: c.get('requestId'),
        threshold,
        timeWindow
      });

      const db = createDatabase(c.env.DB);
      const trendsService = new TrendsAnalysisService(db, c.env.CACHE);

      const decliningSkills = await trendsService.getDecliningSkills({
        threshold,
        timeWindow
      });

      return response.success({
        decliningSkills,
        parameters: {
          threshold,
          timeWindow
        },
        metadata: {
          count: decliningSkills.length,
          analysisWindow: `${timeWindow} months`
        }
      });

    } catch (error) {
      logger.error('Declining skills request failed', {
        requestId: c.get('requestId'),
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return response.error(
        'DECLINING_SKILLS_ERROR',
        'Failed to retrieve declining skills',
        500
      );
    }
  }

  /**
   * GET /trends/summary
   * Get comprehensive trends summary
   */
  static async getTrendsSummary(c: Context): Promise<Response> {
    const response = createResponse(c);
    
    try {
      logger.info('Trends summary request', {
        requestId: c.get('requestId')
      });

      const db = createDatabase(c.env.DB);
      const trendsService = new TrendsAnalysisService(db, c.env.CACHE);

      // Get multiple trend analyses in parallel
      const [emergingSkills, decliningSkills, velocity] = await Promise.all([
        trendsService.getEmergingSkills({ limit: 10 }),
        trendsService.getDecliningSkills({ limit: 10 }),
        trendsService.getSkillsVelocity({ timeWindow: 6 })
      ]);

      return response.success({
        summary: {
          emergingSkills: emergingSkills.slice(0, 5),
          decliningSkills: decliningSkills.slice(0, 5),
          topVelocity: velocity.slice(0, 5)
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          dataWindow: '6 months'
        }
      });

    } catch (error) {
      logger.error('Trends summary request failed', {
        requestId: c.get('requestId'),
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return response.error(
        'TRENDS_SUMMARY_ERROR',
        'Failed to retrieve trends summary',
        500
      );
    }
  }
}

/**
 * Create and configure trends routes
 */
const trendsRoutes = createRouteBuilder('/trends')
  .get('/industry/:industry', TrendsHandlers.getIndustryTrends, {
    validation: { 
      params: TrendsSchemas.industryParam,
      query: TrendsSchemas.industryTrends 
    },
    auth: { required: true },
    description: 'Get industry-specific trends analysis',
    tags: ['Trends', 'Industry Analysis']
  })
  .get('/emerging', TrendsHandlers.getEmergingSkills, {
    validation: { query: TrendsSchemas.emergingSkills },
    auth: { required: true },
    description: 'Get emerging skills trends',
    tags: ['Trends', 'Skills Analysis']
  })
  .get('/regional', TrendsHandlers.getRegionalTrends, {
    validation: { query: TrendsSchemas.regionalTrends },
    auth: { required: true },
    description: 'Get regional trends analysis',
    tags: ['Trends', 'Regional Analysis']
  })
  .post('/forecast', TrendsHandlers.generateForecast, {
    validation: { body: TrendsSchemas.forecast },
    auth: { required: true },
    description: 'Generate skills demand forecast',
    tags: ['Trends', 'Forecasting']
  })
  .get('/velocity', TrendsHandlers.getSkillsVelocity, {
    validation: { query: TrendsSchemas.velocity },
    auth: { required: true },
    description: 'Get skills velocity analysis',
    tags: ['Trends', 'Skills Analysis']
  })
  .get('/declining', TrendsHandlers.getDecliningSkills, {
    validation: { query: TrendsSchemas.decliningSkills },
    auth: { required: true },
    description: 'Get declining skills analysis',
    tags: ['Trends', 'Skills Analysis']
  })
  .get('/summary', TrendsHandlers.getTrendsSummary, {
    auth: { required: true },
    description: 'Get comprehensive trends summary',
    tags: ['Trends', 'Summary']
  });

export default trendsRoutes.getApp();