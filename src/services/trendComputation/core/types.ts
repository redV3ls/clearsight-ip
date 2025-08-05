/**
 * Trend Computation Core Types
 * 
 * Shared type definitions for the trend computation system.
 * Provides consistent interfaces across all computation modules.
 */

export interface TrendComputationConfig {
  updateFrequency: 'hourly' | 'daily' | 'weekly';
  enabledJobs: string[];
  dataRetentionDays: number;
  forecastHorizonMonths: number;
  maxConcurrentJobs?: number;
  jobTimeout?: number;
  retryAttempts?: number;
}

export interface ComputationJobResult {
  jobName: string;
  status: 'success' | 'error' | 'partial' | 'skipped';
  recordsProcessed: number;
  recordsUpdated: number;
  executionTimeMs: number;
  errors?: string[];
  warnings?: string[];
  lastRun: string;
  nextRun?: string;
  metadata?: Record<string, any>;
}

export interface JobExecutionContext {
  jobName: string;
  config: TrendComputationConfig;
  startTime: number;
  retryCount: number;
  dependencies: string[];
}

export interface SkillTrendData {
  skillName: string;
  currentDemand: number;
  growthRate: number;
  confidence: number;
  dataPoints: number;
  lastUpdated: string;
  trend: 'increasing' | 'stable' | 'decreasing';
  volatility: number;
}

export interface EmergingSkillData {
  skillName: string;
  emergenceScore: number;
  growthVelocity: number;
  adoptionRate: number;
  relatedSkills: string[];
  industries: string[];
  confidence: number;
  firstDetected: string;
  category: string;
}

export interface RegionalTrendData {
  region: string;
  country: string;
  city?: string;
  skillName: string;
  demandLevel: number;
  growthRate: number;
  salaryTrend: number;
  jobCount: number;
  lastUpdated: string;
}

export interface ForecastData {
  skillName: string;
  forecastHorizon: number; // months
  predictedDemand: number;
  confidence: number;
  methodology: string;
  factors: string[];
  createdAt: string;
  validatedAt?: string;
  actualValue?: number;
  accuracy?: number;
}

export interface ValidationResult {
  skillName: string;
  forecastHorizon: string;
  predictedValue: number;
  actualValue: number;
  accuracy: number;
  error: number;
  validatedAt: string;
}

export interface JobSchedule {
  jobName: string;
  cronExpression: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  dependencies: string[];
  priority: number;
  timeout: number;
  retryPolicy: {
    maxAttempts: number;
    backoffMultiplier: number;
    maxBackoffMs: number;
  };
}

export interface ComputationMetrics {
  jobName: string;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  averageExecutionTime: number;
  lastExecutionTime: number;
  averageRecordsProcessed: number;
  errorRate: number;
  lastError?: string;
  lastSuccess?: string;
}

export interface DataQualityMetrics {
  source: string;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  duplicateRecords: number;
  missingFields: Record<string, number>;
  dataFreshness: number; // hours since last update
  qualityScore: number; // 0-1
}

export interface TrendComputationState {
  isRunning: boolean;
  currentJob?: string;
  queuedJobs: string[];
  completedJobs: string[];
  failedJobs: string[];
  startTime?: string;
  estimatedCompletion?: string;
}

// Job types enum
export enum JobType {
  SKILL_DEMAND_TRENDS = 'updateSkillDemandTrends',
  EMERGING_SKILLS = 'computeEmergingSkills',
  REGIONAL_TRENDS = 'updateRegionalTrends',
  FORECASTS = 'generateForecasts',
  CLEANUP = 'cleanupOldData',
  VALIDATION = 'validateForecasts',
  DATA_COLLECTION = 'collectExternalData'
}

// Job priorities
export enum JobPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  CRITICAL = 4
}

// Computation strategies
export type ComputationStrategy = 
  | 'incremental' // Only process new/changed data
  | 'full' // Process all data
  | 'smart' // Automatically choose based on data age
  | 'parallel' // Process multiple segments in parallel
  | 'batch'; // Process in batches

// Error types
export interface ComputationError {
  code: string;
  message: string;
  jobName: string;
  timestamp: string;
  retryable: boolean;
  context?: Record<string, any>;
}

// Data source configurations
export interface DataSourceConfig {
  name: string;
  type: 'api' | 'database' | 'file' | 'stream';
  endpoint?: string;
  credentials?: Record<string, string>;
  refreshInterval: number;
  timeout: number;
  retryPolicy: {
    maxAttempts: number;
    backoffMs: number;
  };
  validation: {
    required: boolean;
    schema?: Record<string, any>;
  };
}

// Computation algorithms
export interface AlgorithmConfig {
  name: string;
  type: 'statistical' | 'ml' | 'rule-based' | 'hybrid';
  parameters: Record<string, any>;
  version: string;
  accuracy?: number;
  lastTrained?: string;
}

// Trend analysis parameters
export interface TrendAnalysisParams {
  timeWindow: number; // days
  minDataPoints: number;
  confidenceThreshold: number;
  smoothingFactor: number;
  seasonalityAdjustment: boolean;
  outlierDetection: boolean;
}

