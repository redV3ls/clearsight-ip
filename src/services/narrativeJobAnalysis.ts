/**
 * Narrative Job Analysis Service
 * Handles job description integration for narrative CV analysis
 */

import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

export interface JobAnalysisInsights {
  keyRequirements: string[];
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  criticalSkills: string[];
  industryContext: string;
  companySize?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  workArrangement?: 'remote' | 'hybrid' | 'onsite' | 'flexible';
  culturalIndicators: string[];
  growthOpportunities: string[];
  competitiveAdvantages: string[];
}

export interface NarrativeJobComparison {
  overallFit: 'excellent' | 'good' | 'moderate' | 'poor';
  fitScore: number; // 0-100
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  narrativeGuidance: string;
}

export class NarrativeJobAnalysisService {
  /**
   * Extract key insights from job description for narrative analysis
   */
  static extractJobInsights(jobDescription: string): JobAnalysisInsights {
    const lowerJob = jobDescription.toLowerCase();
    
    // Extract experience level
    let experienceLevel: 'entry' | 'mid' | 'senior' | 'executive' = 'mid';
    if (lowerJob.includes('entry') || lowerJob.includes('junior') || lowerJob.includes('0-2 years')) {
      experienceLevel = 'entry';
    } else if (lowerJob.includes('senior') || lowerJob.includes('lead') || lowerJob.includes('5+ years')) {
      experienceLevel = 'senior';
    } else if (lowerJob.includes('director') || lowerJob.includes('vp') || lowerJob.includes('executive')) {
      experienceLevel = 'executive';
    }

    // Extract work arrangement
    let workArrangement: 'remote' | 'hybrid' | 'onsite' | 'flexible' | undefined;
    if (lowerJob.includes('remote')) workArrangement = 'remote';
    else if (lowerJob.includes('hybrid')) workArrangement = 'hybrid';
    else if (lowerJob.includes('on-site') || lowerJob.includes('onsite')) workArrangement = 'onsite';
    else if (lowerJob.includes('flexible')) workArrangement = 'flexible';

    // Extract company size indicators
    let companySize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise' | undefined;
    if (lowerJob.includes('startup') || lowerJob.includes('early stage')) companySize = 'startup';
    else if (lowerJob.includes('fortune 500') || lowerJob.includes('enterprise')) companySize = 'enterprise';
    else if (lowerJob.includes('large company') || lowerJob.includes('established')) companySize = 'large';

    // Extract key requirements (simplified extraction)
    const keyRequirements = this.extractRequirements(jobDescription);
    const criticalSkills = this.extractCriticalSkills(jobDescription);
    const culturalIndicators = this.extractCulturalIndicators(jobDescription);
    const growthOpportunities = this.extractGrowthOpportunities(jobDescription);
    const competitiveAdvantages = this.extractCompetitiveAdvantages(jobDescription);

    return {
      keyRequirements,
      experienceLevel,
      criticalSkills,
      industryContext: this.extractIndustryContext(jobDescription),
      companySize,
      workArrangement,
      culturalIndicators,
      growthOpportunities,
      competitiveAdvantages
    };
  }

  /**
   * Generate narrative guidance for job comparison
   */
  static generateNarrativeGuidance(
    jobInsights: JobAnalysisInsights,
    cvContent: string
  ): string {
    const guidance = [];

    // Experience level guidance
    guidance.push(`Focus on how their experience aligns with the ${jobInsights.experienceLevel}-level expectations.`);

    // Skills alignment guidance
    if (jobInsights.criticalSkills.length > 0) {
      guidance.push(`Highlight experience with: ${jobInsights.criticalSkills.slice(0, 3).join(', ')}.`);
    }

    // Cultural fit guidance
    if (jobInsights.culturalIndicators.length > 0) {
      guidance.push(`Address cultural fit aspects like: ${jobInsights.culturalIndicators.slice(0, 2).join(', ')}.`);
    }

    // Work arrangement guidance
    if (jobInsights.workArrangement) {
      guidance.push(`Consider their fit for ${jobInsights.workArrangement} work arrangement.`);
    }

    return guidance.join(' ');
  }

