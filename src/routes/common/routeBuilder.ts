/**
 * Route Builder System
 * 
 * Provides a standardized way to define and organize routes.
 * Ensures consistent middleware application and response handling.
 */

import { Hono, Context } from 'hono';
import { 
  RouteConfig, 
  MiddlewareFunction,
  HttpMethod,
  ValidationSchema
} from '../../middleware/common/types';
import { createResponse } from '../../middleware/common/responseBuilder';
import { ValidationMiddleware } from '../../middleware/common/validation';
import { createMiddlewareChain, StandardMiddlewareChains } from '../../middleware/common/middlewareChain';
import { logger } from '../../utils/logger';

/**
 * Route handler function type
 */
export type RouteHandler = (c: Context) => Promise<Response>;

/**
 * Route definition interface
 */
export interface RouteDefinition {
  path: string;
  method: HttpMethod;
  handler: RouteHandler;
  middleware?: MiddlewareFunction[];
  validation?: {
    body?: ValidationSchema;
    query?: ValidationSchema;
    params?: ValidationSchema;
    headers?: ValidationSchema;
  };
  auth?: {
    required: boolean;
    roles?: string[];
  };
  rateLimit?: {
    windowMs: number;
    maxRequests: number;
  };
  description?: string;
  tags?: string[];
  deprecated?: boolean;
}

/**
 * Route group interface
 */
export interface RouteGroup {
  prefix: string;
  middleware?: MiddlewareFunction[];
  routes: RouteDefinition[];
  description?: string;
  tags?: string[];
}

/**
 * Route builder class
 */
export class RouteBuilder {
  private app: Hono;
  private basePath: string;
  private globalMiddleware: MiddlewareFunction[] = [];
  private routes: RouteDefinition[] = [];

  constructor(basePath: string = '') {
    this.app = new Hono();
    this.basePath = basePath;
  }

  /**
   * Adds global middleware to all routes
   */
  use(...middleware: MiddlewareFunction[]): RouteBuilder {
    this.globalMiddleware.push(...middleware);
    return this;
  }

  /**
   * Adds a GET route
   */
  get(path: string, handler: RouteHandler, options?: Partial<RouteDefinition>): RouteBuilder {
    return this.addRoute('GET', path, handler, options);
  }

  /**
   * Adds a POST route
   */
  post(path: string, handler: RouteHandler, options?: Partial<RouteDefinition>): RouteBuilder {
    return this.addRoute('POST', path, handler, options);
  }

  /**
   * Adds a PUT route
   */
  put(path: string, handler: RouteHandler, options?: Partial<RouteDefinition>): RouteBuilder {
    return this.addRoute('PUT', path, handler, options);
  }

  /**
   * Adds a DELETE route
   */
  delete(path: string, handler: RouteHandler, options?: Partial<RouteDefinition>): RouteBuilder {
    return this.addRoute('DELETE', path, handler, options);
  }

  /**
   * Adds a PATCH route
   */
  patch(path: string, handler: RouteHandler, options?: Partial<RouteDefinition>): RouteBuilder {
    return this.addRoute('PATCH', path, handler, options);
  }

  /**
   * Adds a route with custom method
   */
  addRoute(
    method: HttpMethod, 
    path: string, 
    handler: RouteHandler, 
    options?: Partial<RouteDefinition>
  ): RouteBuilder {
    const fullPath = this.basePath + path;
    
    const routeDefinition: RouteDefinition = {
      method,
      path: fullPath,
      handler,
      middleware: options?.middleware || [],
      validation: options?.validation,
      auth: options?.auth,
      rateLimit: options?.rateLimit,
      description: options?.description,
      tags: options?.tags,
      deprecated: options?.deprecated
    };

    this.routes.push(routeDefinition);
    this.registerRoute(routeDefinition);

    return this;
  }

