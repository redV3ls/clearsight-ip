/**
 * Base AI Service Interface
 * 
 * Defines the common interface and patterns for all AI services.
 * Provides consistent structure and error handling across AI features.
 */

export interface AIServiceConfig {
  provider: string;
  model: string;
  apiKey: string;
  baseUrl: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
}

export interface AIServiceCapabilities {
  name: string;
  version: string;
  supportedLanguages: string[];
  maxInputLength: number;
  features: string[];
  rateLimits: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
}

export interface AIAnalysisOptions {
  language?: string;
  includeConfidence?: boolean;
  includeReasoning?: boolean;
  maxResults?: number;
  customPrompts?: Record<string, string>;
}

export interface AIAnalysisResult<T> {
  data: T;
  metadata: {
    processingTime: number;
    tokensUsed: number;
    confidence: number;
    model: string;
    version: string;
  };
  reasoning?: string;
}

/**
 * Base AI service interface that all AI features must implement
 */
export abstract class BaseAIService<TInput, TOutput> {
  protected config: AIServiceConfig;
  protected capabilities: AIServiceCapabilities;

  constructor(config: AIServiceConfig) {
    this.config = config;
    this.capabilities = this.defineCapabilities();
  }

  /**
   * Define the capabilities of this AI service
   */
  protected abstract defineCapabilities(): AIServiceCapabilities;

  /**
   * Validate input data before processing
   */
  protected abstract validateInput(input: TInput): void;

  /**
   * Process the AI analysis
   */
  public abstract analyze(
    input: TInput, 
    options?: AIAnalysisOptions
  ): Promise<AIAnalysisResult<TOutput>>;

  /**
   * Get service capabilities
   */
  public getCapabilities(): AIServiceCapabilities {
    return this.capabilities;
  }

  /**
   * Check if service is healthy and available
   */
  public async healthCheck(): Promise<boolean> {
    try {
      // Basic connectivity test
      const response = await fetch(this.config.baseUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get current configuration (without sensitive data)
   */
  public getConfig(): Omit<AIServiceConfig, 'apiKey'> {
    const { apiKey, ...safeConfig } = this.config;
    return safeConfig;
  }
}