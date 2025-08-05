import { BaseAIService, AIAnalysisOptions, AIAnalysisResult } from '../core/base';
import { IndustrySpecificInput, IndustrySpecificOutput } from '../core/types';
import { getAIServiceConfig, INDUSTRY_CATEGORIES } from '../core/config';
import { DeepSeekProvider } from '../providers/deepseek';
import { logger } from '../../../utils/logger';
import { Env } from '../../../index';

/**
 * Industry-Specific Analysis Service
 * 
 * Provides AI-powered analysis tailored to specific industries.
 * Analyzes skills, trends, and requirements within industry context.
 */

export class IndustrySpecificAnalysisService extends BaseAIService<IndustrySpecificInput, IndustrySpecificOutput> {
  private provider: DeepSeekProvider;

  constructor(env: Env) {
    const config = getAIServiceConfig('industrySpecific');
    super(env, config, 'IndustrySpecificAnalysis');
    this.provider = new DeepSeekProvider(env, config);
  }

  /**
   * Analyzes content with industry-specific context
   */
  async analyze(
    input: IndustrySpecificInput, 
    options: AIAnalysisOptions = {}
  ): Promise<AIAnalysisResult<IndustrySpecificOutput>> {
    const startTime = Date.now();
    
    try {
      this.validateInput(input);
      
      // Perform industry-specific analysis
      const analysisResult = await this.performIndustryAnalysis(input);
      
      const result: AIAnalysisResult<IndustrySpecificOutput> = {
        data: {
          result: analysisResult,
          confidence: analysisResult.confidence,
          explanation: analysisResult.explanation,
          suggestions: analysisResult.suggestions,
          industryInsights: analysisResult.industryInsights,
          competitiveAnalysis: analysisResult.competitiveAnalysis
        },
        confidence: analysisResult.confidence,
        explanation: options.includeExplanation ? analysisResult.explanation : undefined,
        metadata: {
          provider: this.config.provider,
          model: this.config.model,
          processingTime: Date.now() - startTime,
          tokensUsed: analysisResult.tokensUsed || 0,
          timestamp: new Date().toISOString()
        }
      };
      
      this.logAnalysisMetrics(result);
      return result;
      
    } catch (error) {
      logger.error('Industry-specific analysis failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        industry: input.industry,
        textLength: input.text.length
      });
      throw error;
    }
  }

  /**
   * Performs comprehensive industry-specific analysis
   */
  private async performIndustryAnalysis(input: IndustrySpecificInput): Promise<any> {
    const prompt = `
Perform a comprehensive industry-specific analysis for the ${input.industry} industry.

${input.jobRole ? `Job Role: ${input.jobRole}` : ''}
${input.companySize ? `Company Size: ${input.companySize}` : ''}
${input.location ? `Location: ${input.location}` : ''}

Content to analyze: "${input.text}"

Provide detailed analysis in JSON format with the following structure:
{
  "industryInsights": {
    "keySkills": ["skill1", "skill2", "skill3"],
    "emergingTrends": ["trend1", "trend2"],
    "salaryBenchmarks": {
      "min": 50000,
      "max": 120000,
      "median": 85000,
      "currency": "USD"
    },
    "careerPaths": ["path1", "path2"],
    "certifications": ["cert1", "cert2"]
  },
  "competitiveAnalysis": {
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "opportunities": ["opportunity1", "opportunity2"],
    "threats": ["threat1", "threat2"]
  },
  "confidence": 0.85,
  "explanation": "Detailed explanation of the industry analysis",
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}`;

    try {
      const response = await this.provider.generateCompletion(prompt, {
        maxTokens: this.config.maxTokens,
        temperature: this.config.temperature
      });
      
      const analysis = JSON.parse(response.content);
      
      return {
        ...analysis,
        tokensUsed: response.tokensUsed
      };
      
    } catch (error) {
      logger.error('Industry analysis parsing failed', error);
      throw new Error('Failed to analyze content for industry context');
    }
  }

  /**
   * Gets service capabilities
   */
  getCapabilities() {
    return {
      ...super.getCapabilities(),
      supportedIndustries: INDUSTRY_CATEGORIES,
      features: [
        'industry-insights',
        'salary-benchmarking',
        'career-path-analysis',
        'certification-recommendations',
        'competitive-analysis',
        'trend-identification'
      ]
    };
  }

  /**
   * Validates industry-specific input
   */
  protected validateInput(input: IndustrySpecificInput): void {
    super.validateInput(input);
    
    if (!input.industry) {
      throw new Error('Industry is required for industry-specific analysis');
    }
    
    if (!INDUSTRY_CATEGORIES.includes(input.industry as any)) {
      throw new Error(`Unsupported industry: ${input.industry}. Supported industries: ${INDUSTRY_CATEGORIES.join(', ')}`);
    }
    
    if (input.text.length < 50) {
      throw new Error('Text too short for meaningful industry-specific analysis');
    }
    
    if (input.text.length > 20000) {
      throw new Error('Text too long for industry-specific analysis');
    }
  }
}