import React, { useEffect, useState } from 'react';
import type { VisualBlockData } from '../../lessonTypes';
import { countTrue, differingBits, toHex } from './avalanche';

const FIRST = "Transfer $10 into Oscar's account";
const SECOND = "Transfer $11 into Oscar's account";

const sha256 = async (text: string): Promise<Uint8Array> =>
  new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));

/** Real SHA-256 (the browser's Web Crypto API), not a simulation: edit either text and compare the two digests. */
export const HashAvalanche: React.FC<{ block: VisualBlockData }> = ({ block }) => {
  const [a, setA] = useState(FIRST);
  const [b, setB] = useState(SECOND);
  const [digests, setDigests] = useState<[Uint8Array, Uint8Array] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    if (!globalThis.crypto?.subtle) {
      setFailed(true);
      return;
    }
    Promise.all([sha256(a), sha256(b)])
      .then((d) => live && setDigests([d[0], d[1]]))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [a, b]);

  const bits = digests ? differingBits(digests[0], digests[1]) : [];
  const changed = countTrue(bits);

  return (
    <section className="ls-card ls-avalanche" aria-label={block.title ?? 'Hash avalanche'}>
      <h2 className="ls-card-title">{block.title ?? 'Change one character, change the whole hash'}</h2>
      <p className="ls-muted">
        Both digests below are computed live with SHA-256 in your browser. Edit either message and compare.
      </p>
      <div className="ls-avalanche-inputs">
        <label>
          <span className="ls-fineprint">Message A</span>
          <input className="ls-input" value={a} onChange={(e) => setA(e.target.value)} maxLength={200} />
        </label>
        <label>
          <span className="ls-fineprint">Message B</span>
          <input className="ls-input" value={b} onChange={(e) => setB(e.target.value)} maxLength={200} />
        </label>
      </div>
      {failed && (
        <p role="alert" className="ls-muted">
          SHA-256 is not available in this browser context (Web Crypto needs a secure page), so this demo cannot run.
        </p>
      )}
      {digests && (
        <>
          <p className="ls-avalanche-hash" aria-label="Digest of message A">{toHex(digests[0])}</p>
          <p className="ls-avalanche-hash" aria-label="Digest of message B">{toHex(digests[1])}</p>
          <p aria-live="polite">
            <strong>{changed} of 256</strong> output bits differ
            {a === b ? ' (the messages are identical)' : ''}.
          </p>
          <div
            className="ls-avalanche-grid"
            role="img"
            aria-label={`${changed} of 256 bits differ between the two digests. Highlighted cells are bits that changed.`}
          >
            {bits.map((flag, i) => (
              <span key={i} className={flag ? 'ls-avalanche-bit ls-avalanche-bit--diff' : 'ls-avalanche-bit'} />
            ))}
          </div>
        </>
      )}
      <p className="ls-fineprint">
        A well-designed hash flips about half of the output bits when a single input bit changes, so similar inputs
        give unrelated-looking outputs.
      </p>
    </section>
  );
};
