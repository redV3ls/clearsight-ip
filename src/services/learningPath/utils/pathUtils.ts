/**
 * Learning Path Utilities
 * 
 * Utility functions for learning path generation, validation, and formatting.
 */

import { LearningPath, LearningStep, SkillDependency, DIFFICULTY_LEVELS } from '../core/types';
import { SkillGap } from '../../gapAnalysis';

export class PathUtils {

  /**
   * Generates a unique path ID
   */
  static generatePathId(): string {
    return `path_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generates a descriptive title for the learning path
   */
  static generatePathTitle(skillGaps: SkillGap[]): string {
    const categories = [...new Set(skillGaps.map(gap => gap.category))];
    
    if (categories.length === 1) {
      return `${categories[0]} Learning Path`;
    } else if (categories.length === 2) {
      return `${categories[0]} & ${categories[1]} Learning Path`;
    } else {
      return `Multi-Skill Learning Path (${categories.length} areas)`;
    }
  }

  /**
   * Generates a description for the learning path
   */
  static generatePathDescription(skillGaps: SkillGap[], stepCount: number): string {
    const criticalSkills = skillGaps.filter(gap => gap.importance === 'critical').length;
    const categories = [...new Set(skillGaps.map(gap => gap.category))];
    
    let description = `A comprehensive learning path covering ${stepCount} skills across ${categories.length} categories. `;
    
    if (criticalSkills > 0) {
      description += `Includes ${criticalSkills} critical skills for immediate career impact. `;
    }
    
    description += `Designed to systematically build expertise through structured learning objectives and milestones.`;
    
    return description;
  }

  /**
   * Calculates estimated completion time in weeks
   */
  static calculateCompletionWeeks(steps: LearningStep[], hoursPerWeek: number): number {
    const totalHours = steps.reduce((sum, step) => sum + step.estimatedHours, 0);
    return Math.ceil(totalHours / hoursPerWeek);
  }

  /**
   * Calculates overall difficulty of the learning path
   */
  static calculateOverallDifficulty(steps: LearningStep[]): 'easy' | 'moderate' | 'hard' | 'very-hard' {
    if (steps.length === 0) return 'easy';

    const difficultyScores = steps.map(step => DIFFICULTY_LEVELS[step.difficulty]);
    const averageScore = difficultyScores.reduce((sum, score) => sum + score, 0) / difficultyScores.length;

    if (averageScore <= 1.5) return 'easy';
    if (averageScore <= 2.5) return 'moderate';
    if (averageScore <= 3.5) return 'hard';
    return 'very-hard';
  }

  /**
   * Validates a learning path structure
   */
  static validateLearningPath(path: LearningPath): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!path.pathId) errors.push('Path ID is required');
    if (!path.title) errors.push('Title is required');
    if (!path.description) errors.push('Description is required');
    if (!Array.isArray(path.steps)) errors.push('Steps must be an array');
    if (!Array.isArray(path.parallelTracks)) errors.push('Parallel tracks must be an array');
    if (!Array.isArray(path.criticalPath)) errors.push('Critical path must be an array');

    // Validate numeric fields
    if (path.totalEstimatedHours < 0) errors.push('Total estimated hours must be positive');
    if (path.estimatedCompletionWeeks < 0) errors.push('Estimated completion weeks must be positive');

    // Validate metadata
    if (!path.metadata) {
      errors.push('Metadata is required');
    } else {
      if (typeof path.metadata.totalSkills !== 'number') errors.push('Metadata totalSkills must be a number');
      if (typeof path.metadata.prerequisitesMet !== 'number') errors.push('Metadata prerequisitesMet must be a number');
      if (typeof path.metadata.confidenceScore !== 'number') errors.push('Metadata confidenceScore must be a number');
      if (!path.metadata.lastUpdated) errors.push('Metadata lastUpdated is required');
    }

    // Validate steps
    if (path.steps.length === 0) {
      errors.push('Path must contain at least one step');
    } else {
      for (let i = 0; i < path.steps.length; i++) {
        const stepErrors = this.validateLearningStep(path.steps[i]);
        if (stepErrors.length > 0) {
          errors.push(`Step ${i + 1}: ${stepErrors.join(', ')}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates a learning step structure
   */
  static validateLearningStep(step: LearningStep): string[] {
    const errors: string[] = [];

    // Check required fields
    if (!step.skillName) errors.push('Skill name is required');
    if (!step.category) errors.push('Category is required');
    if (!step.targetLevel) errors.push('Target level is required');

    // Validate numeric fields
    if (step.priority < 1 || step.priority > 10) errors.push('Priority must be between 1 and 10');
    if (step.estimatedHours < 1) errors.push('Estimated hours must be at least 1');

    // Validate arrays
    if (!Array.isArray(step.prerequisites)) errors.push('Prerequisites must be an array');
    if (!Array.isArray(step.learningObjectives)) errors.push('Learning objectives must be an array');
    if (!Array.isArray(step.milestones)) errors.push('Milestones must be an array');

    // Validate enums
    const validLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    if (!validLevels.includes(step.targetLevel)) errors.push('Invalid target level');
    if (step.currentLevel && !validLevels.includes(step.currentLevel)) errors.push('Invalid current level');

    const validDifficulties = ['easy', 'moderate', 'hard', 'very-hard'];
    if (!validDifficulties.includes(step.difficulty)) errors.push('Invalid difficulty level');

    return errors;
  }

  /**
   * Calculates path statistics
   */
  static calculatePathStatistics(path: LearningPath): {
    totalSteps: number;
    totalHours: number;
    averagePriority: number;
    difficultyDistribution: Record<string, number>;
    categoryDistribution: Record<string, number>;
    parallelizationRatio: number;
  } {
    const totalSteps = path.steps.length;
    const totalHours = path.totalEstimatedHours;
    const averagePriority = path.steps.reduce((sum, step) => sum + step.priority, 0) / totalSteps;

    const difficultyDistribution: Record<string, number> = {};
    const categoryDistribution: Record<string, number> = {};

    for (const step of path.steps) {
      difficultyDistribution[step.difficulty] = (difficultyDistribution[step.difficulty] || 0) + 1;
      categoryDistribution[step.category] = (categoryDistribution[step.category] || 0) + 1;
    }

    // Calculate parallelization ratio
    const parallelSteps = path.parallelTracks.reduce((sum, track) => sum + track.length, 0);
    const parallelizationRatio = totalSteps > 0 ? parallelSteps / totalSteps : 0;

    return {
      totalSteps,
      totalHours,
      averagePriority: Math.round(averagePriority * 100) / 100,
      difficultyDistribution,
      categoryDistribution,
      parallelizationRatio: Math.round(parallelizationRatio * 100) / 100
    };
  }

  /**
   * Formats learning path for display
   */
  static formatPathForDisplay(path: LearningPath): {
    summary: string;
    timeline: string;
    highlights: string[];
  } {
    const stats = this.calculatePathStatistics(path);
    
    const summary = `${path.title}: ${stats.totalSteps} skills, ${stats.totalHours} hours, ${path.estimatedCompletionWeeks} weeks`;
    
    const timeline = `Estimated completion: ${path.estimatedCompletionWeeks} weeks at 10 hours/week`;
    
    const highlights = [
      `${stats.totalSteps} skills across ${Object.keys(stats.categoryDistribution).length} categories`,
      `${path.parallelTracks.length} parallel learning tracks available`,
      `${path.criticalPath.length} skills in critical path`,
      `Overall difficulty: ${path.difficulty}`,
      `Confidence score: ${Math.round(path.metadata.confidenceScore * 100)}%`
    ];

    return {
      summary,
      timeline,
      highlights
    };
  }

  /**
   * Compares two learning paths
   */
  static comparePaths(path1: LearningPath, path2: LearningPath): {
    shorter: LearningPath;
    longer: LearningPath;
    timeDifference: number;
    skillDifference: number;
    difficultyComparison: string;
  } {
    const shorter = path1.totalEstimatedHours <= path2.totalEstimatedHours ? path1 : path2;
    const longer = path1.totalEstimatedHours > path2.totalEstimatedHours ? path1 : path2;
    
    const timeDifference = longer.totalEstimatedHours - shorter.totalEstimatedHours;
    const skillDifference = longer.steps.length - shorter.steps.length;
    
    const difficultyLevels = { 'easy': 1, 'moderate': 2, 'hard': 3, 'very-hard': 4 };
    const diff1 = difficultyLevels[path1.difficulty];
    const diff2 = difficultyLevels[path2.difficulty];
    
    let difficultyComparison: string;
    if (diff1 === diff2) {
      difficultyComparison = 'Same difficulty level';
    } else if (diff1 > diff2) {
      difficultyComparison = `${path1.title} is more difficult`;
    } else {
      difficultyComparison = `${path2.title} is more difficult`;
    }

    return {
      shorter,
      longer,
      timeDifference,
      skillDifference,
      difficultyComparison
    };
  }

  /**
   * Extracts skill names from a learning path
   */
  static extractSkillNames(path: LearningPath): string[] {
    return path.steps.map(step => step.skillName);
  }

  /**
   * Finds common skills between two paths
   */
  static findCommonSkills(path1: LearningPath, path2: LearningPath): string[] {
    const skills1 = new Set(this.extractSkillNames(path1));
    const skills2 = new Set(this.extractSkillNames(path2));
    
    return Array.from(skills1).filter(skill => skills2.has(skill));
  }

  /**
   * Calculates path completion percentage based on completed steps
   */
  static calculateCompletionPercentage(path: LearningPath, completedSkills: string[]): number {
    if (path.steps.length === 0) return 0;
    
    const completedSet = new Set(completedSkills);
    const completedCount = path.steps.filter(step => completedSet.has(step.skillName)).length;
    
    return Math.round((completedCount / path.steps.length) * 100);
  }

  /**
   * Gets next recommended steps based on completed skills
   */
  static getNextRecommendedSteps(
    path: LearningPath, 
    completedSkills: string[], 
    maxRecommendations: number = 3
  ): LearningStep[] {
    const completedSet = new Set(completedSkills);
    
    // Find steps where all prerequisites are met
    const availableSteps = path.steps.filter(step => {
      // Skip if already completed
      if (completedSet.has(step.skillName)) return false;
      
      // Check if all prerequisites are met
      return step.prerequisites.every(prereq => 
        completedSet.has(prereq) || !path.steps.some(s => s.skillName === prereq)
      );
    });

    // Sort by priority and return top recommendations
    return availableSteps
      .sort((a, b) => b.priority - a.priority)
      .slice(0, maxRecommendations);
  }
}