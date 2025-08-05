import { Context, Next } from 'hono';
import { AuthenticatedContext } from '../../../middleware/auth';
import { AppError } from '../../../middleware/errorHandler';

/**
 * Request Validation Middleware
 * 
 * Validates incoming requests for analysis endpoints.
 * Ensures required data is present and properly formatted.
 */

export async function validationMiddleware(c: AuthenticatedContext, next: Next) {
  try {
    const path = c.req.path;
    
    // Route-specific validation
    if (path.includes('/resume')) {
      await validateResumeAnalysisRequest(c);
    } else if (path.includes('/team')) {
      await validateTeamAnalysisRequest(c);
    } else if (path.includes('/gap')) {
      await validateGapAnalysisRequest(c);
    } else if (path.includes('/trends')) {
      await validateTrendsAnalysisRequest(c);
    }
    
    await next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Request validation failed', 400, 'VALIDATION_ERROR');
  }
}

/**
 * Validates resume analysis requests
 */
async function validateResumeAnalysisRequest(c: AuthenticatedContext) {
  const contentType = c.req.header('content-type');
  
  if (contentType?.includes('multipart/form-data')) {
    // File upload validation is handled by fileUpload middleware
    const formData = c.get('formData');
    const resumeFile = c.get('resumeFile');
    const resumeText = c.get('resumeText');
    
    // Must have either resume file or text
    if (!resumeFile && !resumeText) {
      throw new AppError(
        'Either resume file or resume text is required',
        400,
        'MISSING_RESUME'
      );
    }
  } else if (contentType?.includes('application/json')) {
    // JSON request validation
    const body = await c.req.json();
    
    if (!body.resumeText && !body.resumeFile) {
      throw new AppError(
        'Either resumeText or resumeFile is required',
        400,
        'MISSING_RESUME'
      );
    }
    
    // Validate optional fields
    if (body.includeSkillsGap !== undefined && typeof body.includeSkillsGap !== 'boolean') {
      throw new AppError('includeSkillsGap must be a boolean', 400, 'INVALID_FIELD_TYPE');
    }
    
    if (body.includeCareerSuggestions !== undefined && typeof body.includeCareerSuggestions !== 'boolean') {
      throw new AppError('includeCareerSuggestions must be a boolean', 400, 'INVALID_FIELD_TYPE');
    }
    
    if (body.includeIndustryTrends !== undefined && typeof body.includeIndustryTrends !== 'boolean') {
      throw new AppError('includeIndustryTrends must be a boolean', 400, 'INVALID_FIELD_TYPE');
    }
    
    c.set('requestBody', body);
  } else {
    throw new AppError(
      'Content-Type must be multipart/form-data or application/json',
      400,
      'INVALID_CONTENT_TYPE'
    );
  }
}

/**
 * Validates team analysis requests
 */
async function validateTeamAnalysisRequest(c: AuthenticatedContext) {
  const body = await c.req.json();
  
  if (!body.teamMembers || !Array.isArray(body.teamMembers)) {
    throw new AppError('teamMembers array is required', 400, 'MISSING_TEAM_MEMBERS');
  }
  
  if (body.teamMembers.length === 0) {
    throw new AppError('At least one team member is required', 400, 'EMPTY_TEAM_MEMBERS');
  }
  
  // Validate team members
  for (const member of body.teamMembers) {
    if (!member.id || typeof member.id !== 'string') {
      throw new AppError('Each team member must have a valid id', 400, 'INVALID_MEMBER_ID');
    }
    
    if (!member.name || typeof member.name !== 'string') {
      throw new AppError('Each team member must have a valid name', 400, 'INVALID_MEMBER_NAME');
    }
    
    if (!member.skills || !Array.isArray(member.skills)) {
      throw new AppError('Each team member must have a skills array', 400, 'INVALID_MEMBER_SKILLS');
    }
    
    if (typeof member.experience !== 'number' || member.experience < 0) {
      throw new AppError('Each team member must have valid experience (number >= 0)', 400, 'INVALID_MEMBER_EXPERIENCE');
    }
  }
  
  // Validate project requirements
  if (!body.projectRequirements) {
    throw new AppError('projectRequirements is required', 400, 'MISSING_PROJECT_REQUIREMENTS');
  }
  
  const { projectRequirements } = body;
  
  if (!projectRequirements.skills || !Array.isArray(projectRequirements.skills)) {
    throw new AppError('projectRequirements.skills array is required', 400, 'INVALID_PROJECT_SKILLS');
  }
  
  if (typeof projectRequirements.timeline !== 'number' || projectRequirements.timeline <= 0) {
    throw new AppError('projectRequirements.timeline must be a positive number', 400, 'INVALID_PROJECT_TIMELINE');
  }
  
  c.set('requestBody', body);
}

/**
 * Validates gap analysis requests
 */
async function validateGapAnalysisRequest(c: AuthenticatedContext) {
  const body = await c.req.json();
  
  if (!body.currentSkills || !Array.isArray(body.currentSkills)) {
    throw new AppError('currentSkills array is required', 400, 'MISSING_CURRENT_SKILLS');
  }
  
  if (!body.targetRole || typeof body.targetRole !== 'string') {
    throw new AppError('targetRole is required', 400, 'MISSING_TARGET_ROLE');
  }
  
  if (!body.targetSkills || !Array.isArray(body.targetSkills)) {
    throw new AppError('targetSkills array is required', 400, 'MISSING_TARGET_SKILLS');
  }
  
  // Validate current skills
  for (const skill of body.currentSkills) {
    if (!skill.name || typeof skill.name !== 'string') {
      throw new AppError('Each current skill must have a valid name', 400, 'INVALID_SKILL_NAME');
    }
    
    if (!['beginner', 'intermediate', 'advanced', 'expert'].includes(skill.level)) {
      throw new AppError('Each current skill must have a valid level', 400, 'INVALID_SKILL_LEVEL');
    }
    
    if (typeof skill.experience !== 'number' || skill.experience < 0) {
      throw new AppError('Each current skill must have valid experience', 400, 'INVALID_SKILL_EXPERIENCE');
    }
  }
  
  c.set('requestBody', body);
}

/**
 * Validates trends analysis requests
 */
async function validateTrendsAnalysisRequest(c: AuthenticatedContext) {
  const body = await c.req.json();
  
  if (!body.industry || typeof body.industry !== 'string') {
    throw new AppError('industry is required', 400, 'MISSING_INDUSTRY');
  }
  
  if (body.skills && !Array.isArray(body.skills)) {
    throw new AppError('skills must be an array if provided', 400, 'INVALID_SKILLS_TYPE');
  }
  
  if (body.timeframe && !['6months', '1year', '3years'].includes(body.timeframe)) {
    throw new AppError('timeframe must be one of: 6months, 1year, 3years', 400, 'INVALID_TIMEFRAME');
  }
  
  if (body.region && typeof body.region !== 'string') {
    throw new AppError('region must be a string if provided', 400, 'INVALID_REGION_TYPE');
  }
  
  c.set('requestBody', body);
}