import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';

// Import route definitions
import { registerRoute, loginRoute, getMeRoute, regenerateApiKeyRoute } from './auth-routes';
import {
  sendTextMessageRoute,
  sendImageMessageRoute,
  sendDocumentMessageRoute,
  getMessageHistoryRoute,
} from './message-routes';
import {
  createSessionRoute,
  getSessionStatusRoute,
  getQRCodeRoute,
  deleteSessionRoute,
  listSessionsRoute,
} from './session-routes';

// Import existing controllers
import { createAuthController } from '../controllers/auth';
import { createMessageController } from '../controllers/message';
import { createSessionController } from '../controllers/session';
import { createUserController } from '../controllers/user';
import { createProfileController } from '../controllers/profile';

export function createApiDocs() {
  const apiDocs = new OpenAPIHono();

  // Register Swagger UI
  apiDocs.get('/ui', swaggerUI({ url: '/api-docs/spec' }));

  // Generate OpenAPI spec
  apiDocs.doc('/spec', (c) => ({
    openapi: '3.0.0',
    info: {
      title: 'WhatsApp Hub API',
      version: '1.0.0',
      description: `
# WhatsApp Hub API Documentation

A comprehensive WhatsApp Business API with user management, session handling, and message operations.

## Getting Started

1. **Register a new account** using \`POST /auth/register\`
2. **Login** to get your JWT token using \`POST /auth/login\`
3. **Get your API key** from your profile using \`GET /auth/me\`
4. **Create a WhatsApp session** using \`POST /session/create\`
5. **Send messages** using the message endpoints

## Authentication

This API uses two authentication methods:

### 1. JWT Bearer Token
Used for user management endpoints (\`/auth/*\`, \`/user/*\`)
\`\`\`
Authorization: Bearer <jwt_token>
\`\`\`

### 2. API Key
Used for WhatsApp operations (\`/session/*\`, \`/message/*\`, \`/profile/*\`)
\`\`\`
x-api-key: <your_api_key>
\`\`\`

## Rate Limits

- **Messages**: Max 20 per minute, 500 per hour
- **Per Recipient**: Max 10 messages per session
- **API Calls**: Standard rate limiting applies

## User Roles

- **admin**: Full access to all endpoints including user management
- **user**: Standard access to own resources and WhatsApp operations  
- **readonly**: Read-only access to own profile and session status

## Error Handling

All endpoints return consistent error responses:
\`\`\`json
{
  "success": false,
  "error": "Error description"
}
\`\`\`

Common HTTP status codes:
- **400**: Bad Request - Invalid input data
- **401**: Unauthorized - Invalid/missing authentication
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource doesn't exist
- **429**: Too Many Requests - Rate limit exceeded  
- **500**: Internal Server Error - Server-side error

## WebHooks

Configure webhook URLs to receive real-time events:
- Message delivery status
- Session connection changes
- Incoming messages
- QR code updates
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
        description: 'User authentication and authorization endpoints',
      },
      {
        name: 'User Management',
        description: 'User profile and account management endpoints',
      },
      {
        name: 'WhatsApp Sessions',
        description: 'WhatsApp session creation and management',
      },
      {
        name: 'Messages',
        description: 'Send and manage WhatsApp messages',
      },
      {
        name: 'Profile',
        description: 'WhatsApp profile and contact operations',
      },
      {
        name: 'System',
        description: 'System health and monitoring endpoints',
      },
    ],
  }));

  // Health check documentation only
  // (actual endpoint implemented in main app)

  return apiDocs;
}

// Export route definitions for use in existing controllers
export {
  registerRoute,
  loginRoute,
  getMeRoute,
  regenerateApiKeyRoute,
  sendTextMessageRoute,
  sendImageMessageRoute,
  sendDocumentMessageRoute,
  getMessageHistoryRoute,
  createSessionRoute,
  getSessionStatusRoute,
  getQRCodeRoute,
  deleteSessionRoute,
  listSessionsRoute,
};
