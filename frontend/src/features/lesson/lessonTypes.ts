// Shapes returned by the content read API (/api/content/*). Checkpoint blocks never
// carry answers here: grading happens on the backend.

export interface TextBlockData {
  type: 'text';
  id: string;
  markdown: string;
}

export interface VideoBlockData {
  type: 'video';
  id: string;
  url: string;
  title: string;
  duration_seconds?: number | null;
  captions_url?: string | null;
  transcript_url?: string | null;
}

export interface VisualBlockData {
  type: 'visual';
  id: string;
  kind: string;
  title?: string | null;
  description: string;
  simulation: boolean;
}

export interface CodeBlockData {
  type: 'code';
  id: string;
  language: string;
  code: string;
  caption?: string | null;
}

export interface CalloutBlockData {
  type: 'callout';
  id: string;
  variant: 'info' | 'tip' | 'warning' | 'danger';
  title?: string | null;
  text: string;
}

export interface CheckpointBlockData {
  type: 'checkpoint';
  id: string;
  question: string;
  options: string[];
}

export type LessonBlock =
  | TextBlockData
  | VideoBlockData
  | VisualBlockData
  | CodeBlockData
  | CalloutBlockData
  | CheckpointBlockData;

/** A book or standard the lesson was written from. */
export interface LessonSource {
  book_id: string;
  title: string;
  authors: string;
  edition?: string;
  year?: number;
  publisher?: string;
  locator: string;
  note?: string;
}

/** The source may be out of date for what the section says (for example a standard's status). */
export interface NeedsVerification {
  reason: string;
  checked_on?: string;
}

export interface LessonSection {
  id: number;
  slug: string;
  module_id: number;
  title: string;
  summary: string | null;
  estimated_minutes: number | null;
  blocks: LessonBlock[];
  sources?: LessonSource[];
  needs_verification?: NeedsVerification | null;
  sort_order: number;
}

export interface LessonModule {
  id: number;
  slug: string;
  code: string;
  title: string;
  subtitle: string | null;
  level: string | null;
  estimated_minutes: number;
  xp: number;
  prerequisites: string[];
  unlocks: string | null;
  learning_objectives: string[];
  track: { slug: string; code: string; title: string };
  sections: LessonSection[];
}

export interface ModuleSummary {
  slug: string;
  code: string;
  title: string;
  level: string | null;
  estimated_minutes: number;
  xp: number;
  section_count: number;
}

export interface TrackSummary {
  slug: string;
  code: string;
  title: string;
  subtitle: string | null;
  modules: ModuleSummary[];
}

export interface CheckpointResult {
  correct: boolean;
  explanation: string | null;
  section_completed: boolean;
}

export interface ModuleProgress {
  completed_section_ids: number[];
  total_sections: number;
}
