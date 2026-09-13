import React, { useEffect, useState } from 'react';
import { KpiSection } from '@/features/dashboard/components/KpiSection';
import { BentoSection } from '@/features/dashboard/components/BentoSection';
import { LowerSection } from '@/features/dashboard/components/LowerSection';
import { mockDashboardData } from '@/data/dashboardData';
import {
  fetchUserProfile,
  fetchUserRecommendation,
  UserProfile,
  UserRecommendation,
} from '@/services/backendService';

export const Dashboard: React.FC = () => {
  const { currentUser } = mockDashboardData;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recommendation, setRecommendation] =
    useState<UserRecommendation | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchUserProfile(1).then((data) => {
      if (isMounted && data) {
        setProfile(data);
      }
    });

    fetchUserRecommendation(1).then((data) => {
      if (isMounted && data) {
        setRecommendation(data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const displayName = profile?.name || currentUser.name;

  return (
    <>
      {/* Page Header */}
      <section className="dashboard-header">
        <h1 className="dashboard-title">
          Welcome back, {displayName}.
        </h1>
        <p className="dashboard-subtitle">
          Continue building the skills needed for a quantum-safe future.
        </p>
      </section>

      {/* KPI Row (4 Cards) */}
      <KpiSection liveProfile={profile} />

      {/* Bento Section (8 cols + 4 cols) */}
      <BentoSection liveRecommendation={recommendation} />

      {/* Lower 3-column Section */}
      <LowerSection />
    </>
  );
};

export default Dashboard;
