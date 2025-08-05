import { AuthenticatedContext } from '../../../middleware/auth';
import { AppError } from '../../../middleware/errorHandler';
import { logger } from '../../../utils/logger';
import { buildAnalysisResponse } from '../processors/responseBuilder';
import { TrendsAnalysisResponse } from '../types/responses';
import { TrendsAnalysisRequest } from '../types/requests';

/**
 * Trends Analysis Handler
 * 
 * Analyzes industry trends and skill demand patterns.
 * Provides insights into emerging technologies and market opportunities.
 */

export async function trendsHandler(c: AuthenticatedContext): Promise<Response> {
  const startTime = Date.now();
  const userId = c.user!.id;

  try {
    logger.info('Starting trends analysis', { userId });

    // Get validated request body from context
    const requestBody = c.get('requestBody') as TrendsAnalysisRequest;
    const { industry, skills, timeframe, region } = requestBody;

    // Initialize trends analysis service
    const trendsAnalysisService = await initializeTrendsAnalysisService(c);

    // Perform trends analysis
    const analysisResult = await trendsAnalysisService.analyzeTrends({
      industry,
      skills: skills || [],
      timeframe: timeframe || '1year',
      region: region || 'global'
    });

    // Build standardized response
    const response = buildAnalysisResponse({
      type: 'trends',
      data: analysisResult,
      processingTime: Date.now() - startTime,
      userId,
      metadata: {
        industry,
        timeframe: timeframe || '1year',
        region: region || 'global',
        skillsAnalyzed: skills?.length || 0
      }
    }) as TrendsAnalysisResponse;

    // Store analysis result
    await storeTrendsAnalysisResult(c, response);

    logger.info('Trends analysis completed successfully', {
      userId,
      industry,
      trendsCount: response.data.trends.length,
      processingTime: response.processingTime
    });

    return c.json(response, 200);

  } catch (error) {
    logger.error('Trends analysis failed', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTime: Date.now() - startTime
    });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('Trends analysis failed', 500, 'TRENDS_ANALYSIS_ERROR');
  }
}

/**
 * Initializes the trends analysis service
 */
async function initializeTrendsAnalysisService(c: AuthenticatedContext) {
  try {
    const { TrendsAnalysisService } = await import('../../../services/trendsAnalysis');
    return new TrendsAnalysisService(c.env);
  } catch (error) {
    logger.error('Failed to initialize trends analysis service', error);
    throw new AppError('Trends analysis service initialization failed', 500, 'SERVICE_INIT_ERROR');
  }
}

/**
 * Stores trends analysis result in database
 */
async function storeTrendsAnalysisResult(c: AuthenticatedContext, response: TrendsAnalysisResponse) {
  try {
    const analysisId = `trends_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    await c.env.DB
      .prepare(`
        INSERT INTO trends_analyses (
          id, user_id, analysis_data, created_at
        ) VALUES (?, ?, ?, ?)
      `)
      .bind(
        analysisId,
        c.user!.id,
        JSON.stringify(response),
        new Date().toISOString()
      )
      .run();

    logger.info('Trends analysis result stored successfully', {
      analysisId,
      userId: c.user!.id
    });
  } catch (error) {
    logger.warn('Failed to store trends analysis result', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    // Don't throw error - storage failure shouldn't fail the analysis
  }
}