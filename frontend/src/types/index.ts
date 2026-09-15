// Core Q-CAPS Types

export type CompetencyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface AssessmentQuestion {
  id: string;
  category: string;
  question: string;
  codeSnippet?: string;
  options: {
    id: string;
    text: string;
  }[];
  correctOptionId: string;
  explanation: string;
}

export interface SkillMetric {
  category: string;
  currentScore: number;
  targetScore: number;
  gap: number;
  status: 'Critical Gap' | 'Moderate Gap' | 'Aligned';
  description: string;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  level: CompetencyLevel;
  estimatedHours: number;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  topics: string[];
}

export interface PracticalChallenge {
  id: string;
  title: string;
  category: string;
  difficulty: CompetencyLevel;
  taskPrompt: string;
  targetConfigSnippet?: string;
  options: {
    id: string;
    label: string;
    isCorrect: boolean;
    feedback: string;
  }[];
}

export interface ReassessmentResult {
  category: string;
  beforeScore: number;
  afterScore: number;
  delta: number;
  status: string;
}

export interface OrgWorkforceMetrics {
  totalAssessedPersonnel: number;
  totalRequiredPqcSkills: number;
  coveredSkills: number;
  criticalGaps: number;
  overallReadinessScore: number;
}
