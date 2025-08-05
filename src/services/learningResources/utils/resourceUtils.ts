/**
 * Resource Management Utilities
 * 
 * Utility functions for resource validation, formatting, caching,
 * and common operations across the learning resource system.
 */

import { 
  LearningResource, 
  ResourceFilter, 
  UserPreferences,
  ResourceRecommendation,
  ValidationRules,
  ResourceError,
  CacheEntry
} from '../core/types';

export class ResourceUtils {

  /**
   * Validates a learning resource structure
   */
  static validateResource(resource: LearningResource): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!resource.id) errors.push('Resource ID is required');
    if (!resource.title) errors.push('Title is required');
    if (!resource.provider) errors.push('Provider is required');
    if (!resource.url) errors.push('URL is required');
    if (!resource.skillName) errors.push('Skill name is required');

    // Validate enums
    const validTypes = ['course', 'tutorial', 'book', 'certification', 'practice', 'documentation', 'video', 'article'];
    if (!validTypes.includes(resource.type)) {
      errors.push(`Invalid resource type: ${resource.type}`);
    }

    const validLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    if (!validLevels.includes(resource.level)) {
      errors.push(`Invalid level: ${resource.level}`);
    }

    const validFormats = ['online', 'in-person', 'hybrid', 'self-paced', 'instructor-led'];
    if (!validFormats.includes(resource.format)) {
      errors.push(`Invalid format: ${resource.format}`);
    }

    // Validate numeric fields
    if (resource.duration < 0) errors.push('Duration must be non-negative');
    if (resource.rating < 0 || resource.rating > 5) errors.push('Rating must be between 0 and 5');
    if (resource.reviewCount < 0) errors.push('Review count must be non-negative');
    if (resource.price < 0) errors.push('Price must be non-negative');
    if (resource.popularity < 0 || resource.popularity > 1) errors.push('Popularity must be between 0 and 1');

    // Validate arrays
    if (!Array.isArray(resource.prerequisites)) errors.push('Prerequisites must be an array');
    if (!Array.isArray(resource.learningObjectives)) errors.push('Learning objectives must be an array');
    if (!Array.isArray(resource.tags)) errors.push('Tags must be an array');

    // Validate URL format
    try {
      new URL(resource.url);
    } catch {
      errors.push('Invalid URL format');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates resource filter parameters
   */
  static validateFilter(filter: ResourceFilter): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate numeric filters
    if (filter.maxPrice !== undefined && filter.maxPrice < 0) {
      errors.push('Max price must be non-negative');
    }

    if (filter.minRating !== undefined && (filter.minRating < 0 || filter.minRating > 5)) {
      errors.push('Min rating must be between 0 and 5');
    }

    if (filter.maxDuration !== undefined && filter.maxDuration < 0) {
      errors.push('Max duration must be non-negative');
    }

    // Validate enum arrays
    const validTypes = ['course', 'tutorial', 'book', 'certification', 'practice', 'documentation', 'video', 'article'];
    if (filter.types?.some(type => !validTypes.includes(type))) {
      errors.push('Invalid resource type in filter');
    }

    const validLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    if (filter.levels?.some(level => !validLevels.includes(level))) {
      errors.push('Invalid level in filter');
    }

    const validFormats = ['online', 'in-person', 'hybrid', 'self-paced', 'instructor-led'];
    if (filter.formats?.some(format => !validFormats.includes(format))) {
      errors.push('Invalid format in filter');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates user preferences
   */
  static validateUserPreferences(preferences: UserPreferences): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate learning style
    const validLearningStyles = ['visual', 'auditory', 'kinesthetic', 'mixed'];
    if (preferences.learningStyle && !validLearningStyles.includes(preferences.learningStyle)) {
      errors.push(`Invalid learning style: ${preferences.learningStyle}`);
    }

    // Validate time commitment
    if (preferences.timeCommitment !== undefined && preferences.timeCommitment <= 0) {
      errors.push('Time commitment must be positive');
    }

    // Validate budget range
    const validBudgetRanges = ['free', 'low', 'medium', 'high'];
    if (preferences.budgetRange && !validBudgetRanges.includes(preferences.budgetRange)) {
      errors.push(`Invalid budget range: ${preferences.budgetRange}`);
    }

    // Validate difficulty preference
    const validDifficultyPreferences = ['easy-first', 'hard-first', 'balanced'];
    if (preferences.difficultyPreference && !validDifficultyPreferences.includes(preferences.difficultyPreference)) {
      errors.push(`Invalid difficulty preference: ${preferences.difficultyPreference}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Applies validation rules to filter resources
   */
  static applyValidationRules(
    resources: LearningResource[],
    rules: ValidationRules
  ): LearningResource[] {
    return resources.filter(resource => {
      // Min rating rule
      if (rules.minRating !== undefined && resource.rating < rules.minRating) {
        return false;
      }

      // Max price rule
      if (rules.maxPrice !== undefined && resource.price > rules.maxPrice) {
        return false;
      }

      // Required languages rule
      if (rules.requiredLanguages?.length && !rules.requiredLanguages.includes(resource.language)) {
        return false;
      }

      // Blocked providers rule
      if (rules.blockedProviders?.includes(resource.provider)) {
        return false;
      }

      // Min review count rule
      if (rules.minReviewCount !== undefined && resource.reviewCount < rules.minReviewCount) {
        return false;
      }

      // Max age rule
      if (rules.maxAge !== undefined) {
        const resourceAge = this.calculateResourceAge(resource.lastUpdated);
        if (resourceAge > rules.maxAge) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Calculates resource age in months
   */
  static calculateResourceAge(lastUpdated: string): number {
    const updateDate = new Date(lastUpdated);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - updateDate.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    return diffMonths;
  }

  /**
   * Formats resource for display
   */
  static formatResourceForDisplay(resource: LearningResource): {
    title: string;
    summary: string;
    details: string[];
    badges: string[];
  } {
    const title = resource.title;
    
    const summary = `${resource.type} by ${resource.provider} • ${resource.level} • ${resource.duration}h • ${resource.rating}/5`;
    
    const details = [
      `Duration: ${resource.duration} hours`,
      `Level: ${resource.level}`,
      `Format: ${resource.format}`,
      `Language: ${resource.language}`,
      resource.price === 0 ? 'Free' : `$${resource.price} ${resource.currency}`,
      `${resource.reviewCount} reviews`
    ];

    const badges: string[] = [];
    if (resource.price === 0) badges.push('Free');
    if (resource.rating > 4.5) badges.push('Highly Rated');
    if (resource.type === 'certification') badges.push('Certification');
    if (resource.popularity > 0.8) badges.push('Popular');
    
    const resourceAge = this.calculateResourceAge(resource.lastUpdated);
    if (resourceAge <= 6) badges.push('Recently Updated');

    return { title, summary, details, badges };
  }

  /**
   * Formats recommendations for display
   */
  static formatRecommendationsForDisplay(recommendations: ResourceRecommendation[]): {
    summary: string;
    recommendations: Array<{
      resource: LearningResource;
      score: string;
      reasoning: string;
      estimatedTime: string;
    }>;
  } {
    const summary = `${recommendations.length} personalized recommendations found`;
    
    const formattedRecommendations = recommendations.map(rec => ({
      resource: rec.resource,
      score: `${Math.round(rec.relevanceScore * 100)}% match`,
      reasoning: rec.reasoning.join(' • '),
      estimatedTime: `${rec.estimatedCompletionTime} weeks`
    }));

    return {
      summary,
      recommendations: formattedRecommendations
    };
  }

  /**
   * Extracts skills from resource titles and descriptions
   */
  static extractSkillsFromText(text: string): string[] {
    const commonSkills = [
      'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node.js',
      'typescript', 'html', 'css', 'sql', 'mongodb', 'postgresql', 'mysql',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'git', 'linux',
      'machine learning', 'data science', 'artificial intelligence',
      'project management', 'agile', 'scrum', 'devops', 'ci/cd'
    ];

    const lowerText = text.toLowerCase();
    const foundSkills: string[] = [];

    for (const skill of commonSkills) {
      if (lowerText.includes(skill)) {
        foundSkills.push(skill);
      }
    }

    return [...new Set(foundSkills)]; // Remove duplicates
  }

  /**
   * Calculates similarity between two resources
   */
  static calculateResourceSimilarity(resource1: LearningResource, resource2: LearningResource): number {
    let similarity = 0;
    let factors = 0;

    // Skill name similarity
    factors++;
    if (resource1.skillName.toLowerCase() === resource2.skillName.toLowerCase()) {
      similarity += 0.3;
    } else if (resource1.skillName.toLowerCase().includes(resource2.skillName.toLowerCase()) ||
               resource2.skillName.toLowerCase().includes(resource1.skillName.toLowerCase())) {
      similarity += 0.15;
    }

    // Category similarity
    factors++;
    if (resource1.skillCategory === resource2.skillCategory) {
      similarity += 0.2;
    }

    // Type similarity
    factors++;
    if (resource1.type === resource2.type) {
      similarity += 0.15;
    }

    // Level similarity
    factors++;
    if (resource1.level === resource2.level) {
      similarity += 0.1;
    }

    // Provider similarity
    factors++;
    if (resource1.provider === resource2.provider) {
      similarity += 0.1;
    }

    // Tag overlap
    factors++;
    const commonTags = resource1.tags.filter(tag => resource2.tags.includes(tag));
    if (commonTags.length > 0) {
      similarity += Math.min(0.15, commonTags.length * 0.05);
    }

    return similarity;
  }

  /**
   * Groups resources by category or skill
   */
  static groupResources(
    resources: LearningResource[],
    groupBy: 'category' | 'skill' | 'provider' | 'type' | 'level'
  ): Record<string, LearningResource[]> {
    const groups: Record<string, LearningResource[]> = {};

    for (const resource of resources) {
      let key: string;
      
      switch (groupBy) {
        case 'category':
          key = resource.skillCategory;
          break;
        case 'skill':
          key = resource.skillName;
          break;
        case 'provider':
          key = resource.provider;
          break;
        case 'type':
          key = resource.type;
          break;
        case 'level':
          key = resource.level;
          break;
        default:
          key = 'other';
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(resource);
    }

    return groups;
  }

  /**
   * Calculates resource statistics
   */
  static calculateResourceStatistics(resources: LearningResource[]): {
    totalResources: number;
    averageRating: number;
    averageDuration: number;
    averagePrice: number;
    freeResourcesCount: number;
    typeDistribution: Record<string, number>;
    levelDistribution: Record<string, number>;
    providerDistribution: Record<string, number>;
  } {
    if (resources.length === 0) {
      return {
        totalResources: 0,
        averageRating: 0,
        averageDuration: 0,
        averagePrice: 0,
        freeResourcesCount: 0,
        typeDistribution: {},
        levelDistribution: {},
        providerDistribution: {}
      };
    }

    const totalResources = resources.length;
    const averageRating = resources.reduce((sum, r) => sum + r.rating, 0) / totalResources;
    const averageDuration = resources.reduce((sum, r) => sum + r.duration, 0) / totalResources;
    const averagePrice = resources.reduce((sum, r) => sum + r.price, 0) / totalResources;
    const freeResourcesCount = resources.filter(r => r.price === 0).length;

    const typeDistribution: Record<string, number> = {};
    const levelDistribution: Record<string, number> = {};
    const providerDistribution: Record<string, number> = {};

    for (const resource of resources) {
      typeDistribution[resource.type] = (typeDistribution[resource.type] || 0) + 1;
      levelDistribution[resource.level] = (levelDistribution[resource.level] || 0) + 1;
      providerDistribution[resource.provider] = (providerDistribution[resource.provider] || 0) + 1;
    }

    return {
      totalResources,
      averageRating: Math.round(averageRating * 100) / 100,
      averageDuration: Math.round(averageDuration * 100) / 100,
      averagePrice: Math.round(averagePrice * 100) / 100,
      freeResourcesCount,
      typeDistribution,
      levelDistribution,
      providerDistribution
    };
  }

  /**
   * Creates a resource error object
   */
  static createResourceError(
    code: string,
    message: string,
    provider?: string,
    retryable: boolean = false,
    details?: any
  ): ResourceError {
    return {
      code,
      message,
      provider,
      retryable,
      details
    };
  }

  /**
   * Sanitizes resource data for safe storage/display
   */
  static sanitizeResource(resource: LearningResource): LearningResource {
    return {
      ...resource,
      title: this.sanitizeString(resource.title),
      description: this.sanitizeString(resource.description),
      skillName: this.sanitizeString(resource.skillName),
      skillCategory: this.sanitizeString(resource.skillCategory),
      provider: this.sanitizeString(resource.provider),
      tags: resource.tags.map(tag => this.sanitizeString(tag)),
      learningObjectives: resource.learningObjectives.map(obj => this.sanitizeString(obj)),
      prerequisites: resource.prerequisites.map(prereq => this.sanitizeString(prereq))
    };
  }

  /**
   * Sanitizes a string by removing potentially harmful content
   */
  private static sanitizeString(str: string): string {
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .trim();
  }

  /**
   * Generates a unique resource ID
   */
  static generateResourceId(provider: string, skillName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${provider}-${skillName.toLowerCase().replace(/\s+/g, '-')}-${timestamp}-${random}`;
  }

  /**
   * Compares two resource arrays for differences
   */
  static compareResourceArrays(
    oldResources: LearningResource[],
    newResources: LearningResource[]
  ): {
    added: LearningResource[];
    removed: LearningResource[];
    updated: LearningResource[];
  } {
    const oldMap = new Map(oldResources.map(r => [r.id, r]));
    const newMap = new Map(newResources.map(r => [r.id, r]));

    const added = newResources.filter(r => !oldMap.has(r.id));
    const removed = oldResources.filter(r => !newMap.has(r.id));
    const updated = newResources.filter(r => {
      const oldResource = oldMap.get(r.id);
      return oldResource && JSON.stringify(oldResource) !== JSON.stringify(r);
    });

    return { added, removed, updated };
  }
}