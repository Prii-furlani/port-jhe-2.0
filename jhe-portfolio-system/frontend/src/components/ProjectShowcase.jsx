import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProjectCard from './ProjectCard';

const ProjectShowcase = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef(null);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/projects');
        const data = await res.json();
        if (data.success) {
          setProjects(data.data);
        }
      } catch (err) {
        console.error('Erro ao buscar projetos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-full h-[400px] bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        Nenhum projeto em destaque no momento.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 relative group/showcase">
      {/* Setas de navegação (aparecem no hover em desktop) */}
      <button 
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg text-slate-700 dark:text-slate-200 hover:text-[#194775] dark:hover:text-[#38bdf8] z-10 opacity-0 group-hover/showcase:opacity-100 transition-opacity duration-300 hidden md:flex"
      >
        <ChevronLeft size={24} />
      </button>

      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg text-slate-700 dark:text-slate-200 hover:text-[#194775] dark:hover:text-[#38bdf8] z-10 opacity-0 group-hover/showcase:opacity-100 transition-opacity duration-300 hidden md:flex"
      >
        <ChevronRight size={24} />
      </button>

      {/* Container do Carrossel */}
      <div 
        ref={carouselRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 pt-4 px-2"
        style={{ scrollBehavior: 'smooth' }}
      >
        {projects.map((proj) => (
          <div key={proj.id} className="min-w-[85vw] md:min-w-[350px] lg:min-w-[380px] snap-center shrink-0">
            <ProjectCard project={proj} />
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <Link 
          to="/projects"
          className="bg-[#194775] hover:bg-[#12365a] dark:bg-[#38bdf8] dark:hover:bg-[#0284c7] text-white dark:text-slate-950 font-bold py-3 px-8 rounded-xl transition-colors duration-300 shadow-md"
        >
          Ver Todos os Projetos
        </Link>
      </div>
    </div>
  );
};

export default ProjectShowcase;
