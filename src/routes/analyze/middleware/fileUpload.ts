import { Context, Next } from 'hono';
import { AuthenticatedContext } from '../../../middleware/auth';
import { AppError } from '../../../middleware/errorHandler';
import { FILE_CONSTRAINTS } from '../types/requests';

/**
 * File Upload Middleware
 * 
 * Handles file upload validation and processing for analysis endpoints.
 * Validates file size, type, and security constraints.
 */

export async function fileUploadMiddleware(c: AuthenticatedContext, next: Next) {
  try {
    // Only process multipart form data
    const contentType = c.req.header('content-type');
    if (!contentType?.includes('multipart/form-data')) {
      return next();
    }

    // Parse multipart form data
    const formData = await c.req.formData();
    
    // Validate resume file if present
    const resumeFile = formData.get('resume') as File | null;
    if (resumeFile) {
      validateFile(resumeFile, 'resume');
    }

    // Validate job description file if present
    const jobDescriptionFile = formData.get('jobDescription') as File | null;
    if (jobDescriptionFile) {
      validateFile(jobDescriptionFile, 'jobDescription');
    }

    // Validate text inputs
    const resumeText = formData.get('resumeText') as string | null;
    const jobDescriptionText = formData.get('jobDescriptionText') as string | null;

    if (resumeText && resumeText.length > FILE_CONSTRAINTS.MAX_TEXT_LENGTH) {
      throw new AppError(
        `Resume text too long. Maximum ${FILE_CONSTRAINTS.MAX_TEXT_LENGTH} characters allowed`,
        400,
        'TEXT_TOO_LONG'
      );
    }

    if (jobDescriptionText && jobDescriptionText.length > FILE_CONSTRAINTS.MAX_TEXT_LENGTH) {
      throw new AppError(
        `Job description text too long. Maximum ${FILE_CONSTRAINTS.MAX_TEXT_LENGTH} characters allowed`,
        400,
        'TEXT_TOO_LONG'
      );
    }

    // Store validated data in context for handlers
    c.set('formData', formData);
    c.set('resumeFile', resumeFile);
    c.set('jobDescriptionFile', jobDescriptionFile);
    c.set('resumeText', resumeText);
    c.set('jobDescriptionText', jobDescriptionText);

    await next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('File upload processing failed', 400, 'FILE_UPLOAD_ERROR');
  }
}

/**
 * Validates uploaded files against security and size constraints
 */
function validateFile(file: File, type: 'resume' | 'jobDescription'): void {
  const maxSize = type === 'resume' 
    ? FILE_CONSTRAINTS.MAX_FILE_SIZE 
    : FILE_CONSTRAINTS.MAX_JOB_FILE_SIZE;

  // Check file size
  if (file.size > maxSize) {
    throw new AppError(
      `${type} file too large. Maximum size is ${maxSize / (1024 * 1024)}MB`,
      400,
      'FILE_TOO_LARGE'
    );
  }

  // Check file type
  if (!FILE_CONSTRAINTS.ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new AppError(
      `Invalid ${type} file type. Only PDF, DOC, DOCX, and TXT files are allowed`,
      400,
      'INVALID_FILE_TYPE'
    );
  }

  // Validate filename (prevent path traversal)
  if (file.name.includes('../') || file.name.includes('..\\\\')) {
    throw new AppError('Invalid filename', 400, 'INVALID_FILENAME');
  }

  // Additional security checks
  if (file.name.length > 255) {
    throw new AppError('Filename too long', 400, 'FILENAME_TOO_LONG');
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(file.name.replace(/\.[^.]+$/, ''))) {
    throw new AppError('Invalid characters in filename', 400, 'INVALID_FILENAME_CHARS');
  }
}