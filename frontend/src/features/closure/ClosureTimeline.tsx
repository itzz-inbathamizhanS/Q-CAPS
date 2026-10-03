import React, { useEffect, useState } from 'react';
import { ClosureEvent } from './closureTypes';
import { closureService } from './closureService';

export const ClosureTimeline: React.FC<{ findingId: string }> = ({ findingId }) => {
  const [closures, setClosures] = useState<ClosureEvent[]>([]);

  useEffect(() => {
    if (findingId) {
      closureService.getClosuresForFinding(findingId).then(setClosures);
    }
  }, [findingId]);

  if (closures.length === 0) {
    return <div className="text-gray-400 p-4">No closure events recorded yet.</div>;
  }

  return (
    <div className="space-y-4 p-4 border border-gray-800 rounded-lg bg-gray-900/50">
      <h3 className="text-lg font-semibold text-blue-400">Verification & Closure Timeline</h3>
      <div className="relative border-l border-gray-700 ml-3 space-y-6">
        {closures.map((event, idx) => (
          <div key={event.id || idx} className="pl-6 relative">
            <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[6.5px] top-1.5 ring-4 ring-gray-900"></div>
            <p className="text-sm text-gray-400">{new Date(event.created_at).toLocaleString()}</p>
            <p className="text-md font-medium text-white">{event.previous_state} → {event.new_state}</p>
            <p className="text-sm text-gray-300 mt-1">{event.reason}</p>
            <p className="text-xs text-gray-500 font-mono mt-1">Hash: {event.event_hash?.substring(0, 12)}...</p>
          </div>
        ))}
      </div>
    </div>
  );
};
