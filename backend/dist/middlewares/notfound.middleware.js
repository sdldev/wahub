import { HTTPException } from 'hono/http-exception';
export const notFoundMiddleware = () => {
    throw new HTTPException(404, {
        message: 'Route not found',
    });
};
