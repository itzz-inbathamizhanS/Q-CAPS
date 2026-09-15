import React from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { Flame, Star } from 'lucide-react';
import { UserProfile } from '@/services/backendService';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';

interface KpiSectionProps {
  liveProfile?: UserProfile | null;
}

export const KpiSection: React.FC<KpiSectionProps> = ({ liveProfile }) => {
  const { completedModules } = useCurriculumStore();

  const metrics = [
    {
      id: 'kpi-capability',
      title: 'Capability Readiness',
      value: `${liveProfile?.readiness_score || 0}%`,
      badge: { text: 'TOP 5%', variant: 'cyan' as const },
      supportingText: '+12% from last month',
      visualType: 'ring' as const,
      ringProgress: liveProfile?.readiness_score || 0,
      linkText: 'View Skill Matrix',
      linkTo: '/learning',
    },
    {
      id: 'kpi-streak',
      title: 'Active Modules',
      value: `${completedModules.length}`,
      supportingText: 'Modules Completed',
      iconName: 'flame',
      iconBgColor: 'rgba(239,68,68,0.15)',
      iconColor: '#ef4444',
    },
    {
      id: 'kpi-xp',
      title: 'Total Experience',
      value: `${liveProfile?.xp || 0} XP`,
      supportingText: 'Across all topics',
      iconName: 'star',
      iconBgColor: 'rgba(245,158,11,0.15)',
      iconColor: '#f59e0b',
    },
    {
      id: 'kpi-rank',
      title: 'Global Rank',
      value: `#${liveProfile?.global_rank || 'N/A'}`,
      badge: { text: 'PROMOTED', variant: 'success' as const },
      supportingText: 'Global Leaderboard',
      visualType: 'bar' as const,
      barProgress: 85,
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
