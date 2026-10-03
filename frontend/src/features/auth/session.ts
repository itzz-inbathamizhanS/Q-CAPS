import { useAuthStore } from './authStore';

/** Call when the backend answers 401 to an authenticated request: the stored token is no longer valid
 *  (expired, signed with a different secret, or the user no longer exists). */
export function handleUnauthorized(): void {
  const { isAuthenticated, expireSession } = useAuthStore.getState();
  if (isAuthenticated) expireSession();
}

export const SESSION_EXPIRED_MESSAGE = 'Your session has expired. Please sign in again.';
