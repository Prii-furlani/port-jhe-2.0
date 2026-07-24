import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Save, Upload, Link, Phone, Globe } from 'lucide-react';
import { showAlertSuccess, showAlertError } from '../utils/alerts';

const MenuFooterManager = () => {
  const { token } = useAuth();
  
  // State para os campos de texto
  const [footerLinkedin, setFooterLinkedin] = useState('');
  const [footerWebsite, setFooterWebsite] = useState('');
  const [footerPhone, setFooterPhone] = useState('');

  // State para os arquivos de logo
  const [logoLightFile, setLogoLightFile] = useState(null);
  const [logoLightPreview, setLogoLightPreview] = useState(null);

  const [logoDarkFile, setLogoDarkFile] = useState(null);
  const [logoDarkPreview, setLogoDarkPreview] = useState(null);

  const [logoFooterFile, setLogoFooterFile] = useState(null);
  const [logoFooterPreview, setLogoFooterPreview] = useState(null);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/settings/home');
        const data = await res.json();
        if (data.success && data.data) {
          if (data.data.footer_linkedin) setFooterLinkedin(data.data.footer_linkedin);
          if (data.data.footer_website) setFooterWebsite(data.data.footer_website);
          if (data.data.footer_phone) setFooterPhone(data.data.footer_phone);
          
          if (data.data.logo_light) setLogoLightPreview(`http://localhost:5000${data.data.logo_light}`);
          if (data.data.logo_dark) setLogoDarkPreview(`http://localhost:5000${data.data.logo_dark}`);
          if (data.data.logo_footer) setLogoFooterPreview(`http://localhost:5000${data.data.logo_footer}`);
        }
      } catch (err) {
        console.error('Erro ao carregar configurações de Menu e Rodapé:', err);
      }
    };
    loadSettings();
  }, []);

  const handleFileChange = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('footer_linkedin', footerLinkedin);
      formData.append('footer_website', footerWebsite);
      formData.append('footer_phone', footerPhone);
      
      if (logoLightFile) formData.append('logo_light', logoLightFile);
      if (logoDarkFile) formData.append('logo_dark', logoDarkFile);
      if (logoFooterFile) formData.append('logo_footer', logoFooterFile);

      const res = await fetch('http://localhost:5000/api/settings/home', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        showAlertSuccess('Sucesso!', 'Menu e Rodapé atualizados com sucesso!');
        // Refresh previews is not strictly necessary as we are already showing local previews,
        // but resetting the file objects clears the "unsaved" state
        setLogoLightFile(null);
        setLogoDarkFile(null);
        setLogoFooterFile(null);
      } else {
        showAlertError('Oops...', 'Erro ao salvar: ' + data.error);
      }
    } catch (err) {
      showAlertError('Erro Crítico', 'Falha na comunicação com o servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  const ImageUploader = ({ label, preview, setFile, setPreview, bgColor = 'rgba(0,0,0,0.02)' }) => (
    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{label}</label>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', border: '2px dashed var(--border-color)', borderRadius: '12px', cursor: 'pointer', background: 'rgba(0,0,0,0.02)' }}>
            <Upload size={32} style={{ marginBottom: '1rem', color: 'var(--text-muted)' }} />
            <span style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Upload (PNG recomendado transparente)</span>
            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setFile, setPreview)} style={{ display: 'none' }} />
          </label>
        </div>
        <div style={{ flex: 1, height: '150px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bgColor }}>
          {preview ? (
            <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: '1rem' }} />
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>Nenhuma imagem</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Logomarcas (Menu e Rodapé)</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
        <ImageUploader 
          label="Logo do Menu (Tema Claro)" 
          preview={logoLightPreview} 
          setFile={setLogoLightFile} 
          setPreview={setLogoLightPreview} 
          bgColor="#ffffff" // simulate light theme
        />
        
        <ImageUploader 
          label="Logo do Menu (Tema Escuro)" 
          preview={logoDarkPreview} 
          setFile={setLogoDarkFile} 
          setPreview={setLogoDarkPreview} 
          bgColor="#1a1a1a" // simulate dark theme
        />

        <ImageUploader 
          label="Logo do Rodapé" 
          preview={logoFooterPreview} 
          setFile={setLogoFooterFile} 
          setPreview={setLogoFooterPreview} 
        />
      </div>

      <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginTop: '2rem', marginBottom: '1rem' }}>Informações de Contato</h3>
      
      <div className="form-group">
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>LinkedIn (URL)</label>
        <div style={{ display: 'flex', alignItems: 'center', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0 0.75rem' }}>
          <Link size={18} style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }} />
          <input 
            type="url" 
            placeholder="https://linkedin.com/company/jhe-engenharia"
            value={footerLinkedin} 
            onChange={(e) => setFooterLinkedin(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 0', border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-color)' }}
          />
        </div>
      </div>

      <div className="form-group">
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Site (URL)</label>
        <div style={{ display: 'flex', alignItems: 'center', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0 0.75rem' }}>
          <Globe size={18} style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }} />
          <input 
            type="url" 
            placeholder="https://www.jhe.com.br"
            value={footerWebsite} 
            onChange={(e) => setFooterWebsite(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 0', border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-color)' }}
          />
        </div>
      </div>

      <div className="form-group">
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Telefone / Contato</label>
        <div style={{ display: 'flex', alignItems: 'center', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0 0.75rem' }}>
          <Phone size={18} style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }} />
          <input 
            type="text" 
            placeholder="(11) 9999-9999"
            value={footerPhone} 
            onChange={(e) => setFooterPhone(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 0', border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-color)' }}
          />
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
  );
};

export default MenuFooterManager;
