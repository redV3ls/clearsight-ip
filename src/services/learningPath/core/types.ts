/**
 * Learning Path Core Types
 * 
 * Shared type definitions for the learning path generation system.
 * Provides consistent interfaces across all learning path modules.
 */

import { SkillGap } from '../../gapAnalysis';
import { UserSkill, TransferableSkill } from '../../skillMatching';

export interface SkillDependency {
  skillName: string;
  category: string;
  prerequisites: string[]; // Skills that must be learned first
  dependents: string[]; // Skills that depend on this one
  difficulty: 'easy' | 'moderate' | 'hard' | 'very-hard';
  estimatedHours: number; // Time to learn this skill
  confidence: number; // Confidence in dependency mapping
}

export interface LearningStep {
  skillName: string;
  category: string;
  currentLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  targetLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  priority: number; // 1-10 scale
  estimatedHours: number;
  prerequisites: string[]; // Skills that must be completed first
  learningObjectives: string[];
  milestones: string[];
  difficulty: 'easy' | 'moderate' | 'hard' | 'very-hard';
  reasoning: string; // Why this step is important
}

export interface LearningPath {
  pathId: string;
  title: string;
  description: string;
  totalEstimatedHours: number;
  estimatedCompletionWeeks: number;
  difficulty: 'easy' | 'moderate' | 'hard' | 'very-hard';
  steps: LearningStep[];
  parallelTracks: LearningStep[][]; // Steps that can be done in parallel
  criticalPath: string[]; // Skill names in critical path order
  metadata: {
    totalSkills: number;
    prerequisitesMet: number;
    confidenceScore: number;
    lastUpdated: string;
  };
}

export interface LearningPathOptions {
  timeCommitmentHours?: number; // Hours per week available
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  prioritizeQuickWins?: boolean;
  includeTransferableSkills?: boolean;
  maxPathLength?: number; // Maximum number of steps
  difficultyPreference?: 'easy-first' | 'hard-first' | 'balanced';
}

export interface PathGenerationContext {
  skillGaps: SkillGap[];
  userSkills: UserSkill[];
  transferableSkills: TransferableSkill[];
  options: LearningPathOptions;
  dependencies: Map<string, SkillDependency>;
}

export interface PathOptimizationResult {
  optimizedSteps: LearningStep[];
  parallelTracks: LearningStep[][];
  criticalPath: string[];
  metadata: {
    totalSkills: number;
    prerequisitesMet: number;
    confidenceScore: number;
  };
}

export interface DependencyAnalysisResult {
  dependencies: Map<string, SkillDependency>;
  prerequisitesMet: number;
  missingPrerequisites: string[];
}

export interface SequenceOptimizationOptions {
  prioritizeQuickWins: boolean;
  difficultyPreference: 'easy-first' | 'hard-first' | 'balanced';
  maxPathLength?: number;
  includeTransferableSkills: boolean;
}

// Skill category mappings
export const SKILL_CATEGORIES = {
  PROGRAMMING: 'Programming',
  FRAMEWORKS: 'Frameworks & Libraries',
  DATABASES: 'Databases',
  CLOUD: 'Cloud Platforms',
  DEVOPS: 'DevOps & Infrastructure',
  DESIGN: 'Design & UX',
  PROJECT_MANAGEMENT: 'Project Management',
  SOFT_SKILLS: 'Soft Skills',
  DATA_SCIENCE: 'Data Science & Analytics',
  SECURITY: 'Security',
  MOBILE: 'Mobile Development',
  TESTING: 'Testing & QA'
} as const;

// Difficulty levels with numeric values for calculations
export const DIFFICULTY_LEVELS = {
  easy: 1,
  moderate: 2,
  hard: 3,
  'very-hard': 4
} as const;

// Base learning hours by difficulty
export const BASE_LEARNING_HOURS = {
  easy: 20,
  moderate: 40,
  hard: 80,
  'very-hard': 120
} as const;

// Category learning multipliers
export const CATEGORY_MULTIPLIERS = {
  [SKILL_CATEGORIES.PROGRAMMING]: 1.2,
  [SKILL_CATEGORIES.FRAMEWORKS]: 1.0,
  [SKILL_CATEGORIES.DATABASES]: 0.8,
  [SKILL_CATEGORIES.CLOUD]: 1.1,
  [SKILL_CATEGORIES.DEVOPS]: 1.3,
  [SKILL_CATEGORIES.DESIGN]: 0.9,
  [SKILL_CATEGORIES.PROJECT_MANAGEMENT]: 0.7,
  [SKILL_CATEGORIES.SOFT_SKILLS]: 0.6,
  [SKILL_CATEGORIES.DATA_SCIENCE]: 1.4,
  [SKILL_CATEGORIES.SECURITY]: 1.2,
  [SKILL_CATEGORIES.MOBILE]: 1.1,
  [SKILL_CATEGORIES.TESTING]: 0.8
} as const;

// Common skill prerequisites mapping
export const SKILL_PREREQUISITES = {
  // Frontend frameworks
  'React': ['JavaScript', 'HTML', 'CSS'],
  'Angular': ['JavaScript', 'TypeScript', 'HTML', 'CSS'],
  'Vue.js': ['JavaScript', 'HTML', 'CSS'],
  'Next.js': ['React', 'JavaScript'],
  'Nuxt.js': ['Vue.js', 'JavaScript'],
  
  // Backend frameworks
  'Django': ['Python'],
  'Flask': ['Python'],
  'Spring Boot': ['Java'],
  'Express.js': ['Node.js', 'JavaScript'],
  'Ruby on Rails': ['Ruby'],
  'ASP.NET': ['C#'],
  
  // Advanced concepts
  'Machine Learning': ['Python', 'Statistics', 'Linear Algebra'],
  'Deep Learning': ['Machine Learning', 'Python', 'TensorFlow'],
  'Data Science': ['Python', 'Statistics', 'SQL'],
  'DevOps': ['Linux', 'Networking', 'Cloud Platforms'],
  'Kubernetes': ['Docker', 'Linux', 'Networking'],
  'Docker': ['Linux', 'Networking'],
  
  // Databases
  'MongoDB': ['NoSQL Concepts'],
  'PostgreSQL': ['SQL'],
  'MySQL': ['SQL'],
  'Redis': ['Database Concepts'],
  
  // Cloud platforms
  'AWS Lambda': ['AWS', 'Cloud Computing'],
  'Azure Functions': ['Azure', 'Cloud Computing'],
  'Google Cloud Functions': ['Google Cloud', 'Cloud Computing']
} as const;

// Category dependencies
export const CATEGORY_DEPENDENCIES = {
  [SKILL_CATEGORIES.FRAMEWORKS]: [SKILL_CATEGORIES.PROGRAMMING],
  [SKILL_CATEGORIES.DEVOPS]: [SKILL_CATEGORIES.PROGRAMMING],
  [SKILL_CATEGORIES.DATA_SCIENCE]: [SKILL_CATEGORIES.PROGRAMMING],
  [SKILL_CATEGORIES.MOBILE]: [SKILL_CATEGORIES.PROGRAMMING],
  [SKILL_CATEGORIES.TESTING]: [SKILL_CATEGORIES.PROGRAMMING]
} as const;