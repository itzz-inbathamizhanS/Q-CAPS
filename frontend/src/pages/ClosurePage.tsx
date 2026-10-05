import React, { useCallback, useState } from 'react';
import { useAsync, type AsyncState } from '@/hooks/useAsync';
import { Link, useParams } from 'react-router-dom';
import { EvidenceCard } from '@/features/evidence/EvidenceCard';
import { ClosureTimeline } from '@/features/closure/ClosureTimeline';
import { InterventionPlan } from '@/features/interventions/InterventionPlan';
import { evidenceService } from '@/features/evidence/evidenceService';
import { interventionService } from '@/features/interventions/interventionService';
import { closureService } from '@/features/closure/closureService';
import { fetchSkillMatrix, type SkillMatrixRow } from '@/features/skills/skillMatrix';
import type { ClosureEvent, Finding, FindingRequirement, RiskScore, VerificationResult } from '@/features/closure/closureTypes';
import type { Evidence } from '@/features/evidence/evidenceTypes';
import type { Intervention } from '@/features/interventions/interventionTypes';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const errorText = (e: unknown) => (e instanceof Error ? e.message : 'Request failed');

const Section: React.FC<{ title: string; state: AsyncState<unknown>; children: React.ReactNode }> = ({ title, state, children }) => (
  <Card variant="glass" padding="normal">
    <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 12px' }}>{title}</h2>
    {state.status === 'loading' && <p role="status" style={{ margin: 0 }}>Loading {title.toLowerCase()}…</p>}
    {state.status === 'error' && <p role="alert" style={{ margin: 0 }}>{title} could not be loaded ({state.message}).</p>}
    {state.status === 'ready' && children}
  </Card>
);

const fmt = (v: number | null) => (v == null ? 'unknown' : v.toFixed(2));

const severityLabel = (s: number) => (s >= 0.8 ? 'High' : s >= 0.5 ? 'Medium' : 'Info');

