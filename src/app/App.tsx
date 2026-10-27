import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/features/auth/AuthContext';
import { LoginPage } from '@/features/auth/LoginPage';
import { Layout } from './Layout';
import { CurriculumExplorer } from '@/features/curriculum/CurriculumExplorer';
import { LessonWizard } from '@/features/wizard/LessonWizard';
import { MyArchive } from '@/features/materials/MyArchive';
import { AdminDashboard } from '@/features/admin/AdminDashboard';

// 보호된 라우트 컴포넌트
const ProtectedRoute: React.FC<{ children: React.ReactNode; requireAdmin?: boolean }> = ({
  children,
  requireAdmin = false,
}) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && currentUser.role !== 'admin') {
    return <Navigate to="/curriculum" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/curriculum" replace />} />
        <Route path="curriculum" element={<CurriculumExplorer />} />
        <Route path="wizard" element={<LessonWizard />} />
        <Route path="archive" element={<MyArchive />} />
        <Route
          path="admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/curriculum" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
