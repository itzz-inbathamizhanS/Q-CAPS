import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from './authStore';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';
import { useAdminStatus } from '@/features/admin/adminStatus';

/** Sign out everywhere it is offered (sidebar, header menu): clear the session, the cached admin role and the
 *  locally mirrored progress, then go to the login page. */
export function useSignOut(): () => void {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const resetAdminStatus = useAdminStatus((s) => s.reset);
  const clearLocalProgress = useCurriculumStore((s) => s.clearLocalProgress);
  return useCallback(() => {
    logout();
    resetAdminStatus();
    clearLocalProgress();
    navigate('/login');
  }, [logout, resetAdminStatus, clearLocalProgress, navigate]);
}
