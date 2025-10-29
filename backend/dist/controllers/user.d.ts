import { Hono } from 'hono';
import type { User } from '../db/schema/users';
type Variables = {
    user?: User;
};
export declare function createUserController(): Hono<{
    Variables: Variables;
}, import("hono/types").BlankSchema, "/">;
export {};
//# sourceMappingURL=user.d.ts.map