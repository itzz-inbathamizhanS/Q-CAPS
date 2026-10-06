import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { setAssetContext } from '@/services/backendService';
import type { AssetContext, ScanAsset } from '../types';

const CRITICALITY = ['low', 'medium', 'high', 'critical'] as const;
const SENSITIVITY = ['public', 'internal', 'confidential', 'restricted'] as const;

/** Asset context used by the risk score. Shown to everyone who can see the asset; editable by its managers. */
export const AssetContextForm: React.FC<{ asset: ScanAsset; onSaved: () => void }> = ({ asset, onSaved }) => {
  const [ctx, setCtx] = useState<AssetContext>({
    criticality_level: asset.criticality_level ?? null,
    data_sensitivity: asset.data_sensitivity ?? null,
    confidentiality_years: asset.confidentiality_years ?? null,
  });
  const [state, setState] = useState<{ kind: 'idle' | 'saving' | 'saved' | 'error'; text?: string }>({ kind: 'idle' });
  const id = `ctx-${asset.id}`;

  if (!asset.can_manage) {
    return (
      <p className="sc-muted" style={{ margin: '6px 0 0' }}>
        Context: criticality {asset.criticality_level ?? 'not declared'}, data {asset.data_sensitivity ?? 'not declared'},
        confidentiality {asset.confidentiality_years != null ? `${asset.confidentiality_years} years` : 'not declared'}.
      </p>
    );
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setState({ kind: 'saving' });
    try {
      const r = await setAssetContext(asset.id, ctx);
      setState({ kind: 'saved', text: `Saved; ${r.rescored_findings} finding${r.rescored_findings === 1 ? '' : 's'} rescored.` });
      onSaved();
    } catch (err) {
      setState({ kind: 'error', text: err instanceof Error ? err.message : 'Could not save the context.' });
    }
  };

  return (
    <form onSubmit={save} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', marginTop: 8 }} aria-label={`Context of ${asset.target}`}>
      <label htmlFor={`${id}-crit`} style={{ display: 'flex', flexDirection: 'column', fontSize: 12, gap: 4 }}>
        Business criticality
        <select id={`${id}-crit`} value={ctx.criticality_level ?? ''} onChange={(e) => setCtx({ ...ctx, criticality_level: (e.target.value || null) as AssetContext['criticality_level'] })}>
          <option value="">Not declared</option>
          {CRITICALITY.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label htmlFor={`${id}-sens`} style={{ display: 'flex', flexDirection: 'column', fontSize: 12, gap: 4 }}>
        Data sensitivity
        <select id={`${id}-sens`} value={ctx.data_sensitivity ?? ''} onChange={(e) => setCtx({ ...ctx, data_sensitivity: (e.target.value || null) as AssetContext['data_sensitivity'] })}>
          <option value="">Not declared</option>
          {SENSITIVITY.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label htmlFor={`${id}-years`} style={{ display: 'flex', flexDirection: 'column', fontSize: 12, gap: 4 }}>
        Must stay confidential for (years)
        <input
          id={`${id}-years`}
          type="number"
          min={0}
          max={100}
          step={1}
          value={ctx.confidentiality_years ?? ''}
          onChange={(e) => setCtx({ ...ctx, confidentiality_years: e.target.value === '' ? null : Number(e.target.value) })}
          style={{ width: 120 }}
        />
      </label>
      <Button type="submit" variant="outline" size="sm" disabled={state.kind === 'saving'}>
        {state.kind === 'saving' ? 'Saving…' : 'Save context'}
      </Button>
      {state.text && (
        <span role={state.kind === 'error' ? 'alert' : 'status'} style={{ fontSize: 12, color: state.kind === 'error' ? 'var(--color-danger)' : 'var(--color-text-secondary)' }}>
          {state.text}
        </span>
      )}
    </form>
  );
};
