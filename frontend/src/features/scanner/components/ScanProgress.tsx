import React, { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { ScanMode } from '../types';
import { ACTIVE_CHECKS, CHECK_LABEL, STANDARD_CHECKS } from './constants';

interface Props {
  target: string;
  mode: ScanMode;
  onCancel: () => void;
}

/**
 * The scanner answers once, when every check has finished, so there is no per-stage progress to show.
 * This lists what the scan covers and how long it has been running, and nothing else.
 */
export const ScanProgress: React.FC<Props> = ({ target, mode, onCancel }) => {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const startedAt = Date.now();
    const tick = window.setInterval(() => setSeconds(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => window.clearInterval(tick);
  }, []);
  const checks = mode === 'full' ? [...STANDARD_CHECKS, ...ACTIVE_CHECKS] : STANDARD_CHECKS;

  return (
    <section className="sc-panel sc-progress" aria-live="polite">
      <div className="sc-spread">
        <div className="sc-row">
          <Loader2 className="sc-spinner" size={22} aria-hidden="true" />
          <div>
            <div className="sc-h3" style={{ margin: 0 }}>Scanning <span className="sc-mono">{target}</span></div>
            <div className="sc-muted">{seconds}s elapsed. Checks run in parallel and usually finish within 10 to 25 seconds.</div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onCancel} leftIcon={<X size={14} />}>Stop waiting</Button>
      </div>
      <div>
        <div className="sc-h2">Included in this scan</div>
        <ul className="sc-checklist">
          {checks.map((c) => <li key={c}>{CHECK_LABEL[c]}</li>)}
        </ul>
      </div>
      <p className="sc-muted" style={{ margin: 0 }}>
        Stopping only ends the wait in this window. The scanner may still finish on the server, and a stopped scan is not saved.
      </p>
    </section>
  );
};
