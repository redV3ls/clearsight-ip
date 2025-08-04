import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

export interface AIConfig {
  provider: 'deepseek';
  model: 'deepseek-reasoner';
  apiKey: string;
  baseUrl: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
}

export interface AISkill {
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsExperience: number;
  confidence: number;
  context: string;
  certifications: string[];
  relatedSkills: string[];
  reasoning: string;
}

export interface AIJobRequirement {
  skill: string;
  category: string;
  importance: 'critical' | 'important' | 'nice-to-have';
  minimumLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsRequired?: number;
  context: string;
  reasoning: string;
  confidence: number;
  marketDemand: 'high' | 'medium' | 'low';
  salaryImpact: 'high' | 'medium' | 'low' | 'neutral';
}

export interface AISkillGap {
  skillName: string;
  category: string;
  currentLevel?: string;
  requiredLevel: string;
  gapSeverity: 'critical' | 'moderate' | 'minor';
  priority: number;
  timeToCompetency: number;
  learningDifficulty: 'easy' | 'moderate' | 'hard' | 'very-hard';
  recommendations: string[];
  resources: string[];
  reasoning: string;
}

export interface AICareerPath {
  title: string;
  description: string;
  matchScore: number;
  requiredSkills: string[];
  timeToTransition: number;
  salaryRange: { min: number; max: number; currency: string };
  reasoning: string;
}

export interface AILearningPlan {
  immediate: Array<{ skill: string; action: string; timeframe: string; resources: string[] }>;
  shortTerm: Array<{ skill: string; action: string; timeframe: string; resources: string[] }>;
  longTerm: Array<{ skill: string; action: string; timeframe: string; resources: string[] }>;
}

export interface AISkillsAnalysis {
  skills: AISkill[];
  categories: string[];
  overallExperience: string;
  education: string[];
  certifications: string[];
  strengths: string[];
  areasForImprovement: string[];
  careerLevel: 'entry' | 'mid' | 'senior' | 'executive';
  reasoning: string;
}

export interface AIJobAnalysis {
  jobTitle: string;
  company?: string;
  industry: string;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  skillRequirements: AIJobRequirement[];
  softSkills: string[];
  responsibilities: string[];
  benefits: string[];
  salaryRange?: { min?: number; max?: number; currency?: string };
  workArrangement: 'remote' | 'hybrid' | 'onsite' | 'flexible';
  companySize?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  teamStructure?: 'individual' | 'small-team' | 'large-team' | 'cross-functional';
  growthOpportunities: string[];
  culturalFit: string[];
  urgencyLevel: 'urgent' | 'normal' | 'flexible';
  competitiveAdvantages: string[];
  redFlags: string[];
  implicitRequirements: Array<{
    skill: string;
    reasoning: string;
    confidence: number;
  }>;
  reasoning: string;
}

export interface AIGapAnalysis {
  overallMatch: number;
  skillGaps: AISkillGap[];
  strengths: AISkill[];
  transferableSkills: Array<{ from: string; to: string; reasoning: string }>;
  careerPaths: AICareerPath[];
  learningPlan: AILearningPlan;
  marketInsights: string[];
  competitiveAdvantage: string[];
  reasoning: string;
}

export class DeepSeekAIService {
  private config: AIConfig;
  private rateLimitTracker: Map<string, number> = new Map();
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  constructor(config: AIConfig) {
    this.config = config;
  }

  /**
   * Extract skills from CV text using DeepSeek AI
   */
  async extractSkillsFromCV(cvText: string): Promise<AISkillsAnalysis> {
    const prompt = this.createSkillsExtractionPrompt(cvText);

    try {
      const response = await this.callDeepSeekAPI(prompt, 'skills-extraction');
      return this.parseSkillsAnalysisResponse(response);
    } catch (error) {
      logger.error('AI skills extraction failed:', error);
      throw new AppError('AI skills extraction failed', 500, 'AI_SKILLS_EXTRACTION_FAILED');
    }
  }

  /**
   * Analyze job description using DeepSeek AI
   */
  async analyzeJobDescription(jobText: string): Promise<AIJobAnalysis> {
    const prompt = this.createJobAnalysisPrompt(jobText);

    try {
      const response = await this.callDeepSeekAPI(prompt, 'job-analysis');
      return this.parseJobAnalysisResponse(response);
    } catch (error) {
      logger.error('AI job analysis failed:', error);
      throw new AppError('AI job analysis failed', 500, 'AI_JOB_ANALYSIS_FAILED');
    }
  }

