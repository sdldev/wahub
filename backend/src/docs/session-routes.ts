import { createRoute, z } from '@hono/zod-openapi';
import { ErrorResponseSchema } from './auth-routes';

// Session Schemas
const CreateSessionSchema = z.object({
  session: z.string().openapi({ 
    example: '62812345678',
    description: 'WhatsApp session ID (phone number without + prefix)' 
  }),
  phoneNumber: z.string().openapi({ 
    example: '+62812345678',
    description: 'Phone number with country code' 
  }),
});

const SessionQuerySchema = z.object({
  session: z.string().openapi({ 
    example: '62812345678',
    description: 'WhatsApp session ID' 
  }),
  phoneNumber: z.string().optional().openapi({ 
    example: '+62812345678',
    description: 'Phone number with country code' 
  }),
});

const SessionStatusSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  data: z.object({
    session: z.string().openapi({ example: '62812345678' }),
    status: z.enum(['connecting', 'connected', 'disconnected', 'qr_required']).openapi({ 
      example: 'connected',
      description: 'Current session status' 
    }),
    qr: z.string().optional().openapi({ 
      description: 'QR code base64 string (only when status is qr_required)' 
    }),
    phoneNumber: z.string().optional().openapi({ example: '+62812345678' }),
    connectedAt: z.string().optional().openapi({ 
      example: '2025-10-28T01:00:00.000Z',
      description: 'When the session was connected' 
    }),
  }),
});

// Session Routes
export const createSessionRoute = createRoute({
  method: 'post',
  path: '/session/create',
  tags: ['WhatsApp Sessions'],
  summary: 'Create new session',
  description: 'Create a new WhatsApp session for the given phone number',
  security: [{ ApiKeyAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateSessionSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Session created successfully',
      content: {
        'application/json': {
          schema: SessionStatusSchema,
        },
      },
    },
    400: {
      description: 'Invalid phone number or session already exists',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: 'Invalid API key',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const getSessionStatusRoute = createRoute({
  method: 'get',
  path: '/session/status',
  tags: ['WhatsApp Sessions'],
  summary: 'Get session status',
  description: 'Get the current status of a WhatsApp session',
  security: [{ ApiKeyAuth: [] }],
  request: {
    query: SessionQuerySchema,
  },
  responses: {
    200: {
      description: 'Session status retrieved successfully',
      content: {
        'application/json': {
          schema: SessionStatusSchema,
        },
      },
    },
    404: {
      description: 'Session not found',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: 'Invalid API key',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const getQRCodeRoute = createRoute({
  method: 'get',
  path: '/session/qr',
  tags: ['WhatsApp Sessions'],
  summary: 'Get QR code for session',
  description: 'Get QR code for WhatsApp authentication',
  security: [{ ApiKeyAuth: [] }],
  request: {
    query: SessionQuerySchema,
  },
  responses: {
    200: {
      description: 'QR code retrieved successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: z.object({
              qr: z.string().openapi({ 
                description: 'QR code as base64 string or data URL' 
              }),
              session: z.string().openapi({ example: '62812345678' }),
            }),
          }),
        },
      },
    },
    404: {
      description: 'Session not found or QR not available',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: 'Invalid API key',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const deleteSessionRoute = createRoute({
  method: 'delete',
  path: '/session/delete',
  tags: ['WhatsApp Sessions'],
  summary: 'Delete session',
  description: 'Delete and logout from a WhatsApp session',
  security: [{ ApiKeyAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            session: z.string().openapi({ 
              example: '62812345678',
              description: 'WhatsApp session ID to delete' 
            }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Session deleted successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            message: z.string().openapi({ example: 'Session deleted successfully' }),
          }),
        },
      },
    },
    404: {
      description: 'Session not found',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: 'Invalid API key',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const listSessionsRoute = createRoute({
  method: 'get',
  path: '/session/list',
  tags: ['WhatsApp Sessions'],
  summary: 'List all sessions',
  description: 'Get list of all WhatsApp sessions for the current user',
  security: [{ ApiKeyAuth: [] }],
  responses: {
    200: {
      description: 'Sessions retrieved successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: z.array(z.object({
              session: z.string().openapi({ example: '62812345678' }),
              status: z.string().openapi({ example: 'connected' }),
              phoneNumber: z.string().openapi({ example: '+62812345678' }),
              connectedAt: z.string().optional().openapi({ 
                example: '2025-10-28T01:00:00.000Z' 
              }),
              lastActivity: z.string().optional().openapi({ 
                example: '2025-10-28T01:30:00.000Z' 
              }),
            })),
          }),
        },
      },
    },
    401: {
      description: 'Invalid API key',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export {
  CreateSessionSchema,
  SessionQuerySchema,
  SessionStatusSchema,
};