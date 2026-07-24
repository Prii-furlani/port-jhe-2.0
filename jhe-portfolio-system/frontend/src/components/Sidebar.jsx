import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Activity,
  ShieldAlert,
  Settings,
  User,
  KeyRound,
  ExternalLink,
  Moon,
  Sun,
  LogOut,
  BarChart2,
  ClipboardCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ onOpenPasswordModal }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  // Theme logic isolated for now (or move to context later)
  const [theme, setTheme] = React.useState('light');
  const [logos, setLogos] = React.useState({ light: null, dark: null });

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/settings/home');
        const data = await res.json();
        if (data.success && data.data) {
          setLogos({
            light: data.data.logo_light ? `http://localhost:5000${data.data.logo_light}` : null,
            dark: data.data.logo_dark ? `http://localhost:5000${data.data.logo_dark}` : null,
          });
        }
      } catch (err) {
        console.error('Erro ao buscar logos da sidebar', err);
      }
    };
    fetchSettings();
  }, []);

  React.useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(currentTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // RBAC: Verifica se o usuário é Master Admin usando a role do DB
  const isMasterAdmin = user?.role === 'admin_master';

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <aside className="sidebar-wrapper">
      <div>
        {/* BRAND LOGO */}
        <div className="sidebar-header">
          <Link to="/" style={{ textDecoration: 'none' }}>
            {(theme === 'dark' && logos.dark) || (theme === 'light' && logos.light) ? (
              <img src={theme === 'dark' ? (logos.dark || logos.light) : (logos.light || logos.dark)} alt="JHE Consultores" style={{ height: '40px', objectFit: 'contain' }} />
            ) : (
              <h1 className="sidebar-logo-text">JHE</h1>
            )}
          </Link>
        </div>

        {/* NAVEGAÇÃO PRINCIPAL */}
        <nav className="sidebar-nav">
          <Link to={isMasterAdmin ? "/admin/dashboard" : "/user/dashboard"} className={`sidebar-link ${isActive(isMasterAdmin ? '/admin/dashboard' : '/user/dashboard')}`}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>

          <Link to="/admin/projects" className={`sidebar-link ${isActive('/admin/projects')}`}>
            <FolderKanban size={18} />
            <span>Projetos</span>
          </Link>



          {/* ITENS EXCLUSIVOS PARA ADMIN MASTER */}
          {isMasterAdmin && (
            <>
              <div className="sidebar-divider" />

              <Link to="/admin/telemetry" className={`sidebar-link ${isActive('/admin/telemetry')}`}>
                <Activity size={18} />
                <span>Telemetria Executiva</span>
              </Link>

              <Link to="/admin/audit-logs" className={`sidebar-link ${isActive('/admin/audit-logs')}`}>
                <ShieldAlert size={18} />
                <span>Logs de Auditoria</span>
              </Link>

              <Link to="/admin/home-settings" className={`sidebar-link ${isActive('/admin/home-settings')}`}>
                <Settings size={18} />
                <span>Configurações Home</span>
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* RODAPÉ DO USUÁRIO & PERFIL */}
      <div className="sidebar-footer">
        {/* NOME DO USUÁRIO LOGADO */}
        <div className="sidebar-user-profile">
          <User className="accordion-toggle-icon" size={18} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.nome || 'Usuário Autenticado'}
          </span>
        </div>

        {/* BOTÕES DE AÇÃO RÁPIDA */}
        <button onClick={onOpenPasswordModal} className="sidebar-link">
          <KeyRound size={16} />
          <span>Alterar Senha</span>
        </button>

        <a href="/" rel="noopener noreferrer" className="sidebar-link">
          <ExternalLink size={16} />
          <span>Ver Site</span>
        </a>

        <button onClick={toggleTheme} className="sidebar-link">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          <span>{theme === 'dark' ? 'Tema Claro' : 'Tema Escuro'}</span>
        </button>

        <button onClick={logout} className="sidebar-link danger" style={{ marginTop: '0.5rem' }}>
          <LogOut size={16} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
