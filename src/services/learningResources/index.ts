/**
 * Learning Resource Integration Service (Refactored)
 * 
 * Main orchestrator for the modular learning resource integration system.
 * Coordinates resource discovery, recommendation generation, and management.
 */

import { logger } from '../../utils/logger';
import { Database } from '../../config/database';

// Import modular components
import { ResourceDiscoveryEngine } from './engines/discoveryEngine';
import { RecommendationEngine } from './engines/recommendationEngine';
import { ResourceUtils } from './utils/resourceUtils';

// Import types
import { 
  LearningResource, 
  ResourceFilter, 
  UserPreferences, 
  ResourceRecommendation,
  ResourceSearchQuery,
  RecommendationContext,
  DiscoveryStrategy,
  ProviderSearchOptions
} from './core/types';

/**
 * Learning Resource Integration Service
 * 
 * Refactored from monolithic 819-line service into modular architecture.
 * Maintains the same public interface while using focused, maintainable components.
 */
export class LearningResourceIntegrationService {
  private discoveryEngine: ResourceDiscoveryEngine;
  private recommendationEngine: RecommendationEngine;

  constructor(private db: Database) {
    this.discoveryEngine = new ResourceDiscoveryEngine();
    this.recommendationEngine = new RecommendationEngine();
    
    logger.info('Learning Resource Integration Service initialized with modular architecture');
  }

