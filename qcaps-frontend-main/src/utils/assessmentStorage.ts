import { AssessmentSubmissionResult } from '@/features/assessment/assessmentTypes';

const STORAGE_KEY = 'qcaps_latest_assessment_result';

export const saveAssessmentResult = (result: AssessmentSubmissionResult): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
  } catch (error) {
    console.error('Failed to persist assessment result to localStorage:', error);
  }
};

export const getLatestAssessmentResult = (): AssessmentSubmissionResult | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AssessmentSubmissionResult;
  } catch (error) {
    console.error('Failed to parse assessment result from localStorage:', error);
    return null;
  }
};

export const clearAssessmentResult = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear assessment result:', error);
  }
};
