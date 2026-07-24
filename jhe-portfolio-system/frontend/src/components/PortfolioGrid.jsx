import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Building } from 'lucide-react';

const PortfolioGrid = () => {
  const [clients, setClients] = useState([]);
  const [openCardId, setOpenCardId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/portfolio');
        const data = await res.json();
        if (data.success) {
          setClients(data.data);
        }
      } catch (err) {
        console.error('Erro ao buscar clientes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  const toggleCard = (id) => {
    setOpenCardId(openCardId === id ? null : id);
  };

  const getInitials = (nome) => {
    if (!nome) return 'CL';
    const mainPart = nome.split('-')[0].trim();
    return mainPart.length <= 5 ? mainPart.toUpperCase() : mainPart.substring(0, 3).toUpperCase();
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem', width: '100%' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card" style={{ padding: '2rem', height: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="skeleton" style={{ width: '70px', height: '70px', borderRadius: '50%', marginBottom: '1rem' }}></div>
            <div className="skeleton" style={{ width: '80%', height: '15px', borderRadius: '4px' }}></div>
          </div>
        ))}
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.7, color: 'var(--text-muted)' }}>
        Nenhum projeto encontrado no momento.
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem', width: '100%' }}>
      {clients.map((client) => {
        const isOpen = openCardId === client.id;
        const shortName = client.nome.split('-')[0].trim();
        const hasLogo = client.logo_url && client.logo_url.trim() !== '';

        return (
          <div 
            key={client.id} 
            className="card" 
            style={{ 
              padding: '0', 
              overflow: 'hidden', 
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              border: isOpen ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
              gridRow: isOpen ? 'span 2' : 'span 1',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: isOpen ? 'var(--bg-deep)' : 'var(--bg-color)',
              boxShadow: isOpen ? '0 10px 25px rgba(0,0,0,0.15)' : 'none'
            }}
          >
            {/* Capa do Card */}
            <div 
              onClick={() => toggleCard(client.id)}
              style={{ 
                padding: '1.75rem 1rem', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: 'pointer',
                height: isOpen ? 'auto' : '100%',
                flex: 1
              }}
            >
              <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: hasLogo ? '#fff' : 'var(--primary-color)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', overflow: 'hidden', padding: hasLogo ? '0.5rem' : '0' }}>
                {hasLogo ? (
                  <img 
                    src={client.logo_url.startsWith('http') ? client.logo_url : `http://localhost:5000${client.logo_url}`} 
                    alt={client.nome} 
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                  />
                ) : (
                  <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.5rem', letterSpacing: '1px' }}>{getInitials(client.nome)}</span>
                )}
              </div>
              
              <h4 style={{ color: 'var(--text-color)', fontSize: '1.15rem', fontWeight: 'bold', textAlign: 'center', margin: '0 0 0.5rem 0' }}>
                {shortName}
              </h4>

              {client.setor && (
                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-color)', borderRadius: '999px', fontWeight: 600, marginBottom: '1rem', textAlign: 'center' }}>
                  {client.setor}
                </span>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 600, marginTop: 'auto' }}>
                <span>{client.projetos.length} {client.projetos.length === 1 ? 'Projeto' : 'Projetos'}</span>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>

            {/* Gaveta Expandida (Projetos) */}
            {isOpen && (
              <div style={{ padding: '0 1.5rem 1.5rem', animation: 'fadeIn 0.3s', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0 0 1rem 0' }} />
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Razão Social</span>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-color)', lineHeight: '1.4' }}>{client.nome}</p>
                </div>

                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Portfólio de Projetos</span>
                  {client.projetos && client.projetos.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                      {client.projetos.map((proj) => (
                        <div key={proj.id} style={{ padding: '0.75rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                          <h5 style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', color: 'var(--primary-color)' }}>{proj.titulo}</h5>
                          {proj.descricao && <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{proj.descricao}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Nenhum projeto detalhado.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PortfolioGrid;
