import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { Dashboard } from '@/pages/Dashboard';
import { Assessment } from '@/pages/Assessment';
import { Skills } from '@/pages/Skills';
import { CurriculumMap } from '@/pages/CurriculumMap';
import { Learning } from '@/pages/Learning';
import { ModuleOverview } from '@/pages/ModuleOverview';
import { SectionLesson } from '@/pages/SectionLesson';
import { AdminRoute } from '@/features/admin/AdminRoute';
import { AdminCourses } from '@/pages/AdminCourses';
import { AdminSectionEditor } from '@/pages/AdminSectionEditor';
import { AdminAudit } from '@/pages/AdminAudit';
import { QuizPage } from '@/pages/QuizPage';
import { BadgesAndCerts } from '@/pages/BadgesAndCerts';
import { MissionHub } from '@/pages/MissionHub';
import { MissionPlay } from '@/pages/MissionPlay';
import { EscapeRoomPage } from '@/pages/EscapeRoomPage';
import { ScannerPage } from '@/pages/ScannerPage';
import { ErrorPage } from '@/pages/ErrorPage';
import { ClosurePage } from '@/pages/ClosurePage';
import { Organization } from '@/pages/Organization';
import { Reassessment } from '@/pages/Reassessment';
import { Community } from '@/pages/Community';

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
            element: <Learning />,
          },
          {
            path: 'curriculum',
            element: <CurriculumMap />,
          },
          {
            path: 'learning/:moduleId',
            element: <ModuleOverview />,
          },
          {
            path: 'learning/:moduleId/:sectionId',
            element: <SectionLesson />,
          },
          {
            // The backend authorises every admin call; AdminRoute only avoids showing a broken page.
            path: 'admin',
            element: <AdminRoute />,
            children: [
              { index: true, element: <AdminCourses /> },
              { path: 'audit', element: <AdminAudit /> },
              { path: 'modules/:moduleId/sections/:sectionId', element: <AdminSectionEditor /> },
            ],
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
          {
            path: 'closure/:findingId',
            element: <ClosurePage />,
          },
        ]
      }
    ]
  },
]);
