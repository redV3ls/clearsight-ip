import { AuthenticatedContext } from '../../../middleware/auth';
import { AppError } from '../../../middleware/errorHandler';
import { logger } from '../../../utils/logger';
import { processFile, validateFileContent } from '../processors/fileProcessor';
import { buildAnalysisResponse } from '../processors/responseBuilder';
import { ResumeAnalysisResponse } from '../types/responses';

/**
 * Resume Analysis Handler
 * 
 * Handles resume/CV analysis requests with AI-powered insights.
 * Processes both file uploads and text input.
 */

export async function resumeHandler(c: AuthenticatedContext): Promise<Response> {
  const startTime = Date.now();
  const userId = c.user!.id;

  try {
    logger.info('Starting resume analysis (async)', { userId });

    // Extract data from context (set by middleware)
    const resumeFile = c.get('resumeFile') as File | null;
    const jobDescriptionFile = c.get('jobDescriptionFile') as File | null;
    const resumeText = c.get('resumeText') as string | null;
    const jobDescriptionText = c.get('jobDescriptionText') as string | null;
    const formData = c.get('formData') as FormData;

    // Extract analysis options
    const includeSkillsGap = formData?.get('includeSkillsGap') === 'true' || false;
    const includeCareerSuggestions = formData?.get('includeCareerSuggestions') === 'true' || false;
    const includeIndustryTrends = formData?.get('includeIndustryTrends') === 'true' || false;

    // Process resume content
    let resumeContent = resumeText || '';
    if (resumeFile) {
      const processedFile = await processFile(resumeFile);
      resumeContent = processedFile.content;
    }

    // Validate resume content
    validateFileContent(resumeContent);

    // Process job description content (optional)
    let jobContent = jobDescriptionText || '';
    if (jobDescriptionFile) {
      const processedFile = await processFile(jobDescriptionFile);
      jobContent = processedFile.content;
    }

    // Generate analysis id and set initial status in KV
    const analysisId = crypto.randomUUID();
    await setResumeStatus(c, analysisId, {
      status: 'processing',
      analysis_id: analysisId,
      user_id: userId,
      message: 'Analysis is being processed. Please check back in a few minutes.'
    });

    // Fire-and-forget background processing
    c.executionCtx.waitUntil((async () => {
      try {
        logger.info('Starting async analysis processing', { analysisId, userId });
        
        // Initialize AI analysis service
        const aiAnalysisService = await initializeAIService(c);

        logger.info('AI service initialized, starting analysis', { analysisId });

        // Perform AI-powered analysis
        const analysisResult = await aiAnalysisService.analyzeCV(
          resumeContent,
          jobContent,
          {
            includeSkillsGap,
            includeCareerSuggestions,
            includeIndustryTrends,
          }
        );

        logger.info('AI analysis completed', { analysisId, hasResult: !!analysisResult });

        // Build standardized response
        const response = buildAnalysisResponse({
          type: 'resume',
          data: analysisResult,
          processingTime: Date.now() - startTime,
          userId,
          metadata: {
            analysisOptions: {
              includeSkillsGap,
              includeCareerSuggestions,
              includeIndustryTrends
            },
            fileInfo: {
              resumeFile: resumeFile ? {
                name: resumeFile.name,
                size: resumeFile.size,
                type: resumeFile.type
              } : null,
              jobDescriptionFile: jobDescriptionFile ? {
                name: jobDescriptionFile.name,
                size: jobDescriptionFile.size,
                type: jobDescriptionFile.type
              } : null
            }
          }
        }) as ResumeAnalysisResponse;

        // Store analysis result in DB
        await storeAnalysisResult(c, response);

        // Mark as completed in KV (store the full response for the client)
        await setResumeStatus(c, analysisId, {
          status: 'completed',
          analysis_id: analysisId,
          user_id: userId,
          data: response.data,
          success: true,
          processingTime: response.processingTime,
          timestamp: response.timestamp
        });

        logger.info('Resume analysis completed (async)', {
          userId,
          analysisId: response.data.analysis_id,
          processingTime: response.processingTime
        });
      } catch (error) {
        logger.error('Async resume analysis failed', {
          userId,
          analysisId,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        await setResumeStatus(c, analysisId, {
          status: 'failed',
          analysis_id: analysisId,
          user_id: userId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    })());

    // Immediately return 202 Accepted with status information for polling
    const checkUrl = `/api/v1/analyze/resume/${analysisId}`;
    return c.json({
      analysis_id: analysisId,
      status: 'processing',
      message: 'Analysis is being processed. Please check back in a few minutes.',
      aiPowered: true,
      check_status_url: checkUrl,
      retrieved_at: new Date().toISOString(),
    }, 202);

  } catch (error) {
    logger.error('Resume analysis failed', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTime: Date.now() - startTime
    });

    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('timeout')) {
        throw new AppError('Analysis request timed out', 408, 'TIMEOUT_ERROR');
      }
      if (error.message.includes('file')) {
        throw new AppError('File processing failed', 400, 'FILE_PROCESSING_ERROR');
      }
      if (error.message.includes('AI service') || error.message.includes('DEEPSEEK')) {
        throw new AppError('AI service temporarily unavailable', 503, 'AI_SERVICE_UNAVAILABLE');
      }
    }

    throw new AppError('Resume analysis failed', 500, 'ANALYSIS_ERROR');
  }
}

/**
 * Helper to set resume analysis status - D1 first, KV optional cache
 */
async function setResumeStatus(c: AuthenticatedContext, id: string, value: any): Promise<void> {
  // D1 is the source of truth - this should already be handled by the main DB operations
  // KV is just an optional cache for faster reads
  try {
    await c.env.CACHE.put(`resume:${id}`, JSON.stringify(value), { expirationTtl: 60 * 60 }); // 1 hour
  } catch (e) {
    // KV failures should not break the flow - D1 is authoritative
    console.warn('KV cache write failed (non-critical):', e.message);
  }
}

export async function getResumeStatusHandler(c: AuthenticatedContext): Promise<Response> {
  const id = c.req.param('id');
  const forceDb = c.req.query('source') === 'db'; // Debug param to force D1 read
  
  logger.info('Getting resume status', { analysisId: id, forceDb });
  
  try {
    let data = null;
    
    // Try KV cache first (unless forced to use DB)
    if (!forceDb) {
      try {
        const raw = await c.env.CACHE.get(`resume:${id}`);
        if (raw) {
          data = JSON.parse(raw);
          logger.info('Found status in KV cache', { analysisId: id, status: data.status });
        }
      } catch (kvError) {
        logger.warn('KV read failed (non-critical), falling back to D1:', { 
          analysisId: id, 
          error: kvError instanceof Error ? kvError.message : 'Unknown error' 
        });
      }
    }
    
    // If no KV data or forced DB read, check D1 (authoritative source)
    if (!data) {
      try {
        const row = await c.env.DB.prepare('SELECT analysis_data FROM resume_analyses WHERE id = ? LIMIT 1').bind(id).first<{ analysis_data: string }>();
        if (row?.analysis_data) {
          const parsed = JSON.parse(row.analysis_data);
          data = parsed;
          logger.info('Found status in D1', { analysisId: id, status: data.status });
          
          // Optionally cache in KV for future reads (ignore failures)
          try {
            await c.env.CACHE.put(`resume:${id}`, JSON.stringify(data), { expirationTtl: 60 * 60 });
          } catch (kvError) {
            logger.warn('KV cache write failed (non-critical):', { 
              analysisId: id, 
              error: kvError instanceof Error ? kvError.message : 'Unknown error' 
            });
          }
        } else {
          logger.info('No analysis found in D1', { analysisId: id });
        }
      } catch (dbErr) {
        logger.error('D1 lookup failed:', { 
          analysisId: id, 
          error: dbErr instanceof Error ? dbErr.message : 'Unknown error',
          stack: dbErr instanceof Error ? dbErr.stack : undefined
        });
        return c.json({ 
          status: 'failed', 
          analysis_id: id, 
          error: 'Database error',
          details: dbErr instanceof Error ? dbErr.message : 'Unknown error'
        }, 500);
      }
    }
    
    // Return appropriate response based on data
    if (data) {
      if (data.status === 'completed') {
        logger.info('Returning completed analysis', { analysisId: id });
        return c.json(data, 200);
      }
      if (data.status === 'failed') {
        logger.warn('Returning failed analysis', { analysisId: id, error: data.error });
        return c.json({ status: 'failed', analysis_id: id, error: data.error }, 500);
      }
      logger.info('Analysis still processing', { analysisId: id });
      return c.json({ status: 'processing', analysis_id: id, message: data.message || 'Processing' }, 202);
    }

    // No record found - this is normal during the initial processing phase
    logger.info('Analysis not found yet (may still be initializing)', { analysisId: id });
    return c.json({ 
      status: 'processing', 
      analysis_id: id, 
      message: 'Analysis is being initialized. Please continue waiting...' 
    }, 202);
    
  } catch (error) {
    logger.error('Get resume status failed:', { 
      analysisId: id, 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return c.json({ 
      status: 'failed', 
      analysis_id: id, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
}

/**
 * Initializes the AI analysis service
 */
async function initializeAIService(c: AuthenticatedContext) {
  try {
    const { AIAnalysisService } = await import('../../../services/aiAnalysisService');
    const aiAnalysisService = new AIAnalysisService(c.env);

    // Check AI service status
    const aiStatus = aiAnalysisService.getAIStatus();
    logger.info('AI Service Status', aiStatus);

    return aiAnalysisService;
  } catch (error) {
    logger.error('Failed to initialize AI service', error);
    throw new AppError('AI service initialization failed', 500, 'AI_INIT_ERROR');
  }
}

/**
 * Stores analysis result in database for future reference
 */
async function storeAnalysisResult(c: AuthenticatedContext, response: ResumeAnalysisResponse) {
  try {
    // Start a transaction to ensure both inserts complete
    const db = c.env.DB as D1Database;
    await db.batch([
      db.prepare(`
        INSERT INTO resume_analyses (
          id, user_id, analysis_data, created_at
        ) VALUES (?, ?, ?, ?)
      `).bind(
        response.data.analysis_id,
        response.data.user_id,
        JSON.stringify(response),
        new Date().toISOString()
      ),
      db.prepare(`
        INSERT INTO analyses (
          id, user_id, analysis_type, status, created_at, narrative, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        response.data.analysis_id,
        response.data.user_id,
        response.data.analysis_type,
        'completed',
        new Date().toISOString(),
        response.data.narrative,
        JSON.stringify(response.metadata)
      )
    ]);

    logger.info('Analysis result stored successfully', {
      analysisId: response.data.analysis_id,
      userId: response.data.user_id
    });
  } catch (error) {
    logger.warn('Failed to store analysis result', {
      analysisId: response.data.analysis_id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    // Don't throw error - storage failure shouldn't fail the analysis
  }
}
