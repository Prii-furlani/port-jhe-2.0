import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { showAlertSuccess, showAlertError, showConfirmDialog } from '../utils/alerts';
import { Plus, Edit2, Trash2, Briefcase, Save, X } from 'lucide-react';

const ServiceManager = () => {
  const { token } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados do formulário
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nome: '', descricao: '', icone: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Carregar do MySQL
  const fetchServices = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/services');
      const result = await res.json();
      if (result.success) {
        setServices(result.data);
      }
    } catch (error) {
      showAlertError('Erro', 'Falha ao buscar serviços.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Modal actions
  const openForm = (svc = null) => {
    if (svc) {
      setEditingId(svc.id);
      setFormData({ nome: svc.nome, descricao: svc.descricao || '', icone: svc.icone || '' });
    } else {
      setEditingId(null);
      setFormData({ nome: '', descricao: '', icone: '' });
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ nome: '', descricao: '', icone: '' });
  };

  // Salvar
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.nome) return showAlertError('Aviso', 'O nome do serviço é obrigatório.');

    setIsSaving(true);
    const method = editingId ? 'PUT' : 'POST';
    const endpoint = editingId 
      ? `http://localhost:5000/api/services/${editingId}`
      : 'http://localhost:5000/api/services';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const result = await res.json();

      if (result.success) {
        showAlertSuccess('Sucesso!', result.message);
        closeForm();
        fetchServices();
      } else {
        showAlertError('Erro', result.error);
      }
    } catch (error) {
      showAlertError('Erro', 'Falha na comunicação com o servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  // Deletar
  const handleDelete = async (id, nome) => {
    const confirm = await showConfirmDialog('Confirmar exclusão', `Tem certeza que deseja excluir o serviço "${nome}"?`);
    
    if (confirm.isConfirmed) {
      try {
        const res = await fetch(`http://localhost:5000/api/services/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        
        if (result.success) {
          showAlertSuccess('Excluído!', result.message);
          fetchServices();
        } else {
          showAlertError('Erro', result.error);
        }
      } catch (error) {
        showAlertError('Erro', 'Falha ao excluir serviço.');
      }
    }
  };

  const renderSkeletons = () => {
    return Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '8px' }}></div>
          <div className="skeleton" style={{ width: '60%', height: 24, borderRadius: '4px' }}></div>
        </div>
        <div className="skeleton" style={{ width: '100%', height: 60, borderRadius: '4px' }}></div>
      </div>
    ));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-color)' }}>Catálogo de Serviços</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Gerencie as áreas de atuação (Consultoria BIM, Projetos, etc).</p>
        </div>
        <button className="btn btn-primary" onClick={() => openForm()}>
          <Plus size={18} /> Adicionar Novo
        </button>
      </div>

      {isFormOpen && (
        <div className="card" style={{ border: '1px solid var(--primary-color)', animation: 'fadeIn 0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
              {editingId ? 'Editar Serviço' : 'Novo Serviço'}
            </h3>
            <button onClick={closeForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '2 1 300px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Nome do Serviço *</label>
                <input 
                  type="text" 
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Ex: Consultoria BIM"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)' }}
                  required
                />
              </div>
              
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Ícone (Nome ou URL)</label>
                <input 
                  type="text" 
                  value={formData.icone}
                  onChange={(e) => setFormData({...formData, icone: e.target.value})}
                  placeholder="Ex: Building2 ou URL"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Breve Descrição</label>
              <textarea 
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                placeholder="Descreva este serviço (máx 3-4 linhas)..."
                rows="3"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={isSaving} style={{ padding: '0.75rem 2rem' }}>
                {isSaving ? 'Salvando...' : <><Save size={16} /> Salvar Serviço</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid de Serviços */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          renderSkeletons()
        ) : services.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1' }}>Nenhum serviço cadastrado.</p>
        ) : (
          services.map(svc => (
            <div key={svc.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
              
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: 48, height: 48, borderRadius: '12px', backgroundColor: 'var(--primary-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {svc.icone && svc.icone.startsWith('http') ? (
                    <img src={svc.icone} alt={svc.nome} style={{ width: 24, height: 24, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                  ) : (
                    <Briefcase size={24} />
                  )}
                </div>
                <div>
                  <h4 style={{ color: 'var(--text-color)', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{svc.nome}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {svc.descricao || 'Sem descrição cadastrada.'}
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button 
                  onClick={() => openForm(svc)}
                  style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-color)', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  <Edit2 size={14} style={{ display: 'inline', marginRight: '4px' }} /> Editar
                </button>
                <button 
                  onClick={() => handleDelete(svc.id, svc.nome)}
                  style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  <Trash2 size={14} style={{ display: 'inline', marginRight: '4px' }} /> Excluir
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default ServiceManager;
