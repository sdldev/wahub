import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { UserService } from '../db/services/user.service';
import { WhatsappAccountService } from '../db/services/whatsapp-account.service';
import { createJwtMiddleware, createRoleMiddleware } from '../middlewares/jwt.middleware';
import type { User } from '../db/schema/users';
import { dbLogger } from '../utils/logger';

type Variables = {
  user?: User;
};

const userController = new Hono<{ Variables: Variables }>();

// Apply JWT middleware to all routes
userController.use('*', createJwtMiddleware());

// Update user schema
const updateUserSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  role: z.enum(['admin', 'user', 'readonly']).optional(),
});

/**
 * GET /user/accounts
 * Get WhatsApp accounts for current user
 */
userController.get('/accounts', async (c) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ success: false, error: 'Not authenticated' }, 401);
    }

    const accounts = await WhatsappAccountService.getAccountsByUser(user.id);

    return c.json({
      success: true,
      data: accounts,
    });
  } catch (error: any) {
    dbLogger.error('Failed to get user accounts', { error: error.message });
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * GET /user/profile
 * Get current user profile
 */
userController.get('/profile', async (c) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ success: false, error: 'Not authenticated' }, 401);
    }

    return c.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        apiKey: user.apiKey,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error: any) {
    dbLogger.error('Failed to get user profile', { error: error.message });
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * PUT /user/profile
 * Update current user profile
 */
userController.put('/profile', zValidator('json', updateUserSchema), async (c) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ success: false, error: 'Not authenticated' }, 401);
    }

    const data = c.req.valid('json');

    // Don't allow users to change their own role
    if (data.role && user.role !== 'admin') {
      delete data.role;
    }

    const updatedUser = await UserService.updateUser(user.id, data);

    return c.json({
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        apiKey: updatedUser.apiKey,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error: any) {
    dbLogger.error('Failed to update user profile', { error: error.message });
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * GET /user/admin/users
 * List all users (admin only)
 */
userController.get('/admin/users', createRoleMiddleware(['admin']), async (c) => {
  try {
    const users = await UserService.listUsers();

    return c.json({
      success: true,
      data: users.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      })),
    });
  } catch (error: any) {
    dbLogger.error('Failed to list users', { error: error.message });
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * GET /user/admin/users/:id
 * Get user by ID (admin only)
 */
userController.get('/admin/users/:id', createRoleMiddleware(['admin']), async (c) => {
  try {
    const userId = parseInt(c.req.param('id'));
    const user = await UserService.findById(userId);

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    return c.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        apiKey: user.apiKey,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error: any) {
    dbLogger.error('Failed to get user', { error: error.message });
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * PUT /user/admin/users/:id
 * Update user (admin only)
 */
userController.put(
  '/admin/users/:id',
  createRoleMiddleware(['admin']),
  zValidator('json', updateUserSchema),
  async (c) => {
    try {
      const userId = parseInt(c.req.param('id'));
      const data = c.req.valid('json');

      const updatedUser = await UserService.updateUser(userId, data);

      return c.json({
        success: true,
        data: {
          id: updatedUser.id,
          email: updatedUser.email,
          role: updatedUser.role,
          updatedAt: updatedUser.updatedAt,
        },
      });
    } catch (error: any) {
      dbLogger.error('Failed to update user', { error: error.message });
      return c.json({ success: false, error: error.message }, 500);
    }
  }
);

/**
 * DELETE /user/admin/users/:id
 * Delete user (admin only)
 */
userController.delete('/admin/users/:id', createRoleMiddleware(['admin']), async (c) => {
  try {
    const userId = parseInt(c.req.param('id'));
    await UserService.deleteUser(userId);

    return c.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    dbLogger.error('Failed to delete user', { error: error.message });
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * GET /user/admin/accounts
 * List all WhatsApp accounts (admin only)
 */
userController.get('/admin/accounts', createRoleMiddleware(['admin']), async (c) => {
  try {
    const accounts = await WhatsappAccountService.listAllAccounts();

    return c.json({
      success: true,
      data: accounts,
    });
  } catch (error: any) {
    dbLogger.error('Failed to list all accounts', { error: error.message });
    return c.json({ success: false, error: error.message }, 500);
  }
});

export function createUserController() {
  return userController;
}
