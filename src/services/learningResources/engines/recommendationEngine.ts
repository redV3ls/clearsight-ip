/**
 * Resource Recommendation Engine
 * 
 * Generates personalized learning resource recommendations based on user
 * preferences, learning objectives, and intelligent ranking algorithms.
 */

import { logger } from '../../../utils/logger';
import { 
  LearningResource, 
  ResourceRecommendation, 
  UserPreferences, 
  RecommendationContext,
  ResourceRanking,
  RelevanceFactors,
  QualityIndicators,
  LEARNING_STYLE_PREFERENCES,
  BUDGET_RANGES,
  LEVEL_PROGRESSION,
  RESOURCE_TYPE_PRIORITIES
} from '../core/types';

export class RecommendationEngine {

  /**
   * Generates personalized recommendations from a list of resources
   */
  async generateRecommendations(
    resources: LearningResource[],
    context: RecommendationContext,
    maxRecommendations: number = 10
  ): Promise<ResourceRecommendation[]> {
    try {
      logger.info('Generating resource recommendations', {
        resourceCount: resources.length,
        skillName: context.skillName,
        currentLevel: context.currentLevel,
        targetLevel: context.targetLevel,
        maxRecommendations
      });

      if (resources.length === 0) {
        return [];
      }

      // Step 1: Calculate relevance scores
      const scoredResources = this.calculateRelevanceScores(resources, context);

      // Step 2: Rank resources by multiple factors
      const rankedResources = this.rankResources(scoredResources, context.userPreferences);

      // Step 3: Generate recommendations with reasoning
      const recommendations = this.buildRecommendations(
        rankedResources.slice(0, maxRecommendations),
        context
      );

      logger.info('Recommendations generated successfully', {
        totalRecommendations: recommendations.length,
        averageRelevance: recommendations.reduce((sum, r) => sum + r.relevanceScore, 0) / recommendations.length
      });

      return recommendations;

    } catch (error) {
      logger.error('Failed to generate recommendations', error);
      throw new Error(`Recommendation generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculates relevance scores for resources based on user context
   */
  private calculateRelevanceScores(
    resources: LearningResource[],
    context: RecommendationContext
  ): LearningResource[] {
    return resources.map(resource => {
      const factors = this.calculateRelevanceFactors(resource, context);
      const relevanceScore = this.combineRelevanceFactors(factors);
      
      return {
        ...resource,
        relevanceScore
      };
    });
  }

  /**
   * Calculates individual relevance factors for a resource
   */
  private calculateRelevanceFactors(
    resource: LearningResource,
    context: RecommendationContext
  ): RelevanceFactors {
    return {
      skillMatch: this.calculateSkillMatch(resource, context.skillName),
      levelMatch: this.calculateLevelMatch(resource, context.currentLevel, context.targetLevel),
      typePreference: this.calculateTypePreference(resource, context.userPreferences),
      formatPreference: this.calculateFormatPreference(resource, context.userPreferences),
      languageMatch: this.calculateLanguageMatch(resource, context.userPreferences),
      budgetFit: this.calculateBudgetFit(resource, context.userPreferences),
      timeCommitmentFit: this.calculateTimeCommitmentFit(resource, context.userPreferences),
      providerPreference: this.calculateProviderPreference(resource, context.userPreferences)
    };
  }

  /**
   * Combines relevance factors into a single score
   */
  private combineRelevanceFactors(factors: RelevanceFactors): number {
    const weights = {
      skillMatch: 0.25,
      levelMatch: 0.20,
      typePreference: 0.15,
      formatPreference: 0.10,
      languageMatch: 0.10,
      budgetFit: 0.10,
      timeCommitmentFit: 0.05,
      providerPreference: 0.05
    };

    let score = 0;
    for (const [factor, value] of Object.entries(factors)) {
      score += value * (weights[factor as keyof typeof weights] || 0);
    }

    return Math.min(1, Math.max(0, score));
  }

  /**
   * Individual factor calculation methods
   */
  private calculateSkillMatch(resource: LearningResource, targetSkill: string): number {
    const resourceSkill = resource.skillName.toLowerCase();
    const target = targetSkill.toLowerCase();
    
    // Exact match
    if (resourceSkill === target) return 1.0;
    
    // Partial match
    if (resourceSkill.includes(target) || target.includes(resourceSkill)) return 0.8;
    
    // Tag match
    if (resource.tags.some(tag => tag.toLowerCase().includes(target))) return 0.6;
    
    // Category match
    if (resource.skillCategory.toLowerCase().includes(target)) return 0.4;
    
    return 0.2; // Base score for being in the same domain
  }

  private calculateLevelMatch(
    resource: LearningResource, 
    currentLevel?: string, 
    targetLevel?: string
  ): number {
    if (!targetLevel) return 0.5;
    
    const appropriateLevels = LEVEL_PROGRESSION[targetLevel as keyof typeof LEVEL_PROGRESSION] || [targetLevel];
    
    if (appropriateLevels.includes(resource.level)) {
      // Perfect match for target level
      if (resource.level === targetLevel) return 1.0;
      
      // Good match for progression path
      return 0.8;
    }
    
    // Penalty for too advanced or too basic
    const levelOrder = ['beginner', 'intermediate', 'advanced', 'expert'];
    const resourceIndex = levelOrder.indexOf(resource.level);
    const targetIndex = levelOrder.indexOf(targetLevel);
    
    if (resourceIndex === -1 || targetIndex === -1) return 0.3;
    
    const difference = Math.abs(resourceIndex - targetIndex);
    return Math.max(0.1, 1 - (difference * 0.3));
  }

  private calculateTypePreference(resource: LearningResource, preferences: UserPreferences): number {
    if (!preferences.learningStyle) return 0.5;
    
    const preferredTypes = LEARNING_STYLE_PREFERENCES[preferences.learningStyle];
    
    if (preferredTypes.includes(resource.type)) return 1.0;
    
    // Partial match for compatible types
    if (preferences.learningStyle === 'mixed') return 0.8;
    
    return 0.3;
  }

  private calculateFormatPreference(resource: LearningResource, preferences: UserPreferences): number {
    if (!preferences.preferredFormats?.length) return 0.5;
    
    if (preferences.preferredFormats.includes(resource.format)) return 1.0;
    
    // Compatible formats
    const compatibleFormats = {
      'online': ['self-paced'],
      'self-paced': ['online'],
      'instructor-led': ['hybrid'],
      'hybrid': ['instructor-led', 'online']
    };
    
    const compatible = compatibleFormats[resource.format as keyof typeof compatibleFormats] || [];
    if (preferences.preferredFormats.some(pref => compatible.includes(pref))) {
      return 0.7;
    }
    
    return 0.2;
  }

  private calculateLanguageMatch(resource: LearningResource, preferences: UserPreferences): number {
    if (!preferences.languages?.length) return 0.8; // Assume English is acceptable
    
    if (preferences.languages.includes(resource.language)) return 1.0;
    
    // English as fallback
    if (resource.language === 'en' && !preferences.languages.includes('en')) return 0.6;
    
    return 0.1;
  }

  private calculateBudgetFit(resource: LearningResource, preferences: UserPreferences): number {
    if (!preferences.budgetRange) return 0.5;
    
    const budgetRange = BUDGET_RANGES[preferences.budgetRange];
    
    if (resource.price >= budgetRange.min && resource.price <= budgetRange.max) {
      return 1.0;
    }
    
    // Penalty for being over budget
    if (resource.price > budgetRange.max) {
      const overage = resource.price - budgetRange.max;
      return Math.max(0, 1 - (overage / budgetRange.max));
    }
    
    return 0.8; // Under budget is generally good
  }

  private calculateTimeCommitmentFit(resource: LearningResource, preferences: UserPreferences): number {
    if (!preferences.timeCommitment) return 0.5;
    
    const weeksToComplete = resource.duration / preferences.timeCommitment;
    
    // Ideal range: 2-8 weeks
    if (weeksToComplete >= 2 && weeksToComplete <= 8) return 1.0;
    
    // Too short (less than 2 weeks)
    if (weeksToComplete < 2) return 0.7;
    
    // Too long (more than 8 weeks)
    if (weeksToComplete > 8) {
      return Math.max(0.2, 1 - ((weeksToComplete - 8) * 0.1));
    }
    
    return 0.5;
  }

  private calculateProviderPreference(resource: LearningResource, preferences: UserPreferences): number {
    if (!preferences.preferredProviders?.length) return 0.5;
    
    if (preferences.preferredProviders.includes(resource.provider)) return 1.0;
    
    return 0.3;
  }

  /**
   * Ranks resources by combining multiple scoring factors
   */
  private rankResources(
    resources: LearningResource[],
    preferences: UserPreferences
  ): ResourceRanking[] {
    return resources.map(resource => {
      const qualityScore = this.calculateQualityScore(resource);
      const popularityScore = resource.popularity;
      const recencyScore = this.calculateRecencyScore(resource.lastUpdated);
      const relevanceScore = resource.relevanceScore || 0;
      const userFitScore = this.calculateUserFitScore(resource, preferences);

      // Weighted combination of all factors
      const overallScore = 
        relevanceScore * 0.35 +
        qualityScore * 0.25 +
        userFitScore * 0.20 +
        popularityScore * 0.15 +
        recencyScore * 0.05;

      return {
        resource,
        score: overallScore,
        factors: {
          relevance: relevanceScore,
          quality: qualityScore,
          userFit: userFitScore,
          popularity: popularityScore,
          recency: recencyScore
        }
      };
    }).sort((a, b) => b.score - a.score);
  }

  /**
   * Calculates quality score based on various indicators
   */
  private calculateQualityScore(resource: LearningResource): number {
    const indicators = this.getQualityIndicators(resource);
    
    let score = 0.5; // Base score
    
    if (indicators.hasReviews) score += 0.1;
    if (indicators.highRating) score += 0.2;
    if (indicators.recentlyUpdated) score += 0.1;
    if (indicators.popularProvider) score += 0.1;
    if (indicators.comprehensiveContent) score += 0.1;
    if (indicators.hasPrerequisites) score += 0.05;
    if (indicators.hasCertification) score += 0.15;
    
    return Math.min(1, score);
  }

  /**
   * Gets quality indicators for a resource
   */
  private getQualityIndicators(resource: LearningResource): QualityIndicators {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    return {
      hasReviews: resource.reviewCount > 0,
      highRating: resource.rating > 4.0,
      recentlyUpdated: new Date(resource.lastUpdated) > oneYearAgo,
      popularProvider: ['coursera', 'udemy', 'pluralsight', 'edx'].includes(resource.provider),
      comprehensiveContent: resource.duration > 10 || resource.description.length > 200,
      hasPrerequisites: resource.prerequisites.length > 0,
      hasCertification: resource.type === 'certification' || resource.title.toLowerCase().includes('certificate')
    };
  }

  /**
   * Calculates recency score based on last updated date
   */
  private calculateRecencyScore(lastUpdated: string): number {
    const updateDate = new Date(lastUpdated);
    const now = new Date();
    const daysDiff = (now.getTime() - updateDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Score decreases with age
    if (daysDiff <= 30) return 1.0; // Very recent
    if (daysDiff <= 90) return 0.8; // Recent
    if (daysDiff <= 365) return 0.6; // Within a year
    if (daysDiff <= 730) return 0.4; // Within two years
    
    return 0.2; // Older than two years
  }

  /**
   * Calculates how well a resource fits user preferences
   */
  private calculateUserFitScore(resource: LearningResource, preferences: UserPreferences): number {
    let score = 0;
    let maxScore = 0;

    // Learning style fit
    if (preferences.learningStyle) {
      maxScore += 1;
      const preferredTypes = LEARNING_STYLE_PREFERENCES[preferences.learningStyle];
      if (preferredTypes.includes(resource.type)) {
        score += 1;
      } else if (preferences.learningStyle === 'mixed') {
        score += 0.7;
      }
    }

    // Format preference
    if (preferences.preferredFormats?.length) {
      maxScore += 1;
      if (preferences.preferredFormats.includes(resource.format)) {
        score += 1;
      }
    }

    // Provider preference
    if (preferences.preferredProviders?.length) {
      maxScore += 1;
      if (preferences.preferredProviders.includes(resource.provider)) {
        score += 1;
      }
    }

    // Certification preference
    if (preferences.certificationPreference !== undefined) {
      maxScore += 1;
      const hasCertification = resource.type === 'certification';
      if (preferences.certificationPreference === hasCertification) {
        score += 1;
      }
    }

    return maxScore > 0 ? score / maxScore : 0.5;
  }

  /**
   * Builds final recommendations with reasoning
   */
  private buildRecommendations(
    rankedResources: ResourceRanking[],
    context: RecommendationContext
  ): ResourceRecommendation[] {
    return rankedResources.map((ranking, index) => {
      const reasoning = this.generateReasoning(ranking, context, index);
      const matchedCriteria = this.getMatchedCriteria(ranking.resource, context);
      const estimatedCompletionTime = this.calculateCompletionTime(
        ranking.resource,
        context.userPreferences
      );

      return {
        resource: ranking.resource,
        relevanceScore: ranking.factors.relevance,
        reasoning,
        matchedCriteria,
        estimatedCompletionTime,
        fitScore: ranking.factors.userFit
      };
    });
  }

  /**
   * Generates reasoning for why a resource is recommended
   */
  private generateReasoning(
    ranking: ResourceRanking,
    context: RecommendationContext,
    position: number
  ): string[] {
    const reasoning: string[] = [];
    const resource = ranking.resource;
    const factors = ranking.factors;

    // Position-based reasoning
    if (position === 0) {
      reasoning.push('Top recommendation based on your preferences and learning goals');
    } else if (position < 3) {
      reasoning.push('Highly recommended option that matches your criteria well');
    }

    // Relevance reasoning
    if (factors.relevance > 0.8) {
      reasoning.push(`Excellent match for ${context.skillName} learning`);
    } else if (factors.relevance > 0.6) {
      reasoning.push(`Good fit for your ${context.skillName} learning goals`);
    }

    // Quality reasoning
    if (factors.quality > 0.8) {
      reasoning.push('High-quality resource with excellent reviews and content');
    } else if (resource.rating > 4.5) {
      reasoning.push(`Highly rated (${resource.rating}/5) by ${resource.reviewCount} learners`);
    }

    // Level reasoning
    if (context.currentLevel && context.targetLevel) {
      if (resource.level === context.targetLevel) {
        reasoning.push(`Perfect for reaching ${context.targetLevel} level`);
      } else if (resource.level === context.currentLevel) {
        reasoning.push(`Builds on your current ${context.currentLevel} level`);
      }
    }

    // Format reasoning
    if (context.userPreferences.preferredFormats?.includes(resource.format)) {
      reasoning.push(`Matches your preferred ${resource.format} learning format`);
    }

    // Budget reasoning
    if (resource.price === 0) {
      reasoning.push('Free resource - great value for learning');
    } else if (context.userPreferences.budgetRange === 'low' && resource.price < 50) {
      reasoning.push('Affordable option within your budget range');
    }

    // Time reasoning
    if (context.userPreferences.timeCommitment) {
      const weeks = Math.ceil(resource.duration / context.userPreferences.timeCommitment);
      if (weeks <= 4) {
        reasoning.push(`Can be completed in ${weeks} weeks with your time commitment`);
      }
    }

    // Provider reasoning
    if (factors.quality > 0.7) {
      reasoning.push(`From ${resource.provider}, a trusted learning platform`);
    }

    return reasoning.slice(0, 4); // Limit to 4 reasons
  }

  /**
   * Gets criteria that the resource matches
   */
  private getMatchedCriteria(resource: LearningResource, context: RecommendationContext): string[] {
    const criteria: string[] = [];

    criteria.push(`Skill: ${resource.skillName}`);
    criteria.push(`Level: ${resource.level}`);
    criteria.push(`Type: ${resource.type}`);
    criteria.push(`Format: ${resource.format}`);
    
    if (resource.price === 0) {
      criteria.push('Free');
    }
    
    if (resource.rating > 4.0) {
      criteria.push('Highly Rated');
    }
    
    if (resource.type === 'certification') {
      criteria.push('Certification Available');
    }

    return criteria;
  }

  /**
   * Calculates estimated completion time in weeks
   */
  private calculateCompletionTime(
    resource: LearningResource,
    preferences: UserPreferences
  ): number {
    const hoursPerWeek = preferences.timeCommitment || 5; // Default 5 hours/week
    return Math.ceil(resource.duration / hoursPerWeek);
  }

  /**
   * Public utility methods
   */
  
  /**
   * Gets recommendation statistics
   */
  getRecommendationStats(recommendations: ResourceRecommendation[]): {
    averageRelevance: number;
    averageFitScore: number;
    typeDistribution: Record<string, number>;
    providerDistribution: Record<string, number>;
    levelDistribution: Record<string, number>;
  } {
    if (recommendations.length === 0) {
      return {
        averageRelevance: 0,
        averageFitScore: 0,
        typeDistribution: {},
        providerDistribution: {},
        levelDistribution: {}
      };
    }

    const averageRelevance = recommendations.reduce((sum, r) => sum + r.relevanceScore, 0) / recommendations.length;
    const averageFitScore = recommendations.reduce((sum, r) => sum + r.fitScore, 0) / recommendations.length;

    const typeDistribution: Record<string, number> = {};
    const providerDistribution: Record<string, number> = {};
    const levelDistribution: Record<string, number> = {};

    for (const rec of recommendations) {
      const resource = rec.resource;
      
      typeDistribution[resource.type] = (typeDistribution[resource.type] || 0) + 1;
      providerDistribution[resource.provider] = (providerDistribution[resource.provider] || 0) + 1;
      levelDistribution[resource.level] = (levelDistribution[resource.level] || 0) + 1;
    }

    return {
      averageRelevance: Math.round(averageRelevance * 100) / 100,
      averageFitScore: Math.round(averageFitScore * 100) / 100,
      typeDistribution,
      providerDistribution,
      levelDistribution
    };
  }
}