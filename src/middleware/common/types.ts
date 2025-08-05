/**
 * Common Middleware Types
 * 
 * Shared type definitions for middleware components.
 * Provides consistent interfaces across all middleware.
 */

import { Context, Next } from 'hono';

export interface MiddlewareConfig {
  enabled: boolean;
  priority: number;
  skipPaths?: string[];
  onlyPaths?: string[];
}

export interface ValidationConfig extends MiddlewareConfig {
  schemas: {
    body?: any;
    query?: any;
    params?: any;
    headers?: any;
  };
  strict?: boolean;
  allowUnknown?: boolean;
}

export interface RateLimitConfig extends MiddlewareConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (c: Context) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface AuthConfig extends MiddlewareConfig {
  requireAuth: boolean;
  allowedRoles?: string[];
  skipAuthPaths?: string[];
  tokenValidation?: {
    algorithm: string;
    issuer?: string;
    audience?: string;
  };
}

export interface LoggingConfig extends MiddlewareConfig {
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  includeBody?: boolean;
  includeHeaders?: boolean;
  excludeHeaders?: string[];
  maxBodyLength?: number;
}

export interface CorsConfig extends MiddlewareConfig {
  origins: string[];
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

export interface ErrorHandlingConfig extends MiddlewareConfig {
  includeStack: boolean;
  logErrors: boolean;
  customErrorMessages?: Record<string, string>;
  notifyOnError?: boolean;
}

export interface MiddlewareContext {
  requestId: string;
  startTime: number;
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
  rateLimitInfo?: {
    remaining: number;
    resetTime: number;
  };
  validationErrors?: any[];
}

export type MiddlewareFunction = (c: Context, next: Next) => Promise<Response | void>;

export interface MiddlewareChain {
  name: string;
  middlewares: MiddlewareFunction[];
  config: MiddlewareConfig;
}

export interface RouteConfig {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  handler: (c: Context) => Promise<Response>;
  middleware?: MiddlewareChain[];
  validation?: ValidationConfig;
  auth?: AuthConfig;
  rateLimit?: RateLimitConfig;
  description?: string;
  tags?: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    requestId: string;
    timestamp: string;
    processingTime: number;
    version: string;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: Record<string, {
    status: 'up' | 'down' | 'degraded';
    responseTime?: number;
    error?: string;
  }>;
  timestamp: string;
  uptime: number;
  version: string;
}

// Error types
export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: any,
    public code: string = 'VALIDATION_ERROR'
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(
    message: string = 'Authentication required',
    public code: string = 'AUTH_REQUIRED'
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(
    message: string = 'Insufficient permissions',
    public code: string = 'INSUFFICIENT_PERMISSIONS'
  ) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string = 'Rate limit exceeded',
    public retryAfter: number,
    public code: string = 'RATE_LIMIT_EXCEEDED'
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

// Utility types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
export type HttpStatus = 200 | 201 | 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500 | 502 | 503;

export interface RequestMetrics {
  method: HttpMethod;
  path: string;
  statusCode: HttpStatus;
  responseTime: number;
  timestamp: string;
  userAgent?: string;
  ip?: string;
  userId?: string;
}

export interface MiddlewareMetrics {
  name: string;
  executionTime: number;
  success: boolean;
  error?: string;
}

// Constants
export const DEFAULT_MIDDLEWARE_CONFIG: MiddlewareConfig = {
  enabled: true,
  priority: 100,
  skipPaths: [],
  onlyPaths: []
};

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
} as const;

export const COMMON_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  X_REQUEST_ID: 'X-Request-ID',
  X_RATE_LIMIT_REMAINING: 'X-RateLimit-Remaining',
  X_RATE_LIMIT_RESET: 'X-RateLimit-Reset',
  X_RESPONSE_TIME: 'X-Response-Time'
} as const;