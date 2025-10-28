import { eq, and } from 'drizzle-orm';
import { db } from '../index';
import { whatsappAccounts, } from '../schema/whatsapp-accounts';
import { dbLogger } from '../../utils/logger';
export class WhatsappAccountService {
    /**
     * Create a new WhatsApp account
     */
    static async createAccount(userId, sessionId, phoneNumber) {
        try {
            // For MySQL, insert and then select the created record
            await db.insert(whatsappAccounts).values({
                userId,
                sessionId,
                phoneNumber: phoneNumber || null,
                status: 'disconnected',
            });
            // Fetch the created record by sessionId (which is unique)
            const [account] = await db
                .select()
                .from(whatsappAccounts)
                .where(eq(whatsappAccounts.sessionId, sessionId))
                .limit(1);
            if (!account) {
                throw new Error('Failed to create WhatsApp account');
            }
            dbLogger.info(`WhatsApp account created`, {
                accountId: account.id,
                sessionId,
            });
            return account;
        }
        catch (error) {
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
    static async findBySessionId(sessionId) {
        try {
            const [account] = await db
                .select()
                .from(whatsappAccounts)
                .where(eq(whatsappAccounts.sessionId, sessionId))
                .limit(1);
            return account || null;
        }
        catch (error) {
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
    static async findByPhoneNumber(phoneNumber) {
        try {
            const [account] = await db
                .select()
                .from(whatsappAccounts)
                .where(eq(whatsappAccounts.phoneNumber, phoneNumber))
                .limit(1);
            return account || null;
        }
        catch (error) {
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
    static async getAccountsByUser(userId) {
        try {
            return await db.select().from(whatsappAccounts).where(eq(whatsappAccounts.userId, userId));
        }
        catch (error) {
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
    static async updateStatus(sessionId, status) {
        try {
            // MySQL doesn't support RETURNING clause, so we update then select
            await db
                .update(whatsappAccounts)
                .set({
                status,
                updatedAt: new Date(),
            })
                .where(eq(whatsappAccounts.sessionId, sessionId));
            // Fetch the updated record
            const [account] = await db
                .select()
                .from(whatsappAccounts)
                .where(eq(whatsappAccounts.sessionId, sessionId))
                .limit(1);
            if (!account) {
                throw new Error('Account not found');
            }
            dbLogger.info(`Account status updated`, { sessionId, status });
            return account;
        }
        catch (error) {
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
    static async updatePhoneNumber(sessionId, phoneNumber) {
        try {
            // MySQL doesn't support RETURNING clause, so we update then select
            await db
                .update(whatsappAccounts)
                .set({
                phoneNumber,
                updatedAt: new Date(),
            })
                .where(eq(whatsappAccounts.sessionId, sessionId));
            // Fetch the updated record
            const [account] = await db
                .select()
                .from(whatsappAccounts)
                .where(eq(whatsappAccounts.sessionId, sessionId))
                .limit(1);
            if (!account) {
                throw new Error('Account not found');
            }
            dbLogger.info(`Phone number updated`, { sessionId, phoneNumber });
            return account;
        }
        catch (error) {
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
    static async deleteAccount(sessionId) {
        try {
            await db.delete(whatsappAccounts).where(eq(whatsappAccounts.sessionId, sessionId));
            dbLogger.info(`Account deleted`, { sessionId });
        }
        catch (error) {
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
    static async hasActiveSession(phoneNumber) {
        try {
            const [account] = await db
                .select()
                .from(whatsappAccounts)
                .where(and(eq(whatsappAccounts.phoneNumber, phoneNumber), eq(whatsappAccounts.status, 'connected')))
                .limit(1);
            return !!account;
        }
        catch (error) {
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
    static async listAllAccounts() {
        try {
            return await db.select().from(whatsappAccounts);
        }
        catch (error) {
            dbLogger.error('Failed to list all accounts', { error: error.message });
            throw error;
        }
    }
}
