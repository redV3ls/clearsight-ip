/**
 * Trends Analysis Core Types
 * 
 * Shared type definitions for the trends analysis system.
 * Provides consistent interfaces across all trend analysis modules.
 */

export interface SkillTrend {
  skillName: string;
  category: string;
  demandScore: number; // 0.0 to 1.0
  growthRate: number; // percentage
  averageSalary?: number;
  jobCount: number;
  lastUpdated: string;
  confidence: number;
  volatility?: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface IndustryTrend {
  industry: string;
  topSkills: string[];
  growthRate: number;
  avgSalary: number;
  totalJobs: number;
  emergingSkills: string[];
  decliningSkills?: string[];
  marketSize?: number;
  competitiveness: 'low' | 'medium' | 'high';
  lastUpdated: string;
}

export interface RegionalTrend {
  region: string;
  country?: string;
  city?: string;
  topSkills: SkillTrend[];
  demandSupplyGap: number;
  salaryIndex: number; // relative to global average
  costOfLiving?: number;
  jobMarketHealth: 'poor' | 'fair' | 'good' | 'excellent';
  lastUpdated: string;
}

export interface EmergingSkill {
  skillName: string;
  category: string;
  emergenceScore: number;
  growthVelocity: number;
  relatedSkills: string[];
  adoptionRate: number;
  predictedDemandPeak: string;
  maturityLevel: 'emerging' | 'growing' | 'mature' | 'declining';
  industryAdoption: string[];
  confidence: number;
}

export interface SkillForecast {
  skillName: string;
  currentDemand: number;
  forecast3Months: number;
  forecast6Months: number;
  forecast1Year: number;
  confidence: number;
  factors: string[];
  methodology: string;
  lastUpdated: string;
  seasonalAdjustment?: number;
}

export interface TrendAnalysisOptions {
  timeWindow?: number; // months
  minConfidence?: number;
  includeSeasonality?: boolean;
  includeExternalFactors?: boolean;
  aggregationLevel?: 'daily' | 'weekly' | 'monthly';
  smoothingFactor?: number;
}

export interface ForecastingOptions {
  horizon: number; // months
  method: 'linear' | 'exponential' | 'arima' | 'ensemble';
  includeSeasonality: boolean;
  confidenceInterval: number;
  externalFactors: string[];
}

export interface AnalysisContext {
  industry?: string;
  region?: string;
  skillCategory?: string;
  timeRange: {
    start: string;
    end: string;
  };
  filters: {
    minJobCount?: number;
    minSalary?: number;
    maxSalary?: number;
    experienceLevel?: string[];
  };
}

export interface TrendMetrics {
  totalSkillsAnalyzed: number;
  emergingSkillsCount: number;
  decliningSkillsCount: number;
  averageGrowthRate: number;
  highestGrowthSkill: string;
  lowestGrowthSkill: string;
  analysisDate: string;
  dataQuality: number; // 0-1 score
}

export interface MarketInsight {
  type: 'opportunity' | 'threat' | 'trend' | 'anomaly';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  affectedSkills: string[];
  timeframe: string;
  actionable: boolean;
}

export interface CompetitiveAnalysis {
  skillName: string;
  marketPosition: 'leader' | 'challenger' | 'follower' | 'niche';
  competitorSkills: string[];
  differentiationFactors: string[];
  marketShare: number;
  growthPotential: number;
  barriers: string[];
  opportunities: string[];
}

export interface SkillCorrelation {
  skill1: string;
  skill2: string;
  correlationCoefficient: number;
  significance: number;
  relationship: 'complementary' | 'substitutable' | 'independent';
  strength: 'weak' | 'moderate' | 'strong';
}

export interface TrendAlert {
  id: string;
  type: 'spike' | 'drop' | 'anomaly' | 'threshold';
  skillName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold: number;
  currentValue: number;
  timestamp: string;
  acknowledged: boolean;
}

export interface DataSource {
  name: string;
  type: 'job_postings' | 'salary_data' | 'search_trends' | 'social_media' | 'surveys';
  reliability: number; // 0-1 score
  updateFrequency: 'real-time' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  coverage: {
    geographic: string[];
    industries: string[];
    skillCategories: string[];
  };
  lastUpdated: string;
}

export interface AnalysisResult<T> {
  data: T;
  metadata: {
    analysisType: string;
    executionTime: number;
    dataPoints: number;
    confidence: number;
    sources: string[];
    timestamp: string;
  };
  insights: MarketInsight[];
  alerts?: TrendAlert[];
}

// Skill categories for classification
export const SKILL_CATEGORIES = {
  PROGRAMMING: 'Programming',
  WEB_DEVELOPMENT: 'Web Development',
  DATA_SCIENCE: 'Data Science',
  CLOUD_COMPUTING: 'Cloud Computing',
  DEVOPS: 'DevOps',
  MOBILE_DEVELOPMENT: 'Mobile Development',
  CYBERSECURITY: 'Cybersecurity',
  AI_ML: 'AI & Machine Learning',
  DATABASE: 'Database',
  DESIGN: 'Design',
  PROJECT_MANAGEMENT: 'Project Management',
  SOFT_SKILLS: 'Soft Skills',
  BLOCKCHAIN: 'Blockchain',
  IOT: 'Internet of Things',
  GAME_DEVELOPMENT: 'Game Development'
} as const;

// Industry categories
export const INDUSTRY_CATEGORIES = {
  TECHNOLOGY: 'Technology',
  FINANCE: 'Finance',
  HEALTHCARE: 'Healthcare',
  EDUCATION: 'Education',
  MANUFACTURING: 'Manufacturing',
  RETAIL: 'Retail',
  CONSULTING: 'Consulting',
  MEDIA: 'Media & Entertainment',
  GOVERNMENT: 'Government',
  NONPROFIT: 'Non-Profit',
  AUTOMOTIVE: 'Automotive',
  AEROSPACE: 'Aerospace',
  ENERGY: 'Energy',
  TELECOMMUNICATIONS: 'Telecommunications',
  REAL_ESTATE: 'Real Estate'
} as const;

// Regional categories
export const REGIONAL_CATEGORIES = {
  NORTH_AMERICA: 'North America',
  EUROPE: 'Europe',
  ASIA_PACIFIC: 'Asia Pacific',
  LATIN_AMERICA: 'Latin America',
  MIDDLE_EAST_AFRICA: 'Middle East & Africa'
} as const;

// Trend analysis thresholds
export const TREND_THRESHOLDS = {
  HIGH_GROWTH: 0.3, // 30% growth
  MODERATE_GROWTH: 0.1, // 10% growth
  STABLE: 0.05, // ±5% change
  DECLINE: -0.1, // -10% decline
  RAPID_DECLINE: -0.3, // -30% decline
  MIN_CONFIDENCE: 0.6,
  MIN_DATA_POINTS: 10,
  EMERGENCE_THRESHOLD: 0.7,
  VOLATILITY_THRESHOLD: 0.2
} as const;

// Forecasting parameters
export const FORECASTING_PARAMS = {
  DEFAULT_HORIZON: 12, // months
  MIN_HISTORICAL_DATA: 6, // months
  MAX_HORIZON: 36, // months
  DEFAULT_CONFIDENCE: 0.8,
  SEASONAL_WINDOW: 12, // months
  TREND_WINDOW: 6 // months
} as const;

// Analysis quality metrics
export const QUALITY_METRICS = {
  MIN_SAMPLE_SIZE: 100,
  MIN_COVERAGE: 0.7, // 70% coverage
  MAX_MISSING_DATA: 0.2, // 20% missing data
  MIN_FRESHNESS: 7, // days
  MIN_RELIABILITY: 0.8
} as const;

// Mock data configurations
export const MOCK_DATA_CONFIG = {
  SKILLS_COUNT: 50,
  INDUSTRIES_COUNT: 15,
  REGIONS_COUNT: 20,
  TIME_SERIES_LENGTH: 24, // months
  NOISE_FACTOR: 0.1, // 10% noise
  TREND_PROBABILITY: 0.7, // 70% chance of having a trend
  SEASONAL_PROBABILITY: 0.3 // 30% chance of seasonality
} as const;

// Error types
export interface TrendsAnalysisError {
  code: string;
  message: string;
  type: 'data' | 'computation' | 'validation' | 'system';
  retryable: boolean;
  context?: Record<string, any>;
}

// Cache configurations
export interface CacheConfig {
  enabled: boolean;
  ttl: number; // seconds
  maxSize: number;
  keyPrefix: string;
  compressionEnabled: boolean;
}

// Analysis job configurations
export interface AnalysisJobConfig {
  name: string;
  schedule: string; // cron expression
  enabled: boolean;
  timeout: number; // milliseconds
  retryAttempts: number;
  dependencies: string[];
  parameters: Record<string, any>;
}

// Default configurations
export const DEFAULT_ANALYSIS_OPTIONS: TrendAnalysisOptions = {
  timeWindow: 12,
  minConfidence: 0.6,
  includeSeasonality: true,
  includeExternalFactors: false,
  aggregationLevel: 'monthly',
  smoothingFactor: 0.3
};

export const DEFAULT_FORECASTING_OPTIONS: ForecastingOptions = {
  horizon: 12,
  method: 'ensemble',
  includeSeasonality: true,
  confidenceInterval: 0.8,
  externalFactors: []
};

export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  enabled: true,
  ttl: 3600, // 1 hour
  maxSize: 1000,
  keyPrefix: 'trends_',
  compressionEnabled: true
};