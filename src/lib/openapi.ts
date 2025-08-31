import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { Env } from '../index';

export function createOpenAPIApp() {
  const app = new OpenAPIHono<{ Bindings: Env }>();

  // OpenAPI documentation configuration
  app.doc('/openapi.json', {
    openapi: '3.0.0',
    info: {
      title: 'Clearsight IP API',
      version: '1.0.0',
      description: `
# Clearsight IP API

A comprehensive API for professional skills analysis, career development insights, and talent intelligence powered by AI.

## Key Features

- **Skills Intelligence**: Compare current skills against job requirements with AI-powered insights
- **Team Analysis**: Analyze team capabilities and identify development opportunities
- **Industry Trends**: Track emerging and declining skills in various industries
- **User Profiles**: Manage user skills and track progression
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
        description: 'Skills intelligence and team analysis endpoints'
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
            success: { type: 'boolean', enum: [false], example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'VALIDATION_ERROR' },
                message: { type: 'string', example: 'Invalid email format provided' },
                details: {
                  type: 'object',
                  example: {
                    field: 'email',
                    value: 'invalid-email',
                    constraint: 'Must be a valid email address'
                  }
                }
              },
              required: ['code', 'message']
            }
          },
          required: ['success', 'error'],
          example: {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid email format provided',
              details: {
                field: 'email',
                value: 'invalid-email',
                constraint: 'Must be a valid email address'
              }
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', enum: [true], example: true },
            data: {
              type: 'object',
              example: {
                message: 'Operation completed successfully',
                id: 'usr_1234567890abcdef'
              }
            },
            meta: {
              type: 'object',
              properties: {
                timestamp: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' },
                version: { type: 'string', example: '1.0.0' }
              }
            }
          },
          required: ['success', 'data'],
          example: {
            success: true,
            data: {
              message: 'Operation completed successfully',
              id: 'usr_1234567890abcdef'
            },
            meta: {
              timestamp: '2024-01-15T10:30:00Z',
              version: '1.0.0'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'usr_1234567890abcdef' },
            email: { type: 'string', format: 'email', example: 'sarah.johnson@techcorp.com' },
            name: { type: 'string', example: 'Sarah Johnson' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T09:30:00Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2024-01-20T14:45:00Z' }
          },
          required: ['id', 'email', 'role', 'createdAt', 'updatedAt'],
          example: {
            id: 'usr_1234567890abcdef',
            email: 'sarah.johnson@techcorp.com',
            name: 'Sarah Johnson',
            role: 'user',
            createdAt: '2024-01-15T09:30:00Z',
            updatedAt: '2024-01-20T14:45:00Z'
          }
        },
        Skill: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'skl_javascript_001' },
            name: { type: 'string', example: 'JavaScript' },
            category: { type: 'string', example: 'Programming Languages' },
            level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced', 'expert'], example: 'advanced' },
            yearsOfExperience: { type: 'number', minimum: 0, example: 5 },
            lastUsed: { type: 'string', format: 'date-time', example: '2024-01-20T16:30:00Z' },
            verified: { type: 'boolean', example: true }
          },
          required: ['id', 'name', 'category', 'level'],
          example: {
            id: 'skl_javascript_001',
            name: 'JavaScript',
            category: 'Programming Languages',
            level: 'advanced',
            yearsOfExperience: 5,
            lastUsed: '2024-01-20T16:30:00Z',
            verified: true
          }
        },
        Job: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'job_senior_frontend_dev_001' },
            title: { type: 'string', example: 'Senior Frontend Developer' },
            company: { type: 'string', example: 'TechCorp Solutions' },
            location: { type: 'string', example: 'San Francisco, CA (Remote)' },
            description: {
              type: 'string',
              example: 'We are seeking a Senior Frontend Developer to join our dynamic team. You will be responsible for building responsive web applications using modern JavaScript frameworks and collaborating with our design and backend teams.'
            },
            requiredSkills: {
              type: 'array',
              items: { type: 'string' },
              example: ['JavaScript', 'React', 'TypeScript', 'CSS', 'HTML', 'Git']
            },
            salaryRange: {
              type: 'object',
              properties: {
                min: { type: 'number', example: 120000 },
                max: { type: 'number', example: 160000 },
                currency: { type: 'string', example: 'USD' }
              },
              example: {
                min: 120000,
                max: 160000,
                currency: 'USD'
              }
            },
            createdAt: { type: 'string', format: 'date-time', example: '2024-01-18T10:00:00Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2024-01-20T15:30:00Z' }
          },
          required: ['id', 'title', 'description', 'requiredSkills'],
          example: {
            id: 'job_senior_frontend_dev_001',
            title: 'Senior Frontend Developer',
            company: 'TechCorp Solutions',
            location: 'San Francisco, CA (Remote)',
            description: 'We are seeking a Senior Frontend Developer to join our dynamic team. You will be responsible for building responsive web applications using modern JavaScript frameworks and collaborating with our design and backend teams.',
            requiredSkills: ['JavaScript', 'React', 'TypeScript', 'CSS', 'HTML', 'Git'],
            salaryRange: {
              min: 120000,
              max: 160000,
              currency: 'USD'
            },
            createdAt: '2024-01-18T10:00:00Z',
            updatedAt: '2024-01-20T15:30:00Z'
          }
        },
        GapAnalysisResult: {
          type: 'object',
          properties: {
            analysisId: { type: 'string', example: 'gap_analysis_20240120_001' },
            overallMatch: { type: 'number', minimum: 0, maximum: 100, example: 78 },
            skillGaps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  skillName: { type: 'string', example: 'TypeScript' },
                  currentLevel: { type: 'string', example: 'beginner' },
                  requiredLevel: { type: 'string', example: 'advanced' },
                  gapSeverity: { type: 'string', enum: ['critical', 'moderate', 'minor'], example: 'moderate' },
                  priority: { type: 'string', enum: ['high', 'medium', 'low'], example: 'high' }
                }
              },
              example: [
                {
                  skillName: 'TypeScript',
                  currentLevel: 'beginner',
                  requiredLevel: 'advanced',
                  gapSeverity: 'moderate',
                  priority: 'high'
                },
                {
                  skillName: 'Docker',
                  currentLevel: 'none',
                  requiredLevel: 'intermediate',
                  gapSeverity: 'critical',
                  priority: 'high'
                }
              ]
            },
            recommendations: {
              type: 'array',
              items: { type: 'string' },
              example: [
                'Complete TypeScript fundamentals course',
                'Build a project using Docker containers',
                'Practice advanced React patterns',
                'Learn GraphQL query optimization'
              ]
            },
            strengths: {
              type: 'array',
              items: { type: 'string' },
              example: [
                'Strong JavaScript fundamentals',
                'Excellent React component design',
                'Good understanding of REST APIs',
                'Solid CSS and responsive design skills'
              ]
            }
          },
          required: ['analysisId', 'overallMatch', 'skillGaps'],
          example: {
            analysisId: 'gap_analysis_20240120_001',
            overallMatch: 78,
            skillGaps: [
              {
                skillName: 'TypeScript',
                currentLevel: 'beginner',
                requiredLevel: 'advanced',
                gapSeverity: 'moderate',
                priority: 'high'
              }
            ],
            recommendations: [
              'Complete TypeScript fundamentals course',
              'Build a project using Docker containers'
            ],
            strengths: [
              'Strong JavaScript fundamentals',
              'Excellent React component design'
            ]
          }
        },
        TeamAnalysisResult: {
          type: 'object',
          properties: {
            analysisId: { type: 'string', example: 'team_analysis_mobile_app_001' },
            teamSummary: {
              type: 'object',
              properties: {
                totalMembers: { type: 'number', example: 5 },
                overallMatch: { type: 'number', example: 82 },
                criticalGapsCount: { type: 'number', example: 2 },
                skillCoveragePercentage: { type: 'number', example: 85 }
              },
              example: {
                totalMembers: 5,
                overallMatch: 82,
                criticalGapsCount: 2,
                skillCoveragePercentage: 85
              }
            },
            recommendations: {
              type: 'array',
              items: { type: 'string' },
              example: [
                'Hire a senior iOS developer with Swift expertise',
                'Provide Kotlin training for Android team members',
                'Consider cross-training frontend developers in mobile technologies',
                'Establish code review process for mobile-specific patterns'
              ]
            }
          },
          required: ['analysisId', 'teamSummary'],
          example: {
            analysisId: 'team_analysis_mobile_app_001',
            teamSummary: {
              totalMembers: 5,
              overallMatch: 82,
              criticalGapsCount: 2,
              skillCoveragePercentage: 85
            },
            recommendations: [
              'Hire a senior iOS developer with Swift expertise',
              'Provide Kotlin training for Android team members'
            ]
          }
        },
        EmergingSkill: {
          type: 'object',
          properties: {
            skillName: { type: 'string', example: 'Large Language Models (LLMs)' },
            category: { type: 'string', example: 'Artificial Intelligence' },
            emergenceScore: { type: 'number', example: 0.92 },
            growthVelocity: { type: 'number', example: 0.85 },
            relatedSkills: {
              type: 'array',
              items: { type: 'string' },
              example: ['Machine Learning', 'Natural Language Processing', 'Python', 'TensorFlow', 'PyTorch']
            },
            adoptionRate: { type: 'number', example: 0.34 }
          },
          required: ['skillName', 'category', 'emergenceScore', 'growthVelocity'],
          example: {
            skillName: 'Large Language Models (LLMs)',
            category: 'Artificial Intelligence',
            emergenceScore: 0.92,
            growthVelocity: 0.85,
            relatedSkills: ['Machine Learning', 'Natural Language Processing', 'Python', 'TensorFlow', 'PyTorch'],
            adoptionRate: 0.34
          }
        },
        AuditLog: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'audit_20240120_143052_001' },
            userId: { type: 'string', example: 'usr_1234567890abcdef' },
            action: { type: 'string', example: 'profile.skills.updated' },
            resourceType: { type: 'string', example: 'user_profile' },
            resourceId: { type: 'string', example: 'profile_usr_1234567890abcdef' },
            timestamp: { type: 'string', format: 'date-time', example: '2024-01-20T14:30:52Z' },
            ipAddress: { type: 'string', example: '192.168.1.100' },
            metadata: {
              type: 'object',
              example: {
                skillsAdded: ['Docker', 'Kubernetes'],
                skillsRemoved: ['jQuery'],
                skillsUpdated: [
                  { skill: 'React', oldLevel: 'intermediate', newLevel: 'advanced' }
                ],
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
            }
          },
          required: ['id', 'userId', 'action', 'resourceType', 'timestamp'],
          example: {
            id: 'audit_20240120_143052_001',
            userId: 'usr_1234567890abcdef',
            action: 'profile.skills.updated',
            resourceType: 'user_profile',
            resourceId: 'profile_usr_1234567890abcdef',
            timestamp: '2024-01-20T14:30:52Z',
            ipAddress: '192.168.1.100',
            metadata: {
              skillsAdded: ['Docker', 'Kubernetes'],
              skillsRemoved: ['jQuery'],
              skillsUpdated: [
                { skill: 'React', oldLevel: 'intermediate', newLevel: 'advanced' }
              ]
            }
          }
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
              status: z.string().openapi({ example: 'healthy' }),
              timestamp: z.string().openapi({ example: '2024-01-20T15:30:00Z' }),
              version: z.string().openapi({ example: '1.0.0' }),
              environment: z.string().openapi({ example: 'production' })
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
              status: z.string().openapi({ example: 'healthy' }),
              timestamp: z.string().openapi({ example: '2024-01-20T15:30:00Z' }),
              version: z.string().openapi({ example: '1.0.0' }),
              environment: z.string().openapi({ example: 'production' }),
              dependencies: z.object({
                database: z.string().openapi({ example: 'connected' }),
                cache: z.string().openapi({ example: 'connected' })
              }),
              cloudflare: z.object({
                colo: z.string().openapi({ example: 'SFO' }),
                country: z.string().openapi({ example: 'US' }),
                ray: z.string().openapi({ example: '8a1b2c3d4e5f6789' })
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
              success: z.boolean().openapi({ example: true }),
              data: z.object({
                analyses: z.array(z.object({
                  id: z.string().openapi({ example: 'gap_analysis_20240120_001' }),
                  targetJobTitle: z.string().openapi({ example: 'Senior Frontend Developer' }),
                  overallMatch: z.number().openapi({ example: 78 }),
                  skillGapsCount: z.number().openapi({ example: 3 }),
                  createdAt: z.string().datetime().openapi({ example: '2024-01-20T10:30:00Z' })
                })),
                pagination: z.object({
                  page: z.number().openapi({ example: 1 }),
                  limit: z.number().openapi({ example: 10 }),
                  total: z.number().openapi({ example: 25 }),
                  pages: z.number().openapi({ example: 3 })
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
              id: z.string().openapi({ example: 'usr_1234567890abcdef' }),
              name: z.string().openapi({ example: 'Sarah Johnson' }),
              skills: z.array(z.object({
                skill: z.string().openapi({ example: 'JavaScript' }),
                level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).openapi({ example: 'advanced' }),
                yearsExperience: z.number().optional().openapi({ example: 5 })
              }))
            })),
            projectRequirements: z.object({
              name: z.string().openapi({ example: 'Mobile App Development' }),
              description: z.string().openapi({ example: 'Build a cross-platform mobile application using React Native' }),
              requiredSkills: z.array(z.string()).openapi({ example: ['React Native', 'JavaScript', 'iOS', 'Android'] }),
              timeline: z.string().optional().openapi({ example: '6 months' }),
              priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium').openapi({ example: 'high' })
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
              analysisId: z.string().openapi({ example: 'team_analysis_mobile_app_001' }),
              teamSummary: z.object({
                totalMembers: z.number().openapi({ example: 5 }),
                overallMatch: z.number().openapi({ example: 82 }),
                criticalGapsCount: z.number().openapi({ example: 2 }),
                skillCoveragePercentage: z.number().openapi({ example: 85 })
              }),
              recommendations: z.array(z.string()).openapi({ example: ['Hire a senior iOS developer with Swift expertise', 'Provide Kotlin training for Android team members'] })
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
            email: z.string().email().openapi({ example: 'sarah.johnson@techcorp.com' }),
            password: z.string().min(8).openapi({ example: 'MySecurePassword123!' })
          }),
          example: {
            email: 'sarah.johnson@techcorp.com',
            password: 'MySecurePassword123!'
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Login successful',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean().openapi({ example: true }),
              data: z.object({
                token: z.string().openapi({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfMTIzNDU2Nzg5MGFiY2RlZiIsImVtYWlsIjoic2FyYWguam9obnNvbkB0ZWNoY29ycC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTcwNTc1MjAwMCwiZXhwIjoxNzA1ODM4NDAwfQ.example_signature' }),
                user: z.object({
                  id: z.string().openapi({ example: 'usr_1234567890abcdef' }),
                  email: z.string().openapi({ example: 'sarah.johnson@techcorp.com' }),
                  name: z.string().openapi({ example: 'Sarah Johnson' })
                })
              })
            }),
            example: {
              success: true,
              data: {
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfMTIzNDU2Nzg5MGFiY2RlZiIsImVtYWlsIjoic2FyYWguam9obnNvbkB0ZWNoY29ycC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTcwNTc1MjAwMCwiZXhwIjoxNzA1ODM4NDAwfQ.example_signature',
                user: {
                  id: 'usr_1234567890abcdef',
                  email: 'sarah.johnson@techcorp.com',
                  name: 'Sarah Johnson'
                }
              }
            }
          }
        }
      },
      401: {
        description: 'Invalid credentials',
        content: {
          'application/json': {
            schema: z.object({
              error: z.object({
                code: z.string().openapi({ example: 'INVALID_CREDENTIALS' }),
                message: z.string().openapi({ example: 'Invalid email or password provided' })
              })
            }),
            example: {
              error: {
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password provided'
              }
            }
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
            email: z.string().email().openapi({ example: 'alex.developer@newcompany.com' }),
            password: z.string().min(8).openapi({ example: 'SecureNewPassword456!' }),
            name: z.string().min(1).openapi({ example: 'Alex Developer' })
          }),
          example: {
            email: 'alex.developer@newcompany.com',
            password: 'SecureNewPassword456!',
            name: 'Alex Developer'
          }
        }
      }
    },
    responses: {
      201: {
        description: 'Registration successful',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean().openapi({ example: true }),
              data: z.object({
                token: z.string().openapi({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfOTg3NjU0MzIxMGZlZGNiYSIsImVtYWlsIjoiYWxleC5kZXZlbG9wZXJAbmV3Y29tcGFueS5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTcwNTc1MjAwMCwiZXhwIjoxNzA1ODM4NDAwfQ.example_new_user_signature' }),
                user: z.object({
                  id: z.string().openapi({ example: 'usr_9876543210fedcba' }),
                  email: z.string().openapi({ example: 'alex.developer@newcompany.com' }),
                  name: z.string().openapi({ example: 'Alex Developer' })
                })
              })
            }),
            example: {
              success: true,
              data: {
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfOTg3NjU0MzIxMGZlZGNiYSIsImVtYWlsIjoiYWxleC5kZXZlbG9wZXJAbmV3Y29tcGFueS5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTcwNTc1MjAwMCwiZXhwIjoxNzA1ODM4NDAwfQ.example_new_user_signature',
                user: {
                  id: 'usr_9876543210fedcba',
                  email: 'alex.developer@newcompany.com',
                  name: 'Alex Developer'
                }
              }
            }
          }
        }
      }
    }
  });

  const gapAnalysisRoute = createRoute({
    method: 'post',
    path: '/api/v1/analyze/gap',
    tags: ['Analysis'],
    summary: 'Skills intelligence analysis',
    description: 'Analyze skills alignment between user capabilities and job requirements',
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: z.object({
            user_skills: z.array(z.object({
              skill: z.string().openapi({ example: 'JavaScript' }),
              level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).openapi({ example: 'advanced' }),
              years_experience: z.number().optional().openapi({ example: 5 })
            })),
            target_job: z.object({
              title: z.string().openapi({ example: 'Senior Frontend Developer' }),
              description: z.string().openapi({ example: 'We are seeking a Senior Frontend Developer to join our dynamic team. You will be responsible for building responsive web applications using modern JavaScript frameworks and collaborating with our design and backend teams.' }),
              required_skills: z.array(z.string()).openapi({ example: ['JavaScript', 'React', 'TypeScript', 'CSS', 'HTML', 'Git'] })
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
              analysis_id: z.string().openapi({ example: 'gap_analysis_20240120_001' }),
              overall_match: z.number().openapi({ example: 78 }),
              skill_gaps: z.array(z.object({
                skill_name: z.string().openapi({ example: 'TypeScript' }),
                current_level: z.string().openapi({ example: 'beginner' }),
                required_level: z.string().openapi({ example: 'advanced' }),
                gap_severity: z.string().openapi({ example: 'moderate' })
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
        schema: { type: 'string', example: 'Programming Languages' }
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
              success: z.boolean().openapi({ example: true }),
              data: z.object({
                emergingSkills: z.array(z.object({
                  skillName: z.string().openapi({ example: 'Large Language Models (LLMs)' }),
                  category: z.string().openapi({ example: 'Artificial Intelligence' }),
                  growthVelocity: z.number().openapi({ example: 0.85 })
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
              success: z.boolean().openapi({ example: true }),
              message: z.string().openapi({ example: 'Successfully logged out' })
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
            currentPassword: z.string().openapi({ example: 'MyCurrentPassword123!' }),
            newPassword: z.string().min(8).openapi({ example: 'MyNewSecurePassword456!' })
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
              success: z.boolean().openapi({ example: true }),
              message: z.string().openapi({ example: 'Password changed successfully' })
            })
          }
        }
      }
    }
  });

  const requestResetRoute = createRoute({
    method: 'post',
    path: '/api/v1/auth/request-reset',
    tags: ['Authentication'],
    summary: 'Request password reset',
    description: 'Request a password reset token to be sent via email',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: z.object({
            email: z.string().email().openapi({ example: 'user@example.com' })
          })
        }
      }
    },
    responses: {
      200: {
        description: 'Reset request processed',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean().openapi({ example: true }),
              message: z.string().openapi({ example: 'If this email exists, a reset link has been sent' })
            })
          }
        }
      }
    }
  });

  const resetPasswordRoute = createRoute({
    method: 'post',
    path: '/api/v1/auth/reset-password',
    tags: ['Authentication'],
    summary: 'Reset password',
    description: 'Reset password using a valid reset token',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: z.object({
            token: z.string().openapi({ example: 'abc123def456...' }),
            newPassword: z.string().min(8).openapi({ example: 'MyNewSecurePassword789!' })
          })
        }
      }
    },
    responses: {
      200: {
        description: 'Password reset successful',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean().openapi({ example: true }),
              message: z.string().openapi({ example: 'Password reset successfully' })
            })
          }
        }
      },
      400: {
        description: 'Invalid or expired token',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean().openapi({ example: false }),
              error: z.object({
                code: z.string().openapi({ example: 'INVALID_TOKEN' }),
                message: z.string().openapi({ example: 'Invalid reset token' })
              })
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
              success: z.boolean().openapi({ example: true }),
              data: z.object({
                user: z.object({
                  id: z.string().openapi({ example: 'usr_1234567890abcdef' }),
                  email: z.string().openapi({ example: 'sarah.johnson@techcorp.com' }),
                  name: z.string().openapi({ example: 'Sarah Johnson' }),
                  bio: z.string().optional().openapi({ example: 'Experienced frontend developer passionate about creating user-friendly web applications' }),
                  location: z.string().optional().openapi({ example: 'San Francisco, CA' })
                }),
                skills: z.array(z.object({
                  skill: z.string().openapi({ example: 'JavaScript' }),
                  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).openapi({ example: 'advanced' }),
                  yearsExperience: z.number().optional().openapi({ example: 5 })
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
            name: z.string().optional().openapi({ example: 'Sarah Johnson' }),
            bio: z.string().optional().openapi({ example: 'Experienced frontend developer passionate about creating user-friendly web applications' }),
            location: z.string().optional().openapi({ example: 'San Francisco, CA' }),
            skills: z.array(z.object({
              skill: z.string().openapi({ example: 'JavaScript' }),
              level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).openapi({ example: 'advanced' }),
              yearsExperience: z.number().optional().openapi({ example: 5 })
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
              success: z.boolean().openapi({ example: true }),
              data: z.object({
                message: z.string().openapi({ example: 'Profile updated successfully' })
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
        schema: { type: 'string', example: 'Senior Frontend Developer' }
      },
      {
        name: 'company',
        in: 'query',
        required: false,
        schema: { type: 'string', example: 'TechCorp Solutions' }
      },
      {
        name: 'location',
        in: 'query',
        required: false,
        schema: { type: 'string', example: 'San Francisco, CA' }
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
              success: z.boolean().openapi({ example: true }),
              data: z.array(z.object({
                id: z.string().openapi({ example: 'job_senior_frontend_dev_001' }),
                title: z.string().openapi({ example: 'Senior Frontend Developer' }),
                company: z.string().openapi({ example: 'TechCorp Solutions' }),
                location: z.string().openapi({ example: 'San Francisco, CA (Remote)' }),
                description: z.string().openapi({ example: 'We are seeking a Senior Frontend Developer to join our dynamic team. You will be responsible for building responsive web applications using modern JavaScript frameworks and collaborating with our design and backend teams.' }),
                requiredSkills: z.array(z.string()).openapi({ example: ['JavaScript', 'React', 'TypeScript', 'CSS', 'HTML', 'Git'] }),
                salaryRange: z.object({
                  min: z.number().optional().openapi({ example: 120000 }),
                  max: z.number().optional().openapi({ example: 160000 }),
                  currency: z.string().optional().openapi({ example: 'USD' })
                }).optional()
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
  app.openapi(requestResetRoute, (c) => c.json({ message: 'Documentation only' }));
  app.openapi(resetPasswordRoute, (c) => c.json({ message: 'Documentation only' }));
  app.openapi(gapAnalysisRoute, (c) => c.json({ message: 'Documentation only' }));
  app.openapi(gapAnalysisHistoryRoute, (c) => c.json({ message: 'Documentation only' }));
  app.openapi(teamAnalysisRoute, (c) => c.json({ message: 'Documentation only' }));
  app.openapi(trendsRoute, (c) => c.json({ message: 'Documentation only' }));
  app.openapi(getUserProfileRoute, (c) => c.json({ message: 'Documentation only' }));
  app.openapi(updateUserProfileRoute, (c) => c.json({ message: 'Documentation only' }));
  app.openapi(jobSearchRoute, (c) => c.json({ message: 'Documentation only' }));

  // Add Swagger UI in cookie-only mode (no token/header injection)
  app.get('/api/v1/docs', (c) => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Clearsight IP - Professional Skills Intelligence API Documentation</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
  <style>
    html, body { margin: 0; padding: 0; height: 100%; }
    #swagger-ui { height: 100%; }

    /* Brand variables to match the main app */
    :root {
      --primary: #14b8a6;
      --primary-600: #0d9488;
      --text: #e2e8f0;
      --border: #334155;
      --danger: #ef4444;
    }

    /* Make Swagger UI buttons look like the app's buttons */
    .swagger-ui .btn,
    .swagger-ui .opblock-control__btn,
    .swagger-ui .modal-ux .modal-btn {
      appearance: none;
      border: 1px solid var(--border) !important;
      background: #1f2937 !important; /* slate-800 */
      color: var(--text) !important;
      padding: 10px 14px !important; /* ~px-4 py-2 */
      border-radius: 10px !important; /* rounded-lg */
      font-weight: 700 !important; /* font-semibold */
      box-shadow: none !important;
      transition: all .2s ease !important;
    }

    .swagger-ui .btn:hover,
    .swagger-ui .opblock-control__btn:hover,
    .swagger-ui .modal-ux .modal-btn:hover {
      border-color: var(--primary) !important;
      color: var(--text) !important;
    }

    /* Primary actions (Authorize, Try it out, Execute) */
    .swagger-ui .btn.authorize,
    .swagger-ui .btn.execute,
    .swagger-ui .opblock-control__btn.try-out {
      background: linear-gradient(180deg, var(--primary), var(--primary-600)) !important;
      border-color: transparent !important;
      color: #0b1020 !important; /* dark text for contrast on teal */
    }
    .swagger-ui .btn.authorize svg { fill: #0b1020 !important; }

    /* Danger/Cancel style */
    .swagger-ui .btn.cancel,
    .swagger-ui .btn.clear-opblock,
    .swagger-ui .btn.undo {
      background: transparent !important;
      border-color: #7f1d1d !important;
      color: #fca5a5 !important;
    }
    .swagger-ui .btn.cancel:hover,
    .swagger-ui .btn.clear-opblock:hover,
    .swagger-ui .btn.undo:hover {
      border-color: var(--danger) !important;
      color: #fecaca !important;
    }

    /* Small utility buttons */
    .swagger-ui .copy-to-clipboard,
    .swagger-ui .btn-copy {
      background: #111827 !important; /* slate-900 */
      border-color: var(--border) !important;
      color: #cbd5e1 !important;
    }
  </style>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    (function() {
      // Cookie-only mode: rely on auth_token cookie sent by the browser.
      // We do not inject JWTs or API keys into the page.
      var ui = SwaggerUIBundle({
        url: '/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        displayRequestDuration: true,
        persistAuthorization: true,
        requestInterceptor: function(req) {
          // Ensure cookies are sent for Try it out so auth_token cookie is included
          try { req.credentials = 'include'; } catch (_) {}
          return req;
        }
      });
    })();
  </script>
</body>
</html>`;

    c.header('Content-Type', 'text/html; charset=utf-8');
    c.header('Cache-Control', 'no-store');
    return c.body(html);
  });

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
