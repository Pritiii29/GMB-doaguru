import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Center Spinner Component for Loading Fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-lg"></div>
  </div>
);

// Lazy Loading User Pages
const Home = lazy(() => import('../pages/user/Home'));
const ThankYou = lazy(() => import('../pages/user/ThankYou'));
const Redirect = lazy(() => import('../pages/user/Redirect'));

// Lazy Loading Admin Pages
const Dashboard = lazy(() => import('../pages/admin/Dashboard'));
const Reviews = lazy(() => import('../pages/admin/Reviews'));
const Clients = lazy(() => import('../pages/admin/Clients'));
const Login = lazy(() => import('../pages/admin/Login'));
const QRPage = lazy(() => import('../pages/admin/QRPage'));
const Settings = lazy(() => import('../pages/admin/Settings'));
const Navbar = lazy(() => import('../components/Navbar'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Funnel Routes */}
        <Route path="/" element={<Navigate to="/review?clientId=admin" replace />} />
        <Route path="/review" element={<Home />} />
        <Route path="/review/:clientId" element={<Home />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/redirect" element={<Redirect />} />

        {/* Admin Authentication */}
        <Route path="/admin/login" element={<Login />} />

        {/* Admin Protected Routes (using Navbar as Layout) */}
        <Route path="/admin" element={<Navbar />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="clients" element={<Clients />} />
          <Route path="qrcode" element={<QRPage />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
