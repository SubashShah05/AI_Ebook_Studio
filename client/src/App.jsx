import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import AuthenticatedLayout from './components/layout/AuthenticatedLayout';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateBook from './pages/CreateBook';
import BookDetails from './pages/BookDetails';
import ChapterEditor from './pages/ChapterEditor';
import Onboarding from './pages/Onboarding';
import Templates from './pages/Templates';
import MyBooks from './pages/MyBooks';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import ExportStudio from './pages/ExportStudio';
import Exports from './pages/Exports';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Help from './pages/Help';
import ReadingMode from './pages/ReadingMode';
import Analytics from './pages/Analytics';
import Pricing from './pages/Pricing';
import Billing from './pages/Billing';
import Team from './pages/Team';
import AcceptInvite from './pages/AcceptInvite';
import AIToolsRedirect from './pages/AIToolsRedirect';

// Admin Pages
import AdminRoute from './components/AdminRoute';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminBooks from './pages/admin/AdminBooks';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import AdminTemplates from './pages/admin/AdminTemplates';
import AdminAIUsage from './pages/admin/AdminAIUsage';
import AdminActivity from './pages/admin/AdminActivity';
import AdminSecurity from './pages/admin/AdminSecurity';
import AdminAudit from './pages/admin/AdminAudit';
import AdminSystemHealth from './pages/admin/AdminSystemHealth';

import NotFound from './pages/NotFound';

// Legacy Layout
const AppLayout = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
    <Navbar />
    <main className="flex-grow">
      <Outlet />
    </main>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/signup" element={<Register />} />
            <Route path="/pricing" element={<Pricing />} />
            {/* Invitation accept - protected but standalone */}
            <Route path="/invite" element={<PrivateRoute><AcceptInvite /></PrivateRoute>} />
            
            {/* Fullscreen protected routes */}
            <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />
            {/* Reading Mode - fullscreen, no sidebar */}
            <Route path="/books/:bookId/read" element={<PrivateRoute><ReadingMode /></PrivateRoute>} />
            
            {/* SaaS Dashboard Routes */}
            <Route element={<PrivateRoute><AuthenticatedLayout /></PrivateRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create" element={<CreateBook />} />
              <Route path="/books/:id" element={<BookDetails />} />
              <Route path="/books" element={<MyBooks />} />
              <Route path="/chapters/:id" element={<ChapterEditor />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetails />} />
              <Route path="/books/:bookId/export" element={<ExportStudio />} />
              
              {/* Remaining stub routes */}
              <Route path="/ai-writer" element={<AIToolsRedirect />} />
              <Route path="/ai-outline" element={<AIToolsRedirect />} />
              <Route path="/ai-assistant" element={<AIToolsRedirect />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/team" element={<Team />} />
              <Route path="/exports" element={<Exports />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/help" element={<Help />} />
            </Route>
            {/* Admin Routes — protected by AdminRoute (role=admin check) */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="users/:id" element={<AdminUserDetail />} />
              <Route path="books" element={<AdminBooks />} />
              <Route path="subscriptions" element={<AdminSubscriptions />} />
              <Route path="templates" element={<AdminTemplates />} />
              <Route path="ai-usage" element={<AdminAIUsage />} />
              <Route path="activity" element={<AdminActivity />} />
              <Route path="security" element={<AdminSecurity />} />
              <Route path="audit" element={<AdminAudit />} />
              <Route path="system-health" element={<AdminSystemHealth />} />
            </Route>
            {/* Catch-all 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}