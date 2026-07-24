import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Eye, Check, X, MessageSquare, AlertCircle, Loader2, XCircle } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

const ProjectReviewQueue = () => {
  const [tab, setTab] = useState('pending');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [inspectProject, setInspectProject] = useState(null); // ID for inspect modal
  const [rejectProject, setRejectProject] = useState(null); // ID for reject modal
  const [feedback, setFeedback] = useState('');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/projects/pending?status=${tab}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setProjects(json.data);
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro ao buscar projetos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [tab]);

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/projects/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        fetchProjects(); // refresh list
      } else {
        toast.error(json.message);
      }
    } catch (e) {
      toast.error("Erro ao aprovar projeto.");
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) {
      toast.error("A justificativa é obrigatória.");
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/projects/${rejectProject}/reject`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ review_feedback: feedback })
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        setRejectProject(null);
        setFeedback('');
        fetchProjects();
      } else {
        toast.error(json.message);
      }
    } catch (e) {
      toast.error("Erro ao rejeitar projeto.");
    }
  };

  const pendingCount = tab === 'pending' ? projects.length : 0; // Idealmente a API mandaria o counter global

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] p-8 font-sans transition-colors duration-300 relative">
      <Toaster position="top-right" />
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#194775] dark:text-white mb-2 flex items-center gap-3">
            Fila de Moderação & Aprovação
            {tab === 'pending' && projects.length > 0 && (
              <span className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">
                <AlertCircle size={14} /> {projects.length} Pendentes
              </span>
            )}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Revise, aprove ou solicite ajustes nos projetos enviados pelos autores antes de irem para a vitrine.</p>
        </div>
      </div>

      {/* FILTROS (TABS) */}
      <div className="flex gap-2 mb-8 border-b border-slate-200 dark:border-white/10 pb-4 overflow-x-auto">
        <button 
          onClick={() => setTab('pending')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${tab === 'pending' ? 'bg-[#194775] text-white dark:bg-[#38bdf8] dark:text-slate-900 shadow-md' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-white/5'}`}
        >
          <Clock size={18} /> Aguardando Moderação
        </button>
        <button 
          onClick={() => setTab('active')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${tab === 'active' ? 'bg-[#194775] text-white dark:bg-[#38bdf8] dark:text-slate-900 shadow-md' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-white/5'}`}
        >
          <CheckCircle2 size={18} /> Aprovados (Ativos)
        </button>
        <button 
          onClick={() => setTab('rejected')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${tab === 'rejected' ? 'bg-[#194775] text-white dark:bg-[#38bdf8] dark:text-slate-900 shadow-md' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-white/5'}`}
        >
          <AlertCircle size={18} /> Ajustes Solicitados
        </button>
      </div>

      {/* ESTADO DE LOADING */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-[#38bdf8]">
          <Loader2 size={48} className="animate-spin mb-4" />
          <p className="font-bold text-slate-500 dark:text-slate-400">Carregando fila...</p>
        </div>
      ) : projects.length === 0 ? (
        /* ESTADO VAZIO */
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center animate-fade-in">
          <div className="w-24 h-24 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Tudo em dia!</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-md">
            Não há projetos com o status <strong>{tab === 'pending' ? 'Aguardando Moderação' : tab === 'active' ? 'Aprovado' : 'Rejeitado'}</strong> no momento.
          </p>
        </div>
      ) : (
        /* LISTA BENTO DE CARDS */
        <div className="space-y-6">
          {projects.map(proj => (
            <div key={proj.id} className="bg-white dark:bg-[#081330] border border-slate-200 dark:border-white/5 rounded-3xl p-6 flex flex-col xl:flex-row gap-6 shadow-md hover:shadow-lg transition-shadow">
              
              {/* Info Autor & Meta */}
              <div className="flex-shrink-0 xl:w-64 border-b xl:border-b-0 xl:border-r border-slate-200 dark:border-white/10 pb-6 xl:pb-0 xl:pr-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#194775]/10 dark:bg-[#38bdf8]/10 text-[#194775] dark:text-[#38bdf8] rounded-full flex items-center justify-center font-black text-lg">
                    {proj.author_name ? proj.author_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{proj.author_name}</p>
                    <p className="text-xs text-slate-500 truncate">{proj.author_email}</p>
                  </div>
                </div>
                
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Enviado em</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{new Date(proj.submitted_at).toLocaleString('pt-BR')}</p>

                {tab === 'pending' && (
                  <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 text-xs font-black rounded-md">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span> Pendente
                  </div>
                )}
                {tab === 'rejected' && (
                  <div className="mt-4">
                    <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Motivo da Rejeição</p>
                    <p className="text-xs text-slate-500 italic border-l-2 border-red-400 pl-2">{proj.review_feedback}</p>
                  </div>
                )}
              </div>

              {/* Resumo do Projeto */}
              <div className="flex-1 flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-48 h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                  {proj.cover_image_url ? (
                    <img src={`http://localhost:5000${proj.cover_image_url}`} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">Sem Imagem</div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-black text-[#194775] dark:text-white mb-2">{proj.title}</h2>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Serviço</p>
                      <p className="text-sm font-semibold text-[#A07146]">{proj.service}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Cliente</p>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{proj.client_name || 'Interno'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="flex-shrink-0 flex xl:flex-col gap-3 justify-center border-t xl:border-t-0 xl:border-l border-slate-200 dark:border-white/10 pt-6 xl:pt-0 xl:pl-6">
                <button 
                  onClick={() => setInspectProject(proj.id)}
                  className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-colors"
                >
                  <Eye size={16} /> Inspecionar
                </button>
                
                {tab === 'pending' && (
                  <>
                    <button 
                      onClick={() => handleApprove(proj.id)}
                      className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors shadow-md shadow-green-500/20"
                    >
                      <Check size={16} /> Aprovar
                    </button>
                    <button 
                      onClick={() => setRejectProject(proj.id)}
                      className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 font-bold rounded-xl transition-colors"
                    >
                      <MessageSquare size={16} /> Solicitar Ajustes
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE REJEIÇÃO / FEEDBACK */}
      {rejectProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#081330] w-full max-w-lg rounded-3xl p-8 shadow-2xl relative">
            <button onClick={() => setRejectProject(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-black text-[#194775] dark:text-white mb-2 flex items-center gap-2">
              <AlertCircle className="text-amber-500" /> Solicitar Ajustes
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">
              O autor será notificado e o projeto voltará para Rascunho/Rejeitado. Explique exatamente o que precisa ser corrigido.
            </p>
            <form onSubmit={handleRejectSubmit}>
              <textarea 
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Ex: Faltou adicionar fotos da galeria ou detalhar as tecnologias..."
                className="w-full h-32 bg-slate-50 dark:bg-[#020817] border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#38bdf8] mb-6 resize-none"
                required
              />
              <div className="flex gap-4">
                <button type="button" onClick={() => setRejectProject(null)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition-colors">
                  Rejeitar Projeto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE INSPEÇÃO (IFRAME OU OVERLAY PREVIEW) */}
      {inspectProject && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-[#020817] animate-fade-in">
          <div className="h-16 border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-6 bg-white dark:bg-[#081330] shadow-sm">
            <div className="flex items-center gap-3">
              <Eye className="text-[#194775] dark:text-[#38bdf8]" />
              <h2 className="font-bold text-[#194775] dark:text-white">Modo Inspeção Segura</h2>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => handleApprove(inspectProject)} 
                className="bg-green-500 text-white font-bold px-4 py-1.5 rounded-lg text-sm hover:bg-green-600 shadow-md"
              >
                Aprovar Agora
              </button>
              <button onClick={() => setInspectProject(null)} className="text-slate-500 hover:text-red-500 font-bold flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-lg transition-colors">
                <XCircle size={16} /> Fechar Inspeção
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <iframe 
              src={`/projetos/${inspectProject}`} 
              title="Preview do Projeto" 
              className="w-full h-full border-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectReviewQueue;
