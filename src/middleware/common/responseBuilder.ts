/**
 * Standardized Response Builder
 * 
 * Provides consistent response formatting across all API endpoints.
 * Ensures uniform structure and error handling.
 */

import { Context } from 'hono';
import { 
  ApiResponse, 
  HttpStatus, 
  HTTP_STATUS_CODES,
  COMMON_HEADERS
} from './types';
import { logger } from '../../utils/logger';

export class ResponseBuilder {
  private context: Context;
  private requestId: string;
  private startTime: number;

  constructor(context: Context) {
    this.context = context;
    this.requestId = context.get('requestId') || this.generateRequestId();
    this.startTime = context.get('startTime') || Date.now();
  }

  /**
   * Builds a successful response
   */
  success<T>(
    data: T,
    status: HttpStatus = HTTP_STATUS_CODES.OK,
    metadata?: Record<string, any>
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      metadata: {
        requestId: this.requestId,
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - this.startTime,
        version: '1.0.0',
        ...metadata
      }
    };

    return this.buildResponse(response, status);
  }

  /**
   * Builds a paginated response
   */
  paginated<T>(
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
    },
    status: HttpStatus = HTTP_STATUS_CODES.OK
  ): Response {
    const response: ApiResponse<T[]> = {
      success: true,
      data,
      metadata: {
        requestId: this.requestId,
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - this.startTime,
        version: '1.0.0'
      },
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        hasNext: pagination.page * pagination.limit < pagination.total,
        hasPrev: pagination.page > 1
      }
    };

    return this.buildResponse(response, status);
  }

  /**
   * Builds an error response
   */
  error(
    code: string,
    message: string,
    status: HttpStatus = HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    details?: any
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        code,
        message,
        details
      },
      metadata: {
        requestId: this.requestId,
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - this.startTime,
        version: '1.0.0'
      }
    };

    // Log error for monitoring
    logger.error('API Error Response', {
      requestId: this.requestId,
      code,
      message,
      status,
      details,
      path: this.context.req.path,
      method: this.context.req.method
    });

    return this.buildResponse(response, status);
  }

  /**
   * Builds a validation error response
   */
  validationError(
    errors: Array<{ field: string; message: string; value?: any }>,
    status: HttpStatus = HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY
  ): Response {
    return this.error(
      'VALIDATION_ERROR',
      'Request validation failed',
      status,
      { validationErrors: errors }
    );
  }

  /**
   * Builds an authentication error response
   */
  authenticationError(
    message: string = 'Authentication required',
    status: HttpStatus = HTTP_STATUS_CODES.UNAUTHORIZED
  ): Response {
    return this.error('AUTH_REQUIRED', message, status);
  }

  /**
   * Builds an authorization error response
   */
  authorizationError(
    message: string = 'Insufficient permissions',
    status: HttpStatus = HTTP_STATUS_CODES.FORBIDDEN
  ): Response {
    return this.error('INSUFFICIENT_PERMISSIONS', message, status);
  }

  /**
   * Builds a rate limit error response
   */
  rateLimitError(
    retryAfter: number,
    message: string = 'Rate limit exceeded',
    status: HttpStatus = HTTP_STATUS_CODES.TOO_MANY_REQUESTS
  ): Response {
    const response = this.error('RATE_LIMIT_EXCEEDED', message, status, {
      retryAfter
    });

    // Add rate limit headers
    response.headers.set(COMMON_HEADERS.X_RATE_LIMIT_RESET, retryAfter.toString());
    
    return response;
  }

  /**
   * Builds a not found error response
   */
  notFound(
    resource: string = 'Resource',
    status: HttpStatus = HTTP_STATUS_CODES.NOT_FOUND
  ): Response {
    return this.error(
      'NOT_FOUND',
      `${resource} not found`,
      status
    );
  }

  /**
   * Builds a conflict error response
   */
  conflict(
    message: string = 'Resource conflict',
    status: HttpStatus = HTTP_STATUS_CODES.CONFLICT
  ): Response {
    return this.error('CONFLICT', message, status);
  }

  /**
   * Builds the actual HTTP response
   */
  private buildResponse(data: ApiResponse, status: HttpStatus): Response {
    const headers = new Headers({
      [COMMON_HEADERS.CONTENT_TYPE]: 'application/json',
      [COMMON_HEADERS.X_REQUEST_ID]: this.requestId,
      [COMMON_HEADERS.X_RESPONSE_TIME]: `${Date.now() - this.startTime}ms`
    });

    return new Response(JSON.stringify(data, null, 2), {
      status,
      headers
    });
  }

  /**
   * Generates a unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Helper function to create a response builder
 */
export function createResponse(context: Context): ResponseBuilder {
  return new ResponseBuilder(context);
}

/**
 * Middleware to add response builder to context
 */
export async function responseBuilderMiddleware(c: Context, next: any) {
  // Add request ID and start time to context
  c.set('requestId', `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  c.set('startTime', Date.now());
  
  // Add response builder helper
  c.set('response', new ResponseBuilder(c));
  
  await next();
}

/**
 * Standard error response formats
 */
export const StandardErrors = {
  INVALID_REQUEST: {
    code: 'INVALID_REQUEST',
    message: 'The request is invalid or malformed',
    status: HTTP_STATUS_CODES.BAD_REQUEST
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'Authentication is required to access this resource',
    status: HTTP_STATUS_CODES.UNAUTHORIZED
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    message: 'You do not have permission to access this resource',
    status: HTTP_STATUS_CODES.FORBIDDEN
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    message: 'The requested resource was not found',
    status: HTTP_STATUS_CODES.NOT_FOUND
  },
  RATE_LIMITED: {
    code: 'RATE_LIMITED',
    message: 'Too many requests. Please try again later',
    status: HTTP_STATUS_CODES.TOO_MANY_REQUESTS
  },
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    message: 'An internal server error occurred',
    status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
  },
  SERVICE_UNAVAILABLE: {
    code: 'SERVICE_UNAVAILABLE',
    message: 'The service is temporarily unavailable',
    status: HTTP_STATUS_CODES.SERVICE_UNAVAILABLE
  }
} as const;