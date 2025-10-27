import { NotFoundHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';

export const notFoundMiddleware: NotFoundHandler = () => {
  throw new HTTPException(404, {
    message: 'Route not found',
  });
};
