import React from 'react';
import { Badge } from '@/components/ui/Badge';
import type { Finding } from '../types';
import { SEVERITY_LABEL, SEVERITY_ORDER, SEVERITY_VARIANT } from './constants';
import { SectionTitle } from './shared';

interface Props {
  findings: Finding[];
  /** Checks that failed or did not run: with no findings, "nothing found" would overstate what was assessed. */
  incompleteChecks: number;
}

export const FindingsList: React.FC<Props> = ({ findings, incompleteChecks }) => {
  const sorted = [...findings].sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity));
  return (
    <section className="sc-panel">
      <SectionTitle>Findings</SectionTitle>
      {sorted.length === 0 ? (
        <p className="sc-muted" style={{ margin: 0 }}>
          No findings were derived from the checks that completed.
          {incompleteChecks > 0 && ` ${incompleteChecks} check(s) did not complete or were not run, so this is not a clean bill of health; see Checks below.`}
        </p>
      ) : (
        <div className="sc-findings">
          {sorted.map((f) => (
            <article key={f.id} className={`sc-finding sc-finding--${f.severity}`}>
              <div className="sc-row">
                <Badge variant={SEVERITY_VARIANT[f.severity]}>{SEVERITY_LABEL[f.severity]}</Badge>
                <span className="sc-finding-title">{f.title}</span>
              </div>
              {f.detail && <p className="sc-muted" style={{ margin: 0 }}>{f.detail}</p>}
              <div className="sc-evidence">{f.evidence}</div>
              <p style={{ margin: 0, fontSize: 13 }}><strong>Recommendation:</strong> {f.recommendation}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
