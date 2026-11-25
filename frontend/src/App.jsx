import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LandingPage from './components/landingPage';
import BrowseFoundItemsPage from './pages/BrowseFoundItemsPage';
import HowItWorksPage from './pages/HowItWorksPage';
import NotFoundPage from './pages/NotFoundPage';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminClaimReviewPage from './pages/AdminClaimReviewPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage initialMode="login" />} />
        <Route path="/register" element={<AuthPage initialMode="register" />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/catalog"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard defaultTab="admin-browse" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/claims/:claimId"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminClaimReviewPage />
            </ProtectedRoute>
          }
        />
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/browse-found-items" element={<BrowseFoundItemsPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
