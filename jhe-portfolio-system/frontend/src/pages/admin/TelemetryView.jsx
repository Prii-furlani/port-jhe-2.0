import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Eye, Users, BarChart2, Award, Download, Loader2, Activity } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

const TelemetryView = () => {
  const { token } = useAuth();
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (token) fetchTelemetry();
  }, [period, token]);

  const fetchTelemetry = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/telemetry/summary?period=${period}`, {
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

  const handleExport = async () => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/telemetry/export/pdf?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        console.error('Erro ao exportar PDF');
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio_telemetria_jhe_${period}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Erro de rede ao exportar PDF', e);
    }
  };

  const COLORS = ['#38bdf8', '#194775', '#A07146', '#0ea5e9', '#0284c7'];

  return (
    <div className="min-h-screen bg-dominant-light dark:bg-dominant-dark p-8 font-sans transition-colors duration-300">

      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 text-xs font-bold uppercase tracking-widest rounded-full mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Monitoramento em Tempo Real
          </div>
          <h1 className="text-3xl font-extrabold text-secondary-brand dark:text-white mb-2">Telemetria & Analytics Executivo</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Métricas de engajamento dos softwares, projetos e pesquisas na vitrine da JHE.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-white dark:bg-secondary-dark p-1.5 rounded-xl border border-slate-200 dark:border-white/10 flex gap-1 shadow-sm">
            {['7d', '30d', '90d', 'year'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${period === p
                  ? 'bg-secondary-brand text-white dark:bg-accent-primary dark:text-slate-900 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
              >
                {p === '7d' ? '7 Dias' : p === '30d' ? '30 Dias' : p === '90d' ? '90 Dias' : 'Ano'}
              </button>
            ))}
          </div>

          <button onClick={handleExport} className="bg-white dark:bg-secondary-dark text-secondary-brand dark:text-white border border-slate-200 dark:border-white/10 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm">
            <Download size={18} /> Exportar
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-[#38bdf8]">
          <Loader2 size={48} className="animate-spin mb-4" />
          <p className="font-bold text-slate-500 dark:text-slate-400 animate-pulse">Sincronizando com Banco de Dados...</p>
        </div>
      )}

      {!loading && data && (
        <div className="space-y-8">
          {/* A. LINHA SUPERIOR: KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative bg-white dark:bg-[#020920] border border-slate-200/90 dark:border-white/10 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none select-none z-0 -rotate-12 transform text-[#194775] opacity-40 dark:text-[#38bdf8] dark:opacity-30 group-hover:scale-110 transition-transform">
                <Eye size={90} />
              </div>
              <div className="relative z-10">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">Total de Visualizações</p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-[#194775] dark:text-white tracking-tight">{data.kpis.total_views}</h2>
              </div>
            </div>

            <div className="relative bg-white dark:bg-[#020920] border border-slate-200/90 dark:border-white/10 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none select-none z-0 -rotate-12 transform text-[#194775] opacity-40 dark:text-[#38bdf8] dark:opacity-30 group-hover:scale-110 transition-transform">
                <Users size={90} />
              </div>
              <div className="relative z-10">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">Visitantes Únicos</p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-[#194775] dark:text-white tracking-tight">{data.kpis.unique_visitors}</h2>
              </div>
            </div>

            <div className="relative bg-white dark:bg-[#020920] border border-slate-200/90 dark:border-white/10 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none select-none z-0 -rotate-12 transform text-[#194775] opacity-40 dark:text-[#38bdf8] dark:opacity-30 group-hover:scale-110 transition-transform">
                <BarChart2 size={90} />
              </div>
              <div className="relative z-10">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">Média Views/Visita</p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-[#194775] dark:text-white tracking-tight">{data.kpis.avg_views_per_visitor}</h2>
              </div>
            </div>

            <div className="relative bg-white dark:bg-[#020920] border border-slate-200/90 dark:border-white/10 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none select-none z-0 -rotate-12 transform text-[#A07146] opacity-30 dark:text-[#A07146] dark:opacity-30 group-hover:scale-110 transition-transform">
                <Award size={90} />
              </div>
              <div className="relative z-10">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">Categoria Dominante</p>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#A07146] dark:text-[#A07146] tracking-tight truncate" title={data.kpis.most_viewed_service}>{data.kpis.most_viewed_service}</h2>
              </div>
            </div>
          </div>

          {/* B. BLOCO CENTRAL 1: Gráfico Principal */}
          <div className="bg-white dark:bg-secondary-dark border border-slate-200 dark:border-white/5 p-8 rounded-3xl shadow-lg">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Tráfego de Visualizações ({period === '7d' ? 'Últimos 7 dias' : period === '30d' ? 'Últimos 30 dias' : period === '90d' ? 'Últimos 90 dias' : 'Ano Atual'})</h3>
            <div className="h-80 w-full">
              {data.time_series.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.time_series} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: 'rgba(2, 9, 32, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontWeight: 'bold' }}
                      itemStyle={{ color: '#38bdf8' }}
                    />
                    <Area type="monotone" dataKey="views" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 font-semibold">Sem dados registrados para este período.</div>
              )}
            </div>
          </div>

          {/* C. BLOCO CENTRAL 2: Donut & Top Projetos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Donut Chart */}
            <div className="bg-white dark:bg-secondary-dark border border-slate-200 dark:border-white/5 p-8 rounded-3xl shadow-lg flex flex-col">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Distribuição por Categoria</h3>
              <div className="flex-1 flex items-center justify-center">
                {data.category_distribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.category_distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {data.category_distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: 'rgba(2, 9, 32, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-slate-500 font-semibold">Sem dados suficientes.</p>
                )}
              </div>
              {/* Legenda */}
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                {data.category_distribution.map((cat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    {cat.name} ({cat.value})
                  </div>
                ))}
              </div>
            </div>

            {/* Top Projetos */}
            <div className="bg-white dark:bg-secondary-dark border border-slate-200 dark:border-white/5 p-8 rounded-3xl shadow-lg">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Top 5 Projetos Mais Acessados</h3>
              <div className="space-y-5">
                {data.top_projects.length > 0 ? data.top_projects.map((proj, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                      {proj.cover_image_url ? (
                        <img src={`http://localhost:5000${proj.cover_image_url}`} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">{idx + 1}</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{proj.title}</h4>
                      <p className="text-xs font-semibold text-accent-secondary truncate">{proj.service_name}</p>

                      {/* Barra de Progresso Relativa */}
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full mt-2">
                        <div className="h-full bg-accent-primary rounded-full" style={{ width: `${(proj.views / data.top_projects[0].views) * 100}%` }}></div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-lg font-black text-secondary-brand dark:text-white">{proj.views}</span>
                      <p className="text-[10px] uppercase font-bold text-slate-500">views</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-slate-500 font-semibold text-center py-10">Sem projetos acessados no período.</p>
                )}
              </div>
            </div>
          </div>

          {/* D. BLOCO INFERIOR: Buscas */}
          <div className="bg-white dark:bg-secondary-dark border border-slate-200 dark:border-white/5 p-8 rounded-3xl shadow-lg flex flex-col md:flex-row gap-8 items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Termos Mais Buscados na Vitrine</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">O que os visitantes estão procurando ativamente.</p>

              <div className="flex flex-wrap gap-3">
                {data.top_searches.length > 0 ? data.top_searches.map((term, idx) => (
                  <div key={idx} className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-4 py-2 rounded-full flex items-center gap-3 shadow-sm hover:scale-105 transition-transform cursor-default">
                    <span className="font-bold text-slate-700 dark:text-slate-200">{term.name}</span>
                    <span className="bg-secondary-brand text-white dark:bg-accent-primary dark:text-slate-900 text-xs font-black px-2 py-0.5 rounded-full">{term.count}</span>
                  </div>
                )) : (
                  <span className="text-slate-500 italic">Sem registros de busca.</span>
                )}
              </div>
            </div>

            <div className="hidden lg:flex p-6 bg-slate-50 dark:bg-black/20 rounded-2xl items-center gap-4 min-w-[300px]">
              <div className="p-3 bg-secondary-brand/10 dark:bg-accent-primary/10 text-secondary-brand dark:text-accent-primary rounded-xl"><Activity size={24} /></div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status do Sistema</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">API Telemetria Ativa & Atualizando</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TelemetryView;
