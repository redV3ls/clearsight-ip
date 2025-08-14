/**
 * Narrative Response Formatter Service
 * Ensures consistent response format across all narrative analysis endpoints
 */

import { logger } from '../utils/logger';

export interface StandardNarrativeResponse {
  analysis_id: string;
  user_id: string;
  timestamp: string;
  status: 'processing' | 'completed' | 'failed';
  narrative: string;
  analysis_type: 'standalone' | 'job-comparison';
  word_count: number;
  aiPowered: boolean;
  metadata: {
    processingTime?: number;
    aiProvider?: string;
    aiModel?: string;
    hasJobDescription?: boolean;
    source?: 'cache' | 'database' | 'processing';
    estimatedReadingTime?: number;
    characterCount?: number;
  };
  error?: {
    code: string;
    message: string;
    user_message: string;
    retryable: boolean;
    details?: string;
  };
  retrieved_at?: string;
}

export interface ProcessingResponse {
  analysis_id: string;
  user_id: string;
  status: 'processing';
  message: string;
  timestamp: string;
  estimated_completion: string;
  progress?: number;
  check_status_url: string;
  history_url: string;
}

export interface ValidationError {
  error: {
    code: string;
    message: string;
    details?: string;
    issues?: string[];
    suggestions?: string[];
  };
  timestamp: string;
}

export class NarrativeResponseFormatter {
  /**
   * Format completed narrative analysis response
   */
  static formatCompletedAnalysis(data: {
    analysisId: string;
    userId: string;
    narrative: string;
    analysisType: 'standalone' | 'job-comparison';
    wordCount: number;
    timestamp: string;
    processingTime?: number;
    aiProvider?: string;
    aiModel?: string;
    hasJobDescription?: boolean;
    source?: 'cache' | 'database' | 'processing';
  }): StandardNarrativeResponse {
    // Calculate additional metadata
    const characterCount = data.narrative.replace(/\s/g, '').length;
    const estimatedReadingTime = Math.max(1, Math.ceil(data.wordCount / 200)); // 200 words per minute

    return {
      analysis_id: data.analysisId,
      user_id: data.userId,
      timestamp: data.timestamp,
      status: 'completed',
      narrative: data.narrative,
      analysis_type: data.analysisType,
      word_count: data.wordCount,
      aiPowered: true,
      metadata: {
        processingTime: data.processingTime,
        aiProvider: data.aiProvider || 'deepseek',
        aiModel: data.aiModel || 'deepseek-reasoner',
        hasJobDescription: data.hasJobDescription,
        source: data.source,
        estimatedReadingTime,
        characterCount
      },
      retrieved_at: new Date().toISOString()
    };
  }

  /**
   * Format processing status response
   */
  static formatProcessingResponse(data: {
    analysisId: string;
    userId: string;
    message?: string;
    estimatedCompletion?: string;
    progress?: number;
  }): ProcessingResponse {
    return {
      analysis_id: data.analysisId,
      user_id: data.userId,
      status: 'processing',
      message: data.message || 'Analysis is being processed. Please check back in a few minutes.',
      timestamp: new Date().toISOString(),
      estimated_completion: data.estimatedCompletion || new Date(Date.now() + 45 * 1000).toISOString(),
      progress: data.progress,
      check_status_url: `/api/v1/analyze/resume/${data.analysisId}`,
      history_url: '/api/v1/analyze/resume/history'
    };
  }

  /**
   * Format failed analysis response
   */
  static formatFailedAnalysis(data: {
    analysisId: string;
    userId: string;
    errorCode: string;
    errorMessage: string;
    userMessage: string;
    retryable?: boolean;
    details?: string;
    timestamp?: string;
  }): StandardNarrativeResponse {
    return {
      analysis_id: data.analysisId,
      user_id: data.userId,
      timestamp: data.timestamp || new Date().toISOString(),
      status: 'failed',
      narrative: `Analysis failed: ${data.userMessage}`,
      analysis_type: 'standalone',
      word_count: 0,
      aiPowered: true,
      metadata: {
        source: 'processing'
      },
      error: {
        code: data.errorCode,
        message: data.errorMessage,
        user_message: data.userMessage,
        retryable: data.retryable !== false,
        details: data.details
      },
      retrieved_at: new Date().toISOString()
    };
  }

