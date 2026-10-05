import React from 'react';
import { LearningHeader } from '@/features/learning/components/LearningHeader';
import { LearningEmptyState } from '@/features/learning/components/LearningEmptyState';
import { RecommendedLearning } from '@/features/learning/components/RecommendedLearning';
import { LearningCatalog } from '@/features/learning/components/LearningCatalog';
import { getPersonalizedLearning } from '@/features/learning/learningRecommendation';
import { toSubmissionResult, useDiagnosticResults } from '@/features/assessment/diagnostic';
import { generateSkillGapProfile } from '@/features/skills/skillsTypes';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';

export const Learning: React.FC = () => {
  const diagnostic = useDiagnosticResults();
  const latest = diagnostic.status === 'ready' ? diagnostic.results[0] : undefined;

  // Connect to the canonical curriculum progress store
  const { completedModules } = useCurriculumStore();

  const profile = React.useMemo(() => {
    if (!latest) return null;
    const result = toSubmissionResult(latest);
    return generateSkillGapProfile(result.domainScores, result.overallScore, result.completedAt);
  }, [latest]);

  const {
    hasAssessmentEvidence,
    recommendedModules,
    allModules,
    topPriorityReason,
  } = getPersonalizedLearning(profile, completedModules);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', paddingBottom: '80px' }}>
      <LearningHeader hasAssessmentEvidence={hasAssessmentEvidence} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {!hasAssessmentEvidence && <LearningEmptyState />}

        {hasAssessmentEvidence && (
          <RecommendedLearning
            recommendedModules={recommendedModules}
            topPriorityReason={topPriorityReason}
          />
        )}

        <LearningCatalog allModules={allModules} />
      </div>
    </div>
  );
};

export default Learning;
