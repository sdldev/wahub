import type { Config } from 'drizzle-kit';
import 'dotenv/config';

export default {
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'wahub_user',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'wahub',
  },
} satisfies Config;
