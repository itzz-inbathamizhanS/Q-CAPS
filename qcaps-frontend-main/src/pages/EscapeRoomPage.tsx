// src/pages/EscapeRoomPage.tsx
import React, { useState } from 'react';
import {
  Award,
  Zap,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Flame
} from 'lucide-react';
import { escapeRoomScenarios, EscapeScenarioChoice } from '@/data/escapeRoomData';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';
import { Button } from '@/components/ui/Button';

export const EscapeRoomPage: React.FC = () => {
  const { completedEscapes, completeEscape } = useCurriculumStore();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<EscapeScenarioChoice | null>(null);

  const scenario = escapeRoomScenarios[currentIdx] || escapeRoomScenarios[0];

  const handleSelectChoice = (choice: EscapeScenarioChoice) => {
    if (selectedChoice) return; // Prevent changing after selection without clicking try again
    setSelectedChoice(choice);
    if (choice.correct) {
      completeEscape(scenario.id, scenario.badge_awarded, scenario.mission_xp_awarded);
    }
  };

  const handleTryAgain = () => {
    setSelectedChoice(null);
  };

  const handleNext = () => {
    if (currentIdx < escapeRoomScenarios.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedChoice(null);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
      setSelectedChoice(null);
    }
  };

  const difficultyColors: Record<string, { color: string; bg: string }> = {
    novice: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    intermediate: { color: '#0284c7', bg: 'rgba(2, 132, 199, 0.1)' },
    professional: { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
    expert: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    quantum_expert: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' }
  };

  const diffStyle = difficultyColors[scenario.difficulty] || difficultyColors.intermediate;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444'
              }}
            >
              <Flame size={22} />
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              PQC Escape Room Labs
            </h1>
          </div>
          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)' }}>
            Branching crisis scenarios. Wrong choices expose consequences with actionable hints before allowing retry.
          </p>
        </div>

        {/* Progress Pill */}
        <div
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            backgroundColor: 'var(--color-surface, #ffffff)',
            border: '1px solid var(--color-border, #e2e8f0)',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-text-primary)'
          }}
        >
          Scenario {currentIdx + 1} of {escapeRoomScenarios.length} ·{' '}
          <span style={{ color: '#10b981' }}>{completedEscapes.length} Solved</span>
        </div>
      </div>

      {/* Main Scenario Container */}
      <div
        style={{
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          marginBottom: '24px'
        }}
      >
        {/* Region A: Scenario Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--color-border, #f1f5f9)',
            paddingBottom: '16px',
            marginBottom: '20px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  backgroundColor: diffStyle.bg,
                  color: diffStyle.color,
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}
              >
                {scenario.difficulty}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#94a3b8' }}>
                {scenario.module_id}
              </span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '8px' }}>
              {scenario.title}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontWeight: 600, fontSize: '14px' }}>
            <Zap size={16} />
            <span>+{scenario.mission_xp_awarded} XP</span>
          </div>
        </div>

        {/* Region B: Setup Narrative */}
        <div
          style={{
            backgroundColor: 'rgba(0,0,0,0.02)',
            borderLeft: '4px solid #5427e6',
            borderRadius: '0 10px 10px 0',
            padding: '16px 20px',
            fontSize: '15px',
            color: '#334155',
            lineHeight: 1.6,
            marginBottom: '24px'
          }}
        >
          <strong>Operational Crisis Brief:</strong> {scenario.setup}
        </div>

        {/* Region C: Prompt */}
        <div style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '20px' }}>
          {scenario.prompt}
        </div>

        {/* Choices (Without A/B/C labels per spec) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {scenario.choices.map((choice) => {
            const isSelected = selectedChoice?.id === choice.id;

            let border = '1px solid var(--color-border, #e2e8f0)';
            let bg = 'var(--color-surface, #ffffff)';
            let leftBorder = '4px solid transparent';

            if (isSelected) {
              if (choice.correct) {
                border = '1px solid #10b981';
                bg = 'rgba(16, 185, 129, 0.06)';
                leftBorder = '4px solid #10b981';
              } else {
                border = '1px solid #ef4444';
                bg = 'rgba(239, 68, 68, 0.06)';
                leftBorder = '4px solid #ef4444';
              }
            }

            return (
              <div
                key={choice.id}
                onClick={() => handleSelectChoice(choice)}
                style={{
                  padding: '16px 20px',
                  borderRadius: '10px',
                  border,
                  borderLeft: leftBorder,
                  backgroundColor: bg,
                  cursor: selectedChoice ? 'default' : 'pointer',
                  fontSize: '15px',
                  color: 'var(--color-text-primary, #0f172a)',
                  lineHeight: 1.5,
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 2px 10px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                {choice.text}
              </div>
            );
          })}
        </div>

        {/* Feedback Area on Selection */}
        {selectedChoice && (
          <div
            style={{
              padding: '18px 20px',
              borderRadius: '12px',
              backgroundColor: selectedChoice.correct ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
              border: `1px solid ${selectedChoice.correct ? '#10b981' : '#ef4444'}`,
              marginBottom: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              {selectedChoice.correct ? (
                <>
                  <CheckCircle2 size={18} color="#10b981" />
                  <strong style={{ color: '#065f46', fontSize: '14px' }}>Correct Decision!</strong>
                </>
              ) : (
                <>
                  <XCircle size={18} color="#ef4444" />
                  <strong style={{ color: '#991b1b', fontSize: '14px' }}>Security Consequence Detected:</strong>
                </>
              )}
            </div>

            <p style={{ fontSize: '14px', color: '#1e293b', lineHeight: 1.6, margin: 0 }}>
              {selectedChoice.feedback}
            </p>

            {/* Badge Award if correct */}
            {selectedChoice.correct && (
              <div
                style={{
                  marginTop: '14px',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(16, 185, 129, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <Award size={20} color="#10b981" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#065f46' }}>
                  Badge Awarded: {scenario.badge_awarded} (+{scenario.mission_xp_awarded} XP)
                </span>
              </div>
            )}

            {/* Try Again Button if wrong */}
            {!selectedChoice.correct && (
              <div style={{ marginTop: '14px' }}>
                <button
                  onClick={handleTryAgain}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RotateCcw size={14} />
                  <span>Try Again</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Region D: Navigation Carousel Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: '12px',
          padding: '16px 24px'
        }}
      >
        <Button
          variant="outline"
          disabled={currentIdx === 0}
          onClick={handlePrev}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <ChevronLeft size={16} />
          <span>Previous Scenario</span>
        </Button>

        {/* Carousel indicators */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {escapeRoomScenarios.map((sc, i) => {
            const done = completedEscapes.includes(sc.id);
            const isCur = i === currentIdx;
            return (
              <div
                key={sc.id}
                onClick={() => {
                  setCurrentIdx(i);
                  setSelectedChoice(null);
                }}
                style={{
                  width: isCur ? '24px' : '10px',
                  height: '10px',
                  borderRadius: '5px',
                  backgroundColor: done ? '#10b981' : isCur ? 'var(--color-primary, #5427e6)' : '#e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              />
            );
          })}
        </div>

        <Button
          variant="outline"
          disabled={currentIdx === escapeRoomScenarios.length - 1}
          onClick={handleNext}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span>Next Scenario</span>
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
};
