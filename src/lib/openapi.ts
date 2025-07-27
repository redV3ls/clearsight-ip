import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { Env } from '../index';

export function createOpenAPIApp() {
  const app = new OpenAPIHono<{ Bindings: Env }>();

  // OpenAPI documentation configuration
  app.doc('/openapi.json', {
    openapi: '3.0.0',
    info: {
      title: 'Clearsight IP - Skill Gap Analysis API',
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
    ]
  });

  // Add Swagger UI
  app.get('/v1/docs', swaggerUI({ 
    url: '/api/openapi.json'
  }));

  // Redirect /v1/docs/ to /v1/docs
  app.get('/v1/docs/', (c) => c.redirect('/v1/docs'));

  return app;
}
