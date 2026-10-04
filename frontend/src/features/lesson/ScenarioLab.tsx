import React, { useState } from 'react';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';
import type { EscapeRoomScenario, EscapeScenarioChoice } from '@/data/escapeRoomData';

const shuffled = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

/** A branching practice scenario shown inside the lesson it belongs to. */
export const ScenarioLab: React.FC<{ scenario: EscapeRoomScenario }> = ({ scenario }) => {
  const { completedEscapes, completeEscape } = useCurriculumStore();
  const [picked, setPicked] = useState<EscapeScenarioChoice | null>(null);
  // A new order on every retry, so the answer cannot be learned by position.
  const [choices, setChoices] = useState(() => shuffled(scenario.choices));
  const [solvedBefore] = useState(() => completedEscapes.includes(scenario.id));

  const choose = (choice: EscapeScenarioChoice) => {
    if (picked) return;
    setPicked(choice);
    if (choice.correct) completeEscape(scenario.id, scenario.badge_awarded, scenario.mission_xp_awarded);
  };

  return (
    <section className="ls-lab" aria-labelledby={`lab-${scenario.id}`}>
      <div className="ls-lab-head">
        <span className="ls-eyebrow">PRACTICE LAB · {scenario.difficulty.replace('_', ' ').toUpperCase()}</span>
        {(solvedBefore || picked?.correct) && <span className="ls-chip ls-chip--done">Solved</span>}
      </div>
      <h2 id={`lab-${scenario.id}`} className="ls-card-title">
        {scenario.title}
      </h2>
      <p className="ls-lab-setup">{scenario.setup}</p>
      <p className="ls-lab-prompt">{scenario.prompt}</p>
      <div className="ls-lab-choices" role="group" aria-label="Answer choices">
        {choices.map((c) => {
          const isPicked = picked?.id === c.id;
          const state = isPicked ? (c.correct ? 'ls-lab-choice--right' : 'ls-lab-choice--wrong') : '';
          return (
            <button
              key={c.id}
              type="button"
              className={`ls-lab-choice ${state}`}
              onClick={() => choose(c)}
              disabled={picked !== null && !isPicked}
              aria-pressed={isPicked}
            >
              {c.text}
            </button>
          );
        })}
      </div>
      {picked && (
        <div className={picked.correct ? 'ls-callout ls-callout--tip' : 'ls-callout ls-callout--danger'} role="status">
          <strong className="ls-callout-title">{picked.correct ? 'Correct' : 'Not quite'}</strong>
          <p>{picked.feedback}</p>
          {picked.correct ? (
            <p className="ls-fineprint">
              Badge: {scenario.badge_awarded} · +{scenario.mission_xp_awarded} XP{solvedBefore ? ' (already earned)' : ''}
            </p>
          ) : (
            <button
              type="button"
              className="ls-btn ls-btn--secondary"
              onClick={() => {
                setPicked(null);
                setChoices(shuffled(scenario.choices));
              }}
            >
              Try again
            </button>
          )}
        </div>
      )}
    </section>
  );
};
