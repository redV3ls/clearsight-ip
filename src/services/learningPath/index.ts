/**
 * Learning Path Generation Service (Refactored)
 * 
 * Main orchestrator for the modular learning path generation system.
 * Coordinates dependency analysis, step generation, and path optimization.
 */

import { logger } from '../../utils/logger';
import { Database } from '../../config/database';
import { SkillGap } from '../gapAnalysis';
import { UserSkill, TransferableSkill } from '../skillMatching';
import { SkillsTaxonomyService } from '../../db/skillsTaxonomy';

// Import modular components
import { DependencyAnalyzer } from './engines/dependencyAnalyzer';
import { StepGenerator } from './engines/stepGenerator';
import { PathOptimizer } from './engines/pathOptimizer';
import { PathUtils } from './utils/pathUtils';

// Import types
import { 
  LearningPath, 
  LearningPathOptions, 
  PathGenerationContext,
  SequenceOptimizationOptions
} from './core/types';

/**
 * Learning Path Generation Service
 * 
 * Refactored from monolithic 838-line service into modular architecture.
 * Maintains the same public interface while using focused, maintainable components.
 */
export class LearningPathGenerationService {
  private skillsTaxonomy: SkillsTaxonomyService;
  private dependencyAnalyzer: DependencyAnalyzer;
  private stepGenerator: StepGenerator;
  private pathOptimizer: PathOptimizer;

  constructor(private db: Database) {
    this.skillsTaxonomy = new SkillsTaxonomyService(db);
    this.dependencyAnalyzer = new DependencyAnalyzer();
    this.stepGenerator = new StepGenerator();
    this.pathOptimizer = new PathOptimizer();
    
    logger.info('Learning Path Generation Service initialized with modular architecture');
  }

