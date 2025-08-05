import { z } from 'zod';

/**
 * Request Type Definitions for Analysis Routes
 * 
 * Centralized type definitions for all analysis request types.
 * Provides type safety and validation schemas.
 */

// Base analysis request schema
export const baseAnalysisRequestSchema = z.object({
  includeSkillsGap: z.boolean().optional().default(false),
  includeCareerSuggestions: z.boolean().optional().default(false),
  includeIndustryTrends: z.boolean().optional().default(false),
});

// Resume analysis request schema
export const resumeAnalysisRequestSchema = baseAnalysisRequestSchema.extend({
  resumeText: z.string().max(50000).optional(),
  jobDescriptionText: z.string().max(50000).optional(),
});

// Team analysis request schema
export const teamAnalysisRequestSchema = z.object({
  teamMembers: z.array(z.object({
    id: z.string(),
    name: z.string(),
    skills: z.array(z.string()),
    experience: z.number().min(0),
    role: z.string(),
  })),
  projectRequirements: z.object({
    skills: z.array(z.string()),
    timeline: z.number(),
    complexity: z.enum(['low', 'medium', 'high']),
  }),
});

// Gap analysis request schema
export const gapAnalysisRequestSchema = z.object({
  currentSkills: z.array(z.object({
    name: z.string(),
    level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
    experience: z.number().min(0),
  })),
  targetRole: z.string(),
  targetSkills: z.array(z.string()),
});

// Trends analysis request schema
export const trendsAnalysisRequestSchema = z.object({
  industry: z.string(),
  skills: z.array(z.string()).optional(),
  timeframe: z.enum(['6months', '1year', '3years']).default('1year'),
  region: z.string().optional(),
});

// File upload constraints
export const FILE_CONSTRAINTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_JOB_FILE_SIZE: 2 * 1024 * 1024, // 2MB
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ],
  MAX_TEXT_LENGTH: 50000, // 50k characters
} as const;

// Type exports
export type BaseAnalysisRequest = z.infer<typeof baseAnalysisRequestSchema>;
export type ResumeAnalysisRequest = z.infer<typeof resumeAnalysisRequestSchema>;
export type TeamAnalysisRequest = z.infer<typeof teamAnalysisRequestSchema>;
export type GapAnalysisRequest = z.infer<typeof gapAnalysisRequestSchema>;
export type TrendsAnalysisRequest = z.infer<typeof trendsAnalysisRequestSchema>;