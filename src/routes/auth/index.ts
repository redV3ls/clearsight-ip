/**
 * Authentication Routes
 * 
 * Standardized authentication endpoints using the new route builder system.
 * Provides consistent validation, error handling, and response formatting.
 */

import { Context } from 'hono';
import { createRouteBuilder } from '../common/routeBuilder';
import { CommonSchemas } from '../../middleware/common/validation';
import { createResponse } from '../../middleware/common/responseBuilder';
import { UserAuthService } from '../../services/userAuthService';
import { generateJWT } from '../../middleware/auth';
import { DatabaseManager } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';

/**
 * Authentication validation schemas
 */
const AuthSchemas = {
  login: {
    type: 'object' as const,
    required: true,
    properties: {
      email: CommonSchemas.email,
      password: {
        type: 'string' as const,
        required: true,
        minLength: 1,
        maxLength: 128
      }
    }
  },

  register: {
    type: 'object' as const,
    required: true,
    properties: {
      email: CommonSchemas.email,
      password: CommonSchemas.password,
      name: {
        type: 'string' as const,
        required: false,  // Make name optional
        minLength: 1,
        maxLength: 255
      },
      organization: {
        type: 'string' as const,
        required: false,
        maxLength: 255
      }
    }
  },

  changePassword: {
    type: 'object' as const,
    required: true,
    properties: {
      currentPassword: {
        type: 'string' as const,
        required: true,
        minLength: 1,
        maxLength: 128
      },
      newPassword: CommonSchemas.password
    }
  },

  requestReset: {
    type: 'object' as const,
    required: true,
    properties: {
      email: CommonSchemas.email
    }
  },

  resetPassword: {
    type: 'object' as const,
    required: true,
    properties: {
      token: {
        type: 'string' as const,
        required: true,
        minLength: 1,
        maxLength: 128
      },
      newPassword: CommonSchemas.password
    }
  }
};

/**
 * Authentication route handlers
 */
