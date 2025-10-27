import { mysqlTable, varchar, int, text, timestamp } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { whatsappAccounts } from './whatsapp-accounts';

export const sessions = mysqlTable('sessions', {
  id: int('id').primaryKey().autoincrement(),
  accountId: int('account_id')
    .notNull()
    .references(() => whatsappAccounts.id, { onDelete: 'cascade' }),
  sessionName: varchar('session_name', { length: 255 }).notNull(),
  qrCode: text('qr_code'),
  status: varchar('status', { length: 20 })
    .notNull()
    .default('inactive')
    .$type<'active' | 'inactive' | 'expired'>(),
  lastActive: timestamp('last_active'),
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
});

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
