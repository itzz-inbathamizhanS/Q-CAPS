import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { curriculumModules } from '@/data/curriculumData';
import { badgesData } from '@/data/badgesData';
import { syncProgressData } from '@/services/backendService';

/** What the server has verified; the store only mirrors it (XP, quiz passes, scores, badges, labs, missions). */
export interface ServerProgress {
  completed_labs: string[];
  completed_missions: string[];
  badges: string[];
  passed_modules: string[];
  quiz_scores: Record<string, number>;
  xp: number;
}

/** Module badges are earned by passing the module quiz; the pass itself is verified by the server. */
const moduleBadgeFor = (moduleId: string): string | undefined =>
  badgesData.find((b) => b.category === 'module' && b.unlockTrigger.includes(moduleId))?.name;

interface CurriculumState {
  completedModules: string[];
  currentModuleId: string;
  quizScores: Record<string, number>;
  unlockedBadges: string[];
  totalXp: number;
  readinessScore: number;
  completedEscapes: string[];
  completedMissions: string[];
  completedCapstones: string[];
  streakDays: number;
  lastActivityDate: string | null;

  // Actions
  /** Mirror the server's record of completed practice labs and missions (the server owns XP and badges for them). */
  applyActivityProgress: (p: ServerProgress) => void;
  /** Show an award the server has just granted. */
  recordActivityAward: (kind: 'lab' | 'mission', id: string, award: { xp: number; badge: string | null }) => void;
  isModuleUnlocked: (moduleId: string) => boolean;
  isModuleCompleted: (moduleId: string) => boolean;
  getRecommendedNextModule: () => string;
  resetProgress: () => void;
  clearLocalProgress: () => void;
  rehydrate: (progressDataStr?: string) => void;
}

const INITIAL_COMPLETED: string[] = [];

const INITIAL_BADGES: string[] = [];

// Helper to fire backend sync
const persistToBackend = (state: CurriculumState) => {
  const { completedModules, currentModuleId, quizScores, unlockedBadges, completedEscapes, completedMissions, totalXp, completedCapstones, streakDays, lastActivityDate } = state;
  syncProgressData({
    completedModules,
    currentModuleId,
    quizScores,
    unlockedBadges,
    completedEscapes,
    completedMissions,
    totalXp,
    completedCapstones,
    streakDays,
    lastActivityDate
  }).catch(console.error);
};

// Helper: recalculate readiness score from quiz scores
const calcReadinessScore = (quizScores: Record<string, number>): number => {
  const entries = Object.values(quizScores);
  if (entries.length === 0) return 0;
  const avg = entries.reduce((sum, s) => sum + s, 0) / entries.length;
  return Math.min(100, Math.round(avg));
};

