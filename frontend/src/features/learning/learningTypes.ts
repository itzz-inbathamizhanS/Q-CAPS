import { PriorityLevel } from '@/features/skills/skillsTypes';
import { CurriculumModule } from '@/features/curriculum/curriculumTypes';

export type ModuleLevel = 'Beginner' | 'Intermediate' | 'Advanced';

// LearningModule is just a CurriculumModule that has been enriched by the recommendation engine
export interface LearningModule extends CurriculumModule {
  progressPercentage: number;
  recommendationReason?: string;
  priorityLevel?: PriorityLevel;
  isRecommended?: boolean;
}
