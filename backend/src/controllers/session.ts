import * as whatsapp from 'wa-multi-session';
import { Hono } from 'hono';
import { requestValidator } from '../middlewares/validation.middleware';
import { z } from 'zod';
import { toDataURL } from 'qrcode';
import { HTTPException } from 'hono/http-exception';
import { SessionManagementService } from '../services/session-management.service';
import { WhatsappAccountService } from '../db/services/whatsapp-account.service';
import { PhoneService } from '../utils/phone.service';

export const createSessionController = () => {
  const app = new Hono();

  app.get('/', async (c) => {
    return c.json({
      data: whatsapp.getAllSession(),
    });
  });

  const startSessionSchema = z.object({
    session: z.string(),
    phoneNumber: z.string().optional(), // Optional phone number for pre-validation
  });

  app.post('/start', requestValidator('json', startSessionSchema), async (c) => {
    const payload = c.req.valid('json');

    // Validate session creation with deduplication check
    const validation = await SessionManagementService.validateSessionCreation(
      payload.session,
      payload.phoneNumber
    );

    if (!validation.canCreate) {
      throw new HTTPException(400, {
        message: validation.reason || 'Cannot create session',
      });
    }

    const isExist = whatsapp.getSession(payload.session);
    if (isExist) {
      throw new HTTPException(400, {
        message: 'Session already exist',
      });
    }

    const qr = await new Promise<string | null>(async (r) => {
      await whatsapp.startSession(payload.session, {
        onConnected() {
          r(null);
        },
        onQRUpdated(qr) {
          r(qr);
        },
      });
    });

    if (qr) {
      return c.json({
        qr: qr,
      });
    }

    return c.json({
      data: {
        message: 'Connected',
      },
    });
  });
  app.get('/start', requestValidator('query', startSessionSchema), async (c) => {
    const payload = c.req.valid('query');

    // Validate session creation with deduplication check
    const validation = await SessionManagementService.validateSessionCreation(
      payload.session,
      payload.phoneNumber
    );

    if (!validation.canCreate) {
      throw new HTTPException(400, {
        message: validation.reason || 'Cannot create session',
      });
    }

    const isExist = whatsapp.getSession(payload.session);
    if (isExist) {
      throw new HTTPException(400, {
        message: 'Session already exist',
      });
    }

    const qr = await new Promise<string | null>(async (r) => {
      await whatsapp.startSession(payload.session, {
        onConnected() {
          r(null);
        },
        onQRUpdated(qr) {
          r(qr);
        },
      });
    });

    if (qr) {
      // Mengembalikan JSON agar konsisten dengan endpoint POST
      return c.json({
        qr: qr,
      });
    }

    return c.json({
      data: {
        message: 'Connected',
      },
    });
  });

  // Endpoint untuk mendapatkan QR code sebagai gambar
  app.get('/qr-image', requestValidator('query', startSessionSchema), async (c) => {
    const payload = c.req.valid('query');

    const isExist = whatsapp.getSession(payload.session);
    if (isExist) {
      throw new HTTPException(400, {
        message: 'Session already exist',
      });
    }

    const qr = await new Promise<string | null>(async (r) => {
      await whatsapp.startSession(payload.session, {
        onConnected() {
          r(null);
        },
        onQRUpdated(qr) {
          r(qr);
        },
      });
    });

    if (qr) {
      try {
        // Convert QR string to PNG image data URL
        const qrDataURL = await toDataURL(qr, {
          type: 'image/png',
          width: 256,
          margin: 2,
        });

        // Extract base64 data from data URL
        const base64Data = qrDataURL.split(',')[1];
        if (!base64Data) {
          throw new Error('Invalid QR data URL format');
        }

        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Return image as PNG
        c.header('Content-Type', 'image/png');
        c.header('Content-Length', imageBuffer.length.toString());
        return new Response(imageBuffer, {
          headers: {
            'Content-Type': 'image/png',
            'Content-Length': imageBuffer.length.toString(),
          },
        });
      } catch (_error) {
        console.error('Failed to generate QR code image:', _error);
        throw new HTTPException(500, {
          message: 'Failed to generate QR code image',
        });
      }
    }

    throw new HTTPException(400, {
      message: 'Session already connected or no QR code available',
    });
  });

  // Endpoint POST untuk mendapatkan QR code sebagai gambar
  app.post('/qr-image', requestValidator('json', startSessionSchema), async (c) => {
    const payload = c.req.valid('json');

    const isExist = whatsapp.getSession(payload.session);
    if (isExist) {
      throw new HTTPException(400, {
        message: 'Session already exist',
      });
    }

    const qr = await new Promise<string | null>(async (r) => {
      await whatsapp.startSession(payload.session, {
        onConnected() {
          r(null);
        },
        onQRUpdated(qr) {
          r(qr);
        },
      });
    });

    if (qr) {
      try {
        // Convert QR string to PNG image data URL
        const qrDataURL = await toDataURL(qr, {
          type: 'image/png',
          width: 256,
          margin: 2,
        });

        // Extract base64 data from data URL
        const base64Data = qrDataURL.split(',')[1];
        if (!base64Data) {
          throw new Error('Invalid QR data URL format');
        }

        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Return image as PNG
        return new Response(imageBuffer, {
          headers: {
            'Content-Type': 'image/png',
            'Content-Length': imageBuffer.length.toString(),
          },
        });
      } catch (_error) {
        console.error('Failed to generate QR code image:', _error);
        throw new HTTPException(500, {
          message: 'Failed to generate QR code image',
        });
      }
    }

    throw new HTTPException(400, {
      message: 'Session already connected or no QR code available',
    });
  });

  app.post('/logout', async (c) => {
    const sessionId = c.req.query().session || (await c.req.json()).session || '';

    // Use session management service to properly delete session
    await SessionManagementService.deleteSession(sessionId);

    return c.json({
      data: 'success',
    });
  });

  // New endpoint: Check if phone number has existing session
  const checkPhoneSchema = z.object({
    phoneNumber: z.string(),
  });

  app.post('/check-phone', requestValidator('json', checkPhoneSchema), async (c) => {
    const payload = c.req.valid('json');

    if (!PhoneService.isValid(payload.phoneNumber)) {
      throw new HTTPException(400, {
        message: 'Invalid phone number format',
      });
    }

    const existingSession = await SessionManagementService.checkExistingSession(
      payload.phoneNumber
    );

    if (existingSession) {
      return c.json({
        hasActiveSession: true,
        session: {
          sessionId: existingSession.sessionId,
          phoneNumber: existingSession.phoneNumber,
          status: existingSession.status,
        },
      });
    }

    return c.json({
      hasActiveSession: false,
    });
  });

  // New endpoint: Get session status
  const sessionStatusSchema = z.object({
    session: z.string(),
  });

  app.get('/status', requestValidator('query', sessionStatusSchema), async (c) => {
    const payload = c.req.valid('query');

    const account = await WhatsappAccountService.findBySessionId(payload.session);

    if (!account) {
      throw new HTTPException(404, {
        message: 'Session not found',
      });
    }

    const waSession = whatsapp.getSession(payload.session);

    return c.json({
      data: {
        sessionId: account.sessionId,
        phoneNumber: account.phoneNumber,
        status: account.status,
        isConnected: !!waSession,
        lastUpdated: account.updatedAt,
        createdAt: account.createdAt,
      },
    });
  });

  // New endpoint: List user sessions (requires authentication context)
  app.get('/list', async (c) => {
    // For now, list all sessions (in production, filter by authenticated user)
    const accounts = await WhatsappAccountService.listAllAccounts();

    return c.json({
      data: accounts.map((account) => ({
        sessionId: account.sessionId,
        phoneNumber: account.phoneNumber,
        status: account.status,
        userId: account.userId,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      })),
    });
  });

  // New endpoint: Cleanup inactive sessions
  app.post('/cleanup', async (c) => {
    const inactiveHours = Number(c.req.query('hours')) || 24;

    const cleanedCount = await SessionManagementService.cleanupInactiveSessions(inactiveHours);

    return c.json({
      data: {
        message: `Cleaned up ${cleanedCount} inactive sessions`,
        cleanedCount,
      },
    });
  });

  return app;
};
