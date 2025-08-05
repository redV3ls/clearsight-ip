import { z } from 'zod';
import { 
  SuccessResponseSchema, 
  SkillSchema, 
  SkillGapSchema, 
  CareerSuggestionSchema, 
  IndustryTrendSchema,
  AnalysisOptionsSchema,
  FileUploadSchema
} from './common';

/**
 * Analysis OpenAPI Schemas
 * 
 * Schemas for skills analysis, resume analysis, and career insights endpoints.
 * Includes request/response schemas for all analysis types.
 */

// Resume analysis request schema (multipart form)
export const ResumeAnalysisRequestSchema = z.object({
  resume: z.instanceof(File).optional(),
  resumeText: z.string().max(50000).optional(),
  jobDescription: z.instanceof(File).optional(),
  jobDescriptionText: z.string().max(50000).optional(),
  includeSkillsGap: z.boolean().default(false),
  includeCareerSuggestions: z.boolean().default(false),
  includeIndustryTrends: z.boolean().default(false)
}).refine((data) => data.resume || data.resumeText, {
  message: "Either resume file or resume text is required"
});

// Resume analysis request schema (JSON)
export const ResumeAnalysisJSONRequestSchema = z.object({
  resumeText: z.string().min(50).max(50000),
  jobDescriptionText: z.string().max(50000).optional(),
  options: AnalysisOptionsSchema.optional()
});

// Team member schema
export const TeamMemberSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  skills: z.array(z.string()).min(1),
  experience: z.number().min(0).max(50),
  role: z.string().min(1).max(100),
  availability: z.number().min(0).max(1).optional()
});

// Project requirements schema
export const ProjectRequirementsSchema = z.object({
  skills: z.array(z.string()).min(1),
  timeline: z.number().min(1),
  complexity: z.enum(['low', 'medium', 'high']),
  budget: z.number().min(0).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium')
});

// Team analysis request schema
export const TeamAnalysisRequestSchema = z.object({
  teamMembers: z.array(TeamMemberSchema).min(1).max(50),
  projectRequirements: ProjectRequirementsSchema
});

// Gap analysis request schema
export const GapAnalysisRequestSchema = z.object({
  currentSkills: z.array(SkillSchema).min(1),
  targetRole: z.string().min(1).max(100),
  targetSkills: z.array(z.string()).min(1),
  timeframe: z.number().min(1).max(60).optional() // months
});

// Trends analysis request schema
export const TrendsAnalysisRequestSchema = z.object({
  industry: z.string().min(1).max(100),
  skills: z.array(z.string()).optional(),
  timeframe: z.enum(['6months', '1year', '3years']).default('1year'),
  region: z.string().max(50).optional()
});

// Skills analysis result schema
export const SkillsAnalysisResultSchema = z.object({
  skills: z.array(SkillSchema),
  overallExperience: z.string(),
  careerLevel: z.enum(['entry', 'mid', 'senior', 'executive']),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  categories: z.array(z.string()),
  totalSkills: z.number().int().min(0)
});

// Resume analysis response schema
export const ResumeAnalysisResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    analysisId: z.string(),
    userId: z.string(),
    skillsAnalysis: SkillsAnalysisResultSchema,
    skillGaps: z.array(SkillGapSchema).optional(),
    careerSuggestions: z.array(CareerSuggestionSchema).optional(),
    industryTrends: z.array(IndustryTrendSchema).optional(),
    metadata: z.object({
      processingTime: z.number(),
      analysisOptions: AnalysisOptionsSchema,
      fileInfo: z.object({
        resumeFile: FileUploadSchema.nullable(),
        jobDescriptionFile: FileUploadSchema.nullable()
      }).optional()
    })
  })
});

// Team analysis response schema
export const TeamAnalysisResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    teamStrengths: z.array(z.string()),
    skillGaps: z.array(SkillGapSchema),
    recommendations: z.array(z.string()),
    riskAssessment: z.object({
      level: z.enum(['low', 'medium', 'high']),
      factors: z.array(z.string()),
      mitigation: z.array(z.string()).optional()
    }),
    timeline: z.object({
      estimated: z.number(),
      confidence: z.number().min(0).max(1),
      factors: z.array(z.string()).optional()
    }),
    resourceAllocation: z.object({
      optimal: z.array(z.object({
        memberId: z.string(),
        allocation: z.number().min(0).max(1),
        tasks: z.array(z.string())
      })),
      alternatives: z.array(z.any()).optional()
    }).optional()
  })
});

// Gap analysis response schema
export const GapAnalysisResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    overallMatch: z.number().min(0).max(100),
    skillGaps: z.array(SkillGapSchema),
    strengths: z.array(SkillSchema),
    learningPlan: z.object({
      immediate: z.array(z.object({
        skill: z.string(),
        action: z.string(),
        timeframe: z.string(),
        resources: z.array(z.string()).optional()
      })),
      shortTerm: z.array(z.object({
        skill: z.string(),
        action: z.string(),
        timeframe: z.string(),
        resources: z.array(z.string()).optional()
      })),
      longTerm: z.array(z.object({
        skill: z.string(),
        action: z.string(),
        timeframe: z.string(),
        resources: z.array(z.string()).optional()
      }))
    }),
    careerPaths: z.array(CareerSuggestionSchema),
    marketInsights: z.array(z.string()).optional()
  })
});

// Trends analysis response schema
export const TrendsAnalysisResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    industry: z.string(),
    timeframe: z.string(),
    trends: z.array(IndustryTrendSchema),
    insights: z.array(z.string()),
    recommendations: z.array(z.string()),
    marketOutlook: z.object({
      growth: z.enum(['positive', 'neutral', 'negative']),
      confidence: z.number().min(0).max(1),
      factors: z.array(z.string())
    }),
    emergingSkills: z.array(z.object({
      skill: z.string(),
      growthRate: z.number(),
      adoptionLevel: z.enum(['early', 'growing', 'mainstream']),
      timeToMature: z.number().optional()
    })).optional()
  })
});

// Analysis history schema
export const AnalysisHistorySchema = z.object({
  id: z.string(),
  type: z.enum(['resume', 'team', 'gap', 'trends']),
  createdAt: z.string().datetime(),
  status: z.enum(['completed', 'failed', 'processing']),
  summary: z.string().optional(),
  metadata: z.any().optional()
});

// Analysis history response schema
export const AnalysisHistoryResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    analyses: z.array(AnalysisHistorySchema),
    pagination: z.object({
      page: z.number().int().min(1),
      limit: z.number().int().min(1),
      total: z.number().int().min(0),
      totalPages: z.number().int().min(0)
    })
  })
});