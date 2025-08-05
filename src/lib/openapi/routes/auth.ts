import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { Env } from '../../../index';
import {
  LoginRequestSchema,
  RegisterRequestSchema,
  PasswordResetRequestSchema,
  PasswordResetConfirmSchema,
  ChangePasswordSchema,
  LoginResponseSchema,
  RegisterResponseSchema,
  UserProfileResponseSchema,
  PasswordResetResponseSchema,
  TokenRefreshResponseSchema,
  LogoutResponseSchema,
  AuthErrorResponseSchema
} from '../schemas/auth';

/**
 * Authentication Route Documentation
 * 
 * OpenAPI documentation for authentication and authorization endpoints.
 * Includes login, registration, password management, and session handling.
 */

export function authRoutes(app: OpenAPIHono<{ Bindings: Env }>) {
  
  // POST /auth/login
  const loginRoute = createRoute({
    method: 'post',
    path: '/api/v1/auth/login',
    tags: ['Authentication'],
    summary: 'User login',
    description: 'Authenticate user with email and password. Returns JWT tokens for subsequent API calls.',
    request: {
      body: {
        content: {
          'application/json': {
            schema: LoginRequestSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Login successful',
        content: {
          'application/json': {
            schema: LoginResponseSchema
          }
        }
      },
      400: {
        description: 'Invalid request data',
        content: {
          'application/json': {
            schema: AuthErrorResponseSchema
          }
        }
      },
      401: {
        description: 'Invalid credentials',
        content: {
          'application/json': {
            schema: AuthErrorResponseSchema
          }
        }
      },
      429: {
        description: 'Too many login attempts',
        content: {
          'application/json': {
            schema: AuthErrorResponseSchema
          }
        }
      }
    }
  });

  // POST /auth/register
  const registerRoute = createRoute({
    method: 'post',
    path: '/api/v1/auth/register',
    tags: ['Authentication'],
    summary: 'User registration',
    description: 'Create a new user account. Email verification may be required.',
    request: {
      body: {
        content: {
          'application/json': {
            schema: RegisterRequestSchema
          }
        }
      }
    },
    responses: {
      201: {
        description: 'Registration successful',
        content: {
          'application/json': {
            schema: RegisterResponseSchema
          }
        }
      },
      400: {
        description: 'Invalid request data or email already exists',
        content: {
          'application/json': {
            schema: AuthErrorResponseSchema
          }
        }
      },
      429: {
        description: 'Too many registration attempts',
        content: {
          'application/json': {
            schema: AuthErrorResponseSchema
          }
        }
      }
    }
  });

  // GET /auth/me
  const meRoute = createRoute({
    method: 'get',
    path: '/api/v1/auth/me',
    tags: ['Authentication'],
    summary: 'Get current user profile',
    description: 'Retrieve the profile of the currently authenticated user.',
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'User profile retrieved successfully',
        content: {
          'application/json': {
            schema: UserProfileResponseSchema
          }
        }
      },
      401: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: AuthErrorResponseSchema
          }
        }
      }
    }
  });

  // POST /auth/logout
  const logoutRoute = createRoute({
    method: 'post',
    path: '/api/v1/auth/logout',
    tags: ['Authentication'],
    summary: 'User logout',
    description: 'Invalidate the current session and JWT tokens.',
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'Logout successful',
        content: {
          'application/json': {
            schema: LogoutResponseSchema
          }
        }
      },
      401: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: AuthErrorResponseSchema
          }
        }
      }
    }
  });

  // POST /auth/password/reset
  const passwordResetRoute = createRoute({
    method: 'post',
    path: '/api/v1/auth/password/reset',
    tags: ['Authentication'],
    summary: 'Request password reset',
    description: 'Send password reset email to the user.',
    request: {
      body: {
        content: {
          'application/json': {
            schema: PasswordResetRequestSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Password reset email sent',
        content: {
          'application/json': {
            schema: PasswordResetResponseSchema
          }
        }
      },
      400: {
        description: 'Invalid email address',
        content: {
          'application/json': {
            schema: AuthErrorResponseSchema
          }
        }
      },
      429: {
        description: 'Too many reset attempts',
        content: {
          'application/json': {
            schema: AuthErrorResponseSchema
          }
        }
      }
    }
  });

  // POST /auth/password/confirm
  const passwordResetConfirmRoute = createRoute({
    method: 'post',
    path: '/api/v1/auth/password/confirm',
    tags: ['Authentication'],
    summary: 'Confirm password reset',
    description: 'Reset password using the token from email.',
    request: {
      body: {
        content: {
          'application/json': {
            schema: PasswordResetConfirmSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Password reset successful',
        content: {
          'application/json': {
            schema: PasswordResetResponseSchema
          }
        }
      },
      400: {
        description: 'Invalid or expired reset token',
        content: {
          'application/json': {
            schema: AuthErrorResponseSchema
          }
        }
      }
    }
  });

  // POST /auth/password/change
  const changePasswordRoute = createRoute({
    method: 'post',
    path: '/api/v1/auth/password/change',
    tags: ['Authentication'],
    summary: 'Change password',
    description: 'Change password for authenticated user.',
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          'application/json': {
            schema: ChangePasswordSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Password changed successfully',
        content: {
          'application/json': {
            schema: PasswordResetResponseSchema
          }
        }
      },
      400: {
        description: 'Invalid current password or weak new password',
        content: {
          'application/json': {
            schema: AuthErrorResponseSchema
          }
        }
      },
      401: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: AuthErrorResponseSchema
          }
        }
      }
    }
  });

  // POST /auth/token/refresh
  const tokenRefreshRoute = createRoute({
    method: 'post',
    path: '/api/v1/auth/token/refresh',
    tags: ['Authentication'],
    summary: 'Refresh access token',
    description: 'Get a new access token using refresh token.',
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'Token refreshed successfully',
        content: {
          'application/json': {
            schema: TokenRefreshResponseSchema
          }
        }
      },
      401: {
        description: 'Invalid or expired refresh token',
        content: {
          'application/json': {
            schema: AuthErrorResponseSchema
          }
        }
      }
    }
  });

  // Register routes (these are just for documentation)
  app.openapi(loginRoute, (c) => c.json({ message: 'Login endpoint' }));
  app.openapi(registerRoute, (c) => c.json({ message: 'Register endpoint' }));
  app.openapi(meRoute, (c) => c.json({ message: 'Me endpoint' }));
  app.openapi(logoutRoute, (c) => c.json({ message: 'Logout endpoint' }));
  app.openapi(passwordResetRoute, (c) => c.json({ message: 'Password reset endpoint' }));
  app.openapi(passwordResetConfirmRoute, (c) => c.json({ message: 'Password reset confirm endpoint' }));
  app.openapi(changePasswordRoute, (c) => c.json({ message: 'Change password endpoint' }));
  app.openapi(tokenRefreshRoute, (c) => c.json({ message: 'Token refresh endpoint' }));
}