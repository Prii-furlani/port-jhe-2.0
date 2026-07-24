import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Activity, Search, Server, User, Calendar, Fingerprint, Download, X, FileSpreadsheet, FileText, Table, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { showAlertError } from '../../utils/alerts';

const AuditLogs = () => {
  const { user, token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination (basic implementation for now)
  const [page, setPage] = useState(1);
  const limit = 50;
  const [total, setTotal] = useState(0);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState('all');
  const [exportValue, setExportValue] = useState('');
  const [exportFormat, setExportFormat] = useState('pdf');
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

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') direction = 'desc';
      else if (sortConfig.direction === 'desc') direction = null;
      else direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const sortedLogs = React.useMemo(() => {
    let sortableLogs = [...logs];
    if (sortConfig.direction !== null && sortConfig.key !== null) {
      sortableLogs.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        
        if (valA == null) valA = '';
        if (valB == null) valB = '';

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableLogs;
  }, [logs, sortConfig]);

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
      showAlertError('Erro', 'Falha ao exportar PDF');
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

  const renderHeader = (label, key, Icon) => {
    const isSorted = sortConfig.key === key;
    const direction = isSorted ? sortConfig.direction : null;
    const ariaSort = direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none';
    
    return (
      <th 
        className="cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-white/5 transition-colors py-3 px-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 group"
        onClick={() => handleSort(key)}
        aria-sort={ariaSort}
        title={
          direction === null ? "Clique para ordenar de A-Z / Crescente" :
          direction === 'asc' ? "Clique para ordenar de Z-A / Decrescente" :
          "Clique para remover a ordenação"
        }
      >
        <div className="flex items-center gap-1.5">
          {Icon && <Icon size={14} />}
          <span>{label}</span>
          {direction === null && <ArrowUpDown size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400 transition-colors ml-1" />}
          {direction === 'asc' && <ArrowUp size={14} className="text-[#194775] dark:text-[#38bdf8] font-bold ml-1" />}
          {direction === 'desc' && <ArrowDown size={14} className="text-[#194775] dark:text-[#38bdf8] font-bold ml-1" />}
        </div>
      </th>
    );
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
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar ação, tabela ou usuário..." 
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#020920] text-slate-900 dark:text-white focus:ring-2 focus:ring-[#194775] dark:focus:ring-[#38bdf8] outline-none text-sm w-72 transition-all shadow-sm"
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
                    {renderHeader('Data/Hora', 'created_at', Calendar)}
                    {renderHeader('Usuário', 'usuario_nome', User)}
                    {renderHeader('Ação', 'acao', Activity)}
                    {renderHeader('Tabela', 'tabela_afetada', Server)}
                    {renderHeader('Reg. ID', 'registro_id', null)}
                    {renderHeader('IP Origem', 'ip_originario', Fingerprint)}
                    {renderHeader('Status', 'status', null)}
                  </tr>
                </thead>
                <tbody>
                  {sortedLogs.length > 0 ? (
                    sortedLogs.map(log => (
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

      {/* Modal de Exportação (Refatorado 60-30-10) */}
      {showExportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all">
          <div className="bg-white dark:bg-[#020920] border border-slate-200 dark:border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setShowExportModal(false)} 
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#194775]/10 dark:bg-[#38bdf8]/10 text-[#194775] dark:text-[#38bdf8] flex items-center justify-center mb-4">
                <FileSpreadsheet size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Exportar Relatório de Auditoria</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
                Selecione o formato e o intervalo dos registros para geração do documento.
              </p>
            </div>
            
            <div className="space-y-6">
              {/* Formato de Arquivo */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-[#A07146] mb-2 block">Formato do Arquivo</label>
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={() => setExportFormat('pdf')}
                    className={`cursor-pointer border p-3 rounded-xl flex items-center gap-2 transition-all ${
                      exportFormat === 'pdf' 
                      ? 'border-2 border-[#194775] dark:border-[#38bdf8] bg-[#194775]/5 dark:bg-[#38bdf8]/10 text-slate-900 dark:text-white font-semibold' 
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FileText size={18} className={exportFormat === 'pdf' ? 'text-[#194775] dark:text-[#38bdf8]' : ''} />
                    <span className="text-sm">Relatório PDF</span>
                  </div>
                  <div 
                    onClick={() => setExportFormat('csv')}
                    className={`cursor-pointer border p-3 rounded-xl flex items-center gap-2 transition-all ${
                      exportFormat === 'csv' 
                      ? 'border-2 border-[#194775] dark:border-[#38bdf8] bg-[#194775]/5 dark:bg-[#38bdf8]/10 text-slate-900 dark:text-white font-semibold' 
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Table size={18} className={exportFormat === 'csv' ? 'text-[#194775] dark:text-[#38bdf8]' : ''} />
                    <span className="text-sm">Planilha CSV</span>
                  </div>
                </div>
              </div>

              {/* Intervalo de Logs */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-[#A07146] mb-2 block">INTERVALO DE LOGS</label>
                <select 
                  value={exportType}
                  onChange={(e) => { setExportType(e.target.value); setExportValue(''); }}
                  className="w-full bg-slate-50 dark:bg-[#081330] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#194775] dark:focus:ring-[#38bdf8] outline-none transition-all appearance-none"
                >
                  <option value="all">Completo (Últimos 500 logs)</option>
                  <option value="user">Por Usuário Específico</option>
                  <option value="date">Por Data Específica</option>
                </select>
              </div>

              {exportType === 'user' && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#A07146] mb-2 block">Nome do Usuário</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Leandro, Priscila..."
                    value={exportValue}
                    onChange={(e) => setExportValue(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#081330] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#194775] dark:focus:ring-[#38bdf8] outline-none transition-all"
                  />
                </div>
              )}

              {exportType === 'date' && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#A07146] mb-2 block">Data Específica</label>
                  <input 
                    type="date" 
                    value={exportValue}
                    onChange={(e) => setExportValue(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#081330] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#194775] dark:focus:ring-[#38bdf8] outline-none transition-all"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-white/5">
              <button 
                onClick={() => setShowExportModal(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleExportPDF}
                disabled={exporting || (exportType !== 'all' && !exportValue)}
                className="bg-[#194775] hover:bg-[#194775]/90 dark:bg-[#38bdf8] dark:text-slate-950 dark:hover:bg-[#38bdf8]/90 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                {exporting ? 'Gerando...' : (
                  <>
                    <Download size={16} /> 
                    {exportFormat === 'pdf' ? 'Fazer Download PDF' : 'Gerar Planilha'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
