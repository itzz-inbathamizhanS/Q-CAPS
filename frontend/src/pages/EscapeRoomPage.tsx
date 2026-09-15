// src/pages/EscapeRoomPage.tsx
<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
=======
import React, { useState } from 'react';
>>>>>>> f062018aa6ab8ffdcaf3ff4ae6d74c3c28808d14
import {
  Award,
  Zap,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
<<<<<<< HEAD
  Flame,
  ShieldCheck,
  ArrowRight
=======
  Flame
>>>>>>> f062018aa6ab8ffdcaf3ff4ae6d74c3c28808d14
} from 'lucide-react';
import { escapeRoomScenarios, EscapeScenarioChoice } from '@/data/escapeRoomData';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';
import { Button } from '@/components/ui/Button';

<<<<<<< HEAD
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const EscapeRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const { completedEscapes, completeEscape } = useCurriculumStore();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<EscapeScenarioChoice | null>(null);
  const [shuffledChoices, setShuffledChoices] = useState<EscapeScenarioChoice[]>([]);
  const [showCompletion, setShowCompletion] = useState(false);

  const scenario = escapeRoomScenarios[currentIdx] || escapeRoomScenarios[0];

  // Randomize choices on scenario load / index change
  useEffect(() => {
    if (scenario?.choices) {
      setShuffledChoices(shuffleArray(scenario.choices));
    }
  }, [currentIdx, scenario]);

