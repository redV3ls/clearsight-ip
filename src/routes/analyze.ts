import { Hono } from 'hono';
import { z } from 'zod';
import { Env } from '../index';
import { AuthenticatedContext, requireAuth } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { validateRequest, gapAnalysisRequestSchema, teamAnalysisRequestSchema } from '../schemas/validation';
import { GapAnalysisService } from '../services/gapAnalysis';
import { SkillMatchingService, UserSkill } from '../services/skillMatching';
import { JobAnalysisService, JobSkillRequirement } from '../services/jobAnalysis';
import { TrendsAnalysisService } from '../services/trendsAnalysis';
import { TeamAnalysisService, TeamMember, ProjectRequirements } from '../services/teamAnalysis';
import { createDatabase } from '../config/database';
import { CacheService, CacheNamespaces, CacheTTL } from '../services/cache';
import { enhancedLogger } from '../utils/enhancedLogger';
import { kvStorage } from '../utils/kvStorage';

const analyze = new Hono<{ Bindings: Env }>();

// Authentication is handled at the app level, no need to apply it here

// Security constants for file uploads
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_JOB_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];
const MAX_TEXT_LENGTH = 50000; // 50k characters

/**
 * POST /analyze/resume - Resume/CV analysis with file upload support
 * Analyzes uploaded resume files or text against job descriptions
 */
