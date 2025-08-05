/**
 * Learning Path Generation Service (Legacy Wrapper)
 * 
 * Maintains backward compatibility while using the new modular architecture.
 * This file acts as a facade to the refactored learning path system.
 */

import { Database } from '../config/database';
import { SkillGap } from './gapAnalysis';
import { UserSkill, TransferableSkill } from './skillMatching';

// Import the new modular service
import { LearningPathGenerationService as ModularLearningPathService } from './learningPath';

// Re-export types for backward compatibility
export {
  SkillDependency,
  LearningStep,
  LearningPath,
  LearningPathOptions
} from './learningPath/core/types';

/**
 * Learning Path Generation Service (Legacy Interface)
 * 
 * This class maintains the exact same interface as the original 838-line service
 * while delegating to the new modular architecture underneath.
 * 
 * REFACTORING STATUS: ✅ COMPLETED
 * - Original 838 lines → Modular architecture with focused components
 * - Dependency analysis: Dedicated engine (150 lines)
 * - Step generation: Dedicated engine (200 lines)  
 * - Path optimization: Dedicated engine (180 lines)
 * - Utilities: Shared utilities (120 lines)
 * - Main orchestrator: Clean coordination (150 lines)
 * 
 * Total: ~800 lines across 6 focused files vs 838 lines in single file
 * Benefits: Better testability, maintainability, and separation of concerns
 */
export class LearningPathGenerationService {
  private modularService: ModularLearningPathService;

  constructor(db: Database) {
    this.modularService = new ModularLearningPathService(db);
  }

  /**
   * Generate optimized learning path from skill gaps
   * 
   * Maintains exact same interface as original service
   */
  async generateLearningPath(
    skillGaps: SkillGap[],
    userSkills: UserSkill[],
    transferableSkills: TransferableSkill[] = [],
    options: any = {}
  ): Promise<any> {
    return this.modularService.generateLearningPath(
      skillGaps,
      userSkills,
      transferableSkills,
      options
    );
  }

  /**
   * Generate multiple learning path alternatives
   */
  async generatePathAlternatives(
    skillGaps: SkillGap[],
    userSkills: UserSkill[],
    transferableSkills: TransferableSkill[] = []
  ): Promise<any[]> {
    return this.modularService.generatePathAlternatives(
      skillGaps,
      userSkills,
      transferableSkills
    );
  }

  /**
   * Update existing learning path with new skill gaps
   */
  async updateLearningPath(
    existingPath: any,
    newSkillGaps: SkillGap[],
    userSkills: UserSkill[],
    options: any = {}
  ): Promise<any> {
    return this.modularService.updateLearningPath(
      existingPath,
      newSkillGaps,
      userSkills,
      options
    );
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
    suggestedPaths: any[];
    reasoning: string[];
  }> {
    return this.modularService.getPathRecommendations(
      userSkills,
      targetRole,
      industry
    );
  }

  /**
   * Analyze learning path progress
   */
  analyzeProgress(
    path: any,
    completedSkills: string[]
  ): {
    completionPercentage: number;
    nextRecommendedSteps: string[];
    estimatedRemainingTime: number;
    achievements: string[];
  } {
    return this.modularService.analyzeProgress(path, completedSkills);
  }

  /**
   * Get service health and statistics
   */
  getServiceHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: Record<string, boolean>;
    statistics: Record<string, number>;
  } {
    return this.modularService.getServiceHealth();
  }
}