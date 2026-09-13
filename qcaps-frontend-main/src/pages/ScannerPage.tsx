// src/pages/ScannerPage.tsx
// Integration wrapper: renders the Scanner Engine UI (ScannerTool) inside the main app shell.
// The scanner uses a dark "cyber terminal" theme — the wrapper applies a dark background
// scoped to this page so the rest of the app is unaffected.
import React from 'react';
import ScannerTool from '@/features/scanner/ScannerTool';
import '@/styles/scanner.css';

export const ScannerPage: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: '#0a0a0f',
        borderRadius: '12px',
        padding: '24px',
        minHeight: '80vh',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <ScannerTool />
    </div>
  );
};

export default ScannerPage;
