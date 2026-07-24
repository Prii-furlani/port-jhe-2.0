import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, Clock, FileText, AlertTriangle, Plus, LayoutDashboard, Edit2, TrendingUp, Award, FolderCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/user/dashboard-summary?range=${timeRange}`, {
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

    fetchDashboardData();
  }, [token, timeRange]);

  const renderSkeleton = (width, height, borderRadius = '4px') => (
    <div className="skeleton" style={{ width, height, borderRadius }}></div>
  );

  return (
    <div className="min-h-screen">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <LayoutDashboard className="text-[#194775] dark:text-[#38bdf8]" />
            Olá, {user?.nome?.split(' ')[0] || 'Autor'}!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gerencie seus softwares e acompanhe a aprovação de novos projetos.</p>
        </div>
        
        <button 
          onClick={() => navigate('/admin/projects')} 
          className="bg-[#194775] text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Cadastrar Novo Projeto
        </button>
      </div>

      {/* Alerta Condicional de Revisão */}
      {!loading && data?.kpis?.rejected_count > 0 && (
        <div className="mb-8 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-xl flex items-start gap-4 shadow-sm">
          <AlertTriangle className="text-amber-500 mt-0.5" size={24} />
          <div>
            <h3 className="font-bold text-amber-800 dark:text-amber-400">Atenção Necessária</h3>
            <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
              Você tem {data.kpis.rejected_count} projeto(s) que precisam de ajustes. O Administrador Master deixou um feedback na sua fila.
            </p>
            <button 
              onClick={() => navigate('/admin/projects')}
              className="mt-2 text-amber-600 dark:text-amber-400 font-bold text-sm hover:underline"
            >
              Ir para meus projetos ajustáveis &rarr;
            </button>
          </div>
        </div>
      )}

      {/* BANNER DE PROPÓSITO SUPERIOR */}
      <div className="mb-8 bg-gradient-to-r from-[#194775] to-[#38bdf8] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 transform origin-top"></div>
        <div className="relative z-10 max-w-3xl">
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest mb-4">
            SEU IMPACTO GLOBAL
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
            O seu trabalho inspira transformação.
          </h2>
          <p className="text-sky-100 text-sm md:text-base leading-relaxed">
            Cada visualização registrada aqui representa uma pessoa, empresa ou comunidade conhecendo o legado que você ajudou a construir através da JHE Engenharia.
          </p>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border-t-4 border-[#10b981] flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 mb-2 font-semibold">
            <span>Projetos Publicados</span>
            <CheckCircle2 size={20} className="text-[#10b981]" />
          </div>
          <div className="text-3xl font-black text-slate-800 dark:text-white">
            {loading ? renderSkeleton('60px', '36px') : data?.kpis?.published_count || 0}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border-t-4 border-[#f59e0b] flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 mb-2 font-semibold">
            <span>Aguardando Moderação</span>
            <Clock size={20} className="text-[#f59e0b]" />
          </div>
          <div className="text-3xl font-black text-slate-800 dark:text-white">
            {loading ? renderSkeleton('60px', '36px') : data?.kpis?.pending_count || 0}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border-t-4 border-[#64748b] flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 mb-2 font-semibold">
            <span>Rascunhos</span>
            <FileText size={20} className="text-[#64748b]" />
          </div>
          <div className="text-3xl font-black text-slate-800 dark:text-white">
            {loading ? renderSkeleton('60px', '36px') : data?.kpis?.draft_count || 0}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border-t-4 border-[#ef4444] flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 mb-2 font-semibold">
            <span>Ajustes Solicitados</span>
            <AlertTriangle size={20} className="text-[#ef4444]" />
          </div>
          <div className="text-3xl font-black text-slate-800 dark:text-white">
            {loading ? renderSkeleton('60px', '36px') : data?.kpis?.rejected_count || 0}
          </div>
        </div>
      </div>

      {/* MÉTRICAS DE DESEMPENHO (Views & Impacto) */}
      {!loading && data?.telemetry_kpis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 text-[#38bdf8]/10 group-hover:scale-110 transition-transform"><TrendingUp size={120} /></div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 relative z-10 flex items-center justify-between">
              Visualizações Totais
              <span className="bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 px-2 py-0.5 rounded-full text-[10px] font-black">+ Ativo</span>
            </p>
            <h2 className="text-4xl font-black text-[#194775] dark:text-white relative z-10">{data.telemetry_kpis.total_views}</h2>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 text-indigo-500/10 group-hover:scale-110 transition-transform"><FolderCheck size={120} /></div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 relative z-10">Média Acessos/Proj</p>
            <h2 className="text-4xl font-black text-[#194775] dark:text-white relative z-10">{data.telemetry_kpis.avg_views_per_project}</h2>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 text-[#A07146]/10 group-hover:scale-110 transition-transform"><Award size={120} /></div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 relative z-10">Projeto Destaque</p>
            {data.telemetry_kpis.top_project ? (
              <div className="flex items-center gap-3 mt-3 relative z-10">
                <div className="min-w-0">
                  <h2 className="text-lg font-black text-[#A07146] truncate">{data.telemetry_kpis.top_project.titulo}</h2>
                  <p className="text-xs font-semibold text-slate-500">{data.telemetry_kpis.top_project.views} views</p>
                </div>
              </div>
            ) : (
              <h2 className="text-xl font-bold text-slate-400 relative z-10 mt-3">Nenhum destaque</h2>
            )}
            {data.telemetry_kpis.top_project && data.telemetry_kpis.top_project.views > 100 && (
              <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-xl p-3 flex items-center gap-2 relative z-10">
                <span className="text-lg">🏆</span>
                <p className="text-xs font-bold text-yellow-800 dark:text-yellow-500">
                  Mais de 100 visualizações!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GRÁFICO DE ÁREA */}
      {!loading && data?.views_history && data.views_history.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Evolução de Acessos</h3>
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              {[7, 30, 90, 365].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    timeRange === range
                      ? 'bg-white dark:bg-slate-600 text-[#194775] dark:text-[#38bdf8] shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {range === 365 ? '1 Ano' : `${range} dias`}
                </button>
              ))}
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.views_history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUserViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#194775" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#194775" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(2, 9, 32, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontWeight: 'bold' }} 
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Area type="monotone" dataKey="views" stroke="#194775" strokeWidth={3} fillOpacity={1} fill="url(#colorUserViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tabela de Recentes */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Meus Projetos Recentes</h2>
        
        {loading ? (
          <div className="space-y-4">
            {renderSkeleton('100%', '60px', '12px')}
            {renderSkeleton('100%', '60px', '12px')}
            {renderSkeleton('100%', '60px', '12px')}
          </div>
        ) : data?.recent_projects?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 text-sm">
                  <th className="pb-3 font-semibold">Projeto</th>
                  <th className="pb-3 font-semibold">Data de Criação</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_projects.map(proj => (
                  <tr key={proj.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 flex items-center gap-3">
                      {proj.imagem_url ? (
                        <img src={`http://localhost:5000${proj.imagem_url}`} alt={proj.titulo} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                          <FileText size={16} />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white">{proj.titulo}</p>
                        <p className="text-xs text-slate-500">{proj.servico_nome || 'Geral'}</p>
                      </div>
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-300 text-sm">
                      {new Date(proj.criado_em).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-4">
                      {proj.status === 'active' && <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">Publicado</span>}
                      {proj.status === 'pending' && <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold">Em Revisão</span>}
                      {proj.status === 'draft' && <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs font-bold">Rascunho</span>}
                      {proj.status === 'rejected' && <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">Ajustes Solicitados</span>}
                      {proj.status === 'concluido' && <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">Concluído</span>}
                    </td>
                    <td className="py-4 text-right">
                      <button 
                        onClick={() => navigate('/admin/projects')}
                        className="p-2 text-[#194775] dark:text-[#38bdf8] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors inline-flex"
                        title="Ir para tela de edição"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500">
            <FileText size={48} className="mx-auto text-slate-300 mb-3" />
            <p>Você ainda não criou nenhum projeto.</p>
            <button 
              onClick={() => navigate('/admin/projects')}
              className="mt-4 text-[#194775] font-bold hover:underline"
            >
              Comece agora criando o seu primeiro!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