=======
export const EscapeRoomPage: React.FC = () => {
  const { completedEscapes, completeEscape } = useCurriculumStore();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<EscapeScenarioChoice | null>(null);

  const scenario = escapeRoomScenarios[currentIdx] || escapeRoomScenarios[0];

>>>>>>> f062018aa6ab8ffdcaf3ff4ae6d74c3c28808d14
  const handleSelectChoice = (choice: EscapeScenarioChoice) => {
    if (selectedChoice) return; // Prevent changing after selection without clicking try again
    setSelectedChoice(choice);
    if (choice.correct) {
      completeEscape(scenario.id, scenario.badge_awarded, scenario.mission_xp_awarded);
    }
  };

  const handleTryAgain = () => {
    setSelectedChoice(null);
<<<<<<< HEAD
    if (scenario?.choices) {
      setShuffledChoices(shuffleArray(scenario.choices));
    }
  };

  const isCurrentSolved = selectedChoice?.correct === true || completedEscapes.includes(scenario.id);

  const handleNext = () => {
    if (!isCurrentSolved) return;
=======
  };

  const handleNext = () => {
>>>>>>> f062018aa6ab8ffdcaf3ff4ae6d74c3c28808d14
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
    novice: { color: 'var(--color-emerald)', bg: 'rgba(16, 185, 129, 0.1)' },
    intermediate: { color: '#0284c7', bg: 'rgba(2, 132, 199, 0.1)' },
    professional: { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
    expert: { color: 'var(--color-amber)', bg: 'rgba(245, 158, 11, 0.1)' },
    quantum_expert: { color: 'var(--color-amber)', bg: 'rgba(245, 158, 11, 0.1)' }
  };

  const diffStyle = difficultyColors[scenario.difficulty] || difficultyColors.intermediate;

<<<<<<< HEAD
  // Completion Screen View
  if (showCompletion) {
    const totalXp = escapeRoomScenarios.reduce((sum, s) => sum + s.mission_xp_awarded, 0);
    return (
      <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '60px' }}>
        <div
          style={{
            backgroundColor: 'var(--color-surface, #ffffff)',
            border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: '20px',
            padding: '48px 36px',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
            marginBottom: '32px'
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: 'var(--color-emerald)'
            }}
          >
            <ShieldCheck size={40} />
          </div>

          <span
            style={{
              padding: '4px 12px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--color-emerald)',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            Labs Certified
          </span>

          <h1
            style={{
              fontSize: '32px',
              fontWeight: 800,
              color: 'var(--color-text-primary)',
              marginTop: '12px',
              marginBottom: '10px'
            }}
          >
            All Escape Room Scenarios Complete!
          </h1>
          <p
            style={{
              fontSize: '16px',
              color: 'var(--color-text-secondary)',
              maxWidth: '640px',
              margin: '0 auto 32px',
              lineHeight: 1.6
            }}
          >
            Outstanding work! You have successfully identified, mitigated, and resolved all 7 post-quantum cryptographic crisis scenarios across hybrid migration, stateful signatures, and CA crypto-agility.
          </p>

          {/* Stats Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              maxWidth: '680px',
              margin: '0 auto 36px',
              padding: '20px',
              borderRadius: '14px',
              backgroundColor: 'var(--color-surface-low, #f8fafc)',
              border: '1px solid var(--color-border, #e2e8f0)'
            }}
          >
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                Total XP Earned
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <Zap size={22} />
                <span>+{totalXp} XP</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                Scenarios Solved
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-emerald)' }}>
                {completedEscapes.length} / {escapeRoomScenarios.length}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                Credentials Earned
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary, #5427e6)' }}>
                {completedEscapes.length} Badges
              </div>
            </div>
          </div>

          {/* Badges Grid */}
          <div style={{ textAlign: 'left', marginBottom: '36px' }}>
            <h3
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Award size={20} color="var(--color-primary)" />
              <span>Earned Defense Badges across all 7 Scenarios</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {escapeRoomScenarios.map((sc, idx) => {
                const isDone = completedEscapes.includes(sc.id);
                return (
                  <div
                    key={sc.id}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: `1px solid ${isDone ? 'rgba(16, 185, 129, 0.3)' : 'var(--color-border)'}`,
                      backgroundColor: isDone ? 'rgba(16, 185, 129, 0.04)' : 'var(--color-surface)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px'
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: isDone ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0,0,0,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isDone ? '#10b981' : '#94a3b8',
                        flexShrink: 0
                      }}
                    >
                      {isDone ? <CheckCircle2 size={20} /> : <Award size={20} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Scenario {idx + 1} · {sc.difficulty}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                        {sc.badge_awarded}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        {sc.title}
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-amber)' }}>
                      +{sc.mission_xp_awarded} XP
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Navigation */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <Button
              variant="primary"
              onClick={() => navigate('/missions')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 24px' }}
            >
              <span>Return to Mission Hub</span>
              <ArrowRight size={16} />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/learning')}
              style={{ padding: '0 20px' }}
            >
              <span>Explore Curriculum</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowCompletion(false);
                setCurrentIdx(0);
                setSelectedChoice(null);
              }}
              style={{ padding: '0 16px' }}
            >
              <span>Review Scenarios</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

=======
>>>>>>> f062018aa6ab8ffdcaf3ff4ae6d74c3c28808d14
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
                color: 'var(--color-error)'
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
<<<<<<< HEAD
          onClick={() => completedEscapes.length === escapeRoomScenarios.length && setShowCompletion(true)}
=======
>>>>>>> f062018aa6ab8ffdcaf3ff4ae6d74c3c28808d14
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            backgroundColor: 'var(--color-surface, #ffffff)',
            border: '1px solid var(--color-border, #e2e8f0)',
            fontSize: '13px',
            fontWeight: 600,
<<<<<<< HEAD
            color: 'var(--color-text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: completedEscapes.length === escapeRoomScenarios.length ? 'pointer' : 'default'
          }}
          title={completedEscapes.length === escapeRoomScenarios.length ? 'Click to view completed labs summary' : undefined}
        >
          <span>Scenario {currentIdx + 1} of {escapeRoomScenarios.length} ·{' '}</span>
          <span style={{ color: 'var(--color-emerald)' }}>{completedEscapes.length} Solved</span>
          {completedEscapes.length === escapeRoomScenarios.length && (
            <span style={{ fontSize: '11px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: 'var(--color-emerald)', padding: '2px 6px', borderRadius: '4px' }}>
              View Summary
            </span>
          )}
=======
            color: 'var(--color-text-primary)'
          }}
        >
          Scenario {currentIdx + 1} of {escapeRoomScenarios.length} ·{' '}
          <span style={{ color: 'var(--color-emerald)' }}>{completedEscapes.length} Solved</span>
>>>>>>> f062018aa6ab8ffdcaf3ff4ae6d74c3c28808d14
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-amber)', fontWeight: 600, fontSize: '14px' }}>
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
<<<<<<< HEAD
            color: 'var(--color-text-primary)',
=======
            color: 'var(--color-border)',
>>>>>>> f062018aa6ab8ffdcaf3ff4ae6d74c3c28808d14
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
<<<<<<< HEAD
          {(shuffledChoices.length > 0 ? shuffledChoices : scenario.choices).map((choice) => {
=======
          {scenario.choices.map((choice) => {
>>>>>>> f062018aa6ab8ffdcaf3ff4ae6d74c3c28808d14
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
              border: `1px solid ${selectedChoice.correct ? 'var(--color-emerald)' : 'var(--color-error)'}`,
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

<<<<<<< HEAD
            <p style={{ fontSize: '14px', color: 'var(--color-text-primary, #0f172a)', lineHeight: 1.6, margin: 0 }}>
=======
            <p style={{ fontSize: '14px', color: 'var(--color-surface-low)', lineHeight: 1.6, margin: 0 }}>
>>>>>>> f062018aa6ab8ffdcaf3ff4ae6d74c3c28808d14
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
                    backgroundColor: 'var(--color-error)',
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
<<<<<<< HEAD

            {/* Completion CTA if on final scenario & correct */}
            {currentIdx === escapeRoomScenarios.length - 1 && selectedChoice.correct && (
              <div style={{ marginTop: '16px' }}>
                <Button
                  variant="primary"
                  onClick={() => setShowCompletion(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <span>All Scenarios Solved — View Completion Summary →</span>
                  <Award size={16} />
                </Button>
              </div>
            )}
=======
>>>>>>> f062018aa6ab8ffdcaf3ff4ae6d74c3c28808d14
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
                  backgroundColor: done ? 'var(--color-emerald)' : isCur ? 'var(--color-primary, #5427e6)' : '#e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              />
            );
          })}
        </div>

<<<<<<< HEAD
        {currentIdx === escapeRoomScenarios.length - 1 ? (
          <Button
            variant={isCurrentSolved ? 'primary' : 'outline'}
            disabled={!isCurrentSolved}
            onClick={() => {
              if (isCurrentSolved) {
                setShowCompletion(true);
              }
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>Finish Labs</span>
            <Award size={16} />
          </Button>
        ) : (
          <Button
            variant={isCurrentSolved ? 'primary' : 'outline'}
            disabled={!isCurrentSolved}
            onClick={handleNext}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>Next Scenario</span>
            <ChevronRight size={16} />
          </Button>
        )}
=======
        <Button
          variant="outline"
          disabled={currentIdx === escapeRoomScenarios.length - 1}
          onClick={handleNext}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span>Next Scenario</span>
          <ChevronRight size={16} />
        </Button>
>>>>>>> f062018aa6ab8ffdcaf3ff4ae6d74c3c28808d14
      </div>
    </div>
  );
};
