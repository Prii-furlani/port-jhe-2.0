import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Image, Clock, Grid, Users, Briefcase, Cpu, Save, Upload } from 'lucide-react';
import Card from '../../components/Card';
import { showAlertSuccess, showAlertError } from '../../utils/alerts';
import TechnologyManager from '../../components/TechnologyManager';
import ServiceManager from '../../components/ServiceManager';
import ClientManager from '../../components/ClientManager';
import PillarManager from '../../components/PillarManager';
import TimelineManager from '../../components/TimelineManager';
import MenuFooterManager from '../../components/MenuFooterManager';
import { LayoutTemplate } from 'lucide-react';

const HomeSettings = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('banner');
  
  // State para os campos da Aba 1 (Banner)
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroImageFile, setHeroImageFile] = useState(null);
  const [heroImagePreview, setHeroImagePreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Carregar dados iniciais da API
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/settings/home');
        const data = await res.json();
        if (data.success && data.data) {
          if (data.data.hero_title) setHeroTitle(data.data.hero_title);
          if (data.data.hero_subtitle) setHeroSubtitle(data.data.hero_subtitle);
          if (data.data.hero_image) setHeroImagePreview(`http://localhost:5000${data.data.hero_image}`);
        }
      } catch (err) {
        console.error('Erro ao carregar configurações:', err);
      }
    };
    loadSettings();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHeroImageFile(file);
      setHeroImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('hero_title', heroTitle);
      formData.append('hero_subtitle', heroSubtitle);
      if (heroImageFile) {
        formData.append('hero_image', heroImageFile);
      }

      const res = await fetch('http://localhost:5000/api/settings/home', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        showAlertSuccess('Sucesso!', 'Banner atualizado com sucesso!');
        if (data.image_url) {
          setHeroImagePreview(`http://localhost:5000${data.image_url}`);
          setHeroImageFile(null);
        }
      } else {
        showAlertError('Oops...', 'Erro ao salvar: ' + data.error);
      }
    } catch (err) {
      showAlertError('Erro Crítico', 'Falha na comunicação com o servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  // RBAC Forte: Bloqueia não-master admins
  if (user?.role !== 'admin_master') {
    return (
      <div className="forbidden-container">
        <ShieldAlert size={64} className="forbidden-icon" />
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>403 Forbidden</h1>
        <p>Acesso Negado. Esta área é restrita ao Administrador Master.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'banner', label: 'Banner Principal (Hero)', icon: Image },
    { id: 'menu_footer', label: 'Menu e Rodapé', icon: LayoutTemplate },
    { id: 'timeline', label: 'Linha do Tempo', icon: Clock },
    { id: 'pilares', label: 'Pilares (Bento Grid)', icon: Grid },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'servicos', label: 'Serviços', icon: Briefcase },
    { id: 'tecnologias', label: 'Tecnologias', icon: Cpu },
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-color)' }}>
          Configurações da Tela Inicial
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Gerencie o conteúdo exibido na página pública principal.
        </p>
      </div>

      {/* Tabs / Pills */}
      <div className="tabs-container">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-pill ${activeTab === tab.id ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <Card title={tabs.find(t => t.id === activeTab)?.label}>
        <div style={{ minHeight: '300px', padding: '1rem 0' }}>
          
          {activeTab === 'banner' && (
            <form onSubmit={handleSaveBanner} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Título do Banner</label>
                <input 
                  type="text" 
                  value={heroTitle} 
                  onChange={(e) => setHeroTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)' }}
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Subtítulo</label>
                <textarea 
                  value={heroSubtitle} 
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  rows="3"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)' }}
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Imagem de Capa (Background)</label>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', border: '2px dashed var(--border-color)', borderRadius: '12px', cursor: 'pointer', background: 'rgba(0,0,0,0.02)' }}>
                      <Upload size={32} style={{ marginBottom: '1rem', color: 'var(--text-muted)' }} />
                      <span style={{ color: 'var(--text-muted)' }}>Clique para fazer upload (JPEG/PNG)</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                    </label>
                  </div>
                  <div style={{ flex: 1, height: '200px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep, #000)' }}>
                    {heroImagePreview ? (
                      <img src={heroImagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Nenhuma imagem selecionada</span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1 }}
                >
                  <Save size={18} />
                  {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'menu_footer' && (
            <MenuFooterManager />
          )}

          {activeTab === 'timeline' && (
            <TimelineManager />
          )}
          {activeTab === 'pilares' && (
            <PillarManager />
          )}
          {activeTab === 'clientes' && (
            <ClientManager />
          )}
          {activeTab === 'servicos' && (
            <ServiceManager />
          )}
          {activeTab === 'tecnologias' && (
            <TechnologyManager />
          )}
        </div>
      </Card>
    </div>
  );
};

export default HomeSettings;
