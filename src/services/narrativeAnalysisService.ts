import { eq, desc, and } from 'drizzle-orm';
import { narrativeAnalysis } from '../db/schema';
import { Database } from '../config/database';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

export interface NarrativeAnalysisRecord {
  id: string;
  userId: string;
  narrative: string;
  analysisType: 'standalone' | 'job-comparison';
  wordCount: number;
  hasJobDescription: boolean;
  processingTimeMs?: number;
  aiProvider: string;
  aiModel: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNarrativeAnalysisInput {
  id: string;
  userId: string;
  narrative: string;
  analysisType: 'standalone' | 'job-comparison';
  wordCount: number;
  hasJobDescription: boolean;
  processingTimeMs?: number;
  aiProvider?: string;
  aiModel?: string;
}

export class NarrativeAnalysisService {
  constructor(private db: Database) {}

  /**
   * Create a new narrative analysis record
   */
  async create(input: CreateNarrativeAnalysisInput): Promise<NarrativeAnalysisRecord> {
    try {
      const now = new Date().toISOString();
      
      const record = {
        id: input.id,
        userId: input.userId,
        narrative: input.narrative,
        analysisType: input.analysisType,
        wordCount: input.wordCount,
        hasJobDescription: input.hasJobDescription ? 1 : 0, // Convert boolean to integer for D1
        processingTimeMs: input.processingTimeMs || null,
        aiProvider: input.aiProvider || 'deepseek',
        aiModel: input.aiModel || 'deepseek-reasoner',
        createdAt: now,
        updatedAt: now,
      };

      await this.db.insert(narrativeAnalysis).values(record);

      logger.info('Narrative analysis record created', {
        id: input.id,
        userId: input.userId,
        analysisType: input.analysisType,
        wordCount: input.wordCount
      });

      // Convert back to boolean for return
      return {
        ...record,
        hasJobDescription: Boolean(record.hasJobDescription)
      };
    } catch (error) {
      logger.error('Failed to create narrative analysis record:', error);
      throw new AppError('Failed to save narrative analysis', 500, 'DATABASE_ERROR');
    }
  }

  /**
   * Get a narrative analysis by ID and user ID
   */
  async getById(id: string, userId: string): Promise<NarrativeAnalysisRecord | null> {
    try {
      const result = await this.db
        .select()
        .from(narrativeAnalysis)
        .where(and(eq(narrativeAnalysis.id, id), eq(narrativeAnalysis.userId, userId)))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      const record = result[0];
      return {
        ...record,
        hasJobDescription: Boolean(record.hasJobDescription) // Convert integer back to boolean
      };
    } catch (error) {
      logger.error('Failed to get narrative analysis by ID:', error);
      throw new AppError('Failed to retrieve narrative analysis', 500, 'DATABASE_ERROR');
    }
  }

  /**
   * Get user's narrative analysis history with pagination
   */
  async getUserHistory(
    userId: string, 
    options: { 
      limit?: number; 
      offset?: number; 
      analysisType?: 'standalone' | 'job-comparison' 
    } = {}
  ): Promise<NarrativeAnalysisRecord[]> {
    try {
      const { limit = 10, offset = 0, analysisType } = options;

      let query = this.db
        .select()
        .from(narrativeAnalysis)
        .where(eq(narrativeAnalysis.userId, userId));

      // Add analysis type filter if specified
      if (analysisType) {
        query = query.where(
          and(
            eq(narrativeAnalysis.userId, userId),
            eq(narrativeAnalysis.analysisType, analysisType)
          )
        );
      }

      const results = await query
        .orderBy(desc(narrativeAnalysis.createdAt))
        .limit(limit)
        .offset(offset);

      // Convert hasJobDescription from integer to boolean
      return results.map(record => ({
        ...record,
        hasJobDescription: Boolean(record.hasJobDescription)
      }));
    } catch (error) {
      logger.error('Failed to get user narrative analysis history:', error);
      throw new AppError('Failed to retrieve analysis history', 500, 'DATABASE_ERROR');
    }
  }

