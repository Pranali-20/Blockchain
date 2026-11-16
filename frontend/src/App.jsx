import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Web3Provider } from './context/Web3Context';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProviderDashboard from './pages/ProviderDashboard';
import PatientDashboard from './pages/PatientDashboard';
import VerificationPage from './pages/VerificationPage';
import TamperDemoLab from './pages/TamperDemoLab';
import AdminDashboard from './pages/AdminDashboard';
import BlockchainExplorer from './pages/BlockchainExplorer';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-xs text-slate-400">
        Authenticating session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Web3Provider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/verify" element={<VerificationPage />} />
                <Route path="/tamper-demo" element={<TamperDemoLab />} />
                <Route path="/explorer" element={<BlockchainExplorer />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Role Protected Routes */}
                <Route
                  path="/provider"
                  element={
                    <ProtectedRoute allowedRoles={['provider', 'admin']}>
                      <ProviderDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/patient"
                  element={
                    <ProtectedRoute allowedRoles={['patient', 'admin', 'provider']}>
                      <PatientDashboard />
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

                {/* Catch all fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </Web3Provider>
    </AuthProvider>
  );
}
