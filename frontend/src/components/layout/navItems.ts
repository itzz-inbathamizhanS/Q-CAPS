import {
  BarChart3,
  GraduationCap,
  FileQuestion,
  ShieldCheck,
  TrendingUp,
  Award,
  Trophy,
  Compass,
  Settings2,
  ScrollText,
  Gauge,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
  adminOnly?: boolean;
}

// Grouped by the research workflow: assess -> secure -> learn -> measure progress.
export const NAV_GROUPS: NavGroup[] = [
  { title: 'Overview', items: [{ to: '/dashboard', label: 'Dashboard', icon: BarChart3 }] },
  {
    title: 'Assess',
    items: [
      { to: '/assessment', label: 'Diagnostic', icon: FileQuestion },
      { to: '/skills', label: 'Skills & gaps', icon: Gauge },
    ],
  },
  { title: 'Secure', items: [{ to: '/scanner', label: 'Crypto scanner', icon: ShieldCheck }] },
  {
    title: 'Learn',
    items: [
      { to: '/learning', label: 'My learning', icon: GraduationCap },
      { to: '/curriculum', label: 'Curriculum & missions', icon: Compass },
    ],
  },
  {
    title: 'Progress',
    items: [
      { to: '/reassessment', label: 'Reassessment', icon: TrendingUp },
      { to: '/badges', label: 'Badges & certificates', icon: Award },
      { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    ],
  },
  {
    title: 'Admin',
    adminOnly: true,
    items: [
      { to: '/admin', label: 'Course management', icon: Settings2, end: true },
      { to: '/admin/audit', label: 'Audit log', icon: ScrollText },
    ],
  },
];
