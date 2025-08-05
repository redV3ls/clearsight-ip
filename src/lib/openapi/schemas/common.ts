import { z } from 'zod';

/**
 * Common OpenAPI Schemas
 * 
 * Shared schemas used across multiple endpoints.
 * Provides consistency and reusability for common data structures.
 */

// Base response schema
export const BaseResponseSchema = z.object({
  success: z.boolean(),
  timestamp: z.string().datetime(),
  version: z.string()
});

// Success response schema
export const SuccessResponseSchema = BaseResponseSchema.extend({
  success: z.literal(true),
  data: z.any(),
  meta: z.object({
    timestamp: z.string().datetime(),
    version: z.string(),
    processingTime: z.number().optional()
  }).optional()
});

// Error response schema
export const ErrorResponseSchema = BaseResponseSchema.extend({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional()
  })
});

// Pagination schema
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0)
});

// Skill level enum
export const SkillLevelSchema = z.enum(['beginner', 'intermediate', 'advanced', 'expert']);

// Career level enum
export const CareerLevelSchema = z.enum(['entry', 'mid', 'senior', 'executive']);

// Skill schema
export const SkillSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().min(1).max(50),
  level: SkillLevelSchema,
  confidence: z.number().min(0).max(1),
  yearsExperience: z.number().min(0).max(50),
  context: z.string().optional(),
  relatedSkills: z.array(z.string()).optional()
});

// Skill gap schema
export const SkillGapSchema = z.object({
  skillName: z.string(),
  currentLevel: SkillLevelSchema.optional(),
  requiredLevel: SkillLevelSchema,
  gapSeverity: z.enum(['critical', 'moderate', 'minor']),
  priority: z.number().int().min(1).max(10),
  timeToCompetency: z.number().min(0),
  recommendations: z.array(z.string())
});

// Career suggestion schema
export const CareerSuggestionSchema = z.object({
  title: z.string(),
  description: z.string(),
  matchScore: z.number().min(0).max(100),
  requiredSkills: z.array(z.string()),
  salaryRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    currency: z.string().length(3)
  }),
  timeToTransition: z.number().min(0)
});

// Industry trend schema
export const IndustryTrendSchema = z.object({
  skill: z.string(),
  trend: z.enum(['rising', 'stable', 'declining']),
  demandLevel: z.enum(['high', 'medium', 'low']),
  salaryImpact: z.number(),
  timeframe: z.string()
});

// File upload schema
export const FileUploadSchema = z.object({
  name: z.string(),
  size: z.number().int().min(0),
  type: z.string(),
  lastModified: z.number().optional()
});

// Analysis options schema
export const AnalysisOptionsSchema = z.object({
  includeSkillsGap: z.boolean().default(false),
  includeCareerSuggestions: z.boolean().default(false),
  includeIndustryTrends: z.boolean().default(false)
});

// Common error codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  AUTHORIZATION_FAILED: 'AUTHORIZATION_FAILED',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  ANALYSIS_FAILED: 'ANALYSIS_FAILED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const;