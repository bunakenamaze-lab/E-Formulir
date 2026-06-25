import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RoleGuard from '@/components/auth/RoleGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Pages
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import FormsListPage from '@/pages/FormsListPage';
import FormBuilderPage from '@/pages/FormBuilderPage';
import FormDetailPage from '@/pages/FormDetailPage';
import FormResponsesPage from '@/pages/FormResponsesPage';
import PublicFormPage from '@/pages/PublicFormPage';
import FormSuccessPage from '@/pages/FormSuccessPage';
import TemplatesPage from '@/pages/TemplatesPage';
import UsersPage from '@/pages/UsersPage';
import SettingsPage from '@/pages/SettingsPage';
import ProfilePage from '@/pages/ProfilePage';
import AuditLogPage from '@/pages/AuditLogPage';
import NotFoundPage from '@/pages/NotFoundPage';

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="pcnu-theme">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* ─── Public Routes ─── */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/f/:slug" element={<PublicFormPage />} />
            <Route path="/f/:slug/success" element={<FormSuccessPage />} />

            {/* ─── Protected Routes ─── */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Dashboard — semua role */}
                <Route path="/dashboard" element={<DashboardPage />} />

                {/* Formulir — semua role (operator hanya lihat) */}
                <Route path="/forms" element={<FormsListPage />} />
                <Route path="/forms/:id" element={<FormDetailPage />} />
                <Route path="/forms/:id/responses" element={<FormResponsesPage />} />

                {/* Builder — Admin & Super Admin */}
                <Route
                  path="/forms/new"
                  element={
                    <RoleGuard roles={['SUPER_ADMIN', 'ADMIN']}>
                      <FormBuilderPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/forms/:id/edit"
                  element={
                    <RoleGuard roles={['SUPER_ADMIN', 'ADMIN']}>
                      <FormBuilderPage />
                    </RoleGuard>
                  }
                />

                {/* Template — Admin & Super Admin */}
                <Route
                  path="/templates"
                  element={
                    <RoleGuard roles={['SUPER_ADMIN', 'ADMIN']}>
                      <TemplatesPage />
                    </RoleGuard>
                  }
                />

                {/* Users — Super Admin only */}
                <Route
                  path="/users"
                  element={
                    <RoleGuard roles={['SUPER_ADMIN']}>
                      <UsersPage />
                    </RoleGuard>
                  }
                />

                {/* Audit Log — Super Admin only */}
                <Route
                  path="/audit"
                  element={
                    <RoleGuard roles={['SUPER_ADMIN']}>
                      <AuditLogPage />
                    </RoleGuard>
                  }
                />

                {/* Settings — Super Admin only */}
                <Route
                  path="/settings"
                  element={
                    <RoleGuard roles={['SUPER_ADMIN']}>
                      <SettingsPage />
                    </RoleGuard>
                  }
                />

                {/* Profil — semua role */}
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>

          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
