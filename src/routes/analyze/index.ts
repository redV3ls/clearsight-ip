/**
 * Analysis Routes
 * 
 * Standardized CV and skills analysis endpoints using the new route builder system.
 * Provides consistent validation, error handling, and response formatting.
 */

import { Context } from 'hono';
import { createRouteBuilder } from '../common/routeBuilder';
import { CommonSchemas } from '../../middleware/common/validation';
import { createResponse } from '../../middleware/common/responseBuilder';
import { logger } from '../../utils/logger';

// Import existing handlers from the analyze route structure
import { resumeHandler, getResumeStatusHandler } from './handlers/resume';
import { gapHandler } from './handlers/gap';
import { teamHandler } from './handlers/team';
import { trendsHandler } from './handlers/trends';

/**
 * Analysis validation schemas
 */
const AnalysisSchemas = {
  resumeAnalysis: {
    type: 'object' as const,
    required: true,
    properties: {
      text: {
        type: 'string' as const,
        required: true,
        minLength: 10,
        maxLength: 50000
      },
      analysisType: {
        type: 'string' as const,
        required: false,
        enum: ['basic', 'detailed', 'comprehensive']
      },
      includeSkills: {
        type: 'boolean' as const,
        required: false
      },
      includeExperience: {
        type: 'boolean' as const,
        required: false
      }
    }
  },

  gapAnalysis: {
    type: 'object' as const,
    required: true,
    properties: {
      currentSkills: {
        type: 'array' as const,
        required: true,
        minLength: 1,
        items: {
          type: 'string' as const,
          minLength: 1,
          maxLength: 100
        }
      },
      targetRole: {
        type: 'string' as const,
        required: true,
        minLength: 1,
        maxLength: 200
      },
      industry: {
        type: 'string' as const,
        required: false,
        maxLength: 100
      },
      experienceLevel: {
        type: 'string' as const,
        required: false,
        enum: ['entry', 'mid', 'senior', 'executive']
      }
    }
  },

  teamAnalysis: {
    type: 'object' as const,
    required: true,
    properties: {
      teamMembers: {
        type: 'array' as const,
        required: true,
        minLength: 2,
        maxLength: 50,
        items: {
          type: 'object' as const,
          properties: {
            name: {
              type: 'string' as const,
              required: true,
              maxLength: 100
            },
            skills: {
              type: 'array' as const,
              required: true,
              items: {
                type: 'string' as const,
                maxLength: 100
              }
            },
            role: {
              type: 'string' as const,
              required: false,
              maxLength: 100
            }
          }
        }
      },
      projectRequirements: {
        type: 'array' as const,
        required: false,
        items: {
          type: 'string' as const,
          maxLength: 200
        }
      }
    }
  },

  trendsAnalysis: {
    type: 'object' as const,
    required: true,
    properties: {
      skills: {
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
      timeframe: {
        type: 'string' as const,
        required: false,
        enum: ['3months', '6months', '1year', '2years']
      },
      region: {
        type: 'string' as const,
        required: false,
        maxLength: 100
      }
    }
  },

  fileUpload: {
    type: 'object' as const,
    required: true,
    properties: {
      file: CommonSchemas.file
    }
  }
};

/**
 * Analysis route handlers
 */
class AnalysisHandlers {
  /**
   * POST /analyze/resume
   * Analyze resume text or uploaded file
   */
  static async analyzeResume(c: Context): Promise<Response> {
    const response = createResponse(c);
    
    try {
      logger.info('Resume analysis request', {
        requestId: c.get('requestId'),
        hasFile: !!c.req.header('content-type')?.includes('multipart/form-data')
      });

      // Cast context to AuthenticatedContext for existing handler
      const authContext = c as any; // AuthenticatedContext
      return await resumeHandler(authContext);

    } catch (error) {
      logger.error('Resume analysis failed', {
        requestId: c.get('requestId'),
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return response.error(
        'RESUME_ANALYSIS_ERROR',
        'Failed to analyze resume',
        500
      );
    }
  }

  /**
   * POST /analyze/gap
   * Perform skills gap analysis
   */
  static async analyzeGap(c: Context): Promise<Response> {
    const response = createResponse(c);
    
    try {
      const { currentSkills, targetRole, industry, experienceLevel } = c.get('validatedBody');

      logger.info('Gap analysis request', {
        requestId: c.get('requestId'),
        skillCount: currentSkills.length,
        targetRole,
        industry
      });

      // Cast context to AuthenticatedContext for existing handler
      const authContext = c as any; // AuthenticatedContext
      return await gapHandler(authContext);

    } catch (error) {
      logger.error('Gap analysis failed', {
        requestId: c.get('requestId'),
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return response.error(
        'GAP_ANALYSIS_ERROR',
        'Failed to perform gap analysis',
        500
      );
    }
  }

  /**
   * POST /analyze/team
   * Analyze team skills and composition
   */
  static async analyzeTeam(c: Context): Promise<Response> {
    const response = createResponse(c);
    
    try {
      const { teamMembers, projectRequirements } = c.get('validatedBody');

      logger.info('Team analysis request', {
        requestId: c.get('requestId'),
        teamSize: teamMembers.length,
        hasRequirements: !!projectRequirements
      });

      // Cast context to AuthenticatedContext for existing handler
      const authContext = c as any; // AuthenticatedContext
      return await teamHandler(authContext);

    } catch (error) {
      logger.error('Team analysis failed', {
        requestId: c.get('requestId'),
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return response.error(
        'TEAM_ANALYSIS_ERROR',
        'Failed to analyze team',
        500
      );
    }
  }

  /**
   * POST /analyze/trends
   * Analyze skills trends and market demand
   */
  static async analyzeTrends(c: Context): Promise<Response> {
    const response = createResponse(c);
    
    try {
      const { skills, timeframe, region } = c.get('validatedBody');

      logger.info('Trends analysis request', {
        requestId: c.get('requestId'),
        skillCount: skills.length,
        timeframe,
        region
      });

      // Cast context to AuthenticatedContext for existing handler
      const authContext = c as any; // AuthenticatedContext
      return await trendsHandler(authContext);

    } catch (error) {
      logger.error('Trends analysis failed', {
        requestId: c.get('requestId'),
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return response.error(
        'TRENDS_ANALYSIS_ERROR',
        'Failed to analyze trends',
        500
      );
    }
  }

  /**
   * GET /analyze/health
   * Health check for analysis services
   */
  static async healthCheck(c: Context): Promise<Response> {
    const response = createResponse(c);
    
    try {
      // TODO: Add actual health checks for analysis services
      const health = {
        status: 'healthy',
        services: {
          aiService: 'up',
          database: 'up',
          fileProcessor: 'up'
        },
        timestamp: new Date().toISOString()
      };

      return response.success(health);

    } catch (error) {
      logger.error('Analysis health check failed', {
        requestId: c.get('requestId'),
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return response.error(
        'HEALTH_CHECK_ERROR',
        'Analysis services health check failed',
        503
      );
    }
  }
}

/**
 * Create and configure analysis routes
 */
const analyzeRoutes = createRouteBuilder('/analyze')
  .post('/resume', AnalysisHandlers.analyzeResume, {
    validation: { body: AnalysisSchemas.resumeAnalysis },
    auth: { required: true },
    description: 'Analyze resume text or uploaded file',
    tags: ['Analysis', 'Resume'],
    rateLimit: { windowMs: 60 * 1000, maxRequests: 10 } // 10 requests per minute
  })
  .post('/gap', AnalysisHandlers.analyzeGap, {
    validation: { body: AnalysisSchemas.gapAnalysis },
    auth: { required: true },
    description: 'Perform skills gap analysis',
    tags: ['Analysis', 'Skills Gap']
  })
  .post('/team', AnalysisHandlers.analyzeTeam, {
    validation: { body: AnalysisSchemas.teamAnalysis },
    auth: { required: true },
    description: 'Analyze team skills and composition',
    tags: ['Analysis', 'Team']
  })
  .post('/trends', AnalysisHandlers.analyzeTrends, {
    validation: { body: AnalysisSchemas.trendsAnalysis },
    auth: { required: true },
    description: 'Analyze skills trends and market demand',
    tags: ['Analysis', 'Trends']
  })
  .get('/health', AnalysisHandlers.healthCheck, {
    description: 'Health check for analysis services',
    tags: ['Health', 'Analysis']
  })
  // Resume analysis status endpoint for polling
  .get('/resume/:id', async (c: any) => getResumeStatusHandler(c as any), {
    description: 'Get resume analysis status/result by ID',
    tags: ['Analysis', 'Resume']
  });

export default analyzeRoutes.getApp();
