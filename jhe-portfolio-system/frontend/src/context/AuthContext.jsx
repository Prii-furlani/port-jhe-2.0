import React, { createContext, useContext, useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jhe_token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  const updateGlobalTheme = (themeMode) => {
    let activeTheme = themeMode;
    if (themeMode === 'system') {
      activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', activeTheme);
    if (activeTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', themeMode);
  };

  useEffect(() => {
    // Se temos o token no localStorage, podemos considerar autenticado
    if (token) {
      setIsAuthenticated(true);
      // Decodifica o JWT no frontend para recuperar os dados (nome, role, etc)
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decodedUser = JSON.parse(jsonPayload);
        
        if (decodedUser.exp) {
          const expirationTime = decodedUser.exp * 1000;
          const currentTime = Date.now();
          const timeLeft = expirationTime - currentTime;

          if (timeLeft <= 0) {
            logout();
            Swal.fire('Sessão Expirada', 'Você foi deslogado por questões de segurança.', 'warning');
            return;
          } else {
            const timeoutId = setTimeout(() => {
              logout();
              Swal.fire('Sessão Expirada', 'Você foi deslogado por questões de segurança.', 'warning');
            }, timeLeft);
            
            setUser(decodedUser);
            // Apply theme on load if different
            if (decodedUser.theme) {
              updateGlobalTheme(decodedUser.theme);
            }
            return () => clearTimeout(timeoutId);
          }
        }

        setUser(decodedUser);
        if (decodedUser.theme) {
          updateGlobalTheme(decodedUser.theme);
        }
      } catch (error) {
        console.error("Falha ao decodificar token", error);
        logout();
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('jhe_token', data.token);
        setToken(data.token);
        setUser(data.user);
        if (data.user.theme) {
            updateGlobalTheme(data.user.theme);
        }
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error || 'Falha na autenticação.' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Erro de conexão com o servidor.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('jhe_token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout, updateGlobalTheme }}>
      {children}
    </AuthContext.Provider>
  );
};
