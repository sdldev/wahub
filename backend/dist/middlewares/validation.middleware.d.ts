import { Context, Env, Input, MiddlewareHandler, TypedResponse, ValidationTargets } from 'hono';
import { z, ZodError, ZodSchema } from 'zod';
type Hook<T, E extends Env, P extends string, O = {}> = (_result: {
    success: true;
    data: T;
} | {
    success: false;
    error: ZodError;
    data: T;
}, _c: Context<E, P>) => Response | void | TypedResponse<O> | Promise<Response | void | TypedResponse<O>>;
type HasUndefined<T> = undefined extends T ? true : false;
export declare const requestValidator: <T extends ZodSchema, Target extends keyof ValidationTargets, E extends Env, P extends string, In = z.input<T>, Out = z.output<T>, I extends Input = {
    in: HasUndefined<In> extends true ? { [_K in Target]?: _K extends "json" ? In : HasUndefined<keyof ValidationTargets[_K]> extends true ? { [K2 in keyof In]?: ValidationTargets[_K][K2]; } : { [K2 in keyof In]: ValidationTargets[_K][K2]; }; } : { [_K in Target]: _K extends "json" ? In : HasUndefined<keyof ValidationTargets[_K]> extends true ? { [K2 in keyof In]?: ValidationTargets[_K][K2]; } : { [K2 in keyof In]: ValidationTargets[_K][K2]; }; };
    out: { [_K in Target]: Out; };
}, V extends I = I>(target: Target, schema: T, hook?: Hook<z.infer<T>, E, P>) => MiddlewareHandler<E, P, V>;
export {};
//# sourceMappingURL=validation.middleware.d.ts.map