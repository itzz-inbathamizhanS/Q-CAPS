import React from 'react';
import { Intervention } from './interventionTypes';

export const InterventionPlan: React.FC<{ intervention: Intervention }> = ({ intervention }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-5 border border-indigo-500/30 shadow-md">
      <h3 className="text-lg font-bold text-indigo-400 flex items-center gap-2 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
        Assigned Intervention Plan
      </h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
          <span className="text-gray-400 text-sm">Action Type</span>
          <span className="text-gray-100 font-medium">{intervention.intervention_type}</span>
        </div>
        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
          <span className="text-gray-400 text-sm">Target Module</span>
          <span className="text-gray-100 font-medium">{intervention.module_id || 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
          <span className="text-gray-400 text-sm">Lab Template</span>
          <span className="text-gray-100 font-medium">{intervention.lab_template_id || 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center pb-2">
          <span className="text-gray-400 text-sm">Required Score</span>
          <span className="text-indigo-400 font-bold">{(intervention.minimum_score * 100).toFixed(0)}%</span>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-700">
        <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors font-medium">
          Start Remediation Lab
        </button>
      </div>
    </div>
  );
};
