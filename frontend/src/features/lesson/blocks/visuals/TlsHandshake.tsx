import React, { useState } from 'react';
import type { VisualBlockData } from '../../lessonTypes';
import { SimulationBadge } from '../SimulationBadge';

interface Step {
  name: string;
  direction: 'to-server' | 'to-client';
  text: string;
}

// Simplified walk-through of a TLS 1.3 handshake (RFC 9846, section 2). The key shares
// travel inside the hellos; everything after ServerHello is encrypted.
const STEPS: Step[] = [
  {
    name: 'ClientHello + key_share',
    direction: 'to-server',
    text: 'The browser offers the cipher and hash options it supports and sends its half of the key exchange (a key share) with a random value.',
  },
  {
    name: 'ServerHello + key_share',
    direction: 'to-client',
    text: 'The server picks the parameters and sends its own key share. With both shares, each side can derive the same secret keys. Everything the server sends from here on is encrypted.',
  },
  {
    name: 'Certificate, CertificateVerify, Finished',
    direction: 'to-client',
    text: 'The server sends its certificate, a signature over the handshake made with the matching private key (CertificateVerify), and a Finished message that confirms the handshake.',
  },
  {
    name: 'Finished',
    direction: 'to-server',
    text: 'The browser checks the certificate and the signature, then sends its own Finished message. Both sides now protect application data with fresh traffic keys.',
  },
];

export const TlsHandshake: React.FC<{ block: VisualBlockData }> = ({ block }) => {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  return (
    <section className="ls-card ls-tls" aria-label={block.title ?? 'TLS handshake walkthrough'}>
      <div className="ls-tls-head">
        <div>
          <h2 className="ls-card-title">{block.title ?? 'Walk through the handshake'}</h2>
          <p className="ls-muted">Step through each message between your browser and the server.</p>
        </div>
        {block.simulation && <SimulationBadge />}
      </div>

      <div className="ls-tls-stage">
        <div className="ls-tls-node ls-tls-node--client">
          Browser<span>client</span>
        </div>
        <div className="ls-tls-message">
          <div className="ls-tls-name">{current.name}</div>
          <div
            className={`ls-tls-arrow ${current.direction === 'to-client' ? 'ls-tls-arrow--reverse' : ''}`}
            aria-hidden="true"
          >
            <div className="ls-tls-line" />
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M2 1l11 6-11 6z" />
            </svg>
          </div>
        </div>
        <div className="ls-tls-node ls-tls-node--server">
          Server<span>example.com</span>
        </div>
      </div>

      <p className="ls-tls-explain" aria-live="polite">
        <strong>
          Step {step + 1} of {STEPS.length}.
        </strong>{' '}
        {current.text}{' '}
        <span className="ls-muted">
          {current.direction === 'to-server' ? 'Direction: browser to server.' : 'Direction: server to browser.'}
        </span>
      </p>

      <div className="ls-tls-controls">
        <button
          type="button"
          className="ls-btn ls-btn--secondary"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          Previous step
        </button>
        <button
          type="button"
          className="ls-btn ls-btn--primary"
          onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
          disabled={step === STEPS.length - 1}
        >
          Next step
        </button>
        <div className="ls-dots" aria-hidden="true">
          {STEPS.map((s, i) => (
            <span key={s.name} className={i === step ? 'ls-dot ls-dot--on' : 'ls-dot'} />
          ))}
        </div>
      </div>
      <p className="ls-fineprint">
        Simplified illustration of the handshake. It uses fixed example text, not a real connection.
      </p>
    </section>
  );
};
