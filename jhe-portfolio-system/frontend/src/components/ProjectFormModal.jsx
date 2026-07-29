import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Plus, XCircle, Save, Send, Clock, Trash2, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

const ProjectFormModal = ({ isOpen, onClose, onSubmit, editingProject }) => {
  const { token, user } = useAuth();
  
  const [formData, setFormData] = useState({
    titulo: '',
    cliente_id: '',
    servico_id: '',
    setor: '',
    ano_desenvolvimento: new Date().getFullYear(),
    localizacao: '',
    link_oficial: '',
    resumo_curto: '',
    descricao_detalhada: '',
    desafios: '',
    metodologias: '',
    kpis_impacto: '',
    stakeholders: []
  });
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  
  const [galleryImages, setGalleryImages] = useState([]);
  const [existingGallery, setExistingGallery] = useState([]);
  const [removedGallery, setRemovedGallery] = useState([]);
  
  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [tecnologias, setTecnologias] = useState([]);
  
  const [selectedTechs, setSelectedTechs] = useState([]);
  const [techSearch, setTechSearch] = useState('');
  const [isTechDropdownOpen, setIsTechDropdownOpen] = useState(false);

  const [stakeholderInput, setStakeholderInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const techDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (techDropdownRef.current && !techDropdownRef.current.contains(event.target)) {
        setIsTechDropdownOpen(false);
      }
    };

    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setIsTechDropdownOpen(false);
      }
    };

    if (isTechDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isTechDropdownOpen]);

  // Updates State (Histórico)
  const [updates, setUpdates] = useState([]);
  const [isLoadingUpdates, setIsLoadingUpdates] = useState(false);
  const [isUpdatesExpanded, setIsUpdatesExpanded] = useState(false);
  const [isAddingUpdate, setIsAddingUpdate] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    month_year: '',
    title: '',
    description: '',
    is_public: false
  });
  const [updateGallery, setUpdateGallery] = useState([]);
  const [removedUpdates, setRemovedUpdates] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchClientes();
      fetchServicos();
      fetchTecnologias();
      if (editingProject) {
        setFormData({
          titulo: editingProject.titulo || '',
          cliente_id: editingProject.cliente_id || '',
          servico_id: editingProject.servico_id || '',
          setor: editingProject.setor || '',
          ano_desenvolvimento: editingProject.ano_desenvolvimento || new Date().getFullYear(),
          localizacao: editingProject.localizacao || '',
          link_oficial: editingProject.link_oficial || '',
          resumo_curto: editingProject.resumo_curto || '',
          descricao_detalhada: editingProject.descricao_detalhada || '',
          desafios: editingProject.desafios || '',
          metodologias: editingProject.metodologias || '',
          kpis_impacto: editingProject.kpis_impacto || '',
          stakeholders: editingProject.stakeholders || [],
          status_solicitado: editingProject.status || 'draft'
        });
        setSelectedTechs(editingProject.tecnologias || []);
        if (editingProject.imagem_url) {
          setCoverPreview(`http://localhost:5000${editingProject.imagem_url}`);
        } else {
          setCoverPreview('');
        }
        setExistingGallery(editingProject.galeria || []);
        setRemovedGallery([]);
        setUpdates(editingProject.updates || []);
        setRemovedUpdates([]);
      } else {
        resetForm();
      }
    }
  }, [isOpen, editingProject]);

  const fetchClientes = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/clients', { headers: { Authorization: `Bearer ${token}` }});
      const data = await res.json();
      if (data.success) setClientes(data.data);
    } catch (e) {}
  };

  const fetchServicos = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/services', { headers: { Authorization: `Bearer ${token}` }});
      const data = await res.json();
      if (data.success) setServicos(data.data);
    } catch (e) {}
  };

  const fetchTecnologias = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/technologies', { headers: { Authorization: `Bearer ${token}` }});
      const data = await res.json();
      if (data.success) setTecnologias(data.data);
    } catch (e) {}
  };

  const resetForm = () => {
    setFormData({
      titulo: '', cliente_id: '', servico_id: '', setor: '', ano_desenvolvimento: new Date().getFullYear(), localizacao: '',
      link_oficial: '', resumo_curto: '', descricao_detalhada: '', desafios: '', metodologias: '', kpis_impacto: '', stakeholders: [], status_solicitado: 'draft'
    });
    setCoverImage(null);
    setCoverPreview('');
    setGalleryImages([]);
    setExistingGallery([]);
    setRemovedGallery([]);
    setSelectedTechs([]);
    setTechSearch('');
    setUpdates([]);
    setRemovedUpdates([]);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setGalleryImages([...galleryImages, ...files]);
  };

  const removeGalleryFile = (index) => {
    const newFiles = [...galleryImages];
    newFiles.splice(index, 1);
    setGalleryImages(newFiles);
  };

  const removeExistingGalleryImage = (img) => {
    setExistingGallery(existingGallery.filter(g => g.id !== img.id));
    setRemovedGallery([...removedGallery, img.id]);
  };

  const handleCreateTech = async () => {
    if (!techSearch.trim()) return;
    try {
      const res = await fetch('http://localhost:5000/api/technologies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ nome: techSearch.trim(), icone_url: '' })
      });
      const data = await res.json();
      if (data.success) {
        const newTech = { id: data.data.id, nome: techSearch.trim() };
        setTecnologias([...tecnologias, newTech]);
        setSelectedTechs([...selectedTechs, newTech]);
        setTechSearch('');
        setIsTechDropdownOpen(false);
      }
    } catch (e) {
      Swal.fire('Erro', 'Falha ao criar tecnologia', 'error');
    }
  };

  const toggleTech = (tech) => {
    if (selectedTechs.find(t => t.id === tech.id)) {
      setSelectedTechs(selectedTechs.filter(t => t.id !== tech.id));
    } else {
      setSelectedTechs([...selectedTechs, tech]);
    }
    setTechSearch('');
  };

  const handleAddStakeholder = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = stakeholderInput.trim();
      if (val && !formData.stakeholders.includes(val)) {
        setFormData({ ...formData, stakeholders: [...formData.stakeholders, val] });
      }
      setStakeholderInput('');
    }
  };

  const removeStakeholder = (index) => {
    const newStakeholders = [...formData.stakeholders];
    newStakeholders.splice(index, 1);
    setFormData({ ...formData, stakeholders: newStakeholders });
  };

  // Funções de Updates (Histórico)
  const fetchUpdates = async () => {
    // Não precisa mais fazer fetch isolado, vem com o projeto
  };

  useEffect(() => {
    if (isOpen && editingProject && isUpdatesExpanded) {
      // open logic
    }
  }, [isOpen, editingProject, isUpdatesExpanded]);

  const handleAddUpdate = async (e) => {
    e.preventDefault();
    if (!updateFormData.month_year || !updateFormData.title || !updateFormData.description) {
      return Swal.fire('Erro', 'Preencha todos os campos obrigatórios da atualização', 'warning');
    }

    const newUpdate = {
      tempId: Date.now(),
      month_year: updateFormData.month_year,
      title: updateFormData.title,
      description: updateFormData.description,
      is_public: updateFormData.is_public || false,
      galleryFiles: updateGallery
    };

    setUpdates([newUpdate, ...updates]);
    setIsAddingUpdate(false);
    setUpdateFormData({ month_year: '', title: '', description: '', is_public: false });
    setUpdateGallery([]);
  };

  const handleDeleteUpdate = async (update) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: "Esta atualização será removida do histórico.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      if (update.id) {
        setRemovedUpdates([...removedUpdates, update.id]);
      }
      setUpdates(updates.filter(u => u !== update));
    }
  };

  const handleSubmitForm = async () => {
    if (!formData.titulo) {
      return Swal.fire('Erro', 'Preencha o título do projeto.', 'warning');
    }
    
    setIsSaving(true);
    
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'stakeholders') {
        formDataToSend.append(key, JSON.stringify(formData[key]));
      } else {
        formDataToSend.append(key, formData[key] || '');
      }
    });
    formDataToSend.append('tecnologias', JSON.stringify(selectedTechs.map(t => t.id)));
    if (coverImage) {
      formDataToSend.append('cover_image', coverImage);
    }
    
    galleryImages.forEach(file => {
      formDataToSend.append('gallery', file);
    });
    
    if (removedGallery.length > 0) {
      formDataToSend.append('removed_gallery', JSON.stringify(removedGallery));
    }

    const updatesClean = updates.map(u => ({
        id: u.id,
        title: u.title,
        month_year: u.month_year,
        description: u.description,
        is_public: u.is_public
    }));
    formDataToSend.append('updates', JSON.stringify(updatesClean));
    
    updates.forEach((u, i) => {
        if (u.galleryFiles) {
            u.galleryFiles.forEach(file => {
                formDataToSend.append(`update_gallery_${i}`, file);
            });
        }
    });

    if (removedUpdates.length > 0) {
        formDataToSend.append('removed_updates', JSON.stringify(removedUpdates));
    }

    const url = editingProject 
      ? `http://localhost:5000/api/projects/${editingProject.id}`
      : 'http://localhost:5000/api/projects';
    const method = editingProject ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire('Sucesso!', 'Projeto salvo com sucesso.', 'success');
        onSubmit();
        onClose();
      } else {
        Swal.fire('Erro', (data.message || 'Erro ao salvar projeto.') + (data.error ? `\nDetalhes: ${data.error}` : ''), 'error');
      }
    } catch (e) {
      Swal.fire('Erro', 'Erro de conexão.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const filteredTechs = tecnologias.filter(t => t.nome.toLowerCase().includes(techSearch.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl my-8 relative flex flex-col max-h-[90vh]">
        <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {editingProject ? 'Editar Projeto/Software' : 'Novo Projeto/Software'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Esquerda: Upload de Imagem e Techs */}
            <div className="md:col-span-1 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Imagem de Capa</label>
                <div 
                  className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center cursor-pointer hover:border-sky-500 transition-colors relative overflow-hidden"
                  onClick={() => document.getElementById('projectCover').click()}
                >
                  {coverPreview ? (
                    <img src={coverPreview} alt="Capa" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Upload className="text-slate-400 mb-2" size={32} />
                      <span className="text-xs text-slate-500">Clique para fazer upload</span>
                    </>
                  )}
                  <input type="file" id="projectCover" className="hidden" accept="image/*" onChange={handleImageChange} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Galeria Adicional (Registros de Campo)</label>
                <div 
                  className="w-full rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 p-4 text-center cursor-pointer hover:border-sky-500 transition-colors"
                  onClick={() => document.getElementById('projectGallery').click()}
                >
                  <Plus className="text-slate-400 mx-auto mb-1" size={24} />
                  <span className="text-xs text-slate-500">Adicionar Fotos</span>
                  <input type="file" id="projectGallery" className="hidden" accept="image/*" multiple onChange={handleGalleryChange} />
                </div>
                
                {(existingGallery.length > 0 || galleryImages.length > 0) && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {existingGallery.map(img => (
                      <div key={img.id} className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                        <img src={`http://localhost:5000${img.imagem_url}`} className="w-full h-16 object-cover" alt="Galeria" />
                        <button onClick={() => removeExistingGalleryImage(img)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {galleryImages.map((file, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-sky-300 dark:border-sky-700">
                        <img src={URL.createObjectURL(file)} className="w-full h-16 object-cover" alt="Nova Galeria" />
                        <button onClick={() => removeGalleryFile(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={12} />
                        </button>
                        <span className="absolute bottom-0 inset-x-0 bg-sky-500/80 text-white text-[9px] text-center font-bold">Novo</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Tecnologias Utilizadas</label>
                <div className="relative" ref={techDropdownRef}>
                  <input 
                    type="text" 
                    placeholder="Buscar ou criar tecnologia..."
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-secondary-brand outline-none"
                    value={techSearch}
                    onChange={(e) => {
                      setTechSearch(e.target.value);
                      setIsTechDropdownOpen(true);
                    }}
                    onFocus={() => setIsTechDropdownOpen(true)}
                  />
                  {isTechDropdownOpen && (
                    <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {filteredTechs.map(tech => (
                        <div 
                          key={tech.id} 
                          className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer flex items-center justify-between"
                          onClick={() => toggleTech(tech)}
                        >
                          <div className="flex items-center gap-2">
                            {tech.icone_url && (
                              <img src={tech.icone_url.startsWith('http') ? tech.icone_url : `http://localhost:5000${tech.icone_url}`} alt={tech.nome} className="w-4 h-4 object-contain" />
                            )}
                            <span>{tech.nome}</span>
                          </div>
                          {selectedTechs.find(t => t.id === tech.id) && <span className="text-green-500 text-xs font-bold">✓</span>}
                        </div>
                      ))}
                      {techSearch && filteredTechs.length === 0 && (
                        <div 
                          className="px-4 py-3 bg-sky-50 dark:bg-sky-900/30 text-secondary-brand dark:text-accent-primary cursor-pointer font-semibold flex items-center gap-2"
                          onClick={handleCreateTech}
                        >
                          <Plus size={16} /> Criar tecnologia "{techSearch}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* Tech Pills */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedTechs.map(tech => (
                    <span key={tech.id} className="bg-secondary-brand/10 text-secondary-brand dark:bg-accent-primary/10 dark:text-accent-primary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                      {tech.icone_url && (
                        <img src={tech.icone_url.startsWith('http') ? tech.icone_url : `http://localhost:5000${tech.icone_url}`} alt={tech.nome} className="w-3.5 h-3.5 object-contain" />
                      )}
                      {tech.nome}
                      <button onClick={() => toggleTech(tech)} className="hover:text-red-500"><XCircle size={14}/></button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Direita: Dados Básicos e Textos */}
            <div className="md:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Título do Projeto *</label>
                  <input type="text" className="form-input w-full p-2 border rounded-xl" required
                    value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Cliente (Opcional)</label>
                  <select className="form-input w-full p-2 border rounded-xl" 
                    value={formData.cliente_id || ''} onChange={e => setFormData({...formData, cliente_id: e.target.value})}>
                    <option value="">Nenhum / Uso Interno</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Serviço Vinculado</label>
                  <select className="form-input w-full p-2 border rounded-xl" 
                    value={formData.servico_id} onChange={e => setFormData({...formData, servico_id: e.target.value})}>
                    <option value="">Selecione o Serviço (Opcional)</option>
                    {servicos.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Ano de Desenvolvimento</label>
                  <input type="text" className="form-input w-full p-2 border rounded-xl" placeholder="Ex: 2024 ou 2023-2024"
                    value={formData.ano_desenvolvimento} onChange={e => setFormData({...formData, ano_desenvolvimento: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Localização</label>
                  <input type="text" className="form-input w-full p-2 border rounded-xl" placeholder="Ex: São Paulo, SP"
                    value={formData.localizacao} onChange={e => setFormData({...formData, localizacao: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1">Pessoas Interessadas (Stakeholders)</label>
                  <input type="text" className="form-input w-full p-2 border rounded-xl mb-2" placeholder="Digite um nome e pressione Enter..."
                    value={stakeholderInput} onChange={e => setStakeholderInput(e.target.value)} onKeyDown={handleAddStakeholder} />
                  <div className="flex flex-wrap gap-2">
                    {formData.stakeholders.map((person, index) => (
                      <span key={index} className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        {person}
                        <button onClick={() => removeStakeholder(index)} className="hover:text-red-500"><XCircle size={14}/></button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Resumo Curto (Para Vitrine)</label>
                  <textarea className="form-input w-full p-2 border rounded-xl" rows={2} 
                    value={formData.resumo_curto} onChange={e => setFormData({...formData, resumo_curto: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Descrição Técnica Detalhada</label>
                  <textarea className="form-input w-full p-2 border rounded-xl" rows={3} placeholder="Como a JHE atuou? Quais metodologias, tecnologias e diferenciais tornaram esse projeto um sucesso?"
                    value={formData.descricao_detalhada} onChange={e => setFormData({...formData, descricao_detalhada: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Desafios e Complexidades</label>
                    <textarea className="form-input w-full p-2 border rounded-xl" rows={3} placeholder="Qual era o principal problema enfrentado pela comunidade ou pelo cliente antes da atuação da JHE?"
                      value={formData.desafios} onChange={e => setFormData({...formData, desafios: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Metodologias Utilizadas</label>
                    <textarea className="form-input w-full p-2 border rounded-xl" rows={3} placeholder="Ex: Agile/Scrum, BIM Level 3..."
                      value={formData.metodologias} onChange={e => setFormData({...formData, metodologias: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Resultados e Impacto (KPIs Narrativos)</label>
                  <textarea className="form-input w-full p-2 border rounded-xl" rows={2} placeholder="Quais foram os principais ganhos gerados? (Ex: +50.000 Famílias Atendidas, Redução de 30% nas perdas)"
                    value={formData.kpis_impacto} onChange={e => setFormData({...formData, kpis_impacto: e.target.value})} />
                </div>
              </div>

            </div>
          </div>

          {/* Seção Sanfona: Histórico de Atualizações (Somente ao Editar) */}
          {editingProject && (
            <div className="mt-8 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
              <button 
                type="button"
                className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                onClick={() => setIsUpdatesExpanded(!isUpdatesExpanded)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <Clock size={18} />
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">Histórico de Atualizações do Projeto</h3>
                </div>
                {isUpdatesExpanded ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
              </button>
              
              {isUpdatesExpanded && (
                <div className="p-6 border-t border-slate-200 dark:border-slate-700">
                  {/* Header Action */}
                  {!isAddingUpdate && (
                    <div className="mb-6 flex justify-end">
                      <button 
                        onClick={() => setIsAddingUpdate(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm"
                      >
                        <Plus size={16} /> Adicionar Marco / Atualização
                      </button>
                    </div>
                  )}

                  {/* Formulário de Nova Atualização */}
                  {isAddingUpdate && (
                    <div className="mb-8 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2 text-sm">
                        <Plus size={16} className="text-indigo-500" /> Nova Atualização
                      </h4>
                      <form onSubmit={handleAddUpdate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Data *</label>
                            <input 
                              type="date" 
                              required 
                              className="form-input w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                              value={updateFormData.update_date}
                              onChange={e => setUpdateFormData({...updateFormData, update_date: e.target.value})}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Título *</label>
                            <input 
                              type="text" 
                              required 
                              placeholder="Ex: Módulo de Relatórios Adicionado"
                              className="form-input w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                              value={updateFormData.title}
                              onChange={e => setUpdateFormData({...updateFormData, title: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Data / Mês e Ano *</label>
                            <input 
                              type="text" 
                              required 
                              placeholder="Ex: Julho / 2026"
                              className="form-input w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                              value={updateFormData.month_year}
                              onChange={e => setUpdateFormData({...updateFormData, month_year: e.target.value})}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Descrição das Melhorias *</label>
                          <textarea 
                            required 
                            rows={3}
                            placeholder="Descreva o que foi alterado, melhorado ou corrigido nesta atualização..."
                            className="form-input w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={updateFormData.description}
                            onChange={e => setUpdateFormData({...updateFormData, description: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fotos da Atualização</label>
                          <div 
                            className="w-full rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 p-4 text-center cursor-pointer hover:border-indigo-500 transition-colors"
                            onClick={() => document.getElementById('updateGallery').click()}
                          >
                            <Upload className="text-slate-400 mx-auto mb-1" size={24} />
                            <span className="text-xs text-slate-500">Clique para adicionar novas fotos nesta etapa</span>
                            <input 
                              type="file" 
                              id="updateGallery" 
                              className="hidden" 
                              accept="image/*" 
                              multiple 
                              onChange={(e) => setUpdateGallery([...updateGallery, ...Array.from(e.target.files)])} 
                            />
                          </div>
                          {updateGallery.length > 0 && (
                            <div className="grid grid-cols-4 gap-2 mt-3">
                              {updateGallery.map((file, idx) => (
                                <div key={idx} className="relative group rounded-lg overflow-hidden border border-indigo-300 dark:border-indigo-700">
                                  <img src={URL.createObjectURL(file)} className="w-full h-12 object-cover" alt="Update Galeria" />
                                  <button onClick={(e) => {
                                    e.stopPropagation();
                                    const newGallery = [...updateGallery];
                                    newGallery.splice(idx, 1);
                                    setUpdateGallery(newGallery);
                                  }} className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X size={10} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Visibilidade:</label>
                          <div className="flex items-center cursor-pointer" onClick={() => setUpdateFormData({...updateFormData, is_public: !updateFormData.is_public})}>
                            <div className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${updateFormData.is_public ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                              <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${updateFormData.is_public ? 'translate-x-6' : ''}`}></div>
                            </div>
                            <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">{updateFormData.is_public ? '🟢 Público na Vitrine' : '🔒 Rascunho / Interno'}</span>
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                          <button 
                            type="button" 
                            onClick={() => setIsAddingUpdate(false)}
                            className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            Cancelar
                          </button>
                          <button 
                            type="submit"
                            className="px-4 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm"
                          >
                            Salvar Atualização
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Lista de Atualizações */}
                  <div className="space-y-4">
                    {isLoadingUpdates ? (
                      <div className="text-center py-4 text-slate-500 text-sm">Carregando histórico...</div>
                    ) : updates.length === 0 ? (
                      <div className="text-center py-6 px-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                        <Clock className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={24} />
                        <p className="text-sm text-slate-500 font-medium">Nenhuma atualização registrada ainda.</p>
                      </div>
                    ) : (
                      updates.map((update) => {
                        return (
                          <div key={update.id || update.tempId} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded flex items-center gap-1">
                                  <Calendar size={12} /> {update.month_year}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded font-bold ${update.is_public ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                                  {update.is_public ? '🟢 Público' : '🔒 Rascunho'}
                                </span>
                                <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200 ml-2">{update.title}</h5>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line mt-2">{update.description}</p>
                              {(update.photos && update.photos.length > 0) && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {update.photos.map(img => (
                                    <div key={img.id} className="w-12 h-12 rounded-md overflow-hidden border border-slate-200 dark:border-slate-600">
                                      <img src={`http://localhost:5000${img.imagem_url}`} className="w-full h-full object-cover" alt="Update Galeria" />
                                    </div>
                                  ))}
                                </div>
                              )}
                              {(update.galleryFiles && update.galleryFiles.length > 0) && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {update.galleryFiles.map((file, i) => (
                                    <div key={i} className="w-12 h-12 rounded-md overflow-hidden border border-indigo-200 dark:border-indigo-600 relative">
                                      <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="Novas Fotos" />
                                      <span className="absolute inset-0 bg-indigo-600/20"></span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <button 
                                  onClick={(e) => {
                                      e.preventDefault();
                                      const u = {...update, is_public: !update.is_public};
                                      setUpdates(updates.map(item => item === update ? u : item));
                                  }}
                                  className="text-slate-400 hover:text-indigo-500 transition-colors p-1"
                                  title="Alternar Visibilidade"
                                >
                                  {update.is_public ? 'Tornar Rascunho' : 'Tornar Público'}
                                </button>
                                <button                                  onClick={(e) => { e.preventDefault(); handleDeleteUpdate(update); }}
                              className="text-slate-400 hover:text-red-500 transition-colors p-1"
                              title="Excluir Atualização"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
              )}
            </div>
          )}

        </div>

        <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex flex-wrap justify-between items-center gap-3 rounded-b-2xl">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">Status:</label>
            <select 
              className="form-input p-2 border rounded-xl bg-white dark:bg-slate-800 text-sm"
              value={formData.status_solicitado} 
              onChange={e => setFormData({...formData, status_solicitado: e.target.value})}
            >
              <option value="draft">Rascunho Privado</option>
              <option value="concluido">Público - Concluído</option>
              <option value="em_desenvolvimento">Público - Em Desenvolvimento</option>
              <option value="em_expansao">Público - Em Expansão</option>
            </select>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto justify-end">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancelar
            </button>
            <button 
              onClick={handleSubmitForm}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl font-bold bg-accent-primary text-slate-900 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              {isSaving ? 'Enviando...' : <><Save size={16} /> Salvar Software</>}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProjectFormModal;
