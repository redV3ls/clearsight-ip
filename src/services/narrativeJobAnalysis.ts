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
    return `You are a professional career coach analyzing this CV against a specific job to provide actionable improvement guidance.

CRITICAL REQUIREMENTS:
1. Format your response using proper markdown with ## for headers and ### for subheaders
2. MUST include ALL sections listed below, especially Quick Wins and Learning Resources
3. Be SPECIFIC with resource names, platforms, courses, and URLs where possible
4. Provide at least 3 Quick Wins that can be done TODAY with exact resources
5. Include exact course names and platforms, not generic recommendations
6. Do NOT skip the learning resources sections - they are MANDATORY

Linking and resources formatting rules:
- When recommending external resources (courses, tutorials, docs, videos), include a clickable reference for each item.
  - In text/markdown sections, format each as a Markdown link: [Title](https://absolute.url). Do not use HTML <a> tags.
  - In any JSON-like examples where resources are strings, each string should be a Markdown link [Title](https://absolute.url).
- Never output a resource title without its corresponding URL.
- Prefer official sources when relevant (e.g., vendor docs, Microsoft Learn, AWS Training) before third-party platforms.
- If a precise URL is not known, link to a platform search for the topic using these patterns (replace YOUR_QUERY with the topic):
  - Microsoft Learn: https://learn.microsoft.com/en-us/search/?terms=YOUR_QUERY
  - Udemy: https://www.udemy.com/courses/search/?q=YOUR_QUERY
  - Coursera: https://www.coursera.org/search?query=YOUR_QUERY
  - YouTube: https://www.youtube.com/results?search_query=YOUR_QUERY
  - edX: https://www.edx.org/search?q=YOUR_QUERY
  - Pluralsight: https://www.pluralsight.com/search?q=YOUR_QUERY
  - freeCodeCamp: https://www.google.com/search?q=site%3Afreecodecamp.org+YOUR_QUERY
  - Khan Academy: https://www.khanacademy.org/search?page_search_query=YOUR_QUERY
  - A Cloud Guru: https://acloudguru.com/search?query=YOUR_QUERY
  - AWS Training: https://www.aws.training/LearningLibrary?search=YOUR_QUERY
- Use absolute URLs starting with http:// or https:// (do not use bare www).

IMPORTANT: Do NOT add emojis in section headers (they are shown in the template for emphasis only). Do NOT use legacy titles like "Your Career Story". Do NOT include any sections other than those specified below.

Provide your analysis in the following structure and only these sections:

## Job Match Analysis

### Overall Fit Assessment
[Evaluate how well this candidate matches the ${jobInsights.experienceLevel}-level role — include a percentage fit estimate with 1-2 sentences on why]

### Strengths for This Role
[List 3-4 specific strengths that align with the job requirements:]
- Relevant experience with specific examples
- Skills that directly match job needs
- Achievements that demonstrate required capabilities

### Critical Gaps to Address
[List 4-5 specific gaps between CV and job requirements:]
- Missing skills or certifications
- Lack of specific experience areas
- Technologies not demonstrated
- Industry knowledge gaps

### CV Improvements for This Application
[Specific changes to make their CV more competitive:]
- Keywords to add from the job description
- Achievements to highlight more prominently
- Skills to emphasize based on requirements
- Sections to reorganize or add

### Action Plan with Learning Resources

#### 🚀 Quick Wins (Can Do Today)
**MANDATORY: Provide 3 immediate actions with SPECIFIC resources**
1. **[Specific Action]** - Learn via: [Exact Course/Tutorial Name on Platform]
   - Example: "Tailor CV keywords" - Resource: "Resume Keyword Optimization" guide on Indeed Career Guide
2. **[Specific Action]** - Practice with: [Specific Tool/Platform]
   - Example: "Practice coding problems" - Resource: LeetCode's "Top Interview Questions" (free tier)
3. **[Specific Action]** - Implement: [Specific Template/Framework]
   - Example: "Create portfolio project" - Resource: GitHub's "Hello World" tutorial + portfolio templates

#### 📚 Short-term Development (1-3 months)
**MANDATORY: List 3 skills with EXACT learning resources for this role**
1. **[Required Skill from Job]** 
   - Primary Resource: [Specific Course Name] on [Platform] ([Duration], [Cost])
   - Backup Resource: [Alternative free resource]
   - Practice Project: [Specific project idea related to the job]
2. **[Required Skill from Job]**
   - Primary Resource: [Specific Course/Certification]
   - Documentation: [Official docs or guides]
   - Community: [Relevant forum/community]
3. **[Required Skill from Job]**
   - Video Course: [YouTube channel/Udemy course]
   - Book: [Specific title and author]
   - Hands-on: [Practice platform or exercises]

#### 🎯 Interview Preparation Strategy
**MANDATORY: Include specific preparation resources**
1. **Technical Preparation**
   - Resource: [Specific interview prep platform/course]
   - Practice: [Mock interview platform]
   - Study Guide: [Company-specific or role-specific guide]
2. **Behavioral Preparation**
   - STAR Method Guide: [Specific resource]
   - Company Research: [Where to find insights]
   - Question Bank: [Specific preparation resource]

#### 🎓 Long-term Positioning (6-12 months)
**MANDATORY: Include 2 strategic moves with pathways**
1. **[Career Goal for This Path]**
   - Certification Path: [Specific certification + preparation resources]
   - Study Plan: [Recommended timeline and materials]
   - Cost: [Estimated investment]
2. **[Expertise Area for Role Growth]**
   - Learning Pathway: [Step-by-step progression]
   - Key Resources: [Bootcamps, degree programs, or specializations]
   - Networking: [Professional associations or events to join]

### Application Strategy
[How to position themselves as the best candidate, including cover letter points and networking approaches]

Key role requirements to address (context for you — do not echo this label in the output):
${jobInsights.keyRequirements.slice(0, 5).join('\n')}

Critical skills to evaluate (context for you — do not echo this label in the output):
${jobInsights.criticalSkills.slice(0, 5).join(', ')}

${jobInsights.workArrangement ? `Work arrangement (context): ${jobInsights.workArrangement}` : ''}

Target role (context):
${jobDescription}

Candidate resume (context):
${cvText}

Write a cohesive narrative that flows naturally and provides specific, actionable insights tailored to this job opportunity. Be encouraging yet honest about fit and areas for development. Keep the total length around 450–700 words.`;
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