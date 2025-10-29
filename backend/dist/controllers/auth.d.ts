import { Hono } from 'hono';
import type { User } from '../db/schema/users';
type Variables = {
    user?: User;
};
export declare function createAuthController(): Hono<{
    Variables: Variables;
}, import("hono/types").BlankSchema, "/">;
export {};
//# sourceMappingURL=auth.d.ts.map