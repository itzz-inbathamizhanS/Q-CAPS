import React, { useState } from 'react';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';
import type { EscapeRoomScenario, EscapeScenarioChoice } from '@/data/escapeRoomData';
import { answerLab, type LabAnswerResult } from '@/services/activityApi';

const shuffled = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const errorText = (e: unknown) =>
  e instanceof Error && e.message.includes('429') ? 'The lab is locked for a few seconds after a wrong answer. Read the feedback, then try again.' : 'Could not reach the server. Your answer was not recorded; try again.';

/** A branching practice scenario shown inside the lesson it belongs to. The server grades the answer and awards XP and the badge. */
export const ScenarioLab: React.FC<{ scenario: EscapeRoomScenario }> = ({ scenario }) => {
  const { completedEscapes, recordActivityAward } = useCurriculumStore();
  const [choices, setChoices] = useState(() => shuffled(scenario.choices));
  const [picked, setPicked] = useState<EscapeScenarioChoice | null>(null);
  const [result, setResult] = useState<LabAnswerResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const solved = completedEscapes.includes(scenario.id);

  const choose = async (choice: EscapeScenarioChoice) => {
    if (busy || result) return;
    setBusy(true);
    setError(null);
    setPicked(choice);
    try {
      const r = await answerLab(scenario.id, choice.id);
      setResult(r);
      if (r.awarded) recordActivityAward('lab', scenario.id, r.awarded);
    } catch (e) {
      setPicked(null);
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  const retry = () => {
    setResult(null);
    setPicked(null);
    setChoices(shuffled(scenario.choices));
  };

  return (
    <section className="ls-lab" aria-labelledby={`lab-${scenario.id}`}>
      <div className="ls-lab-head">
        <span className="ls-eyebrow">PRACTICE LAB · {scenario.difficulty.replace('_', ' ').toUpperCase()}</span>
        {(solved || result?.correct) && <span className="ls-chip ls-chip--done">Solved</span>}
      </div>
      <h2 id={`lab-${scenario.id}`} className="ls-card-title">
        {scenario.title}
      </h2>
      <p className="ls-lab-setup">{scenario.setup}</p>
      <p className="ls-lab-prompt">{scenario.prompt}</p>
      <div className="ls-lab-choices" role="group" aria-label="Answer choices">
        {choices.map((c) => {
          const isPicked = picked?.id === c.id;
          const state = isPicked && result ? (result.correct ? 'ls-lab-choice--right' : 'ls-lab-choice--wrong') : '';
          return (
            <button
              key={c.id}
              type="button"
              className={`ls-lab-choice ${state}`}
              onClick={() => void choose(c)}
              disabled={busy || (result !== null && !isPicked)}
              aria-pressed={isPicked}
            >
              {c.text}
            </button>
          );
        })}
      </div>
      {error && (
        <p className="ls-complete-hint" role="alert">
          {error}
        </p>
      )}
      {result && (
        <div className={result.correct ? 'ls-callout ls-callout--tip' : 'ls-callout ls-callout--danger'} role="status">
          <strong className="ls-callout-title">{result.correct ? 'Correct' : 'Not quite'}</strong>
          <p>{result.feedback}</p>
          {result.correct ? (
            <p className="ls-fineprint">
              {result.awarded
                ? `Badge: ${result.awarded.badge ?? 'none'} · +${result.awarded.xp} XP (recorded by the server)`
                : 'Already completed: XP and badge were awarded the first time.'}
            </p>
          ) : (
            <button type="button" className="ls-btn ls-btn--secondary" onClick={retry}>
              Try again
            </button>
          )}
        </div>
      )}
    </section>
  );
};
