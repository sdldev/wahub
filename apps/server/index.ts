import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { serveStatic } from '@hono/node-server/serve-static';
import { serve } from '@hono/node-server';
import moment from 'moment';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFileSync } from 'fs';

// Import API routes
import { globalErrorMiddleware } from '../api/middlewares/error.middleware.js';
import { notFoundMiddleware as apiNotFoundMiddleware } from '../api/middlewares/notfound.middleware.js';
import { createSessionController } from '../api/controllers/session.js';
import { createMessageController } from '../api/controllers/message.js';
import { createProfileController } from '../api/controllers/profile.js';
import { createAuthController } from '../api/controllers/auth.js';
import { createUserController } from '../api/controllers/user.js';
import { createKeyMiddleware } from '../api/middlewares/key.middleware.js';
import { env } from '../api/env.js';
import { initializeDatabase } from '../api/db/index.js';
import { logger as winstonLogger } from '../api/utils/logger.js';
import { messageQueueService } from '../api/services/message-queue.service.js';
import { SessionManagementService } from '../api/services/session-management.service.js';
import * as whastapp from 'wa-multi-session';
import type { CreateWebhookProps } from '../api/webhooks/index.js';
import { createWebhookMessage } from '../api/webhooks/message.js';
import { createWebhookSession } from '../api/webhooks/session.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize database
try {
  initializeDatabase();
  winstonLogger.info('Database initialized successfully');
} catch (error) {
  winstonLogger.error('Failed to initialize database', { error });
  process.exit(1);
}

const app = new Hono();

// Request logging
app.use(
  logger((...params) => {
    params.map((e) => console.log(`${moment().toISOString()} | ${e}`));
  })
);

// CORS configuration - allow all origins for dev, restrict in production
app.use(
  cors({
    origin: env.NODE_ENV === 'DEVELOPMENT' ? '*' : (origin) => {
      // In production, you can whitelist specific origins
      return origin;
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  })
);

// Security headers middleware
app.use('*', async (c, next) => {
  await next();
  
  // Content Security Policy
  c.header(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' http://localhost:* ws://localhost:*"
  );
  
  // Prevent clickjacking
  c.header('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  c.header('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  c.header('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
});

// Error handler
app.onError(globalErrorMiddleware);

/**
 * API ROUTES - All routes prefixed with /api/
 */
const api = new Hono();

// Serve media message static files
api.use(
  '/media/*',
  serveStatic({
    root: '../../',
  })
);

// Protect API routes with key middleware
api.use('/session/*', createKeyMiddleware());
api.use('/message/*', createKeyMiddleware());
api.use('/profile/*', createKeyMiddleware());

// Authentication routes (public)
api.route('/auth', createAuthController());

// User routes (protected with JWT)
api.route('/user', createUserController());

// Session routes
api.route('/session', createSessionController());

// Message routes
api.route('/message', createMessageController());

// Profile routes
api.route('/profile', createProfileController());

// Health check endpoint
api.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
  });
});

// API 404 handler
api.notFound(apiNotFoundMiddleware);

// Mount API routes under /api prefix
app.route('/api', api);

/**
 * FRONTEND ROUTES - Serve static assets and SPA
 */

// Determine the correct path to the web dist directory
const webDistPath = path.join(__dirname, '../web/dist');
const indexHtmlPath = path.join(webDistPath, 'index.html');

// Cache index.html content
let indexHtmlContent: string;
try {
  indexHtmlContent = readFileSync(indexHtmlPath, 'utf-8');
} catch (error) {
  console.warn('Warning: index.html not found. Run "npm run build:web" to build the frontend.');
  indexHtmlContent = '<html><body><h1>Frontend not built</h1><p>Run <code>npm run build:web</code></p></body></html>';
}

// Serve static assets with cache headers
app.use('/assets/*', async (c, next) => {
  await next();
  // Cache static assets for 1 year
  if (c.res.status === 200) {
    c.header('Cache-Control', 'public, max-age=31536000, immutable');
  }
});

// Serve static files from dist
app.use(
  '*',
  serveStatic({
    root: webDistPath,
    index: 'index.html',
  })
);

// History API fallback - serve index.html for all non-API, non-static routes
app.get('*', (c) => {
  const reqPath = c.req.path;
  
  // Don't serve SPA for API routes
  if (reqPath.startsWith('/api/')) {
    return c.notFound();
  }
  
  // Serve index.html with no-cache headers for SPA routes
  return c.html(indexHtmlContent, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
});

// WhatsApp event handlers
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
    webhookSession({ session, status: 'connected' });

    // Update session status in database with phone number detection
    SessionManagementService.onSessionConnected(session).catch((error) => {
      winstonLogger.error('Failed to handle session connection for webhook', { session, error });
    });
  });
  
  whastapp.onConnecting((session) => {
    webhookSession({ session, status: 'connecting' });

    // Update session status in database
    SessionManagementService.onSessionConnecting(session).catch((error) => {
      winstonLogger.error('Failed to handle session connecting for webhook', { session, error });
    });
  });
  
  whastapp.onDisconnected((session) => {
    webhookSession({ session, status: 'disconnected' });

    // Update session status in database
    SessionManagementService.onSessionDisconnected(session).catch((error) => {
      winstonLogger.error('Failed to handle session disconnection for webhook', { session, error });
    });
  });
}
// End Implement Webhook

whastapp.loadSessionsFromStorage();

// Start server
const port = env.PORT;

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`🚀 Server is running on http://localhost:${info.port}`);
    console.log(`📡 API available at http://localhost:${info.port}/api`);
    console.log(`🌐 Frontend available at http://localhost:${info.port}`);
  }
);

export default app;