  /**
   * Create enhanced narrative prompt with job analysis insights
   */
  static createEnhancedJobComparisonPrompt(
    cvText: string,
    jobDescription: string,
    jobInsights: JobAnalysisInsights
  ): string {
    return `You are an experienced career coach providing personalized resume feedback with job fit analysis. Write a compelling narrative that assesses this candidate's fit for the specific role.

ANALYSIS STRUCTURE:

**Job Fit Assessment**
Evaluate how well this candidate matches the ${jobInsights.experienceLevel}-level role. Consider their alignment with the key requirements and company culture.

**Professional Journey & Relevance**
Tell their career story, emphasizing experiences most relevant to this role. Highlight achievements that demonstrate the required capabilities.

**Competitive Strengths**
Identify what makes them a strong candidate for this specific position. Focus on unique qualifications that set them apart.

**Gap Analysis & Development**
Honestly assess any gaps between their background and the role requirements. Provide specific, actionable guidance for addressing these gaps.

**Strategic Positioning**
Recommend 2-3 concrete steps to strengthen their candidacy and position themselves as the ideal candidate.

KEY ROLE REQUIREMENTS TO ADDRESS:
${jobInsights.keyRequirements.slice(0, 5).join('\n')}

CRITICAL SKILLS TO EVALUATE:
${jobInsights.criticalSkills.slice(0, 5).join(', ')}

${jobInsights.workArrangement ? `WORK ARRANGEMENT: ${jobInsights.workArrangement}` : ''}

TARGET ROLE:
${jobDescription}

CANDIDATE RESUME:
${cvText}

Write a cohesive narrative that flows naturally and provides specific, actionable insights for this job opportunity. Be encouraging yet honest about fit and areas for development.`;
  }

  /**
   * Extract requirements from job description
   */
  private static extractRequirements(jobDescription: string): string[] {
    const requirements: string[] = [];
    const lines = jobDescription.split('\n');
    
    let inRequirementsSection = false;
    for (const line of lines) {
      const lowerLine = line.toLowerCase().trim();
      
      // Detect requirements section
      if (lowerLine.includes('requirement') || lowerLine.includes('qualification') || 
          lowerLine.includes('must have') || lowerLine.includes('essential')) {
        inRequirementsSection = true;
        continue;
      }
      
      // Stop at next major section
      if (inRequirementsSection && (lowerLine.includes('benefit') || lowerLine.includes('offer') || 
          lowerLine.includes('about us') || lowerLine.includes('company'))) {
        break;
      }
      
      // Extract requirement items
      if (inRequirementsSection && line.trim().length > 10) {
        const cleanLine = line.replace(/^[-•*]\s*/, '').trim();
        if (cleanLine.length > 0 && cleanLine.length < 200) {
          requirements.push(cleanLine);
        }
      }
    }
    
    return requirements.slice(0, 8); // Limit to most important requirements
  }

  /**
   * Extract critical skills from job description
   */
  private static extractCriticalSkills(jobDescription: string): string[] {
    const skills: string[] = [];
    const lowerJob = jobDescription.toLowerCase();
    
    // Common skill patterns
    const skillPatterns = [
      // Programming languages
      'javascript', 'python', 'java', 'typescript', 'c#', 'php', 'ruby', 'go',
      // Frameworks
      'react', 'angular', 'vue', 'node.js', 'django', 'spring', 'express',
      // Cloud platforms
      'aws', 'azure', 'gcp', 'google cloud', 'kubernetes', 'docker',
      // Databases
      'sql', 'mysql', 'postgresql', 'mongodb', 'redis',
      // Tools
      'git', 'jenkins', 'terraform', 'ansible',
      // Methodologies
      'agile', 'scrum', 'devops', 'ci/cd'
    ];
    
    skillPatterns.forEach(skill => {
      if (lowerJob.includes(skill)) {
        skills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
      }
    });
    
    return [...new Set(skills)].slice(0, 10);
  }

