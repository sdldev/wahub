import { mysqlTable, varchar, int, timestamp } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { users } from './users';

export const whatsappAccounts = mysqlTable('whatsapp_accounts', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  phoneNumber: varchar('phone_number', { length: 50 }).unique(),
  sessionId: varchar('session_id', { length: 255 }).notNull().unique(),
  status: varchar('status', { length: 20 })
    .notNull()
    .default('disconnected')
    .$type<'connected' | 'disconnected' | 'connecting' | 'error'>(),
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
});

export type WhatsappAccount = typeof whatsappAccounts.$inferSelect;
export type NewWhatsappAccount = typeof whatsappAccounts.$inferInsert;
