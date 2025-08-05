import { Hono } from 'hono';
import { Env } from '../../index';
import { AuthenticatedContext } from '../../middleware/auth';

// Import route handlers
import { resumeHandler } from './handlers/resume';
import { teamHandler } from './handlers/team';
import { gapHandler } from './handlers/gap';
import { trendsHandler } from './handlers/trends';

// Import middleware
import { fileUploadMiddleware } from './middleware/fileUpload';
import { rateLimitingMiddleware } from './middleware/rateLimiting';
import { validationMiddleware } from './middleware/validation';

/**
 * Analysis Routes
 * 
 * Modular router for all analysis-related endpoints.
 * Replaces the monolithic analyze.ts file with focused, maintainable modules.
 */
const analyze = new Hono<{ Bindings: Env }>();

// Apply global middleware for analysis routes
analyze.use('*', rateLimitingMiddleware);
analyze.use('*', validationMiddleware);

// Resume/CV analysis endpoint
analyze.post('/resume', fileUploadMiddleware, resumeHandler);

// Team analysis endpoint
analyze.post('/team', teamHandler);

// Gap analysis endpoint
analyze.post('/gap', gapHandler);

// Trends analysis endpoint
analyze.post('/trends', trendsHandler);

export default analyze;