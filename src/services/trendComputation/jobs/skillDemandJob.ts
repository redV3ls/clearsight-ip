/**
 * Skill Demand Trends Job
 * 
 * Updates skill demand trends from historical data using statistical analysis
 * and machine learning algorithms.
 */

import { logger } from '../../../utils/logger';
import { Database } from '../../../config/database';
import { TrendsAnalysisService } from '../../trendsAnalysis';
import { ComputationEngine } from '../engines/computationEngine';
import { 
  ComputationJobResult,
  JobExecutionContext,
  SkillTrendData,
  TrendAnalysisParams
} from '../core/types';

export class SkillDemandTrendsJob {
  private computationEngine: ComputationEngine;
  private trendsService: TrendsAnalysisService;

  constructor(private db: Database) {
    this.computationEngine = new ComputationEngine();
    this.trendsService = new TrendsAnalysisService(db);
  }

  /**
   * Executes the skill demand trends computation job
   */
  async execute(context: JobExecutionContext): Promise<ComputationJobResult> {
    const startTime = Date.now();
    let recordsProcessed = 0;
    let recordsUpdated = 0;
    const errors: string[] = [];

    try {
      logger.info('Starting skill demand trends computation', {
        jobName: context.jobName,
        retryCount: context.retryCount
      });

      // Step 1: Fetch historical skill demand data
      const historicalData = await this.fetchHistoricalSkillData();
      recordsProcessed = historicalData.length;

      if (historicalData.length === 0) {
        logger.warn('No historical skill data found');
        return {
          jobName: context.jobName,
          status: 'skipped',
          recordsProcessed: 0,
          recordsUpdated: 0,
          executionTimeMs: Date.now() - startTime,
          warnings: ['No historical data available'],
          lastRun: new Date().toISOString()
        };
      }

      // Step 2: Configure trend analysis parameters
      const analysisParams: TrendAnalysisParams = {
        timeWindow: 90, // 90 days
        minDataPoints: 10,
        confidenceThreshold: 0.6,
        smoothingFactor: 0.3,
        seasonalityAdjustment: true,
        outlierDetection: true
      };

      // Step 3: Calculate skill trends
      const skillTrends = await this.computationEngine.calculateSkillTrends(
        historicalData,
        analysisParams
      );

      logger.info('Skill trends calculated', { 
        trendsGenerated: skillTrends.length 
      });

      // Step 4: Update database with new trends
      for (const trend of skillTrends) {
        try {
          await this.updateSkillTrend(trend);
          recordsUpdated++;
        } catch (error) {
          const errorMsg = `Failed to update trend for ${trend.skillName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          logger.error(errorMsg, error);
        }
      }

      // Step 5: Clean up old trend data
      const cleanupCount = await this.cleanupOldTrendData(context.config.dataRetentionDays);
      logger.info('Old trend data cleaned up', { recordsRemoved: cleanupCount });

      const executionTime = Date.now() - startTime;
      const status = errors.length === 0 ? 'success' : (recordsUpdated > 0 ? 'partial' : 'error');

      logger.info('Skill demand trends job completed', {
        status,
        recordsProcessed,
        recordsUpdated,
        executionTime,
        errorCount: errors.length
      });

      return {
        jobName: context.jobName,
        status,
        recordsProcessed,
        recordsUpdated,
        executionTimeMs: executionTime,
        errors: errors.length > 0 ? errors : undefined,
        lastRun: new Date().toISOString(),
        metadata: {
          trendsGenerated: skillTrends.length,
          cleanupCount,
          analysisParams
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Skill demand trends job failed', error);

      return {
        jobName: context.jobName,
        status: 'error',
        recordsProcessed,
        recordsUpdated,
        executionTimeMs: Date.now() - startTime,
        errors: [errorMessage],
        lastRun: new Date().toISOString()
      };
    }
  }

  /**
   * Fetches historical skill demand data from various sources
   */
  private async fetchHistoricalSkillData(): Promise<Array<{
    skillName: string;
    demand: number;
    timestamp: string;
  }>> {
    try {
      // In production, this would query actual job posting data, search trends, etc.
      // For now, we'll generate realistic mock data
      const skills = [
        'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript',
        'AWS', 'Docker', 'Kubernetes', 'Machine Learning', 'Data Science',
        'Java', 'C#', 'Angular', 'Vue.js', 'SQL'
      ];

      const data: Array<{ skillName: string; demand: number; timestamp: string }> = [];
      const now = new Date();

      for (const skill of skills) {
        // Generate 90 days of historical data
        for (let i = 90; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);

          // Generate realistic demand with trend and noise
          const baseDemand = this.getBaseSkillDemand(skill);
          const trendFactor = this.getSkillTrendFactor(skill, i);
          const noise = (Math.random() - 0.5) * 0.2; // ±10% noise
          const seasonalFactor = this.getSeasonalFactor(date);

          const demand = Math.max(0, Math.round(
            baseDemand * trendFactor * (1 + noise) * seasonalFactor
          ));

          data.push({
            skillName: skill,
            demand,
            timestamp: date.toISOString()
          });
        }
      }

      logger.info('Historical skill data fetched', { 
        dataPoints: data.length,
        skills: skills.length,
        dateRange: '90 days'
      });

      return data;

    } catch (error) {
      logger.error('Failed to fetch historical skill data', error);
      throw error;
    }
  }

  /**
   * Updates skill trend in the database
   */
  private async updateSkillTrend(trend: SkillTrendData): Promise<void> {
    try {
      // In production, this would update the actual database
      // For now, we'll just log the update
      logger.debug('Updating skill trend', {
        skillName: trend.skillName,
        currentDemand: trend.currentDemand,
        growthRate: trend.growthRate,
        trend: trend.trend,
        confidence: trend.confidence
      });

      // Mock database update
      await this.delay(10); // Simulate database operation

    } catch (error) {
      logger.error(`Failed to update skill trend for ${trend.skillName}`, error);
      throw error;
    }
  }

  /**
   * Cleans up old trend data beyond retention period
   */
  private async cleanupOldTrendData(retentionDays: number): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      // In production, this would delete old records from the database
      // For now, we'll simulate the cleanup
      const mockCleanupCount = Math.floor(Math.random() * 100) + 50;

      logger.debug('Cleaning up old trend data', {
        cutoffDate: cutoffDate.toISOString(),
        retentionDays,
        recordsRemoved: mockCleanupCount
      });

      await this.delay(100); // Simulate cleanup operation

      return mockCleanupCount;

    } catch (error) {
      logger.error('Failed to cleanup old trend data', error);
      throw error;
    }
  }

  // Helper methods for mock data generation

  private getBaseSkillDemand(skill: string): number {
    const demandMap: Record<string, number> = {
      'JavaScript': 1000,
      'Python': 900,
      'React': 800,
      'Node.js': 600,
      'TypeScript': 500,
      'AWS': 700,
      'Docker': 400,
      'Kubernetes': 300,
      'Machine Learning': 600,
      'Data Science': 550,
      'Java': 800,
      'C#': 600,
      'Angular': 400,
      'Vue.js': 300,
      'SQL': 750
    };

    return demandMap[skill] || 200;
  }

  private getSkillTrendFactor(skill: string, daysAgo: number): number {
    // Simulate different trend patterns for different skills
    const trendMap: Record<string, number> = {
      'JavaScript': 0.001, // Slight upward trend
      'Python': 0.002, // Strong upward trend
      'React': 0.0015, // Moderate upward trend
      'TypeScript': 0.003, // Very strong upward trend
      'Machine Learning': 0.0025, // Strong upward trend
      'Docker': 0.002, // Strong upward trend
      'Kubernetes': 0.0035, // Very strong upward trend
      'Angular': -0.0005, // Slight downward trend
      'jQuery': -0.002 // Declining trend
    };

    const dailyGrowthRate = trendMap[skill] || 0;
    return 1 + (dailyGrowthRate * (90 - daysAgo));
  }

  private getSeasonalFactor(date: Date): number {
    const month = date.getMonth();
    
    // Simulate seasonal patterns in job demand
    // Higher demand in Q1 and Q3, lower in summer and holidays
    const seasonalFactors = [
      1.1, // January - high hiring
      1.05, // February
      1.0, // March
      0.95, // April
      0.9, // May
      0.85, // June - summer slowdown
      0.8, // July - summer slowdown
      0.85, // August
      1.0, // September - back to work
      1.05, // October
      0.95, // November
      0.8 // December - holidays
    ];

    return seasonalFactors[month];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}