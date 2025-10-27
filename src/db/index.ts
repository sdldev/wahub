import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'wahub.db');
const sqlite = new Database(dbPath);

// Enable WAL mode for better concurrency
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });

// Run migrations
export function runMigrations() {
  try {
    const migrationsFolder = path.join(process.cwd(), 'src/db/migrations');
    if (fs.existsSync(migrationsFolder)) {
      migrate(db, { migrationsFolder });
      console.log('✅ Database migrations completed');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Initialize database tables if migrations don't exist
export function initializeDatabase() {
  try {
    // Create tables manually if migrations folder doesn't exist
    const migrationsFolder = path.join(process.cwd(), 'src/db/migrations');
    if (!fs.existsSync(migrationsFolder)) {
      console.log('Creating database tables...');

      // Users table
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('admin', 'user', 'readonly')),
          api_key TEXT UNIQUE,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // WhatsApp Accounts table
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS whatsapp_accounts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          phone_number TEXT UNIQUE,
          session_id TEXT NOT NULL UNIQUE,
          status TEXT NOT NULL DEFAULT 'disconnected' CHECK(status IN ('connected', 'disconnected', 'connecting', 'error')),
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      // Sessions table
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          account_id INTEGER NOT NULL,
          session_name TEXT NOT NULL,
          qr_code TEXT,
          status TEXT NOT NULL DEFAULT 'inactive' CHECK(status IN ('active', 'inactive', 'expired')),
          last_active TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (account_id) REFERENCES whatsapp_accounts(id) ON DELETE CASCADE
        );
      `);

      // Messages table
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT NOT NULL,
          "from" TEXT NOT NULL,
          "to" TEXT NOT NULL,
          content TEXT NOT NULL,
          type TEXT NOT NULL DEFAULT 'text' CHECK(type IN ('text', 'image', 'document', 'sticker', 'video')),
          status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
          retry_count INTEGER NOT NULL DEFAULT 0,
          error TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Message Queue table
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS message_queue (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT NOT NULL,
          message_data TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
          priority INTEGER NOT NULL DEFAULT 0,
          scheduled_at TEXT,
          retry_count INTEGER NOT NULL DEFAULT 0,
          error TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Rate Limits table
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS rate_limits (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT NOT NULL,
          recipient TEXT NOT NULL,
          count INTEGER NOT NULL DEFAULT 0,
          period TEXT NOT NULL DEFAULT 'hour' CHECK(period IN ('minute', 'hour', 'day')),
          reset_at TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create indexes for better performance
      sqlite.exec(`
        CREATE INDEX IF NOT EXISTS idx_whatsapp_accounts_user_id ON whatsapp_accounts(user_id);
        CREATE INDEX IF NOT EXISTS idx_whatsapp_accounts_session_id ON whatsapp_accounts(session_id);
        CREATE INDEX IF NOT EXISTS idx_sessions_account_id ON sessions(account_id);
        CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
        CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
        CREATE INDEX IF NOT EXISTS idx_message_queue_session_id ON message_queue(session_id);
        CREATE INDEX IF NOT EXISTS idx_message_queue_status ON message_queue(status);
        CREATE INDEX IF NOT EXISTS idx_rate_limits_session_recipient ON rate_limits(session_id, recipient);
      `);

      console.log('✅ Database tables created successfully');
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

export { sqlite };
