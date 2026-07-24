import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { showAlertSuccess, showAlertError, showConfirmDialog } from '../utils/alerts';
import { Plus, Edit2, Trash2, Building, ChevronDown, ChevronUp } from 'lucide-react';
import ClientModal from './Modals/ClientModal';

const ClientManager = () => {
  const { token } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados do Accordion
  const [expandedId, setExpandedId] = useState(null);

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState(null);

  const fetchClients = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/clients');
      const result = await res.json();
      if (result.success) {
        setClients(result.data);
      }
    } catch (error) {
      showAlertError('Erro', 'Falha ao buscar clientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const openModal = (client = null) => {
    setClientToEdit(client);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setClientToEdit(null);
  };

  const handleDelete = async (id, nome) => {
    const confirm = await showConfirmDialog('Confirmar exclusão', `Tem certeza que deseja excluir o cliente "${nome}"?`);
    
    if (confirm.isConfirmed) {
      try {
        const res = await fetch(`http://localhost:5000/api/clients/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        
        if (result.success) {
          showAlertSuccess('Excluído!', result.message);
          fetchClients();
        } else {
          showAlertError('Ação Bloqueada', result.error);
        }
      } catch (error) {
        showAlertError('Erro', 'Falha ao excluir cliente.');
      }
    }
  };

  const toggleAccordion = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  const parseServicos = (servicosJson) => {
    try {
      if (!servicosJson) return [];
      const parsed = typeof servicosJson === 'string' ? JSON.parse(servicosJson) : servicosJson;
      return Array.isArray(parsed) ? parsed : [];
    } catch(e) {
      return [];
    }
  };

  const getInitials = (nome) => {
    if (!nome) return 'CL';
    // Se tiver hífen, pega a primeira parte (ex: "CAESB - CIA" -> "CAESB")
    const mainPart = nome.split('-')[0].trim();
    // Pega as duas primeiras letras ou a palavra principal se for curta
    return mainPart.length <= 5 ? mainPart.toUpperCase() : mainPart.substring(0, 3).toUpperCase();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-color)' }}>Catálogo de Clientes</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Gerencie as marcas parceiras e os serviços prestados a cada uma.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Adicionar Cliente
        </button>
      </div>

      <ClientModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        clientToEdit={clientToEdit}
        token={token}
        onSaveSuccess={fetchClients}
      />

      {/* Grid Bento de 4 Colunas com gap responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 w-full" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem', width: '100%' }}>
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card" style={{ padding: '1.5rem', height: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div className="skeleton" style={{ width: '60px', height: '60px', borderRadius: '50%', marginBottom: '1rem' }}></div>
              <div className="skeleton" style={{ width: '70%', height: '15px', borderRadius: '4px' }}></div>
            </div>
          ))
        ) : clients.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1' }}>Nenhum cliente cadastrado.</p>
        ) : (
          clients.map(client => {
            const isExpanded = expandedId === client.id;
            const servicos = parseServicos(client.servicos);
            const shortName = client.nome.split('-')[0].trim();

            return (
              <div 
                key={client.id} 
                className="card" 
                style={{ 
                  padding: '0', 
                  overflow: 'hidden', 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: isExpanded ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                  gridRow: isExpanded ? 'span 2' : 'span 1',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: isExpanded ? 'var(--bg-deep)' : 'var(--bg-color)',
                  boxShadow: isExpanded ? '0 10px 25px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {/* Capa do Card */}
                <div 
                  onClick={() => toggleAccordion(client.id)}
                  style={{ 
                    padding: '1.5rem 1rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    height: isExpanded ? 'auto' : '100%',
                    flex: 1
                  }}
                >
                  <div style={{ width: 70, height: 70, borderRadius: '50%', backgroundColor: client.logo_url ? '#fff' : 'var(--primary-color)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', overflow: 'hidden', padding: client.logo_url ? '0.5rem' : '0' }}>
                    {client.logo_url ? (
                      <img src={`http://localhost:5000${client.logo_url}`} alt={client.nome} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.25rem', letterSpacing: '1px' }}>{getInitials(client.nome)}</span>
                    )}
                  </div>
                  
                  <h4 style={{ color: 'var(--text-color)', fontSize: '1.1rem', fontWeight: 'bold', textAlign: 'center', margin: '0 0 0.5rem 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {shortName}
                  </h4>

                  {client.setor && (
                    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-color)', borderRadius: '999px', fontWeight: 600, marginBottom: '0.75rem', textAlign: 'center' }}>
                      {client.setor}
                    </span>
                  )}
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500, marginTop: 'auto' }}>
                    <span>{servicos.length} {servicos.length === 1 ? 'serviço' : 'serviços'}</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Gaveta Expandida */}
                {isExpanded && (
                  <div style={{ padding: '0 1.25rem 1.25rem', animation: 'fadeIn 0.3s', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0 0 1rem 0' }} />
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Razão Social Completa</span>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-color)', lineHeight: '1.4' }}>{client.nome}</p>
                    </div>

                    <div style={{ marginBottom: '1.5rem', flex: 1 }}>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Lista de Serviços</span>
                      {servicos.length > 0 ? (
                        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-color)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          {servicos.map((s, idx) => (
                            <li key={idx} style={{ listStyleType: 'disc' }}>{s}</li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nenhum serviço registrado.</p>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); openModal(client); }}
                        style={{ flex: 1, background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-color)', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}
                      >
                        <Edit2 size={14} /> Editar
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(client.id, client.nome); }}
                        style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}
                      >
                        <Trash2 size={14} /> Excluir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default ClientManager;
