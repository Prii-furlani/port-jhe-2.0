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
      
      {/* Hero Section - Full Bleed fora do container */}
      <section 
        id="sobre" 
        className="hero-section" 
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
      <main className="home-container" style={{ paddingBottom: '4rem' }}>
        
        {/* Pilares Institucionais */}
        <section id="pilares" style={{ padding: '4rem 0' }}>
          <PillarsGrid />
        </section>

        {/* Linha do Tempo (Timeline) */}
        <section id="historia" style={{ padding: '4rem 0', backgroundColor: 'var(--bg-deep)' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-color)' }}>Nossa Trajetória</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem', fontSize: '1.1rem' }}>Conheça os principais marcos da nossa história desde 1995.</p>
          </div>
          <TimelineSection />
        </section>

        <section id="portfolio" className="portfolio-section" style={{ paddingTop: '4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
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
