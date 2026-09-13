import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  GraduationCap,
  FileQuestion,
  Terminal,
  Rocket,
  ShieldCheck,
  History,
  TrendingUp,
  Award,
  Trophy,
  User,
  Settings,
  HelpCircle,
} from 'lucide-react';
import qcapsLogo from '@/assets/brand/qcaps-logo.png';

interface SidebarProps {
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobile = false, onCloseMobile }) => {
  const handleLinkClick = () => {
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

        <NavLink
          to="/scanner"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={handleLinkClick}
        >
          <History size={18} />
          <span>Scan History</span>
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
        <a href="#account" className="nav-link" onClick={handleLinkClick}>
          <User size={18} />
          <span>Account</span>
        </a>

        <a href="#settings" className="nav-link" onClick={handleLinkClick}>
          <Settings size={18} />
          <span>Settings</span>
        </a>

        <a href="#help" className="nav-link" onClick={handleLinkClick}>
          <HelpCircle size={18} />
          <span>Help</span>
        </a>
      </div>
    </aside>
  );
};
