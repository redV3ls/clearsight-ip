/**
 * Comprehensive Tests for Narrative Analysis Flow
 * Tests the complete narrative CV analysis pipeline
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DeepSeekAIService, NarrativeAnalysis, NarrativeUtils } from '../services/deepseekAI';
import { NarrativeAnalysisService } from '../services/narrativeAnalysisService';
import { NarrativeKVCache } from '../services/narrativeKVCache';
import { NarrativeResponseFormatter } from '../services/narrativeResponseFormatter';
import { NarrativeJobAnalysisService } from '../services/narrativeJobAnalysis';
import { PromptTester } from '../utils/promptTesting';

// Mock environment for testing
const mockEnv = {
  DEEPSEEK_API_KEY: 'test-key',
  DEEPSEEK_BASE_URL: 'https://api.deepseek.com/v1',
  DEEPSEEK_MODEL: 'deepseek-reasoner',
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

const mockAIConfig = {
  provider: 'deepseek' as const,
  model: 'deepseek-reasoner',
  apiKey: 'test-key',
  baseUrl: 'https://api.deepseek.com/v1',
  maxTokens: 4000,
  temperature: 0.7,
  timeout: 60000
};

const sampleCV = `
John Doe
Software Engineer

Experience:
- 5 years of JavaScript development at TechCorp
- Led React frontend development for e-commerce platform
- Implemented Node.js microservices architecture
- Mentored junior developers and conducted code reviews

Education:
- Bachelor's in Computer Science, State University

Skills:
- JavaScript, TypeScript, React, Node.js
- AWS, Docker, Kubernetes
- Git, Agile methodologies, CI/CD
`;

const sampleJobDescription = `
Senior Software Engineer - Frontend Focus

We're looking for a Senior Software Engineer to join our growing team. You'll be responsible for building scalable web applications using modern JavaScript frameworks.

Requirements:
- 4+ years of JavaScript/TypeScript experience
- Strong experience with React and modern frontend development
- Experience with Node.js and backend development
- Knowledge of cloud platforms (AWS preferred)
- Experience with Agile development methodologies

Nice to have:
- Leadership or mentoring experience
- DevOps and CI/CD experience
- E-commerce platform experience

We offer competitive compensation, equity, and flexible remote work arrangements.
`;

describe('Narrative Analysis Flow', () => {
  let deepseekService: DeepSeekAIService;

  beforeEach(() => {
    deepseekService = new DeepSeekAIService(mockAIConfig);
  });

  describe('NarrativeUtils', () => {
    it('should calculate word count correctly', () => {
      const text = 'This is a test narrative with exactly eight words.';
      const wordCount = NarrativeUtils.calculateWordCount(text);
      expect(wordCount).toBe(9);
    });

    it('should calculate character count correctly', () => {
      const text = 'Hello World!';
      const charCount = NarrativeUtils.calculateCharacterCount(text);
      expect(charCount).toBe(11); // Excluding spaces
    });

    it('should estimate reading time correctly', () => {
      const wordCount = 400;
      const readingTime = NarrativeUtils.estimateReadingTime(wordCount);
      expect(readingTime).toBe(2); // 400 words / 200 words per minute = 2 minutes
    });

    it('should clean narrative text properly', () => {
      const messyText = '  \n\n  This is   a test.  \n\n\n  With extra spaces.  \n  ';
      const cleaned = NarrativeUtils.cleanNarrative(messyText);
      expect(cleaned).toBe('This is a test. With extra spaces.');
    });

    it('should validate narrative content', () => {
      const shortText = 'Too short';
      const goodText = 'This is a good narrative that meets the minimum length requirements and provides valuable insights.';
      const longText = 'x'.repeat(11000);

      expect(NarrativeUtils.validateNarrative(shortText).isValid).toBe(false);
      expect(NarrativeUtils.validateNarrative(goodText).isValid).toBe(true);
      expect(NarrativeUtils.validateNarrative(longText).isValid).toBe(false);
    });

    it('should generate comprehensive metadata', () => {
      const narrative = 'This is a test narrative for metadata generation.';
      const metadata = NarrativeUtils.generateMetadata(narrative, 'standalone', 2500);

      expect(metadata.wordCount).toBe(8);
      expect(metadata.analysisType).toBe('standalone');
      expect(metadata.processingTime).toBe(2500);
      expect(metadata.estimatedReadingTime).toBe(1);
      expect(metadata.generatedAt).toBeDefined();
    });
  });

  describe('Narrative Job Analysis', () => {
    it('should extract job insights correctly', () => {
      const insights = NarrativeJobAnalysisService.extractJobInsights(sampleJobDescription);

      expect(insights.experienceLevel).toBe('senior');
      expect(insights.criticalSkills).toContain('Javascript');
      expect(insights.criticalSkills).toContain('React');
      expect(insights.workArrangement).toBe('remote');
      expect(insights.keyRequirements.length).toBeGreaterThan(0);
    });

    it('should validate job description quality', () => {
      const goodJob = sampleJobDescription;
      const badJob = 'Short job';
      const emptyJob = '';

      expect(NarrativeJobAnalysisService.validateJobDescription(goodJob).isValid).toBe(true);
      expect(NarrativeJobAnalysisService.validateJobDescription(badJob).isValid).toBe(false);
      expect(NarrativeJobAnalysisService.validateJobDescription(emptyJob).isValid).toBe(false);
    });

    it('should generate narrative guidance', () => {
      const insights = NarrativeJobAnalysisService.extractJobInsights(sampleJobDescription);
      const guidance = NarrativeJobAnalysisService.generateNarrativeGuidance(insights, sampleCV);

      expect(guidance).toContain('senior-level');
      expect(guidance.length).toBeGreaterThan(50);
    });
  });

  describe('Response Formatter', () => {
    it('should format completed analysis consistently', () => {
      const response = NarrativeResponseFormatter.formatCompletedAnalysis({
        analysisId: 'test-123',
        userId: 'user-456',
        narrative: 'Test narrative content',
        analysisType: 'standalone',
        wordCount: 100,
        timestamp: '2025-08-13T19:30:00.000Z',
        processingTime: 2500,
        source: 'database'
      });

      expect(response.analysis_id).toBe('test-123');
      expect(response.status).toBe('completed');
      expect(response.narrative).toBe('Test narrative content');
      expect(response.word_count).toBe(100);
      expect(response.metadata.estimatedReadingTime).toBe(1);
      expect(response.retrieved_at).toBeDefined();
    });

    it('should format processing response consistently', () => {
      const response = NarrativeResponseFormatter.formatProcessingResponse({
        analysisId: 'test-123',
        userId: 'user-456',
        progress: 50
      });

      expect(response.analysis_id).toBe('test-123');
      expect(response.status).toBe('processing');
      expect(response.progress).toBe(50);
      expect(response.check_status_url).toContain('test-123');
    });

    it('should validate response format correctly', () => {
      const validResponse = {
        analysis_id: 'test-123',
        user_id: 'user-456',
        timestamp: '2025-08-13T19:30:00.000Z',
        status: 'completed',
        narrative: 'Test narrative',
        analysis_type: 'standalone',
        word_count: 100,
        aiPowered: true,
        metadata: {}
      };

      const invalidResponse = {
        analysis_id: 'test-123',
        // Missing required fields
      };

      expect(NarrativeResponseFormatter.validateResponse(validResponse).isValid).toBe(true);
      expect(NarrativeResponseFormatter.validateResponse(invalidResponse).isValid).toBe(false);
    });

    it('should calculate response size correctly', () => {
      const response = NarrativeResponseFormatter.formatCompletedAnalysis({
        analysisId: 'test-123',
        userId: 'user-456',
        narrative: 'Test narrative content',
        analysisType: 'standalone',
        wordCount: 100,
        timestamp: '2025-08-13T19:30:00.000Z'
      });

      const size = NarrativeResponseFormatter.calculateResponseSize(response);
      expect(size.totalSize).toBeGreaterThan(0);
      expect(size.narrativeSize).toBe('Test narrative content'.length);
      expect(size.metadataSize).toBeGreaterThan(0);
    });
  });

  describe('Prompt Testing', () => {
    it('should analyze narrative quality correctly', () => {
      const goodNarrative = `
        John Doe has built a strong foundation as a Software Engineer over the past 5 years. 
        Your experience with JavaScript and React demonstrates solid technical capabilities.
        
        I recommend focusing on cloud architecture skills to advance your career further.
        Consider pursuing AWS certifications to strengthen your profile.
      `;

      const analysis = PromptTester.analyzeNarrativeQuality(goodNarrative);

      expect(analysis.hasPersonalTone).toBe(true);
      expect(analysis.hasActionableAdvice).toBe(true);
      expect(analysis.hasCareerStory).toBe(true);
      expect(analysis.wordCount).toBeGreaterThan(30);
      expect(analysis.structureScore).toBeGreaterThan(3);
      expect(analysis.engagementScore).toBeGreaterThan(3);
    });

    it('should calculate quality score correctly', () => {
      const goodAnalysis = {
        wordCount: 400,
        hasPersonalTone: true,
        hasActionableAdvice: true,
        hasCareerStory: true,
        hasSpecificExamples: true,
        structureScore: 8,
        engagementScore: 9,
        issues: []
      };

      const score = PromptTester.calculateQualityScore(goodAnalysis);
      expect(score).toBeGreaterThan(60);
    });

    it('should identify common issues', () => {
      const poorNarrative = 'Short response without personal tone or actionable advice.';
      const analysis = PromptTester.analyzeNarrativeQuality(poorNarrative);

      expect(analysis.issues.length).toBeGreaterThan(0);
      expect(analysis.issues.some(issue => issue.includes('personal tone'))).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should handle standalone analysis flow', async () => {
      // Mock the DeepSeek API call
      const mockResponse = `
        John Doe has built a strong foundation as a Software Engineer over the past 5 years.
        Your experience with JavaScript, React, and Node.js demonstrates a solid understanding of modern web development.
        
        I recommend focusing on cloud architecture and DevOps practices to advance your career.
        Consider pursuing AWS certifications and gaining experience with Kubernetes.
      `;

      // Test the narrative processing
      const result = deepseekService['processNarrativeResponse'](mockResponse, 'standalone');

      expect(result.narrative).toContain('John Doe');
      expect(result.analysisType).toBe('standalone');
      expect(result.wordCount).toBeGreaterThan(30);
      expect(result.generatedAt).toBeDefined();
    });

    it('should handle job comparison analysis flow', async () => {
      const mockResponse = `
        John Doe's background aligns well with this Senior Software Engineer role.
        Your 5 years of JavaScript experience meets the 4+ years requirement.
        
        Your React and Node.js skills are exactly what they're looking for.
        The gap in cloud experience can be addressed through AWS training.
        
        I recommend highlighting your mentoring experience as it matches their leadership expectations.
      `;

      const result = deepseekService['processNarrativeResponse'](mockResponse, 'job-comparison');

      expect(result.narrative).toContain('aligns well');
      expect(result.analysisType).toBe('job-comparison');
      expect(result.wordCount).toBeGreaterThan(40);
    });

    it('should validate end-to-end response format', () => {
      const mockNarrativeAnalysis = {
        id: 'test-123',
        userId: 'user-456',
        narrative: 'Test narrative content for validation',
        analysisType: 'standalone' as const,
        wordCount: 100,
        hasJobDescription: false,
        processingTimeMs: 2500,
        aiProvider: 'deepseek',
        aiModel: 'deepseek-reasoner',
        createdAt: '2025-08-13T19:30:00.000Z',
        updatedAt: '2025-08-13T19:30:00.000Z'
      };

      const response = NarrativeResponseFormatter.formatCompletedAnalysis({
        analysisId: mockNarrativeAnalysis.id,
        userId: mockNarrativeAnalysis.userId,
        narrative: mockNarrativeAnalysis.narrative,
        analysisType: mockNarrativeAnalysis.analysisType,
        wordCount: mockNarrativeAnalysis.wordCount,
        timestamp: mockNarrativeAnalysis.createdAt,
        processingTime: mockNarrativeAnalysis.processingTimeMs,
        aiProvider: mockNarrativeAnalysis.aiProvider,
        aiModel: mockNarrativeAnalysis.aiModel,
        hasJobDescription: mockNarrativeAnalysis.hasJobDescription,
        source: 'database'
      });

      const validation = NarrativeResponseFormatter.validateResponse(response);
      expect(validation.isValid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });
  });

  describe('Performance Tests', () => {
    it('should process narrative within acceptable time limits', async () => {
      const startTime = Date.now();
      
      const mockResponse = 'Test narrative content for performance testing.';
      const result = deepseekService['processNarrativeResponse'](mockResponse, 'standalone');
      
      const processingTime = Date.now() - startTime;
      
      expect(processingTime).toBeLessThan(100); // Should be very fast
      expect(result.narrative).toBe(mockResponse);
    });

    it('should handle large narratives efficiently', () => {
      const largeNarrative = 'This is a test narrative. '.repeat(200); // ~5000 characters
      const startTime = Date.now();
      
      const wordCount = NarrativeUtils.calculateWordCount(largeNarrative);
      const cleaned = NarrativeUtils.cleanNarrative(largeNarrative);
      
      const processingTime = Date.now() - startTime;
      
      expect(processingTime).toBeLessThan(50);
      expect(wordCount).toBe(1000); // 200 * 5 words
      expect(cleaned.length).toBeGreaterThan(0);
    });

    it('should validate response size limits', () => {
      const response = NarrativeResponseFormatter.formatCompletedAnalysis({
        analysisId: 'test-123',
        userId: 'user-456',
        narrative: 'x'.repeat(5000), // 5KB narrative
        analysisType: 'standalone',
        wordCount: 1000,
        timestamp: '2025-08-13T19:30:00.000Z'
      });

      const size = NarrativeResponseFormatter.calculateResponseSize(response);
      expect(size.totalSize).toBeLessThan(10000); // Should be under 10KB
      expect(size.narrativeSize).toBe(5000);
    });
  });

  describe('Error Handling Tests', () => {
    it('should format error responses consistently', () => {
      const errorResponse = NarrativeResponseFormatter.formatFailedAnalysis({
        analysisId: 'test-123',
        userId: 'user-456',
        errorCode: 'ANALYSIS_TIMEOUT',
        errorMessage: 'Analysis timed out',
        userMessage: 'Your analysis took too long. Please try again.',
        retryable: true
      });

      expect(errorResponse.status).toBe('failed');
      expect(errorResponse.error?.code).toBe('ANALYSIS_TIMEOUT');
      expect(errorResponse.error?.retryable).toBe(true);
      expect(errorResponse.narrative).toContain('failed');
    });

    it('should handle validation errors properly', () => {
      const validationError = NarrativeResponseFormatter.formatValidationError({
        code: 'INVALID_INPUT',
        message: 'Input validation failed',
        issues: ['CV text too short'],
        suggestions: ['Provide more detailed CV content']
      });

      expect(validationError.error.code).toBe('INVALID_INPUT');
      expect(validationError.error.issues).toContain('CV text too short');
      expect(validationError.error.suggestions).toContain('Provide more detailed CV content');
    });
  });

  describe('Job Integration Tests', () => {
    it('should handle standalone analysis correctly', () => {
      const insights = NarrativeJobAnalysisService.extractJobInsights('');
      expect(insights.keyRequirements).toHaveLength(0);
      expect(insights.criticalSkills).toHaveLength(0);
    });

    it('should handle job comparison analysis correctly', () => {
      const insights = NarrativeJobAnalysisService.extractJobInsights(sampleJobDescription);
      
      expect(insights.experienceLevel).toBe('senior');
      expect(insights.criticalSkills.length).toBeGreaterThan(0);
      expect(insights.keyRequirements.length).toBeGreaterThan(0);
      expect(insights.workArrangement).toBe('remote');
    });

    it('should create enhanced job comparison prompts', () => {
      const insights = NarrativeJobAnalysisService.extractJobInsights(sampleJobDescription);
      const prompt = NarrativeJobAnalysisService.createEnhancedJobComparisonPrompt(
        sampleCV,
        sampleJobDescription,
        insights
      );

      expect(prompt).toContain('Job Fit Assessment');
      expect(prompt).toContain('senior-level');
      expect(prompt).toContain('JavaScript');
      expect(prompt).toContain('React');
    });
  });

  describe('Cache Integration Tests', () => {
    let narrativeCache: NarrativeKVCache;

    beforeEach(() => {
      narrativeCache = new NarrativeKVCache(mockEnv);
    });

    it('should handle cache operations gracefully', async () => {
      const cacheEntry = {
        analysisId: 'test-123',
        userId: 'user-456',
        narrative: 'Test narrative for caching',
        analysisType: 'standalone' as const,
        wordCount: 100,
        status: 'completed' as const,
        timestamp: '2025-08-13T19:30:00.000Z'
      };

      // These will use mocked KV operations
      const stored = await narrativeCache.storeAnalysis(cacheEntry);
      const retrieved = await narrativeCache.getAnalysis('test-123');

      // With mocked environment, these should handle gracefully
      expect(typeof stored).toBe('boolean');
      expect(retrieved).toBeNull(); // Mock returns null
    });

    it('should check operation limits correctly', async () => {
      const health = await narrativeCache.healthCheck();
      
      expect(health).toHaveProperty('healthy');
      expect(health).toHaveProperty('operationsRemaining');
      expect(health).toHaveProperty('cacheAvailable');
    });
  });

  describe('Database Integration Tests', () => {
    it('should handle database operations with mocked DB', () => {
      // Test that the service can be instantiated with mocked database
      const mockDatabase = {
        insert: () => ({
          values: () => Promise.resolve()
        }),
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([])
            })
          })
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

      const service = new NarrativeAnalysisService(mockDatabase as any);
      expect(service).toBeDefined();
    });
  });

  describe('End-to-End Flow Tests', () => {
    it('should complete full narrative analysis flow', async () => {
      // Test the complete flow from CV input to formatted response
      const mockNarrative = `
        John Doe has demonstrated strong technical capabilities throughout his 5-year career.
        Your experience with JavaScript and React positions you well for senior roles.
        
        I recommend focusing on cloud technologies and leadership skills for career advancement.
        Consider pursuing AWS certifications and seeking mentorship opportunities.
      `;

      // Process narrative
      const processed = deepseekService['processNarrativeResponse'](mockNarrative, 'standalone');
      
      // Format response
      const formatted = NarrativeResponseFormatter.formatCompletedAnalysis({
        analysisId: 'test-123',
        userId: 'user-456',
        narrative: processed.narrative,
        analysisType: processed.analysisType,
        wordCount: processed.wordCount,
        timestamp: processed.generatedAt
      });

      // Validate final response
      const validation = NarrativeResponseFormatter.validateResponse(formatted);

      expect(validation.isValid).toBe(true);
      expect(formatted.status).toBe('completed');
      expect(formatted.word_count).toBeGreaterThan(40);
      expect(formatted.metadata.estimatedReadingTime).toBeGreaterThan(0);
    });

    it('should handle job comparison end-to-end', () => {
      const mockJobComparisonNarrative = `
        John Doe's background aligns excellently with this Senior Software Engineer position.
        Your 5 years of JavaScript experience exceeds their 4+ year requirement.
        
        Your React expertise directly matches their frontend focus, and your Node.js skills
        complement their full-stack expectations perfectly.
        
        The main gap is in cloud experience, but your strong foundation makes AWS training
        a natural next step. I recommend starting with AWS Solutions Architect certification.
      `;

      const processed = deepseekService['processNarrativeResponse'](mockJobComparisonNarrative, 'job-comparison');
      
      expect(processed.analysisType).toBe('job-comparison');
      expect(processed.narrative).toContain('aligns excellently');
      expect(processed.wordCount).toBeGreaterThan(50);
    });
  });
});

// Export test utilities for other test files
export {
  mockEnv,
  mockAIConfig,
  sampleCV,
  sampleJobDescription
};