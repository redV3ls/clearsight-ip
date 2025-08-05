import { BaseAIService, AIServiceConfig, AIServiceCapabilities, AIAnalysisOptions, AIAnalysisResult } from '../core/base';
import { MultiLanguageAnalysis } from '../core/types';
import { logger } from '../../../utils/logger';
import { AppError } from '../../../middleware/errorHandler';

/**
 * Multi-Language Analysis Service
 * 
 * Provides AI-powered multi-language support for resume and job analysis.
 * Handles language detection, translation, and cultural context analysis.
 */

export interface MultiLanguageInput {
  text: string;
  targetLanguage?: string;
  includeTranslation?: boolean;
  includeCulturalContext?: boolean;
}

export class MultiLanguageAnalysisService extends BaseAIService<MultiLanguageInput, MultiLanguageAnalysis> {
  
  protected defineCapabilities(): AIServiceCapabilities {
    return {
      name: 'Multi-Language Analysis',
      version: '1.0.0',
      supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'],
      maxInputLength: 50000,
      features: [
        'language-detection',
        'translation',
        'cultural-context-analysis',
        'localized-skills-mapping'
      ],
      rateLimits: {
        requestsPerMinute: 10,
        tokensPerMinute: 5000
      }
    };
  }

  protected validateInput(input: MultiLanguageInput): void {
    if (!input.text || input.text.trim().length === 0) {
      throw new AppError('Text content is required for multi-language analysis', 400, 'INVALID_INPUT');
    }

    if (input.text.length > this.capabilities.maxInputLength) {
      throw new AppError(
        `Text content exceeds maximum length of ${this.capabilities.maxInputLength} characters`,
        400,
        'INPUT_TOO_LONG'
      );
    }

    if (input.targetLanguage && !this.capabilities.supportedLanguages.includes(input.targetLanguage)) {
      throw new AppError(
        `Target language '${input.targetLanguage}' is not supported`,
        400,
        'UNSUPPORTED_LANGUAGE'
      );
    }
  }

  public async analyze(
    input: MultiLanguageInput,
    options?: AIAnalysisOptions
  ): Promise<AIAnalysisResult<MultiLanguageAnalysis>> {
    const startTime = Date.now();

    try {
      this.validateInput(input);

      logger.info('Starting multi-language analysis', {
        textLength: input.text.length,
        targetLanguage: input.targetLanguage,
        includeTranslation: input.includeTranslation
      });

      // Create analysis prompt
      const prompt = this.createAnalysisPrompt(input, options);

      // Call AI service
      const aiResponse = await this.callAIService(prompt);

      // Parse and validate response
      const analysis = this.parseAnalysisResponse(aiResponse);

      const result: AIAnalysisResult<MultiLanguageAnalysis> = {
        data: analysis,
        metadata: {
          processingTime: Date.now() - startTime,
          tokensUsed: aiResponse.tokensUsed || 0,
          confidence: aiResponse.confidence || 0.8,
          model: this.config.model,
          version: this.capabilities.version
        },
        reasoning: options?.includeReasoning ? aiResponse.reasoning : undefined
      };

      logger.info('Multi-language analysis completed successfully', {
        processingTime: result.metadata.processingTime,
        detectedLanguage: analysis.detectedLanguage,
        tokensUsed: result.metadata.tokensUsed
      });

      return result;

    } catch (error) {
      logger.error('Multi-language analysis failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime
      });

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError('Multi-language analysis failed', 500, 'ANALYSIS_ERROR');
    }
  }

  private createAnalysisPrompt(input: MultiLanguageInput, options?: AIAnalysisOptions): string {
    return `
Perform a comprehensive multi-language analysis of the following text. Analyze the language, cultural context, and provide localized insights.

Text to analyze:
"""
${input.text}
"""

Analysis Requirements:
1. Detect the original language of the text
2. Identify cultural and regional context
3. Extract and localize skills mentioned in the text
4. Provide cultural work practices and education system context
${input.includeTranslation ? '5. Provide translation if requested' : ''}

Target Language: ${input.targetLanguage || 'auto-detect'}
Include Translation: ${input.includeTranslation || false}
Include Cultural Context: ${input.includeCulturalContext !== false}

Please provide your analysis in the following JSON format:

{
  "originalLanguage": "detected language code (e.g., 'en', 'es', 'fr')",
  "detectedLanguage": "full language name",
  "translatedContent": "translated text if requested",
  "analysisLanguage": "language used for analysis",
  "culturalContext": {
    "region": "detected region/country",
    "workCulture": ["cultural work practices"],
    "commonPractices": ["common professional practices"],
    "educationSystem": "education system description"
  },
  "localizedSkills": [
    {
      "skill": "skill name in original language",
      "localTerms": ["alternative local terms"],
      "marketRelevance": "high|medium|low"
    }
  ]
}

Focus on accuracy and cultural sensitivity. Provide detailed reasoning for language detection and cultural context identification.
`;
  }

  private async callAIService(prompt: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert linguist and cultural analyst specializing in professional contexts. Provide accurate language detection and cultural insights.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          response_format: { type: 'json_object' }
        }),
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI service error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from AI service');
      }

      return {
        content: data.choices[0].message.content,
        tokensUsed: data.usage?.total_tokens || 0,
        confidence: 0.8 // Default confidence
      };

    } catch (error) {
      logger.error('AI service call failed', error);
      throw new AppError('AI service unavailable', 503, 'AI_SERVICE_ERROR');
    }
  }

  private parseAnalysisResponse(aiResponse: any): MultiLanguageAnalysis {
    try {
      const parsed = JSON.parse(aiResponse.content);

      // Validate required fields
      if (!parsed.originalLanguage || !parsed.detectedLanguage) {
        throw new Error('Missing required language fields in AI response');
      }

      // Ensure all required fields are present with defaults
      return {
        originalLanguage: parsed.originalLanguage,
        detectedLanguage: parsed.detectedLanguage,
        translatedContent: parsed.translatedContent || undefined,
        analysisLanguage: parsed.analysisLanguage || 'en',
        culturalContext: {
          region: parsed.culturalContext?.region || 'Unknown',
          workCulture: parsed.culturalContext?.workCulture || [],
          commonPractices: parsed.culturalContext?.commonPractices || [],
          educationSystem: parsed.culturalContext?.educationSystem || 'Not specified'
        },
        localizedSkills: parsed.localizedSkills || []
      };

    } catch (error) {
      logger.error('Failed to parse multi-language analysis response', error);
      throw new AppError('Invalid AI response format', 500, 'RESPONSE_PARSE_ERROR');
    }
  }
}