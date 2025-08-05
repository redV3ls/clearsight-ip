/**
 * Learning Resources Core Types
 * 
 * Shared type definitions for the learning resource integration system.
 * Provides consistent interfaces across all resource management modules.
 */

export interface LearningResource {
  id: string;
  title: string;
  description: string;
  provider: string;
  type: 'course' | 'tutorial' | 'book' | 'certification' | 'practice' | 'documentation' | 'video' | 'article';
  url: string;
  skillName: string;
  skillCategory: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number; // in hours
  rating: number; // 0-5 scale
  reviewCount: number;
  price: number; // 0 for free
  currency: string;
  language: string;
  format: 'online' | 'in-person' | 'hybrid' | 'self-paced' | 'instructor-led';
  prerequisites: string[];
  learningObjectives: string[];
  tags: string[];
  lastUpdated: string;
  popularity: number; // 0-1 scale
  relevanceScore?: number; // Calculated based on user preferences
}

export interface ResourceFilter {
  skillNames?: string[];
  categories?: string[];
  types?: LearningResource['type'][];
  levels?: LearningResource['level'][];
  maxPrice?: number;
  minRating?: number;
  languages?: string[];
  formats?: LearningResource['format'][];
  maxDuration?: number;
  providers?: string[];
  freeOnly?: boolean;
}

export interface UserPreferences {
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  timeCommitment?: number; // hours per week
  budgetRange?: 'free' | 'low' | 'medium' | 'high';
  preferredFormats?: LearningResource['format'][];
  preferredProviders?: string[];
  languages?: string[];
  certificationPreference?: boolean;
  difficultyPreference?: 'easy-first' | 'hard-first' | 'balanced';
}

export interface ResourceRecommendation {
  resource: LearningResource;
  relevanceScore: number;
  reasoning: string[];
  matchedCriteria: string[];
  estimatedCompletionTime: number; // in weeks
  fitScore: number; // How well it fits user preferences (0-1)
}

export interface ResourceProvider {
  name: string;
  baseUrl: string;
  apiKey?: string;
  rateLimit: number; // requests per minute
  supportedTypes: LearningResource['type'][];
  searchCapabilities: {
    bySkill: boolean;
    byLevel: boolean;
    byDuration: boolean;
    byPrice: boolean;
    byRating: boolean;
  };
}

export interface ResourceSearchQuery {
  skillNames?: string[];
  textQuery?: string;
  filters: ResourceFilter;
  userPreferences: UserPreferences;
  maxResults?: number;
}

export interface ResourceSearchResult {
  resources: LearningResource[];
  totalFound: number;
  searchTime: number;
  providers: string[];
  cacheHit: boolean;
}

export interface RecommendationContext {
  skillName: string;
  currentLevel?: string;
  targetLevel: string;
  userPreferences: UserPreferences;
  learningObjectives?: string[];
}

export interface ProviderSearchOptions {
  maxResults?: number;
  timeout?: number;
  useCache?: boolean;
  cacheExpiry?: number;
}

export interface ResourceRanking {
  resource: LearningResource;
  score: number;
  factors: {
    relevance: number;
    quality: number;
    userFit: number;
    popularity: number;
    recency: number;
  };
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
  key: string;
}

export interface ProviderMetrics {
  name: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastRequestTime: number;
  rateLimitHits: number;
}

// Resource type mappings for different learning styles
export const LEARNING_STYLE_PREFERENCES = {
  visual: ['video', 'tutorial', 'documentation'],
  auditory: ['course', 'video'],
  kinesthetic: ['practice', 'tutorial', 'course'],
  mixed: ['course', 'tutorial', 'video', 'practice']
} as const;

// Budget range mappings
export const BUDGET_RANGES = {
  free: { min: 0, max: 0 },
  low: { min: 0, max: 50 },
  medium: { min: 0, max: 200 },
  high: { min: 0, max: 1000 }
} as const;

// Skill level progression mapping
export const LEVEL_PROGRESSION = {
  beginner: ['beginner'],
  intermediate: ['beginner', 'intermediate'],
  advanced: ['intermediate', 'advanced'],
  expert: ['advanced', 'expert']
} as const;

// Resource type priorities by learning objective
export const RESOURCE_TYPE_PRIORITIES = {
  'learn-fundamentals': ['course', 'tutorial', 'book', 'documentation'],
  'practice-skills': ['practice', 'tutorial', 'course'],
  'get-certified': ['certification', 'course', 'practice'],
  'stay-updated': ['article', 'documentation', 'video'],
  'deep-dive': ['book', 'course', 'documentation']
} as const;

// Common skill categories
export const SKILL_CATEGORIES = {
  PROGRAMMING: 'Programming',
  WEB_DEVELOPMENT: 'Web Development',
  DATA_SCIENCE: 'Data Science',
  CLOUD_COMPUTING: 'Cloud Computing',
  DEVOPS: 'DevOps',
  MOBILE_DEVELOPMENT: 'Mobile Development',
  DESIGN: 'Design',
  PROJECT_MANAGEMENT: 'Project Management',
  CYBERSECURITY: 'Cybersecurity',
  AI_ML: 'AI & Machine Learning',
  DATABASE: 'Database',
  TESTING: 'Testing & QA'
} as const;

// Provider reliability scores (0-1)
export const PROVIDER_RELIABILITY = {
  coursera: 0.95,
  udemy: 0.85,
  pluralsight: 0.90,
  linkedin: 0.88,
  edx: 0.92,
  youtube: 0.70,
  github: 0.80,
  stackoverflow: 0.75,
  medium: 0.65,
  documentation: 0.85
} as const;

// Quality indicators for resources
export interface QualityIndicators {
  hasReviews: boolean;
  highRating: boolean; // > 4.0
  recentlyUpdated: boolean; // < 1 year
  popularProvider: boolean;
  comprehensiveContent: boolean; // > 10 hours or detailed description
  hasPrerequisites: boolean;
  hasCertification: boolean;
}

// Search relevance factors
export interface RelevanceFactors {
  skillMatch: number; // 0-1
  levelMatch: number; // 0-1
  typePreference: number; // 0-1
  formatPreference: number; // 0-1
  languageMatch: number; // 0-1
  budgetFit: number; // 0-1
  timeCommitmentFit: number; // 0-1
  providerPreference: number; // 0-1
}

// Resource discovery strategies
export type DiscoveryStrategy = 
  | 'comprehensive' // Search all providers
  | 'fast' // Search top providers only
  | 'budget-conscious' // Prioritize free/low-cost
  | 'quality-focused' // Prioritize high-rated resources
  | 'trending' // Focus on popular/recent resources
  | 'personalized'; // Heavily weight user preferences

// Cache strategies
export type CacheStrategy = 
  | 'aggressive' // Cache everything for long periods
  | 'moderate' // Cache popular queries
  | 'minimal' // Cache only expensive operations
  | 'disabled'; // No caching

// Error types for resource operations
export interface ResourceError {
  code: string;
  message: string;
  provider?: string;
  retryable: boolean;
  details?: any;
}

// Resource validation rules
export interface ValidationRules {
  minRating?: number;
  maxPrice?: number;
  requiredLanguages?: string[];
  blockedProviders?: string[];
  minReviewCount?: number;
  maxAge?: number; // in months
}