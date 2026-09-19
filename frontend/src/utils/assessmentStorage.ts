import { AssessmentSubmissionResult } from '@/features/assessment/assessmentTypes';
import { useAuthStore } from '@/features/auth/authStore';

const getStorageKey = () => {
  const userId = useAuthStore.getState().userId || 'guest';
  return `qcaps_latest_assessment_result_${userId}`;
};

export const saveAssessmentResult = (result: AssessmentSubmissionResult): void => {
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(result));
  } catch (error) {
    console.error('Failed to persist assessment result to localStorage:', error);
  }
};

export const getLatestAssessmentResult = (): AssessmentSubmissionResult | null => {
  try {
    const raw = localStorage.getItem(getStorageKey());
    if (!raw) return null;
    return JSON.parse(raw) as AssessmentSubmissionResult;
  } catch (error) {
    console.error('Failed to parse assessment result from localStorage:', error);
    return null;
  }
};

export const clearAssessmentResult = (): void => {
  try {
    localStorage.removeItem(getStorageKey());
  } catch (error) {
    console.error('Failed to clear assessment result:', error);
  }
};
