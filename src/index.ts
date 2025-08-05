import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';
import { HTML_CONTENT } from './constants/htmlContentComplete';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { rateLimiter } from './middleware/rateLimiter';
import { compressionMiddleware } from './middleware/compression';
import { performanceTrackingMiddleware } from './middleware/performanceTracking';
import { environmentValidationMiddleware, getEnvironmentHealthStatus } from './middleware/environmentValidation';
// Import routes
import usersRoutes from './routes/users';
import jobsRoutes from './routes/jobs';
import monitoringRoutes from './routes/monitoring';
import gdprRoutes from './routes/gdpr';
import auditRoutes from './routes/audit';
// Cache imports - re-enabling
import { cacheMiddleware, userCacheMiddleware } from './middleware/cache';
import { CacheNamespaces, CacheTTL } from './services/cache';
import { readOnlyRateLimiter } from './middleware/rateLimiter';
import { createOpenAPIApp } from './lib/openapi';

export interface Env {
  // Cloudflare bindings (required)
  DB: D1Database;
  CACHE: KVNamespace;
  // RATE_LIMITER: DurableObjectNamespace; // Requires paid plan
  
  // Environment variables
  NODE_ENV?: string;
  JWT_SECRET?: string; // Legacy - kept for backward compatibility
  JWT_PRIVATE_KEY?: string; // RSA private key for JWT signing (RS256)
  JWT_PUBLIC_KEY?: string; // RSA public key for JWT verification (RS256)
  CORS_ORIGIN?: string;
  RATE_LIMIT_WINDOW_MS?: string;
  RATE_LIMIT_MAX_REQUESTS?: string;
  ENABLE_RATE_LIMITING?: string;
  LOG_LEVEL?: string;
}

const app = new Hono<{ Bindings: Env }>();

// Global error handler
app.onError(errorHandler);

// Global middleware
app.use('*', environmentValidationMiddleware);
app.use('*', performanceTrackingMiddleware);
app.use('*', logger());
app.use('*', prettyJSON());
// CSP temporarily disabled to fix page load issues
// app.use('*', secureHeaders({
//   contentSecurityPolicy: "default-src 'self' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com https://fonts.googleapis.com https://fonts.gstatic.com data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https:; connect-src 'self' https:; object-src 'none'; base-uri 'self'; frame-ancestors 'none';",
//   crossOriginEmbedderPolicy: false,
// }));

// CORS configuration
app.use('*', cors({
  origin: (origin, c) => {
    const allowedOrigins = [
      c.env?.CORS_ORIGIN || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001',
      'https://localhost:3000',
      'https://localhost:3001',
    ];
    
    if (!origin) return null; // No origin header (e.g., same-origin requests)
    return allowedOrigins.includes(origin) ? origin : null;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400, // 24 hours
}));

// Temporarily disable compression middleware to fix display issues
// TODO: Re-enable with proper configuration later
// app.use('*', compressionMiddleware);

// Cache middleware for specific routes
app.use('/api/v1/trends/*', cacheMiddleware({
  namespace: CacheNamespaces.TREND_DATA,
  ttl: CacheTTL.MEDIUM, // 1 hour cache for trends
}));

app.use('/api/v1/jobs/search', cacheMiddleware({
  namespace: CacheNamespaces.API_RESPONSES,
  ttl: CacheTTL.SHORT, // 15 minutes for job searches
}));

app.use('/api/v1/users/profile', userCacheMiddleware({
  namespace: CacheNamespaces.USER_PROFILES,
  ttl: CacheTTL.SHORT, // 15 minutes for user profiles
}));

// Production rate limiting
app.use('*', async (c, next) => {
  const { productionRateLimiter } = await import('./services/productionRateLimiter');
  return productionRateLimiter()(c, next);
});

// Authentication middleware for protected routes
app.use('/api/v1/*', async (c, next) => {
  const publicPaths = [
    '/api/v1/auth/login', 
    '/api/v1/auth/register',
    '/api/v1' // Make API root endpoint public
  ];
  if (publicPaths.some(path => c.req.path === path || c.req.path.startsWith(path + '/'))) {
    return next();
  }
  return authMiddleware(c, next);
});

// Basic health check
app.get('/health', (c) => {
  const envHealth = getEnvironmentHealthStatus();
  
  return c.json({
    status: envHealth.status === 'valid' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: c.env?.NODE_ENV || 'development',
    validation: envHealth
  });
});

// Detailed health check
app.get('/health/detailed', async (c) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: c.env?.NODE_ENV || 'development',
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

  // Check KV cache
  try {
    await c.env.CACHE.put('health_check', 'ok', { expirationTtl: 60 });
    const result = await c.env.CACHE.get('health_check');
    healthStatus.dependencies.cache = result === 'ok' ? 'healthy' : 'unhealthy';
  } catch (error) {
    healthStatus.dependencies.cache = 'unhealthy';
    healthStatus.status = 'degraded';
  }

  const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
  return c.json(healthStatus, statusCode);
});

