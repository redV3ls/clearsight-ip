/**
 * Middleware Chain Manager
 * 
 * Provides a standardized way to compose and manage middleware chains.
 * Ensures consistent ordering and configuration across all routes.
 */

import { Context, Next } from 'hono';
import { 
  MiddlewareFunction, 
  MiddlewareChain, 
  MiddlewareConfig,
  MiddlewareContext,
  MiddlewareMetrics,
  DEFAULT_MIDDLEWARE_CONFIG
} from './types';
import { logger } from '../../utils/logger';

/**
 * Middleware chain builder class
 */
export class MiddlewareChainBuilder {
  private middlewares: Array<{
    name: string;
    middleware: MiddlewareFunction;
    config: MiddlewareConfig;
  }> = [];

  /**
   * Adds middleware to the chain
   */
  add(
    name: string, 
    middleware: MiddlewareFunction, 
    config: Partial<MiddlewareConfig> = {}
  ): MiddlewareChainBuilder {
    this.middlewares.push({
      name,
      middleware,
      config: { ...DEFAULT_MIDDLEWARE_CONFIG, ...config }
    });

    return this;
  }

  /**
   * Adds multiple middlewares at once
   */
  addMany(middlewares: Array<{
    name: string;
    middleware: MiddlewareFunction;
    config?: Partial<MiddlewareConfig>;
  }>): MiddlewareChainBuilder {
    middlewares.forEach(({ name, middleware, config = {} }) => {
      this.add(name, middleware, config);
    });

    return this;
  }

  /**
   * Removes middleware by name
   */
  remove(name: string): MiddlewareChainBuilder {
    this.middlewares = this.middlewares.filter(m => m.name !== name);
    return this;
  }

  /**
   * Builds the middleware chain
   */
  build(): MiddlewareFunction {
    // Sort by priority (lower numbers = higher priority)
    const sortedMiddlewares = this.middlewares
      .filter(m => m.config.enabled)
      .sort((a, b) => a.config.priority - b.config.priority);

    return async (c: Context, next: Next) => {
      const requestPath = c.req.path;
      const metrics: MiddlewareMetrics[] = [];
      
      // Initialize middleware context
      const middlewareContext: MiddlewareContext = {
        requestId: c.get('requestId') || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        startTime: Date.now(),
        user: c.get('user'),
        rateLimitInfo: c.get('rateLimitInfo'),
        validationErrors: c.get('validationErrors') || []
      };

      c.set('middlewareContext', middlewareContext);

      // Execute middlewares in order
      let index = 0;
      
      const executeNext = async (): Promise<void> => {
        if (index >= sortedMiddlewares.length) {
          await next();
          return;
        }

        const { name, middleware, config } = sortedMiddlewares[index++];

        // Check if middleware should be skipped for this path
        if (shouldSkipMiddleware(requestPath, config)) {
          await executeNext();
          return;
        }

        const startTime = Date.now();
        
        try {
          logger.debug(`Executing middleware: ${name}`, {
            requestId: middlewareContext.requestId,
            path: requestPath,
            middleware: name
          });

          await middleware(c, executeNext);

          // Record successful execution
          metrics.push({
            name,
            executionTime: Date.now() - startTime,
            success: true
          });

        } catch (error) {
          const executionTime = Date.now() - startTime;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';

          // Record failed execution
          metrics.push({
            name,
            executionTime,
            success: false,
            error: errorMessage
          });

          logger.error(`Middleware error: ${name}`, {
            requestId: middlewareContext.requestId,
            path: requestPath,
            middleware: name,
            error: errorMessage,
            executionTime
          });

          throw error;
        }
      };

      try {
        await executeNext();

        // Log middleware execution metrics
        logger.debug('Middleware chain completed', {
          requestId: middlewareContext.requestId,
          path: requestPath,
          totalExecutionTime: Date.now() - middlewareContext.startTime,
          middlewareCount: metrics.length,
          metrics
        });

      } catch (error) {
        logger.error('Middleware chain failed', {
          requestId: middlewareContext.requestId,
          path: requestPath,
          error: error instanceof Error ? error.message : 'Unknown error',
          metrics
        });

        throw error;
      }
    };
  }

  /**
   * Gets current middleware list
   */
  getMiddlewares(): Array<{ name: string; config: MiddlewareConfig }> {
    return this.middlewares.map(({ name, config }) => ({ name, config }));
  }

  /**
   * Clears all middlewares
   */
  clear(): MiddlewareChainBuilder {
    this.middlewares = [];
    return this;
  }
}

/**
 * Checks if middleware should be skipped for a path
 */
function shouldSkipMiddleware(path: string, config: MiddlewareConfig): boolean {
  // Check skip paths
  if (config.skipPaths?.some(skipPath => path.includes(skipPath))) {
    return true;
  }

  // Check only paths
  if (config.onlyPaths?.length && !config.onlyPaths.some(onlyPath => path.includes(onlyPath))) {
    return true;
  }

  return false;
}

