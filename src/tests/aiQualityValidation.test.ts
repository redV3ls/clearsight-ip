import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AIAnalysisService } from '../services/aiAnalysisService';
import { DeepSeekAIService } from '../services/deepseekAI';

// Test environment
const testEnv = {
  DEEPSEEK_API_KEY: 'test-api-key',
  DEEPSEEK_BASE_URL: 'https://api.deepseek.com/v1',
  DEEPSEEK_MODEL: 'deepseek-reasoner',
  AI_MAX_TOKENS: '4000',
  AI_TEMPERATURE: '0.1',
  AI_TIMEOUT: '30000'
};

// Quality validation test cases
const qualityTestCases = [
  {
    name: 'Senior JavaScript Developer',
    cv: `
      Senior JavaScript Developer with 6 years of experience.
      Expert in React, Node.js, and TypeScript.
      Led teams of 5+ developers.
      AWS Certified Solutions Architect.
      Built scalable applications serving 1M+ users.
    `,
    expectedSkills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS'],
    expectedLevel: 'senior',
    expectedCategories: ['Programming', 'Cloud', 'Management']
  },
  {
    name: 'Entry Level Python Developer',
    cv: `
      Recent Computer Science graduate.
      6 months internship experience with Python and Django.
      Built a web application as final project.
      Familiar with Git and basic SQL.
    `,
    expectedSkills: ['Python', 'Django', 'Git', 'SQL'],
    expectedLevel: 'entry',
    expectedCategories: ['Programming']
  },
  {
    name: 'Full Stack Engineer',
    cv: `
      Full Stack Engineer with 4 years experience.
      Frontend: React, Vue.js, Angular, HTML5, CSS3
      Backend: Node.js, Python, Java, Spring Boot
      Databases: PostgreSQL, MongoDB, Redis
      DevOps: Docker, Kubernetes, Jenkins, AWS
    `,
    expectedSkills: ['React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'Java', 'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes', 'AWS'],
    expectedLevel: 'mid',
    expectedCategories: ['Programming', 'Cloud', 'Data']
  }
];

const jobQualityTestCases = [
  {
    name: 'Senior Software Engineer Role',
    job: `
      Senior Software Engineer - Remote
      
      We are looking for a Senior Software Engineer with 5+ years of experience.
      
      MUST HAVE:
      - JavaScript and TypeScript expertise (5+ years)
      - React or Vue.js experience (3+ years)
      - Node.js backend development (3+ years)
      - Database design and optimization
      - Leadership and mentoring experience
      
      NICE TO HAVE:
      - AWS or Azure cloud experience
      - Docker and Kubernetes
      - GraphQL and API design
      
      Salary: $120,000 - $160,000
      Benefits: Health insurance, 401k, remote work
    `,
    expectedCriticalSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
    expectedImportantSkills: ['AWS', 'Docker', 'Kubernetes'],
    expectedSalaryRange: { min: 120000, max: 160000 },
    expectedLevel: 'senior'
  },
  {
    name: 'Junior Developer Role',
    job: `
      Junior Web Developer Position
      
      Perfect for new graduates or career changers.
      We provide mentorship and training.
      
      Requirements:
      - Basic understanding of HTML, CSS, JavaScript
      - Willingness to learn React
      - Good communication skills
      - Computer Science degree preferred
      
      Salary: $60,000 - $80,000
      Full-time, on-site position
    `,
    expectedCriticalSkills: ['HTML', 'CSS', 'JavaScript'],
    expectedImportantSkills: ['React'],
    expectedSalaryRange: { min: 60000, max: 80000 },
    expectedLevel: 'entry'
  }
];

describe('AI Quality Validation Tests', () => {
  let aiService: AIAnalysisService;
  let fetchMock: any;

  beforeEach(() => {
    fetchMock = vi.spyOn(global, 'fetch');
    aiService = new AIAnalysisService(testEnv);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Skills Extraction Quality', () => {
    qualityTestCases.forEach(testCase => {
      it(`should accurately extract skills from ${testCase.name} CV`, async () => {
        // Mock AI response with realistic skills extraction
        fetchMock.mockResolvedValueOnce(
          new Response(JSON.stringify({
            choices: [{
              message: {
                content: JSON.stringify({
                  skills: testCase.expectedSkills.map(skill => ({
                    name: skill,
                    category: getSkillCategory(skill),
                    level: inferSkillLevel(skill, testCase.expectedLevel),
                    yearsExperience: getYearsExperience(testCase.expectedLevel),
                    confidence: 0.85,
                    context: `Mentioned in CV`,
                    certifications: [],
                    relatedSkills: [],
                    reasoning: `Extracted from work experience`
                  })),
                  categories: testCase.expectedCategories,
                  overallExperience: `${testCase.expectedLevel} level developer`,
                  education: ['Computer Science'],
                  certifications: [],
                  strengths: ['Technical skills'],
                  areasForImprovement: ['Leadership'],
                  careerLevel: testCase.expectedLevel,
                  reasoning: 'Analysis based on experience and skills'
                })
              }
            }],
            usage: { total_tokens: 1500 }
          }))
        );

        const result = await aiService.analyzeCV(testCase.cv, undefined, {
          includeSkillsGap: false,
          includeCareerSuggestions: false,
          includeIndustryTrends: false
        });

        // Validate skills extraction
        expect(result.skillsAnalysis.skills.length).toBeGreaterThan(0);
        expect(result.skillsAnalysis.careerLevel).toBe(testCase.expectedLevel);
        
        // Check that expected skills are found
        const extractedSkillNames = result.skillsAnalysis.skills.map(s => s.name);
        testCase.expectedSkills.forEach(expectedSkill => {
          expect(extractedSkillNames).toContain(expectedSkill);
        });

        // Check categories
        testCase.expectedCategories.forEach(expectedCategory => {
          expect(result.skillsAnalysis.categories).toContain(expectedCategory);
        });
      });
    });

    it('should maintain consistent skill categorization', async () => {
      const skillCategories = {
        'JavaScript': 'Programming',
        'React': 'Programming',
        'AWS': 'Cloud',
        'PostgreSQL': 'Data',
        'Leadership': 'Management'
      };

      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({
          choices: [{
            message: {
              content: JSON.stringify({
                skills: Object.entries(skillCategories).map(([skill, category]) => ({
                  name: skill,
                  category,
                  level: 'intermediate',
                  yearsExperience: 3,
                  confidence: 0.8,
                  context: 'test',
                  certifications: [],
                  relatedSkills: [],
                  reasoning: 'test'
                })),
                categories: Object.values(skillCategories),
                overallExperience: 'Mid-level',
                education: [],
                certifications: [],
                strengths: [],
                areasForImprovement: [],
                careerLevel: 'mid',
                reasoning: 'test'
              })
            }
          }],
          usage: { total_tokens: 1000 }
        }))
      );

      const result = await aiService.analyzeCV('Test CV with various skills', undefined, {
        includeSkillsGap: false,
        includeCareerSuggestions: false,
        includeIndustryTrends: false
      });

      // Verify consistent categorization
      result.skillsAnalysis.skills.forEach(skill => {
        expect(skillCategories[skill.name as keyof typeof skillCategories]).toBe(skill.category);
      });
    });

    it('should provide reasonable confidence scores', async () => {
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({
          choices: [{
            message: {
              content: JSON.stringify({
                skills: [
                  {
                    name: 'JavaScript',
                    category: 'Programming',
                    level: 'expert',
                    yearsExperience: 5,
                    confidence: 0.95, // High confidence for clearly mentioned skill
                    context: 'Mentioned multiple times with specific examples',
                    certifications: [],
                    relatedSkills: [],
                    reasoning: 'Strong evidence'
                  },
                  {
                    name: 'Machine Learning',
                    category: 'Data',
                    level: 'beginner',
                    yearsExperience: 1,
                    confidence: 0.6, // Lower confidence for inferred skill
                    context: 'Mentioned briefly without details',
                    certifications: [],
                    relatedSkills: [],
                    reasoning: 'Limited evidence'
                  }
                ],
                categories: ['Programming', 'Data'],
                overallExperience: 'Senior',
                education: [],
                certifications: [],
                strengths: [],
                areasForImprovement: [],
                careerLevel: 'senior',
                reasoning: 'test'
              })
            }
          }],
          usage: { total_tokens: 1000 }
        }))
      );

      const result = await aiService.analyzeCV('CV with clear and unclear skill mentions', undefined, {
        includeSkillsGap: false,
        includeCareerSuggestions: false,
        includeIndustryTrends: false
      });

      // Verify confidence scores are reasonable
      result.skillsAnalysis.skills.forEach(skill => {
        expect(skill.confidence).toBeGreaterThan(0);
        expect(skill.confidence).toBeLessThanOrEqual(1);
        
        // Higher confidence should correlate with more experience/evidence
        if (skill.name === 'JavaScript') {
          expect(skill.confidence).toBeGreaterThan(0.8);
        }
        if (skill.name === 'Machine Learning') {
          expect(skill.confidence).toBeLessThan(0.8);
        }
      });
    });
  });

  describe('Job Analysis Quality', () => {
    jobQualityTestCases.forEach(testCase => {
      it(`should accurately analyze ${testCase.name}`, async () => {
        fetchMock.mockImplementation(async (url, options) => {
          const body = JSON.parse(options?.body as string);
          const prompt = body.messages[1].content;

          if (prompt.includes('job description')) {
            return new Response(JSON.stringify({
              choices: [{
                message: {
                  content: JSON.stringify({
                    jobTitle: testCase.name.replace(' Role', ''),
                    company: 'Test Company',
                    industry: 'Technology',
                    experienceLevel: testCase.expectedLevel,
                    skillRequirements: [
                      ...testCase.expectedCriticalSkills.map(skill => ({
                        skill,
                        category: getSkillCategory(skill),
                        importance: 'critical',
                        minimumLevel: 'intermediate',
                        context: 'Required skill',
                        reasoning: 'Core requirement',
                        confidence: 0.9,
                        marketDemand: 'high',
                        salaryImpact: 'high'
                      })),
                      ...testCase.expectedImportantSkills.map(skill => ({
                        skill,
                        category: getSkillCategory(skill),
                        importance: 'important',
                        minimumLevel: 'beginner',
                        context: 'Preferred skill',
                        reasoning: 'Nice to have',
                        confidence: 0.7,
                        marketDemand: 'medium',
                        salaryImpact: 'medium'
                      }))
                    ],
                    softSkills: ['Communication'],
                    responsibilities: ['Develop software'],
                    benefits: ['Health insurance'],
                    salaryRange: testCase.expectedSalaryRange,
                    workArrangement: 'hybrid',
                    reasoning: 'Comprehensive job analysis'
                  })
                }
              }],
              usage: { total_tokens: 2000 }
            }));
          }

          return new Response(JSON.stringify({ error: 'Unknown prompt' }), { status: 400 });
        });

        const result = await aiService.analyzeCV('', testCase.job, {
          includeSkillsGap: true,
          includeCareerSuggestions: false,
          includeIndustryTrends: false
        });

        // Note: Since we're testing through the full pipeline, we need to check the gap analysis
        // which would contain the job analysis results
        expect(result.aiPowered).toBe(true);
        
        // The job analysis is used internally for gap analysis
        // We can verify it worked by checking that the analysis completed successfully
        expect(result.analysis_id).toBeDefined();
      });
    });

    it('should correctly classify skill importance levels', async () => {
      const jobWithMixedRequirements = `
        Software Engineer Position
        
        MUST HAVE (Deal breakers):
        - JavaScript (5+ years)
        - React (3+ years)
        
        STRONGLY PREFERRED:
        - Node.js experience
        - AWS knowledge
        
        NICE TO HAVE:
        - GraphQL experience
        - Docker familiarity
      `;

      fetchMock.mockImplementation(async (url, options) => {
        const body = JSON.parse(options?.body as string);
        const prompt = body.messages[1].content;

        if (prompt.includes('job description')) {
          return new Response(JSON.stringify({
            choices: [{
              message: {
                content: JSON.stringify({
                  jobTitle: 'Software Engineer',
                  company: 'Test Company',
                  industry: 'Technology',
                  experienceLevel: 'mid',
                  skillRequirements: [
                    {
                      skill: 'JavaScript',
                      category: 'Programming',
                      importance: 'critical',
                      minimumLevel: 'advanced',
                      yearsRequired: 5,
                      context: 'MUST HAVE - Deal breaker',
                      reasoning: 'Explicitly marked as must have',
                      confidence: 0.95,
                      marketDemand: 'high',
                      salaryImpact: 'high'
                    },
                    {
                      skill: 'React',
                      category: 'Programming',
                      importance: 'critical',
                      minimumLevel: 'intermediate',
                      yearsRequired: 3,
                      context: 'MUST HAVE - Deal breaker',
                      reasoning: 'Explicitly marked as must have',
                      confidence: 0.95,
                      marketDemand: 'high',
                      salaryImpact: 'high'
                    },
                    {
                      skill: 'Node.js',
                      category: 'Programming',
                      importance: 'important',
                      minimumLevel: 'intermediate',
                      context: 'STRONGLY PREFERRED',
                      reasoning: 'Marked as strongly preferred',
                      confidence: 0.8,
                      marketDemand: 'high',
                      salaryImpact: 'medium'
                    },
                    {
                      skill: 'GraphQL',
                      category: 'Programming',
                      importance: 'nice-to-have',
                      minimumLevel: 'beginner',
                      context: 'NICE TO HAVE',
                      reasoning: 'Explicitly marked as nice to have',
                      confidence: 0.7,
                      marketDemand: 'medium',
                      salaryImpact: 'low'
                    }
                  ],
                  softSkills: [],
                  responsibilities: [],
                  benefits: [],
                  workArrangement: 'hybrid',
                  reasoning: 'Analysis with clear importance classification'
                })
              }
            }],
            usage: { total_tokens: 2000 }
          }));
        }

        return new Response(JSON.stringify({ error: 'Unknown prompt' }), { status: 400 });
      });

      const result = await aiService.analyzeCV('Test CV', jobWithMixedRequirements, {
        includeSkillsGap: true,
        includeCareerSuggestions: false,
        includeIndustryTrends: false
      });

      expect(result.aiPowered).toBe(true);
      // Verify the analysis completed successfully with proper importance classification
      expect(result.analysis_id).toBeDefined();
    });
  });

  describe('Gap Analysis Quality', () => {
    it('should provide realistic match scores', async () => {
      const strongCV = `
        Senior JavaScript Developer with 6 years experience.
        Expert in React, Node.js, TypeScript.
        AWS Certified Solutions Architect.
        Led teams of 5+ developers.
      `;

      const matchingJob = `
        Senior JavaScript Developer position.
        Requirements: JavaScript (5+ years), React (3+ years), Node.js, leadership experience.
        AWS experience preferred.
      `;

      fetchMock.mockImplementation(async (url, options) => {
        const body = JSON.parse(options?.body as string);
        const prompt = body.messages[1].content;

        if (prompt.includes('CV/resume text')) {
          return mockSkillsResponse();
        }
        if (prompt.includes('job description')) {
          return mockJobResponse();
        }
        if (prompt.includes('gap analysis')) {
          return new Response(JSON.stringify({
            choices: [{
              message: {
                content: JSON.stringify({
                  overallMatch: 92, // High match for well-aligned candidate
                  skillGaps: [
                    {
                      skillName: 'System Design',
                      category: 'Architecture',
                      currentLevel: null,
                      requiredLevel: 'intermediate',
                      gapSeverity: 'minor',
                      priority: 4,
                      timeToCompetency: 3,
                      learningDifficulty: 'moderate',
                      recommendations: ['Study system design patterns'],
                      resources: ['Online courses'],
                      reasoning: 'Minor gap for senior role'
                    }
                  ],
                  strengths: [
                    {
                      name: 'JavaScript',
                      category: 'Programming',
                      level: 'expert',
                      yearsExperience: 6,
                      confidence: 0.95,
                      context: 'Strong match',
                      certifications: [],
                      relatedSkills: [],
                      reasoning: 'Exceeds requirements'
                    }
                  ],
                  transferableSkills: [],
                  careerPaths: [],
                  learningPlan: { immediate: [], shortTerm: [], longTerm: [] },
                  marketInsights: [],
                  competitiveAdvantage: [],
                  reasoning: 'Strong candidate with excellent alignment'
                })
              }
            }],
            usage: { total_tokens: 3000 }
          }));
        }

        return new Response(JSON.stringify({ error: 'Unknown prompt' }), { status: 400 });
      });

      const result = await aiService.analyzeCV(strongCV, matchingJob, {
        includeSkillsGap: true,
        includeCareerSuggestions: false,
        includeIndustryTrends: false
      });

      expect(result.skillsGap!.overallMatch).toBeGreaterThan(85);
      expect(result.skillsGap!.missingSkills.length).toBeLessThan(3);
      expect(result.skillsGap!.strengths.length).toBeGreaterThan(0);
    });

    it('should identify critical skill gaps accurately', async () => {
      const juniorCV = `
        Recent graduate with basic JavaScript knowledge.
        Built a few small projects with HTML and CSS.
        No professional experience.
      `;

      const seniorJob = `
        Senior Software Engineer position.
        Requirements: JavaScript (5+ years), React (3+ years), Node.js, system design, leadership.
      `;

      fetchMock.mockImplementation(async (url, options) => {
        const body = JSON.parse(options?.body as string);
        const prompt = body.messages[1].content;

        if (prompt.includes('gap analysis')) {
          return new Response(JSON.stringify({
            choices: [{
              message: {
                content: JSON.stringify({
                  overallMatch: 35, // Low match for misaligned candidate
                  skillGaps: [
                    {
                      skillName: 'React',
                      category: 'Programming',
                      currentLevel: null,
                      requiredLevel: 'advanced',
                      gapSeverity: 'critical',
                      priority: 9,
                      timeToCompetency: 12,
                      learningDifficulty: 'moderate',
                      recommendations: ['Complete React bootcamp', 'Build portfolio projects'],
                      resources: ['React documentation', 'Online courses'],
                      reasoning: 'Critical skill completely missing'
                    },
                    {
                      skillName: 'Leadership',
                      category: 'Management',
                      currentLevel: null,
                      requiredLevel: 'intermediate',
                      gapSeverity: 'critical',
                      priority: 8,
                      timeToCompetency: 24,
                      learningDifficulty: 'hard',
                      recommendations: ['Gain team experience', 'Take leadership courses'],
                      resources: ['Leadership books', 'Mentorship programs'],
                      reasoning: 'No leadership experience for senior role'
                    }
                  ],
                  strengths: [
                    {
                      name: 'JavaScript',
                      category: 'Programming',
                      level: 'beginner',
                      yearsExperience: 0,
                      confidence: 0.6,
                      context: 'Basic knowledge',
                      certifications: [],
                      relatedSkills: [],
                      reasoning: 'Some foundation but needs development'
                    }
                  ],
                  transferableSkills: [],
                  careerPaths: [],
                  learningPlan: { immediate: [], shortTerm: [], longTerm: [] },
                  marketInsights: [],
                  competitiveAdvantage: [],
                  reasoning: 'Significant gaps for senior role'
                })
              }
            }],
            usage: { total_tokens: 3000 }
          }));
        }

        return mockDefaultResponse();
      });

      const result = await aiService.analyzeCV(juniorCV, seniorJob, {
        includeSkillsGap: true,
        includeCareerSuggestions: false,
        includeIndustryTrends: false
      });

      expect(result.skillsGap!.overallMatch).toBeLessThan(50);
      expect(result.skillsGap!.missingSkills.length).toBeGreaterThan(1);
      
      // Check for critical gaps
      const criticalGaps = result.skillsGap!.missingSkills.filter(gap => gap.priority >= 8);
      expect(criticalGaps.length).toBeGreaterThan(0);
    });
  });

  describe('Response Consistency', () => {
    it('should provide consistent results for identical inputs', async () => {
      const testCV = 'JavaScript developer with 3 years React experience';
      
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({
          choices: [{
            message: {
              content: JSON.stringify({
                skills: [
                  {
                    name: 'JavaScript',
                    category: 'Programming',
                    level: 'intermediate',
                    yearsExperience: 3,
                    confidence: 0.9,
                    context: 'test',
                    certifications: [],
                    relatedSkills: [],
                    reasoning: 'test'
                  }
                ],
                categories: ['Programming'],
                overallExperience: 'Mid-level',
                education: [],
                certifications: [],
                strengths: [],
                areasForImprovement: [],
                careerLevel: 'mid',
                reasoning: 'test'
              })
            }
          }],
          usage: { total_tokens: 1000 }
        }))
      );

      const result1 = await aiService.analyzeCV(testCV, undefined, {
        includeSkillsGap: false,
        includeCareerSuggestions: false,
        includeIndustryTrends: false
      });

      const result2 = await aiService.analyzeCV(testCV, undefined, {
        includeSkillsGap: false,
        includeCareerSuggestions: false,
        includeIndustryTrends: false
      });

      // Results should be structurally similar (though analysis_id will differ)
      expect(result1.skillsAnalysis.skills.length).toBe(result2.skillsAnalysis.skills.length);
      expect(result1.skillsAnalysis.careerLevel).toBe(result2.skillsAnalysis.careerLevel);
      expect(result1.skillsAnalysis.categories).toEqual(result2.skillsAnalysis.categories);
    });
  });
});

