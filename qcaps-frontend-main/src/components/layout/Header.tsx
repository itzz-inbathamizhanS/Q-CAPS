import React from 'react';
import { Bell, HelpCircle, Menu, Search } from 'lucide-react';
import { mockDashboardData } from '@/data/dashboardData';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const { currentUser } = mockDashboardData;

  return (
    <header className="app-header">
      {/* Left side (Mobile hamburger / Search bar) */}
      <div className="header-left">
        <button
          onClick={onToggleMobileMenu}
          className="mobile-menu-toggle"
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="header-search-wrapper">
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-secondary)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search assessments & modules..."
            className="header-search-input"
          />
        </div>
      </div>

      {/* Right side Actions */}
      <div className="header-actions">
        {/* Notifications */}
        <button
          className="header-icon-btn"
          aria-label="Notifications"
        >
          <Bell size={19} />
          <span className="header-unread-dot" />
        </button>

        {/* Help */}
        <button
          className="header-icon-btn"
          aria-label="Help & Documentation"
        >
          <HelpCircle size={19} />
        </button>

        {/* User Avatar */}
        <div
          className="header-avatar"
          title={`${currentUser.name} (${currentUser.role})`}
        >
          {currentUser.avatarInitials}
        </div>
      </div>
    </header>
  );
};
