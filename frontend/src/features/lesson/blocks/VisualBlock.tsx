import React from 'react';
import type { VisualBlockData } from '../lessonTypes';
import { VISUALS } from './visualRegistry';

/** Known kinds render their component. A visual that is only described (not built yet)
 *  is hidden from learners, because its text is a design note for authors, not lesson
 *  content. The admin preview shows it so authors can see what is pending. */
export const VisualBlock: React.FC<{ block: VisualBlockData; preview?: boolean }> = ({ block, preview = false }) => {
  const Component = VISUALS[block.kind];
  if (Component) return <Component block={block} />;
  if (!preview) return null;

  return (
    <section className="ls-card ls-placeholder" aria-label={block.title ?? 'Interactive visual'}>
      <div className="ls-tls-head">
        <h2 className="ls-card-title">{block.title ?? 'Interactive visual (not built)'}</h2>
        <span className="ls-badge ls-badge--neutral">HIDDEN FROM LEARNERS</span>
      </div>
      <p className="ls-muted">{block.description}</p>
      <p className="ls-fineprint">
        No component exists for the kind "{block.kind}", so learners do not see this block. Build the component or
        remove the block.
      </p>
    </section>
  );
};
