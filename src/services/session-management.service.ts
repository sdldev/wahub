import * as whatsapp from 'wa-multi-session';
import { WhatsappAccountService } from '../db/services/whatsapp-account.service';
import { PhoneService } from '../utils/phone.service';
import { logger } from '../utils/logger';
import type { WhatsappAccount } from '../db/schema/whatsapp-accounts';

export interface SessionCreationOptions {
  userId: number;
  sessionId: string;
  phoneNumber?: string;
}

export interface SessionInfo {
  sessionId: string;
  phoneNumber: string | null;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  account?: WhatsappAccount;
}

/**
 * Session Management Service
 * Handles WhatsApp session lifecycle with deduplication and phone number tracking
 */
export class SessionManagementService {
  /**
   * Check if a phone number already has an active session
   * @param phoneNumber - Phone number to check
   * @returns SessionInfo if active session exists, null otherwise
   */
  static async checkExistingSession(phoneNumber: string): Promise<SessionInfo | null> {
    try {
      const normalized = PhoneService.normalize(phoneNumber);

      // Check database for existing account with this phone number
      const account = await WhatsappAccountService.findByPhoneNumber(normalized);

      if (!account) {
        return null;
      }

      // Check if the session is actually active in WhatsApp
      const waSession = whatsapp.getSession(account.sessionId);

      if (waSession && account.status === 'connected') {
        logger.warn('Active session found for phone number', {
          phoneNumber: normalized,
          sessionId: account.sessionId,
        });

        return {
          sessionId: account.sessionId,
          phoneNumber: account.phoneNumber,
          status: account.status,
          account,
        };
      }

      // Session exists in DB but not connected, allow new session
      return null;
    } catch (error) {
      logger.error('Error checking existing session', { phoneNumber, error });
      throw error;
    }
  }

  /**
   * Validate and prepare session creation
   * Checks for duplicate sessions before allowing creation
   */
  static async validateSessionCreation(
    sessionId: string,
    phoneNumber?: string
  ): Promise<{ canCreate: boolean; reason?: string; existingSession?: SessionInfo }> {
    try {
      // Check if session ID already exists in WhatsApp
      const waSession = whatsapp.getSession(sessionId);
      if (waSession) {
        return {
          canCreate: false,
          reason: 'Session ID already exists in WhatsApp',
        };
      }

      // Check if session ID already exists in database
      const existingAccount = await WhatsappAccountService.findBySessionId(sessionId);
      if (existingAccount && existingAccount.status === 'connected') {
        return {
          canCreate: false,
          reason: 'Session ID already exists in database',
        };
      }

      // If phone number is provided, check for duplicate
      if (phoneNumber) {
        const normalized = PhoneService.normalize(phoneNumber);

        if (!PhoneService.isValid(normalized)) {
          return {
            canCreate: false,
            reason: 'Invalid phone number format',
          };
        }

        const existingSession = await this.checkExistingSession(normalized);
        if (existingSession) {
          return {
            canCreate: false,
            reason: `Phone number ${PhoneService.format(normalized)} already has an active session`,
            existingSession,
          };
        }
      }

      return { canCreate: true };
    } catch (error) {
      logger.error('Error validating session creation', {
        sessionId,
        phoneNumber,
        error,
      });
      throw error;
    }
  }

  /**
   * Create a new session with deduplication checks
   */
  static async createSession(options: SessionCreationOptions): Promise<WhatsappAccount> {
    const { userId, sessionId, phoneNumber } = options;

    try {
      // Validate session creation
      const validation = await this.validateSessionCreation(sessionId, phoneNumber);

      if (!validation.canCreate) {
        throw new Error(validation.reason || 'Cannot create session');
      }

      // Create account in database
      const normalizedPhone = phoneNumber ? PhoneService.normalize(phoneNumber) : undefined;

      const account = await WhatsappAccountService.createAccount(
        userId,
        sessionId,
        normalizedPhone
      );

      logger.info('Session created successfully', {
        sessionId,
        accountId: account.id,
        phoneNumber: normalizedPhone,
      });

      return account;
    } catch (error) {
      logger.error('Failed to create session', { sessionId, error });
      throw error;
    }
  }

