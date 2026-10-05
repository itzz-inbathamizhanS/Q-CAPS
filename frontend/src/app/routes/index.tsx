import { lazy, Suspense, type ComponentType } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { StateMessage } from '@/components/ui/StateMessage';
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
import { ErrorPage } from '@/pages/ErrorPage';
import { Organization } from '@/pages/Organization';


// Code-split routes (plan task T0.6): admin, scanner, missions, quizzes, reassessment, badges and closure load on first visit.
function lazyNamed<K extends string>(load: () => Promise<Record<K, ComponentType>>, name: K) {
  const Component = lazy(async () => ({ default: (await load())[name] as ComponentType }));
  return function LazyRoute() {
    return (
      <Suspense fallback={<StateMessage kind="loading" message="Loading…" />}>
        <Component />
      </Suspense>
    );
  };
}

const AdminRoute = lazyNamed(() => import('@/features/admin/AdminRoute'), 'AdminRoute');
const AdminCourses = lazyNamed(() => import('@/pages/AdminCourses'), 'AdminCourses');
const AdminSectionEditor = lazyNamed(() => import('@/pages/AdminSectionEditor'), 'AdminSectionEditor');
const AdminAudit = lazyNamed(() => import('@/pages/AdminAudit'), 'AdminAudit');
const QuizPage = lazyNamed(() => import('@/pages/QuizPage'), 'QuizPage');
const BadgesAndCerts = lazyNamed(() => import('@/pages/BadgesAndCerts'), 'BadgesAndCerts');
const MissionPlay = lazyNamed(() => import('@/pages/MissionPlay'), 'MissionPlay');
const ScannerPage = lazyNamed(() => import('@/pages/ScannerPage'), 'ScannerPage');
const Reassessment = lazyNamed(() => import('@/pages/Reassessment'), 'Reassessment');
const ClosurePage = lazyNamed(() => import('@/pages/ClosurePage'), 'ClosurePage');

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
            element: <Navigate to="/curriculum" replace />,
          },
          {
            path: 'missions/:missionId',
            element: <MissionPlay />,
          },
          {
            path: 'escape-room',
            element: <Navigate to="/curriculum" replace />,
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
            path: 'closure/:findingId',
            element: <ClosurePage />,
          },
        ]
      }
    ]
  },
]);
