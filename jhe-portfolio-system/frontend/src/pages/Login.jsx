import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, ArrowLeft, AlertCircle, ShieldCheck } from 'lucide-react';

const Login = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin_master') {
        navigate('/admin');
      } else if (user) {
        navigate('/user');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      if (result.user?.role === 'admin_master') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    } else {
      setError(result.error || 'Credenciais inválidas. Verifique e tente novamente.');
    }
  };

  return (
    <div className="login-page">
      {/* Coluna Esquerda: Hero institucional */}
      <div className="login-hero">
        <div className="login-hero-brand">
          <Link to="/" className="login-hero-logo">JHE Engenharia</Link>
          <span className="login-hero-tagline">Painel Administrativo & Gestão de Ativos</span>
        </div>
      </div>

      {/* Coluna Direita: Formulário de Acesso */}
      <div className="login-form-col">
        <div className="login-form-wrapper">
          <div className="login-form-header">
            <span className="login-form-eyebrow">Acesso Restrito</span>
            <h2 className="login-form-title">Bem-vindo de volta</h2>
            <p className="login-form-desc">
              Entre com suas credenciais corporativas para acessar o painel de gerenciamento.
            </p>
          </div>

          {error && (
            <div className={typeof error === 'string' && error.includes('Atenção') ? 'login-alert-warning' : 'login-error-alert'} role="alert">
              <AlertCircle size={typeof error === 'string' && error.includes('Atenção') ? 24 : 16} style={{ flexShrink: 0, marginTop: typeof error === 'string' && error.includes('Atenção') ? '0.1rem' : '0' }} />
              <span>{typeof error === 'object' ? (error.message || JSON.stringify(error)) : error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form-body" noValidate>
            <div className="login-field-group">
              <label className="login-field-label" htmlFor="username">E-mail ou Usuário</label>
              <div className="login-field-input-wrapper">
                <span className="login-field-icon"><User size={16} /></span>
                <input
                  id="username"
                  type="text"
                  className="login-field-input"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Digite seu e-mail corporativo"
                  required
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="login-field-group">
              <label className="login-field-label" htmlFor="password">Senha</label>
              <div className="login-field-input-wrapper">
                <span className="login-field-icon"><Lock size={16} /></span>
                <input
                  id="password"
                  type="password"
                  className="login-field-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button type="submit" className="login-submit-btn btn btn-primary" disabled={loading}>
              <span className="login-submit-inner">
                {loading && <span className="login-spinner" />}
                {loading ? 'Autenticando...' : 'Entrar no Painel'}
              </span>
            </button>
          </form>

          <div className="login-form-footer">
            <Link to="/" className="login-back-link">
              <ArrowLeft size={14} /> Voltar para o Portfólio
            </Link>
            <div className="login-security-badge">
              <ShieldCheck size={13} /> Conexão segura — JWT + HTTPS
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
