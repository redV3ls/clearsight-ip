/**
 * Standardized Validation Middleware
 * 
 * Provides consistent request validation across all API endpoints.
 * Supports schema validation for body, query, params, and headers.
 */

import { Context, Next } from 'hono';
import { 
  ValidationConfig, 
  ValidationError,
  DEFAULT_MIDDLEWARE_CONFIG
} from './types';
import { createResponse } from './responseBuilder';
import { logger } from '../../utils/logger';

/**
 * Schema validation interface
 */
export interface ValidationSchema {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean';
  required?: boolean;
  properties?: Record<string, ValidationSchema>;
  items?: ValidationSchema;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: any[];
  custom?: (value: any) => boolean | string;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
    value: any;
  }>;
  data?: any;
}

/**
 * Schema validator class
 */
export class SchemaValidator {
  /**
   * Validates data against a schema
   */
  static validate(data: any, schema: ValidationSchema, fieldPath: string = ''): ValidationResult {
    const errors: Array<{ field: string; message: string; value: any }> = [];
    
    try {
      const validatedData = this.validateValue(data, schema, fieldPath, errors);
      
      return {
        valid: errors.length === 0,
        errors,
        data: validatedData
      };
    } catch (error) {
      errors.push({
        field: fieldPath,
        message: error instanceof Error ? error.message : 'Validation failed',
        value: data
      });
      
      return {
        valid: false,
        errors
      };
    }
  }

  /**
   * Validates a single value against schema
   */
  private static validateValue(
    value: any, 
    schema: ValidationSchema, 
    fieldPath: string, 
    errors: Array<{ field: string; message: string; value: any }>
  ): any {
    // Check if value is required
    if (schema.required && (value === undefined || value === null)) {
      errors.push({
        field: fieldPath,
        message: 'Field is required',
        value
      });
      return value;
    }

    // Skip validation if value is undefined/null and not required
    if (value === undefined || value === null) {
      return value;
    }

    // Type validation
    if (!this.validateType(value, schema.type)) {
      errors.push({
        field: fieldPath,
        message: `Expected ${schema.type}, got ${typeof value}`,
        value
      });
      return value;
    }

    // Specific type validations
    switch (schema.type) {
      case 'string':
        return this.validateString(value, schema, fieldPath, errors);
      case 'number':
        return this.validateNumber(value, schema, fieldPath, errors);
      case 'object':
        return this.validateObject(value, schema, fieldPath, errors);
      case 'array':
        return this.validateArray(value, schema, fieldPath, errors);
      default:
        return value;
    }
  }

