import { AIConfig } from '../services/deepseekAI';

/**
 * AI Configuration for DeepSeek integration
 */
export const createAIConfig = (env: any): AIConfig => {
  return {
    provider: 'deepseek',
    model: env.DEEPSEEK_MODEL || 'deepseek-reasoner',
    apiKey: env.DEEPSEEK_API_KEY || '',
    baseUrl: env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
    maxTokens: parseInt(env.DEEPSEEK_MAX_TOKENS || '4000'),
    temperature: parseFloat(env.DEEPSEEK_TEMPERATURE || '0.7'),
    timeout: parseInt(env.DEEPSEEK_TIMEOUT || '30000'), // 30 seconds
  };
};

/**
 * Validate AI configuration
 */
export const validateAIConfig = (config: AIConfig): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!config.apiKey) {
    errors.push('DEEPSEEK_API_KEY is required');
  }

  if (!config.baseUrl) {
    errors.push('DEEPSEEK_BASE_URL is required');
  }

  if (config.maxTokens <= 0 || config.maxTokens > 32000) {
    errors.push('DEEPSEEK_MAX_TOKENS must be between 1 and 32000');
  }

  if (config.temperature < 0 || config.temperature > 2) {
    errors.push('DEEPSEEK_TEMPERATURE must be between 0 and 2');
  }

  if (config.timeout <= 0) {
    errors.push('DEEPSEEK_TIMEOUT must be greater than 0');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Default fallback configuration for development
 */
export const getDefaultAIConfig = (): Partial<AIConfig> => {
  return {
    provider: 'deepseek',
    model: 'deepseek-reasoner',
    baseUrl: 'https://api.deepseek.com/v1',
    maxTokens: 4000,
    temperature: 0.7,
    timeout: 30000,
  };
};