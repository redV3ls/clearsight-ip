/**
 * Analysis History Handlers
 * 
 * Unified handlers for listing, retrieving, and deleting user's past analyses
 * using the actual storage tables (narrative_analysis and resume_analyses).
 */

import { createResponse } from '../../../middleware/common/responseBuilder';
import { logger } from '../../../utils/logger';
import { AuthenticatedContext } from '../../../middleware/auth';
import { createDatabase } from '../../../config/database';
import { NarrativeAnalysisService } from '../../../services/narrativeAnalysisService';

/**
 * GET /api/v1/analyze/history
 * Returns a unified list of the user's past analyses (recent first).
 * Pulls from the optimized narrative_analysis table and falls back to
 * the legacy resume_analyses table for backward compatibility.
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

    // Basic pagination support (defaults chosen to match prior behavior)
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = Math.min(parseInt(c.req.query('limit') || '50', 10), 100);
    const offset = (page - 1) * limit;

    logger.info('Fetching analysis history', {
      requestId: c.get('requestId'),
      userId,
      page,
      limit
    });

    // New optimized store: narrative_analysis via service (Drizzle)
    const database = createDatabase(c.env.DB);
    const narrativeService = new NarrativeAnalysisService(database);
    const narrativeAnalyses = await narrativeService.getUserHistory(userId, { limit, offset });

    // Legacy store: resume_analyses table
    const legacyRows = await c.env.DB
      .prepare(`
        SELECT id, created_at, analysis_data
        FROM resume_analyses
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `)
      .bind(userId, limit, offset)
      .all() as any;

    // Normalize narrative analyses
    const normalizedNarrative = (narrativeAnalyses || []).map(a => ({
      id: a.id,
      created_at: a.createdAt,
      completed_at: a.createdAt,
      status: 'completed' as const,
      analysis_type: a.analysisType,
      has_job_description: a.hasJobDescription,
      narrative: a.narrative || null,
      createdAt: a.createdAt,
      completedAt: a.createdAt,
      hasJobDescription: a.hasJobDescription,
      analysisType: a.analysisType,
      metadata: {
        wordCount: a.wordCount,
        aiProvider: a.aiProvider,
        aiModel: a.aiModel,
        format: 'narrative'
      }
    }));

    // Normalize legacy resume analyses
    const normalizedLegacy = (legacyRows.results || []).map((row: any) => {
      let data: any = {};
      try {
        data = row.analysis_data ? JSON.parse(row.analysis_data) : {};
      } catch {
        data = {};
      }

      const hasJob = Boolean(data?.hasJobDescription || data?.metadata?.hasJobDescription);
      const analysisType = data?.analysisType || data?.analysis_type || (hasJob ? 'job-comparison' : 'standalone');

      const status = (data?.status as string) || (data?.narrative ? 'completed' : 'processing') || 'unknown';
      const ts = data?.timestamp || row.created_at;

      return {
        id: row.id,
        created_at: ts,
        completed_at: ts,
        status,
        analysis_type: analysisType,
        has_job_description: hasJob,
        narrative: data?.narrative || null,
        createdAt: ts,
        completedAt: ts,
        hasJobDescription: hasJob,
        analysisType,
        metadata: {
          format: 'legacy'
        }
      };
    });

    // Merge, sort by createdAt desc, and cap to limit
    const combined = [...normalizedNarrative, ...normalizedLegacy]
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      .slice(0, limit);

    logger.info('Analysis history fetched', {
      requestId: c.get('requestId'),
      userId,
      count: combined.length
    });

    // Keep existing top-level shape: { analyses, total }
    return c.json({
      analyses: combined,
      total: combined.length
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
 * Fetch a specific analysis by ID for the authenticated user
 * Tries the narrative_analysis table first, then falls back to resume_analyses.
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

    // Try narrative_analysis first
    const database = createDatabase(c.env.DB);
    const narrativeService = new NarrativeAnalysisService(database);
    const narrative = await narrativeService.getById(analysisId, userId);

    if (narrative) {
      const transformed = {
        id: narrative.id,
        status: 'completed' as const,
        created_at: narrative.createdAt,
        completed_at: narrative.createdAt,
        analysis_type: narrative.analysisType,
        has_job_description: narrative.hasJobDescription,
        narrative: narrative.narrative,
        createdAt: narrative.createdAt,
        completedAt: narrative.createdAt,
        analysisType: narrative.analysisType,
        hasJobDescription: narrative.hasJobDescription,
        metadata: {
          wordCount: narrative.wordCount,
          aiProvider: narrative.aiProvider,
          aiModel: narrative.aiModel
        }
      };

      logger.info('Analysis (narrative) fetched', {
        requestId: c.get('requestId'),
        userId,
        analysisId
      });

      return c.json({ analysis: transformed });
    }

    // Fallback to legacy resume_analyses
    const legacy = await c.env.DB
      .prepare('SELECT * FROM resume_analyses WHERE id = ? AND user_id = ?')
      .bind(analysisId, userId)
      .first() as any;

    if (!legacy) {
      return response.error(
        'NOT_FOUND',
        'Analysis not found',
        404
      );
    }

    let data: any = {};
    try {
      data = legacy.analysis_data ? JSON.parse(legacy.analysis_data) : {};
    } catch {
      data = {};
    }

    const hasJob = Boolean(data?.hasJobDescription || data?.metadata?.hasJobDescription);
    const analysisType = data?.analysisType || data?.analysis_type || (hasJob ? 'job-comparison' : 'standalone');
    const status: 'completed' | 'failed' | 'processing' = (data?.status as any) || (data?.narrative ? 'completed' : 'processing');
    const ts = data?.timestamp || legacy.created_at;

    const transformedLegacy = {
      id: legacy.id,
      status,
      created_at: ts,
      completed_at: ts,
      analysis_type: analysisType,
      has_job_description: hasJob,
      narrative: data?.narrative || null,
      createdAt: ts,
      completedAt: ts,
      analysisType,
      hasJobDescription: hasJob,
      metadata: data?.metadata || { format: 'legacy' }
    };

    logger.info('Analysis (legacy) fetched', {
      requestId: c.get('requestId'),
      userId,
      analysisId
    });

    return c.json({ analysis: transformedLegacy });

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
 * Deletes a specific analysis from both narrative_analysis and resume_analyses.
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

    // Delete from both tables; consider either deletion a success
    const delNarrative = await c.env.DB
      .prepare('DELETE FROM narrative_analysis WHERE id = ? AND user_id = ?')
      .bind(analysisId, userId)
      .run();

    const delLegacy = await c.env.DB
      .prepare('DELETE FROM resume_analyses WHERE id = ? AND user_id = ?')
      .bind(analysisId, userId)
      .run();

    const changes = (delNarrative?.changes || delNarrative?.meta?.changes || 0) + (delLegacy?.changes || delLegacy?.meta?.changes || 0);

    if (!changes) {
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