  /**
   * Adds a route group
   */
  group(groupConfig: RouteGroup): RouteBuilder {
    const groupMiddleware = groupConfig.middleware || [];
    
    groupConfig.routes.forEach(route => {
      const fullPath = this.basePath + groupConfig.prefix + route.path;
      
      const routeDefinition: RouteDefinition = {
        ...route,
        path: fullPath,
        middleware: [...groupMiddleware, ...(route.middleware || [])],
        tags: [...(groupConfig.tags || []), ...(route.tags || [])]
      };

      this.routes.push(routeDefinition);
      this.registerRoute(routeDefinition);
    });

    return this;
  }

  /**
   * Registers a route with the Hono app
   */
  private registerRoute(route: RouteDefinition): void {
    // Build middleware chain
    const middlewareChain = createMiddlewareChain();

    // Add global middleware
    this.globalMiddleware.forEach((middleware, index) => {
      middlewareChain.add(`global_${index}`, middleware, { priority: 10 + index });
    });

    // Add route-specific middleware
    route.middleware?.forEach((middleware, index) => {
      middlewareChain.add(`route_${index}`, middleware, { priority: 100 + index });
    });

    // Add validation middleware if specified
    if (route.validation) {
      const validationMiddleware = ValidationMiddleware.combined(route.validation);
      middlewareChain.add('validation', validationMiddleware, { priority: 200 });
    }

    // Add authentication middleware if required
    if (route.auth?.required) {
      middlewareChain.add('auth', createAuthMiddleware(route.auth), { priority: 300 });
    }

    // Add rate limiting middleware if specified
    if (route.rateLimit) {
      middlewareChain.add('rateLimit', createRateLimitMiddleware(route.rateLimit), { priority: 400 });
    }

    // Build the final middleware chain
    const finalMiddleware = middlewareChain.build();

    // Create the route handler with error handling
    const wrappedHandler = async (c: Context) => {
      try {
        // Log route access
        logger.debug('Route accessed', {
          requestId: c.get('requestId'),
          method: route.method,
          path: route.path,
          description: route.description,
          tags: route.tags
        });

        // Check if route is deprecated
        if (route.deprecated) {
          c.header('X-Deprecated', 'true');
          logger.warn('Deprecated route accessed', {
            requestId: c.get('requestId'),
            method: route.method,
            path: route.path
          });
        }

        return await route.handler(c);
      } catch (error) {
        logger.error('Route handler error', {
          requestId: c.get('requestId'),
          method: route.method,
          path: route.path,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });

        const response = createResponse(c);
        return response.error(
          'ROUTE_ERROR',
          'An error occurred while processing the request',
          500,
          { error: error instanceof Error ? error.message : 'Unknown error' }
        );
      }
    };

    // Register the route with Hono
    switch (route.method) {
      case 'GET':
        this.app.get(route.path, finalMiddleware, wrappedHandler);
        break;
      case 'POST':
        this.app.post(route.path, finalMiddleware, wrappedHandler);
        break;
      case 'PUT':
        this.app.put(route.path, finalMiddleware, wrappedHandler);
        break;
      case 'DELETE':
        this.app.delete(route.path, finalMiddleware, wrappedHandler);
        break;
      case 'PATCH':
        this.app.patch(route.path, finalMiddleware, wrappedHandler);
        break;
      default:
        logger.warn('Unsupported HTTP method', { method: route.method, path: route.path });
    }
  }

  /**
   * Gets the Hono app instance
   */
  getApp(): Hono {
    return this.app;
  }

  /**
   * Gets all registered routes
   */
  getRoutes(): RouteDefinition[] {
    return [...this.routes];
  }

  /**
   * Gets route documentation
   */
  getDocumentation(): Array<{
    method: HttpMethod;
    path: string;
    description?: string;
    tags?: string[];
    deprecated?: boolean;
    validation?: any;
    auth?: any;
  }> {
    return this.routes.map(route => ({
      method: route.method,
      path: route.path,
      description: route.description,
      tags: route.tags,
      deprecated: route.deprecated,
      validation: route.validation,
      auth: route.auth
    }));
  }
}

