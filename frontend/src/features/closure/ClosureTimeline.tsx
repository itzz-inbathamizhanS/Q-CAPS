import React from 'react';
import { ClosureEvent } from './closureTypes';

/** Hash-chained closure events of one finding, oldest first. */
export const ClosureTimeline: React.FC<{ events: ClosureEvent[] }> = ({ events }) => {
  if (events.length === 0) {
    return <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>No closure events recorded yet.</p>;
  }
  return (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0, borderLeft: '2px solid var(--color-border)' }}>
      {events.map((event) => (
        <li key={event.id} style={{ padding: '0 0 16px 16px' }}>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)' }}>{new Date(event.created_at).toLocaleString()}</p>
          <p style={{ margin: '2px 0', fontWeight: 600 }}>{event.previous_state} → {event.new_state}</p>
          <p style={{ margin: 0, fontSize: 14 }}>{event.reason}</p>
          <p style={{ margin: '2px 0 0', fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
            Hash {event.event_hash.substring(0, 12)}…
          </p>
        </li>
      ))}
    </ol>
  );
};
