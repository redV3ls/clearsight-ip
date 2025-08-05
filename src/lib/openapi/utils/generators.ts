/**
 * OpenAPI Documentation Generators
 * 
 * Utility functions for generating OpenAPI documentation components.
 * Provides consistent documentation patterns across all endpoints.
 */

/**
 * Generates standard error responses for OpenAPI documentation
 */
export function generateErrorResponses() {
  return {
    400: {
      description: 'Bad Request - Invalid request data',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: false },
              error: {
                type: 'object',
                properties: {
                  code: { type: 'string', example: 'VALIDATION_ERROR' },
                  message: { type: 'string', example: 'Request validation failed' },
                  details: { type: 'object' }
                }
              },
              timestamp: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    },
    401: {
      description: 'Unauthorized - Authentication required',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: false },
              error: {
                type: 'object',
                properties: {
                  code: { type: 'string', example: 'AUTHENTICATION_REQUIRED' },
                  message: { type: 'string', example: 'Authentication required' }
                }
              },
              timestamp: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    },
    403: {
      description: 'Forbidden - Insufficient permissions',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: false },
              error: {
                type: 'object',
                properties: {
                  code: { type: 'string', example: 'AUTHORIZATION_FAILED' },
                  message: { type: 'string', example: 'Insufficient permissions' }
                }
              },
              timestamp: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    },
    404: {
      description: 'Not Found - Resource not found',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: false },
              error: {
                type: 'object',
                properties: {
                  code: { type: 'string', example: 'RESOURCE_NOT_FOUND' },
                  message: { type: 'string', example: 'Resource not found' }
                }
              },
              timestamp: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    },
    429: {
      description: 'Too Many Requests - Rate limit exceeded',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: false },
              error: {
                type: 'object',
                properties: {
                  code: { type: 'string', example: 'RATE_LIMIT_EXCEEDED' },
                  message: { type: 'string', example: 'Rate limit exceeded' },
                  details: {
                    type: 'object',
                    properties: {
                      retryAfter: { type: 'number', example: 60 }
                    }
                  }
                }
              },
              timestamp: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    },
    500: {
      description: 'Internal Server Error',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: false },
              error: {
                type: 'object',
                properties: {
                  code: { type: 'string', example: 'INTERNAL_ERROR' },
                  message: { type: 'string', example: 'Internal server error' }
                }
              },
              timestamp: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  };
}

/**
 * Generates security requirements for authenticated endpoints
 */
export function generateSecurityRequirements() {
  return [
    {
      bearerAuth: []
    }
  ];
}

/**
 * Generates pagination query parameters
 */
export function generatePaginationParameters() {
  return [
    {
      name: 'page',
      in: 'query',
      description: 'Page number (1-based)',
      required: false,
      schema: {
        type: 'integer',
        minimum: 1,
        default: 1
      }
    },
    {
      name: 'limit',
      in: 'query',
      description: 'Number of items per page',
      required: false,
      schema: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 20
      }
    }
  ];
}

/**
 * Generates sort query parameters
 */
export function generateSortParameters(allowedFields: string[]) {
  return [
    {
      name: 'sortBy',
      in: 'query',
      description: 'Field to sort by',
      required: false,
      schema: {
        type: 'string',
        enum: allowedFields,
        default: allowedFields[0]
      }
    },
    {
      name: 'sortOrder',
      in: 'query',
      description: 'Sort order',
      required: false,
      schema: {
        type: 'string',
        enum: ['asc', 'desc'],
        default: 'asc'
      }
    }
  ];
}

/**
 * Generates standard success response wrapper
 */
export function generateSuccessResponse(dataSchema: any, description: string) {
  return {
    description,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: dataSchema,
            meta: {
              type: 'object',
              properties: {
                timestamp: { type: 'string', format: 'date-time' },
                version: { type: 'string', example: '1.0.0' },
                processingTime: { type: 'number', example: 150 }
              }
            }
          },
          required: ['success', 'data']
        }
      }
    }
  };
}

/**
 * Generates file upload request body schema
 */
export function generateFileUploadSchema(additionalFields?: Record<string, any>) {
  const baseSchema = {
    type: 'object',
    properties: {
      file: {
        type: 'string',
        format: 'binary',
        description: 'File to upload'
      }
    },
    required: ['file']
  };

  if (additionalFields) {
    baseSchema.properties = { ...baseSchema.properties, ...additionalFields };
  }

  return {
    content: {
      'multipart/form-data': {
        schema: baseSchema
      }
    }
  };
}

/**
 * Generates OpenAPI security schemes
 */
export function generateSecuritySchemes() {
  return {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'JWT token obtained from login endpoint'
    },
    apiKey: {
      type: 'apiKey',
      in: 'header',
      name: 'X-API-Key',
      description: 'API key for service-to-service communication'
    }
  };
}