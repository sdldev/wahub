import { mysqlTable, varchar, int, timestamp, text } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).unique(),
  role: varchar('role', { length: 20 })
    .notNull()
    .default('user')
    .$type<'admin' | 'user' | 'readonly'>(),
  status: varchar('status', { length: 20 })
    .notNull()
    .default('Pending')
    .$type<'Active' | 'Pending' | 'Disable'>(),
  note: text('note'),
  apiKey: varchar('api_key', { length: 255 }).unique(),
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
