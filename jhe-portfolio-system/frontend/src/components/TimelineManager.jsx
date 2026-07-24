import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { showAlertSuccess, showAlertError, showConfirmDialog } from '../utils/alerts';
import { Plus, Edit2, Trash2, Save, X, Search } from 'lucide-react';

const TimelineManager = () => {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ year: '', title: '', description: '', display_order: 0 });
  const [isSaving, setIsSaving] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/timeline');
      const result = await res.json();
      if (result.success) {
        setEvents(result.data);
      }
    } catch (error) {
      showAlertError('Erro', 'Falha ao buscar eventos da timeline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openForm = (event = null) => {
    if (event) {
      setEditingId(event.id);
      setFormData({ 
        year: event.year, 
        title: event.title, 
        description: event.description || '', 
        display_order: event.display_order || 0 
      });
    } else {
      setEditingId(null);
      const nextOrder = events.length > 0 ? Math.max(...events.map(e => e.display_order)) + 1 : 1;
      setFormData({ year: '', title: '', description: '', display_order: nextOrder });
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.year || !formData.title) return showAlertError('Aviso', 'Ano e Título são obrigatórios.');

    setIsSaving(true);
    const method = editingId ? 'PUT' : 'POST';
    const endpoint = editingId 
      ? `http://localhost:5000/api/timeline/${editingId}`
      : 'http://localhost:5000/api/timeline';

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
        fetchEvents();
      } else {
        showAlertError('Erro', result.error);
      }
    } catch (error) {
      showAlertError('Erro', 'Falha na comunicação com o servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    const confirm = await showConfirmDialog('Confirmar exclusão', `Tem certeza que deseja excluir o marco "${title}"?`);
    
    if (confirm.isConfirmed) {
      try {
        const res = await fetch(`http://localhost:5000/api/timeline/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        
        if (result.success) {
          showAlertSuccess('Excluído!', result.message);
          fetchEvents();
        } else {
          showAlertError('Erro', result.error);
        }
      } catch (error) {
        showAlertError('Erro', 'Falha ao excluir evento.');
      }
    }
  };

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.year.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Barra de Ferramentas */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Buscar por ano ou título..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-deep)', color: 'var(--text-color)' }}
          />
        </div>
        <button className="btn btn-primary" onClick={() => openForm()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Novo Marco Histórico
        </button>
      </div>

      {isFormOpen && (
        <div className="card" style={{ border: '1px solid var(--primary-color)', animation: 'fadeIn 0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
              {editingId ? 'Editar Marco Histórico' : 'Novo Marco Histórico'}
            </h3>
            <button onClick={closeForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 120px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Ano *</label>
                <input 
                  type="text" 
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                  placeholder="Ex: 1995"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)' }}
                  required
                />
              </div>
              <div style={{ flex: '3 1 300px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Título do Evento *</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ex: Fundação da Empresa"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)' }}
                  required
                />
              </div>
              <div style={{ flex: '1 1 100px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Ordem</label>
                <input 
                  type="number" 
                  value={formData.display_order}
                  onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Descrição Histórica</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Conte a história deste marco..."
                rows={5}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={isSaving} style={{ padding: '0.75rem 2.5rem' }}>
                {isSaving ? 'Salvando...' : <><Save size={18} /> Salvar Marco</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista / Tabela de Eventos */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-deep)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem', width: '80px', color: 'var(--text-muted)' }}>Ordem</th>
              <th style={{ padding: '1rem', width: '100px', color: 'var(--text-muted)' }}>Ano</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Título e Descrição</th>
              <th style={{ padding: '1rem', width: '150px', textAlign: 'center', color: 'var(--text-muted)' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</td></tr>
            ) : filteredEvents.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum evento encontrado.</td></tr>
            ) : (
              filteredEvents.map(evt => (
                <tr key={evt.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>#{evt.display_order}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-color)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                      {evt.year}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: 'var(--text-color)' }}>{evt.title}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {evt.description}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button 
                        onClick={() => openForm(evt)}
                        style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-color)', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(evt.id, evt.title)}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimelineManager;
