import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/useCurrentUser';

export default function ProtectedRoute({ allowedRoles = ['student', 'admin'], children }) {
  const { isLoaded, isAuthenticated, role } = useCurrentUser();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname + location.search,
        }}
      />
    );
  }

  if (allowedRoles.includes('admin') && !allowedRoles.includes('student') && role === 'student') {
    return (
      <Navigate
        to="/dashboard"
        replace
        state={{
          unauthorizedMessage: 'Access restricted: Administrator privileges required.',
        }}
      />
    );
  }

  if (allowedRoles.includes('student') && !allowedRoles.includes('admin') && role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
