import { AssessmentDomain } from '@/features/assessment/assessmentTypes';
import { PriorityLevel } from '@/features/skills/skillsTypes';

export type ModuleLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface LearningModule {
  id: string;
  domain: AssessmentDomain;
  title: string;
  subtitle: string;
  description: string;
  level: ModuleLevel;
  durationMinutes: number;
  lessonCount: number;
  objectives: string[];
  order: number;
  prerequisites: string[];
  tags: string[];
  progressPercentage: number;
  recommendationReason?: string;
  priorityLevel?: PriorityLevel;
  isRecommended?: boolean;
}