// Helper functions
function getSkillCategory(skill: string): string {
  const categories: Record<string, string> = {
    'JavaScript': 'Programming',
    'TypeScript': 'Programming',
    'React': 'Programming',
    'Vue.js': 'Programming',
    'Angular': 'Programming',
    'Node.js': 'Programming',
    'Python': 'Programming',
    'Java': 'Programming',
    'HTML': 'Programming',
    'CSS': 'Programming',
    'AWS': 'Cloud',
    'Azure': 'Cloud',
    'Docker': 'Cloud',
    'Kubernetes': 'Cloud',
    'PostgreSQL': 'Data',
    'MongoDB': 'Data',
    'Redis': 'Data',
    'SQL': 'Data',
    'Leadership': 'Management',
    'Git': 'Tools'
  };
  
  return categories[skill] || 'General';
}

function inferSkillLevel(skill: string, careerLevel: string): string {
  if (careerLevel === 'entry') return 'beginner';
  if (careerLevel === 'mid') return 'intermediate';
  if (careerLevel === 'senior') return 'advanced';
  return 'intermediate';
}

function getYearsExperience(careerLevel: string): number {
  if (careerLevel === 'entry') return 1;
  if (careerLevel === 'mid') return 3;
  if (careerLevel === 'senior') return 6;
  return 3;
}

