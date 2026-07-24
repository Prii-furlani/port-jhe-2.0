import React, { useState, useEffect } from 'react';
import { 
  Droplet, 
  Users, 
  Lightbulb, 
  Globe, 
  Target, 
  ShieldCheck, 
  Cpu, 
  Building2 
} from 'lucide-react';

// Mapeamento dinâmico de ícones para garantir fallback limpo
const ICON_MAP = {
  Droplet: Droplet,
  Users: Users,
  Lightbulb: Lightbulb,
  Globe: Globe,
  Target: Target,
  ShieldCheck: ShieldCheck,
  Cpu: Cpu,
  Building2: Building2
};

const PillarsGrid = () => {
  const [pillars, setPillars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPillars = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/pillars');
        const data = await res.json();
        if (data.success) {
          setPillars(data.data);
        }
      } catch (err) {
        console.error('Erro ao buscar pilares:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPillars();
  }, []);

  if (loading) {
    return <div className="py-20 text-center">Carregando pilares...</div>;
  }

  if (pillars.length === 0) return null;

  return (
    <section className="mt-0 pt-6 md:pt-8 pb-20 px-4 w-full bg-slate-50/50 dark:bg-[#020817] transition-colors">
      <div className="max-w-6xl mx-auto">
        
        {/* CABEÇALHO INSTITUCIONAL */}
        <div className="flex flex-col items-start mb-14 max-w-2xl">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#A07146] bg-[#A07146]/10 px-3.5 py-1.5 rounded-full mb-3 inline-block">
            Fundamentos Institucionais
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
            Nossos Pilares de Atuação
          </h2>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mb-12">
            Conheça as diretrizes técnicas, sociais e ambientais que sustentam a excelência da JHE Engenharia.
          </p>
        </div>

        {/* GRID DE CARDS PREMIUM (2 COLUNAS EQUILIBRADAS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto items-stretch">
          {pillars.map((pillar) => {
            const IconComponent = ICON_MAP[pillar.icone] || Target;

            return (
              <div
                key={pillar.id}
                className="group relative bg-white dark:bg-[#020920] border border-slate-200/90 dark:border-white/10 rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
              >
                {/* Detalhe estético: linha de destaque superior no hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#194775] to-[#38bdf8] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div>
                  {/* ÍCONE COM CONTAINER DE MARCA */}
                  <div className="w-12 h-12 rounded-2xl bg-[#194775]/10 dark:bg-[#38bdf8]/10 text-[#194775] dark:text-[#38bdf8] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent size={22} />
                  </div>

                  {/* KICKER DO PILAR */}
                  {pillar.kicker && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#A07146] mb-1.5 block">
                      {pillar.kicker}
                    </span>
                  )}

                  {/* TÍTULO DO PILAR */}
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight group-hover:text-[#194775] dark:group-hover:text-[#38bdf8] transition-colors">
                    {pillar.titulo}
                  </h3>

                  {/* DESCRIÇÃO */}
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {pillar.descricao}
                  </p>
                </div>

                {/* RODAPÉ DO CARD */}
                {pillar.footer_text && (
                  <div className="mt-8 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <Globe className="text-[#A07146]" size={14} />
                    <span>{pillar.footer_text}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default PillarsGrid;
