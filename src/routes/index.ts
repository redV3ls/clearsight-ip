/**
 * Route Registry
 * 
 * Central registry for all application routes.
 * Provides a single point of configuration and documentation.
 */

import { Hono } from 'hono';
import { logger } from '../utils/logger';
import { createResponse } from '../middleware/common/responseBuilder';
import { generateRouteDocumentation } from './common/routeBuilder';

// Import route modules
import authRoutes from './auth';
import trendsRoutes from './trends';
import analyzeRoutes from './analyze';

/**
 * Main application router
 */
export class AppRouter {
  private app: Hono;
  private routes: Array<{
    path: string;
    handler: Hono;
    description: string;
    version: string;
  }> = [];

  constructor() {
    this.app = new Hono();
    this.setupGlobalMiddleware();
    this.registerRoutes();
    this.setupHealthCheck();
    this.setupDocumentation();
  }

  /**
   * Sets up global middleware
   */
  private setupGlobalMiddleware(): void {
    // Global error handler
    this.app.onError((error, c) => {
      logger.error('Global error handler', {
        requestId: c.get('requestId'),
        error: error.message,
        stack: error.stack,
        path: c.req.path,
        method: c.req.method
      });

      const response = createResponse(c);
      return response.error(
        'INTERNAL_ERROR',
        'An internal server error occurred',
        500
      );
    });

    // Global not found handler
    this.app.notFound((c) => {
      logger.warn('Route not found', {
        requestId: c.get('requestId'),
        path: c.req.path,
        method: c.req.method
      });

      const response = createResponse(c);
      return response.notFound('Route');
    });

    // Request logging middleware
    this.app.use('*', async (c, next) => {
      const start = Date.now();
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      c.set('requestId', requestId);
      c.set('startTime', start);

      logger.info('Request started', {
        requestId,
        method: c.req.method,
        path: c.req.path,
        userAgent: c.req.header('user-agent'),
        ip: c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for')
      });

      await next();

      const duration = Date.now() - start;
      logger.info('Request completed', {
        requestId,
        method: c.req.method,
        path: c.req.path,
        duration,
        status: c.res.status
      });
    });

    // CORS middleware
    this.app.use('*', async (c, next) => {
      // Set CORS headers
      c.header('Access-Control-Allow-Origin', '*');
      c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      c.header('Access-Control-Max-Age', '86400');

      // Handle preflight requests
      if (c.req.method === 'OPTIONS') {
        return c.text('', 204);
      }

      await next();
    });
  }

  /**
   * Registers all application routes
   */
  private registerRoutes(): void {
    // Authentication routes
    this.app.route('/api/auth', authRoutes);
    this.routes.push({
      path: '/api/auth',
      handler: authRoutes,
      description: 'Authentication and user management endpoints',
      version: '1.0.0'
    });

    // Trends analysis routes
    this.app.route('/api/trends', trendsRoutes);
    this.routes.push({
      path: '/api/trends',
      handler: trendsRoutes,
      description: 'Skills and industry trends analysis endpoints',
      version: '1.0.0'
    });

    // Analysis routes (existing analyze routes)
    this.app.route('/api/analyze', analyzeRoutes);
    this.routes.push({
      path: '/api/analyze',
      handler: analyzeRoutes,
      description: 'CV and skills analysis endpoints',
      version: '1.0.0'
    });

    logger.info('Routes registered', {
      routeCount: this.routes.length,
      routes: this.routes.map(r => ({ path: r.path, description: r.description }))
    });
  }

