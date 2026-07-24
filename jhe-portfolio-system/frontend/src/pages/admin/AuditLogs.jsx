import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Activity, Search, Server, User, Calendar, Fingerprint, Download, X } from 'lucide-react';


const AuditLogs = () => {
  const { user, token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination (basic implementation for now)
  const [page, setPage] = useState(1);
  const limit = 50;
  const [total, setTotal] = useState(0);

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState('all');
  const [exportValue, setExportValue] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [page, searchTerm, token, user]);

  const fetchLogs = async () => {
    if (user?.role !== 'admin_master') return;
    
    setLoading(true);
    try {
      const offset = (page - 1) * limit;
      const res = await fetch(`http://localhost:5000/api/admin/audit-logs?limit=${limit}&offset=${offset}&search=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset page on search
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const url = `http://localhost:5000/api/admin/audit-logs/export/pdf?filterType=${exportType}&filterValue=${encodeURIComponent(exportValue)}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Falha ao exportar PDF');
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `auditoria_logs_${exportType}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setShowExportModal(false);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar PDF');
    } finally {
      setExporting(false);
    }
  };

  if (user?.role !== 'admin_master') {
    return (
      <div className="forbidden-container">
        <ShieldAlert size={64} className="forbidden-icon" />
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>403 Forbidden</h1>
        <p>Acesso Negado. Você não possui privilégios de Administrador Master para ver logs.</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'success':
        return <span className="dash-status-badge status-active">Sucesso</span>;
      case 'error':
      case 'failed':
        return <span className="dash-status-badge status-rejected">Falha</span>;
      default:
        return <span className="dash-status-badge status-pending">{status || 'N/A'}</span>;
    }
  };

  const getActionBadge = (action) => {
    // Simple color coding for actions
    if (action.includes('create') || action.includes('insert') || action.includes('add')) {
      return <span style={{ color: '#10b981', fontWeight: 600 }}>{action}</span>;
    }
    if (action.includes('delete') || action.includes('remove') || action.includes('reject')) {
      return <span style={{ color: '#ef4444', fontWeight: 600 }}>{action}</span>;
    }
    if (action.includes('update') || action.includes('edit') || action.includes('approve')) {
      return <span style={{ color: '#3b82f6', fontWeight: 600 }}>{action}</span>;
    }
    return <span>{action}</span>;
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Logs de Auditoria</h1>
          <p className="admin-page-subtitle">Rastreabilidade completa de ações administrativas no sistema.</p>
        </div>
      </div>

      <div className="admin-panel" style={{ marginTop: '2rem' }}>
        <div className="admin-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="admin-panel-title">
            <Activity size={20} color="var(--primary-color)" /> Registro de Atividades
          </h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="search-bar" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', width: '300px' }}>
              <Search size={18} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
              <input 
                type="text" 
                placeholder="Buscar ação, tabela ou usuário..." 
                value={searchTerm}
                onChange={handleSearch}
                style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: '0.9rem' }}
              />
            </div>
            <button 
              onClick={() => setShowExportModal(true)}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem' }}
            >
              <Download size={16} /> Exportar PDF
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando logs...</div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="dash-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={14}/> Data/Hora</div></th>
                    <th><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={14}/> Usuário</div></th>
                    <th><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={14}/> Ação</div></th>
                    <th><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Server size={14}/> Tabela</div></th>
                    <th>Reg. ID</th>
                    <th><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Fingerprint size={14}/> IP Origem</div></th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length > 0 ? (
                    logs.map(log => (
                      <tr key={log.id}>
                        <td style={{ whiteSpace: 'nowrap' }}>{new Date(log.created_at).toLocaleString('pt-BR')}</td>
                        <td style={{ fontWeight: 500 }}>{log.usuario_nome || 'Sistema'}</td>
                        <td>{getActionBadge(log.acao)}</td>
                        <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{log.tabela_afetada || '-'}</td>
                        <td>{log.registro_id || '-'}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{log.ip_originario || '-'}</td>
                        <td>{getStatusBadge(log.status)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        Nenhum registro de auditoria encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', padding: '0 1rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Mostrando {logs.length} de {total} registros
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn btn-secondary" 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  style={{ padding: '0.4rem 0.8rem' }}
                >
                  Anterior
                </button>
                <button 
                  className="btn btn-secondary" 
                  disabled={page * limit >= total}
                  onClick={() => setPage(p => p + 1)}
                  style={{ padding: '0.4rem 0.8rem' }}
                >
                  Próxima
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de Exportação */}
      {showExportModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: 'var(--bg-primary)', padding: '2rem', borderRadius: '12px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Exportar Relatório PDF</h3>
              <button onClick={() => setShowExportModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>Tipo de Extração</label>
                <select 
                  value={exportType}
                  onChange={(e) => { setExportType(e.target.value); setExportValue(''); }}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                >
                  <option value="all">Completo (Últimos 500 logs)</option>
                  <option value="user">Por Usuário</option>
                  <option value="date">Por Data Específica</option>
                </select>
              </div>

              {exportType === 'user' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>Nome do Usuário</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Leandro, Priscila..."
                    value={exportValue}
                    onChange={(e) => setExportValue(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  />
                </div>
              )}

              {exportType === 'date' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>Data Específica</label>
                  <input 
                    type="date" 
                    value={exportValue}
                    onChange={(e) => setExportValue(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button 
                onClick={() => setShowExportModal(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button 
                onClick={handleExportPDF}
                className="btn btn-primary"
                disabled={exporting || (exportType !== 'all' && !exportValue)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {exporting ? 'Gerando...' : 'Fazer Download'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