  /**
   * Validates value type
   */
  private static validateType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'array':
        return Array.isArray(value);
      default:
        return true;
    }
  }

  /**
   * Validates string values
   */
  private static validateString(
    value: string, 
    schema: ValidationSchema, 
    fieldPath: string, 
    errors: Array<{ field: string; message: string; value: any }>
  ): string {
    if (schema.minLength && value.length < schema.minLength) {
      errors.push({
        field: fieldPath,
        message: `Minimum length is ${schema.minLength}`,
        value
      });
    }

    if (schema.maxLength && value.length > schema.maxLength) {
      errors.push({
        field: fieldPath,
        message: `Maximum length is ${schema.maxLength}`,
        value
      });
    }

    if (schema.pattern && !schema.pattern.test(value)) {
      errors.push({
        field: fieldPath,
        message: 'Value does not match required pattern',
        value
      });
    }

    if (schema.enum && !schema.enum.includes(value)) {
      errors.push({
        field: fieldPath,
        message: `Value must be one of: ${schema.enum.join(', ')}`,
        value
      });
    }

    if (schema.custom) {
      const customResult = schema.custom(value);
      if (customResult !== true) {
        errors.push({
          field: fieldPath,
          message: typeof customResult === 'string' ? customResult : 'Custom validation failed',
          value
        });
      }
    }

    return value;
  }

  /**
   * Validates number values
   */
  private static validateNumber(
    value: number, 
    schema: ValidationSchema, 
    fieldPath: string, 
    errors: Array<{ field: string; message: string; value: any }>
  ): number {
    if (schema.min !== undefined && value < schema.min) {
      errors.push({
        field: fieldPath,
        message: `Minimum value is ${schema.min}`,
        value
      });
    }

    if (schema.max !== undefined && value > schema.max) {
      errors.push({
        field: fieldPath,
        message: `Maximum value is ${schema.max}`,
        value
      });
    }

    return value;
  }

  /**
   * Validates object values
   */
  private static validateObject(
    value: Record<string, any>, 
    schema: ValidationSchema, 
    fieldPath: string, 
    errors: Array<{ field: string; message: string; value: any }>
  ): Record<string, any> {
    if (!schema.properties) {
      return value;
    }

    const validatedObject: Record<string, any> = {};

    // Validate each property
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      const propPath = fieldPath ? `${fieldPath}.${propName}` : propName;
      const propValue = value[propName];
      
      validatedObject[propName] = this.validateValue(propValue, propSchema, propPath, errors);
    }

    return validatedObject;
  }

  /**
   * Validates array values
   */
  private static validateArray(
    value: any[], 
    schema: ValidationSchema, 
    fieldPath: string, 
    errors: Array<{ field: string; message: string; value: any }>
  ): any[] {
    if (schema.minLength && value.length < schema.minLength) {
      errors.push({
        field: fieldPath,
        message: `Array must have at least ${schema.minLength} items`,
        value
      });
    }

    if (schema.maxLength && value.length > schema.maxLength) {
      errors.push({
        field: fieldPath,
        message: `Array must have at most ${schema.maxLength} items`,
        value
      });
    }

    if (schema.items) {
      return value.map((item, index) => {
        const itemPath = `${fieldPath}[${index}]`;
        return this.validateValue(item, schema.items!, itemPath, errors);
      });
    }

    return value;
  }
}

/**
 * Creates validation middleware
 */
