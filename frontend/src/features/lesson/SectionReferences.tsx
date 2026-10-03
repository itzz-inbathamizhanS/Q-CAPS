import React from 'react';
import type { LessonSource, NeedsVerification } from './lessonTypes';

const edition = (s: LessonSource) =>
  [s.edition, s.year].filter((v) => v !== undefined && v !== null && v !== '').join(', ');

/** Where the lesson comes from. Rendered under the section content; nothing when there are no sources. */
export const SectionReferences: React.FC<{
  sources?: LessonSource[];
  needsVerification?: NeedsVerification | null;
}> = ({ sources, needsVerification }) => {
  if (!sources?.length) return null;
  return (
    <section className="ls-references" aria-labelledby="ls-references-title">
      <h2 id="ls-references-title" className="ls-references-title">
        References
      </h2>
      <ul className="ls-references-list">
        {sources.map((s) => (
          <li key={`${s.book_id}-${s.locator}`}>
            <span className="ls-references-book">{s.title}</span>, {s.authors}
            {edition(s) ? ` (${edition(s)})` : ''}. {s.locator}.
            {s.note ? <span className="ls-muted"> {s.note}</span> : null}
          </li>
        ))}
      </ul>
      {needsVerification && (
        <p className="ls-references-verify" role="note">
          <strong>Check before relying on this.</strong> {needsVerification.reason}
          {needsVerification.checked_on ? ` Last checked ${needsVerification.checked_on}.` : ''}
        </p>
      )}
    </section>
  );
};
