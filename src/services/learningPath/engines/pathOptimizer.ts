/**
 * Path Optimization Engine
 * 
 * Optimizes learning sequences based on dependencies, user preferences,
 * and learning efficiency algorithms.
 */

import { logger } from '../../../utils/logger';
import { TransferableSkill } from '../../skillMatching';
import { 
  LearningStep, 
  SkillDependency, 
  PathOptimizationResult,
  SequenceOptimizationOptions,
  DIFFICULTY_LEVELS
} from '../core/types';

export class PathOptimizer {
  
  /**
   * Optimizes learning sequence based on dependencies and preferences
   */
  async optimizeSequence(
    steps: LearningStep[],
    dependencies: Map<string, SkillDependency>,
    transferableSkills: TransferableSkill[],
    options: SequenceOptimizationOptions
  ): Promise<PathOptimizationResult> {
    try {
      logger.info('Starting path optimization', { 
        stepCount: steps.length,
        options 
      });

      let optimizedSteps = [...steps];

      // Step 1: Perform topological sort to respect dependencies
      optimizedSteps = this.topologicalSort(optimizedSteps, dependencies);

      // Step 2: Apply user preferences
      if (options.prioritizeQuickWins) {
        optimizedSteps = this.prioritizeQuickWins(optimizedSteps);
      }

      if (options.difficultyPreference !== 'balanced') {
        optimizedSteps = this.sortByDifficulty(
          optimizedSteps, 
          options.difficultyPreference === 'easy-first' ? 'ascending' : 'descending'
        );
      }

      // Step 3: Incorporate transferable skills
      if (options.includeTransferableSkills) {
        optimizedSteps = this.incorporateTransferableSkills(optimizedSteps, transferableSkills);
      }

      // Step 4: Limit path length if specified
      if (options.maxPathLength && optimizedSteps.length > options.maxPathLength) {
        optimizedSteps = this.limitPathLength(optimizedSteps, options.maxPathLength);
      }

      // Step 5: Identify parallel learning tracks
      const parallelTracks = this.identifyParallelTracks(optimizedSteps, dependencies);

      // Step 6: Calculate critical path
      const criticalPath = this.calculateCriticalPath(optimizedSteps, dependencies);

      // Step 7: Calculate metadata
      const metadata = this.calculateOptimizationMetadata(optimizedSteps, dependencies);

      const result: PathOptimizationResult = {
        optimizedSteps,
        parallelTracks,
        criticalPath,
        metadata
      };

      logger.info('Path optimization completed', {
        originalSteps: steps.length,
        optimizedSteps: optimizedSteps.length,
        parallelTracks: parallelTracks.length,
        criticalPathLength: criticalPath.length
      });

      return result;

    } catch (error) {
      logger.error('Path optimization failed', error);
      throw new Error(`Path optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Performs topological sort to respect skill dependencies
   */
  private topologicalSort(
    steps: LearningStep[],
    dependencies: Map<string, SkillDependency>
  ): LearningStep[] {
    const stepMap = new Map(steps.map(step => [step.skillName, step]));
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: LearningStep[] = [];

    const visit = (skillName: string): void => {
      if (visiting.has(skillName)) {
        logger.warn(`Circular dependency detected involving ${skillName}`);
        return;
      }

      if (visited.has(skillName)) {
        return;
      }

      const step = stepMap.get(skillName);
      if (!step) {
        return;
      }

      visiting.add(skillName);

      // Visit all prerequisites first
      const dependency = dependencies.get(skillName);
      if (dependency) {
        for (const prerequisite of dependency.prerequisites) {
          if (stepMap.has(prerequisite)) {
            visit(prerequisite);
          }
        }
      }

      visiting.delete(skillName);
      visited.add(skillName);
      result.push(step);
    };

    // Visit all steps
    for (const step of steps) {
      if (!visited.has(step.skillName)) {
        visit(step.skillName);
      }
    }

    return result;
  }

  /**
   * Prioritizes quick wins (easy skills with high impact)
   */
  private prioritizeQuickWins(steps: LearningStep[]): LearningStep[] {
    return steps.sort((a, b) => {
      // Calculate quick win score (high priority + low time investment)
      const scoreA = (a.priority / a.estimatedHours) * 100;
      const scoreB = (b.priority / b.estimatedHours) * 100;
      
      return scoreB - scoreA; // Higher score first
    });
  }

  /**
   * Sorts steps by difficulty
   */
  private sortByDifficulty(
    steps: LearningStep[], 
    order: 'ascending' | 'descending'
  ): LearningStep[] {
    const difficultyOrder = DIFFICULTY_LEVELS;
    
    return steps.sort((a, b) => {
      const diffA = difficultyOrder[a.difficulty];
      const diffB = difficultyOrder[b.difficulty];
      
      return order === 'ascending' ? diffA - diffB : diffB - diffA;
    });
  }

  /**
   * Incorporates transferable skills into the learning path
   */
  private incorporateTransferableSkills(
    steps: LearningStep[],
    transferableSkills: TransferableSkill[]
  ): LearningStep[] {
    const transferableMap = new Map(
      transferableSkills.map(ts => [ts.targetSkill, ts])
    );

    return steps.map(step => {
      const transferable = transferableMap.get(step.skillName);
      if (transferable && transferable.transferabilityScore > 0.7) {
        // Reduce estimated hours based on transferability
        const reduction = transferable.transferabilityScore * 0.3; // Up to 30% reduction
        const adjustedHours = Math.round(step.estimatedHours * (1 - reduction));
        
        return {
          ...step,
          estimatedHours: Math.max(5, adjustedHours), // Minimum 5 hours
          reasoning: `${step.reasoning} Leverages transferable skills from ${transferable.sourceSkill}.`
        };
      }
      return step;
    });
  }

  /**
   * Limits path length to specified maximum
   */
  private limitPathLength(steps: LearningStep[], maxLength: number): LearningStep[] {
    // Sort by priority and take top N
    return steps
      .sort((a, b) => b.priority - a.priority)
      .slice(0, maxLength);
  }

  /**
   * Identifies skills that can be learned in parallel
   */
  private identifyParallelTracks(
    steps: LearningStep[],
    dependencies: Map<string, SkillDependency>
  ): LearningStep[][] {
    const tracks: LearningStep[][] = [];
    const processed = new Set<string>();

    for (let i = 0; i < steps.length; i++) {
      if (processed.has(steps[i].skillName)) {
        continue;
      }

      const currentTrack: LearningStep[] = [steps[i]];
      processed.add(steps[i].skillName);

      // Find skills that can be learned in parallel with this one
      for (let j = i + 1; j < steps.length; j++) {
        if (processed.has(steps[j].skillName)) {
          continue;
        }

        const canLearnInParallel = currentTrack.every(trackStep =>
          this.canLearnInParallel(trackStep, steps[j], dependencies)
        );

        if (canLearnInParallel) {
          currentTrack.push(steps[j]);
          processed.add(steps[j].skillName);
        }
      }

      if (currentTrack.length > 1) {
        tracks.push(currentTrack);
      }
    }

    return tracks;
  }

  /**
   * Checks if two skills can be learned in parallel
   */
  private canLearnInParallel(
    step1: LearningStep,
    step2: LearningStep,
    dependencies: Map<string, SkillDependency>
  ): boolean {
    const dep1 = dependencies.get(step1.skillName);
    const dep2 = dependencies.get(step2.skillName);

    // Can't learn in parallel if one depends on the other
    if (dep1?.prerequisites.includes(step2.skillName) || 
        dep2?.prerequisites.includes(step1.skillName)) {
      return false;
    }

    // Can't learn in parallel if one is a dependent of the other
    if (dep1?.dependents.includes(step2.skillName) || 
        dep2?.dependents.includes(step1.skillName)) {
      return false;
    }

    // Check if they're in related categories (might compete for attention)
    if (step1.category === step2.category) {
      // Same category skills might be harder to learn in parallel
      // Allow it only if both are relatively easy
      return step1.difficulty === 'easy' && step2.difficulty === 'easy';
    }

    return true;
  }

  /**
   * Calculates the critical path through the learning sequence
   */
  private calculateCriticalPath(
    steps: LearningStep[],
    dependencies: Map<string, SkillDependency>
  ): string[] {
    // Build dependency graph
    const graph = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    const stepMap = new Map(steps.map(step => [step.skillName, step]));

    // Initialize graph
    for (const step of steps) {
      graph.set(step.skillName, []);
      inDegree.set(step.skillName, 0);
    }

    // Build edges and calculate in-degrees
    for (const step of steps) {
      const dependency = dependencies.get(step.skillName);
      if (dependency) {
        for (const prerequisite of dependency.prerequisites) {
          if (stepMap.has(prerequisite)) {
            graph.get(prerequisite)?.push(step.skillName);
            inDegree.set(step.skillName, (inDegree.get(step.skillName) || 0) + 1);
          }
        }
      }
    }

    // Find critical path using longest path algorithm
    const distances = new Map<string, number>();
    const queue: string[] = [];

    // Initialize distances and find starting nodes
    for (const [skill, degree] of inDegree.entries()) {
      const step = stepMap.get(skill);
      distances.set(skill, step ? step.estimatedHours : 0);
      
      if (degree === 0) {
        queue.push(skill);
      }
    }

    // Process nodes in topological order
    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentDistance = distances.get(current) || 0;

      for (const neighbor of graph.get(current) || []) {
        const neighborStep = stepMap.get(neighbor);
        const neighborHours = neighborStep ? neighborStep.estimatedHours : 0;
        const newDistance = currentDistance + neighborHours;

        if (newDistance > (distances.get(neighbor) || 0)) {
          distances.set(neighbor, newDistance);
        }

        inDegree.set(neighbor, (inDegree.get(neighbor) || 0) - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
        }
      }
    }

    // Find the path with maximum distance (critical path)
    const sortedByDistance = Array.from(distances.entries())
      .sort((a, b) => b[1] - a[1]);

    // Reconstruct critical path
    const criticalPath: string[] = [];
    let current = sortedByDistance[0]?.[0];

    while (current) {
      criticalPath.unshift(current);
      
      // Find the prerequisite with the longest path
      const dependency = dependencies.get(current);
      let maxPrereq: string | null = null;
      let maxDistance = -1;

      if (dependency) {
        for (const prerequisite of dependency.prerequisites) {
          if (stepMap.has(prerequisite)) {
            const prereqDistance = distances.get(prerequisite) || 0;
            if (prereqDistance > maxDistance) {
              maxDistance = prereqDistance;
              maxPrereq = prerequisite;
            }
          }
        }
      }

      current = maxPrereq;
    }

    return criticalPath;
  }

  /**
   * Calculates optimization metadata
   */
  private calculateOptimizationMetadata(
    steps: LearningStep[],
    dependencies: Map<string, SkillDependency>
  ): { totalSkills: number; prerequisitesMet: number; confidenceScore: number } {
    const totalSkills = steps.length;
    
    // Count prerequisites that are met within the path
    let prerequisitesMet = 0;
    const skillNames = new Set(steps.map(step => step.skillName));
    
    for (const step of steps) {
      const dependency = dependencies.get(step.skillName);
      if (dependency) {
        for (const prerequisite of dependency.prerequisites) {
          if (skillNames.has(prerequisite)) {
            prerequisitesMet++;
          }
        }
      }
    }

    // Calculate overall confidence score
    const confidenceScores = steps.map(step => {
      const dependency = dependencies.get(step.skillName);
      return dependency ? dependency.confidence : 0.5;
    });

    const confidenceScore = confidenceScores.length > 0 
      ? confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length
      : 0.5;

    return {
      totalSkills,
      prerequisitesMet,
      confidenceScore: Math.round(confidenceScore * 100) / 100
    };
  }

  /**
   * Validates optimization result
   */
  validateOptimization(result: PathOptimizationResult): boolean {
    try {
      // Check if all steps are present
      if (!result.optimizedSteps || result.optimizedSteps.length === 0) {
        return false;
      }

      // Check if critical path is valid
      if (!result.criticalPath || result.criticalPath.length === 0) {
        return false;
      }

      // Check if metadata is present
      if (!result.metadata || typeof result.metadata.confidenceScore !== 'number') {
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Optimization validation failed', error);
      return false;
    }
  }
}