import { Context, Next } from 'hono';
/**
 * JWT Authentication Middleware
 * Validates JWT token and adds user to context
 */
export declare function createJwtMiddleware(): (c: Context, next: Next) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 401, "json">) | undefined>;
/**
 * Role-based Authorization Middleware
 * Checks if user has required role
 */
export declare function createRoleMiddleware(allowedRoles: Array<'admin' | 'user' | 'readonly'>): (c: Context, next: Next) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 403, "json">) | undefined>;
//# sourceMappingURL=jwt.middleware.d.ts.map