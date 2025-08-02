import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AIAnalysisService, EnhancedAnalysisResult } from '../services/aiAnalysisService';

// Mock environment for testing
const mockEnv = {
  DEEPSEEK_API_KEY: 'test-api-key',
  DEEPSEEK_BASE_URL: 'https://api.deepseek.com/v1',
  DEEPSEEK_MODEL: 'deepseek-reasoner',
  AI_MAX_TOKENS: '4000',
  AI_TEMPERATURE: '0.1',
  AI_TIMEOUT: '30000'
};

const mockEnvWithoutAI = {
  // No AI configuration
};

// Mock AI responses
const mockSkillsAnalysis = {
  skills: [
    {
      name: 'JavaScript',
      category: 'Programming',
      level: 'advanced',
      yearsExperience: 5,
      confidence: 0.95,
      context: 'Used extensively in projects',
      certifications: [],
      relatedSkills: ['React', 'Node.js'],
      reasoning: 'Strong evidence in work history'
    }
  ],
  categories: ['Programming'],
  overallExperience: 'Senior level developer',
  education: ['Bachelor of Computer Science'],
  certifications: ['AWS Certified Developer'],
  strengths: ['Strong technical skills'],
  areasForImprovement: ['Leadership skills'],
  careerLevel: 'senior',
  reasoning: 'Comprehensive analysis of experience and skills'
};

const mockJobAnalysis = {
  jobTitle: 'Senior Software Engineer',
  company: 'TechCorp',
  industry: 'Technology',
  experienceLevel: 'senior',
  skillRequirements: [
    {
      skill: 'JavaScript',
      category: 'Programming',
      importance: 'critical',
      minimumLevel: 'advanced',
      yearsRequired: 5,
      context: 'Core requirement',
      reasoning: 'Primary technology',
      confidence: 0.95,
      marketDemand: 'high',
      salaryImpact: 'high'
    }
  ],
  softSkills: ['Communication'],
  responsibilities: ['Develop applications'],
  benefits: ['Health Insurance'],
  salaryRange: { min: 120000, max: 160000, currency: 'USD' },
  workArrangement: 'hybrid',
  reasoning: 'Analysis of job requirements'
};

const mockGapAnalysis = {
  overallMatch: 85,
  skillGaps: [
    {
      skillName: 'System Design',
      category: 'Architecture',
      currentLevel: null,
      requiredLevel: 'intermediate',
      gapSeverity: 'moderate',
      priority: 7,
      timeToCompetency: 6,
      learningDifficulty: 'moderate',
      recommendations: ['Take system design course'],
      resources: ['Online courses'],
      reasoning: 'Important for senior role'
    }
  ],
  strengths: [
    {
      name: 'JavaScript',
      category: 'Programming',
      level: 'advanced',
      yearsExperience: 5,
      confidence: 0.95,
      context: 'Strong foundation',
      certifications: [],
      relatedSkills: [],
      reasoning: 'Exceeds requirements'
    }
  ],
  transferableSkills: [
    {
      from: 'JavaScript',
      to: 'TypeScript',
      reasoning: 'Similar concepts'
    }
  ],
  careerPaths: [
    {
      title: 'Staff Engineer',
      description: 'Technical leadership',
      matchScore: 78,
      requiredSkills: ['System Design'],
      timeToTransition: 18,
      salaryRange: { min: 180000, max: 220000, currency: 'USD' },
      reasoning: 'Natural progression'
    }
  ],
  learningPlan: {
    immediate: [
      {
        skill: 'System Design',
        action: 'Complete course',
        timeframe: '3 months',
        resources: ['Online courses']
      }
    ],
    shortTerm: [],
    longTerm: []
  },
  marketInsights: ['High demand for senior engineers'],
  competitiveAdvantage: ['Strong JavaScript expertise'],
  reasoning: 'Comprehensive gap analysis'
};

