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
export declare class SessionManagementService {
    /**
     * Check if a phone number already has an active session
     * @param phoneNumber - Phone number to check
     * @returns SessionInfo if active session exists, null otherwise
     */
    static checkExistingSession(phoneNumber: string): Promise<SessionInfo | null>;
    /**
     * Validate and prepare session creation
     * Checks for duplicate sessions before allowing creation
     */
    static validateSessionCreation(sessionId: string, phoneNumber?: string): Promise<{
        canCreate: boolean;
        reason?: string;
        existingSession?: SessionInfo;
    }>;
    /**
     * Create a new session with deduplication checks
     */
    static createSession(options: SessionCreationOptions): Promise<WhatsappAccount>;
    /**
     * Update session when WhatsApp connection is established
     * Automatically detects and stores phone number
     */
    static onSessionConnected(sessionId: string, connectionInfo?: any): Promise<void>;
    /**
     * Handle session disconnection
     */
    static onSessionDisconnected(sessionId: string): Promise<void>;
    /**
     * Handle session connecting state
     */
    static onSessionConnecting(sessionId: string): Promise<void>;
    /**
     * Cleanup inactive sessions
     * Removes sessions that haven't been active for a specified period
     */
    static cleanupInactiveSessions(inactiveHours?: number): Promise<number>;
    /**
     * Get all active sessions for a user
     */
    static getUserSessions(userId: number): Promise<SessionInfo[]>;
    /**
     * Delete a session completely
     */
    static deleteSession(sessionId: string): Promise<void>;
}
//# sourceMappingURL=session-management.service.d.ts.map