import React, { useMemo, useState } from 'react';
import { ArrowRight, Award, CheckCircle2, Check, RotateCcw, ShieldCheck } from 'lucide-react';
import type { MissionBand, MissionData, MissionHud } from '@/data/missionsData';
import { Button } from '@/components/ui/Button';

interface MissionChoice {
  id: string;
  text?: string;
  feedback?: string;
  consequence?: Record<string, unknown>;
}

interface Props {
  mission: MissionData;
  onBack: () => void;
  backLabel: string;
  onFinished: (id: string, badgeName?: string, xp?: number) => void;
}

const startValues = (hud: MissionHud[]) => Object.fromEntries(hud.map((h) => [h.key, h.start])) as Record<string, number>;

const clamp = (h: MissionHud, value: number) => Math.max(0, h.max === undefined ? value : Math.min(h.max, value));

const meets = (band: MissionBand, values: Record<string, number>) =>
  Object.entries(band.requires).every(([key, rule]) => {
    const v = values[key];
    return (rule.min === undefined || v >= rule.min) && (rule.max === undefined || v <= rule.max);
  });

const shuffled = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const card: React.CSSProperties = { backgroundColor: 'var(--cyber-surface, #121827)', border: '1px solid #25334d', borderRadius: '14px', padding: '28px' };

