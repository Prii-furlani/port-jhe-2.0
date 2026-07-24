import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const TimelineSection = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/timeline');
        const data = await res.json();
        if (data.success) {
          setEvents(data.data);
        }
      } catch (err) {
        console.error('Erro ao buscar timeline:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 400; // Avança aproximadamente 1 card por vez
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-500">Carregando nossa história...</div>;
  }

  if (events.length === 0) return null;

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 py-8">
      
      {/* Controles de Navegação (Desktop) */}
      <div className="hidden md:flex justify-end gap-3 mb-6 pr-4">
        <button 
          onClick={() => scroll('left')}
          className="p-3 rounded-full bg-slate-100 hover:bg-[#194775]/10 text-slate-600 hover:text-[#194775] dark:bg-slate-800 dark:hover:bg-[#38bdf8]/10 dark:text-slate-400 dark:hover:text-[#38bdf8] transition-colors shadow-sm"
          aria-label="Rolar para a esquerda"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={() => scroll('right')}
          className="p-3 rounded-full bg-slate-100 hover:bg-[#194775]/10 text-slate-600 hover:text-[#194775] dark:bg-slate-800 dark:hover:bg-[#38bdf8]/10 dark:text-slate-400 dark:hover:text-[#38bdf8] transition-colors shadow-sm"
          aria-label="Rolar para a direita"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Container Principal do Carousel com Scroll Nativo */}
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-6 pb-12 pt-4 px-4 snap-x snap-mandatory hide-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Adicionando um estilo CSS embutido temporário para esconder o scrollbar no webkit */}
        <style dangerouslySetInnerHTML={{__html: `
          .hide-scrollbar::-webkit-scrollbar { display: none; }
        `}} />

        {/* Linha Contínua de Fundo (Conector Horizontal) */}
        <div className="absolute top-[88px] left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 -z-10" />

        {events.map((evt) => (
          <div 
            key={evt.id} 
            className="snap-start snap-always shrink-0 w-[300px] md:w-[350px] flex flex-col relative group"
          >
            {/* O Marco (Ponto na Linha) */}
            <div className="flex items-center mb-8 relative">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-[#020920] border-4 border-[#194775] dark:border-[#38bdf8] flex items-center justify-center z-10 shadow-md group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(56,189,248,0.5)] transition-all duration-300">
                <div className="w-2.5 h-2.5 rounded-full bg-[#A07146] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Card de Conteúdo */}
            <div className="bg-white dark:bg-[#020920] border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-sm group-hover:shadow-xl group-hover:-translate-y-2 transition-all duration-300 flex-1 relative overflow-hidden">
              
              {/* Barra sutil de destaque no topo do card no hover */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#A07146] to-[#d4a373] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <span className="inline-block bg-[#194775]/10 dark:bg-[#38bdf8]/10 text-[#194775] dark:text-[#38bdf8] font-black text-sm px-4 py-1.5 rounded-full mb-4">
                {evt.year}
              </span>
              
              <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight group-hover:text-[#A07146] transition-colors">
                {evt.title}
              </h3>
              
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed m-0">
                {evt.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineSection;
