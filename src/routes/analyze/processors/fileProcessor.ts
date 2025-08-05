import { AppError } from '../../../middleware/errorHandler';
import { logger } from '../../../utils/logger';

/**
 * File Processing Utilities
 * 
 * Handles file processing for analysis endpoints.
 * Extracts text content from various file formats.
 */

export interface ProcessedFile {
  content: string;
  metadata: {
    originalName: string;
    size: number;
    type: string;
    processedAt: string;
  };
}

/**
 * Processes uploaded files and extracts text content
 */
export async function processFile(file: File): Promise<ProcessedFile> {
  try {
    logger.info('Processing file', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    let content: string;

    switch (file.type) {
      case 'text/plain':
        content = await processTextFile(file);
        break;
      case 'application/pdf':
        content = await processPdfFile(file);
        break;
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        content = await processWordFile(file);
        break;
      default:
        throw new AppError(
          `Unsupported file type: ${file.type}`,
          400,
          'UNSUPPORTED_FILE_TYPE'
        );
    }

    // Validate extracted content
    if (!content || content.trim().length === 0) {
      throw new AppError(
        'No text content could be extracted from the file',
        400,
        'EMPTY_FILE_CONTENT'
      );
    }

    // Sanitize content
    content = sanitizeTextContent(content);

    const processedFile: ProcessedFile = {
      content,
      metadata: {
        originalName: file.name,
        size: file.size,
        type: file.type,
        processedAt: new Date().toISOString()
      }
    };

    logger.info('File processed successfully', {
      name: file.name,
      contentLength: content.length
    });

    return processedFile;
  } catch (error) {
    logger.error('File processing failed', {
      fileName: file.name,
      fileType: file.type,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      'File processing failed',
      500,
      'FILE_PROCESSING_ERROR'
    );
  }
}

/**
 * Processes plain text files
 */
async function processTextFile(file: File): Promise<string> {
  const text = await file.text();
  return text;
}

/**
 * Processes PDF files
 * Note: In a real implementation, you would use a PDF parsing library
 */
async function processPdfFile(file: File): Promise<string> {
  // For now, we'll return a placeholder
  // In production, integrate with a PDF parsing library like pdf-parse
  throw new AppError(
    'PDF processing not yet implemented. Please use text format.',
    400,
    'PDF_NOT_SUPPORTED'
  );
}

/**
 * Processes Word documents
 * Note: In a real implementation, you would use a Word parsing library
 */
async function processWordFile(file: File): Promise<string> {
  // For now, we'll return a placeholder
  // In production, integrate with a Word parsing library like mammoth
  throw new AppError(
    'Word document processing not yet implemented. Please use text format.',
    400,
    'WORD_NOT_SUPPORTED'
  );
}

/**
 * Sanitizes text content to remove potentially harmful content
 */
function sanitizeTextContent(content: string): string {
  // Remove null bytes and other control characters
  content = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Normalize whitespace
  content = content.replace(/\s+/g, ' ').trim();
  
  // Remove excessively long lines (potential attack vectors)
  content = content
    .split('\n')
    .map(line => line.length > 1000 ? line.substring(0, 1000) + '...' : line)
    .join('\n');
  
  // Limit total content length
  if (content.length > 100000) {
    content = content.substring(0, 100000) + '\n\n[Content truncated due to length]';
  }
  
  return content;
}

/**
 * Validates file content for analysis
 */
export function validateFileContent(content: string): void {
  if (content.length < 50) {
    throw new AppError(
      'File content too short. Minimum 50 characters required for analysis.',
      400,
      'CONTENT_TOO_SHORT'
    );
  }

  if (content.length > 50000) {
    throw new AppError(
      'File content too long. Maximum 50,000 characters allowed.',
      400,
      'CONTENT_TOO_LONG'
    );
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /data:text\/html/i,
    /vbscript:/i
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(content)) {
      throw new AppError(
        'File content contains potentially harmful code',
        400,
        'SUSPICIOUS_CONTENT'
      );
    }
  }
}