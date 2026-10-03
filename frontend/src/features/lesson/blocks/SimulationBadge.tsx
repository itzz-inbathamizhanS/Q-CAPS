import React from 'react';

/** Required label for any visual that shows scripted behaviour instead of real data. */
export const SimulationBadge: React.FC = () => (
  <span className="ls-badge ls-badge--simulation" title="Scripted illustration, not real data or traffic">
    SIMULATION
  </span>
);