class AuthHandlers {
  /**
   * POST /auth/login
   * Authenticate user with email and password
   */
  static async login(c: Context): Promise<Response> {
    const response = createResponse(c);
    
    try {
      const credentials = c.get('validatedBody');
      const db = DatabaseManager.initialize(c.env.DB);
      const authService = new UserAuthService(db);

      logger.info('User login attempt', {
        requestId: c.get('requestId'),
        email: credentials.email
      });

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
      c.header('Set-Cookie', 
        `auth_token=${token}; HttpOnly${secureAttr}; SameSite=${cookieOptions.sameSite}; Max-Age=${cookieOptions.maxAge}; Path=${cookieOptions.path}`
      );

      logger.info('User login successful', {
        requestId: c.get('requestId'),
        userId: authResult.user.id,
        email: authResult.user.email
      });

      return response.success({
        user: authResult.user,
        passwordMigrated: authResult.passwordMigrated
      });

    } catch (error) {
      logger.error('Login failed', {
        requestId: c.get('requestId'),
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      if (error instanceof AppError) {
        return response.error(error.code, error.message, error.statusCode, error.details);
      }
      
      return response.error('LOGIN_ERROR', 'Login failed', 500);
    }
  }

  /**
   * POST /auth/register
   * Register a new user account
   */
  static async register(c: Context): Promise<Response> {
    const response = createResponse(c);
    
    try {
      const userData = c.get('validatedBody');
      // If name is not provided, derive it from email
      if (!userData.name) {
        userData.name = userData.email.split('@')[0];
      }
      const db = DatabaseManager.initialize(c.env.DB);
      const authService = new UserAuthService(db);

      logger.info('User registration attempt', {
        requestId: c.get('requestId'),
        email: userData.email
      });

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
      c.header('Set-Cookie', 
        `auth_token=${token}; HttpOnly${secureAttr}; SameSite=${cookieOptions.sameSite}; Max-Age=${cookieOptions.maxAge}; Path=${cookieOptions.path}`
      );

      logger.info('User registration successful', {
        requestId: c.get('requestId'),
        userId: authResult.user.id,
        email: authResult.user.email
      });

      return response.success({
        user: authResult.user
      }, 201);

    } catch (error) {
      logger.error('Registration failed', {
        requestId: c.get('requestId'),
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      if (error instanceof AppError) {
        return response.error(error.code, error.message, error.statusCode, error.details);
      }
      
      return response.error('REGISTRATION_ERROR', 'Registration failed', 500);
    }
  }

  /**
   * POST /auth/logout
   * Logout user and clear authentication cookie
   */
  static async logout(c: Context): Promise<Response> {
    const response = createResponse(c);
    
    try {
      // Clear the authentication cookie
      c.header('Set-Cookie', 'auth_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/');

      logger.info('User logout', {
        requestId: c.get('requestId'),
        userId: c.get('user')?.id
      });

      return response.success({ message: 'Logged out successfully' });

    } catch (error) {
      logger.error('Logout failed', {
        requestId: c.get('requestId'),
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return response.error('LOGOUT_ERROR', 'Logout failed', 500);
    }
  }

  /**
   * POST /auth/change-password
   * Change user password (requires authentication)
   */
  static async changePassword(c: Context): Promise<Response> {
    const response = createResponse(c);
    
    try {
      const { currentPassword, newPassword } = c.get('validatedBody');
      const user = c.get('user');
      
      if (!user) {
        return response.authenticationError();
      }

      const db = DatabaseManager.initialize(c.env.DB);
      const authService = new UserAuthService(db);

      logger.info('Password change attempt', {
        requestId: c.get('requestId'),
        userId: user.id
      });

      await authService.changePassword(user.id, currentPassword, newPassword);

      logger.info('Password change successful', {
        requestId: c.get('requestId'),
        userId: user.id
      });

      return response.success({ message: 'Password changed successfully' });

    } catch (error) {
      logger.error('Password change failed', {
        requestId: c.get('requestId'),
        userId: c.get('user')?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      if (error instanceof AppError) {
        return response.error(error.code, error.message, error.statusCode, error.details);
      }
      
      return response.error('PASSWORD_CHANGE_ERROR', 'Password change failed', 500);
    }
  }

  /**
   * POST /auth/request-reset
   * Request password reset email
   */
  static async requestReset(c: Context): Promise<Response> {
    const response = createResponse(c);
    
    try {
      const { email } = c.get('validatedBody');
      const db = DatabaseManager.initialize(c.env.DB);
      const authService = new UserAuthService(db);

      logger.info('Password reset request', {
        requestId: c.get('requestId'),
        email
      });

      await authService.requestPasswordReset(email);

      // Always return success to prevent email enumeration
      return response.success({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });

    } catch (error) {
      logger.error('Password reset request failed', {
        requestId: c.get('requestId'),
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Always return success to prevent email enumeration
      return response.success({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }
  }

  /**
   * POST /auth/reset-password
   * Reset password using token
   */
  static async resetPassword(c: Context): Promise<Response> {
    const response = createResponse(c);
    
    try {
      const { token, newPassword } = c.get('validatedBody');
      const db = DatabaseManager.initialize(c.env.DB);
      const authService = new UserAuthService(db);

      logger.info('Password reset attempt', {
        requestId: c.get('requestId'),
        token: token.substring(0, 8) + '...' // Log partial token for debugging
      });

      await authService.resetPassword(token, newPassword);

      logger.info('Password reset successful', {
        requestId: c.get('requestId')
      });

      return response.success({ message: 'Password reset successfully' });

    } catch (error) {
      logger.error('Password reset failed', {
        requestId: c.get('requestId'),
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      if (error instanceof AppError) {
        return response.error(error.code, error.message, error.statusCode, error.details);
      }
      
      return response.error('PASSWORD_RESET_ERROR', 'Password reset failed', 500);
    }
  }

  /**
   * GET /auth/me
   * Get current user information (requires authentication)
   */
  static async getCurrentUser(c: Context): Promise<Response> {
    const response = createResponse(c);
    const debug = c.req.query('debug') === '1' || c.req.header('X-Debug') === '1' || (c.env?.LOG_LEVEL === 'debug');
    
    try {
      logger.info('auth/me: start', { requestId: c.get('requestId') });
      // Verify token here to avoid dependency on upstream middleware state
      const cookieHeader = c.req.header('Cookie');
      let authToken: string | null = null;
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').map((x) => x.trim());
        const entry = cookies.find((x) => x.startsWith('auth_token='));
        if (entry) authToken = entry.split('=')[1];
      }
      logger.info('auth/me: cookie parsed', { hasCookie: !!cookieHeader, hasTokenFromCookie: !!authToken });
      const authHeader = c.req.header('Authorization');
      if (!authToken && authHeader?.startsWith('Bearer ')) {
        authToken = authHeader.substring(7);
      }

      if (!authToken) {
        logger.warn('auth/me: no token found');
        // Return 401 with proper error structure for unauthenticated requests
        return c.json({
          success: false,
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication required'
          }
        }, 401);
      }

      const { verifyJWT } = await import('../../middleware/auth');
      let payload: any;
      try {
        payload = await verifyJWT(authToken, c.env);
      } catch (verifyError) {
        logger.warn('auth/me: JWT verification failed', { 
          error: verifyError instanceof Error ? verifyError.message : 'Unknown error' 
        });
        // Return 401 for invalid tokens
        return c.json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired token'
          }
        }, 401);
      }
      
      logger.info('auth/me: jwt verified');
      const userId = payload.id || payload.userId;
      const email = payload.email;
      const name = payload.name || email?.split('@')[0] || 'User';
      const role = payload.role || 'user';

      if (!userId && !email) {
        return c.json({
          success: false,
          error: {
            code: 'INVALID_TOKEN_PAYLOAD',
            message: 'Invalid token payload'
          }
        }, 401);
      }

      // Try to enrich from DB, but do not fail if DB access errors
      let userRecord: any = null;
      try {
        if (userId) {
          userRecord = await c.env.DB
            .prepare('SELECT id, email, name, organization, created_at FROM users WHERE id = ?')
            .bind(userId)
            .first();
          logger.info('auth/me: db lookup completed', { found: !!userRecord });
        }
      } catch (e) {
        // Log but continue with JWT data
        logger.warn('auth/me: DB lookup failed, returning JWT payload only', { error: e instanceof Error ? e.message : String(e) });
      }

      const user = userRecord || {
        id: userId || 'unknown',
        email: email || 'unknown@unknown',
        name,
        organization: null,
        created_at: new Date().toISOString(),
        role,
      };

      return response.success({ user });

    } catch (error) {
      logger.error('Get current user failed', {
        requestId: c.get('requestId'),
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      return response.error(
        'USER_INFO_ERROR',
        debug && error instanceof Error ? error.message : 'Failed to get user information',
        500,
        debug ? { stack: error instanceof Error ? error.stack : undefined } : undefined
      );
    }
  }
}

/**
 * Create and configure authentication routes
 */
const authRoutes = createRouteBuilder('/auth')
  .post('/login', AuthHandlers.login, {
    validation: { body: AuthSchemas.login },
    description: 'Authenticate user with email and password',
    tags: ['Authentication'],
    rateLimit: { windowMs: 15 * 60 * 1000, maxRequests: 5 } // 5 attempts per 15 minutes
  })
  .post('/register', AuthHandlers.register, {
    validation: { body: AuthSchemas.register },
    description: 'Register a new user account',
    tags: ['Authentication'],
    rateLimit: { windowMs: 60 * 60 * 1000, maxRequests: 3 } // 3 registrations per hour
  })
  .post('/logout', AuthHandlers.logout, {
    description: 'Logout user and clear authentication cookie',
    tags: ['Authentication']
  })
  .post('/change-password', AuthHandlers.changePassword, {
    validation: { body: AuthSchemas.changePassword },
    auth: { required: true },
    description: 'Change user password (requires authentication)',
    tags: ['Authentication']
  })
  .post('/request-reset', AuthHandlers.requestReset, {
    validation: { body: AuthSchemas.requestReset },
    description: 'Request password reset email',
    tags: ['Authentication'],
    rateLimit: { windowMs: 60 * 60 * 1000, maxRequests: 3 } // 3 requests per hour
  })
  .post('/reset-password', AuthHandlers.resetPassword, {
    validation: { body: AuthSchemas.resetPassword },
    description: 'Reset password using token',
    tags: ['Authentication']
  })
  .get('/me', AuthHandlers.getCurrentUser, {
    auth: { required: false }, // Make this endpoint public since we handle auth internally
    description: 'Get current user information (checks authentication status)',
    tags: ['Authentication']
  });

export default authRoutes.getApp();