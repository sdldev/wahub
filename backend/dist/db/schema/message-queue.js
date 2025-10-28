import { mysqlTable, varchar, int, text, timestamp } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
export const messageQueue = mysqlTable('message_queue', {
    id: int('id').primaryKey().autoincrement(),
    sessionId: varchar('session_id', { length: 255 }).notNull(),
    messageData: text('message_data').notNull(),
    status: varchar('status', { length: 20 })
        .notNull()
        .default('pending')
        .$type(),
    priority: int('priority').notNull().default(0),
    scheduledAt: timestamp('scheduled_at'),
    retryCount: int('retry_count').notNull().default(0),
    error: text('error'),
    createdAt: timestamp('created_at')
        .notNull()
        .default(sql `CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at')
        .notNull()
        .default(sql `CURRENT_TIMESTAMP`)
        .$onUpdate(() => new Date()),
});
