import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Páginas Públicas
import Home from './pages/Home';
import Login from './pages/Login';
import ProjectDetail from './pages/ProjectDetail';

// Layout e Páginas Administrativas
import AdminLayout from './components/AdminLayout';
import DashboardMaster from './pages/DashboardMaster';
import HomeSettings from './pages/admin/HomeSettings';
import ProjectManager from './components/ProjectManager';
import TelemetryView from './pages/admin/TelemetryView';
import UserTelemetryView from './pages/admin/UserTelemetryView';
import ProjectReviewQueue from './pages/admin/ProjectReviewQueue';
import UserDashboard from './pages/admin/UserDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/projetos/:id" element={<ProjectDetail />} />

          {/* Rotas Privadas (Envelopadas pelo AdminLayout) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardMaster />} />
            <Route path="home-settings" element={<HomeSettings />} />
            <Route path="projects" element={<ProjectManager />} />
            <Route path="projetos/revisoes" element={<ProjectReviewQueue />} />
            <Route path="my-telemetry" element={<UserTelemetryView />} />
            <Route path="telemetry" element={<TelemetryView />} />
            {/* Novas páginas podem ser adicionadas aqui e herdarão a Sidebar automaticamente */}
          </Route>

          {/* Rotas Privadas (Usuário Comum) */}
          <Route path="/user" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<UserDashboard />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
