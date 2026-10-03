import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { ScanMode } from '../types';

interface Props {
  target: string;
  mode: ScanMode;
  /** Full mode is only runnable once the entered domain is verified. */
  canRun: boolean;
  disabled: boolean;
  onTargetChange: (value: string) => void;
  onModeChange: (mode: ScanMode) => void;
  onSubmit: () => void;
}

export const PRESET = 'example.com'; // reserved documentation domain (RFC 2606)

export const ScanForm: React.FC<Props> = ({ target, mode, canRun, disabled, onTargetChange, onModeChange, onSubmit }) => (
  <form
    className="sc-panel"
    onSubmit={(e) => {
      e.preventDefault();
      onSubmit();
    }}
  >
    <div className="sc-form">
      <div className="sc-field">
        <label className="sc-label" htmlFor="sc-target">Domain to assess</label>
        <input
          id="sc-target"
          className="sc-input"
          type="text"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          placeholder="example.com"
          value={target}
          onChange={(e) => onTargetChange(e.target.value)}
          disabled={disabled}
          required
        />
      </div>
      <div>
        <div className="sc-label" id="sc-mode-label" style={{ marginBottom: 6 }}>Scan type</div>
        <div className="sc-seg" role="group" aria-labelledby="sc-mode-label">
          <button type="button" aria-pressed={mode === 'standard'} onClick={() => onModeChange('standard')} disabled={disabled}>Standard</button>
          <button type="button" aria-pressed={mode === 'full'} onClick={() => onModeChange('full')} disabled={disabled}>Full (verified domain)</button>
        </div>
      </div>
      <Button type="submit" size="md" disabled={disabled || !target.trim() || !canRun} leftIcon={<Search size={16} />}>
        Run scan
      </Button>
    </div>
    <p className="sc-muted" style={{ margin: '12px 0 0' }}>
      Standard scans are passive: DNS, WHOIS, one TLS handshake plus a key-exchange probe, one HTTPS request and public Certificate
      Transparency logs. Only assess domains you own or have written permission to assess.{' '}
      <button type="button" className="sc-link" onClick={() => onTargetChange(PRESET)} disabled={disabled}>
        Try {PRESET}
      </button>
    </p>
  </form>
);
