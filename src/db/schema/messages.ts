import { mysqlTable, varchar, int, text, timestamp } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const messages = mysqlTable('messages', {
  id: int('id').primaryKey().autoincrement(),
  sessionId: varchar('session_id', { length: 255 }).notNull(),
  from: varchar('from', { length: 255 }).notNull(),
  to: varchar('to', { length: 255 }).notNull(),
  content: text('content').notNull(),
  type: varchar('type', { length: 20 })
    .notNull()
    .default('text')
    .$type<'text' | 'image' | 'document' | 'sticker' | 'video'>(),
  status: varchar('status', { length: 20 })
    .notNull()
    .default('pending')
    .$type<'pending' | 'processing' | 'completed' | 'failed'>(),
  retryCount: int('retry_count').notNull().default(0),
  error: text('error'),
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
});

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
