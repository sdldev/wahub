import { describe, test, expect, beforeAll } from 'bun:test';
import { Hono } from 'hono';

/**
 * API Integration Tests
 * 
 * These tests verify that all API endpoints are properly structured
 * and follow the expected patterns for the frontend integration.
 */

describe('API Structure Tests', () => {
  test('should have proper controller exports', async () => {
    // Test that all controllers can be imported
    const { createAuthController } = await import('./controllers/auth');
    const { createMessageController } = await import('./controllers/message');
    const { createSessionController } = await import('./controllers/session');
    const { createUserController } = await import('./controllers/user');
    const { createProfileController } = await import('./controllers/profile');

    expect(createAuthController).toBeDefined();
    expect(createMessageController).toBeDefined();
    expect(createSessionController).toBeDefined();
    expect(createUserController).toBeDefined();
    expect(createProfileController).toBeDefined();

    // Verify they return Hono instances
    expect(createAuthController()).toBeInstanceOf(Hono);
    expect(createMessageController()).toBeInstanceOf(Hono);
    expect(createSessionController()).toBeInstanceOf(Hono);
    expect(createUserController()).toBeInstanceOf(Hono);
    expect(createProfileController()).toBeInstanceOf(Hono);
  });

  test('should have API documentation exports', async () => {
    const { createSimpleApiDocs } = await import('./docs/simple-docs');
    expect(createSimpleApiDocs).toBeDefined();
    expect(createSimpleApiDocs()).toBeInstanceOf(Hono);
  });

  test('should have proper middleware exports', async () => {
    const { createKeyMiddleware } = await import('./middlewares/key.middleware');
    const { createJwtMiddleware } = await import('./middlewares/jwt.middleware');
    const { globalErrorMiddleware } = await import('./middlewares/error.middleware');

    expect(createKeyMiddleware).toBeDefined();
    expect(createJwtMiddleware).toBeDefined();
    expect(globalErrorMiddleware).toBeDefined();
  });

  test('should have database services', async () => {
    const { UserService } = await import('./db/services/user.service');
    const { WhatsappAccountService } = await import('./db/services/whatsapp-account.service');
    const { RateLimitService } = await import('./db/services/rate-limit.service');

    expect(UserService).toBeDefined();
    expect(WhatsappAccountService).toBeDefined();
    expect(RateLimitService).toBeDefined();
  });

  test('should have utility services', async () => {
    const { JwtService } = await import('./utils/jwt.service');
    const { PhoneService } = await import('./utils/phone.service');
    const { EncryptionService } = await import('./utils/encryption.service');

    expect(JwtService).toBeDefined();
    expect(PhoneService).toBeDefined();
    expect(EncryptionService).toBeDefined();
  });

  test('should have message queue service', async () => {
    const { messageQueueService } = await import('./services/message-queue.service');
    expect(messageQueueService).toBeDefined();
    expect(messageQueueService.enqueue).toBeDefined();
    expect(messageQueueService.getQueueStatus).toBeDefined();
  });

  test('should have session management service', async () => {
    const { SessionManagementService } = await import('./services/session-management.service');
    expect(SessionManagementService).toBeDefined();
    expect(SessionManagementService.validateSessionCreation).toBeDefined();
    expect(SessionManagementService.checkExistingSession).toBeDefined();
  });
});

