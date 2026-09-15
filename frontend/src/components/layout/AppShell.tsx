import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNavigation } from './MobileNavigation';

interface AppShellProps {
  children?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="app-shell">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Off-canvas Navigation */}
      <MobileNavigation
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="app-main">
        <Header onToggleMobileMenu={() => setIsMobileNavOpen(true)} />

        <main className="app-canvas">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};
