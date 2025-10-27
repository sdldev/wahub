import * as whatsapp from 'wa-multi-session';
import { Hono } from 'hono';
import { requestValidator } from '../middlewares/validation.middleware';
import { z } from 'zod';
import { toDataURL } from 'qrcode';
import { HTTPException } from 'hono/http-exception';

export const createSessionController = () => {
  const app = new Hono();

  app.get('/', async (c) => {
    return c.json({
      data: whatsapp.getAllSession(),
    });
  });

  const startSessionSchema = z.object({
    session: z.string(),
  });

  app.post('/start', requestValidator('json', startSessionSchema), async (c) => {
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
    await whatsapp.deleteSession(c.req.query().session || (await c.req.json()).session || '');
    return c.json({
      data: 'success',
    });
  });

  return app;
};
