import { Hono } from 'hono';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { Env } from '../index';
import { validateBody, validateHeaders } from '../middleware/inputValidation';
import { UserAuthService } from '../services/userAuthService';
import { generateJWT, verifyJWT } from '../middleware/auth';
import { DatabaseManager } from '../config/database';
import { users } from '../db/schema';
import { AppError } from '../middleware/errorHandler';
import { authRateLimiter } from '../middleware/rateLimiter';

const auth = new Hono<{ Bindings: Env }>();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email format').max(255),
  password: z.string().min(1, 'Password is required').max(128)
});

const registerSchema = z.object({
  email: z.string().email('Invalid email format').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  name: z.string().min(1, 'Name is required').max(255),
  organization: z.string().max(255).optional()
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required').max(128),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(128)
});

const requestResetSchema = z.object({
  email: z.string().email('Invalid email format').max(255)
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required').max(128),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(128)
});

// Apply specialized authentication rate limiting
auth.use('*', async (c, next) => {
  // Temporarily disable rate limiting for debugging
  if (c.env.NODE_ENV === 'development') {
    return next();
  }
  const { authenticationRateLimiter } = await import('../services/productionRateLimiter');
  return authenticationRateLimiter()(c, next);
});

/**
 * POST /auth/login
 * Authenticate user with email and password
 */
