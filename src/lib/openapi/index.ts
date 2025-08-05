import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { Env } from '../../index';
import { OPENAPI_CONFIG } from './config';

// Import route documentation
import { authRoutes } from './routes/auth';
import { analysisRoutes } from './routes/analysis';
import { usersRoutes } from './routes/users';
import { trendsRoutes } from './routes/trends';

/**
 * OpenAPI Application
 * 
 * Modular OpenAPI documentation setup.
 * Replaces the monolithic openapi.ts file with organized, maintainable modules.
 */

export function createOpenAPIApp() {
  const app = new OpenAPIHono<{ Bindings: Env }>();

  // Configure OpenAPI documentation
  app.doc('/openapi.json', OPENAPI_CONFIG);

  // Add Swagger UI
  app.get('/docs', swaggerUI({ url: '/openapi.json' }));

  // Register route documentation
  authRoutes(app);
  analysisRoutes(app);
  usersRoutes(app);
  trendsRoutes(app);

  // Health check endpoint (not documented in OpenAPI)
  app.get('/health', (c) => {
    return c.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: OPENAPI_CONFIG.info.version
    });
  });

  return app;
}

// Export schemas for use in other parts of the application
export * from './schemas/common';
export * from './schemas/auth';
export * from './schemas/analysis';
export * from './schemas/users';

// Export utilities
export * from './utils/validators';
export * from './utils/generators';