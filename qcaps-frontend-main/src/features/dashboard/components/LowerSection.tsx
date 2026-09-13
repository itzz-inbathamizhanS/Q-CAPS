import React from 'react';
import { Card } from '@/components/ui/Card';
import { Trophy, Shield, Compass, Check, Minus } from 'lucide-react';
import { mockDashboardData, type AchievementItem } from '@/data/dashboardData';

export const LowerSection: React.FC = () => {
  const { achievements, weeklyPractice, skillBreakdown } = mockDashboardData;

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
