import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AIAnalysisService } from '../services/aiAnalysisService';

// Mock environment for testing
const mockEnv = {
  DEEPSEEK_API_KEY: 'test-api-key',
  DEEPSEEK_BASE_URL: 'https://api.deepseek.com/v1',
  DEEPSEEK_MODEL: 'deepseek-reasoner',
  DEEPSEEK_MAX_TOKENS: '4000',
  DEEPSEEK_TEMPERATURE: '0.7',
  DEEPSEEK_TIMEOUT: '30000',
  DB: {} as any,
  CACHE: {} as any,
};

describe('Enhanced AI Analysis Integration Tests', () => {
  let aiAnalysisService: AIAnalysisService;

  beforeEach(() => {
    aiAnalysisService = new AIAnalysisService(mockEnv);
  });

  describe('Basic CV Analysis with Advanced Features', () => {
    it('should perform basic analysis without advanced features', async () => {
      const cvContent = `
        John Doe
        Software Developer
        
        Experience:
        - 5 years of JavaScript development
        - React and Node.js expertise
        - AWS cloud experience
        
        Education:
        - Bachelor of Computer Science
        
        Certifications:
        - AWS Certified Developer
      `;

      const result = await aiAnalysisService.analyzeCV(cvContent);

      expect(result).toHaveProperty('analysis_id');
      expect(result).toHaveProperty('skillsAnalysis');
      expect(result.skillsAnalysis).toHaveProperty('skills');
      expect(result.skillsAnalysis.skills.length).toBeGreaterThan(0);
      expect(result).toHaveProperty('metadata');
      expect(result.metadata.aiProvider).toBeDefined();
    });

    it('should include multi-language analysis when enabled', async () => {
      const cvContent = `
        Juan Pérez
        Desarrollador de Software
        
        Experiencia:
        - 5 años de desarrollo en JavaScript
        - Experiencia con React y Node.js
        - Conocimiento de AWS
      `;

      const result = await aiAnalysisService.analyzeCV(cvContent, undefined, {
        includeSkillsGap: true,
        includeCareerSuggestions: true,
        includeIndustryTrends: true,
        includeMultiLanguage: true,
        targetLanguage: 'English'
      });

      expect(result).toHaveProperty('multiLanguageAnalysis');
      expect(result.multiLanguageAnalysis).toHaveProperty('originalLanguage');
      expect(result.multiLanguageAnalysis).toHaveProperty('detectedLanguage');
      expect(result.multiLanguageAnalysis).toHaveProperty('culturalContext');
    });

    it('should include industry-specific analysis when enabled', async () => {
      const cvContent = 'Software developer with React experience...';
      const jobContent = 'Senior React Developer position at tech startup...';

      const result = await aiAnalysisService.analyzeCV(cvContent, jobContent, {
        includeSkillsGap: true,
        includeCareerSuggestions: true,
        includeIndustryTrends: true,
        includeIndustrySpecific: true,
        industry: 'Technology'
      });

      expect(result).toHaveProperty('industrySpecificAnalysis');
      expect(result.industrySpecificAnalysis).toHaveProperty('industry', 'Technology');
      expect(result.industrySpecificAnalysis).toHaveProperty('specificRequirements');
      expect(result.industrySpecificAnalysis).toHaveProperty('marketContext');
      expect(result.industrySpecificAnalysis).toHaveProperty('careerPaths');
    });

    it('should include personalized coaching when enabled', async () => {
      const cvContent = 'Software developer with React experience...';
      const jobContent = 'Senior React Developer position...';

      const result = await aiAnalysisService.analyzeCV(cvContent, jobContent, {
        includeSkillsGap: true,
        includeCareerSuggestions: true,
        includeIndustryTrends: true,
        includePersonalizedCoaching: true,
        userPreferences: {
          learningStyle: 'visual',
          careerGoals: ['Become a senior developer', 'Lead technical projects'],
          timeAvailability: '10 hours per week'
        }
      });

      expect(result).toHaveProperty('personalizedCoaching');
      expect(result.personalizedCoaching).toHaveProperty('learningStyle');
      expect(result.personalizedCoaching).toHaveProperty('recommendations');
      expect(result.personalizedCoaching.recommendations).toHaveProperty('immediate');
      expect(result.personalizedCoaching.recommendations).toHaveProperty('shortTerm');
      expect(result.personalizedCoaching.recommendations).toHaveProperty('longTerm');
    });

    it('should include skill trend predictions when enabled', async () => {
      const cvContent = 'Software developer with React, JavaScript, and Python experience...';

      const result = await aiAnalysisService.analyzeCV(cvContent, undefined, {
        includeSkillsGap: true,
        includeCareerSuggestions: true,
        includeIndustryTrends: true,
        includeSkillTrendPredictions: true,
        industry: 'Technology'
      });

      expect(result).toHaveProperty('skillTrendPredictions');
      expect(Array.isArray(result.skillTrendPredictions)).toBe(true);
      if (result.skillTrendPredictions && result.skillTrendPredictions.length > 0) {
        const prediction = result.skillTrendPredictions[0];
        expect(prediction).toHaveProperty('skill');
        expect(prediction).toHaveProperty('currentDemand');
        expect(prediction).toHaveProperty('predictedDemand');
        expect(prediction).toHaveProperty('factors');
        expect(prediction).toHaveProperty('salaryImpact');
        expect(prediction).toHaveProperty('learningRecommendation');
      }
    });

    it('should include competitive analysis when enabled', async () => {
      const cvContent = 'Software developer with React experience...';
      const jobContent = 'Senior React Developer position...';

      const result = await aiAnalysisService.analyzeCV(cvContent, jobContent, {
        includeSkillsGap: true,
        includeCareerSuggestions: true,
        includeIndustryTrends: true,
        includeCompetitiveAnalysis: true,
        industry: 'Technology'
      });

      expect(result).toHaveProperty('competitiveAnalysis');
      expect(result.competitiveAnalysis).toHaveProperty('candidateProfile');
      expect(result.competitiveAnalysis).toHaveProperty('marketComparison');
      expect(result.competitiveAnalysis).toHaveProperty('competitiveAdvantages');
      expect(result.competitiveAnalysis).toHaveProperty('improvementAreas');
    });

    it('should include interview preparation when enabled', async () => {
      const cvContent = 'Software developer with React experience...';
      const jobContent = 'Senior React Developer position...';

      const result = await aiAnalysisService.analyzeCV(cvContent, jobContent, {
        includeSkillsGap: true,
        includeCareerSuggestions: true,
        includeIndustryTrends: true,
        includeInterviewPreparation: true
      });

      expect(result).toHaveProperty('interviewPreparation');
      expect(result.interviewPreparation).toHaveProperty('jobSpecific');
      expect(result.interviewPreparation).toHaveProperty('preparationPlan');
      expect(result.interviewPreparation).toHaveProperty('mockInterviewSuggestions');
    });

    it('should include portfolio optimization when enabled', async () => {
      const cvContent = 'Software developer with React experience...';
      const jobContent = 'Senior React Developer position...';
      const currentPortfolio = 'Portfolio with 3 React projects and basic documentation';

      const result = await aiAnalysisService.analyzeCV(cvContent, jobContent, {
        includeSkillsGap: true,
        includeCareerSuggestions: true,
        includeIndustryTrends: true,
        includePortfolioOptimization: true,
        currentPortfolio
      });

      expect(result).toHaveProperty('portfolioOptimization');
      expect(result.portfolioOptimization).toHaveProperty('currentPortfolio');
      expect(result.portfolioOptimization).toHaveProperty('recommendations');
      expect(result.portfolioOptimization).toHaveProperty('industryBenchmarks');
    });

    it('should include networking insights when enabled', async () => {
      const cvContent = 'Software developer with React experience...';

      const result = await aiAnalysisService.analyzeCV(cvContent, undefined, {
        includeSkillsGap: true,
        includeCareerSuggestions: true,
        includeIndustryTrends: true,
        includeNetworkingInsights: true,
        industry: 'Technology',
        userPreferences: {
          careerGoals: ['Become a senior developer', 'Lead technical projects']
        }
      });

      expect(result).toHaveProperty('networkingInsights');
      expect(result.networkingInsights).toHaveProperty('networkingStrategy');
      expect(result.networkingInsights).toHaveProperty('careerGrowthPlan');
    });
  });

  describe('Comprehensive Analysis with All Features', () => {
    it('should perform comprehensive analysis with all advanced features enabled', async () => {
      const cvContent = `
        María García
        Desarrolladora Full-Stack
        
        Experiencia:
        - 4 años desarrollando aplicaciones web con React y Node.js
        - Experiencia con bases de datos MongoDB y PostgreSQL
        - Conocimiento de AWS y Docker
        - Liderazgo de equipo pequeño
        
        Educación:
        - Ingeniería en Sistemas Computacionales
        
        Certificaciones:
        - AWS Certified Solutions Architect
        - Certified Scrum Master
      `;

      const jobContent = `
        Senior Full-Stack Developer
        Tech Startup - Remote
        
        We're looking for a senior full-stack developer to join our growing team.
        
        Requirements:
        - 5+ years of experience with React and Node.js
        - Strong system design skills
        - Experience with microservices architecture
        - Leadership and mentoring experience
        - AWS cloud expertise
        
        Nice to have:
        - Experience with Kubernetes
        - GraphQL knowledge
        - Previous startup experience
      `;

      const currentPortfolio = `
        Current portfolio includes:
        1. E-commerce platform built with React and Node.js
        2. Task management app with real-time features
        3. Personal blog with custom CMS
        
        All projects have basic documentation and are deployed on Heroku.
      `;

      const result = await aiAnalysisService.analyzeCV(cvContent, jobContent, {
        includeSkillsGap: true,
        includeCareerSuggestions: true,
        includeIndustryTrends: true,
        // All advanced features enabled
        includeMultiLanguage: true,
        includeIndustrySpecific: true,
        includePersonalizedCoaching: true,
        includeSkillTrendPredictions: true,
        includeCompetitiveAnalysis: true,
        includeInterviewPreparation: true,
        includePortfolioOptimization: true,
        includeNetworkingInsights: true,
        // Configuration
        targetLanguage: 'English',
        industry: 'Technology',
        userPreferences: {
          learningStyle: 'visual',
          careerGoals: ['Senior developer', 'Technical lead', 'Startup CTO'],
          timeAvailability: '15 hours per week'
        },
        currentPortfolio
      });

      // Verify all features are included
      expect(result).toHaveProperty('analysis_id');
      expect(result).toHaveProperty('skillsAnalysis');
      expect(result).toHaveProperty('skillsGap');
      expect(result).toHaveProperty('careerSuggestions');
      expect(result).toHaveProperty('industryTrends');
      expect(result).toHaveProperty('learningPlan');
      expect(result).toHaveProperty('marketInsights');
      expect(result).toHaveProperty('competitiveAdvantage');

      // Advanced features
      expect(result).toHaveProperty('multiLanguageAnalysis');
      expect(result).toHaveProperty('industrySpecificAnalysis');
      expect(result).toHaveProperty('personalizedCoaching');
      expect(result).toHaveProperty('skillTrendPredictions');
      expect(result).toHaveProperty('competitiveAnalysis');
      expect(result).toHaveProperty('interviewPreparation');
      expect(result).toHaveProperty('portfolioOptimization');
      expect(result).toHaveProperty('networkingInsights');

      // Verify metadata includes advanced features
      expect(result.metadata.analysisOptions).toHaveProperty('includeMultiLanguage', true);
      expect(result.metadata.analysisOptions).toHaveProperty('includeIndustrySpecific', true);
      expect(result.metadata.analysisOptions).toHaveProperty('includePersonalizedCoaching', true);
      expect(result.metadata.analysisOptions).toHaveProperty('includeSkillTrendPredictions', true);
      expect(result.metadata.analysisOptions).toHaveProperty('includeCompetitiveAnalysis', true);
      expect(result.metadata.analysisOptions).toHaveProperty('includeInterviewPreparation', true);
      expect(result.metadata.analysisOptions).toHaveProperty('includePortfolioOptimization', true);
      expect(result.metadata.analysisOptions).toHaveProperty('includeNetworkingInsights', true);

      // Verify processing time is reasonable (should be longer due to advanced features)
      expect(result.metadata.processingTime).toBeGreaterThan(0);
      expect(result.metadata.processingTime).toBeLessThan(60000); // Less than 60 seconds
    });
  });

  describe('Performance and Error Handling', () => {
    it('should handle missing optional parameters gracefully', async () => {
      const cvContent = 'Basic CV content...';

      const result = await aiAnalysisService.analyzeCV(cvContent, undefined, {
        includeSkillsGap: true,
        includeCareerSuggestions: true,
        includeIndustryTrends: true,
        includePersonalizedCoaching: true,
        // Missing userPreferences, industry, etc.
      });

      expect(result).toHaveProperty('analysis_id');
      expect(result).toHaveProperty('skillsAnalysis');
      // Should not have personalized coaching without proper parameters
      expect(result.personalizedCoaching).toBeUndefined();
    });

    it('should fallback gracefully when AI features fail', async () => {
      // This would test the fallback mechanism
      // For now, we'll verify the service handles errors appropriately
      const cvContent = 'Test CV content...';

      const result = await aiAnalysisService.analyzeCV(cvContent);

      expect(result).toHaveProperty('analysis_id');
      expect(result).toHaveProperty('skillsAnalysis');
      expect(result.metadata).toHaveProperty('fallbackUsed');
    });

    it('should validate required parameters for advanced features', async () => {
      const cvContent = 'Test CV content...';

      // Test that networking insights requires career goals
      const result = await aiAnalysisService.analyzeCV(cvContent, undefined, {
        includeSkillsGap: true,
        includeCareerSuggestions: true,
        includeIndustryTrends: true,
        includeNetworkingInsights: true,
        industry: 'Technology',
        // Missing careerGoals in userPreferences
      });

      // Should not include networking insights without career goals
      expect(result.networkingInsights).toBeUndefined();
    });
  });

  describe('AI Service Health and Status', () => {
    it('should report AI service status correctly', async () => {
      const status = aiAnalysisService.getAIStatus();

      expect(status).toHaveProperty('enabled');
      expect(status).toHaveProperty('healthy');
      expect(typeof status.enabled).toBe('boolean');
      expect(typeof status.healthy).toBe('boolean');

      if (status.enabled) {
        expect(status).toHaveProperty('provider');
        expect(status).toHaveProperty('model');
      }
    });

    it('should perform health check', async () => {
      const isHealthy = await aiAnalysisService.isAIHealthy();
      expect(typeof isHealthy).toBe('boolean');
    });
  });

  describe('Data Quality and Validation', () => {
    it('should handle empty CV content', async () => {
      const cvContent = '';

      // Should either handle gracefully or throw appropriate error
      try {
        const result = await aiAnalysisService.analyzeCV(cvContent);
        expect(result).toHaveProperty('analysis_id');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should handle very long CV content', async () => {
      const cvContent = 'A'.repeat(100000); // Very long content

      try {
        const result = await aiAnalysisService.analyzeCV(cvContent);
        expect(result).toHaveProperty('analysis_id');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should handle special characters and formatting', async () => {
      const cvContent = `
        José María Rodríguez-García
        Développeur Full-Stack 🚀
        
        Expérience:
        • 5 années de développement avec React & Node.js
        • Expertise en bases de données (MongoDB, PostgreSQL)
        • Connaissances AWS & Docker 🐳
        
        Éducation:
        ★ Master en Informatique - École Polytechnique
        
        Certifications:
        ✓ AWS Certified Solutions Architect
        ✓ Certified Kubernetes Administrator
      `;

      const result = await aiAnalysisService.analyzeCV(cvContent);

      expect(result).toHaveProperty('analysis_id');
      expect(result).toHaveProperty('skillsAnalysis');
      expect(result.skillsAnalysis.skills.length).toBeGreaterThan(0);
    });
  });
});