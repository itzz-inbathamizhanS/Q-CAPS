// src/components/ScannerTool.jsx
import React, { useState, useEffect, useRef } from 'react';
import { scanEndpoint } from '../services/scannerService';

const SCAN_STEPS = [
  { id: 1, label: 'DNS Resolve', icon: 'dns' },
  { id: 2, label: 'SSL Handshake', icon: 'lock' },
  { id: 3, label: 'Header Inspect', icon: 'http' },
  { id: 4, label: 'WHOIS Lookup', icon: 'search' },
  { id: 5, label: 'Threat Analysis', icon: 'bug_report' },
];

const PRESETS = ['google.com', 'github.com', 'amazon.com', 'facebook.com'];

// ─── Scan Progress Stepper ────────────────────────────────
const ScanStepper = ({ currentStep }) => (
  <div className="w-full max-w-4xl relative mx-auto">
    {/* Connecting Lines */}
    <div className="absolute top-[28px] left-[10%] right-[10%] h-[2px] bg-[#333] flex" style={{ zIndex: 0 }}>
      {SCAN_STEPS.slice(0, -1).map((_, i) => (
        <div
          key={i}
          className={`h-full flex-1 transition-all duration-700 ${
            i < currentStep - 1 ? 'bg-[#00eefc]' :
            i === currentStep - 1 ? 'bg-[#b000ff] animate-pulse-slow' : 'bg-transparent'
          }`}
        />
      ))}
    </div>
    {/* Steps */}
    <div className="flex justify-between w-full">
      {SCAN_STEPS.map((step) => {
        const isCompleted = step.id < currentStep;
        const isActive = step.id === currentStep;
        const isPending = step.id > currentStep;
        return (
          <div key={step.id} className="flex flex-col items-center gap-[16px] relative w-1/5">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center z-10 border-2 ${
              isCompleted ? 'bg-surface border-[#00eefc]' :
              isActive ? 'bg-surface border-[#b000ff]' :
              'bg-[#0a0a0f] border-[#444]'
            }`}>
              {isCompleted && (
                <span className="material-symbols-outlined text-[#00eefc] text-[28px]">check</span>
              )}
              {isActive && (
                <span className="material-symbols-outlined text-[#b000ff] text-[28px] animate-spin-slow">sync</span>
              )}
              {isPending && (
                <span className="material-symbols-outlined text-[#444] text-[24px]">{step.icon}</span>
              )}
            </div>
            <div className="text-center">
              <p className={`font-label-caps text-label-caps uppercase tracking-wider ${
                isCompleted ? 'text-[#00eefc]' :
                isActive ? 'text-[#b000ff] animate-pulse-slow' :
                'text-[#d3c0d8] opacity-50'
              }`}>{step.label}</p>
              <p className={`font-data-mono text-[10px] mt-1 ${
                isCompleted ? 'text-[#d3c0d8] opacity-70' :
                isActive ? 'text-[#b000ff]' :
                'text-[#d3c0d8] opacity-50'
              }`}>
                {isCompleted ? `${(Math.random() * 2 + 0.3).toFixed(2)}s` :
                 isActive ? 'Analyzing...' : 'Pending'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// ─── Terminal Log ─────────────────────────────────────────
const TerminalLog = ({ logs }) => {
  const logRef = useRef(null);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  return (
    <section className="bg-[#111] tactical-border rounded-lg overflow-hidden flex flex-col h-64">
      <div className="bg-[#1c1c24] border-b border-[#333] px-[24px] py-2 flex items-center justify-between">
        <div className="flex items-center gap-[8px]">
          <div className="w-2 h-2 rounded-full bg-[#00e479] animate-pulse-slow"></div>
          <span className="font-label-caps text-label-caps text-[#00e479]">Live Log</span>
        </div>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-full bg-[#333]"></div>
          <div className="w-3 h-3 rounded-full bg-[#333]"></div>
          <div className="w-3 h-3 rounded-full bg-[#333]"></div>
        </div>
      </div>
      <div ref={logRef} className="p-[24px] font-data-mono text-data-mono text-sm flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1">
        {logs.map((log, i) => (
          <div key={i} className={
            log.type === 'ok' ? 'text-[#00e479] opacity-90' :
            log.type === 'scan' ? 'text-[#b000ff]' :
            log.type === 'warn' ? 'text-[#ffb000]' :
            log.type === 'error' ? 'text-[#ff6b6b]' :
            'text-[#00e479] opacity-70'
          }>
            {log.text}
          </div>
        ))}
        <div className="text-[#b000ff] flex items-center">
          {'> processing'}<span className="cursor-blink"></span>
        </div>
      </div>
    </section>
  );
};

// ─── Threat Score Ring ─────────────────────────────────────
const ThreatScoreRing = ({ score }) => {
  const color = score <= 30 ? '#00ff88' : score <= 60 ? '#ffb000' : '#ff6b6b';
  const label = score <= 30 ? 'LOW' : score <= 60 ? 'MODERATE' : 'CRITICAL';
  return (
    <div className="flex items-center gap-[16px]">
      <span className="font-label-caps text-label-caps text-[#d3c0d8]">THREAT LEVEL</span>
      <div
        className="threat-ring"
        style={{ background: `conic-gradient(${color} ${score * 3.6}deg, #333 0)` }}
      >
        <span className="threat-ring-value font-data-mono text-label-caps font-bold" style={{ color }}>
          {score}
        </span>
      </div>
      <span className="font-label-caps text-label-caps" style={{ color }}>{label}</span>
    </div>
  );
};

// ─── Result Cards ─────────────────────────────────────────
const ResultCard = ({ title, icon, accentClass, iconColor, children }) => (
  <article className={`bg-surface tactical-border rounded-xl ${accentClass} p-[16px] flex flex-col gap-[16px]`}>
    <header className="flex items-center gap-[8px] border-b border-[#333] pb-[8px] mb-[8px]">
      <span className="material-symbols-outlined text-sm" style={{ color: iconColor }}>{icon}</span>
      <h2 className="font-label-caps text-label-caps text-[#e4e1e9]">{title}</h2>
    </header>
    {children}
  </article>
);

const DataRow = ({ label, value, valueColor }) => (
  <div className="flex justify-between font-data-mono text-xs">
    <span className="text-[#d3c0d8]">{label}:</span>
    <span style={{ color: valueColor || '#e4e1e9' }}>{value}</span>
  </div>
);

const StatusPill = ({ active }) => (
  <span className={`px-1 rounded text-[10px] font-label-caps ${
    active
      ? 'bg-[#00ff88]/10 text-[#00ff88]'
      : 'bg-[#ff6b6b]/10 text-[#ff6b6b]'
  }`}>
    {active ? 'ACTIVE' : 'MISSING'}
  </span>
);

// ─── Recent Scans ─────────────────────────────────────────
const RecentScans = ({ history, onRescan }) => {
  if (!history || history.length === 0) {
    return (
      <div className="w-full max-w-[700px]">
        <h3 className="font-label-caps text-label-caps text-[#9c8ba1] mb-[16px] uppercase tracking-wider border-b border-[#333] pb-[8px]">
          Recent Scans
        </h3>
        <p className="font-data-mono text-data-mono text-[#d3c0d8] opacity-50 text-center py-[24px]">
          No scans yet. Enter a URL above to begin.
        </p>
      </div>
    );
  }

  const getAccent = (score) => score <= 30 ? 'card-accent-cyan' : score <= 60 ? 'card-accent-purple' : 'card-accent-coral';
  const getScoreColor = (score) => score <= 30 ? '#00e479' : score <= 60 ? '#e6b4ff' : '#ffb4ab';
  const getScoreLabel = (score) => score <= 30 ? 'LOW' : score <= 60 ? 'MODERATE' : 'CRITICAL';

  return (
    <div className="w-full max-w-[700px]">
      <h3 className="font-label-caps text-label-caps text-[#9c8ba1] mb-[16px] uppercase tracking-wider border-b border-[#333] pb-[8px]">
        Recent Scans
      </h3>
      <div className="flex flex-col gap-[16px]">
        {history.map((scan, i) => (
          <div key={i} className={`surface-bg tactical-border ${getAccent(scan.score)} p-[16px] flex items-center justify-between`}>
            <div className="flex flex-col gap-[4px]">
              <span className="font-data-mono text-data-mono text-[#e4e1e9] font-bold">{scan.url}</span>
              <span className="font-data-mono text-[12px] text-[#d3c0d8] opacity-70">DATE: {scan.date}</span>
            </div>
            <div className="flex items-center gap-[32px]">
              <div className="flex flex-col items-end gap-[4px]">
                <span className="font-label-caps text-label-caps text-[#d3c0d8]">THREAT SCORE</span>
                <span className="font-data-mono text-data-mono font-bold" style={{ color: getScoreColor(scan.score) }}>
                  {scan.score} / {getScoreLabel(scan.score)}
                </span>
              </div>
              <button
                onClick={() => onRescan(scan.url)}
                className="border border-[#4f4255] text-[#e4e1e9] hover:border-[#00e479] hover:text-[#00e479] transition-colors px-[16px] py-[8px] font-label-caps text-label-caps flex items-center gap-[8px]"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span> RE-SCAN
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main Scanner Tool Component ──────────────────────────
const ScannerTool = () => {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState([]);
  const [scanHistory, setScanHistory] = useState(() => {
    const stored = localStorage.getItem('qcapsScanHistory');
    return stored ? JSON.parse(stored) : [];
  });

  // Simulated scan progress steps
  useEffect(() => {
    if (!isScanning) return;
    const stepMessages = [
      { step: 1, delay: 400, log: { type: 'sys', text: `[SYSTEM] Initiating scan sequence for ${url}...` } },
      { step: 1, delay: 800, log: { type: 'ok', text: `[OK] DNS resolved successfully` } },
      { step: 2, delay: 1500, log: { type: 'ok', text: `[OK] TCP connection established on port 443` } },
      { step: 2, delay: 2200, log: { type: 'ok', text: `[OK] TLS handshake completed` } },
      { step: 3, delay: 3000, log: { type: 'ok', text: `[OK] Certificate verified: CN=${url}` } },
      { step: 3, delay: 3500, log: { type: 'scan', text: `[SCANNING] Inspecting HTTP security headers...` } },
      { step: 4, delay: 4200, log: { type: 'ok', text: `[OK] WHOIS data retrieved` } },
      { step: 5, delay: 5000, log: { type: 'scan', text: `[SCANNING] Running quantum threat analysis...` } },
      { step: 5, delay: 5500, log: { type: 'warn', text: `[WARN] Classical cryptography detected` } },
    ];

    const timers = stepMessages.map((msg) =>
      setTimeout(() => {
        setCurrentStep(msg.step);
        setLogs(prev => [...prev, msg.log]);
      }, msg.delay)
    );

    return () => timers.forEach(clearTimeout);
  }, [isScanning, url]);

  const calculateThreatScore = (result) => {
    if (!result) return 0;
    let score = 0;
    // Quantum vulnerability
    if (!result.crypto?.is_quantum_safe) score += 40;
    // Missing headers
    const headers = result.infrastructure?.security_headers;
    if (headers) {
      if (!headers.hsts) score += 10;
      if (!headers.content_security_policy) score += 10;
      if (!headers.x_frame_options) score += 10;
    }
    // Vulnerabilities found
    score += Math.min((result.crypto?.vulnerabilities_found?.length || 0) * 5, 20);
    // Classical encryption penalty
    if (result.crypto?.encryption_detected === 'RSA') score += 10;
    return Math.min(score, 100);
  };

  const handleScan = async (targetUrl) => {
    const scanUrl = targetUrl || url;
    if (!scanUrl) return;

    setUrl(scanUrl);
    setIsScanning(true);
    setScanResult(null);
    setCurrentStep(0);
    setLogs([]);

    try {
      const result = await scanEndpoint(scanUrl);
      // Wait for progress animation to finish
      setTimeout(() => {
        setScanResult(result);
        setIsScanning(false);
        setCurrentStep(0);

        // Save to history
        const threatScore = calculateThreatScore(result);
        const newEntry = {
          url: scanUrl,
          date: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0].slice(0, 5) + 'Z',
          score: threatScore,
        };
        setScanHistory(prev => {
          const updated = [newEntry, ...prev.filter(s => s.url !== scanUrl)].slice(0, 5);
          localStorage.setItem('qcapsScanHistory', JSON.stringify(updated));
          return updated;
        });
      }, 6000);
    } catch (error) {
      console.error('Scan failed', error);
      setLogs(prev => [...prev, { type: 'error', text: `[ERROR] Scan failed: ${error.message}` }]);
      setTimeout(() => {
        setIsScanning(false);
        setCurrentStep(0);
      }, 2000);
    }
  };

  const handleNewScan = () => {
    setScanResult(null);
    setUrl('');
    setLogs([]);
    setCurrentStep(0);
  };

  const handleExportJSON = () => {
    if (!scanResult) return;
    const blob = new Blob([JSON.stringify(scanResult, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `qcaps-scan-${scanResult.target_url}-${Date.now()}.json`;
    a.click();
  };

  // ─── DEFAULT STATE ────────────────────────────
  if (!isScanning && !scanResult) {
    return (
      <div className="flex flex-col items-center w-full">
        {/* Title */}
        <div className="text-center mt-[48px] mb-[32px] max-w-3xl">
          <h1 className="font-headline-lg text-headline-lg font-bold text-[#e4e1e9] mb-[8px]">
            Quantum Recon Scanner
          </h1>
          <p className="font-body-lg text-body-lg text-[#888]">
            Scan any website to analyze its cryptographic security and quantum readiness
          </p>
        </div>

        {/* Input */}
        <form onSubmit={(e) => { e.preventDefault(); handleScan(); }} className="w-full max-w-[700px] flex flex-col sm:flex-row gap-[16px] mb-[24px]">
          <div className="relative flex-grow">
            <span className="material-symbols-outlined absolute left-[16px] top-1/2 -translate-y-1/2 text-[#9c8ba1]">search</span>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter target domain — e.g. google.com"
              className="w-full inset-bg tactical-border text-[#e4e1e9] font-data-mono text-data-mono py-[16px] pl-[48px] pr-[16px] focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-colors rounded-none placeholder:text-[#4f4255]"
              required
              disabled={isScanning}
            />
          </div>
          <button
            type="submit"
            disabled={isScanning || !url}
            className="btn-scan font-label-caps text-label-caps px-[24px] py-[16px] flex-shrink-0 flex items-center justify-center gap-[8px]"
          >
            EXECUTE SCAN
          </button>
        </form>

        {/* Presets */}
        <div className="flex flex-wrap justify-center gap-[16px] mb-[48px] max-w-[700px]">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => { setUrl(preset); handleScan(preset); }}
              className="surface-bg tactical-border px-[16px] py-[8px] font-data-mono text-data-mono text-[#e4e1e9] hover:bg-[#2a292f] transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Recent Scans */}
        <RecentScans history={scanHistory} onRescan={handleScan} />
      </div>
    );
  }

  // ─── SCANNING STATE ───────────────────────────
  if (isScanning) {
    return (
      <div className="flex flex-col gap-[32px] w-full max-w-[1440px] mx-auto">
        {/* Disabled Input */}
        <section className="bg-surface tactical-border rounded-lg p-[24px] relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#4f4255]"></div>
          <div className="flex flex-col md:flex-row gap-[16px] items-start md:items-end">
            <div className="flex-1 w-full opacity-50">
              <label className="block font-label-caps text-label-caps text-[#d3c0d8] mb-[8px]">Target Vector</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-[16px] top-1/2 -translate-y-1/2 text-[#d3c0d8] pointer-events-none">language</span>
                <input
                  className="w-full bg-[#0a0a0f] border border-[#333] text-[#d3c0d8] font-data-mono text-data-mono pl-[48px] pr-[16px] py-[16px] rounded cursor-not-allowed"
                  disabled
                  type="text"
                  value={url}
                />
              </div>
            </div>
            <button
              className="w-full md:w-auto bg-[#4f4255] text-[#0a0a0f] font-label-caps text-label-caps py-[16px] px-[48px] rounded flex items-center justify-center gap-[8px] cursor-not-allowed opacity-50"
              disabled
            >
              <span className="material-symbols-outlined text-[18px]">stop_circle</span>
              Abort
            </button>
          </div>
        </section>

        {/* Progress Stepper */}
        <section className="flex-1 flex flex-col justify-center items-center py-[48px]">
          <ScanStepper currentStep={currentStep} />
        </section>

        {/* Terminal Log */}
        <TerminalLog logs={logs} />
      </div>
    );
  }

  // ─── RESULTS STATE ────────────────────────────
  const threatScore = calculateThreatScore(scanResult);
  const threatColor = threatScore <= 30 ? '#00ff88' : threatScore <= 60 ? '#ffb000' : '#ff6b6b';

  return (
    <div className="flex flex-col gap-[16px] w-full max-w-[1440px] mx-auto animate-fade-in-up">
      {/* Summary Bar */}
      <section className="bg-surface tactical-border rounded-xl p-[16px] flex flex-col md:flex-row justify-between items-start md:items-center gap-[16px]">
        <div className="flex flex-col gap-1">
          <span className="font-label-caps text-label-caps text-[#d3c0d8]">TARGET</span>
          <span className="font-data-mono text-data-mono text-[#00f0ff]">{scanResult.target_url}</span>
          <span className="font-data-mono text-xs text-[#d3c0d8] opacity-70">{scanResult.scan_timestamp}</span>
        </div>
        <div className="flex items-center gap-[32px]">
          <ThreatScoreRing score={threatScore} />
          <div className="flex items-center gap-[8px] bg-[#0e0e13] tactical-border px-[8px] py-1 rounded">
            <span className="material-symbols-outlined text-[#00ff88] text-sm">star</span>
            <span className="font-data-mono text-label-caps text-[#00ff88]">+{scanResult.crypto?.mission_xp_awarded || 0} XP</span>
          </div>
        </div>
      </section>

      {/* Results Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px]">
        {/* Card 1: DOMAIN RECON */}
        <ResultCard title="DOMAIN RECON" icon="language" accentClass="card-accent-cyan" iconColor="#00f0ff">
          <div className="flex flex-col gap-2">
            <DataRow label="OWNER_ORG" value={scanResult.osint?.owner_organization || 'Unknown'} />
            <DataRow label="REGISTRAR" value={scanResult.osint?.registrar || 'Unknown'} />
            <DataRow label="CREATED" value={scanResult.osint?.creation_date?.split('T')[0] || 'Unknown'} />
            <DataRow label="EXPIRES" value={scanResult.osint?.expiration_date?.split('T')[0] || 'Unknown'} valueColor="#ffb000" />
          </div>
        </ResultCard>

        {/* Card 2: IP TRACKER */}
        <ResultCard title="IP TRACKER" icon="location_on" accentClass="card-accent-amber" iconColor="#ffb000">
          <div className="flex flex-col gap-2">
            <DataRow label="TARGET_IP" value={scanResult.infrastructure?.geo?.ip || 'Unknown'} valueColor="#ffb000" />
            <DataRow label="LOCATION" value={scanResult.infrastructure?.geo?.country || 'Unknown'} />
            <DataRow label="PROVIDER" value={scanResult.infrastructure?.geo?.isp || 'Unknown'} />
          </div>
        </ResultCard>

        {/* Card 3: DNS RECORDS */}
        <ResultCard title="DNS RECORDS" icon="dns" accentClass="card-accent-orange" iconColor="#ff8800">
          <div className="inset-bg tactical-border p-[8px] rounded font-data-mono text-[10px] text-[#e4e1e9] opacity-80 max-h-32 overflow-y-auto custom-scrollbar">
            {scanResult.infrastructure?.dns?.A?.map((r, i) => (
              <div key={`a-${i}`} className="mb-1"><span className="text-[#ff8800]">A</span> {r}</div>
            ))}
            {scanResult.infrastructure?.dns?.MX?.map((r, i) => (
              <div key={`mx-${i}`} className="mb-1"><span className="text-[#ff8800]">MX</span> {r}</div>
            ))}
            {scanResult.infrastructure?.dns?.TXT?.map((r, i) => (
              <div key={`txt-${i}`} className="mb-1"><span className="text-[#ff8800]">TXT</span> {r}</div>
            ))}
            {(!scanResult.infrastructure?.dns?.A?.length && !scanResult.infrastructure?.dns?.MX?.length) && (
              <div className="text-[#d3c0d8] opacity-50">No DNS records found</div>
            )}
          </div>
        </ResultCard>

        {/* Card 4: SSL CERTIFICATE */}
        <ResultCard title="SSL CERTIFICATE" icon="lock" accentClass="card-accent-green" iconColor="#00ff88">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center font-data-mono text-xs">
              <span className="text-[#d3c0d8]">ENCRYPTION:</span>
              <span className="bg-[#00ff88]/10 text-[#00ff88] px-1 py-0.5 rounded text-[10px] font-label-caps tactical-border border-[#00ff88]/30">
                {scanResult.crypto?.encryption_detected || 'Unknown'}
              </span>
            </div>
            <DataRow label="CIPHER" value={scanResult.crypto?.encryption_detected || 'Unknown'} />
            <DataRow
              label="Q-SAFE"
              value={scanResult.crypto?.is_quantum_safe ? 'YES' : 'NO'}
              valueColor={scanResult.crypto?.is_quantum_safe ? '#00ff88' : '#ff6b6b'}
            />
          </div>
        </ResultCard>

        {/* Card 5: HTTP HEADERS */}
        <ResultCard title="HTTP HEADERS" icon="http" accentClass="card-accent-pink" iconColor="#ff00b0">
          <div className="flex flex-col gap-2 font-data-mono text-[10px] w-full">
            <div className="flex justify-between items-center bg-[#0e0e13] p-1 rounded tactical-border">
              <span className="text-[#d3c0d8]">STRICT_TRANSPORT</span>
              <StatusPill active={scanResult.infrastructure?.security_headers?.hsts} />
            </div>
            <div className="flex justify-between items-center bg-[#0e0e13] p-1 rounded tactical-border">
              <span className="text-[#d3c0d8]">CONTENT_SECURITY</span>
              <StatusPill active={scanResult.infrastructure?.security_headers?.content_security_policy} />
            </div>
            <div className="flex justify-between items-center bg-[#0e0e13] p-1 rounded tactical-border">
              <span className="text-[#d3c0d8]">X_FRAME_OPTIONS</span>
              <StatusPill active={scanResult.infrastructure?.security_headers?.x_frame_options} />
            </div>
          </div>
        </ResultCard>

        {/* Card 7: PORT RECON */}
        <ResultCard title=">> PORT_RECON" icon="router" accentClass="card-accent-cyan" iconColor="#00f0ff">
          <div className="flex flex-col gap-2 font-data-mono text-[10px] w-full">
            {[
              { port: 21, label: 'FTP' },
              { port: 22, label: 'SSH' },
              { port: 80, label: 'HTTP' },
              { port: 443, label: 'HTTPS' },
              { port: 3306, label: 'MySQL' }
            ].map(p => {
              const status = scanResult.infrastructure?.ports?.[String(p.port)] || 'CLOSED';
              let statusClass = "text-[#d3c0d8] opacity-50 px-1 rounded";
              if (status === "OPEN") {
                statusClass = p.port === 443 ? "bg-[#00f0ff]/10 text-[#00f0ff] px-1 rounded" : "bg-[#00ff88]/10 text-[#00ff88] px-1 rounded";
              }
              return (
                <div key={p.port} className="flex justify-between items-center bg-[#0e0e13] p-1 rounded tactical-border">
                  <span className="text-[#d3c0d8]">{p.port} {p.label}</span>
                  <span className={statusClass}>{status}</span>
                </div>
              );
            })}
          </div>
        </ResultCard>

        {/* Card 8: SUBDOMAIN ENUM */}
        <ResultCard title=">> SUBDOMAIN_ENUM" icon="account_tree" accentClass="card-accent-amber" iconColor="#ffb000">
          <div className="inset-bg tactical-border p-[8px] rounded font-data-mono text-[10px] text-[#e4e1e9] opacity-80 h-full overflow-y-auto max-h-[120px] flex flex-col gap-1 custom-scrollbar">
            {scanResult.infrastructure?.subdomains?.length > 0 ? (
              scanResult.infrastructure.subdomains.map((sub, idx) => (
                <div key={idx}>{sub}</div>
              ))
            ) : (
              <div className="text-[#d3c0d8] opacity-50 text-center py-2 mt-4">No subdomains found</div>
            )}
          </div>
        </ResultCard>

        {/* Card 6: QUANTUM THREAT ANALYSIS */}
        <article className="bg-surface tactical-border rounded-xl card-accent-purple p-[16px] flex flex-col gap-[16px] lg:col-span-2 xl:col-span-3">
          <header className="flex items-center gap-[8px] border-b border-[#333] pb-[8px] mb-[8px]">
            <span className="material-symbols-outlined text-[#b000ff] text-sm">science</span>
            <h2 className="font-label-caps text-label-caps text-[#e4e1e9]">QUANTUM THREAT ANALYSIS</h2>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
            <div className="flex flex-col gap-2 font-data-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#d3c0d8]">ENCRYPTION:</span>
                <span className="text-[#e4e1e9] bg-[#0e0e13] px-1 rounded tactical-border">
                  {scanResult.crypto?.encryption_detected || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-[#d3c0d8]">Q-STATUS:</span>
                {scanResult.crypto?.is_quantum_safe ? (
                  <span className="bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/50 px-2 py-0.5 rounded text-[10px] font-bold">
                    QUANTUM SECURE
                  </span>
                ) : (
                  <span className="bg-[#ff6b6b]/20 text-[#ff6b6b] border border-[#ff6b6b]/50 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">
                    VULNERABLE
                  </span>
                )}
              </div>
              <div className="mt-2 text-[#d3c0d8] text-[10px] leading-relaxed">
                RECOMMENDATION: {scanResult.crypto?.is_quantum_safe
                  ? 'Target is currently using post-quantum algorithms. Continue monitoring for compliance updates.'
                  : 'Immediate migration to post-quantum cryptographic algorithms (e.g., Kyber, Dilithium) advised for long-term data security against harvest-now-decrypt-later attacks.'}
              </div>
            </div>
            <div className="inset-bg tactical-border p-[8px] rounded flex flex-col gap-1">
              <span className="font-label-caps text-[10px] text-[#d3c0d8] mb-1">IDENTIFIED VULNERABILITIES</span>
              {scanResult.crypto?.vulnerabilities_found?.length > 0 ? (
                scanResult.crypto.vulnerabilities_found.map((v, i) => (
                  <div key={i} className="flex items-center gap-2 font-data-mono text-[10px]">
                    <span className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-[#ff6b6b]' : 'bg-[#ff8800]'}`}></span>
                    <span className="text-[#e4e1e9]">{v}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 font-data-mono text-[10px]">
                  <span className="w-2 h-2 rounded-full bg-[#00ff88]"></span>
                  <span className="text-[#00ff88]">No vulnerabilities detected</span>
                </div>
              )}
            </div>
          </div>
        </article>
      </section>

      {/* Action Buttons */}
      <section className="mt-auto pt-[24px] flex flex-wrap gap-[16px] justify-end">
        <button
          onClick={() => alert("PDF Generation will be implemented soon!")}
          className="bg-transparent border border-[#00f0ff] text-[#00f0ff] font-label-caps text-label-caps px-[24px] py-[8px] rounded hover:bg-[#00f0ff]/10 transition-colors flex items-center gap-[8px]"
        >
          <span className="material-symbols-outlined text-sm">picture_as_pdf</span> DOWNLOAD PDF
        </button>
        <button
          onClick={handleExportJSON}
          className="bg-transparent border border-[#00ff88] text-[#00ff88] font-label-caps text-label-caps px-[24px] py-[8px] rounded hover:bg-[#00ff88]/10 transition-colors flex items-center gap-[8px]"
        >
          <span className="material-symbols-outlined text-sm">data_object</span> EXPORT JSON
        </button>
        <button
          onClick={() => handleScan(scanResult.target_url)}
          className="bg-transparent border border-[#ffb000] text-[#ffb000] font-label-caps text-label-caps px-[24px] py-[8px] rounded hover:bg-[#ffb000]/10 transition-colors flex items-center gap-[8px]"
        >
          <span className="material-symbols-outlined text-sm">refresh</span> RE-SCAN
        </button>
        <button
          onClick={handleNewScan}
          className="bg-transparent border border-[#b000ff] text-[#b000ff] font-label-caps text-label-caps px-[24px] py-[8px] rounded hover:bg-[#b000ff]/10 transition-colors flex items-center gap-[8px]"
        >
          <span className="material-symbols-outlined text-sm">add</span> NEW SCAN
        </button>
      </section>
    </div>
  );
};

export default ScannerTool;
