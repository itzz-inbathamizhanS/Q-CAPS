import React from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import type { AdminBlock, AdminCheckpointBlock, BlockType } from './adminTypes';
import { BLOCK_TYPES, MAX_BLOCKS, MAX_OPTIONS, newBlock } from './blockEditorModel';

interface Props {
  blocks: AdminBlock[];
  onChange: (blocks: AdminBlock[]) => void;
  /** Problems per block index, from the server or the client check. */
  problems?: Record<number, string[]>;
}

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <label className="ad-field">
    <span className="ad-field-label">{label}</span>
    {children}
    {hint && <span className="ad-hint">{hint}</span>}
  </label>
);

const VISUAL_KINDS = ['tls-handshake', 'simulation', 'planned-interactive'];

export const BlockEditor: React.FC<Props> = ({ blocks, onChange, problems = {} }) => {
  const update = (index: number, patch: Partial<AdminBlock>) =>
    onChange(blocks.map((b, i) => (i === index ? ({ ...b, ...patch } as AdminBlock) : b)));

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const remove = (index: number) => onChange(blocks.filter((_, i) => i !== index));

  const renderFields = (b: AdminBlock, i: number) => {
    switch (b.type) {
      case 'text':
        return (
          <Field label="Markdown" hint="Plain markdown. HTML tags are removed when you save.">
            <textarea
              className="ad-input ad-textarea"
              rows={6}
              value={b.markdown}
              onChange={(e) => update(i, { markdown: e.target.value })}
            />
          </Field>
        );
      case 'video':
        return (
          <>
            <Field label="Video URL" hint="https only, from an approved video host.">
              <input className="ad-input" value={b.url} onChange={(e) => update(i, { url: e.target.value })} />
            </Field>
            <Field label="Title">
              <input className="ad-input" value={b.title} onChange={(e) => update(i, { title: e.target.value })} />
            </Field>
            <div className="ad-row">
              <Field label="Captions file URL (.vtt)" hint="Required to publish.">
                <input
                  className="ad-input"
                  value={b.captions_url ?? ''}
                  onChange={(e) => update(i, { captions_url: e.target.value })}
                />
              </Field>
              <Field label="Transcript URL">
                <input
                  className="ad-input"
                  value={b.transcript_url ?? ''}
                  onChange={(e) => update(i, { transcript_url: e.target.value })}
                />
              </Field>
            </div>
          </>
        );
      case 'visual':
        return (
          <>
            <div className="ad-row">
              <Field label="Visual component" hint="Built component: tls-handshake. Other kinds are hidden from learners until a component exists.">
                <input
                  className="ad-input"
                  list="ad-visual-kinds"
                  value={b.kind}
                  onChange={(e) => update(i, { kind: e.target.value.toLowerCase() })}
                />
                <datalist id="ad-visual-kinds">
                  {VISUAL_KINDS.map((k) => (
                    <option key={k} value={k} />
                  ))}
                </datalist>
              </Field>
              <Field label="Title">
                <input className="ad-input" value={b.title ?? ''} onChange={(e) => update(i, { title: e.target.value })} />
              </Field>
            </div>
            <Field label="Description">
              <textarea
                className="ad-input ad-textarea"
                rows={3}
                value={b.description}
                onChange={(e) => update(i, { description: e.target.value })}
              />
            </Field>
            <label className="ad-check">
              <input
                type="checkbox"
                checked={b.simulation}
                onChange={(e) => update(i, { simulation: e.target.checked })}
              />
              <span>
                Label as <strong>SIMULATION</strong> (scripted behaviour, not real data or traffic)
              </span>
            </label>
          </>
        );
      case 'code':
        return (
          <>
            <div className="ad-row">
              <Field label="Language">
                <input className="ad-input" value={b.language} onChange={(e) => update(i, { language: e.target.value.toLowerCase() })} />
              </Field>
              <Field label="Caption">
                <input className="ad-input" value={b.caption ?? ''} onChange={(e) => update(i, { caption: e.target.value })} />
              </Field>
            </div>
            <Field label="Code">
              <textarea
                className="ad-input ad-textarea ad-mono"
                rows={6}
                spellCheck={false}
                value={b.code}
                onChange={(e) => update(i, { code: e.target.value })}
              />
            </Field>
          </>
        );
      case 'callout':
        return (
          <>
            <div className="ad-row">
              <Field label="Style">
                <select
                  className="ad-input"
                  value={b.variant}
                  onChange={(e) => update(i, { variant: e.target.value as typeof b.variant })}
                >
                  <option value="info">Info</option>
                  <option value="tip">Tip</option>
                  <option value="warning">Warning</option>
                  <option value="danger">Danger</option>
                </select>
              </Field>
              <Field label="Title">
                <input className="ad-input" value={b.title ?? ''} onChange={(e) => update(i, { title: e.target.value })} />
              </Field>
            </div>
            <Field label="Callout text">
              <textarea className="ad-input ad-textarea" rows={3} value={b.text} onChange={(e) => update(i, { text: e.target.value })} />
            </Field>
          </>
        );
      case 'checkpoint':
        return <CheckpointFields block={b} onPatch={(patch) => update(i, patch)} index={i} />;
    }
  };

  return (
    <div className="ad-blocks">
      {blocks.length === 0 && <p className="ls-muted">No blocks yet. Add one below.</p>}
      {blocks.map((b, i) => (
        <section key={b.id} className="ad-block" aria-label={`Block ${i + 1}, ${b.type}`}>
          <div className="ad-block-head">
            <span className={`ad-tag ad-tag--${b.type}`}>{b.type.toUpperCase()}</span>
            <span className="ad-block-actions">
              <button type="button" className="ad-iconbtn" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move block ${i + 1} up`}>
                <ArrowUp size={15} /> <span>Move up</span>
              </button>
              <button
                type="button"
                className="ad-iconbtn"
                onClick={() => move(i, 1)}
                disabled={i === blocks.length - 1}
                aria-label={`Move block ${i + 1} down`}
              >
                <ArrowDown size={15} /> <span>Move down</span>
              </button>
              <button type="button" className="ad-iconbtn ad-iconbtn--danger" onClick={() => remove(i)} aria-label={`Delete block ${i + 1}`}>
                <Trash2 size={15} /> <span>Delete</span>
              </button>
            </span>
          </div>
          <div className="ad-block-body">
            {renderFields(b, i)}
            {problems[i]?.length ? (
              <ul className="ad-problems" role="alert">
                {problems[i].map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      ))}

      <div className="ad-addbar">
        <span className="ad-addbar-label">Add block</span>
        {BLOCK_TYPES.map(({ type, label }) => (
          <button
            key={type}
            type="button"
            className="ls-btn ls-btn--secondary ad-add"
            disabled={blocks.length >= MAX_BLOCKS}
            onClick={() => onChange([...blocks, newBlock(type as BlockType)])}
          >
            <Plus size={14} aria-hidden="true" /> {label}
          </button>
        ))}
      </div>
    </div>
  );
};

const CheckpointFields: React.FC<{
  block: AdminCheckpointBlock;
  index: number;
  onPatch: (patch: Partial<AdminCheckpointBlock>) => void;
}> = ({ block, index, onPatch }) => {
  const setOption = (i: number, value: string) =>
    onPatch({ options: block.options.map((o, j) => (j === i ? value : o)) });

  const removeOption = (i: number) => {
    const options = block.options.filter((_, j) => j !== i);
    let correct = block.correct_index;
    if (i < correct) correct -= 1;
    else if (i === correct) correct = 0;
    onPatch({ options, correct_index: Math.min(correct, options.length - 1) });
  };

  return (
    <>
      <Field label="Question">
        <input className="ad-input" value={block.question} onChange={(e) => onPatch({ question: e.target.value })} />
      </Field>
      <fieldset className="ad-options">
        <legend className="ad-field-label">Options (select the correct answer)</legend>
        {block.options.map((o, i) => (
          <div key={i} className="ad-option">
            <input
              type="radio"
              name={`correct-${block.id}`}
              checked={block.correct_index === i}
              onChange={() => onPatch({ correct_index: i })}
              aria-label={`Option ${i + 1} is correct`}
            />
            <input
              className="ad-input"
              value={o}
              onChange={(e) => setOption(i, e.target.value)}
              aria-label={`Option ${i + 1} text`}
              data-testid={`cp-${index}-option-${i}`}
            />
            <button
              type="button"
              className="ad-iconbtn ad-iconbtn--danger"
              onClick={() => removeOption(i)}
              disabled={block.options.length <= 2}
              aria-label={`Remove option ${i + 1}`}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="ls-btn ls-btn--secondary ad-add"
          disabled={block.options.length >= MAX_OPTIONS}
          onClick={() => onPatch({ options: [...block.options, ''] })}
        >
          <Plus size={14} aria-hidden="true" /> Add option
        </button>
      </fieldset>
      <Field label="Explanation" hint="Shown only after the learner answers correctly. Required to publish.">
        <textarea
          className="ad-input ad-textarea"
          rows={2}
          value={block.explanation ?? ''}
          onChange={(e) => onPatch({ explanation: e.target.value })}
        />
      </Field>
    </>
  );
};
