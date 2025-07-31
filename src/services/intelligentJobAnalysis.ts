import { DeepSeekAIService, AIJobAnalysis, AIJobRequirement } from './deepseekAI';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

export interface JobAnalysisInsights {
  marketPositioning: {
    competitiveness: 'very-competitive' | 'competitive' | 'standard' | 'below-market';
    salaryBenchmark: 'above-market' | 'market-rate' | 'below-market' | 'unknown';
    demandLevel: 'high' | 'medium' | 'low';
    reasoning: string;
  };
  skillComplexity: {
    overallComplexity: 'beginner-friendly' | 'intermediate' | 'advanced' | 'expert-level';
    rareCombinations: string[];
    marketAvailability: 'abundant' | 'moderate' | 'scarce';
    reasoning: string;
  };
  careerProgression: {
    growthPotential: 'high' | 'medium' | 'low';
    nextRoles: string[];
    skillGaps: string[];
    timeToPromotion: number; // months
    reasoning: string;
  };
  industryContext: {
    industryTrends: string[];
    emergingSkills: string[];
    decliningSkills: string[];
    futureOutlook: 'growing' | 'stable' | 'declining';
    reasoning: string;
  };
  applicationStrategy: {
    keySellingPoints: string[];
    potentialConcerns: string[];
    interviewFocus: string[];
    negotiationLeverage: string[];
    reasoning: string;
  };
}

export interface EnhancedJobAnalysis extends AIJobAnalysis {
  insights: JobAnalysisInsights;
  matchPrediction: {
    likelyMatch: boolean;
    confidence: number;
    reasoning: string;
    improvementAreas: string[];
  };
  applicationTips: {
    resumeOptimization: string[];
    coverLetterFocus: string[];
    interviewPreparation: string[];
    portfolioSuggestions: string[];
  };
}

export class IntelligentJobAnalysisService {
  constructor(private deepseekAI: DeepSeekAIService) {}

  /**
   * Perform comprehensive intelligent job analysis
   */
  async analyzeJobIntelligently(jobDescription: string): Promise<EnhancedJobAnalysis> {
    try {
      // Get base AI analysis
      const baseAnalysis = await this.deepseekAI.analyzeJobDescription(jobDescription);
      
      // Generate advanced insights
      const insights = await this.generateJobInsights(baseAnalysis, jobDescription);
      
      // Create match prediction (would need user skills for real prediction)
      const matchPrediction = this.generateMatchPrediction(baseAnalysis);
      
      // Generate application tips
      const applicationTips = this.generateApplicationTips(baseAnalysis);

      return {
        ...baseAnalysis,
        insights,
        matchPrediction,
        applicationTips
      };

    } catch (error) {
      logger.error('Intelligent job analysis failed:', error);
      throw new AppError('Intelligent job analysis failed', 500, 'INTELLIGENT_JOB_ANALYSIS_FAILED');
    }
  }

  /**
   * Generate advanced job insights using AI reasoning
   */
  private async generateJobInsights(
    baseAnalysis: AIJobAnalysis, 
    jobDescription: string
  ): Promise<JobAnalysisInsights> {
    const insightsPrompt = this.createInsightsPrompt(baseAnalysis, jobDescription);
    
    try {
      const response = await this.callDeepSeekForInsights(insightsPrompt);
      return JSON.parse(response);
    } catch (error) {
      logger.warn('Failed to generate AI insights, using fallback:', error);
      return this.generateFallbackInsights(baseAnalysis);
    }
  }

  /**
   * Create prompt for generating job insights
   */
  private createInsightsPrompt(baseAnalysis: AIJobAnalysis, jobDescription: string): string {
    return `
Based on the following job analysis and original job description, provide advanced market insights and strategic analysis.

Job Analysis:
${JSON.stringify(baseAnalysis, null, 2)}

Original Job Description:
"""
${jobDescription}
"""

Provide comprehensive insights in the following JSON format:

{
  "marketPositioning": {
    "competitiveness": "very-competitive|competitive|standard|below-market",
    "salaryBenchmark": "above-market|market-rate|below-market|unknown",
    "demandLevel": "high|medium|low",
    "reasoning": "detailed analysis of market positioning"
  },
  "skillComplexity": {
    "overallComplexity": "beginner-friendly|intermediate|advanced|expert-level",
    "rareCombinations": ["unusual skill combinations that are hard to find"],
    "marketAvailability": "abundant|moderate|scarce",
    "reasoning": "analysis of skill complexity and market availability"
  },
  "careerProgression": {
    "growthPotential": "high|medium|low",
    "nextRoles": ["potential next career steps"],
    "skillGaps": ["skills typically needed for advancement"],
    "timeToPromotion": number_in_months,
    "reasoning": "career progression analysis"
  },
  "industryContext": {
    "industryTrends": ["current trends affecting this role"],
    "emergingSkills": ["skills becoming more important"],
    "decliningSkills": ["skills becoming less relevant"],
    "futureOutlook": "growing|stable|declining",
    "reasoning": "industry context and future outlook"
  },
  "applicationStrategy": {
    "keySellingPoints": ["what candidates should emphasize"],
    "potentialConcerns": ["common candidate weaknesses for this role"],
    "interviewFocus": ["likely interview topics and questions"],
    "negotiationLeverage": ["factors that could help in salary negotiation"],
    "reasoning": "strategic application advice"
  }
}

Focus on:
1. Current market conditions for this role type
2. Skill rarity and demand in the job market
3. Career progression opportunities and requirements
4. Industry trends and future outlook
5. Strategic advice for job applicants
`;
  }

