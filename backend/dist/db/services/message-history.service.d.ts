import { type Message } from '../schema/messages';
export declare class MessageHistoryService {
    /**
     * Save a message to history
     */
    static saveMessage(sessionId: string, from: string, to: string, content: string, type?: 'text' | 'image' | 'document' | 'sticker' | 'video', status?: 'pending' | 'processing' | 'completed' | 'failed'): Promise<Message>;
    /**
     * Update message status
     */
    static updateStatus(messageId: number, status: 'pending' | 'processing' | 'completed' | 'failed', error?: string): Promise<Message>;
    /**
     * Increment retry count
     */
    static incrementRetryCount(messageId: number): Promise<Message>;
    /**
     * Get messages by session
     */
    static getBySession(sessionId: string, limit?: number, offset?: number): Promise<Message[]>;
    /**
     * Get messages by date range
     */
    static getByDateRange(sessionId: string, startDate: string, endDate: string): Promise<Message[]>;
    /**
     * Get failed messages
     */
    static getFailedMessages(sessionId: string): Promise<Message[]>;
    /**
     * Get message statistics for a session
     */
    static getStatistics(sessionId: string, startDate?: string, endDate?: string): Promise<{
        total: number;
        pending: number;
        processing: number;
        completed: number;
        failed: number;
    }>;
    /**
     * Delete old messages (cleanup)
     */
    static deleteOldMessages(daysOld?: number): Promise<number>;
}
//# sourceMappingURL=message-history.service.d.ts.map