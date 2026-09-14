import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { Dashboard } from '@/pages/Dashboard';
import { Assessment } from '@/pages/Assessment';
import { Skills } from '@/pages/Skills';
import { CurriculumMap } from '@/pages/CurriculumMap';
import { CourseModule } from '@/pages/CourseModule';
import { QuizPage } from '@/pages/QuizPage';
import { BadgesAndCerts } from '@/pages/BadgesAndCerts';
import { MissionHub } from '@/pages/MissionHub';
import { MissionPlay } from '@/pages/MissionPlay';
import { EscapeRoomPage } from '@/pages/EscapeRoomPage';
import { ScannerPage } from '@/pages/ScannerPage';
import { Organization } from '@/pages/Organization';
import { Reassessment } from '@/pages/Reassessment';
import { Community } from '@/pages/Community';
import { ErrorPage } from '@/pages/ErrorPage';
export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AppShell />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <ProtectedRoute />,
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
            element: <CurriculumMap />,
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
            path: 'reassessment',
            element: <Reassessment />,
          },
          {
            path: 'organization',
            element: <Organization />,
          },
          {
            path: 'community',
            element: <Community />,
          },
        ]
      }
    ]
  },
]);
