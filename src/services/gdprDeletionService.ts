import { eq, and, lt } from 'drizzle-orm';
import { Database } from '../config/database';
import { 
  users, 
  userProfiles, 
  userSkills, 
  apiKeys, 
  gapAnalyses, 
  skillGaps, 
  resumeAnalyses, 
  teamAnalyses,
  gdprDeletionRequests,
  passwordResetTokens
} from '../db/schema';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { CacheService, CacheNamespaces } from './cache';

export interface GDPRDeletionService {
  requestDeletion(userId: string, confirmationToken: string): Promise<string>;
  processDeletion(deletionId: string): Promise<void>;
  verifyDeletionToken(token: string): Promise<boolean>;
  scheduleGracePeriodDeletion(userId: string): Promise<void>;
  cancelDeletion(deletionId: string, userId: string): Promise<void>;
}

export class SecureGDPRDeletionService implements GDPRDeletionService {
  private readonly DEFAULT_GRACE_PERIOD_HOURS = 72; // 3 days
  private readonly cache: CacheService;

  constructor(private db: Database, private env: any) {
    this.cache = new CacheService(env.CACHE);
  }

  /**
   * Request data deletion with confirmation token
   */
  async requestDeletion(userId: string, confirmationToken: string): Promise<string> {
    try {
      // Verify the confirmation token
      if (!await this.verifyDeletionToken(confirmationToken)) {
        throw new AppError('Invalid confirmation token', 400, 'INVALID_CONFIRMATION_TOKEN');
      }

      // Check if user exists
      const userResult = await this.db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (userResult.length === 0) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      // Check for existing pending deletion request
      const existingRequest = await this.db
        .select()
        .from(gdprDeletionRequests)
        .where(
          and(
            eq(gdprDeletionRequests.userId, userId),
            eq(gdprDeletionRequests.status, 'pending')
          )
        )
        .limit(1);

      if (existingRequest.length > 0) {
        throw new AppError('Deletion request already pending', 409, 'DELETION_ALREADY_PENDING');
      }

      // Calculate scheduled deletion time (after grace period)
      const scheduledFor = new Date(
        Date.now() + this.DEFAULT_GRACE_PERIOD_HOURS * 60 * 60 * 1000
      ).toISOString();

      // Create deletion request
      const deletionId = crypto.randomUUID();
      await this.db.insert(gdprDeletionRequests).values({
        id: deletionId,
        userId,
        confirmationToken: await this.hashToken(confirmationToken),
        status: 'pending',
        scheduledFor,
        gracePeriodHours: this.DEFAULT_GRACE_PERIOD_HOURS,
        createdAt: new Date().toISOString()
      });

      logger.info(`GDPR deletion requested for user: ${userId}`, {
        deletionId,
        scheduledFor,
        gracePeriodHours: this.DEFAULT_GRACE_PERIOD_HOURS
      });

      // Send confirmation email (simulated)
      await this.sendDeletionConfirmationEmail(userResult[0].email, deletionId, scheduledFor);

      return deletionId;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      logger.error('Error requesting GDPR deletion:', error);
      throw new AppError('Failed to request data deletion', 500, 'DELETION_REQUEST_FAILED');
    }
  }

  /**
   * Process the actual data deletion
   */
  async processDeletion(deletionId: string): Promise<void> {
    try {
      // Get deletion request
      const deletionRequest = await this.db
        .select()
        .from(gdprDeletionRequests)
        .where(eq(gdprDeletionRequests.id, deletionId))
        .limit(1);

      if (deletionRequest.length === 0) {
        throw new AppError('Deletion request not found', 404, 'DELETION_REQUEST_NOT_FOUND');
      }

      const request = deletionRequest[0];

      // Check if already processed
      if (request.status === 'completed') {
        logger.info(`Deletion already completed for request: ${deletionId}`);
        return;
      }

      // Check if grace period has passed
      const now = new Date().toISOString();
      if (now < request.scheduledFor) {
        throw new AppError('Grace period has not expired yet', 400, 'GRACE_PERIOD_ACTIVE');
      }

      // Update status to processing
      await this.db
        .update(gdprDeletionRequests)
        .set({ status: 'processing' })
        .where(eq(gdprDeletionRequests.id, deletionId));

      logger.info(`Starting GDPR deletion process for user: ${request.userId}`);

      // Perform comprehensive data deletion
      await this.performComprehensiveDataDeletion(request.userId);

      // Mark deletion as completed
      await this.db
        .update(gdprDeletionRequests)
        .set({ 
          status: 'completed',
          completedAt: new Date().toISOString()
        })
        .where(eq(gdprDeletionRequests.id, deletionId));

      logger.info(`GDPR deletion completed for user: ${request.userId}`, { deletionId });

      // Send completion confirmation (simulated)
      await this.sendDeletionCompletionEmail(request.userId, deletionId);

    } catch (error) {
      // Mark deletion as failed
      try {
        await this.db
          .update(gdprDeletionRequests)
          .set({ status: 'failed' })
          .where(eq(gdprDeletionRequests.id, deletionId));
      } catch (updateError) {
        logger.error('Failed to update deletion status to failed:', updateError);
      }

      if (error instanceof AppError) {
        throw error;
      }
      
      logger.error('Error processing GDPR deletion:', error);
      throw new AppError('Failed to process data deletion', 500, 'DELETION_PROCESSING_FAILED');
    }
  }

