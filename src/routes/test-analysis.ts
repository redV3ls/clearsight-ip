import { Hono } from 'hono';
import { Env } from '../index';
import { AuthenticatedContext } from '../middleware/auth';

const testAnalysis = new Hono<{ Bindings: Env }>();

/**
 * GET /test-analysis/direct - Test analysis directly without waitUntil
 */
testAnalysis.get('/direct', async (c: AuthenticatedContext) => {
  const user = c.get('user');
  const userId = user?.id;
  
  if (!userId) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  const testAnalysisId = crypto.randomUUID();
  const testContent = 'John Doe\nSoftware Engineer\nSkills: JavaScript, React, Node.js\nExperience: 3 years';

  try {
    console.log(`[TEST-DIRECT] Starting direct analysis test for ${testAnalysisId}`);
    
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

    console.log(`[TEST-DIRECT] Initial record created for ${testAnalysisId}`);

    // Try importing and running the async function directly
    try {
      const { performAsyncAnalysis } = await import('./analyze');
      console.log(`[TEST-DIRECT] performAsyncAnalysis imported successfully`);
      
      // Run it directly (not with waitUntil)
      await performAsyncAnalysis(c.env, testAnalysisId, userId, testContent, '');
      
      console.log(`[TEST-DIRECT] performAsyncAnalysis completed for ${testAnalysisId}`);
      
      return c.json({
        success: true,
        message: 'Direct async analysis completed',
        analysisId: testAnalysisId,
        checkUrl: `/api/v1/analyze/resume/${testAnalysisId}`
      });
    } catch (asyncError) {
      console.error(`[TEST-DIRECT] Async analysis error:`, asyncError);
      return c.json({
        success: false,
        error: 'Async analysis failed',
        details: asyncError instanceof Error ? asyncError.message : 'Unknown error',
        analysisId: testAnalysisId
      }, 500);
    }

  } catch (error) {
    console.error(`[TEST-DIRECT] Test failed:`, error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * GET /test-analysis/minimal - Test minimal async function
 */
testAnalysis.get('/minimal', async (c: AuthenticatedContext) => {
  const testId = crypto.randomUUID();
  
  console.log(`[TEST-MINIMAL] Starting test ${testId}`);
  
  // Test a minimal async function with waitUntil
  c.executionCtx.waitUntil(
    (async () => {
      console.log(`[TEST-MINIMAL-ASYNC] Inside async function for ${testId}`);
      
      // Just wait 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`[TEST-MINIMAL-ASYNC] Async function completed for ${testId}`);
    })()
  );
  
  console.log(`[TEST-MINIMAL] Returning response for ${testId}`);
  
  return c.json({
    message: 'Minimal test started',
    testId,
    note: 'Check logs for [TEST-MINIMAL-ASYNC] messages'
  });
});

/**
 * GET /test-analysis/import - Test if imports work
 */
testAnalysis.get('/import', async (c: AuthenticatedContext) => {
  try {
    console.log('[TEST-IMPORT] Testing dynamic imports...');
    
    // Test importing the AI service
    const { AIAnalysisService } = await import('../services/aiAnalysisService');
    console.log('[TEST-IMPORT] AIAnalysisService imported successfully');
    
    // Try to instantiate it
    const aiService = new AIAnalysisService(c.env);
    console.log('[TEST-IMPORT] AIAnalysisService instantiated successfully');
    
    // Check if it's healthy
    const isHealthy = await aiService.isAIHealthy();
    console.log(`[TEST-IMPORT] AI service healthy: ${isHealthy}`);
    
    return c.json({
      success: true,
      imports: {
        AIAnalysisService: 'OK',
        instantiation: 'OK',
        healthy: isHealthy
      }
    });
  } catch (error) {
    console.error('[TEST-IMPORT] Import test failed:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, 500);
  }
});

export default testAnalysis;
export { performAsyncAnalysis } from './analyze';