// API routes - Using new centralized router system
import appRouter from './routes';
app.route('/', appRouter);

// Legacy v1 routes (to be migrated)
app.route('/api/v1/users', usersRoutes);
app.route('/api/v1/jobs', jobsRoutes);
app.route('/api/v1/monitoring', monitoringRoutes);
app.route('/api/v1/gdpr', gdprRoutes);
app.route('/api/v1/audit', auditRoutes);

// OpenAPI documentation
const openAPIApp = createOpenAPIApp();
app.route('/', openAPIApp);

// Redirect /docs to the actual documentation location
app.get('/docs', (c) => c.redirect('/api/v1/docs'));

// API root endpoint (public - no auth required)
app.get('/api/v1', (c) => {
  return c.json({
    message: 'Clearsight IP API v1',
    version: '1.0.0',
    status: 'All endpoints active',
    endpoints: {
      health: '/health',
      root: '/',
      api: '/api/v1',
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      jobs: '/api/v1/jobs',
      analyze: '/api/v1/analyze',
      trends: '/api/v1/trends',
      monitoring: '/api/v1/monitoring',
      gdpr: '/api/v1/gdpr',
      audit: '/api/v1/audit',
      docs: '/docs'
    },
    features: {
      skill_gap_analysis: 'active',
      team_analysis: 'active',
      industry_trends: 'active',
      job_matching: 'active',
      user_profiles: 'active',
      caching: 'active',
      monitoring: 'active'
    },
    authentication: {
      required: true,
      methods: ['JWT', 'API_KEY'],
      endpoints: {
        login: '/api/v1/auth/login',
        register: '/api/v1/auth/register'
      }
    },
    timestamp: new Date().toISOString(),
    cloudflare: {
      colo: c.req.header('CF-RAY')?.split('-')[1] || 'unknown',
      country: c.req.header('CF-IPCountry') || 'unknown',
    },
  });
});

// Favicon route
app.get('/favicon.ico', (c) => {
  const faviconSvg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <defs>
      <linearGradient id='grad' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' style='stop-color:#14b8a6;stop-opacity:1' />
        <stop offset='100%' style='stop-color:#2563eb;stop-opacity:1' />
      </linearGradient>
    </defs>
    <circle cx='50' cy='50' r='45' fill='url(#grad)'/>
    <path d='M30 35h40v6H30z' fill='white' opacity='0.9'/>
    <path d='M30 45h32v4H30z' fill='white' opacity='0.7'/>
    <path d='M30 53h28v4H30z' fill='white' opacity='0.5'/>
    <path d='M30 61h24v4H30z' fill='white' opacity='0.3'/>
    <path d='M65 42l8 8-8 8-3-3 5-5-5-5z' fill='white'/>
  </svg>`;

  c.header('Content-Type', 'image/svg+xml');
  c.header('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
  return c.body(faviconSvg);
});

// Root endpoint - serve the HTML home page
// Static file serving for client assets
app.get('/', (c) => {
  // Set cache header
  c.header('Cache-Control', 'public, max-age=3600');
  
  // Return HTML content using Hono's html method
  return c.html(HTML_CONTENT);
});

// 404 handler
app.notFound((c) => {
  return c.json({
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found.',
      path: c.req.path,
    },
  }, 404);
});

// Export for scheduled workers
export { default as scheduled } from './scheduled';

export default app;

// Note: Durable Objects require a paid Cloudflare plan
// For free tier, we'll implement rate limiting using KV storage instead
