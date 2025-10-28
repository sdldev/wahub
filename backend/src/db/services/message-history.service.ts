import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { db } from '../index';
import { messages, type Message, type NewMessage } from '../schema/messages';
import { dbLogger } from '../../utils/logger';

export class MessageHistoryService {
  /**
   * Save a message to history
   */
  static async saveMessage(
    sessionId: string,
    from: string,
    to: string,
    content: string,
    type: 'text' | 'image' | 'document' | 'sticker' | 'video' = 'text',
    status: 'pending' | 'processing' | 'completed' | 'failed' = 'pending'
  ): Promise<Message> {
    try {
      const result = await db
        .insert(messages)
        .values({
          sessionId,
          from,
          to,
          content,
          type,
          status,
        })
        .returning();

      if (!result || result.length === 0) {
        throw new Error('Failed to save message');
      }

      return result[0];
    } catch (error: any) {
      dbLogger.error('Failed to save message', {
        sessionId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Update message status
   */
  static async updateStatus(
    messageId: number,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    error?: string
  ): Promise<Message> {
    try {
      const result = await db
        .update(messages)
        .set({
          status,
          error: error || null,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(messages.id, messageId))
        .returning();

      if (!result || result.length === 0) {
        throw new Error('Message not found');
      }

      return result[0];
    } catch (error: any) {
      dbLogger.error('Failed to update message status', {
        messageId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Increment retry count
   */
  static async incrementRetryCount(messageId: number): Promise<Message> {
    try {
      const [message] = await db
        .select()
        .from(messages)
        .where(eq(messages.id, messageId))
        .limit(1);

      if (!message) {
        throw new Error('Message not found');
      }

      const result = await db
        .update(messages)
        .set({
          retryCount: message.retryCount + 1,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(messages.id, messageId))
        .returning();

      if (!result || result.length === 0) {
        throw new Error('Failed to update retry count');
      }

      return result[0];
    } catch (error: any) {
      dbLogger.error('Failed to increment retry count', {
        messageId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get messages by session
   */
  static async getBySession(
    sessionId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<Message[]> {
    try {
      return await db
        .select()
        .from(messages)
        .where(eq(messages.sessionId, sessionId))
        .orderBy(desc(messages.createdAt))
        .limit(limit)
        .offset(offset);
    } catch (error: any) {
      dbLogger.error('Failed to get messages by session', {
        sessionId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get messages by date range
   */
  static async getByDateRange(
    sessionId: string,
    startDate: string,
    endDate: string
  ): Promise<Message[]> {
    try {
      return await db
        .select()
        .from(messages)
        .where(
          and(
            eq(messages.sessionId, sessionId),
            gte(messages.createdAt, new Date(startDate)),
            lte(messages.createdAt, new Date(endDate))
          )
        )
        .orderBy(desc(messages.createdAt));
    } catch (error: any) {
      dbLogger.error('Failed to get messages by date range', {
        sessionId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get failed messages
   */
  static async getFailedMessages(sessionId: string): Promise<Message[]> {
    try {
      return await db
        .select()
        .from(messages)
        .where(
          and(eq(messages.sessionId, sessionId), eq(messages.status, 'failed'))
        )
        .orderBy(desc(messages.createdAt));
    } catch (error: any) {
      dbLogger.error('Failed to get failed messages', {
        sessionId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get message statistics for a session
   */
  static async getStatistics(
    sessionId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  }> {
    try {
      let allMessages: Message[];

      if (startDate && endDate) {
        allMessages = await db
          .select()
          .from(messages)
          .where(
            and(
              eq(messages.sessionId, sessionId),
              gte(messages.createdAt, new Date(startDate)),
              lte(messages.createdAt, new Date(endDate))
            )
          );
      } else {
        allMessages = await db
          .select()
          .from(messages)
          .where(eq(messages.sessionId, sessionId));
      }

      return {
        total: allMessages.length,
        pending: allMessages.filter((m) => m.status === 'pending').length,
        processing: allMessages.filter((m) => m.status === 'processing').length,
        completed: allMessages.filter((m) => m.status === 'completed').length,
        failed: allMessages.filter((m) => m.status === 'failed').length,
      };
    } catch (error: any) {
      dbLogger.error('Failed to get message statistics', {
        sessionId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Delete old messages (cleanup)
   */
  static async deleteOldMessages(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await db
        .delete(messages)
        .where(lte(messages.createdAt, cutoffDate))
        .returning();

      dbLogger.info(`Deleted ${result.length} old messages`);
      return result.length;
    } catch (error: any) {
      dbLogger.error('Failed to delete old messages', {
        error: error.message,
      });
      throw error;
    }
  }
}
