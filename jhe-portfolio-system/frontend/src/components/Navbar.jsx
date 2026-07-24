import React, { useState, useEffect } from 'react';
import { Sun, Moon, Lock, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const [theme, setTheme] = useState('light');
  const { isAuthenticated, user } = useAuth();
  const [logos, setLogos] = useState({ light: null, dark: null });

  useEffect(() => {
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
        console.error('Erro ao buscar logos', err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <nav className="navbar-public flex justify-between items-center px-8 py-4 bg-white/80 dark:bg-[#020920]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 fixed top-0 w-full z-50">
      <div className="navbar-brand">
        <Link to="/">
          {(theme === 'dark' && logos.dark) || (theme === 'light' && logos.light) ? (
            <img src={theme === 'dark' ? (logos.dark || logos.light) : (logos.light || logos.dark)} alt="JHE Consultores" className="h-10 object-contain" />
          ) : (
            <img src="/logo.png" alt="JHE Consultores" className="h-10 object-contain" />
          )}
        </Link>
      </div>

      <div className="navbar-links flex items-center gap-8">
        <a href="#sobre" className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-[#194775] dark:hover:text-[#38bdf8] transition-colors">Sobre</a>
        <a href="#servicos" className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-[#194775] dark:hover:text-[#38bdf8] transition-colors">Serviços</a>
        <a href="#trajetoria" className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-[#194775] dark:hover:text-[#38bdf8] transition-colors">Trajetória</a>
        <a href="#portfolio" className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-[#194775] dark:hover:text-[#38bdf8] transition-colors">Portfólio</a>
        
        <button className="text-slate-500 hover:text-[#194775] dark:text-slate-400 dark:hover:text-white transition-colors" onClick={toggleTheme} aria-label="Toggle Theme">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {isAuthenticated ? (
          <Link to="/admin/dashboard" className="no-underline">
            <button className="bg-[#194775] text-white dark:bg-[#38bdf8] dark:text-slate-950 rounded-xl px-5 py-2.5 text-xs font-bold shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2.5 group">
              <span className="flex items-center gap-1.5">
                {user?.nome ? user.nome.split(' ')[0] : 'Painel'}
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              </span>
              <LayoutDashboard size={18} className="group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300" />
            </button>
          </Link>
        ) : (
          <Link to="/login" className="no-underline">
            <button className="border border-[#194775] text-[#194775] dark:border-[#38bdf8] dark:text-[#38bdf8] hover:bg-[#194775] hover:text-white dark:hover:bg-[#38bdf8] dark:hover:text-slate-900 rounded-xl px-5 py-2.5 text-xs font-bold transition-all duration-300 flex items-center gap-2 group">
              Área Restrita
              <Lock size={16} className="group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300" />
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
