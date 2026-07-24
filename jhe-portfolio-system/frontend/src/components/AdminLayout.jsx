import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import ChangePasswordModal from './Modals/ChangePasswordModal';

const AdminLayout = () => {
  const { isAuthenticated } = useAuth();
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);

  // Proteção da rota base: se não estiver logado, joga pro login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      {/* Sidebar persistente na esquerda recebendo o state */}
      <Sidebar onOpenPasswordModal={() => setPasswordModalOpen(true)} />
      
      {/* Área central onde o conteúdo das páginas vai renderizar dinamicamente */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <Outlet />
      </main>

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setPasswordModalOpen(false)} 
      />
    </div>
  );
};

export default AdminLayout;
