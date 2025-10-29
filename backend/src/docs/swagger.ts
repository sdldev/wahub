import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';

// Create OpenAPI app
export const apiDocsApp = new OpenAPIHono();

// Register Swagger UI
apiDocsApp.get('/ui', swaggerUI({ url: '/doc' }));

// Generate OpenAPI spec
apiDocsApp.doc('/doc', (c) => ({
  openapi: '3.0.0',
  info: {
    title: 'WhatsApp Hub API',
    version: '1.0.0',
    description: `
# WhatsApp Hub API Documentation

A comprehensive WhatsApp Business API with user management, session handling, and message operations.

## Authentication

This API uses two authentication methods:

### 1. JWT Bearer Token
Used for user management endpoints (/auth/*, /user/*)
\`\`\`
Authorization: Bearer <jwt_token>
\`\`\`

### 2. API Key
Used for WhatsApp operations (/session/*, /message/*, /profile/*)
\`\`\`
x-api-key: <your_api_key>
\`\`\`

## Rate Limits

- Max 20 messages per minute
- Max 500 messages per hour
- Max 10 messages per recipient

## User Roles

- **admin**: Full access to all endpoints
- **user**: Standard user access
- **readonly**: Read-only access
    `,
  },
  servers: [
    {
      url: 'http://localhost:5001',
      description: 'Development server',
    },
    {
      url: 'https://api.wahub.com',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token for user authentication',
      },
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'API key for WhatsApp operations',
      },
    },
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization',
    },
    {
      name: 'User Management',
      description: 'User profile and account management',
    },
    {
      name: 'WhatsApp Sessions',
      description: 'WhatsApp session management',
    },
    {
      name: 'Messages',
      description: 'Send and manage WhatsApp messages',
    },
    {
      name: 'Profile',
      description: 'WhatsApp profile operations',
    },
    {
      name: 'System',
      description: 'System health and monitoring',
    },
  ],
}));

// Health check route with OpenAPI
const healthRoute = createRoute({
  method: 'get',
  path: '/health',
  tags: ['System'],
  summary: 'Health check',
  description: 'Check system health and status',
  responses: {
    200: {
      description: 'System is healthy',
      content: {
        'application/json': {
          schema: z.object({
            status: z.string().openapi({ example: 'ok' }),
            timestamp: z.string().openapi({ example: '2025-10-28T01:00:00.000Z' }),
            uptime: z.number().openapi({ example: 3600 }),
            memory: z.object({
              rss: z.number(),
              heapTotal: z.number(),
              heapUsed: z.number(),
              external: z.number(),
            }),
            version: z.string().openapi({ example: 'v18.0.0' }),
          }),
        },
      },
    },
  },
});

apiDocsApp.openapi(healthRoute, (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
  });
});

export { healthRoute };
