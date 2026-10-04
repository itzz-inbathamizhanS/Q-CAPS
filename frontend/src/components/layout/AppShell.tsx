import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { MobileNavigation } from './MobileNavigation';
import { fetchActivityProgress } from '@/services/activityApi';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';
import { useAuthStore } from '@/features/auth/authStore';

interface AppShellProps {
  children?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const userId = useAuthStore((s) => s.userId);
  const applyActivityProgress = useCurriculumStore((s) => s.applyActivityProgress);

  // The server records which practice labs and missions are complete; mirror that here.
  useEffect(() => {
    if (!userId) return;
    fetchActivityProgress().then(applyActivityProgress).catch(() => undefined);
  }, [userId, applyActivityProgress]);

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
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};
