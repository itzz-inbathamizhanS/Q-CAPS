import React from 'react';
import { LearningHeader } from '@/features/learning/components/LearningHeader';
import { LearningEmptyState } from '@/features/learning/components/LearningEmptyState';
import { RecommendedLearning } from '@/features/learning/components/RecommendedLearning';
import { LearningCatalog } from '@/features/learning/components/LearningCatalog';
import { getPersonalizedLearning } from '@/features/learning/learningRecommendation';
import { getLatestAssessmentResult } from '@/utils/assessmentStorage';
import { generateSkillGapProfile } from '@/features/skills/skillsTypes';

export const Learning: React.FC = () => {
  const latestResult = getLatestAssessmentResult();

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
  } = getPersonalizedLearning(profile);

  return (
    <div className="page-container fade-in">
      <LearningHeader hasAssessmentEvidence={hasAssessmentEvidence} />

      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
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