// Forecast parameters
export interface ForecastParams {
  method: 'linear' | 'exponential' | 'arima' | 'ml';
  horizon: number; // months
  confidence: number;
  includeSeasonality: boolean;
  includeExternalFactors: boolean;
  validationSplit: number;
}

// Regional analysis parameters
export interface RegionalAnalysisParams {
  regions: string[];
  aggregationLevel: 'city' | 'state' | 'country' | 'continent';
  populationWeighting: boolean;
  economicFactors: boolean;
  currencyNormalization: boolean;
}

// Data quality thresholds
export const DATA_QUALITY_THRESHOLDS = {
  MIN_RECORDS: 100,
  MIN_VALIDITY_RATE: 0.8,
  MAX_DUPLICATE_RATE: 0.1,
  MAX_MISSING_RATE: 0.2,
  MIN_FRESHNESS_HOURS: 24,
  MIN_QUALITY_SCORE: 0.7
} as const;

// Default configurations
export const DEFAULT_TREND_CONFIG: TrendComputationConfig = {
  updateFrequency: 'daily',
  enabledJobs: [
    JobType.SKILL_DEMAND_TRENDS,
    JobType.EMERGING_SKILLS,
    JobType.REGIONAL_TRENDS,
    JobType.FORECASTS,
    JobType.CLEANUP
  ],
  dataRetentionDays: 365,
  forecastHorizonMonths: 24,
  maxConcurrentJobs: 3,
  jobTimeout: 3600000, // 1 hour
  retryAttempts: 3
};

export const DEFAULT_JOB_SCHEDULES: JobSchedule[] = [
  {
    jobName: JobType.SKILL_DEMAND_TRENDS,
    cronExpression: '0 2 * * *', // Daily at 2 AM
    enabled: true,
    dependencies: [],
    priority: JobPriority.HIGH,
    timeout: 1800000, // 30 minutes
    retryPolicy: {
      maxAttempts: 3,
      backoffMultiplier: 2,
      maxBackoffMs: 300000
    }
  },
  {
    jobName: JobType.EMERGING_SKILLS,
    cronExpression: '0 3 * * *', // Daily at 3 AM
    enabled: true,
    dependencies: [JobType.SKILL_DEMAND_TRENDS],
    priority: JobPriority.NORMAL,
    timeout: 2400000, // 40 minutes
    retryPolicy: {
      maxAttempts: 3,
      backoffMultiplier: 2,
      maxBackoffMs: 300000
    }
  },
  {
    jobName: JobType.REGIONAL_TRENDS,
    cronExpression: '0 4 * * *', // Daily at 4 AM
    enabled: true,
    dependencies: [JobType.SKILL_DEMAND_TRENDS],
    priority: JobPriority.NORMAL,
    timeout: 3600000, // 1 hour
    retryPolicy: {
      maxAttempts: 2,
      backoffMultiplier: 2,
      maxBackoffMs: 600000
    }
  },
  {
    jobName: JobType.FORECASTS,
    cronExpression: '0 5 * * 0', // Weekly on Sunday at 5 AM
    enabled: true,
    dependencies: [JobType.SKILL_DEMAND_TRENDS, JobType.EMERGING_SKILLS],
    priority: JobPriority.NORMAL,
    timeout: 7200000, // 2 hours
    retryPolicy: {
      maxAttempts: 2,
      backoffMultiplier: 3,
      maxBackoffMs: 900000
    }
  },
  {
    jobName: JobType.CLEANUP,
    cronExpression: '0 1 * * 0', // Weekly on Sunday at 1 AM
    enabled: true,
    dependencies: [],
    priority: JobPriority.LOW,
    timeout: 1800000, // 30 minutes
    retryPolicy: {
      maxAttempts: 2,
      backoffMultiplier: 2,
      maxBackoffMs: 300000
    }
  }
];

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
  SOFT_SKILLS: 'Soft Skills'
} as const;

// Industry mappings
export const INDUSTRY_SKILL_MAP = {
  'Technology': ['JavaScript', 'Python', 'React', 'AWS', 'Docker'],
  'Finance': ['Python', 'SQL', 'Risk Management', 'Blockchain', 'Excel'],
  'Healthcare': ['Data Analysis', 'Python', 'Machine Learning', 'SQL', 'Compliance'],
  'Manufacturing': ['Lean Manufacturing', 'Six Sigma', 'AutoCAD', 'Python', 'IoT'],
  'Retail': ['E-commerce', 'Digital Marketing', 'Analytics', 'Customer Service', 'SQL']
} as const;

// Regional mappings
export const REGION_MAPPINGS = {
  'North America': ['USA', 'Canada', 'Mexico'],
  'Europe': ['Germany', 'UK', 'France', 'Netherlands', 'Spain'],
  'Asia Pacific': ['China', 'Japan', 'India', 'Australia', 'Singapore'],
  'Latin America': ['Brazil', 'Argentina', 'Chile', 'Colombia'],
  'Middle East & Africa': ['UAE', 'South Africa', 'Israel', 'Saudi Arabia']
} as const;