  /**
   * Generate optimized learning path from skill gaps
   * 
   * Main public interface - maintains compatibility with original service
   */
  async generateLearningPath(
    skillGaps: SkillGap[],
    userSkills: UserSkill[],
    transferableSkills: TransferableSkill[] = [],
    options: LearningPathOptions = {}
  ): Promise<LearningPath> {
    try {
      const pathId = PathUtils.generatePathId();
      
      logger.info('Starting learning path generation', {
        pathId,
        skillGapCount: skillGaps.length,
        userSkillCount: userSkills.length,
        transferableSkillCount: transferableSkills.length,
        options
      });

      // Step 1: Analyze skill dependencies
      const dependencyResult = await this.dependencyAnalyzer.analyzeDependencies(
        skillGaps, 
        userSkills
      );

      // Step 2: Generate learning steps
      const learningSteps = await this.stepGenerator.generateSteps(
        skillGaps,
        dependencyResult.dependencies,
        options
      );

      // Step 3: Optimize learning sequence
      const optimizationOptions: SequenceOptimizationOptions = {
        prioritizeQuickWins: options.prioritizeQuickWins || false,
        difficultyPreference: options.difficultyPreference || 'balanced',
        maxPathLength: options.maxPathLength,
        includeTransferableSkills: options.includeTransferableSkills || false
      };

      const optimizationResult = await this.pathOptimizer.optimizeSequence(
        learningSteps,
        dependencyResult.dependencies,
        transferableSkills,
        optimizationOptions
      );

      // Step 4: Build final learning path
      const learningPath: LearningPath = {
        pathId,
        title: PathUtils.generatePathTitle(skillGaps),
        description: PathUtils.generatePathDescription(skillGaps, optimizationResult.optimizedSteps.length),
        totalEstimatedHours: optimizationResult.optimizedSteps.reduce((sum, step) => sum + step.estimatedHours, 0),
        estimatedCompletionWeeks: PathUtils.calculateCompletionWeeks(
          optimizationResult.optimizedSteps, 
          options.timeCommitmentHours || 10
        ),
        difficulty: PathUtils.calculateOverallDifficulty(optimizationResult.optimizedSteps),
        steps: optimizationResult.optimizedSteps,
        parallelTracks: optimizationResult.parallelTracks,
        criticalPath: optimizationResult.criticalPath,
        metadata: {
          ...optimizationResult.metadata,
          lastUpdated: new Date().toISOString()
        }
      };

      // Step 5: Validate the generated path
      const validation = PathUtils.validateLearningPath(learningPath);
      if (!validation.valid) {
        logger.error('Generated learning path failed validation', {
          pathId,
          errors: validation.errors
        });
        throw new Error(`Learning path validation failed: ${validation.errors.join(', ')}`);
      }

      logger.info('Learning path generated successfully', {
        pathId,
        totalSteps: learningPath.steps.length,
        totalHours: learningPath.totalEstimatedHours,
        estimatedWeeks: learningPath.estimatedCompletionWeeks,
        difficulty: learningPath.difficulty,
        parallelTracks: learningPath.parallelTracks.length,
        criticalPathLength: learningPath.criticalPath.length
      });

      return learningPath;

    } catch (error) {
      logger.error('Learning path generation failed', error);
      throw new Error(`Learning path generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate multiple learning path alternatives
   */
  async generatePathAlternatives(
    skillGaps: SkillGap[],
    userSkills: UserSkill[],
    transferableSkills: TransferableSkill[] = []
  ): Promise<LearningPath[]> {
    try {
      logger.info('Generating learning path alternatives');

      const alternatives: LearningPath[] = [];

      // Generate different path variations
      const optionVariations: LearningPathOptions[] = [
        { prioritizeQuickWins: true, difficultyPreference: 'easy-first' },
        { prioritizeQuickWins: false, difficultyPreference: 'balanced' },
        { prioritizeQuickWins: false, difficultyPreference: 'hard-first', includeTransferableSkills: true }
      ];

      for (const options of optionVariations) {
        try {
          const path = await this.generateLearningPath(
            skillGaps,
            userSkills,
            transferableSkills,
            options
          );
          alternatives.push(path);
        } catch (error) {
          logger.warn('Failed to generate path alternative', { options, error });
        }
      }

      logger.info('Generated learning path alternatives', { 
        alternativeCount: alternatives.length 
      });

      return alternatives;

    } catch (error) {
      logger.error('Failed to generate path alternatives', error);
      throw error;
    }
  }

  /**
   * Update existing learning path with new skill gaps
   */
  async updateLearningPath(
    existingPath: LearningPath,
    newSkillGaps: SkillGap[],
    userSkills: UserSkill[],
    options: LearningPathOptions = {}
  ): Promise<LearningPath> {
    try {
      logger.info('Updating existing learning path', {
        pathId: existingPath.pathId,
        newGapCount: newSkillGaps.length
      });

      // Combine existing skills with new gaps
      const existingSkillNames = new Set(existingPath.steps.map(step => step.skillName));
      const uniqueNewGaps = newSkillGaps.filter(gap => !existingSkillNames.has(gap.skillName));

      if (uniqueNewGaps.length === 0) {
        logger.info('No new skills to add to learning path');
        return existingPath;
      }

      // Generate new path with combined skills
      const allSkillGaps = [
        ...this.convertStepsToGaps(existingPath.steps),
        ...uniqueNewGaps
      ];

      const updatedPath = await this.generateLearningPath(
        allSkillGaps,
        userSkills,
        [],
        options
      );

      // Preserve original path ID
      updatedPath.pathId = existingPath.pathId;
      updatedPath.title = `${existingPath.title} (Updated)`;

      logger.info('Learning path updated successfully', {
        pathId: updatedPath.pathId,
        addedSkills: uniqueNewGaps.length,
        totalSteps: updatedPath.steps.length
      });

      return updatedPath;

    } catch (error) {
      logger.error('Failed to update learning path', error);
      throw error;
    }
  }

  /**
   * Get learning path recommendations based on user profile
   */
  async getPathRecommendations(
    userSkills: UserSkill[],
    targetRole?: string,
    industry?: string
  ): Promise<{
    recommendedSkills: string[];
    suggestedPaths: LearningPath[];
    reasoning: string[];
  }> {
    try {
      logger.info('Generating path recommendations', { 
        userSkillCount: userSkills.length,
        targetRole,
        industry 
      });

      // This would typically use ML models or rule-based systems
      // For now, provide basic recommendations based on skill patterns
      const recommendedSkills = await this.getRecommendedSkills(userSkills, targetRole, industry);
      
      // Convert recommendations to skill gaps
      const skillGaps: SkillGap[] = recommendedSkills.map(skill => ({
        skillName: skill,
        category: 'Programming', // Would be determined by skill analysis
        currentLevel: 'beginner',
        targetLevel: 'intermediate',
        gapSeverity: 'moderate',
        importance: 'medium',
        learningDifficulty: 'moderate'
      }));

      // Generate paths for recommended skills
      const suggestedPaths = await this.generatePathAlternatives(
        skillGaps,
        userSkills
      );

      const reasoning = [
        `Based on your current skills, we recommend focusing on ${recommendedSkills.length} key areas`,
        targetRole ? `These skills align with requirements for ${targetRole} roles` : '',
        industry ? `Skills are relevant for the ${industry} industry` : '',
        'Paths are optimized for your current skill level and learning preferences'
      ].filter(Boolean);

      return {
        recommendedSkills,
        suggestedPaths,
        reasoning
      };

    } catch (error) {
      logger.error('Failed to generate path recommendations', error);
      throw error;
    }
  }

  /**
   * Analyze learning path progress
   */
  analyzeProgress(
    path: LearningPath,
    completedSkills: string[]
  ): {
    completionPercentage: number;
    nextRecommendedSteps: string[];
    estimatedRemainingTime: number;
    achievements: string[];
  } {
    const completionPercentage = PathUtils.calculateCompletionPercentage(path, completedSkills);
    const nextSteps = PathUtils.getNextRecommendedSteps(path, completedSkills, 3);
    
    const completedSet = new Set(completedSkills);
    const remainingSteps = path.steps.filter(step => !completedSet.has(step.skillName));
    const estimatedRemainingTime = remainingSteps.reduce((sum, step) => sum + step.estimatedHours, 0);

    const achievements = this.calculateAchievements(path, completedSkills);

    return {
      completionPercentage,
      nextRecommendedSteps: nextSteps.map(step => step.skillName),
      estimatedRemainingTime,
      achievements
    };
  }

  /**
   * Get service health and statistics
   */
  getServiceHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: Record<string, boolean>;
    statistics: Record<string, number>;
  } {
    try {
      const components = {
        dependencyAnalyzer: !!this.dependencyAnalyzer,
        stepGenerator: !!this.stepGenerator,
        pathOptimizer: !!this.pathOptimizer,
        skillsTaxonomy: !!this.skillsTaxonomy
      };

      const allHealthy = Object.values(components).every(Boolean);
      const status = allHealthy ? 'healthy' : 'unhealthy';

      return {
        status,
        components,
        statistics: {
          componentsHealthy: Object.values(components).filter(Boolean).length,
          totalComponents: Object.keys(components).length
        }
      };

    } catch (error) {
      logger.error('Health check failed', error);
      return {
        status: 'unhealthy',
        components: {},
        statistics: {}
      };
    }
  }

  // Private helper methods

  private convertStepsToGaps(steps: any[]): SkillGap[] {
    return steps.map(step => ({
      skillName: step.skillName,
      category: step.category,
      currentLevel: step.currentLevel || 'beginner',
      targetLevel: step.targetLevel,
      gapSeverity: 'moderate',
      importance: step.priority > 7 ? 'high' : step.priority > 4 ? 'medium' : 'low',
      learningDifficulty: step.difficulty
    }));
  }

  private async getRecommendedSkills(
    userSkills: UserSkill[],
    targetRole?: string,
    industry?: string
  ): Promise<string[]> {
    // Simplified recommendation logic
    // In production, this would use ML models or comprehensive rule systems
    const currentSkillNames = new Set(userSkills.map(skill => skill.skillName));
    
    const commonRecommendations = [
      'React', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'Git'
    ].filter(skill => !currentSkillNames.has(skill));

    return commonRecommendations.slice(0, 5);
  }

  private calculateAchievements(path: LearningPath, completedSkills: string[]): string[] {
    const achievements: string[] = [];
    const completionPercentage = PathUtils.calculateCompletionPercentage(path, completedSkills);

    if (completionPercentage >= 25) achievements.push('Quarter Complete');
    if (completionPercentage >= 50) achievements.push('Halfway There');
    if (completionPercentage >= 75) achievements.push('Almost Done');
    if (completionPercentage >= 100) achievements.push('Path Complete');

    const completedCount = completedSkills.length;
    if (completedCount >= 5) achievements.push('Skill Builder');
    if (completedCount >= 10) achievements.push('Learning Machine');
    if (completedCount >= 20) achievements.push('Skill Master');

    return achievements;
  }
}

// Export all types and utilities for external use
export * from './core/types';
export * from './engines/dependencyAnalyzer';
export * from './engines/stepGenerator';
export * from './engines/pathOptimizer';
export * from './utils/pathUtils';