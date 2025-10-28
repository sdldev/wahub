import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { UserService } from '../db/services/user.service';
import { JwtService } from '../utils/jwt.service';
import { authLogger } from '../utils/logger';
import type { User } from '../db/schema/users';

// Extend Hono context type
type Variables = {
  user?: User;
};

const authController = new Hono<{ Variables: Variables }>();

// Register schema
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  role: z.enum(['admin', 'user', 'readonly']).optional(),
  status: z.enum(['Active', 'Pending', 'Disable']).optional(),
  note: z.string().optional(),
});

// Login schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string(),
});

// Public registration schema (from landing page)
const publicRegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().min(8, 'Phone number is required'),
  note: z.string().optional(),
});

/**
 * POST /auth/register
 * Register a new user
 */
authController.post('/register', zValidator('json', registerSchema), async (c) => {
  try {
    const { email, password, phone, role, status, note } = c.req.valid('json');

    // Check if user already exists
    const existingUser = await UserService.findByEmail(email);
    if (existingUser) {
      return c.json(
        {
          success: false,
          error: 'User already exists',
        },
        400
      );
    }

    // Check if phone already exists (if provided)
    if (phone) {
      const existingPhoneUser = await UserService.findByPhone(phone);
      if (existingPhoneUser) {
        return c.json(
          {
            success: false,
            error: 'Phone number already registered',
          },
          400
        );
      }
    }

    // Create user with new fields
    const user = await UserService.createUser(
      email, 
      password, 
      role || 'user',
      phone,
      status || 'Pending',
      note
    );

    // Generate JWT token
    const token = JwtService.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    authLogger.info('User registered successfully', {
      userId: user.id,
      email: user.email,
      phone: user.phone,
      status: user.status,
    });

    return c.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
          note: user.note,
          apiKey: user.apiKey,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error: any) {
    authLogger.error('Registration failed', { error: error.message });
    return c.json(
      {
        success: false,
        error: error.message || 'Failed to register user',
      },
      500
    );
  }
});

/**
 * POST /auth/login
 * Login user
 */
authController.post('/login', zValidator('json', loginSchema), async (c) => {
  try {
    const { email, password } = c.req.valid('json');

    // Verify credentials
    const user = await UserService.verifyCredentials(email, password);
    if (!user) {
      authLogger.warn('Invalid login attempt', { email });
      return c.json(
        {
          success: false,
          error: 'Invalid email or password',
        },
        401
      );
    }

    // Generate JWT token
    const token = JwtService.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    authLogger.info('User logged in successfully', {
      userId: user.id,
      email: user.email,
    });

    return c.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
          note: user.note,
          apiKey: user.apiKey,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error: any) {
    authLogger.error('Login failed', { error: error.message });
    return c.json(
      {
        success: false,
        error: error.message || 'Failed to login',
      },
      500
    );
  }
});

/**
 * GET /auth/me
 * Get current user info (requires JWT)
 */
authController.get('/me', async (c) => {
  try {
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

    return c.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        note: user.note,
        apiKey: user.apiKey,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    return c.json(
      {
        success: false,
        error: error.message,
      },
      500
    );
  }
});

/**
 * POST /auth/register-access
 * Public registration for access request (from landing page)
 */
authController.post('/register-access', zValidator('json', publicRegisterSchema), async (c) => {
  try {
    const { email, phone, note } = c.req.valid('json');

    // Check if user already exists
    const existingUser = await UserService.findByEmail(email);
    if (existingUser) {
      return c.json(
        {
          success: false,
          error: 'Email already registered. Please contact administrator.',
        },
        400
      );
    }

    // Check if phone already exists
    const existingPhoneUser = await UserService.findByPhone(phone);
    if (existingPhoneUser) {
      return c.json(
        {
          success: false,
          error: 'Phone number already registered. Please contact administrator.',
        },
        400
      );
    }

    // Generate temporary password for admin to change later
    const tempPassword = 'TempPass123!';
    
    // Create user with pending status
    const user = await UserService.createUser(
      email, 
      tempPassword, 
      'user',
      phone,
      'Pending',
      note || 'Access request from landing page'
    );

    authLogger.info('Access request registered', {
      userId: user.id,
      email: user.email,
      phone: user.phone,
    });

    return c.json({
      success: true,
      message: 'Access request submitted successfully. Administrator will review and contact you.',
      data: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        status: user.status,
      },
    });
  } catch (error: any) {
    authLogger.error('Access registration failed', { error: error.message });
    return c.json(
      {
        success: false,
        error: error.message || 'Failed to submit access request',
      },
      500
    );
  }
});

/**
 * POST /auth/regenerate-api-key
 * Regenerate API key (requires JWT)
 */
authController.post('/regenerate-api-key', async (c) => {
  try {
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

    const newApiKey = await UserService.regenerateApiKey(user.id);

    authLogger.info('API key regenerated', { userId: user.id });

    return c.json({
      success: true,
      data: {
        apiKey: newApiKey,
      },
    });
  } catch (error: any) {
    authLogger.error('Failed to regenerate API key', {
      error: error.message,
    });
    return c.json(
      {
        success: false,
        error: error.message,
      },
      500
    );
  }
});

export function createAuthController() {
  return authController;
}
