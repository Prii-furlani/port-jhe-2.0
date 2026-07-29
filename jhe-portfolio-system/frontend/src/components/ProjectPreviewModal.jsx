import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, MapPin, Calendar, Clock } from 'lucide-react';

const ProjectPreviewModal = ({ isOpen, onClose, project, userRole, onApprove, onReject }) => {
  const [updates, setUpdates] = useState([]);
  const [isLoadingUpdates, setIsLoadingUpdates] = useState(false);

  useEffect(() => {
    if (isOpen && project?.id) {
      setIsLoadingUpdates(true);
      fetch(`http://localhost:5000/api/projects/${project.id}/updates`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUpdates(data.data);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoadingUpdates(false));
    }
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#020920] w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* CABEÇALHO */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Pré-visualização do Projeto</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTEÚDO (SCROLLÁVEL) */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* COLUNA ESQUERDA: IMAGEM E METADADOS */}
            <div className="w-full md:w-1/3 flex flex-col gap-6">
              
              {/* Capa */}
              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700">
                {project.imagem_url ? (
                  <img src={`http://localhost:5000${project.imagem_url}`} alt={project.titulo} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-semibold">
                    Sem Capa
                  </div>
                )}
              </div>

              {/* Informações Básicas */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50">
                <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Ficha Técnica</h3>
                
                <div className="flex flex-col gap-3 text-sm">
                  <div>
                    <span className="block text-slate-500 dark:text-slate-400 mb-0.5">Autor (Criador)</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{project.autor_nome || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 dark:text-slate-400 mb-0.5">Cliente</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <MapPin size={14} className="text-[#194775] dark:text-[#38bdf8]" />
                      {project.cliente_nome || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-500 dark:text-slate-400 mb-0.5">Setor</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{project.setor || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 dark:text-slate-400 mb-0.5">Ano de Desenvolvimento</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Calendar size={14} className="text-[#d97706] dark:text-[#fbbf24]" />
                      {project.ano_desenvolvimento || '-'}
                    </span>
                  </div>
                  
                  <div>
                    <span className="block text-slate-500 dark:text-slate-400 mb-0.5">Localização</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <MapPin size={14} className="text-emerald-600 dark:text-emerald-400" />
                      {project.localizacao || '-'}
                    </span>
                  </div>
                  
                  {project.stakeholders && (
                    <div>
                      <span className="block text-slate-500 dark:text-slate-400 mb-0.5">Stakeholders</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(Array.isArray(project.stakeholders) ? project.stakeholders : JSON.parse(project.stakeholders || '[]')).map((stk, idx) => (
                          <span key={idx} className="bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {stk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* COLUNA DIREITA: TEXTOS E TAGS */}
            <div className="w-full md:w-2/3 flex flex-col gap-6">
              
              <div>
                {project.servico_nome && (
                  <span className="inline-block px-3 py-1 bg-[#194775]/10 text-[#194775] dark:bg-[#38bdf8]/10 dark:text-[#38bdf8] text-xs font-black rounded-full uppercase tracking-widest mb-3">
                    {project.servico_nome}
                  </span>
                )}
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4">
                  {project.titulo}
                </h1>
                
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {project.resumo_curto || 'Nenhum resumo curto fornecido.'}
                </p>
              </div>

              <div className="w-full h-px bg-slate-200 dark:bg-slate-700/50"></div>

              <div>
                <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Descrição Detalhada</h3>
                <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm whitespace-pre-line leading-relaxed">
                  {project.descricao_detalhada || 'Nenhuma descrição detalhada fornecida.'}
                </div>
              </div>

              {project.desafios && (
                <div>
                  <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Desafios e Complexidades</h3>
                  <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm whitespace-pre-line leading-relaxed">
                    {project.desafios}
                  </div>
                </div>
              )}

              {project.metodologias && (
                <div>
                  <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Metodologias Utilizadas</h3>
                  <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm whitespace-pre-line leading-relaxed">
                    {project.metodologias}
                  </div>
                </div>
              )}

              {project.kpis_impacto && (
                <div>
                  <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Resultados e Impacto</h3>
                  <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm whitespace-pre-line leading-relaxed">
                    {project.kpis_impacto}
                  </div>
                </div>
              )}

              {project.tecnologias && project.tecnologias.length > 0 && (
                <div className="mt-2">
                  <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Tags & Tecnologias</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tecnologias.map((tech) => (
                      <span key={tech.id} className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 px-3 py-1.5 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
                        {tech.icone_url && (
                          <img src={tech.icone_url.startsWith('http') ? tech.icone_url : `http://localhost:5000${tech.icone_url}`} alt={tech.nome} className="w-4 h-4 object-contain" />
                        )}
                        {tech.nome}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Galeria de Fotos */}
              {project.galeria && project.galeria.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Galeria de Fotos</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {project.galeria.map((img) => (
                      <div key={img.id} className="w-full aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-sm">
                        <img 
                          src={`http://localhost:5000${img.imagem_url}`} 
                          alt="Foto da Galeria" 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Linha do Tempo (Updates) */}
              {!isLoadingUpdates && updates.length > 0 && (
                <div className="mt-8 border-t border-slate-200 dark:border-slate-700/50 pt-8">
                  <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Clock size={16} /> Histórico de Atualizações
                  </h3>
                  
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 dark:before:via-slate-600 before:to-transparent">
                    {updates.map((update, index) => {
                      const dateObj = new Date(update.data_atualizacao);
                      const formattedDate = dateObj.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
                      
                      return (
                        <div key={update.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          {/* Icon */}
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-500 dark:text-indigo-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                            <Calendar size={16} />
                          </div>
                          
                          {/* Card */}
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm relative hover:shadow-md transition-shadow">
                            <div className="mb-2">
                              <time className="text-xs font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">
                                {formattedDate}
                              </time>
                            </div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">{update.titulo}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed">
                              {update.descricao}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* RODAPÉ E AÇÕES DE APROVAÇÃO */}
        <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Status atual: <strong className="uppercase">{project.status}</strong>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white dark:text-slate-300 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Fechar Preview
            </button>
            
            {userRole === 'admin_master' && project.status === 'pending' && (
              <>
                <button 
                  onClick={() => { onReject(project.id); onClose(); }}
                  className="px-5 py-2.5 text-sm font-bold text-red-700 bg-red-100 hover:bg-red-200 rounded-xl transition-colors flex items-center gap-2"
                >
                  <XCircle size={18} />
                  Rejeitar
                </button>
                <button 
                  onClick={() => { onApprove(project.id); onClose(); }}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-[#10b981] hover:bg-[#059669] rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-[#10b981]/20"
                >
                  <CheckCircle size={18} />
                  Aprovar Projeto
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProjectPreviewModal;
