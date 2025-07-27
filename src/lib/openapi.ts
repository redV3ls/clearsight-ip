import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { Env } from '../index';

export function createOpenAPIApp() {
  const app = new OpenAPIHono<{ Bindings: Env }>();

  // OpenAPI documentation configuration
  app.doc('/openapi.json', {
    openapi: '3.0.0',
    info: {
      title: 'Skill Gap Analysis API',
      version: '1.0.0',
      description: `
# Skill Gap Analysis API

A comprehensive API for analyzing skill gaps, tracking professional development, and providing insights for career growth.

## Key Features

- **Skill Gap Analysis**: Compare current skills against job requirements
- **Team Analysis**: Analyze team capabilities and identify skill gaps
- **Industry Trends**: Track emerging and declining skills in various industries
- **User Profiles**: Manage user skills and track progression
- **GDPR Compliance**: Data export, retention, and deletion features
- **Async Processing**: Handle large-scale analyses with job queuing
- **Caching**: High-performance caching for optimal response times

## Authentication

The API uses JWT-based authentication. Include the token in the Authorization header:

\`\`\`
Authorization: Bearer YOUR_JWT_TOKEN
\`\`\`

API keys are also supported for service-to-service communication:

\`\`\`
X-API-Key: YOUR_API_KEY
\`\`\`

## Rate Limiting

- Default: 100 requests per 15 minutes per IP
- Authenticated users: 500 requests per 15 minutes
- API keys: Configurable based on tier

## Versioning

The API uses URL-based versioning. Current version: v1

All endpoints are prefixed with \`/api/v1\`

## Response Format

All responses follow a consistent format:

\`\`\`json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-20T10:30:00Z",
    "version": "1.0.0"
  }
}
\`\`\`

Error responses:

\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  }
}
\`\`\`
      `,
      termsOfService: 'https://clearsight-ip.com/terms',
      contact: {
        name: 'Clearsight IP API Support',
        url: 'https://clearsight-ip.com/support',
        email: 'support@clearsight-ip.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'https://clearsight-ip.com',
        description: 'Production API Server'
      }
    ],
    tags: [
      {
        name: 'Health',
        description: 'API health and status endpoints'
      },
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Analysis',
        description: 'Skill gap and team analysis endpoints'
      },
      {
        name: 'Users',
        description: 'User profile and skill management'
      },
      {
        name: 'Trends',
        description: 'Industry trends and skill insights'
      },
      {
        name: 'Jobs',
        description: 'Asynchronous job processing'
      },
      {
        name: 'GDPR',
        description: 'Data privacy and compliance endpoints'
      },
      {
        name: 'Audit',
        description: 'Audit logging and compliance tracking'
      },
      {
        name: 'Monitoring',
        description: 'System monitoring and health checks'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT authentication token'
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for service-to-service communication'
        }
      },
      schemas: {
        Error: z.object({
          success: z.literal(false),
          error: z.object({
            code: z.string(),
            message: z.string(),
            details: z.any().optional()
          })
        }),
        SuccessResponse: z.object({
          success: z.literal(true),
          data: z.any(),
          meta: z.object({
            timestamp: z.string().datetime(),
            version: z.string()
          }).optional()
        }),
        PaginationMeta: z.object({
          page: z.number().int().positive(),
          limit: z.number().int().positive(),
          total: z.number().int().nonnegative(),
          totalPages: z.number().int().nonnegative()
        }),
        Skill: z.object({
          id: z.string(),
          name: z.string(),
          category: z.string(),
          level: z.number().min(1).max(5),
          yearsOfExperience: z.number().optional(),
          lastUsed: z.string().datetime().optional(),
          verified: z.boolean().optional()
        }),
        User: z.object({
          id: z.string(),
          email: z.string().email(),
          name: z.string().optional(),
          role: z.enum(['user', 'admin']),
          createdAt: z.string().datetime(),
          updatedAt: z.string().datetime()
        }),
        GapAnalysisResult: z.object({
          overallMatch: z.number().min(0).max(100),
          gaps: z.array(z.object({
            skill: z.string(),
            required: z.number(),
            current: z.number(),
            gap: z.number(),
            priority: z.enum(['high', 'medium', 'low'])
          })),
          recommendations: z.array(z.object({
            skill: z.string(),
            description: z.string(),
            resources: z.array(z.string()).optional()
          })),
          strengths: z.array(z.string())
        })
      }
    }
  });

  // Add some sample API routes for documentation
  const healthRoute = createRoute({
    method: 'get',
    path: '/health',
    tags: ['Health'],
    summary: 'Health check endpoint',
    description: 'Check the health status of the API',
    responses: {
      200: {
        description: 'API is healthy',
        content: {
          'application/json': {
            schema: z.object({
              status: z.string(),
              timestamp: z.string(),
              version: z.string(),
              environment: z.string()
            })
          }
        }
      }
    }
  });

  const loginRoute = createRoute({
    method: 'post',
    path: '/api/v1/auth/login',
    tags: ['Authentication'],
    summary: 'User login',
    description: 'Authenticate user and receive JWT token',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: z.object({
            email: z.string().email(),
            password: z.string().min(8)
          })
        }
      }
    },
    responses: {
      200: {
        description: 'Login successful',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.object({
                token: z.string(),
                user: z.object({
                  id: z.string(),
                  email: z.string(),
                  name: z.string()
                })
              })
            })
          }
        }
      },
      401: {
        description: 'Invalid credentials',
        content: {
          'application/json': {
            schema: z.object({
              error: z.object({
                code: z.string(),
                message: z.string()
              })
            })
          }
        }
      }
    }
  });

  const registerRoute = createRoute({
    method: 'post',
    path: '/api/v1/auth/register',
    tags: ['Authentication'],
    summary: 'User registration',
    description: 'Register a new user account',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: z.object({
            email: z.string().email(),
            password: z.string().min(8),
            name: z.string().min(1)
          })
        }
      }
    },
    responses: {
      201: {
        description: 'Registration successful',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.object({
                token: z.string(),
                user: z.object({
                  id: z.string(),
                  email: z.string(),
                  name: z.string()
                })
              })
            })
          }
        }
      }
    }
  });

  const gapAnalysisRoute = createRoute({
    method: 'post',
    path: '/api/v1/analyze/gap',
    tags: ['Analysis'],
    summary: 'Skill gap analysis',
    description: 'Analyze skill gaps between user skills and job requirements',
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: z.object({
            user_skills: z.array(z.object({
              skill: z.string(),
              level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
              years_experience: z.number().optional()
            })),
            target_job: z.object({
              title: z.string(),
              description: z.string(),
              required_skills: z.array(z.string())
            })
          })
        }
      }
    },
    responses: {
      200: {
        description: 'Gap analysis completed',
        content: {
          'application/json': {
            schema: z.object({
              analysis_id: z.string(),
              overall_match: z.number(),
              skill_gaps: z.array(z.object({
                skill_name: z.string(),
                current_level: z.string(),
                required_level: z.string(),
                gap_severity: z.string()
              }))
            })
          }
        }
      }
    }
  });

  const trendsRoute = createRoute({
    method: 'get',
    path: '/api/v1/trends/skills/emerging',
    tags: ['Trends'],
    summary: 'Get emerging skills',
    description: 'Retrieve trending and emerging skills data',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'category',
        in: 'query',
        required: false,
        schema: { type: 'string' }
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: { type: 'number', default: 20 }
      }
    ],
    responses: {
      200: {
        description: 'Emerging skills data',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.object({
                emergingSkills: z.array(z.object({
                  skillName: z.string(),
                  category: z.string(),
                  growthVelocity: z.number()
                }))
              })
            })
          }
        }
      }
    }
  });

  // Register the routes (these are just for documentation, not actual handlers)
  app.openapi(healthRoute, (c) => c.json({ message: 'Documentation only' }));
  app.openapi(loginRoute, (c) => c.json({ message: 'Documentation only' }));
  app.openapi(registerRoute, (c) => c.json({ message: 'Documentation only' }));
  app.openapi(gapAnalysisRoute, (c) => c.json({ message: 'Documentation only' }));
  app.openapi(trendsRoute, (c) => c.json({ message: 'Documentation only' }));

  // Add Swagger UI with better configuration
  app.get('/api/v1/docs', swaggerUI({ 
    url: '/openapi.json',
    documentTitle: 'Clearsight IP - Skill Gap Analysis API Documentation',
    persistAuthorization: true,
    theme: 'light'
  }));

  // Redirect /api/v1/docs/ to /api/v1/docs
  app.get('/api/v1/docs/', (c) => c.redirect('/api/v1/docs'));

  return app;
}

// Helper function to create typed routes
export function createTypedRoute<TPath extends string, TMethod extends string>(
  config: Parameters<typeof createRoute>[0]
) {
  return createRoute(config);
}
