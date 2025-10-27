import { HTTPException } from "hono/http-exception";
import { createMiddleware } from "hono/factory";
import { env } from "../env";

export const createKeyMiddleware = () =>
  createMiddleware(async (c, next) => {
    const authHeader = c.req.header("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HTTPException(401, {
        message: "Unauthorized: Missing or malformed API key.",
      });
    }

    const token = authHeader.split(" ")[1];
    if (token !== env.KEY) {
      throw new HTTPException(403, { message: "Forbidden: Invalid API key." });
    }

    await next();
  });