  /**
   * Format validation error response
   */
  static formatValidationError(data: {
    code: string;
    message: string;
    details?: string;
    issues?: string[];
    suggestions?: string[];
  }): ValidationError {
    return {
      error: {
        code: data.code,
        message: data.message,
        details: data.details,
        issues: data.issues,
        suggestions: data.suggestions
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Format analysis history response
   */
  static formatAnalysisHistory(data: {
    analyses: Array<{
      id: string;
      createdAt: string;
      analysisType?: 'standalone' | 'job-comparison';
      wordCount?: number;
      hasJobDescription?: boolean;
      status?: string;
      format?: 'narrative' | 'legacy';
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    stats?: {
      narrativeAnalyses: number;
      legacyAnalyses: number;
      standaloneCount: number;
      jobComparisonCount: number;
      averageWordCount: number;
      averageProcessingTime: number;
    };
  }) {
    return {
      analyses: data.analyses.map(analysis => ({
        id: analysis.id,
        created_at: analysis.createdAt,
        analysis_timestamp: analysis.createdAt,
        ai_powered: true,
        status: analysis.status || 'completed',
        analysis_type: analysis.analysisType,
        word_count: analysis.wordCount,
        has_job_description: analysis.hasJobDescription,
        format: analysis.format || 'narrative'
      })),
      pagination: data.pagination,
      stats: data.stats,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Validate narrative response format
   */
  static validateResponse(response: any): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Required fields
    if (!response.analysis_id) issues.push('Missing analysis_id');
    if (!response.user_id) issues.push('Missing user_id');
    if (!response.timestamp) issues.push('Missing timestamp');
    if (!response.status) issues.push('Missing status');
    if (!response.narrative && response.status === 'completed') issues.push('Missing narrative for completed analysis');
    if (!response.analysis_type) issues.push('Missing analysis_type');
    if (typeof response.word_count !== 'number') issues.push('Invalid word_count');
    if (typeof response.aiPowered !== 'boolean') issues.push('Invalid aiPowered field');

    // Status validation
    if (!['processing', 'completed', 'failed'].includes(response.status)) {
      issues.push('Invalid status value');
    }

    // Analysis type validation
    if (response.analysis_type && !['standalone', 'job-comparison'].includes(response.analysis_type)) {
      issues.push('Invalid analysis_type value');
    }

    // Metadata validation
    if (!response.metadata || typeof response.metadata !== 'object') {
      issues.push('Missing or invalid metadata object');
    }

    // Error validation for failed status
    if (response.status === 'failed' && !response.error) {
      issues.push('Missing error object for failed analysis');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Sanitize narrative content
   */
  static sanitizeNarrative(narrative: string): string {
    if (!narrative || typeof narrative !== 'string') {
      return '';
    }

    return narrative
      .trim()
      .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
      .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
      .replace(/^\s*[\r\n]/gm, '') // Remove empty lines
      .replace(/[^\x20-\x7E\n\r]/g, '') // Remove non-printable characters except newlines
      .trim();
  }

  /**
   * Calculate response size for monitoring
   */
  static calculateResponseSize(response: StandardNarrativeResponse): {
    totalSize: number;
    narrativeSize: number;
    metadataSize: number;
  } {
    const responseJson = JSON.stringify(response);
    const narrativeSize = response.narrative.length;
    const metadataSize = JSON.stringify(response.metadata).length;

    return {
      totalSize: responseJson.length,
      narrativeSize,
      metadataSize
    };
  }

  /**
   * Create response with consistent headers
   */
  static createHttpResponse(
    response: StandardNarrativeResponse | ProcessingResponse | ValidationError,
    statusCode: number = 200
  ) {
    // Add consistent headers
    const headers = {
      'Content-Type': 'application/json',
      'X-Response-Format': 'narrative-v1',
      'X-Timestamp': new Date().toISOString()
    };

    // Add cache headers for completed analyses
    if ('status' in response && response.status === 'completed') {
      headers['Cache-Control'] = 'public, max-age=3600'; // Cache for 1 hour
      headers['ETag'] = `"${('analysis_id' in response) ? response.analysis_id : 'unknown'}"`;
    } else if ('status' in response && response.status === 'processing') {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      headers['Retry-After'] = '30'; // Suggest retry after 30 seconds
    }

    return {
      body: response,
      status: statusCode,
      headers
    };
  }

  /**
   * Log response metrics for monitoring
   */
  static logResponseMetrics(response: StandardNarrativeResponse, processingTime?: number) {
    try {
      const size = this.calculateResponseSize(response);
      
      logger.info('Narrative response metrics', {
        analysisId: response.analysis_id,
        status: response.status,
        analysisType: response.analysis_type,
        wordCount: response.word_count,
        responseSize: size.totalSize,
        narrativeSize: size.narrativeSize,
        processingTime: processingTime || response.metadata.processingTime,
        source: response.metadata.source
      });
    } catch (error) {
      logger.warn('Failed to log response metrics', { error });
    }
  }
}