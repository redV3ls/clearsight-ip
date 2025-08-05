import { AIServiceConfig } from '../core/base';
import { logger } from '../../../utils/logger';
import { Env } from '../../../index';

/**
 * DeepSeek AI Provider
 * 
 * Handles communication with DeepSeek AI API.
 * Provides completion generation and error handling.
 */

export interface CompletionOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
}

export interface CompletionResponse {
  content: string;
  tokensUsed: number;
  finishReason: string;
  model: string;
}

export class DeepSeekProvider {
  private env: Env;
  private config: AIServiceConfig;
  private baseUrl = 'https://api.deepseek.com/v1';

  constructor(env: Env, config: AIServiceConfig) {
    this.env = env;
    this.config = config;
  }

  /**
   * Generates completion using DeepSeek API
   */
  async generateCompletion(
    prompt: string,
    options: CompletionOptions = {}
  ): Promise<CompletionResponse> {
    const startTime = Date.now();
    
    try {
      const requestBody = {
        model: this.config.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || this.config.maxTokens,
        temperature: options.temperature || this.config.temperature,
        top_p: options.topP || 1,
        frequency_penalty: options.frequencyPenalty || 0,
        presence_penalty: options.presencePenalty || 0,
        stop: options.stop || null
      };

      logger.info('Sending request to DeepSeek API', {
        model: this.config.model,
        maxTokens: requestBody.max_tokens,
        temperature: requestBody.temperature,
        promptLength: prompt.length
      });

      const response = await this.makeRequest('/chat/completions', requestBody);
      
      if (!response.choices || response.choices.length === 0) {
        throw new Error('No completion choices returned from DeepSeek API');
      }

      const choice = response.choices[0];
      const content = choice.message?.content || '';
      const tokensUsed = response.usage?.total_tokens || 0;
      const finishReason = choice.finish_reason || 'unknown';

      const processingTime = Date.now() - startTime;
      
      logger.info('DeepSeek API request completed', {
        processingTime,
        tokensUsed,
        finishReason,
        contentLength: content.length
      });

      return {
        content,
        tokensUsed,
        finishReason,
        model: this.config.model
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      logger.error('DeepSeek API request failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime,
        promptLength: prompt.length
      });

      throw this.handleError(error);
    }
  }

  /**
   * Makes HTTP request to DeepSeek API
   */
  private async makeRequest(endpoint: string, body: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(this.config.timeout)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `DeepSeek API error: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch {
        // Use default error message if parsing fails
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  }

  /**
   * Handles and categorizes errors from DeepSeek API
   */
  private handleError(error: any): Error {
    if (error instanceof Error) {
      // Timeout errors
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        return new Error('DeepSeek API request timed out');
      }
      
      // Rate limiting errors
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        return new Error('DeepSeek API rate limit exceeded');
      }
      
      // Authentication errors
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        return new Error('DeepSeek API authentication failed');
      }
      
      // Quota/billing errors
      if (error.message.includes('quota') || error.message.includes('billing')) {
        return new Error('DeepSeek API quota exceeded');
      }
      
      // Model errors
      if (error.message.includes('model') || error.message.includes('404')) {
        return new Error('DeepSeek model not available');
      }
      
      return error;
    }
    
    return new Error('Unknown DeepSeek API error');
  }

  /**
   * Tests connection to DeepSeek API
   */
  async testConnection(): Promise<void> {
    try {
      await this.generateCompletion('Test connection', {
        maxTokens: 10,
        temperature: 0.1
      });
    } catch (error) {
      throw new Error(`DeepSeek API connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets provider information
   */
  getProviderInfo() {
    return {
      name: 'DeepSeek',
      model: this.config.model,
      baseUrl: this.baseUrl,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature,
      timeout: this.config.timeout
    };
  }

  /**
   * Estimates token count for text (approximate)
   */
  estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token for English text
    // This is a simplified estimation and may not be accurate for all languages
    return Math.ceil(text.length / 4);
  }

  /**
   * Validates prompt before sending to API
   */
  validatePrompt(prompt: string): void {
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Prompt cannot be empty');
    }
    
    if (prompt.length > 100000) {
      throw new Error('Prompt too long for DeepSeek API');
    }
    
    const estimatedTokens = this.estimateTokens(prompt);
    if (estimatedTokens > this.config.maxTokens * 0.8) {
      logger.warn('Prompt may exceed token limit', {
        estimatedTokens,
        maxTokens: this.config.maxTokens
      });
    }
  }

  /**
   * Formats prompt with system instructions
   */
  formatPrompt(userPrompt: string, systemInstructions?: string): string {
    if (!systemInstructions) {
      return userPrompt;
    }
    
    return `${systemInstructions}\n\nUser: ${userPrompt}\n\nAssistant:`;
  }
}