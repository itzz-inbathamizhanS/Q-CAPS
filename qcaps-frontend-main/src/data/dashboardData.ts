export interface CurrentUser {
  id: string;
  name: string;
  role: string;
  level: string;
  avatarInitials: string;
}

export interface KpiMetric {
  id: string;
  title: string;
  value: string;
  badge?: {
    text: string;
    variant: 'cyan' | 'primary' | 'secondary' | 'success';
  };
  supportingText: string;
  linkText: string;
  linkTo: string;
  visualType: 'ring' | 'bar' | 'icon';
  ringProgress?: number;
  barProgress?: number;
  iconName?: 'flame' | 'star' | 'shield';
  iconColor?: string;
  iconBgColor?: string;
}

export interface RecommendedModule {
  id: string;
  badgeText: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  progress: number;
  ctaText: string;
  ctaLink: string;
}

export interface PracticalChallenge {
  id: string;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  subtitle: string;
  iconName: 'trophy' | 'shield' | 'compass';
  colorType: 'primary' | 'secondary' | 'tertiary';
}

export interface WeeklyPracticeDay {
  day: string;
  active: boolean;
}

export interface SkillDomain {
  name: string;
  score: number;
  color: string;
}

export interface DashboardData {
  currentUser: CurrentUser;
  kpiMetrics: KpiMetric[];
  recommendedLearning: RecommendedModule;
  practicalChallenge: PracticalChallenge;
  achievements: AchievementItem[];
  weeklyPractice: {
    activeDaysCount: number;
    days: WeeklyPracticeDay[];
  };
  skillBreakdown: SkillDomain[];
}

export const mockDashboardData: DashboardData = {
  currentUser: {
    id: 'usr-001',
    name: 'Learner',
    role: 'Cybersecurity Practitioner',
    level: 'Foundational',
    avatarInitials: 'L',
  },
  kpiMetrics: [
    {
      id: 'kpi-capability',
      title: 'PQC Capability',
      value: '68%',
      badge: {
        text: '+4%',
        variant: 'cyan',
      },
      supportingText: '+4% since last assessment',
      linkText: 'View skill profile',
      linkTo: '/skills',
      visualType: 'ring',
      ringProgress: 68,
    },
    {
      id: 'kpi-learning',
      title: 'Learning Progress',
      value: '42%',
      supportingText: '8 of 19 lessons completed',
      linkText: 'View learning',
      linkTo: '/learning',
      visualType: 'bar',
      barProgress: 42,
    },
    {
      id: 'kpi-streak',
      title: 'Practice Streak',
      value: '6 days',
      supportingText: '4 active days this week',
      linkText: 'View activity',
      linkTo: '/reassessment',
      visualType: 'icon',
      iconName: 'flame',
      iconColor: 'var(--color-secondary)',
      iconBgColor: 'rgba(92, 75, 195, 0.1)',
    },
    {
      id: 'kpi-points',
      title: 'Capability Points',
      value: '1,250 pts',
      supportingText: 'Global rank #4',
      linkText: 'View leaderboard',
      linkTo: '/organization',
      visualType: 'icon',
      iconName: 'star',
      iconColor: 'var(--color-tertiary)',
      iconBgColor: 'rgba(0, 92, 121, 0.1)',
    },
  ],
  recommendedLearning: {
    id: 'mod-pqc-fund',
    badgeText: 'Recommended',
    title: 'PQC Fundamentals: From Cryptography to Quantum Safety',
    description: 'Understand the mathematical foundations of post-quantum cryptography, asymmetric vulnerabilities, and NIST standardization.',
    level: 'Beginner',
    duration: '45 min',
    progress: 60,
    ctaText: 'Continue Learning',
    ctaLink: '/learning',
  },
  practicalChallenge: {
    id: 'chal-tls-inspection',
    title: 'PQC Practical Challenge',
    description: 'Test your ability to identify and respond to cryptographic configuration risks in modern network endpoints.',
    ctaText: 'Start Challenge',
    ctaLink: '/challenges',
  },
  achievements: [
    {
      id: 'ach-1',
      title: 'Quantum Foundations',
      subtitle: 'Completed Fundamentals',
      iconName: 'trophy',
      colorType: 'secondary',
    },
    {
      id: 'ach-2',
      title: 'Cryptography Basics',
      subtitle: 'Identified classical cipher gaps',
      iconName: 'shield',
      colorType: 'tertiary',
    },
    {
      id: 'ach-3',
      title: 'PQC Explorer',
      subtitle: 'Lab Module 1 verified',
      iconName: 'compass',
      colorType: 'primary',
    },
  ],
  weeklyPractice: {
    activeDaysCount: 4,
    days: [
      { day: 'M', active: true },
      { day: 'T', active: true },
      { day: 'W', active: true },
      { day: 'Th', active: true },
      { day: 'F', active: false },
      { day: 'S', active: false },
      { day: 'S', active: false },
    ],
  },
  skillBreakdown: [
    { name: 'Cybersecurity Fundamentals', score: 85, color: 'var(--color-outline)' },
    { name: 'Cryptography Fundamentals', score: 70, color: 'var(--color-secondary)' },
    { name: 'PQC Concepts', score: 60, color: 'var(--color-primary)' },
    { name: 'PQC Standards', score: 45, color: 'var(--color-tertiary)' },
    { name: 'Applied PQC', score: 30, color: 'var(--color-technical-cyan)' },
  ],
};
