export type MessageType = 'text' | 'image' | 'document' | 'sticker';
export type QueuedMessage = {
    id: string;
    sessionId: string;
    to: string;
    text: string;
    type: MessageType;
    isGroup?: boolean;
    media?: string;
    filename?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    retryCount: number;
    createdAt: Date;
    error?: string;
};
export type QueueStats = {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
};
declare class MessageQueueService {
    private queues;
    private processing;
    private stats;
    private messageCountPerMinute;
    private messageCountPerHour;
    private recipientMessageCount;
    constructor();
    private cleanupOldTimestamps;
    private checkRateLimit;
    private recordMessage;
    private getRandomDelay;
    enqueue(message: Omit<QueuedMessage, 'id' | 'status' | 'retryCount' | 'createdAt'>): {
        success: boolean;
        messageId?: string;
        error?: string;
    };
    private updateStats;
    private processQueue;
    private sendMessage;
    getQueueStatus(sessionId: string): QueueStats & {
        queue: QueuedMessage[];
    };
    pauseQueue(sessionId: string): void;
    resumeQueue(sessionId: string): void;
}
export declare const messageQueueService: MessageQueueService;
export {};
//# sourceMappingURL=message-queue.service.d.ts.map