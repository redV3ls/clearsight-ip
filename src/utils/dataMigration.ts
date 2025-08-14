/**
 * Data Migration Utilities
 * Handles migration from legacy structured format to narrative format
 */

import { logger } from './logger';
import { NarrativeAnalysisService } from '../services/narrativeAnalysisService';
import { Database } from '../config/database';
import { CloudflareOptimizer } from './cloudflareOptimizer';

export interface LegacyAnalysisData {
  id: string;
  user_id: string;
  analysis_data: string; // JSON string
  created_at: string;
  updated_at: string;
}

export interface ParsedLegacyAnalysis {
  id: string;
  userId: string;
  timestamp: string;
  status: string;
  skillsAnalysis?: {
    totalSkills?: number;
    technicalSkills?: number;
    softSkills?: number;
    skillsFound?: string[];
    recommendations?: string[];
  };
  aiPowered?: boolean;
  processingTime?: number;
}

export interface MigrationResult {
  totalProcessed: number;
  successfulMigrations: number;
  failedMigrations: number;
  skippedMigrations: number;
  errors: Array<{
    analysisId: string;
    error: string;
  }>;
  processingTime: number;
}

export class DataMigrationService {
  constructor(
    private db: Database,
    private narrativeService: NarrativeAnalysisService
  ) {}