  /**
   * Verify deletion confirmation token
   */
  async verifyDeletionToken(token: string): Promise<boolean> {
    try {
      // For now, we'll use a simple token format: "delete_" + userId + "_" + timestamp
      // In production, this would be a cryptographically secure token
      if (!token.startsWith('delete_')) {
        return false;
      }

      const parts = token.split('_');
      if (parts.length !== 3) {
        return false;
      }

      const timestamp = parseInt(parts[2]);
      const tokenAge = Date.now() - timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      return tokenAge <= maxAge;
    } catch (error) {
      logger.error('Error verifying deletion token:', error);
      return false;
    }
  }

  /**
   * Schedule grace period deletion (called from GDPR route)
   */
  async scheduleGracePeriodDeletion(userId: string): Promise<void> {
    try {
      // Generate confirmation token
      const confirmationToken = `delete_${userId}_${Date.now()}`;
      
      // Create deletion request with grace period
      const deletionId = crypto.randomUUID();
      const scheduledFor = new Date(
        Date.now() + this.DEFAULT_GRACE_PERIOD_HOURS * 60 * 60 * 1000
      ).toISOString();

      await this.db.insert(gdprDeletionRequests).values({
        id: deletionId,
        userId,
        confirmationToken: await this.hashToken(confirmationToken),
        status: 'pending',
        scheduledFor,
        gracePeriodHours: this.DEFAULT_GRACE_PERIOD_HOURS,
        createdAt: new Date().toISOString()
      });

      logger.info(`GDPR deletion scheduled for user: ${userId}`, {
        deletionId,
        scheduledFor
      });

    } catch (error) {
      logger.error('Error scheduling grace period deletion:', error);
      throw new AppError('Failed to schedule deletion', 500, 'DELETION_SCHEDULING_FAILED');
    }
  }

  /**
   * Perform comprehensive data deletion across all tables
   */
  private async performComprehensiveDataDeletion(userId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      logger.info(`Deleting all data for user: ${userId}`);

      // Delete user skills
      await tx.delete(userSkills)
        .where(eq(userSkills.userId, userId));

      // Delete user profiles
      await tx.delete(userProfiles)
        .where(eq(userProfiles.userId, userId));

      // Delete API keys
      await tx.delete(apiKeys)
        .where(eq(apiKeys.userId, userId));

      // Delete skill gaps (via gap analyses)
      const userGapAnalyses = await tx
        .select({ id: gapAnalyses.id })
        .from(gapAnalyses)
        .where(eq(gapAnalyses.userId, userId));

      for (const analysis of userGapAnalyses) {
        await tx.delete(skillGaps)
          .where(eq(skillGaps.analysisId, analysis.id));
      }

      // Delete gap analyses
      await tx.delete(gapAnalyses)
        .where(eq(gapAnalyses.userId, userId));

      // Delete resume analyses
      await tx.delete(resumeAnalyses)
        .where(eq(resumeAnalyses.userId, userId));

      // Delete team analyses
      await tx.delete(teamAnalyses)
        .where(eq(teamAnalyses.userId, userId));

      // Delete password reset tokens
      await tx.delete(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, userId));

      // Finally, delete the user record
      await tx.delete(users)
        .where(eq(users.id, userId));

