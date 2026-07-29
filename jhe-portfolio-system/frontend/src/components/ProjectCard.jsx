import React from 'react';
import { MapPin, ArrowRight, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

  if (!project) return null;

  return (
    <div 
      onClick={() => navigate(`/projetos/${project.id}`)}
      className="group relative h-[420px] w-full perspective-1000 cursor-pointer"
    >
      <div className="relative w-full h-full transition-transform duration-700 preserve-3d group-hover:my-rotate-y-180 rounded-3xl shadow-[0_2px_18px_0_rgba(0,0,0,0.1),0_2px_26px_0_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] bg-secondary-light dark:bg-secondary-dark">
      
      {/* Camada FRONT (Frente) */}
      <div className="absolute inset-0 w-full h-full p-6 flex flex-col justify-between transition-opacity duration-500 group-hover:opacity-0 z-10 bg-secondary-light dark:bg-secondary-dark rounded-3xl overflow-hidden backface-hidden">
        
        {/* Header do Card (Imagem Redonda no Topo e Badge) */}
        <div>
          {project.imagem_url ? (
            <div className="w-full h-40 rounded-2xl overflow-hidden mb-4 shadow-sm">
              <img src={`http://localhost:5000${project.imagem_url}`} alt={project.titulo} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            </div>
          ) : (
            <div className="w-full h-40 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4 flex items-center justify-center">
              <span className="text-slate-400 font-semibold">Sem Capa</span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {project.servico_nome && (
              <span className="self-start px-3 py-1 bg-secondary-brand/10 text-secondary-brand dark:bg-accent-primary/10 dark:text-accent-primary text-xs font-black rounded-full uppercase tracking-widest">
                {project.servico_nome}
              </span>
            )}
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white leading-tight line-clamp-2">
              {project.titulo}
            </h3>
            
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
              <span className="flex items-center gap-1.5">
                <MapPin size={16} className="text-accent-secondary" />
                {project.cliente_nome || project.setor || 'Brasil'}
              </span>
              {project.ano_desenvolvimento && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-secondary-brand dark:text-accent-primary" />
                    {project.ano_desenvolvimento}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer do Card (Badges de Tecnologia na base) */}
        <div className="flex flex-wrap gap-1.5 mt-auto pt-4">
          {project.tecnologias?.slice(0, 3).map((tech) => (
            <span key={tech.id} className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 px-2.5 py-1 rounded-full text-[10px] font-bold border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
              {tech.icone_url && (
                <img src={tech.icone_url.startsWith('http') ? tech.icone_url : `http://localhost:5000${tech.icone_url}`} alt={tech.nome} className="w-3.5 h-3.5 object-contain" />
              )}
              {tech.nome}
            </span>
          ))}
          {project.tecnologias?.length > 3 && (
            <span className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 px-2.5 py-1 rounded-full text-[10px] font-bold border border-slate-200 dark:border-slate-700 shadow-sm flex items-center">
              +{project.tecnologias.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Camada BACK (Verso/Hover) */}
      <div className="absolute inset-0 w-full h-full bg-secondary-brand/95 dark:bg-secondary-dark/95 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 z-20 flex flex-col p-8 justify-between text-white shadow-inner my-rotate-y-180 backface-hidden rounded-3xl">
        
        <div className="mt-4">
          <span className="text-accent-primary text-xs font-black uppercase tracking-widest mb-3 inline-block">Visão Geral do Projeto</span>
          <p className="text-base font-medium text-slate-100 leading-relaxed line-clamp-6">
            {project.resumo_curto || project.descricao_detalhada || 'Um projeto de alto impacto envolvendo planejamento avançado e execução meticulosa para garantir os melhores resultados operacionais e ambientais.'}
          </p>
        </div>

        <button className="w-full bg-accent-primary text-slate-900 font-extrabold py-3.5 rounded-xl hover:bg-white transition-colors duration-300 flex items-center justify-center gap-2 group/btn mt-auto">
          VER DETALHES TÉCNICOS 
          <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>

      </div>
      </div>
    </div>
  );
};

export default ProjectCard;
