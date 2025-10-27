import { mysqlTable, varchar, int, timestamp } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const rateLimits = mysqlTable('rate_limits', {
  id: int('id').primaryKey().autoincrement(),
  sessionId: varchar('session_id', { length: 255 }).notNull(),
  recipient: varchar('recipient', { length: 255 }).notNull(),
  count: int('count').notNull().default(0),
  period: varchar('period', { length: 20 })
    .notNull()
    .default('hour')
    .$type<'minute' | 'hour' | 'day'>(),
  resetAt: timestamp('reset_at').notNull(),
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
});

export type RateLimit = typeof rateLimits.$inferSelect;
export type NewRateLimit = typeof rateLimits.$inferInsert;
