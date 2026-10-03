import React from 'react';
import { LearnerCapability } from './capabilityTypes';

export const CapabilityState: React.FC<{ capability: LearnerCapability }> = ({ capability }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-5 border border-purple-500/30 shadow-md">
      <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        Capability State
      </h3>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-900 rounded">
          <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Knowledge</span>
          <span className="text-xl font-semibold text-gray-200">{(capability.knowledge_score * 100).toFixed(0)}%</span>
        </div>
        <div className="text-center p-3 bg-gray-900 rounded">
          <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Procedural</span>
          <span className="text-xl font-semibold text-gray-200">{(capability.procedural_score * 100).toFixed(0)}%</span>
        </div>
        <div className="text-center p-3 bg-gray-900 rounded border border-purple-500/50">
          <span className="block text-xs text-purple-400/80 uppercase tracking-wider mb-1">Operational</span>
          <span className="text-xl font-bold text-purple-400">{(capability.operational_score * 100).toFixed(0)}%</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center text-sm text-gray-400 px-2">
        <span>Confidence: {(capability.confidence * 100).toFixed(0)}%</span>
        <span>Freshness: {(capability.freshness * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
};
