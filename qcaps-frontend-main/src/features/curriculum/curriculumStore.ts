// src/features/curriculum/curriculumStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { curriculumModules } from '@/data/curriculumData';

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
}

const INITIAL_COMPLETED = [
  'track_a_a1_computing_foundations',
  'track_a_a2_mathematics_foundations'
];

const INITIAL_BADGES = [
  'Computing Foundations',
  'Mathematics Foundations',
  'HNDL Responder'
];

export const useCurriculumStore = create<CurriculumState>()(
  persist(
    (set, get) => ({
      completedModules: INITIAL_COMPLETED,
      currentModuleId: 'track_a_a3_networking_foundations',
      quizScores: {
        track_a_a1_computing_foundations: 100,
        track_a_a2_mathematics_foundations: 80
      },
      unlockedBadges: INITIAL_BADGES,
      totalXp: 14850,
      readinessScore: 78,
      completedEscapes: ['escape-1-hndl'],
      completedMissions: [],

      completeQuiz: (moduleId, scorePercent, badgeName, xpEarned = 100) => {
        set((state) => {
          const isPass = scorePercent >= 70;
          const alreadyCompleted = state.completedModules.includes(moduleId);
          const newCompleted = isPass && !alreadyCompleted
            ? [...state.completedModules, moduleId]
            : state.completedModules;

          const newBadges = isPass && badgeName && !state.unlockedBadges.includes(badgeName)
            ? [...state.unlockedBadges, badgeName]
            : state.unlockedBadges;

          // Find next module
          const currentIdx = curriculumModules.findIndex((m) => m.id === moduleId);
          const nextMod = currentIdx >= 0 && currentIdx < curriculumModules.length - 1
            ? curriculumModules[currentIdx + 1].id
            : state.currentModuleId;

          return {
            completedModules: newCompleted,
            quizScores: {
              ...state.quizScores,
              [moduleId]: Math.max(state.quizScores[moduleId] || 0, scorePercent)
            },
            unlockedBadges: newBadges,
            totalXp: isPass && !alreadyCompleted ? state.totalXp + xpEarned : state.totalXp,
            currentModuleId: nextMod
          };
        });
      },

      markModuleRead: (_moduleId) => {
        // Formative reading tracker if needed
      },

      unlockBadge: (badgeName, xp = 50) => {
        set((state) => {
          if (state.unlockedBadges.includes(badgeName)) return state;
          return {
            unlockedBadges: [...state.unlockedBadges, badgeName],
            totalXp: state.totalXp + xp
          };
        });
      },

      completeEscape: (escapeId, badgeName, xp = 50) => {
        set((state) => {
          const alreadyDone = state.completedEscapes.includes(escapeId);
          const newEscapes = alreadyDone ? state.completedEscapes : [...state.completedEscapes, escapeId];
          const newBadges = badgeName && !state.unlockedBadges.includes(badgeName)
            ? [...state.unlockedBadges, badgeName]
            : state.unlockedBadges;
          return {
            completedEscapes: newEscapes,
            unlockedBadges: newBadges,
            totalXp: alreadyDone ? state.totalXp : state.totalXp + xp
          };
        });
      },

      completeMission: (missionId, badgeName, xp = 150) => {
        set((state) => {
          const alreadyDone = state.completedMissions.includes(missionId);
          const newMissions = alreadyDone ? state.completedMissions : [...state.completedMissions, missionId];
          const newBadges = badgeName && !state.unlockedBadges.includes(badgeName)
            ? [...state.unlockedBadges, badgeName]
            : state.unlockedBadges;
          return {
            completedMissions: newMissions,
            unlockedBadges: newBadges,
            totalXp: alreadyDone ? state.totalXp : state.totalXp + xp
          };
        });
      },

      isModuleUnlocked: (moduleId) => {
        const state = get();
        if (state.completedModules.includes(moduleId)) return true;
        const mod = curriculumModules.find((m) => m.id === moduleId);
        if (!mod) return false;
        if (!mod.prerequisites || mod.prerequisites.length === 0) return true;
        // Check if all prerequisites are completed
        return mod.prerequisites.every((prereq) => state.completedModules.includes(prereq));
      },

      isModuleCompleted: (moduleId) => {
        return get().completedModules.includes(moduleId);
      },

      getRecommendedNextModule: () => {
        const state = get();
        const uncompleted = curriculumModules.find(
          (m) => !state.completedModules.includes(m.id)
        );
        return uncompleted ? uncompleted.id : curriculumModules[0].id;
      },

      resetProgress: () => {
        set({
          completedModules: INITIAL_COMPLETED,
          currentModuleId: 'track_a_a3_networking_foundations',
          quizScores: {
            track_a_a1_computing_foundations: 100,
            track_a_a2_mathematics_foundations: 80
          },
          unlockedBadges: INITIAL_BADGES,
          totalXp: 14850,
          readinessScore: 78,
          completedEscapes: ['escape-1-hndl'],
          completedMissions: []
        });
      }
    }),
    {
      name: 'qcaps_curriculum_state'
    }
  )
);
