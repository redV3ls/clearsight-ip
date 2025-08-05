import { z } from 'zod';
import { SuccessResponseSchema, ErrorResponseSchema } from './common';

/**
 * Authentication OpenAPI Schemas
 * 
 * Schemas for authentication and authorization endpoints.
 * Includes login, registration, token management, and user session schemas.
 */

// Login request schema
export const LoginRequestSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128)
});

// Registration request schema
export const RegisterRequestSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  confirmPassword: z.string().min(8).max(128),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Password reset request schema
export const PasswordResetRequestSchema = z.object({
  email: z.string().email().max(255)
});

// Password reset confirm schema
export const PasswordResetConfirmSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).max(128),
  confirmPassword: z.string().min(8).max(128)
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Change password schema
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(128),
  newPassword: z.string().min(8).max(128),
  confirmPassword: z.string().min(8).max(128)
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// User profile schema
export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lastLoginAt: z.string().datetime().nullable(),
  isEmailVerified: z.boolean(),
  role: z.enum(['user', 'admin', 'premium']),
  preferences: z.object({
    language: z.string().length(2).default('en'),
    timezone: z.string().default('UTC'),
    notifications: z.object({
      email: z.boolean().default(true),
      analysis: z.boolean().default(true),
      trends: z.boolean().default(false)
    })
  }).optional()
});

// JWT token schema
export const TokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  tokenType: z.literal('Bearer'),
  expiresIn: z.number().int().positive(),
  scope: z.string().optional()
});

// Login response schema
export const LoginResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    user: UserProfileSchema,
    token: TokenSchema
  })
});

// Registration response schema
export const RegisterResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    user: UserProfileSchema,
    token: TokenSchema,
    message: z.string()
  })
});

// User profile response schema
export const UserProfileResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    user: UserProfileSchema
  })
});

// Password reset response schema
export const PasswordResetResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    message: z.string(),
    resetToken: z.string().optional()
  })
});

// Token refresh response schema
export const TokenRefreshResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    token: TokenSchema
  })
});

// Logout response schema
export const LogoutResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    message: z.string()
  })
});

// Authentication error responses
export const AuthErrorResponseSchema = ErrorResponseSchema.extend({
  error: z.object({
    code: z.enum([
      'INVALID_CREDENTIALS',
      'EMAIL_ALREADY_EXISTS',
      'EMAIL_NOT_VERIFIED',
      'INVALID_TOKEN',
      'TOKEN_EXPIRED',
      'PASSWORD_TOO_WEAK',
      'ACCOUNT_LOCKED',
      'INVALID_RESET_TOKEN'
    ]),
    message: z.string(),
    details: z.any().optional()
  })
});

// Security headers schema
export const SecurityHeadersSchema = z.object({
  'Authorization': z.string().regex(/^Bearer\s+[\w-]+\.[\w-]+\.[\w-]+$/).optional(),
  'X-API-Key': z.string().min(32).max(64).optional()
});

// Session schema
export const SessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  deviceInfo: z.object({
    userAgent: z.string(),
    ip: z.string(),
    location: z.string().optional()
  }),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  isActive: z.boolean()
});