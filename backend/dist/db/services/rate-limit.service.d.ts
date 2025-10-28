import { type RateLimit } from '../schema/rate-limits';
export declare class RateLimitService {
    /**
     * Get or create rate limit counter
     */
    static getCounter(sessionId: string, recipient: string, period: 'minute' | 'hour' | 'day'): Promise<RateLimit>;
    /**
     * Increment counter
     */
    static increment(sessionId: string, recipient: string, period: 'minute' | 'hour' | 'day'): Promise<RateLimit>;
    /**
     * Check if rate limit is exceeded
     */
    static isLimitExceeded(sessionId: string, recipient: string, period: 'minute' | 'hour' | 'day', limit: number): Promise<boolean>;
    /**
     * Get all active counters for a session
     */
    static getSessionCounters(sessionId: string): Promise<RateLimit[]>;
    /**
     * Reset counter (manual reset)
     */
    static resetCounter(sessionId: string, recipient: string, period: 'minute' | 'hour' | 'day'): Promise<void>;
    /**
     * Clean up expired counters
     */
    static cleanupExpired(): Promise<number>;
}
//# sourceMappingURL=rate-limit.service.d.ts.map