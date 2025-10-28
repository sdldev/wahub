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

  // Simple API endpoints for frontend session check
  app.get('/user-status', async (c) => {
    try {
      // Get user from JWT middleware context (set by createJwtMiddleware)
      const user = (c as any).get('user');
      
      // Check WhatsApp session for all users (including admin) based on phone number
      if (user && user.phone) {
        // Use phone number as session ID
        const sessionId = user.phone;
        
        // Check database for account record first
        const account = await WhatsappAccountService.findBySessionId(sessionId);
        
        if (account) {
          // Account exists in database, return its actual status
          return c.json({
            success: true,
            data: {
              connected: account.status === 'connected',
              phoneNumber: account.phoneNumber || user.phone,
              sessionId: sessionId,
              status: account.status,
              message: account.status === 'connected' 
                ? `Connected as ${account.phoneNumber || user.phone}`
                : account.status === 'connecting'
                ? 'Connecting to WhatsApp... Please scan the QR code.'
                : `Not connected. Please scan QR code to connect.`
            }
          });
        }
        
        // No database record, check if there's a WhatsApp session (shouldn't happen)
        const waSession = whatsapp.getSession(sessionId);
        if (waSession) {
          // Session exists but no DB record - this is an inconsistent state
          // Treat as connecting
          return c.json({
            success: true,
            data: {
              connected: false,
              phoneNumber: user.phone,
              sessionId: sessionId,
              status: 'connecting',
              message: 'Connecting to WhatsApp... Please scan the QR code.'
            }
          });
        }
      }

      // No active WhatsApp session found
      return c.json({
        success: true,
        data: {
          connected: false,
          status: 'disconnected',
          message: user?.phone 
            ? `No WhatsApp session found for ${user.phone}. Please connect your WhatsApp.`
            : 'Phone number required. Please update your profile with a valid phone number.'
        }
      });
    } catch (error: any) {
      console.error('Failed to get user session status:', error);
      return c.json({
        success: false,
        error: 'Failed to check session status'
      }, 500);
    }
  });

  app.post('/user-initialize', async (c) => {
    try {
      // Get user from JWT middleware context
      const user = (c as any).get('user');
      
      if (!user || !user.phone) {
        return c.json({
          success: false,
          error: 'User phone number is required to create WhatsApp session'
        }, 400);
      }

      // Use phone number as session ID (unique per user)
      const sessionId = user.phone;
      
      // Check if session already exists in WhatsApp
      const isExist = whatsapp.getSession(sessionId);
      if (isExist) {
        return c.json({
          success: false,
          error: 'WhatsApp session already exists for this phone number'
        }, 400);
      }

      // Check if database record already exists
      const existingAccount = await WhatsappAccountService.findBySessionId(sessionId);
      if (existingAccount) {
        // Update status to connecting and continue
        await WhatsappAccountService.updateStatus(sessionId, 'connecting');
      } else {
        // Create database record immediately with "connecting" status
        await WhatsappAccountService.createAccount(
          user.id,
          sessionId,
          user.phone
        );
        // Update to connecting status
        await WhatsappAccountService.updateStatus(sessionId, 'connecting');
      }

      // Start new WhatsApp session with phone number as session ID
      const qr = await new Promise<string | null>(async (resolve) => {
        await whatsapp.startSession(sessionId, {
          onConnected: async () => {
            // Session connected - status will be updated by global event handler
            // Just resolve to indicate connection completed
            resolve(null);
          },
          onQRUpdated: (qrCode) => {
            resolve(qrCode);
          },
        });
      });

      if (qr) {
        // Convert QR to data URL for frontend
        try {
          const qrDataURL = await toDataURL(qr, {
            type: 'image/png',
            width: 256,
            margin: 2,
          });

          return c.json({
            success: true,
            data: {
              qrCode: qrDataURL,
              sessionId,
              phoneNumber: user.phone,
              message: `QR code generated for ${user.phone}. Please scan with WhatsApp to connect.`,
              expiresIn: 120
            }
          });
        } catch (qrError) {
          console.error('Failed to generate QR data URL:', qrError);
          return c.json({
            success: false,
            error: 'Failed to generate QR code'
          }, 500);
        }
      }

      return c.json({
        success: true,
        data: {
          connected: true,
          sessionId,
          phoneNumber: user.phone,
          message: `WhatsApp connected successfully for ${user.phone}`
        }
      });
    } catch (error: any) {
      console.error('Failed to initialize user session:', error);
      return c.json({
        success: false,
        error: 'Failed to initialize WhatsApp session'
      }, 500);
    }
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

  // New endpoint: Destroy specific user session (Admin only)
  const destroySessionSchema = z.object({
    userId: z.number().optional(),
    phoneNumber: z.string().optional(),
    sessionId: z.string().optional(),
  });

  app.post('/destroy-user-session', requestValidator('json', destroySessionSchema), async (c) => {
    try {
      const payload = c.req.valid('json');
      
      // Get user from JWT middleware context (should be admin)
      const currentUser = (c as any).get('user');
      
      // Only allow admin to destroy other users' sessions
      if (currentUser?.role !== 'admin') {
        return c.json({
          success: false,
          error: 'Access denied. Admin role required.'
        }, 403);
      }

      let sessionId = payload.sessionId;
      let phoneNumber = payload.phoneNumber;

      // If userId provided, get user's phone number
      if (payload.userId) {
        // You might need to add UserService to get user by ID
        // For now, assume sessionId or phoneNumber is provided
      }

      // If phone number provided, use as session ID
      if (phoneNumber && !sessionId) {
        sessionId = phoneNumber;
      }

      if (!sessionId) {
        return c.json({
          success: false,
          error: 'Session ID or phone number is required'
        }, 400);
      }

      // Check if session exists in WhatsApp
      const waSession = whatsapp.getSession(sessionId);
      
      // Destroy WhatsApp session if exists
      if (waSession) {
        await whatsapp.deleteSession(sessionId);
      }

      // Also clean up from database using SessionManagementService
      await SessionManagementService.deleteSession(sessionId);

      return c.json({
        success: true,
        data: {
          message: `Session ${sessionId} has been destroyed successfully`,
          sessionId,
          phoneNumber: phoneNumber || sessionId
        }
      });
    } catch (error: any) {
      console.error('Failed to destroy session:', error);
      return c.json({
        success: false,
        error: 'Failed to destroy session'
      }, 500);
    }
  });

  // New endpoint: Get all users for admin (for settings page)
  app.get('/admin/users', async (c) => {
    try {
      // Get user from JWT middleware context (should be admin)
      const currentUser = (c as any).get('user');
      
      if (currentUser?.role !== 'admin') {
        return c.json({
          success: false,
          error: 'Access denied. Admin role required.'
        }, 403);
      }

      // Import UserService
      const { UserService } = await import('../db/services/user.service');
      
      // Get all users from database
      const allUsers = await UserService.listUsers();
      
      // Get all WhatsApp accounts from database
      const accounts = await WhatsappAccountService.listAllAccounts();
      
      // Get current sessions from WhatsApp
      const activeSessions = whatsapp.getAllSession();

      // Map users with their session information
      const usersWithSessions = allUsers.map((user) => {
        // Find account for this user
        const account = accounts.find(acc => acc.userId === user.id);
        
        return {
          userId: user.id,
          email: user.email,
          role: user.role,
          sessionId: account?.sessionId || null,
          phoneNumber: account?.phoneNumber || null,
          status: account?.status || null,
          isActive: account ? activeSessions.includes(account.sessionId) : false,
          updatedAt: account?.updatedAt || null,
        };
      });

      return c.json({
        success: true,
        data: usersWithSessions
      });
    } catch (error: any) {
      console.error('Failed to get users:', error);
      return c.json({
        success: false,
        error: 'Failed to get users'
      }, 500);
    }
  });

  return app;
};
