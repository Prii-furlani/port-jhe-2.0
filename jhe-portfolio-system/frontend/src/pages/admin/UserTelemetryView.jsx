import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, FolderCheck, Award, Loader2, Plus, Edit } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const UserTelemetryView = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserTelemetry();
  }, []);

  const fetchUserTelemetry = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/user/dashboard-summary`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRedirect = (projectId) => {
    navigate('/admin/projects', { state: { editProjectId: projectId } });
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-[#38bdf8]">
        <Loader2 size={48} className="animate-spin mb-4" />
        <p className="font-bold text-slate-500 dark:text-slate-400 animate-pulse">Sincronizando seus dados...</p>
      </div>
    );
  }

  // Tratamento de Estado Vazio (Empty State)
  const totalProjects = data ? (data.kpis.published_count + data.kpis.pending_count + data.kpis.draft_count + data.kpis.rejected_count) : 0;
  if (data && totalProjects === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center animate-fade-in">
        <div className="bg-white dark:bg-[#081330] border border-slate-200 dark:border-white/10 p-12 rounded-3xl shadow-xl max-w-2xl w-full">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <FolderCheck size={40} className="text-slate-400 dark:text-slate-500" />
          </div>
          <h2 className="text-2xl font-black text-[#194775] dark:text-white mb-4">Bem-vindo(a) à sua central de desempenho!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium text-lg">
            Você ainda não possui projetos com métricas registradas. Que tal cadastrar seu primeiro software ou projeto?
          </p>
          <Link 
            to="/admin/projects" 
            className="inline-flex items-center gap-2 bg-[#194775] hover:bg-[#123154] dark:bg-[#38bdf8] dark:hover:bg-[#0ea5e9] dark:text-slate-900 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            <Plus size={20} /> Cadastrar Novo Projeto
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] p-8 font-sans transition-colors duration-300">
      
      {/* CABEÇALHO */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-[#194775] dark:text-white mb-2">Desempenho dos Meus Projetos</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Acompanhe a visibilidade, acessos e engajamento das suas soluções publicadas.</p>
      </div>

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

      {data && (
        <div className="space-y-8">
          
          {/* KPIs SUPERIORES (3 CARDS) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#081330] border border-slate-200 dark:border-white/5 p-6 rounded-3xl shadow-lg relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 text-[#38bdf8]/10 group-hover:scale-110 transition-transform"><TrendingUp size={120} /></div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 relative z-10 flex items-center justify-between">
                Visualizações Totais
                <span className="bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 px-2 py-0.5 rounded-full text-[10px] font-black">+ Ativo</span>
              </p>
              <h2 className="text-4xl font-black text-[#194775] dark:text-white relative z-10">{data.telemetry_kpis.total_views}</h2>
            </div>

            <div className="bg-white dark:bg-[#081330] border border-slate-200 dark:border-white/5 p-6 rounded-3xl shadow-lg relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 text-indigo-500/10 group-hover:scale-110 transition-transform"><FolderCheck size={120} /></div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 relative z-10">Média Acessos/Proj</p>
              <h2 className="text-4xl font-black text-[#194775] dark:text-white relative z-10">{data.telemetry_kpis.avg_views_per_project}</h2>
            </div>

            <div className="bg-white dark:bg-[#081330] border border-slate-200 dark:border-white/5 p-6 rounded-3xl shadow-lg relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 text-[#A07146]/10 group-hover:scale-110 transition-transform"><Award size={120} /></div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 relative z-10">Projeto Destaque</p>
              {data.telemetry_kpis.top_project ? (
                <div className="flex items-center gap-3 mt-3 relative z-10">
                  {data.telemetry_kpis.top_project.imagem_url ? (
                    <img src={`http://localhost:5000${data.telemetry_kpis.top_project.imagem_url}`} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-200 dark:bg-slate-800" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-bold">Sem img</div>
                  )}
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
                    Projeto Destaque: Mais de 100 visualizações na vitrine!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* GRÁFICO DE ÁREA */}
          <div className="bg-white dark:bg-[#081330] border border-slate-200 dark:border-white/5 p-8 rounded-3xl shadow-lg">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Evolução de Acessos (Últimos 30 dias)</h3>
            <div className="h-80 w-full">
              {data.views_history && data.views_history.length > 0 ? (
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
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 font-semibold">Nenhum acesso registrado nos últimos 30 dias.</div>
              )}
            </div>
          </div>

          {/* TABELA DE PERFORMANCE POR PROJETO */}
          <div className="bg-white dark:bg-[#081330] border border-slate-200 dark:border-white/5 rounded-3xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-white/10">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Performance por Projeto</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold">
                    <th className="px-6 py-4">Projeto</th>
                    <th className="px-6 py-4">Impacto</th>
                    <th className="px-6 py-4 text-center">Visualizações</th>
                    <th className="px-6 py-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {data.ranking.map(proj => (
                    <tr key={proj.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                          {proj.imagem_url ? (
                            <img src={`http://localhost:5000${proj.imagem_url}`} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Sem img</div>
                          )}
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-200 max-w-[250px] truncate" title={proj.titulo}>
                          {proj.titulo}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 w-full max-w-[120px]">
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{proj.impacto}% de impacto</span>
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-[#38bdf8]" style={{ width: `${proj.impacto}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-lg font-black text-[#194775] dark:text-[#38bdf8]">{proj.views}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleEditRedirect(proj.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-[#194775] dark:text-[#38bdf8] bg-[#194775]/10 dark:bg-[#38bdf8]/10 hover:bg-[#194775]/20 dark:hover:bg-[#38bdf8]/20 rounded-lg transition-colors"
                        >
                          <Edit size={14} /> Otimizar / Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default UserTelemetryView;