export const ClosurePage: React.FC = () => {
  const { findingId = '' } = useParams<{ findingId: string }>();

  const [finding] = useAsync<Finding>(() => closureService.getFinding(findingId), [findingId]);
  const [risk] = useAsync<RiskScore>(() => closureService.getRisk(findingId), [findingId]);
  const [requirements] = useAsync<FindingRequirement[]>(() => closureService.getRequirements(findingId), [findingId]);
  const [interventions] = useAsync<Intervention[]>(() => interventionService.getForFinding(findingId), [findingId]);
  const [events, reloadEvents] = useAsync<ClosureEvent[]>(() => closureService.getClosuresForFinding(findingId), [findingId]);
  const [gaps] = useAsync<SkillMatrixRow[]>(
    () => fetchSkillMatrix().then((m) => m.rows.filter((r) => r.driving_findings.some((f) => f.finding_id === findingId))),
    [findingId],
  );
  const evidenceId = finding.status === 'ready' ? finding.value.evidence_id : undefined;
  const [evidence] = useAsync<Evidence | null>(
    finding.status === 'ready' ? () => (evidenceId ? evidenceService.getEvidence(evidenceId) : Promise.resolve(null)) : null,
    [finding.status, evidenceId],
  );

  const [verifying, setVerifying] = useState<string | null>(null);
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const verify = useCallback(async (interventionId: string) => {
    setVerifying(interventionId);
    setVerifyError(null);
    try {
      setVerification(await closureService.verifyIntervention(interventionId));
      reloadEvents();
    } catch (e) {
      setVerifyError(errorText(e));
    } finally {
      setVerifying(null);
    }
  }, [reloadEvents]);

  if (finding.status === 'error') {
    return (
      <Card variant="glass" padding="large" style={{ maxWidth: 720, margin: '40px auto' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Finding unavailable</h1>
        <p role="alert">This finding does not exist or is not yours ({finding.message}).</p>
        <Link to="/scanner" style={{ color: 'var(--color-primary)' }}>Back to the scanner</Link>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <section className="dashboard-header">
        <h1 className="dashboard-title">Closure verification</h1>
        <p className="dashboard-subtitle">
          From this finding to the competencies it requires, your gaps, the assigned intervention and its verification.
        </p>
      </section>

      <Section title="Finding" state={finding}>
        {finding.status === 'ready' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <Badge variant={finding.value.severity >= 0.8 ? 'error' : finding.value.severity >= 0.5 ? 'warning' : 'neutral'}>
                {severityLabel(finding.value.severity)}
              </Badge>
              <Badge variant={finding.value.status === 'OPEN' ? 'warning' : 'success'}>{finding.value.status}</Badge>
              <strong>{finding.value.title ?? finding.value.finding_type}</strong>
            </div>
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
              {finding.value.finding_type}
              {finding.value.algorithm ? ` · ${finding.value.algorithm}` : ''} · first seen {new Date(finding.value.first_seen).toLocaleString()} · last seen{' '}
              {new Date(finding.value.last_seen).toLocaleString()}
            </span>
          </div>
        )}
      </Section>

      <Section title="Risk (unvalidated model)" state={risk}>
        {risk.status === 'ready' && (
          <div style={{ fontSize: 14 }}>
            <p style={{ margin: '0 0 6px' }}>
              {risk.value.score == null ? (
                <>Unknown: missing {risk.value.missing.join(' and ')}. Set the asset context in the scanner to compute it.</>
              ) : (
                <>
                  Score <strong>{risk.value.score.toFixed(2)}</strong> on a 0–1 scale
                </>
              )}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)' }}>
              Exposure {fmt(risk.value.factors.exposure)} × asset criticality {fmt(risk.value.factors.asset_criticality)} × PQC
              dependency {fmt(risk.value.factors.pqc_dependency)} × migration urgency {fmt(risk.value.factors.migration_urgency)}.
              Model {risk.value.model_version}; not yet validated, so use it to order findings, not to judge them.
            </p>
          </div>
        )}
      </Section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        <Section title="Requirements" state={requirements}>
          {requirements.status === 'ready' && (requirements.value.length === 0 ? (
            <p style={{ margin: 0 }}>No competency requirement is mapped for this finding type.</p>
          ) : (
            <>
              <p style={{ margin: '0 0 8px', fontWeight: 600 }}>{requirements.value[0].requirement}</p>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {requirements.value.map((r) => (
                  <li key={`${r.requirement_id}-${r.competency_code}`}>
                    {r.competency_code} {r.competency_name} at <strong>{r.required_level}</strong>
                  </li>
                ))}
              </ul>
              <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                {requirements.value[0].rationale} Map {requirements.value[0].map_version} ({requirements.value[0].map_status}).
              </p>
            </>
          ))}
        </Section>

        <Section title="Your skill gaps" state={gaps}>
          {gaps.status === 'ready' && (gaps.value.length === 0 ? (
            <p style={{ margin: 0 }}>This finding creates no requirement for you right now.</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {gaps.value.map((g) => (
                <li key={g.competency_code}>
                  {g.competency_code}: required {g.required_level}, demonstrated{' '}
                  {g.demonstrated_level === 'Unknown' ? <em>Unknown (not assessed)</em> : g.demonstrated_level} ({g.gap_class})
                </li>
              ))}
            </ul>
          ))}
          <p style={{ margin: '8px 0 0' }}><Link to="/skills" style={{ color: 'var(--color-primary)' }}>Full skill matrix</Link></p>
        </Section>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        <Section title="Interventions" state={interventions}>
          {interventions.status === 'ready' && (interventions.value.length === 0 ? (
            <p style={{ margin: 0 }}>No intervention assigned yet. Interventions are assigned by an administrator.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {interventions.value.map((iv) => (
                <div key={iv.id}>
                  <InterventionPlan intervention={iv} />
                  <Button variant="outline" size="sm" style={{ marginTop: 8 }} disabled={verifying != null} onClick={() => verify(iv.id)}>
                    {verifying === iv.id ? 'Verifying…' : 'Verify closure'}
                  </Button>
                </div>
              ))}
            </div>
          ))}
          {verifyError && <p role="alert" style={{ margin: '8px 0 0' }}>{verifyError}</p>}
          {verification && (
            <div role="status" style={{ marginTop: 12, fontSize: 14 }}>
              <strong>Result: {verification.status}</strong>
              <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                <li>Technical: {verification.technical_ok ? 'remediated' : 'not yet'} ({verification.technical.rule}; finding {verification.technical.finding_status}).</li>
                <li>Learner: {verification.learner_result_ok ? 'met' : 'not yet'} ({verification.learner.rule ?? verification.learner.detail}).</li>
              </ul>
            </div>
          )}
        </Section>

        <Section title="Evidence" state={evidence}>
          {evidence.status === 'ready' && (evidence.value ? <EvidenceCard evidence={evidence.value} /> : <p style={{ margin: 0 }}>No verified result available.</p>)}
        </Section>
      </div>

      <Section title="Closure timeline" state={events}>
        {events.status === 'ready' && <ClosureTimeline events={events.value} />}
      </Section>
    </div>
  );
};

export default ClosurePage;
