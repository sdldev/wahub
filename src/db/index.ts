import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzleMysql } from 'drizzle-orm/mysql2';
import Database from 'better-sqlite3';
import mysql from 'mysql2/promise';
import * as schemaSqlite from './schema';
import * as schemaMysql from './schema-mysql';
import path from 'path';
import fs from 'fs';
import { env } from '../env';
import { logger } from '../utils/logger';

type DbType = typeof db;

let db: any;
let connection: Database.Database | mysql.Pool | null = null;

// Initialize database based on DB_TYPE
export function initializeDatabase() {
  try {
    if (env.DB_TYPE === 'mysql') {
      logger.info('Initializing MySQL database...');
      initializeMysql();
    } else {
      logger.info('Initializing SQLite database...');
      initializeSqlite();
    }
  } catch (error) {
    logger.error('❌ Database initialization failed', { error });
    throw error;
  }
}

function initializeSqlite() {
  // Ensure data directory exists
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'wahub.db');
  const sqlite = new Database(dbPath);

  // Enable WAL mode for better concurrency
  sqlite.pragma('journal_mode = WAL');

  connection = sqlite;
  db = drizzleSqlite(sqlite, { schema: schemaSqlite });

  // Create tables
  createSqliteTables(sqlite);

  logger.info('✅ SQLite database initialized successfully');
}

async function initializeMysql() {
  if (!env.DB_HOST || !env.DB_USER || !env.DB_PASSWORD) {
    throw new Error(
      'MySQL configuration incomplete. DB_HOST, DB_USER, and DB_PASSWORD are required.'
    );
  }

  // Create connection pool
  const pool = mysql.createPool({
    host: env.DB_HOST,
    port: env.DB_PORT || 3306,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  connection = pool;
  db = drizzleMysql(pool, { schema: schemaMysql, mode: 'default' });

  // Test connection
  try {
    const conn = await pool.getConnection();
    logger.info('✅ MySQL connection established');
    conn.release();
  } catch (error) {
    logger.error('❌ MySQL connection failed', { error });
    throw error;
  }

  // Create tables
  await createMysqlTables(pool);

  logger.info('✅ MySQL database initialized successfully');
}

function createSqliteTables(sqlite: Database.Database) {
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

  logger.info('✅ SQLite tables created successfully');
}

async function createMysqlTables(pool: mysql.Pool) {
  const queries = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'user',
      api_key VARCHAR(255) UNIQUE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CHECK (role IN ('admin', 'user', 'readonly'))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // WhatsApp Accounts table
    `CREATE TABLE IF NOT EXISTS whatsapp_accounts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      phone_number VARCHAR(50) UNIQUE,
      session_id VARCHAR(255) NOT NULL UNIQUE,
      status VARCHAR(20) NOT NULL DEFAULT 'disconnected',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CHECK (status IN ('connected', 'disconnected', 'connecting', 'error'))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // Sessions table
    `CREATE TABLE IF NOT EXISTS sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      account_id INT NOT NULL,
      session_name VARCHAR(255) NOT NULL,
      qr_code TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'inactive',
      last_active TIMESTAMP NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (account_id) REFERENCES whatsapp_accounts(id) ON DELETE CASCADE,
      CHECK (status IN ('active', 'inactive', 'expired'))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // Messages table
    `CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      session_id VARCHAR(255) NOT NULL,
      \`from\` VARCHAR(255) NOT NULL,
      \`to\` VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      type VARCHAR(20) NOT NULL DEFAULT 'text',
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      retry_count INT NOT NULL DEFAULT 0,
      error TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CHECK (type IN ('text', 'image', 'document', 'sticker', 'video')),
      CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // Message Queue table
    `CREATE TABLE IF NOT EXISTS message_queue (
      id INT AUTO_INCREMENT PRIMARY KEY,
      session_id VARCHAR(255) NOT NULL,
      message_data TEXT NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      priority INT NOT NULL DEFAULT 0,
      scheduled_at TIMESTAMP NULL,
      retry_count INT NOT NULL DEFAULT 0,
      error TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // Rate Limits table
    `CREATE TABLE IF NOT EXISTS rate_limits (
      id INT AUTO_INCREMENT PRIMARY KEY,
      session_id VARCHAR(255) NOT NULL,
      recipient VARCHAR(255) NOT NULL,
      count INT NOT NULL DEFAULT 0,
      period VARCHAR(20) NOT NULL DEFAULT 'hour',
      reset_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CHECK (period IN ('minute', 'hour', 'day'))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // Create indexes
    `CREATE INDEX IF NOT EXISTS idx_whatsapp_accounts_user_id ON whatsapp_accounts(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_whatsapp_accounts_session_id ON whatsapp_accounts(session_id);`,
    `CREATE INDEX IF NOT EXISTS idx_sessions_account_id ON sessions(account_id);`,
    `CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);`,
    `CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);`,
    `CREATE INDEX IF NOT EXISTS idx_message_queue_session_id ON message_queue(session_id);`,
    `CREATE INDEX IF NOT EXISTS idx_message_queue_status ON message_queue(status);`,
    `CREATE INDEX IF NOT EXISTS idx_rate_limits_session_recipient ON rate_limits(session_id, recipient);`,
  ];

  for (const query of queries) {
    try {
      await pool.execute(query);
    } catch (error: any) {
      // Ignore "already exists" errors
      if (!error.message.includes('already exists')) {
        logger.error('Error creating MySQL table/index', {
          error: error.message,
        });
      }
    }
  }

  logger.info('✅ MySQL tables created successfully');
}

export { db, connection };
