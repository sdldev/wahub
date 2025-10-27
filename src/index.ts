import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import moment from 'moment';
import { globalErrorMiddleware } from './middlewares/error.middleware';
import { notFoundMiddleware } from './middlewares/notfound.middleware';
import { serve } from '@hono/node-server';
import { env } from './env';
import { createSessionController } from './controllers/session';
import * as whastapp from 'wa-multi-session';
import { createMessageController } from './controllers/message';
import { CreateWebhookProps } from './webhooks';
import { createWebhookMessage } from './webhooks/message';
import { createWebhookSession } from './webhooks/session';
import { createProfileController } from './controllers/profile';
import { serveStatic } from '@hono/node-server/serve-static';
import { createKeyMiddleware } from './middlewares/key.middleware';
import { messageQueueService } from './services/message-queue.service';
import { createAuthController } from './controllers/auth';
import { createUserController } from './controllers/user';
import { createJwtMiddleware } from './middlewares/jwt.middleware';
import { initializeDatabase } from './db';
import { logger as winstonLogger } from './utils/logger';
import { SessionManagementService } from './services/session-management.service';

// Initialize database
try {
  initializeDatabase();
  winstonLogger.info('Database initialized successfully');
} catch (error) {
  winstonLogger.error('Failed to initialize database', { error });
  process.exit(1);
}

const app = new Hono();

app.use(
  logger((...params) => {
    params.map((e) => console.log(`${moment().toISOString()} | ${e}`));
  })
);
app.use(cors());

app.onError(globalErrorMiddleware);
app.notFound(notFoundMiddleware);

/**
 * serve media message static files
 */
app.use(
  '/media/*',
  serveStatic({
    root: './',
  })
);

/**
 * Protect all API routes
 */
app.use('/session/*', createKeyMiddleware());
app.use('/message/*', createKeyMiddleware());
app.use('/profile/*', createKeyMiddleware());

/**
 * Authentication routes (public)
 */
app.route('/auth', createAuthController());

/**
 * User routes (protected with JWT)
 */
app.route('/user', createUserController());

/**
 * session routes
 */
app.route('/session', createSessionController());
/**
 * message routes
 */
app.route('/message', createMessageController());
/**
 * profile routes
 */
app.route('/profile', createProfileController());

/**
 * Health check endpoint for Docker
 */
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
  });
});

const port = env.PORT;

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

whastapp.onConnected((session) => {
  console.log(`session: '${session}' connected`);
  messageQueueService.resumeQueue(session);

  // Update session status in database with phone number detection
  SessionManagementService.onSessionConnected(session).catch((error) => {
    winstonLogger.error('Failed to handle session connection', { session, error });
  });
});

whastapp.onDisconnected((session) => {
  console.log(`session: '${session}' disconnected`);
  messageQueueService.pauseQueue(session);

  // Update session status in database
  SessionManagementService.onSessionDisconnected(session).catch((error) => {
    winstonLogger.error('Failed to handle session disconnection', { session, error });
  });
});

whastapp.onConnecting((session) => {
  console.log(`session: '${session}' connecting`);

  // Update session status in database
  SessionManagementService.onSessionConnecting(session).catch((error) => {
    winstonLogger.error('Failed to handle session connecting', { session, error });
  });
});

// Implement Webhook
if (env.WEBHOOK_BASE_URL) {
  const webhookProps: CreateWebhookProps = {
    baseUrl: env.WEBHOOK_BASE_URL,
  };

  // message webhook
  whastapp.onMessageReceived(createWebhookMessage(webhookProps));

  // session webhook
  const webhookSession = createWebhookSession(webhookProps);

  whastapp.onConnected((session) => {
    console.log(`session: '${session}' connected`);
    webhookSession({ session, status: 'connected' });

    // Update session status in database with phone number detection
    SessionManagementService.onSessionConnected(session).catch((error) => {
      winstonLogger.error('Failed to handle session connection for webhook', { session, error });
    });
  });
  whastapp.onConnecting((session) => {
    console.log(`session: '${session}' connecting`);
    webhookSession({ session, status: 'connecting' });

    // Update session status in database
    SessionManagementService.onSessionConnecting(session).catch((error) => {
      winstonLogger.error('Failed to handle session connecting for webhook', { session, error });
    });
  });
  whastapp.onDisconnected((session) => {
    console.log(`session: '${session}' disconnected`);
    webhookSession({ session, status: 'disconnected' });

    // Update session status in database
    SessionManagementService.onSessionDisconnected(session).catch((error) => {
      winstonLogger.error('Failed to handle session disconnection for webhook', { session, error });
    });
  });
}
// End Implement Webhook

whastapp.loadSessionsFromStorage();
