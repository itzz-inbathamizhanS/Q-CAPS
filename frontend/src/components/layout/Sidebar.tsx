import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  GraduationCap,
  FileQuestion,
  Terminal,
  Rocket,
  ShieldCheck,
  TrendingUp,
  Award,
  Trophy,
  LogOut,
  Compass
} from 'lucide-react';
import qcapsLogo from '@/assets/brand/qcaps-logo.png';
import { useAuthStore } from '@/features/auth/authStore';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';

interface SidebarProps {
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobile = false, onCloseMobile }) => {
  const navigate = useNavigate();
  const { userName, logout } = useAuthStore();
  const { clearLocalProgress } = useCurriculumStore();

  const handleLinkClick = () => {
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleLogout = () => {
    logout();
    clearLocalProgress();
    navigate('/login');
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside
      className={`app-sidebar ${isMobile ? 'mobile-sidebar' : ''}`}
      style={isMobile ? { position: 'relative', width: '100%', height: '100%' } : {}}
    >
      {/* Brand Header */}
      <div className="brand-header">
        <img
          src={qcapsLogo}
          alt="Q-CAPS Logo"
          className="brand-logo"
        />
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={handleLinkClick}
        >
          <BarChart3 size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/learning"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={handleLinkClick}
        >
          <GraduationCap size={18} />
          <span>My Learning</span>
        </NavLink>

        <NavLink
          to="/curriculum"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={handleLinkClick}
        >
          <Compass size={18} />
          <span>Curriculum Map</span>
        </NavLink>

        <NavLink
          to="/assessment"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={handleLinkClick}
        >
          <FileQuestion size={18} />
          <span>Assessments</span>
        </NavLink>

        <NavLink
          to="/escape-room"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={handleLinkClick}
        >
          <Terminal size={18} />
          <span>Practical Labs</span>
        </NavLink>

        <NavLink
          to="/missions"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={handleLinkClick}
        >
          <Rocket size={18} />
          <span>Mission Control</span>
        </NavLink>

        <NavLink
          to="/scanner"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={handleLinkClick}
        >
          <ShieldCheck size={18} />
          <span>Crypto Scanner</span>
        </NavLink>


        {/* Metrics Group */}
        <div className="nav-divider">
          Metrics
        </div>

        <NavLink
          to="/reassessment"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={handleLinkClick}
        >
          <TrendingUp size={18} />
          <span>Progress</span>
        </NavLink>

        <NavLink
          to="/skills"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={handleLinkClick}
        >
          <TrendingUp size={18} />
          <span>Skills Profile</span>
        </NavLink>

        <NavLink
          to="/badges"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={handleLinkClick}
        >
          <Award size={18} />
          <span>Badges & Certs</span>
        </NavLink>

        <NavLink
          to="/organization"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={handleLinkClick}
        >
          <Trophy size={18} />
          <span>Leaderboard</span>
        </NavLink>
      </nav>

      {/* Footer Links */}
      <div className="sidebar-footer">
        {userName && (
          <div style={{ padding: '0 12px 12px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Logged in as <strong>{userName}</strong>
          </div>
        )}
        <button 
          className="nav-link" 
          onClick={handleLogout}
          style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer' }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
