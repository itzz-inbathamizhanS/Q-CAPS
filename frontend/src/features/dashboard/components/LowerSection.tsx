import React from 'react';
import { Card } from '@/components/ui/Card';
import { Trophy, Shield, Compass, Check, Minus } from 'lucide-react';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';
import { curriculumModules } from '@/data/curriculumData';

export interface AchievementItem {
  id: string;
  title: string;
  subtitle: string;
  iconName: 'trophy' | 'shield' | 'compass';
  colorType: 'primary' | 'secondary' | 'tertiary';
}

export const LowerSection: React.FC = () => {
  const { unlockedBadges, quizScores, streakDays, lastActivityDate } = useCurriculumStore();

  const achievements: AchievementItem[] = unlockedBadges.map((badge, idx) => ({
    id: `badge-${idx}`,
    title: badge,
    subtitle: 'Earned via completion',
    iconName: idx % 3 === 0 ? 'trophy' : (idx % 3 === 1 ? 'shield' : 'compass'),
    colorType: idx % 3 === 0 ? 'primary' : (idx % 3 === 1 ? 'secondary' : 'tertiary')
  }));
  if (achievements.length === 0) {
    achievements.push({
      id: 'default',
      title: 'First Steps',
      subtitle: 'Complete your first module',
      iconName: 'compass',
      colorType: 'tertiary'
    });
  }

  // Generate days array based on streakDays and current day
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const today = new Date().getDay();
  // Adjust so Monday is 0, Sunday is 6
  const currentDayIndex = today === 0 ? 6 : today - 1;
  
  const days = daysOfWeek.map((day, idx) => {
    // If the streak includes this day (working backwards from today)
    const isPastOrToday = idx <= currentDayIndex;
    const daysAgo = currentDayIndex - idx;
    // Check if there was activity recently to maintain the streak
    const hasActivityToday = lastActivityDate === new Date().toISOString().split('T')[0];
    const isStreakActive = hasActivityToday 
      ? daysAgo < streakDays 
      : daysAgo < (streakDays - 1);
      
    return {
      day,
      active: isPastOrToday && isStreakActive
    };
  });

  const weeklyPractice = {
    activeDaysCount: streakDays,
    days,
  };

  // Compute skill breakdown dynamically from real quiz scores using canonical module domain metadata
  const scoreEntries = Object.entries(quizScores);

  // Build a lookup from moduleId to domain
  const getModuleDomain = (moduleId: string): string | undefined => {
    const mod = curriculumModules.find(m => m.id === moduleId);
    return mod?.domain;
  };

  const quantumScores = scoreEntries.filter(([k]) => {
    const d = getModuleDomain(k);
    return d === 'PQC Fundamentals';
  });
  const cryptoScores = scoreEntries.filter(([k]) => {
    const d = getModuleDomain(k);
    return d === 'Cryptography Fundamentals';
  });
  const algoScores = scoreEntries.filter(([k]) => {
    const d = getModuleDomain(k);
    return d === 'Cybersecurity Fundamentals';
  });

  const avg = (arr: [string, number][]) => arr.length > 0 ? Math.round(arr.reduce((sum, [, v]) => sum + v, 0) / arr.length) : 0;

  const skillBreakdown = [
    { name: 'Quantum & PQC', score: avg(quantumScores), color: '#3CB7E8' },
    { name: 'Applied Cryptography', score: avg(cryptoScores), color: '#5427E6' },
    { name: 'Cybersecurity', score: avg(algoScores), color: '#EF4444' },
  ];
  const renderAchievementIcon = (achievement: AchievementItem) => {
    switch (achievement.iconName) {
      case 'trophy':
        return <Trophy size={20} />;
      case 'shield':
        return <Shield size={20} />;
      case 'compass':
        return <Compass size={20} />;
      default:
        return <Trophy size={20} />;
    }
  };

  const getAchievementColors = (colorType: 'primary' | 'secondary' | 'tertiary') => {
    switch (colorType) {
      case 'secondary':
        return {
          bg: 'rgba(92, 75, 195, 0.1)',
          border: 'rgba(92, 75, 195, 0.2)',
          color: 'var(--color-secondary)',
        };
      case 'tertiary':
        return {
          bg: 'rgba(0, 92, 121, 0.1)',
          border: 'rgba(0, 92, 121, 0.2)',
          color: 'var(--color-tertiary)',
        };
      case 'primary':
      default:
        return {
          bg: 'rgba(84, 39, 230, 0.1)',
          border: 'rgba(84, 39, 230, 0.2)',
          color: 'var(--color-primary)',
        };
    }
  };

  return (
    <section className="lower-grid">
      {/* 1. Recent Achievements */}
      <Card variant="glass" padding="normal" style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            paddingBottom: '14px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Recent Achievements
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {achievements.map((achievement) => {
            const colors = getAchievementColors(achievement.colorType);
            return (
              <div key={achievement.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    backgroundColor: colors.bg,
                    border: `1px solid ${colors.border}`,
                    color: colors.color,
                    width: '44px',
                    height: '44px',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {renderAchievementIcon(achievement)}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {achievement.title}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    {achievement.subtitle}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 2. Weekly Practice */}
      <Card variant="glass" padding="normal" style={{ display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
          Weekly Practice
        </h3>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--color-text-secondary)',
            marginBottom: '24px',
            paddingBottom: '14px',
            borderBottom: '1px solid var(--color-border)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {weeklyPractice.activeDaysCount} active days this week
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 'auto 0', padding: '0 4px' }}>
          {weeklyPractice.days.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '9999px',
                  backgroundColor: item.active ? 'var(--color-primary)' : 'var(--color-surface-variant)',
                  color: item.active ? '#FFFFFF' : 'var(--color-outline)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: item.active ? 'none' : '1px solid var(--color-border)',
                }}
              >
                {item.active ? <Check size={16} strokeWidth={3} /> : <Minus size={16} />}
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: item.active ? 'var(--color-text-primary)' : 'var(--color-outline)',
                }}
              >
                {item.day}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* 3. Skill Breakdown */}
      <Card variant="glass" padding="normal" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '2px' }}>
            PQC Skill Breakdown
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
            Current demonstrated capability by skill domain
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {skillBreakdown.map((item, idx) => (
            <div key={idx}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  {item.name}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: item.color,
                  }}
                >
                  {item.score}%
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  backgroundColor: 'var(--color-surface-variant)',
                  borderRadius: '9999px',
                  height: '6px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${item.score}%`,
                    backgroundColor: item.color,
                    height: '100%',
                    borderRadius: '9999px',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
};