/** A staged decision scenario driven entirely by the mission data: its variables, choices, consequences and outcome bands. */
export const DecisionMissionEngine: React.FC<Props> = ({ mission, onBack, backLabel, onFinished }) => {
  const hud = useMemo(() => mission.hud ?? [], [mission]);
  const stages = (mission.stages as unknown as { stage_id: string; narrative: string; decision_prompt: string; choices?: MissionChoice[] }[]) ?? [];
  const bands = mission.outcome?.bands ?? [];
  const [values, setValues] = useState<Record<string, number>>(() => startValues(hud));
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
  const band = bands.find((b) => meets(b, values)) ?? bands[bands.length - 1];
  const tone = band?.id === 'success' ? '#10b981' : band?.id === 'partial' ? '#f59e0b' : '#ef4444';
  const badge = (mission.rewards?.badge_awarded as string) || undefined;
  const xp = (mission.rewards?.mission_xp_awarded as number) || 0;
  const concept = (mission.resolution?.concept_reveal as string) || '';

  const commit = () => {
    if (!selected || committed) return;
    setCommitted(true);
    setValues((prev) => {
      const next = { ...prev };
      for (const h of hud) {
        const delta = selected.consequence?.[h.key];
        if (typeof delta === 'number') next[h.key] = clamp(h, prev[h.key] + delta);
      }
      return next;
    });
  };

  const advance = () => {
    if (stageIdx < stages.length - 1) {
      setStageIdx((i) => i + 1);
      setSelected(null);
      setCommitted(false);
    } else {
      setFinished(true);
      onFinished(mission.mission_id, badge, xp);
    }
  };

  const restart = () => {
    setValues(startValues(hud));
    setStageIdx(0);
    setSelected(null);
    setCommitted(false);
    setFinished(false);
    setRun((r) => r + 1);
  };

  const colourFor = (h: MissionHud, v: number) =>
    (h.warn_below !== undefined && v < h.warn_below) || (h.warn_above !== undefined && v > h.warn_above) ? 'var(--color-amber)' : '#f8fafc';
  const show = (h: MissionHud) => `${values[h.key]}${h.suffix ?? ''}`;

  return (
    <div>
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', backgroundColor: 'var(--cyber-surface, #121827)', borderRadius: '12px', padding: '16px', marginBottom: '28px', border: '1px solid #334155' }}
      >
        {hud.map((h) => (
          <div key={h.key}>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>{h.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: colourFor(h, values[h.key]) }}>{show(h)}</div>
          </div>
        ))}
      </div>

      {!finished && stage ? (
        <div style={card}>
          <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '4px', backgroundColor: 'var(--color-amber)', color: '#ffffff', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '14px' }}>
            Stage {stageIdx + 1} of {stages.length}
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc', marginBottom: '12px' }}>{stage.narrative}</h2>
          <p style={{ color: 'var(--cyber-primary-violet, #7C5CFF)', fontSize: '15px', fontWeight: 600, marginBottom: '20px' }}>{stage.decision_prompt}</p>

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
                        backgroundColor: isSel ? 'rgba(124, 92, 255, 0.18)' : 'var(--cyber-card, #1A1C1F)',
                        border: isSel ? '2px solid var(--cyber-primary-violet, #7C5CFF)' : '1px solid #334155',
                        opacity: committed && !isSel ? 0.45 : 1,
                        cursor: committed ? 'default' : 'pointer',
                        fontSize: '14px',
                        color: '#f8fafc',
                        lineHeight: 1.5,
                        font: 'inherit',
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <span style={{ flex: 1 }}>{choice.text}</span>
                      {isSel && committed && (
                        <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                          <Check size={12} /> Committed
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {!committed && (
                <div style={{ padding: '16px 20px', borderRadius: '10px', border: `1px dashed ${selected ? 'var(--cyber-primary-violet, #7C5CFF)' : '#334155'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: selected ? '#f8fafc' : '#94a3b8', flex: 1, minWidth: '220px' }}>
                    {selected ? 'You can switch options above, or commit this decision.' : 'Select an option above, then commit your decision.'}
                  </div>
                  <Button variant="primary" disabled={!selected} onClick={commit} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 24px' }}>
                    <ShieldCheck size={16} />
                    <span>Commit Decision</span>
                  </Button>
                </div>
              )}

              {committed && selected && (
                <div>
                  <div style={{ padding: '18px 20px', borderRadius: '10px', backgroundColor: 'rgba(56, 189, 248, 0.08)', border: '1px solid #0284c7', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <CheckCircle2 size={16} color="#38bdf8" />
                      <strong style={{ fontSize: '13px', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Consequence</strong>
                    </div>
                    <p style={{ fontSize: '14px', color: '#e2e8f0', lineHeight: 1.6, margin: 0 }}>{selected.feedback}</p>
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
              <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'rgba(148, 163, 184, 0.08)', border: `1px solid ${tone}`, marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 700, color: tone, marginBottom: '6px' }}>{band?.title}</div>
                <p style={{ fontSize: '15px', color: '#f8fafc', lineHeight: 1.6, margin: 0 }}>{band?.text}</p>
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
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#10b981' }}>
            <Award size={36} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>{mission.outcome?.final_title ?? 'Mission concluded'}</h2>
          <p style={{ color: '#94a3b8', maxWidth: '640px', margin: '0 auto 16px', lineHeight: 1.6 }}>
            {hud.map((h, i) => (
              <React.Fragment key={h.key}>
                {i > 0 && ' · '}
                {h.label}: <strong>{show(h)}</strong>
              </React.Fragment>
            ))}
          </p>
          {band && <p style={{ color: tone, fontWeight: 700, marginBottom: '16px' }}>{band.title}</p>}
          {concept && <p style={{ color: '#cbd5e1', maxWidth: '680px', margin: '0 auto 24px', lineHeight: 1.6, textAlign: 'left' }}>{concept}</p>}
          {badge && (
            <div style={{ maxWidth: '420px', margin: '0 auto 32px', padding: '16px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left' }}>
              <Award size={32} color="#10b981" />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-emerald)', fontWeight: 700, textTransform: 'uppercase' }}>Mission Badge Awarded</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>{badge}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>+{xp} XP added to User Profile</div>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <Button variant="primary" onClick={onBack}>
              {backLabel}
            </Button>
            <Button variant="outline" onClick={restart} style={{ color: '#f8fafc', borderColor: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RotateCcw size={14} />
              <span>Replay Scenario</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
