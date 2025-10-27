import 'dotenv/config';
import { z } from 'zod';

export const env = z
  .object({
    NODE_ENV: z.enum(['DEVELOPMENT', 'PRODUCTION']).default('DEVELOPMENT'),
    PORT: z
      .string()
      .default('5001')
      .transform((e) => Number(e)),
    WEBHOOK_BASE_URL: z.string().optional(),
    KEY: z.string().optional(),

    // Rate Limiting Configuration
    MESSAGE_DELAY_MIN: z
      .string()
      .default('3000')
      .transform((e) => Number(e)), // minimum delay in ms
    MESSAGE_DELAY_MAX: z
      .string()
      .default('7000')
      .transform((e) => Number(e)), // maximum delay in ms
    MAX_MESSAGES_PER_MINUTE: z
      .string()
      .default('20')
      .transform((e) => Number(e)),
    MAX_MESSAGES_PER_HOUR: z
      .string()
      .default('500')
      .transform((e) => Number(e)),
    MAX_MESSAGES_PER_RECIPIENT: z
      .string()
      .default('10')
      .transform((e) => Number(e)), // per hour
    MAX_RETRY_ATTEMPTS: z
      .string()
      .default('3')
      .transform((e) => Number(e)),

    // JWT & Security Configuration
    JWT_SECRET: z.string().optional(),
    JWT_EXPIRES_IN: z.string().default('7d'),
    ENCRYPTION_KEY: z.string().optional(),

    // Logging Configuration
    LOG_LEVEL: z
      .enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'])
      .default('info'),

    // Database Configuration
    DB_TYPE: z.enum(['mysql']).default('mysql'),
    DB_HOST: z.string().optional(),
    DB_PORT: z
      .string()
      .optional()
      .transform((e) => (e ? Number(e) : undefined)),
    DB_USER: z.string().optional(),
    DB_PASSWORD: z.string().optional(),
    DB_NAME: z.string().default('wahub'),
  })
  .refine(
    (data) => {
      if (data.NODE_ENV === 'PRODUCTION' && !data.KEY) {
        return false;
      }
      return true;
    },
    { message: 'KEY is required in PRODUCTION environment' }
  )
  .refine(
    (data) => {
      if (data.DB_TYPE === 'mysql') {
        if (!data.DB_HOST || !data.DB_USER || !data.DB_PASSWORD) {
          return false;
        }
      }
      return true;
    },
    {
      message:
        'DB_HOST, DB_USER, and DB_PASSWORD are required when DB_TYPE is mysql',
    }
  )
  .parse(process.env);
