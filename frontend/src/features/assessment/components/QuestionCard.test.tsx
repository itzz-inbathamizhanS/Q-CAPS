import { describe, expect, it } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuestionCard } from './QuestionCard';
import type { AssessmentQuestion } from '../assessmentTypes';

const question: AssessmentQuestion = {
  id: 'q1', number: 1, domain: 'PQC Fundamentals', domainCode: 'PQC', question: 'Pick one?',
  options: [{ id: '0', text: 'Alpha' }, { id: '1', text: 'Beta' }, { id: '2', text: 'Gamma' }],
};

function Harness() {
  const [selected, setSelected] = useState<string | undefined>();
  return <QuestionCard question={question} selectedOptionId={selected} onSelectOption={setSelected} />;
}

describe('diagnostic options (radio group)', () => {
  it('is one Tab stop and arrow keys move and select', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const radios = screen.getAllByRole('radio');
    expect(radios.map((r) => r.tabIndex)).toEqual([0, -1, -1]); // only the first is tabbable before a choice

    await user.tab();
    expect(radios[0]).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: 'Beta' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Beta' })).toHaveFocus();
    await user.keyboard('{ArrowUp}{ArrowUp}'); // wraps around
    expect(screen.getByRole('radio', { name: 'Gamma' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getAllByRole('radio').map((r) => r.tabIndex)).toEqual([-1, -1, 0]);
  });
});
