import * as whatsapp from "wa-multi-session";
import { env } from "../env";

export type MessageType = "text" | "image" | "document" | "sticker";

export type QueuedMessage = {
    id: string;
    sessionId: string;
    to: string;
    text: string;
    type: MessageType;
    isGroup?: boolean;
    media?: string;
    filename?: string;
    status: "pending" | "processing" | "completed" | "failed";
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

class MessageQueueService {
    private queues: Map<string, QueuedMessage[]> = new Map();
    private processing: Map<string, boolean> = new Map();
    private stats: Map<string, QueueStats> = new Map();

    // Rate limiting trackers
    private messageCountPerMinute: Map<string, number[]> = new Map();
    private messageCountPerHour: Map<string, number[]> = new Map();
    private recipientMessageCount: Map<string, Map<string, number[]>> = new Map();

    constructor() {
        // Cleanup old timestamps every minute
        setInterval(() => this.cleanupOldTimestamps(), 60000);
    }

    private cleanupOldTimestamps() {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        const oneHourAgo = now - 3600000;

        // Cleanup per-minute counters
        for (const [session, timestamps] of this.messageCountPerMinute.entries()) {
            this.messageCountPerMinute.set(
                session,
                timestamps.filter((t) => t > oneMinuteAgo)
            );
        }

        // Cleanup per-hour counters
        for (const [session, timestamps] of this.messageCountPerHour.entries()) {
            this.messageCountPerHour.set(
                session,
                timestamps.filter((t) => t > oneHourAgo)
            );
        }

        // Cleanup per-recipient counters
        for (const [session, recipients] of this.recipientMessageCount.entries()) {
            for (const [recipient, timestamps] of recipients.entries()) {
                const filtered = timestamps.filter((t) => t > oneHourAgo);
                if (filtered.length === 0) {
                    recipients.delete(recipient);
                } else {
                    recipients.set(recipient, filtered);
                }
            }
        }
    }

    private checkRateLimit(sessionId: string, to: string): { allowed: boolean; reason?: string } {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        const oneHourAgo = now - 3600000;

        // Check per-minute limit
        const minuteTimestamps = this.messageCountPerMinute.get(sessionId) || [];
        const messagesLastMinute = minuteTimestamps.filter((t) => t > oneMinuteAgo).length;
        if (messagesLastMinute >= env.MAX_MESSAGES_PER_MINUTE) {
            return {
                allowed: false,
                reason: `Rate limit exceeded: Maximum ${env.MAX_MESSAGES_PER_MINUTE} messages per minute`,
            };
        }

        // Check per-hour limit
        const hourTimestamps = this.messageCountPerHour.get(sessionId) || [];
        const messagesLastHour = hourTimestamps.filter((t) => t > oneHourAgo).length;
        if (messagesLastHour >= env.MAX_MESSAGES_PER_HOUR) {
            return {
                allowed: false,
                reason: `Rate limit exceeded: Maximum ${env.MAX_MESSAGES_PER_HOUR} messages per hour`,
            };
        }

        // Check per-recipient limit
        const recipientMap = this.recipientMessageCount.get(sessionId) || new Map();
        const recipientTimestamps = recipientMap.get(to) || [];
        const messagesToRecipient = recipientTimestamps.filter((t: number) => t > oneHourAgo).length;
        if (messagesToRecipient >= env.MAX_MESSAGES_PER_RECIPIENT) {
            return {
                allowed: false,
                reason: `Rate limit exceeded: Maximum ${env.MAX_MESSAGES_PER_RECIPIENT} messages per recipient per hour`,
            };
        }

        return { allowed: true };
    }

    private recordMessage(sessionId: string, to: string) {
        const now = Date.now();

        // Record for per-minute tracking
        const minuteTimestamps = this.messageCountPerMinute.get(sessionId) || [];
        minuteTimestamps.push(now);
        this.messageCountPerMinute.set(sessionId, minuteTimestamps);

        // Record for per-hour tracking
        const hourTimestamps = this.messageCountPerHour.get(sessionId) || [];
        hourTimestamps.push(now);
        this.messageCountPerHour.set(sessionId, hourTimestamps);

        // Record for per-recipient tracking
        let recipientMap = this.recipientMessageCount.get(sessionId);
        if (!recipientMap) {
            recipientMap = new Map();
            this.recipientMessageCount.set(sessionId, recipientMap);
        }
        const recipientTimestamps = recipientMap.get(to) || [];
        recipientTimestamps.push(now);
        recipientMap.set(to, recipientTimestamps);
    }

    private getRandomDelay(): number {
        const min = env.MESSAGE_DELAY_MIN;
        const max = env.MESSAGE_DELAY_MAX;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    enqueue(message: Omit<QueuedMessage, "id" | "status" | "retryCount" | "createdAt">): { success: boolean; messageId?: string; error?: string } {
        // Check rate limit before enqueueing
        const rateLimitCheck = this.checkRateLimit(message.sessionId, message.to);
        if (!rateLimitCheck.allowed) {
            return {
                success: false,
                error: rateLimitCheck.reason,
            };
        }

        const messageId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        const queuedMessage: QueuedMessage = {
            ...message,
            id: messageId,
            status: "pending",
            retryCount: 0,
            createdAt: new Date(),
        };

        const queue = this.queues.get(message.sessionId) || [];
        queue.push(queuedMessage);
        this.queues.set(message.sessionId, queue);

        // Update stats
        this.updateStats(message.sessionId, "pending", 1);

        // Start processing if not already processing
        if (!this.processing.get(message.sessionId)) {
            this.processQueue(message.sessionId);
        }

        return {
            success: true,
            messageId,
        };
    }

    private updateStats(sessionId: string, status: keyof QueueStats, delta: number) {
        const stats = this.stats.get(sessionId) || {
            pending: 0,
            processing: 0,
            completed: 0,
            failed: 0,
        };
        stats[status] += delta;
        this.stats.set(sessionId, stats);
    }

    private async processQueue(sessionId: string) {
        if (this.processing.get(sessionId)) {
            return;
        }

        this.processing.set(sessionId, true);

        while (true) {
            const queue = this.queues.get(sessionId) || [];
            const message = queue.find((m) => m.status === "pending");

            if (!message) {
                this.processing.set(sessionId, false);
                break;
            }

            // Update status to processing
            message.status = "processing";
            this.updateStats(sessionId, "pending", -1);
            this.updateStats(sessionId, "processing", 1);

            try {
                // Send typing indicator (except for stickers)
                if (message.type !== "sticker") {
                const typingDuration = Math.min(5000, Math.max(2000, message.text.length * 100));
                    // const typingDuration = 5000; 

                    await whatsapp.sendTyping({
                        sessionId: message.sessionId,
                        to: message.to,
                        duration: typingDuration,
                        isGroup: message.isGroup,
                    });

                    // Wait for typing indicator to be visible
                    await new Promise((resolve) => setTimeout(resolve, typingDuration));
                }

                // Send the actual message
                await this.sendMessage(message);

                // Record successful send
                this.recordMessage(sessionId, message.to);

                // Mark as completed
                message.status = "completed";
                this.updateStats(sessionId, "processing", -1);
                this.updateStats(sessionId, "completed", 1);

                console.log(`Message ${message.id} sent successfully to ${message.to}`);
            } catch (error: any) {
                console.error(`Error sending message ${message.id}:`, error.message);

                message.retryCount++;
                message.error = error.message;

                if (message.retryCount >= env.MAX_RETRY_ATTEMPTS) {
                    message.status = "failed";
                    this.updateStats(sessionId, "processing", -1);
                    this.updateStats(sessionId, "failed", 1);
                    console.error(`Message ${message.id} failed after ${message.retryCount} attempts`);
                } else {
                    message.status = "pending";
                    this.updateStats(sessionId, "processing", -1);
                    this.updateStats(sessionId, "pending", 1);
                    console.log(`Message ${message.id} will be retried (attempt ${message.retryCount})`);
                }
            }

            // Random delay before next message
            const delay = this.getRandomDelay();
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    private async sendMessage(message: QueuedMessage) {
        switch (message.type) {
            case "text":
                return await whatsapp.sendTextMessage({
                    sessionId: message.sessionId,
                    to: message.to,
                    text: message.text,
                    isGroup: message.isGroup,
                });

            case "image":
                return await whatsapp.sendImage({
                    sessionId: message.sessionId,
                    to: message.to,
                    text: message.text,
                    media: message.media!,
                    isGroup: message.isGroup,
                });

            case "document":
                return await whatsapp.sendDocument({
                    sessionId: message.sessionId,
                    to: message.to,
                    text: message.text,
                    media: message.media!,
                    filename: message.filename!,
                    isGroup: message.isGroup,
                });

            case "sticker":
                return await whatsapp.sendSticker({
                    sessionId: message.sessionId,
                    to: message.to,
                    media: message.media!,
                    isGroup: message.isGroup,
                });

            default:
                throw new Error(`Unknown message type: ${message.type}`);
        }
    }

    getQueueStatus(sessionId: string): QueueStats & { queue: QueuedMessage[] } {
        const stats = this.stats.get(sessionId) || {
            pending: 0,
            processing: 0,
            completed: 0,
            failed: 0,
        };

        const queue = this.queues.get(sessionId) || [];

        return {
            ...stats,
            queue: queue.map((m) => ({ ...m })),
        };
    }

    pauseQueue(sessionId: string) {
        this.processing.set(sessionId, false);
        console.log(`Queue paused for session: ${sessionId}`);
    }

    resumeQueue(sessionId: string) {
        if (!this.processing.get(sessionId)) {
            this.processQueue(sessionId);
            console.log(`Queue resumed for session: ${sessionId}`);
        }
    }
}

export const messageQueueService = new MessageQueueService();
