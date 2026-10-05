import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import type { GapClass, SkillMatrix } from '../skillMatrix';

const GAP_BADGE: Record<GapClass, { variant: 'error' | 'warning' | 'secondary' | 'success' | 'neutral'; label: string }> = {
  critical: { variant: 'error', label: 'Critical gap' },
  high: { variant: 'warning', label: 'High gap' },
  medium: { variant: 'secondary', label: 'Medium gap' },
  none: { variant: 'success', label: 'Requirement met' },
  unassessed: { variant: 'neutral', label: 'Unassessed' },
};

/** "Unknown" is a lack of evidence, not a low level, so it is shown differently from Beginner. */
const Level: React.FC<{ level: string | null; emptyText: string }> = ({ level, emptyText }) => {
  if (level == null) return <span style={{ color: 'var(--color-text-secondary)' }}>{emptyText}</span>;
  if (level === 'Unknown') {
    return (
      <span
        title="Fewer than 3 scored items for this competency"
        style={{ fontStyle: 'italic', color: 'var(--color-text-secondary)', borderBottom: '1px dashed var(--color-outline)' }}
      >
        Unknown
      </span>
    );
  }
  return <span style={{ fontWeight: 600 }}>{level}</span>;
};

const th: React.CSSProperties = { textAlign: 'left', padding: '8px 10px', fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 600 };
const td: React.CSSProperties = { padding: '10px', borderTop: '1px solid var(--color-border)', verticalAlign: 'top', fontSize: 14 };

export const SkillMatrixTable: React.FC<{ matrix: SkillMatrix }> = ({ matrix }) => {
  const required = matrix.rows.filter((r) => r.required_level != null);
  return (
    <Card variant="glass" padding="normal">
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>Skill matrix</h2>
      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
        Required levels come from your open scan findings; demonstrated levels from your graded answers and practicals.
        {required.length === 0 && ' None of your open findings creates a competency requirement right now.'}
      </p>
      {matrix.rows.length === 0 ? (
        <p role="status" style={{ margin: 0 }}>
          No requirements and no assessed competencies yet. Run a verified scan of a domain you own, or take quizzes, to fill this in.
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
            <thead>
              <tr>
                <th style={th} scope="col">Competency</th>
                <th style={th} scope="col">Required</th>
                <th style={th} scope="col">Demonstrated</th>
                <th style={th} scope="col">Gap</th>
                <th style={th} scope="col">Why required</th>
              </tr>
            </thead>
            <tbody>
              {matrix.rows.map((row) => (
                <tr key={row.competency_code}>
                  <td style={td}>
                    <strong>{row.competency_code}</strong>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{row.competency_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                      {row.evidence_count} pieces of evidence
                    </div>
                  </td>
                  <td style={td}><Level level={row.required_level} emptyText="No current requirement" /></td>
                  <td style={td}><Level level={row.demonstrated_level} emptyText="Unknown" /></td>
                  <td style={td}>
                    {row.gap_class ? <Badge variant={GAP_BADGE[row.gap_class].variant}>{GAP_BADGE[row.gap_class].label}</Badge> : '–'}
                  </td>
                  <td style={td}>
                    {row.driving_findings.length === 0
                      ? '–'
                      : (
                        <ul style={{ margin: 0, paddingLeft: 16 }}>
                          {row.driving_findings.map((f) => (
                            <li key={f.finding_id}>
                              <Link to={`/closure/${f.finding_id}`} style={{ color: 'var(--color-primary)' }}>
                                {f.title ?? f.finding_type}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '12px 0 0' }}>
        Draft model: requirement map {matrix.requirement_map_version} ({matrix.requirement_map_status}); level thresholds{' '}
        {matrix.levels_status ?? 'unvalidated'}. Gap classes are a v1 rule, not a validated scale.
      </p>
    </Card>
  );
};
