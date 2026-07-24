import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { showAlertSuccess, showAlertError, showConfirmDialog } from '../utils/alerts';
import { Plus, Edit2, Trash2, Save, X, Target, Shield, Star, Lightbulb, Users, Heart, Zap, Globe, Briefcase, Award } from 'lucide-react';

const LUCIDE_ICONS = {
  Target: <Target size={24} />,
  Shield: <Shield size={24} />,
  Star: <Star size={24} />,
  Lightbulb: <Lightbulb size={24} />,
  Users: <Users size={24} />,
  Heart: <Heart size={24} />,
  Zap: <Zap size={24} />,
  Globe: <Globe size={24} />,
  Briefcase: <Briefcase size={24} />,
  Award: <Award size={24} />
};

const PillarManager = () => {
  const { token } = useAuth();
  const [pillars, setPillars] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ titulo: '', descricao: '', icone: 'Target' });
  const [isSaving, setIsSaving] = useState(false);

  const fetchPillars = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/pillars');
      const result = await res.json();
      if (result.success) {
        setPillars(result.data);
      }
    } catch (error) {
      showAlertError('Erro', 'Falha ao buscar pilares.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPillars();
  }, []);

  const openForm = (pillar = null) => {
    if (pillar) {
      setEditingId(pillar.id);
      setFormData({ titulo: pillar.titulo, descricao: pillar.descricao || '', icone: pillar.icone || 'Target' });
    } else {
      setEditingId(null);
      setFormData({ titulo: '', descricao: '', icone: 'Target' });
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.titulo) return showAlertError('Aviso', 'O título do pilar é obrigatório.');

    setIsSaving(true);
    const method = editingId ? 'PUT' : 'POST';
    const endpoint = editingId 
      ? `http://localhost:5000/api/pillars/${editingId}`
      : 'http://localhost:5000/api/pillars';

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
        fetchPillars();
      } else {
        showAlertError('Erro', result.error);
      }
    } catch (error) {
      showAlertError('Erro', 'Falha na comunicação com o servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, titulo) => {
    const confirm = await showConfirmDialog('Confirmar exclusão', `Tem certeza que deseja excluir o pilar "${titulo}"?`);
    
    if (confirm.isConfirmed) {
      try {
        const res = await fetch(`http://localhost:5000/api/pillars/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        
        if (result.success) {
          showAlertSuccess('Excluído!', result.message);
          fetchPillars();
        } else {
          showAlertError('Erro', result.error);
        }
      } catch (error) {
        showAlertError('Erro', 'Falha ao excluir pilar.');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-color)' }}>Pilares Institucionais</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Valores, missão, ou diferenciais que serão exibidos no Bento Grid da Home.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openForm()}>
          <Plus size={18} /> Adicionar Pilar
        </button>
      </div>

      {isFormOpen && (
        <div className="card" style={{ border: '1px solid var(--primary-color)', animation: 'fadeIn 0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
              {editingId ? 'Editar Pilar' : 'Novo Pilar'}
            </h3>
            <button onClick={closeForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 300px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Título do Pilar *</label>
                <input 
                  type="text" 
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  placeholder="Ex: Foco no Cliente"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)' }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Descrição</label>
              <textarea 
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                placeholder="Ex: Entregar soluções com excelência..."
                rows={3}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Escolha um Ícone</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {Object.keys(LUCIDE_ICONS).map(iconName => (
                  <div 
                    key={iconName}
                    onClick={() => setFormData({...formData, icone: iconName})}
                    style={{ 
                      padding: '0.75rem', 
                      borderRadius: '8px', 
                      border: formData.icone === iconName ? '2px solid var(--primary-color)' : '1px solid var(--border-color)', 
                      backgroundColor: formData.icone === iconName ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                      color: formData.icone === iconName ? 'var(--primary-color)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                    title={iconName}
                  >
                    {LUCIDE_ICONS[iconName]}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={isSaving} style={{ padding: '0.75rem 2rem' }}>
                {isSaving ? 'Salvando...' : <><Save size={16} /> Salvar</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid de Gerenciamento */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card" style={{ padding: '1.5rem', height: '140px' }}>
              <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '8px', marginBottom: '1rem' }}></div>
              <div className="skeleton" style={{ width: '80%', height: '15px', borderRadius: '4px', marginBottom: '0.5rem' }}></div>
              <div className="skeleton" style={{ width: '100%', height: '10px', borderRadius: '4px' }}></div>
            </div>
          ))
        ) : pillars.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1' }}>Nenhum pilar cadastrado.</p>
        ) : (
          pillars.map(pillar => (
            <div key={pillar.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '12px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {LUCIDE_ICONS[pillar.icone] || <Target size={24} />}
                </div>
                <h4 style={{ color: 'var(--text-color)', fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>{pillar.titulo}</h4>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>{pillar.descricao || 'Sem descrição.'}</p>
              
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                <button 
                  onClick={() => openForm(pillar)}
                  style={{ flex: 1, background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-color)', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}
                >
                  <Edit2 size={14} /> Editar
                </button>
                <button 
                  onClick={() => handleDelete(pillar.id, pillar.titulo)}
                  style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}
                >
                  <Trash2 size={14} /> Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PillarManager;
