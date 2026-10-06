import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Menu, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/authStore';
import { useSignOut } from '@/features/auth/useSignOut';
// Sized for the 38 px header at up to 3x pixel density (the 1600 px source was 326 KB).
import qcapsLogoWebp from '@/assets/brand/qcaps-logo-header.webp';
import qcapsLogoPng from '@/assets/brand/qcaps-logo-header.png';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
  menuOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu, menuOpen = false }) => {
  const { userName } = useAuthStore();
  const signOut = useSignOut();
  const [menuOpenUser, setMenuOpenUser] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close the account menu on an outside click or Escape.
  useEffect(() => {
    if (!menuOpenUser) return;
    const onClick = (e: MouseEvent) => {
      if (!userMenuRef.current?.contains(e.target as Node)) setMenuOpenUser(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpenUser(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpenUser]);
  
  const initials = userName 
    ? userName.slice(0, 2).toUpperCase()
    : '??';

  // index.html applies the saved (or system) theme before the first paint; start from what it chose.
  const [isDark, setIsDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark');

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light'); // an explicit choice overrides the system preference
    } catch {
      /* storage unavailable: the choice lasts for this page view */
    }
  };

  return (
    <header className="app-header">
      {/* Left side (Mobile hamburger / Search bar) */}
      <div className="header-left">
        <button
          onClick={onToggleMobileMenu}
          className="mobile-menu-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <Menu size={22} />
        </button>

        <Link to="/dashboard" className="header-brand" aria-label="Q-CAPS home">
          <picture>
            <source srcSet={qcapsLogoWebp} type="image/webp" />
            <img src={qcapsLogoPng} alt="Q-CAPS" className="header-logo" width={323} height={114} />
          </picture>
        </Link>

        {/* Search returns with the command palette (TF.6); no input without a handler. */}
      </div>

      {/* Right side Actions */}
      <div className="header-actions">
        {/* Theme Toggle */}
        <button
          className="header-icon-btn"
          aria-label="Toggle Theme"
          onClick={toggleTheme}
        >
          {isDark ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        {/* No notification bell or Help button until they are backed by real data (TF.8) or a docs page. */}

        {/* User Avatar: account menu */}
        <div ref={userMenuRef} style={{ position: 'relative' }}>
          <button
            type="button"
            className="header-avatar"
            title={userName || 'Operator'}
            aria-label={`Account menu for ${userName || 'Operator'}`}
            aria-haspopup="menu"
            aria-expanded={menuOpenUser}
            onClick={() => setMenuOpenUser((o) => !o)}
          >
            {initials}
          </button>
          {menuOpenUser && (
            <div
              role="menu"
              style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)', minWidth: 180, zIndex: 50,
                background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: 6,
              }}
            >
              <div style={{ padding: '6px 10px', fontSize: 13, color: 'var(--color-text-secondary)' }}>{userName || 'Operator'}</div>
              <button
                type="button"
                role="menuitem"
                autoFocus
                onClick={() => { setMenuOpenUser(false); signOut(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', border: 'none',
                  background: 'transparent', color: 'var(--color-text-primary)', font: 'inherit', cursor: 'pointer', borderRadius: 6,
                }}
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
