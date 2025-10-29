import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { UserService } from '../db/services/user.service';
import { JwtService } from '../utils/jwt.service';
import { authLogger } from '../utils/logger';
const authController = new Hono();
// Register schema
const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['admin', 'user', 'readonly']).optional(),
});
// Login schema
const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string(),
});
/**
 * POST /auth/register
 * Register a new user
 */
authController.post('/register', zValidator('json', registerSchema), async (c) => {
    try {
        const { email, password, role } = c.req.valid('json');
        // Check if user already exists
        const existingUser = await UserService.findByEmail(email);
        if (existingUser) {
            return c.json({
                success: false,
                error: 'User already exists',
            }, 400);
        }
        // Create user
        const user = await UserService.createUser(email, password, role || 'user');
        // Generate JWT token
        const token = JwtService.sign({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        authLogger.info('User registered successfully', {
            userId: user.id,
            email: user.email,
        });
        return c.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    apiKey: user.apiKey,
                    createdAt: user.createdAt,
                },
                token,
            },
        });
    }
    catch (error) {
        authLogger.error('Registration failed', { error: error.message });
        return c.json({
            success: false,
            error: error.message || 'Failed to register user',
        }, 500);
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
            return c.json({
                success: false,
                error: 'Invalid email or password',
            }, 401);
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
                    role: user.role,
                    apiKey: user.apiKey,
                    createdAt: user.createdAt,
                },
                token,
            },
        });
    }
    catch (error) {
        authLogger.error('Login failed', { error: error.message });
        return c.json({
            success: false,
            error: error.message || 'Failed to login',
        }, 500);
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
            return c.json({
                success: false,
                error: 'Not authenticated',
            }, 401);
        }
        return c.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                role: user.role,
                apiKey: user.apiKey,
                createdAt: user.createdAt,
            },
        });
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message,
        }, 500);
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
            return c.json({
                success: false,
                error: 'Not authenticated',
            }, 401);
        }
        const newApiKey = await UserService.regenerateApiKey(user.id);
        authLogger.info('API key regenerated', { userId: user.id });
        return c.json({
            success: true,
            data: {
                apiKey: newApiKey,
            },
        });
    }
    catch (error) {
        authLogger.error('Failed to regenerate API key', {
            error: error.message,
        });
        return c.json({
            success: false,
            error: error.message,
        }, 500);
    }
});
export function createAuthController() {
    return authController;
}