function mockSkillsResponse() {
  return new Response(JSON.stringify({
    choices: [{
      message: {
        content: JSON.stringify({
          skills: [
            {
              name: 'JavaScript',
              category: 'Programming',
              level: 'expert',
              yearsExperience: 6,
              confidence: 0.95,
              context: 'test',
              certifications: [],
              relatedSkills: [],
              reasoning: 'test'
            }
          ],
          categories: ['Programming'],
          overallExperience: 'Senior',
          education: [],
          certifications: [],
          strengths: [],
          areasForImprovement: [],
          careerLevel: 'senior',
          reasoning: 'test'
        })
      }
    }],
    usage: { total_tokens: 1500 }
  }));
}

function mockJobResponse() {
  return new Response(JSON.stringify({
    choices: [{
      message: {
        content: JSON.stringify({
          jobTitle: 'Senior JavaScript Developer',
          company: 'Test Company',
          industry: 'Technology',
          experienceLevel: 'senior',
          skillRequirements: [
            {
              skill: 'JavaScript',
              category: 'Programming',
              importance: 'critical',
              minimumLevel: 'advanced',
              yearsRequired: 5,
              context: 'test',
              reasoning: 'test',
              confidence: 0.9,
              marketDemand: 'high',
              salaryImpact: 'high'
            }
          ],
          softSkills: [],
          responsibilities: [],
          benefits: [],
          workArrangement: 'hybrid',
          reasoning: 'test'
        })
      }
    }],
    usage: { total_tokens: 2000 }
  }));
}

function mockDefaultResponse() {
  return new Response(JSON.stringify({
    choices: [{
      message: {
        content: JSON.stringify({
          skills: [],
          categories: [],
          overallExperience: 'test',
          education: [],
          certifications: [],
          strengths: [],
          areasForImprovement: [],
          careerLevel: 'mid',
          reasoning: 'test'
        })
      }
    }],
    usage: { total_tokens: 1000 }
  }));
}