  /**
   * Perform intelligent gap analysis using DeepSeek AI
   */
  async performGapAnalysis(
    skillsAnalysis: AISkillsAnalysis,
    jobAnalysis: AIJobAnalysis
  ): Promise<AIGapAnalysis> {
    const prompt = this.createGapAnalysisPrompt(skillsAnalysis, jobAnalysis);

    try {
      const response = await this.callDeepSeekAPI(prompt, 'gap-analysis');
      return this.parseGapAnalysisResponse(response);
    } catch (error) {
      logger.error('AI gap analysis failed:', error);
      throw new AppError('AI gap analysis failed', 500, 'AI_GAP_ANALYSIS_FAILED');
    }
  }

  /**
   * Call DeepSeek API with retry logic and rate limiting
   */
  private async callDeepSeekAPI(prompt: string, operation: string): Promise<string> {
    // Check rate limiting
    await this.checkRateLimit(operation);

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({
            model: this.config.model,
            messages: [
              {
                role: 'system',
                content: 'You are an expert career analyst and skills assessment specialist. Provide detailed, accurate, and actionable analysis. Always respond with valid JSON in the exact format requested.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: this.config.maxTokens,
            temperature: this.config.temperature,
            response_format: { type: 'json_object' }
          }),
          signal: AbortSignal.timeout(this.config.timeout)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json() as {
          choices?: Array<{
            message?: {
              content?: string;
            };
          }>;
          usage?: {
            total_tokens?: number;
          };
        };

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          throw new Error('Invalid response format from DeepSeek API');
        }

        const content = data.choices[0].message.content;

        // Validate JSON response
        try {
          JSON.parse(content);
        } catch (parseError) {
          throw new Error(`Invalid JSON response from DeepSeek: ${parseError}`);
        }

        // Update rate limit tracking
        this.updateRateLimit(operation);

        logger.info(`DeepSeek AI ${operation} completed successfully`, {
          attempt,
          tokensUsed: data.usage?.total_tokens || 0
        });

        return content;

      } catch (error) {
        lastError = error as Error;
        logger.warn(`DeepSeek API attempt ${attempt} failed:`, error);

        if (attempt < this.MAX_RETRIES) {
          await this.delay(this.RETRY_DELAY * attempt);
        }
      }
    }

