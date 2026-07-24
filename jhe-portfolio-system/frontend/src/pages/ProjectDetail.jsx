import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Calendar, MapPin, Building2, CheckCircle2, ChevronRight, CheckCircle, Activity, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${id}`);
      const data = await res.json();
      if (data.success) {
        setProject(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A07146]"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Projeto não encontrado</h2>
        <Link to="/" className="text-[#38bdf8] hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Voltar para a Home
        </Link>
      </div>
    );
  }

  const statusMap = {
    active: { label: 'Em Andamento', icon: Activity, color: 'text-sky-400' },
    concluido: { label: 'Concluído', icon: CheckCircle, color: 'text-green-400' }
  };
  const statusInfo = statusMap[project.status] || { label: project.status, icon: CheckCircle, color: 'text-slate-400' };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-700 dark:text-slate-300 font-sans selection:bg-[#38bdf8]/30 transition-colors duration-300">
      <Navbar />

      {/* 1. SEÇÃO HERO SUPERIOR */}
      <section className="relative w-full h-[60vh] min-h-[400px] flex items-end">
        {/* Imagem de Fundo */}
        <div className="absolute inset-0 z-0">
          <img 
            src={`http://localhost:5000${project.imagem_url}`} 
            alt={project.titulo} 
            className="w-full h-full object-cover"
          />
          {/* Overlay Claro / Escuro (dependendo do tema não podemos mudar gradiente por trás da img tão fácil se não for CSS, mas usaremos bg escuro no texto) */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-100 dark:from-[#020817] via-slate-100/80 dark:via-[#020817]/80 to-black/30 dark:to-black/30" />
        </div>

        {/* Card Flutuante Sobreposto */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-12">
          <div className="max-w-2xl bg-white/90 dark:bg-[#081330]/85 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-3xl p-8 md:p-10 text-slate-800 dark:text-white shadow-2xl transition-colors">
            
            <Link to="/" className="inline-flex items-center gap-2 text-[#194775] dark:text-slate-400 hover:text-sky-600 dark:hover:text-white transition-colors text-sm mb-6 font-semibold tracking-wide">
              <ArrowLeft size={16} /> VOLTAR PARA O PORTFÓLIO
            </Link>

            {/* Badges Iniciais */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="inline-block px-3 py-1 bg-sky-500/10 border border-sky-500/30 text-sky-600 dark:text-sky-400 text-[11px] font-black uppercase tracking-widest rounded-full">
                Jornada de Transformação
              </div>
              {(project.setor || project.servico_nome) && (
                <div className="inline-block px-3 py-1 bg-[#A07146]/10 dark:bg-[#A07146]/20 border border-[#A07146]/30 text-[#A07146] text-[11px] font-black uppercase tracking-widest rounded-full">
                  {project.setor || project.servico_nome}
                </div>
              )}
            </div>
            
            {/* Título Principal */}
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#194775] dark:text-white mb-6 leading-tight">
              {project.titulo}
            </h1>

            {/* Metadados */}
            <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
              {project.localizacao && (
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-[#38bdf8]" />
                  <span>{project.localizacao}</span>
                </div>
              )}
              {project.ano_desenvolvimento && (
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-[#38bdf8]" />
                  <span>{project.ano_desenvolvimento}</span>
                </div>
              )}
              {project.cliente_nome && (
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-[#38bdf8]" />
                  <span>{project.cliente_nome}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <statusInfo.icon size={16} className={statusInfo.color} />
                <span className={statusInfo.color}>{statusInfo.label}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ESTRUTURA DO CONTEÚDO (DIVISÃO 25% / 75%) */}
      <section className="w-full max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
          
          {/* COLUNA DA ESQUERDA - 25% (FICHA TÉCNICA) */}
          <div className="lg:col-span-1 space-y-8 sticky top-32">
            
            <div>
              <h3 className="border-l-4 border-[#A07146] pl-3 text-xl font-bold text-slate-800 dark:text-white mb-1">
                Ficha Técnica
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dados quantitativos e metodologias aplicadas.
              </p>
            </div>

            {/* Box 1: Tecnologias Utilizadas */}
            {project.tecnologias && project.tecnologias.length > 0 && (
              <div className="bg-white dark:bg-[#081330] border border-slate-200 dark:border-white/5 shadow-xl rounded-2xl p-6 transition-colors">
                <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                  Tecnologias Utilizadas
                </h4>
                <div className="flex flex-col gap-3">
                  {project.tecnologias.map(tech => (
                    <div key={tech.id} className="flex items-center gap-3 bg-slate-50 dark:bg-[#0f1d40] px-3 py-2 rounded-xl border border-slate-100 dark:border-white/5">
                      {tech.icone_url ? (
                        <img src={tech.icone_url.startsWith('http') ? tech.icone_url : `http://localhost:5000${tech.icone_url}`} alt={tech.nome} className="w-5 h-5 object-contain" />
                      ) : (
                        <CheckCircle2 size={16} className="text-[#38bdf8]" />
                      )}
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{tech.nome}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Box 2: Equipe Técnica / Pessoas Interessadas */}
            {project.stakeholders && project.stakeholders.length > 0 && (
              <div className="bg-white dark:bg-[#081330] border border-slate-200 dark:border-white/5 shadow-xl rounded-2xl p-6 transition-colors">
                <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                  Mentes por trás deste projeto
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.stakeholders.map((person, idx) => (
                    <span key={idx} className="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-white/10">
                      {person}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Link Externo do Projeto */}
            {project.link_oficial && (
              <a 
                href={project.link_oficial} 
                target="_blank" 
                rel="noreferrer"
                className="w-full bg-[#194775] text-white dark:bg-[#38bdf8] dark:text-slate-950 font-bold px-4 py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-sky-700 dark:hover:bg-[#38bdf8]/90 hover:scale-[1.02] hover:shadow-lg hover:shadow-sky-500/20 transition-all"
              >
                Acessar Projeto/Software <ExternalLink size={18} />
              </a>
            )}

          </div>


          {/* COLUNA DA DIREITA - 75% (CONTEÚDO TÉCNICO & GALERIA) */}
          <div className="lg:col-span-3 space-y-16">
            
            {/* Bloco 1: Desafio Técnico & Descrição Completa */}
            {(project.descricao_detalhada || project.desafios) && (
              <div className="space-y-8">
                {project.descricao_detalhada && (
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-6">Sobre o Projeto</h2>
                    <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed text-base">
                      {project.descricao_detalhada.split('\n').map((para, i) => (
                        <p key={i} className="mb-4">{para}</p>
                      ))}
                    </div>
                  </div>
                )}
                
                {project.desafios && (
                  <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-8 border-l-4 border-slate-300 dark:border-slate-700">
                    <span className="block text-[#A07146] font-black text-sm tracking-widest uppercase mb-2">01. O Desafio Humano & Técnico</span>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-6">O Contexto Antes da JHE</h2>
                    <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-200 leading-relaxed text-base md:text-lg font-sans">
                      {project.desafios.split('\n').map((para, i) => (
                        <p key={i} className="mb-4">{para}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bloco 2: Destaque Solução de Engenharia (Callout Box) */}
            {project.metodologias && (
              <div className="bg-gradient-to-r from-[#0c1c48] to-[#194775] border-l-4 border-[#38bdf8] p-8 rounded-2xl shadow-xl relative overflow-hidden transition-colors">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-5 text-white">
                  <Activity size={120} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-[#38bdf8]/20 p-3 rounded-xl text-[#38bdf8]">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <span className="block text-[#38bdf8] font-black text-sm tracking-widest uppercase mb-1">02. A Solução JHE</span>
                      <h3 className="text-2xl font-bold text-white">Engenharia & Inovação</h3>
                    </div>
                  </div>
                  <div className="text-slate-200 leading-relaxed text-base md:text-lg font-sans max-w-none">
                    {project.metodologias.split('\n').map((para, i) => (
                      <p key={i} className="mb-4">{para}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bloco 2.5: KPIs de Impacto (Big Numbers) */}
            {project.kpis_impacto && (
              <div className="bg-white dark:bg-[#081330] border border-slate-200 dark:border-white/5 rounded-3xl p-8 shadow-xl">
                <h3 className="text-sm font-bold text-[#A07146] uppercase tracking-[0.2em] mb-8 border-b border-slate-200 dark:border-white/10 pb-4">
                  03. O Legado e os Resultados
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {project.kpis_impacto.split('\n').filter(k => k.trim()).map((kpi, idx) => (
                    <div key={idx} className="bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800/50 rounded-2xl p-6 text-center shadow-sm">
                      <p className="text-lg md:text-xl font-black text-[#194775] dark:text-[#38bdf8] leading-tight">
                        {kpi}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bloco 3: Galeria de Fotos / Registros de Campo */}
            {project.galeria && project.galeria.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-[#A07146] uppercase tracking-[0.2em] mb-8 border-b border-slate-200 dark:border-white/10 pb-4">
                  Registros de Campo & Dados
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.galeria.map((img) => (
                    <div 
                      key={img.id} 
                      className="relative aspect-video rounded-2xl overflow-hidden group cursor-pointer border border-slate-200 dark:border-white/5"
                      onClick={() => setLightboxImage(`http://localhost:5000${img.imagem_url}`)}
                    >
                      <img 
                        src={`http://localhost:5000${img.imagem_url}`} 
                        alt="Registro" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all bg-white/10 backdrop-blur-md p-3 rounded-full text-white">
                          <ExternalLink size={24} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4" onClick={() => setLightboxImage(null)}>
          <button className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all">
            <X size={24} />
          </button>
          <img src={lightboxImage} alt="Fullscreen" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" />
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
