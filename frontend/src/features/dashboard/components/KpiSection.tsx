import React from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { Flame, Star } from 'lucide-react';
import { UserProfile } from '@/services/backendService';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';
import { curriculumModules } from '@/data/curriculumData';

interface KpiSectionProps {
  liveProfile?: UserProfile | null;
}

export const KpiSection: React.FC<KpiSectionProps> = ({ liveProfile }) => {
  const { completedModules, totalXp, readinessScore, streakDays } = useCurriculumStore();

  // Use backend values when available, fall back to local store
  const displayXp = liveProfile?.xp ?? totalXp;
  const displayReadiness = liveProfile?.readiness_score ?? readinessScore;
  const displayRank = liveProfile?.global_rank;
  const currentLevel = Math.floor(displayXp / 500) + 1;

  const metrics = [
    {
      id: 'kpi-capability',
      title: 'Capability Readiness',
      value: `${displayReadiness}%`,
      supportingText: 'Based on quiz performance',
      visualType: 'ring' as const,
      ringProgress: displayReadiness,
      linkText: 'View Skill Matrix',
      linkTo: '/learning',
    },
    {
      id: 'kpi-streak',
      title: 'Active Streak',
      value: `${streakDays} Days`,
      supportingText: 'Current learning streak',
      iconName: 'flame',
      iconBgColor: 'rgba(239,68,68,0.15)',
      iconColor: '#ef4444',
    },
    {
      id: 'kpi-xp',
      title: `Level ${currentLevel}`,
      value: `${displayXp.toLocaleString()} XP`,
      supportingText: 'Total Experience',
      iconName: 'star',
      iconBgColor: 'rgba(245,158,11,0.15)',
      iconColor: '#f59e0b',
    },
    {
      id: 'kpi-rank',
      title: 'Global Rank',
      value: displayRank ? `#${displayRank}` : '#N/A',
      supportingText: 'Global Leaderboard',
      visualType: 'bar' as const,
      barProgress: displayRank ? Math.max(10, 100 - displayRank * 10) : 0,
    }
  ];

  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case 'flame':
        return <Flame size={20} />;
      case 'star':
        return <Star size={20} />;
      default:
        return null;
    }
  };

  return (
    <section className="kpi-grid">
      {metrics.map((metric) => (
        <StatCard
          key={metric.id}
          title={metric.title}
          value={metric.value}
          badge={metric.badge}
          supportingText={metric.supportingText}
          linkText={metric.linkText}
          linkTo={metric.linkTo}
          visualType={metric.visualType}
          ringProgress={metric.ringProgress}
          barProgress={metric.barProgress}
          icon={renderIcon(metric.iconName)}
          iconBgColor={metric.iconBgColor}
          iconColor={metric.iconColor}
        />
      ))}
    </section>
  );
};
