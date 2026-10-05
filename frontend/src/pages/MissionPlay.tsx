// src/pages/MissionPlay.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Award,
  RotateCcw
} from 'lucide-react';
import { missionsData, MissionData } from '@/data/missionsData';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';
import { Button } from '@/components/ui/Button';
import { DecisionMissionEngine } from '@/features/missions/DecisionMissionEngine';
import { decideBB84, startBB84Run, type BB84Decision } from '@/services/activityApi';

export const MissionPlay: React.FC = () => {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();

  const mission = missionsData.find((m) => m.mission_id === missionId) || missionsData[0];

  // Exit dialog state
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Missions belong to a lesson section: leaving returns the learner there.
  const backTo = mission.section_id ? `/learning/${mission.linked_module_id}/${mission.section_id}` : '/curriculum';
  const handleExit = () => {
    navigate(backTo);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text-primary)',
        zIndex: 1000,
        overflowY: 'auto',
        fontFamily: 'var(--font-sans)'
      }}
    >
      {/* Masthead */}
      <div
        style={{
          borderBottom: '1px solid var(--color-surface-container)',
          backgroundColor: 'var(--color-surface)',
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
          <Button variant="outline" size="sm" leftIcon={<X size={14} />} onClick={() => setShowExitConfirm(true)}>
            Abort mission
          </Button>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              SIMULATION - scripted scenario, not real data
            </span>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {mission.title}
            </div>
          </div>
        </div>

        <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
          {mission.mission_id}
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--color-overlay)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Abort mission?"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '400px',
              textAlign: 'center'
            }}
          >
            <AlertTriangle size={36} color="var(--color-warning)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              Abort Mission?
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
              Your progress in this simulation attempt will not be recorded.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <Button variant="outline" onClick={() => setShowExitConfirm(false)}>
                Continue mission
              </Button>
              <Button variant="danger" onClick={handleExit}>
                Confirm exit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mission Content Router: Simulation (BB84) vs Decision Scenario */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 20px 80px' }}>
        {mission.type === 'simulation' ? (
          <BB84SimulationEngine key={mission.mission_id} mission={mission} backTo={backTo} />
        ) : (
          <DecisionMissionEngine key={mission.mission_id} mission={mission} onBack={handleExit} backLabel="Back to the lesson" />
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
  backTo: string;
}

const BB84SimulationEngine: React.FC<SimulationProps> = ({ mission, backTo }) => {
  const navigate = useNavigate();
  const { recordActivityAward } = useCurriculumStore();
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
  // The server generates the transmission and keeps the eavesdropper flag secret until the decision is made.
  const [runId, setRunId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<BB84Decision | null>(null);


  // Stage 1: Run transmission
  const startTransmission = async () => {
    if (busy) return;
    setBusy(true);
    setApiError(null);
    try {
      const run = await startBB84Run(mission.mission_id, photonCount);
      setRunId(run.run_id);
      setAliceBits(run.alice_bits);
      setAliceBases(run.alice_bases);
      setBobBases(run.bob_bases);
      setBobResults(run.bob_results);
      setSiftedIndices(run.sifted);
      setStage(2);
    } catch {
      setApiError('Could not start the transmission on the server. Check your connection and retry.');
    } finally {
      setBusy(false);
    }
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

  const handleDecision = async (choice: 'accept' | 'abort') => {
    if (!runId || busy) return;
    setBusy(true);
    setApiError(null);
    try {
      const r = await decideBB84(runId, sampleSize, choice);
      setDecision(choice);
      setErrorRate(r.error_rate);
      setOutcome(r);
      if (r.awarded) recordActivityAward('mission', mission.mission_id, r.awarded);
      setStage(5);
    } catch {
      setApiError('The server could not record your decision. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const isDecisionCorrect = outcome?.correct === true;

  return (
    <div>
      {/* Live HUD */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '28px',
          border: '1px solid var(--color-border)'
        }}
      >
        <div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Quantum Channel</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)' }}>
            {stage === 1 ? 'Idle' : 'Active (Single Photon)'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Transmitted Photons</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {aliceBits.length}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Sifted Key Size</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-success)' }}>
            {siftedIndices.length} bits
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Sample Error Rate</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: errorRate > 10 ? 'var(--color-danger)' : 'var(--color-success)' }}>
            {stage >= 4 ? `${errorRate}%` : 'Unassessed'}
          </div>
        </div>
      </div>

      {apiError && (
        <div role="alert" style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', marginBottom: '16px' }}>
          {apiError}
        </div>
      )}

      {/* STAGE 1: Briefing & Transmission Setup */}
      {stage === 1 && (
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '28px' }}>
          <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '4px', backgroundColor: 'var(--color-info-bg)', color: 'var(--color-info)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '14px' }}>
            Stage 1: Transmission Setup
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px' }}>
            Diplomatic Key Exchange Window Active
          </h2>
          <p style={{ color: 'var(--color-text-on-surface-variant)', lineHeight: 1.6, marginBottom: '20px' }}>
            {mission.objective} You will prepare polarized photons with random bits and random rectilinear (+) or diagonal (x) bases. Bob will measure each photon in independently selected bases.
          </p>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>
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

          <Button variant="primary" onClick={() => void startTransmission()} disabled={busy}>
            Begin Photon Transmission →
          </Button>
        </div>
      )}

      {/* STAGE 2: Measure & Notice */}
      {stage === 2 && (
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '28px' }}>
          <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '4px', backgroundColor: 'var(--color-info-bg)', color: 'var(--color-info)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '14px' }}>
            Stage 2: Measurement Telemetry
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '10px' }}>
            Transmission Complete — Inspecting Measurement Results
          </h2>
          <p style={{ color: 'var(--color-text-on-surface-variant)', fontSize: '14px', marginBottom: '20px', lineHeight: 1.5 }}>
            Notice that when Alice and Bob choose <strong>matching bases</strong> (highlighted in teal), Bob's result correlates with Alice's bit. When bases mismatch (red), quantum mechanics forces a random 50/50 collapse!
          </p>

          {/* Telemetry Table */}
          <div style={{ maxHeight: '260px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: '8px', marginBottom: '24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'center' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-surface-low)', color: 'var(--color-text-secondary)' }}>
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
                    <tr key={i} style={{ backgroundColor: match ? 'var(--color-success-bg)' : 'var(--color-danger-bg)', borderBottom: '1px solid var(--color-surface-container)' }}>
                      <td style={{ padding: '6px' }}>{i + 1}</td>
                      <td style={{ padding: '6px', fontWeight: 600 }}>{bit}</td>
                      <td style={{ padding: '6px', fontFamily: 'var(--font-mono)' }}>{aliceBases[i]}</td>
                      <td style={{ padding: '6px', fontFamily: 'var(--font-mono)' }}>{bobBases[i]}</td>
                      <td style={{ padding: '6px', fontWeight: 600 }}>{bobResults[i]}</td>
                      <td style={{ padding: '6px', color: match ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600 }}>
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
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '28px' }}>
          <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '4px', backgroundColor: 'var(--color-info-bg)', color: 'var(--color-info)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '14px' }}>
            Stage 3: Public Basis Reconciliation
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '10px' }}>
            Sifted Shared Key Extracted
          </h2>
          <p style={{ color: 'var(--color-text-on-surface-variant)', fontSize: '14px', lineHeight: 1.5, marginBottom: '20px' }}>
            Alice and Bob announced their basis choices over the public classical channel (never revealing the bit values). All mismatched rows were discarded, leaving {siftedIndices.length} candidate key bits.
          </p>

          <div style={{ padding: '16px', backgroundColor: 'var(--color-bg)', borderRadius: '8px', border: '1px solid var(--color-border)', fontFamily: 'var(--font-mono)', fontSize: '16px', letterSpacing: '4px', color: 'var(--color-primary)', marginBottom: '24px', overflowX: 'auto' }}>
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
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '28px' }}>
          <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '4px', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '14px' }}>
            Stage 4: Security Verification
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '10px' }}>
            Error-Rate Assessment: Channel Under Inspection
          </h2>
          <p style={{ color: 'var(--color-text-on-surface-variant)', fontSize: '14px', lineHeight: 1.5, marginBottom: '20px' }}>
            To verify if an eavesdropper (Eve) intercepted the quantum transmission, Alice and Bob publicly sacrifice a sample of sifted bits to calculate the Quantum Bit Error Rate (QBER).
          </p>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>
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

          <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: errorRate > 10 ? 'var(--color-danger-bg)' : 'var(--color-success-bg)', border: `1px solid ${errorRate > 10 ? 'var(--color-danger)' : 'var(--color-success)'}`, marginBottom: '28px' }}>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Observed Quantum Error Rate (QBER):</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: errorRate > 10 ? 'var(--color-danger)' : 'var(--color-success)', margin: '4px 0' }}>
              {errorRate}%
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-on-surface-variant)' }}>
              {errorRate > 10
                ? 'CRITICAL ALERT: QBER exceeds theoretical threshold (~11%). An active eavesdropper is measuring photons and causing quantum state disturbance!'
                : 'QBER within safe threshold (≤11%). Natural channel noise baseline.'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px' }}>
            <Button variant="danger" size="lg" fullWidth onClick={() => void handleDecision('abort')}>
              Abort key (eavesdropping detected)
            </Button>
            <Button variant="success" size="lg" fullWidth onClick={() => void handleDecision('accept')}>
              Accept key (proceed to encrypt)
            </Button>
          </div>
        </div>
      )}

      {/* STAGE 5: Outcome & Concept Reveal */}
      {stage === 5 && (
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '32px', textAlign: 'center' }}>
          {isDecisionCorrect ? (
            <>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-success-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle2 size={36} color="var(--color-success)" />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                Mission Success! Correct Security Decision
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                {decision === 'abort'
                  ? 'You rightly aborted the transmission! Because an eavesdropper was measuring photons in transit, the laws of quantum mechanics (Heisenberg Uncertainty & No-Cloning Theorem) forced irreversible measurement disturbances (~25% error rate), exposing the attack before any confidential embassy data was encrypted!'
                  : `You rightly accepted the quantum key! The observed Quantum Bit Error Rate (${errorRate}%) was within the safe baseline threshold (≤11%), confirming no eavesdropper disturbed the quantum channel. The diplomatic channel is securely encrypted!`}
              </p>

              {/* Badge banner */}
              <div style={{ maxWidth: '420px', margin: '0 auto 28px', padding: '16px', borderRadius: '10px', backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-success)', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
                <Award size={32} color="var(--color-success)" />
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Lab Badge Awarded
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {outcome?.awarded?.badge ?? (mission.rewards?.badge_awarded as string)}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    {outcome?.awarded ? `+${outcome.awarded.xp} XP recorded by the server` : 'Already earned: awarded the first time'}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-danger-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <XCircle size={36} color="var(--color-danger)" />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                {decision === 'accept' ? 'Diplomatic Channel Compromised' : 'Unnecessary Transmission Abort'}
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                {decision === 'accept'
                  ? `The error rate of ${errorRate}% clearly exceeded the safe threshold (≤11%). Accepting the key allowed the adversary to decrypt embassy communications.`
                  : `The error rate was only ${errorRate}%, well within the normal noise baseline (≤11%). Aborting a clean quantum channel caused an operational delay during a critical diplomatic window.`}
              </p>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
            <Button variant="primary" onClick={() => navigate(backTo)}>
              Back to the lesson
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setStage(1);
                setDecision(null);
                setErrorRate(0);
                setRunId(null);
                setOutcome(null);
                setAliceBits([]);
                setAliceBases([]);
                setBobBases([]);
                setBobResults([]);
                setSiftedIndices([]);
              }}
              style={{ color: 'var(--color-text-primary)', borderColor: 'var(--color-outline)', display: 'flex', alignItems: 'center', gap: '6px' }}
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
