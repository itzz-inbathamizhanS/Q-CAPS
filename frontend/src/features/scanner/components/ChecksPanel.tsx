import React from 'react';
import { Badge } from '@/components/ui/Badge';
import type { BadgeProps } from '@/components/ui/Badge';
import type { CheckReport, CheckStatus } from '../types';
import { CHECK_LABEL } from './constants';
import { KeyValue, SectionTitle } from './shared';

const STATUS: Record<CheckStatus, { label: string; variant: NonNullable<BadgeProps['variant']> }> = {
  ok: { label: 'Completed', variant: 'success' },
  failed: { label: 'Failed', variant: 'error' },
  skipped: { label: 'Skipped', variant: 'neutral' },
  requires_verification: { label: 'Needs verification', variant: 'warning' },
};

/** What actually ran. A failed or unverified check is a gap in the evidence, shown as such. */
export const ChecksPanel: React.FC<{ checks: Record<string, CheckReport> }> = ({ checks }) => (
  <section className="sc-panel">
    <SectionTitle>Checks</SectionTitle>
    <div className="sc-kv">
      {Object.entries(checks).map(([name, c]) => (
        <KeyValue key={name} label={CHECK_LABEL[name] ?? name}>
          <span className="sc-row" style={{ justifyContent: 'flex-end' }}>
            {c.reason && <span className="sc-muted">{c.reason}</span>}
            <Badge size="sm" variant={STATUS[c.status].variant}>{STATUS[c.status].label}</Badge>
          </span>
        </KeyValue>
      ))}
    </div>
  </section>
);
