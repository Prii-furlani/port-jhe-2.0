import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, 
  Clock, 
  FolderCheck, 
  Eye, 
  Building2, 
  Activity,
  ListChecks,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardMaster = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca dos dados dinâmicos do Dashboard
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/dashboard/summary', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Erro ao buscar dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin_master') {
      fetchDashboardData();
    }
  }, [user, token]);

  // RBAC: Se não for Master, exibe Forbidden
  if (user?.role !== 'admin_master') {
    return (
      <div className="forbidden-container">
        <ShieldAlert size={64} className="forbidden-icon" />
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>403 Forbidden</h1>
        <p>Acesso Negado. Você não possui privilégios de Administrador Master.</p>
      </div>
    );
  }

  // Helper para Skeletons
  const renderSkeleton = (width, height, borderRadius = '4px') => (
    <div className="skeleton" style={{ width, height, borderRadius }}></div>
  );

  return (
    <div>
      {/* Cabeçalho */}
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Painel de Controle Executivo</h1>
          <p className="dash-subtitle">Bem-vindo de volta, {user?.nome}. Confira o status e as pendências do JHE Portal.</p>
        </div>
        <div className="dash-badge">
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }}></div>
          MySQL Conectado
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="dash-kpi-grid">
        <div className="dash-kpi-card" style={{ borderTop: '4px solid #d97706' }}>
          <div className="dash-kpi-card-header">
            <span>Aprovação Pendente</span>
            <Clock size={18} color="#d97706" />
          </div>
          <div className="dash-kpi-value">
            {loading ? renderSkeleton('60px', '40px') : data?.kpis?.pending_approval || 0}
          </div>
        </div>

        <div className="dash-kpi-card" style={{ borderTop: '4px solid #194775' }}>
          <div className="dash-kpi-card-header">
            <span>Projetos Ativos</span>
            <FolderCheck size={18} color="#194775" />
          </div>
          <div className="dash-kpi-value">
            {loading ? renderSkeleton('60px', '40px') : data?.kpis?.active_projects || 0}
          </div>
        </div>

        <div className="dash-kpi-card" style={{ borderTop: '4px solid #38bdf8' }}>
          <div className="dash-kpi-card-header">
            <span>Total de Projetos</span>
            <Building2 size={18} color="#38bdf8" />
          </div>
          <div className="dash-kpi-value">
            {loading ? renderSkeleton('60px', '40px') : data?.kpis?.total_projects || 0}
          </div>
        </div>

        <div className="dash-kpi-card" style={{ borderTop: '4px solid #10b981' }}>
          <div className="dash-kpi-card-header">
            <span>Visualizações Totais</span>
            <Eye size={18} color="#10b981" />
          </div>
          <div className="dash-kpi-value">
            {loading ? renderSkeleton('60px', '40px') : data?.kpis?.total_views || 0}
          </div>
        </div>
      </div>

      {/* Conteúdo Central */}
      <div className="dash-content-grid">
        
        {/* Coluna Esquerda: Fila de Aprovação */}
        <div className="dash-panel">
          <h2 className="dash-panel-title">
            <ListChecks size={20} color="var(--primary-color)" /> 
            Fila de Revisão de Projetos
          </h2>
          
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {renderSkeleton('100%', '40px')}
              {renderSkeleton('100%', '40px')}
              {renderSkeleton('100%', '40px')}
            </div>
          ) : data?.approval_queue?.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Projeto</th>
                    <th>Setor</th>
                    <th>Autor</th>
                    <th>Status</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {data.approval_queue.map(proj => (
                    <tr key={proj.id}>
                      <td style={{ fontWeight: 600 }}>{proj.title}</td>
                      <td>{proj.sector_name || '-'}</td>
                      <td>{proj.created_by || 'Sistema'}</td>
                      <td><span className="dash-status-badge status-pending">Pendente</span></td>
                      <td>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                          onClick={() => navigate('/admin/projetos/revisoes')}
                        >
                          Ir para Fila
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <FolderCheck size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
              <p>Excelente! Todos os projetos submetidos foram revisados.</p>
            </div>
          )}
        </div>

        {/* Coluna Direita: Auditoria Recente */}
        <div className="dash-panel">
          <h2 className="dash-panel-title">
            <Activity size={20} color="var(--accent-color)" /> 
            Auditoria Recente
          </h2>
          
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {renderSkeleton('32px', '32px', '50%')}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {renderSkeleton('80%', '16px')}
                  {renderSkeleton('40%', '12px')}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {renderSkeleton('32px', '32px', '50%')}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {renderSkeleton('70%', '16px')}
                  {renderSkeleton('30%', '12px')}
                </div>
              </div>
            </div>
          ) : data?.audit_stream?.length > 0 ? (
            <div className="audit-feed">
              {data.audit_stream.map(log => (
                <div className="audit-item" key={log.id}>
                  <div className="audit-icon-wrapper">
                    <Activity size={16} />
                  </div>
                  <div className="audit-info">
                    <p className="audit-desc">
                      <strong>{log.usuario_nome || 'Sistema'}</strong> executou <strong>{log.acao}</strong> na tabela <em>{log.tabela_afetada || 'N/A'}</em>.
                    </p>
                    <p className="audit-time">
                      {new Date(log.created_at).toLocaleString('pt-BR')} - Status: {log.status}
                    </p>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => navigate('/admin/audit-logs')}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: 'var(--primary-color)', 
                  fontWeight: 600, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.25rem',
                  cursor: 'pointer',
                  marginTop: '1rem'
                }}
              >
                Ver histórico completo <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Nenhum log recente.</p>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default DashboardMaster;
