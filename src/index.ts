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

  // Stripe configuration
  STRIPE_SECRET_KEY?: string;
  STRIPE_PRICE_ID_PACK_4?: string;
  STRIPE_PRICE_ID_PACK_10?: string;
  STRIPE_PRICE_ID_PACK_30?: string;
  STRIPE_WEBHOOK_SECRET?: string; // optional, for future webhook support
}

const app = new Hono<{ Bindings: Env }>();

// Global error handler
app.onError(errorHandler);

// Global middleware
app.use('*', environmentValidationMiddleware);
app.use('*', performanceTrackingMiddleware);
app.use('*', logger());
app.use('*', prettyJSON());
// Security headers middleware
app.use('*', async (c, next) => {
  // Content Security Policy - relaxed for third-party resources
  const csp = [
    "default-src 'self' https:",
    // Scripts: Allow inline, eval, and all HTTPS sources (needed for CDNs)
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
    // Styles: Allow inline and all HTTPS sources
    "style-src 'self' 'unsafe-inline' https:",
    // Fonts: Allow all HTTPS sources and data URIs
    "font-src 'self' https: data:",
    // Images: Allow all HTTPS sources and data URIs
    "img-src 'self' https: data:",
    // Connections: Allow all HTTPS sources
    "connect-src 'self' https:",
    // Objects and frames
    "object-src 'none'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    // Forms and base
    "form-action 'self'",
    "base-uri 'self'",
    // Upgrade insecure requests
    'upgrade-insecure-requests'
  ].join('; ');

  c.header('Content-Security-Policy', csp);
  
  // Remove COEP header entirely to avoid cross-origin resource blocking
  // Don't set Cross-Origin-Embedder-Policy at all
  
  // Add CORP header to allow resources to be loaded cross-origin
  c.header('Cross-Origin-Resource-Policy', 'cross-origin');
  
  // Add other security headers
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Ensure proper content type for HTML responses
  if (c.req.path === '/' || c.req.path.endsWith('.html')) {
    c.header('Content-Type', 'text/html; charset=utf-8');
  }
  
  await next();
});

// CORS configuration for production
app.use('*', cors({
  origin: (origin, c) => {
    // Allow when no Origin header (same-origin requests)
    if (!origin) return null;

    // Allow production domain
    const allowedOrigins = [
      'https://clearsight-ip.com',
      'https://www.clearsight-ip.com',
      'http://localhost:3000',
      'http://localhost:3001',
      'https://localhost:3000',
      'https://localhost:3001',
    ];

    if (allowedOrigins.includes(origin)) return origin;

    // Allow configured origin from environment
    if (c.env?.CORS_ORIGIN && origin === c.env.CORS_ORIGIN) return origin;

    // Allow Cloudflare Workers subdomains
    try {
      const url = new URL(origin);
      // Allow any *.workers.dev subdomain
      if (url.hostname.endsWith('.workers.dev')) return origin;
      // Allow clearsight-ip.com subdomains
      if (url.hostname.endsWith('clearsight-ip.com')) return origin;
    } catch {
      // Invalid URL, deny
    }

    // Deny otherwise
    return null;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Requested-With', 'Accept'],
  exposeHeaders: ['Content-Length', 'X-Request-Id'],
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

  // Skip KV cache writes/reads here to avoid burning KV quotas
  // If needed, a lightweight read-only ping can be added behind a flag.
  healthStatus.dependencies.cache = 'skipped';

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

// Test routes for debugging async analysis
import testAnalysisRoutes from './routes/test-analysis';
app.route('/api/v1/test-analysis', testAnalysisRoutes);

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

// Test UI endpoint - serve the narrative analysis test page
app.get('/test-narrative-ui.html', async (c) => {
  // Import the test UI content
  const { TEST_NARRATIVE_UI_CONTENT } = await import('./constants/testNarrativeUI');
  
  // Set appropriate headers
  c.header('Content-Type', 'text/html; charset=utf-8');
  c.header('Cache-Control', 'no-cache');
  
  return c.html(TEST_NARRATIVE_UI_CONTENT);
});

// Analysis workspace endpoint - serve the new analysis workspace
app.get('/analysis.html', async (c) => {
  // Import the analysis workspace content
  const { ANALYSIS_WORKSPACE_CONTENT } = await import('./constants/analysisWorkspace');
  
  // Set appropriate headers
  c.header('Content-Type', 'text/html; charset=utf-8');
  c.header('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  
  return c.html(ANALYSIS_WORKSPACE_CONTENT);
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