  /**
   * Sets up health check endpoint
   */
  private setupHealthCheck(): void {
    this.app.get('/health', async (c) => {
      const response = createResponse(c);
      
      try {
        // Basic health check
        const health = {
          status: 'healthy' as const,
          timestamp: new Date().toISOString(),
          uptime: process.uptime ? process.uptime() : 0,
          version: '1.0.0',
          services: {
            database: { status: 'up' as const },
            cache: { status: 'up' as const },
            ai: { status: 'up' as const }
          }
        };

        // TODO: Add actual service health checks
        // - Database connectivity
        // - Cache availability
        // - AI service status

        return response.success(health);
      } catch (error) {
        logger.error('Health check failed', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        return response.error(
          'HEALTH_CHECK_ERROR',
          'Health check failed',
          503
        );
      }
    });

    this.app.get('/health/detailed', async (c) => {
      const response = createResponse(c);
      
      try {
        const detailedHealth = {
          status: 'healthy' as const,
          timestamp: new Date().toISOString(),
          uptime: process.uptime ? process.uptime() : 0,
          version: '1.0.0',
          environment: c.env.NODE_ENV || 'unknown',
          services: {
            database: {
              status: 'up' as const,
              responseTime: 0,
              lastCheck: new Date().toISOString()
            },
            cache: {
              status: 'up' as const,
              responseTime: 0,
              lastCheck: new Date().toISOString()
            },
            ai: {
              status: 'up' as const,
              responseTime: 0,
              lastCheck: new Date().toISOString()
            }
          },
          routes: {
            total: this.routes.length,
            registered: this.routes.map(r => r.path)
          },
          memory: {
            used: process.memoryUsage ? process.memoryUsage().heapUsed : 0,
            total: process.memoryUsage ? process.memoryUsage().heapTotal : 0
          }
        };

        return response.success(detailedHealth);
      } catch (error) {
        logger.error('Detailed health check failed', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        return response.error(
          'HEALTH_CHECK_ERROR',
          'Detailed health check failed',
          503
        );
      }
    });
  }

  /**
   * Sets up API documentation endpoint
   */
  private setupDocumentation(): void {
    this.app.get('/api/docs', async (c) => {
      const response = createResponse(c);
      
      try {
        const documentation = {
          title: 'ClearSight IP API Documentation',
          version: '1.0.0',
          description: 'Comprehensive API for skills analysis and career insights',
          baseUrl: new URL(c.req.url).origin,
          routes: this.routes.map(route => ({
            path: route.path,
            description: route.description,
            version: route.version
          })),
          authentication: {
            type: 'Bearer Token',
            description: 'Include JWT token in Authorization header'
          },
          rateLimit: {
            description: 'Rate limiting is applied per endpoint',
            headers: [
              'X-RateLimit-Remaining',
              'X-RateLimit-Reset'
            ]
          },
          responseFormat: {
            success: {
              success: true,
              data: '...',
              metadata: {
                requestId: 'string',
                timestamp: 'string',
                processingTime: 'number',
                version: 'string'
              }
            },
            error: {
              success: false,
              error: {
                code: 'string',
                message: 'string',
                details: '...'
              },
              metadata: {
                requestId: 'string',
                timestamp: 'string',
                processingTime: 'number',
                version: 'string'
              }
            }
          }
        };

        return response.success(documentation);
      } catch (error) {
        logger.error('Documentation generation failed', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        return response.error(
          'DOCUMENTATION_ERROR',
          'Failed to generate API documentation',
          500
        );
      }
    });

    // OpenAPI specification endpoint
    this.app.get('/api/openapi.json', async (c) => {
      const response = createResponse(c);
      
      try {
        // TODO: Generate OpenAPI specification from route definitions
        const openApiSpec = {
          openapi: '3.0.0',
          info: {
            title: 'ClearSight IP API',
            version: '1.0.0',
            description: 'Comprehensive API for skills analysis and career insights'
          },
          servers: [
            {
              url: new URL(c.req.url).origin,
              description: 'Production server'
            }
          ],
          paths: {},
          components: {
            securitySchemes: {
              bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
              }
            }
          }
        };

        return c.json(openApiSpec);
      } catch (error) {
        logger.error('OpenAPI specification generation failed', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        return response.error(
          'OPENAPI_ERROR',
          'Failed to generate OpenAPI specification',
          500
        );
      }
    });
  }

  /**
   * Gets the configured Hono app
   */
  getApp(): Hono {
    return this.app;
  }

  /**
   * Gets registered routes information
   */
  getRoutes(): Array<{
    path: string;
    description: string;
    version: string;
  }> {
    return this.routes.map(({ path, description, version }) => ({
      path,
      description,
      version
    }));
  }
}

/**
 * Create and export the main application router
 */
export const appRouter = new AppRouter();
export default appRouter.getApp();