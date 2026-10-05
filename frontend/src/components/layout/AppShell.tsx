import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { MobileNavigation } from './MobileNavigation';
import { fetchActivityProgress } from '@/services/activityApi';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';
import { useAuthStore } from '@/features/auth/authStore';
import { StateMessage } from '@/components/ui/StateMessage';

interface AppShellProps {
  children?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const userId = useAuthStore((s) => s.userId);
  const applyActivityProgress = useCurriculumStore((s) => s.applyActivityProgress);

  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncAttempt, setSyncAttempt] = useState(0);

  // The server records which practice labs and missions are complete; mirror that here. A failed sync is shown,
  // because the progress on screen is then this browser's cached copy and may be out of date.
  useEffect(() => {
    if (!userId) return;
    let live = true;
    setSyncError(null);
    fetchActivityProgress()
      .then((progress) => live && applyActivityProgress(progress))
      .catch((e: unknown) => live && setSyncError(e instanceof Error ? e.message : 'Request failed'));
    return () => {
      live = false;
    };
  }, [userId, applyActivityProgress, syncAttempt]);

  return (
    <div className="app-shell">
      {/* Navigation drawer: hidden until the menu button in the header is used */}
      <MobileNavigation
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="app-main">
        <Header onToggleMobileMenu={() => setIsMobileNavOpen((open) => !open)} menuOpen={isMobileNavOpen} />

        <main className="app-canvas">
          {syncError && (
            <div style={{ marginBottom: 16 }}>
              <StateMessage
                kind="error"
                message="Your progress could not be synced with the server; what you see may be out of date."
                detail={syncError}
                onRetry={() => setSyncAttempt((n) => n + 1)}
              />
            </div>
          )}
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};