analyze.post('/resume', async (c: AuthenticatedContext) => {
  // Initialize enhanced logging and KV storage with environment
  enhancedLogger.setEnv(c.env);
  kvStorage.setEnv(c.env);
  
  enhancedLogger.info('📍 Resume analysis endpoint called', {
    path: '/analyze/resume',
    method: 'POST',
    timestamp: Date.now()
  });
  
  const user = c.get('user');
  enhancedLogger.debug('User context retrieved', user ? { id: user.id, email: user.email } : { user: 'null' });
  
  const userId = user?.id;
  if (!userId) {
    enhancedLogger.warn('❌ No user ID found, returning 401', {
      hasUser: !!user,
      userKeys: user ? Object.keys(user) : []
    });
    return c.json({
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'User authentication required for analysis'
      }
    }, 401);
  }
  
  enhancedLogger.info('✅ User authenticated successfully', { userId });

  const analysisId = crypto.randomUUID();
  enhancedLogger.logAnalysisStart(analysisId, userId, {
    source: 'web',
    hasFile: false,
    hasText: false
  });

  try {
    enhancedLogger.logAnalysisCheckpoint(analysisId, 'PARSING_FORM_DATA');
    
    // Parse form data
    const formData = await c.req.formData();
    const resumeText = formData.get('resumeText') as string | null;
    const resumeFile = formData.get('resume') as File | null;

    enhancedLogger.info('📝 Form data parsed', {
      analysisId,
      hasResumeText: !!resumeText,
      hasResumeFile: !!resumeFile,
      fileSize: resumeFile?.size || 0,
      textLength: resumeText?.length || 0
    });

    // Get resume content
    let content = '';
    if (resumeFile) {
      enhancedLogger.logAnalysisCheckpoint(analysisId, 'READING_FILE', {
        fileName: resumeFile.name,
        fileType: resumeFile.type,
        fileSize: resumeFile.size
      });
      content = await resumeFile.text();
      enhancedLogger.info('📄 File content read successfully', {
        analysisId,
        contentLength: content.length,
        fileName: resumeFile.name
      });
    } else if (resumeText) {
      enhancedLogger.logAnalysisCheckpoint(analysisId, 'USING_TEXT_INPUT');
      content = resumeText;
      enhancedLogger.info('📝 Using text input', {
        analysisId,
        contentLength: content.length
      });
    } else {
      enhancedLogger.error('❌ No content provided for analysis', {
        analysisId,
        hasFile: false,
        hasText: false
      });
      enhancedLogger.logAnalysisComplete(analysisId, false, { reason: 'NO_CONTENT' });
      return c.json({
        error: {
          code: 'MISSING_CONTENT',
          message: 'Please provide resume text or upload a file'
        }
      }, 400);
    }

    // Get job description if provided
    const jobDescription = formData.get('jobDescriptionText') as string | null || '';

    // Create initial analysis record with "processing" status
    const initialRecord = {
      analysis_id: analysisId,
      user_id: userId,
      timestamp: new Date().toISOString(),
      status: 'processing',
      aiPowered: true,
      message: 'Analysis is being processed. Please check back in a few minutes.',
      metadata: {
        processingStarted: new Date().toISOString(),
        hasJobDescription: !!jobDescription
      }
    };

    // Save initial record to database
    enhancedLogger.logAnalysisCheckpoint(analysisId, 'SAVING_TO_DB', {
      status: 'processing',
      hasJobDescription: !!jobDescription
    });
    
    try {
      await c.env.DB
        .prepare(`
          INSERT INTO resume_analyses (
            id, user_id, analysis_data, created_at
          ) VALUES (?, ?, ?, ?)
        `)
        .bind(
          analysisId,
          userId,
          JSON.stringify(initialRecord),
          new Date().toISOString()
        )
        .run();
      
      enhancedLogger.info('💾 Initial record saved to D1 database', {
        analysisId,
        userId,
        recordSize: JSON.stringify(initialRecord).length
      });
    } catch (dbError) {
      enhancedLogger.error('❌ Failed to save initial record to database', dbError, {
        analysisId,
        userId
      });
      throw dbError;
    }

    // Store initial status in KV for fast retrieval
    const kvStored = await kvStorage.putAnalysisStatus(analysisId, initialRecord);
    if (!kvStored) {
      enhancedLogger.warn('⚠️ Failed to store initial status in KV cache', { analysisId });
    } else {
      enhancedLogger.info('✅ Initial status stored in KV cache', { analysisId });
    }
    
    // Start async analysis (fire and forget)
    enhancedLogger.logAnalysisCheckpoint(analysisId, 'SUBMITTING_ASYNC_TASK');
    enhancedLogger.info(`🚀 Submitting async analysis for ${analysisId} to executionCtx.waitUntil`, {
      analysisId,
      contentLength: content.length,
      hasJobDescription: !!jobDescription
    });
    
    c.executionCtx.waitUntil(
      performAsyncAnalysis(c.env, analysisId, userId, content, jobDescription)
        .then(() => {
          enhancedLogger.info(`✨ Async analysis completed successfully for ${analysisId}`, {
            analysisId,
            stage: 'ASYNC_COMPLETE'
          });
        })
        .catch((error) => {
          enhancedLogger.error(`❌ Async analysis failed for ${analysisId}`, error, {
            analysisId,
            stage: 'ASYNC_FAILED'
          });
        })
    );

    // Return immediate response with analysis ID
    return c.json({
      analysis_id: analysisId,
      user_id: userId,
      status: 'processing',
      message: 'Analysis started successfully. Use the analysis_id to check status and retrieve results.',
      timestamp: new Date().toISOString(),
      estimated_completion: new Date(Date.now() + 90 * 1000).toISOString(), // 90 seconds estimate
      check_status_url: `/api/v1/analyze/resume/${analysisId}`,
      history_url: '/api/v1/analyze/resume/history'
    }, 202); // 202 Accepted

  } catch (error) {
    enhancedLogger.error('🔥 Analysis submission error', error, {
      analysisId,
      userId,
      errorType: error?.constructor?.name,
      stage: 'SUBMISSION'
    });
    
    enhancedLogger.logAnalysisComplete(analysisId, false, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stage: 'SUBMISSION_FAILED'
    });

    return c.json({
      error: {
        code: 'SUBMISSION_FAILED',
        message: 'Failed to submit analysis request. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Async function to perform the actual analysis
async function performAsyncAnalysis(
  env: any,
  analysisId: string,
  userId: string,
  content: string,
  jobDescription: string
) {
  // CRITICAL: Add console.log for immediate visibility in wrangler tail
  console.log(`[ASYNC-START] ${analysisId} - Starting async analysis`);
  
  // Initialize enhanced logging and KV storage
  enhancedLogger.setEnv(env);
  kvStorage.setEnv(env);
  
  // Track CPU time from the start
  const startCpuTime = Date.now();
  
  enhancedLogger.info(`🎯 Starting async analysis for ${analysisId}`, {
    analysisId,
    userId,
    contentLength: content.length,
    hasJobDescription: !!jobDescription,
    stage: 'ASYNC_START'
  });
  
  console.log(`[ASYNC-LOG] ${analysisId} - Content length: ${content.length}, Has job desc: ${!!jobDescription}`);
  
  // Initialize AI-powered analysis service outside try block so it's available in catch
  const { AIAnalysisService } = await import('../services/aiAnalysisService');
  let aiAnalysisService: any;
  
  try {
    console.log(`[ASYNC-TRY] ${analysisId} - Entered try block, CPU time: ${Date.now() - startCpuTime}ms`);
    enhancedLogger.logAnalysisCheckpoint(analysisId, 'AI_SERVICE_INIT');
    
    console.log(`[ASYNC-AI-INIT] ${analysisId} - About to initialize AI service`);
    aiAnalysisService = new AIAnalysisService(env);
    console.log(`[ASYNC-AI-READY] ${analysisId} - AI service initialized, CPU time: ${Date.now() - startCpuTime}ms`);
    
    enhancedLogger.info(`🤖 AI service initialized for ${analysisId}`, {
      analysisId,
      stage: 'AI_READY',
      cpuTime: Date.now() - startCpuTime
    });

    // Perform AI-powered analysis using DeepSeek with timeout
    const analysisTimeout = 120000; // 120 seconds timeout (2 minutes) - keeping as requested
    console.log(`[ASYNC-DEEPSEEK-START] ${analysisId} - Starting DeepSeek call with ${analysisTimeout}ms timeout, CPU time: ${Date.now() - startCpuTime}ms`);
    
    enhancedLogger.logAnalysisCheckpoint(analysisId, 'AI_ANALYSIS_START', {
      timeout: analysisTimeout,
      contentLength: content.length,
      cpuTime: Date.now() - startCpuTime
    });
    
    console.log(`[ASYNC-PROMISE-RACE] ${analysisId} - Setting up Promise.race`);
    
    const response = await Promise.race([
      aiAnalysisService.analyzeCV(
        content,
        jobDescription,
        {
          includeSkillsGap: !!jobDescription,
          includeCareerSuggestions: false,
          includeIndustryTrends: false,
        }
      ).then(result => {
        console.log(`[ASYNC-DEEPSEEK-SUCCESS] ${analysisId} - DeepSeek returned, CPU time: ${Date.now() - startCpuTime}ms`);
        enhancedLogger.logAnalysisCheckpoint(analysisId, 'AI_ANALYSIS_SUCCESS', {
          skillsFound: result.skillsAnalysis?.skills?.length || 0,
          categoriesFound: result.skillsAnalysis?.categories?.length || 0,
          hasGapAnalysis: !!result.skillGaps,
          cpuTime: Date.now() - startCpuTime
        });
        enhancedLogger.info(`✅ AI analysis completed for ${analysisId}`, {
          analysisId,
          skillsCount: result.skillsAnalysis?.skills?.length || 0,
          stage: 'AI_COMPLETE',
          cpuTime: Date.now() - startCpuTime
        });
        return result;
      }).catch(error => {
        console.log(`[ASYNC-DEEPSEEK-ERROR] ${analysisId} - DeepSeek failed: ${error.message}, CPU time: ${Date.now() - startCpuTime}ms`);
        enhancedLogger.error(`❌ AI analysis failed for ${analysisId}`, error, {
          analysisId,
          stage: 'AI_ERROR',
          errorType: error?.name,
          cpuTime: Date.now() - startCpuTime
        });
        throw error;
      }),
      new Promise((_, reject) => 
        setTimeout(() => {
          console.log(`[ASYNC-TIMEOUT] ${analysisId} - Timeout reached after ${analysisTimeout}ms`);
          enhancedLogger.critical(`⏰ Analysis timeout for ${analysisId} after ${analysisTimeout/1000}s`, {
            analysisId,
            timeout: analysisTimeout,
            stage: 'TIMEOUT',
            cpuTime: Date.now() - startCpuTime
          });
          reject(new Error(`Analysis timeout after ${analysisTimeout/1000} seconds`));
        }, analysisTimeout)
      )
    ]) as any;
    
    console.log(`[ASYNC-RESPONSE] ${analysisId} - Got response from Promise.race, CPU time: ${Date.now() - startCpuTime}ms`);

    enhancedLogger.logAnalysisCheckpoint(analysisId, 'PREPARING_RESPONSE');
    
    // Set the user ID and timestamp
    response.user_id = userId;
    response.timestamp = new Date().toISOString();
    response.analysis_id = analysisId;
    response.status = 'completed';

    // Test JSON serialization before database update
    let responseJson: string;
    try {
      responseJson = JSON.stringify(response);
      enhancedLogger.info(`📦 Response prepared for ${analysisId}`, {
        analysisId,
        responseSize: responseJson.length,
        stage: 'SERIALIZATION_SUCCESS'
      });
    } catch (jsonError) {
      enhancedLogger.error(`❌ JSON serialization failed for ${analysisId}`, jsonError, {
        analysisId,
        stage: 'SERIALIZATION_ERROR'
      });
      throw new Error(`Failed to serialize analysis response: ${jsonError}`);
    }

    try {
      console.log(`[ASYNC-DB-UPDATE-START] ${analysisId} - About to update DB, CPU time: ${Date.now() - startCpuTime}ms`);
      enhancedLogger.logAnalysisCheckpoint(analysisId, 'DB_UPDATE_START');
      
      // Update the database record with completed analysis
      console.log(`[ASYNC-DB-PREPARE] ${analysisId} - Preparing UPDATE statement`);
      const updateStatement = env.DB
        .prepare(`
          UPDATE resume_analyses 
          SET analysis_data = ?, created_at = ?
          WHERE id = ? AND user_id = ?
        `);
      
      console.log(`[ASYNC-DB-BIND] ${analysisId} - Binding parameters: data_size=${responseJson.length}, userId=${userId}`);
      const boundStatement = updateStatement.bind(
        responseJson,
        new Date().toISOString(),
        analysisId,
        userId
      );
      
      console.log(`[ASYNC-DB-RUN] ${analysisId} - Executing UPDATE, CPU time: ${Date.now() - startCpuTime}ms`);
      const updateResult = await boundStatement.run();
      console.log(`[ASYNC-DB-RESULT] ${analysisId} - Update result: success=${updateResult.success}, changes=${updateResult.changes}, CPU time: ${Date.now() - startCpuTime}ms`);

      enhancedLogger.info(`💾 Database updated for ${analysisId}`, {
        analysisId,
        success: updateResult.success,
        changes: updateResult.changes,
        stage: 'DB_UPDATE_SUCCESS'
      });

      if (updateResult.changes === 0) {
        enhancedLogger.critical(`🔥 No rows updated for ${analysisId}`, {
          analysisId,
          userId,
          stage: 'DB_UPDATE_FAILED'
        });
        throw new Error('Database update failed - no rows affected');
      }

      // Update KV cache with completed status
      console.log(`[ASYNC-KV-START] ${analysisId} - Starting KV cache update, CPU time: ${Date.now() - startCpuTime}ms`);
      enhancedLogger.logAnalysisCheckpoint(analysisId, 'KV_UPDATE_START');
      
      const kvSuccess = await kvStorage.putAnalysisStatus(analysisId, response);
      console.log(`[ASYNC-KV-RESULT] ${analysisId} - KV update result: ${kvSuccess ? 'SUCCESS' : 'FAILED'}, CPU time: ${Date.now() - startCpuTime}ms`);
      
      if (kvSuccess) {
        enhancedLogger.info(`✅ KV cache updated for ${analysisId}`, { analysisId });
      } else {
        enhancedLogger.warn(`⚠️ KV cache update failed for ${analysisId}`, { analysisId });
      }
      
      // Verify the update was successful by reading the record back
      console.log(`[ASYNC-VERIFY-START] ${analysisId} - Starting verification read, CPU time: ${Date.now() - startCpuTime}ms`);
      const verifyRecord = await env.DB
        .prepare('SELECT analysis_data FROM resume_analyses WHERE id = ? AND user_id = ?')
        .bind(analysisId, userId)
        .first() as any;
      console.log(`[ASYNC-VERIFY-RESULT] ${analysisId} - Verification read complete: found=${!!verifyRecord}, CPU time: ${Date.now() - startCpuTime}ms`);

      if (verifyRecord) {
        const storedData = JSON.parse(verifyRecord.analysis_data);
        enhancedLogger.info(`✔️ Verification: Record ${analysisId} status is ${storedData.status}`, {
          analysisId,
          status: storedData.status,
          stage: 'VERIFICATION_SUCCESS'
        });
      } else {
        enhancedLogger.error(`❌ Verification failed: Record ${analysisId} not found`, {
          analysisId,
          stage: 'VERIFICATION_FAILED'
        });
      }

      enhancedLogger.logAnalysisComplete(analysisId, true, {
        skillsFound: response.skillsAnalysis?.skills?.length || 0,
        processingStage: 'ASYNC_COMPLETE',
        totalCpuTime: Date.now() - startCpuTime
      });
      
      console.log(`[ASYNC-COMPLETE] ${analysisId} - Analysis fully complete! Total CPU time: ${Date.now() - startCpuTime}ms`);
      
      enhancedLogger.info(`✨ FINAL: Successfully completed async analysis for ${analysisId}`, {
        analysisId,
        stage: 'FINAL_SUCCESS',
        totalCpuTime: Date.now() - startCpuTime
      });
    } catch (dbError) {
      console.log(`[ASYNC-DB-ERROR] ${analysisId} - Database error: ${dbError instanceof Error ? dbError.message : 'Unknown'}, CPU time: ${Date.now() - startCpuTime}ms`);
      
      enhancedLogger.error(`🔥 Database operation failed for ${analysisId}`, dbError, {
        analysisId,
        stage: 'DB_ERROR',
        cpuTime: Date.now() - startCpuTime,
        errorMessage: dbError instanceof Error ? dbError.message : 'Unknown'
      });
      throw dbError;
    }

  } catch (error) {
    console.log(`[ASYNC-CATCH] ${analysisId} - Caught error: ${error instanceof Error ? error.message : 'Unknown'}, CPU time: ${Date.now() - startCpuTime}ms`);
    
    enhancedLogger.error(`🔥 Failed async analysis for ${analysisId}`, error, {
      analysisId,
      userId,
      stage: 'ASYNC_ERROR',
      errorType: error?.constructor?.name,
      cpuTime: Date.now() - startCpuTime,
      errorMessage: error instanceof Error ? error.message : 'Unknown'
    });

    // No fallback: if AI fails, mark as failed immediately
    let errorCode = 'AI_SERVICE_UNAVAILABLE';
    let errorMessage = 'AI analysis failed. Please try submitting again.';
    if (error instanceof Error && error.message.includes('timeout')) {
      errorCode = 'ANALYSIS_TIMEOUT';
      errorMessage = 'Analysis timed out. Please try again later.';
      enhancedLogger.warn(`⏰ Analysis timed out for ${analysisId}`, { analysisId });
    }

    const errorRecord = {
      analysis_id: analysisId,
      user_id: userId,
      timestamp: new Date().toISOString(),
      status: 'failed',
      aiPowered: false,
      error: {
        code: errorCode,
        message: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      metadata: {
        processingFailed: new Date().toISOString()
      }
    };

    try {
      await updateDatabaseWithError(env, analysisId, userId, errorRecord);
      
      // Also update KV cache with error status
      await kvStorage.putAnalysisStatus(analysisId, errorRecord);
      
      enhancedLogger.logAnalysisComplete(analysisId, false, {
        errorCode,
        errorMessage,
        stage: 'ASYNC_FAILED'
      });
      
      enhancedLogger.error(`❌ FINAL: Analysis ${analysisId} marked as failed`, {
        analysisId,
        errorCode,
        stage: 'FINAL_FAILED'
      });
    } catch (dbError) {
      enhancedLogger.critical(`🔥 CRITICAL: Failed to update error status for ${analysisId}`, {
        analysisId,
        dbError: dbError instanceof Error ? dbError.message : 'Unknown',
        stage: 'CRITICAL_ERROR'
      });
      // This is critical - the record will stay in "processing" state
    }
  }
}

/**
 * Helper function to safely update database with error status
 */
async function updateDatabaseWithError(env: any, analysisId: string, userId: string, errorRecord: any) {
  try {
    const errorJson = JSON.stringify(errorRecord);
    await env.DB
      .prepare(`
        UPDATE resume_analyses 
        SET analysis_data = ?, created_at = ?
        WHERE id = ? AND user_id = ?
      `)
      .bind(
        errorJson,
        new Date().toISOString(),
        analysisId,
        userId
      )
      .run();
    console.log(`Error record updated successfully for ${analysisId}`);
  } catch (dbError) {
    console.error(`Failed to update error record for ${analysisId}:`, dbError);
    
    // Last resort: update with minimal error record
    try {
      const minimalErrorRecord = {
        analysis_id: analysisId,
        user_id: userId,
        timestamp: new Date().toISOString(),
        status: 'failed',
        error: { code: 'PROCESSING_FAILED', message: 'Analysis failed due to system error' }
      };
      
      await env.DB
        .prepare(`
          UPDATE resume_analyses 
          SET analysis_data = ?, created_at = ?
          WHERE id = ? AND user_id = ?
        `)
        .bind(
          JSON.stringify(minimalErrorRecord),
          new Date().toISOString(),
          analysisId,
          userId
        )
        .run();
      console.log(`Minimal error record updated for ${analysisId}`);
    } catch (finalError) {
      console.error(`Critical: Could not update any error record for ${analysisId}:`, finalError);
      
      // Absolute last resort: try to update with just status change
      try {
        await env.DB
          .prepare(`
            UPDATE resume_analyses 
            SET analysis_data = ?, created_at = ?
            WHERE id = ? AND user_id = ?
          `)
          .bind(
            '{"status":"failed","error":{"code":"SYSTEM_ERROR","message":"Processing failed"}}',
            new Date().toISOString(),
            analysisId,
            userId
          )
          .run();
        console.log(`Absolute minimal error record updated for ${analysisId}`);
      } catch (absoluteFinalError) {
        console.error(`CRITICAL: Record ${analysisId} will remain in processing state:`, absoluteFinalError);
      }
    }
  }
}

/**
 * GET /analyze/test-ai - Test AI service connectivity
 */
analyze.get('/test-ai', async (c: AuthenticatedContext) => {
  try {
    // Lightweight config-based status check without invoking AIAnalysisService internals
    const hasApiKey = !!c.env.DEEPSEEK_API_KEY;
    const status = { enabled: hasApiKey };

    const info = {
      baseUrl: c.env.DEEPSEEK_BASE_URL || 'default',
      model: c.env.DEEPSEEK_MODEL || 'default',
      timeout: c.env.DEEPSEEK_TIMEOUT || 'unknown'
    };

    return c.json({ status, info, message: 'AI config check completed' });
  } catch (error) {
    console.error('AI test error:', error);
    return c.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * GET /analyze/resume/history - Get user's resume analysis history
 */
analyze.get('/resume/history', async (c: AuthenticatedContext) => {
  const user = c.get('user');
  const userId = user?.id;
  if (!userId) {
    return c.json({
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'User authentication required'
      }
    }, 401);
  }

  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = Math.min(parseInt(c.req.query('limit') || '10'), 50);
    const offset = (page - 1) * limit;

    const analyses = await c.env.DB
      .prepare(`
        SELECT id, created_at, 
               JSON_EXTRACT(analysis_data, '$.timestamp') as analysis_timestamp,
               JSON_EXTRACT(analysis_data, '$.aiPowered') as ai_powered,
               JSON_EXTRACT(analysis_data, '$.status') as status,
               JSON_EXTRACT(analysis_data, '$.skillsAnalysis.totalSkills') as total_skills
        FROM resume_analyses 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `)
      .bind(userId, limit, offset)
      .all();

    const totalCount = await c.env.DB
      .prepare('SELECT COUNT(*) as count FROM resume_analyses WHERE user_id = ?')
      .bind(userId)
      .first() as any;

    return c.json({
      analyses: analyses.results?.map((analysis: any) => ({
        id: analysis.id,
        created_at: analysis.created_at,
        analysis_timestamp: analysis.analysis_timestamp,
        ai_powered: analysis.ai_powered === 1 || analysis.ai_powered === true,
        status: analysis.status || 'unknown',
        total_skills: analysis.total_skills || 0
      })) || [],
      pagination: {
        page,
        limit,
        total: totalCount?.count || 0,
        pages: Math.ceil((totalCount?.count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Get analysis history error:', error);
    return c.json({
      error: {
        code: 'HISTORY_RETRIEVAL_FAILED',
        message: 'Failed to retrieve analysis history',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, 500);
  }
});

/**
 * GET /analyze/resume/:analysisId - Retrieve a specific resume analysis
 */
analyze.get('/resume/:analysisId', async (c: AuthenticatedContext) => {
  const analysisId = c.req.param('analysisId');
  const user = c.get('user');
  const userId = user?.id;
  if (!userId) {
    return c.json({
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'User authentication required'
      }
    }, 401);
  }

  try {
    const analysis = await c.env.DB
      .prepare('SELECT * FROM resume_analyses WHERE id = ? AND user_id = ?')
      .bind(analysisId, userId)
      .first() as any;

    if (!analysis) {
      return c.json({
        error: {
          code: 'ANALYSIS_NOT_FOUND',
          message: 'Resume analysis not found'
        }
      }, 404);
    }

    const analysisData = JSON.parse(analysis.analysis_data);

    // Add retrieval timestamp
    analysisData.retrieved_at = new Date().toISOString();

    // Return appropriate HTTP status based on analysis status
    if (analysisData.status === 'processing') {
      return c.json(analysisData, 202); // Still processing
    } else if (analysisData.status === 'failed') {
      return c.json(analysisData, 500); // Analysis failed
    } else {
      return c.json(analysisData, 200); // Completed successfully
    }

  } catch (error) {
    console.error('Retrieve analysis error:', error);
    return c.json({
      error: {
        code: 'RETRIEVAL_FAILED',
        message: 'Failed to retrieve resume analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, 500);
  }
});

// Helper function to extract text from uploaded files
async function extractTextFromFile(file: File): Promise<string> {
  try {
    if (file.type === 'text/plain') {
      return await file.text();
    }

    // For PDF and DOC files, we'll simulate text extraction
    // In a real implementation, you'd use libraries like pdf-parse or mammoth
    const content = await file.text();

    // Basic text cleaning and extraction simulation
    return content
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, MAX_TEXT_LENGTH); // Ensure length limit

  } catch (error) {
    throw new AppError('Failed to extract text from file', 400, 'TEXT_EXTRACTION_FAILED');
  }
}



/**
 * POST /analyze/gap - Individual skill gap analysis
 * Analyzes gaps between user skills and target job requirements
 */
analyze.post('/gap', validateRequest(gapAnalysisRequestSchema), async (c: AuthenticatedContext) => {
  const startTime = Date.now();

  try {
    const validatedData = c.get('validatedData') as z.infer<typeof gapAnalysisRequestSchema>;
    const { user_skills, target_job, analysis_options } = validatedData;

    // Initialize database and services
    const database = createDatabase(c.env.DB);
    const skillMatchingService = new SkillMatchingService(database);
    const gapAnalysisService = new GapAnalysisService(skillMatchingService);
    const jobAnalysisService = new JobAnalysisService();

    // Convert user skills to internal format
    const userSkills: UserSkill[] = user_skills.map((skill: any) => ({
      skillId: crypto.randomUUID(), // Generate temporary ID
      skillName: skill.skill,
      skillCategory: 'General', // Will be categorized by the service
      level: skill.level,
      yearsExperience: skill.years_experience || 0,
      confidenceScore: 0.8, // Default confidence
      certifications: skill.certifications || []
    }));

    // Analyze job description to extract requirements
    const jobAnalysisResult = await jobAnalysisService.analyzeJobDescription(
      target_job.description,
      target_job.title
    );

    const jobRequirements: JobSkillRequirement[] = jobAnalysisResult.skillRequirements;

    // Perform gap analysis
    const gapAnalysisResult = await gapAnalysisService.analyzeGaps(userSkills, jobRequirements);

    // Calculate processing time
    const processingTime = Date.now() - startTime;

    // Format response according to API design
    const response = {
      analysis_id: crypto.randomUUID(),
      user_id: c.get('user')!.id,
      target_job: {
        title: target_job.title,
        company: target_job.company,
        location: target_job.location
      },
      overall_match: gapAnalysisResult.overallMatchPercentage,
      skill_gaps: gapAnalysisResult.skillGaps.map(gap => ({
        skill_name: gap.skillName,
        category: gap.category,
        current_level: gap.currentLevel,
        required_level: gap.requiredLevel,
        gap_severity: gap.gapSeverity,
        time_to_bridge: gap.timeToCompetency,
        learning_difficulty: gap.learningDifficulty,
        priority: gap.priority,
        importance: gap.importance
      })),
      strengths: gapAnalysisResult.strengths.map(strength => ({
        skill_name: strength.skillName,
        level: strength.level,
        years_experience: strength.yearsExperience,
        category: strength.skillCategory
      })),
      recommendations: gapAnalysisResult.recommendations,
      transferable_opportunities: gapAnalysisResult.transferableOpportunities.map(transfer => ({
        from_skill: transfer.fromSkill.skillName,
        to_skill: transfer.toSkillName,
        transferability_score: transfer.transferabilityScore,
        reasoning: transfer.reasoning
      })),
      metadata: {
        ...gapAnalysisResult.metadata,
        processing_time: processingTime,
        analysis_timestamp: new Date().toISOString(),
        api_version: 'v1'
      }
    };

    // Store analysis result for future reference (optional)
    if (analysis_options?.include_recommendations) {
      try {
        await c.env.DB
          .prepare(`
            INSERT INTO gap_analyses (
              id, user_id, target_job_title, overall_match, 
              skill_gaps_count, created_at, analysis_data
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `)
          .bind(
            response.analysis_id,
            c.get('user')!.id,
            target_job.title,
            response.overall_match,
            response.skill_gaps.length,
            new Date().toISOString(),
            JSON.stringify(response)
          )
          .run();
      } catch (dbError) {
        // Log error but don't fail the request
        console.warn('Failed to store analysis result:', dbError);
      }
    }

    return c.json(response, 200);

  } catch (error) {
    console.error('Gap analysis error:', error);

    if (error instanceof AppError) {
      throw error;
    }

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('validation')) {
        throw new AppError('Invalid input data for gap analysis', 400, 'VALIDATION_ERROR');
      }
      if (error.message.includes('timeout')) {
        throw new AppError('Analysis request timed out', 408, 'TIMEOUT_ERROR');
      }
    }

    throw new AppError('Gap analysis failed', 500, 'ANALYSIS_FAILED');
  }
});

/**
 * GET /analyze/gap/:analysisId - Retrieve previous gap analysis
 */
analyze.get('/gap/:analysisId', async (c: AuthenticatedContext) => {
  const analysisId = c.req.param('analysisId');

  try {
    const analysis = await c.env.DB
      .prepare('SELECT * FROM gap_analyses WHERE id = ? AND user_id = ?')
      .bind(analysisId, c.get('user')!.id)
      .first() as any;

    if (!analysis) {
      throw new AppError('Gap analysis not found', 404, 'ANALYSIS_NOT_FOUND');
    }

    const analysisData = JSON.parse(analysis.analysis_data);

    return c.json({
      ...analysisData,
      retrieved_at: new Date().toISOString()
    });

  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    console.error('Retrieve analysis error:', error);
    throw new AppError('Failed to retrieve gap analysis', 500, 'RETRIEVAL_FAILED');
  }
});

/**
 * GET /analyze/gap/history - Get user's gap analysis history
 */
analyze.get('/gap/history', async (c: AuthenticatedContext) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = Math.min(parseInt(c.req.query('limit') || '10'), 50);
    const offset = (page - 1) * limit;

    const analyses = await c.env.DB
      .prepare(`
        SELECT id, target_job_title, overall_match, skill_gaps_count, created_at
        FROM gap_analyses 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `)
      .bind(c.get('user')!.id, limit, offset)
      .all();

    const totalCount = await c.env.DB
      .prepare('SELECT COUNT(*) as count FROM gap_analyses WHERE user_id = ?')
      .bind(c.get('user')!.id)
      .first() as any;

    return c.json({
      analyses: analyses.results,
      pagination: {
        page,
        limit,
        total: totalCount?.count || 0,
        pages: Math.ceil((totalCount?.count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Get analysis history error:', error);
    throw new AppError('Failed to retrieve analysis history', 500, 'HISTORY_RETRIEVAL_FAILED');
  }
});

/**
 * POST /analyze/team - Team skill gap analysis
 * Analyzes gaps for multiple team members against project requirements
 */
analyze.post('/team', validateRequest(teamAnalysisRequestSchema), async (c: AuthenticatedContext) => {
  const startTime = Date.now();

  try {
    const validatedData = c.get('validatedData') as z.infer<typeof teamAnalysisRequestSchema>;
    const { team_members, project_requirements, analysis_options } = validatedData;

    // Initialize services
    const database = createDatabase(c.env.DB);
    const skillMatchingService = new SkillMatchingService(database);
    const gapAnalysisService = new GapAnalysisService(skillMatchingService);
    const jobAnalysisService = new JobAnalysisService();
    const teamAnalysisService = new TeamAnalysisService(gapAnalysisService, jobAnalysisService);

    // Convert team members to internal format
    const teamMembers: TeamMember[] = team_members.map((member: any) => ({
      id: member.id,
      name: member.name,
      role: member.role,
      department: member.department,
      skills: member.skills.map((skill: any) => ({
        skillId: crypto.randomUUID(),
        skillName: skill.skill,
        skillCategory: 'General', // Will be categorized by the service
        level: skill.level,
        yearsExperience: skill.years_experience || 0,
        confidenceScore: 0.8,
        certifications: skill.certifications || []
      })),
      salary: member.salary,
      hourlyRate: member.hourly_rate
    }));

    // Convert project requirements to internal format
    const projectReqs: ProjectRequirements = {
      name: project_requirements.name,
      description: project_requirements.description,
      required_skills: project_requirements.required_skills,
      timeline: project_requirements.timeline,
      priority: project_requirements.priority,
      budget: project_requirements.budget
    };

    // Perform team analysis using the service
    const teamAnalysisResult = await teamAnalysisService.analyzeTeam(teamMembers, projectReqs);

    // Format response according to API design
    const response = {
      analysis_id: teamAnalysisResult.analysis_id,
      user_id: c.get('user')!.id,
      project: teamAnalysisResult.project,
      team_summary: {
        total_members: teamAnalysisResult.team_summary.total_members,
        overall_match: teamAnalysisResult.team_summary.overall_match,
        critical_gaps_count: teamAnalysisResult.team_summary.critical_gaps_count,
        team_strengths_count: teamAnalysisResult.team_summary.team_strengths_count,
        skill_coverage_percentage: teamAnalysisResult.team_summary.skill_coverage_percentage
      },
      member_analyses: teamAnalysisResult.member_analyses,
      team_gaps: teamAnalysisResult.team_gaps.map(gap => ({
        skill_name: gap.skill_name,
        members_needing: gap.members_needing,
        percentage_needing: gap.percentage_needing,
        severity: gap.severity,
        estimated_training_cost: gap.estimated_training_cost,
        estimated_hiring_cost: gap.estimated_hiring_cost,
        recommended_solution: gap.recommended_solution
      })),
      team_strengths: teamAnalysisResult.team_strengths.map(strength => ({
        skill_name: strength.skill_name,
        members_having: strength.members_having,
        percentage_having: strength.percentage_having,
        coverage: strength.coverage,
        expertise_level: strength.expertise_level
      })),
      recommendations: teamAnalysisResult.recommendations,
      budget_estimates: teamAnalysisResult.budget_estimates,
      metadata: {
        ...teamAnalysisResult.metadata,
        api_version: 'v1'
      }
    };

    // Store team analysis result (optional)
    if (analysis_options?.include_recommendations) {
      try {
        await c.env.DB
          .prepare(`
            INSERT INTO team_analyses (
              id, user_id, project_name, team_size, overall_match, 
              critical_gaps_count, created_at, analysis_data
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `)
          .bind(
            response.analysis_id,
            c.get('user')!.id,
            project_requirements.name,
            response.team_summary.total_members,
            response.team_summary.overall_match,
            response.team_summary.critical_gaps_count,
            new Date().toISOString(),
            JSON.stringify(response)
          )
          .run();
      } catch (dbError) {
        // Log error but don't fail the request
        console.warn('Failed to store team analysis result:', dbError);
      }
    }

    return c.json(response, 200);

  } catch (error) {
    console.error('Team analysis error:', error);

    if (error instanceof AppError) {
      throw error;
    }

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('validation')) {
        throw new AppError('Invalid team analysis data', 400, 'VALIDATION_ERROR');
      }
      if (error.message.includes('timeout')) {
        throw new AppError('Team analysis request timed out', 408, 'TIMEOUT_ERROR');
      }
    }

    throw new AppError('Team analysis failed', 500, 'TEAM_ANALYSIS_FAILED');
  }
});

/**
 * GET /analyze/team/:analysisId - Retrieve previous team analysis
 */
analyze.get('/team/:analysisId', async (c: AuthenticatedContext) => {
  const analysisId = c.req.param('analysisId');

  try {
    const analysis = await c.env.DB
      .prepare('SELECT * FROM team_analyses WHERE id = ? AND user_id = ?')
      .bind(analysisId, c.get('user')!.id)
      .first() as any;

    if (!analysis) {
      throw new AppError('Team analysis not found', 404, 'TEAM_ANALYSIS_NOT_FOUND');
    }

    const analysisData = JSON.parse(analysis.analysis_data);

    return c.json({
      ...analysisData,
      retrieved_at: new Date().toISOString()
    });

  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    console.error('Retrieve team analysis error:', error);
    throw new AppError('Failed to retrieve team analysis', 500, 'TEAM_ANALYSIS_RETRIEVAL_FAILED');
  }
});

/**
 * GET /analyze/team/history - Get user's team analysis history
 */
analyze.get('/team/history', async (c: AuthenticatedContext) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = Math.min(parseInt(c.req.query('limit') || '10'), 50);
    const offset = (page - 1) * limit;

    const analyses = await c.env.DB
      .prepare(`
        SELECT id, project_name, team_size, overall_match, critical_gaps_count, created_at
        FROM team_analyses 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `)
      .bind(c.get('user')!.id, limit, offset)
      .all();

    const totalCount = await c.env.DB
      .prepare('SELECT COUNT(*) as count FROM team_analyses WHERE user_id = ?')
      .bind(c.get('user')!.id)
      .first() as any;

    return c.json({
      analyses: analyses.results,
      pagination: {
        page,
        limit,
        total: totalCount?.count || 0,
        pages: Math.ceil((totalCount?.count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Get team analysis history error:', error);
    throw new AppError('Failed to retrieve team analysis history', 500, 'TEAM_HISTORY_RETRIEVAL_FAILED');
  }
});

/**
 * GET /trends/industry/:industryId? - Get industry trends
 * Retrieve trends data for specific industries or all industries
 */
analyze.get('/trends/industry/:industryId?', async (c: AuthenticatedContext) => {
  try {
    const industryId = c.req.param('industryId');
    const region = c.req.query('region');
    const limit = parseInt(c.req.query('limit') || '10');

    // Initialize trends service
    const database = createDatabase(c.env.DB);
    const trendsService = new TrendsAnalysisService(database);

    const trends = await trendsService.getIndustryTrends(industryId, region, limit);

    return c.json({
      industry: industryId || 'all',
      region: region || 'global',
      trends,
      metadata: {
        count: trends.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error retrieving industry trends:', error);
    throw new AppError('Failed to retrieve industry trends', 500, 'TRENDS_RETRIEVAL_FAILED');
  }
});

/**
 * GET /trends/skills/emerging - Get emerging skills
 * Retrieve data on skills with rapid growth
 */
analyze.get('/trends/skills/emerging', async (c: AuthenticatedContext) => {
  try {
    const category = c.req.query('category');
    const minGrowthRate = parseFloat(c.req.query('minGrowthRate') || '0.2');
    const limit = parseInt(c.req.query('limit') || '20');

    // Initialize services
    const database = createDatabase(c.env.DB);
    const trendsService = new TrendsAnalysisService(database);
    const cacheService = new CacheService(c.env.CACHE);

    // Generate cache key based on query parameters
    const cacheKey = `emerging:${category || 'all'}:${minGrowthRate}:${limit}`;

    // Try to get from cache
    const cached = await cacheService.get(
      CacheNamespaces.TREND_DATA,
      cacheKey
    );

    if (cached) {
      return c.json(cached);
    }

    // If not cached, fetch from database
    const emergingSkills = await trendsService.getEmergingSkills(category, minGrowthRate, limit);

    const response = {
      filter: {
        category: category || 'all',
        minGrowthRate,
        limit
      },
      skills: emergingSkills,
      metadata: {
        count: emergingSkills.length,
        timestamp: new Date().toISOString()
      }
    };

    // Cache the response
    await cacheService.set(
      CacheNamespaces.TREND_DATA,
      cacheKey,
      response,
      { ttl: CacheTTL.MEDIUM } // 1 hour cache
    );

    return c.json(response);
  } catch (error) {
    console.error('Error retrieving emerging skills:', error);
    throw new AppError('Failed to retrieve emerging skills', 500, 'EMERGING_SKILLS_RETRIEVAL_FAILED');
  }
});

/**
 * GET /analyze/debug - Debug page for AI service testing
 */
analyze.get('/debug', async (c: AuthenticatedContext) => {
  const html = `<!DOCTYPE html>
<html>
<head>
    <title>Debug AI Service</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #1a1a1a; color: #fff; }
        button { padding: 10px 20px; margin: 10px; background: #14b8a6; color: white; border: none; border-radius: 5px; cursor: pointer; }
        button:hover { background: #0f9488; }
        #results { margin-top: 20px; padding: 20px; background: #2a2a2a; border-radius: 5px; }
        pre { background: #1a1a1a; padding: 15px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>Debug AI Service</h1>
    <button onclick="testAI()">Test AI Service Status</button>
    <button onclick="testAnalysis()">Test Analysis Flow</button>
    <button onclick="testAuth()">Test Authentication</button>
    <div id="results"></div>

    <script>
        async function testAuth() {
            try {
                const response = await fetch('/api/v1/auth/me', {
                    method: 'GET',
                    credentials: 'include'
                });
                const data = await response.json();
                document.getElementById('results').innerHTML = '<h3>Auth Status:</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
                console.log('Auth test:', data);
            } catch (error) {
                console.error('Auth test error:', error);
                document.getElementById('results').innerHTML = 'Auth test failed: ' + error.message;
            }
        }

        async function testAI() {
            try {
                const response = await fetch('/api/v1/analyze/test-ai', {
                    method: 'GET',
                    credentials: 'include'
                });
                const data = await response.json();
                document.getElementById('results').innerHTML = '<h3>AI Service Status:</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
                console.log('AI service test:', data);
            } catch (error) {
                console.error('AI service test error:', error);
                document.getElementById('results').innerHTML = 'AI service test failed: ' + error.message;
            }
        }

        async function testAnalysis() {
            try {
                document.getElementById('results').innerHTML = '<h3>Starting Analysis Test...</h3>';
                
                const formData = new FormData();
                formData.append('resumeText', 'John Doe\\nSoftware Engineer\\nSkills: JavaScript, React, Node.js, Python\\nExperience: 3 years at Tech Company');
                
                const response = await fetch('/api/v1/analyze/resume', {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });
                
                const data = await response.json();
                document.getElementById('results').innerHTML = '<h3>Analysis Submission:</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
                console.log('Analysis test:', data);
                
                // If we get an analysis ID, poll for results
                if (data.analysis_id) {
                    document.getElementById('results').innerHTML += '<h3>Polling for results...</h3>';
                    setTimeout(() => pollResults(data.analysis_id), 3000);
                }
            } catch (error) {
                console.error('Analysis test error:', error);
                document.getElementById('results').innerHTML = 'Analysis test failed: ' + error.message;
            }
        }
        
        async function pollResults(analysisId) {
            try {
                const response = await fetch('/api/v1/analyze/resume/' + analysisId, {
                    method: 'GET',
                    credentials: 'include'
                });
                const data = await response.json();
                document.getElementById('results').innerHTML += '<h3>Poll Results (Status: ' + response.status + '):</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
                console.log('Poll results:', data);
                
                // Continue polling if still processing
                if (data.status === 'processing') {
                    document.getElementById('results').innerHTML += '<p>Still processing... polling again in 5 seconds</p>';
                    setTimeout(() => pollResults(analysisId), 5000);
                }
            } catch (error) {
                console.error('Poll error:', error);
                document.getElementById('results').innerHTML += '<h3>Poll Error:</h3><pre>' + error.message + '</pre>';
            }
        }
    </script>
</body>
</html>`;
  
  return c.html(html);
});

/**
 * GET /analyze/test-ai - Test AI service status
 */
analyze.get('/test-ai', async (c: AuthenticatedContext) => {
  try {
    const { AIAnalysisService } = await import('../services/aiAnalysisService');
    const aiAnalysisService = new AIAnalysisService(c.env);
    
    const status = aiAnalysisService.getAIStatus();
    const isHealthy = await aiAnalysisService.isAIHealthy();
    
    return c.json({
      status,
      healthy: isHealthy,
      environment: {
        hasApiKey: !!c.env.DEEPSEEK_API_KEY,
        baseUrl: c.env.DEEPSEEK_BASE_URL,
        model: c.env.DEEPSEEK_MODEL,
        timeout: c.env.DEEPSEEK_TIMEOUT
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        details: 'Failed to initialize AI service'
      },
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * GET /analyze/debug-db/:analysisId - Debug database record for analysis
 */
analyze.get('/debug-db/:analysisId', async (c: AuthenticatedContext) => {
  const analysisId = c.req.param('analysisId');
  const user = c.get('user');
  const userId = user?.id;

  try {
    const record = await c.env.DB
      .prepare('SELECT * FROM resume_analyses WHERE id = ? AND user_id = ?')
      .bind(analysisId, userId)
      .first() as any;

    if (!record) {
      return c.json({
        error: 'Analysis record not found',
        analysisId,
        userId
      }, 404);
    }

    const analysisData = JSON.parse(record.analysis_data);
    
    return c.json({
      analysisId,
      userId,
      record: {
        id: record.id,
        user_id: record.user_id,
        created_at: record.created_at,
        status: analysisData.status,
        dataSize: record.analysis_data.length,
        hasError: !!analysisData.error,
        errorCode: analysisData.error?.code,
        timestamp: analysisData.timestamp
      },
      fullData: analysisData
    });
  } catch (error) {
    return c.json({
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        details: 'Failed to query database'
      },
      analysisId,
      userId
    }, 500);
  }
});

/**
 * GET /analyze/debug-recent - Show recent analysis records
 */
analyze.get('/debug-recent', async (c: AuthenticatedContext) => {
  const user = c.get('user');
  const userId = user?.id;

  try {
    const records = await c.env.DB
      .prepare(`
        SELECT id, user_id, created_at, 
               JSON_EXTRACT(analysis_data, '$.status') as status,
               JSON_EXTRACT(analysis_data, '$.timestamp') as analysis_timestamp,
               LENGTH(analysis_data) as data_size
        FROM resume_analyses 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 10
      `)
      .bind(userId)
      .all();

    return c.json({
      userId,
      totalRecords: records.results?.length || 0,
      records: records.results?.map((record: any) => ({
        id: record.id,
        status: record.status,
        created_at: record.created_at,
        analysis_timestamp: record.analysis_timestamp,
        data_size: record.data_size
      })) || []
    });
  } catch (error) {
    return c.json({
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        details: 'Failed to query recent analyses'
      },
      userId
    }, 500);
  }
});

/**
 * GET /analyze/test-async - Test async analysis function directly
 */
analyze.get('/test-async', async (c: AuthenticatedContext) => {
  const user = c.get('user');
  const userId = user?.id;
  
  if (!userId) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  const testAnalysisId = crypto.randomUUID();
  const testContent = 'John Doe\nSoftware Engineer\nSkills: JavaScript, React, Node.js\nExperience: 3 years';

  try {
    console.log(`Starting direct async analysis test for ${testAnalysisId}`);
    
    // Create initial record
    const initialRecord = {
      analysis_id: testAnalysisId,
      user_id: userId,
      timestamp: new Date().toISOString(),
      status: 'processing',
      message: 'Test analysis in progress'
    };

    await c.env.DB
      .prepare(`INSERT INTO resume_analyses (id, user_id, analysis_data, created_at) VALUES (?, ?, ?, ?)`)
      .bind(testAnalysisId, userId, JSON.stringify(initialRecord), new Date().toISOString())
      .run();

    // Call async analysis directly (not with waitUntil)
    await performAsyncAnalysis(c.env, testAnalysisId, userId, testContent, '');

    return c.json({
      message: 'Direct async analysis completed',
      analysisId: testAnalysisId,
      checkUrl: `/api/v1/analyze/debug-db/${testAnalysisId}`
    });

  } catch (error) {
    console.error(`Direct async analysis test failed:`, error);
    return c.json({
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        details: 'Direct async analysis test failed'
      },
      analysisId: testAnalysisId
    }, 500);
  }
});

/**
 * GET /analyze/test-deepseek - Test DeepSeek API connectivity with simple request
 */
analyze.get('/test-deepseek', async (c: AuthenticatedContext) => {
  try {
    console.log('Starting DeepSeek API connectivity test');
    
    const apiKey = c.env.DEEPSEEK_API_KEY;
    const baseUrl = c.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';
    const model = c.env.DEEPSEEK_MODEL || 'deepseek-chat';
    const timeout = parseInt(c.env.DEEPSEEK_TIMEOUT || '120000');
    
    if (!apiKey) {
      return c.json({
        error: 'DEEPSEEK_API_KEY not configured',
        timestamp: new Date().toISOString()
      }, 500);
    }
    
    console.log('DeepSeek config:', { baseUrl, model, timeout, hasApiKey: !!apiKey });
    
    // Simple test request
    const testPrompt = 'Hello! Please respond with a simple JSON object containing: {"status": "success", "message": "DeepSeek API is working"}';
    
    const startTime = Date.now();
    
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: testPrompt
          }
        ],
        max_tokens: 100,
        temperature: 0.1,
        response_format: { type: 'json_object' }
      }),
      signal: AbortSignal.timeout(timeout)
    });
    
    const duration = Date.now() - startTime;
    console.log(`DeepSeek API response received in ${duration}ms, status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error response:', errorText);
      return c.json({
        error: 'DeepSeek API request failed',
        status: response.status,
        statusText: response.statusText,
        response: errorText,
        duration,
        timestamp: new Date().toISOString()
      }, 500);
    }
    
    const data = await response.json();
    console.log('DeepSeek API response data:', data);
    
    const content = data.choices?.[0]?.message?.content;
    
    return c.json({
      success: true,
      config: {
        baseUrl,
        model,
        timeout,
        hasApiKey: !!apiKey
      },
      request: {
        prompt: testPrompt,
        maxTokens: 100
      },
      response: {
        status: response.status,
        content: content,
        usage: data.usage,
        duration
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('DeepSeek API test failed:', error);
    
    let errorDetails = {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    };
    
    return c.json({
      error: 'DeepSeek API test failed',
      details: errorDetails,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * GET /analyze/test-chunking - Test the new chunking functionality with a sample resume
 */
analyze.get('/test-chunking', async (c: AuthenticatedContext) => {
  try {
    console.log('Starting chunking test');
    
    const sampleResume = `
PROFESSIONAL SUMMARY
Experienced Software Engineer with 8+ years of experience in full-stack development, cloud architecture, and team leadership. Proven track record of delivering scalable web applications using modern technologies including React, Node.js, Python, and AWS. Strong background in agile methodologies and cross-functional collaboration.

TECHNICAL SKILLS
Programming Languages: JavaScript, TypeScript, Python, Java, C#, SQL
Frontend Technologies: React, Vue.js, Angular, HTML5, CSS3, SASS, Bootstrap, Tailwind CSS
Backend Technologies: Node.js, Express.js, Django, Flask, Spring Boot, .NET Core
Databases: PostgreSQL, MySQL, MongoDB, Redis, DynamoDB
Cloud Platforms: AWS (EC2, S3, Lambda, RDS, CloudFormation), Azure, Google Cloud Platform
DevOps Tools: Docker, Kubernetes, Jenkins, GitLab CI/CD, Terraform, Ansible
Version Control: Git, GitHub, GitLab, Bitbucket
Testing: Jest, Cypress, Selenium, PyTest, JUnit

PROFESSIONAL EXPERIENCE

Senior Software Engineer | TechCorp Inc. | 2020 - Present
• Led development of microservices architecture serving 1M+ daily active users
• Implemented CI/CD pipelines reducing deployment time by 75%
• Mentored junior developers and conducted code reviews
• Technologies: React, Node.js, PostgreSQL, AWS, Docker, Kubernetes

Software Engineer | StartupXYZ | 2018 - 2020
• Built responsive web applications using React and Redux
• Developed RESTful APIs with Node.js and Express
• Optimized database queries improving performance by 40%
• Technologies: React, Node.js, MongoDB, AWS Lambda

Junior Developer | WebSolutions Ltd. | 2016 - 2018
• Developed and maintained client websites using HTML, CSS, JavaScript
• Collaborated with design team to implement pixel-perfect UIs
• Fixed bugs and implemented new features based on client requirements
• Technologies: HTML5, CSS3, JavaScript, PHP, MySQL

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2012 - 2016
Relevant Coursework: Data Structures, Algorithms, Database Systems, Software Engineering

CERTIFICATIONS
• AWS Certified Solutions Architect - Associate (2021)
• Certified Kubernetes Administrator (2020)
• Google Cloud Professional Cloud Architect (2019)

PROJECTS
E-commerce Platform (2021)
• Built full-stack e-commerce application with React frontend and Node.js backend
• Implemented payment processing with Stripe API
• Deployed on AWS with auto-scaling capabilities
• Technologies: React, Node.js, PostgreSQL, AWS, Docker

Task Management App (2020)
• Developed real-time collaborative task management application
• Implemented WebSocket connections for live updates
• Used Redux for state management and Material-UI for components
• Technologies: React, Redux, Socket.io, Node.js, MongoDB
    `.trim();

    // Initialize AI service
    const { AIAnalysisService } = await import('../services/aiAnalysisService');
    const aiService = new AIAnalysisService(c.env);
    
    console.log('AI service initialized, starting analysis...');
    const startTime = Date.now();
    
    // Test the chunking analysis
    const result = await aiService.analyzeCV(sampleResume, '', {
      includeSkillsGap: false,
      includeCareerSuggestions: false,
      includeIndustryTrends: false,
    });
    
    const processingTime = Date.now() - startTime;
    console.log(`Chunking test completed in ${processingTime}ms`);

    return c.json({
      success: true,
      message: 'Chunking test completed successfully',
      processingTime,
      skillsFound: result.skillsAnalysis.skills.length,
      categoriesFound: result.skillsAnalysis.categories.length,
      sampleSkills: result.skillsAnalysis.skills.slice(0, 10).map(s => s.name),
      metadata: result.metadata
    });

  } catch (error) {
    console.error('Chunking test failed:', error);
    return c.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : 'UnknownError'
      }
    }, 500);
  }
});

/**
 * GET /analyze/test-resume-prompt - Test DeepSeek API with actual resume analysis prompt
 */
analyze.get('/test-resume-prompt', async (c: AuthenticatedContext) => {
  try {
    console.log('Starting DeepSeek resume prompt test');
    
    const apiKey = c.env.DEEPSEEK_API_KEY;
    const baseUrl = c.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';
    const model = c.env.DEEPSEEK_MODEL || 'deepseek-chat';
    const timeout = parseInt(c.env.DEEPSEEK_TIMEOUT || '120000');
    
    if (!apiKey) {
      return c.json({
        error: 'DEEPSEEK_API_KEY not configured',
        timestamp: new Date().toISOString()
      }, 500);
    }
    
    // Simple resume for testing
    const testResume = `John Doe
Software Engineer
Email: john@example.com

Experience:
- 3 years at Tech Company as Frontend Developer
- Built web applications using React, JavaScript, HTML, CSS
- Worked with REST APIs and databases

Skills:
- JavaScript, React, HTML, CSS
- Node.js, Express
- Git, GitHub
- Problem solving, teamwork

Education:
- Bachelor's in Computer Science, 2020`;

    // Simplified resume analysis prompt
    const prompt = `Analyze the following resume and extract skills information. Respond with valid JSON in this exact format:

{
  "skills": [
    {
      "name": "skill name",
      "category": "Programming|Web Development|Database|Other",
      "level": "beginner|intermediate|advanced|expert",
      "yearsExperience": 0,
      "confidence": 0.8
    }
  ],
  "overallExperience": "brief summary",
  "careerLevel": "entry|mid|senior|executive"
}

Resume:
${testResume}`;
    
    const startTime = Date.now();
    console.log('Sending resume analysis request to DeepSeek...');
    
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert career analyst. Always respond with valid JSON in the exact format requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3,
        response_format: { type: 'json_object' }
      }),
      signal: AbortSignal.timeout(timeout)
    });
    
    const duration = Date.now() - startTime;
    console.log(`DeepSeek resume analysis response received in ${duration}ms, status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek resume analysis error:', errorText);
      return c.json({
        error: 'DeepSeek resume analysis failed',
        status: response.status,
        statusText: response.statusText,
        response: errorText,
        duration,
        timestamp: new Date().toISOString()
      }, 500);
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    // Try to parse the JSON response
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse DeepSeek response as JSON:', parseError);
      return c.json({
        error: 'Invalid JSON response from DeepSeek',
        rawContent: content,
        parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error',
        duration,
        timestamp: new Date().toISOString()
      }, 500);
    }
    
    return c.json({
      success: true,
      config: {
        baseUrl,
        model,
        timeout,
        maxTokens: 1000
      },
      request: {
        resumeLength: testResume.length,
        promptLength: prompt.length
      },
      response: {
        status: response.status,
        content: parsedContent,
        usage: data.usage,
        duration
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('DeepSeek resume prompt test failed:', error);
    
    let errorDetails = {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    };
    
    return c.json({
      error: 'DeepSeek resume prompt test failed',
      details: errorDetails,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * GET /analyze/test-auth - Test authentication endpoint for debugging
 */
analyze.get('/test-auth', async (c: AuthenticatedContext) => {
  try {
    const user = c.get('user');
    console.log('Test auth - user context:', user);

    return c.json({
      authenticated: !!user,
      user: user || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test auth error:', error);
    return c.json({
      authenticated: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * GET /analyze/test-ai - Test AI service endpoint
 */
analyze.get('/test-ai', async (c: AuthenticatedContext) => {
  try {
    const { AIAnalysisService } = await import('../services/aiAnalysisService');
    const aiAnalysisService = new AIAnalysisService(c.env);

    const aiStatus = aiAnalysisService.getAIStatus();
    const isHealthy = await aiAnalysisService.isAIHealthy();

    return c.json({
      aiStatus,
      isHealthy,
      environment: {
        hasDeepSeekKey: !!c.env.DEEPSEEK_API_KEY,
        nodeEnv: c.env.NODE_ENV,
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI test error:', error);
    return c.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * POST /analyze/test-simple - Test simple AI analysis
 */
analyze.post('/test-simple', async (c: AuthenticatedContext) => {
  try {
    const { AIAnalysisService } = await import('../services/aiAnalysisService');
    const aiAnalysisService = new AIAnalysisService(c.env);

    // Test with minimal CV content
    const testCV = "Software Engineer with 3 years experience in JavaScript, React, and Node.js. Bachelor's degree in Computer Science.";

    console.log('Testing AI analysis with simple CV...');
    const result = await aiAnalysisService.analyzeCV(testCV, undefined, {
      includeSkillsGap: false,
      includeCareerSuggestions: false,
      includeIndustryTrends: false,
    });

    return c.json({
      success: true,
      result: {
        analysis_id: result.analysis_id,
        aiPowered: result.aiPowered,
        skillsCount: result.skillsAnalysis.skills.length,
        fallbackUsed: result.metadata.fallbackUsed,
        processingTime: result.metadata.processingTime,
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Simple AI test error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * GET /analyze/debug-auth - Debug authentication endpoint
 */
analyze.get('/debug-auth', async (c: AuthenticatedContext) => {
  try {
    const user = c.get('user');
    return c.json({
      success: true,
      message: 'Authentication working',
      user: user ? {
        id: user.id,
        email: user.email,
        name: user.name
      } : null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * POST /analyze/advanced - Advanced AI-powered analysis with all features
 * Comprehensive analysis including multi-language, industry-specific, coaching, and more
 */
analyze.post('/advanced', async (c: AuthenticatedContext) => {
  const startTime = Date.now();

  try {
    // Parse multipart form data
    const formData = await c.req.formData();

    // Extract form fields
    const resumeFile = formData.get('resume') as File | null;
    const resumeText = formData.get('resumeText') as string | null;
    const jobDescriptionFile = formData.get('jobDescription') as File | null;
    const jobDescriptionText = formData.get('jobDescriptionText') as string | null;
    const currentPortfolio = formData.get('currentPortfolio') as string | null;

    // Advanced options
    const includeMultiLanguage = formData.get('includeMultiLanguage') === 'true';
    const includeIndustrySpecific = formData.get('includeIndustrySpecific') === 'true';
    const includePersonalizedCoaching = formData.get('includePersonalizedCoaching') === 'true';
    const includeSkillTrendPredictions = formData.get('includeSkillTrendPredictions') === 'true';
    const includeCompetitiveAnalysis = formData.get('includeCompetitiveAnalysis') === 'true';
    const includeInterviewPreparation = formData.get('includeInterviewPreparation') === 'true';
    const includePortfolioOptimization = formData.get('includePortfolioOptimization') === 'true';
    const includeNetworkingInsights = formData.get('includeNetworkingInsights') === 'true';

    // Configuration options
    const targetLanguage = formData.get('targetLanguage') as string | null;
    const industry = formData.get('industry') as string | null;
    const learningStyle = formData.get('learningStyle') as string | null;
    const careerGoalsStr = formData.get('careerGoals') as string | null;
    const timeAvailability = formData.get('timeAvailability') as string | null;

    // Parse career goals if provided
    let careerGoals: string[] = [];
    if (careerGoalsStr) {
      try {
        careerGoals = JSON.parse(careerGoalsStr);
      } catch {
        careerGoals = careerGoalsStr.split(',').map(goal => goal.trim());
      }
    }

    // Validation: Must have either resume file or text
    if (!resumeFile && !resumeText) {
      throw new AppError('Either resume file or resume text is required', 400, 'MISSING_RESUME');
    }

    // Security validations (reuse existing validation logic)
    if (resumeFile) {
      if (resumeFile.size > MAX_FILE_SIZE) {
        throw new AppError(`Resume file too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`, 400, 'FILE_TOO_LARGE');
      }

      if (!ALLOWED_MIME_TYPES.includes(resumeFile.type)) {
        throw new AppError('Invalid resume file type. Only PDF, DOC, DOCX, and TXT files are allowed', 400, 'INVALID_FILE_TYPE');
      }

      if (resumeFile.name.includes('../') || resumeFile.name.includes('..\\\\')) {
        throw new AppError('Invalid filename', 400, 'INVALID_FILENAME');
      }
    }

    if (jobDescriptionFile) {
      if (jobDescriptionFile.size > MAX_JOB_FILE_SIZE) {
        throw new AppError(`Job description file too large. Maximum size is ${MAX_JOB_FILE_SIZE / (1024 * 1024)}MB`, 400, 'FILE_TOO_LARGE');
      }

      if (!ALLOWED_MIME_TYPES.includes(jobDescriptionFile.type)) {
        throw new AppError('Invalid job description file type. Only PDF, DOC, DOCX, and TXT files are allowed', 400, 'INVALID_FILE_TYPE');
      }

      if (jobDescriptionFile.name.includes('../') || jobDescriptionFile.name.includes('..\\\\')) {
        throw new AppError('Invalid filename', 400, 'INVALID_FILENAME');
      }
    }

    // Rate limiting check (60 seconds for advanced analysis)
    const userId = c.get('user')!.id;
    const rateLimitKey = `advanced_analysis:${userId}`;
    const lastAnalysis = await c.env.CACHE.get(rateLimitKey);

    if (lastAnalysis) {
      const timeSinceLastAnalysis = Date.now() - parseInt(lastAnalysis);
      if (timeSinceLastAnalysis < 60000) { // 60 seconds
        const remainingTime = Math.ceil((60000 - timeSinceLastAnalysis) / 1000);
        throw new AppError(`Please wait ${remainingTime} seconds before starting another advanced analysis`, 429, 'RATE_LIMITED');
      }
    }

    // Set rate limit
    await c.env.CACHE.put(rateLimitKey, Date.now().toString(), { expirationTtl: 60 });

    // Extract text content from files or use provided text
    let resumeContent = resumeText || '';
    let jobContent = jobDescriptionText || '';

    if (resumeFile) {
      resumeContent = await extractTextFromFile(resumeFile);
    }

    if (jobDescriptionFile) {
      jobContent = await extractTextFromFile(jobDescriptionFile);
    }

    // Initialize AI-powered analysis service
    const { AIAnalysisService } = await import('../services/aiAnalysisService');
    const aiAnalysisService = new AIAnalysisService(c.env);

    // Perform comprehensive AI-powered analysis with advanced features
    const response = await aiAnalysisService.analyzeCV(
      resumeContent,
      jobContent,
      {
        includeSkillsGap: true,
        includeCareerSuggestions: true,
        includeIndustryTrends: true,
        // Advanced AI Features
        includeMultiLanguage,
        includeIndustrySpecific,
        includePersonalizedCoaching,
        includeSkillTrendPredictions,
        includeCompetitiveAnalysis,
        includeInterviewPreparation,
        includePortfolioOptimization,
        includeNetworkingInsights,
        targetLanguage: targetLanguage || undefined,
        industry: industry || undefined,
        userPreferences: {
          learningStyle: learningStyle || undefined,
          careerGoals: careerGoals.length > 0 ? careerGoals : undefined,
          timeAvailability: timeAvailability || undefined,
        },
        currentPortfolio: currentPortfolio || undefined,
      }
    );

    // Set the actual user ID
    response.user_id = userId;

    // Add metadata
    response.metadata = {
      ...response.metadata,
      processingTime: Date.now() - startTime,
      analysisOptions: {
        includeSkillsGap: true,
        includeCareerSuggestions: true,
        includeIndustryTrends: true,
        includeMultiLanguage,
        includeIndustrySpecific,
        includePersonalizedCoaching,
        includeSkillTrendPredictions,
        includeCompetitiveAnalysis,
        includeInterviewPreparation,
        includePortfolioOptimization,
        includeNetworkingInsights,
      },
      advancedFeatures: {
        targetLanguage,
        industry,
        userPreferences: {
          learningStyle,
          careerGoals,
          timeAvailability,
        },
      },
      fileInfo: {
        resumeFile: resumeFile ? { name: resumeFile.name, size: resumeFile.size, type: resumeFile.type } : null,
        jobDescriptionFile: jobDescriptionFile ? { name: jobDescriptionFile.name, size: jobDescriptionFile.size, type: jobDescriptionFile.type } : null,
        currentPortfolio: currentPortfolio ? 'provided' : null,
      }
    };

    // Store analysis result for future reference
    try {
      await c.env.DB
        .prepare(`
          INSERT INTO resume_analyses (
            id, user_id, analysis_data, created_at
          ) VALUES (?, ?, ?, ?)
        `)
        .bind(
          response.analysis_id,
          userId,
          JSON.stringify(response),
          new Date().toISOString()
        )
        .run();
    } catch (dbError) {
      console.warn('Failed to store advanced analysis result:', dbError);
    }

    return c.json(response, 200);

  } catch (error) {
    console.error('Advanced analysis error:', error);

    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new AppError('Advanced analysis request timed out', 408, 'TIMEOUT_ERROR');
      }
      if (error.message.includes('file')) {
        throw new AppError('File processing failed', 400, 'FILE_PROCESSING_ERROR');
      }
    }

    throw new AppError('Advanced analysis failed', 500, 'ADVANCED_ANALYSIS_FAILED');
  }
});

/**
 * POST /analyze/job - Intelligent job description analysis
 * Analyzes job descriptions with AI-powered insights and market intelligence
 */
analyze.post('/job', async (c: AuthenticatedContext) => {
  const startTime = Date.now();

  try {
    // Parse request body
    const body = await c.req.json();
    const { jobDescription, includeInsights = true, includeApplicationTips = true } = body;

    // Validation
    if (!jobDescription || typeof jobDescription !== 'string') {
      throw new AppError('Job description is required', 400, 'MISSING_JOB_DESCRIPTION');
    }

    if (jobDescription.length > MAX_TEXT_LENGTH) {
      throw new AppError(`Job description too long. Maximum ${MAX_TEXT_LENGTH} characters allowed`, 400, 'TEXT_TOO_LONG');
    }

    // Rate limiting check
    const userId = c.get('user')!.id;
    const rateLimitKey = `job_analysis:${userId}`;
    const lastAnalysis = await c.env.CACHE.get(rateLimitKey);

    if (lastAnalysis) {
      const timeSinceLastAnalysis = Date.now() - parseInt(lastAnalysis);
      if (timeSinceLastAnalysis < 15000) { // 15 seconds
        const remainingTime = Math.ceil((15000 - timeSinceLastAnalysis) / 1000);
        throw new AppError(`Please wait ${remainingTime} seconds before starting another job analysis`, 429, 'RATE_LIMITED');
      }
    }

    // Set rate limit
    await c.env.CACHE.put(rateLimitKey, Date.now().toString(), { expirationTtl: 15 });

    // Initialize AI services
    const { AIAnalysisService } = await import('../services/aiAnalysisService');
    const { IntelligentJobAnalysisService } = await import('../services/intelligentJobAnalysis');

    const aiAnalysisService = new AIAnalysisService(c.env);

    // Check if AI is available
    const isAIHealthy = await aiAnalysisService.isAIHealthy();

    let response;

    if (isAIHealthy && includeInsights) {
      // Use intelligent job analysis with AI insights
      const aiConfig = {
        provider: 'deepseek' as const,
        model: 'deepseek-reasoner' as const,
        apiKey: c.env.DEEPSEEK_API_KEY,
        baseUrl: c.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
        maxTokens: parseInt(c.env.DEEPSEEK_MAX_TOKENS || '4000'),
        temperature: parseFloat(c.env.DEEPSEEK_TEMPERATURE || '0.1'),
        timeout: parseInt(c.env.DEEPSEEK_TIMEOUT || '30000')
      };

      const { DeepSeekAIService } = await import('../services/deepseekAI');
      const deepseekService = new DeepSeekAIService(aiConfig);
      const intelligentJobService = new IntelligentJobAnalysisService(deepseekService);

      const enhancedAnalysis = await intelligentJobService.analyzeJobIntelligently(jobDescription);

      response = {
        analysis_id: crypto.randomUUID(),
        user_id: userId,
        timestamp: new Date().toISOString(),
        aiPowered: true,
        jobAnalysis: enhancedAnalysis,
        metadata: {
          processingTime: Date.now() - startTime,
          analysisOptions: {
            includeInsights,
            includeApplicationTips
          },
          aiProvider: 'deepseek',
          aiModel: 'deepseek-reasoner'
        }
      };
    } else {
      // Fallback to basic job analysis
      const basicAnalysis = await aiAnalysisService.analyzeCV('', jobDescription, {
        includeSkillsGap: false,
        includeCareerSuggestions: false,
        includeIndustryTrends: false
      });

      response = {
        analysis_id: crypto.randomUUID(),
        user_id: userId,
        timestamp: new Date().toISOString(),
        aiPowered: false,
        jobAnalysis: {
          jobTitle: 'Extracted from description',
          industry: 'General',
          experienceLevel: 'mid',
          skillRequirements: [],
          softSkills: [],
          responsibilities: [],
          benefits: [],
          workArrangement: 'flexible',
          reasoning: 'Basic analysis due to AI unavailability'
        },
        metadata: {
          processingTime: Date.now() - startTime,
          analysisOptions: {
            includeInsights,
            includeApplicationTips
          },
          fallbackUsed: true
        }
      };
    }

    // Store analysis result
    try {
      await c.env.DB
        .prepare(`
          INSERT INTO job_analyses (
            id, user_id, job_title, analysis_data, created_at
          ) VALUES (?, ?, ?, ?, ?)
        `)
        .bind(
          response.analysis_id,
          userId,
          response.jobAnalysis.jobTitle || 'Unknown',
          JSON.stringify(response),
          new Date().toISOString()
        )
        .run();
    } catch (dbError) {
      console.warn('Failed to store job analysis result:', dbError);
    }

    return c.json(response, 200);

  } catch (error) {
    console.error('Job analysis error:', error);

    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new AppError('Job analysis request timed out', 408, 'TIMEOUT_ERROR');
      }
    }

    throw new AppError('Job analysis failed', 500, 'JOB_ANALYSIS_FAILED');
  }
});

/**
 * POST /analyze/job/compare - Compare multiple job descriptions
 * Analyzes and compares multiple job descriptions for strategic insights
 */
analyze.post('/job/compare', async (c: AuthenticatedContext) => {
  const startTime = Date.now();

  try {
    // Parse request body
    const body = await c.req.json();
    const { jobDescriptions } = body;

    // Validation
    if (!jobDescriptions || !Array.isArray(jobDescriptions)) {
      throw new AppError('Job descriptions array is required', 400, 'MISSING_JOB_DESCRIPTIONS');
    }

    if (jobDescriptions.length < 2 || jobDescriptions.length > 5) {
      throw new AppError('Please provide 2-5 job descriptions for comparison', 400, 'INVALID_JOB_COUNT');
    }

    // Validate each job description
    for (const [index, jobDesc] of jobDescriptions.entries()) {
      if (!jobDesc || typeof jobDesc !== 'string') {
        throw new AppError(`Job description ${index + 1} is invalid`, 400, 'INVALID_JOB_DESCRIPTION');
      }

      if (jobDesc.length > MAX_TEXT_LENGTH) {
        throw new AppError(`Job description ${index + 1} is too long. Maximum ${MAX_TEXT_LENGTH} characters allowed`, 400, 'TEXT_TOO_LONG');
      }
    }

    // Rate limiting check (stricter for comparison)
    const userId = c.get('user')!.id;
    const rateLimitKey = `job_comparison:${userId}`;
    const lastComparison = await c.env.CACHE.get(rateLimitKey);

    if (lastComparison) {
      const timeSinceLastComparison = Date.now() - parseInt(lastComparison);
      if (timeSinceLastComparison < 60000) { // 1 minute
        const remainingTime = Math.ceil((60000 - timeSinceLastComparison) / 1000);
        throw new AppError(`Please wait ${remainingTime} seconds before starting another job comparison`, 429, 'RATE_LIMITED');
      }
    }

    // Set rate limit
    await c.env.CACHE.put(rateLimitKey, Date.now().toString(), { expirationTtl: 60 });

    // Initialize AI services
    const { AIAnalysisService } = await import('../services/aiAnalysisService');
    const { IntelligentJobAnalysisService } = await import('../services/intelligentJobAnalysis');

    const aiAnalysisService = new AIAnalysisService(c.env);
    const isAIHealthy = await aiAnalysisService.isAIHealthy();

    if (!isAIHealthy) {
      throw new AppError('AI service is currently unavailable for job comparison', 503, 'AI_SERVICE_UNAVAILABLE');
    }

    // Perform intelligent job comparison
    const aiConfig = {
      provider: 'deepseek' as const,
      model: 'deepseek-reasoner' as const,
      apiKey: c.env.DEEPSEEK_API_KEY,
      baseUrl: c.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
      maxTokens: parseInt(c.env.DEEPSEEK_MAX_TOKENS || '4000'),
      temperature: parseFloat(c.env.DEEPSEEK_TEMPERATURE || '0.1'),
      timeout: parseInt(c.env.DEEPSEEK_TIMEOUT || '30000')
    };

    const { DeepSeekAIService } = await import('../services/deepseekAI');
    const deepseekService = new DeepSeekAIService(aiConfig);
    const intelligentJobService = new IntelligentJobAnalysisService(deepseekService);

    const comparisonResult = await intelligentJobService.compareJobs(jobDescriptions);

    const response = {
      analysis_id: crypto.randomUUID(),
      user_id: userId,
      timestamp: new Date().toISOString(),
      aiPowered: true,
      jobComparison: comparisonResult,
      metadata: {
        processingTime: Date.now() - startTime,
        jobCount: jobDescriptions.length,
        aiProvider: 'deepseek',
        aiModel: 'deepseek-reasoner'
      }
    };

    // Store comparison result
    try {
      await c.env.DB
        .prepare(`
          INSERT INTO job_comparisons (
            id, user_id, job_count, analysis_data, created_at
          ) VALUES (?, ?, ?, ?, ?)
        `)
        .bind(
          response.analysis_id,
          userId,
          jobDescriptions.length,
          JSON.stringify(response),
          new Date().toISOString()
        )
        .run();
    } catch (dbError) {
      console.warn('Failed to store job comparison result:', dbError);
    }

    return c.json(response, 200);

  } catch (error) {
    console.error('Job comparison error:', error);

    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new AppError('Job comparison request timed out', 408, 'TIMEOUT_ERROR');
      }
    }

    throw new AppError('Job comparison failed', 500, 'JOB_COMPARISON_FAILED');
  }
});

/**
 * GET /trends/geographic/:region? - Get geographic/regional trends
 * Retrieve skill trends by geographic region
 */
analyze.get('/trends/geographic/:region?', async (c: AuthenticatedContext) => {
  try {
    const region = c.req.param('region');
    const skillCategory = c.req.query('category');
    const limit = parseInt(c.req.query('limit') || '10');

    // Initialize trends service
    const database = createDatabase(c.env.DB);
    const trendsService = new TrendsAnalysisService(database);

    const regionalTrends = await trendsService.getRegionalTrends(region, skillCategory, limit);

    return c.json({
      region: region || 'all',
      filter: {
        category: skillCategory || 'all',
        limit
      },
      trends: regionalTrends,
      metadata: {
        count: regionalTrends.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error retrieving regional trends:', error);
    throw new AppError('Failed to retrieve regional trends', 500, 'REGIONAL_TRENDS_RETRIEVAL_FAILED');
  }
});

/**
 * POST /trends/forecast - Generate skill demand forecasts
 * Create forecasts for specific skills
 */
analyze.post('/trends/forecast', async (c: AuthenticatedContext) => {
  try {
    const body = await c.req.json();
    const { skill_names, industry, region } = body;

    if (!skill_names || !Array.isArray(skill_names) || skill_names.length === 0) {
      throw new AppError('skill_names array is required', 400, 'INVALID_REQUEST');
    }

    // Initialize trends service
    const database = createDatabase(c.env.DB);
    const trendsService = new TrendsAnalysisService(database);

    const forecasts = await trendsService.generateSkillForecasts(skill_names, industry, region);

    return c.json({
      request: {
        skills: skill_names,
        industry: industry || 'all',
        region: region || 'global'
      },
      forecasts,
      metadata: {
        count: forecasts.length,
        timestamp: new Date().toISOString(),
        methodology: 'Time series analysis with linear regression'
      }
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error generating forecasts:', error);
    throw new AppError('Failed to generate skill forecasts', 500, 'FORECAST_GENERATION_FAILED');
  }
});

/**
 * GET /trends/skills/declining - Get declining skills
 * Identify skills with decreasing demand
 */
analyze.get('/trends/skills/declining', async (c: AuthenticatedContext) => {
  try {
    const threshold = parseFloat(c.req.query('threshold') || '-0.1');
    const timeWindow = parseInt(c.req.query('timeWindow') || '12');

    // Initialize trends service
    const database = createDatabase(c.env.DB);
    const trendsService = new TrendsAnalysisService(database);

    const decliningSkills = await trendsService.identifyDecliningSkills(threshold, timeWindow);

    return c.json({
      filter: {
        threshold,
        timeWindowMonths: timeWindow
      },
      skills: decliningSkills,
      metadata: {
        count: decliningSkills.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error identifying declining skills:', error);
    throw new AppError('Failed to identify declining skills', 500, 'DECLINING_SKILLS_RETRIEVAL_FAILED');
  }
});

/**
 * GET /trends/skills/velocity - Analyze skill growth velocity
 * Get growth velocity metrics for skills
 */
analyze.get('/trends/skills/velocity', async (c: AuthenticatedContext) => {
  try {
    const timeWindow = parseInt(c.req.query('timeWindow') || '6');

    // Initialize trends service
    const database = createDatabase(c.env.DB);
    const trendsService = new TrendsAnalysisService(database);

    const velocityMap = await trendsService.analyzeGrowthVelocity(timeWindow);

    // Convert Map to array for JSON response
    const velocityData = Array.from(velocityMap.entries())
      .map(([skillName, velocity]) => ({ skillName, velocity }))
      .sort((a, b) => b.velocity - a.velocity);

    return c.json({
      filter: {
        timeWindowMonths: timeWindow
      },
      velocities: velocityData,
      metadata: {
        count: velocityData.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error analyzing growth velocity:', error);
    throw new AppError('Failed to analyze growth velocity', 500, 'VELOCITY_ANALYSIS_FAILED');
  }
});

export default analyze;
