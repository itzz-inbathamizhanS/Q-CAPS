import React from 'react';
import { Link } from 'react-router-dom';
import type { RecommendationReason } from '@/services/backendService';

const str = (v: unknown) => (v == null ? '' : String(v));

/** One factor from the server's `reasons` list, in plain language. Unknown factor types are shown generically. */
function describe(r: RecommendationReason): React.ReactNode {
  switch (r.type) {
    case 'gap':
      return (
        <>
          Open finding{' '}
          <Link to={`/closure/${str(r.finding_id)}`} style={{ color: 'var(--color-primary)' }}>{str(r.finding_title)}</Link>{' '}
          needs {str(r.competency)} ({str(r.competency_name)}) at {str(r.required)}; your demonstrated level is {str(r.demonstrated)}{' '}
          ({str(r.gap_class)} gap).
        </>
      );
    case 'unassessed':
      return (
        <>
          Open finding{' '}
          <Link to={`/closure/${str(r.finding_id)}`} style={{ color: 'var(--color-primary)' }}>{str(r.finding_title)}</Link>{' '}
          needs {str(r.competency)} ({str(r.competency_name)}) at {str(r.required)}; you have not been assessed on it yet (Unknown).
        </>
      );
    case 'teaches':
      return <>This module has {str(r.tagged_items)} questions tagged {str(r.competency)} ({str(r.items_at_depth)} at the depth you need next).</>;
    case 'practical':
      return <>Proficient also needs a passed practical: {str(r.title)} ({str(r.kind)}, {str(r.depth)} level).</>;
    case 'prerequisite':
      return <>{str(r.module_id)} comes first: it is on the prerequisite path to {str(r.unlocks)}.</>;
    case 'no_content':
      return <>No module or practical is tagged with {str(r.competency)} yet, so this gap has no training to recommend.</>;
    case 'quiz_score':
      return <>Your latest quiz score in this topic is {Math.round(Number(r.score))}% ({str(r.band)}).</>;
    case 'not_attempted':
      return <>You have not attempted this topic yet. Unattempted topics come after measured weaknesses and get no stand-in score.</>;
    case 'scanner':
      return <>A recent scan found {str(r.risk)}-risk quantum-vulnerable cryptography related to this topic.</>;
    case 'all_strong':
      return <>Every assessed topic is Strong and no scan raises urgency.</>;
    case 'no_evidence':
      return <>Nothing has been assessed or scanned yet, so no gap can be identified.</>;
    case 'model_status':
      return (
        <>
          Based on draft models: requirement map {str(r.requirement_map_version)} ({str(r.requirement_map_status)}), level thresholds{' '}
          {str(r.levels_status)}.
        </>
      );
    default:
      return <>{str(r.type)}</>;
  }
}

/** "Why this?" disclosure listing the structured reasons the server gave for a recommendation. */
export const RecommendationReasons: React.FC<{ reasons?: RecommendationReason[] }> = ({ reasons }) => {
  if (!reasons || reasons.length === 0) return null;
  return (
    <details className="rec-reasons" style={{ marginTop: 8, fontSize: 13 }}>
      <summary style={{ cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 600 }}>Why this?</summary>
      <ul style={{ margin: '8px 0 0', paddingLeft: 18, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
        {reasons.map((r, i) => (
          <li key={i}>{describe(r)}</li>
        ))}
      </ul>
    </details>
  );
};