// Helper: calculate new streak
const updateStreak = (currentStreak: number, lastDate: string | null): { streakDays: number, lastActivityDate: string } => {
  const today = new Date().toISOString().split('T')[0];
  if (!lastDate) return { streakDays: 1, lastActivityDate: today };
  
  const last = new Date(lastDate);
  const now = new Date(today);
  const diffTime = Math.abs(now.getTime() - last.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return { streakDays: currentStreak, lastActivityDate: today };
  if (diffDays === 1) return { streakDays: currentStreak + 1, lastActivityDate: today };
  return { streakDays: 1, lastActivityDate: today };
};

export const useCurriculumStore = create<CurriculumState>()(
  persist(
    (set, get) => ({
  completedModules: INITIAL_COMPLETED,
  currentModuleId: 'track_a_a1_computing_foundations',
  quizScores: {},
  unlockedBadges: INITIAL_BADGES,
  totalXp: 0,
  readinessScore: 0,
  completedEscapes: [],
  completedMissions: [],
  completedCapstones: [],
  streakDays: 0,
  lastActivityDate: null,

  applyActivityProgress: (p) => {
    set((state) => {
      const moduleBadges = p.passed_modules.map(moduleBadgeFor).filter((n): n is string => Boolean(n));
      return {
        ...state,
        completedModules: p.passed_modules,
        quizScores: p.quiz_scores,
        readinessScore: calcReadinessScore(p.quiz_scores),
        totalXp: p.xp,
        completedEscapes: p.completed_labs,
        completedMissions: p.completed_missions,
        unlockedBadges: Array.from(new Set([...p.badges, ...moduleBadges])),
      };
    });
  },

  recordActivityAward: (kind, id, award) => {
    set((state) => {
      const list = kind === 'lab' ? state.completedEscapes : state.completedMissions;
      if (list.includes(id)) return state;
      const streakData = updateStreak(state.streakDays, state.lastActivityDate);
      const newState = {
        ...state,
        completedEscapes: kind === 'lab' ? [...state.completedEscapes, id] : state.completedEscapes,
        completedMissions: kind === 'mission' ? [...state.completedMissions, id] : state.completedMissions,
        unlockedBadges: award.badge && !state.unlockedBadges.includes(award.badge) ? [...state.unlockedBadges, award.badge] : state.unlockedBadges,
        totalXp: state.totalXp + award.xp,
        ...streakData,
      };
      persistToBackend(newState);
      return newState;
    });
  },

  isModuleUnlocked: (moduleId: string) => {
    const { completedModules } = get();
    if (completedModules.includes(moduleId)) return true;
    const mod = curriculumModules.find((m) => m.id === moduleId);
    if (!mod || mod.prerequisites.length === 0) return true;
    return mod.prerequisites.every((prereqId) => completedModules.includes(prereqId));
  },

  isModuleCompleted: (moduleId: string) => {
    return get().completedModules.includes(moduleId);
  },

  getRecommendedNextModule: () => {
    const { completedModules } = get();
    for (const mod of curriculumModules) {
      if (!completedModules.includes(mod.id)) {
        if (mod.prerequisites.length === 0 || mod.prerequisites.every((p) => completedModules.includes(p))) {
          return mod.id;
        }
      }
    }
    return curriculumModules[0].id;
  },

  resetProgress: () => {
    set({
      completedModules: INITIAL_COMPLETED,
      currentModuleId: 'track_a_a1_computing_foundations',
      quizScores: {},
      unlockedBadges: INITIAL_BADGES,
      totalXp: 0,
      readinessScore: 0,
      completedEscapes: [],
      completedMissions: [],
      completedCapstones: [],
    });
    persistToBackend(get());
  },

  clearLocalProgress: () => {
    set({
      completedModules: INITIAL_COMPLETED,
      currentModuleId: 'track_a_a1_computing_foundations',
      quizScores: {},
      unlockedBadges: INITIAL_BADGES,
      totalXp: 0,
      readinessScore: 0,
      completedEscapes: [],
      completedMissions: [],
      completedCapstones: [],
    });
  },

  rehydrate: (progressDataStr?: string) => {
    if (!progressDataStr || progressDataStr === "{}") return;
    try {
      const parsed = JSON.parse(progressDataStr);
      // Completion, scores, XP and badges come from the server's verified record, never from this saved blob.
      for (const key of ['totalXp', 'completedModules', 'quizScores', 'unlockedBadges', 'completedEscapes', 'completedMissions', 'readinessScore', 'xpAwardedModules']) delete parsed[key];
      set((state) => ({
        ...state,
        ...parsed
      }));
    } catch (e) {
      console.warn("Failed to parse progress data from backend", e);
    }
  }
}),
    {
      name: 'qcaps-curriculum-progress',
      // Only persist data fields, not functions
      partialize: (state) => ({
        completedModules: state.completedModules,
        currentModuleId: state.currentModuleId,
        quizScores: state.quizScores,
        unlockedBadges: state.unlockedBadges,
        totalXp: state.totalXp,
        readinessScore: state.readinessScore,
        completedEscapes: state.completedEscapes,
        completedMissions: state.completedMissions,
        completedCapstones: state.completedCapstones,
      }),
    }
  )
);