auth.post('/login', 
  validateBody(loginSchema, { sanitize: true }),
  async (c) => {
    try {
      const credentials = c.get('validatedBody');
      const db = DatabaseManager.initialize(c.env.DB);
      const authService = new UserAuthService(db);

      const authResult = await authService.authenticateUser(credentials);

      // Generate JWT token with RS256
      const token = await generateJWT({
        id: authResult.user.id,
        email: authResult.user.email,
        role: authResult.user.role
      }, c.env);

      // Set secure HTTP-only cookie
      const cookieOptions = {
        httpOnly: true,
        secure: c.env.NODE_ENV === 'production',
        sameSite: 'Strict' as const,
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      };

      const secureAttr = cookieOptions.secure ? '; Secure' : '';
      c.header('Set-Cookie', `auth_token=${token}; HttpOnly${secureAttr}; SameSite=${cookieOptions.sameSite}; Max-Age=${cookieOptions.maxAge}; Path=${cookieOptions.path}`);

      return c.json({
        success: true,
        data: {
          user: authResult.user,
          passwordMigrated: authResult.passwordMigrated
        }
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Login failed', 500, 'LOGIN_ERROR');
    }
  }
);

/**
 * POST /auth/register
 * Register a new user account
 */
auth.post('/register',
  validateBody(registerSchema, { sanitize: true }),
  async (c) => {
    try {
      const userData = c.get('validatedBody');
      const db = DatabaseManager.initialize(c.env.DB);
      const authService = new UserAuthService(db);

      const authResult = await authService.registerUser(userData);

      // Generate JWT token with RS256
      const token = await generateJWT({
        id: authResult.user.id,
        email: authResult.user.email,
        role: authResult.user.role
      }, c.env);

      // Set secure HTTP-only cookie
      const cookieOptions = {
        httpOnly: true,
        secure: c.env.NODE_ENV === 'production',
        sameSite: 'Strict' as const,
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      };

      const secureAttr = cookieOptions.secure ? '; Secure' : '';
      c.header('Set-Cookie', `auth_token=${token}; HttpOnly${secureAttr}; SameSite=${cookieOptions.sameSite}; Max-Age=${cookieOptions.maxAge}; Path=${cookieOptions.path}`);

      return c.json({
        success: true,
        data: {
          user: authResult.user
        }
      }, 201);
    } catch (error) {
      console.error('Registration error details:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('Error message:', error instanceof Error ? error.message : error);
      
      if (error instanceof AppError) {
        // Return the specific error message for debugging
        return c.json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details
          }
        }, error.statusCode);
      }
      
      // Return generic error for unknown errors
      return c.json({
        success: false,
        error: {
          code: 'REGISTRATION_ERROR',
          message: 'Registration failed. Please try again.',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      }, 500);
    }
  }
);

/**
 * POST /auth/change-password
 * Change user password (requires authentication)
 */
auth.post('/change-password',
  validateHeaders(['Authorization']),
  validateBody(changePasswordSchema, { sanitize: true }),
  async (c) => {
    try {
      const user = c.get('user');
      if (!user) {
        throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const { currentPassword, newPassword } = c.get('validatedBody');
      const db = DatabaseManager.initialize(c.env.DB);
      const authService = new UserAuthService(db);

      await authService.changePassword(user.id, currentPassword, newPassword);

      return c.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Password change failed', 500, 'PASSWORD_CHANGE_ERROR');
    }
  }
);

/**
 * POST /auth/logout
 * Logout user (placeholder for token invalidation)
 */
auth.post('/logout',
  async (c) => {
    // Clear the auth cookie
    c.header('Set-Cookie', `auth_token=; HttpOnly; Secure=${c.env.NODE_ENV === 'production'}; SameSite=Strict; Max-Age=0; Path=/`);
    
    return c.json({
      success: true,
      message: 'Logged out successfully'
    });
  }
);

/**
 * POST /auth/request-reset
 * Request password reset token
 */
auth.post('/request-reset',
  validateBody(requestResetSchema, { sanitize: true }),
  async (c) => {
    try {
      const { email } = c.get('validatedBody');
      const db = DatabaseManager.initialize(c.env.DB);
      const authService = new UserAuthService(db);

      await authService.generatePasswordResetToken(email);

      // Always return success to prevent email enumeration
      return c.json({
        success: true,
        message: 'If this email exists, a reset link has been sent'
      });
    } catch (error) {
      // Always return success for security (don't reveal if email exists)
      return c.json({
        success: true,
        message: 'If this email exists, a reset link has been sent'
      });
    }
  }
);

/**
 * POST /auth/reset-password
 * Reset password using token
 */
auth.post('/reset-password',
  validateBody(resetPasswordSchema, { sanitize: true }),
  async (c) => {
    try {
      const { token, newPassword } = c.get('validatedBody');
      const db = DatabaseManager.initialize(c.env.DB);
      const authService = new UserAuthService(db);

      await authService.resetPassword(token, newPassword);

      return c.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Password reset failed', 500, 'PASSWORD_RESET_ERROR');
    }
  }
);

/**
 * GET /auth/me
 * Get current user information
 */
auth.get('/me', async (c) => {
  try {
    console.log('Auth /me endpoint called');
    
    // Check for auth token in cookies
    const cookieHeader = c.req.header('Cookie');
    let authToken = null;
    
    console.log('Cookie header:', cookieHeader ? 'present' : 'missing');
    
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').map(c => c.trim());
      const authCookie = cookies.find(cookie => cookie.startsWith('auth_token='));
      if (authCookie) {
        authToken = authCookie.split('=')[1];
        console.log('Auth token found in cookies');
      }
    }
    
    // Also check Authorization header as fallback
    const authHeader = c.req.header('Authorization');
    if (!authToken && authHeader?.startsWith('Bearer ')) {
      authToken = authHeader.substring(7);
      console.log('Auth token found in Authorization header');
    }
    
    if (!authToken) {
      console.log('No auth token found');
      throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
    }
    
    console.log('Attempting JWT verification');
    // Verify JWT token with RS256
    const payload = await verifyJWT(authToken, c.env);
    console.log('JWT verification successful, payload ID:', payload.id);
    
    // Check for both id and userId for compatibility
    const userId = payload.id || payload.userId;
    if (!payload || !userId) {
      console.log('Invalid payload or missing user ID');
      throw new AppError('Invalid authentication token', 401, 'INVALID_TOKEN');
    }
    
    console.log('Looking up user in database, ID:', userId);
    // Get user from database using drizzle
    const db = DatabaseManager.initialize(c.env.DB);
    
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    console.log('Database query result:', userResult.length > 0 ? 'user found' : 'user not found');
    
    if (userResult.length === 0) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    
    const user = userResult[0];
    console.log('Returning user data for:', user.email);
    
    return c.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          organization: user.organization,
          created_at: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Auth /me endpoint error:', error);
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error instanceof AppError) {
      console.log('Throwing AppError:', error.code, error.message);
      throw error;
    }
    
    console.log('Throwing generic authentication failed error');
    throw new AppError('Authentication failed', 500, 'AUTHENTICATION_FAILED');
  }
});

export default auth;