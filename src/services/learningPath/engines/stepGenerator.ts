/**
 * Learning Step Generator
 * 
 * Generates detailed learning steps from skill gaps with objectives,
 * milestones, and reasoning.
 */

import { logger } from '../../../utils/logger';
import { SkillGap } from '../../gapAnalysis';
import { LearningStep, SkillDependency, LearningPathOptions } from '../core/types';

export class StepGenerator {

  /**
   * Creates learning steps from skill gaps
   */
  async generateSteps(
    skillGaps: SkillGap[],
    dependencies: Map<string, SkillDependency>,
    options: LearningPathOptions
  ): Promise<LearningStep[]> {
    try {
      logger.info('Generating learning steps', { 
        gapCount: skillGaps.length,
        options 
      });

      const steps: LearningStep[] = [];

      for (const gap of skillGaps) {
        const step = await this.createLearningStep(gap, dependencies, options);
        steps.push(step);
      }

      logger.info('Learning steps generated successfully', { 
        stepCount: steps.length 
      });

      return steps;

    } catch (error) {
      logger.error('Step generation failed', error);
      throw new Error(`Step generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Creates a single learning step from a skill gap
   */
  private async createLearningStep(
    gap: SkillGap,
    dependencies: Map<string, SkillDependency>,
    options: LearningPathOptions
  ): Promise<LearningStep> {
    const dependency = dependencies.get(gap.skillName);
    
    const step: LearningStep = {
      skillName: gap.skillName,
      category: gap.category,
      currentLevel: gap.currentLevel,
      targetLevel: gap.targetLevel,
      priority: this.calculatePriority(gap),
      estimatedHours: dependency?.estimatedHours || this.estimateDefaultHours(gap),
      prerequisites: dependency?.prerequisites || [],
      learningObjectives: this.generateLearningObjectives(gap, options),
      milestones: this.generateMilestones(gap, options),
      difficulty: gap.learningDifficulty,
      reasoning: this.generateStepReasoning(gap)
    };

    return step;
  }

  /**
   * Calculates priority score for a skill gap
   */
  private calculatePriority(gap: SkillGap): number {
    const importanceWeight = {
      'low': 2,
      'medium': 5,
      'high': 8,
      'critical': 10
    }[gap.importance] || 5;

    const severityWeight = {
      'minor': 1,
      'moderate': 3,
      'major': 6,
      'critical': 9
    }[gap.gapSeverity] || 3;

    const difficultyPenalty = {
      'easy': 0,
      'moderate': -1,
      'hard': -2,
      'very-hard': -3
    }[gap.learningDifficulty] || 0;

    // Calculate priority (1-10 scale)
    const priority = Math.min(10, Math.max(1, 
      Math.round((importanceWeight + severityWeight + difficultyPenalty) / 2)
    ));

    return priority;
  }

  /**
   * Estimates default learning hours if not provided by dependency analysis
   */
  private estimateDefaultHours(gap: SkillGap): number {
    const baseHours = {
      'easy': 20,
      'moderate': 40,
      'hard': 80,
      'very-hard': 120
    }[gap.learningDifficulty] || 40;

    const severityMultiplier = {
      'minor': 0.7,
      'moderate': 1.0,
      'major': 1.3,
      'critical': 1.5
    }[gap.gapSeverity] || 1.0;

    return Math.round(baseHours * severityMultiplier);
  }

  /**
   * Generates learning objectives for a skill gap
   */
  private generateLearningObjectives(gap: SkillGap, options: LearningPathOptions): string[] {
    const objectives: string[] = [];
    const skill = gap.skillName.toLowerCase();
    const targetLevel = gap.targetLevel;

    // Level-specific objectives
    if (targetLevel === 'beginner') {
      objectives.push(`Understand fundamental concepts of ${gap.skillName}`);
      objectives.push(`Complete basic exercises and tutorials`);
      objectives.push(`Build a simple project using ${gap.skillName}`);
    } else if (targetLevel === 'intermediate') {
      objectives.push(`Master core features and best practices of ${gap.skillName}`);
      objectives.push(`Implement real-world solutions using ${gap.skillName}`);
      objectives.push(`Debug and troubleshoot common issues`);
      objectives.push(`Optimize performance and follow industry standards`);
    } else if (targetLevel === 'advanced') {
      objectives.push(`Architect complex solutions using ${gap.skillName}`);
      objectives.push(`Mentor others and lead technical discussions`);
      objectives.push(`Contribute to open source projects or create frameworks`);
      objectives.push(`Stay current with latest developments and trends`);
    } else if (targetLevel === 'expert') {
      objectives.push(`Innovate and create new patterns using ${gap.skillName}`);
      objectives.push(`Speak at conferences and write technical articles`);
      objectives.push(`Design and implement enterprise-scale solutions`);
      objectives.push(`Influence technology decisions and strategy`);
    }

    // Skill-specific objectives
    if (skill.includes('programming') || skill.includes('language')) {
      objectives.push(`Write clean, maintainable code following best practices`);
      objectives.push(`Understand memory management and performance optimization`);
    }

    if (skill.includes('framework') || skill.includes('library')) {
      objectives.push(`Understand the framework's architecture and design patterns`);
      objectives.push(`Integrate with other tools and services effectively`);
    }

    if (skill.includes('database')) {
      objectives.push(`Design efficient database schemas and queries`);
      objectives.push(`Implement proper indexing and optimization strategies`);
    }

    if (skill.includes('cloud') || skill.includes('aws') || skill.includes('azure')) {
      objectives.push(`Understand cloud architecture and service selection`);
      objectives.push(`Implement security and cost optimization best practices`);
    }

    if (skill.includes('testing')) {
      objectives.push(`Write comprehensive test suites with good coverage`);
      objectives.push(`Implement automated testing in CI/CD pipelines`);
    }

    // Learning style adaptations
    if (options.learningStyle === 'visual') {
      objectives.push(`Create visual diagrams and documentation of key concepts`);
    } else if (options.learningStyle === 'kinesthetic') {
      objectives.push(`Build multiple hands-on projects to reinforce learning`);
    }

    return objectives.slice(0, 6); // Limit to 6 objectives
  }

  /**
   * Generates milestones for tracking progress
   */
  private generateMilestones(gap: SkillGap, options: LearningPathOptions): string[] {
    const milestones: string[] = [];
    const skill = gap.skillName;
    const estimatedHours = this.estimateDefaultHours(gap);

    // Time-based milestones
    const quarterHours = Math.round(estimatedHours / 4);
    milestones.push(`Complete initial ${skill} tutorial (${quarterHours} hours)`);
    milestones.push(`Build first practice project (${quarterHours * 2} hours)`);
    milestones.push(`Implement advanced features (${quarterHours * 3} hours)`);
    milestones.push(`Complete comprehensive project (${estimatedHours} hours)`);

    // Skill-specific milestones
    const skillLower = skill.toLowerCase();
    
    if (skillLower.includes('programming') || skillLower.includes('language')) {
      milestones.push(`Write and debug 100+ lines of code`);
      milestones.push(`Implement error handling and testing`);
      milestones.push(`Optimize code for performance`);
    }

    if (skillLower.includes('framework')) {
      milestones.push(`Set up development environment`);
      milestones.push(`Create basic application structure`);
      milestones.push(`Implement core functionality`);
      milestones.push(`Deploy to production environment`);
    }

    if (skillLower.includes('database')) {
      milestones.push(`Design and create database schema`);
      milestones.push(`Write complex queries and procedures`);
      milestones.push(`Implement performance optimization`);
    }

    if (skillLower.includes('testing')) {
      milestones.push(`Write unit tests with >80% coverage`);
      milestones.push(`Implement integration tests`);
      milestones.push(`Set up automated testing pipeline`);
    }

    // Level-specific milestones
    if (gap.targetLevel === 'expert') {
      milestones.push(`Contribute to open source project`);
      milestones.push(`Mentor junior developers`);
      milestones.push(`Present at technical meetup or conference`);
    }

    return milestones.slice(0, 8); // Limit to 8 milestones
  }

  /**
   * Generates reasoning for why this step is important
   */
  private generateStepReasoning(gap: SkillGap): string {
    const importance = gap.importance;
    const severity = gap.gapSeverity;
    const skill = gap.skillName;

    let reasoning = `Learning ${skill} is `;

    // Importance-based reasoning
    if (importance === 'critical') {
      reasoning += 'critical for your career advancement and immediate job requirements. ';
    } else if (importance === 'high') {
      reasoning += 'highly important for your professional growth and market competitiveness. ';
    } else if (importance === 'medium') {
      reasoning += 'important for expanding your skill set and career opportunities. ';
    } else {
      reasoning += 'valuable for rounding out your technical expertise. ';
    }

    // Severity-based reasoning
    if (severity === 'critical') {
      reasoning += 'There is a significant gap that needs immediate attention to meet job requirements.';
    } else if (severity === 'major') {
      reasoning += 'The current skill gap is substantial and addressing it will significantly improve your capabilities.';
    } else if (severity === 'moderate') {
      reasoning += 'Improving this skill will enhance your effectiveness and open new opportunities.';
    } else {
      reasoning += 'While the gap is minor, strengthening this skill will contribute to your overall expertise.';
    }

    // Add category-specific reasoning
    const category = gap.category.toLowerCase();
    if (category.includes('programming')) {
      reasoning += ' Strong programming skills are fundamental to software development success.';
    } else if (category.includes('framework')) {
      reasoning += ' Framework expertise accelerates development and improves code quality.';
    } else if (category.includes('cloud')) {
      reasoning += ' Cloud skills are increasingly essential in modern software architecture.';
    } else if (category.includes('data')) {
      reasoning += ' Data skills are crucial for making informed decisions and building intelligent systems.';
    }

    return reasoning;
  }

  /**
   * Validates generated learning steps
   */
  validateSteps(steps: LearningStep[]): boolean {
    try {
      for (const step of steps) {
        // Check required fields
        if (!step.skillName || !step.category || !step.targetLevel) {
          return false;
        }

        // Check priority range
        if (step.priority < 1 || step.priority > 10) {
          return false;
        }

        // Check estimated hours
        if (step.estimatedHours < 1 || step.estimatedHours > 500) {
          return false;
        }

        // Check arrays
        if (!Array.isArray(step.learningObjectives) || 
            !Array.isArray(step.milestones) || 
            !Array.isArray(step.prerequisites)) {
          return false;
        }
      }

      return true;
    } catch (error) {
      logger.error('Step validation failed', error);
      return false;
    }
  }

  /**
   * Gets step statistics
   */
  getStepStatistics(steps: LearningStep[]): {
    totalSteps: number;
    totalHours: number;
    averagePriority: number;
    difficultyDistribution: Record<string, number>;
    categoryDistribution: Record<string, number>;
  } {
    const totalSteps = steps.length;
    const totalHours = steps.reduce((sum, step) => sum + step.estimatedHours, 0);
    const averagePriority = steps.reduce((sum, step) => sum + step.priority, 0) / totalSteps;

    const difficultyDistribution: Record<string, number> = {};
    const categoryDistribution: Record<string, number> = {};

    for (const step of steps) {
      difficultyDistribution[step.difficulty] = (difficultyDistribution[step.difficulty] || 0) + 1;
      categoryDistribution[step.category] = (categoryDistribution[step.category] || 0) + 1;
    }

    return {
      totalSteps,
      totalHours,
      averagePriority: Math.round(averagePriority * 100) / 100,
      difficultyDistribution,
      categoryDistribution
    };
  }
}