/**
 * Pre-built middleware chains for common use cases
 */
export class StandardMiddlewareChains {
  /**
   * Creates a basic API middleware chain
   */
  static createBasicApiChain(): MiddlewareChainBuilder {
    return new MiddlewareChainBuilder()
      .add('requestId', requestIdMiddleware, { priority: 10 })
      .add('cors', corsMiddleware, { priority: 20 })
      .add('logger', loggerMiddleware, { priority: 30 })
      .add('errorHandler', errorHandlerMiddleware, { priority: 1000 });
  }

  /**
   * Creates an authenticated API middleware chain
   */
  static createAuthenticatedApiChain(): MiddlewareChainBuilder {
    return this.createBasicApiChain()
      .add('auth', authMiddleware, { priority: 40 })
      .add('rateLimit', rateLimitMiddleware, { priority: 50 });
  }

  /**
   * Creates a file upload middleware chain
   */
  static createFileUploadChain(): MiddlewareChainBuilder {
    return this.createAuthenticatedApiChain()
      .add('fileUpload', fileUploadMiddleware, { priority: 60 })
      .add('fileValidation', fileValidationMiddleware, { priority: 70 });
  }

  /**
   * Creates a public API middleware chain
   */
  static createPublicApiChain(): MiddlewareChainBuilder {
    return this.createBasicApiChain()
      .add('publicRateLimit', publicRateLimitMiddleware, { priority: 50 });
  }
}

/**
 * Middleware composition utilities
 */
export class MiddlewareComposer {
  /**
   * Composes multiple middleware functions into one
   */
  static compose(...middlewares: MiddlewareFunction[]): MiddlewareFunction {
    return async (c: Context, next: Next) => {
      let index = 0;

      const executeNext = async (): Promise<void> => {
        if (index >= middlewares.length) {
          await next();
          return;
        }

        const middleware = middlewares[index++];
        await middleware(c, executeNext);
      };

      await executeNext();
    };
  }

  /**
   * Creates conditional middleware
   */
  static conditional(
    condition: (c: Context) => boolean,
    middleware: MiddlewareFunction
  ): MiddlewareFunction {
    return async (c: Context, next: Next) => {
      if (condition(c)) {
        await middleware(c, next);
      } else {
        await next();
      }
    };
  }

  /**
   * Creates path-specific middleware
   */
  static forPaths(
    paths: string[],
    middleware: MiddlewareFunction
  ): MiddlewareFunction {
    return this.conditional(
      (c) => paths.some(path => c.req.path.includes(path)),
      middleware
    );
  }

  /**
   * Creates method-specific middleware
   */
  static forMethods(
    methods: string[],
    middleware: MiddlewareFunction
  ): MiddlewareFunction {
    return this.conditional(
      (c) => methods.includes(c.req.method),
      middleware
    );
  }
}

// Basic middleware implementations
async function requestIdMiddleware(c: Context, next: Next) {
  if (!c.get('requestId')) {
    c.set('requestId', `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  }
  await next();
}

async function corsMiddleware(c: Context, next: Next) {
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (c.req.method === 'OPTIONS') {
    return c.text('', 204);
  }
  
  await next();
}

async function loggerMiddleware(c: Context, next: Next) {
  const start = Date.now();
  const requestId = c.get('requestId');
  
  logger.info('Request started', {
    requestId,
    method: c.req.method,
    path: c.req.path,
    userAgent: c.req.header('user-agent')
  });

  await next();

  logger.info('Request completed', {
    requestId,
    method: c.req.method,
    path: c.req.path,
    duration: Date.now() - start
  });
}

async function errorHandlerMiddleware(c: Context, next: Next) {
  try {
    await next();
  } catch (error) {
    logger.error('Unhandled error in middleware chain', {
      requestId: c.get('requestId'),
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An internal server error occurred'
      }
    }, 500);
  }
}

// Placeholder middleware functions (to be implemented)
async function authMiddleware(c: Context, next: Next) {
  // TODO: Implement authentication logic
  await next();
}

async function rateLimitMiddleware(c: Context, next: Next) {
  // TODO: Implement rate limiting logic
  await next();
}

async function fileUploadMiddleware(c: Context, next: Next) {
  // TODO: Implement file upload logic
  await next();
}

async function fileValidationMiddleware(c: Context, next: Next) {
  // TODO: Implement file validation logic
  await next();
}

async function publicRateLimitMiddleware(c: Context, next: Next) {
  // TODO: Implement public rate limiting logic
  await next();
}

/**
 * Factory function to create a new middleware chain builder
 */
export function createMiddlewareChain(): MiddlewareChainBuilder {
  return new MiddlewareChainBuilder();
}

/**
 * Helper function to create a simple middleware chain
 */
export function createSimpleChain(...middlewares: MiddlewareFunction[]): MiddlewareFunction {
  return MiddlewareComposer.compose(...middlewares);
}