describe('AIAnalysisService', () => {
  let service: AIAnalysisService;
  let fetchMock: any;

  beforeEach(() => {
    fetchMock = vi.spyOn(global, 'fetch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with AI enabled when configuration is valid', () => {
      service = new AIAnalysisService(mockEnv);
      expect(service).toBeInstanceOf(AIAnalysisService);
    });

    it('should initialize with AI disabled when configuration is missing', () => {
      service = new AIAnalysisService(mockEnvWithoutAI);
      expect(service).toBeInstanceOf(AIAnalysisService);
    });

    it('should report AI status correctly', () => {
      service = new AIAnalysisService(mockEnv);
      const status = service.getAIStatus();
      
      expect(status.enabled).toBe(true);
      expect(status.provider).toBe('deepseek');
      expect(status.model).toBe('deepseek-reasoner');
    });

    it('should report AI disabled status when no configuration', () => {
      service = new AIAnalysisService(mockEnvWithoutAI);
      const status = service.getAIStatus();
      
      expect(status.enabled).toBe(false);
      expect(status.provider).toBeUndefined();
    });
  });

  describe('CV Analysis with AI', () => {
    beforeEach(() => {
      service = new AIAnalysisService(mockEnv);
      
      // Mock successful AI responses
      fetchMock.mockImplementation(async (url, options) => {
        const body = JSON.parse(options?.body as string);
        const prompt = body.messages[1].content;

        if (prompt.includes('CV/resume text')) {
          return new Response(JSON.stringify({
            choices: [{ message: { content: JSON.stringify(mockSkillsAnalysis) } }],
            usage: { total_tokens: 1500 }
          }));
        }

        if (prompt.includes('job description')) {
          return new Response(JSON.stringify({
            choices: [{ message: { content: JSON.stringify(mockJobAnalysis) } }],
            usage: { total_tokens: 2000 }
          }));
        }

        if (prompt.includes('gap analysis')) {
          return new Response(JSON.stringify({
            choices: [{ message: { content: JSON.stringify(mockGapAnalysis) } }],
            usage: { total_tokens: 3000 }
          }));
        }

        return new Response(JSON.stringify({ error: 'Unknown prompt' }), { status: 400 });
      });
    });

    it('should perform complete AI-powered analysis with job description', async () => {
      const cvContent = `
        Senior Software Engineer with 5 years of JavaScript experience.
        Proficient in React, Node.js, and modern web development.
        Bachelor's degree in Computer Science.
      `;

      const jobContent = `
        Senior Software Engineer position requiring 5+ years JavaScript experience.
        React and Node.js expertise required.
        Salary: $120,000 - $160,000
      `;

      const result = await service.analyzeCV(cvContent, jobContent, {
        includeSkillsGap: true,
        includeCareerSuggestions: true,
        includeIndustryTrends: true
      });

      expect(result.aiPowered).toBe(true);
      expect(result.analysis_id).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.skillsAnalysis).toBeDefined();
      expect(result.skillsAnalysis.skills).toHaveLength(1);
      expect(result.skillsAnalysis.skills[0].name).toBe('JavaScript');
      
      expect(result.skillsGap).toBeDefined();
      expect(result.skillsGap!.overallMatch).toBe(85);
      expect(result.skillsGap!.missingSkills).toHaveLength(1);
      
      expect(result.careerSuggestions).toBeDefined();
      expect(result.careerSuggestions!.suggestions).toHaveLength(1);
      
      expect(result.learningPlan).toBeDefined();
      expect(result.marketInsights).toBeDefined();
      expect(result.competitiveAdvantage).toBeDefined();
      
      expect(result.metadata.aiProvider).toBe('deepseek');
      expect(result.metadata.fallbackUsed).toBe(false);
      
      // Verify AI was called for all three operations
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it('should perform CV-only analysis without job description', async () => {
      const cvContent = 'Test CV content';

      const result = await service.analyzeCV(cvContent, undefined, {
        includeSkillsGap: false,
        includeCareerSuggestions: false,
        includeIndustryTrends: true
      });

      expect(result.aiPowered).toBe(true);
      expect(result.skillsAnalysis).toBeDefined();
      expect(result.skillsGap).toBeUndefined();
      expect(result.careerSuggestions).toBeUndefined();
      
      // Only skills extraction should be called
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('should include industry trends when requested', async () => {
      const cvContent = 'Test CV content';

      const result = await service.analyzeCV(cvContent, undefined, {
        includeSkillsGap: false,
        includeCareerSuggestions: false,
        includeIndustryTrends: true
      });

      expect(result.industryTrends).toBeDefined();
      expect(result.industryTrends!.trends).toHaveLength(1);
      expect(result.industryTrends!.trends[0].skill).toBe('JavaScript');
    });

    it('should handle partial analysis options', async () => {
      const cvContent = 'Test CV content';
      const jobContent = 'Test job description';

      const result = await service.analyzeCV(cvContent, jobContent, {
        includeSkillsGap: true,
        includeCareerSuggestions: false,
        includeIndustryTrends: false
      });

      expect(result.skillsGap).toBeDefined();
      expect(result.careerSuggestions).toBeUndefined();
      expect(result.industryTrends).toBeUndefined();
    });
  });

  describe('Fallback to Rule-Based Analysis', () => {
    beforeEach(() => {
      service = new AIAnalysisService(mockEnvWithoutAI);
    });

    it('should use rule-based analysis when AI is not available', async () => {
      const cvContent = `
        Software Engineer with JavaScript and React experience.
        5 years of web development experience.
        Bachelor's degree in Computer Science.
      `;

      const result = await service.analyzeCV(cvContent, undefined, {
        includeSkillsGap: false,
        includeCareerSuggestions: false,
        includeIndustryTrends: false
      });

      expect(result.aiPowered).toBe(false);
      expect(result.metadata.fallbackUsed).toBe(true);
      expect(result.skillsAnalysis).toBeDefined();
      expect(result.skillsAnalysis.skills.length).toBeGreaterThan(0);
    });

    it('should extract basic skills using rule-based approach', async () => {
      const cvContent = `
        Experienced JavaScript developer with React and Node.js skills.
        3 years of Python experience.
        AWS certified professional.
      `;

      const result = await service.analyzeCV(cvContent, undefined, {
        includeSkillsGap: false,
        includeCareerSuggestions: false,
        includeIndustryTrends: false
      });

      expect(result.skillsAnalysis.skills).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: expect.stringContaining('Javascript') }),
          expect.objectContaining({ name: expect.stringContaining('React') }),
          expect.objectContaining({ name: expect.stringContaining('Python') })
        ])
      );
    });
  });

  describe('AI Failure Handling', () => {
    beforeEach(() => {
      service = new AIAnalysisService(mockEnv);
    });

    it('should fallback to rule-based analysis when AI fails', async () => {
      fetchMock.mockRejectedValue(new Error('AI API Error'));

      const cvContent = 'Test CV content with JavaScript and React';

      const result = await service.analyzeCV(cvContent, undefined, {
        includeSkillsGap: false,
        includeCareerSuggestions: false,
        includeIndustryTrends: false
      });

      expect(result.aiPowered).toBe(false);
      expect(result.metadata.fallbackUsed).toBe(true);
      expect(result.skillsAnalysis).toBeDefined();
    });

    it('should handle AI timeout gracefully', async () => {
      fetchMock.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('timeout')), 100)
        )
      );

      const cvContent = 'Test CV content';

      const result = await service.analyzeCV(cvContent, undefined, {
        includeSkillsGap: false,
        includeCareerSuggestions: false,
        includeIndustryTrends: false
      });

      expect(result.aiPowered).toBe(false);
      expect(result.metadata.fallbackUsed).toBe(true);
    });
  });

  describe('Health Check', () => {
    it('should report healthy when AI is working', async () => {
      service = new AIAnalysisService(mockEnv);
      
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({
          choices: [{
            message: {
              content: JSON.stringify({ status: 'ok', message: 'AI service is working' })
            }
          }]
        }))
      );

      const isHealthy = await service.isAIHealthy();
      expect(isHealthy).toBe(true);
    });

    it('should report unhealthy when AI is not available', async () => {
      service = new AIAnalysisService(mockEnvWithoutAI);
      
      const isHealthy = await service.isAIHealthy();
      expect(isHealthy).toBe(false);
    });

    it('should report unhealthy when AI fails', async () => {
      service = new AIAnalysisService(mockEnv);
      
      fetchMock.mockRejectedValueOnce(new Error('AI Error'));

      const isHealthy = await service.isAIHealthy();
      expect(isHealthy).toBe(false);
    });
  });

  describe('Performance and Metrics', () => {
    beforeEach(() => {
      service = new AIAnalysisService(mockEnv);
      
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({
          choices: [{ message: { content: JSON.stringify(mockSkillsAnalysis) } }],
          usage: { total_tokens: 1500 }
        }))
      );
    });

    it('should track processing time', async () => {
      const cvContent = 'Test CV content';

      const result = await service.analyzeCV(cvContent, undefined, {
        includeSkillsGap: false,
        includeCareerSuggestions: false,
        includeIndustryTrends: false
      });

      expect(result.metadata.processingTime).toBeGreaterThan(0);
      expect(typeof result.metadata.processingTime).toBe('number');
    });

    it('should include analysis options in metadata', async () => {
      const cvContent = 'Test CV content';
      const options = {
        includeSkillsGap: true,
        includeCareerSuggestions: false,
        includeIndustryTrends: true
      };

      const result = await service.analyzeCV(cvContent, undefined, options);

      expect(result.metadata.analysisOptions).toEqual(options);
    });

    it('should generate unique analysis IDs', async () => {
      const cvContent = 'Test CV content';

      const result1 = await service.analyzeCV(cvContent, undefined, {
        includeSkillsGap: false,
        includeCareerSuggestions: false,
        includeIndustryTrends: false
      });

      const result2 = await service.analyzeCV(cvContent, undefined, {
        includeSkillsGap: false,
        includeCareerSuggestions: false,
        includeIndustryTrends: false
      });

      expect(result1.analysis_id).not.toBe(result2.analysis_id);
    });
  });
});