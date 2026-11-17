import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import { AppAuthProvider, useAppAuth } from '@/lib/appAuth';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import AppShell from '@/components/AppShell';
import Dashboard from '@/pages/Dashboard';
import VoiceInterviewer from '@/pages/VoiceInterviewer';
import EtiquetteGuide from '@/pages/EtiquetteGuide';
import ProfileSettings from '@/pages/ProfileSettings';
import ResumeBuilder from '@/pages/ResumeBuilder';

function ProtectedShell() {
  const { user, loading } = useAppAuth();
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#F6F7F9]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-navy rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <AppShell />;
}

function App() {
  return (
    <AuthProvider>
      <AppAuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route element={<ProtectedShell />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/interview" element={<VoiceInterviewer />} />
                <Route path="/resume" element={<ResumeBuilder />} />
                <Route path="/etiquette" element={<EtiquetteGuide />} />
                <Route path="/profile" element={<ProfileSettings />} />
              </Route>
              <Route path="*" element={<PageNotFound />} />
            </Routes>
            <Toaster />
          </Router>
        </QueryClientProvider>
      </AppAuthProvider>
    </AuthProvider>
  );
}

export default App;