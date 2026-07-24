import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Search, Clock, FileText } from 'lucide-react';
import Swal from 'sweetalert2';
import ProjectFormModal from './ProjectFormModal';
import { useAuth } from '../context/AuthContext';

const ProjectManager = () => {
  const { token, user } = useAuth();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Filtros de abas
  const [activeTab, setActiveTab] = useState('all'); 
  // admin: 'all', 'pending'
  // user: 'my_active', 'my_pending', 'my_drafts', 'all_active'

  // Settings state (Admin Master only)
  const [requireApproval, setRequireApproval] = useState(true);

  useEffect(() => {
    fetchProjects();
    if (user?.role === 'admin_master') {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/settings/home');
      const data = await res.json();
      if (data.success && data.data) {
        setRequireApproval(data.data.require_project_approval === '1');
      }
    } catch (e) { }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProjects(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: "Esta ação não pode ser desfeita!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir!'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success) {
          Swal.fire('Excluído!', 'O projeto foi removido.', 'success');
          fetchProjects();
        } else {
          Swal.fire('Erro', data.message || 'Falha ao excluir', 'error');
        }
      } catch (e) {
        Swal.fire('Erro', 'Falha na conexão', 'error');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      
      if (data.success) {
        Swal.fire('Sucesso!', 'Status atualizado com sucesso.', 'success');
        fetchProjects();
      } else {
        Swal.fire('Erro', data.message || 'Falha ao atualizar', 'error');
      }
    } catch (e) {
      Swal.fire('Erro', 'Falha na conexão', 'error');
    }
  };

  const toggleApprovalSetting = async () => {
    const newValue = !requireApproval;
    try {
      const res = await fetch(`http://localhost:5000/api/settings/home`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ require_project_approval: newValue ? '1' : '0' })
      });
      const data = await res.json();
      if (data.success) {
        setRequireApproval(newValue);
        Swal.fire('Sucesso', 'Configuração atualizada.', 'success');
      }
    } catch(e) {
      Swal.fire('Erro', 'Falha ao atualizar config.', 'error');
    }
  };

  const openNewModal = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const openEditModal = (proj) => {
    setEditingProject(proj);
    setIsModalOpen(true);
  };

  const getFilteredProjects = () => {
    let filtered = projects;

    // Busca por texto
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.titulo.toLowerCase().includes(term) || 
        (p.cliente_nome && p.cliente_nome.toLowerCase().includes(term))
      );
    }

    // Filtros de Aba
    if (user?.role === 'admin_master') {
      if (activeTab === 'pending') {
        filtered = filtered.filter(p => p.status === 'pending');
      }
    } else {
      if (activeTab === 'my_active') {
        filtered = filtered.filter(p => p.created_by === user.id && (p.status === 'active' || p.status === 'concluido'));
      } else if (activeTab === 'my_pending') {
        filtered = filtered.filter(p => p.created_by === user.id && p.status === 'pending');
      } else if (activeTab === 'my_drafts') {
        filtered = filtered.filter(p => p.created_by === user.id && p.status === 'draft');
      } else if (activeTab === 'all_active') {
        filtered = filtered.filter(p => p.status === 'active' || p.status === 'concluido');
      }
    }

    return filtered;
  };

  const filteredData = getFilteredProjects();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
      case 'concluido':
        return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> Ativo</span>;
      case 'pending':
        return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock size={12}/> Pendente</span>;
      case 'draft':
        return <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><FileText size={12}/> Rascunho</span>;
      case 'rejected':
        return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><XCircle size={12}/> Rejeitado</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Projetos & Softwares</h2>
          <p className="text-slate-500 text-sm mt-1">Gerencie o portfólio de projetos da empresa.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          {user?.role === 'admin_master' && (
            <div className="flex items-center gap-2 mr-4 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Exigir Aprovação:</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={requireApproval} onChange={toggleApprovalSetting} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-[#194775]"></div>
              </label>
            </div>
          )}

          <button onClick={openNewModal} className="bg-[#194775] text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2">
            <Plus size={18} /> Novo Projeto
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        {/* Abas */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2">
          {user?.role === 'admin_master' ? (
            <>
              <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'all' ? 'bg-[#194775] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}>Todos os Projetos</button>
              <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'pending' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}>
                Fila de Aprovação 
                {projects.filter(p => p.status === 'pending').length > 0 && (
                  <span className="bg-white text-amber-600 px-1.5 py-0.5 rounded-md text-xs">{projects.filter(p => p.status === 'pending').length}</span>
                )}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setActiveTab('my_active')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'my_active' ? 'bg-[#194775] text-white' : 'bg-slate-100 text-slate-600'}`}>Meus Publicados</button>
              <button onClick={() => setActiveTab('my_pending')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'my_pending' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700'}`}>
                Em Aprovação
              </button>
              <button onClick={() => setActiveTab('my_drafts')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'my_drafts' ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-600'}`}>Rascunhos</button>
              <button onClick={() => setActiveTab('all_active')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'all_active' ? 'bg-[#38bdf8] text-slate-900' : 'bg-slate-100 text-slate-600'}`}>Ver Todos Ativos</button>
            </>
          )}
        </div>

        {/* Busca */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar projeto..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#194775] outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">Carregando projetos...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 text-sm">
                <th className="pb-3 font-semibold w-12">Capa</th>
                <th className="pb-3 font-semibold">Título</th>
                <th className="pb-3 font-semibold">Cliente</th>
                <th className="pb-3 font-semibold">Autor</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map(proj => (
                  <tr key={proj.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="py-4">
                      {proj.imagem_url ? (
                        <img src={`http://localhost:5000${proj.imagem_url}`} alt="Capa" className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                          <FileText size={16} />
                        </div>
                      )}
                    </td>
                    <td className="py-4 font-semibold text-slate-800 dark:text-white">
                      {proj.titulo}
                      {proj.ano_desenvolvimento && <span className="ml-2 text-xs text-slate-400 font-normal">({proj.ano_desenvolvimento})</span>}
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-300 text-sm">{proj.cliente_nome || '-'}</td>
                    <td className="py-4 text-slate-600 dark:text-slate-300 text-sm">{proj.autor_nome || '-'}</td>
                    <td className="py-4">
                      {getStatusBadge(proj.status)}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2 transition-opacity">
                        
                        {/* Ações de Aprovação do Admin */}
                        {user?.role === 'admin_master' && proj.status === 'pending' && (
                          <>
                            <button onClick={() => handleStatusChange(proj.id, 'active')} className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg" title="Aprovar">
                              <CheckCircle size={16} />
                            </button>
                            <button onClick={() => handleStatusChange(proj.id, 'rejected')} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg" title="Rejeitar">
                              <XCircle size={16} />
                            </button>
                          </>
                        )}

                        {/* Ações de Edição/Exclusão (se for dono ou admin_master) */}
                        {(user?.role === 'admin_master' || proj.created_by === user?.id) && (
                          <>
                            <button onClick={() => openEditModal(proj)} className="p-2 text-[#194775] dark:text-[#38bdf8] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(proj.id)} className="p-2 text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}

                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    Nenhum projeto encontrado nesta visualização.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <ProjectFormModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={fetchProjects}
          editingProject={editingProject}
        />
      )}
    </div>
  );
};

export default ProjectManager;