  /**
   * Call DeepSeek API for insights generation
   */
  private async callDeepSeekForInsights(prompt: string): Promise<string> {
    // This would use the same API calling mechanism as the main DeepSeek service
    // For now, we'll simulate the response
    return JSON.stringify({
      marketPositioning: {
        competitiveness: 'competitive',
        salaryBenchmark: 'market-rate',
        demandLevel: 'high',
        reasoning: 'This role shows strong market demand with competitive requirements'
      },
      skillComplexity: {
        overallComplexity: 'intermediate',
        rareCombinations: [],
        marketAvailability: 'moderate',
        reasoning: 'Standard skill requirements for this level'
      },
      careerProgression: {
        growthPotential: 'high',
        nextRoles: ['Senior Software Engineer', 'Tech Lead'],
        skillGaps: ['Leadership', 'System Design'],
        timeToPromotion: 18,
        reasoning: 'Clear progression path with defined skill requirements'
      },
      industryContext: {
        industryTrends: ['Remote work adoption', 'Cloud-first architecture'],
        emergingSkills: ['Kubernetes', 'Microservices'],
        decliningSkills: ['Legacy frameworks'],
        futureOutlook: 'growing',
        reasoning: 'Technology sector continues to expand'
      },
      applicationStrategy: {
        keySellingPoints: ['Technical expertise', 'Problem-solving skills'],
        potentialConcerns: ['Experience with scale', 'Team collaboration'],
        interviewFocus: ['Technical coding', 'System design'],
        negotiationLeverage: ['Specialized skills', 'Market demand'],
        reasoning: 'Focus on technical competency and growth potential'
      }
    });
  }

  /**
   * Generate fallback insights when AI is unavailable
   */
  private generateFallbackInsights(baseAnalysis: AIJobAnalysis): JobAnalysisInsights {
    const criticalSkillsCount = baseAnalysis.skillRequirements.filter(s => s.importance === 'critical').length;
    const seniorityLevel = baseAnalysis.experienceLevel;

    return {
      marketPositioning: {
        competitiveness: criticalSkillsCount > 5 ? 'very-competitive' : 'competitive',
        salaryBenchmark: baseAnalysis.salaryRange ? 'market-rate' : 'unknown',
        demandLevel: 'medium',
        reasoning: 'Analysis based on skill requirements and seniority level'
      },
      skillComplexity: {
        overallComplexity: seniorityLevel === 'senior' || seniorityLevel === 'executive' ? 'advanced' : 'intermediate',
        rareCombinations: [],
        marketAvailability: 'moderate',
        reasoning: 'Estimated based on role seniority and skill count'
      },
      careerProgression: {
        growthPotential: 'medium',
        nextRoles: this.getTypicalNextRoles(baseAnalysis.jobTitle, seniorityLevel),
        skillGaps: ['Leadership', 'Strategic thinking'],
        timeToPromotion: seniorityLevel === 'entry' ? 24 : 36,
        reasoning: 'Standard career progression estimates'
      },
      industryContext: {
        industryTrends: ['Digital transformation', 'Remote work'],
        emergingSkills: ['Cloud computing', 'AI/ML'],
        decliningSkills: ['Legacy systems'],
        futureOutlook: 'stable',
        reasoning: 'General industry trends'
      },
      applicationStrategy: {
        keySellingPoints: ['Relevant experience', 'Technical skills'],
        potentialConcerns: ['Cultural fit', 'Communication skills'],
        interviewFocus: ['Technical competency', 'Problem solving'],
        negotiationLeverage: ['Market demand', 'Specialized skills'],
        reasoning: 'Standard application strategy recommendations'
      }
    };
  }

  /**
   * Generate match prediction (simplified without user skills)
   */
  private generateMatchPrediction(baseAnalysis: AIJobAnalysis) {
    return {
      likelyMatch: false, // Would need user skills to determine
      confidence: 0.5,
      reasoning: 'Match prediction requires user skill comparison',
      improvementAreas: baseAnalysis.skillRequirements
        .filter(s => s.importance === 'critical')
        .map(s => s.skill)
        .slice(0, 3)
    };
  }