  /**
   * Update a narrative analysis record
   */
  async update(
    id: string, 
    userId: string, 
    updates: Partial<Omit<CreateNarrativeAnalysisInput, 'id' | 'userId'>>
  ): Promise<NarrativeAnalysisRecord | null> {
    try {
      const now = new Date().toISOString();
      
      const updateData: any = {
        ...updates,
        updatedAt: now
      };

      // Convert boolean to integer if hasJobDescription is being updated
      if (updates.hasJobDescription !== undefined) {
        updateData.hasJobDescription = updates.hasJobDescription ? 1 : 0;
      }

      await this.db
        .update(narrativeAnalysis)
        .set(updateData)
        .where(and(eq(narrativeAnalysis.id, id), eq(narrativeAnalysis.userId, userId)));

      // Return the updated record
      return await this.getById(id, userId);
    } catch (error) {
      logger.error('Failed to update narrative analysis record:', error);
      throw new AppError('Failed to update narrative analysis', 500, 'DATABASE_ERROR');
    }
  }

  /**
   * Delete a narrative analysis record
   */
  async delete(id: string, userId: string): Promise<boolean> {
    try {
      const result = await this.db
        .delete(narrativeAnalysis)
        .where(and(eq(narrativeAnalysis.id, id), eq(narrativeAnalysis.userId, userId)));

      logger.info('Narrative analysis record deleted', { id, userId });
      return true;
    } catch (error) {
      logger.error('Failed to delete narrative analysis record:', error);
      throw new AppError('Failed to delete narrative analysis', 500, 'DATABASE_ERROR');
    }
  }

  /**
   * Get analysis statistics for a user
   */
  async getUserStats(userId: string): Promise<{
    totalAnalyses: number;
    standaloneCount: number;
    jobComparisonCount: number;
    averageWordCount: number;
    averageProcessingTime: number;
  }> {
    try {
      const results = await this.db
        .select()
        .from(narrativeAnalysis)
        .where(eq(narrativeAnalysis.userId, userId));

      const totalAnalyses = results.length;
      const standaloneCount = results.filter(r => r.analysisType === 'standalone').length;
      const jobComparisonCount = results.filter(r => r.analysisType === 'job-comparison').length;
      
      const totalWordCount = results.reduce((sum, r) => sum + r.wordCount, 0);
      const averageWordCount = totalAnalyses > 0 ? Math.round(totalWordCount / totalAnalyses) : 0;
      
      const validProcessingTimes = results.filter(r => r.processingTimeMs !== null);
      const totalProcessingTime = validProcessingTimes.reduce((sum, r) => sum + (r.processingTimeMs || 0), 0);
      const averageProcessingTime = validProcessingTimes.length > 0 
        ? Math.round(totalProcessingTime / validProcessingTimes.length) 
        : 0;

      return {
        totalAnalyses,
        standaloneCount,
        jobComparisonCount,
        averageWordCount,
        averageProcessingTime
      };
    } catch (error) {
      logger.error('Failed to get user narrative analysis stats:', error);
      throw new AppError('Failed to retrieve analysis statistics', 500, 'DATABASE_ERROR');
    }
  }

  /**
   * Clean up old analyses (for D1 free plan optimization)
   * Keeps only the most recent N analyses per user
   */
  async cleanupOldAnalyses(userId: string, keepCount: number = 50): Promise<number> {
    try {
      // Get all analyses for the user, ordered by creation date (newest first)
      const allAnalyses = await this.db
        .select({ id: narrativeAnalysis.id })
        .from(narrativeAnalysis)
        .where(eq(narrativeAnalysis.userId, userId))
        .orderBy(desc(narrativeAnalysis.createdAt));

      // If we have fewer than keepCount, no cleanup needed
      if (allAnalyses.length <= keepCount) {
        return 0;
      }

      // Get IDs of analyses to delete (everything after keepCount)
      const analysesToDelete = allAnalyses.slice(keepCount);
      const idsToDelete = analysesToDelete.map(a => a.id);

      // Delete old analyses
      let deletedCount = 0;
      for (const id of idsToDelete) {
        await this.db
          .delete(narrativeAnalysis)
          .where(and(eq(narrativeAnalysis.id, id), eq(narrativeAnalysis.userId, userId)));
        deletedCount++;
      }

      logger.info('Cleaned up old narrative analyses', {
        userId,
        deletedCount,
        remainingCount: keepCount
      });

      return deletedCount;
    } catch (error) {
      logger.error('Failed to cleanup old narrative analyses:', error);
      throw new AppError('Failed to cleanup old analyses', 500, 'DATABASE_ERROR');
    }
  }
}