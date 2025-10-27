import { Hono } from "hono";
import { createKeyMiddleware } from "../middlewares/key.middleware";
import { requestValidator } from "../middlewares/validation.middleware";
import { z } from "zod";
import * as whatsapp from "wa-multi-session";
import { HTTPException } from "hono/http-exception";
import { messageQueueService } from "../services/message-queue.service";

export const createMessageController = () => {
  const app = new Hono();

  const sendMessageSchema = z.object({
    session: z.string(),
    to: z.string(),
    text: z.string(),
    is_group: z.boolean().optional(),
  });

  app.post(
    "/send-text",
    createKeyMiddleware(),
    requestValidator("json", sendMessageSchema),
    async (c) => {
      const payload = c.req.valid("json");
      const isExist = whatsapp.getSession(payload.session);
      if (!isExist) {
        throw new HTTPException(400, {
          message: "Session does not exist",
        });
      }

      const result = messageQueueService.enqueue({
        sessionId: payload.session,
        to: payload.to,
        text: payload.text,
        type: "text",
        isGroup: payload.is_group,
      });

      if (!result.success) {
        throw new HTTPException(429, {
          message: result.error || "Failed to enqueue message",
        });
      }

      return c.json({
        success: true,
        messageId: result.messageId,
        message: "Message queued successfully",
      });
    }
  );

  /**
   * @deprecated
   * This endpoint is deprecated, use POST /send-text instead
   */
  app.get(
    "/send-text",
    createKeyMiddleware(),
    requestValidator("query", sendMessageSchema),
    async (c) => {
      const payload = c.req.valid("query");
      const isExist = whatsapp.getSession(payload.session);
      if (!isExist) {
        throw new HTTPException(400, {
          message: "Session does not exist",
        });
      }

      const response = await whatsapp.sendTextMessage({
        sessionId: payload.session,
        to: payload.to,
        text: payload.text,
      });

      return c.json({
        data: response,
      });
    }
  );

  app.post(
    "/send-image",
    createKeyMiddleware(),
    requestValidator(
      "json",
      sendMessageSchema.merge(
        z.object({
          image_url: z.string(),
        })
      )
    ),
    async (c) => {
      const payload = c.req.valid("json");
      const isExist = whatsapp.getSession(payload.session);
      if (!isExist) {
        throw new HTTPException(400, {
          message: "Session does not exist",
        });
      }

      const result = messageQueueService.enqueue({
        sessionId: payload.session,
        to: payload.to,
        text: payload.text,
        type: "image",
        media: payload.image_url,
        isGroup: payload.is_group,
      });

      if (!result.success) {
        throw new HTTPException(429, {
          message: result.error || "Failed to enqueue message",
        });
      }

      return c.json({
        success: true,
        messageId: result.messageId,
        message: "Message queued successfully",
      });
    }
  );
  app.post(
    "/send-document",
    createKeyMiddleware(),
    requestValidator(
      "json",
      sendMessageSchema.merge(
        z.object({
          document_url: z.string(),
          document_name: z.string(),
        })
      )
    ),
    async (c) => {
      const payload = c.req.valid("json");
      const isExist = whatsapp.getSession(payload.session);
      if (!isExist) {
        throw new HTTPException(400, {
          message: "Session does not exist",
        });
      }

      const result = messageQueueService.enqueue({
        sessionId: payload.session,
        to: payload.to,
        text: payload.text,
        type: "document",
        media: payload.document_url,
        filename: payload.document_name,
        isGroup: payload.is_group,
      });

      if (!result.success) {
        throw new HTTPException(429, {
          message: result.error || "Failed to enqueue message",
        });
      }

      return c.json({
        success: true,
        messageId: result.messageId,
        message: "Message queued successfully",
      });
    }
  );

  app.post(
    "/send-sticker",
    createKeyMiddleware(),
    requestValidator(
      "json",
      sendMessageSchema.merge(
        z.object({
          image_url: z.string(),
        })
      )
    ),
    async (c) => {
      const payload = c.req.valid("json");
      const isExist = whatsapp.getSession(payload.session);
      if (!isExist) {
        throw new HTTPException(400, {
          message: "Session does not exist",
        });
      }

      const result = messageQueueService.enqueue({
        sessionId: payload.session,
        to: payload.to,
        text: "",
        type: "sticker",
        media: payload.image_url,
        isGroup: payload.is_group,
      });

      if (!result.success) {
        throw new HTTPException(429, {
          message: result.error || "Failed to enqueue message",
        });
      }

      return c.json({
        success: true,
        messageId: result.messageId,
        message: "Message queued successfully",
      });
    }
  );

  // Get queue status endpoint
  app.get(
    "/queue-status",
    createKeyMiddleware(),
    requestValidator(
      "query",
      z.object({
        session: z.string(),
      })
    ),
    async (c) => {
      const { session } = c.req.valid("query");
      const isExist = whatsapp.getSession(session);
      if (!isExist) {
        throw new HTTPException(400, {
          message: "Session does not exist",
        });
      }

      const status = messageQueueService.getQueueStatus(session);

      return c.json({
        session,
        stats: {
          pending: status.pending,
          processing: status.processing,
          completed: status.completed,
          failed: status.failed,
        },
        queue: status.queue,
      });
    }
  );

  return app;
};
