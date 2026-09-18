import { create } from 'zustand';
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

  // Actions
  completeQuiz: (moduleId: string, scorePercent: number, badgeName?: string, xpEarned?: number) => void;
  markModuleRead: (moduleId: string) => void;
  unlockBadge: (badgeName: string, xp?: number) => void;
  completeEscape: (escapeId: string, badgeName?: string, xp?: number) => void;
  completeMission: (missionId: string, badgeName?: string, xp?: number) => void;
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
  const { completedModules, currentModuleId, quizScores, unlockedBadges, completedEscapes, completedMissions } = state;
  syncProgressData({
    completedModules,
    currentModuleId,
    quizScores,
    unlockedBadges,
    completedEscapes,
    completedMissions
  }).catch(console.error);
};

export const useCurriculumStore = create<CurriculumState>()((set, get) => ({
  completedModules: INITIAL_COMPLETED,
  currentModuleId: 'track_a_a1_computing_foundations',
  quizScores: {},
  unlockedBadges: INITIAL_BADGES,
  totalXp: 0,
  readinessScore: 0,
  completedEscapes: [],
  completedMissions: [],

  completeQuiz: (moduleId, scorePercent, badgeName, _xpEarned = 100) => {
    set((state) => {
      const isPass = scorePercent >= 70;
      const alreadyCompleted = state.completedModules.includes(moduleId);
      const newCompleted = isPass && !alreadyCompleted
        ? [...state.completedModules, moduleId]
        : state.completedModules;

      const newBadges = isPass && badgeName && !state.unlockedBadges.includes(badgeName)
        ? [...state.unlockedBadges, badgeName]
        : state.unlockedBadges;

      // Wire up to the backend Analytics engine asynchronously
      if (isPass) {
        let topic = 'quantum_fundamentals';
        if (moduleId.includes('track_a_a5') || moduleId.includes('track_b_b7')) topic = 'classical_crypto';
        if (moduleId.includes('track_b') || moduleId.includes('track_c') || moduleId.includes('track_d')) topic = 'pqc';
        if (moduleId.includes('security') || moduleId.includes('network')) topic = 'practical_security';

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

      const newState = {
        ...state,
        completedModules: newCompleted,
        unlockedBadges: newBadges,
        currentModuleId: nextMod,
        quizScores: {
          ...state.quizScores,
          [moduleId]: Math.max(state.quizScores[moduleId] || 0, scorePercent)
        }
      };
      
      persistToBackend(newState);
      return newState;
    });
  },

  markModuleRead: (moduleId) => {
    set((state) => {
      if (state.completedModules.includes(moduleId)) return state;
      const newState = {
        ...state,
        completedModules: [...state.completedModules, moduleId]
      };
      persistToBackend(newState);
      return newState;
    });
  },

  unlockBadge: (badgeName, _xp = 0) => {
    set((state) => {
      if (state.unlockedBadges.includes(badgeName)) return state;
      const newState = {
        ...state,
        unlockedBadges: [...state.unlockedBadges, badgeName]
      };
      persistToBackend(newState);
      return newState;
    });
  },

  completeEscape: (escapeId, badgeName, _xp = 0) => {
    set((state) => {
      if (state.completedEscapes.includes(escapeId)) return state;
      const newBadges = badgeName && !state.unlockedBadges.includes(badgeName)
        ? [...state.unlockedBadges, badgeName]
        : state.unlockedBadges;
        
      const newState = {
        ...state,
        completedEscapes: [...state.completedEscapes, escapeId],
        unlockedBadges: newBadges
      };
      persistToBackend(newState);
      return newState;
    });
  },

  completeMission: (missionId, badgeName, _xp = 0) => {
    set((state) => {
      if (state.completedMissions.includes(missionId)) return state;
      const newBadges = badgeName && !state.unlockedBadges.includes(badgeName)
        ? [...state.unlockedBadges, badgeName]
        : state.unlockedBadges;
        
      const newState = {
        ...state,
        completedMissions: [...state.completedMissions, missionId],
        unlockedBadges: newBadges
      };
      persistToBackend(newState);
      return newState;
    });
  },

  isModuleUnlocked: (moduleId) => {
    const { completedModules } = get();
    if (completedModules.includes(moduleId)) return true;
    const mod = curriculumModules.find((m) => m.id === moduleId);
    if (!mod || mod.prerequisites.length === 0) return true;
    return mod.prerequisites.every((prereqId) => completedModules.includes(prereqId));
  },

  isModuleCompleted: (moduleId) => {
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
    const newState = {
      ...get(),
      completedModules: INITIAL_COMPLETED,
      currentModuleId: 'track_a_a1_computing_foundations',
      quizScores: {},
      unlockedBadges: INITIAL_BADGES,
      completedEscapes: [],
      completedMissions: [],
    };
    persistToBackend(newState);
    set(newState);
  },

  clearLocalProgress: () => {
    set({
      completedModules: INITIAL_COMPLETED,
      currentModuleId: 'track_a_a1_computing_foundations',
      quizScores: {},
      unlockedBadges: INITIAL_BADGES,
      completedEscapes: [],
      completedMissions: [],
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
}));