  /**
   * Generate application tips based on job analysis
   */
  private generateApplicationTips(baseAnalysis: AIJobAnalysis) {
    const criticalSkills = baseAnalysis.skillRequirements
      .filter(s => s.importance === 'critical')
      .map(s => s.skill);

    return {
      resumeOptimization: [
        `Highlight experience with ${criticalSkills.slice(0, 3).join(', ')}`,
        'Quantify achievements with specific metrics',
        'Use keywords from the job description',
        'Emphasize relevant project outcomes'
      ],
      coverLetterFocus: [
        'Address specific requirements mentioned in the job posting',
        'Show understanding of company culture and values',
        'Demonstrate passion for the industry and role',
        'Explain how your background aligns with their needs'
      ],
      interviewPreparation: [
        'Prepare examples demonstrating key technical skills',
        'Research the company\'s products and recent news',
        'Practice explaining complex technical concepts simply',
        'Prepare questions about team structure and growth opportunities'
      ],
      portfolioSuggestions: [
        'Include projects showcasing the most critical skills',
        'Demonstrate problem-solving process and decision-making',
        'Show code quality and documentation practices',
        'Include collaborative projects if teamwork is emphasized'
      ]
    };
  }

  /**
   * Get typical next roles based on current role and seniority
   */
  private getTypicalNextRoles(jobTitle: string, seniority: string): string[] {
    const titleLower = jobTitle.toLowerCase();
    
    if (titleLower.includes('engineer') || titleLower.includes('developer')) {
      switch (seniority) {
        case 'entry':
          return ['Mid-level Software Engineer', 'Software Engineer II'];
        case 'mid':
          return ['Senior Software Engineer', 'Tech Lead'];
        case 'senior':
          return ['Staff Engineer', 'Engineering Manager', 'Principal Engineer'];
        case 'executive':
          return ['VP of Engineering', 'CTO'];
        default:
          return ['Senior Software Engineer'];
      }
    }
    
    return ['Senior ' + jobTitle, 'Lead ' + jobTitle];
  }

  /**
   * Analyze multiple job descriptions for comparison
   */
  async compareJobs(jobDescriptions: string[]): Promise<{
    jobs: EnhancedJobAnalysis[];
    comparison: {
      skillOverlap: Array<{ skill: string; jobIndices: number[] }>;
      salaryComparison: Array<{ jobIndex: number; salaryRange?: { min?: number; max?: number } }>;
      complexityRanking: Array<{ jobIndex: number; complexity: string }>;
      recommendations: string[];
    };
  }> {
    try {
      // Analyze each job
      const jobs = await Promise.all(
        jobDescriptions.map(desc => this.analyzeJobIntelligently(desc))
      );

      // Generate comparison insights
      const comparison = this.generateJobComparison(jobs);

      return { jobs, comparison };

    } catch (error) {
      logger.error('Job comparison failed:', error);
      throw new AppError('Job comparison failed', 500, 'JOB_COMPARISON_FAILED');
    }
  }

  /**
   * Generate comparison insights between multiple jobs
   */
  private generateJobComparison(jobs: EnhancedJobAnalysis[]) {
    // Find skill overlaps
    const allSkills = new Map<string, number[]>();
    jobs.forEach((job, index) => {
      job.skillRequirements.forEach(req => {
        if (!allSkills.has(req.skill)) {
          allSkills.set(req.skill, []);
        }
        allSkills.get(req.skill)!.push(index);
      });
    });

    const skillOverlap = Array.from(allSkills.entries())
      .filter(([_, indices]) => indices.length > 1)
      .map(([skill, jobIndices]) => ({ skill, jobIndices }));

    // Compare salaries
    const salaryComparison = jobs.map((job, index) => ({
      jobIndex: index,
      salaryRange: job.salaryRange
    }));

    // Rank by complexity
    const complexityOrder = ['beginner-friendly', 'intermediate', 'advanced', 'expert-level'];
    const complexityRanking = jobs
      .map((job, index) => ({
        jobIndex: index,
        complexity: job.insights.skillComplexity.overallComplexity
      }))
      .sort((a, b) => 
        complexityOrder.indexOf(a.complexity) - complexityOrder.indexOf(b.complexity)
      );

    // Generate recommendations
    const recommendations = [
      'Consider applying to multiple similar roles to increase chances',
      'Focus on developing skills that appear in multiple job descriptions',
      'Compare company cultures and growth opportunities',
      'Negotiate salary based on market research and role complexity'
    ];

    return {
      skillOverlap,
      salaryComparison,
      complexityRanking,
      recommendations
    };
  }
}