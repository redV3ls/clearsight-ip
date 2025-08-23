import { Hono } from 'hono';
import { Env } from '../index';

const health = new Hono<{ Bindings: Env }>();

// Basic health check
health.get('/', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: c.env.NODE_ENV || 'development',
  });
});

// Detailed health check with dependencies
health.get('/detailed', async (c) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: c.env.NODE_ENV || 'development',
    dependencies: {
      database: 'unknown',
      cache: 'unknown',
    },
    cloudflare: {
      colo: c.req.header('CF-RAY')?.split('-')[1] || 'unknown',
      country: c.req.header('CF-IPCountry') || 'unknown',
      ray: c.req.header('CF-RAY') || 'unknown',
    },
  };

  // Check D1 database connection
  try {
    await c.env.DB.prepare('SELECT 1').first();
    healthStatus.dependencies.database = 'healthy';
  } catch (error) {
    healthStatus.dependencies.database = 'unhealthy';
    healthStatus.status = 'degraded';
  }

  // Skip KV cache writes/reads here to conserve KV quota
  healthStatus.dependencies.cache = 'skipped';

  const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
  return c.json(healthStatus, statusCode);
});

// Readiness probe
health.get('/ready', async (c) => {
  try {
    // Check if database is ready
    await c.env.DB.prepare('SELECT 1').first();
    
  // Skip KV readiness write to conserve KV quota
  return c.json({
    status: 'ready',
    timestamp: new Date().toISOString(),
  });
  } catch (error) {
    return c.json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 503);
  }
});

// Liveness probe
health.get('/live', (c) => {
  return c.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

export { health as healthRoutes };