import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLatestAssessmentResult } from '@/utils/assessmentStorage';
import { generateSkillGapProfile } from '@/features/skills/skillsTypes';
import { SkillsEmptyState } from '@/features/skills/components/SkillsEmptyState';
import { CapabilitySummary } from '@/features/skills/components/CapabilitySummary';
import { PriorityGap } from '@/features/skills/components/PriorityGap';
import { SkillBreakdown } from '@/features/skills/components/SkillBreakdown';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RotateCcw, Calendar, CheckCircle } from 'lucide-react';

export const Skills: React.FC = () => {
  const navigate = useNavigate();
  const latestResult = getLatestAssessmentResult();

  const profile = useMemo(() => {
    if (!latestResult) return null;
    return generateSkillGapProfile(
      latestResult.domainScores,
      latestResult.overallScore,
      latestResult.completedAt
    );
  }, [latestResult]);

  if (!profile) {
    return (
      <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
        <section className="dashboard-header">
          <h1 className="dashboard-title">Your Skill Profile</h1>
          <p className="dashboard-subtitle">
            Understand your current cybersecurity and PQC capability based on diagnostic assessment evidence.
          </p>
        </section>

        <SkillsEmptyState />
      </div>
    );
  }

  const formattedDate = new Date(profile.evaluatedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      {/* Page Header */}
      <section className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 className="dashboard-title">Your Skill Profile</h1>
            <p className="dashboard-subtitle">
              Understand your current cybersecurity and PQC capability based on diagnostic assessment evidence.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '9999px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
            <Calendar size={14} color="var(--color-primary)" />
            <span>Assessed: {formattedDate}</span>
          </div>
        </div>
      </section>

      {/* 1. Overall Capability Summary */}
      <CapabilitySummary profile={profile} />

      {/* 2. Top Priority Skill Gap (Next Focus) */}
      <PriorityGap topGap={profile.topPriorityGap} />

      {/* 3. 4-Domain Competency Breakdown */}
      <SkillBreakdown domains={profile.domains} />

      {/* 4. Assessment Context & Retake Action */}
      <Card variant="glass" padding="normal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CheckCircle size={20} color="var(--color-primary)" />
          <div>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Diagnostic Baseline Status: Active
            </span>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
              Want to re-evaluate your competencies after learning? You can retake the diagnostic assessment at any time.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<RotateCcw size={15} />}
          onClick={() => navigate('/assessment')}
        >
          Retake Diagnostic Assessment
        </Button>
      </Card>
    </div>
  );
};

export default Skills;