  /**
   * Update session when WhatsApp connection is established
   * Automatically detects and stores phone number
   */
  static async onSessionConnected(sessionId: string, connectionInfo?: any): Promise<void> {
    try {
      // Check if account exists, if not we need to handle gracefully
      let account = await WhatsappAccountService.findBySessionId(sessionId);

      if (!account) {
        // Account doesn't exist yet - this can happen if session was started
        // directly through WhatsApp library without using our API
        // We'll log a warning but not fail
        logger.warn('Session connected but no account record exists', {
          sessionId,
        });
        return;
      }

      // Update status to connected
      await WhatsappAccountService.updateStatus(sessionId, 'connected');

      // Try to extract phone number from connection info
      if (connectionInfo?.user?.id) {
        const phoneNumber = PhoneService.extractFromJid(connectionInfo.user.id);

        if (phoneNumber) {
          // Check if this phone number is already used by another session
          const existingSession = await this.checkExistingSession(phoneNumber);

          if (existingSession && existingSession.sessionId !== sessionId) {
            logger.error('Phone number already associated with another active session', {
              phoneNumber,
              newSessionId: sessionId,
              existingSessionId: existingSession.sessionId,
            });

            // Disconnect the new session to prevent duplicate
            await whatsapp.deleteSession(sessionId);
            await WhatsappAccountService.updateStatus(sessionId, 'error');

            throw new Error(
              `Phone number ${PhoneService.format(phoneNumber)} is already connected to another session`
            );
          }

          // Update phone number in database
          await WhatsappAccountService.updatePhoneNumber(sessionId, phoneNumber);

          logger.info('Phone number detected and updated', {
            sessionId,
            phoneNumber,
          });
        }
      }

      logger.info('Session connected successfully', { sessionId });
    } catch (error) {
      logger.error('Error handling session connection', { sessionId, error });
      // Don't throw - we don't want to crash the application
    }
  }

  /**
   * Handle session disconnection
   */
  static async onSessionDisconnected(sessionId: string): Promise<void> {
    try {
      // Check if account exists
      const account = await WhatsappAccountService.findBySessionId(sessionId);

      if (!account) {
        // Account doesn't exist - log warning but don't fail
        logger.warn('Session disconnected but no account record exists', {
          sessionId,
        });
        return;
      }

      await WhatsappAccountService.updateStatus(sessionId, 'disconnected');
      logger.info('Session disconnected', { sessionId });
    } catch (error) {
      logger.error('Error handling session disconnection', {
        sessionId,
        error,
      });
      // Don't throw - we don't want to crash the application
    }
  }

  /**
   * Handle session connecting state
   */
  static async onSessionConnecting(sessionId: string): Promise<void> {
    try {
      // Check if account exists
      const account = await WhatsappAccountService.findBySessionId(sessionId);

      if (!account) {
        // Account doesn't exist - log info, this is expected for sessions
        // started outside our API
        logger.info('Session connecting but no account record exists yet', {
          sessionId,
        });
        return;
      }

      await WhatsappAccountService.updateStatus(sessionId, 'connecting');
      logger.info('Session connecting', { sessionId });
    } catch (error) {
      logger.error('Error handling session connecting', { sessionId, error });
      // Don't throw - we don't want to crash the application
    }
  }

  /**
   * Cleanup inactive sessions
   * Removes sessions that haven't been active for a specified period
   */
  static async cleanupInactiveSessions(inactiveHours: number = 24): Promise<number> {
    try {
      const accounts = await WhatsappAccountService.listAllAccounts();
      let cleanedCount = 0;

      for (const account of accounts) {
        // Skip connected sessions
        if (account.status === 'connected') {
          continue;
        }

        // Check if session is old enough to clean
        const accountAge = Date.now() - new Date(account.updatedAt).getTime();
        const maxAge = inactiveHours * 60 * 60 * 1000;

        if (accountAge > maxAge) {
          // Delete from WhatsApp if exists
          const waSession = whatsapp.getSession(account.sessionId);
          if (waSession) {
            await whatsapp.deleteSession(account.sessionId);
          }

          // Delete from database
          await WhatsappAccountService.deleteAccount(account.sessionId);
          cleanedCount++;

          logger.info('Cleaned up inactive session', {
            sessionId: account.sessionId,
            age: accountAge,
          });
        }
      }

      logger.info('Session cleanup completed', { cleanedCount });
      return cleanedCount;
    } catch (error) {
      logger.error('Error during session cleanup', { error });
      throw error;
    }
  }

  /**
   * Get all active sessions for a user
   */
  static async getUserSessions(userId: number): Promise<SessionInfo[]> {
    try {
      const accounts = await WhatsappAccountService.getAccountsByUser(userId);

      return accounts.map((account) => ({
        sessionId: account.sessionId,
        phoneNumber: account.phoneNumber,
        status: account.status,
        account,
      }));
    } catch (error) {
      logger.error('Error getting user sessions', { userId, error });
      throw error;
    }
  }

  /**
   * Delete a session completely
   */
  static async deleteSession(sessionId: string): Promise<void> {
    try {
      // Delete from WhatsApp
      const waSession = whatsapp.getSession(sessionId);
      if (waSession) {
        await whatsapp.deleteSession(sessionId);
      }

      // Delete from database
      await WhatsappAccountService.deleteAccount(sessionId);

      logger.info('Session deleted successfully', { sessionId });
    } catch (error) {
      logger.error('Error deleting session', { sessionId, error });
      throw error;
    }
  }
}
