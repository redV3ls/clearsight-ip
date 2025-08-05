/**
 * OpenAPI Base Configuration
 * 
 * Centralized configuration for OpenAPI documentation.
 * Contains base settings, server information, and common metadata.
 */

export const OPENAPI_CONFIG = {
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
    },
    {
      url: 'https://staging.clearsight-ip.com',
      description: 'Staging API Server'
    }
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization endpoints'
    },
    {
      name: 'Analysis',
      description: 'Skills and career analysis endpoints'
    },
    {
      name: 'Users',
      description: 'User profile and management endpoints'
    },
    {
      name: 'Teams',
      description: 'Team analysis and management endpoints'
    },
    {
      name: 'Trends',
      description: 'Industry trends and market insights endpoints'
    },
    {
      name: 'GDPR',
      description: 'Data privacy and compliance endpoints'
    }
  ]
} as const;