/**
 * Creates authentication middleware
 */
function createAuthMiddleware(authConfig: { required: boolean; roles?: string[] }): MiddlewareFunction {
  return async (c: Context, next: any) => {
    // TODO: Implement authentication logic
    // This is a placeholder implementation
    const token = c.req.header('Authorization')?.replace('Bearer ', '');
    
    if (authConfig.required && !token) {
      const response = createResponse(c);
      return response.authenticationError();
    }

    // TODO: Validate token and extract user info
    // c.set('user', user);

    await next();
  };
}

/**
 * Creates rate limiting middleware
 */
function createRateLimitMiddleware(rateLimitConfig: { windowMs: number; maxRequests: number }): MiddlewareFunction {
  return async (c: Context, next: any) => {
    // TODO: Implement rate limiting logic
    // This is a placeholder implementation
    await next();
  };
}

/**
 * Route builder factory functions
 */
export class RouteBuilderFactory {
  /**
   * Creates a basic API route builder
   */
  static createApiBuilder(basePath: string = '/api'): RouteBuilder {
    return new RouteBuilder(basePath)
      .use(...StandardMiddlewareChains.createBasicApiChain().build());
  }

  /**
   * Creates an authenticated API route builder
   */
  static createAuthenticatedApiBuilder(basePath: string = '/api'): RouteBuilder {
    return new RouteBuilder(basePath)
      .use(...StandardMiddlewareChains.createAuthenticatedApiChain().build());
  }

  /**
   * Creates a public API route builder
   */
  static createPublicApiBuilder(basePath: string = '/api/public'): RouteBuilder {
    return new RouteBuilder(basePath)
      .use(...StandardMiddlewareChains.createPublicApiChain().build());
  }

  /**
   * Creates a file upload route builder
   */
  static createFileUploadBuilder(basePath: string = '/api/upload'): RouteBuilder {
    return new RouteBuilder(basePath)
      .use(...StandardMiddlewareChains.createFileUploadChain().build());
  }
}

/**
 * Helper function to create a simple route builder
 */
export function createRouteBuilder(basePath: string = ''): RouteBuilder {
  return new RouteBuilder(basePath);
}

/**
 * Helper function to create route documentation
 */
export function generateRouteDocumentation(routes: RouteDefinition[]): string {
  let documentation = '# API Routes Documentation\n\n';

  // Group routes by tags
  const routesByTag = routes.reduce((acc, route) => {
    const tags = route.tags || ['Untagged'];
    tags.forEach(tag => {
      if (!acc[tag]) acc[tag] = [];
      acc[tag].push(route);
    });
    return acc;
  }, {} as Record<string, RouteDefinition[]>);

  // Generate documentation for each tag group
  Object.entries(routesByTag).forEach(([tag, tagRoutes]) => {
    documentation += `## ${tag}\n\n`;
    
    tagRoutes.forEach(route => {
      documentation += `### ${route.method} ${route.path}\n\n`;
      
      if (route.description) {
        documentation += `${route.description}\n\n`;
      }

      if (route.deprecated) {
        documentation += '**⚠️ DEPRECATED**\n\n';
      }

      if (route.auth?.required) {
        documentation += '**Authentication Required**\n\n';
        if (route.auth.roles?.length) {
          documentation += `Required Roles: ${route.auth.roles.join(', ')}\n\n`;
        }
      }

      if (route.validation) {
        documentation += '**Validation:**\n\n';
        if (route.validation.body) {
          documentation += '- Body validation required\n';
        }
        if (route.validation.query) {
          documentation += '- Query parameter validation required\n';
        }
        if (route.validation.params) {
          documentation += '- Path parameter validation required\n';
        }
        documentation += '\n';
      }

      documentation += '---\n\n';
    });
  });

  return documentation;
}