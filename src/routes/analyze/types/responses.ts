/**
 * Response Type Definitions for Analysis Routes
 * 
 * Centralized type definitions for all analysis response types.
 * Ensures consistent response structure across all endpoints.
 */

// Base response structure
export interface BaseAnalysisResponse {
  success: boolean;
  processingTime: number;
  timestamp: string;
  version: string;
}

// Skills analysis result
export interface SkillAnalysis {
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  confidence: number;
  yearsExperience: number;
  context: string;
  relatedSkills: string[];
}

// Gap analysis result
export interface SkillGap {
  skillName: string;
  currentLevel?: string;
  requiredLevel: string;
  gapSeverity: 'critical' | 'moderate' | 'minor';
  priority: number;
  timeToCompetency: number;
  recommendations: string[];
}

// Career suggestion
export interface CareerSuggestion {
  title: string;
  description: string;
  matchScore: number;
  requiredSkills: string[];
  salaryRange: { min: number; max: number; currency: string };
  timeToTransition: number;
}

// Industry trend
export interface IndustryTrend {
  skill: string;
  trend: 'rising' | 'stable' | 'declining';
  demandLevel: 'high' | 'medium' | 'low';
  salaryImpact: number;
  timeframe: string;
}

// Resume analysis response
export interface ResumeAnalysisResponse extends BaseAnalysisResponse {
  data: {
    skills: SkillAnalysis[];
    overallExperience: string;
    careerLevel: 'entry' | 'mid' | 'senior' | 'executive';
    strengths: string[];
    areasForImprovement: string[];
    skillGaps?: SkillGap[];
    careerSuggestions?: CareerSuggestion[];
    industryTrends?: IndustryTrend[];
  };
}

// Team analysis response
export interface TeamAnalysisResponse extends BaseAnalysisResponse {
  data: {
    teamStrengths: string[];
    skillGaps: SkillGap[];
    recommendations: string[];
    riskAssessment: {
      level: 'low' | 'medium' | 'high';
      factors: string[];
    };
    timeline: {
      estimated: number;
      confidence: number;
    };
  };
}

// Gap analysis response
export interface GapAnalysisResponse extends BaseAnalysisResponse {
  data: {
    overallMatch: number;
    skillGaps: SkillGap[];
    strengths: SkillAnalysis[];
    learningPlan: {
      immediate: Array<{ skill: string; action: string; timeframe: string }>;
      shortTerm: Array<{ skill: string; action: string; timeframe: string }>;
      longTerm: Array<{ skill: string; action: string; timeframe: string }>;
    };
    careerPaths: CareerSuggestion[];
  };
}

// Trends analysis response
export interface TrendsAnalysisResponse extends BaseAnalysisResponse {
  data: {
    industry: string;
    timeframe: string;
    trends: IndustryTrend[];
    insights: string[];
    recommendations: string[];
    marketOutlook: {
      growth: 'positive' | 'neutral' | 'negative';
      confidence: number;
      factors: string[];
    };
  };
}

// Error response
export interface AnalysisErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}