import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Members } from '@/pages/Members';
import { Payments } from '@/pages/Payments';
import { Reports } from '@/pages/Reports';
import { Reminders } from '@/pages/Reminders';
import { Settings } from '@/pages/Settings';
import { Finance } from '@/pages/Finance';

import './App.css';

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// App Routes component
const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} 
      />
      
      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="/members" element={<Members />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="youth-ministry-theme">
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;