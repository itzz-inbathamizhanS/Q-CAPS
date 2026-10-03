import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/authStore';
import { handleUnauthorized } from '@/features/auth/session';
import { BACKEND_BASE_URL } from '@/services/backendService';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, token } = useAuthStore();

  // The persisted "logged in" flag is only a hint. Ask the server once per token whether it still
  // accepts it, so a dead session (expired token, reset database, rotated secret) goes back to the
  // login page instead of failing silently on every request. A network error is not treated as
  // logout: the backend being down should not discard a valid session.
  useEffect(() => {
    if (!isAuthenticated || !token) return;
    let cancelled = false;
    fetch(`${BACKEND_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!cancelled && res.status === 401) handleUnauthorized();
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, token]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
