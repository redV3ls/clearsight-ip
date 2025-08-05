import { AuthenticatedContext } from '../../../middleware/auth';
import { AppError } from '../../../middleware/errorHandler';
import { logger } from '../../../utils/logger';
import { buildAnalysisResponse } from '../processors/responseBuilder';
import { GapAnalysisResponse } from '../types/responses';
import { GapAnalysisRequest } from '../types/requests';

/**
 * Gap Analysis Handler
 * 
 * Analyzes skill gaps between current capabilities and target requirements.
 * Provides personalized learning plans and career path recommendations.
 */

export async function gapHandler(c: AuthenticatedContext): Promise<Response> {
  const startTime = Date.now();
  const userId = c.user!.id;

  try {
    logger.info('Starting gap analysis', { userId });

    // Get validated request body from context
    const requestBody = c.get('requestBody') as GapAnalysisRequest;
    const { currentSkills, targetRole, targetSkills } = requestBody;

    // Initialize gap analysis service
    const gapAnalysisService = await initializeGapAnalysisService(c);

    // Perform gap analysis
    const analysisResult = await gapAnalysisService.analyzeSkillGap({
      currentSkills,
      targetRole,
      targetSkills
    });

    // Build standardized response
    const response = buildAnalysisResponse({
      type: 'gap',
      data: analysisResult,
      processingTime: Date.now() - startTime,
      userId,
      metadata: {
        currentSkillsCount: currentSkills.length,
        targetSkillsCount: targetSkills.length,
        targetRole
      }
    }) as GapAnalysisResponse;

    // Store analysis result
    await storeGapAnalysisResult(c, response);

    logger.info('Gap analysis completed successfully', {
      userId,
      overallMatch: response.data.overallMatch,
      skillGapsCount: response.data.skillGaps.length,
      processingTime: response.processingTime
    });

    return c.json(response, 200);

  } catch (error) {
    logger.error('Gap analysis failed', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTime: Date.now() - startTime
    });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('Gap analysis failed', 500, 'GAP_ANALYSIS_ERROR');
  }
}

/**
 * Initializes the gap analysis service
 */
async function initializeGapAnalysisService(c: AuthenticatedContext) {
  try {
    const { GapAnalysisService } = await import('../../../services/gapAnalysis');
    return new GapAnalysisService(c.env);
  } catch (error) {
    logger.error('Failed to initialize gap analysis service', error);
    throw new AppError('Gap analysis service initialization failed', 500, 'SERVICE_INIT_ERROR');
  }
}

/**
 * Stores gap analysis result in database
 */
async function storeGapAnalysisResult(c: AuthenticatedContext, response: GapAnalysisResponse) {
  try {
    const analysisId = `gap_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    await c.env.DB
      .prepare(`
        INSERT INTO gap_analyses (
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

    logger.info('Gap analysis result stored successfully', {
      analysisId,
      userId: c.user!.id
    });
  } catch (error) {
    logger.warn('Failed to store gap analysis result', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    // Don't throw error - storage failure shouldn't fail the analysis
  }
}