import { z } from 'zod';
import { SuccessResponseSchema, PaginationSchema, SkillSchema } from './common';

/**
 * Users OpenAPI Schemas
 * 
 * Schemas for user management, profiles, and user-related operations.
 * Includes user CRUD operations, preferences, and skill management.
 */

// User profile update schema
export const UserProfileUpdateSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional(),
  linkedinUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  phoneNumber: z.string().max(20).optional()
});

// User preferences schema
export const UserPreferencesSchema = z.object({
  language: z.string().length(2).default('en'),
  timezone: z.string().default('UTC'),
  dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).default('MM/DD/YYYY'),
  notifications: z.object({
    email: z.boolean().default(true),
    analysis: z.boolean().default(true),
    trends: z.boolean().default(false),
    marketing: z.boolean().default(false),
    weeklyDigest: z.boolean().default(true)
  }),
  privacy: z.object({
    profileVisibility: z.enum(['public', 'private', 'connections']).default('private'),
    showEmail: z.boolean().default(false),
    showLocation: z.boolean().default(true),
    allowAnalytics: z.boolean().default(true)
  })
});

// User skill entry schema
export const UserSkillEntrySchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().min(1).max(50),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  yearsExperience: z.number().min(0).max(50),
  certifications: z.array(z.string()).optional(),
  endorsements: z.number().int().min(0).optional(),
  lastUsed: z.string().datetime().optional(),
  isVerified: z.boolean().default(false)
});

// User experience entry schema
export const UserExperienceSchema = z.object({
  id: z.string().uuid().optional(),
  company: z.string().min(1).max(100),
  position: z.string().min(1).max(100),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().max(1000).optional(),
  skills: z.array(z.string()).optional(),
  achievements: z.array(z.string()).optional(),
  location: z.string().max(100).optional()
});

// User education entry schema
export const UserEducationSchema = z.object({
  id: z.string().uuid().optional(),
  institution: z.string().min(1).max(100),
  degree: z.string().min(1).max(100),
  fieldOfStudy: z.string().min(1).max(100).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  isCurrent: z.boolean().default(false),
  gpa: z.number().min(0).max(4).optional(),
  honors: z.array(z.string()).optional(),
  relevantCoursework: z.array(z.string()).optional()
});

// Complete user profile schema
export const CompleteUserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  bio: z.string().nullable(),
  location: z.string().nullable(),
  website: z.string().nullable(),
  linkedinUrl: z.string().nullable(),
  githubUrl: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lastLoginAt: z.string().datetime().nullable(),
  isEmailVerified: z.boolean(),
  role: z.enum(['user', 'admin', 'premium']),
  preferences: UserPreferencesSchema,
  skills: z.array(UserSkillEntrySchema),
  experience: z.array(UserExperienceSchema),
  education: z.array(UserEducationSchema),
  stats: z.object({
    totalAnalyses: z.number().int().min(0),
    skillsTracked: z.number().int().min(0),
    profileCompleteness: z.number().min(0).max(100),
    lastAnalysisDate: z.string().datetime().nullable()
  })
});

// User list item schema (for admin/search results)
export const UserListItemSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  role: z.enum(['user', 'admin', 'premium']),
  createdAt: z.string().datetime(),
  lastLoginAt: z.string().datetime().nullable(),
  isEmailVerified: z.boolean(),
  stats: z.object({
    totalAnalyses: z.number().int().min(0),
    profileCompleteness: z.number().min(0).max(100)
  })
});

// User search/filter schema
export const UserSearchSchema = z.object({
  query: z.string().max(100).optional(),
  role: z.enum(['user', 'admin', 'premium']).optional(),
  isEmailVerified: z.boolean().optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
  lastLoginAfter: z.string().datetime().optional(),
  skills: z.array(z.string()).optional(),
  location: z.string().max(100).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'lastLoginAt', 'email', 'profileCompleteness']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Response schemas
export const UserProfileResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    user: CompleteUserProfileSchema
  })
});

export const UserListResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    users: z.array(UserListItemSchema),
    pagination: PaginationSchema
  })
});

export const UserSkillsResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    skills: z.array(UserSkillEntrySchema),
    categories: z.array(z.object({
      name: z.string(),
      count: z.number().int().min(0),
      averageLevel: z.number().min(0).max(4)
    })),
    stats: z.object({
      totalSkills: z.number().int().min(0),
      averageExperience: z.number().min(0),
      topCategories: z.array(z.string())
    })
  })
});

export const UserExperienceResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    experience: z.array(UserExperienceSchema),
    stats: z.object({
      totalExperience: z.number().min(0), // in years
      companiesWorked: z.number().int().min(0),
      currentPosition: UserExperienceSchema.nullable(),
      careerProgression: z.array(z.object({
        year: z.number().int(),
        position: z.string(),
        company: z.string()
      }))
    })
  })
});

export const UserEducationResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    education: z.array(UserEducationSchema),
    stats: z.object({
      highestDegree: z.string().nullable(),
      institutions: z.array(z.string()),
      fieldsOfStudy: z.array(z.string()),
      graduationYears: z.array(z.number().int())
    })
  })
});

// User activity schema
export const UserActivitySchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.enum(['login', 'analysis', 'profile_update', 'skill_update', 'password_change']),
  description: z.string(),
  metadata: z.any().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  createdAt: z.string().datetime()
});

export const UserActivityResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    activities: z.array(UserActivitySchema),
    pagination: PaginationSchema
  })
});