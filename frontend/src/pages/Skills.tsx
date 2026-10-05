import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearLegacyLocalResult, hasLegacyLocalResult } from '@/utils/assessmentStorage';
import { toSubmissionResult, useDiagnosticResults } from '@/features/assessment/diagnostic';
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
  const diagnostic = useDiagnosticResults();
  // Shown once: a result kept only in this browser by the old client-side diagnostic is not trusted or imported.
  const [legacyNotice, setLegacyNotice] = useState(hasLegacyLocalResult);
  const latest = diagnostic.status === 'ready' ? diagnostic.results[0] : undefined;

  const profile = useMemo(() => {
    if (!latest) return null;
    const result = toSubmissionResult(latest);
    return generateSkillGapProfile(result.domainScores, result.overallScore, result.completedAt);
  }, [latest]);

  const header = (
    <section className="dashboard-header">
      <h1 className="dashboard-title">Your Skill Profile</h1>
      <p className="dashboard-subtitle">
        Understand your current cybersecurity and PQC capability based on diagnostic assessment evidence.
      </p>
    </section>
  );

  const notice = legacyNotice && (
    <Card variant="glass" padding="normal" role="note">
      <p style={{ margin: 0, fontSize: 14 }}>
        An earlier diagnostic result was stored only in this browser and cannot be verified, so it is not used. Please
        retake the diagnostic: it is now scored on the server.
      </p>
      <Button variant="outline" size="sm" style={{ marginTop: 12 }} onClick={() => { clearLegacyLocalResult(); setLegacyNotice(false); }}>
        Dismiss
      </Button>
    </Card>
  );

  if (diagnostic.status !== 'ready' || !profile) {
    return (
      <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
        {header}
        {notice}
        {diagnostic.status === 'loading' && <p role="status">Loading your diagnostic results…</p>}
        {diagnostic.status === 'error' && (
          <Card variant="glass" padding="normal">
            <p role="alert" style={{ margin: 0 }}>Your diagnostic results could not be loaded ({diagnostic.message}). This is not the same as having no results; try again later.</p>
          </Card>
        )}
        {diagnostic.status === 'ready' && <SkillsEmptyState />}
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

      {notice}

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
