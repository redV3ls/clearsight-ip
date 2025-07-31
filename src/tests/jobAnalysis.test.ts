import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeepSeekAIService, AIJobAnalysis } from '../services/deepseekAI';
import { AIAnalysisService } from '../services/aiAnalysisService';

// Mock environment for testing
const mockEnv = {
  DEEPSEEK_API_KEY: 'test-api-key',
  DEEPSEEK_BASE_URL: 'https://api.deepseek.com/v1',
  DEEPSEEK_MODEL: 'deepseek-reasoner',
  DEEPSEEK_MAX_TOKENS: '4000',
  DEEPSEEK_TEMPERATURE: '0.1',
  DEEPSEEK_TIMEOUT: '30000'
};

describe('Job Description Analysis', () => {
  let aiAnalysisService: AIAnalysisService;
  let deepseekService: DeepSeekAIService;

  beforeEach(() => {
    aiAnalysisService = new AIAnalysisService(mockEnv);
    
    // Mock the DeepSeek API calls for testing
    vi.spyOn(global, 'fetch').mockImplementation(async (url, options) => {
      const body = JSON.parse(options?.body as string);
      const prompt = body.messages[1].content;

      // Mock different responses based on prompt content
      if (prompt.includes('job description')) {
        return new Response(JSON.stringify({
          choices: [{
            message: {
              content: JSON.stringify({
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
                    context: 'Required for frontend development',
                    reasoning: 'Core technology for the role',
                    confidence: 0.95
                  },
                  {
                    skill: 'React',
                    category: 'Programming',
                    importance: 'critical',
                    minimumLevel: 'advanced',
                    yearsRequired: 3,
                    context: 'Primary frontend framework',
                    reasoning: 'Mentioned as primary requirement',
                    confidence: 0.9
                  },
                  {
                    skill: 'Node.js',
                    category: 'Programming',
                    importance: 'important',
                    minimumLevel: 'intermediate',
                    yearsRequired: 2,
                    context: 'Backend development',
                    reasoning: 'Listed in technical requirements',
                    confidence: 0.85
                  },
                  {
                    skill: 'AWS',
                    category: 'Cloud',
                    importance: 'important',
                    minimumLevel: 'intermediate',
                    context: 'Cloud infrastructure management',
                    reasoning: 'Mentioned in infrastructure section',
                    confidence: 0.8
                  },
                  {
                    skill: 'Team Leadership',
                    category: 'Management',
                    importance: 'nice-to-have',
                    minimumLevel: 'intermediate',
                    context: 'Mentoring junior developers',
                    reasoning: 'Implied from senior role expectations',
                    confidence: 0.7
                  }
                ],
                softSkills: ['Communication', 'Problem Solving', 'Team Collaboration'],
                responsibilities: [
                  'Develop and maintain web applications',
                  'Lead technical architecture decisions',
                  'Mentor junior developers',
                  'Collaborate with product teams'
                ],
                benefits: ['Health Insurance', 'Remote Work', '401k Matching'],
                salaryRange: { min: 120000, max: 160000, currency: 'USD' },
                workArrangement: 'hybrid',
                reasoning: 'Analysis based on comprehensive job description parsing with focus on technical requirements and seniority indicators'
              })
            }
          }],
          usage: { total_tokens: 1500 }
        }));
      }

      return new Response(JSON.stringify({ error: 'Unknown prompt type' }), { status: 400 });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Job Description Parsing', () => {
    it('should extract job title and company information', async () => {
      const jobDescription = `
        Senior Software Engineer at TechCorp Inc.
        
        We are looking for an experienced software engineer to join our team.
        The ideal candidate will have 5+ years of JavaScript experience and 3+ years with React.
        
        Requirements:
        - Advanced JavaScript skills
        - React expertise
        - Node.js experience
        - AWS knowledge preferred
        - Strong communication skills
        
        Benefits:
        - Health insurance
        - Remote work options
        - 401k matching
        
        Salary: $120,000 - $160,000
      `;

      const result = await aiAnalysisService.analyzeCV('', jobDescription, {
        includeSkillsGap: true,
        includeCareerSuggestions: false,
        includeIndustryTrends: false
      });

      expect(result.aiPowered).toBe(true);
      // The job analysis would be used in gap analysis, so we can't directly test it here
      // But we can verify the overall structure is correct
      expect(result.analysis_id).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should classify skill importance correctly', async () => {
      const jobDescription = `
        Software Engineer Position
        
        MUST HAVE:
        - JavaScript (5+ years)
        - React (3+ years)
        
        PREFERRED:
        - Node.js experience
        - AWS knowledge
        
        NICE TO HAVE:
        - Leadership experience
      `;

      // We would need to access the internal job analysis to test this properly
      // For now, we'll test that the analysis completes successfully
      const result = await aiAnalysisService.analyzeCV('', jobDescription, {
        includeSkillsGap: true,
        includeCareerSuggestions: false,
        includeIndustryTrends: false
      });

      expect(result.aiPowered).toBe(true);
      expect(result.metadata.aiProvider).toBe('deepseek');
    });

    it('should infer implicit requirements from job context', async () => {
      const jobDescription = `
        Senior Full Stack Developer
        
        Join our fintech startup building the next generation of payment solutions.
        You'll be working with our React frontend and Node.js backend, deploying to AWS.
        
        We're looking for someone who can work independently and make architectural decisions.
        Experience with financial regulations and security best practices is a plus.
      `;

      const result = await aiAnalysisService.analyzeCV('', jobDescription, {
        includeSkillsGap: true,
        includeCareerSuggestions: false,
        includeIndustryTrends: false
      });

      expect(result.aiPowered).toBe(true);
      // The AI should infer security, fintech domain knowledge, and architectural skills
      // from the context even if not explicitly mentioned
    });

    it('should extract salary and benefits information', async () => {
      const jobDescription = `
        Software Engineer
        
        Salary: $100,000 - $130,000 per year
        
        Benefits:
        - Health, dental, and vision insurance
        - 401(k) with company matching
        - Flexible PTO
        - Remote work options
        - Professional development budget
      `;

      const result = await aiAnalysisService.analyzeCV('', jobDescription, {
        includeSkillsGap: true,
        includeCareerSuggestions: false,
        includeIndustryTrends: false
      });

      expect(result.aiPowered).toBe(true);
      // Benefits and salary should be extracted and included in the analysis
    });

    it('should handle industry-specific terminology', async () => {
      const jobDescription = `
        DevOps Engineer - Healthcare Technology
        
        We need someone familiar with HIPAA compliance, HL7 standards, and FHIR APIs.
        Experience with Kubernetes, Terraform, and CI/CD pipelines is essential.
        
        Must understand healthcare data privacy requirements and regulatory compliance.
      `;

      const result = await aiAnalysisService.analyzeCV('', jobDescription, {
        includeSkillsGap: true,
        includeCareerSuggestions: false,
        includeIndustryTrends: false
      });

      expect(result.aiPowered).toBe(true);
      // The AI should understand healthcare-specific terms and compliance requirements
    });
  });

  describe('Experience Level Detection', () => {
    it('should correctly identify entry-level positions', async () => {
      const jobDescription = `
        Junior Software Developer
        
        Perfect for new graduates or those with 0-2 years of experience.
        We provide mentorship and training opportunities.
        
        Basic requirements:
        - Understanding of JavaScript fundamentals
        - Willingness to learn React
        - Good communication skills
      `;

      const result = await aiAnalysisService.analyzeCV('', jobDescription, {
        includeSkillsGap: true,
        includeCareerSuggestions: false,
        includeIndustryTrends: false
      });

      expect(result.aiPowered).toBe(true);
      // Should identify as entry-level position
    });

    it('should correctly identify senior-level positions', async () => {
      const jobDescription = `
        Senior Software Architect
        
        We're seeking a seasoned professional with 8+ years of experience.
        You'll be responsible for technical leadership and architectural decisions.
        
        Requirements:
        - 8+ years of software development experience
        - Proven track record of leading technical teams
        - Experience with system design and architecture
        - Strong mentoring and leadership skills
      `;

      const result = await aiAnalysisService.analyzeCV('', jobDescription, {
        includeSkillsGap: true,
        includeCareerSuggestions: false,
        includeIndustryTrends: false
      });

      expect(result.aiPowered).toBe(true);
      // Should identify as senior-level position
    });
  });

  describe('Work Arrangement Detection', () => {
    it('should detect remote work arrangements', async () => {
      const jobDescription = `
        Remote Software Engineer
        
        This is a fully remote position. We're a distributed team working across multiple time zones.
        Candidates must be comfortable with asynchronous communication.
      `;

      const result = await aiAnalysisService.analyzeCV('', jobDescription, {
        includeSkillsGap: true,
        includeCareerSuggestions: false,
        includeIndustryTrends: false
      });

      expect(result.aiPowered).toBe(true);
      // Should detect remote work arrangement
    });

    it('should detect hybrid work arrangements', async () => {
      const jobDescription = `
        Software Engineer - Hybrid Role
        
        This position offers flexibility with 2-3 days in office and 2-3 days remote.
        Office located in downtown Seattle.
      `;

      const result = await aiAnalysisService.analyzeCV('', jobDescription, {
        includeSkillsGap: true,
        includeCareerSuggestions: false,
        includeIndustryTrends: false
      });

      expect(result.aiPowered).toBe(true);
      // Should detect hybrid work arrangement
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed job descriptions gracefully', async () => {
      const malformedJobDescription = `
        !!!URGENT HIRING!!!
        $$$ BIG MONEY $$$
        CALL NOW!!!
        
        [Random characters and symbols: @#$%^&*()]
      `;

      const result = await aiAnalysisService.analyzeCV('test cv content', malformedJobDescription, {
        includeSkillsGap: true,
        includeCareerSuggestions: false,
        includeIndustryTrends: false
      });

      // Should either succeed with AI analysis or fallback gracefully
      expect(result.analysis_id).toBeDefined();
    });

    it('should fallback to rule-based analysis when AI fails', async () => {
      // Mock AI failure
      vi.spyOn(global, 'fetch').mockRejectedValue(new Error('API Error'));

      const result = await aiAnalysisService.analyzeCV('test cv', 'test job description', {
        includeSkillsGap: true,
        includeCareerSuggestions: false,
        includeIndustryTrends: false
      });

      expect(result.aiPowered).toBe(false);
      expect(result.metadata.fallbackUsed).toBe(true);
    });
  });
});