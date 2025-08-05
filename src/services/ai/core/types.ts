/**
 * Common AI Types and Interfaces
 * 
 * Shared type definitions used across all AI services.
 * Provides consistency and type safety for AI operations.
 */

// Common skill and analysis types
export interface AISkill {
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  confidence: number;
  yearsExperience: number;
  context: string;
  relatedSkills: string[];
  reasoning: string;
}

export interface AISkillGap {
  skillName: string;
  currentLevel?: string;
  requiredLevel: string;
  gapSeverity: 'critical' | 'moderate' | 'minor';
  priority: number;
  timeToCompetency: number;
  recommendations: string[];
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

// Multi-language analysis types
export interface MultiLanguageAnalysis {
  originalLanguage: string;
  detectedLanguage: string;
  translatedContent?: string;
  analysisLanguage: string;
  culturalContext: {
    region: string;
    workCulture: string[];
    commonPractices: string[];
    educationSystem: string;
  };
  localizedSkills: Array<{
    skill: string;
    localTerms: string[];
    marketRelevance: 'high' | 'medium' | 'low';
  }>;
}

// Industry-specific analysis types
export interface IndustrySpecificAnalysis {
  industry: string;
  subSector?: string;
  specificRequirements: {
    regulations: string[];
    certifications: string[];
    tools: string[];
    methodologies: string[];
  };
  marketContext: {
    growthRate: number;
    competitionLevel: 'high' | 'medium' | 'low';
    salaryTrends: 'increasing' | 'stable' | 'decreasing';
    remoteFriendly: boolean;
  };
  careerPaths: Array<{
    path: string;
    timeframe: number;
    requirements: string[];
    salaryProgression: { min: number; max: number };
  }>;
}

// Personalized coaching types
export interface PersonalizedCoaching {
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  personalityType: string;
  careerGoals: string[];
  currentChallenges: string[];
  recommendations: {
    immediate: CoachingRecommendation[];
    shortTerm: CoachingRecommendation[];
    longTerm: CoachingRecommendation[];
  };
  mentorshipSuggestions: {
    mentorProfile: string;
    focusAreas: string[];
    meetingFrequency: string;
  };
}

export interface CoachingRecommendation {
  type: 'skill-development' | 'networking' | 'project' | 'certification' | 'experience';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  timeframe: string;
  resources: string[];
  successMetrics: string[];
  reasoning: string;
}

// Skill trend prediction types
export interface SkillTrendPrediction {
  skill: string;
  currentDemand: 'high' | 'medium' | 'low';
  predictedDemand: {
    sixMonths: 'increasing' | 'stable' | 'decreasing';
    oneYear: 'increasing' | 'stable' | 'decreasing';
    threeYears: 'increasing' | 'stable' | 'decreasing';
  };
  factors: {
    technologyTrends: string[];
    industryShifts: string[];
    economicFactors: string[];
    regulatoryChanges: string[];
  };
  salaryImpact: {
    current: number;
    predicted: number;
    confidence: number;
  };
  learningRecommendation: {
    urgency: 'immediate' | 'soon' | 'future' | 'optional';
    reasoning: string;
    alternatives: string[];
  };
}

// Competitive analysis types
export interface CompetitiveAnalysis {
  position: 'leading' | 'competitive' | 'developing' | 'entry';
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  competitorProfiles: Array<{
    level: string;
    commonSkills: string[];
    differentiators: string[];
    salaryRange: { min: number; max: number };
  }>;
  improvementPlan: {
    quickWins: string[];
    mediumTermGoals: string[];
    longTermObjectives: string[];
  };
}

// Interview preparation types
export interface InterviewPreparation {
  jobRole: string;
  company?: string;
  industry: string;
  interviewType: 'technical' | 'behavioral' | 'case-study' | 'mixed';
  preparation: {
    technicalQuestions: Array<{
      question: string;
      difficulty: 'easy' | 'medium' | 'hard';
      topics: string[];
      sampleAnswer: string;
    }>;
    behavioralQuestions: Array<{
      question: string;
      framework: string;
      keyPoints: string[];
    }>;
    companyResearch: {
      keyFacts: string[];
      recentNews: string[];
      culture: string[];
      questionsToAsk: string[];
    };
  };
  practiceSchedule: {
    dailyTasks: string[];
    weeklyMilestones: string[];
    finalPreparation: string[];
  };
}

// Portfolio optimization types
export interface PortfolioOptimization {
  currentPortfolio: {
    projects: Array<{
      name: string;
      technologies: string[];
      description: string;
      impact: string;
      url?: string;
    }>;
    strengths: string[];
    gaps: string[];
  };
  recommendations: {
    projectSuggestions: Array<{
      type: string;
      description: string;
      technologies: string[];
      timeEstimate: string;
      impact: 'high' | 'medium' | 'low';
    }>;
    improvementAreas: string[];
    presentationTips: string[];
  };
  targetAudience: {
    recruiters: string[];
    technicalReviewers: string[];
    industryProfessionals: string[];
  };
}

// Networking insights types
export interface NetworkingInsights {
  currentNetwork: {
    size: number;
    industries: string[];
    roles: string[];
    strength: 'weak' | 'moderate' | 'strong';
  };
  opportunities: Array<{
    type: 'events' | 'online-communities' | 'professional-groups' | 'mentorship';
    name: string;
    description: string;
    relevance: number;
    effort: 'low' | 'medium' | 'high';
    expectedOutcome: string;
  }>;
  strategies: {
    immediate: string[];
    ongoing: string[];
    longTerm: string[];
  };
  personalBrand: {
    currentState: string;
    recommendations: string[];
    platforms: string[];
  };
}