import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DeepSeekAIService, AIConfig, AISkillsAnalysis, AIJobAnalysis, AIGapAnalysis } from '../services/deepseekAI';

// Mock configuration for testing
const mockConfig: AIConfig = {
  provider: 'deepseek',
  model: 'deepseek-reasoner',
  apiKey: 'test-api-key',
  baseUrl: 'https://api.deepseek.com/v1',
  maxTokens: 4000,
  temperature: 0.1,
  timeout: 30000
};

// Mock responses
const mockSkillsAnalysisResponse = {
  skills: [
    {
      name: 'JavaScript',
      category: 'Programming',
      level: 'advanced',
      yearsExperience: 5,
      confidence: 0.95,
      context: 'Used in multiple projects',
      certifications: [],
      relatedSkills: ['React', 'Node.js'],
      reasoning: 'Extensive experience shown in work history'
    },
    {
      name: 'React',
      category: 'Programming',
      level: 'advanced',
      yearsExperience: 3,
      confidence: 0.9,
      context: 'Frontend development',
      certifications: [],
      relatedSkills: ['JavaScript', 'HTML', 'CSS'],
      reasoning: 'Multiple React projects mentioned'
    }
  ],
  categories: ['Programming'],
  overallExperience: 'Senior level with 5+ years experience',
  education: ['Bachelor of Computer Science'],
  certifications: ['AWS Certified Developer'],
  strengths: ['Strong technical skills', 'Full-stack development'],
  areasForImprovement: ['Leadership skills', 'System design'],
  careerLevel: 'senior',
  reasoning: 'Analysis based on comprehensive skill set and experience level'
};

const mockJobAnalysisResponse = {
  jobTitle: 'Senior Software Engineer',
  company: 'TechCorp Inc.',
  industry: 'Technology',
  experienceLevel: 'senior',
  skillRequirements: [
    {
      skill: 'JavaScript',
      category: 'Programming',
      importance: 'critical',
      minimumLevel: 'advanced',
      yearsRequired: 5,
      context: 'Core technology for frontend development',
      reasoning: 'Primary requirement for the role',
      confidence: 0.95,
      marketDemand: 'high',
      salaryImpact: 'high'
    }
  ],
  softSkills: ['Communication', 'Team Leadership'],
  responsibilities: ['Develop web applications', 'Mentor junior developers'],
  benefits: ['Health Insurance', 'Remote Work'],
  salaryRange: { min: 120000, max: 160000, currency: 'USD' },
  workArrangement: 'hybrid',
  reasoning: 'Comprehensive analysis of job requirements and context'
};

const mockGapAnalysisResponse = {
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
      recommendations: ['Take system design course', 'Practice with design problems'],
      resources: ['System Design Interview book', 'Online courses'],
      reasoning: 'Important for senior role but not currently demonstrated'
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
      relatedSkills: ['React'],
      reasoning: 'Exceeds job requirements'
    }
  ],
  transferableSkills: [
    {
      from: 'JavaScript',
      to: 'TypeScript',
      reasoning: 'Similar syntax and concepts'
    }
  ],
  careerPaths: [
    {
      title: 'Staff Engineer',
      description: 'Technical leadership role',
      matchScore: 78,
      requiredSkills: ['System Design', 'Leadership'],
      timeToTransition: 18,
      salaryRange: { min: 180000, max: 220000, currency: 'USD' },
      reasoning: 'Natural progression with additional skills'
    }
  ],
  learningPlan: {
    immediate: [
      {
        skill: 'System Design',
        action: 'Complete online course',
        timeframe: '3 months',
        resources: ['Coursera System Design', 'Practice problems']
      }
    ],
    shortTerm: [],
    longTerm: []
  },
  marketInsights: ['High demand for senior engineers', 'System design skills are valuable'],
  competitiveAdvantage: ['Strong JavaScript expertise', 'Full-stack capabilities'],
  reasoning: 'Comprehensive gap analysis with actionable recommendations'
};