describe('API Documentation Structure', () => {
  test('should have complete OpenAPI specification', async () => {
    const { createSimpleApiDocs } = await import('./docs/simple-docs');
    const apiDocs = createSimpleApiDocs();

    // Create a mock context to test the spec endpoint
    const mockRequest = new Request('http://localhost/spec');
    const mockEnv = {};
    const mockExecutionContext = {
      waitUntil: () => {},
      passThroughOnException: () => {},
    };

    const response = await apiDocs.fetch(mockRequest, mockEnv, mockExecutionContext);
    expect(response.status).toBe(200);

    const spec = await response.json();
    expect(spec.openapi).toBe('3.0.0');
    expect(spec.info.title).toBe('WhatsApp Hub API');
    expect(spec.info.version).toBe('1.0.0');
  });

  test('should document all authentication endpoints', async () => {
    const { createSimpleApiDocs } = await import('./docs/simple-docs');
    const apiDocs = createSimpleApiDocs();

    const mockRequest = new Request('http://localhost/spec');
    const mockEnv = {};
    const mockExecutionContext = {
      waitUntil: () => {},
      passThroughOnException: () => {},
    };

    const response = await apiDocs.fetch(mockRequest, mockEnv, mockExecutionContext);
    const spec = await response.json();

    // Check auth endpoints
    expect(spec.paths['/auth/register']).toBeDefined();
    expect(spec.paths['/auth/login']).toBeDefined();
    expect(spec.paths['/auth/me']).toBeDefined();
    expect(spec.paths['/auth/regenerate-api-key']).toBeDefined();
  });

  test('should document all session endpoints', async () => {
    const { createSimpleApiDocs } = await import('./docs/simple-docs');
    const apiDocs = createSimpleApiDocs();

    const mockRequest = new Request('http://localhost/spec');
    const mockEnv = {};
    const mockExecutionContext = {
      waitUntil: () => {},
      passThroughOnException: () => {},
    };

    const response = await apiDocs.fetch(mockRequest, mockEnv, mockExecutionContext);
    const spec = await response.json();

    // Check session endpoints
    expect(spec.paths['/session/create']).toBeDefined();
    expect(spec.paths['/session/status']).toBeDefined();
  });

  test('should document all message endpoints', async () => {
    const { createSimpleApiDocs } = await import('./docs/simple-docs');
    const apiDocs = createSimpleApiDocs();

    const mockRequest = new Request('http://localhost/spec');
    const mockEnv = {};
    const mockExecutionContext = {
      waitUntil: () => {},
      passThroughOnException: () => {},
    };

    const response = await apiDocs.fetch(mockRequest, mockEnv, mockExecutionContext);
    const spec = await response.json();

    // Check message endpoints
    expect(spec.paths['/message/send-text']).toBeDefined();
    expect(spec.paths['/message/send-image']).toBeDefined();
  });

  test('should have security schemes defined', async () => {
    const { createSimpleApiDocs } = await import('./docs/simple-docs');
    const apiDocs = createSimpleApiDocs();

    const mockRequest = new Request('http://localhost/spec');
    const mockEnv = {};
    const mockExecutionContext = {
      waitUntil: () => {},
      passThroughOnException: () => {},
    };

    const response = await apiDocs.fetch(mockRequest, mockEnv, mockExecutionContext);
    const spec = await response.json();

    expect(spec.components.securitySchemes.BearerAuth).toBeDefined();
    expect(spec.components.securitySchemes.ApiKeyAuth).toBeDefined();
    expect(spec.components.securitySchemes.BearerAuth.type).toBe('http');
    expect(spec.components.securitySchemes.ApiKeyAuth.type).toBe('apiKey');
  });

  test('should have schema definitions', async () => {
    const { createSimpleApiDocs } = await import('./docs/simple-docs');
    const apiDocs = createSimpleApiDocs();

    const mockRequest = new Request('http://localhost/spec');
    const mockEnv = {};
    const mockExecutionContext = {
      waitUntil: () => {},
      passThroughOnException: () => {},
    };

    const response = await apiDocs.fetch(mockRequest, mockEnv, mockExecutionContext);
    const spec = await response.json();

    expect(spec.components.schemas).toBeDefined();
    expect(spec.components.schemas.User).toBeDefined();
    expect(spec.components.schemas.SuccessResponse).toBeDefined();
    expect(spec.components.schemas.ErrorResponse).toBeDefined();
  });
});

describe('API Endpoint Patterns', () => {
  test('auth endpoints should follow REST conventions', async () => {
    const { createAuthController } = await import('./controllers/auth');
    const authController = createAuthController();

    // Auth controller should have routes defined
    expect(authController).toBeDefined();
  });

  test('message endpoints should use queue system', async () => {
    const { messageQueueService } = await import('./services/message-queue.service');

    // Test queue service has required methods
    expect(typeof messageQueueService.enqueue).toBe('function');
    expect(typeof messageQueueService.getQueueStatus).toBe('function');
    expect(typeof messageQueueService.pauseQueue).toBe('function');
    expect(typeof messageQueueService.resumeQueue).toBe('function');
  });

  test('session endpoints should validate phone numbers', async () => {
    const { PhoneService } = await import('./utils/phone.service');

    // Test phone validation
    expect(PhoneService.isValid('+6281234567890')).toBe(true);
    expect(PhoneService.isValid('81234567890')).toBe(true);
    expect(PhoneService.isValid('invalid')).toBe(false);
  });
});

describe('Environment Configuration', () => {
  test('should have required environment variables defined', async () => {
    const { env } = await import('./env');

    expect(env.PORT).toBeDefined();
    expect(env.JWT_SECRET).toBeDefined();
    expect(env.ENCRYPTION_KEY).toBeDefined();
    expect(env.DB_HOST).toBeDefined();
    expect(env.DB_USER).toBeDefined();
    expect(env.DB_NAME).toBeDefined();
  });

  test('should have rate limiting configuration', async () => {
    const { env } = await import('./env');

    expect(env.MAX_MESSAGES_PER_MINUTE).toBeDefined();
    expect(env.MAX_MESSAGES_PER_HOUR).toBeDefined();
    expect(env.MESSAGE_DELAY_MIN).toBeDefined();
    expect(env.MESSAGE_DELAY_MAX).toBeDefined();
  });
});
