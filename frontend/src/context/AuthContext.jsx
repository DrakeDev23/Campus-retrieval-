import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClerkProvider, useAuth as useClerkAuth, useUser as useClerkUser, useClerk } from '@clerk/clerk-react';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';
const HAS_CLERK_KEY = Boolean(CLERK_PUBLISHABLE_KEY && CLERK_PUBLISHABLE_KEY.trim().length > 0 && !CLERK_PUBLISHABLE_KEY.includes('placeholder'));

const MOCK_STORAGE_KEY = 'itemfinder_auth_session_v1';

export const MOCK_STUDENT_USER = {
  id: 'usr_student_2024_08912',
  studentId: '2024-08912',
  fullName: 'Jane G. Doe',
  email: 'janedoe@gmail.com',
  role: 'student',
  course: 'BS Computer Science',
  yearLevel: '3rd Year',
  badge: 'Verified Student',
};

export const MOCK_ADMIN_USER = {
  id: 'usr_admin_sec_402',
  studentId: 'ADMIN-SEC-402',
  fullName: 'Officer R. Santos',
  email: 'security.admin@university.edu',
  role: 'admin',
  badge: 'Security Desk Administrator',
};

const AuthContext = createContext(null);

function MockAuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(MOCK_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') return parsed;
        }
      }
    } catch {
    }
    return null;
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 80);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (user) {
          window.localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(user));
        } else {
          window.localStorage.removeItem(MOCK_STORAGE_KEY);
        }
      }
    } catch {
    }
  }, [user]);

  const login = (userData) => {
    const rawId = (userData?.studentId || '').trim();
    const isAdmin = rawId.toLowerCase() === 'admin' || userData?.role === 'admin';
    const role = isAdmin ? 'admin' : 'student';
    const base = isAdmin ? MOCK_ADMIN_USER : MOCK_STUDENT_USER;
    const merged = {
      ...base,
      ...userData,
      id: isAdmin ? MOCK_ADMIN_USER.id : base.id,
      studentId: isAdmin ? MOCK_ADMIN_USER.studentId : (rawId || base.studentId),
      fullName: isAdmin ? MOCK_ADMIN_USER.fullName : base.fullName,
      email: isAdmin ? MOCK_ADMIN_USER.email : base.email,
      role,
      badge: isAdmin ? MOCK_ADMIN_USER.badge : base.badge,
    };
    setUser(merged);
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    isClerkEnabled: false,
    isLoaded,
    user,
    isAuthenticated: Boolean(user),
    role: user?.role || 'student',
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function ClerkAuthBridge({ children }) {
  const { isLoaded: clerkLoaded, isSignedIn, signOut } = useClerkAuth();
  const { user: clerkUser, isLoaded: userLoaded } = useClerkUser();

  const isLoaded = clerkLoaded && userLoaded;

  const role = clerkUser?.publicMetadata?.role || 'student';

  const user = isSignedIn && clerkUser
    ? {
        id: clerkUser.id,
        studentId: clerkUser.publicMetadata?.studentId || clerkUser.username || clerkUser.id.slice(-8),
        fullName: clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Authenticated User',
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        role,
        badge: role === 'admin' ? 'Security Desk Administrator' : 'Verified Student',
      }
    : null;

  const value = {
    isClerkEnabled: true,
    isLoaded,
    user,
    isAuthenticated: Boolean(isSignedIn && user),
    role,
    login: () => {},
    logout: async () => {
      await signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }) {
  if (HAS_CLERK_KEY) {
    return (
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        <ClerkAuthBridge>{children}</ClerkAuthBridge>
      </ClerkProvider>
    );
  }

  return <MockAuthProvider>{children}</MockAuthProvider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