describe('DeepSeekAIService', () => {
  let service: DeepSeekAIService;
  let fetchMock: any;

  beforeEach(() => {
    service = new DeepSeekAIService(mockConfig);
    
    // Mock fetch globally
    fetchMock = vi.spyOn(global, 'fetch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Constructor and Configuration', () => {
    it('should initialize with valid configuration', () => {
      expect(service).toBeInstanceOf(DeepSeekAIService);
    });

    it('should store configuration correctly', () => {
      // Configuration is private, but we can test behavior
      expect(service).toBeDefined();
    });
  });

  describe('Skills Extraction', () => {
    it('should extract skills from CV text successfully', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify(mockSkillsAnalysisResponse)
          }
        }],
        usage: { total_tokens: 1500 }
      };

      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), { status: 200 })
      );

      const cvText = `
        Senior Software Engineer with 5 years of JavaScript experience.
        Proficient in React, Node.js, and modern web development.
        Bachelor's degree in Computer Science.
        AWS Certified Developer.
      `;

      const result = await service.extractSkillsFromCV(cvText);

      expect(result).toEqual(mockSkillsAnalysisResponse);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      
      // Verify API call structure
      const callArgs = fetchMock.mock.calls[0];
      expect(callArgs[0]).toBe('https://api.deepseek.com/v1/chat/completions');
      expect(callArgs[1].method).toBe('POST');
      
      const requestBody = JSON.parse(callArgs[1].body);
      expect(requestBody.model).toBe('deepseek-reasoner');
      expect(requestBody.messages).toHaveLength(2);
      expect(requestBody.messages[1].content).toContain(cvText);
    });

    it('should handle API errors gracefully', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      const cvText = 'Test CV content';

      await expect(service.extractSkillsFromCV(cvText)).rejects.toThrow('AI skills extraction failed');
    });

    it('should handle invalid JSON responses', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Invalid JSON response'
          }
        }]
      };

      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), { status: 200 })
      );

      const cvText = 'Test CV content';

      await expect(service.extractSkillsFromCV(cvText)).rejects.toThrow('Invalid AI response format');
    });

    it('should retry on failure', async () => {
      // First call fails, second succeeds
      fetchMock
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce(
          new Response(JSON.stringify({
            choices: [{ message: { content: JSON.stringify(mockSkillsAnalysisResponse) } }],
            usage: { total_tokens: 1500 }
          }), { status: 200 })
        );

      const cvText = 'Test CV content';
      const result = await service.extractSkillsFromCV(cvText);

      expect(result).toEqual(mockSkillsAnalysisResponse);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('Job Description Analysis', () => {
    it('should analyze job description successfully', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify(mockJobAnalysisResponse)
          }
        }],
        usage: { total_tokens: 2000 }
      };

      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), { status: 200 })
      );

      const jobText = `
        Senior Software Engineer at TechCorp Inc.
        5+ years JavaScript experience required.
        React and Node.js expertise preferred.
        Salary: $120,000 - $160,000
      `;

      const result = await service.analyzeJobDescription(jobText);

      expect(result).toEqual(mockJobAnalysisResponse);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      
      const callArgs = fetchMock.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);
      expect(requestBody.messages[1].content).toContain(jobText);
    });

    it('should handle job analysis errors', async () => {
      fetchMock.mockRejectedValueOnce(new Error('API error'));

      const jobText = 'Test job description';

      await expect(service.analyzeJobDescription(jobText)).rejects.toThrow('AI job analysis failed');
    });
  });

  describe('Gap Analysis', () => {
    it('should perform gap analysis successfully', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify(mockGapAnalysisResponse)
          }
        }],
        usage: { total_tokens: 3000 }
      };

      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), { status: 200 })
      );

      const result = await service.performGapAnalysis(
        mockSkillsAnalysisResponse as AISkillsAnalysis,
        mockJobAnalysisResponse as AIJobAnalysis
      );

      expect(result).toEqual(mockGapAnalysisResponse);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      
      const callArgs = fetchMock.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);
      expect(requestBody.messages[1].content).toContain('gap analysis');
    });

    it('should handle gap analysis errors', async () => {
      fetchMock.mockRejectedValueOnce(new Error('API error'));

      await expect(service.performGapAnalysis(
        mockSkillsAnalysisResponse as AISkillsAnalysis,
        mockJobAnalysisResponse as AIJobAnalysis
      )).rejects.toThrow('AI gap analysis failed');
    });
  });

  describe('Rate Limiting', () => {
    it('should implement rate limiting between calls', async () => {
      const mockResponse = {
        choices: [{ message: { content: JSON.stringify(mockSkillsAnalysisResponse) } }],
        usage: { total_tokens: 1000 }
      };

      fetchMock.mockResolvedValue(
        new Response(JSON.stringify(mockResponse), { status: 200 })
      );

      const startTime = Date.now();
      
      // Make two consecutive calls
      await service.extractSkillsFromCV('Test CV 1');
      await service.extractSkillsFromCV('Test CV 2');
      
      const endTime = Date.now();
      const timeDiff = endTime - startTime;
      
      // Should have some delay due to rate limiting (at least 1 second)
      expect(timeDiff).toBeGreaterThan(1000);
    });
  });

  describe('Health Check', () => {
    it('should return healthy status when API is working', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({ status: 'ok', message: 'AI service is working' })
          }
        }]
      };

      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), { status: 200 })
      );

      const result = await service.healthCheck();

      expect(result.status).toBe('healthy');
      expect(result.details).toBe('AI service is responding correctly');
    });

    it('should return unhealthy status when API fails', async () => {
      fetchMock.mockRejectedValueOnce(new Error('API down'));

      const result = await service.healthCheck();

      expect(result.status).toBe('unhealthy');
      expect(result.details).toContain('AI service error');
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP error responses', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response('Server Error', { status: 500 })
      );

      await expect(service.extractSkillsFromCV('test')).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      fetchMock.mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('timeout')), 100)
        )
      );

      await expect(service.extractSkillsFromCV('test')).rejects.toThrow();
    });

    it('should handle malformed API responses', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response('Not JSON', { status: 200 })
      );

      await expect(service.extractSkillsFromCV('test')).rejects.toThrow();
    });
  });
});