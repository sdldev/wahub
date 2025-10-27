import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: text('session_id').notNull(),
  from: text('from').notNull(),
  to: text('to').notNull(),
  content: text('content').notNull(),
  type: text('type', {
    enum: ['text', 'image', 'document', 'sticker', 'video'],
  })
    .notNull()
    .default('text'),
  status: text('status', {
    enum: ['pending', 'processing', 'completed', 'failed'],
  })
    .notNull()
    .default('pending'),
  retryCount: integer('retry_count').notNull().default(0),
  error: text('error'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
