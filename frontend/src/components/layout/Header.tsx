import React, { useState, useEffect } from 'react';
import { Bell, HelpCircle, Menu, Search, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '@/features/auth/authStore';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const { userName } = useAuthStore();
  
  const initials = userName 
    ? userName.slice(0, 2).toUpperCase()
    : '??';

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

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
        {/* Theme Toggle */}
        <button
          className="header-icon-btn"
          aria-label="Toggle Theme"
          onClick={() => setIsDark(!isDark)}
        >
          {isDark ? <Sun size={19} /> : <Moon size={19} />}
        </button>

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
          title={userName || 'Operator'}
        >
          {initials}
        </div>
      </div>
    </header>
  );
};
