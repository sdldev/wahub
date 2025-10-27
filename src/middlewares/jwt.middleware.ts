import { Context, Next } from 'hono';
import { JwtService } from '../utils/jwt.service';
import { UserService } from '../db/services/user.service';
import { authLogger } from '../utils/logger';

/**
 * JWT Authentication Middleware
 * Validates JWT token and adds user to context
 */
export function createJwtMiddleware() {
  return async (c: Context, next: Next) => {
    try {
      // Get token from Authorization header
      const authHeader = c.req.header('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json(
          {
            success: false,
            error: 'Missing or invalid authorization header',
          },
          401
        );
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify JWT token
      const payload = JwtService.verify(token);

      // Get user from database
      const user = await UserService.findById(payload.userId);
      if (!user) {
        authLogger.warn('JWT token valid but user not found', {
          userId: payload.userId,
        });
        return c.json(
          {
            success: false,
            error: 'User not found',
          },
          401
        );
      }

      // Add user to context
      c.set('user', user);

      await next();
    } catch (error: any) {
      authLogger.warn('JWT authentication failed', { error: error.message });
      return c.json(
        {
          success: false,
          error: 'Invalid or expired token',
        },
        401
      );
    }
  };
}

/**
 * Role-based Authorization Middleware
 * Checks if user has required role
 */
export function createRoleMiddleware(
  allowedRoles: Array<'admin' | 'user' | 'readonly'>
) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    if (!user) {
      return c.json(
        {
          success: false,
          error: 'Not authenticated',
        },
        401
      );
    }

    if (!allowedRoles.includes(user.role)) {
      authLogger.warn('Insufficient permissions', {
        userId: user.id,
        role: user.role,
        requiredRoles: allowedRoles,
      });
      return c.json(
        {
          success: false,
          error: 'Insufficient permissions',
        },
        403
      );
    }

    await next();
  };
}
