import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AIAnalysisService } from '../services/aiAnalysisService';
import { DeepSeekAIService } from '../services/deepseekAI';
import { createAIConfig, validateAIConfig } from '../config/ai';

// Test environment with AI configuration
const testEnv = {
  DEEPSEEK_API_KEY: 'test-api-key-for-integration',
  DEEPSEEK_BASE_URL: 'https://api.deepseek.com/v1',
  DEEPSEEK_MODEL: 'deepseek-reasoner',
  AI_MAX_TOKENS: '4000',
  AI_TEMPERATURE: '0.1',
  AI_TIMEOUT: '30000'
};

// Real-world test data
const sampleCV = `
John Doe
Senior Software Engineer

EXPERIENCE:
Software Engineer at TechCorp (2019-2024)
- Developed web applications using JavaScript, React, and Node.js
- Led a team of 3 junior developers
- Implemented CI/CD pipelines using Docker and AWS
- Built RESTful APIs serving 100k+ daily requests
- Collaborated with product managers and designers

Junior Developer at StartupXYZ (2017-2019)
- Built frontend components using React and TypeScript
- Worked with PostgreSQL databases
- Participated in agile development processes

EDUCATION:
Bachelor of Science in Computer Science
University of Technology (2013-2017)

SKILLS:
- Programming: JavaScript, TypeScript, Python, Java
- Frontend: React, Vue.js, HTML5, CSS3, Sass
- Backend: Node.js, Express, Django, Spring Boot
- Databases: PostgreSQL, MongoDB, Redis
- Cloud: AWS (EC2, S3, Lambda), Docker, Kubernetes
- Tools: Git, Jenkins, Jira, Figma

CERTIFICATIONS:
- AWS Certified Solutions Architect
- Certified Scrum Master
`;

const sampleJobDescription = `
Senior Full Stack Developer - Remote
TechInnovate Inc.

We are seeking a Senior Full Stack Developer to join our growing engineering team. 
You will be responsible for building scalable web applications and leading technical initiatives.

REQUIREMENTS:
- 5+ years of software development experience
- Expert-level JavaScript and TypeScript skills
- Strong experience with React and modern frontend frameworks
- Backend development experience with Node.js or Python
- Experience with cloud platforms (AWS preferred)
- Database design and optimization skills
- Leadership and mentoring experience
- Strong communication and collaboration skills

PREFERRED QUALIFICATIONS:
- Experience with microservices architecture
- Knowledge of DevOps practices and CI/CD
- Experience with containerization (Docker, Kubernetes)
- GraphQL and API design experience
- Agile/Scrum methodology experience

RESPONSIBILITIES:
- Design and develop full-stack web applications
- Lead technical architecture decisions
- Mentor junior developers
- Collaborate with cross-functional teams
- Participate in code reviews and technical discussions
- Contribute to engineering best practices

BENEFITS:
- Competitive salary: $130,000 - $170,000
- Fully remote work
- Health, dental, and vision insurance
- 401(k) with company matching
- Professional development budget
- Flexible PTO policy

COMPANY:
TechInnovate Inc. is a fast-growing SaaS company focused on business automation tools.
We serve over 10,000 customers worldwide and are backed by top-tier investors.
`;

