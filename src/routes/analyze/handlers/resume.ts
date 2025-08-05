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
    logger.info('Starting resume analysis', { userId });

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

    // Store analysis result for future reference
    await storeAnalysisResult(c, response);

    logger.info('Resume analysis completed successfully', {
      userId,
      analysisId: response.data.analysis_id,
      processingTime: response.processingTime
    });

    return c.json(response, 200);

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