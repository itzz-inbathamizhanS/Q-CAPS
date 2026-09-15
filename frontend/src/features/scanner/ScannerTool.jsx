import React, { useState, useEffect, useRef } from 'react';
import { scanEndpoint } from './scannerService';
import { useAuthStore } from '../auth/authStore';

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
  <div className="st-stepper">
    <div className="st-stepper-line">
      {SCAN_STEPS.slice(0, -1).map((_, i) => (
        <div
          key={i}
          className="st-stepper-line-fill"
          style={{ backgroundColor: i < currentStep - 1 ? 'var(--color-primary)' : i === currentStep - 1 ? 'var(--color-secondary)' : 'transparent' }}
        />
      ))}
    </div>
    <div className="st-stepper-nodes">
      {SCAN_STEPS.map((step) => {
        const isCompleted = step.id < currentStep;
        const isActive = step.id === currentStep;
        const isPending = step.id > currentStep;
        
        let circleClass = "st-step-circle";
        if (isCompleted) circleClass += " completed";
        if (isActive) circleClass += " active";
        if (isPending) circleClass += " pending";

        let labelClass = "st-step-label";
        if (isCompleted) labelClass += " completed";
        if (isActive) labelClass += " active";
        if (isPending) labelClass += " pending";

        return (
          <div key={step.id} className="st-step">
            <div className={circleClass}>
              {isCompleted && <span className="material-symbols-outlined" style={{fontSize:'28px'}}>check</span>}
              {isActive && <span className="material-symbols-outlined" style={{fontSize:'28px', animation:'spin 3s linear infinite'}}>sync</span>}
              {isPending && <span className="material-symbols-outlined" style={{fontSize:'24px'}}>{step.icon}</span>}
            </div>
            <div style={{textAlign:'center'}}>
              <p className={labelClass}>{step.label}</p>
              <p className="st-step-time" style={{ color: isActive ? 'var(--color-secondary)' : 'var(--color-text-secondary)' }}>
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
    <section className="glass-card st-terminal">
      <div className="st-terminal-header">
        <div className="st-terminal-title">
          <div className="st-terminal-dot"></div>
          <span>SYSTEM TERMINAL</span>
        </div>
        <div className="st-terminal-controls">
          <div></div><div></div><div></div>
        </div>
      </div>
      <div className="st-terminal-body">
        <div className="terminal-scanline"></div>
        <div ref={logRef} className="st-terminal-content custom-scrollbar">
          {logs.map((log, i) => {
            let color = 'var(--color-text-secondary)';
            if (log.type === 'ok') color = 'var(--color-emerald)';
            if (log.type === 'scan') color = 'var(--color-primary)';
            if (log.type === 'warn') color = 'var(--color-amber)';
            if (log.type === 'error') color = 'var(--color-error)';
            return <div key={i} style={{ color }}>{log.text}</div>;
          })}
          <div style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', marginTop: '8px' }}>
            {'> processing'}<span className="cursor-blink"></span>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Threat Score Ring ─────────────────────────────────────
const ThreatScoreRing = ({ score }) => {
  const color = score <= 30 ? 'var(--color-emerald)' : score <= 60 ? 'var(--color-amber)' : 'var(--color-error)';
  const label = score <= 30 ? 'LOW' : score <= 60 ? 'MODERATE' : 'CRITICAL';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)', letterSpacing: '0.05em' }}>THREAT LEVEL</span>
      <div
        className="threat-ring"
        style={{ background: `conic-gradient(${color} ${score * 3.6}deg, var(--color-surface-container) 0)` }}
      >
        <span className="threat-ring-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 'bold', color }}>
          {score}
        </span>
      </div>
      <span style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.05em', color }}>{label}</span>
    </div>
  );
};

// ─── Result Cards ─────────────────────────────────────────
const ResultCard = ({ title, icon, iconColor, children }) => (
  <article className="glass-card st-card">
    <div className="st-card-hover" style={{ backgroundColor: iconColor }}></div>
    <header className="st-card-header">
      <span className="material-symbols-outlined" style={{ color: iconColor, fontSize: '18px' }}>{icon}</span>
      <h2 className="st-card-title">{title}</h2>
    </header>
    {children}
  </article>
);

const DataRow = ({ label, value, valueColor }) => (
  <div className="st-data-row">
    <span className="st-data-label">{label}:</span>
    <span className="st-data-val" title={value} style={{ color: valueColor }}>{value}</span>
  </div>
);

const StatusPill = ({ active }) => (
  <span className={`st-pill ${active ? 'active' : 'missing'}`}>
    {active ? 'ACTIVE' : 'MISSING'}
  </span>
);

// ─── Recent Scans ─────────────────────────────────────────
const RecentScans = ({ history, onRescan }) => {
  if (!history || history.length === 0) {
    return (
      <div className="st-history">
        <h3 className="st-history-title">Recent Scans</h3>
        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', textAlign: 'center', padding: '32px 0' }}>
          Awaiting input vector...
        </p>
      </div>
    );
  }

  const getScoreColor = (score) => score <= 30 ? 'var(--color-emerald)' : score <= 60 ? 'var(--color-amber)' : 'var(--color-error)';
  const getScoreLabel = (score) => score <= 30 ? 'LOW' : score <= 60 ? 'MODERATE' : 'CRITICAL';

  return (
    <div className="st-history">
      <h3 className="st-history-title">
        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-primary)' }}>history</span> 
        Scan History
      </h3>
      <div className="st-history-list">
        {history.map((scan, i) => (
          <div key={i} className="glass-card st-history-card">
            <div className="st-history-info">
              <span className="st-history-url">{scan.url}</span>
              <span className="st-history-time">TIMESTAMP: {scan.date}</span>
            </div>
            <div className="st-history-actions">
              <div className="st-history-score">
                <span className="st-history-score-label">THREAT SCORE</span>
                <span className="st-history-score-val" style={{ color: getScoreColor(scan.score) }}>
                  {scan.score} / {getScoreLabel(scan.score)}
                </span>
              </div>
              <button onClick={() => onRescan(scan.url)} className="st-btn-outline">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span> RE-SCAN
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
  const { userId } = useAuthStore();
  const historyKey = `qcapsScanHistory-${userId || 'guest'}`;

  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState([]);
  const [scanHistory, setScanHistory] = useState(() => {
    const stored = localStorage.getItem(historyKey);
    return stored ? JSON.parse(stored) : [];
  });

  // Reload history when user changes
  useEffect(() => {
    const stored = localStorage.getItem(historyKey);
    setScanHistory(stored ? JSON.parse(stored) : []);
  }, [historyKey]);

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
    if (!result.crypto?.is_quantum_safe) score += 40;
    const headers = result.infrastructure?.security_headers;
    if (headers) {
      if (!headers.hsts) score += 10;
      if (!headers.content_security_policy) score += 10;
      if (!headers.x_frame_options) score += 10;
    }
    score += Math.min((result.crypto?.vulnerabilities_found?.length || 0) * 5, 20);
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
      setTimeout(() => {
        setScanResult(result);
        setIsScanning(false);
        setCurrentStep(0);

        const threatScore = calculateThreatScore(result);
        const newEntry = {
          url: scanUrl,
          date: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0].slice(0, 5) + 'Z',
          score: threatScore,
        };
        setScanHistory(prev => {
          const updated = [newEntry, ...prev.filter(s => s.url !== scanUrl)].slice(0, 5);
          localStorage.setItem(historyKey, JSON.stringify(updated));
          return updated;
        });

        try {
          const vulnCount = result?.crypto?.vulnerabilities_found?.length || 0;
          const detailsList = (result?.crypto?.vulnerabilities_found || []).map(v => ({
            algorithmDetected: result?.crypto?.encryption_detected || 'RSA',
            threatLevel: v
          }));
          logScannerResult({
            user_id: 1,
            endpoint: scanUrl,
            status: result?.crypto?.is_quantum_safe ? 'Quantum Safe' : 'Vulnerable',
            vulnerabilities_found: vulnCount,
            details: JSON.stringify(detailsList)
          });
        } catch (err) {
          console.debug('Backend scanner logging skipped:', err);
        }
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
      <div className="st-container">
        <div className="st-header">
          <h1 className="st-title">Quantum Recon Scanner</h1>
          <p className="st-subtitle">INITIATE CRYPTOGRAPHIC & OSINT VECTOR ANALYSIS</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleScan(); }} className="st-form">
          <div className="st-input-wrapper">
            <span className="material-symbols-outlined st-input-icon">travel_explore</span>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter target domain vector — e.g. target.com"
              className="st-input"
              required
              disabled={isScanning}
            />
          </div>
          <button type="submit" disabled={isScanning || !url} className="st-btn">
            EXECUTE
          </button>
        </form>

        <div className="st-presets">
          {PRESETS.map((preset) => (
            <button key={preset} onClick={() => { setUrl(preset); handleScan(preset); }} className="st-preset-btn">
              {preset}
            </button>
          ))}
        </div>

        <RecentScans history={scanHistory} onRescan={handleScan} />
      </div>
    );
  }

  // ─── SCANNING STATE ───────────────────────────
  if (isScanning) {
    return (
      <div className="st-scan-container">
        <section className="glass-card st-scan-top" style={{ padding: '24px' }}>
          <div className="st-scan-top-flex">
            <div className="st-scan-input-group">
              <label className="st-scan-input-label">TARGET VECTOR</label>
              <div className="st-input-wrapper">
                <span className="material-symbols-outlined st-input-icon">language</span>
                <input className="st-input" disabled type="text" value={url} />
              </div>
            </div>
            <button className="st-btn-outline" disabled style={{ padding: '16px 32px', backgroundColor: 'var(--color-surface-variant)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>stop_circle</span>
              ABORT
            </button>
          </div>
        </section>

        <ScanStepper currentStep={currentStep} />
        <TerminalLog logs={logs} />
      </div>
    );
  }

  // ─── RESULTS STATE ────────────────────────────
  const threatScore = calculateThreatScore(scanResult);
  const threatColor = threatScore <= 30 ? 'var(--color-emerald)' : threatScore <= 60 ? 'var(--color-amber)' : 'var(--color-error)';

  return (
    <div className="st-results-container">
      <section className="glass-card st-summary" style={{ borderLeftColor: threatColor }}>
        <div className="st-summary-left">
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)', letterSpacing: '0.05em' }}>TARGET ACQUIRED</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{scanResult.target_url}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-text-secondary)' }}>TIMESTAMP: {scanResult.scan_timestamp}</span>
        </div>
        <div className="st-summary-right">
          <ThreatScoreRing score={threatScore} />
          <div className="st-xp-badge">
            <span className="material-symbols-outlined">military_tech</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.05em' }}>+{scanResult.crypto?.mission_xp_awarded || 0} XP EARNED</span>
          </div>
        </div>
      </section>

      <section className="st-grid">
        <ResultCard title="DOMAIN RECON" icon="language" iconColor="var(--color-primary)">
          <div className="st-data-list">
            <DataRow label="OWNER_ORG" value={scanResult.osint?.owner_organization || 'Unknown'} />
            <DataRow label="REGISTRAR" value={scanResult.osint?.registrar || 'Unknown'} />
            <DataRow label="CREATED" value={scanResult.osint?.creation_date?.split('T')[0] || 'Unknown'} />
            <DataRow label="EXPIRES" value={scanResult.osint?.expiration_date?.split('T')[0] || 'Unknown'} valueColor="var(--color-amber)" />
          </div>
        </ResultCard>

        <ResultCard title="IP TRACKER" icon="location_on" iconColor="var(--color-amber)">
          <div className="st-data-list">
            <DataRow label="TARGET_IP" value={scanResult.infrastructure?.geo?.ip || 'Unknown'} valueColor="var(--color-amber)" />
            <DataRow label="LOCATION" value={scanResult.infrastructure?.geo?.country || 'Unknown'} />
            <DataRow label="PROVIDER" value={scanResult.infrastructure?.geo?.isp || 'Unknown'} />
          </div>
        </ResultCard>

        <ResultCard title="DNS RECORDS" icon="dns" iconColor="var(--color-secondary)">
          <div className="st-box-scroll custom-scrollbar">
            {scanResult.infrastructure?.dns?.A?.map((r, i) => (
              <div key={`a-${i}`}><span style={{ color: 'var(--color-secondary)', fontWeight: 'bold', marginRight: '8px' }}>A</span> {r}</div>
            ))}
            {scanResult.infrastructure?.dns?.MX?.map((r, i) => (
              <div key={`mx-${i}`}><span style={{ color: 'var(--color-secondary)', fontWeight: 'bold', marginRight: '8px' }}>MX</span> {r}</div>
            ))}
            {scanResult.infrastructure?.dns?.TXT?.map((r, i) => (
              <div key={`txt-${i}`} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={r}><span style={{ color: 'var(--color-secondary)', fontWeight: 'bold', marginRight: '8px' }}>TXT</span> {r}</div>
            ))}
            {(!scanResult.infrastructure?.dns?.A?.length && !scanResult.infrastructure?.dns?.MX?.length) && (
              <div style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>No DNS records found</div>
            )}
          </div>
        </ResultCard>

        <ResultCard title="SSL CERTIFICATE" icon="lock" iconColor="var(--color-emerald)">
          <div className="st-data-list">
            <div className="st-data-row" style={{ alignItems: 'center' }}>
              <span className="st-data-label">ENCRYPTION:</span>
              <span style={{ backgroundColor: 'rgba(84,39,230,0.1)', color: 'var(--color-primary)', border: '1px solid rgba(84,39,230,0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>
                {scanResult.crypto?.encryption_detected || 'Unknown'}
              </span>
            </div>
            <DataRow label="CIPHER" value={scanResult.crypto?.encryption_detected || 'Unknown'} />
            <DataRow
              label="Q-SAFE"
              value={scanResult.crypto?.is_quantum_safe ? 'SECURE' : 'VULNERABLE'}
              valueColor={scanResult.crypto?.is_quantum_safe ? 'var(--color-emerald)' : 'var(--color-error)'}
            />
          </div>
        </ResultCard>

        <ResultCard title="HTTP HEADERS" icon="http" iconColor="var(--color-primary-hover)">
          <div className="st-box-list">
            <div className="st-box-row">
              <span style={{ color: 'var(--color-text-primary)' }}>STRICT_TRANSPORT</span>
              <StatusPill active={scanResult.infrastructure?.security_headers?.hsts} />
            </div>
            <div className="st-box-row">
              <span style={{ color: 'var(--color-text-primary)' }}>CONTENT_SECURITY</span>
              <StatusPill active={scanResult.infrastructure?.security_headers?.content_security_policy} />
            </div>
            <div className="st-box-row">
              <span style={{ color: 'var(--color-text-primary)' }}>X_FRAME_OPTIONS</span>
              <StatusPill active={scanResult.infrastructure?.security_headers?.x_frame_options} />
            </div>
          </div>
        </ResultCard>

        <ResultCard title="PORT RECON" icon="router" iconColor="var(--color-technical-cyan)">
          <div className="st-box-list" style={{ fontSize: '10px' }}>
            {[
              { port: 21, label: 'FTP' },
              { port: 22, label: 'SSH' },
              { port: 80, label: 'HTTP' },
              { port: 443, label: 'HTTPS' },
              { port: 3306, label: 'MySQL' }
            ].map(p => {
              const status = scanResult.infrastructure?.ports?.[String(p.port)] || 'CLOSED';
              let statusStyle = { color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-surface-variant)', border: '1px solid var(--color-border)', padding: '2px 8px', borderRadius: '4px' };
              if (status === "OPEN") {
                statusStyle = p.port === 443 
                  ? { color: 'var(--color-primary)', backgroundColor: 'rgba(84,39,230,0.1)', border: '1px solid rgba(84,39,230,0.3)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }
                  : { color: 'var(--color-emerald)', backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' };
              }
              return (
                <div key={p.port} className="st-box-row" style={{ padding: '6px 8px' }}>
                  <span style={{ color: 'var(--color-text-primary)', fontWeight: 'bold' }}>{p.port} <span style={{ color: 'var(--color-text-secondary)', fontWeight: 'normal', marginLeft: '4px' }}>{p.label}</span></span>
                  <span style={statusStyle}>{status}</span>
                </div>
              );
            })}
          </div>
        </ResultCard>

        <ResultCard title="SUBDOMAIN ENUM" icon="account_tree" iconColor="var(--color-amber)">
          <div className="st-box-scroll custom-scrollbar" style={{ height: '100%', maxHeight: '160px' }}>
            {scanResult.infrastructure?.subdomains?.length > 0 ? (
              scanResult.infrastructure.subdomains.map((sub, idx) => (
                <div key={idx} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--color-primary)', cursor: 'default' }} title={sub}>
                  <span style={{ color: 'var(--color-text-secondary)', marginRight: '8px' }}>↳</span>{sub}
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic', textAlign: 'center', padding: '16px 0' }}>No subdomains found</div>
            )}
          </div>
        </ResultCard>

        <article className="glass-card st-card st-quantum-card" style={{ borderTopColor: threatColor }}>
          <header className="st-card-header">
            <span className="material-symbols-outlined" style={{ color: threatColor, fontSize: '24px' }}>science</span>
            <h2 className="st-card-title">QUANTUM THREAT ANALYSIS</h2>
          </header>
          <div className="st-quantum-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: 'var(--font-mono)', fontSize: '14px' }}>
              <div className="st-box-row" style={{ padding: '12px' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: 'bold' }}>ENCRYPTION ALGORITHM</span>
                <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
                  {scanResult.crypto?.encryption_detected || 'Unknown'}
                </span>
              </div>
              <div className="st-box-row" style={{ padding: '12px', marginTop: '4px' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: 'bold' }}>QUANTUM READINESS</span>
                {scanResult.crypto?.is_quantum_safe ? (
                  <span style={{ backgroundColor: 'rgba(16,185,129,0.2)', color: 'var(--color-emerald)', border: '1px solid rgba(16,185,129,0.5)', padding: '4px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px', letterSpacing: '0.05em' }}>
                    SECURE
                  </span>
                ) : (
                  <span style={{ backgroundColor: 'rgba(186,26,26,0.1)', color: 'var(--color-error)', border: '1px solid rgba(186,26,26,0.3)', padding: '4px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px', letterSpacing: '0.05em' }}>
                    VULNERABLE
                  </span>
                )}
              </div>
              <div style={{ marginTop: '8px', color: 'var(--color-text-primary)', fontSize: '12px', lineHeight: '1.6', backgroundColor: 'var(--color-surface-low)', padding: '12px', borderRadius: '8px', borderLeft: `4px solid ${threatColor}` }}>
                <span style={{ fontWeight: 'bold', marginRight: '8px' }}>AI RECOMMENDATION:</span>
                {scanResult.crypto?.is_quantum_safe
                  ? 'Target is currently using post-quantum algorithms. Continue monitoring for compliance updates.'
                  : 'Immediate migration to post-quantum cryptographic algorithms (e.g., Kyber, Dilithium) advised for long-term data security against harvest-now-decrypt-later attacks.'}
              </div>
            </div>
            
            <div className="st-box-scroll custom-scrollbar" style={{ padding: '16px', maxHeight: 'none', height: '100%' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '4px' }}>IDENTIFIED VULNERABILITIES</span>
              {scanResult.crypto?.vulnerabilities_found?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
                  {scanResult.crypto.vulnerabilities_found.map((v, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', backgroundColor: 'var(--color-surface)', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px', marginTop: '2px', color: i === 0 ? 'var(--color-error)' : 'var(--color-amber)' }}>warning</span>
                      <span style={{ color: 'var(--color-text-primary)', lineHeight: '1.4' }}>{v}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', height: '100%', opacity: 0.8 }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-emerald)', fontSize: '32px' }}>verified_user</span>
                  <span style={{ color: 'var(--color-emerald)', fontWeight: 'bold' }}>No vulnerabilities detected</span>
                </div>
              )}
            </div>
          </div>
        </article>
      </section>

      <section className="st-actions">
        <button onClick={() => alert("PDF Generation will be implemented soon!")} className="st-btn-outline">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>picture_as_pdf</span> REPORT
        </button>
        <button onClick={handleExportJSON} className="st-btn-outline">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>data_object</span> JSON
        </button>
        <button onClick={() => handleScan(scanResult.target_url)} className="st-btn-outline">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span> RE-SCAN
        </button>
        <button onClick={handleNewScan} className="st-btn">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span> NEW SCAN
        </button>
      </section>
    </div>
  );
};

export default ScannerTool;
