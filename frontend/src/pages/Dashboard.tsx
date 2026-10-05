import React from 'react';
import { KpiSection } from '@/features/dashboard/components/KpiSection';
import { BentoSection } from '@/features/dashboard/components/BentoSection';
import { LowerSection } from '@/features/dashboard/components/LowerSection';
import { fetchUserProfile, getMyRecommendation } from '@/services/backendService';
import { useAuthStore } from '@/features/auth/authStore';
import { useAsync } from '@/hooks/useAsync';
import { StateMessage } from '@/components/ui/StateMessage';

export const Dashboard: React.FC = () => {
  const { userId } = useAuthStore();
  const [profileState, reloadProfile] = useAsync(() => fetchUserProfile(), [userId]);
  const [recState, reloadRec] = useAsync(() => getMyRecommendation(), [userId]);
  const profile = profileState.status === 'ready' ? profileState.value : null;
  const recommendation = recState.status === 'ready' ? recState.value : null;

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

      {/* KPI Row (4 Cards). XP, rank and readiness come from the server; on failure say so instead of
          showing this browser's cached values as if they were current. */}
      {profileState.status === 'error' ? (
        <StateMessage kind="error" message="Your progress figures could not be loaded from the server." detail={profileState.message} onRetry={reloadProfile} />
      ) : (
        <KpiSection liveProfile={profile} />
      )}

      {/* Bento Section (8 cols + 4 cols) */}
      {recState.status === 'error' && (
        <StateMessage kind="error" message="Your recommendation could not be loaded." detail={recState.message} onRetry={reloadRec} />
      )}
      {recState.status === 'loading' && <StateMessage kind="loading" message="Loading your recommendation…" />}
      {recState.status === 'ready' && <BentoSection liveRecommendation={recommendation} />}

      {/* Lower 3-column Section */}
      <LowerSection />
    </>
  );
};

export default Dashboard;
