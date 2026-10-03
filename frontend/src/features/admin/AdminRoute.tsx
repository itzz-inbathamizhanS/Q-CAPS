import React, { useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@/features/auth/authStore';
import { useAdminStatus } from './adminStatus';
import '@/styles/lesson.css';

/** Gate for /admin. This is a convenience: every admin API call is authorised by the
 *  backend, so opening the page without the role would only show empty error states. */
export const AdminRoute: React.FC = () => {
  const userId = useAuthStore((s) => s.userId);
  const { role, load } = useAdminStatus();

  useEffect(() => {
    void load(userId);
  }, [userId, load]);

  if (role === 'unknown') {
    return (
      <div className="ls-page" role="status" aria-busy="true">
        <div className="ls-skeleton ls-skeleton--header" />
      </div>
    );
  }

  if (role !== 'admin') {
    return (
      <div className="ls-page">
        <div className="ls-card ls-state" role="alert">
          <ShieldAlert size={28} aria-hidden="true" />
          <h1 className="ls-card-title">Admin access required</h1>
          <p className="ls-muted">Your account does not have permission to manage course content.</p>
          <Link to="/dashboard" className="ls-btn ls-btn--secondary">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
