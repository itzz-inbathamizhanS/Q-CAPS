import React, { useEffect, useState } from 'react';
import { KpiSection } from '@/features/dashboard/components/KpiSection';
import { BentoSection } from '@/features/dashboard/components/BentoSection';
import { LowerSection } from '@/features/dashboard/components/LowerSection';
import {
  fetchUserProfile,
  fetchUserRecommendation,
  UserProfile,
  UserRecommendation,
} from '@/services/backendService';
import { useAuthStore } from '@/features/auth/authStore';

export const Dashboard: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recommendation, setRecommendation] =
    useState<UserRecommendation | null>(null);
  
  const { userId } = useAuthStore();

  useEffect(() => {
    let isMounted = true;
    
    // Clear previous profile data if userId changes
    setProfile(null);
    setRecommendation(null);

    fetchUserProfile().then((data) => {
      if (isMounted && data) {
        setProfile(data);
      }
    });

    fetchUserRecommendation().then((data) => {
      if (isMounted && data) {
        setRecommendation(data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const displayName = profile?.name || 'Operator';

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
