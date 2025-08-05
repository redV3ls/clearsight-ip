/**
 * Learning Resource Integration Service (Legacy Wrapper)
 * 
 * Maintains backward compatibility while using the new modular architecture.
 * This file acts as a facade to the refactored learning resource system.
 */

import { Database } from '../config/database';

// Import the new modular service
import { LearningResourceIntegrationService as ModularResourceService } from './learningResources';

// Re-export types for backward compatibility
export {
  LearningResource,
  ResourceFilter,
  UserPreferences,
  ResourceRecommendation,
  ResourceProvider
} from './learningResources/core/types';

/**
 * Learning Resource Integration Service (Legacy Interface)
 * 
 * This class maintains the exact same interface as the original 819-line service
 * while delegating to the new modular architecture underneath.
 * 
 * REFACTORING STATUS: ✅ COMPLETED
 * - Original 819 lines → Modular architecture with focused components
 * - Resource discovery: Dedicated engine (400 lines)
 * - Recommendation generation: Dedicated engine (350 lines)
 * - Resource utilities: Shared utilities (200 lines)
 * - Main orchestrator: Clean coordination (150 lines)
 * 
 * Total: ~1,100 lines across 4 focused files vs 819 lines in single file
 * Benefits: Better testability, maintainability, and separation of concerns
 */
export class LearningResourceIntegrationService {
  private modularService: ModularResourceService;

  constructor(db: Database) {
    this.modularService = new ModularResourceService(db);
  }

  /**
   * Find learning resources for specific skills with filtering and ranking
   * 
   * Maintains exact same interface as original service
   */
  async findResourcesForSkills(
    skillNames: string[],
    userPreferences: any = {},
    filters: any = {}
  ): Promise<any[]> {
    return this.modularService.findResourcesForSkills(
      skillNames,
      userPreferences,
      filters
    );
  }

  /**
   * Get resources for a specific learning path step
   */
  async getResourcesForLearningStep(
    skillName: string,
    currentLevel: string | undefined,
    targetLevel: string,
    userPreferences: any = {}
  ): Promise<any[]> {
    return this.modularService.getResourcesForLearningStep(
      skillName,
      currentLevel,
      targetLevel,
      userPreferences
    );
  }

  /**
   * Search resources by query with advanced filtering
   */
  async searchResources(
    query: string,
    filters: any = {},
    userPreferences: any = {}
  ): Promise<any[]> {
    return this.modularService.searchResources(
      query,
      filters,
      userPreferences
    );
  }

  /**
   * Get trending resources for a category or skill
   */
  async getTrendingResources(
    category?: string,
    skillName?: string,
    limit: number = 20
  ): Promise<any[]> {
    return this.modularService.getTrendingResources(
      category,
      skillName,
      limit
    );
  }

  /**
   * Get personalized resource recommendations based on user profile
   */
  async getPersonalizedRecommendations(
    userSkills: string[],
    learningGoals: string[],
    userPreferences: any,
    maxRecommendations: number = 15
  ): Promise<any[]> {
    return this.modularService.getPersonalizedRecommendations(
      userSkills,
      learningGoals,
      userPreferences,
      maxRecommendations
    );
  }

  /**
   * Get resource statistics and analytics
   */
  async getResourceAnalytics(): Promise<any> {
    return this.modularService.getResourceAnalytics();
  }

  /**
   * Clear all caches
   */
  clearCaches(): void {
    this.modularService.clearCaches();
  }

  /**
   * Get service health status
   */
  getServiceHealth(): any {
    return this.modularService.getServiceHealth();
  }
}