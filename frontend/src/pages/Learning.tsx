import React, { useEffect, useMemo, useState } from 'react';
import { LearningHeader } from '@/features/learning/components/LearningHeader';
import { LearningEmptyState } from '@/features/learning/components/LearningEmptyState';
import { RecommendedLearning } from '@/features/learning/components/RecommendedLearning';
import { LearningCatalog } from '@/features/learning/components/LearningCatalog';
import type { LearningModule } from '@/features/learning/learningTypes';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';
import { curriculumModules } from '@/data/curriculumData';
import { getMyRecommendation, type UserRecommendation } from '@/services/backendService';
import { Card } from '@/components/ui/Card';

type State = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; rec: UserRecommendation };

const ACTION_TEXT: Record<string, string> = {
  assess: 'Take this module quiz to establish your level',
  learn: 'Study this module',
  practice: 'Practise: complete the linked practical',
};

/** Server recommendations (the single engine in backend/main_api/recommendation.py) as learning-module cards. */
function recommendedModules(rec: UserRecommendation, completed: string[]): LearningModule[] {
  const byId = new Map(curriculumModules.map((m) => [m.id, m]));
  const items = rec.recommendations && rec.recommendations.length > 0
    ? rec.recommendations.filter((r) => r.module_id).map((r) => ({ id: r.module_id as string, reason: ACTION_TEXT[r.action] ?? '', reasons: r.reasons }))
    : rec.course_id
      ? [{ id: rec.course_id, reason: rec.reason, reasons: rec.reasons ?? [] }]
      : [];
  const out: LearningModule[] = [];
  for (const item of items) {
    const mod = byId.get(item.id);
    if (!mod) continue;
    out.push({
      ...mod,
      progressPercentage: completed.includes(mod.id) ? 100 : 0,
      recommendationReason: item.reason,
      reasons: item.reasons,
      isRecommended: true,
    });
  }
  return out;
}

export const Learning: React.FC = () => {
  const { completedModules } = useCurriculumStore();
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let live = true;
    getMyRecommendation()
      .then((rec) => live && setState({ status: 'ready', rec }))
      .catch((e: unknown) => live && setState({ status: 'error', message: e instanceof Error ? e.message : 'Request failed' }));
    return () => {
      live = false;
    };
  }, []);

  const allModules: LearningModule[] = useMemo(
    () => curriculumModules.map((m) => ({ ...m, progressPercentage: completedModules.includes(m.id) ? 100 : 0 })),
    [completedModules],
  );
  const recommended = state.status === 'ready' ? recommendedModules(state.rec, completedModules) : [];
  const hasEvidence = state.status === 'ready' && state.rec.status !== 'no_evidence';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', paddingBottom: '80px' }}>
      <LearningHeader hasAssessmentEvidence={hasEvidence} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {state.status === 'loading' && <p role="status">Loading your recommendations…</p>}
        {state.status === 'error' && (
          <Card variant="glass" padding="normal">
            <p role="alert" style={{ margin: 0 }}>
              Your recommendations could not be loaded ({state.message}). The catalogue below is still available.
            </p>
          </Card>
        )}
        {state.status === 'ready' && !hasEvidence && <LearningEmptyState />}
        {state.status === 'ready' && hasEvidence && (
          <RecommendedLearning recommendedModules={recommended} topPriorityReason={state.rec.reason} topReasons={state.rec.reasons} />
        )}

        <LearningCatalog allModules={allModules} />
      </div>
    </div>
  );
};

export default Learning;
