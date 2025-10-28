import { createRoute, z } from '@hono/zod-openapi';

// Schemas
const UserSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  email: z.string().email().openapi({ example: 'user@example.com' }),
  role: z.enum(['admin', 'user', 'readonly']).openapi({ example: 'user' }),
  apiKey: z.string().openapi({ example: 'abc123456789...' }),
  createdAt: z.string().openapi({ example: '2025-10-28T01:00:00.000Z' }),
}).openapi('User');

const SuccessResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  data: z.any(),
}).openapi('SuccessResponse');

const ErrorResponseSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  error: z.string().openapi({ example: 'Error message' }),
}).openapi('ErrorResponse');

const RegisterRequestSchema = z.object({
  email: z.string().email().openapi({ 
    example: 'user@example.com',
    description: 'Valid email address' 
  }),
  password: z.string().min(8).openapi({ 
    example: 'SecurePass123',
    description: 'Password must be at least 8 characters with uppercase, lowercase, and number' 
  }),
  role: z.enum(['admin', 'user', 'readonly']).optional().openapi({ 
    example: 'user',
    description: 'User role (default: user)' 
  }),
});

const LoginRequestSchema = z.object({
  email: z.string().email().openapi({ 
    example: 'user@example.com' 
  }),
  password: z.string().openapi({ 
    example: 'SecurePass123' 
  }),
});

// Auth Routes
export const registerRoute = createRoute({
  method: 'post',
  path: '/auth/register',
  tags: ['Authentication'],
  summary: 'Register new user',
  description: 'Create a new user account with email and password',
  request: {
    body: {
      content: {
        'application/json': {
          schema: RegisterRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'User registered successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: z.object({
              user: UserSchema,
              token: z.string().openapi({ example: 'eyJhbGciOiJIUzI1NiIs...' }),
            }),
          }),
        },
      },
    },
    400: {
      description: 'Bad request - validation error or user already exists',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const loginRoute = createRoute({
  method: 'post',
  path: '/auth/login',
  tags: ['Authentication'],
  summary: 'User login',
  description: 'Authenticate user with email and password',
  request: {
    body: {
      content: {
        'application/json': {
          schema: LoginRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Login successful',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: z.object({
              user: UserSchema,
              token: z.string().openapi({ example: 'eyJhbGciOiJIUzI1NiIs...' }),
            }),
          }),
        },
      },
    },
    401: {
      description: 'Invalid credentials',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const getMeRoute = createRoute({
  method: 'get',
  path: '/auth/me',
  tags: ['Authentication'],
  summary: 'Get current user',
  description: 'Get current authenticated user information',
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      description: 'Current user information',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: UserSchema,
          }),
        },
      },
    },
    401: {
      description: 'Not authenticated',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const regenerateApiKeyRoute = createRoute({
  method: 'post',
  path: '/auth/regenerate-api-key',
  tags: ['Authentication'],
  summary: 'Regenerate API key',
  description: 'Generate a new API key for the current user',
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      description: 'API key regenerated successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: z.object({
              apiKey: z.string().openapi({ example: 'new_api_key_123...' }),
            }),
          }),
        },
      },
    },
    401: {
      description: 'Not authenticated',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// Export schemas for reuse
export {
  UserSchema,
  SuccessResponseSchema,
  ErrorResponseSchema,
  RegisterRequestSchema,
  LoginRequestSchema,
};