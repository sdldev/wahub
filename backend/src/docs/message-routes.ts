import { createRoute, z } from '@hono/zod-openapi';
import { ErrorResponseSchema, SuccessResponseSchema } from './auth-routes';

// Message Schemas
const SendTextMessageSchema = z.object({
  session: z.string().openapi({ 
    example: '62812345678',
    description: 'WhatsApp session ID (phone number)' 
  }),
  to: z.string().openapi({ 
    example: '6287654321',
    description: 'Recipient phone number' 
  }),
  text: z.string().openapi({ 
    example: 'Hello World!',
    description: 'Message content' 
  }),
  is_group: z.boolean().optional().openapi({ 
    example: false,
    description: 'Whether the recipient is a group' 
  }),
});

const SendImageMessageSchema = z.object({
  session: z.string().openapi({ example: '62812345678' }),
  to: z.string().openapi({ example: '6287654321' }),
  text: z.string().optional().openapi({ 
    example: 'Image caption',
    description: 'Optional image caption' 
  }),
  image_url: z.string().url().openapi({ 
    example: 'https://example.com/image.jpg',
    description: 'URL of the image to send' 
  }),
  is_group: z.boolean().optional().openapi({ example: false }),
});

const SendDocumentMessageSchema = z.object({
  session: z.string().openapi({ example: '62812345678' }),
  to: z.string().openapi({ example: '6287654321' }),
  text: z.string().optional().openapi({ 
    example: 'Document description',
    description: 'Optional document description' 
  }),
  document_url: z.string().url().openapi({ 
    example: 'https://example.com/document.pdf',
    description: 'URL of the document to send' 
  }),
  document_name: z.string().openapi({ 
    example: 'document.pdf',
    description: 'Name of the document file' 
  }),
  is_group: z.boolean().optional().openapi({ example: false }),
});

const MessageResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  data: z.object({
    sessionId: z.string().openapi({ example: '62812345678' }),
    to: z.string().openapi({ example: '6287654321' }),
    text: z.string().openapi({ example: 'Hello World!' }),
    timestamp: z.string().openapi({ example: '2025-10-28T01:00:00.000Z' }),
    messageId: z.string().optional().openapi({ 
      example: 'msg_123456',
      description: 'WhatsApp message ID' 
    }),
    status: z.string().openapi({ 
      example: 'queued', 
      description: 'Message status' 
    }),
  }),
});

// Message Routes
export const sendTextMessageRoute = createRoute({
  method: 'post',
  path: '/message/send-text',
  tags: ['Messages'],
  summary: 'Send text message',
  description: 'Send a text message via WhatsApp',
  security: [{ ApiKeyAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: SendTextMessageSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Message sent successfully',
      content: {
        'application/json': {
          schema: MessageResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid request data',
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
    404: {
      description: 'Session not found or not connected',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const sendImageMessageRoute = createRoute({
  method: 'post',
  path: '/message/send-image',
  tags: ['Messages'],
  summary: 'Send image message',
  description: 'Send an image message with optional caption via WhatsApp',
  security: [{ ApiKeyAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: SendImageMessageSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Image message sent successfully',
      content: {
        'application/json': {
          schema: MessageResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid request data',
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

export const sendDocumentMessageRoute = createRoute({
  method: 'post',
  path: '/message/send-document',
  tags: ['Messages'],
  summary: 'Send document message',
  description: 'Send a document file via WhatsApp',
  security: [{ ApiKeyAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: SendDocumentMessageSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Document sent successfully',
      content: {
        'application/json': {
          schema: MessageResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid request data',
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

export const getMessageHistoryRoute = createRoute({
  method: 'get',
  path: '/message/history',
  tags: ['Messages'],
  summary: 'Get message history',
  description: 'Retrieve message history for a session',
  security: [{ ApiKeyAuth: [] }],
  request: {
    query: z.object({
      session: z.string().openapi({ 
        example: '62812345678',
        description: 'WhatsApp session ID' 
      }),
      limit: z.string().optional().openapi({ 
        example: '50',
        description: 'Number of messages to retrieve (default: 50)' 
      }),
      offset: z.string().optional().openapi({ 
        example: '0',
        description: 'Offset for pagination (default: 0)' 
      }),
    }),
  },
  responses: {
    200: {
      description: 'Message history retrieved successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: z.object({
              messages: z.array(z.object({
                id: z.number().openapi({ example: 1 }),
                sessionId: z.string().openapi({ example: '62812345678' }),
                to: z.string().openapi({ example: '6287654321' }),
                message: z.string().openapi({ example: 'Hello World!' }),
                messageType: z.string().openapi({ example: 'text' }),
                status: z.string().openapi({ example: 'sent' }),
                timestamp: z.string().openapi({ example: '2025-10-28T01:00:00.000Z' }),
              })),
              total: z.number().openapi({ example: 100 }),
              limit: z.number().openapi({ example: 50 }),
              offset: z.number().openapi({ example: 0 }),
            }),
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
  SendTextMessageSchema,
  SendImageMessageSchema,
  SendDocumentMessageSchema,
  MessageResponseSchema,
};