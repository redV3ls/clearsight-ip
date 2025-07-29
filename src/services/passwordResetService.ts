import { eq, and, lt } from 'drizzle-orm';
import { Database } from '../config/database';
import { users, passwordResetTokens } from '../db/schema';
import { passwordService } from './passwordService';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

export interface PasswordResetService {
  generateResetToken(email: string): Promise<string>;
  validateResetToken(token: string): Promise<boolean>;
  resetPassword(token: string, newPassword: string): Promise<void>;
  cleanupExpiredTokens(): Promise<void>;
}

export class SecurePasswordResetService implements PasswordResetService {
  private readonly TOKEN_EXPIRY_HOURS = 1; // 1 hour expiry
  private readonly MAX_TOKENS_PER_USER = 3; // Maximum active tokens per user

  constructor(private db: Database) {}

  /**
   * Generate a secure password reset token for a user
   */
  async generateResetToken(email: string): Promise<string> {
    try {
      // Find user by email
      const userResult = await this.db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (userResult.length === 0) {
        // Don't reveal if email exists or not for security
        logger.warn(`Password reset requested for non-existent email: ${email}`);
        throw new AppError('If this email exists, a reset link has been sent', 200, 'RESET_REQUESTED');
      }

      const user = userResult[0];

      // Check for existing active tokens and clean up if too many
      await this.cleanupUserTokens(user.id);

      // Generate secure token
      const token = this.generateSecureToken();
      const tokenHash = await this.hashToken(token);
      const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();

      // Store token in database
      await this.db.insert(passwordResetTokens).values({
        id: crypto.randomUUID(),
        userId: user.id,
        tokenHash,
        expiresAt,
        createdAt: new Date().toISOString()
      });

      logger.info(`Password reset token generated for user: ${user.id}`);
      
      // In production, this would send an email
      await this.sendResetEmail(email, token);

      return token;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      logger.error('Error generating password reset token:', error);
      throw new AppError('Failed to generate reset token', 500, 'TOKEN_GENERATION_FAILED');
    }
  }

  /**
   * Validate a password reset token
   */
  async validateResetToken(token: string): Promise<boolean> {
    try {
      const tokenHash = await this.hashToken(token);
      const now = new Date().toISOString();

      const tokenResult = await this.db
        .select()
        .from(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.tokenHash, tokenHash),
            eq(passwordResetTokens.usedAt, null as any), // Not used
            lt(now, passwordResetTokens.expiresAt) // Not expired
          )
        )
        .limit(1);

      return tokenResult.length > 0;
    } catch (error) {
      logger.error('Error validating reset token:', error);
      return false;
    }
  }

  /**
   * Reset password using a valid token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Validate password strength
      const passwordValidation = passwordService.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        throw new AppError(
          `Password does not meet requirements: ${passwordValidation.errors.join(', ')}`,
          400,
          'WEAK_PASSWORD'
        );
      }

      const tokenHash = await this.hashToken(token);
      const now = new Date().toISOString();

      // Find valid token
      const tokenResult = await this.db
        .select({
          id: passwordResetTokens.id,
          userId: passwordResetTokens.userId,
          expiresAt: passwordResetTokens.expiresAt,
          usedAt: passwordResetTokens.usedAt
        })
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.tokenHash, tokenHash))
        .limit(1);

      if (tokenResult.length === 0) {
        throw new AppError('Invalid reset token', 400, 'INVALID_TOKEN');
      }

      const tokenRecord = tokenResult[0];

      // Check if token is already used
      if (tokenRecord.usedAt) {
        throw new AppError('Reset token has already been used', 400, 'TOKEN_ALREADY_USED');
      }

      // Check if token is expired
      if (now > tokenRecord.expiresAt) {
        throw new AppError('Reset token has expired', 400, 'TOKEN_EXPIRED');
      }

      // Hash new password
      const newPasswordHash = await passwordService.hashPassword(newPassword);

      // Update password and mark token as used
      await this.db.transaction(async (tx) => {
        // Update user password
        await tx
          .update(users)
          .set({
            passwordHash: newPasswordHash,
            updatedAt: now
          })
          .where(eq(users.id, tokenRecord.userId));

        // Mark token as used
        await tx
          .update(passwordResetTokens)
          .set({ usedAt: now })
          .where(eq(passwordResetTokens.id, tokenRecord.id));
      });

      logger.info(`Password reset completed for user: ${tokenRecord.userId}`);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      logger.error('Error resetting password:', error);
      throw new AppError('Password reset failed', 500, 'PASSWORD_RESET_FAILED');
    }
  }

  /**
   * Clean up expired tokens and limit active tokens per user
   */
  async cleanupExpiredTokens(): Promise<void> {
    try {
      const now = new Date().toISOString();

      // Delete expired tokens
      const expiredResult = await this.db
        .delete(passwordResetTokens)
        .where(lt(passwordResetTokens.expiresAt, now));

      logger.info(`Cleaned up expired password reset tokens`);
    } catch (error) {
      logger.error('Error cleaning up expired tokens:', error);
    }
  }

  /**
   * Clean up excess tokens for a specific user
   */
  private async cleanupUserTokens(userId: string): Promise<void> {
    try {
      const now = new Date().toISOString();

      // Get active tokens for user
      const activeTokens = await this.db
        .select()
        .from(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.userId, userId),
            eq(passwordResetTokens.usedAt, null as any),
            lt(now, passwordResetTokens.expiresAt)
          )
        );

      // If too many active tokens, delete the oldest ones
      if (activeTokens.length >= this.MAX_TOKENS_PER_USER) {
        const tokensToDelete = activeTokens
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
          .slice(0, activeTokens.length - this.MAX_TOKENS_PER_USER + 1);

        for (const token of tokensToDelete) {
          await this.db
            .delete(passwordResetTokens)
            .where(eq(passwordResetTokens.id, token.id));
        }

        logger.info(`Cleaned up ${tokensToDelete.length} excess tokens for user: ${userId}`);
      }
    } catch (error) {
      logger.error('Error cleaning up user tokens:', error);
    }
  }

  /**
   * Generate a cryptographically secure token
   */
  private generateSecureToken(): string {
    // Generate 32 bytes of random data and encode as hex
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Hash a token for secure storage
   */
  private async hashToken(token: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Send password reset email (simulated for now)
   */
  private async sendResetEmail(email: string, token: string): Promise<void> {
    // In production, this would integrate with an email service
    // For now, we'll just log the reset link
    const resetLink = `https://your-domain.com/reset-password?token=${token}`;
    
    logger.info(`Password reset email would be sent to ${email}`);
    logger.info(`Reset link: ${resetLink}`);
    
    // TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
    // await emailService.sendPasswordResetEmail(email, resetLink);
  }
}