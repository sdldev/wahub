import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const messageQueue = sqliteTable('message_queue', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: text('session_id').notNull(),
  messageData: text('message_data').notNull(), // JSON stringified message data
  status: text('status', {
    enum: ['pending', 'processing', 'completed', 'failed'],
  })
    .notNull()
    .default('pending'),
  priority: integer('priority').notNull().default(0),
  scheduledAt: text('scheduled_at'),
  retryCount: integer('retry_count').notNull().default(0),
  error: text('error'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type MessageQueueItem = typeof messageQueue.$inferSelect;
export type NewMessageQueueItem = typeof messageQueue.$inferInsert;
