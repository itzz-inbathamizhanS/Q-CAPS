import type { CheckpointBlockData, LessonBlock } from '@/features/lesson/lessonTypes';

export type ContentStatus = 'draft' | 'published';

/** Editor blocks carry the checkpoint answer; the learner API never does. */
export type AdminCheckpointBlock = CheckpointBlockData & {
  correct_index: number;
  explanation?: string | null;
};
export type AdminBlock = Exclude<LessonBlock, { type: 'checkpoint' }> | AdminCheckpointBlock;
export type BlockType = AdminBlock['type'];

export interface ChecklistItem {
  id: string;
  label: string;
  ok: boolean;
  detail: string | null;
}

export interface AdminSection {
  id: number;
  slug: string;
  module_id: number;
  title: string;
  summary: string | null;
  estimated_minutes: number | null;
  blocks: AdminBlock[];
  status: ContentStatus;
  sort_order: number;
  updated_at: string | null;
  checklist: ChecklistItem[];
}

export interface AdminModuleRow {
  id: number;
  slug: string;
  track_id: number;
  code: string;
  title: string;
  subtitle: string | null;
  level: string | null;
  estimated_minutes: number;
  xp: number;
  prerequisites: string[];
  unlocks: string | null;
  learning_objectives: string[];
  status: ContentStatus;
  sort_order: number;
  updated_at: string | null;
  section_count: number;
  draft_section_count: number;
}

export interface AdminModule extends Omit<AdminModuleRow, 'section_count' | 'draft_section_count'> {
  sections: AdminSection[];
}

export interface TrackMeta {
  entry_profile?: string | null;
  certificate_name?: string | null;
  certificate_code?: string | null;
  capstone_title?: string | null;
  capstone_description?: string | null;
}

export interface AdminTrack {
  id: number;
  slug: string;
  code: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  accent_color: string | null;
  meta: TrackMeta;
  status: ContentStatus;
  sort_order: number;
  updated_at: string | null;
  modules: AdminModuleRow[];
}

export interface AdminOverview {
  stats: { tracks: number; modules: number; sections: number; draft_sections: number };
  tracks: AdminTrack[];
}

export interface TrackInput {
  slug?: string;
  code: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  accent_color: string | null;
  meta: TrackMeta | null;
  status: ContentStatus;
}

export interface ModuleInput {
  track_id?: number;
  slug?: string;
  code: string;
  title: string;
  subtitle: string | null;
  level: string | null;
  estimated_minutes: number;
  xp: number;
  prerequisites: string[];
  learning_objectives: string[];
  status: ContentStatus;
}

export interface SectionUpdateBody {
  title?: string;
  summary?: string | null;
  estimated_minutes?: number | null;
  blocks?: AdminBlock[];
  status?: ContentStatus;
}

export interface AuditEntry {
  id: number;
  created_at: string | null;
  actor_id: number;
  actor_name: string;
  action: 'create' | 'update' | 'delete' | 'reorder';
  entity_type: 'track' | 'module' | 'section';
  entity_id: number | null;
  label: string | null;
  changed_fields: string[];
}
