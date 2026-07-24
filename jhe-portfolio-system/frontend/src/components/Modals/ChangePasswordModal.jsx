import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const { token } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Limpa os campos toda vez que o modal é aberto
  React.useEffect(() => {
    if (isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrent(false);
      setShowNew(false);
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      return setError('A nova senha deve ter no mínimo 6 caracteres.');
    }
    if (newPassword !== confirmPassword) {
      return setError('A confirmação não confere com a nova senha.');
    }

    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess('Senha alterada com sucesso!');
        setTimeout(() => {
          onClose();
          // Reset states
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setSuccess('');
        }, 2000);
      } else {
        setError(data.error || 'Erro ao alterar a senha.');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <button onClick={onClose} className="modal-close-btn" aria-label="Fechar modal">
          <X size={20} />
        </button>

        <div className="modal-header">
          <h2 className="modal-title">Alterar Sua Senha</h2>
          <p className="modal-subtitle">Informe a senha atual e a nova combinação desejada.</p>
        </div>

        {success ? (
          <div style={{ color: '#10b981', fontWeight: 'bold', textAlign: 'center', padding: '2rem 0' }}>
            {success}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-form-group">
              <label className="modal-label">Senha Atual</label>
              <div className="modal-input-wrapper">
                <input 
                  type={showCurrent ? "text" : "password"} 
                  className="modal-input" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <button type="button" className="modal-eye-btn" onClick={() => setShowCurrent(!showCurrent)}>
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="modal-form-group">
              <label className="modal-label">Nova Senha</label>
              <div className="modal-input-wrapper">
                <input 
                  type={showNew ? "text" : "password"} 
                  className="modal-input" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button type="button" className="modal-eye-btn" onClick={() => setShowNew(!showNew)}>
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="modal-form-group">
              <label className="modal-label">Confirmar Nova Senha</label>
              <div className="modal-input-wrapper">
                <input 
                  type={showNew ? "text" : "password"} 
                  className="modal-input" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <div className="modal-error-text">{error}</div>}

            <button type="submit" className="modal-submit-btn" disabled={isLoading}>
              {isLoading ? 'Processando...' : 'Salvar Nova Senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordModal;
