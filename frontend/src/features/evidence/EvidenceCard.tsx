import React from 'react';
import { Evidence } from './evidenceTypes';

export const EvidenceCard: React.FC<{ evidence: Evidence }> = ({ evidence }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 shadow-md">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          Cryptographic Evidence
        </h3>
        <div className="text-right">
          <span className="text-xs font-mono text-gray-400 block">Hash: {evidence.payload_hash.substring(0, 16)}...</span>
          <span className="text-xs text-gray-500 block">Observed: {new Date(evidence.observed_at).toLocaleString()}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm mt-4 bg-gray-900/50 p-4 rounded-md">
        <div>
          <span className="block text-gray-500 font-medium">Type</span>
          <span className="block text-gray-200">{evidence.evidence_type}</span>
        </div>
        <div>
          <span className="block text-gray-500 font-medium">Confidence</span>
          <span className="block text-gray-200">{(evidence.confidence * 100).toFixed(1)}%</span>
        </div>
        <div className="col-span-2">
          <span className="block text-gray-500 font-medium mb-1">Normalized Payload</span>
          <pre className="bg-gray-950 p-3 rounded border border-gray-800 text-green-400 text-xs overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(evidence.normalized_payload, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