  /**
   * Find learning resources for specific skills with filtering and ranking
   * 
   * Main public interface - maintains compatibility with original service
   */
  async findResourcesForSkills(
    skillNames: string[],
    userPreferences: UserPreferences = {},
    filters: ResourceFilter = {}
  ): Promise<ResourceRecommendation[]> {
    try {
      logger.info('Finding resources for skills', {
        skillNames,
        userPreferences,
        filters
      });

      // Validate inputs
      const filterValidation = ResourceUtils.validateFilter(filters);
      if (!filterValidation.valid) {
        throw new Error(`Invalid filter: ${filterValidation.errors.join(', ')}`);
      }

      const preferencesValidation = ResourceUtils.validateUserPreferences(userPreferences);
      if (!preferencesValidation.valid) {
        throw new Error(`Invalid preferences: ${preferencesValidation.errors.join(', ')}`);
      }

      // Step 1: Discover resources
      const searchQuery: ResourceSearchQuery = {
        skillNames,
        filters,
        userPreferences,
        maxResults: 50 // Reasonable limit for processing
      };

      const discoveryResult = await this.discoveryEngine.discoverResources(
        searchQuery,
        'comprehensive'
      );

      // Step 2: Generate recommendations
      if (discoveryResult.resources.length === 0) {
        logger.info('No resources found for the specified criteria');
        return [];
      }

      // Create recommendation context for the primary skill
      const primarySkill = skillNames[0];
      const context: RecommendationContext = {
        skillName: primarySkill,
        targetLevel: this.inferTargetLevel(filters),
        userPreferences
      };

      const recommendations = await this.recommendationEngine.generateRecommendations(
        discoveryResult.resources,
        context,
        20 // Limit recommendations
      );

      logger.info('Resource recommendations generated successfully', {
        totalFound: discoveryResult.totalFound,
        recommendationsGenerated: recommendations.length,
        searchTime: discoveryResult.searchTime
      });

      return recommendations;

    } catch (error) {
      logger.error('Failed to find resources for skills', error);
      throw new Error(`Resource search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get resources for a specific learning path step
   */
  async getResourcesForLearningStep(
    skillName: string,
    currentLevel: string | undefined,
    targetLevel: string,
    userPreferences: UserPreferences = {}
  ): Promise<ResourceRecommendation[]> {
    try {
      logger.info('Getting resources for learning step', {
        skillName,
        currentLevel,
        targetLevel
      });

      // Create appropriate filters for the learning step
      const filters: ResourceFilter = {
        skillNames: [skillName],
        levels: this.getLevelsForProgression(currentLevel, targetLevel)
      };

      // Create recommendation context
      const context: RecommendationContext = {
        skillName,
        currentLevel,
        targetLevel,
        userPreferences
      };

      // Discover resources
      const searchQuery: ResourceSearchQuery = {
        skillNames: [skillName],
        filters,
        userPreferences,
        maxResults: 30
      };

      const discoveryResult = await this.discoveryEngine.discoverResources(
        searchQuery,
        'quality-focused'
      );

      // Generate recommendations
      const recommendations = await this.recommendationEngine.generateRecommendations(
        discoveryResult.resources,
        context,
        10
      );

      logger.info('Learning step resources generated', {
        skillName,
        resourcesFound: discoveryResult.totalFound,
        recommendations: recommendations.length
      });

      return recommendations;

    } catch (error) {
      logger.error('Failed to get resources for learning step', error);
      throw error;
    }
  }

  /**
   * Search resources by query with advanced filtering
   */
  async searchResources(
    query: string,
    filters: ResourceFilter = {},
    userPreferences: UserPreferences = {}
  ): Promise<ResourceRecommendation[]> {
    try {
      logger.info('Searching resources by query', { query, filters });

      // Extract potential skills from the query
      const extractedSkills = ResourceUtils.extractSkillsFromText(query);
      
      // Create search query
      const searchQuery: ResourceSearchQuery = {
        textQuery: query,
        skillNames: extractedSkills.length > 0 ? extractedSkills : undefined,
        filters,
        userPreferences,
        maxResults: 40
      };

      // Discover resources
      const discoveryResult = await this.discoveryEngine.discoverResources(
        searchQuery,
        'fast'
      );

      if (discoveryResult.resources.length === 0) {
        return [];
      }

      // Create context for recommendations
      const primarySkill = extractedSkills[0] || 'General';
      const context: RecommendationContext = {
        skillName: primarySkill,
        targetLevel: this.inferTargetLevel(filters),
        userPreferences
      };

      // Generate recommendations
      const recommendations = await this.recommendationEngine.generateRecommendations(
        discoveryResult.resources,
        context,
        15
      );

      logger.info('Search completed successfully', {
        query,
        totalFound: discoveryResult.totalFound,
        recommendations: recommendations.length
      });

      return recommendations;

    } catch (error) {
      logger.error('Resource search failed', error);
      throw error;
    }
  }

  /**
   * Get trending resources for a category or skill
   */
  async getTrendingResources(
    category?: string,
    skillName?: string,
    limit: number = 20
  ): Promise<LearningResource[]> {
    try {
      logger.info('Getting trending resources', { category, skillName, limit });

      const trendingResources = await this.discoveryEngine.getTrendingResources(
        category,
        skillName,
        limit
      );

      logger.info('Trending resources retrieved', {
        category,
        skillName,
        resourcesFound: trendingResources.length
      });

      return trendingResources;

    } catch (error) {
      logger.error('Failed to get trending resources', error);
      throw error;
    }
  }

  /**
   * Get personalized resource recommendations based on user profile
   */
  async getPersonalizedRecommendations(
    userSkills: string[],
    learningGoals: string[],
    userPreferences: UserPreferences,
    maxRecommendations: number = 15
  ): Promise<ResourceRecommendation[]> {
    try {
      logger.info('Generating personalized recommendations', {
        userSkills: userSkills.length,
        learningGoals: learningGoals.length,
        maxRecommendations
      });

      const allRecommendations: ResourceRecommendation[] = [];

      // Generate recommendations for each learning goal
      for (const goal of learningGoals) {
        const searchQuery: ResourceSearchQuery = {
          skillNames: [goal],
          filters: {
            // Exclude skills the user already has at advanced level
            skillNames: userSkills.includes(goal) ? [] : [goal]
          },
          userPreferences,
          maxResults: 20
        };

        const discoveryResult = await this.discoveryEngine.discoverResources(
          searchQuery,
          'personalized'
        );

        if (discoveryResult.resources.length > 0) {
          const context: RecommendationContext = {
            skillName: goal,
            targetLevel: 'intermediate', // Default target
            userPreferences
          };

          const recommendations = await this.recommendationEngine.generateRecommendations(
            discoveryResult.resources,
            context,
            5 // Limit per goal
          );

          allRecommendations.push(...recommendations);
        }
      }

      // Sort all recommendations by relevance and limit
      const sortedRecommendations = allRecommendations
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, maxRecommendations);

      logger.info('Personalized recommendations generated', {
        totalRecommendations: sortedRecommendations.length,
        averageRelevance: sortedRecommendations.reduce((sum, r) => sum + r.relevanceScore, 0) / sortedRecommendations.length
      });

      return sortedRecommendations;

    } catch (error) {
      logger.error('Failed to generate personalized recommendations', error);
      throw error;
    }
  }

  /**
   * Get resource statistics and analytics
   */
  async getResourceAnalytics(): Promise<{
    totalResources: number;
    providerStats: Record<string, number>;
    categoryStats: Record<string, number>;
    cacheStats: { size: number; hitRate: number };
    discoveryMetrics: any;
  }> {
    try {
      // Get sample resources for analysis
      const sampleQuery: ResourceSearchQuery = {
        filters: {},
        userPreferences: {},
        maxResults: 1000
      };

      const discoveryResult = await this.discoveryEngine.discoverResources(
        sampleQuery,
        'comprehensive',
        { useCache: true }
      );

      const stats = ResourceUtils.calculateResourceStatistics(discoveryResult.resources);
      const cacheStats = this.discoveryEngine.getCacheStats();
      const providerMetrics = this.discoveryEngine.getProviderMetrics();

      return {
        totalResources: stats.totalResources,
        providerStats: stats.providerDistribution,
        categoryStats: Object.fromEntries(
          Object.entries(ResourceUtils.groupResources(discoveryResult.resources, 'category'))
            .map(([key, resources]) => [key, resources.length])
        ),
        cacheStats,
        discoveryMetrics: Object.fromEntries(providerMetrics)
      };

    } catch (error) {
      logger.error('Failed to get resource analytics', error);
      throw error;
    }
  }

  /**
   * Clear all caches
   */
  clearCaches(): void {
    this.discoveryEngine.clearCache();
    logger.info('All resource caches cleared');
  }

  /**
   * Get service health status
   */
  getServiceHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: Record<string, boolean>;
    metrics: Record<string, number>;
  } {
    try {
      const components = {
        discoveryEngine: !!this.discoveryEngine,
        recommendationEngine: !!this.recommendationEngine,
        database: !!this.db
      };

      const allHealthy = Object.values(components).every(Boolean);
      const status = allHealthy ? 'healthy' : 'unhealthy';

      const cacheStats = this.discoveryEngine.getCacheStats();
      const providerMetrics = this.discoveryEngine.getProviderMetrics();

      const metrics = {
        componentsHealthy: Object.values(components).filter(Boolean).length,
        totalComponents: Object.keys(components).length,
        cacheSize: cacheStats.size,
        cacheHitRate: cacheStats.hitRate,
        activeProviders: providerMetrics.size
      };

      return { status, components, metrics };

    } catch (error) {
      logger.error('Health check failed', error);
      return {
        status: 'unhealthy',
        components: {},
        metrics: {}
      };
    }
  }

  // Private helper methods

  /**
   * Infers target level from filters
   */
  private inferTargetLevel(filters: ResourceFilter): string {
    if (filters.levels?.length === 1) {
      return filters.levels[0];
    }
    
    if (filters.levels?.includes('advanced')) {
      return 'advanced';
    }
    
    if (filters.levels?.includes('intermediate')) {
      return 'intermediate';
    }
    
    return 'intermediate'; // Default
  }

  /**
   * Gets appropriate levels for skill progression
   */
  private getLevelsForProgression(
    currentLevel: string | undefined,
    targetLevel: string
  ): string[] {
    const levelOrder = ['beginner', 'intermediate', 'advanced', 'expert'];
    
    if (!currentLevel) {
      // If no current level, include target level and below
      const targetIndex = levelOrder.indexOf(targetLevel);
      return targetIndex >= 0 ? levelOrder.slice(0, targetIndex + 1) : [targetLevel];
    }

    const currentIndex = levelOrder.indexOf(currentLevel);
    const targetIndex = levelOrder.indexOf(targetLevel);

    if (currentIndex >= 0 && targetIndex >= 0) {
      // Include levels from current to target
      const startIndex = Math.max(0, currentIndex);
      const endIndex = Math.min(levelOrder.length - 1, targetIndex + 1);
      return levelOrder.slice(startIndex, endIndex);
    }

    return [targetLevel];
  }
}

// Export all types and utilities for external use
export * from './core/types';
export * from './engines/discoveryEngine';
export * from './engines/recommendationEngine';
export * from './utils/resourceUtils';