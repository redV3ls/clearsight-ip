import { z } from 'zod';

/**
 * OpenAPI Validation Utilities
 * 
 * Utility functions for validating requests and responses.
 * Provides consistent validation across all endpoints.
 */

/**
 * Validates request data against a Zod schema
 */
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Request validation failed', error.errors);
    }
    throw error;
  }
}

/**
 * Validates response data against a Zod schema
 */
export function validateResponse<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Response validation failed:', error.errors);
      throw new Error('Internal server error: Invalid response format');
    }
    throw error;
  }
}

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
  public readonly errors: z.ZodIssue[];

  constructor(message: string, errors: z.ZodIssue[]) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }

  /**
   * Formats validation errors for API response
   */
  toAPIError() {
    return {
      code: 'VALIDATION_ERROR',
      message: this.message,
      details: {
        errors: this.errors.map(error => ({
          field: error.path.join('.'),
          message: error.message,
          code: error.code
        }))
      }
    };
  }
}

/**
 * Validates file upload constraints
 */
export function validateFileUpload(file: File, constraints: {
  maxSize: number;
  allowedTypes: string[];
}): void {
  if (file.size > constraints.maxSize) {
    throw new ValidationError('File too large', [{
      code: 'too_big',
      message: `File size exceeds ${constraints.maxSize / (1024 * 1024)}MB limit`,
      path: ['file', 'size']
    }]);
  }

  if (!constraints.allowedTypes.includes(file.type)) {
    throw new ValidationError('Invalid file type', [{
      code: 'invalid_type',
      message: `File type ${file.type} is not allowed. Allowed types: ${constraints.allowedTypes.join(', ')}`,
      path: ['file', 'type']
    }]);
  }

  // Validate filename for security
  if (file.name.includes('../') || file.name.includes('..\\')) {
    throw new ValidationError('Invalid filename', [{
      code: 'invalid_string',
      message: 'Filename contains invalid characters',
      path: ['file', 'name']
    }]);
  }
}

/**
 * Validates pagination parameters
 */
export function validatePagination(params: {
  page?: number;
  limit?: number;
}): { page: number; limit: number } {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));

  return { page, limit };
}

/**
 * Validates sort parameters
 */
export function validateSort(params: {
  sortBy?: string;
  sortOrder?: string;
}, allowedFields: string[]): { sortBy: string; sortOrder: 'asc' | 'desc' } {
  const sortBy = allowedFields.includes(params.sortBy || '') ? params.sortBy! : allowedFields[0];
  const sortOrder = params.sortOrder === 'desc' ? 'desc' : 'asc';

  return { sortBy, sortOrder };
}