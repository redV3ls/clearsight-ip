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
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', enum: [false] },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                details: { type: 'object' }
              },
              required: ['code', 'message']
            }
          },
          required: ['success', 'error']
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', enum: [true] },
            data: { type: 'object' },
            meta: {
              type: 'object',
              properties: {
                timestamp: { type: 'string', format: 'date-time' },
                version: { type: 'string' }
              }
            }
          },
          required: ['success', 'data']
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          },
          required: ['id', 'email', 'role', 'createdAt', 'updatedAt']
        },
        Skill: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            category: { type: 'string' },
            level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced', 'expert'] },
            yearsOfExperience: { type: 'number', minimum: 0 },
            lastUsed: { type: 'string', format: 'date-time' },
            verified: { type: 'boolean' }
          },
          required: ['id', 'name', 'category', 'level']
        },
        Job: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            company: { type: 'string' },
            location: { type: 'string' },
            description: { type: 'string' },
            requiredSkills: {
              type: 'array',
              items: { type: 'string' }
            },
            salaryRange: {
              type: 'object',
              properties: {
                min: { type: 'number' },
                max: { type: 'number' },
                currency: { type: 'string' }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          },
          required: ['id', 'title', 'description', 'requiredSkills']
        },
        GapAnalysisResult: {
          type: 'object',
          properties: {
            analysisId: { type: 'string' },
            overallMatch: { type: 'number', minimum: 0, maximum: 100 },
            skillGaps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  skillName: { type: 'string' },
                  currentLevel: { type: 'string' },
                  requiredLevel: { type: 'string' },
                  gapSeverity: { type: 'string', enum: ['critical', 'moderate', 'minor'] },
                  priority: { type: 'string', enum: ['high', 'medium', 'low'] }
                }
              }
            },
            recommendations: {
              type: 'array',
              items: { type: 'string' }
            },
            strengths: {
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ['analysisId', 'overallMatch', 'skillGaps']
        },
        TeamAnalysisResult: {
          type: 'object',
          properties: {
            analysisId: { type: 'string' },
            teamSummary: {
              type: 'object',
              properties: {
                totalMembers: { type: 'number' },
                overallMatch: { type: 'number' },
                criticalGapsCount: { type: 'number' },
                skillCoveragePercentage: { type: 'number' }
              }
            },
            recommendations: {
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ['analysisId', 'teamSummary']
        },
        EmergingSkill: {
          type: 'object',
          properties: {
            skillName: { type: 'string' },
            category: { type: 'string' },
            emergenceScore: { type: 'number' },
            growthVelocity: { type: 'number' },
            relatedSkills: {
              type: 'array',
              items: { type: 'string' }
            },
            adoptionRate: { type: 'number' }
          },
          required: ['skillName', 'category', 'emergenceScore', 'growthVelocity']
        },
        AuditLog: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            action: { type: 'string' },
            resourceType: { type: 'string' },
            resourceId: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
            ipAddress: { type: 'string' },
            metadata: { type: 'object' }
          },
          required: ['id', 'userId', 'action', 'resourceType', 'timestamp']
        }
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

  const detailedHealthRoute = createRoute({
    method: 'get',
    path: '/health/detailed',
    tags: ['Health'],
    summary: 'Detailed health check',
    description: 'Check detailed health status including dependencies',
    responses: {
      200: {
        description: 'Detailed health information',
        content: {
          'application/json': {
            schema: z.object({
              status: z.string(),
              timestamp: z.string(),
              version: z.string(),
              environment: z.string(),
              dependencies: z.object({
                database: z.string(),
                cache: z.string()
              }),
              cloudflare: z.object({
                colo: z.string(),
                country: z.string(),
                ray: z.string()
              })
            })
          }
        }
      }
    }
  });

  const gapAnalysisHistoryRoute = createRoute({
    method: 'get',
    path: '/api/v1/analyze/gap/history',
    tags: ['Analysis'],
    summary: 'Get gap analysis history',
    description: 'Retrieve user\'s gap analysis history',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'page',
        in: 'query',
        required: false,
        schema: { type: 'number', default: 1 }
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: { type: 'number', default: 10 }
      }
    ],
    responses: {
      200: {
        description: 'Gap analysis history',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.object({
                analyses: z.array(z.object({
                  id: z.string(),
                  targetJobTitle: z.string(),
                  overallMatch: z.number(),
                  skillGapsCount: z.number(),
                  createdAt: z.string().datetime()
                })),
                pagination: z.object({
                  page: z.number(),
                  limit: z.number(),
                  total: z.number(),
                  pages: z.number()
                })
              })
            })
          }
        }
      }
    }
  });

  const teamAnalysisRoute = createRoute({
    method: 'post',
    path: '/api/v1/analyze/team',
    tags: ['Analysis'],
    summary: 'Team skill analysis',
    description: 'Analyze team capabilities against project requirements',
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: z.object({
            teamMembers: z.array(z.object({
              id: z.string(),
              name: z.string(),
              skills: z.array(z.object({
                skill: z.string(),
                level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
                yearsExperience: z.number().optional()
              }))
            })),
            projectRequirements: z.object({
              name: z.string(),
              description: z.string(),
              requiredSkills: z.array(z.string()),
              timeline: z.string().optional(),
              priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium')
            })
          })
        }
      }
    },
    responses: {
      200: {
        description: 'Team analysis completed',
        content: {
          'application/json': {
            schema: z.object({
              analysisId: z.string(),
              teamSummary: z.object({
                totalMembers: z.number(),
                overallMatch: z.number(),
                criticalGapsCount: z.number(),
                skillCoveragePercentage: z.number()
              }),
              recommendations: z.array(z.string())
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

  // Additional Authentication endpoints
  const logoutRoute = createRoute({
    method: 'post',
    path: '/api/v1/auth/logout',
    tags: ['Authentication'],
    summary: 'User logout',
    description: 'Logout user and invalidate token',
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'Logout successful',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              message: z.string()
            })
          }
        }
      }
    }
  });

  const changePasswordRoute = createRoute({
    method: 'post',
    path: '/api/v1/auth/change-password',
    tags: ['Authentication'],
    summary: 'Change password',
    description: 'Change user password',
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: z.object({
            currentPassword: z.string(),
            newPassword: z.string().min(8)
          })
        }
      }
    },
    responses: {
      200: {
        description: 'Password changed successfully',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              message: z.string()
            })
          }
        }
      }
    }
  });

  // User Profile endpoints
  const getUserProfileRoute = createRoute({
    method: 'get',
    path: '/api/v1/users/profile',
    tags: ['Users'],
    summary: 'Get user profile',
    description: 'Retrieve current user profile and skills',
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'User profile data',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.object({
                user: z.object({
                  id: z.string(),
                  email: z.string(),
                  name: z.string(),
                  bio: z.string().optional(),
                  location: z.string().optional()
                }),
                skills: z.array(z.object({
                  skill: z.string(),
                  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
                  yearsExperience: z.number().optional()
                }))
              })
            })
          }
        }
      }
    }
  });

  const updateUserProfileRoute = createRoute({
    method: 'post',
    path: '/api/v1/users/profile',
    tags: ['Users'],
    summary: 'Update user profile',
    description: 'Update user profile information and skills',
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: z.object({
            name: z.string().optional(),
            bio: z.string().optional(),
            location: z.string().optional(),
            skills: z.array(z.object({
              skill: z.string(),
              level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
              yearsExperience: z.number().optional()
            })).optional()
          })
        }
      }
    },
    responses: {
      200: {
        description: 'Profile updated successfully',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.object({
                message: z.string()
              })
            })
          }
        }
      }
    }
  });

  // Job endpoints
  const jobSearchRoute = createRoute({
    method: 'get',
    path: '/api/v1/jobs/search',
    tags: ['Jobs'],
    summary: 'Search jobs',
    description: 'Search for jobs with filters',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'title',
        in: 'query',
        required: false,
        schema: { type: 'string' }
      },
      {
        name: 'company',
        in: 'query',
        required: false,
        schema: { type: 'string' }
      },
      {
        name: 'location',
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
        description: 'Job search results',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.array(z.object({
                id: z.string(),
                title: z.string(),
                company: z.string(),
                location: z.string(),
                description: z.string(),
                requiredSkills: z.array(z.string()),
                salaryRange: z.object({
                  min: z.number().optional(),
                  max: z.number().optional(),
                  currency: z.string().optional()
                }).optional()
              }))
            })
          }
        }
      }
    }
  });

  // Monitoring endpoints
  const cacheStatsRoute = createRoute({
    method: 'get',
    path: '/api/v1/monitoring/cache/stats',
    tags: ['Monitoring'],
    summary: 'Get cache statistics',
    description: 'Retrieve cache performance statistics',
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'Cache statistics',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.object({
                hitRate: z.number(),
                missRate: z.number(),
                totalRequests: z.number(),
                cacheSize: z.number(),
                lastCleared: z.string().datetime().optional()
              })
            })
          }
        }
      }
    }
  });

  // GDPR endpoints
  const gdprExportRoute = createRoute({
    method: 'post',
    path: '/api/v1/gdpr/export',
    tags: ['GDPR'],
    summary: 'Request data export',
    description: 'Request export of user data for GDPR compliance',
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: z.object({
            format: z.enum(['json', 'csv']).default('json'),
            categories: z.array(z.string()).optional()
          })
        }
      }
    },
    responses: {
      202: {
        description: 'Export request accepted',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.object({
                exportId: z.string(),
                status: z.string(),
                estimatedCompletion: z.string().datetime()
              })
            })
          }
        }
      }
    }
  });

  // Audit endpoints
  const auditLogsRoute = createRoute({
    method: 'get',
    path: '/api/v1/audit/my-logs',
    tags: ['Audit'],
    summary: 'Get user audit logs',
    description: 'Retrieve audit logs for the current user',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: { type: 'number', default: 50 }
      },
      {
        name: 'startDate',
        in: 'query',
        required: false,
        schema: { type: 'string', format: 'date-time' }
      },
      {
        name: 'endDate',
        in: 'query',
        required: false,
        schema: { type: 'string', format: 'date-time' }
      }
    ],
    responses: {
      200: {
        description: 'User audit logs',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.array(z.object({
                id: z.string(),
                action: z.string(),
                resourceType: z.string(),
                timestamp: z.string().datetime(),
                ipAddress: z.string().optional()
              }))
            })
          }
        }
      }
    }
  });

  // Register the routes (these are just for documentation, not actual handlers)
  app.openapi(healthRoute, (c) => c.json({ message: 'Documentation only' }));
  app.openapi(detailedHealthRoute, (c) => c.json({ message: 'Documentation only' }));
  app.openapi(loginRoute, (c) => c.json({ message: 'Documentation only' }));
  app.openapi(registerRoute, (c) => c.json({ message: 'Documentation only' }));
  app.openapi(logoutRoute, (c) => c.json({ message: 'Documentation only' }));
  app.openapi(changePasswordRoute, (c) => c.json({ message: 'Documentation only' }));
  app.openapi(gapAnalysisRoute, (c) => c.json({ message: 'Documentation only' }));
  app.openapi(gapAnalysisHistoryRoute, (c) => c.json({ message: 'Documentation only' }));
  app.openapi(teamAnalysisRoute, (c) => c.json({ message: 'Documentation only' }));
  app.openapi(trendsRoute, (c) => c.json({ message: 'Documentation only' }));
  app.openapi(getUserProfileRoute, (c) => c.json({ message: 'Documentation only' }));
  app.openapi(updateUserProfileRoute, (c) => c.json({ message: 'Documentation only' }));
  app.openapi(jobSearchRoute, (c) => c.json({ message: 'Documentation only' }));
  app.openapi(cacheStatsRoute, (c) => c.json({ message: 'Documentation only' }));
  app.openapi(gdprExportRoute, (c) => c.json({ message: 'Documentation only' }));
  app.openapi(auditLogsRoute, (c) => c.json({ message: 'Documentation only' }));

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
