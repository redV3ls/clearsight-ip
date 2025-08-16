/**
 * Analysis History Handler
 * 
 * Fetches user's past analysis history from the database
 */

import { Context } from 'hono';
import { createResponse } from '../../../middleware/common/responseBuilder';
import { logger } from '../../../utils/logger';
import { db } from '../../../lib/database';
import { AuthenticatedContext } from '../../../types/auth';

/**
 * GET /api/v1/analyze/history
 * Fetches authenticated user's analysis history
 */
export async function historyHandler(c: AuthenticatedContext): Promise<Response> {
  const response = createResponse(c);
  
  try {
    const userId = c.get('userId');
    
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

    const stmt = db.prepare(query);
    const analyses = stmt.all(userId) as any[];

    // Transform the results for the API response
    const transformedAnalyses = analyses.map(analysis => {
      // Parse metadata if it's a JSON string
      let metadata = {};
      if (analysis.metadata) {
        try {
          metadata = JSON.parse(analysis.metadata);
        } catch (e) {
          metadata = {};
        }
      }

      return {
        id: analysis.id,
        analysisType: analysis.analysis_type || 'resume',
        status: analysis.status,
        createdAt: analysis.created_at,
        completedAt: analysis.completed_at,
        hasJobDescription: !!analysis.job_description_text,
        resumePreview: analysis.resume_text ? 
          analysis.resume_text.substring(0, 200) + '...' : null,
        jobDescriptionPreview: analysis.job_description_text ? 
          analysis.job_description_text.substring(0, 200) + '...' : null,
        narrative: analysis.narrative,
        metadata
      };
    });

    logger.info('Analysis history fetched', {
      requestId: c.get('requestId'),
      userId,
      count: transformedAnalyses.length
    });

    return response.success({
      analyses: transformedAnalyses,
      total: transformedAnalyses.length
    });

  } catch (error) {
    logger.error('Failed to fetch analysis history', {
      requestId: c.get('requestId'),
      userId: c.get('userId'),
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
    const userId = c.get('userId');
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

    const stmt = db.prepare(query);
    const analysis = stmt.get(analysisId, userId) as any;

    if (!analysis) {
      return response.error(
        'NOT_FOUND',
        'Analysis not found',
        404
      );
    }

    // Parse metadata if it's a JSON string
    let metadata = {};
    if (analysis.metadata) {
      try {
        metadata = JSON.parse(analysis.metadata);
      } catch (e) {
        metadata = {};
      }
    }

    const transformedAnalysis = {
      id: analysis.id,
      analysisType: analysis.analysis_type || 'resume',
      status: analysis.status,
      createdAt: analysis.created_at,
      completedAt: analysis.completed_at,
      hasJobDescription: !!analysis.job_description_text,
      resumeText: analysis.resume_text,
      jobDescriptionText: analysis.job_description_text,
      narrative: analysis.narrative,
      metadata
    };

    logger.info('Analysis fetched', {
      requestId: c.get('requestId'),
      userId,
      analysisId
    });

    return response.success({
      analysis: transformedAnalysis
    });

  } catch (error) {
    logger.error('Failed to fetch analysis', {
      requestId: c.get('requestId'),
      userId: c.get('userId'),
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
    const userId = c.get('userId');
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

    const stmt = db.prepare(query);
    const result = stmt.run(analysisId, userId) as any;

    if (result.changes === 0) {
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
      userId: c.get('userId'),
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
