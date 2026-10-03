// src/pages/ScannerPage.tsx
// Route wrapper: renders the crypto scanner inside the main app shell.
import React from 'react';
import ScannerTool from '@/features/scanner/ScannerTool';
import '@/styles/scanner.css';

export const ScannerPage: React.FC = () => <ScannerTool />;

export default ScannerPage;
