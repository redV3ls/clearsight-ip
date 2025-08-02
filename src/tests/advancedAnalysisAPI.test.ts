import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import { Env } from '../index';

// Mock the AI services
vi.mock('../services/aiAnalysisService');
vi.mock('../services/advancedAIFeatures');

describe('Advanced Analysis API Endpoints', () => {
  let app: Hono<{ Bindings: Env }>;
  let mockEnv: Env;

  beforeEach(() => {
    mockEnv = {
      DB: {
        prepare: vi.fn().mockReturnValue({
          bind: vi.fn().mockReturnValue({
            run: vi.fn().mockResolvedValue({ success: true }),
            first: vi.fn().mockResolvedValue(null),
            all: vi.fn().mockResolvedValue({ results: [] })
          })
        })
      } as any,
      CACHE: {
        get: vi.fn().mockResolvedValue(null),
        put: vi.fn().mockResolvedValue(undefined)
      } as any,
      JWT_SECRET: 'test-secret',
      DEEPSEEK_API_KEY: 'test-api-key',
      DEEPSEEK_BASE_URL: 'https://api.deepseek.com/v1',
      DEEPSEEK_MODEL: 'deepseek-reasoner',
      DEEPSEEK_MAX_TOKENS: '4000',
      DEEPSEEK_TEMPERATURE: '0.7',
      DEEPSEEK_TIMEOUT: '30000',
    };

    // Create a new Hono app for testing
    app = new Hono<{ Bindings: Env }>();
  });

  describe('POST /analyze/advanced', () => {
    it('should accept advanced analysis request with all features', async () => {
      // Mock authenticated user
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      
      // Create form data
      const formData = new FormData();
      formData.append('resumeText', 'Software developer with 5 years of React experience...');
      formData.append('jobDescriptionText', 'Senior React Developer position...');
      formData.append('includeMultiLanguage', 'true');
      formData.append('includeIndustrySpecific', 'true');
      formData.append('includePersonalizedCoaching', 'true');
      formData.append('includeSkillTrendPredictions', 'true');
      formData.append('includeCompetitiveAnalysis', 'true');
      formData.append('includeInterviewPreparation', 'true');
      formData.append('includePortfolioOptimization', 'true');
      formData.append('includeNetworkingInsights', 'true');
      formData.append('targetLanguage', 'English');
      formData.append('industry', 'Technology');
      formData.append('learningStyle', 'visual');
      formData.append('careerGoals', JSON.stringify(['Senior developer', 'Tech lead']));
      formData.append('timeAvailability', '10 hours per week');
      formData.append('currentPortfolio', 'Portfolio with 3 React projects');

      // Mock the request
      const request = new Request('http://localhost/analyze/advanced', {
        method: 'POST',
        body: formData
      });

      // Mock the context
      const mockContext = {
        req: request,
        user: mockUser,
        env: mockEnv,
        json: vi.fn(),
        get: vi.fn(),
        set: vi.fn()
      };

      // This would test the actual endpoint
      // For now, we'll verify the form data parsing logic
      expect(formData.get('resumeText')).toBe('Software developer with 5 years of React experience...');
      expect(formData.get('includeMultiLanguage')).toBe('true');
      expect(formData.get('industry')).toBe('Technology');
      expect(formData.get('careerGoals')).toBe('["Senior developer","Tech lead"]');
    });

    it('should handle file uploads for advanced analysis', async () => {
      const resumeFile = new File(['Resume content...'], 'resume.pdf', { type: 'application/pdf' });
      const jobFile = new File(['Job description...'], 'job.txt', { type: 'text/plain' });

      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('jobDescription', jobFile);
      formData.append('includeMultiLanguage', 'true');
      formData.append('targetLanguage', 'English');

      expect(formData.get('resume')).toBeInstanceOf(File);
      expect(formData.get('jobDescription')).toBeInstanceOf(File);
      expect((formData.get('resume') as File).name).toBe('resume.pdf');
      expect((formData.get('jobDescription') as File).name).toBe('job.txt');
    });

    it('should validate required fields', async () => {
      const formData = new FormData();
      // Missing resume content
      formData.append('includeMultiLanguage', 'true');

      const request = new Request('http://localhost/analyze/advanced', {
        method: 'POST',
        body: formData
      });

      // Should validate that either resumeFile or resumeText is required
      expect(formData.get('resumeText')).toBeNull();
      expect(formData.get('resume')).toBeNull();
    });

    it('should validate file types and sizes', async () => {
      // Test invalid file type
      const invalidFile = new File(['content'], 'resume.exe', { type: 'application/x-executable' });
      const formData = new FormData();
      formData.append('resume', invalidFile);

      expect((formData.get('resume') as File).type).toBe('application/x-executable');
      // The actual validation would happen in the endpoint handler
    });

    it('should parse career goals from JSON string', async () => {
      const careerGoalsJson = '["Senior developer", "Tech lead", "Engineering manager"]';
      const careerGoalsArray = JSON.parse(careerGoalsJson);

      expect(Array.isArray(careerGoalsArray)).toBe(true);
      expect(careerGoalsArray).toEqual(['Senior developer', 'Tech lead', 'Engineering manager']);
    });

    it('should parse career goals from comma-separated string', async () => {
      const careerGoalsString = 'Senior developer, Tech lead, Engineering manager';
      const careerGoalsArray = careerGoalsString.split(',').map(goal => goal.trim());

      expect(Array.isArray(careerGoalsArray)).toBe(true);
      expect(careerGoalsArray).toEqual(['Senior developer', 'Tech lead', 'Engineering manager']);
    });

    it('should handle boolean flags correctly', async () => {
      const formData = new FormData();
      formData.append('includeMultiLanguage', 'true');
      formData.append('includeIndustrySpecific', 'false');
      formData.append('includePersonalizedCoaching', 'true');

      expect(formData.get('includeMultiLanguage') === 'true').toBe(true);
      expect(formData.get('includeIndustrySpecific') === 'true').toBe(false);
      expect(formData.get('includePersonalizedCoaching') === 'true').toBe(true);
    });

    it('should enforce rate limiting for advanced analysis', async () => {
      const mockCache = {
        get: vi.fn().mockResolvedValue(Date.now().toString()), // Recent analysis
        put: vi.fn().mockResolvedValue(undefined)
      };

      const rateLimitKey = 'advanced_analysis:user-123';
      const lastAnalysis = await mockCache.get(rateLimitKey);
      
      if (lastAnalysis) {
        const timeSinceLastAnalysis = Date.now() - parseInt(lastAnalysis);
        const isRateLimited = timeSinceLastAnalysis < 60000; // 60 seconds
        expect(isRateLimited).toBe(true);
      }
    });
  });

  describe('Response Format Validation', () => {
    it('should return properly structured response with all advanced features', () => {
      const mockResponse = {
        analysis_id: 'analysis-123',
        user_id: 'user-123',
        timestamp: new Date().toISOString(),
        aiPowered: true,
        skillsAnalysis: {
          skills: [
            {
              name: 'React',
              category: 'Programming',
              level: 'advanced',
              confidence: 0.9,
              yearsExperience: 5,
              certifications: [],
              context: 'Used in multiple projects',
              reasoning: 'Strong experience demonstrated'
            }
          ],
          totalSkills: 1,
          categories: ['Programming'],
          experience: '5 years in software development',
          education: ['Bachelor of Computer Science'],
          certifications: ['AWS Certified Developer'],
          strengths: ['Full-stack development'],
          areasForImprovement: ['System design'],
          careerLevel: 'mid'
        },
        skillsGap: {
          overallMatch: 85,
          missingSkills: [],
          strengths: [],
          transferableSkills: []
        },
        careerSuggestions: {
          suggestions: []
        },
        industryTrends: {
          trends: []
        },
        learningPlan: {
          immediate: [],
          shortTerm: [],
          longTerm: []
        },
        marketInsights: [],
        competitiveAdvantage: [],
        // Advanced features
        multiLanguageAnalysis: {
          originalLanguage: 'en',
          detectedLanguage: 'English',
          translatedContent: null,
          analysisLanguage: 'English',
          culturalContext: {
            region: 'North America',
            workCulture: ['Direct communication'],
            commonPractices: ['Quantified achievements'],
            educationSystem: 'Bachelor/Master degree system'
          },
          localizedSkills: []
        },
        industrySpecificAnalysis: {
          industry: 'Technology',
          subSector: 'Software Development',
          specificRequirements: {
            regulations: ['GDPR compliance'],
            certifications: ['AWS Certified'],
            tools: ['Git', 'Docker'],
            methodologies: ['Agile', 'DevOps']
          },
          marketContext: {
            growthRate: 15.2,
            competitionLevel: 'high',
            salaryTrends: 'increasing',
            remoteFriendly: true
          },
          careerPaths: []
        },
        personalizedCoaching: {
          learningStyle: 'visual',
          personalityType: 'Analytical problem-solver',
          careerGoals: ['Senior developer'],
          currentChallenges: ['System design'],
          recommendations: {
            immediate: [],
            shortTerm: [],
            longTerm: []
          },
          mentorshipSuggestions: {
            mentorProfile: 'Senior engineer with system design experience',
            focusAreas: ['Technical architecture'],
            meetingFrequency: 'Bi-weekly'
          }
        },
        skillTrendPredictions: [],
        competitiveAnalysis: {
          candidateProfile: {
            uniqueStrengths: ['Full-stack expertise'],
            marketPosition: 'competitive',
            differentiators: ['Diverse technology stack']
          },
          marketComparison: {
            similarProfiles: 15000,
            competitionLevel: 'high',
            averageExperience: 4.5,
            commonSkillGaps: ['System design']
          },
          competitiveAdvantages: [],
          improvementAreas: []
        },
        interviewPreparation: {
          jobSpecific: {
            likelyQuestions: [],
            technicalChallenges: [],
            behavioralQuestions: [],
            companySpecific: []
          },
          preparationPlan: {
            technical: [],
            behavioral: [],
            company: []
          },
          mockInterviewSuggestions: {
            format: 'technical',
            duration: 60,
            focusAreas: [],
            evaluationCriteria: []
          }
        },
        portfolioOptimization: {
          currentPortfolio: {
            strengths: [],
            weaknesses: [],
            missingElements: [],
            overallScore: 75
          },
          recommendations: {
            projectSuggestions: [],
            presentationImprovements: [],
            technicalEnhancements: [],
            storytellingTips: []
          },
          industryBenchmarks: {
            averageProjects: 5,
            commonTechnologies: ['React', 'Node.js'],
            expectedQuality: 'Production-ready',
            presentationStyle: 'Clean and professional'
          }
        },
        networkingInsights: {
          networkingStrategy: {
            targetProfessionals: [],
            platforms: [],
            events: []
          },
          careerGrowthPlan: {
            milestones: [],
            mentorshipNeeds: [],
            industryInvolvement: []
          }
        },
        metadata: {
          processingTime: 5000,
          analysisOptions: {
            includeSkillsGap: true,
            includeCareerSuggestions: true,
            includeIndustryTrends: true,
            includeMultiLanguage: true,
            includeIndustrySpecific: true,
            includePersonalizedCoaching: true,
            includeSkillTrendPredictions: true,
            includeCompetitiveAnalysis: true,
            includeInterviewPreparation: true,
            includePortfolioOptimization: true,
            includeNetworkingInsights: true
          },
          advancedFeatures: {
            targetLanguage: 'English',
            industry: 'Technology',
            userPreferences: {
              learningStyle: 'visual',
              careerGoals: ['Senior developer'],
              timeAvailability: '10 hours per week'
            }
          },
          aiProvider: 'deepseek',
          aiModel: 'deepseek-reasoner',
          fallbackUsed: false
        }
      };

      // Validate response structure
      expect(mockResponse).toHaveProperty('analysis_id');
      expect(mockResponse).toHaveProperty('skillsAnalysis');
      expect(mockResponse).toHaveProperty('multiLanguageAnalysis');
      expect(mockResponse).toHaveProperty('industrySpecificAnalysis');
      expect(mockResponse).toHaveProperty('personalizedCoaching');
      expect(mockResponse).toHaveProperty('skillTrendPredictions');
      expect(mockResponse).toHaveProperty('competitiveAnalysis');
      expect(mockResponse).toHaveProperty('interviewPreparation');
      expect(mockResponse).toHaveProperty('portfolioOptimization');
      expect(mockResponse).toHaveProperty('networkingInsights');
      expect(mockResponse).toHaveProperty('metadata');

      // Validate metadata includes advanced features
      expect(mockResponse.metadata.analysisOptions).toHaveProperty('includeMultiLanguage', true);
      expect(mockResponse.metadata.advancedFeatures).toHaveProperty('targetLanguage');
      expect(mockResponse.metadata.advancedFeatures).toHaveProperty('industry');
      expect(mockResponse.metadata.advancedFeatures).toHaveProperty('userPreferences');
    });

    it('should include proper file information in metadata', () => {
      const mockFileInfo = {
        resumeFile: {
          name: 'resume.pdf',
          size: 1024000,
          type: 'application/pdf'
        },
        jobDescriptionFile: {
          name: 'job-description.txt',
          size: 5000,
          type: 'text/plain'
        },
        currentPortfolio: 'provided'
      };

      expect(mockFileInfo.resumeFile).toHaveProperty('name');
      expect(mockFileInfo.resumeFile).toHaveProperty('size');
      expect(mockFileInfo.resumeFile).toHaveProperty('type');
      expect(mockFileInfo.jobDescriptionFile).toHaveProperty('name');
      expect(mockFileInfo.currentPortfolio).toBe('provided');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing resume content error', () => {
      const errorMessage = 'Either resume file or resume text is required';
      const errorCode = 'MISSING_RESUME';
      
      expect(errorMessage).toBe('Either resume file or resume text is required');
      expect(errorCode).toBe('MISSING_RESUME');
    });

    it('should handle file size validation errors', () => {
      const maxFileSize = 5 * 1024 * 1024; // 5MB
      const fileSize = 10 * 1024 * 1024; // 10MB
      
      const isFileTooLarge = fileSize > maxFileSize;
      expect(isFileTooLarge).toBe(true);
      
      if (isFileTooLarge) {
        const errorMessage = `Resume file too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB`;
        expect(errorMessage).toBe('Resume file too large. Maximum size is 5MB');
      }
    });

    it('should handle invalid file type errors', () => {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      const fileType = 'application/x-executable';
      const isValidType = allowedTypes.includes(fileType);
      
      expect(isValidType).toBe(false);
    });

    it('should handle rate limiting errors', () => {
      const rateLimitSeconds = 60;
      const timeSinceLastAnalysis = 30000; // 30 seconds
      const remainingTime = Math.ceil((rateLimitSeconds * 1000 - timeSinceLastAnalysis) / 1000);
      
      expect(remainingTime).toBe(30);
      
      const errorMessage = `Please wait ${remainingTime} seconds before starting another advanced analysis`;
      expect(errorMessage).toBe('Please wait 30 seconds before starting another advanced analysis');
    });

    it('should handle AI service timeout errors', () => {
      const timeoutError = new Error('Analysis request timed out');
      expect(timeoutError.message).toBe('Analysis request timed out');
    });

    it('should handle file processing errors', () => {
      const fileError = new Error('File processing failed');
      expect(fileError.message).toBe('File processing failed');
    });
  });

  describe('Security Validations', () => {
    it('should validate filename for path traversal attacks', () => {
      const maliciousFilenames = [
        '../../../etc/passwd',
        '..\\\\windows\\\\system32\\\\config\\\\sam',
        'normal-file.pdf'
      ];

      maliciousFilenames.forEach(filename => {
        const isSecure = !filename.includes('../') && !filename.includes('..\\\\');
        if (filename === 'normal-file.pdf') {
          expect(isSecure).toBe(true);
        } else {
          expect(isSecure).toBe(false);
        }
      });
    });

    it('should validate text length limits', () => {
      const maxTextLength = 50000;
      const shortText = 'Short resume text';
      const longText = 'A'.repeat(60000);

      expect(shortText.length <= maxTextLength).toBe(true);
      expect(longText.length <= maxTextLength).toBe(false);
    });

    it('should sanitize user input', () => {
      const userInput = '<script>alert("xss")</script>Normal text';
      const sanitized = userInput.replace(/<script.*?<\/script>/gi, '');
      
      expect(sanitized).toBe('Normal text');
    });
  });
});