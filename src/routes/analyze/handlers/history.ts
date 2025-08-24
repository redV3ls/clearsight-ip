/**
 * Analysis History Handler
 * 
 * Fetches user's past analysis history from the database
 */

import { createResponse } from '../../../middleware/common/responseBuilder';
import { logger } from '../../../utils/logger';
import { AuthenticatedContext } from '../../../middleware/auth';

/**
 * GET /api/v1/analyze/history
 * Fetches authenticated user's analysis history
 */
export async function historyHandler(c: AuthenticatedContext): Promise<Response> {
  const response = createResponse(c);
  
  try {
    const user = c.get('user');
    const userId = user?.id;
    
    if (!userId) {
      return response.error(
        'AUTH_REQUIRED',
        'Authentication required',
        401
      );
    }

    logger.info('Fetching analysis history', {
      requestId: c.get('requestId'),
      userId
    });

    // Query analyses from database
    const query = `
      SELECT 
        id,
        analysis_type,
        status,
        created_at,
        completed_at,
        resume_text,
        job_description_text,
        narrative,
        metadata
      FROM analyses
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `;

    // Get D1 database from context
    const db = c.env.DB as D1Database;
    const stmt = db.prepare(query);
    const analyses = await stmt.bind(userId).all() as any;

    // Transform the results for the API response (snake_case keys expected by web UI)
    const transformedAnalyses = (analyses.results || []).map((analysis: any) => {
      // Parse metadata if it's a JSON string
      let metadata: any = {};
      if (analysis.metadata) {
        try {
          metadata = JSON.parse(analysis.metadata);
        } catch (e) {
          metadata = {};
        }
      }

      const hasJob = !!analysis.job_description_text;
      const analysisType = analysis.analysis_type || (hasJob ? 'job-comparison' : 'standalone');
      const status = analysis.status || (analysis.narrative ? 'completed' : 'processing');

      return {
        id: analysis.id,
        created_at: analysis.created_at,
        completed_at: analysis.completed_at,
        status,
        analysis_type: analysisType,
        has_job_description: hasJob,
        narrative: analysis.narrative || null,
        // For compatibility, also include camelCase variants used elsewhere
        createdAt: analysis.created_at,
        completedAt: analysis.completed_at,
        hasJobDescription: hasJob,
        analysisType,
        metadata
      };
    });

    logger.info('Analysis history fetched', {
      requestId: c.get('requestId'),
      userId,
      count: transformedAnalyses.length
    });

    // Return top-level "analyses" to match web UI expectations
    return c.json({
      analyses: transformedAnalyses,
      total: transformedAnalyses.length
    });

  } catch (error) {
    logger.error('Failed to fetch analysis history', {
      requestId: c.get('requestId'),
      userId: c.get('user')?.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return response.error(
      'HISTORY_FETCH_ERROR',
      'Failed to fetch analysis history',
      500
    );
  }
}

/**
 * GET /api/v1/analyze/history/:id
 * Fetches a specific analysis by ID for the authenticated user
 */
export async function getAnalysisHandler(c: AuthenticatedContext): Promise<Response> {
  const response = createResponse(c);
  
  try {
    const user = c.get('user');
    const userId = user?.id;
    const analysisId = c.req.param('id');
    
    if (!userId) {
      return response.error(
        'AUTH_REQUIRED',
        'Authentication required',
        401
      );
    }

    if (!analysisId) {
      return response.error(
        'INVALID_REQUEST',
        'Analysis ID is required',
        400
      );
    }

    logger.info('Fetching specific analysis', {
      requestId: c.get('requestId'),
      userId,
      analysisId
    });

    // Query specific analysis from database
    const query = `
      SELECT 
        id,
        analysis_type,
        status,
        created_at,
        completed_at,
        resume_text,
        job_description_text,
        narrative,
        metadata
      FROM analyses
      WHERE id = ? AND user_id = ?
    `;

    // Get D1 database from context
    const db = c.env.DB as D1Database;
    const stmt = db.prepare(query);
    const result = await stmt.bind(analysisId, userId).first() as any;

    if (!result) {
      return response.error(
        'NOT_FOUND',
        'Analysis not found',
        404
      );
    }

    const analysis = result;
    
    // Parse metadata if it's a JSON string
    let metadata: any = {};
    if (analysis.metadata) {
      try {
        metadata = JSON.parse(analysis.metadata);
      } catch (e) {
        metadata = {};
      }
    }

    const hasJob = !!analysis.job_description_text;
    const analysisType = analysis.analysis_type || (hasJob ? 'job-comparison' : 'standalone');

    const transformedAnalysis = {
      id: analysis.id,
      status: analysis.status,
      created_at: analysis.created_at,
      completed_at: analysis.completed_at,
      analysis_type: analysisType,
      has_job_description: hasJob,
      narrative: analysis.narrative,
      // Include camelCase variants for UI compatibility
      createdAt: analysis.created_at,
      completedAt: analysis.completed_at,
      analysisType,
      hasJobDescription: hasJob,
      resumeText: analysis.resume_text,
      jobDescriptionText: analysis.job_description_text,
      metadata
    };

    logger.info('Analysis fetched', {
      requestId: c.get('requestId'),
      userId,
      analysisId
    });

    // Return top-level "analysis" to match web UI expectations
    return c.json({ analysis: transformedAnalysis });

  } catch (error) {
    logger.error('Failed to fetch analysis', {
      requestId: c.get('requestId'),
      userId: c.get('user')?.id,
      analysisId: c.req.param('id'),
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return response.error(
      'ANALYSIS_FETCH_ERROR',
      'Failed to fetch analysis',
      500
    );
  }
}

/**
 * DELETE /api/v1/analyze/history/:id
 * Deletes a specific analysis for the authenticated user
 */
export async function deleteAnalysisHandler(c: AuthenticatedContext): Promise<Response> {
  const response = createResponse(c);
  
  try {
    const user = c.get('user');
    const userId = user?.id;
    const analysisId = c.req.param('id');
    
    if (!userId) {
      return response.error(
        'AUTH_REQUIRED',
        'Authentication required',
        401
      );
    }

    if (!analysisId) {
      return response.error(
        'INVALID_REQUEST',
        'Analysis ID is required',
        400
      );
    }

    logger.info('Deleting analysis', {
      requestId: c.get('requestId'),
      userId,
      analysisId
    });

    // Delete analysis from database
    const query = `
      DELETE FROM analyses
      WHERE id = ? AND user_id = ?
    `;

    // Get D1 database from context
    const db = c.env.DB as D1Database;
    const stmt = db.prepare(query);
    const result = await stmt.bind(analysisId, userId).run();

    if (!result.success || result.meta.changes === 0) {
      return response.error(
        'NOT_FOUND',
        'Analysis not found',
        404
      );
    }

    logger.info('Analysis deleted', {
      requestId: c.get('requestId'),
      userId,
      analysisId
    });

    return response.success({
      message: 'Analysis deleted successfully',
      id: analysisId
    });

  } catch (error) {
    logger.error('Failed to delete analysis', {
      requestId: c.get('requestId'),
      userId: c.get('user')?.id,
      analysisId: c.req.param('id'),
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return response.error(
      'DELETE_ERROR',
      'Failed to delete analysis',
      500
    );
  }
}
