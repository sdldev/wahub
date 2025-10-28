import { eq, and, gte, lte } from 'drizzle-orm';
import { db } from '../index';
import { rateLimits, } from '../schema/rate-limits';
import { dbLogger } from '../../utils/logger';
export class RateLimitService {
    /**
     * Get or create rate limit counter
     */
    static async getCounter(sessionId, recipient, period) {
        try {
            const now = new Date();
            let resetAt;
            // Calculate reset time based on period
            switch (period) {
                case 'minute':
                    resetAt = new Date(now.getTime() + 60 * 1000);
                    break;
                case 'hour':
                    resetAt = new Date(now.getTime() + 60 * 60 * 1000);
                    break;
                case 'day':
                    resetAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                    break;
            }
            // Check if counter exists and is not expired
            const [existing] = await db
                .select()
                .from(rateLimits)
                .where(and(eq(rateLimits.sessionId, sessionId), eq(rateLimits.recipient, recipient), eq(rateLimits.period, period), gte(rateLimits.resetAt, now)))
                .limit(1);
            if (existing) {
                return existing;
            }
            // Create new counter
            const result = await db
                .insert(rateLimits)
                .values({
                sessionId,
                recipient,
                period,
                count: 0,
                resetAt: resetAt.toISOString(),
            })
                .returning();
            if (!result || result.length === 0) {
                throw new Error('Failed to create rate limit counter');
            }
            return result[0];
        }
        catch (error) {
            dbLogger.error('Failed to get rate limit counter', {
                sessionId,
                recipient,
                period,
                error: error.message,
            });
            throw error;
        }
    }
    /**
     * Increment counter
     */
    static async increment(sessionId, recipient, period) {
        try {
            const counter = await this.getCounter(sessionId, recipient, period);
            const result = await db
                .update(rateLimits)
                .set({
                count: counter.count + 1,
                updatedAt: new Date().toISOString(),
            })
                .where(eq(rateLimits.id, counter.id))
                .returning();
            if (!result || result.length === 0) {
                throw new Error('Failed to increment counter');
            }
            return result[0];
        }
        catch (error) {
            dbLogger.error('Failed to increment rate limit counter', {
                sessionId,
                recipient,
                period,
                error: error.message,
            });
            throw error;
        }
    }
    /**
     * Check if rate limit is exceeded
     */
    static async isLimitExceeded(sessionId, recipient, period, limit) {
        try {
            const counter = await this.getCounter(sessionId, recipient, period);
            return counter.count >= limit;
        }
        catch (error) {
            dbLogger.error('Failed to check rate limit', {
                sessionId,
                recipient,
                period,
                error: error.message,
            });
            throw error;
        }
    }
    /**
     * Get all active counters for a session
     */
    static async getSessionCounters(sessionId) {
        try {
            const now = new Date();
            return await db
                .select()
                .from(rateLimits)
                .where(and(eq(rateLimits.sessionId, sessionId), gte(rateLimits.resetAt, now)));
        }
        catch (error) {
            dbLogger.error('Failed to get session counters', {
                sessionId,
                error: error.message,
            });
            throw error;
        }
    }
    /**
     * Reset counter (manual reset)
     */
    static async resetCounter(sessionId, recipient, period) {
        try {
            await db
                .delete(rateLimits)
                .where(and(eq(rateLimits.sessionId, sessionId), eq(rateLimits.recipient, recipient), eq(rateLimits.period, period)));
            dbLogger.info('Rate limit counter reset', {
                sessionId,
                recipient,
                period,
            });
        }
        catch (error) {
            dbLogger.error('Failed to reset counter', {
                sessionId,
                recipient,
                period,
                error: error.message,
            });
            throw error;
        }
    }
    /**
     * Clean up expired counters
     */
    static async cleanupExpired() {
        try {
            const now = new Date();
            const result = await db
                .delete(rateLimits)
                .where(lte(rateLimits.resetAt, now))
                .returning();
            dbLogger.info(`Cleaned up ${result.length} expired rate limit counters`);
            return result.length;
        }
        catch (error) {
            dbLogger.error('Failed to cleanup expired counters', {
                error: error.message,
            });
            throw error;
        }
    }
}
