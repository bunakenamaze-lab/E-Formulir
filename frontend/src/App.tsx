import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
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
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/f/:slug" element={<PublicFormPage />} />
            <Route path="/f/:slug/success" element={<FormSuccessPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/forms" element={<FormsListPage />} />
                <Route path="/forms/new" element={<FormBuilderPage />} />
                <Route path="/forms/:id/edit" element={<FormBuilderPage />} />
                <Route path="/forms/:id" element={<FormDetailPage />} />
                <Route path="/forms/:id/responses" element={<FormResponsesPage />} />
                <Route path="/templates" element={<TemplatesPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/audit" element={<AuditLogPage />} />
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
