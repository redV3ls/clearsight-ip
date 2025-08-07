import { Hono } from 'hono';
import { z } from 'zod';
import { Env } from '../index';
import { AuthenticatedContext, requireAuth } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { validateRequest, gapAnalysisRequestSchema, teamAnalysisRequestSchema } from '../schemas/validation';
import { GapAnalysisService } from '../services/gapAnalysis';
import { SkillMatchingService, UserSkill } from '../services/skillMatching';
import { JobAnalysisService, JobSkillRequirement } from '../services/jobAnalysis';
import { TrendsAnalysisService } from '../services/trendsAnalysis';
import { TeamAnalysisService, TeamMember, ProjectRequirements } from '../services/teamAnalysis';
import { createDatabase } from '../config/database';
import { CacheService, CacheNamespaces, CacheTTL } from '../services/cache';

const analyze = new Hono<{ Bindings: Env }>();

// Authentication is handled at the app level, no need to apply it here

// Security constants for file uploads
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_JOB_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];
const MAX_TEXT_LENGTH = 50000; // 50k characters

/**
 * POST /analyze/resume - Resume/CV analysis with file upload support
 * Analyzes uploaded resume files or text against job descriptions
 */
analyze.post('/resume', async (c: AuthenticatedContext) => {
  const startTime = Date.now();
  const userId = c.user?.id || 'anonymous';

  try {
    // Parse form data
    const formData = await c.req.formData();
    const resumeText = formData.get('resumeText') as string | null;
    const resumeFile = formData.get('resume') as File | null;

    // Get resume content
    let content = '';
    if (resumeFile) {
      content = await resumeFile.text();
    } else if (resumeText) {
      content = resumeText;
    } else {
      return c.json({
        error: {
          code: 'MISSING_CONTENT',
          message: 'Please provide resume text or upload a file'
        }
      }, 400);
    }

    // Initialize AI-powered analysis service
    const { AIAnalysisService } = await import('../services/aiAnalysisService');
    const aiAnalysisService = new AIAnalysisService(c.env);

    // Get job description if provided
    const jobDescription = formData.get('jobDescriptionText') as string | null || '';

    // Perform AI-powered analysis using DeepSeek
    const response = await aiAnalysisService.analyzeCV(
      content,
      jobDescription,
      {
        includeSkillsGap: !!jobDescription, // Only if job description provided
        includeCareerSuggestions: false, // Disable to speed up
        includeIndustryTrends: false, // Disable to speed up
      }
    );

    // Set the user ID and timestamp
    response.user_id = userId;
    response.timestamp = new Date().toISOString();
    response.analysis_id = crypto.randomUUID();

    // Save analysis result to database for later retrieval
    try {
      await c.env.DB
        .prepare(`
          INSERT INTO resume_analyses (
            id, user_id, analysis_data, created_at
          ) VALUES (?, ?, ?, ?)
        `)
        .bind(
          response.analysis_id,
          userId,
          JSON.stringify(response),
          new Date().toISOString()
        )
        .run();
    } catch (dbError) {
      // Log error but don't fail the request
      console.warn('Failed to save analysis result:', dbError);
    }

    return c.json(response, 200);

  } catch (error) {
    console.error('Analysis error:', error);

    // Return error response when AI service fails
    return c.json({
      error: {
        code: 'AI_SERVICE_UNAVAILABLE',
        message: 'AI analysis service is temporarily unavailable. Please try again later.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString(),
      analysis_id: crypto.randomUUID(),
      user_id: userId
    }, 503);
  }
});

/**
 * GET /analyze/resume/:analysisId - Retrieve a specific resume analysis
 */
analyze.get('/resume/:analysisId', async (c: AuthenticatedContext) => {
  const analysisId = c.req.param('analysisId');
  const userId = c.user?.id || 'anonymous';

  try {
    const analysis = await c.env.DB
      .prepare('SELECT * FROM resume_analyses WHERE id = ? AND user_id = ?')
      .bind(analysisId, userId)
      .first() as any;

    if (!analysis) {
      return c.json({
        error: {
          code: 'ANALYSIS_NOT_FOUND',
          message: 'Resume analysis not found'
        }
      }, 404);
    }

    const analysisData = JSON.parse(analysis.analysis_data);

    return c.json({
      ...analysisData,
      retrieved_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Retrieve analysis error:', error);
    return c.json({
      error: {
        code: 'RETRIEVAL_FAILED',
        message: 'Failed to retrieve resume analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, 500);
  }
});

/**
 * GET /analyze/resume/history - Get user's resume analysis history
 */
analyze.get('/resume/history', async (c: AuthenticatedContext) => {
  const userId = c.user?.id || 'anonymous';

  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = Math.min(parseInt(c.req.query('limit') || '10'), 50);
    const offset = (page - 1) * limit;

    const analyses = await c.env.DB
      .prepare(`
        SELECT id, created_at, 
               JSON_EXTRACT(analysis_data, '$.timestamp') as analysis_timestamp,
               JSON_EXTRACT(analysis_data, '$.aiPowered') as ai_powered,
               JSON_EXTRACT(analysis_data, '$.skillsAnalysis.totalSkills') as total_skills
        FROM resume_analyses 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `)
      .bind(userId, limit, offset)
      .all();

    const totalCount = await c.env.DB
      .prepare('SELECT COUNT(*) as count FROM resume_analyses WHERE user_id = ?')
      .bind(userId)
      .first() as any;

    return c.json({
      analyses: analyses.results?.map((analysis: any) => ({
        id: analysis.id,
        created_at: analysis.created_at,
        analysis_timestamp: analysis.analysis_timestamp,
        ai_powered: analysis.ai_powered === 1 || analysis.ai_powered === true,
        total_skills: analysis.total_skills || 0
      })) || [],
      pagination: {
        page,
        limit,
        total: totalCount?.count || 0,
        pages: Math.ceil((totalCount?.count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Get analysis history error:', error);
    return c.json({
      error: {
        code: 'HISTORY_RETRIEVAL_FAILED',
        message: 'Failed to retrieve analysis history',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, 500);
  }
});

// Helper function to extract text from uploaded files
async function extractTextFromFile(file: File): Promise<string> {
  try {
    if (file.type === 'text/plain') {
      return await file.text();
    }

    // For PDF and DOC files, we'll simulate text extraction
    // In a real implementation, you'd use libraries like pdf-parse or mammoth
    const content = await file.text();

    // Basic text cleaning and extraction simulation
    return content
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, MAX_TEXT_LENGTH); // Ensure length limit

  } catch (error) {
    throw new AppError('Failed to extract text from file', 400, 'TEXT_EXTRACTION_FAILED');
  }
}

// Helper function to analyze resume content and extract skills
async function analyzeResumeContent(content: string): Promise<{
  skills: Array<{
    name: string;
    category: string;
    level: string;
    confidence: number;
    yearsExperience: number;
    certifications: string[];
  }>;
  categories: string[];
  experience: string;
  education: string[];
  certifications: string[];
}> {
  // This is a simplified implementation
  // In production, you'd use NLP libraries or AI services for better extraction

  const skillKeywords = {
    'Programming': ['javascript', 'python', 'java', 'react', 'node.js', 'typescript', 'html', 'css', 'sql'],
    'Cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform'],
    'Data': ['machine learning', 'data analysis', 'pandas', 'numpy', 'tensorflow', 'pytorch'],
    'Management': ['project management', 'team leadership', 'agile', 'scrum', 'product management'],
    'Design': ['ui/ux', 'figma', 'photoshop', 'design thinking', 'user research']
  };

  const contentLower = content.toLowerCase();
  const extractedSkills: Array<{
    name: string;
    category: string;
    level: string;
    confidence: number;
    yearsExperience: number;
    certifications: string[];
  }> = [];

  // Extract skills based on keywords
  for (const [category, keywords] of Object.entries(skillKeywords)) {
    for (const keyword of keywords) {
      if (contentLower.includes(keyword)) {
        // Estimate experience level based on context
        const experienceMatch = contentLower.match(new RegExp(`(\\d+)\\s*(?:years?|yrs?).*?${keyword}`, 'i'));
        const yearsExp = experienceMatch ? parseInt(experienceMatch[1]) : 2;

        let level = 'Beginner';
        if (yearsExp >= 5) level = 'Expert';
        else if (yearsExp >= 3) level = 'Advanced';
        else if (yearsExp >= 1) level = 'Intermediate';

        extractedSkills.push({
          name: keyword.charAt(0).toUpperCase() + keyword.slice(1),
          category,
          level,
          confidence: 0.8,
          yearsExperience: yearsExp,
          certifications: []
        });
      }
    }
  }

  // Extract education
  const educationMatch = content.match(/(?:bachelor|master|phd|degree|university|college).*?(?:\n|$)/gi) || [];

  // Extract certifications
  const certificationMatch = content.match(/(?:certified|certification|certificate).*?(?:\n|$)/gi) || [];

  return {
    skills: extractedSkills,
    categories: [...new Set(extractedSkills.map(s => s.category))],
    experience: 'Extracted from resume content',
    education: educationMatch.map(e => e.trim()),
    certifications: certificationMatch.map(c => c.trim())
  };
}

// Helper function to generate career suggestions
async function generateCareerSuggestions(userSkills: UserSkill[], resumeAnalysis: any): Promise<Array<{
  title: string;
  description: string;
  matchScore: number;
}>> {
  // Simplified career suggestion logic
  const suggestions = [];

  const skillCategories = userSkills.reduce((acc, skill) => {
    acc[skill.skillCategory] = (acc[skill.skillCategory] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Generate suggestions based on skill concentration
  if (skillCategories['Programming'] >= 3) {
    suggestions.push({
      title: 'Senior Software Developer',
      description: 'Lead development projects and mentor junior developers',
      matchScore: 85
    });
  }

  if (skillCategories['Management'] >= 2) {
    suggestions.push({
      title: 'Technical Project Manager',
      description: 'Combine technical expertise with project management skills',
      matchScore: 78
    });
  }

  if (skillCategories['Cloud'] >= 2) {
    suggestions.push({
      title: 'Cloud Solutions Architect',
      description: 'Design and implement cloud infrastructure solutions',
      matchScore: 82
    });
  }

  return suggestions;
}

/**
 * POST /analyze/gap - Individual skill gap analysis
 * Analyzes gaps between user skills and target job requirements
 */
analyze.post('/gap', validateRequest(gapAnalysisRequestSchema), async (c: AuthenticatedContext) => {
  const startTime = Date.now();

  try {
    const validatedData = c.get('validatedData') as z.infer<typeof gapAnalysisRequestSchema>;
    const { user_skills, target_job, analysis_options } = validatedData;

    // Initialize database and services
    const database = createDatabase(c.env.DB);
    const skillMatchingService = new SkillMatchingService(database);
    const gapAnalysisService = new GapAnalysisService(skillMatchingService);
    const jobAnalysisService = new JobAnalysisService();

    // Convert user skills to internal format
    const userSkills: UserSkill[] = user_skills.map((skill: any) => ({
      skillId: crypto.randomUUID(), // Generate temporary ID
      skillName: skill.skill,
      skillCategory: 'General', // Will be categorized by the service
      level: skill.level,
      yearsExperience: skill.years_experience || 0,
      confidenceScore: 0.8, // Default confidence
      certifications: skill.certifications || []
    }));

    // Analyze job description to extract requirements
    const jobAnalysisResult = await jobAnalysisService.analyzeJobDescription(
      target_job.description,
      target_job.title
    );

    const jobRequirements: JobSkillRequirement[] = jobAnalysisResult.skillRequirements;

    // Perform gap analysis
    const gapAnalysisResult = await gapAnalysisService.analyzeGaps(userSkills, jobRequirements);

    // Calculate processing time
    const processingTime = Date.now() - startTime;

    // Format response according to API design
    const response = {
      analysis_id: crypto.randomUUID(),
      user_id: c.user!.id,
      target_job: {
        title: target_job.title,
        company: target_job.company,
        location: target_job.location
      },
      overall_match: gapAnalysisResult.overallMatchPercentage,
      skill_gaps: gapAnalysisResult.skillGaps.map(gap => ({
        skill_name: gap.skillName,
        category: gap.category,
        current_level: gap.currentLevel,
        required_level: gap.requiredLevel,
        gap_severity: gap.gapSeverity,
        time_to_bridge: gap.timeToCompetency,
        learning_difficulty: gap.learningDifficulty,
        priority: gap.priority,
        importance: gap.importance
      })),
      strengths: gapAnalysisResult.strengths.map(strength => ({
        skill_name: strength.skillName,
        level: strength.level,
        years_experience: strength.yearsExperience,
        category: strength.skillCategory
      })),
      recommendations: gapAnalysisResult.recommendations,
      transferable_opportunities: gapAnalysisResult.transferableOpportunities.map(transfer => ({
        from_skill: transfer.fromSkill.skillName,
        to_skill: transfer.toSkillName,
        transferability_score: transfer.transferabilityScore,
        reasoning: transfer.reasoning
      })),
      metadata: {
        ...gapAnalysisResult.metadata,
        processing_time: processingTime,
        analysis_timestamp: new Date().toISOString(),
        api_version: 'v1'
      }
    };

    // Store analysis result for future reference (optional)
    if (analysis_options?.include_recommendations) {
      try {
        await c.env.DB
          .prepare(`
            INSERT INTO gap_analyses (
              id, user_id, target_job_title, overall_match, 
              skill_gaps_count, created_at, analysis_data
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `)
          .bind(
            response.analysis_id,
            c.user!.id,
            target_job.title,
            response.overall_match,
            response.skill_gaps.length,
            new Date().toISOString(),
            JSON.stringify(response)
          )
          .run();
      } catch (dbError) {
        // Log error but don't fail the request
        console.warn('Failed to store analysis result:', dbError);
      }
    }

    return c.json(response, 200);

  } catch (error) {
    console.error('Gap analysis error:', error);

    if (error instanceof AppError) {
      throw error;
    }

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('validation')) {
        throw new AppError('Invalid input data for gap analysis', 400, 'VALIDATION_ERROR');
      }
      if (error.message.includes('timeout')) {
        throw new AppError('Analysis request timed out', 408, 'TIMEOUT_ERROR');
      }
    }

    throw new AppError('Gap analysis failed', 500, 'ANALYSIS_FAILED');
  }
});

/**
 * GET /analyze/gap/:analysisId - Retrieve previous gap analysis
 */
analyze.get('/gap/:analysisId', async (c: AuthenticatedContext) => {
  const analysisId = c.req.param('analysisId');

  try {
    const analysis = await c.env.DB
      .prepare('SELECT * FROM gap_analyses WHERE id = ? AND user_id = ?')
      .bind(analysisId, c.user!.id)
      .first() as any;

    if (!analysis) {
      throw new AppError('Gap analysis not found', 404, 'ANALYSIS_NOT_FOUND');
    }

    const analysisData = JSON.parse(analysis.analysis_data);

    return c.json({
      ...analysisData,
      retrieved_at: new Date().toISOString()
    });

  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    console.error('Retrieve analysis error:', error);
    throw new AppError('Failed to retrieve gap analysis', 500, 'RETRIEVAL_FAILED');
  }
});

/**
 * GET /analyze/gap/history - Get user's gap analysis history
 */
analyze.get('/gap/history', async (c: AuthenticatedContext) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = Math.min(parseInt(c.req.query('limit') || '10'), 50);
    const offset = (page - 1) * limit;

    const analyses = await c.env.DB
      .prepare(`
        SELECT id, target_job_title, overall_match, skill_gaps_count, created_at
        FROM gap_analyses 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `)
      .bind(c.user!.id, limit, offset)
      .all();

    const totalCount = await c.env.DB
      .prepare('SELECT COUNT(*) as count FROM gap_analyses WHERE user_id = ?')
      .bind(c.user!.id)
      .first() as any;

    return c.json({
      analyses: analyses.results,
      pagination: {
        page,
        limit,
        total: totalCount?.count || 0,
        pages: Math.ceil((totalCount?.count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Get analysis history error:', error);
    throw new AppError('Failed to retrieve analysis history', 500, 'HISTORY_RETRIEVAL_FAILED');
  }
});

/**
 * POST /analyze/team - Team skill gap analysis
 * Analyzes gaps for multiple team members against project requirements
 */
analyze.post('/team', validateRequest(teamAnalysisRequestSchema), async (c: AuthenticatedContext) => {
  const startTime = Date.now();

  try {
    const validatedData = c.get('validatedData') as z.infer<typeof teamAnalysisRequestSchema>;
    const { team_members, project_requirements, analysis_options } = validatedData;

    // Initialize services
    const database = createDatabase(c.env.DB);
    const skillMatchingService = new SkillMatchingService(database);
    const gapAnalysisService = new GapAnalysisService(skillMatchingService);
    const jobAnalysisService = new JobAnalysisService();
    const teamAnalysisService = new TeamAnalysisService(gapAnalysisService, jobAnalysisService);

    // Convert team members to internal format
    const teamMembers: TeamMember[] = team_members.map((member: any) => ({
      id: member.id,
      name: member.name,
      role: member.role,
      department: member.department,
      skills: member.skills.map((skill: any) => ({
        skillId: crypto.randomUUID(),
        skillName: skill.skill,
        skillCategory: 'General', // Will be categorized by the service
        level: skill.level,
        yearsExperience: skill.years_experience || 0,
        confidenceScore: 0.8,
        certifications: skill.certifications || []
      })),
      salary: member.salary,
      hourlyRate: member.hourly_rate
    }));

    // Convert project requirements to internal format
    const projectReqs: ProjectRequirements = {
      name: project_requirements.name,
      description: project_requirements.description,
      required_skills: project_requirements.required_skills,
      timeline: project_requirements.timeline,
      priority: project_requirements.priority,
      budget: project_requirements.budget
    };

    // Perform team analysis using the service
    const teamAnalysisResult = await teamAnalysisService.analyzeTeam(teamMembers, projectReqs);

    // Format response according to API design
    const response = {
      analysis_id: teamAnalysisResult.analysis_id,
      user_id: c.user!.id,
      project: teamAnalysisResult.project,
      team_summary: {
        total_members: teamAnalysisResult.team_summary.total_members,
        overall_match: teamAnalysisResult.team_summary.overall_match,
        critical_gaps_count: teamAnalysisResult.team_summary.critical_gaps_count,
        team_strengths_count: teamAnalysisResult.team_summary.team_strengths_count,
        skill_coverage_percentage: teamAnalysisResult.team_summary.skill_coverage_percentage
      },
      member_analyses: teamAnalysisResult.member_analyses,
      team_gaps: teamAnalysisResult.team_gaps.map(gap => ({
        skill_name: gap.skill_name,
        members_needing: gap.members_needing,
        percentage_needing: gap.percentage_needing,
        severity: gap.severity,
        estimated_training_cost: gap.estimated_training_cost,
        estimated_hiring_cost: gap.estimated_hiring_cost,
        recommended_solution: gap.recommended_solution
      })),
      team_strengths: teamAnalysisResult.team_strengths.map(strength => ({
        skill_name: strength.skill_name,
        members_having: strength.members_having,
        percentage_having: strength.percentage_having,
        coverage: strength.coverage,
        expertise_level: strength.expertise_level
      })),
      recommendations: teamAnalysisResult.recommendations,
      budget_estimates: teamAnalysisResult.budget_estimates,
      metadata: {
        ...teamAnalysisResult.metadata,
        api_version: 'v1'
      }
    };

    // Store team analysis result (optional)
    if (analysis_options?.include_recommendations) {
      try {
        await c.env.DB
          .prepare(`
            INSERT INTO team_analyses (
              id, user_id, project_name, team_size, overall_match, 
              critical_gaps_count, created_at, analysis_data
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `)
          .bind(
            response.analysis_id,
            c.user!.id,
            project_requirements.name,
            response.team_summary.total_members,
            response.team_summary.overall_match,
            response.team_summary.critical_gaps_count,
            new Date().toISOString(),
            JSON.stringify(response)
          )
          .run();
      } catch (dbError) {
        // Log error but don't fail the request
        console.warn('Failed to store team analysis result:', dbError);
      }
    }

    return c.json(response, 200);

  } catch (error) {
    console.error('Team analysis error:', error);

    if (error instanceof AppError) {
      throw error;
    }

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('validation')) {
        throw new AppError('Invalid team analysis data', 400, 'VALIDATION_ERROR');
      }
      if (error.message.includes('timeout')) {
        throw new AppError('Team analysis request timed out', 408, 'TIMEOUT_ERROR');
      }
    }

    throw new AppError('Team analysis failed', 500, 'TEAM_ANALYSIS_FAILED');
  }
});

/**
 * GET /analyze/team/:analysisId - Retrieve previous team analysis
 */
analyze.get('/team/:analysisId', async (c: AuthenticatedContext) => {
  const analysisId = c.req.param('analysisId');

  try {
    const analysis = await c.env.DB
      .prepare('SELECT * FROM team_analyses WHERE id = ? AND user_id = ?')
      .bind(analysisId, c.user!.id)
      .first() as any;

    if (!analysis) {
      throw new AppError('Team analysis not found', 404, 'TEAM_ANALYSIS_NOT_FOUND');
    }

    const analysisData = JSON.parse(analysis.analysis_data);

    return c.json({
      ...analysisData,
      retrieved_at: new Date().toISOString()
    });

  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    console.error('Retrieve team analysis error:', error);
    throw new AppError('Failed to retrieve team analysis', 500, 'TEAM_ANALYSIS_RETRIEVAL_FAILED');
  }
});

/**
 * GET /analyze/team/history - Get user's team analysis history
 */
analyze.get('/team/history', async (c: AuthenticatedContext) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = Math.min(parseInt(c.req.query('limit') || '10'), 50);
    const offset = (page - 1) * limit;

    const analyses = await c.env.DB
      .prepare(`
        SELECT id, project_name, team_size, overall_match, critical_gaps_count, created_at
        FROM team_analyses 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `)
      .bind(c.user!.id, limit, offset)
      .all();

    const totalCount = await c.env.DB
      .prepare('SELECT COUNT(*) as count FROM team_analyses WHERE user_id = ?')
      .bind(c.user!.id)
      .first() as any;

    return c.json({
      analyses: analyses.results,
      pagination: {
        page,
        limit,
        total: totalCount?.count || 0,
        pages: Math.ceil((totalCount?.count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Get team analysis history error:', error);
    throw new AppError('Failed to retrieve team analysis history', 500, 'TEAM_HISTORY_RETRIEVAL_FAILED');
  }
});

/**
 * GET /trends/industry/:industryId? - Get industry trends
 * Retrieve trends data for specific industries or all industries
 */
analyze.get('/trends/industry/:industryId?', async (c: AuthenticatedContext) => {
  try {
    const industryId = c.req.param('industryId');
    const region = c.req.query('region');
    const limit = parseInt(c.req.query('limit') || '10');

    // Initialize trends service
    const database = createDatabase(c.env.DB);
    const trendsService = new TrendsAnalysisService(database);

    const trends = await trendsService.getIndustryTrends(industryId, region, limit);

    return c.json({
      industry: industryId || 'all',
      region: region || 'global',
      trends,
      metadata: {
        count: trends.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error retrieving industry trends:', error);
    throw new AppError('Failed to retrieve industry trends', 500, 'TRENDS_RETRIEVAL_FAILED');
  }
});

/**
 * GET /trends/skills/emerging - Get emerging skills
 * Retrieve data on skills with rapid growth
 */
analyze.get('/trends/skills/emerging', async (c: AuthenticatedContext) => {
  try {
    const category = c.req.query('category');
    const minGrowthRate = parseFloat(c.req.query('minGrowthRate') || '0.2');
    const limit = parseInt(c.req.query('limit') || '20');

    // Initialize services
    const database = createDatabase(c.env.DB);
    const trendsService = new TrendsAnalysisService(database);
    const cacheService = new CacheService(c.env.CACHE);

    // Generate cache key based on query parameters
    const cacheKey = `emerging:${category || 'all'}:${minGrowthRate}:${limit}`;

    // Try to get from cache
    const cached = await cacheService.get(
      CacheNamespaces.TREND_DATA,
      cacheKey
    );

    if (cached) {
      return c.json(cached);
    }

    // If not cached, fetch from database
    const emergingSkills = await trendsService.getEmergingSkills(category, minGrowthRate, limit);

    const response = {
      filter: {
        category: category || 'all',
        minGrowthRate,
        limit
      },
      skills: emergingSkills,
      metadata: {
        count: emergingSkills.length,
        timestamp: new Date().toISOString()
      }
    };

    // Cache the response
    await cacheService.set(
      CacheNamespaces.TREND_DATA,
      cacheKey,
      response,
      { ttl: CacheTTL.MEDIUM } // 1 hour cache
    );

    return c.json(response);
  } catch (error) {
    console.error('Error retrieving emerging skills:', error);
    throw new AppError('Failed to retrieve emerging skills', 500, 'EMERGING_SKILLS_RETRIEVAL_FAILED');
  }
});

/**
 * GET /analyze/test-auth - Test authentication endpoint for debugging
 */
analyze.get('/test-auth', async (c: AuthenticatedContext) => {
  try {
    const user = c.get('user');
    console.log('Test auth - user context:', user);

    return c.json({
      authenticated: !!user,
      user: user || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test auth error:', error);
    return c.json({
      authenticated: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * GET /analyze/test-ai - Test AI service endpoint
 */
analyze.get('/test-ai', async (c: AuthenticatedContext) => {
  try {
    const { AIAnalysisService } = await import('../services/aiAnalysisService');
    const aiAnalysisService = new AIAnalysisService(c.env);

    const aiStatus = aiAnalysisService.getAIStatus();
    const isHealthy = await aiAnalysisService.isAIHealthy();

    return c.json({
      aiStatus,
      isHealthy,
      environment: {
        hasDeepSeekKey: !!c.env.DEEPSEEK_API_KEY,
        nodeEnv: c.env.NODE_ENV,
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI test error:', error);
    return c.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * POST /analyze/test-simple - Test simple AI analysis
 */
analyze.post('/test-simple', async (c: AuthenticatedContext) => {
  try {
    const { AIAnalysisService } = await import('../services/aiAnalysisService');
    const aiAnalysisService = new AIAnalysisService(c.env);

    // Test with minimal CV content
    const testCV = "Software Engineer with 3 years experience in JavaScript, React, and Node.js. Bachelor's degree in Computer Science.";

    console.log('Testing AI analysis with simple CV...');
    const result = await aiAnalysisService.analyzeCV(testCV, undefined, {
      includeSkillsGap: false,
      includeCareerSuggestions: false,
      includeIndustryTrends: false,
    });

    return c.json({
      success: true,
      result: {
        analysis_id: result.analysis_id,
        aiPowered: result.aiPowered,
        skillsCount: result.skillsAnalysis.skills.length,
        fallbackUsed: result.metadata.fallbackUsed,
        processingTime: result.metadata.processingTime,
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Simple AI test error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * GET /analyze/debug-auth - Debug authentication endpoint
 */
analyze.get('/debug-auth', async (c: AuthenticatedContext) => {
  try {
    const user = c.get('user');
    return c.json({
      success: true,
      message: 'Authentication working',
      user: user ? {
        id: user.id,
        email: user.email,
        name: user.name
      } : null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * POST /analyze/advanced - Advanced AI-powered analysis with all features
 * Comprehensive analysis including multi-language, industry-specific, coaching, and more
 */
analyze.post('/advanced', async (c: AuthenticatedContext) => {
  const startTime = Date.now();

  try {
    // Parse multipart form data
    const formData = await c.req.formData();

    // Extract form fields
    const resumeFile = formData.get('resume') as File | null;
    const resumeText = formData.get('resumeText') as string | null;
    const jobDescriptionFile = formData.get('jobDescription') as File | null;
    const jobDescriptionText = formData.get('jobDescriptionText') as string | null;
    const currentPortfolio = formData.get('currentPortfolio') as string | null;

    // Advanced options
    const includeMultiLanguage = formData.get('includeMultiLanguage') === 'true';
    const includeIndustrySpecific = formData.get('includeIndustrySpecific') === 'true';
    const includePersonalizedCoaching = formData.get('includePersonalizedCoaching') === 'true';
    const includeSkillTrendPredictions = formData.get('includeSkillTrendPredictions') === 'true';
    const includeCompetitiveAnalysis = formData.get('includeCompetitiveAnalysis') === 'true';
    const includeInterviewPreparation = formData.get('includeInterviewPreparation') === 'true';
    const includePortfolioOptimization = formData.get('includePortfolioOptimization') === 'true';
    const includeNetworkingInsights = formData.get('includeNetworkingInsights') === 'true';

    // Configuration options
    const targetLanguage = formData.get('targetLanguage') as string | null;
    const industry = formData.get('industry') as string | null;
    const learningStyle = formData.get('learningStyle') as string | null;
    const careerGoalsStr = formData.get('careerGoals') as string | null;
    const timeAvailability = formData.get('timeAvailability') as string | null;

    // Parse career goals if provided
    let careerGoals: string[] = [];
    if (careerGoalsStr) {
      try {
        careerGoals = JSON.parse(careerGoalsStr);
      } catch {
        careerGoals = careerGoalsStr.split(',').map(goal => goal.trim());
      }
    }

    // Validation: Must have either resume file or text
    if (!resumeFile && !resumeText) {
      throw new AppError('Either resume file or resume text is required', 400, 'MISSING_RESUME');
    }

    // Security validations (reuse existing validation logic)
    if (resumeFile) {
      if (resumeFile.size > MAX_FILE_SIZE) {
        throw new AppError(`Resume file too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`, 400, 'FILE_TOO_LARGE');
      }

      if (!ALLOWED_MIME_TYPES.includes(resumeFile.type)) {
        throw new AppError('Invalid resume file type. Only PDF, DOC, DOCX, and TXT files are allowed', 400, 'INVALID_FILE_TYPE');
      }

      if (resumeFile.name.includes('../') || resumeFile.name.includes('..\\\\')) {
        throw new AppError('Invalid filename', 400, 'INVALID_FILENAME');
      }
    }

    if (jobDescriptionFile) {
      if (jobDescriptionFile.size > MAX_JOB_FILE_SIZE) {
        throw new AppError(`Job description file too large. Maximum size is ${MAX_JOB_FILE_SIZE / (1024 * 1024)}MB`, 400, 'FILE_TOO_LARGE');
      }

      if (!ALLOWED_MIME_TYPES.includes(jobDescriptionFile.type)) {
        throw new AppError('Invalid job description file type. Only PDF, DOC, DOCX, and TXT files are allowed', 400, 'INVALID_FILE_TYPE');
      }

      if (jobDescriptionFile.name.includes('../') || jobDescriptionFile.name.includes('..\\\\')) {
        throw new AppError('Invalid filename', 400, 'INVALID_FILENAME');
      }
    }

    // Rate limiting check (60 seconds for advanced analysis)
    const userId = c.user!.id;
    const rateLimitKey = `advanced_analysis:${userId}`;
    const lastAnalysis = await c.env.CACHE.get(rateLimitKey);

    if (lastAnalysis) {
      const timeSinceLastAnalysis = Date.now() - parseInt(lastAnalysis);
      if (timeSinceLastAnalysis < 60000) { // 60 seconds
        const remainingTime = Math.ceil((60000 - timeSinceLastAnalysis) / 1000);
        throw new AppError(`Please wait ${remainingTime} seconds before starting another advanced analysis`, 429, 'RATE_LIMITED');
      }
    }

    // Set rate limit
    await c.env.CACHE.put(rateLimitKey, Date.now().toString(), { expirationTtl: 60 });

    // Extract text content from files or use provided text
    let resumeContent = resumeText || '';
    let jobContent = jobDescriptionText || '';

    if (resumeFile) {
      resumeContent = await extractTextFromFile(resumeFile);
    }

    if (jobDescriptionFile) {
      jobContent = await extractTextFromFile(jobDescriptionFile);
    }

    // Initialize AI-powered analysis service
    const { AIAnalysisService } = await import('../services/aiAnalysisService');
    const aiAnalysisService = new AIAnalysisService(c.env);

    // Perform comprehensive AI-powered analysis with advanced features
    const response = await aiAnalysisService.analyzeCV(
      resumeContent,
      jobContent,
      {
        includeSkillsGap: true,
        includeCareerSuggestions: true,
        includeIndustryTrends: true,
        // Advanced AI Features
        includeMultiLanguage,
        includeIndustrySpecific,
        includePersonalizedCoaching,
        includeSkillTrendPredictions,
        includeCompetitiveAnalysis,
        includeInterviewPreparation,
        includePortfolioOptimization,
        includeNetworkingInsights,
        targetLanguage: targetLanguage || undefined,
        industry: industry || undefined,
        userPreferences: {
          learningStyle: learningStyle || undefined,
          careerGoals: careerGoals.length > 0 ? careerGoals : undefined,
          timeAvailability: timeAvailability || undefined,
        },
        currentPortfolio: currentPortfolio || undefined,
      }
    );

    // Set the actual user ID
    response.user_id = userId;

    // Add metadata
    response.metadata = {
      ...response.metadata,
      processingTime: Date.now() - startTime,
      analysisOptions: {
        includeSkillsGap: true,
        includeCareerSuggestions: true,
        includeIndustryTrends: true,
        includeMultiLanguage,
        includeIndustrySpecific,
        includePersonalizedCoaching,
        includeSkillTrendPredictions,
        includeCompetitiveAnalysis,
        includeInterviewPreparation,
        includePortfolioOptimization,
        includeNetworkingInsights,
      },
      advancedFeatures: {
        targetLanguage,
        industry,
        userPreferences: {
          learningStyle,
          careerGoals,
          timeAvailability,
        },
      },
      fileInfo: {
        resumeFile: resumeFile ? { name: resumeFile.name, size: resumeFile.size, type: resumeFile.type } : null,
        jobDescriptionFile: jobDescriptionFile ? { name: jobDescriptionFile.name, size: jobDescriptionFile.size, type: jobDescriptionFile.type } : null,
        currentPortfolio: currentPortfolio ? 'provided' : null,
      }
    };

    // Store analysis result for future reference
    try {
      await c.env.DB
        .prepare(`
          INSERT INTO resume_analyses (
            id, user_id, analysis_data, created_at
          ) VALUES (?, ?, ?, ?)
        `)
        .bind(
          response.analysis_id,
          userId,
          JSON.stringify(response),
          new Date().toISOString()
        )
        .run();
    } catch (dbError) {
      console.warn('Failed to store advanced analysis result:', dbError);
    }

    return c.json(response, 200);

  } catch (error) {
    console.error('Advanced analysis error:', error);

    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new AppError('Advanced analysis request timed out', 408, 'TIMEOUT_ERROR');
      }
      if (error.message.includes('file')) {
        throw new AppError('File processing failed', 400, 'FILE_PROCESSING_ERROR');
      }
    }

    throw new AppError('Advanced analysis failed', 500, 'ADVANCED_ANALYSIS_FAILED');
  }
});

/**
 * POST /analyze/job - Intelligent job description analysis
 * Analyzes job descriptions with AI-powered insights and market intelligence
 */
analyze.post('/job', async (c: AuthenticatedContext) => {
  const startTime = Date.now();

  try {
    // Parse request body
    const body = await c.req.json();
    const { jobDescription, includeInsights = true, includeApplicationTips = true } = body;

    // Validation
    if (!jobDescription || typeof jobDescription !== 'string') {
      throw new AppError('Job description is required', 400, 'MISSING_JOB_DESCRIPTION');
    }

    if (jobDescription.length > MAX_TEXT_LENGTH) {
      throw new AppError(`Job description too long. Maximum ${MAX_TEXT_LENGTH} characters allowed`, 400, 'TEXT_TOO_LONG');
    }

    // Rate limiting check
    const userId = c.user!.id;
    const rateLimitKey = `job_analysis:${userId}`;
    const lastAnalysis = await c.env.CACHE.get(rateLimitKey);

    if (lastAnalysis) {
      const timeSinceLastAnalysis = Date.now() - parseInt(lastAnalysis);
      if (timeSinceLastAnalysis < 15000) { // 15 seconds
        const remainingTime = Math.ceil((15000 - timeSinceLastAnalysis) / 1000);
        throw new AppError(`Please wait ${remainingTime} seconds before starting another job analysis`, 429, 'RATE_LIMITED');
      }
    }

    // Set rate limit
    await c.env.CACHE.put(rateLimitKey, Date.now().toString(), { expirationTtl: 15 });

    // Initialize AI services
    const { AIAnalysisService } = await import('../services/aiAnalysisService');
    const { IntelligentJobAnalysisService } = await import('../services/intelligentJobAnalysis');

    const aiAnalysisService = new AIAnalysisService(c.env);

    // Check if AI is available
    const isAIHealthy = await aiAnalysisService.isAIHealthy();

    let response;

    if (isAIHealthy && includeInsights) {
      // Use intelligent job analysis with AI insights
      const aiConfig = {
        provider: 'deepseek' as const,
        model: 'deepseek-reasoner' as const,
        apiKey: c.env.DEEPSEEK_API_KEY,
        baseUrl: c.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
        maxTokens: parseInt(c.env.DEEPSEEK_MAX_TOKENS || '4000'),
        temperature: parseFloat(c.env.DEEPSEEK_TEMPERATURE || '0.1'),
        timeout: parseInt(c.env.DEEPSEEK_TIMEOUT || '30000')
      };

      const { DeepSeekAIService } = await import('../services/deepseekAI');
      const deepseekService = new DeepSeekAIService(aiConfig);
      const intelligentJobService = new IntelligentJobAnalysisService(deepseekService);

      const enhancedAnalysis = await intelligentJobService.analyzeJobIntelligently(jobDescription);

      response = {
        analysis_id: crypto.randomUUID(),
        user_id: userId,
        timestamp: new Date().toISOString(),
        aiPowered: true,
        jobAnalysis: enhancedAnalysis,
        metadata: {
          processingTime: Date.now() - startTime,
          analysisOptions: {
            includeInsights,
            includeApplicationTips
          },
          aiProvider: 'deepseek',
          aiModel: 'deepseek-reasoner'
        }
      };
    } else {
      // Fallback to basic job analysis
      const basicAnalysis = await aiAnalysisService.analyzeCV('', jobDescription, {
        includeSkillsGap: false,
        includeCareerSuggestions: false,
        includeIndustryTrends: false
      });

      response = {
        analysis_id: crypto.randomUUID(),
        user_id: userId,
        timestamp: new Date().toISOString(),
        aiPowered: false,
        jobAnalysis: {
          jobTitle: 'Extracted from description',
          industry: 'General',
          experienceLevel: 'mid',
          skillRequirements: [],
          softSkills: [],
          responsibilities: [],
          benefits: [],
          workArrangement: 'flexible',
          reasoning: 'Basic analysis due to AI unavailability'
        },
        metadata: {
          processingTime: Date.now() - startTime,
          analysisOptions: {
            includeInsights,
            includeApplicationTips
          },
          fallbackUsed: true
        }
      };
    }

    // Store analysis result
    try {
      await c.env.DB
        .prepare(`
          INSERT INTO job_analyses (
            id, user_id, job_title, analysis_data, created_at
          ) VALUES (?, ?, ?, ?, ?)
        `)
        .bind(
          response.analysis_id,
          userId,
          response.jobAnalysis.jobTitle || 'Unknown',
          JSON.stringify(response),
          new Date().toISOString()
        )
        .run();
    } catch (dbError) {
      console.warn('Failed to store job analysis result:', dbError);
    }

    return c.json(response, 200);

  } catch (error) {
    console.error('Job analysis error:', error);

    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new AppError('Job analysis request timed out', 408, 'TIMEOUT_ERROR');
      }
    }

    throw new AppError('Job analysis failed', 500, 'JOB_ANALYSIS_FAILED');
  }
});

/**
 * POST /analyze/job/compare - Compare multiple job descriptions
 * Analyzes and compares multiple job descriptions for strategic insights
 */
analyze.post('/job/compare', async (c: AuthenticatedContext) => {
  const startTime = Date.now();

  try {
    // Parse request body
    const body = await c.req.json();
    const { jobDescriptions } = body;

    // Validation
    if (!jobDescriptions || !Array.isArray(jobDescriptions)) {
      throw new AppError('Job descriptions array is required', 400, 'MISSING_JOB_DESCRIPTIONS');
    }

    if (jobDescriptions.length < 2 || jobDescriptions.length > 5) {
      throw new AppError('Please provide 2-5 job descriptions for comparison', 400, 'INVALID_JOB_COUNT');
    }

    // Validate each job description
    for (const [index, jobDesc] of jobDescriptions.entries()) {
      if (!jobDesc || typeof jobDesc !== 'string') {
        throw new AppError(`Job description ${index + 1} is invalid`, 400, 'INVALID_JOB_DESCRIPTION');
      }

      if (jobDesc.length > MAX_TEXT_LENGTH) {
        throw new AppError(`Job description ${index + 1} is too long. Maximum ${MAX_TEXT_LENGTH} characters allowed`, 400, 'TEXT_TOO_LONG');
      }
    }

    // Rate limiting check (stricter for comparison)
    const userId = c.user!.id;
    const rateLimitKey = `job_comparison:${userId}`;
    const lastComparison = await c.env.CACHE.get(rateLimitKey);

    if (lastComparison) {
      const timeSinceLastComparison = Date.now() - parseInt(lastComparison);
      if (timeSinceLastComparison < 60000) { // 1 minute
        const remainingTime = Math.ceil((60000 - timeSinceLastComparison) / 1000);
        throw new AppError(`Please wait ${remainingTime} seconds before starting another job comparison`, 429, 'RATE_LIMITED');
      }
    }

    // Set rate limit
    await c.env.CACHE.put(rateLimitKey, Date.now().toString(), { expirationTtl: 60 });

    // Initialize AI services
    const { AIAnalysisService } = await import('../services/aiAnalysisService');
    const { IntelligentJobAnalysisService } = await import('../services/intelligentJobAnalysis');

    const aiAnalysisService = new AIAnalysisService(c.env);
    const isAIHealthy = await aiAnalysisService.isAIHealthy();

    if (!isAIHealthy) {
      throw new AppError('AI service is currently unavailable for job comparison', 503, 'AI_SERVICE_UNAVAILABLE');
    }

    // Perform intelligent job comparison
    const aiConfig = {
      provider: 'deepseek' as const,
      model: 'deepseek-reasoner' as const,
      apiKey: c.env.DEEPSEEK_API_KEY,
      baseUrl: c.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
      maxTokens: parseInt(c.env.DEEPSEEK_MAX_TOKENS || '4000'),
      temperature: parseFloat(c.env.DEEPSEEK_TEMPERATURE || '0.1'),
      timeout: parseInt(c.env.DEEPSEEK_TIMEOUT || '30000')
    };

    const { DeepSeekAIService } = await import('../services/deepseekAI');
    const deepseekService = new DeepSeekAIService(aiConfig);
    const intelligentJobService = new IntelligentJobAnalysisService(deepseekService);

    const comparisonResult = await intelligentJobService.compareJobs(jobDescriptions);

    const response = {
      analysis_id: crypto.randomUUID(),
      user_id: userId,
      timestamp: new Date().toISOString(),
      aiPowered: true,
      jobComparison: comparisonResult,
      metadata: {
        processingTime: Date.now() - startTime,
        jobCount: jobDescriptions.length,
        aiProvider: 'deepseek',
        aiModel: 'deepseek-reasoner'
      }
    };

    // Store comparison result
    try {
      await c.env.DB
        .prepare(`
          INSERT INTO job_comparisons (
            id, user_id, job_count, analysis_data, created_at
          ) VALUES (?, ?, ?, ?, ?)
        `)
        .bind(
          response.analysis_id,
          userId,
          jobDescriptions.length,
          JSON.stringify(response),
          new Date().toISOString()
        )
        .run();
    } catch (dbError) {
      console.warn('Failed to store job comparison result:', dbError);
    }

    return c.json(response, 200);

  } catch (error) {
    console.error('Job comparison error:', error);

    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new AppError('Job comparison request timed out', 408, 'TIMEOUT_ERROR');
      }
    }

    throw new AppError('Job comparison failed', 500, 'JOB_COMPARISON_FAILED');
  }
});

/**
 * GET /trends/geographic/:region? - Get geographic/regional trends
 * Retrieve skill trends by geographic region
 */
analyze.get('/trends/geographic/:region?', async (c: AuthenticatedContext) => {
  try {
    const region = c.req.param('region');
    const skillCategory = c.req.query('category');
    const limit = parseInt(c.req.query('limit') || '10');

    // Initialize trends service
    const database = createDatabase(c.env.DB);
    const trendsService = new TrendsAnalysisService(database);

    const regionalTrends = await trendsService.getRegionalTrends(region, skillCategory, limit);

    return c.json({
      region: region || 'all',
      filter: {
        category: skillCategory || 'all',
        limit
      },
      trends: regionalTrends,
      metadata: {
        count: regionalTrends.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error retrieving regional trends:', error);
    throw new AppError('Failed to retrieve regional trends', 500, 'REGIONAL_TRENDS_RETRIEVAL_FAILED');
  }
});

/**
 * POST /trends/forecast - Generate skill demand forecasts
 * Create forecasts for specific skills
 */
analyze.post('/trends/forecast', async (c: AuthenticatedContext) => {
  try {
    const body = await c.req.json();
    const { skill_names, industry, region } = body;

    if (!skill_names || !Array.isArray(skill_names) || skill_names.length === 0) {
      throw new AppError('skill_names array is required', 400, 'INVALID_REQUEST');
    }

    // Initialize trends service
    const database = createDatabase(c.env.DB);
    const trendsService = new TrendsAnalysisService(database);

    const forecasts = await trendsService.generateSkillForecasts(skill_names, industry, region);

    return c.json({
      request: {
        skills: skill_names,
        industry: industry || 'all',
        region: region || 'global'
      },
      forecasts,
      metadata: {
        count: forecasts.length,
        timestamp: new Date().toISOString(),
        methodology: 'Time series analysis with linear regression'
      }
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error generating forecasts:', error);
    throw new AppError('Failed to generate skill forecasts', 500, 'FORECAST_GENERATION_FAILED');
  }
});

/**
 * GET /trends/skills/declining - Get declining skills
 * Identify skills with decreasing demand
 */
analyze.get('/trends/skills/declining', async (c: AuthenticatedContext) => {
  try {
    const threshold = parseFloat(c.req.query('threshold') || '-0.1');
    const timeWindow = parseInt(c.req.query('timeWindow') || '12');

    // Initialize trends service
    const database = createDatabase(c.env.DB);
    const trendsService = new TrendsAnalysisService(database);

    const decliningSkills = await trendsService.identifyDecliningSkills(threshold, timeWindow);

    return c.json({
      filter: {
        threshold,
        timeWindowMonths: timeWindow
      },
      skills: decliningSkills,
      metadata: {
        count: decliningSkills.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error identifying declining skills:', error);
    throw new AppError('Failed to identify declining skills', 500, 'DECLINING_SKILLS_RETRIEVAL_FAILED');
  }
});

/**
 * GET /trends/skills/velocity - Analyze skill growth velocity
 * Get growth velocity metrics for skills
 */
analyze.get('/trends/skills/velocity', async (c: AuthenticatedContext) => {
  try {
    const timeWindow = parseInt(c.req.query('timeWindow') || '6');

    // Initialize trends service
    const database = createDatabase(c.env.DB);
    const trendsService = new TrendsAnalysisService(database);

    const velocityMap = await trendsService.analyzeGrowthVelocity(timeWindow);

    // Convert Map to array for JSON response
    const velocityData = Array.from(velocityMap.entries())
      .map(([skillName, velocity]) => ({ skillName, velocity }))
      .sort((a, b) => b.velocity - a.velocity);

    return c.json({
      filter: {
        timeWindowMonths: timeWindow
      },
      velocities: velocityData,
      metadata: {
        count: velocityData.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error analyzing growth velocity:', error);
    throw new AppError('Failed to analyze growth velocity', 500, 'VELOCITY_ANALYSIS_FAILED');
  }
});

export default analyze;
