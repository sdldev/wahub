import { Hono } from 'hono';
import { swaggerUI } from '@hono/swagger-ui';

export function createSimpleApiDocs() {
  const apiDocs = new Hono();

  // Serve Swagger UI
  apiDocs.get('/ui', swaggerUI({ url: '/api-docs/spec' }));

  // OpenAPI specification
  apiDocs.get('/spec', (c) => {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: 'WhatsApp Hub API',
        version: '1.0.0',
        description: `
# WhatsApp Hub API Documentation

A comprehensive WhatsApp Business API with user management, session handling, and message operations.

## Getting Started

1. **Register** a new account: \`POST /auth/register\`
2. **Login** to get JWT token: \`POST /auth/login\`
3. **Get API key** from profile: \`GET /auth/me\`
4. **Create WhatsApp session**: \`POST /session/create\`
5. **Send messages**: Use message endpoints

## Authentication

### JWT Bearer Token (User Management)
\`\`\`
Authorization: Bearer <jwt_token>
\`\`\`
Used for: \`/auth/*\`, \`/user/*\`

### API Key (WhatsApp Operations)
\`\`\`
x-api-key: <your_api_key>
\`\`\`
Used for: \`/session/*\`, \`/message/*\`, \`/profile/*\`

## Rate Limits
- **Messages**: 20/min, 500/hour
- **Per Recipient**: 10 messages max
        `,
        contact: {
          name: 'WhatsApp Hub Support',
          email: 'support@wahub.com',
        },
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
      tags: [
        {
          name: 'Authentication',
          description: '🔐 User authentication and authorization',
        },
        {
          name: 'User Management',
          description: '👤 User profile and account management',
        },
        {
          name: 'WhatsApp Sessions',
          description: '📱 WhatsApp session management',
        },
        {
          name: 'Messages',
          description: '💬 Send and manage WhatsApp messages',
        },
        {
          name: 'Profile',
          description: '👤 WhatsApp profile operations',
        },
        {
          name: 'System',
          description: '⚙️ System health and monitoring',
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
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              email: { type: 'string', format: 'email', example: 'user@example.com' },
              role: {
                type: 'string',
                enum: ['admin', 'user', 'readonly'],
                example: 'user',
              },
              apiKey: { type: 'string', example: 'abc123456789...' },
              createdAt: {
                type: 'string',
                format: 'date-time',
                example: '2025-10-28T01:00:00.000Z',
              },
            },
          },
          SuccessResponse: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'object' },
            },
          },
          ErrorResponse: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: false },
              error: { type: 'string', example: 'Error message' },
            },
          },
          MessagePayload: {
            type: 'object',
            required: ['session', 'to', 'text'],
            properties: {
              session: {
                type: 'string',
                example: '62812345678',
                description: 'WhatsApp session ID (phone number)',
              },
              to: {
                type: 'string',
                example: '6287654321',
                description: 'Recipient phone number',
              },
              text: {
                type: 'string',
                example: 'Hello World!',
                description: 'Message content',
              },
              is_group: {
                type: 'boolean',
                example: false,
                description: 'Whether recipient is a group',
              },
            },
          },
          SessionStatus: {
            type: 'object',
            properties: {
              session: { type: 'string', example: '62812345678' },
              status: {
                type: 'string',
                enum: ['connecting', 'connected', 'disconnected', 'qr_required'],
                example: 'connected',
              },
              qr: {
                type: 'string',
                description: 'QR code base64 (when status is qr_required)',
              },
              phoneNumber: { type: 'string', example: '+62812345678' },
            },
          },
        },
      },
      paths: {
        '/health': {
          get: {
            tags: ['System'],
            summary: 'Health check',
            description: 'Check API health and system status',
            responses: {
              '200': {
                description: 'System is healthy',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', example: 'ok' },
                        timestamp: { type: 'string', example: '2025-10-28T01:00:00.000Z' },
                        uptime: { type: 'number', example: 3600 },
                        version: { type: 'string', example: 'v22.0.0' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/auth/register': {
          post: {
            tags: ['Authentication'],
            summary: 'Register new user',
            description: 'Create a new user account with email and password',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                      email: {
                        type: 'string',
                        format: 'email',
                        example: 'user@example.com',
                      },
                      password: {
                        type: 'string',
                        minLength: 8,
                        example: 'SecurePass123',
                        description: 'Min 8 chars with uppercase, lowercase, number',
                      },
                      role: {
                        type: 'string',
                        enum: ['admin', 'user', 'readonly'],
                        example: 'user',
                        description: 'User role (default: user)',
                      },
                    },
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'User registered successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                          type: 'object',
                          properties: {
                            user: { $ref: '#/components/schemas/User' },
                            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
                          },
                        },
                      },
                    },
                  },
                },
              },
              '400': {
                description: 'Bad request',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
            },
          },
        },
        '/auth/login': {
          post: {
            tags: ['Authentication'],
            summary: 'User login',
            description: 'Authenticate user with email and password',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                      email: { type: 'string', format: 'email', example: 'user@example.com' },
                      password: { type: 'string', example: 'SecurePass123' },
                    },
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'Login successful',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                          type: 'object',
                          properties: {
                            user: { $ref: '#/components/schemas/User' },
                            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
                          },
                        },
                      },
                    },
                  },
                },
              },
              '401': {
                description: 'Invalid credentials',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
            },
          },
        },
        '/auth/me': {
          get: {
            tags: ['Authentication'],
            summary: 'Get current user',
            description: 'Get current authenticated user information',
            security: [{ BearerAuth: [] }],
            responses: {
              '200': {
                description: 'Current user information',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: { $ref: '#/components/schemas/User' },
                      },
                    },
                  },
                },
              },
              '401': {
                description: 'Not authenticated',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
            },
          },
        },
        '/auth/regenerate-api-key': {
          post: {
            tags: ['Authentication'],
            summary: 'Regenerate API key',
            description: 'Generate a new API key for the current user',
            security: [{ BearerAuth: [] }],
            responses: {
              '200': {
                description: 'API key regenerated successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                          type: 'object',
                          properties: {
                            apiKey: { type: 'string', example: 'new_api_key_123...' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/session/create': {
          post: {
            tags: ['WhatsApp Sessions'],
            summary: 'Create new session',
            description: 'Create a new WhatsApp session for the given phone number',
            security: [{ ApiKeyAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['session', 'phoneNumber'],
                    properties: {
                      session: {
                        type: 'string',
                        example: '62812345678',
                        description: 'Session ID (phone number without +)',
                      },
                      phoneNumber: {
                        type: 'string',
                        example: '+62812345678',
                        description: 'Phone number with country code',
                      },
                    },
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'Session created successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: { $ref: '#/components/schemas/SessionStatus' },
                      },
                    },
                  },
                },
              },
              '400': {
                description: 'Invalid phone number',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
            },
          },
        },
        '/session/status': {
          get: {
            tags: ['WhatsApp Sessions'],
            summary: 'Get session status',
            description: 'Get the current status of a WhatsApp session',
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: 'session',
                in: 'query',
                required: true,
                schema: { type: 'string', example: '62812345678' },
                description: 'WhatsApp session ID',
              },
            ],
            responses: {
              '200': {
                description: 'Session status retrieved',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: { $ref: '#/components/schemas/SessionStatus' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/message/send-text': {
          post: {
            tags: ['Messages'],
            summary: 'Send text message',
            description: 'Send a text message via WhatsApp',
            security: [{ ApiKeyAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/MessagePayload' },
                },
              },
            },
            responses: {
              '200': {
                description: 'Message sent successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                          type: 'object',
                          properties: {
                            sessionId: { type: 'string', example: '62812345678' },
                            to: { type: 'string', example: '6287654321' },
                            text: { type: 'string', example: 'Hello World!' },
                            status: { type: 'string', example: 'queued' },
                            timestamp: { type: 'string', example: '2025-10-28T01:00:00.000Z' },
                          },
                        },
                      },
                    },
                  },
                },
              },
              '400': {
                description: 'Invalid request data',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
            },
          },
        },
        '/message/send-image': {
          post: {
            tags: ['Messages'],
            summary: 'Send image message',
            description: 'Send an image message with optional caption',
            security: [{ ApiKeyAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['session', 'to', 'image_url'],
                    properties: {
                      session: { type: 'string', example: '62812345678' },
                      to: { type: 'string', example: '6287654321' },
                      text: { type: 'string', example: 'Image caption' },
                      image_url: {
                        type: 'string',
                        format: 'uri',
                        example: 'https://example.com/image.jpg',
                      },
                      is_group: { type: 'boolean', example: false },
                    },
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'Image message sent successfully',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/SuccessResponse' },
                  },
                },
              },
            },
          },
        },
        '/profile/get': {
          post: {
            tags: ['Profile'],
            summary: 'Get WhatsApp profile',
            description: 'Get profile information for a WhatsApp contact',
            security: [{ ApiKeyAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['session', 'target'],
                    properties: {
                      session: { type: 'string', example: '62812345678' },
                      target: { type: 'string', example: '6287654321' },
                    },
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'Profile retrieved successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                          type: 'object',
                          properties: {
                            name: { type: 'string', example: 'John Doe' },
                            about: { type: 'string', example: 'Available' },
                            profilePicUrl: { type: 'string', example: 'https://...' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    return c.json(spec);
  });

  return apiDocs;
}
