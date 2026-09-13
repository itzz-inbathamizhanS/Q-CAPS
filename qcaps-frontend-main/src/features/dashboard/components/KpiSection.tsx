import React from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { Flame, Star } from 'lucide-react';
import { mockDashboardData } from '@/data/dashboardData';
import { UserProfile } from '@/services/backendService';

interface KpiSectionProps {
  liveProfile?: UserProfile | null;
}

export const KpiSection: React.FC<KpiSectionProps> = ({ liveProfile }) => {
  const { kpiMetrics } = mockDashboardData;

  const metrics = kpiMetrics.map((metric) => {
    if (metric.id === 'kpi-capability' && liveProfile?.readiness_score !== undefined) {
      return {
        ...metric,
        value: `${liveProfile.readiness_score}%`,
        ringProgress: liveProfile.readiness_score,
      };
    }
    return metric;
  });

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