export function createValidationMiddleware(config: ValidationConfig) {
  return async (c: Context, next: Next) => {
    const response = createResponse(c);
    
    try {
      // Skip validation if disabled or path is excluded
      if (!config.enabled || shouldSkipValidation(c.req.path, config)) {
        await next();
        return;
      }

      const validationErrors: Array<{ field: string; message: string; value: any }> = [];

      // Validate request body
      if (config.schemas.body) {
        const body = await c.req.json().catch(() => ({}));
        const bodyValidation = SchemaValidator.validate(body, config.schemas.body, 'body');
        
        if (!bodyValidation.valid) {
          validationErrors.push(...bodyValidation.errors);
        } else {
          c.set('validatedBody', bodyValidation.data);
        }
      }

      // Validate query parameters
      if (config.schemas.query) {
        const query = Object.fromEntries(new URL(c.req.url).searchParams.entries());
        const queryValidation = SchemaValidator.validate(query, config.schemas.query, 'query');
        
        if (!queryValidation.valid) {
          validationErrors.push(...queryValidation.errors);
        } else {
          c.set('validatedQuery', queryValidation.data);
        }
      }

      // Validate path parameters
      if (config.schemas.params) {
        const params = c.req.param();
        const paramsValidation = SchemaValidator.validate(params, config.schemas.params, 'params');
        
        if (!paramsValidation.valid) {
          validationErrors.push(...paramsValidation.errors);
        } else {
          c.set('validatedParams', paramsValidation.data);
        }
      }

      // Validate headers
      if (config.schemas.headers) {
        const headers = Object.fromEntries(
          Array.from(c.req.raw.headers.entries()).map(([key, value]) => [key.toLowerCase(), value])
        );
        const headersValidation = SchemaValidator.validate(headers, config.schemas.headers, 'headers');
        
        if (!headersValidation.valid) {
          validationErrors.push(...headersValidation.errors);
        } else {
          c.set('validatedHeaders', headersValidation.data);
        }
      }

      // Return validation errors if any
      if (validationErrors.length > 0) {
        logger.warn('Request validation failed', {
          path: c.req.path,
          method: c.req.method,
          errors: validationErrors
        });

        return response.validationError(validationErrors);
      }

      // Store validation context
      c.set('validationErrors', []);
      
      await next();
    } catch (error) {
      logger.error('Validation middleware error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        path: c.req.path,
        method: c.req.method
      });

      return response.error(
        'VALIDATION_ERROR',
        'Request validation failed',
        500,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  };
}

/**
 * Checks if validation should be skipped for a path
 */
function shouldSkipValidation(path: string, config: ValidationConfig): boolean {
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
 * Common validation schemas
 */
export const CommonSchemas = {
  // Pagination schema
  pagination: {
    type: 'object' as const,
    properties: {
      page: {
        type: 'number' as const,
        min: 1,
        required: false
      },
      limit: {
        type: 'number' as const,
        min: 1,
        max: 100,
        required: false
      },
      sort: {
        type: 'string' as const,
        required: false
      },
      order: {
        type: 'string' as const,
        enum: ['asc', 'desc'],
        required: false
      }
    }
  },

  // ID parameter schema
  id: {
    type: 'string' as const,
    required: true,
    pattern: /^[a-zA-Z0-9_-]+$/,
    minLength: 1,
    maxLength: 50
  },

  // Email schema
  email: {
    type: 'string' as const,
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 255
  },

  // Password schema
  password: {
    type: 'string' as const,
    required: true,
    minLength: 8,
    maxLength: 128,
    custom: (value: string) => {
      if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
      if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
      if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
      if (!/(?=.*[@$!%*?&])/.test(value)) return 'Password must contain at least one special character';
      return true;
    }
  },

  // Date schema
  date: {
    type: 'string' as const,
    required: false,
    pattern: /^\d{4}-\d{2}-\d{2}$/
  },

  // DateTime schema
  datetime: {
    type: 'string' as const,
    required: false,
    pattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/
  },

  // URL schema
  url: {
    type: 'string' as const,
    required: false,
    pattern: /^https?:\/\/.+/,
    maxLength: 2048
  },

  // File upload schema
  file: {
    type: 'object' as const,
    required: true,
    properties: {
      name: {
        type: 'string' as const,
        required: true,
        maxLength: 255
      },
      size: {
        type: 'number' as const,
        required: true,
        min: 1,
        max: 10 * 1024 * 1024 // 10MB
      },
      type: {
        type: 'string' as const,
        required: true,
        enum: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
      }
    }
  }
};

/**
 * Validation middleware factory functions
 */
export const ValidationMiddleware = {
  /**
   * Creates body validation middleware
   */
  body: (schema: ValidationSchema, config?: Partial<ValidationConfig>) =>
    createValidationMiddleware({
      ...DEFAULT_MIDDLEWARE_CONFIG,
      ...config,
      schemas: { body: schema }
    }),

  /**
   * Creates query validation middleware
   */
  query: (schema: ValidationSchema, config?: Partial<ValidationConfig>) =>
    createValidationMiddleware({
      ...DEFAULT_MIDDLEWARE_CONFIG,
      ...config,
      schemas: { query: schema }
    }),

  /**
   * Creates params validation middleware
   */
  params: (schema: ValidationSchema, config?: Partial<ValidationConfig>) =>
    createValidationMiddleware({
      ...DEFAULT_MIDDLEWARE_CONFIG,
      ...config,
      schemas: { params: schema }
    }),

  /**
   * Creates headers validation middleware
   */
  headers: (schema: ValidationSchema, config?: Partial<ValidationConfig>) =>
    createValidationMiddleware({
      ...DEFAULT_MIDDLEWARE_CONFIG,
      ...config,
      schemas: { headers: schema }
    }),

  /**
   * Creates combined validation middleware
   */
  combined: (schemas: {
    body?: ValidationSchema;
    query?: ValidationSchema;
    params?: ValidationSchema;
    headers?: ValidationSchema;
  }, config?: Partial<ValidationConfig>) =>
    createValidationMiddleware({
      ...DEFAULT_MIDDLEWARE_CONFIG,
      ...config,
      schemas
    })
};