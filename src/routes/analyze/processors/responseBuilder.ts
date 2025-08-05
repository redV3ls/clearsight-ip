import { 
  BaseAnalysisResponse, 
  ResumeAnalysisResponse, 
  TeamAnalysisResponse, 
  GapAnalysisResponse, 
  TrendsAnalysisResponse 
} from '../types/responses';

/**
 * Response Builder Utilities
 * 
 * Standardizes response formatting across all analysis endpoints.
 * Ensures consistent response structure and metadata.
 */

interface AnalysisResponseOptions {
  type: 'resume' | 'team' | 'gap' | 'trends';
  data: any;
  processingTime: number;
  userId: string;
  metadata?: any;
}

/**
 * Builds standardized analysis response
 */
export function buildAnalysisResponse(options: AnalysisResponseOptions): BaseAnalysisResponse {
  const { type, data, processingTime, userId, metadata } = options;

  const baseResponse: BaseAnalysisResponse = {
    success: true,
    processingTime,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  };

  switch (type) {
    case 'resume':
      return buildResumeAnalysisResponse(baseResponse, data, userId, metadata);
    case 'team':
      return buildTeamAnalysisResponse(baseResponse, data, userId, metadata);
    case 'gap':
      return buildGapAnalysisResponse(baseResponse, data, userId, metadata);
    case 'trends':
      return buildTrendsAnalysisResponse(baseResponse, data, userId, metadata);
    default:
      throw new Error(`Unsupported analysis type: ${type}`);
  }
}

/**
 * Builds resume analysis response
 */
function buildResumeAnalysisResponse(
  base: BaseAnalysisResponse, 
  analysisData: any, 
  userId: string, 
  metadata?: any
): ResumeAnalysisResponse {
  return {
    ...base,
    data: {
      analysis_id: analysisData.analysis_id || generateAnalysisId(),
      user_id: userId,
      skills: normalizeSkills(analysisData.skills || []),
      overallExperience: analysisData.overallExperience || 'Not specified',
      careerLevel: normalizeCareerLevel(analysisData.careerLevel),
      strengths: analysisData.strengths || [],
      areasForImprovement: analysisData.areasForImprovement || [],
      skillGaps: analysisData.skillGaps || [],
      careerSuggestions: analysisData.careerSuggestions || [],
      industryTrends: analysisData.industryTrends || [],
      ...metadata
    }
  };
}

/**
 * Builds team analysis response
 */
function buildTeamAnalysisResponse(
  base: BaseAnalysisResponse, 
  analysisData: any, 
  userId: string, 
  metadata?: any
): TeamAnalysisResponse {
  return {
    ...base,
    data: {
      teamStrengths: analysisData.teamStrengths || [],
      skillGaps: analysisData.skillGaps || [],
      recommendations: analysisData.recommendations || [],
      riskAssessment: {
        level: analysisData.riskAssessment?.level || 'medium',
        factors: analysisData.riskAssessment?.factors || []
      },
      timeline: {
        estimated: analysisData.timeline?.estimated || 0,
        confidence: analysisData.timeline?.confidence || 0.5
      },
      ...metadata
    }
  };
}

/**
 * Builds gap analysis response
 */
function buildGapAnalysisResponse(
  base: BaseAnalysisResponse, 
  analysisData: any, 
  userId: string, 
  metadata?: any
): GapAnalysisResponse {
  return {
    ...base,
    data: {
      overallMatch: analysisData.overallMatch || 0,
      skillGaps: analysisData.skillGaps || [],
      strengths: normalizeSkills(analysisData.strengths || []),
      learningPlan: {
        immediate: analysisData.learningPlan?.immediate || [],
        shortTerm: analysisData.learningPlan?.shortTerm || [],
        longTerm: analysisData.learningPlan?.longTerm || []
      },
      careerPaths: analysisData.careerPaths || [],
      ...metadata
    }
  };
}

/**
 * Builds trends analysis response
 */
function buildTrendsAnalysisResponse(
  base: BaseAnalysisResponse, 
  analysisData: any, 
  userId: string, 
  metadata?: any
): TrendsAnalysisResponse {
  return {
    ...base,
    data: {
      industry: analysisData.industry || 'Unknown',
      timeframe: analysisData.timeframe || '1year',
      trends: analysisData.trends || [],
      insights: analysisData.insights || [],
      recommendations: analysisData.recommendations || [],
      marketOutlook: {
        growth: analysisData.marketOutlook?.growth || 'neutral',
        confidence: analysisData.marketOutlook?.confidence || 0.5,
        factors: analysisData.marketOutlook?.factors || []
      },
      ...metadata
    }
  };
}

/**
 * Normalizes skills data to ensure consistent format
 */
function normalizeSkills(skills: any[]): any[] {
  return skills.map(skill => ({
    name: skill.name || 'Unknown',
    category: skill.category || 'General',
    level: normalizeSkillLevel(skill.level),
    confidence: Math.max(0, Math.min(1, skill.confidence || 0)),
    yearsExperience: Math.max(0, skill.yearsExperience || 0),
    context: skill.context || '',
    relatedSkills: Array.isArray(skill.relatedSkills) ? skill.relatedSkills : []
  }));
}

/**
 * Normalizes skill level to valid enum values
 */
function normalizeSkillLevel(level: string): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
  const normalizedLevel = level?.toLowerCase();
  
  switch (normalizedLevel) {
    case 'beginner':
    case 'novice':
    case 'entry':
      return 'beginner';
    case 'intermediate':
    case 'mid':
    case 'middle':
      return 'intermediate';
    case 'advanced':
    case 'senior':
      return 'advanced';
    case 'expert':
    case 'master':
    case 'lead':
      return 'expert';
    default:
      return 'intermediate';
  }
}

/**
 * Normalizes career level to valid enum values
 */
function normalizeCareerLevel(level: string): 'entry' | 'mid' | 'senior' | 'executive' {
  const normalizedLevel = level?.toLowerCase();
  
  switch (normalizedLevel) {
    case 'entry':
    case 'junior':
    case 'beginner':
      return 'entry';
    case 'mid':
    case 'middle':
    case 'intermediate':
      return 'mid';
    case 'senior':
    case 'advanced':
      return 'senior';
    case 'executive':
    case 'lead':
    case 'principal':
    case 'director':
      return 'executive';
    default:
      return 'mid';
  }
}

/**
 * Generates unique analysis ID
 */
function generateAnalysisId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `analysis_${timestamp}_${randomStr}`;
}

/**
 * Builds error response
 */
export function buildErrorResponse(error: Error, code?: string): any {
  return {
    success: false,
    error: {
      code: code || 'UNKNOWN_ERROR',
      message: error.message,
      details: error.stack
    },
    timestamp: new Date().toISOString()
  };
}