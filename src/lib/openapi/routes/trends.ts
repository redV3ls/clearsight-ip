import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { Env } from '../../../index';
import {
  TrendsAnalysisRequestSchema,
  TrendsAnalysisResponseSchema
} from '../schemas/analysis';
import { ErrorResponseSchema } from '../schemas/common';

/**
 * Trends Route Documentation
 * 
 * OpenAPI documentation for trends analysis endpoints.
 * Includes industry trends, skill demand, and market insights.
 */

export function trendsRoutes(app: OpenAPIHono<{ Bindings: Env }>) {
  
  // POST /analyze/trends
  const trendsAnalysisRoute = createRoute({
    method: 'post',
    path: '/api/v1/analyze/trends',
    tags: ['Trends'],
    summary: 'Analyze industry trends',
    description: 'Analyze industry trends and skill demand patterns.',
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          'application/json': {
            schema: TrendsAnalysisRequestSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Trends analysis completed successfully',
        content: {
          'application/json': {
            schema: TrendsAnalysisResponseSchema
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

  // Register route for documentation
  app.openapi(trendsAnalysisRoute, (c) => c.json({ message: 'Trends analysis endpoint' }));
}