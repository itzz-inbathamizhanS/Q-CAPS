import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Award, CheckCircle2, Check, RotateCcw, ShieldCheck } from 'lucide-react';
import type { MissionData, MissionHud } from '@/data/missionsData';
import { Button } from '@/components/ui/Button';
import { chooseMissionOption, startMissionRun } from '@/services/activityApi';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';
import { announce } from '@/features/a11y/announcer';

interface MissionChoice {
  id: string;
  text?: string;
}

interface Props {
  mission: MissionData;
  onBack: () => void;
  backLabel: string;
}

const startValues = (hud: MissionHud[]) => Object.fromEntries(hud.map((h) => [h.key, h.start])) as Record<string, number>;

const shuffled = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const card: React.CSSProperties = { backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '28px' };

/** A staged decision scenario driven entirely by the mission data: its variables, choices, consequences and outcome bands. */
export const DecisionMissionEngine: React.FC<Props> = ({ mission, onBack, backLabel }) => {
  const { recordActivityAward } = useCurriculumStore();
  const hud = useMemo(() => mission.hud ?? [], [mission]);
  const stages = (mission.stages as unknown as { stage_id: string; narrative: string; decision_prompt: string; choices?: MissionChoice[] }[]) ?? [];
  const bands = mission.outcome?.bands ?? [];
  // The server runs the scenario: it holds the answers, applies the consequences and decides the outcome.
  const [values, setValues] = useState<Record<string, number>>(() => startValues(hud));
  const [runId, setRunId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [serverBand, setServerBand] = useState<string | null>(null);
  const [awardText, setAwardText] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stageIdx, setStageIdx] = useState(0);
  const [selected, setSelected] = useState<MissionChoice | null>(null);
  const [committed, setCommitted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [run, setRun] = useState(0);

  const stage = stages[stageIdx];
  // The order of the options changes on every visit so the right answer cannot be learned by position.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ordered = useMemo(() => shuffled(stage?.choices ?? []), [stageIdx, run, mission.mission_id]);
  const hasChoices = Boolean(stage?.choices && stage.choices.length > 0);
  const band = bands.find((b) => b.id === serverBand) ?? bands[bands.length - 1];
  const tone = band?.id === 'success' ? 'var(--color-success)' : band?.id === 'partial' ? 'var(--color-warning)' : 'var(--color-danger)';
  const badge = (mission.rewards?.badge_awarded as string) || undefined;
  const xp = (mission.rewards?.mission_xp_awarded as number) || 0;
  const concept = (mission.resolution?.concept_reveal as string) || '';

  const begin = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const run = await startMissionRun(mission.mission_id);
      setRunId(run.run_id);
      setValues(run.values);
    } catch {
      setError('Could not start the mission on the server. Check your connection and retry.');
    } finally {
      setBusy(false);
    }
  }, [mission.mission_id]);

  useEffect(() => {
    void begin();
  }, [begin]);

  const commit = async () => {
    if (!selected || committed || !runId || busy) return;
    setBusy(true);
    setError(null);
    try {
      const r = await chooseMissionOption(runId, selected.id);
      setValues(r.values);
      setFeedback(r.feedback);
      announce(r.feedback);
      setCommitted(true);
      if (r.finished) setServerBand(r.band);
      if (r.awarded) {
        recordActivityAward('mission', mission.mission_id, r.awarded);
        setAwardText(`${r.awarded.badge ?? ''} · +${r.awarded.xp} XP`);
      }
    } catch {
      setError('The server could not record that decision. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const advance = () => {
    if (stageIdx < stages.length - 1) {
      setStageIdx((i) => i + 1);
      setSelected(null);
      setCommitted(false);
    } else {
      setFinished(true);
    }
  };

  const restart = () => {
    setStageIdx(0);
    setSelected(null);
    setCommitted(false);
    setFinished(false);
    setServerBand(null);
    setAwardText(null);
    setFeedback('');
    setRun((r) => r + 1);
    void begin();
  };

  const colourFor = (h: MissionHud, v: number) =>
    (h.warn_below !== undefined && v < h.warn_below) || (h.warn_above !== undefined && v > h.warn_above) ? 'var(--color-warning)' : 'var(--color-text-primary)';
  const show = (h: MissionHud) => `${values[h.key]}${h.suffix ?? ''}`;

  return (
    <div>
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', backgroundColor: 'var(--color-surface)', borderRadius: '12px', padding: '16px', marginBottom: '28px', border: '1px solid var(--color-border)' }}
      >
        {hud.map((h) => (
          <div key={h.key}>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>{h.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: colourFor(h, values[h.key]) }}>{show(h)}</div>
          </div>
        ))}
      </div>

      {error && (
        <div role="alert" style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <span>{error}</span>
          {!runId && (
            <Button variant="outline" onClick={() => void begin()}>
              Retry
            </Button>
          )}
        </div>
      )}
      {busy && !runId && !error && <p style={{ color: 'var(--color-text-secondary)', marginBottom: '16px' }}>Starting the mission on the server...</p>}

      {!finished && stage && runId ? (
        <div style={card}>
          <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '4px', backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '14px' }}>
            Stage {stageIdx + 1} of {stages.length}
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px' }}>{stage.narrative}</h2>
          <p style={{ color: 'var(--color-primary)', fontSize: '15px', fontWeight: 600, marginBottom: '20px' }}>{stage.decision_prompt}</p>

          {hasChoices ? (
            <>
              <div role="group" aria-label="Choices" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {ordered.map((choice) => {
                  const isSel = selected?.id === choice.id;
                  return (
                    <button
                      type="button"
                      key={choice.id}
                      onClick={() => !committed && setSelected(choice)}
                      disabled={committed && !isSel}
                      aria-pressed={isSel}
                      style={{
                        textAlign: 'left',
                        padding: '16px 20px',
                        borderRadius: '10px',
                        backgroundColor: isSel ? 'var(--color-primary-soft)' : 'var(--color-surface-low)',
                        border: isSel ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        opacity: committed && !isSel ? 0.45 : 1,
                        cursor: committed ? 'default' : 'pointer',
                        fontSize: '14px',
                        color: 'var(--color-text-primary)',
                        lineHeight: 1.5,
                        font: 'inherit',
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <span style={{ flex: 1 }}>{choice.text}</span>
                      {isSel && committed && (
                        <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                          <Check size={12} /> Committed
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {!committed && (
                <div style={{ padding: '16px 20px', borderRadius: '10px', border: `1px dashed ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: selected ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', flex: 1, minWidth: '220px' }}>
                    {selected ? 'You can switch options above, or commit this decision.' : 'Select an option above, then commit your decision.'}
                  </div>
                  <Button variant="primary" disabled={!selected || busy} onClick={() => void commit()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 24px' }}>
                    <ShieldCheck size={16} />
                    <span>Commit Decision</span>
                  </Button>
                </div>
              )}

              {committed && selected && (
                <div>
                  <div style={{ padding: '18px 20px', borderRadius: '10px', backgroundColor: 'var(--color-info-bg)', border: '1px solid var(--color-info)', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <CheckCircle2 size={16} color="var(--color-info)" />
                      <strong style={{ fontSize: '13px', color: 'var(--color-info)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Consequence</strong>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', lineHeight: 1.6, margin: 0 }}>{feedback}</p>
                  </div>
                  <Button variant="primary" onClick={advance} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{stageIdx < stages.length - 1 ? 'Next Stage' : 'View Final Report'}</span>
                    <ArrowRight size={16} />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div>
              <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--color-surface-low)', border: `1px solid ${tone}`, marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 700, color: tone, marginBottom: '6px' }}>{band?.title}</div>
                <p style={{ fontSize: '15px', color: 'var(--color-text-primary)', lineHeight: 1.6, margin: 0 }}>{band?.text}</p>
              </div>
              <Button variant="primary" onClick={advance} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>View Debrief</span>
                <ArrowRight size={16} />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ ...card, padding: '36px 28px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--color-success)' }}>
            <Award size={36} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>{mission.outcome?.final_title ?? 'Mission concluded'}</h2>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '640px', margin: '0 auto 16px', lineHeight: 1.6 }}>
            {hud.map((h, i) => (
              <React.Fragment key={h.key}>
                {i > 0 && ' · '}
                {h.label}: <strong>{show(h)}</strong>
              </React.Fragment>
            ))}
          </p>
          {band && <p style={{ color: tone, fontWeight: 700, marginBottom: '16px' }}>{band.title}</p>}
          {concept && <p style={{ color: 'var(--color-text-on-surface-variant)', maxWidth: '680px', margin: '0 auto 24px', lineHeight: 1.6, textAlign: 'left' }}>{concept}</p>}
          {!awardText && <p style={{ color: 'var(--color-text-secondary)', maxWidth: '640px', margin: '0 auto 24px' }}>No new badge or XP this time: they are awarded once, for a success or partial outcome.</p>}
          {badge && awardText && (
            <div style={{ maxWidth: '420px', margin: '0 auto 32px', padding: '16px', borderRadius: '10px', backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-success)', display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left' }}>
              <Award size={32} color="var(--color-success)" />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: 700, textTransform: 'uppercase' }}>Mission Badge Awarded</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{badge}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>+{xp} XP recorded by the server</div>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <Button variant="primary" onClick={onBack}>
              {backLabel}
            </Button>
            <Button variant="outline" onClick={restart} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RotateCcw size={14} />
              <span>Replay Scenario</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
