/**
 * AI Prompt Building Utilities
 * 
 * Utilities for constructing effective prompts for AI services.
 * Provides templates and builders for consistent prompt generation.
 */

export interface PromptTemplate {
  name: string;
  template: string;
  variables: string[];
  description: string;
}

export interface PromptContext {
  language?: string;
  industry?: string;
  userLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  outputFormat?: 'json' | 'text' | 'markdown';
  includeExamples?: boolean;
}

/**
 * Prompt Builder Class
 */
export class PromptBuilder {
  private templates: Map<string, PromptTemplate> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
  }

  /**
   * Initializes default prompt templates
   */
  private initializeDefaultTemplates(): void {
    // Skills Analysis Template
    this.addTemplate({
      name: 'skills-analysis',
      template: `
Analyze the following {{contentType}} and extract professional skills information.

{{#if language}}Analyze in {{language}} language.{{/if}}
{{#if industry}}Focus on {{industry}} industry context.{{/if}}

Content: "{{content}}"

Provide analysis in {{outputFormat}} format with:
1. Identified skills with proficiency levels
2. Years of experience per skill
3. Skill categories and groupings
4. Missing skills for target role (if provided)
5. Recommendations for skill development

{{#if includeExamples}}Include specific examples from the content.{{/if}}

Response:`,
      variables: ['contentType', 'content', 'language', 'industry', 'outputFormat', 'includeExamples'],
      description: 'Template for analyzing skills from resumes or job descriptions'
    });

    // Language Detection Template
    this.addTemplate({
      name: 'language-detection',
      template: `
Detect the primary language of the following text.
Respond with only the ISO 639-1 language code (e.g., 'en', 'es', 'fr', 'de').

Text: "{{text}}"

Language code:`,
      variables: ['text'],
      description: 'Template for detecting the primary language of text'
    });

    // Translation Template
    this.addTemplate({
      name: 'translation',
      template: `
Translate the following text from {{sourceLanguage}} to {{targetLanguage}}.
Maintain professional tone and technical accuracy.
{{#if context}}Context: {{context}}{{/if}}

Text: "{{text}}"

Translation:`,
      variables: ['text', 'sourceLanguage', 'targetLanguage', 'context'],
      description: 'Template for translating text between languages'
    });
  }

  /**
   * Adds a new template
   */
  addTemplate(template: PromptTemplate): void {
    this.templates.set(template.name, template);
  }

  /**
   * Builds a prompt from a template
   */
  buildPrompt(templateName: string, variables: Record<string, any>): string {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    let prompt = template.template;
    
    // Simple variable substitution
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      prompt = prompt.replace(regex, String(value));
    }

    // Handle conditional blocks (simplified)
    prompt = prompt.replace(/{{#if\s+(\w+)}}(.*?){{\/if}}/gs, (match, condition, content) => {
      return variables[condition] ? content : '';
    });

    return prompt.trim();
  }

  /**
   * Gets available templates
   */
  getAvailableTemplates(): string[] {
    return Array.from(this.templates.keys());
  }

  /**
   * Gets template details
   */
  getTemplate(name: string): PromptTemplate | null {
    return this.templates.get(name) || null;
  }
}

/**
 * Utility functions for prompt optimization
 */
export class PromptOptimizer {
  /**
   * Optimizes prompt length while maintaining context
   */
  static optimizeLength(prompt: string, maxLength: number): string {
    if (prompt.length <= maxLength) {
      return prompt;
    }

    // Try to truncate while preserving structure
    const lines = prompt.split('\n');
    let optimized = '';
    
    for (const line of lines) {
      if (optimized.length + line.length + 1 <= maxLength) {
        optimized += line + '\n';
      } else {
        break;
      }
    }

    return optimized.trim() + '\n\n[Content truncated for length]';
  }

  /**
   * Adds context-aware instructions
   */
  static addContextInstructions(prompt: string, context: PromptContext): string {
    let instructions = '';

    if (context.outputFormat) {
      instructions += `\nProvide response in ${context.outputFormat.toUpperCase()} format.`;
    }

    if (context.userLevel) {
      instructions += `\nTailor explanation for ${context.userLevel} level understanding.`;
    }

    if (context.language && context.language !== 'en') {
      instructions += `\nRespond in ${context.language} language.`;
    }

    return prompt + instructions;
  }

  /**
   * Validates prompt structure
   */
  static validatePrompt(prompt: string): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (prompt.length < 10) {
      issues.push('Prompt too short');
    }

    if (prompt.length > 50000) {
      issues.push('Prompt too long');
    }

    if (!prompt.includes('?') && !prompt.includes(':')) {
      issues.push('Prompt lacks clear instruction or question');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}