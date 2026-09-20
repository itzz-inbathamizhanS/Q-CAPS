import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { curriculumModules } from '@/data/curriculumData';
import { submitQuizScore, syncProgressData } from '@/services/backendService';

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
  /** Tracks which module IDs have already been awarded XP (prevents double-awards) */
  xpAwardedModules: string[];
  streakDays: number;
  lastActivityDate: string | null;

  // Actions
  completeQuiz: (moduleId: string, scorePercent: number, badgeName?: string, xpEarned?: number) => void;
  markModuleRead: (moduleId: string) => void;
  unlockBadge: (badgeName: string, xp?: number) => void;
  completeEscape: (escapeId: string, badgeName?: string, xp?: number) => void;
  completeMission: (missionId: string, badgeName?: string, xp?: number) => void;
  completeCapstone: (capstoneId: string, xp?: number) => void;
  isModuleCompleted: (moduleId: string) => boolean;
  getRecommendedNextModule: () => string;
  addXp: (amount: number) => void;
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
  xpAwardedModules: [],
  streakDays: 0,
  lastActivityDate: null,

  completeQuiz: (moduleId, scorePercent, badgeName, xpEarned) => {
    set((state) => {
      const mod = curriculumModules.find((m) => m.id === moduleId);
      const isPass = scorePercent >= 70;
      const alreadyCompleted = state.completedModules.includes(moduleId);
      const newCompleted = isPass && !alreadyCompleted
        ? [...state.completedModules, moduleId]
        : state.completedModules;

      const newBadges = isPass && badgeName && !state.unlockedBadges.includes(badgeName)
        ? [...state.unlockedBadges, badgeName]
        : state.unlockedBadges;

      // Award XP only once per module
      const alreadyAwardedXp = state.xpAwardedModules.includes(moduleId);
      const moduleXp = xpEarned ?? mod?.xp ?? 100;
      const xpToAward = (isPass && !alreadyAwardedXp) ? moduleXp : 0;
      const newXpAwardedModules = (isPass && !alreadyAwardedXp)
        ? [...state.xpAwardedModules, moduleId]
        : state.xpAwardedModules;

      // Use canonical recommendationTopic from module metadata instead of string matching
      if (isPass) {
        const topic = mod?.recommendationTopic ?? 'quantum_fundamentals';
        submitQuizScore({
          topic: topic,
          correct_answers: Math.round((scorePercent / 100) * 10),
          total_questions: 10
        }).catch(console.error);
      }

      const currentIdx = curriculumModules.findIndex((m) => m.id === moduleId);
      let nextMod = state.currentModuleId;
      if (isPass && currentIdx >= 0 && currentIdx < curriculumModules.length - 1) {
        nextMod = curriculumModules[currentIdx + 1].id;
      }

      const newQuizScores = {
        ...state.quizScores,
        [moduleId]: Math.max(state.quizScores[moduleId] || 0, scorePercent)
      };

      const streakData = updateStreak(state.streakDays, state.lastActivityDate);

      const newState = {
        ...state,
        completedModules: newCompleted,
        unlockedBadges: newBadges,
        currentModuleId: nextMod,
        quizScores: newQuizScores,
        totalXp: state.totalXp + xpToAward,
        xpAwardedModules: newXpAwardedModules,
        readinessScore: calcReadinessScore(newQuizScores),
        ...streakData
      };
      
      persistToBackend(newState);
      return newState;
    });
  },

  markModuleRead: (moduleId) => {
    set((state) => {
      if (state.completedModules.includes(moduleId)) return state;

      const mod = curriculumModules.find((m) => m.id === moduleId);

      // Award XP only once per module
      const alreadyAwardedXp = state.xpAwardedModules.includes(moduleId);
      const moduleXp = mod?.xp ?? 0;
      const xpToAward = !alreadyAwardedXp ? moduleXp : 0;
      const newXpAwardedModules = !alreadyAwardedXp
        ? [...state.xpAwardedModules, moduleId]
        : state.xpAwardedModules;

      // Advance currentModuleId if this was the current module
      const currentIdx = curriculumModules.findIndex((m) => m.id === moduleId);
      let nextMod = state.currentModuleId;
      if (moduleId === state.currentModuleId && currentIdx >= 0 && currentIdx < curriculumModules.length - 1) {
        nextMod = curriculumModules[currentIdx + 1].id;
      }

      const streakData = updateStreak(state.streakDays, state.lastActivityDate);

      const newState = {
        ...state,
        completedModules: [...state.completedModules, moduleId],
        totalXp: state.totalXp + xpToAward,
        xpAwardedModules: newXpAwardedModules,
        currentModuleId: nextMod,
        ...streakData
      };
      persistToBackend(newState);
      return newState;
    });
  },

  unlockBadge: (badgeName, xp = 0) => {
    set((state) => {
      if (state.unlockedBadges.includes(badgeName)) return state;
      const newState = {
        ...state,
        unlockedBadges: [...state.unlockedBadges, badgeName],
        totalXp: state.totalXp + (xp ?? 0),
      };
      persistToBackend(newState);
      return newState;
    });
  },

  completeEscape: (escapeId, badgeName, xp = 0) => {
    set((state) => {
      if (state.completedEscapes.includes(escapeId)) return state;
      const newBadges = badgeName && !state.unlockedBadges.includes(badgeName)
        ? [...state.unlockedBadges, badgeName]
        : state.unlockedBadges;
        
      const streakData = updateStreak(state.streakDays, state.lastActivityDate);
        
      const newState = {
        ...state,
        completedEscapes: [...state.completedEscapes, escapeId],
        unlockedBadges: newBadges,
        totalXp: state.totalXp + (xp ?? 0),
        ...streakData
      };
      persistToBackend(newState);
      return newState;
    });
  },

  completeMission: (missionId, badgeName, xp = 0) => {
    set((state) => {
      if (state.completedMissions.includes(missionId)) return state;
      const newBadges = badgeName && !state.unlockedBadges.includes(badgeName)
        ? [...state.unlockedBadges, badgeName]
        : state.unlockedBadges;
        
      const streakData = updateStreak(state.streakDays, state.lastActivityDate);
        
      const newState = {
        ...state,
        completedMissions: [...state.completedMissions, missionId],
        unlockedBadges: newBadges,
        totalXp: state.totalXp + (xp ?? 0),
        ...streakData
      };
      persistToBackend(newState);
      return newState;
    });
  },

  completeCapstone: (capstoneId, xp = 0) => {
    set((state) => {
      if (state.completedCapstones.includes(capstoneId)) return state;
      const streakData = updateStreak(state.streakDays, state.lastActivityDate);
      const newState = {
        ...state,
        completedCapstones: [...state.completedCapstones, capstoneId],
        totalXp: state.totalXp + (xp ?? 0),
        ...streakData
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

  addXp: (amount) => {
    set((state) => {
      if (!amount || amount <= 0) return state;
      const newState = {
        ...state,
        totalXp: state.totalXp + amount
      };
      persistToBackend(newState);
      return newState;
    });
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
      xpAwardedModules: [],
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
      xpAwardedModules: [],
    });
  },

  rehydrate: (progressDataStr?: string) => {
    if (!progressDataStr || progressDataStr === "{}") return;
    try {
      const parsed = JSON.parse(progressDataStr);
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
        xpAwardedModules: state.xpAwardedModules,
      }),
    }
  )
);