  /**
   * Migrate legacy analyses to narrative format
   */
  async migrateLegacyAnalyses(options: {
    batchSize?: number;
    dryRun?: boolean;
    userId?: string;
    maxMigrations?: number;
  } = {}): Promise<MigrationResult> {
    const startTime = Date.now();
    const { batchSize = 10, dryRun = false, userId, maxMigrations = 1000 } = options;
    
    const result: MigrationResult = {
      totalProcessed: 0,
      successfulMigrations: 0,
      failedMigrations: 0,
      skippedMigrations: 0,
      errors: [],
      processingTime: 0
    };

    try {
      logger.info('Starting legacy analysis migration', {
        batchSize,
        dryRun,
        userId,
        maxMigrations
      });

      // Get legacy analyses in batches
      let offset = 0;
      let hasMore = true;

      while (hasMore && result.totalProcessed < maxMigrations) {
        const batch = await this.getLegacyAnalysesBatch(batchSize, offset, userId);
        
        if (batch.length === 0) {
          hasMore = false;
          break;
        }

        for (const legacyAnalysis of batch) {
          if (result.totalProcessed >= maxMigrations) break;

          result.totalProcessed++;
          
          try {
            const migrationSuccess = await this.migrateSingleAnalysis(legacyAnalysis, dryRun);
            
            if (migrationSuccess) {
              result.successfulMigrations++;
            } else {
              result.skippedMigrations++;
            }
          } catch (error) {
            result.failedMigrations++;
            result.errors.push({
              analysisId: legacyAnalysis.id,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
            
            logger.warn('Failed to migrate analysis', {
              analysisId: legacyAnalysis.id,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }

        offset += batchSize;
        
        // Add small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      result.processingTime = Date.now() - startTime;
      
      logger.info('Migration completed', result);
      return result;

    } catch (error) {
      result.processingTime = Date.now() - startTime;
      logger.error('Migration failed', { error, result });
      throw error;
    }
  }

  /**
   * Get a batch of legacy analyses
   */
  private async getLegacyAnalysesBatch(
    batchSize: number, 
    offset: number, 
    userId?: string
  ): Promise<LegacyAnalysisData[]> {
    const optimizer = CloudflareOptimizer.getInstance();
    optimizer.trackD1Read(1);

    let query = `
      SELECT id, user_id, analysis_data, created_at, updated_at
      FROM resume_analyses
    `;
    
    const params: any[] = [];
    
    if (userId) {
      query += ' WHERE user_id = ?';
      params.push(userId);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(batchSize, offset);

    const result = await this.db.prepare(query).bind(...params).all() as any;
    return result.results || [];
  }

  /**
   * Migrate a single legacy analysis to narrative format
   */
  private async migrateSingleAnalysis(
    legacyAnalysis: LegacyAnalysisData,
    dryRun: boolean
  ): Promise<boolean> {
    try {
      // Parse the legacy analysis data
      const parsedAnalysis = this.parseLegacyAnalysis(legacyAnalysis);
      
      // Check if this analysis should be migrated
      if (!this.shouldMigrateAnalysis(parsedAnalysis)) {
        return false; // Skip migration
      }

      // Check if already migrated
      const existing = await this.narrativeService.getById(parsedAnalysis.id, parsedAnalysis.userId);
      if (existing) {
        logger.debug('Analysis already migrated, skipping', { analysisId: parsedAnalysis.id });
        return false;
      }

      // Generate narrative content from legacy data
      const narrative = this.generateNarrativeFromLegacy(parsedAnalysis);
      
      if (!narrative) {
        logger.warn('Could not generate narrative from legacy analysis', { 
          analysisId: parsedAnalysis.id 
        });
        return false;
      }

      if (dryRun) {
        logger.info('Dry run: would migrate analysis', {
          analysisId: parsedAnalysis.id,
          narrativeLength: narrative.length,
          wordCount: this.countWords(narrative)
        });
        return true;
      }

      // Create narrative analysis record
      await this.narrativeService.create({
        id: parsedAnalysis.id,
        userId: parsedAnalysis.userId,
        narrative,
        analysisType: 'standalone', // Legacy analyses were standalone
        wordCount: this.countWords(narrative),
        hasJobDescription: false, // Legacy analyses didn't have job descriptions
        processingTimeMs: parsedAnalysis.processingTime,
        aiProvider: 'legacy-migration',
        aiModel: 'migrated-data'
      });

      logger.info('Successfully migrated analysis', {
        analysisId: parsedAnalysis.id,
        wordCount: this.countWords(narrative)
      });

      return true;

    } catch (error) {
      logger.error('Failed to migrate single analysis', {
        analysisId: legacyAnalysis.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Parse legacy analysis JSON data
   */
  private parseLegacyAnalysis(legacyAnalysis: LegacyAnalysisData): ParsedLegacyAnalysis {
    try {
      const analysisData = JSON.parse(legacyAnalysis.analysis_data);
      
      return {
        id: legacyAnalysis.id,
        userId: legacyAnalysis.user_id,
        timestamp: legacyAnalysis.created_at,
        status: analysisData.status || 'completed',
        skillsAnalysis: analysisData.skillsAnalysis,
        aiPowered: analysisData.aiPowered,
        processingTime: analysisData.processingTime
      };
    } catch (error) {
      throw new Error(`Failed to parse legacy analysis data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Determine if an analysis should be migrated
   */
  private shouldMigrateAnalysis(parsedAnalysis: ParsedLegacyAnalysis): boolean {
    // Only migrate completed analyses
    if (parsedAnalysis.status !== 'completed') {
      return false;
    }

    // Only migrate AI-powered analyses
    if (!parsedAnalysis.aiPowered) {
      return false;
    }

    // Must have skills analysis data
    if (!parsedAnalysis.skillsAnalysis) {
      return false;
    }

    return true;
  }

  /**
   * Generate narrative content from legacy structured data
   */
  private generateNarrativeFromLegacy(parsedAnalysis: ParsedLegacyAnalysis): string | null {
    const skills = parsedAnalysis.skillsAnalysis;
    if (!skills) return null;

    const narrativeParts: string[] = [];

    // Introduction
    narrativeParts.push("Based on your resume analysis, here's a comprehensive overview of your professional profile:");
    narrativeParts.push("");

    // Skills summary
    if (skills.totalSkills) {
      narrativeParts.push(`Your resume demonstrates proficiency in ${skills.totalSkills} distinct skills and competencies.`);
      
      if (skills.technicalSkills && skills.softSkills) {
        narrativeParts.push(`This includes ${skills.technicalSkills} technical skills and ${skills.softSkills} soft skills, showing a well-rounded professional profile.`);
      }
      narrativeParts.push("");
    }

    // Skills found
    if (skills.skillsFound && skills.skillsFound.length > 0) {
      narrativeParts.push("Key skills identified in your resume:");
      narrativeParts.push("");
      
      const skillsList = skills.skillsFound.slice(0, 10); // Limit to top 10
      skillsList.forEach(skill => {
        narrativeParts.push(`• ${skill}`);
      });
      narrativeParts.push("");
    }

    // Recommendations
    if (skills.recommendations && skills.recommendations.length > 0) {
      narrativeParts.push("Recommendations for your career development:");
      narrativeParts.push("");
      
      skills.recommendations.forEach(recommendation => {
        narrativeParts.push(`• ${recommendation}`);
      });
      narrativeParts.push("");
    }

    // Closing
    narrativeParts.push("This analysis was migrated from your previous resume evaluation. For more detailed insights, consider running a new analysis with our enhanced narrative system.");

    const narrative = narrativeParts.join('\n').trim();
    
    // Ensure minimum length
    if (narrative.length < 100) {
      return null;
    }

    return narrative;
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Get migration statistics
   */
  async getMigrationStats(userId?: string): Promise<{
    legacyAnalyses: number;
    migratedAnalyses: number;
    pendingMigration: number;
    migrationPercentage: number;
  }> {
    const optimizer = CloudflareOptimizer.getInstance();
    optimizer.trackD1Read(2);

    // Count legacy analyses
    let legacyQuery = 'SELECT COUNT(*) as count FROM resume_analyses';
    const legacyParams: any[] = [];
    
    if (userId) {
      legacyQuery += ' WHERE user_id = ?';
      legacyParams.push(userId);
    }
    
    const legacyResult = await this.db.prepare(legacyQuery).bind(...legacyParams).first() as any;
    const legacyCount = legacyResult?.count || 0;

    // Count migrated analyses
    const narrativeStats = userId 
      ? await this.narrativeService.getUserStats(userId)
      : { totalAnalyses: 0 }; // Would need a global stats method for all users
    
    const migratedCount = narrativeStats.totalAnalyses;
    const pendingMigration = Math.max(0, legacyCount - migratedCount);
    const migrationPercentage = legacyCount > 0 ? (migratedCount / legacyCount) * 100 : 100;

    return {
      legacyAnalyses: legacyCount,
      migratedAnalyses: migratedCount,
      pendingMigration,
      migrationPercentage: Math.round(migrationPercentage * 100) / 100
    };
  }

  /**
   * Validate migrated data integrity
   */
  async validateMigration(analysisId: string): Promise<{
    isValid: boolean;
    issues: string[];
    legacyData?: ParsedLegacyAnalysis;
    narrativeData?: any;
  }> {
    const issues: string[] = [];
    
    try {
      // Get legacy data
      const optimizer = CloudflareOptimizer.getInstance();
      optimizer.trackD1Read(1);
      
      const legacyResult = await this.db
        .prepare('SELECT * FROM resume_analyses WHERE id = ?')
        .bind(analysisId)
        .first() as any;
      
      if (!legacyResult) {
        issues.push('Legacy analysis not found');
        return { isValid: false, issues };
      }

      const legacyData = this.parseLegacyAnalysis(legacyResult);
      
      // Get narrative data
      const narrativeData = await this.narrativeService.getById(analysisId, legacyData.userId);
      
      if (!narrativeData) {
        issues.push('Narrative analysis not found');
        return { isValid: false, issues, legacyData };
      }

      // Validate data consistency
      if (narrativeData.userId !== legacyData.userId) {
        issues.push('User ID mismatch');
      }

      if (narrativeData.wordCount < 50) {
        issues.push('Narrative too short');
      }

      if (!narrativeData.narrative.includes('resume')) {
        issues.push('Narrative does not reference resume');
      }

      return {
        isValid: issues.length === 0,
        issues,
        legacyData,
        narrativeData
      };

    } catch (error) {
      issues.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, issues };
    }
  }

  /**
   * Clean up legacy data after successful migration
   */
  async cleanupLegacyData(options: {
    dryRun?: boolean;
    userId?: string;
    olderThanDays?: number;
  } = {}): Promise<{
    deletedCount: number;
    errors: string[];
  }> {
    const { dryRun = true, userId, olderThanDays = 30 } = options;
    const errors: string[] = [];
    let deletedCount = 0;

    try {
      // Find legacy analyses that have been successfully migrated
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      
      let query = `
        SELECT ra.id, ra.user_id 
        FROM resume_analyses ra
        WHERE ra.created_at < ?
      `;
      
      const params: any[] = [cutoffDate.toISOString()];
      
      if (userId) {
        query += ' AND ra.user_id = ?';
        params.push(userId);
      }

      const optimizer = CloudflareOptimizer.getInstance();
      optimizer.trackD1Read(1);
      
      const legacyAnalyses = await this.db.prepare(query).bind(...params).all() as any;
      const analyses = legacyAnalyses.results || [];

      for (const analysis of analyses) {
        // Check if migrated
        const migrated = await this.narrativeService.getById(analysis.id, analysis.user_id);
        
        if (migrated) {
          if (dryRun) {
            logger.info('Dry run: would delete legacy analysis', { analysisId: analysis.id });
            deletedCount++;
          } else {
            try {
              optimizer.trackD1Write(1);
              await this.db
                .prepare('DELETE FROM resume_analyses WHERE id = ?')
                .bind(analysis.id)
                .run();
              
              deletedCount++;
              logger.info('Deleted legacy analysis', { analysisId: analysis.id });
            } catch (error) {
              errors.push(`Failed to delete ${analysis.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
        }
      }

      return { deletedCount, errors };

    } catch (error) {
      errors.push(`Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { deletedCount, errors };
    }
  }
}