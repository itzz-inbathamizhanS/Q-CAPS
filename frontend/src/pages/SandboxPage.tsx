// src/pages/SandboxPage.tsx
import React, { useState, useEffect } from 'react';
import { Lock, ShieldAlert, ShieldCheck, Zap, KeyRound, Terminal as TerminalIcon } from 'lucide-react';
import '../styles/sandbox.css';

export const SandboxPage: React.FC = () => {
  const [payload, setPayload] = useState('Operation Quantum Leap: Proceed to extraction point Alpha.');
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [isCracking, setIsCracking] = useState(false);
  
  const [rsaState, setRsaState] = useState<'idle' | 'encrypted' | 'cracking' | 'cracked'>('idle');
  const [kyberState, setKyberState] = useState<'idle' | 'encrypted' | 'cracking' | 'resisted'>('idle');

  const [rsaData, setRsaData] = useState('');
  const [kyberData, setKyberData] = useState('');
  
  const [logs, setLogs] = useState<{time: string, text: string, color?: string}[]>([]);

  const addLog = (text: string, color?: string) => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, { time, text, color }]);
  };

  const generateCipher = (length: number) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}|:"<>?~`-=[];,./';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleEncrypt = () => {
    if (!payload.trim()) return;
    setIsEncrypted(true);
    setRsaState('encrypted');
    setKyberState('encrypted');
    
    // Generate some fake cyphertext that looks like base64 + noise
    setRsaData(generateCipher(128));
    setKyberData(generateCipher(164));
    
    setLogs([]);
    addLog('System: Data encrypted with RSA-2048 and CRYSTALS-Kyber.');
  };

  const handleQuantumAttack = () => {
    setIsCracking(true);
    setRsaState('cracking');
    setKyberState('cracking');
    
    addLog('Quantum Engine: Initializing Shor\'s Algorithm simulator...', '#38bdf8');
    
    // Simulate the cracking process
    setTimeout(() => {
      addLog('Quantum Engine: Synthesizing 4,096 logical qubits...', '#38bdf8');
    }, 1000);
    
    setTimeout(() => {
      addLog('Quantum Engine: Factoring RSA modulus (N) via quantum Fourier transform...', '#f59e0b');
    }, 2500);

    // RSA breaks
    setTimeout(() => {
      setRsaState('cracked');
      setRsaData(payload); // Decrypted!
      addLog('CRITICAL: RSA-2048 modulus factored. Private key extracted.', '#ef4444');
    }, 4500);

    // Kyber resists
    setTimeout(() => {
      addLog('Quantum Engine: Attempting lattice reduction against Kyber LWE problem...', '#f59e0b');
    }, 5500);

    setTimeout(() => {
      setKyberState('resisted');
      addLog('Quantum Engine: Attack failed. Post-Quantum encryption holds.', '#10b981');
      setIsCracking(false);
    }, 7500);
  };
  
  // Glitch effect while cracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (rsaState === 'cracking') {
      interval = setInterval(() => {
        setRsaData(generateCipher(128));
      }, 50);
    }
    return () => clearInterval(interval);
  }, [rsaState]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (kyberState === 'cracking') {
      interval = setInterval(() => {
        setKyberData(generateCipher(164));
      }, 50);
    }
    return () => clearInterval(interval);
  }, [kyberState]);

  const handleReset = () => {
    setIsEncrypted(false);
    setIsCracking(false);
    setRsaState('idle');
    setKyberState('idle');
    setRsaData('');
    setKyberData('');
    setLogs([]);
  };

  return (
    <div className="sandbox-container">
      <header className="sandbox-header">
        <h1 className="sandbox-title">Interactive PQ Sandbox</h1>
        <p className="sandbox-subtitle">
          Simulate a "Harvest Now, Decrypt Later" quantum computing attack. See firsthand why traditional algorithms like RSA are vulnerable to Shor's algorithm, and how lattice-based cryptography (Kyber) secures data against quantum adversaries.
        </p>
      </header>

      {/* Input Area */}
      <div className="sandbox-input-area">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <TerminalIcon size={18} color="var(--color-primary)" />
          <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Top Secret Payload</h2>
        </div>
        <textarea
          className="sandbox-textarea"
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          disabled={isEncrypted}
          placeholder="Enter the sensitive data you want to protect..."
        />
        
        <div className="sandbox-controls">
          {!isEncrypted ? (
            <button className="btn-quantum-attack" style={{ background: 'var(--color-primary)' }} onClick={handleEncrypt}>
              <KeyRound size={18} />
              Encrypt Payload
            </button>
          ) : (
            <>
              <button 
                className="btn-quantum-attack" 
                onClick={handleQuantumAttack}
                disabled={isCracking || rsaState === 'cracked'}
              >
                <Zap size={18} />
                {isCracking ? 'Simulating Shor\'s Algorithm...' : 'Launch Quantum Attack'}
              </button>
              
              <button 
                className="btn-quantum-attack" 
                style={{ background: 'var(--color-surface-variant)', color: 'var(--color-text-primary)' }}
                onClick={handleReset}
                disabled={isCracking}
              >
                Reset Sandbox
              </button>
            </>
          )}
        </div>
      </div>

      {/* Crypto Comparison Grid */}
      <div className="sandbox-grid">
        {/* RSA Card */}
        <div className={`crypto-card ${rsaState === 'cracked' ? 'vulnerable' : ''}`}>
          <div className="crypto-card-header">
            <h3 className="crypto-title">
              <ShieldAlert size={22} color={rsaState === 'cracked' ? '#ef4444' : 'var(--color-text-secondary)'} />
              RSA-2048
            </h3>
            <span className="crypto-badge legacy">Legacy Crypto</span>
          </div>
          
          <div className={`crypto-data-box ${rsaState === 'cracking' ? 'cracking' : ''} ${rsaState === 'cracked' ? 'cracked' : ''}`}>
            {rsaState === 'idle' && 'Awaiting payload encryption...'}
            {rsaState === 'encrypted' && rsaData}
            {rsaState === 'cracking' && rsaData}
            {rsaState === 'cracked' && (
              <>
                <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>[DECRYPTED PAYLOAD]</div>
                {rsaData}
              </>
            )}
          </div>
          
          <div className="crypto-status-log">
            {rsaState === 'idle' && <span style={{ color: 'var(--color-outline)' }}>Status: Idle</span>}
            {rsaState === 'encrypted' && <span style={{ color: '#38bdf8' }}>Status: Ciphertext generated. Secure against classical attacks.</span>}
            {rsaState === 'cracking' && <span style={{ color: '#f59e0b' }}>Status: Under attack by 4,096-qubit quantum simulator...</span>}
            {rsaState === 'cracked' && <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Status: COMPROMISED. Modulus factored.</span>}
          </div>
        </div>

        {/* Kyber Card */}
        <div className={`crypto-card ${kyberState === 'resisted' ? 'secure' : ''}`}>
          <div className="crypto-card-header">
            <h3 className="crypto-title">
              <ShieldCheck size={22} color={kyberState === 'resisted' ? '#10b981' : 'var(--color-primary)'} />
              CRYSTALS-Kyber
            </h3>
            <span className="crypto-badge quantum-safe">Quantum-Safe</span>
          </div>
          
          <div className={`crypto-data-box ${kyberState === 'cracking' ? 'cracking' : ''} ${kyberState === 'resisted' ? 'resisted' : ''}`}>
            {kyberState === 'idle' && 'Awaiting payload encryption...'}
            {kyberState === 'encrypted' && kyberData}
            {kyberState === 'cracking' && kyberData}
            {kyberState === 'resisted' && kyberData}
          </div>
          
          <div className="crypto-status-log">
            {kyberState === 'idle' && <span style={{ color: 'var(--color-outline)' }}>Status: Idle</span>}
            {kyberState === 'encrypted' && <span style={{ color: '#38bdf8' }}>Status: Ciphertext generated.</span>}
            {kyberState === 'cracking' && <span style={{ color: '#f59e0b' }}>Status: Experiencing lattice-reduction attacks...</span>}
            {kyberState === 'resisted' && <span style={{ color: '#10b981', fontWeight: 'bold' }}>Status: SECURE. LWE math held firm.</span>}
          </div>
        </div>
      </div>

      {/* Global Terminal Logs */}
      {logs.length > 0 && (
        <div style={{
          backgroundColor: 'var(--color-surface-low)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '16px',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          {logs.map((log, i) => (
            <div key={i} className="log-line" style={{ color: log.color || 'var(--color-text-secondary)' }}>
              <span className="log-time">[{log.time}]</span>
              <span>{log.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
