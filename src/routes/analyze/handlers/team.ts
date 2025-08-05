import { AuthenticatedContext } from '../../../middleware/auth';
import { AppError } from '../../../middleware/errorHandler';
import { logger } from '../../../utils/logger';
import { buildAnalysisResponse } from '../processors/responseBuilder';
import { TeamAnalysisResponse } from '../types/responses';
import { TeamAnalysisRequest } from '../types/requests';

/**
 * Team Analysis Handler
 * 
 * Analyzes team capabilities and identifies skill gaps for projects.
 * Provides recommendations for team optimization and risk assessment.
 */

export async function teamHandler(c: AuthenticatedContext): Promise<Response> {
  const startTime = Date.now();
  const userId = c.user!.id;

  try {
    logger.info('Starting team analysis', { userId });

    // Get validated request body from context
    const requestBody = c.get('requestBody') as TeamAnalysisRequest;
    const { teamMembers, projectRequirements } = requestBody;

    // Initialize team analysis service
    const teamAnalysisService = await initializeTeamAnalysisService(c);

    // Perform team analysis
    const analysisResult = await teamAnalysisService.analyzeTeam({
      teamMembers,
      projectRequirements
    });

    // Build standardized response
    const response = buildAnalysisResponse({
      type: 'team',
      data: analysisResult,
      processingTime: Date.now() - startTime,
      userId,
      metadata: {
        teamSize: teamMembers.length,
        projectComplexity: projectRequirements.complexity,
        requiredSkills: projectRequirements.skills.length
      }
    }) as TeamAnalysisResponse;

    // Store analysis result
    await storeTeamAnalysisResult(c, response);

    logger.info('Team analysis completed successfully', {
      userId,
      teamSize: teamMembers.length,
      processingTime: response.processingTime
    });

    return c.json(response, 200);

  } catch (error) {
    logger.error('Team analysis failed', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTime: Date.now() - startTime
    });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('Team analysis failed', 500, 'TEAM_ANALYSIS_ERROR');
  }
}

/**
 * Initializes the team analysis service
 */
async function initializeTeamAnalysisService(c: AuthenticatedContext) {
  try {
    const { TeamAnalysisService } = await import('../../../services/teamAnalysis');
    return new TeamAnalysisService(c.env);
  } catch (error) {
    logger.error('Failed to initialize team analysis service', error);
    throw new AppError('Team analysis service initialization failed', 500, 'SERVICE_INIT_ERROR');
  }
}

/**
 * Stores team analysis result in database
 */
async function storeTeamAnalysisResult(c: AuthenticatedContext, response: TeamAnalysisResponse) {
  try {
    const analysisId = `team_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    await c.env.DB
      .prepare(`
        INSERT INTO team_analyses (
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

    logger.info('Team analysis result stored successfully', {
      analysisId,
      userId: c.user!.id
    });
  } catch (error) {
    logger.warn('Failed to store team analysis result', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    // Don't throw error - storage failure shouldn't fail the analysis
  }
}