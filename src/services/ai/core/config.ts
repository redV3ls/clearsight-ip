/**
 * AI Service Configuration
 * 
 * Centralized configuration for all AI services.
 * Provides default settings and environment-specific overrides.
 */

import { AIServiceConfig } from './base';

// Default AI service configurations
export const DEFAULT_AI_CONFIG: AIServiceConfig = {
  provider: 'deepseek',
  model: 'deepseek-chat',
  maxTokens: 4000,
  temperature: 0.7,
  timeout: 30000, // 30 seconds
  retryAttempts: 3
};

// Service-specific configurations
export const AI_SERVICE_CONFIGS = {
  multiLanguage: {
    ...DEFAULT_AI_CONFIG,
    maxTokens: 6000,
    temperature: 0.5
  },
  industrySpecific: {
    ...DEFAULT_AI_CONFIG,
    maxTokens: 5000,
    temperature: 0.6
  },
  personalizedCoaching: {
    ...DEFAULT_AI_CONFIG,
    maxTokens: 8000,
    temperature: 0.8
  },
  skillTrendPrediction: {
    ...DEFAULT_AI_CONFIG,
    maxTokens: 4000,
    temperature: 0.3
  },
  competitiveAnalysis: {
    ...DEFAULT_AI_CONFIG,
    maxTokens: 5000,
    temperature: 0.4
  },
  interviewPreparation: {
    ...DEFAULT_AI_CONFIG,
    maxTokens: 6000,
    temperature: 0.7
  }
} as const;

// Feature flags for AI services
export const AI_FEATURE_FLAGS = {
  MULTI_LANGUAGE_ENABLED: true,
  INDUSTRY_SPECIFIC_ENABLED: true,
  PERSONALIZED_COACHING_ENABLED: true,
  SKILL_TREND_PREDICTION_ENABLED: true,
  COMPETITIVE_ANALYSIS_ENABLED: true,
  INTERVIEW_PREPARATION_ENABLED: true,
  ADVANCED_ANALYTICS_ENABLED: false, // Beta feature
  REAL_TIME_FEEDBACK_ENABLED: false  // Beta feature
} as const;

// Supported languages for multi-language analysis
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'ru', name: 'Russian', native: 'Русский' }
] as const;

// Industry categories for industry-specific analysis
export const INDUSTRY_CATEGORIES = [
  'technology',
  'healthcare',
  'finance',
  'education',
  'manufacturing',
  'retail',
  'consulting',
  'media',
  'government',
  'nonprofit',
  'automotive',
  'aerospace',
  'energy',
  'telecommunications',
  'real-estate',
  'hospitality',
  'transportation',
  'agriculture',
  'construction',
  'legal'
] as const;

// Rate limiting configurations
export const AI_RATE_LIMITS = {
  FREE_TIER: {
    requestsPerHour: 10,
    requestsPerDay: 50,
    maxConcurrent: 2
  },
  PREMIUM_TIER: {
    requestsPerHour: 100,
    requestsPerDay: 500,
    maxConcurrent: 5
  },
  ENTERPRISE_TIER: {
    requestsPerHour: 1000,
    requestsPerDay: 5000,
    maxConcurrent: 10
  }
} as const;

/**
 * Gets AI service configuration based on environment and service type
 */
export function getAIServiceConfig(
  serviceName: keyof typeof AI_SERVICE_CONFIGS,
  environment: 'development' | 'staging' | 'production' = 'production'
): AIServiceConfig {
  const baseConfig = AI_SERVICE_CONFIGS[serviceName];
  
  // Environment-specific overrides
  const environmentOverrides = {
    development: {
      timeout: baseConfig.timeout * 2, // Longer timeout for dev
      retryAttempts: 1 // Fewer retries for faster feedback
    },
    staging: {
      timeout: baseConfig.timeout * 1.5,
      retryAttempts: 2
    },
    production: {} // Use defaults
  };
  
  return {
    ...baseConfig,
    ...environmentOverrides[environment]
  };
}

/**
 * Checks if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof AI_FEATURE_FLAGS): boolean {
  return AI_FEATURE_FLAGS[feature];
}

/**
 * Gets rate limit configuration based on user tier
 */
export function getRateLimitConfig(tier: 'free' | 'premium' | 'enterprise') {
  const tierMap = {
    free: AI_RATE_LIMITS.FREE_TIER,
    premium: AI_RATE_LIMITS.PREMIUM_TIER,
    enterprise: AI_RATE_LIMITS.ENTERPRISE_TIER
  };
  
  return tierMap[tier];
}

/**
 * Get AI configuration from environment variables
 */
export function getAIConfig(env: any): AIProviderConfig {
  return {
    deepseek: {
      ...DEFAULT_AI_CONFIG.deepseek,
      apiKey: env.DEEPSEEK_API_KEY || '',
      baseUrl: env.DEEPSEEK_BASE_URL || DEFAULT_AI_CONFIG.deepseek.baseUrl
    }
  };
}

/**
 * Validate AI configuration
 */
export function validateAIConfig(config: AIServiceConfig): void {
  if (!config.apiKey) {
    throw new Error(`API key is required for ${config.provider}`);
  }
  
  if (!config.baseUrl) {
    throw new Error(`Base URL is required for ${config.provider}`);
  }
  
  if (config.maxTokens <= 0) {
    throw new Error('Max tokens must be positive');
  }
  
  if (config.temperature < 0 || config.temperature > 2) {
    throw new Error('Temperature must be between 0 and 2');
  }
  
  if (config.timeout <= 0) {
    throw new Error('Timeout must be positive');
  }
}