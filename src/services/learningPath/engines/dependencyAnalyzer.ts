/**
 * Dependency Analysis Engine
 * 
 * Analyzes skill dependencies and prerequisites for learning path generation.
 * Handles complex dependency mapping and validation.
 */

import { logger } from '../../../utils/logger';
import { SkillGap } from '../../gapAnalysis';
import { UserSkill } from '../../skillMatching';
import { 
  SkillDependency, 
  DependencyAnalysisResult,
  SKILL_PREREQUISITES,
  CATEGORY_DEPENDENCIES,
  BASE_LEARNING_HOURS,
  CATEGORY_MULTIPLIERS
} from '../core/types';

export class DependencyAnalyzer {
  private skillDependencies: Map<string, SkillDependency> = new Map();
  private categoryDependencies: Map<string, string[]> = new Map();

  constructor() {
    this.initializeSkillDependencies();
    this.initializeCategoryDependencies();
  }

  /**
   * Analyzes dependencies for a set of skill gaps
   */
  async analyzeDependencies(
    skillGaps: SkillGap[],
    userSkills: UserSkill[]
  ): Promise<DependencyAnalysisResult> {
    try {
      logger.info('Starting dependency analysis', { 
        skillGapCount: skillGaps.length,
        userSkillCount: userSkills.length 
      });

      const dependencies = new Map<string, SkillDependency>();
      
      // Analyze each skill gap
      for (const gap of skillGaps) {
        const dependency = await this.analyzeSkillDependency(gap);
        dependencies.set(gap.skillName, dependency);
      }

      // Update dependencies based on the specific gaps
      this.updateDependenciesForGaps(dependencies, skillGaps);

      // Identify met prerequisites
      const prerequisitesMet = this.identifyMetPrerequisites(dependencies, userSkills);
      
      // Find missing prerequisites
      const missingPrerequisites = this.findMissingPrerequisites(dependencies, userSkills);

      const result: DependencyAnalysisResult = {
        dependencies,
        prerequisitesMet,
        missingPrerequisites
      };

      logger.info('Dependency analysis completed', {
        totalDependencies: dependencies.size,
        prerequisitesMet,
        missingPrerequisites: missingPrerequisites.length
      });

      return result;

    } catch (error) {
      logger.error('Dependency analysis failed', error);
      throw new Error(`Dependency analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyzes dependency for a single skill gap
   */
  private async analyzeSkillDependency(gap: SkillGap): Promise<SkillDependency> {
    // Check if we already have this dependency mapped
    let dependency = this.skillDependencies.get(gap.skillName);
    
    if (!dependency) {
      // Create new dependency analysis
      dependency = await this.createSkillDependency(gap);
      this.skillDependencies.set(gap.skillName, dependency);
    }

    return dependency;
  }

  /**
   * Creates skill dependency information
   */
  private async createSkillDependency(gap: SkillGap): Promise<SkillDependency> {
    const prerequisites = this.identifyPrerequisites(gap.skillName, gap.category);
    const dependents = this.identifyDependents(gap.skillName, gap.category);
    const estimatedHours = this.estimateSkillLearningHours(gap);
    
    return {
      skillName: gap.skillName,
      category: gap.category,
      prerequisites,
      dependents,
      difficulty: gap.learningDifficulty,
      estimatedHours,
      confidence: this.calculateDependencyConfidence(gap.skillName, prerequisites)
    };
  }

  /**
   * Identifies prerequisite skills for a given skill
   */
  private identifyPrerequisites(skillName: string, category: string): string[] {
    const prerequisites: string[] = [];
    
    // Check predefined skill prerequisites
    const predefinedPrereqs = SKILL_PREREQUISITES[skillName as keyof typeof SKILL_PREREQUISITES];
    if (predefinedPrereqs) {
      prerequisites.push(...predefinedPrereqs);
    }

    // Add category-based prerequisites
    const categoryPrereqs = this.getCategoryPrerequisites(category);
    prerequisites.push(...categoryPrereqs);

    // Add pattern-based prerequisites
    const patternPrereqs = this.getPatternBasedPrerequisites(skillName);
    prerequisites.push(...patternPrereqs);

    // Remove duplicates and return
    return [...new Set(prerequisites)];
  }

  /**
   * Gets prerequisites based on category dependencies
   */
  private getCategoryPrerequisites(category: string): string[] {
    const categoryDeps = CATEGORY_DEPENDENCIES[category as keyof typeof CATEGORY_DEPENDENCIES];
    return categoryDeps || [];
  }

  /**
   * Gets prerequisites based on skill name patterns
   */
  private getPatternBasedPrerequisites(skillName: string): string[] {
    const skill = skillName.toLowerCase();
    const prerequisites: string[] = [];
    
    // Advanced framework patterns
    if (skill.includes('advanced') || skill.includes('senior')) {
      const baseSkill = skillName.replace(/advanced\s+|senior\s+/i, '');
      prerequisites.push(baseSkill);
    }

    // Version-specific patterns
    if (skill.match(/\d+(\.\d+)?/)) {
      const baseSkill = skillName.replace(/\s*\d+(\.\d+)?.*/, '');
      prerequisites.push(baseSkill);
    }

    // Specialization patterns
    if (skill.includes('testing') && !skill.includes('unit testing')) {
      prerequisites.push('Unit Testing');
    }

    if (skill.includes('performance') && skill.includes('optimization')) {
      prerequisites.push('Performance Analysis');
    }

    return prerequisites;
  }

  /**
   * Identifies skills that depend on this skill
   */
  private identifyDependents(skillName: string, category: string): string[] {
    const dependents: string[] = [];
    
    // Find skills that list this as a prerequisite
    for (const [skill, prereqs] of Object.entries(SKILL_PREREQUISITES)) {
      if (prereqs.includes(skillName)) {
        dependents.push(skill);
      }
    }

    // Add pattern-based dependents
    const patternDependents = this.getPatternBasedDependents(skillName);
    dependents.push(...patternDependents);

    return [...new Set(dependents)];
  }

  /**
   * Gets dependents based on skill name patterns
   */
  private getPatternBasedDependents(skillName: string): string[] {
    const skill = skillName.toLowerCase();
    const dependents: string[] = [];
    
    // Base skills that enable advanced versions
    if (!skill.includes('advanced') && !skill.includes('senior')) {
      dependents.push(`Advanced ${skillName}`, `Senior ${skillName}`);
    }

    // Programming languages enable frameworks
    if (['javascript', 'python', 'java', 'c#', 'ruby'].includes(skill)) {
      // Add common frameworks for this language
      const frameworks = this.getFrameworksForLanguage(skillName);
      dependents.push(...frameworks);
    }

    return dependents;
  }

  /**
   * Gets common frameworks for a programming language
   */
  private getFrameworksForLanguage(language: string): string[] {
    const lang = language.toLowerCase();
    const frameworkMap: Record<string, string[]> = {
      'javascript': ['React', 'Angular', 'Vue.js', 'Node.js', 'Express.js'],
      'python': ['Django', 'Flask', 'FastAPI'],
      'java': ['Spring Boot', 'Spring Framework'],
      'c#': ['ASP.NET', '.NET Core'],
      'ruby': ['Ruby on Rails']
    };

    return frameworkMap[lang] || [];
  }

  /**
   * Estimates learning hours for a skill based on gap information
   */
  private estimateSkillLearningHours(gap: SkillGap): number {
    const baseHours = BASE_LEARNING_HOURS[gap.learningDifficulty];
    const categoryMultiplier = CATEGORY_MULTIPLIERS[gap.category as keyof typeof CATEGORY_MULTIPLIERS] || 1.0;
    
    // Adjust based on gap severity
    const severityMultiplier = {
      'minor': 0.7,
      'moderate': 1.0,
      'major': 1.3,
      'critical': 1.5
    }[gap.gapSeverity] || 1.0;

    // Adjust based on importance
    const importanceMultiplier = {
      'low': 0.8,
      'medium': 1.0,
      'high': 1.2,
      'critical': 1.4
    }[gap.importance] || 1.0;

    const estimatedHours = Math.round(
      baseHours * categoryMultiplier * severityMultiplier * importanceMultiplier
    );

    return Math.max(10, Math.min(200, estimatedHours)); // Clamp between 10-200 hours
  }

  /**
   * Calculates confidence score for dependency mapping
   */
  private calculateDependencyConfidence(skillName: string, prerequisites: string[]): number {
    let confidence = 0.5; // Base confidence

    // Higher confidence for predefined mappings
    if (SKILL_PREREQUISITES[skillName as keyof typeof SKILL_PREREQUISITES]) {
      confidence += 0.3;
    }

    // Higher confidence for skills with clear patterns
    if (prerequisites.length > 0) {
      confidence += 0.2;
    }

    // Lower confidence for very specific or niche skills
    if (skillName.includes('Advanced') || skillName.includes('Senior')) {
      confidence += 0.1;
    }

    return Math.min(0.95, confidence);
  }

  /**
   * Identifies prerequisites that the user already has
   */
  private identifyMetPrerequisites(
    dependencies: Map<string, SkillDependency>,
    userSkills: UserSkill[]
  ): number {
    const userSkillNames = new Set(userSkills.map(skill => skill.skillName));
    let metCount = 0;

    for (const dependency of dependencies.values()) {
      for (const prerequisite of dependency.prerequisites) {
        if (userSkillNames.has(prerequisite)) {
          metCount++;
        }
      }
    }

    return metCount;
  }

  /**
   * Finds missing prerequisites that need to be learned
   */
  private findMissingPrerequisites(
    dependencies: Map<string, SkillDependency>,
    userSkills: UserSkill[]
  ): string[] {
    const userSkillNames = new Set(userSkills.map(skill => skill.skillName));
    const missingPrerequisites = new Set<string>();

    for (const dependency of dependencies.values()) {
      for (const prerequisite of dependency.prerequisites) {
        if (!userSkillNames.has(prerequisite) && !dependencies.has(prerequisite)) {
          missingPrerequisites.add(prerequisite);
        }
      }
    }

    return Array.from(missingPrerequisites);
  }

  /**
   * Updates dependencies based on specific gaps in this analysis
   */
  private updateDependenciesForGaps(
    dependencies: Map<string, SkillDependency>,
    skillGaps: SkillGap[]
  ): void {
    const gapSkillNames = new Set(skillGaps.map(gap => gap.skillName));

    // Update prerequisites to only include skills that are in the gap list or already known
    for (const [skillName, dependency] of dependencies.entries()) {
      const filteredPrerequisites = dependency.prerequisites.filter(prereq => 
        gapSkillNames.has(prereq) || this.isCommonPrerequisite(prereq)
      );

      dependencies.set(skillName, {
        ...dependency,
        prerequisites: filteredPrerequisites
      });
    }
  }

  /**
   * Checks if a prerequisite is commonly known (basic skills)
   */
  private isCommonPrerequisite(skillName: string): boolean {
    const commonSkills = [
      'HTML', 'CSS', 'JavaScript', 'SQL', 'Git',
      'Linux', 'Networking', 'Database Concepts',
      'Programming Fundamentals', 'Computer Science Basics'
    ];

    return commonSkills.includes(skillName);
  }

  /**
   * Initializes predefined skill dependencies
   */
  private initializeSkillDependencies(): void {
    // Initialize with common skill patterns
    // This could be loaded from a database or configuration file
    logger.info('Initialized skill dependencies mapping');
  }

  /**
   * Initializes category-level dependencies
   */
  private initializeCategoryDependencies(): void {
    this.categoryDependencies = new Map(Object.entries(CATEGORY_DEPENDENCIES));
    logger.info('Initialized category dependencies mapping');
  }

  /**
   * Gets dependency information for a specific skill
   */
  getSkillDependency(skillName: string): SkillDependency | null {
    return this.skillDependencies.get(skillName) || null;
  }

  /**
   * Checks if a skill has any dependencies
   */
  hasDependencies(skillName: string): boolean {
    const dependency = this.skillDependencies.get(skillName);
    return dependency ? dependency.prerequisites.length > 0 : false;
  }

  /**
   * Gets all skills that depend on a given skill
   */
  getDependentSkills(skillName: string): string[] {
    const dependency = this.skillDependencies.get(skillName);
    return dependency ? dependency.dependents : [];
  }
}