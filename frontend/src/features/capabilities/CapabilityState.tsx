import React from 'react';
import { LearnerCapability } from './capabilityTypes';

/** A score as a percentage, or "No evidence" when the estimator had none (null is not zero). */
const pct = (v: number | null) => (v == null ? 'No evidence' : `${(v * 100).toFixed(0)}%`);

export const CapabilityState: React.FC<{ capability: LearnerCapability }> = ({ capability }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-5 border border-purple-500/30 shadow-md">
      <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        Capability State{capability.competency_code ? `: ${capability.competency_code}` : ''}
      </h3>
      <p className="text-sm text-gray-300 mb-4">
        Level: <strong>{capability.level ?? 'Unknown'}</strong>
        {capability.evidence_count != null && ` (${capability.evidence_count} pieces of evidence)`}
      </p>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-900 rounded">
          <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Knowledge</span>
          <span className="text-xl font-semibold text-gray-200">{pct(capability.knowledge_score)}</span>
        </div>
        <div className="text-center p-3 bg-gray-900 rounded">
          <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Procedural</span>
          <span className="text-xl font-semibold text-gray-200">{pct(capability.procedural_score)}</span>
        </div>
        <div className="text-center p-3 bg-gray-900 rounded border border-purple-500/50">
          <span className="block text-xs text-purple-400/80 uppercase tracking-wider mb-1">Operational</span>
          <span className="text-xl font-bold text-purple-400">{pct(capability.operational_score)}</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center text-sm text-gray-400 px-2">
        <span>Model version: {capability.model_version ?? 'n/a'}</span>
        <span>{capability.freshness === 0 ? 'Evidence is stale' : capability.last_evidence_at ? `Last evidence: ${new Date(capability.last_evidence_at).toLocaleDateString()}` : 'No evidence yet'}</span>
      </div>
    </div>
  );
};
