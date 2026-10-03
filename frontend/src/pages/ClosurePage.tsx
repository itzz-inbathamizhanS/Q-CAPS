import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { EvidenceCard } from '@/features/evidence/EvidenceCard';
import { ClosureTimeline } from '@/features/closure/ClosureTimeline';
import { InterventionPlan } from '@/features/interventions/InterventionPlan';
import { CapabilityState } from '@/features/capabilities/CapabilityState';
import { evidenceService } from '@/features/evidence/evidenceService';
import { interventionService } from '@/features/interventions/interventionService';
import { capabilityService } from '@/features/capabilities/capabilityService';
import { closureService } from '@/features/closure/closureService';
import { useAuthStore } from '@/features/auth/authStore';
import type { Evidence } from '@/features/evidence/evidenceTypes';
import type { Intervention } from '@/features/interventions/interventionTypes';
import type { LearnerCapability } from '@/features/capabilities/capabilityTypes';

type Loaded<T> = { status: 'loading' } | { status: 'empty' } | { status: 'ready'; value: T };

const Panel: React.FC<{ title: string; state: Loaded<unknown>; children: React.ReactNode }> = ({ title, state, children }) => {
  if (state.status === 'loading') {
    return <div role="status" aria-label={`Loading ${title}`} className="h-40 bg-gray-800 animate-pulse rounded-lg" />;
  }
  if (state.status === 'empty') {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-6">
        <h3 className="text-sm font-semibold text-gray-200">{title}</h3>
        <p className="mt-2 text-sm text-gray-400">No verified result available.</p>
      </div>
    );
  }
  return <>{children}</>;
};

export const ClosurePage: React.FC = () => {
  const { findingId } = useParams<{ findingId: string }>();
  const userId = useAuthStore((s) => s.userId);

  const [evidence, setEvidence] = useState<Loaded<Evidence>>({ status: 'loading' });
  const [intervention, setIntervention] = useState<Loaded<Intervention>>({ status: 'loading' });
  const [capability, setCapability] = useState<Loaded<LearnerCapability>>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    const ifLive = <T,>(set: (v: Loaded<T>) => void, value: T | null | undefined) => {
      if (!cancelled) set(value ? { status: 'ready', value } : { status: 'empty' });
    };
    setEvidence({ status: 'loading' });
    setIntervention({ status: 'loading' });
    setCapability({ status: 'loading' });

    if (!findingId) {
      setEvidence({ status: 'empty' });
      setIntervention({ status: 'empty' });
    } else {
      closureService.getFinding(findingId).then(async (finding) => {
        ifLive(setEvidence, finding?.evidence_id ? await evidenceService.getEvidence(finding.evidence_id) : null);
      });
      interventionService.getForFinding(findingId).then((list) => ifLive(setIntervention, list[0]));
    }

    if (userId == null) setCapability({ status: 'empty' });
    else capabilityService.getUserCapabilities(userId).then((caps) => ifLive(setCapability, caps[0]));

    return () => {
      cancelled = true;
    };
  }, [findingId, userId]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="mb-8 border-b border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">Closure Verification</h1>
        <p className="text-gray-400 mt-2">Track the technical remediation and competency closure for this cryptographic finding.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Panel title="Evidence" state={evidence}>
            {evidence.status === 'ready' && <EvidenceCard evidence={evidence.value} />}
          </Panel>
          <Panel title="Intervention plan" state={intervention}>
            {intervention.status === 'ready' && <InterventionPlan intervention={intervention.value} />}
          </Panel>
        </div>

        <div className="space-y-8">
          <Panel title="Capability" state={capability}>
            {capability.status === 'ready' && <CapabilityState capability={capability.value} />}
          </Panel>
          {findingId && <ClosureTimeline findingId={findingId} />}
        </div>
      </div>
    </div>
  );
};
