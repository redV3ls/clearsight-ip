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
content: 'You are an expert career-analysis model. Output must be a single valid JSON object that matches the user\'s schema exactly. Do not include any text outside the JSON. Do not use markdown or comments. If a value is unknown or not inferable, use null or an empty list. Do not invent facts. Deduplicate items and keep outputs concise.'
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
Rules:
- Normalize skill names to Title Case; categories ∈ ["Programming","Cloud","Data","Management","Design","DevOps","Security","Other"].
- level ∈ ["beginner","intermediate","advanced","expert"]; confidence ∈ [0,1] with 2 decimals; yearsExperience ≥ 0 (int).
- Merge variants into one entry; variants go to relatedSkills. No soft skills unless explicitly stated.
- Max 100 skills; sort by confidence desc. Use null/[] for unknowns. Return only the JSON object.

Output schema:
{
  "skills": [
    {
      "name": "string",
      "category": "CategoryEnum",
      "level": "LevelEnum",
      "yearsExperience": 0,
      "confidence": 0.0,
      "context": "string|null",
      "certifications": ["string"],
      "relatedSkills": ["string"]
    }
  ],
  "categories": ["CategoryEnum"],
  "overallExperience": "string|null",
  "education": ["string"],
  "certifications": ["string"],
  "strengths": ["string"],
  "areasForImprovement": ["string"],
  "careerLevel": "LevelEnum"
}

CV:
"""
${cvText}
"""
`;
  }

  /**
   * Create job analysis prompt
   */
private createJobAnalysisPrompt(jobText: string): string {
    return `
Rules:
- Normalize skill names to Title Case; categories ∈ ["Programming","Cloud","Data","Management","Design","DevOps","Security","Other"].
- importance ∈ ["critical","important","nice-to-have"]. minimumLevel ∈ ["beginner","intermediate","advanced","expert"].
- Max 100 skillRequirements; de-duplicate by normalized name. Use null/[] for unknowns. Return only JSON.

Output schema:
{
  "jobTitle": "string|null",
  "company": "string|null",
  "industry": "string|null",
  "experienceLevel": "entry|mid|senior|executive|null",
  "skillRequirements": [
    {
      "skill": "string",
      "category": "CategoryEnum",
      "importance": "ImportanceEnum",
      "minimumLevel": "LevelEnum",
      "yearsRequired": 0,
      "context": "string|null",
      "confidence": 0.0,
      "marketDemand": "high|medium|low|null",
      "salaryImpact": "high|medium|low|neutral|null"
    }
  ],
  "softSkills": ["string"],
  "responsibilities": ["string"],
  "benefits": ["string"],
  "salaryRange": {"min": 0, "max": 0, "currency": "USD"},
  "workArrangement": "remote|hybrid|onsite|flexible|null",
  "companySize": "startup|small|medium|large|enterprise|null",
  "teamStructure": "individual|small-team|large-team|cross-functional|null",
  "growthOpportunities": ["string"],
  "culturalFit": ["string"],
  "urgencyLevel": "urgent|normal|flexible|null",
  "competitiveAdvantages": ["string"],
  "redFlags": ["string"],
  "implicitRequirements": [
    { "skill": "string", "reasoning": "string", "confidence": 0.0 }
  ]
}

Job Description:
"""
${jobText}
"""
`;
  }

  /**
   * Create gap analysis prompt
   */
private createGapAnalysisPrompt(skillsAnalysis: AISkillsAnalysis, jobAnalysis: AIJobAnalysis): string {
    return `
Rules:
- Match skills by normalized name; if not matched, omit.
- priority ∈ 1..10; gapSeverity ∈ ["critical","moderate","minor"].
- Cap: skillGaps 50, strengths 25, recommendations/resources per gap 5. Use null/[] for unknowns. Return only JSON.

Candidate Skills:
${JSON.stringify(skillsAnalysis, null, 2)}

Job Requirements:
${JSON.stringify(jobAnalysis, null, 2)}

Output schema:
{
  "overallMatch": 0,
  "skillGaps": [
    {
      "skillName": "string",
      "category": "string",
      "currentLevel": "LevelEnum|null",
      "requiredLevel": "LevelEnum",
      "gapSeverity": "critical|moderate|minor",
      "priority": 1,
      "timeToCompetency": 0,
      "learningDifficulty": "easy|moderate|hard|very-hard",
      "recommendations": ["string"],
      "resources": ["string"]
    }
  ],
  "strengths": [
    { "name": "string", "category": "string", "level": "LevelEnum", "yearsExperience": 0, "confidence": 0.0 }
  ],
  "transferableSkills": [
    { "from": "string", "to": "string", "reasoning": "string" }
  ],
  "careerPaths": [
    { "title": "string", "description": "string", "matchScore": 0, "requiredSkills": ["string"], "timeToTransition": 0, "salaryRange": {"min": 0, "max": 0, "currency": "USD"} }
  ],
  "learningPlan": {
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