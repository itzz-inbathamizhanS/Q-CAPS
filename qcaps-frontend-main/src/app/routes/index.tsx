import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Dashboard } from '@/pages/Dashboard';
import { Assessment } from '@/pages/Assessment';
import { Skills } from '@/pages/Skills';
import { Learning } from '@/pages/Learning';
import { CourseModule } from '@/pages/CourseModule';
import { QuizPage } from '@/pages/QuizPage';
import { BadgesAndCerts } from '@/pages/BadgesAndCerts';
import { MissionHub } from '@/pages/MissionHub';
import { MissionPlay } from '@/pages/MissionPlay';
import { EscapeRoomPage } from '@/pages/EscapeRoomPage';
import { ScannerPage } from '@/pages/ScannerPage';
import { Card } from '@/components/ui/Card';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'assessment',
        element: <Assessment />,
      },
      {
        path: 'skills',
        element: <Skills />,
      },
      {
        path: 'learning',
        element: <Learning />,
      },
      {
        path: 'learning/:moduleId',
        element: <CourseModule />,
      },
      {
        path: 'quiz/:moduleId',
        element: <QuizPage />,
      },
      {
        path: 'badges',
        element: <BadgesAndCerts />,
      },
      {
        path: 'missions',
        element: <MissionHub />,
      },
      {
        path: 'missions/:missionId',
        element: <MissionPlay />,
      },
      {
        path: 'escape-room',
        element: <EscapeRoomPage />,
      },
      {
        path: 'scanner',
        element: <ScannerPage />,
      },
      {
        path: 'challenges',
        element: (
          <Card variant="glass" padding="large">
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              Practical Simulation Labs
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Interactive endpoint inspection terminal. Implementation scheduled for subsequent phase.
            </p>
          </Card>
        ),
      },
      {
        path: 'reassessment',
        element: (
          <Card variant="glass" padding="large">
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              Progress & Reassessment Delta
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Before-and-after empirical delta benchmarking. Implementation scheduled for subsequent phase.
            </p>
          </Card>
        ),
      },
      {
        path: 'organization',
        element: (
          <Card variant="glass" padding="large">
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              Organization Workforce Capability
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Enterprise capability matrix. Implementation scheduled for subsequent phase.
            </p>
          </Card>
        ),
      },
    ],
  },
]);