describe('AI Analysis Pipeline Integration Tests', () => {
  let aiService: AIAnalysisService;
  let fetchMock: any;

  beforeEach(() => {
    fetchMock = vi.spyOn(global, 'fetch');
    aiService = new AIAnalysisService(testEnv);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Configuration and Setup', () => {
    it('should validate AI configuration correctly', () => {
      const config = createAIConfig(testEnv);
      const validation = validateAIConfig(config);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect invalid configuration', () => {
      const invalidEnv = { ...testEnv, DEEPSEEK_API_KEY: '' };
      const config = createAIConfig(invalidEnv);
      const validation = validateAIConfig(config);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('DEEPSEEK_API_KEY is required');
    });

    it('should initialize AI service with proper configuration', () => {
      const status = aiService.getAIStatus();
      
      expect(status.enabled).toBe(true);
      expect(status.provider).toBe('deepseek');
      expect(status.model).toBe('deepseek-reasoner');
    });
  });

  describe('End-to-End Analysis Pipeline', () => {
    beforeEach(() => {
      // Mock comprehensive AI responses for full pipeline test
      fetchMock.mockImplementation(async (url, options) => {
        const body = JSON.parse(options?.body as string);
        const prompt = body.messages[1].content;

        // Skills extraction response
        if (prompt.includes('CV/resume text')) {
          return new Response(JSON.stringify({
            choices: [{
              message: {
                content: JSON.stringify({
                  skills: [
                    {
                      name: 'JavaScript',
                      category: 'Programming',
                      level: 'expert',
                      yearsExperience: 7,
                      confidence: 0.95,
                      context: 'Used extensively in multiple roles',
                      certifications: [],
                      relatedSkills: ['TypeScript', 'React', 'Node.js'],
                      reasoning: 'Strong evidence across work history'
                    },
                    {
                      name: 'React',
                      category: 'Programming',
                      level: 'expert',
                      yearsExperience: 5,
                      confidence: 0.9,
                      context: 'Frontend framework expertise',
                      certifications: [],
                      relatedSkills: ['JavaScript', 'HTML', 'CSS'],
                      reasoning: 'Multiple projects and leadership experience'
                    },
                    {
                      name: 'AWS',
                      category: 'Cloud',
                      level: 'advanced',
                      yearsExperience: 4,
                      confidence: 0.85,
                      context: 'Cloud infrastructure and CI/CD',
                      certifications: ['AWS Certified Solutions Architect'],
                      relatedSkills: ['Docker', 'Kubernetes'],
                      reasoning: 'Certification and practical experience'
                    },
                    {
                      name: 'Leadership',
                      category: 'Management',
                      level: 'intermediate',
                      yearsExperience: 3,
                      confidence: 0.8,
                      context: 'Led team of 3 junior developers',
                      certifications: ['Certified Scrum Master'],
                      relatedSkills: ['Communication', 'Mentoring'],
                      reasoning: 'Team leadership and scrum certification'
                    }
                  ],
                  categories: ['Programming', 'Cloud', 'Management'],
                  overallExperience: 'Senior level with 7+ years experience',
                  education: ['Bachelor of Science in Computer Science'],
                  certifications: ['AWS Certified Solutions Architect', 'Certified Scrum Master'],
                  strengths: ['Full-stack development', 'Cloud architecture', 'Team leadership'],
                  areasForImprovement: ['System design at scale', 'Advanced DevOps practices'],
                  careerLevel: 'senior',
                  reasoning: 'Comprehensive analysis showing senior-level expertise with leadership experience'
                })
              }
            }],
            usage: { total_tokens: 2500 }
          }));
        }

        // Job analysis response
        if (prompt.includes('job description')) {
          return new Response(JSON.stringify({
            choices: [{
              message: {
                content: JSON.stringify({
                  jobTitle: 'Senior Full Stack Developer',
                  company: 'TechInnovate Inc.',
                  industry: 'Technology',
                  experienceLevel: 'senior',
                  skillRequirements: [
                    {
                      skill: 'JavaScript',
                      category: 'Programming',
                      importance: 'critical',
                      minimumLevel: 'expert',
                      yearsRequired: 5,
                      context: 'Expert-level JavaScript skills required',
                      reasoning: 'Core technology for full-stack development',
                      confidence: 0.95,
                      marketDemand: 'high',
                      salaryImpact: 'high'
                    },
                    {
                      skill: 'React',
                      category: 'Programming',
                      importance: 'critical',
                      minimumLevel: 'advanced',
                      yearsRequired: 3,
                      context: 'Strong experience with React required',
                      reasoning: 'Primary frontend framework',
                      confidence: 0.9,
                      marketDemand: 'high',
                      salaryImpact: 'high'
                    },
                    {
                      skill: 'Microservices',
                      category: 'Architecture',
                      importance: 'important',
                      minimumLevel: 'intermediate',
                      context: 'Experience with microservices architecture',
                      reasoning: 'Preferred qualification for scalable systems',
                      confidence: 0.7,
                      marketDemand: 'medium',
                      salaryImpact: 'medium'
                    },
                    {
                      skill: 'Leadership',
                      category: 'Management',
                      importance: 'important',
                      minimumLevel: 'intermediate',
                      context: 'Leadership and mentoring experience',
                      reasoning: 'Required for senior role responsibilities',
                      confidence: 0.85,
                      marketDemand: 'high',
                      salaryImpact: 'high'
                    }
                  ],
                  softSkills: ['Communication', 'Collaboration', 'Problem Solving'],
                  responsibilities: ['Design full-stack applications', 'Lead technical decisions', 'Mentor developers'],
                  benefits: ['Remote work', 'Health insurance', '401k matching'],
                  salaryRange: { min: 130000, max: 170000, currency: 'USD' },
                  workArrangement: 'remote',
                  companySize: 'medium',
                  teamStructure: 'cross-functional',
                  growthOpportunities: ['Technical leadership', 'Architecture decisions'],
                  culturalFit: ['Innovation-focused', 'Collaborative environment'],
                  urgencyLevel: 'normal',
                  competitiveAdvantages: ['Remote work', 'Professional development budget'],
                  redFlags: [],
                  implicitRequirements: [
                    {
                      skill: 'System Design',
                      reasoning: 'Senior role implies system design capabilities',
                      confidence: 0.8
                    }
                  ],
                  reasoning: 'Comprehensive analysis of senior full-stack role with leadership responsibilities'
                })
              }
            }],
            usage: { total_tokens: 3000 }
          }));
        }

        // Gap analysis response
        if (prompt.includes('gap analysis')) {
          return new Response(JSON.stringify({
            choices: [{
              message: {
                content: JSON.stringify({
                  overallMatch: 88,
                  skillGaps: [
                    {
                      skillName: 'Microservices',
                      category: 'Architecture',
                      currentLevel: null,
                      requiredLevel: 'intermediate',
                      gapSeverity: 'moderate',
                      priority: 6,
                      timeToCompetency: 4,
                      learningDifficulty: 'moderate',
                      recommendations: ['Study microservices patterns', 'Build sample microservices project'],
                      resources: ['Microservices.io', 'Building Microservices book'],
                      reasoning: 'Important for scalable architecture but not currently demonstrated'
                    },
                    {
                      skillName: 'System Design',
                      category: 'Architecture',
                      currentLevel: 'beginner',
                      requiredLevel: 'intermediate',
                      gapSeverity: 'moderate',
                      priority: 7,
                      timeToCompetency: 6,
                      learningDifficulty: 'hard',
                      recommendations: ['Take system design course', 'Practice design interviews'],
                      resources: ['System Design Interview book', 'High Scalability blog'],
                      reasoning: 'Critical for senior role but needs development'
                    }
                  ],
                  strengths: [
                    {
                      name: 'JavaScript',
                      category: 'Programming',
                      level: 'expert',
                      yearsExperience: 7,
                      confidence: 0.95,
                      context: 'Strong foundation',
                      certifications: [],
                      relatedSkills: ['React', 'Node.js'],
                      reasoning: 'Exceeds job requirements significantly'
                    },
                    {
                      name: 'React',
                      category: 'Programming',
                      level: 'expert',
                      yearsExperience: 5,
                      confidence: 0.9,
                      context: 'Frontend expertise',
                      certifications: [],
                      relatedSkills: ['JavaScript'],
                      reasoning: 'Meets and exceeds requirements'
                    },
                    {
                      name: 'Leadership',
                      category: 'Management',
                      level: 'intermediate',
                      yearsExperience: 3,
                      confidence: 0.8,
                      context: 'Team leadership experience',
                      certifications: ['Certified Scrum Master'],
                      relatedSkills: ['Communication'],
                      reasoning: 'Matches job requirements well'
                    }
                  ],
                  transferableSkills: [
                    {
                      from: 'JavaScript',
                      to: 'TypeScript',
                      reasoning: 'Similar syntax and concepts, easy transition'
                    },
                    {
                      from: 'AWS',
                      to: 'Microservices',
                      reasoning: 'Cloud experience helps with distributed systems'
                    }
                  ],
                  careerPaths: [
                    {
                      title: 'Staff Engineer',
                      description: 'Technical leadership with system design focus',
                      matchScore: 82,
                      requiredSkills: ['System Design', 'Technical Leadership', 'Microservices'],
                      timeToTransition: 18,
                      salaryRange: { min: 180000, max: 230000, currency: 'USD' },
                      reasoning: 'Natural progression with additional architecture skills'
                    },
                    {
                      title: 'Engineering Manager',
                      description: 'People management with technical oversight',
                      matchScore: 75,
                      requiredSkills: ['People Management', 'Strategic Planning', 'Technical Vision'],
                      timeToTransition: 24,
                      salaryRange: { min: 160000, max: 200000, currency: 'USD' },
                      reasoning: 'Leadership experience provides good foundation'
                    }
                  ],
                  learningPlan: {
                    immediate: [
                      {
                        skill: 'Microservices',
                        action: 'Complete online course on microservices architecture',
                        timeframe: '2 months',
                        resources: ['Microservices.io tutorials', 'Spring Boot microservices course']
                      }
                    ],
                    shortTerm: [
                      {
                        skill: 'System Design',
                        action: 'Study system design patterns and practice problems',
                        timeframe: '6 months',
                        resources: ['System Design Interview book', 'Grokking System Design course']
                      }
                    ],
                    longTerm: [
                      {
                        skill: 'Technical Leadership',
                        action: 'Develop advanced leadership and architecture skills',
                        timeframe: '12 months',
                        resources: ['Staff Engineer book', 'Architecture decision records practice']
                      }
                    ]
                  },
                  marketInsights: [
                    'High demand for senior full-stack developers with leadership experience',
                    'Microservices and system design skills command premium salaries',
                    'Remote work opportunities are abundant in this field'
                  ],
                  competitiveAdvantage: [
                    'Strong JavaScript and React expertise',
                    'Proven leadership and team management experience',
                    'AWS certification demonstrates cloud competency'
                  ],
                  reasoning: 'Strong candidate with excellent technical foundation and leadership experience. Main gaps are in advanced architecture patterns which are learnable with focused effort.'
                })
              }
            }],
            usage: { total_tokens: 4000 }
          }));
        }

        return new Response(JSON.stringify({ error: 'Unknown prompt type' }), { status: 400 });
      });
    });

    it('should perform complete end-to-end analysis successfully', async () => {
      const result = await aiService.analyzeCV(sampleCV, sampleJobDescription, {
        includeSkillsGap: true,
        includeCareerSuggestions: true,
        includeIndustryTrends: true
      });

      // Verify basic structure
      expect(result.aiPowered).toBe(true);
      expect(result.analysis_id).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.user_id).toBe('current-user');

      // Verify skills analysis
      expect(result.skillsAnalysis).toBeDefined();
      expect(result.skillsAnalysis.skills).toHaveLength(4);
      expect(result.skillsAnalysis.totalSkills).toBe(4);
      expect(result.skillsAnalysis.categories).toContain('Programming');
      expect(result.skillsAnalysis.careerLevel).toBe('senior');

      // Verify gap analysis
      expect(result.skillsGap).toBeDefined();
      expect(result.skillsGap!.overallMatch).toBe(88);
      expect(result.skillsGap!.missingSkills).toHaveLength(2);
      expect(result.skillsGap!.strengths).toHaveLength(3);
      expect(result.skillsGap!.transferableSkills).toHaveLength(2);

      // Verify career suggestions
      expect(result.careerSuggestions).toBeDefined();
      expect(result.careerSuggestions!.suggestions).toHaveLength(2);
      expect(result.careerSuggestions!.suggestions[0].title).toBe('Staff Engineer');

      // Verify learning plan
      expect(result.learningPlan).toBeDefined();
      expect(result.learningPlan!.immediate).toHaveLength(1);
      expect(result.learningPlan!.shortTerm).toHaveLength(1);
      expect(result.learningPlan!.longTerm).toHaveLength(1);

      // Verify market insights
      expect(result.marketInsights).toBeDefined();
      expect(result.marketInsights!).toHaveLength(3);
      expect(result.competitiveAdvantage).toBeDefined();
      expect(result.competitiveAdvantage!).toHaveLength(3);

      // Verify metadata
      expect(result.metadata.aiProvider).toBe('deepseek');
      expect(result.metadata.aiModel).toBe('deepseek-reasoner');
      expect(result.metadata.fallbackUsed).toBe(false);
      expect(result.metadata.processingTime).toBeGreaterThan(0);

      // Verify all three AI calls were made
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it('should handle CV-only analysis correctly', async () => {
      const result = await aiService.analyzeCV(sampleCV, undefined, {
        includeSkillsGap: false,
        includeCareerSuggestions: false,
        includeIndustryTrends: true
      });

      expect(result.aiPowered).toBe(true);
      expect(result.skillsAnalysis).toBeDefined();
      expect(result.skillsGap).toBeUndefined();
      expect(result.careerSuggestions).toBeUndefined();
      expect(result.industryTrends).toBeDefined();

      // Only skills extraction should be called
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('should measure and report accurate processing times', async () => {
      const startTime = Date.now();
      
      const result = await aiService.analyzeCV(sampleCV, sampleJobDescription, {
        includeSkillsGap: true,
        includeCareerSuggestions: true,
        includeIndustryTrends: false
      });

      const endTime = Date.now();
      const actualTime = endTime - startTime;

      expect(result.metadata.processingTime).toBeGreaterThan(0);
      expect(result.metadata.processingTime).toBeLessThanOrEqual(actualTime + 100); // Allow small margin
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should gracefully handle AI service failures', async () => {
      fetchMock.mockRejectedValue(new Error('AI Service Unavailable'));

      const result = await aiService.analyzeCV(sampleCV, sampleJobDescription, {
        includeSkillsGap: true,
        includeCareerSuggestions: true,
        includeIndustryTrends: false
      });

      expect(result.aiPowered).toBe(false);
      expect(result.metadata.fallbackUsed).toBe(true);
      expect(result.skillsAnalysis).toBeDefined();
      expect(result.skillsAnalysis.skills.length).toBeGreaterThan(0);
    });

    it('should handle partial AI failures gracefully', async () => {
      let callCount = 0;
      fetchMock.mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          // Skills extraction succeeds
          return new Response(JSON.stringify({
            choices: [{ message: { content: JSON.stringify({
              skills: [{ name: 'JavaScript', category: 'Programming', level: 'advanced', yearsExperience: 5, confidence: 0.9, context: 'test', certifications: [], relatedSkills: [], reasoning: 'test' }],
              categories: ['Programming'],
              overallExperience: 'Senior',
              education: [],
              certifications: [],
              strengths: [],
              areasForImprovement: [],
              careerLevel: 'senior',
              reasoning: 'test'
            }) } }],
            usage: { total_tokens: 1000 }
          }));
        } else {
          // Subsequent calls fail
          throw new Error('AI Service Error');
        }
      });

      const result = await aiService.analyzeCV(sampleCV, sampleJobDescription, {
        includeSkillsGap: true,
        includeCareerSuggestions: true,
        includeIndustryTrends: false
      });

      expect(result.aiPowered).toBe(false);
      expect(result.metadata.fallbackUsed).toBe(true);
      expect(result.skillsAnalysis).toBeDefined();
    });

    it('should handle malformed AI responses', async () => {
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({
          choices: [{ message: { content: 'Invalid JSON response' } }]
        }))
      );

      const result = await aiService.analyzeCV(sampleCV, undefined, {
        includeSkillsGap: false,
        includeCareerSuggestions: false,
        includeIndustryTrends: false
      });

      expect(result.aiPowered).toBe(false);
      expect(result.metadata.fallbackUsed).toBe(true);
    });
  });

  describe('Performance Characteristics', () => {
    beforeEach(() => {
      // Mock fast AI responses
      fetchMock.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate 100ms response time
        return new Response(JSON.stringify({
          choices: [{ message: { content: JSON.stringify({
            skills: [],
            categories: [],
            overallExperience: 'test',
            education: [],
            certifications: [],
            strengths: [],
            areasForImprovement: [],
            careerLevel: 'mid',
            reasoning: 'test'
          }) } }],
          usage: { total_tokens: 500 }
        }));
      });
    });

    it('should complete analysis within reasonable time limits', async () => {
      const startTime = Date.now();
      
      await aiService.analyzeCV(sampleCV, undefined, {
        includeSkillsGap: false,
        includeCareerSuggestions: false,
        includeIndustryTrends: false
      });

      const processingTime = Date.now() - startTime;
      expect(processingTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle concurrent analysis requests', async () => {
      const promises = Array.from({ length: 3 }, () =>
        aiService.analyzeCV(sampleCV, undefined, {
          includeSkillsGap: false,
          includeCareerSuggestions: false,
          includeIndustryTrends: false
        })
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.analysis_id).toBeDefined();
        expect(result.skillsAnalysis).toBeDefined();
      });

      // Each request should have unique analysis ID
      const analysisIds = results.map(r => r.analysis_id);
      const uniqueIds = new Set(analysisIds);
      expect(uniqueIds.size).toBe(3);
    });
  });
});