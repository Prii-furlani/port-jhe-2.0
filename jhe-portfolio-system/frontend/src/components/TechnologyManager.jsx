import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { showAlertSuccess, showAlertError, showConfirmDialog } from '../utils/alerts';
import { Plus, Edit2, Trash2, Cpu, Save, X } from 'lucide-react';

const TechnologyManager = () => {
  const { token } = useAuth();
  const [techs, setTechs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados do formulário (Criação/Edição)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nome: '', icone_url: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Busca todas as tecnologias
  const fetchTechnologies = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/technologies');
      const result = await res.json();
      if (result.success) {
        setTechs(result.data);
      }
    } catch (error) {
      showAlertError('Erro', 'Falha ao buscar tecnologias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnologies();
  }, []);

  // Abrir modal de formulário
  const openForm = (tech = null) => {
    if (tech) {
      setEditingId(tech.id);
      setFormData({ nome: tech.nome, icone_url: tech.icone_url || '' });
    } else {
      setEditingId(null);
      setFormData({ nome: '', icone_url: '' });
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ nome: '', icone_url: '' });
  };

  // Salvar (POST / PUT)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.nome) return showAlertError('Aviso', 'O nome da tecnologia é obrigatório.');

    setIsSaving(true);
    const method = editingId ? 'PUT' : 'POST';
    const endpoint = editingId 
      ? `http://localhost:5000/api/technologies/${editingId}`
      : 'http://localhost:5000/api/technologies';

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
        fetchTechnologies(); // Recarrega a lista
      } else {
        showAlertError('Erro', result.error);
      }
    } catch (error) {
      showAlertError('Erro', 'Falha na comunicação com o servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  // Excluir
  const handleDelete = async (id, nome) => {
    const confirm = await showConfirmDialog('Confirmar exclusão', `Tem certeza que deseja excluir a tecnologia "${nome}"? Esta ação removerá a tag de projetos vinculados.`);
    
    if (confirm.isConfirmed) {
      try {
        const res = await fetch(`http://localhost:5000/api/technologies/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        
        if (result.success) {
          showAlertSuccess('Excluído!', result.message);
          fetchTechnologies();
        } else {
          showAlertError('Erro', result.error);
        }
      } catch (error) {
        showAlertError('Erro', 'Falha ao excluir tecnologia.');
      }
    }
  };

  // Helper de Skeleton
  const renderSkeletons = () => {
    return Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
        <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '8px' }}></div>
        <div className="skeleton" style={{ width: '60%', height: 20, borderRadius: '4px' }}></div>
      </div>
    ));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header Ações */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-color)' }}>Catálogo de Tecnologias</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Gerencie as tecnologias que alimentam as badges dos projetos.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openForm()}>
          <Plus size={18} /> Adicionar Nova
        </button>
      </div>

      {/* Formulário (Renderizado inline para não criar outra página) */}
      {isFormOpen && (
        <div className="card" style={{ border: '1px solid var(--primary-color)', animation: 'fadeIn 0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
              {editingId ? 'Editar Tecnologia' : 'Nova Tecnologia'}
            </h3>
            <button onClick={closeForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSave} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 250px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Nome da Tecnologia *</label>
              <input 
                type="text" 
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                placeholder="Ex: React.js"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)' }}
                required
              />
            </div>
            
            <div style={{ flex: '2 1 400px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>URL do Ícone (SVG/CDN) - Opcional</label>
              <input 
                type="text" 
                value={formData.icone_url}
                onChange={(e) => setFormData({...formData, icone_url: e.target.value})}
                placeholder="https://cdn.jsdelivr.net/gh/devicons/..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={isSaving} style={{ height: '42px', padding: '0 2rem' }}>
              {isSaving ? 'Salvando...' : <><Save size={16} /> Salvar</>}
            </button>
          </form>
        </div>
      )}

      {/* Grid de Tecnologias */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {loading ? (
          renderSkeletons()
        ) : techs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1' }}>Nenhuma tecnologia cadastrada.</p>
        ) : (
          techs.map(tech => (
            <div key={tech.id} className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '8px', backgroundColor: 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', border: '1px solid var(--border-color)' }}>
                  {tech.icone_url ? (
                    <img src={tech.icone_url} alt={tech.nome} style={{ maxWidth: '100%', maxHeight: '100%' }} />
                  ) : (
                    <Cpu size={24} color="var(--text-muted)" />
                  )}
                </div>
                <strong style={{ color: 'var(--text-color)', fontSize: '0.95rem' }}>{tech.nome}</strong>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => openForm(tech)}
                  style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-color)', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}
                  title="Editar"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(tech.id, tech.nome)}
                  style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default TechnologyManager;
