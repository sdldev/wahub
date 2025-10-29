import { type WhatsappAccount } from '../schema/whatsapp-accounts';
export declare class WhatsappAccountService {
    /**
     * Create a new WhatsApp account
     */
    static createAccount(userId: number, sessionId: string, phoneNumber?: string): Promise<WhatsappAccount>;
    /**
     * Find account by session ID
     */
    static findBySessionId(sessionId: string): Promise<WhatsappAccount | null>;
    /**
     * Find account by phone number
     */
    static findByPhoneNumber(phoneNumber: string): Promise<WhatsappAccount | null>;
    /**
     * Get all accounts for a user
     */
    static getAccountsByUser(userId: number): Promise<WhatsappAccount[]>;
    /**
     * Update account status
     */
    static updateStatus(sessionId: string, status: 'connected' | 'disconnected' | 'connecting' | 'error'): Promise<WhatsappAccount>;
    /**
     * Update phone number (when WhatsApp connection is established)
     */
    static updatePhoneNumber(sessionId: string, phoneNumber: string): Promise<WhatsappAccount>;
    /**
     * Delete account
     */
    static deleteAccount(sessionId: string): Promise<void>;
    /**
     * Check if phone number already has an active session
     */
    static hasActiveSession(phoneNumber: string): Promise<boolean>;
    /**
     * List all accounts (admin only)
     */
    static listAllAccounts(): Promise<WhatsappAccount[]>;
}
//# sourceMappingURL=whatsapp-account.service.d.ts.map