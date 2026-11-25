import { useAuth } from '../context/AuthContext';

export function useCurrentUser() {
  const { user, isAuthenticated, isLoaded, role, isClerkEnabled, logout } = useAuth();

  return {
    user,
    isAuthenticated,
    isLoaded,
    role,
    isAdmin: role === 'admin',
    isStudent: role === 'student',
    isClerkEnabled,
    logout,
  };
}
