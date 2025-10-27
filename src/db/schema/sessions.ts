import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { whatsappAccounts } from './whatsapp-accounts';

export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  accountId: integer('account_id')
    .notNull()
    .references(() => whatsappAccounts.id, { onDelete: 'cascade' }),
  sessionName: text('session_name').notNull(),
  qrCode: text('qr_code'),
  status: text('status', {
    enum: ['active', 'inactive', 'expired'],
  })
    .notNull()
    .default('inactive'),
  lastActive: text('last_active'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
