// src/pages/MissionPlay.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Award,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  Check
} from 'lucide-react';
import { missionsData, MissionData } from '@/data/missionsData';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';
import { Button } from '@/components/ui/Button';

export const MissionPlay: React.FC = () => {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();
  const { completeMission } = useCurriculumStore();

  const mission = missionsData.find((m) => m.mission_id === missionId) || missionsData[0];

  // Exit dialog state
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleExit = () => {
    navigate('/missions');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--cyber-bg, #080B14)',
        color: '#f8fafc',
        zIndex: 1000,
        overflowY: 'auto',
        fontFamily: 'var(--font-sans)'
      }}
    >
      {/* Masthead */}
      <div
        style={{
          borderBottom: '1px solid #1e293b',
          backgroundColor: 'var(--cyber-surface, #121827)',
          padding: '14px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => setShowExitConfirm(true)}
            style={{
              background: 'transparent',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#94a3b8',
              padding: '6px 12px',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <X size={14} />
            <span>Abort Mission</span>
          </button>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--cyber-primary-violet, #7C5CFF)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              Q-CAPS Operational Simulation
            </span>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#f8fafc' }}>
              {mission.title}
            </div>
          </div>
        </div>

        <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#64748b' }}>
          {mission.mission_id}
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--cyber-card, #1A1C1F)',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '400px',
              textAlign: 'center'
            }}
          >
            <AlertTriangle size={36} color="#f59e0b" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#f8fafc', marginBottom: '8px' }}>
              Abort Mission?
            </h3>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '20px' }}>
              Your progress in this simulation attempt will not be recorded.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                onClick={() => setShowExitConfirm(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  backgroundColor: '#334155',
                  color: '#f8fafc',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Continue Mission
              </button>
              <button
                onClick={handleExit}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--color-error)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Confirm Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mission Content Router: Simulation (BB84) vs Decision Scenario */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 20px 80px' }}>
        {mission.type === 'simulation' ? (
          <BB84SimulationEngine mission={mission} onFinished={completeMission} />
        ) : (
          <EnterpriseMigrationEngine mission={mission} onFinished={completeMission} />
        )}
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// ENGINE A: BB84 QUANTUM KEY DISTRIBUTION SIMULATOR
// -------------------------------------------------------------
interface SimulationProps {
  mission: MissionData;
  onFinished: (id: string, badgeName?: string, xp?: number) => void;
}

const BB84SimulationEngine: React.FC<SimulationProps> = ({ mission, onFinished }) => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<number>(1);
  const [photonCount, setPhotonCount] = useState<number>(30);
  const [aliceBits, setAliceBits] = useState<number[]>([]);
  const [aliceBases, setAliceBases] = useState<string[]>([]);
  const [bobBases, setBobBases] = useState<string[]>([]);
  const [bobResults, setBobResults] = useState<number[]>([]);
  const [siftedIndices, setSiftedIndices] = useState<number[]>([]);
  const [sampleSize, setSampleSize] = useState<number>(8);
  const [errorRate, setErrorRate] = useState<number>(0);
  const [decision, setDecision] = useState<'accept' | 'abort' | null>(null);
  const [evePresent, setEvePresent] = useState<boolean>(() => Math.random() < 0.5);

  const badgeName = (mission.rewards?.badge_awarded as string) || 'QKD Defender';
  const missionXp = (mission.rewards?.mission_xp_awarded as number) || 85;

  // Stage 1: Run transmission
  const startTransmission = () => {
    const bits: number[] = [];
    const aBases: string[] = [];
    const bBases: string[] = [];
    const results: number[] = [];
    const sifted: number[] = [];

    for (let i = 0; i < photonCount; i++) {
      const bit = Math.random() > 0.5 ? 1 : 0;
      const aBase = Math.random() > 0.5 ? '+' : 'x';
      const bBase = Math.random() > 0.5 ? '+' : 'x';

      bits.push(bit);
      aBases.push(aBase);
      bBases.push(bBase);

      // Quantum measurement behavior:
      // If bases match, result = bit (with minor noise or eavesdropping disturbance)
      // If bases mismatch, result = uniform random 50/50
      if (aBase === bBase) {
        // Eve present induces 25% error on matched bases
        const hasEveDisturbed = evePresent && Math.random() < 0.25;
        results.push(hasEveDisturbed ? 1 - bit : bit);
        sifted.push(i);
      } else {
        results.push(Math.random() > 0.5 ? 1 : 0);
      }
    }

    setAliceBits(bits);
    setAliceBases(aBases);
    setBobBases(bBases);
    setBobResults(results);
    setSiftedIndices(sifted);
    setStage(2);
  };

  // Stage 4: Estimate error rate
  const computeSampleError = (size: number) => {
    setSampleSize(size);
    if (siftedIndices.length === 0) return;
    const sampled = siftedIndices.slice(0, size);
    let mismatches = 0;
    sampled.forEach((idx) => {
      if (aliceBits[idx] !== bobResults[idx]) {
        mismatches++;
      }
    });
    const calculatedRate = Math.round((mismatches / sampled.length) * 100);
    setErrorRate(calculatedRate);
  };

  const handleDecision = (choice: 'accept' | 'abort') => {
    setDecision(choice);
    setStage(5);
    const isCorrect = (choice === 'abort' && errorRate > 10) || (choice === 'accept' && errorRate <= 10);
    if (isCorrect) {
      onFinished(mission.mission_id, badgeName, missionXp);
    }
  };

  const isDecisionCorrect = decision !== null && ((decision === 'abort' && errorRate > 10) || (decision === 'accept' && errorRate <= 10));

  return (
    <div>
      {/* Live HUD */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          backgroundColor: 'var(--cyber-surface, #121827)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '28px',
          border: '1px solid #334155'
        }}
      >
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Quantum Channel</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--cyber-primary-violet, #7C5CFF)' }}>
            {stage === 1 ? 'Idle' : 'Active (Single Photon)'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Transmitted Photons</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>
            {aliceBits.length}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Sifted Key Size</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-emerald)' }}>
            {siftedIndices.length} bits
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Sample Error Rate</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: errorRate > 10 ? 'var(--color-error)' : 'var(--color-emerald)' }}>
            {stage >= 4 ? `${errorRate}%` : 'Unassessed'}
          </div>
        </div>
      </div>

      {/* STAGE 1: Briefing & Transmission Setup */}
      {stage === 1 && (
        <div style={{ backgroundColor: 'var(--cyber-surface, #121827)', border: '1px solid #25334d', borderRadius: '14px', padding: '28px' }}>
          <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '4px', backgroundColor: '#0284c7', color: '#ffffff', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '14px' }}>
            Stage 1: Transmission Setup
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#f8fafc', marginBottom: '12px' }}>
            Diplomatic Key Exchange Window Active
          </h2>
          <p style={{ color: '#cbd5e1', lineHeight: 1.6, marginBottom: '20px' }}>
            {mission.objective} You will prepare polarized photons with random bits and random rectilinear (+) or diagonal (x) bases. Bob will measure each photon in independently selected bases.
          </p>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
              Select Photon Batch Size: <strong>{photonCount} photons</strong>
            </label>
            <input
              type="range"
              min={20}
              max={60}
              step={10}
              value={photonCount}
              onChange={(e) => setPhotonCount(parseInt(e.target.value, 10))}
              style={{ width: '100%', maxWidth: '300px' }}
            />
          </div>

          <Button variant="primary" onClick={startTransmission}>
            Begin Photon Transmission →
          </Button>
        </div>
      )}

      {/* STAGE 2: Measure & Notice */}
      {stage === 2 && (
        <div style={{ backgroundColor: 'var(--cyber-surface, #121827)', border: '1px solid #25334d', borderRadius: '14px', padding: '28px' }}>
          <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '4px', backgroundColor: '#0284c7', color: '#ffffff', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '14px' }}>
            Stage 2: Measurement Telemetry
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc', marginBottom: '10px' }}>
            Transmission Complete — Inspecting Measurement Results
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '20px', lineHeight: 1.5 }}>
            Notice that when Alice and Bob choose <strong>matching bases</strong> (highlighted in teal), Bob's result correlates with Alice's bit. When bases mismatch (red), quantum mechanics forces a random 50/50 collapse!
          </p>

          {/* Telemetry Table */}
          <div style={{ maxHeight: '260px', overflowY: 'auto', border: '1px solid #334155', borderRadius: '8px', marginBottom: '24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'center' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--cyber-card, #1A1C1F)', color: '#94a3b8' }}>
                  <th style={{ padding: '8px' }}>#</th>
                  <th style={{ padding: '8px' }}>Alice Bit</th>
                  <th style={{ padding: '8px' }}>Alice Basis</th>
                  <th style={{ padding: '8px' }}>Bob Basis</th>
                  <th style={{ padding: '8px' }}>Bob Result</th>
                  <th style={{ padding: '8px' }}>Match?</th>
                </tr>
              </thead>
              <tbody>
                {aliceBits.slice(0, 15).map((bit, i) => {
                  const match = aliceBases[i] === bobBases[i];
                  return (
                    <tr key={i} style={{ backgroundColor: match ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.05)', borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '6px' }}>{i + 1}</td>
                      <td style={{ padding: '6px', fontWeight: 600 }}>{bit}</td>
                      <td style={{ padding: '6px', fontFamily: 'var(--font-mono)' }}>{aliceBases[i]}</td>
                      <td style={{ padding: '6px', fontFamily: 'var(--font-mono)' }}>{bobBases[i]}</td>
                      <td style={{ padding: '6px', fontWeight: 600 }}>{bobResults[i]}</td>
                      <td style={{ padding: '6px', color: match ? 'var(--color-emerald)' : '#f87171', fontWeight: 600 }}>
                        {match ? 'MATCH' : 'MISMATCH'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Button variant="primary" onClick={() => setStage(3)}>
            Proceed to Sift Key (Discard Mismatched Bases) →
          </Button>
        </div>
      )}

      {/* STAGE 3: Sift the Key */}
      {stage === 3 && (
        <div style={{ backgroundColor: 'var(--cyber-surface, #121827)', border: '1px solid #25334d', borderRadius: '14px', padding: '28px' }}>
          <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '4px', backgroundColor: '#0284c7', color: '#ffffff', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '14px' }}>
            Stage 3: Public Basis Reconciliation
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc', marginBottom: '10px' }}>
            Sifted Shared Key Extracted
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.5, marginBottom: '20px' }}>
            Alice and Bob announced their basis choices over the public classical channel (never revealing the bit values). All mismatched rows were discarded, leaving {siftedIndices.length} candidate key bits.
          </p>

          <div style={{ padding: '16px', backgroundColor: 'var(--cyber-bg, #080B14)', borderRadius: '8px', border: '1px solid #334155', fontFamily: 'var(--font-mono)', fontSize: '16px', letterSpacing: '4px', color: 'var(--cyber-primary-violet, #7C5CFF)', marginBottom: '24px', overflowX: 'auto' }}>
            {siftedIndices.map((idx) => aliceBits[idx]).join('')}
          </div>

          <Button
            variant="primary"
            onClick={() => {
              computeSampleError(sampleSize);
              setStage(4);
            }}
          >
            Initiate Security Check & Eavesdropper Detection →
          </Button>
        </div>
      )}

      {/* STAGE 4: Security Alert & Error Rate Estimation */}
      {stage === 4 && (
        <div style={{ backgroundColor: 'var(--cyber-surface, #121827)', border: '1px solid #25334d', borderRadius: '14px', padding: '28px' }}>
          <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '4px', backgroundColor: 'var(--color-error)', color: '#ffffff', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '14px' }}>
            Stage 4: Security Verification
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc', marginBottom: '10px' }}>
            Error-Rate Assessment: Channel Under Inspection
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.5, marginBottom: '20px' }}>
            To verify if an eavesdropper (Eve) intercepted the quantum transmission, Alice and Bob publicly sacrifice a sample of sifted bits to calculate the Quantum Bit Error Rate (QBER).
          </p>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
              Compare Sample Bits: <strong>{sampleSize} bits</strong>
            </label>
            <input
              type="range"
              min={4}
              max={Math.min(siftedIndices.length, 16)}
              value={sampleSize}
              onChange={(e) => computeSampleError(parseInt(e.target.value, 10))}
              style={{ width: '100%', maxWidth: '300px' }}
            />
          </div>

          <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: errorRate > 10 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', border: `1px solid ${errorRate > 10 ? 'var(--color-error)' : 'var(--color-emerald)'}`, marginBottom: '28px' }}>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>Observed Quantum Error Rate (QBER):</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: errorRate > 10 ? 'var(--color-error)' : 'var(--color-emerald)', margin: '4px 0' }}>
              {errorRate}%
            </div>
            <div style={{ fontSize: '13px', color: '#cbd5e1' }}>
              {errorRate > 10
                ? 'CRITICAL ALERT: QBER exceeds theoretical threshold (~11%). An active eavesdropper is measuring photons and causing quantum state disturbance!'
                : 'QBER within safe threshold (≤11%). Natural channel noise baseline.'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px' }}>
            <button
              onClick={() => handleDecision('abort')}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '8px',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ABORT KEY (Eavesdropping Detected)
            </button>
            <button
              onClick={() => handleDecision('accept')}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '8px',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ACCEPT KEY (Proceed to Encrypt)
            </button>
          </div>
        </div>
      )}

      {/* STAGE 5: Outcome & Concept Reveal */}
      {stage === 5 && (
        <div style={{ backgroundColor: 'var(--cyber-surface, #121827)', border: '1px solid #25334d', borderRadius: '14px', padding: '32px', textAlign: 'center' }}>
          {isDecisionCorrect ? (
            <>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle2 size={36} color="#10b981" />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
                Mission Success! Correct Security Decision
              </h2>
              <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                {decision === 'abort'
                  ? 'You rightly aborted the transmission! Because an eavesdropper was measuring photons in transit, the laws of quantum mechanics (Heisenberg Uncertainty & No-Cloning Theorem) forced irreversible measurement disturbances (~25% error rate), exposing the attack before any confidential embassy data was encrypted!'
                  : `You rightly accepted the quantum key! The observed Quantum Bit Error Rate (${errorRate}%) was within the safe baseline threshold (≤11%), confirming no eavesdropper disturbed the quantum channel. The diplomatic channel is securely encrypted!`}
              </p>

              {/* Badge banner */}
              <div style={{ maxWidth: '420px', margin: '0 auto 28px', padding: '16px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
                <Award size={32} color="#10b981" />
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-emerald)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Lab Badge Awarded
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>
                    {badgeName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>+{missionXp} XP added to User Profile</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <XCircle size={36} color="#ef4444" />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
                {decision === 'accept' ? 'Diplomatic Channel Compromised' : 'Unnecessary Transmission Abort'}
              </h2>
              <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                {decision === 'accept'
                  ? `The error rate of ${errorRate}% clearly exceeded the safe threshold (≤11%). Accepting the key allowed the adversary to decrypt embassy communications.`
                  : `The error rate was only ${errorRate}%, well within the normal noise baseline (≤11%). Aborting a clean quantum channel caused an operational delay during a critical diplomatic window.`}
              </p>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
            <Button variant="primary" onClick={() => navigate('/missions')}>
              Return to Mission Hub
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setStage(1);
                setDecision(null);
                setErrorRate(0);
                setEvePresent(Math.random() < 0.5);
                setAliceBits([]);
                setAliceBases([]);
                setBobBases([]);
                setBobResults([]);
                setSiftedIndices([]);
              }}
              style={{ color: '#f8fafc', borderColor: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RotateCcw size={14} />
              <span>Retry Mission</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// ENGINE B: ENTERPRISE PQC MIGRATION DECISION SCENARIO
// -------------------------------------------------------------
interface MigrationSimulationProps {
  mission: MissionData;
  onFinished: (id: string, badgeName?: string, xp?: number) => void;
}

interface MissionChoice {
  id: string;
  text?: string;
  feedback?: string;
  consequence?: Record<string, number>;
  [key: string]: unknown;
}

const EnterpriseMigrationEngine: React.FC<MigrationSimulationProps> = ({ mission, onFinished }) => {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stages = (mission.stages as any[]) || [];
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [readiness, setReadiness] = useState(12);
  const [continuity, setContinuity] = useState(100);
  const [budget, setBudget] = useState(100);
  const [timeMonths, setTimeMonths] = useState(18);

  // Two-step decision state:
  const [selectedChoice, setSelectedChoice] = useState<MissionChoice | null>(null);
  const [isCommitted, setIsCommitted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const stage = stages[currentStageIdx];
  const hasChoices = Boolean(stage?.choices && stage.choices.length > 0);

  // STEP 1: Select / Preview (freely changeable, does not alter scores or lock cards)
  const handleSelectChoice = (choice: MissionChoice) => {
    if (isCommitted) return; // locked once committed
    setSelectedChoice(choice);
  };

  // STEP 2: Commit Decision (applies score deltas, locks cards, reveals consequence feedback)
  const handleCommitDecision = () => {
    if (!selectedChoice || isCommitted) return;
    setIsCommitted(true);

    // Apply score deltas
    const cons = selectedChoice.consequence || {};
    if (typeof cons.readiness_score === 'number') {
      setReadiness((prev) => Math.min(100, Math.max(0, prev + cons.readiness_score)));
    }
    if (typeof cons.business_continuity_score === 'number') {
      setContinuity((prev) => Math.min(100, Math.max(0, prev + cons.business_continuity_score)));
    }
    if (typeof cons.budget_remaining === 'number') {
      setBudget((prev) => Math.min(100, Math.max(0, prev + cons.budget_remaining)));
    }
    if (typeof cons.time_remaining_months === 'number') {
      setTimeMonths((prev) => Math.max(0, prev + cons.time_remaining_months));
    }
  };

  const handleNextStage = () => {
    if (currentStageIdx < stages.length - 1) {
      setCurrentStageIdx((prev) => prev + 1);
      setSelectedChoice(null);
      setIsCommitted(false);
    } else {
      setIsFinished(true);
      const badge = (mission.rewards?.badge_awarded as string) || 'Migration Commander';
      const xp = (mission.rewards?.mission_xp_awarded as number) || 100;
      onFinished(mission.mission_id, badge, xp);
    }
  };

  // Compute final outcome evaluation
  const isSuccess = readiness >= 75 && continuity >= 60;
  const isPartial = !isSuccess && readiness >= 50;

  return (
    <div>
      {/* Persistent Enterprise HUD */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          backgroundColor: 'var(--cyber-surface, #121827)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '28px',
          border: '1px solid #334155'
        }}
      >
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Quantum Readiness</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--cyber-primary-violet, #7C5CFF)' }}>{readiness}%</div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Business Continuity</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: continuity > 70 ? 'var(--color-emerald)' : 'var(--color-amber)' }}>
            {continuity}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Budget Remaining</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc' }}>{budget}%</div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Timeline Left</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: timeMonths > 6 ? 'var(--color-emerald)' : 'var(--color-error)' }}>
            {timeMonths} Months
          </div>
        </div>
      </div>

      {!isFinished && stage ? (
        <div style={{ backgroundColor: 'var(--cyber-surface, #121827)', border: '1px solid #25334d', borderRadius: '14px', padding: '28px' }}>
          <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '4px', backgroundColor: 'var(--color-amber)', color: '#ffffff', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '14px' }}>
            Stage {currentStageIdx + 1} of {stages.length}
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc', marginBottom: '12px' }}>
            {stage.narrative}
          </h2>
          <p style={{ color: 'var(--cyber-primary-violet, #7C5CFF)', fontSize: '15px', fontWeight: 600, marginBottom: '20px' }}>
            {stage.decision_prompt}
          </p>

          {/* Decision Stage with Choice Cards */}
          {hasChoices ? (
            <>
              {/* Choice Cards Container */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {stage.choices.map((choice: MissionChoice) => {
                  const isSelected = selectedChoice?.id === choice.id;

                  // Dynamic styles depending on selection & commit state
                  let border = '1px solid #334155';
                  let bg = 'var(--cyber-card, #1A1C1F)';
                  let opacity = 1;
                  let cursor = isCommitted ? 'default' : 'pointer';

                  if (isSelected) {
                    border = '2px solid var(--cyber-primary-violet, #7C5CFF)';
                    bg = isCommitted ? 'rgba(124, 92, 255, 0.22)' : 'rgba(124, 92, 255, 0.14)';
                  } else if (isCommitted) {
                    opacity = 0.45;
                    cursor = 'not-allowed';
                    border = '1px solid #1e293b';
                  }

                  return (
                    <div
                      key={choice.id}
                      onClick={() => handleSelectChoice(choice)}
                      style={{
                        padding: '16px 20px',
                        borderRadius: '10px',
                        backgroundColor: bg,
                        border,
                        opacity,
                        cursor,
                        fontSize: '14px',
                        color: '#f8fafc',
                        lineHeight: 1.5,
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 0 16px rgba(124, 92, 255, 0.2)' : 'none',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                        <span style={{ flex: 1 }}>{choice.text}</span>
                        {isSelected && !isCommitted && (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(124, 92, 255, 0.25)',
                              color: 'var(--cyber-primary-violet, #7C5CFF)',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            Selected
                          </span>
                        )}
                        {isSelected && isCommitted && (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(16, 185, 129, 0.2)',
                              color: '#10b981',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <Check size={12} /> Committed
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* STEP 1 PREVIEW & COMMIT ACTION BAR (Before Commit) */}
              {!isCommitted && (
                <div
                  style={{
                    padding: '16px 20px',
                    borderRadius: '10px',
                    backgroundColor: selectedChoice ? 'rgba(124, 92, 255, 0.08)' : 'rgba(0,0,0,0.2)',
                    border: `1px dashed ${selectedChoice ? 'var(--cyber-primary-violet, #7C5CFF)' : '#334155'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '14px',
                    marginBottom: '20px'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: selectedChoice ? '#f8fafc' : '#94a3b8' }}>
                      {selectedChoice
                        ? 'Strategic approach selected. You can switch options above, or commit this decision.'
                        : 'Select an architectural option above to preview and commit your decision.'}
                    </div>
                    {selectedChoice && (
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                        Commit to apply readiness, continuity, budget, and timeline impacts.
                      </div>
                    )}
                  </div>

                  <Button
                    variant="primary"
                    disabled={!selectedChoice}
                    onClick={handleCommitDecision}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '0 24px',
                      opacity: selectedChoice ? 1 : 0.5,
                      cursor: selectedChoice ? 'pointer' : 'not-allowed'
                    }}
                  >
                    <ShieldCheck size={16} />
                    <span>Commit Decision</span>
                  </Button>
                </div>
              )}

              {/* STEP 2 CONSEQUENCE FEEDBACK & ADVANCEMENT (After Commit) */}
              {isCommitted && selectedChoice && (
                <div>
                  <div
                    style={{
                      padding: '18px 20px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(56, 189, 248, 0.08)',
                      border: '1px solid #0284c7',
                      marginBottom: '24px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <CheckCircle2 size={16} color="#38bdf8" />
                      <strong style={{ fontSize: '13px', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Consequence Analysis & Executive Impact:
                      </strong>
                    </div>
                    <p style={{ fontSize: '14px', color: '#e2e8f0', lineHeight: 1.6, margin: 0 }}>
                      {selectedChoice.feedback}
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    onClick={handleNextStage}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <span>{currentStageIdx < stages.length - 1 ? 'Advance to Next Stage' : 'View Final Report'}</span>
                    <ArrowRight size={16} />
                  </Button>
                </div>
              )}
            </>
          ) : (
            /* Auto-Evaluation Stage (e.g. Stage 5 Board Report) */
            <div>
              <div
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  backgroundColor: isSuccess
                    ? 'rgba(16, 185, 129, 0.1)'
                    : isPartial
                    ? 'rgba(245, 158, 11, 0.1)'
                    : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${isSuccess ? '#10b981' : isPartial ? '#f59e0b' : '#ef4444'}`,
                  marginBottom: '24px'
                }}
              >
                <div style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 700, color: isSuccess ? '#10b981' : isPartial ? '#f59e0b' : '#ef4444', marginBottom: '6px' }}>
                  {isSuccess ? 'Full Migration Approved' : isPartial ? 'Partial Success — On Track' : 'Migration At Risk'}
                </div>
                <p style={{ fontSize: '15px', color: '#f8fafc', lineHeight: 1.6, margin: 0 }}>
                  {isSuccess
                    ? 'SUCCESS — Full Migration Complete. Your board approves the final report; the organization is genuinely quantum-ready and didn\'t sacrifice operational stability to get there.'
                    : isPartial
                    ? 'PARTIAL SUCCESS — Migration In Progress, On Track. You\'ve made real, defensible progress but haven\'t finished — a realistic and common outcome for a first migration cycle.'
                    : 'AT RISK — The board is not satisfied. Rushed or improperly sequenced decisions compromised either cryptographic readiness or business continuity.'}
                </p>
              </div>

              <Button
                variant="primary"
                onClick={handleNextStage}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <span>View Migration Debrief & Credentials</span>
                <ArrowRight size={16} />
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Debrief & Completion */
        <div style={{ backgroundColor: 'var(--cyber-surface, #121827)', border: '1px solid #25334d', borderRadius: '14px', padding: '36px 28px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#10b981' }}>
            <Award size={36} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
            Enterprise Migration Mandate Concluded
          </h2>
          <p style={{ color: '#94a3b8', maxWidth: '640px', margin: '0 auto 24px', lineHeight: 1.6 }}>
            Final Readiness: <strong>{readiness}%</strong> · Business Continuity: <strong>{continuity}%</strong> · Budget Remaining: <strong>{budget}%</strong> · Timeline: <strong>{timeMonths} Months</strong>. You navigated the multi-phase sequence from discovery through hybrid rollout.
          </p>

          {/* Badge Banner */}
          <div style={{ maxWidth: '420px', margin: '0 auto 32px', padding: '16px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
            <Award size={32} color="#10b981" />
            <div>
              <div style={{ fontSize: '11px', color: 'var(--color-emerald)', fontWeight: 700, textTransform: 'uppercase' }}>
                Mission Badge Awarded
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>
                Migration Commander
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>+100 XP added to User Profile</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <Button variant="primary" onClick={() => navigate('/missions')}>
              Return to Mission Hub
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCurrentStageIdx(0);
                setSelectedChoice(null);
                setIsCommitted(false);
                setReadiness(12);
                setContinuity(100);
                setBudget(100);
                setTimeMonths(18);
                setIsFinished(false);
              }}
              style={{ color: '#f8fafc', borderColor: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RotateCcw size={14} />
              <span>Replay Migration Scenario</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
