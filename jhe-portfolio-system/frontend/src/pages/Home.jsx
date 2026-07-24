import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProjectShowcase from '../components/ProjectShowcase';
import PillarsGrid from '../components/PillarsGrid';
import TimelineSection from '../components/TimelineSection';

const Home = () => {
  const [heroData, setHeroData] = useState({
    title: 'Bem-vindo ao Portfólio Empresarial JHE',
    subtitle: 'Soluções Corporativas com Excelência.',
    image: null
  });

  useEffect(() => {
    const fetchHomeSettings = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/settings/home');
        const data = await res.json();
        if (data.success && data.data) {
          setHeroData({
            title: data.data.hero_title || heroData.title,
            subtitle: data.data.hero_subtitle || heroData.subtitle,
            image: data.data.hero_image ? `http://localhost:5000${data.data.hero_image}` : null
          });
        }
      } catch (err) {
        console.error('Erro ao buscar configurações da Home:', err);
      }
    };
    fetchHomeSettings();
  }, []);

  return (
    <>
      <Navbar />
      
      {/* Hero Section - Proporcional e sem margem inferior */}
      <section 
        id="sobre" 
        className="hero-section min-h-[50vh] py-12 md:py-16 pb-0 mb-0 flex items-center justify-center" 
        style={heroData.image ? {
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.85)), url(${heroData.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        } : {}}
      >
        <div className="hero-content-wrapper">
          <h1 className="hero-title">{heroData.title}</h1>
          <p className="hero-subtitle">{heroData.subtitle}</p>
        </div>
      </section>

      {/* Conteúdo Abaixo do Hero */}
      <main className="home-container space-y-0 gap-0 pb-16 bg-dominant-light dark:bg-dominant-dark">
        
        {/* Pilares Institucionais */}
        <section id="pilares" className="mt-0 pt-0">
          <PillarsGrid />
        </section>

        {/* Linha do Tempo (Timeline) */}
        <section id="historia" className="py-16 bg-dominant-light dark:bg-dominant-dark">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Nossa Trajetória</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3 text-lg">Conheça os principais marcos da nossa história desde 1995.</p>
          </div>
          <TimelineSection />
        </section>

        <section id="portfolio" className="portfolio-section pt-16 pb-16 bg-secondary-light dark:bg-secondary-dark">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">Softwares e Projetos Desenvolvidos</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Conheça nosso portfólio de soluções tecnológicas.</p>
          </div>
          
          <ProjectShowcase />
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Home;
