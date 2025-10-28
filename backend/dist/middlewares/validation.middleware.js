import { HTTPException } from 'hono/http-exception';
import { validator } from 'hono/validator';
export const requestValidator = (target, schema, hook) => 
//   @ts-expect-error not typed well
validator(target, async (value, _c) => {
    const _result = await schema.safeParseAsync(value);
    if (hook) {
        const hookResult = await hook({ data: value, ..._result }, _c);
        if (hookResult) {
            if (hookResult instanceof Response) {
                return hookResult;
            }
            if ('response' in hookResult) {
                return hookResult.response;
            }
        }
    }
    if (!_result.success) {
        throw new HTTPException(400, {
            message: `${_result.error.errors[0]?.message} field '${_result.error.errors[0]?.path}' on ${target}`,
        });
    }
    return _result.data;
});
