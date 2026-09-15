// src/features/curriculum/curriculumTypes.ts
// Q-CAPS Content Security Curriculum Types (Tracks A -> B -> C -> D)

export type TrackId = 'track-a' | 'track-b' | 'track-c' | 'track-d';

export type ModuleDifficulty = 'Novice' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Enterprise';

export type ModuleStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export interface CurriculumSection {
  id: string;
  title: string;
  content: string;
  codeSnippet?: string;
  interactiveCallout?: string;
}

export interface CurriculumModule {
  id: string; // e.g. track_a_a1_computing_foundations
  trackId: TrackId;
  code: string; // e.g. A1, B3, C6, E2
  title: string;
  level: ModuleDifficulty;
  estimatedMinutes: number;
  xp: number;
  prerequisites: string[];
  unlocks: string;
  learningObjectives: string[];
  sections: CurriculumSection[];
  wrapUp?: {
    summary?: string;
    deliverables?: string[];
    unlocksNext?: string;
  };
}

export interface CurriculumTrack {
  id: TrackId;
  code: string;
  title: string;
  subtitle: string;
  description: string;
  entryProfile: string;
  certificateName: string;
  certificateCode: string;
  capstoneTitle: string;
  capstoneDescription: string;
  accentColor: string;
  moduleIds: string[];
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ModuleQuiz {
  moduleId: string;
  title: string;
  difficulty: string;
  passingScorePercent: number;
  questions: QuizQuestion[];
}

export interface BadgeItem {
  id: string;
  name: string;
  trackId: TrackId | 'capstone' | 'lab';
  category: 'module' | 'capstone' | 'lab' | 'special';
  unlockTrigger: string;
  iconName: string;
  xpAward: number;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface CertificateItem {
  id: string;
  code: string;
  title: string;
  trackId: TrackId | 'all';
  description: string;
  requirement: string;
  isUnlocked: boolean;
  issueDate?: string;
  credentialId?: string;
}
