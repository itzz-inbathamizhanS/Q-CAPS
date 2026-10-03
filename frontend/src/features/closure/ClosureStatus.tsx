import React from 'react';

export const ClosureStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let colorClass = "bg-gray-700 text-gray-300";
  
  switch(status) {
    case 'OPEN':
      colorClass = "bg-red-500/20 text-red-400 border border-red-500/50";
      break;
    case 'EVIDENCE_CONFIRMED':
    case 'COMPETENCY_REQUIRED':
    case 'INTERVENTION_ASSIGNED':
      colorClass = "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50";
      break;
    case 'LEARNER_ATTEMPT':
    case 'TECHNICAL_VERIFICATION':
      colorClass = "bg-blue-500/20 text-blue-400 border border-blue-500/50";
      break;
    case 'CLOSED':
      colorClass = "bg-green-500/20 text-green-400 border border-green-500/50";
      break;
    case 'PARTIALLY_CLOSED':
      colorClass = "bg-orange-500/20 text-orange-400 border border-orange-500/50";
      break;
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider ${colorClass}`}>
      {status.replace('_', ' ')}
    </span>
  );
};
