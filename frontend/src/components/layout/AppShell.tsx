import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { MobileNavigation } from './MobileNavigation';

interface AppShellProps {
  children?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

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
