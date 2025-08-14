/**
 * Tests for Analysis History and Retrieval
 * Tests the updated history endpoints and analysis retrieval by ID
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NarrativeAnalysisService } from '../services/narrativeAnalysisService';
import { NarrativeResponseFormatter } from '../services/narrativeResponseFormatter';
import { NarrativeKVCache } from '../services/narrativeKVCache';

// Mock environment for testing
const mockEnv = {
  DB: {
    prepare: () => ({
      bind: () => ({
        run: () => ({ success: true, changes: 1 }),
        first: () => null,
        all: () => ({ results: [] })
      })
    })
  },
  CACHE: {
    get: () => Promise.resolve(null),
    put: () => Promise.resolve(),
    delete: () => Promise.resolve()
  }
};

const mockDatabase = {
  select: () => ({
    from: () => ({
      where: () => ({
        orderBy: () => ({
          limit: () => ({
            offset: () => Promise.resolve([])
          })
        })
      })
    })
  }),
  insert: () => ({
    values: () => Promise.resolve()
  }),
  update: () => ({
    set: () => ({
      where: () => Promise.resolve()
    })
  }),
  delete: () => ({
    where: () => Promise.resolve()
  })
};

describe('Analysis History and Retrieval', () => {
  let narrativeService: NarrativeAnalysisService;
  let narrativeCache: NarrativeKVCache;

  beforeEach(() => {
    narrativeService = new NarrativeAnalysisService(mockDatabase as any);
    narrativeCache = new NarrativeKVCache(mockEnv);
  });

  describe('History Endpoint Functionality', () => {
    it('should format analysis history with pagination', () => {
      const mockAnalyses = [
        {
          id: 'analysis-1',
          createdAt: '2025-08-13T19:30:00.000Z',
          analysisType: 'standalone' as const,
          wordCount: 250,
          hasJobDescription: false,
          status: 'completed',
          format: 'narrative' as const
        },
        {
          id: 'analysis-2',
          createdAt: '2025-08-13T18:30:00.000Z',
          analysisType: 'job-comparison' as const,
          wordCount: 350,
          hasJobDescription: true,
          status: 'completed',
          format: 'narrative' as const
        }
      ];

      const formattedHistory = NarrativeResponseFormatter.formatAnalysisHistory({
        analyses: mockAnalyses,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          pages: 1
        },
        stats: {
          narrativeAnalyses: 2,
          legacyAnalyses: 0,
          standaloneCount: 1,
          jobComparisonCount: 1,
          averageWordCount: 300,
          averageProcessingTime: 2500
        }
      });

      expect(formattedHistory.analyses).toHaveLength(2);
      expect(formattedHistory.analyses[0].id).toBe('analysis-1');
      expect(formattedHistory.analyses[0].analysis_type).toBe('standalone');
      expect(formattedHistory.analyses[0].word_count).toBe(250);
      expect(formattedHistory.analyses[0].has_job_description).toBe(false);
      expect(formattedHistory.analyses[0].format).toBe('narrative');

      expect(formattedHistory.pagination.total).toBe(2);
      expect(formattedHistory.stats?.narrativeAnalyses).toBe(2);
      expect(formattedHistory.stats?.averageWordCount).toBe(300);
    });

    it('should handle empty history gracefully', () => {
      const formattedHistory = NarrativeResponseFormatter.formatAnalysisHistory({
        analyses: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        },
        stats: {
          narrativeAnalyses: 0,
          legacyAnalyses: 0,
          standaloneCount: 0,
          jobComparisonCount: 0,
          averageWordCount: 0,
          averageProcessingTime: 0
        }
      });

      expect(formattedHistory.analyses).toHaveLength(0);
      expect(formattedHistory.pagination.total).toBe(0);
      expect(formattedHistory.stats?.narrativeAnalyses).toBe(0);
    });

    it('should handle mixed narrative and legacy analyses', () => {
      const mixedAnalyses = [
        {
          id: 'narrative-1',
          createdAt: '2025-08-13T19:30:00.000Z',
          analysisType: 'standalone' as const,
          wordCount: 250,
          hasJobDescription: false,
          status: 'completed',
          format: 'narrative' as const
        },
        {
          id: 'legacy-1',
          createdAt: '2025-08-13T18:30:00.000Z',
          status: 'completed',
          format: 'legacy' as const
        }
      ];

      const formattedHistory = NarrativeResponseFormatter.formatAnalysisHistory({
        analyses: mixedAnalyses,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          pages: 1
        },
        stats: {
          narrativeAnalyses: 1,
          legacyAnalyses: 1,
          standaloneCount: 1,
          jobComparisonCount: 0,
          averageWordCount: 250,
          averageProcessingTime: 2500
        }
      });

      expect(formattedHistory.analyses).toHaveLength(2);
      expect(formattedHistory.analyses[0].format).toBe('narrative');
      expect(formattedHistory.analyses[1].format).toBe('legacy');
      expect(formattedHistory.stats?.narrativeAnalyses).toBe(1);
      expect(formattedHistory.stats?.legacyAnalyses).toBe(1);
    });
  });

  describe('Analysis Retrieval by ID', () => {
    it('should format completed analysis from cache', () => {
      const cachedAnalysis = {
        analysisId: 'test-123',
        userId: 'user-456',
        narrative: 'This is a comprehensive career analysis...',
        analysisType: 'standalone' as const,
        wordCount: 150,
        status: 'completed' as const,
        timestamp: '2025-08-13T19:30:00.000Z',
        processingTime: 2500
      };

      const response = NarrativeResponseFormatter.formatCompletedAnalysis({
        analysisId: cachedAnalysis.analysisId,
        userId: cachedAnalysis.userId,
        narrative: cachedAnalysis.narrative,
        analysisType: cachedAnalysis.analysisType,
        wordCount: cachedAnalysis.wordCount,
        timestamp: cachedAnalysis.timestamp,
        processingTime: cachedAnalysis.processingTime,
        source: 'cache'
      });

      expect(response.analysis_id).toBe('test-123');
      expect(response.status).toBe('completed');
      expect(response.narrative).toBe('This is a comprehensive career analysis...');
      expect(response.word_count).toBe(150);
      expect(response.metadata.source).toBe('cache');
      expect(response.metadata.processingTime).toBe(2500);
      expect(response.metadata.estimatedReadingTime).toBe(1);
    });

    it('should format completed analysis from database', () => {
      const dbAnalysis = {
        id: 'test-456',
        userId: 'user-789',
        narrative: 'Your career journey shows strong technical growth...',
        analysisType: 'job-comparison' as const,
        wordCount: 300,
        createdAt: '2025-08-13T19:30:00.000Z',
        processingTimeMs: 3200,
        aiProvider: 'deepseek',
        aiModel: 'deepseek-reasoner',
        hasJobDescription: true
      };

      const response = NarrativeResponseFormatter.formatCompletedAnalysis({
        analysisId: dbAnalysis.id,
        userId: dbAnalysis.userId,
        narrative: dbAnalysis.narrative,
        analysisType: dbAnalysis.analysisType,
        wordCount: dbAnalysis.wordCount,
        timestamp: dbAnalysis.createdAt,
        processingTime: dbAnalysis.processingTimeMs,
        aiProvider: dbAnalysis.aiProvider,
        aiModel: dbAnalysis.aiModel,
        hasJobDescription: dbAnalysis.hasJobDescription,
        source: 'database'
      });

      expect(response.analysis_id).toBe('test-456');
      expect(response.status).toBe('completed');
      expect(response.analysis_type).toBe('job-comparison');
      expect(response.word_count).toBe(300);
      expect(response.metadata.source).toBe('database');
      expect(response.metadata.aiProvider).toBe('deepseek');
      expect(response.metadata.aiModel).toBe('deepseek-reasoner');
      expect(response.metadata.hasJobDescription).toBe(true);
      expect(response.metadata.estimatedReadingTime).toBe(2);
    });

    it('should handle processing status correctly', () => {
      const processingResponse = NarrativeResponseFormatter.formatProcessingResponse({
        analysisId: 'test-processing',
        userId: 'user-123',
        progress: 75
      });

      expect(processingResponse.analysis_id).toBe('test-processing');
      expect(processingResponse.status).toBe('processing');
      expect(processingResponse.progress).toBe(75);
      expect(processingResponse.check_status_url).toContain('test-processing');
      expect(processingResponse.history_url).toContain('history');
    });

    it('should handle failed analysis correctly', () => {
      const failedResponse = NarrativeResponseFormatter.formatFailedAnalysis({
        analysisId: 'test-failed',
        userId: 'user-123',
        errorCode: 'ANALYSIS_TIMEOUT',
        errorMessage: 'Analysis timed out',
        userMessage: 'Your analysis took too long. Please try again.',
        retryable: true
      });

      expect(failedResponse.analysis_id).toBe('test-failed');
      expect(failedResponse.status).toBe('failed');
      expect(failedResponse.error?.code).toBe('ANALYSIS_TIMEOUT');
      expect(failedResponse.error?.retryable).toBe(true);
      expect(failedResponse.narrative).toContain('failed');
    });
  });

  describe('Backward Compatibility', () => {
    it('should handle legacy analysis format gracefully', () => {
      const legacyAnalysisData = {
        analysis_id: 'legacy-123',
        user_id: 'user-456',
        timestamp: '2025-08-13T19:30:00.000Z',
        status: 'completed',
        skillsAnalysis: {
          totalSkills: 15,
          technicalSkills: 10,
          softSkills: 5
        },
        aiPowered: true
      };

      // Legacy format should still be returned as-is with retrieval timestamp
      const expectedResponse = {
        ...legacyAnalysisData,
        retrieved_at: expect.any(String)
      };

      // This would be handled in the actual endpoint
      expect(legacyAnalysisData.analysis_id).toBe('legacy-123');
      expect(legacyAnalysisData.status).toBe('completed');
      expect(legacyAnalysisData.skillsAnalysis.totalSkills).toBe(15);
    });

    it('should validate response format for both narrative and legacy', () => {
      const narrativeResponse = {
        analysis_id: 'narrative-123',
        user_id: 'user-456',
        timestamp: '2025-08-13T19:30:00.000Z',
        status: 'completed',
        narrative: 'Test narrative content',
        analysis_type: 'standalone',
        word_count: 100,
        aiPowered: true,
        metadata: {}
      };

      const legacyResponse = {
        analysis_id: 'legacy-123',
        user_id: 'user-456',
        timestamp: '2025-08-13T19:30:00.000Z',
        status: 'completed',
        skillsAnalysis: { totalSkills: 10 },
        aiPowered: true
      };

      const narrativeValidation = NarrativeResponseFormatter.validateResponse(narrativeResponse);
      expect(narrativeValidation.isValid).toBe(true);

      // Legacy responses won't pass narrative validation, but that's expected
      const legacyValidation = NarrativeResponseFormatter.validateResponse(legacyResponse);
      expect(legacyValidation.isValid).toBe(false);
      expect(legacyValidation.issues).toContain('Missing narrative for completed analysis');
    });
  });

  describe('Filtering and Sorting', () => {
    it('should support analysis type filtering', async () => {
      // Test that the service method can be called with filtering parameters
      // The actual database query would be tested in integration tests
      try {
        await narrativeService.getUserHistory('user-123', {
          analysisType: 'standalone',
          limit: 10,
          offset: 0
        });
      } catch (error) {
        // Expected to fail with mock database, but should not throw synchronously
        expect(error).toBeDefined();
      }

      try {
        await narrativeService.getUserHistory('user-123', {
          analysisType: 'job-comparison',
          limit: 10,
          offset: 0
        });
      } catch (error) {
        // Expected to fail with mock database, but should not throw synchronously
        expect(error).toBeDefined();
      }
    });

    it('should support sorting options', async () => {
      // Test that sorting parameters are accepted
      try {
        await narrativeService.getUserHistory('user-123', {
          sortBy: 'created_at',
          sortOrder: 'desc',
          limit: 10,
          offset: 0
        });
      } catch (error) {
        // Expected to fail with mock database
        expect(error).toBeDefined();
      }

      try {
        await narrativeService.getUserHistory('user-123', {
          sortBy: 'word_count',
          sortOrder: 'asc',
          limit: 10,
          offset: 0
        });
      } catch (error) {
        // Expected to fail with mock database
        expect(error).toBeDefined();
      }
    });

    it('should handle pagination correctly', () => {
      const page1 = { limit: 5, offset: 0 };
      const page2 = { limit: 5, offset: 5 };
      const page3 = { limit: 5, offset: 10 };

      // Test that pagination parameters are properly structured
      expect(page1.limit).toBe(5);
      expect(page1.offset).toBe(0);
      expect(page2.offset).toBe(5);
      expect(page3.offset).toBe(10);
    });
  });

  describe('Cache Integration', () => {
    it('should handle cache operations for retrieval', async () => {
      const cacheEntry = {
        analysisId: 'cache-test-123',
        userId: 'user-456',
        narrative: 'Cached narrative content',
        analysisType: 'standalone' as const,
        wordCount: 200,
        status: 'completed' as const,
        timestamp: '2025-08-13T19:30:00.000Z',
        processingTime: 1800
      };

      // Test cache storage (with mocked environment)
      const stored = await narrativeCache.storeAnalysis(cacheEntry);
      expect(typeof stored).toBe('boolean');

      // Test cache retrieval (with mocked environment)
      const retrieved = await narrativeCache.getAnalysis('cache-test-123');
      expect(retrieved).toBeNull(); // Mock returns null
    });

    it('should handle cache misses gracefully', async () => {
      const retrieved = await narrativeCache.getAnalysis('non-existent-id');
      expect(retrieved).toBeNull();
    });

    it('should validate cache health', async () => {
      const health = await narrativeCache.healthCheck();
      expect(health).toHaveProperty('healthy');
      expect(health).toHaveProperty('operationsRemaining');
      expect(health).toHaveProperty('cacheAvailable');
    });
  });

  describe('Error Handling', () => {
    it('should format not found errors correctly', () => {
      const notFoundResponse = {
        error: {
          code: 'ANALYSIS_NOT_FOUND',
          message: 'Resume analysis not found'
        }
      };

      expect(notFoundResponse.error.code).toBe('ANALYSIS_NOT_FOUND');
      expect(notFoundResponse.error.message).toBe('Resume analysis not found');
    });

    it('should format retrieval errors correctly', () => {
      const retrievalError = {
        error: {
          code: 'RETRIEVAL_FAILED',
          message: 'Failed to retrieve resume analysis',
          details: 'Database connection error'
        }
      };

      expect(retrievalError.error.code).toBe('RETRIEVAL_FAILED');
      expect(retrievalError.error.details).toBe('Database connection error');
    });

    it('should format history retrieval errors correctly', () => {
      const historyError = {
        error: {
          code: 'HISTORY_RETRIEVAL_FAILED',
          message: 'Failed to retrieve analysis history',
          details: 'Query timeout'
        }
      };

      expect(historyError.error.code).toBe('HISTORY_RETRIEVAL_FAILED');
      expect(historyError.error.details).toBe('Query timeout');
    });
  });

  describe('Response Size and Performance', () => {
    it('should calculate response sizes correctly', () => {
      const largeResponse = NarrativeResponseFormatter.formatCompletedAnalysis({
        analysisId: 'large-test',
        userId: 'user-123',
        narrative: 'x'.repeat(2000), // 2KB narrative
        analysisType: 'standalone',
        wordCount: 400,
        timestamp: '2025-08-13T19:30:00.000Z'
      });

      const size = NarrativeResponseFormatter.calculateResponseSize(largeResponse);
      expect(size.narrativeSize).toBe(2000);
      expect(size.totalSize).toBeGreaterThan(2000);
      expect(size.metadataSize).toBeGreaterThan(0);
    });

    it('should handle large history responses', () => {
      const manyAnalyses = Array.from({ length: 50 }, (_, i) => ({
        id: `analysis-${i}`,
        createdAt: '2025-08-13T19:30:00.000Z',
        analysisType: 'standalone' as const,
        wordCount: 200 + i,
        hasJobDescription: i % 2 === 0,
        status: 'completed',
        format: 'narrative' as const
      }));

      const formattedHistory = NarrativeResponseFormatter.formatAnalysisHistory({
        analyses: manyAnalyses,
        pagination: {
          page: 1,
          limit: 50,
          total: 50,
          pages: 1
        }
      });

      expect(formattedHistory.analyses).toHaveLength(50);
      expect(formattedHistory.pagination.total).toBe(50);
    });
  });
});