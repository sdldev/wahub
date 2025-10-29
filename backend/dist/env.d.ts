import 'dotenv/config';
export declare const env: {
    NODE_ENV: "DEVELOPMENT" | "PRODUCTION";
    PORT: number;
    MESSAGE_DELAY_MIN: number;
    MESSAGE_DELAY_MAX: number;
    MAX_MESSAGES_PER_MINUTE: number;
    MAX_MESSAGES_PER_HOUR: number;
    MAX_MESSAGES_PER_RECIPIENT: number;
    MAX_RETRY_ATTEMPTS: number;
    JWT_EXPIRES_IN: string;
    LOG_LEVEL: "error" | "warn" | "info" | "http" | "verbose" | "debug" | "silly";
    DB_TYPE: "mysql";
    DB_NAME: string;
    WEBHOOK_BASE_URL?: string | undefined;
    KEY?: string | undefined;
    JWT_SECRET?: string | undefined;
    ENCRYPTION_KEY?: string | undefined;
    DB_HOST?: string | undefined;
    DB_PORT?: number | undefined;
    DB_USER?: string | undefined;
    DB_PASSWORD?: string | undefined;
};
//# sourceMappingURL=env.d.ts.map