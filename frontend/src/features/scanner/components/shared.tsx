import React from 'react';

export const KeyValue: React.FC<{ label: string; children: React.ReactNode; mono?: boolean }> = ({ label, children, mono }) => (
  <div className="sc-kv-row">
    <span className="sc-kv-key">{label}</span>
    <span className={`sc-kv-val${mono ? ' sc-mono' : ''}`}>{children}</span>
  </div>
);

export const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => <h2 className="sc-h2">{children}</h2>;
