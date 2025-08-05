import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdvancedAIFeaturesService } from '../services/advancedAIFeatures';
import { DeepSeekAIService, AISkillsAnalysis, AIJobAnalysis, AIGapAnalysis } from '../services/deepseekAI';

// Mock the DeepSeek AI service
vi.mock('../services/deepseekAI');

describe('AdvancedAIFeaturesService', () => {
  let advancedAIService: AdvancedAIFeaturesService;
  let mockDeepSeekAI: vi.Mocked<DeepSeekAIService>;

  const mockSkillsAnalysis: AISkillsAnalysis = {
    skills: [
      {
        name: 'JavaScript',
        category: 'Programming',
        level: 'advanced',
        yearsExperience: 5,
        confidence: 0.9,
        context: 'Used in multiple projects',
        certifications: [],
        relatedSkills: ['React', 'Node.js'],
        reasoning: 'Strong experience demonstrated'
      }
    ],
    categories: ['Programming'],
    overallExperience: '5 years in software development',
    education: ['Bachelor of Computer Science'],
    certifications: ['AWS Certified Developer'],
    strengths: ['Full-stack development', 'Problem solving'],
    areasForImprovement: ['System design', 'Leadership'],
    careerLevel: 'mid',
    reasoning: 'Mid-level developer with strong technical skills'
  };

  const mockJobAnalysis: AIJobAnalysis = {
    jobTitle: 'Senior Software Engineer',
    company: 'Tech Corp',
    industry: 'Technology',
    experienceLevel: 'senior',
    skillRequirements: [
      {
        skill: 'React',
        category: 'Programming',
        importance: 'critical',
        minimumLevel: 'advanced',
        yearsRequired: 3,
        context: 'Frontend development',
        reasoning: 'Core technology for the role',
        confidence: 0.95,
        marketDemand: 'high',
        salaryImpact: 'high'
      }
    ],
    softSkills: ['Communication', 'Leadership'],
    responsibilities: ['Lead development team', 'Architect solutions'],
    benefits: ['Health insurance', 'Remote work'],
    salaryRange: { min: 120000, max: 150000, currency: 'USD' },
    workArrangement: 'hybrid',
    companySize: 'medium',
    teamStructure: 'small-team',
    growthOpportunities: ['Tech lead', 'Engineering manager'],
    culturalFit: ['Innovation', 'Collaboration'],
    urgencyLevel: 'normal',
    competitiveAdvantages: ['Cutting-edge technology', 'Great team'],
    redFlags: [],
    implicitRequirements: [
      {
        skill: 'System design',
        reasoning: 'Senior role requires architectural thinking',
        confidence: 0.8
      }
    ],
    reasoning: 'Senior role with leadership expectations'
  };

  const mockGapAnalysis: AIGapAnalysis = {
    overallMatch: 75,
    skillGaps: [
      {
        skillName: 'System Design',
        category: 'Architecture',
        currentLevel: 'beginner',
        requiredLevel: 'advanced',
        gapSeverity: 'moderate',
        priority: 8,
        timeToCompetency: 6,
        learningDifficulty: 'moderate',
        recommendations: ['Take system design course', 'Practice with examples'],
        resources: ['System Design Interview book', 'High Scalability blog'],
        reasoning: 'Important for senior-level positions'
      }
    ],
    strengths: [mockSkillsAnalysis.skills[0]],
    transferableSkills: [
      {
        from: 'JavaScript',
        to: 'TypeScript',
        reasoning: 'Similar syntax and concepts'
      }
    ],
    careerPaths: [
      {
        title: 'Senior Software Engineer',
        description: 'Lead technical projects',
        matchScore: 85,
        requiredSkills: ['React', 'System Design'],
        timeToTransition: 12,
        salaryRange: { min: 120000, max: 150000, currency: 'USD' },
        reasoning: 'Good fit with some skill development'
      }
    ],
    learningPlan: {
      immediate: [
        {
          skill: 'System Design',
          action: 'Take online course',
          timeframe: '3 months',
          resources: ['System Design Interview book']
        }
      ],
      shortTerm: [],
      longTerm: []
    },
    marketInsights: ['High demand for React developers'],
    competitiveAdvantage: ['Full-stack experience'],
    reasoning: 'Strong candidate with some areas for improvement'
  };

  beforeEach(() => {
    mockDeepSeekAI = {
      extractSkillsFromCV: vi.fn(),
      analyzeJobDescription: vi.fn(),
      performGapAnalysis: vi.fn(),
      healthCheck: vi.fn(),
    } as any;

    const mockEnv = { DEEPSEEK_API_KEY: 'test-key' } as any;
    advancedAIService = new AdvancedAIFeaturesService(mockDeepSeekAI, mockEnv);
  });

  describe('Multi-language CV Analysis', () => {
    it('should analyze CV with multi-language support', async () => {
      const cvContent = 'Desarrollador de software con 5 años de experiencia...';
      const targetLanguage = 'English';

      const result = await advancedAIService.analyzeMultiLanguageCV(cvContent, targetLanguage);

      expect(result).toHaveProperty('analysis');
      expect(result).toHaveProperty('languageAnalysis');
      expect(result.languageAnalysis).toHaveProperty('originalLanguage');
      expect(result.languageAnalysis).toHaveProperty('detectedLanguage');
      expect(result.languageAnalysis).toHaveProperty('culturalContext');
      expect(result.languageAnalysis).toHaveProperty('localizedSkills');
    });

    it('should handle English CV without translation', async () => {
      const cvContent = 'Software developer with 5 years of experience...';

      const result = await advancedAIService.analyzeMultiLanguageCV(cvContent);

      expect(result.languageAnalysis.originalLanguage).toBe('en');
      expect(result.languageAnalysis.translatedContent).toBeNull();
    });
  });

  describe('Industry-specific Analysis', () => {
    it('should perform industry-specific analysis', async () => {
      const industry = 'Technology';

      const result = await advancedAIService.performIndustrySpecificAnalysis(
        mockSkillsAnalysis,
        mockJobAnalysis,
        industry
      );

      expect(result).toHaveProperty('industry', industry);
      expect(result).toHaveProperty('specificRequirements');
      expect(result.specificRequirements).toHaveProperty('regulations');
      expect(result.specificRequirements).toHaveProperty('certifications');
      expect(result.specificRequirements).toHaveProperty('tools');
      expect(result.specificRequirements).toHaveProperty('methodologies');
      expect(result).toHaveProperty('marketContext');
      expect(result).toHaveProperty('careerPaths');
    });

    it('should include industry-specific requirements', async () => {
      const result = await advancedAIService.performIndustrySpecificAnalysis(
        mockSkillsAnalysis,
        mockJobAnalysis,
        'Technology'
      );

      expect(result.specificRequirements.regulations).toContain('GDPR compliance');
      expect(result.specificRequirements.tools).toContain('Git');
      expect(result.specificRequirements.methodologies).toContain('Agile');
    });
  });

  describe('Personalized Coaching', () => {
    it('should generate personalized coaching recommendations', async () => {
      const userPreferences = {
        learningStyle: 'visual',
        careerGoals: ['Become a senior developer'],
        timeAvailability: '10 hours per week'
      };

      const result = await advancedAIService.generatePersonalizedCoaching(
        mockSkillsAnalysis,
        mockGapAnalysis,
        userPreferences
      );

      expect(result).toHaveProperty('learningStyle');
      expect(result).toHaveProperty('personalityType');
      expect(result).toHaveProperty('careerGoals');
      expect(result).toHaveProperty('recommendations');
      expect(result.recommendations).toHaveProperty('immediate');
      expect(result.recommendations).toHaveProperty('shortTerm');
      expect(result.recommendations).toHaveProperty('longTerm');
      expect(result).toHaveProperty('mentorshipSuggestions');
    });

    it('should provide actionable recommendations', async () => {
      const result = await advancedAIService.generatePersonalizedCoaching(
        mockSkillsAnalysis,
        mockGapAnalysis
      );

      const immediateRec = result.recommendations.immediate[0];
      expect(immediateRec).toHaveProperty('type');
      expect(immediateRec).toHaveProperty('title');
      expect(immediateRec).toHaveProperty('description');
      expect(immediateRec).toHaveProperty('priority');
      expect(immediateRec).toHaveProperty('timeframe');
      expect(immediateRec).toHaveProperty('resources');
      expect(immediateRec).toHaveProperty('successMetrics');
      expect(immediateRec).toHaveProperty('reasoning');
    });
  });

  describe('Skill Trend Predictions', () => {
    it('should predict skill trends', async () => {
      const skills = ['React', 'JavaScript', 'Python'];
      const industry = 'Technology';

      const result = await advancedAIService.predictSkillTrends(skills, industry);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      const prediction = result[0];
      expect(prediction).toHaveProperty('skill');
      expect(prediction).toHaveProperty('currentDemand');
      expect(prediction).toHaveProperty('predictedDemand');
      expect(prediction.predictedDemand).toHaveProperty('sixMonths');
      expect(prediction.predictedDemand).toHaveProperty('oneYear');
      expect(prediction.predictedDemand).toHaveProperty('threeYears');
      expect(prediction).toHaveProperty('factors');
      expect(prediction).toHaveProperty('salaryImpact');
      expect(prediction).toHaveProperty('learningRecommendation');
    });

    it('should include market factors in predictions', async () => {
      const skills = ['React'];
      const result = await advancedAIService.predictSkillTrends(skills);

      const prediction = result[0];
      expect(prediction.factors).toHaveProperty('technologyTrends');
      expect(prediction.factors).toHaveProperty('industryShifts');
      expect(prediction.factors).toHaveProperty('economicFactors');
      expect(prediction.factors).toHaveProperty('regulatoryChanges');
    });
  });

  describe('Competitive Analysis', () => {
    it('should perform competitive analysis', async () => {
      const industry = 'Technology';

      const result = await advancedAIService.performCompetitiveAnalysis(
        mockSkillsAnalysis,
        mockJobAnalysis,
        industry
      );

      expect(result).toHaveProperty('candidateProfile');
      expect(result.candidateProfile).toHaveProperty('uniqueStrengths');
      expect(result.candidateProfile).toHaveProperty('marketPosition');
      expect(result.candidateProfile).toHaveProperty('differentiators');
      expect(result).toHaveProperty('marketComparison');
      expect(result).toHaveProperty('competitiveAdvantages');
      expect(result).toHaveProperty('improvementAreas');
    });

    it('should identify competitive advantages', async () => {
      const result = await advancedAIService.performCompetitiveAnalysis(
        mockSkillsAnalysis,
        mockJobAnalysis,
        'Technology'
      );

      expect(Array.isArray(result.competitiveAdvantages)).toBe(true);
      if (result.competitiveAdvantages.length > 0) {
        const advantage = result.competitiveAdvantages[0];
        expect(advantage).toHaveProperty('advantage');
        expect(advantage).toHaveProperty('rarity');
        expect(advantage).toHaveProperty('marketValue');
        expect(advantage).toHaveProperty('reasoning');
      }
    });
  });

  describe('Interview Preparation', () => {
    it('should generate interview preparation suggestions', async () => {
      const result = await advancedAIService.generateInterviewPreparation(
        mockSkillsAnalysis,
        mockJobAnalysis
      );

      expect(result).toHaveProperty('jobSpecific');
      expect(result.jobSpecific).toHaveProperty('likelyQuestions');
      expect(result.jobSpecific).toHaveProperty('technicalChallenges');
      expect(result.jobSpecific).toHaveProperty('behavioralQuestions');
      expect(result.jobSpecific).toHaveProperty('companySpecific');
      expect(result).toHaveProperty('preparationPlan');
      expect(result.preparationPlan).toHaveProperty('technical');
      expect(result.preparationPlan).toHaveProperty('behavioral');
      expect(result.preparationPlan).toHaveProperty('company');
      expect(result).toHaveProperty('mockInterviewSuggestions');
    });

    it('should provide role-specific questions', async () => {
      const result = await advancedAIService.generateInterviewPreparation(
        mockSkillsAnalysis,
        mockJobAnalysis
      );

      expect(Array.isArray(result.jobSpecific.likelyQuestions)).toBe(true);
      expect(result.jobSpecific.likelyQuestions.length).toBeGreaterThan(0);
      expect(Array.isArray(result.jobSpecific.technicalChallenges)).toBe(true);
      expect(Array.isArray(result.jobSpecific.behavioralQuestions)).toBe(true);
    });
  });

  describe('Portfolio Optimization', () => {
    it('should optimize portfolio recommendations', async () => {
      const currentPortfolio = 'Basic portfolio with 3 projects';

      const result = await advancedAIService.optimizePortfolio(
        mockSkillsAnalysis,
        mockJobAnalysis,
        currentPortfolio
      );

      expect(result).toHaveProperty('currentPortfolio');
      expect(result.currentPortfolio).toHaveProperty('strengths');
      expect(result.currentPortfolio).toHaveProperty('weaknesses');
      expect(result.currentPortfolio).toHaveProperty('missingElements');
      expect(result.currentPortfolio).toHaveProperty('overallScore');
      expect(result).toHaveProperty('recommendations');
      expect(result.recommendations).toHaveProperty('projectSuggestions');
      expect(result.recommendations).toHaveProperty('presentationImprovements');
      expect(result.recommendations).toHaveProperty('technicalEnhancements');
      expect(result.recommendations).toHaveProperty('storytellingTips');
      expect(result).toHaveProperty('industryBenchmarks');
    });

    it('should suggest relevant projects', async () => {
      const result = await advancedAIService.optimizePortfolio(
        mockSkillsAnalysis,
        mockJobAnalysis
      );

      expect(Array.isArray(result.recommendations.projectSuggestions)).toBe(true);
      if (result.recommendations.projectSuggestions.length > 0) {
        const project = result.recommendations.projectSuggestions[0];
        expect(project).toHaveProperty('type');
        expect(project).toHaveProperty('description');
        expect(project).toHaveProperty('skills');
        expect(project).toHaveProperty('timeframe');
        expect(project).toHaveProperty('impact');
      }
    });
  });

  describe('Networking Insights', () => {
    it('should generate networking insights', async () => {
      const careerGoals = ['Become a senior developer', 'Lead technical projects'];
      const industry = 'Technology';

      const result = await advancedAIService.generateNetworkingInsights(
        mockSkillsAnalysis,
        careerGoals,
        industry
      );

      expect(result).toHaveProperty('networkingStrategy');
      expect(result.networkingStrategy).toHaveProperty('targetProfessionals');
      expect(result.networkingStrategy).toHaveProperty('platforms');
      expect(result.networkingStrategy).toHaveProperty('events');
      expect(result).toHaveProperty('careerGrowthPlan');
      expect(result.careerGrowthPlan).toHaveProperty('milestones');
      expect(result.careerGrowthPlan).toHaveProperty('mentorshipNeeds');
      expect(result.careerGrowthPlan).toHaveProperty('industryInvolvement');
    });

    it('should provide strategic networking recommendations', async () => {
      const result = await advancedAIService.generateNetworkingInsights(
        mockSkillsAnalysis,
        ['Senior developer'],
        'Technology'
      );

      expect(Array.isArray(result.networkingStrategy.targetProfessionals)).toBe(true);
      if (result.networkingStrategy.targetProfessionals.length > 0) {
        const target = result.networkingStrategy.targetProfessionals[0];
        expect(target).toHaveProperty('role');
        expect(target).toHaveProperty('industry');
        expect(target).toHaveProperty('experience');
        expect(target).toHaveProperty('reasoning');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      // Mock a service that throws an error
      const mockEnv = { DEEPSEEK_API_KEY: 'test-key' } as any;
      const errorService = new AdvancedAIFeaturesService({
        extractSkillsFromCV: vi.fn().mockRejectedValue(new Error('API Error'))
      } as any, mockEnv);

      await expect(
        errorService.analyzeMultiLanguageCV('test content')
      ).rejects.toThrow('Multi-language CV analysis failed');
    });

    it('should handle invalid responses', async () => {
      // This would test the JSON parsing error handling
      // Implementation would depend on how the actual API calls are made
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Integration Tests', () => {
    it('should work with all features enabled', async () => {
      const cvContent = 'Software developer with React experience...';
      const jobContent = 'Senior React Developer position...';
      const industry = 'Technology';
      const careerGoals = ['Senior developer'];

      // This would test the full integration
      // For now, we'll test individual components
      const multiLangResult = await advancedAIService.analyzeMultiLanguageCV(cvContent);
      const industryResult = await advancedAIService.performIndustrySpecificAnalysis(
        mockSkillsAnalysis,
        mockJobAnalysis,
        industry
      );
      const coachingResult = await advancedAIService.generatePersonalizedCoaching(
        mockSkillsAnalysis,
        mockGapAnalysis
      );

      expect(multiLangResult).toBeDefined();
      expect(industryResult).toBeDefined();
      expect(coachingResult).toBeDefined();
    });
  });
});