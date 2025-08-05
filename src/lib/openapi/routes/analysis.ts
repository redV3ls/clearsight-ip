import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { Env } from '../../../index';
import {
  ResumeAnalysisRequestSchema,
  TeamAnalysisRequestSchema,
  GapAnalysisRequestSchema,
  ResumeAnalysisResponseSchema,
  TeamAnalysisResponseSchema,
  GapAnalysisResponseSchema,
  AnalysisHistoryResponseSchema
} from '../schemas/analysis';
import { ErrorResponseSchema } from '../schemas/common';

/**
 * Analysis Route Documentation
 * 
 * OpenAPI documentation for analysis endpoints.
 * Includes resume, team, gap, and trends analysis.
 */

export function analysisRoutes(app: OpenAPIHono<{ Bindings: Env }>) {
  
  // POST /analyze/resume
  const resumeAnalysisRoute = createRoute({
    method: 'post',
    path: '/api/v1/analyze/resume',
    tags: ['Analysis'],
    summary: 'Analyze resume/CV',
    description: 'Analyze uploaded resume or CV text against job requirements with AI-powered insights.',
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          'multipart/form-data': {
            schema: ResumeAnalysisRequestSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Resume analysis completed successfully',
        content: {
          'application/json': {
            schema: ResumeAnalysisResponseSchema
          }
        }
      },
      400: {
        description: 'Invalid request data or file format',
        content: {
          'application/json': {
            schema: ErrorResponseSchema
          }
        }
      },
      401: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: ErrorResponseSchema
          }
        }
      },
      429: {
        description: 'Rate limit exceeded',
        content: {
          'application/json': {
            schema: ErrorResponseSchema
          }
        }
      }
    }
  });

  // POST /analyze/team
  const teamAnalysisRoute = createRoute({
    method: 'post',
    path: '/api/v1/analyze/team',
    tags: ['Analysis'],
    summary: 'Analyze team capabilities',
    description: 'Analyze team member skills against project requirements.',
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          'application/json': {
            schema: TeamAnalysisRequestSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Team analysis completed successfully',
        content: {
          'application/json': {
            schema: TeamAnalysisResponseSchema
          }
        }
      },
      400: {
        description: 'Invalid request data',
        content: {
          'application/json': {
            schema: ErrorResponseSchema
          }
        }
      },
      401: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: ErrorResponseSchema
          }
        }
      }
    }
  });

  // POST /analyze/gap
  const gapAnalysisRoute = createRoute({
    method: 'post',
    path: '/api/v1/analyze/gap',
    tags: ['Analysis'],
    summary: 'Analyze skill gaps',
    description: 'Analyze gaps between current skills and target requirements.',
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          'application/json': {
            schema: GapAnalysisRequestSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Gap analysis completed successfully',
        content: {
          'application/json': {
            schema: GapAnalysisResponseSchema
          }
        }
      },
      400: {
        description: 'Invalid request data',
        content: {
          'application/json': {
            schema: ErrorResponseSchema
          }
        }
      },
      401: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: ErrorResponseSchema
          }
        }
      }
    }
  });

  // GET /analyze/history
  const analysisHistoryRoute = createRoute({
    method: 'get',
    path: '/api/v1/analyze/history',
    tags: ['Analysis'],
    summary: 'Get analysis history',
    description: 'Retrieve user\'s analysis history with pagination.',
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'Analysis history retrieved successfully',
        content: {
          'application/json': {
            schema: AnalysisHistoryResponseSchema
          }
        }
      },
      401: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: ErrorResponseSchema
          }
        }
      }
    }
  });

  // Register routes for documentation
  app.openapi(resumeAnalysisRoute, (c) => c.json({ message: 'Resume analysis endpoint' }));
  app.openapi(teamAnalysisRoute, (c) => c.json({ message: 'Team analysis endpoint' }));
  app.openapi(gapAnalysisRoute, (c) => c.json({ message: 'Gap analysis endpoint' }));
  app.openapi(analysisHistoryRoute, (c) => c.json({ message: 'Analysis history endpoint' }));
}