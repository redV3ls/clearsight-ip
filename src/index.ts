import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { HTML_CONTENT } from './constants/htmlContentComplete';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
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
  
  // DeepSeek AI Configuration
  DEEPSEEK_API_KEY?: string;
  DEEPSEEK_BASE_URL?: string;
  DEEPSEEK_MODEL?: string;
  DEEPSEEK_MAX_TOKENS?: string;
  DEEPSEEK_TEMPERATURE?: string;
  DEEPSEEK_TIMEOUT?: string;
}

const app = new Hono<{ Bindings: Env }>();

// Global error handler
app.onError(errorHandler);

// Global middleware
app.use('*', environmentValidationMiddleware);
app.use('*', performanceTrackingMiddleware);
app.use('*', logger());
app.use('*', prettyJSON());
// Content Security Policy middleware (explicit and valid)
// We set the header directly to avoid any library serialization quirks.
app.use('*', async (c, next) => {
  const csp = [
    "default-src 'self'",
    // Scripts we actually use: Tailwind CDN and cdnjs. Inline allowed for our HTML template.
    // Include static.cloudflareinsights.com to allow Cloudflare's analytics script
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com https://static.cloudflareinsights.com",
    // Styles from Google Fonts/Cdnjs plus inline style attributes in our HTML
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
    // Fonts loaded from Google Fonts and cdnjs; allow data: for inlined fonts if any
    "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:",
    // Images from self or any https origin; allow data URIs for inline icons
    "img-src 'self' https: data:",
    // API/network calls to same origin and any https endpoints (e.g., AI providers)
    // Include cloudflareinsights.com for analytics
    "connect-src 'self' https: https://cloudflareinsights.com",
    // Disallow embedding/objects/frames
    "object-src 'none'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    // Restrict form submits and base URI
    "form-action 'self'",
    "base-uri 'self'",
    // Optional: upgrade any http content to https (safe on Workers)
    'upgrade-insecure-requests'
  ].join('; ');

  c.header('Content-Security-Policy', csp);
  // Keep COEP disabled to avoid issues with third-party resources
  c.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  await next();
});

// CORS configuration
// Previous configuration was too restrictive for workers.dev and caused browser CORS failures.
// This version safely reflects the request origin for known patterns and supports workers.dev subdomains.
app.use('*', cors({
  origin: (origin, c) => {
    // Allow when no Origin header (e.g., same-origin, server-to-server)
    if (!origin) return null;

    // If wildcard configured, reflect the incoming origin
    if (c.env?.CORS_ORIGIN === '*') return origin;

    // Always allow localhost for development
    const devOrigins = new Set([
      'http://localhost:3000',
      'http://localhost:3001',
      'https://localhost:3000',
      'https://localhost:3001',
    ]);

    if (devOrigins.has(origin)) return origin;

    // Allow configured primary domain (e.g., clearsight-ip.com)
    if (c.env?.CORS_ORIGIN && origin === c.env.CORS_ORIGIN) return origin;

    // Allow our Cloudflare workers.dev subdomain dynamically
    try {
      const reqUrl = new URL(c.req.url);
      const sameHost = reqUrl.origin === origin; // Same-origin requests
      if (sameHost) return origin;

      // Permit any workers.dev subdomain that matches our script name path
      // Example: https://clearsight-ip.<account>.workers.dev
      const isWorkers = /\.workers\.dev$/i.test(new URL(origin).hostname);
      if (isWorkers) return origin;
    } catch {
      // If URL parsing fails, fall through to deny
    }

    // Deny otherwise
    return null;
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
  namespace: CacheNamespaces.USER_PROFILE,
  ttl: CacheTTL.SHORT, // 15 minutes for user profiles
}));

// Production rate limiting
app.use('*', async (c, next) => {
  const { productionRateLimiter } = await import('./services/productionRateLimiter');
  return productionRateLimiter()(c, next);
});

// Simple test endpoint for debugging (public - no auth required)
app.get('/api/v1/test-ai-config', async (c) => {
  try {
    const { createAIConfig, validateAIConfig } = await import('./config/ai');
    const aiConfig = createAIConfig(c.env);
    const validation = validateAIConfig(aiConfig);
    
    return c.json({
      success: true,
      aiConfigValid: validation.isValid,
      errors: validation.errors,
      hasApiKey: !!c.env.DEEPSEEK_API_KEY,
      model: c.env.DEEPSEEK_MODEL,
      baseUrl: c.env.DEEPSEEK_BASE_URL,
      timeout: c.env.DEEPSEEK_TIMEOUT,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Public chunking test endpoint (no auth required)
app.get('/api/v1/test-chunking-public', async (c) => {
  try {
    console.log('Starting public chunking test');
    
    const shortResume = `
PROFESSIONAL SUMMARY
Experienced Software Engineer with 5+ years in full-stack development.

TECHNICAL SKILLS
Programming: JavaScript, Python, React, Node.js
Cloud: AWS, Docker, Kubernetes
Databases: PostgreSQL, MongoDB

EXPERIENCE
Senior Developer | TechCorp | 2020-Present
• Built scalable web applications
• Led team of 3 developers
• Technologies: React, Node.js, AWS
    `.trim();

    // Initialize AI service
    const { AIAnalysisService } = await import('./services/aiAnalysisService');
    const aiService = new AIAnalysisService(c.env);
    
    console.log('AI service initialized, starting analysis...');
    const startTime = Date.now();
    
    // Test the chunking analysis
    const result = await aiService.analyzeCV(shortResume, '', {
      includeSkillsGap: false,
      includeCareerSuggestions: false,
      includeIndustryTrends: false,
    });
    
    const processingTime = Date.now() - startTime;
    console.log(`Public chunking test completed in ${processingTime}ms`);

    return c.json({
      success: true,
      message: 'Public chunking test completed successfully',
      processingTime,
      skillsFound: result.skillsAnalysis.skills.length,
      categoriesFound: result.skillsAnalysis.categories.length,
      sampleSkills: result.skillsAnalysis.skills.slice(0, 5).map(s => s.name),
      resumeLength: shortResume.length,
      chunkingUsed: shortResume.length > 8000,
      metadata: {
        fallbackUsed: result.metadata.fallbackUsed,
        aiProvider: result.metadata.aiProvider,
        aiModel: result.metadata.aiModel
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Public chunking test failed:', error);
    return c.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : 'UnknownError',
        stack: error instanceof Error ? error.stack : undefined
      },
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// API root endpoint (public - no auth required) - must be before auth middleware
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

// Authentication middleware for protected routes
app.use('/api/v1/*', async (c, next) => {
  const publicPaths = [
    '/api/v1/auth/login', 
    '/api/v1/auth/register',
    '/api/v1/auth/me'  // Make /auth/me public to check auth status
  ];
  if (publicPaths.some(path => c.req.path === path)) {
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
import authRoutes from './routes/auth';
import analyzeRoutes from './routes/analyze';
app.route('/api/v1/auth', authRoutes);
app.route('/api/v1/users', usersRoutes);
app.route('/api/v1/jobs', jobsRoutes);
app.route('/api/v1/analyze', analyzeRoutes);
app.route('/api/v1/monitoring', monitoringRoutes);
app.route('/api/v1/gdpr', gdprRoutes);
app.route('/api/v1/audit', auditRoutes);

// OpenAPI documentation
const openAPIApp = createOpenAPIApp();
app.route('/', openAPIApp);

// Redirect /docs to the actual documentation location
app.get('/docs', (c) => c.redirect('/api/v1/docs'));

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
