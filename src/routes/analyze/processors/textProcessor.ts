import { AppError } from '../../../middleware/errorHandler';
import { logger } from '../../../utils/logger';

/**
 * Text Processing Utilities
 * 
 * Handles text processing and analysis for various content types.
 * Provides text cleaning, validation, and extraction utilities.
 */

export interface ProcessedText {
  content: string;
  metadata: {
    originalLength: number;
    processedLength: number;
    language?: string;
    encoding?: string;
    processedAt: string;
  };
}

/**
 * Processes and cleans text content for analysis
 */
export function processTextContent(text: string): ProcessedText {
  const originalLength = text.length;
  
  try {
    // Clean and normalize text
    let processedContent = cleanText(text);
    
    // Validate processed content
    validateProcessedText(processedContent);
    
    // Detect language (basic implementation)
    const detectedLanguage = detectLanguage(processedContent);
    
    const result: ProcessedText = {
      content: processedContent,
      metadata: {
        originalLength,
        processedLength: processedContent.length,
        language: detectedLanguage,
        encoding: 'UTF-8',
        processedAt: new Date().toISOString()
      }
    };
    
    logger.info('Text processed successfully', {
      originalLength,
      processedLength: processedContent.length,
      language: detectedLanguage
    });
    
    return result;
  } catch (error) {
    logger.error('Text processing failed', {
      originalLength,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    throw new AppError('Text processing failed', 400, 'TEXT_PROCESSING_ERROR');
  }
}

/**
 * Cleans and normalizes text content
 */
function cleanText(text: string): string {
  // Remove null bytes and control characters
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Normalize Unicode characters
  text = text.normalize('NFKC');
  
  // Remove excessive whitespace
  text = text.replace(/\s+/g, ' ');
  
  // Remove leading/trailing whitespace
  text = text.trim();
  
  // Remove empty lines
  text = text.replace(/\n\s*\n/g, '\n');
  
  // Limit line length (prevent extremely long lines)
  text = text
    .split('\n')
    .map(line => line.length > 1000 ? line.substring(0, 1000) + '...' : line)
    .join('\n');
  
  return text;
}

/**
 * Validates processed text content
 */
function validateProcessedText(text: string): void {
  if (!text || text.trim().length === 0) {
    throw new AppError('Text content is empty after processing', 400, 'EMPTY_TEXT_CONTENT');
  }
  
  if (text.length < 10) {
    throw new AppError('Text content too short for meaningful analysis', 400, 'TEXT_TOO_SHORT');
  }
  
  if (text.length > 100000) {
    throw new AppError('Text content too long for processing', 400, 'TEXT_TOO_LONG');
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script[^>]*>/i,
    /javascript:/i,
    /data:text\/html/i,
    /vbscript:/i,
    /<iframe[^>]*>/i,
    /<object[^>]*>/i,
    /<embed[^>]*>/i
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(text)) {
      throw new AppError('Text contains potentially harmful content', 400, 'SUSPICIOUS_CONTENT');
    }
  }
}

/**
 * Basic language detection (simplified implementation)
 */
function detectLanguage(text: string): string {
  // Simple heuristic-based language detection
  const sample = text.substring(0, 1000).toLowerCase();
  
  // English indicators
  const englishWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'];
  const englishCount = englishWords.filter(word => sample.includes(word)).length;
  
  // Spanish indicators
  const spanishWords = ['que', 'de', 'no', 'a', 'la', 'el', 'es', 'y', 'en', 'lo', 'un', 'por', 'qué', 'me', 'una', 'te', 'los', 'se', 'con', 'para', 'mi', 'está', 'si', 'bien', 'pero', 'yo', 'eso', 'las', 'sí', 'su', 'tu', 'aquí', 'del', 'al', 'como', 'le', 'más', 'esto', 'ya', 'todo', 'esta', 'vamos', 'muy', 'hay', 'ahora', 'algo', 'estoy', 'tengo', 'nos', 'tú', 'nada', 'cuando', 'ha', 'este', 'sé', 'estás', 'así', 'puedo', 'cómo', 'quiero', 'solo', 'soy', 'tiene', 'nos', 'ni', 'donde', 'él', 'ella', 'estar', 'tenía', 'lo', 'todo'];
  const spanishCount = spanishWords.filter(word => sample.includes(word)).length;
  
  // French indicators
  const frenchWords = ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour', 'dans', 'ce', 'son', 'une', 'sur', 'avec', 'ne', 'se', 'pas', 'tout', 'plus', 'par', 'grand', 'en', 'une', 'être', 'et', 'en', 'avoir', 'que', 'pour'];
  const frenchCount = frenchWords.filter(word => sample.includes(word)).length;
  
  // Determine language based on word counts
  if (englishCount > spanishCount && englishCount > frenchCount) {
    return 'en';
  } else if (spanishCount > englishCount && spanishCount > frenchCount) {
    return 'es';
  } else if (frenchCount > englishCount && frenchCount > spanishCount) {
    return 'fr';
  }
  
  // Default to English if uncertain
  return 'en';
}

/**
 * Extracts key phrases from text content
 */
export function extractKeyPhrases(text: string, maxPhrases: number = 20): string[] {
  // Simple keyword extraction (in production, use more sophisticated NLP)
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  // Count word frequency
  const wordCount = new Map<string, number>();
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });
  
  // Filter out common stop words
  const stopWords = new Set([
    'this', 'that', 'with', 'have', 'will', 'been', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were'
  ]);
  
  // Get top phrases
  const keyPhrases = Array.from(wordCount.entries())
    .filter(([word]) => !stopWords.has(word))
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxPhrases)
    .map(([word]) => word);
  
  return keyPhrases;
}

/**
 * Calculates text readability score (simplified Flesch Reading Ease)
 */
export function calculateReadabilityScore(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((count, word) => count + countSyllables(word), 0);
  
  if (sentences.length === 0 || words.length === 0) {
    return 0;
  }
  
  const avgSentenceLength = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;
  
  // Flesch Reading Ease formula
  const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Counts syllables in a word (simplified)
 */
function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  
  const vowels = 'aeiouy';
  let count = 0;
  let previousWasVowel = false;
  
  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);
    if (isVowel && !previousWasVowel) {
      count++;
    }
    previousWasVowel = isVowel;
  }
  
  // Handle silent 'e'
  if (word.endsWith('e')) {
    count--;
  }
  
  return Math.max(1, count);
}