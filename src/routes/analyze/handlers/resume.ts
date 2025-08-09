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
        // Initialize AI analysis service
        const aiAnalysisService = await initializeAIService(c);

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
          error: error instanceof Error ? error.message : 'Unknown error'
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
 * Helper to set/get resume analysis status in KV
 */
async function setResumeStatus(c: AuthenticatedContext, id: string, value: any): Promise<void> {
  try {
    await c.env.CACHE.put(`resume:${id}`, JSON.stringify(value), { expirationTtl: 60 * 60 }); // 1 hour
  } catch (e) {
    logger.warn('Failed to write resume status to KV', e);
  }
}

export async function getResumeStatusHandler(c: AuthenticatedContext): Promise<Response> {
  const id = c.req.param('id');
  try {
    // First check KV status
    const raw = await c.env.CACHE.get(`resume:${id}`);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.status === 'completed') {
        return c.json(data, 200);
      }
      if (data.status === 'failed') {
        return c.json({ status: 'failed', analysis_id: id, error: data.error }, 500);
      }
      return c.json({ status: 'processing', analysis_id: id, message: data.message || 'Processing' }, 202);
    }

    // Fallback: check DB if result already stored
    try {
      const row = await c.env.DB.prepare('SELECT analysis_data FROM resume_analyses WHERE id = ? LIMIT 1').bind(id).first<{ analysis_data: string }>();
      if (row?.analysis_data) {
        const parsed = JSON.parse(row.analysis_data);
        return c.json({ status: 'completed', analysis_id: id, data: parsed.data, success: true, timestamp: parsed.timestamp }, 200);
      }
    } catch (dbErr) {
      logger.warn('DB lookup for resume status failed', dbErr);
    }

    // Unknown job id
    return c.json({ status: 'processing', analysis_id: id, message: 'Analysis is being prepared.' }, 202);
  } catch (error) {
    logger.error('Get resume status failed', error);
    return c.json({ status: 'failed', analysis_id: id, error: error instanceof Error ? error.message : 'Unknown error' }, 500);
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
    await c.env.DB
      .prepare(`
        INSERT INTO resume_analyses (
          id, user_id, analysis_data, created_at
        ) VALUES (?, ?, ?, ?)
      `)
      .bind(
        response.data.analysis_id,
        response.data.user_id,
        JSON.stringify(response),
        new Date().toISOString()
      )
      .run();

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