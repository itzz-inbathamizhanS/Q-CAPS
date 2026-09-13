// src/pages/CurriculumMap.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Award,
  Zap,
  RotateCcw,
  Compass,
  ArrowRight
} from 'lucide-react';
import { curriculumTracks, curriculumModules } from '@/data/curriculumData';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';
import { TrackSection } from '@/features/curriculum/components/TrackSection';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const CurriculumMap: React.FC = () => {
  const navigate = useNavigate();
  const {
    completedModules,
    currentModuleId,
    quizScores,
    unlockedBadges,
    totalXp,
    readinessScore,
    resetProgress,
    getRecommendedNextModule
  } = useCurriculumStore();

  // Find active track for auto-expansion
  const currentMod = curriculumModules.find((m) => m.id === currentModuleId);
  const initialTrack = currentMod ? currentMod.trackId : 'track-a';
  const [expandedTrack, setExpandedTrack] = useState<string>(initialTrack);

  const totalModules = curriculumModules.length; // 36
  const completedCount = completedModules.length;
  const progressPercent = Math.round((completedCount / totalModules) * 100);

  // Group modules by track
  const trackModulesMap = {
    'track-a': curriculumModules.filter((m) => m.trackId === 'track-a'),
    'track-b': curriculumModules.filter((m) => m.trackId === 'track-b'),
    'track-c': curriculumModules.filter((m) => m.trackId === 'track-c'),
    'track-d': curriculumModules.filter((m) => m.trackId === 'track-d')
  };

  const trackAComplete = trackModulesMap['track-a'].every((m) => completedModules.includes(m.id));
  const trackBComplete = trackModulesMap['track-b'].every((m) => completedModules.includes(m.id));
  const trackCComplete = trackModulesMap['track-c'].every((m) => completedModules.includes(m.id));

  const recommendedId = getRecommendedNextModule();
  const recommendedMod = curriculumModules.find((m) => m.id === recommendedId);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '48px' }}>
      {/* Region A: Page Header & Curriculum Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(84, 39, 230, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary, #5427e6)'
              }}
            >
              <GraduationCap size={22} />
            </div>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: 'var(--color-text-primary, #0f172a)',
                letterSpacing: '-0.5px'
              }}
            >
              Curriculum Map
            </h1>
          </div>
          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary, #64748b)' }}>
            36 modules across 4 tracks — your linear progression toward <strong>PQCTP</strong> (Post-Quantum Cryptography Technical Professional) certification.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {recommendedMod && (
            <Button
              variant="primary"
              onClick={() => navigate(`/learning/${recommendedMod.id}`)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span>Resume: {recommendedMod.code} {recommendedMod.title}</span>
              <ArrowRight size={16} />
            </Button>
          )}
          <button
            onClick={() => {
              if (window.confirm('Reset your curriculum progress to initial demo state?')) {
                resetProgress();
              }
            }}
            title="Reset to initial state"
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--color-border, #e2e8f0)',
              backgroundColor: 'transparent',
              color: 'var(--color-text-secondary, #64748b)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px'
            }}
          >
            <RotateCcw size={14} />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}
      >
        <Card variant="glass" padding="normal">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Overall Progress</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}>
              {completedCount} / {totalModules} Modules
            </span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '6px' }}>
            {progressPercent}%
          </div>
          <div
            style={{
              width: '100%',
              height: '6px',
              backgroundColor: 'rgba(0,0,0,0.06)',
              borderRadius: '3px',
              overflow: 'hidden',
              marginTop: '10px'
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                backgroundColor: '#5427e6',
                borderRadius: '3px',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </Card>

        <Card variant="glass" padding="normal">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Quantum Readiness</span>
            <Compass size={16} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#38bdf8', marginTop: '6px' }}>
            {readinessScore}%
          </div>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '8px', display: 'block' }}>
            Based on completed quizzes & assessments
          </span>
        </Card>

        <Card variant="glass" padding="normal">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Total XP</span>
            <Zap size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#f59e0b', marginTop: '6px' }}>
            {totalXp.toLocaleString()}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '8px', display: 'block' }}>
            XP earned from quizzes & labs
          </span>
        </Card>

        <Card variant="glass" padding="normal">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Badges Unlocked</span>
            <Award size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#10b981', marginTop: '6px' }}>
            {unlockedBadges.length} / 45
          </div>
          <span
            onClick={() => navigate('/badges')}
            style={{ fontSize: '12px', color: 'var(--color-primary)', marginTop: '8px', display: 'block', cursor: 'pointer', fontWeight: 500 }}
          >
            View Credential Showcase →
          </span>
        </Card>
      </div>

      {/* Region B: 4 Collapsible Track Sections */}
      <div>
        {curriculumTracks.map((track) => {
          const trackMods = trackModulesMap[track.id] || [];
          const isExpanded = expandedTrack === track.id;

          // Determine track locks & gates
          let isLocked = false;
          let gateText: string | undefined;

          if (track.id === 'track-b' && !trackAComplete) {
            isLocked = true;
            gateText = 'Pass all 8 Track A modules (A1–A8) and Beginner Capstone to unlock Track B.';
          } else if (track.id === 'track-c' && !trackBComplete) {
            isLocked = true;
            gateText = 'Complete all 11 Track B modules (B1–B11) and Intermediate Capstone to unlock Track C.';
          } else if (track.id === 'track-d') {
            if (!trackCComplete) {
              isLocked = true;
              gateText = 'Requires: Track C complete + Advanced Specialist Capstone.';
            }
          }

          return (
            <TrackSection
              key={track.id}
              track={track}
              modules={trackMods}
              completedModules={completedModules}
              currentModuleId={currentModuleId}
              quizScores={quizScores}
              isExpanded={isExpanded}
              onToggle={() => setExpandedTrack(isExpanded ? '' : track.id)}
              isLockedTrack={isLocked}
              requiresGateText={gateText}
            />
          );
        })}
      </div>
    </div>
  );
};