  /**
   * Extract cultural indicators
   */
  private static extractCulturalIndicators(jobDescription: string): string[] {
    const indicators: string[] = [];
    const lowerJob = jobDescription.toLowerCase();
    
    const culturalKeywords = [
      'collaborative', 'team player', 'innovative', 'fast-paced', 'startup culture',
      'work-life balance', 'flexible', 'autonomous', 'entrepreneurial', 'data-driven',
      'customer-focused', 'results-oriented', 'growth mindset', 'inclusive', 'diverse'
    ];
    
    culturalKeywords.forEach(keyword => {
      if (lowerJob.includes(keyword)) {
        indicators.push(keyword);
      }
    });
    
    return indicators.slice(0, 5);
  }

  /**
   * Extract growth opportunities
   */
  private static extractGrowthOpportunities(jobDescription: string): string[] {
    const opportunities: string[] = [];
    const lowerJob = jobDescription.toLowerCase();
    
    if (lowerJob.includes('career growth') || lowerJob.includes('advancement')) {
      opportunities.push('Career advancement opportunities');
    }
    if (lowerJob.includes('learning') || lowerJob.includes('development')) {
      opportunities.push('Professional development and learning');
    }
    if (lowerJob.includes('mentor') || lowerJob.includes('coaching')) {
      opportunities.push('Mentorship and coaching');
    }
    if (lowerJob.includes('leadership') || lowerJob.includes('lead')) {
      opportunities.push('Leadership development');
    }
    
    return opportunities;
  }

  /**
   * Extract competitive advantages
   */
  private static extractCompetitiveAdvantages(jobDescription: string): string[] {
    const advantages: string[] = [];
    const lowerJob = jobDescription.toLowerCase();
    
    if (lowerJob.includes('competitive salary') || lowerJob.includes('compensation')) {
      advantages.push('Competitive compensation');
    }
    if (lowerJob.includes('equity') || lowerJob.includes('stock options')) {
      advantages.push('Equity participation');
    }
    if (lowerJob.includes('benefits') || lowerJob.includes('health')) {
      advantages.push('Comprehensive benefits');
    }
    if (lowerJob.includes('remote') || lowerJob.includes('flexible')) {
      advantages.push('Flexible work arrangements');
    }
    
    return advantages;
  }

  /**
   * Extract industry context
   */
  private static extractIndustryContext(jobDescription: string): string {
    const lowerJob = jobDescription.toLowerCase();
    
    if (lowerJob.includes('fintech') || lowerJob.includes('financial')) return 'Financial Technology';
    if (lowerJob.includes('healthcare') || lowerJob.includes('medical')) return 'Healthcare';
    if (lowerJob.includes('ecommerce') || lowerJob.includes('retail')) return 'E-commerce/Retail';
    if (lowerJob.includes('saas') || lowerJob.includes('software')) return 'Software/SaaS';
    if (lowerJob.includes('startup')) return 'Startup';
    if (lowerJob.includes('enterprise')) return 'Enterprise';
    
    return 'Technology';
  }

  /**
   * Validate job description quality for narrative analysis
   */
  static validateJobDescription(jobDescription: string): {
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    if (jobDescription.length < 100) {
      issues.push('Job description is too short for meaningful analysis');
      suggestions.push('Provide a more detailed job description with requirements and responsibilities');
    }
    
    if (jobDescription.length > 5000) {
      issues.push('Job description is very long and may impact analysis quality');
      suggestions.push('Consider providing a condensed version focusing on key requirements');
    }
    
    const lowerJob = jobDescription.toLowerCase();
    if (!lowerJob.includes('requirement') && !lowerJob.includes('qualification') && !lowerJob.includes('skill')) {
      issues.push('Job description lacks clear requirements or qualifications');
      suggestions.push('Include specific requirements, qualifications, or skills needed for the role');
    }
    
    if (!lowerJob.includes('experience') && !lowerJob.includes('year')) {
      suggestions.push('Consider including experience level requirements for better analysis');
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      suggestions
    };
  }
}