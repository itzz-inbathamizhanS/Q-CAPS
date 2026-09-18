import React from 'react';
import { LearningHeader } from '@/features/learning/components/LearningHeader';
import { LearningEmptyState } from '@/features/learning/components/LearningEmptyState';
import { RecommendedLearning } from '@/features/learning/components/RecommendedLearning';
import { LearningCatalog } from '@/features/learning/components/LearningCatalog';
import { getPersonalizedLearning } from '@/features/learning/learningRecommendation';
import { getLatestAssessmentResult } from '@/utils/assessmentStorage';
import { generateSkillGapProfile } from '@/features/skills/skillsTypes';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';

export const Learning: React.FC = () => {
  const latestResult = getLatestAssessmentResult();

  // Connect to the canonical curriculum progress store
  const { completedModules } = useCurriculumStore();

  const profile = React.useMemo(() => {
    if (!latestResult) return null;
    return generateSkillGapProfile(
      latestResult.domainScores,
      latestResult.overallScore,
      latestResult.completedAt
    );
  }, [latestResult]);

  const {
    hasAssessmentEvidence,
    recommendedModules,
    allModules,
    topPriorityReason
  } = getPersonalizedLearning(profile, completedModules);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <LearningHeader hasAssessmentEvidence={hasAssessmentEvidence} />

      <div className="flex flex-col gap-16 md:gap-24">
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
