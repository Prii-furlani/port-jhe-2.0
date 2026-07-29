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
  ListTodo,
  LineChart,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ onOpenPasswordModal }) => {
  const location = useLocation();
  const { user, token, logout, updateGlobalTheme } = useAuth();

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
    const storedTheme = localStorage.getItem('theme');
    const currentTheme = storedTheme || document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    updateGlobalTheme(newTheme);

    if (user && token) {
      try {
        await fetch('http://localhost:5000/api/auth/theme', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ theme: newTheme })
        });
      } catch (e) {
        console.error('Failed to save theme preference', e);
      }
    }
  };

  const isMasterAdmin = user?.role === 'admin_master';
  const isActive = (path) => location.pathname.startsWith(path);

  const navLinkClass = (path, exact = false) => {
    const active = exact ? location.pathname === path : isActive(path);
    return `flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
      active 
      ? 'text-[#A07146] font-semibold border-l-2 border-[#A07146] bg-slate-50 dark:bg-slate-800/30' 
      : 'text-slate-400 hover:text-[#194775] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl'
    }`;
  };

  return (
    <aside className="w-[250px] h-screen sticky top-0 border-r border-slate-200 dark:border-white/5 flex flex-col justify-between transition-colors z-30" style={{ backgroundColor: 'var(--bg-sidebar)', color: 'var(--text-primary)' }}>
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pt-6 pb-4 flex flex-col gap-6">
        {/* BRAND LOGO */}
        <div className="px-2 mb-2">
          <Link to="/" className="block">
            {(theme === 'dark' && logos.dark) || (theme === 'light' && logos.light) ? (
              <img src={theme === 'dark' ? (logos.dark || logos.light) : (logos.light || logos.dark)} alt="JHE Consultores" className="h-10 object-contain" />
            ) : (
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">JHE<span className="text-[#A07146]">.</span></h1>
            )}
          </Link>
        </div>

        {/* NAVEGAÇÃO PRINCIPAL */}
        <nav className="flex flex-col gap-1.5">
          <Link to={isMasterAdmin ? "/admin/dashboard" : "/user/dashboard"} className={navLinkClass(isMasterAdmin ? '/admin/dashboard' : '/user/dashboard', true)}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>

          <Link to="/admin/projects" className={navLinkClass('/admin/projects', true)}>
            <FolderKanban size={20} />
            <span>Projetos</span>
          </Link>

          {/* ITENS EXCLUSIVOS PARA USUÁRIO (NÃO-ADMIN) */}
          {!isMasterAdmin && (
            <Link to="/admin/my-telemetry" className={navLinkClass('/admin/my-telemetry')}>
              <LineChart size={20} />
              <span>Minha Telemetria</span>
            </Link>
          )}

          {/* ITENS EXCLUSIVOS PARA ADMIN MASTER */}
          {isMasterAdmin && (
            <div className="mt-6 flex flex-col gap-1.5">
              <span className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 mt-2">Administração</span>
              
              <Link to="/admin/telemetry" className={navLinkClass('/admin/telemetry')}>
                <Activity size={20} />
                <span>Telemetria Executiva</span>
              </Link>

              <Link to="/admin/users" className={navLinkClass('/admin/users')}>
                <Users size={20} />
                <span>Gestão de Usuários</span>
              </Link>

              <Link to="/admin/audit-logs" className={navLinkClass('/admin/audit-logs')}>
                <ShieldAlert size={20} />
                <span>Logs de Auditoria</span>
              </Link>

              <Link to="/admin/home-settings" className={navLinkClass('/admin/home-settings')}>
                <Settings size={20} />
                <span>Configurações Home</span>
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* RODAPÉ DO USUÁRIO & PERFIL */}
      <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
        
        {/* NOME DO USUÁRIO LOGADO */}
        <div className="flex items-center gap-3 px-3 py-3 mb-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="w-9 h-9 rounded-full bg-[#194775]/10 dark:bg-[#38bdf8]/10 flex items-center justify-center text-[#194775] dark:text-[#38bdf8] shrink-0">
            <User size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-extrabold truncate" style={{ color: 'var(--text-primary)' }}>
              {user?.nome || 'Usuário Autenticado'}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
              {isMasterAdmin ? 'Admin Master' : 'Colaborador'}
            </p>
          </div>
        </div>

        {/* BOTÕES DE AÇÃO RÁPIDA */}
        <div className="flex flex-col gap-1">
          <button onClick={onOpenPasswordModal} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors w-full">
            <KeyRound size={16} />
            <span>Alterar Senha</span>
          </button>

          <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors w-full">
            <ExternalLink size={16} />
            <span>Ver Site</span>
          </a>

          <button onClick={toggleTheme} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors w-full">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>

          <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors mt-2 w-full">
            <LogOut size={16} />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
