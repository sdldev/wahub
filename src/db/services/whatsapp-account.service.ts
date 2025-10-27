import { eq, and } from 'drizzle-orm';
import { db } from '../index';
import {
  whatsappAccounts,
  type WhatsappAccount,
  type NewWhatsappAccount,
} from '../schema/whatsapp-accounts';
import { dbLogger } from '../../utils/logger';

export class WhatsappAccountService {
  /**
   * Create a new WhatsApp account
   */
  static async createAccount(
    userId: number,
    sessionId: string,
    phoneNumber?: string
  ): Promise<WhatsappAccount> {
    try {
      const result = await db
        .insert(whatsappAccounts)
        .values({
          userId,
          sessionId,
          phoneNumber: phoneNumber || null,
          status: 'disconnected',
        })
        .returning();

      if (!result || result.length === 0) {
        throw new Error('Failed to create WhatsApp account');
      }

      const account = result[0];
      dbLogger.info(`WhatsApp account created`, {
        accountId: account.id,
        sessionId,
      });
      return account;
    } catch (error: any) {
      dbLogger.error('Failed to create WhatsApp account', {
        userId,
        sessionId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Find account by session ID
   */
  static async findBySessionId(
    sessionId: string
  ): Promise<WhatsappAccount | null> {
    try {
      const [account] = await db
        .select()
        .from(whatsappAccounts)
        .where(eq(whatsappAccounts.sessionId, sessionId))
        .limit(1);
      return account || null;
    } catch (error: any) {
      dbLogger.error('Failed to find account by session ID', {
        sessionId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Find account by phone number
   */
  static async findByPhoneNumber(
    phoneNumber: string
  ): Promise<WhatsappAccount | null> {
    try {
      const [account] = await db
        .select()
        .from(whatsappAccounts)
        .where(eq(whatsappAccounts.phoneNumber, phoneNumber))
        .limit(1);
      return account || null;
    } catch (error: any) {
      dbLogger.error('Failed to find account by phone number', {
        phoneNumber,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get all accounts for a user
   */
  static async getAccountsByUser(userId: number): Promise<WhatsappAccount[]> {
    try {
      return await db
        .select()
        .from(whatsappAccounts)
        .where(eq(whatsappAccounts.userId, userId));
    } catch (error: any) {
      dbLogger.error('Failed to get accounts by user', {
        userId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Update account status
   */
  static async updateStatus(
    sessionId: string,
    status: 'connected' | 'disconnected' | 'connecting' | 'error'
  ): Promise<WhatsappAccount> {
    try {
      const result = await db
        .update(whatsappAccounts)
        .set({
          status,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(whatsappAccounts.sessionId, sessionId))
        .returning();

      if (!result || result.length === 0) {
        throw new Error('Account not found');
      }

      const account = result[0];
      dbLogger.info(`Account status updated`, { sessionId, status });
      return account;
    } catch (error: any) {
      dbLogger.error('Failed to update account status', {
        sessionId,
        status,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Update phone number (when WhatsApp connection is established)
   */
  static async updatePhoneNumber(
    sessionId: string,
    phoneNumber: string
  ): Promise<WhatsappAccount> {
    try {
      const result = await db
        .update(whatsappAccounts)
        .set({
          phoneNumber,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(whatsappAccounts.sessionId, sessionId))
        .returning();

      if (!result || result.length === 0) {
        throw new Error('Account not found');
      }

      const account = result[0];
      dbLogger.info(`Phone number updated`, { sessionId, phoneNumber });
      return account;
    } catch (error: any) {
      dbLogger.error('Failed to update phone number', {
        sessionId,
        phoneNumber,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Delete account
   */
  static async deleteAccount(sessionId: string): Promise<void> {
    try {
      await db
        .delete(whatsappAccounts)
        .where(eq(whatsappAccounts.sessionId, sessionId));
      dbLogger.info(`Account deleted`, { sessionId });
    } catch (error: any) {
      dbLogger.error('Failed to delete account', {
        sessionId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Check if phone number already has an active session
   */
  static async hasActiveSession(phoneNumber: string): Promise<boolean> {
    try {
      const [account] = await db
        .select()
        .from(whatsappAccounts)
        .where(
          and(
            eq(whatsappAccounts.phoneNumber, phoneNumber),
            eq(whatsappAccounts.status, 'connected')
          )
        )
        .limit(1);
      return !!account;
    } catch (error: any) {
      dbLogger.error('Failed to check for active session', {
        phoneNumber,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * List all accounts (admin only)
   */
  static async listAllAccounts(): Promise<WhatsappAccount[]> {
    try {
      return await db.select().from(whatsappAccounts);
    } catch (error: any) {
      dbLogger.error('Failed to list all accounts', { error: error.message });
      throw error;
    }
  }
}