    throw lastError || new Error('DeepSeek API failed after all retries');
  }

  /**
   * Create skills extraction prompt
   */
  private createSkillsExtractionPrompt(cvText: string): string {
    return `
Analyze the following CV/resume text and extract comprehensive skills information. Use your reasoning capabilities to understand context, infer experience levels, and identify both explicit and implicit skills.

CV Text:
"""
${cvText}
"""

Please provide a detailed analysis in the following JSON format:

{
  "skills": [
    {
      "name": "skill name (normalized)",
      "category": "category (Programming, Cloud, Data, Management, Design, etc.)",
      "level": "beginner|intermediate|advanced|expert",
      "yearsExperience": number,
      "confidence": 0.0-1.0,
      "context": "where/how this skill was mentioned",
      "certifications": ["related certifications"],
      "relatedSkills": ["complementary skills"],
      "reasoning": "why you classified it this way"
    }
  ],
  "categories": ["unique categories found"],
  "overallExperience": "summary of overall experience level",
  "education": ["educational background"],
  "certifications": ["all certifications found"],
  "strengths": ["key strengths identified"],
  "areasForImprovement": ["potential areas to develop"],
  "careerLevel": "entry|mid|senior|executive",
  "reasoning": "overall reasoning for the analysis"
}

Focus on:
1. Extracting both technical and soft skills
2. Inferring experience levels from context clues
3. Identifying transferable skills
4. Understanding industry-specific terminology
5. Recognizing implicit skills from job descriptions and achievements
`;
  }

  /**
   * Create job analysis prompt
   */
  private createJobAnalysisPrompt(jobText: string): string {
    return `
Analyze the following job description and extract comprehensive requirements and insights. Use advanced reasoning to understand implicit requirements, industry context, and market positioning.

Job Description:
"""
${jobText}
"""

Please provide a detailed analysis in the following JSON format:

{
  "jobTitle": "extracted job title",
  "company": "company name if mentioned",
  "industry": "industry/sector (Technology, Healthcare, Finance, etc.)",
  "experienceLevel": "entry|mid|senior|executive",
  "skillRequirements": [
    {
      "skill": "skill name (normalized to industry standards)",
      "category": "Programming|Cloud|Data|Management|Design|Security|DevOps|etc.",
      "importance": "critical|important|nice-to-have",
      "minimumLevel": "beginner|intermediate|advanced|expert",
      "yearsRequired": number or null,
      "context": "exact context from job description",
      "reasoning": "detailed reasoning for classification and importance",
      "confidence": 0.0-1.0,
      "marketDemand": "high|medium|low",
      "salaryImpact": "high|medium|low|neutral"
    }
  ],
  "softSkills": ["communication", "leadership", "problem-solving", etc.],
  "responsibilities": ["key responsibilities extracted"],
  "benefits": ["benefits and perks mentioned"],
  "salaryRange": {"min": number, "max": number, "currency": "USD"} or null,
  "workArrangement": "remote|hybrid|onsite|flexible",
  "companySize": "startup|small|medium|large|enterprise" or null,
  "teamStructure": "individual|small-team|large-team|cross-functional" or null,
  "growthOpportunities": ["career advancement opportunities mentioned"],
  "culturalFit": ["cultural values and work environment indicators"],
  "urgencyLevel": "urgent|normal|flexible",
  "competitiveAdvantages": ["unique selling points of the role"],
  "redFlags": ["potential concerns or warning signs"],
  "implicitRequirements": [
    {
      "skill": "inferred skill name",
      "reasoning": "why this skill is likely required",
      "confidence": 0.0-1.0
    }
  ],
  "reasoning": "comprehensive reasoning for the entire analysis including industry context and market positioning"
}

Advanced Analysis Instructions:
1. SKILL EXTRACTION: Identify both explicit and implicit skill requirements
   - Look for technical skills mentioned directly
   - Infer skills from job responsibilities and context
   - Consider industry-standard skill combinations
   - Normalize skill names to industry standards (e.g., "JS" → "JavaScript")

2. IMPORTANCE CLASSIFICATION: Use contextual reasoning
   - "critical": Must-have skills, deal-breakers, explicitly required
   - "important": Strongly preferred, mentioned multiple times, core to role
   - "nice-to-have": Bonus skills, "preferred", "plus if you have"

3. EXPERIENCE LEVEL INFERENCE: Look for multiple indicators
   - Years of experience mentioned
   - Job title seniority (Junior, Senior, Lead, Principal)
   - Responsibility level (mentoring, architecture, leadership)
   - Decision-making authority described

4. INDUSTRY CONTEXT: Consider sector-specific requirements
   - Healthcare: HIPAA, HL7, medical device regulations
   - Finance: SOX compliance, financial regulations, security
   - E-commerce: scalability, payment processing, fraud detection
   - Startups: versatility, rapid development, resource constraints

5. IMPLICIT REQUIREMENTS: Infer likely skills from context
   - If React is mentioned, likely need JavaScript, HTML, CSS
   - If AWS is mentioned, likely need cloud architecture knowledge
   - If "full-stack" is mentioned, need both frontend and backend skills
   - If "senior" role, likely need mentoring and architectural skills

6. MARKET ANALYSIS: Consider current market trends
   - Assess skill demand in current job market
   - Evaluate salary impact of specific skills
   - Consider emerging vs. declining technologies

7. CULTURAL AND SOFT SKILLS: Extract work environment clues
   - Team collaboration requirements
   - Communication style preferences
   - Work pace and pressure indicators
   - Learning and growth mindset requirements

8. RED FLAGS DETECTION: Identify potential concerns
   - Unrealistic skill combinations for experience level
   - Extremely long requirement lists
   - Vague job descriptions
   - Concerning language about work-life balance
   - Unrealistic timeline expectations
`;
  }

  /**
   * Create gap analysis prompt
   */
  private createGapAnalysisPrompt(skillsAnalysis: AISkillsAnalysis, jobAnalysis: AIJobAnalysis): string {
    return `
Perform an intelligent gap analysis between the candidate's skills and job requirements. Use reasoning to provide actionable insights and personalized recommendations.

Candidate Skills:
${JSON.stringify(skillsAnalysis, null, 2)}

Job Requirements:
${JSON.stringify(jobAnalysis, null, 2)}

Please provide a comprehensive gap analysis in the following JSON format:

{
  "overallMatch": 0-100,
  "skillGaps": [
    {
      "skillName": "skill name",
      "category": "category",
      "currentLevel": "current level or null if missing",
      "requiredLevel": "required level",
      "gapSeverity": "critical|moderate|minor",
      "priority": 1-10,
      "timeToCompetency": number (months),
      "learningDifficulty": "easy|moderate|hard|very-hard",
      "recommendations": ["specific learning recommendations"],
      "resources": ["suggested resources"],
      "reasoning": "why this gap is important"
    }
  ],
  "strengths": [
    {
      "name": "skill name",
      "category": "category", 
      "level": "level",
      "yearsExperience": number,
      "confidence": 0.0-1.0,
      "context": "context",
      "certifications": [],
      "relatedSkills": [],
      "reasoning": "why this is a strength"
    }
  ],
  "transferableSkills": [
    {
      "from": "existing skill",
      "to": "required skill",
      "reasoning": "how they relate"
    }
  ],
  "careerPaths": [
    {
      "title": "career path title",
      "description": "description",
      "matchScore": 0-100,
      "requiredSkills": ["skills needed"],
      "timeToTransition": number (months),
      "salaryRange": {"min": number, "max": number, "currency": "USD"},
      "reasoning": "why this path makes sense"
    }
  ],
  "learningPlan": {
    "immediate": [
      {
        "skill": "skill name",
        "action": "specific action to take",
        "timeframe": "timeframe",
        "resources": ["specific resources"]
      }
    ],
    "shortTerm": [...],
    "longTerm": [...]
  },
  "marketInsights": ["current market trends relevant to this analysis"],
  "competitiveAdvantage": ["unique strengths that set candidate apart"],
  "reasoning": "overall reasoning for the gap analysis"
}

Focus on:
1. Providing actionable, specific recommendations
2. Considering market demand and trends
3. Identifying quick wins and long-term goals
4. Recognizing transferable skills and experience
5. Providing realistic timelines and difficulty assessments
`;
  }

  /**
   * Parse skills analysis response
   */
  private parseSkillsAnalysisResponse(response: string): AISkillsAnalysis {
    try {
      const parsed = JSON.parse(response);

      // Validate required fields
      if (!parsed.skills || !Array.isArray(parsed.skills)) {
        throw new Error('Invalid skills array in response');
      }

      return parsed as AISkillsAnalysis;
    } catch (error) {
      logger.error('Failed to parse skills analysis response:', error);
      throw new AppError('Invalid AI response format', 500, 'AI_RESPONSE_PARSE_ERROR');
    }
  }

  /**
   * Parse job analysis response
   */
  private parseJobAnalysisResponse(response: string): AIJobAnalysis {
    try {
      const parsed = JSON.parse(response);

      // Validate required fields
      if (!parsed.skillRequirements || !Array.isArray(parsed.skillRequirements)) {
        throw new Error('Invalid skillRequirements array in response');
      }

      return parsed as AIJobAnalysis;
    } catch (error) {
      logger.error('Failed to parse job analysis response:', error);
      throw new AppError('Invalid AI response format', 500, 'AI_RESPONSE_PARSE_ERROR');
    }
  }

  /**
   * Parse gap analysis response
   */
  private parseGapAnalysisResponse(response: string): AIGapAnalysis {
    try {
      const parsed = JSON.parse(response);

      // Validate required fields
      if (typeof parsed.overallMatch !== 'number' || !parsed.skillGaps || !Array.isArray(parsed.skillGaps)) {
        throw new Error('Invalid gap analysis structure in response');
      }

      return parsed as AIGapAnalysis;
    } catch (error) {
      logger.error('Failed to parse gap analysis response:', error);
      throw new AppError('Invalid AI response format', 500, 'AI_RESPONSE_PARSE_ERROR');
    }
  }

  /**
   * Check rate limiting
   */
  private async checkRateLimit(operation: string): Promise<void> {
    const now = Date.now();
    const lastCall = this.rateLimitTracker.get(operation) || 0;
    const timeSinceLastCall = now - lastCall;
    const minInterval = 1000; // 1 second between calls

    if (timeSinceLastCall < minInterval) {
      const waitTime = minInterval - timeSinceLastCall;
      await this.delay(waitTime);
    }
  }

  /**
   * Update rate limit tracking
   */
  private updateRateLimit(operation: string): void {
    this.rateLimitTracker.set(operation, Date.now());
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Health check for AI service
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: string }> {
    try {
      const testPrompt = 'Respond with valid JSON: {"status": "ok", "message": "AI service is working"}';
      const response = await this.callDeepSeekAPI(testPrompt, 'health-check');
      const parsed = JSON.parse(response);

      if (parsed.status === 'ok') {
        return { status: 'healthy', details: 'AI service is responding correctly' };
      } else {
        return { status: 'unhealthy', details: 'AI service returned unexpected response' };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: `AI service error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}