      logger.info(`Database deletion completed for user: ${userId}`);
    });

    // Clear all cache entries for the user
    await this.clearUserCacheData(userId);

    logger.info(`Cache deletion completed for user: ${userId}`);
  }

  /**
   * Clear all cache entries related to the user
   */
  private async clearUserCacheData(userId: string): Promise<void> {
    try {
      // Clear user profile cache
      await this.cache.delete(`${CacheNamespaces.USER_PROFILES}:${userId}`);

      // Clear user-specific API response caches
      const userCacheKeys = [
        `${CacheNamespaces.API_RESPONSES}:gap_analysis:${userId}`,
        `${CacheNamespaces.API_RESPONSES}:team_analysis:${userId}`,
        `${CacheNamespaces.API_RESPONSES}:resume_analysis:${userId}`,
        `${CacheNamespaces.USER_PROFILES}:skills:${userId}`,
        `${CacheNamespaces.USER_PROFILES}:profile:${userId}`
      ];

      for (const key of userCacheKeys) {
        await this.cache.delete(key);
      }

      // Clear any rate limiting data for the user
      await this.cache.delete(`rate_limit:user:${userId}`);
      await this.cache.delete(`auth_attempts:${userId}`);

      logger.info(`Cleared cache data for user: ${userId}`);
    } catch (error) {
      logger.error('Error clearing user cache data:', error);
      // Don't throw error as cache clearing is not critical for GDPR compliance
    }
  }

  /**
   * Cancel a pending deletion request during grace period
   */
  async cancelDeletion(deletionId: string, userId: string): Promise<void> {
    try {
      // Get deletion request
      const deletionRequest = await this.db
        .select()
        .from(gdprDeletionRequests)
        .where(
          and(
            eq(gdprDeletionRequests.id, deletionId),
            eq(gdprDeletionRequests.userId, userId)
          )
        )
        .limit(1);

      if (deletionRequest.length === 0) {
        throw new AppError('Deletion request not found', 404, 'DELETION_REQUEST_NOT_FOUND');
      }

      const request = deletionRequest[0];

      // Check if request can be cancelled
      if (request.status !== 'pending') {
        throw new AppError(
          `Cannot cancel deletion request with status: ${request.status}`,
          400,
          'DELETION_CANNOT_BE_CANCELLED'
        );
      }

      // Check if grace period has expired
      const now = new Date().toISOString();
      if (now >= request.scheduledFor) {
        throw new AppError('Grace period has expired, deletion cannot be cancelled', 400, 'GRACE_PERIOD_EXPIRED');
      }

      // Delete the deletion request
      await this.db
        .delete(gdprDeletionRequests)
        .where(eq(gdprDeletionRequests.id, deletionId));

      logger.info(`GDPR deletion cancelled for user: ${userId}`, { deletionId });

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      logger.error('Error cancelling GDPR deletion:', error);
      throw new AppError('Failed to cancel deletion request', 500, 'DELETION_CANCELLATION_FAILED');
    }
  }

  /**
   * Clean up expired deletion requests
   */
  async cleanupExpiredRequests(): Promise<void> {
    try {
      const now = new Date().toISOString();

      // Find requests that should be processed (grace period expired)
      const expiredRequests = await this.db
        .select()
        .from(gdprDeletionRequests)
        .where(
          and(
            eq(gdprDeletionRequests.status, 'pending'),
            lt(gdprDeletionRequests.scheduledFor, now)
          )
        );

      for (const request of expiredRequests) {
        try {
          await this.processDeletion(request.id);
        } catch (error) {
          logger.error(`Failed to process expired deletion request ${request.id}:`, error);
        }
      }

      // Clean up old completed/failed requests (keep for 30 days for audit)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      await this.db
        .delete(gdprDeletionRequests)
        .where(
          and(
            eq(gdprDeletionRequests.status, 'completed'),
            lt(gdprDeletionRequests.completedAt, thirtyDaysAgo)
          )
        );

      logger.info('GDPR deletion request cleanup completed');
    } catch (error) {
      logger.error('Error cleaning up GDPR deletion requests:', error);
    }
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
   * Send deletion confirmation email (simulated)
   */
  private async sendDeletionConfirmationEmail(email: string, deletionId: string, scheduledFor: string): Promise<void> {
    // In production, this would integrate with an email service
    logger.info(`GDPR deletion confirmation email would be sent to ${email}`);
    logger.info(`Deletion ID: ${deletionId}, Scheduled for: ${scheduledFor}`);
    
    // TODO: Integrate with actual email service
    // await emailService.sendGDPRDeletionConfirmation(email, deletionId, scheduledFor);
  }

  /**
   * Send deletion completion email (simulated)
   */
  private async sendDeletionCompletionEmail(userId: string, deletionId: string): Promise<void> {
    // In production, this would send to the user's email before deletion
    logger.info(`GDPR deletion completion notification for user: ${userId}`);
    logger.info(`Deletion ID: ${deletionId} - All data has been permanently deleted`);
    
    // TODO: Integrate with actual email service
    // await emailService.sendGDPRDeletionCompletion(email, deletionId);
  }
}