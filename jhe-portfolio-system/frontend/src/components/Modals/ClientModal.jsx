import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Upload } from 'lucide-react';
import { showAlertSuccess, showAlertError } from '../../utils/alerts';

const ClientModal = ({ isOpen, onClose, clientToEdit, token, onSaveSuccess }) => {
  const [formData, setFormData] = useState({ nome: '', setor: '' });
  const [servicos, setServicos] = useState([]);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (clientToEdit) {
        setFormData({ nome: clientToEdit.nome, setor: clientToEdit.setor || '' });
        setLogoPreview(clientToEdit.logo_url ? `http://localhost:5000${clientToEdit.logo_url}` : '');
        
        let srvs = [];
        try {
          if (clientToEdit.servicos) {
            const parsed = typeof clientToEdit.servicos === 'string' ? JSON.parse(clientToEdit.servicos) : clientToEdit.servicos;
            srvs = Array.isArray(parsed) ? parsed : [];
          }
        } catch(e) {}
        setServicos(srvs);
      } else {
        setFormData({ nome: '', setor: '' });
        setServicos([]);
        setLogoPreview('');
      }
      setLogoFile(null);
    }
  }, [isOpen, clientToEdit]);

  if (!isOpen) return null;

  const handleAddServico = () => {
    setServicos([...servicos, '']);
  };

  const handleRemoveServico = (index) => {
    const newServicos = [...servicos];
    newServicos.splice(index, 1);
    setServicos(newServicos);
  };

  const handleServicoChange = (index, value) => {
    const newServicos = [...servicos];
    newServicos[index] = value;
    setServicos(newServicos);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome) return showAlertError('Aviso', 'O nome do cliente é obrigatório.');

    setIsSaving(true);
    const endpoint = clientToEdit 
      ? `http://localhost:5000/api/clients/${clientToEdit.id}` 
      : 'http://localhost:5000/api/clients';
    const method = clientToEdit ? 'PUT' : 'POST';

    // Usando FormData para suportar multipart/form-data (upload de arquivo)
    const payload = new FormData();
    payload.append('nome', formData.nome);
    payload.append('setor', formData.setor);
    
    // Limpa serviços vazios e adiciona
    const validServicos = servicos.map(s => s.trim()).filter(s => s);
    payload.append('servicos', JSON.stringify(validServicos));

    if (logoFile) {
      payload.append('logo', logoFile);
    } else if (logoPreview === '') {
      // Se a preview está vazia e não tem arquivo, o usuário quer remover a logo atual
      payload.append('logo_url', '');
    }

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: payload
      });
      const result = await res.json();

      if (result.success) {
        showAlertSuccess('Sucesso!', result.message);
        onSaveSuccess();
        onClose();
      } else {
        showAlertError('Erro', result.error);
      }
    } catch (error) {
      showAlertError('Erro', 'Falha na comunicação com o servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(2, 9, 32, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-color)', animation: 'fadeIn 0.3s' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-color)' }}>
            {clientToEdit ? 'Editar Cliente' : 'Cadastrar Cliente'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 250px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Nome / Razão Social *</label>
              <input 
                type="text" 
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                placeholder="Ex: Sabesp"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)' }}
                required
              />
            </div>
            <div style={{ flex: '1 1 250px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Setor de Atuação</label>
              <input 
                type="text" 
                value={formData.setor}
                onChange={(e) => setFormData({...formData, setor: e.target.value})}
                placeholder="Ex: Saneamento"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Logotipo do Cliente</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {logoPreview ? (
                <img src={logoPreview} alt="Preview" style={{ width: 60, height: 60, objectFit: 'contain', borderRadius: '8px', backgroundColor: '#fff', border: '1px solid var(--border-color)', padding: '4px' }} />
              ) : (
                <div style={{ width: 60, height: 60, borderRadius: '8px', border: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Upload size={24} color="var(--text-muted)" />
                </div>
              )}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="btn btn-secondary" style={{ display: 'inline-flex', padding: '0.5rem 1rem', cursor: 'pointer' }}>
                    Selecionar Arquivo
                  </label>
                  
                  {logoPreview && (
                    <button 
                      type="button" 
                      onClick={handleRemoveLogo}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                      title="Remover Imagem"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>PNG, JPG ou SVG (Máx. 5MB)</p>
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Lista de Serviços Prestados</label>
              <button 
                type="button" 
                onClick={handleAddServico}
                style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={14} /> Adicionar Serviço
              </button>
            </div>
            
            {servicos.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Nenhum serviço adicionado.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {servicos.map((svc, index) => (
                  <div key={index} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      value={svc}
                      onChange={(e) => handleServicoChange(index, e.target.value)}
                      placeholder="Ex: Consultoria BIM"
                      style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)' }}
                    />
                    <button 
                      type="button" 
                      onClick={() => handleRemoveServico(index)}
                      style={{ padding: '0 0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={isSaving} style={{ padding: '0.75rem 2rem' }}>
              {isSaving ? 'Salvando...' : <><Save size={16} /> Salvar Cliente</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;
