/**
 * Tests for Data Migration Service
 * Tests migration from legacy structured format to narrative format
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DataMigrationService } from '../utils/dataMigration';
import { NarrativeAnalysisService } from '../services/narrativeAnalysisService';

// Mock database
const mockDatabase = {
  prepare: (query: string) => ({
    bind: (...params: any[]) => ({
      all: () => Promise.resolve({ results: [] }),
      first: () => Promise.resolve(null),
      run: () => Promise.resolve({ success: true, changes: 1 })
    })
  })
};

// Mock narrative service
const mockNarrativeService = {
  create: () => Promise.resolve({
    id: 'test-id',
    userId: 'user-123',
    narrative: 'Test narrative',
    analysisType: 'standalone' as const,
    wordCount: 100,
    hasJobDescription: false,
    processingTimeMs: 1000,
    aiProvider: 'legacy-migration',
    aiModel: 'migrated-data',
    createdAt: '2025-08-13T19:30:00.000Z',
    updatedAt: '2025-08-13T19:30:00.000Z'
  }),
  getById: () => Promise.resolve(null),
  getUserStats: () => Promise.resolve({
    totalAnalyses: 0,
    standaloneCount: 0,
    jobComparisonCount: 0,
    averageWordCount: 0,
    averageProcessingTime: 0
  })
};

describe('Data Migration Service', () => {
  let migrationService: DataMigrationService;

  beforeEach(() => {
    migrationService = new DataMigrationService(
      mockDatabase as any,
      mockNarrativeService as any
    );
  });

  describe('Legacy Analysis Parsing', () => {
    it('should parse legacy analysis data correctly', () => {
      const legacyAnalysis = {
        id: 'legacy-123',
        user_id: 'user-456',
        analysis_data: JSON.stringify({
          status: 'completed',
          aiPowered: true,
          processingTime: 2500,
          skillsAnalysis: {
            totalSkills: 15,
            technicalSkills: 10,
            softSkills: 5,
            skillsFound: ['JavaScript', 'React', 'Node.js'],
            recommendations: ['Learn TypeScript', 'Improve testing skills']
          }
        }),
        created_at: '2025-08-13T19:30:00.000Z',
        updated_at: '2025-08-13T19:30:00.000Z'
      };

      const parsed = (migrationService as any).parseLegacyAnalysis(legacyAnalysis);

      expect(parsed.id).toBe('legacy-123');
      expect(parsed.userId).toBe('user-456');
      expect(parsed.status).toBe('completed');
      expect(parsed.aiPowered).toBe(true);
      expect(parsed.processingTime).toBe(2500);
      expect(parsed.skillsAnalysis?.totalSkills).toBe(15);
      expect(parsed.skillsAnalysis?.skillsFound).toContain('JavaScript');
    });

    it('should handle malformed JSON gracefully', () => {
      const legacyAnalysis = {
        id: 'legacy-123',
        user_id: 'user-456',
        analysis_data: 'invalid json',
        created_at: '2025-08-13T19:30:00.000Z',
        updated_at: '2025-08-13T19:30:00.000Z'
      };

      expect(() => {
        (migrationService as any).parseLegacyAnalysis(legacyAnalysis);
      }).toThrow('Failed to parse legacy analysis data');
    });
  });

  describe('Migration Eligibility', () => {
    it('should identify analyses eligible for migration', () => {
      const eligibleAnalysis = {
        id: 'test-1',
        userId: 'user-123',
        timestamp: '2025-08-13T19:30:00.000Z',
        status: 'completed',
        aiPowered: true,
        skillsAnalysis: {
          totalSkills: 10,
          skillsFound: ['JavaScript', 'React']
        }
      };

      const shouldMigrate = (migrationService as any).shouldMigrateAnalysis(eligibleAnalysis);
      expect(shouldMigrate).toBe(true);
    });

    it('should skip non-completed analyses', () => {
      const incompleteAnalysis = {
        id: 'test-1',
        userId: 'user-123',
        timestamp: '2025-08-13T19:30:00.000Z',
        status: 'processing',
        aiPowered: true,
        skillsAnalysis: { totalSkills: 10 }
      };

      const shouldMigrate = (migrationService as any).shouldMigrateAnalysis(incompleteAnalysis);
      expect(shouldMigrate).toBe(false);
    });

    it('should skip non-AI analyses', () => {
      const nonAiAnalysis = {
        id: 'test-1',
        userId: 'user-123',
        timestamp: '2025-08-13T19:30:00.000Z',
        status: 'completed',
        aiPowered: false,
        skillsAnalysis: { totalSkills: 10 }
      };

      const shouldMigrate = (migrationService as any).shouldMigrateAnalysis(nonAiAnalysis);
      expect(shouldMigrate).toBe(false);
    });

    it('should skip analyses without skills data', () => {
      const noSkillsAnalysis = {
        id: 'test-1',
        userId: 'user-123',
        timestamp: '2025-08-13T19:30:00.000Z',
        status: 'completed',
        aiPowered: true,
        skillsAnalysis: null
      };

      const shouldMigrate = (migrationService as any).shouldMigrateAnalysis(noSkillsAnalysis);
      expect(shouldMigrate).toBe(false);
    });
  });

  describe('Narrative Generation', () => {
    it('should generate narrative from legacy skills data', () => {
      const parsedAnalysis = {
        id: 'test-1',
        userId: 'user-123',
        timestamp: '2025-08-13T19:30:00.000Z',
        status: 'completed',
        aiPowered: true,
        skillsAnalysis: {
          totalSkills: 15,
          technicalSkills: 10,
          softSkills: 5,
          skillsFound: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
          recommendations: [
            'Consider learning TypeScript for better code maintainability',
            'Develop cloud computing skills with AWS or Azure',
            'Improve testing skills with Jest or Cypress'
          ]
        }
      };

      const narrative = (migrationService as any).generateNarrativeFromLegacy(parsedAnalysis);

      expect(narrative).toBeTruthy();
      expect(narrative).toContain('15 distinct skills');
      expect(narrative).toContain('10 technical skills and 5 soft skills');
      expect(narrative).toContain('JavaScript');
      expect(narrative).toContain('React');
      expect(narrative).toContain('TypeScript');
      expect(narrative).toContain('Key skills identified');
      expect(narrative).toContain('Recommendations for your career development');
      expect(narrative.length).toBeGreaterThan(100);
    });

    it('should handle minimal skills data', () => {
      const parsedAnalysis = {
        id: 'test-1',
        userId: 'user-123',
        timestamp: '2025-08-13T19:30:00.000Z',
        status: 'completed',
        aiPowered: true,
        skillsAnalysis: {
          totalSkills: 3,
          skillsFound: ['JavaScript', 'HTML', 'CSS']
        }
      };

      const narrative = (migrationService as any).generateNarrativeFromLegacy(parsedAnalysis);

      expect(narrative).toBeTruthy();
      expect(narrative).toContain('3 distinct skills');
      expect(narrative).toContain('JavaScript');
      expect(narrative.length).toBeGreaterThan(100);
    });

    it('should return null for insufficient data', () => {
      const parsedAnalysis = {
        id: 'test-1',
        userId: 'user-123',
        timestamp: '2025-08-13T19:30:00.000Z',
        status: 'completed',
        aiPowered: true,
        skillsAnalysis: null
      };

      const narrative = (migrationService as any).generateNarrativeFromLegacy(parsedAnalysis);
      expect(narrative).toBeNull();
    });

    it('should limit skills list to top 10', () => {
      const manySkills = Array.from({ length: 20 }, (_, i) => `Skill${i + 1}`);
      
      const parsedAnalysis = {
        id: 'test-1',
        userId: 'user-123',
        timestamp: '2025-08-13T19:30:00.000Z',
        status: 'completed',
        aiPowered: true,
        skillsAnalysis: {
          totalSkills: 20,
          skillsFound: manySkills
        }
      };

      const narrative = (migrationService as any).generateNarrativeFromLegacy(parsedAnalysis);

      // Count bullet points in the skills section
      const skillBullets = (narrative.match(/• Skill\d+/g) || []).length;
      expect(skillBullets).toBe(10);
    });
  });

  describe('Word Counting', () => {
    it('should count words correctly', () => {
      const text = 'This is a test sentence with exactly eight words.';
      const wordCount = (migrationService as any).countWords(text);
      expect(wordCount).toBe(9);
    });

    it('should handle extra whitespace', () => {
      const text = '  This   has   extra   spaces  ';
      const wordCount = (migrationService as any).countWords(text);
      expect(wordCount).toBe(4);
    });

    it('should handle empty text', () => {
      const wordCount = (migrationService as any).countWords('');
      expect(wordCount).toBe(0);
    });

    it('should handle text with only whitespace', () => {
      const wordCount = (migrationService as any).countWords('   \n\t  ');
      expect(wordCount).toBe(0);
    });
  });

  describe('Migration Statistics', () => {
    it('should calculate migration statistics correctly', async () => {
      // Mock database responses
      const mockDb = {
        prepare: (query: string) => ({
          bind: (...params: any[]) => ({
            first: () => Promise.resolve({ count: 50 })
          })
        })
      };

      const mockNarrativeService = {
        getUserStats: () => Promise.resolve({
          totalAnalyses: 30,
          standaloneCount: 30,
          jobComparisonCount: 0,
          averageWordCount: 200,
          averageProcessingTime: 2000
        })
      };

      const service = new DataMigrationService(mockDb as any, mockNarrativeService as any);
      const stats = await service.getMigrationStats('user-123');

      expect(stats.legacyAnalyses).toBe(50);
      expect(stats.migratedAnalyses).toBe(30);
      expect(stats.pendingMigration).toBe(20);
      expect(stats.migrationPercentage).toBe(60);
    });

    it('should handle zero legacy analyses', async () => {
      const mockDb = {
        prepare: (query: string) => ({
          bind: (...params: any[]) => ({
            first: () => Promise.resolve({ count: 0 })
          })
        })
      };

      const mockNarrativeService = {
        getUserStats: () => Promise.resolve({
          totalAnalyses: 0,
          standaloneCount: 0,
          jobComparisonCount: 0,
          averageWordCount: 0,
          averageProcessingTime: 0
        })
      };

      const service = new DataMigrationService(mockDb as any, mockNarrativeService as any);
      const stats = await service.getMigrationStats('user-123');

      expect(stats.legacyAnalyses).toBe(0);
      expect(stats.migratedAnalyses).toBe(0);
      expect(stats.pendingMigration).toBe(0);
      expect(stats.migrationPercentage).toBe(100);
    });
  });

  describe('Migration Validation', () => {
    it('should validate successful migration', async () => {
      const mockDb = {
        prepare: (query: string) => ({
          bind: (...params: any[]) => ({
            first: () => Promise.resolve({
              id: 'test-123',
              user_id: 'user-456',
              analysis_data: JSON.stringify({
                status: 'completed',
                aiPowered: true,
                skillsAnalysis: { totalSkills: 10 }
              }),
              created_at: '2025-08-13T19:30:00.000Z'
            })
          })
        })
      };

      const mockNarrativeService = {
        getById: () => Promise.resolve({
          id: 'test-123',
          userId: 'user-456',
          narrative: 'This is a comprehensive resume analysis with detailed insights.',
          wordCount: 150,
          analysisType: 'standalone'
        })
      };

      const service = new DataMigrationService(mockDb as any, mockNarrativeService as any);
      const validation = await service.validateMigration('test-123');

      expect(validation.isValid).toBe(true);
      expect(validation.issues).toHaveLength(0);
      expect(validation.legacyData).toBeDefined();
      expect(validation.narrativeData).toBeDefined();
    });

    it('should detect validation issues', async () => {
      const mockDb = {
        prepare: (query: string) => ({
          bind: (...params: any[]) => ({
            first: () => Promise.resolve({
              id: 'test-123',
              user_id: 'user-456',
              analysis_data: JSON.stringify({
                status: 'completed',
                aiPowered: true,
                skillsAnalysis: { totalSkills: 10 }
              }),
              created_at: '2025-08-13T19:30:00.000Z'
            })
          })
        })
      };

      const mockNarrativeService = {
        getById: () => Promise.resolve({
          id: 'test-123',
          userId: 'different-user', // User ID mismatch
          narrative: 'Short text', // Too short
          wordCount: 20,
          analysisType: 'standalone'
        })
      };

      const service = new DataMigrationService(mockDb as any, mockNarrativeService as any);
      const validation = await service.validateMigration('test-123');

      expect(validation.isValid).toBe(false);
      expect(validation.issues).toContain('User ID mismatch');
      expect(validation.issues).toContain('Narrative too short');
      expect(validation.issues).toContain('Narrative does not reference resume');
    });

    it('should handle missing legacy analysis', async () => {
      const mockDb = {
        prepare: (query: string) => ({
          bind: (...params: any[]) => ({
            first: () => Promise.resolve(null)
          })
        })
      };

      const service = new DataMigrationService(mockDb as any, mockNarrativeService as any);
      const validation = await service.validateMigration('non-existent');

      expect(validation.isValid).toBe(false);
      expect(validation.issues).toContain('Legacy analysis not found');
    });
  });

  describe('Cleanup Operations', () => {
    it('should identify analyses for cleanup', async () => {
      const mockDb = {
        prepare: (query: string) => ({
          bind: (...params: any[]) => ({
            all: () => Promise.resolve({
              results: [
                { id: 'old-1', user_id: 'user-123' },
                { id: 'old-2', user_id: 'user-123' }
              ]
            }),
            run: () => Promise.resolve({ success: true, changes: 1 })
          })
        })
      };

      const mockNarrativeService = {
        getById: (id: string) => {
          // Simulate that old-1 is migrated, old-2 is not
          if (id === 'old-1') {
            return Promise.resolve({ id, userId: 'user-123', narrative: 'Migrated' });
          }
          return Promise.resolve(null);
        }
      };

      const service = new DataMigrationService(mockDb as any, mockNarrativeService as any);
      const result = await service.cleanupLegacyData({ dryRun: true });

      expect(result.deletedCount).toBe(1); // Only old-1 should be marked for deletion
      expect(result.errors).toHaveLength(0);
    });

    it('should handle cleanup errors gracefully', async () => {
      const mockDb = {
        prepare: (query: string) => ({
          bind: (...params: any[]) => ({
            all: () => Promise.resolve({
              results: [{ id: 'error-prone', user_id: 'user-123' }]
            }),
            run: () => Promise.reject(new Error('Database error'))
          })
        })
      };

      const mockNarrativeService = {
        getById: () => Promise.resolve({ id: 'error-prone', userId: 'user-123', narrative: 'Migrated' })
      };

      const service = new DataMigrationService(mockDb as any, mockNarrativeService as any);
      const result = await service.cleanupLegacyData({ dryRun: false });

      expect(result.deletedCount).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Database error');
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      const errorDb = {
        prepare: () => {
          throw new Error('Database connection failed');
        }
      };

      const service = new DataMigrationService(errorDb as any, mockNarrativeService as any);
      
      await expect(service.migrateLegacyAnalyses({ batchSize: 1 }))
        .rejects.toThrow('Database connection failed');
    });

    it('should continue processing after individual failures', async () => {
      const mockDb = {
        prepare: (query: string) => ({
          bind: (...params: any[]) => ({
            all: () => Promise.resolve({
              results: [
                {
                  id: 'good-analysis',
                  user_id: 'user-123',
                  analysis_data: JSON.stringify({
                    status: 'completed',
                    aiPowered: true,
                    skillsAnalysis: { totalSkills: 10, skillsFound: ['JavaScript'] }
                  }),
                  created_at: '2025-08-13T19:30:00.000Z'
                },
                {
                  id: 'bad-analysis',
                  user_id: 'user-123',
                  analysis_data: 'invalid json',
                  created_at: '2025-08-13T19:30:00.000Z'
                }
              ]
            })
          })
        })
      };

      const service = new DataMigrationService(mockDb as any, mockNarrativeService as any);
      const result = await service.migrateLegacyAnalyses({ 
        batchSize: 2, 
        dryRun: true,
        maxMigrations: 2
      });

      expect(result.totalProcessed).toBe(2);
      expect(result.successfulMigrations).toBe(1);
      expect(result.failedMigrations).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].analysisId).toBe('bad-analysis');
    });
  });
});