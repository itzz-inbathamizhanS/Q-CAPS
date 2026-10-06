import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { NAV_GROUPS } from './navItems';
import { useAuthStore } from '@/features/auth/authStore';
import { useSignOut } from '@/features/auth/useSignOut';
import { useAdminStatus } from '@/features/admin/adminStatus';

interface SidebarProps {
  /** drawer: the slide-over on small screens; rail: the persistent column on wide screens. */
  variant?: 'drawer' | 'rail';
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ variant = 'drawer', collapsed = false, onToggleCollapsed, onNavigate }) => {
  const { userName, userId } = useAuthStore();
  const { role, load: loadAdminStatus } = useAdminStatus();
  const signOut = useSignOut();

  // Only decides whether to show the Admin links; the backend enforces the role itself.
  useEffect(() => {
    void loadAdminStatus(userId);
  }, [userId, loadAdminStatus]);

  const iconOnly = variant === 'rail' && collapsed;

  return (
    <aside
      className={`app-sidebar app-sidebar--${variant}${iconOnly ? ' app-sidebar--collapsed' : ''}`}
      aria-label="Main navigation"
    >
      <nav className="sidebar-nav">
        {NAV_GROUPS.filter((g) => !g.adminOnly || role === 'admin').map((group) => (
          <div key={group.title} role="group" aria-label={group.title}>
            {!iconOnly && <div className="nav-divider">{group.title}</div>}
            {group.items.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={onNavigate}
                title={iconOnly ? label : undefined}
                aria-label={iconOnly ? label : undefined}
              >
                <Icon size={18} aria-hidden="true" />
                {!iconOnly && <span>{label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        {userName && !iconOnly && (
          <div style={{ padding: '0 12px 12px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Logged in as <strong>{userName}</strong>
          </div>
        )}
        <button
          type="button"
          className="nav-link"
          onClick={() => {
            signOut();
            onNavigate?.();
          }}
          title={iconOnly ? 'Logout' : undefined}
          aria-label={iconOnly ? 'Logout' : undefined}
          style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer' }}
        >
          <LogOut size={18} aria-hidden="true" />
          {!iconOnly && <span>Logout</span>}
        </button>
        {variant === 'rail' && onToggleCollapsed && (
          <button
            type="button"
            className="nav-link"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
            aria-expanded={!collapsed}
            style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer' }}
          >
            {collapsed ? <ChevronsRight size={18} aria-hidden="true" /> : <ChevronsLeft size={18} aria-hidden="true" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        )}
      </div>
    </aside>
  );
};
