import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, Search, ShieldAlert, Plus, Edit2, 
  KeyRound, UserX, UserCheck, ArrowUp, ArrowDown, ArrowUpDown 
} from 'lucide-react';
import UserModalForm from '../../components/Modals/UserModalForm';
import { showAlertSuccess, showAlertError, showConfirmDialog } from '../../utils/alerts';

const UserManager = () => {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  // Sort State
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  useEffect(() => {
    fetchUsers();
  }, [token, user]);

  const fetchUsers = async () => {
    if (user?.role !== 'admin_master') return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') direction = 'desc';
      else if (sortConfig.direction === 'desc') direction = null;
      else direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = React.useMemo(() => {
    let sortableUsers = [...users];

    // Filter by search term
    if (searchTerm) {
      sortableUsers = sortableUsers.filter(u => 
        u.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortConfig.direction !== null && sortConfig.key !== null) {
      sortableUsers.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        
        if (valA == null) valA = '';
        if (valB == null) valB = '';

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableUsers;
  }, [users, sortConfig, searchTerm]);

  const handleSubmitUser = async (formData, id = null) => {
    try {
      const method = id ? 'PUT' : 'POST';
      const url = id ? `http://localhost:5000/api/admin/users/${id}` : `http://localhost:5000/api/admin/users`;
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        setIsModalOpen(false);
        fetchUsers();
        showAlertSuccess('Sucesso', data.message);
      } else {
        showAlertError('Erro', data.error || 'Erro ao processar.');
      }
    } catch (err) {
      console.error(err);
      showAlertError('Erro', 'Erro interno de conexão.');
    }
  };

  const handleToggleStatus = async (userObj) => {
    const isAtivo = userObj.ativo;
    if (isAtivo) {
      const confirm = await showConfirmDialog("Atenção", "Deseja inativar este usuário? Os projetos criados por ele permanecerão no histórico sob gestão do Admin Master.");
      if (!confirm) return;
    } else {
      const confirm = await showConfirmDialog("Atenção", "Deseja ativar este usuário novamente?");
      if (!confirm) return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userObj.id}/status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
        showAlertSuccess('Sucesso', data.message || `Status atualizado com sucesso.`);
      } else {
        showAlertError('Erro', data.error);
      }
    } catch (err) {
      console.error(err);
      showAlertError('Erro', 'Erro ao alterar status.');
    }
  };

  const handleResetPassword = async (userObj) => {
    const confirm = await showConfirmDialog("Resetar Senha", `Tem certeza que deseja resetar a senha de ${userObj.nome} para "123456"?`);
    if (!confirm) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userObj.id}/reset-password`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showAlertSuccess('Sucesso', data.message);
      } else {
        showAlertError('Erro', data.error);
      }
    } catch (err) {
      console.error(err);
      showAlertError('Erro', 'Erro ao resetar senha.');
    }
  };

  const openNewUserModal = () => {
    setUserToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (userObj) => {
    setUserToEdit(userObj);
    setIsModalOpen(true);
  };

  const isCurrentUser = (id) => user?.id === id;

  if (user?.role !== 'admin_master') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <ShieldAlert size={64} className="mb-4 text-red-500" />
        <h1 className="text-3xl font-bold mb-2">403 Forbidden</h1>
        <p>Acesso Negado. Você não possui privilégios de Administrador Master.</p>
      </div>
    );
  }

  const renderHeader = (label, key) => {
    const isSorted = sortConfig.key === key;
    const direction = isSorted ? sortConfig.direction : null;
    const ariaSort = direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none';
    
    return (
      <th 
        className="cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-white/5 transition-colors py-4 px-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 group text-left"
        onClick={() => handleSort(key)}
        aria-sort={ariaSort}
        title={
          direction === null ? "Clique para ordenar de A-Z / Crescente" :
          direction === 'asc' ? "Clique para ordenar de Z-A / Decrescente" :
          "Clique para remover a ordenação"
        }
      >
        <div className="flex items-center gap-1.5">
          <span>{label}</span>
          {direction === null && <ArrowUpDown size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400 transition-colors ml-1" />}
          {direction === 'asc' && <ArrowUp size={14} className="text-[#194775] dark:text-[#38bdf8] font-bold ml-1" />}
          {direction === 'desc' && <ArrowDown size={14} className="text-[#194775] dark:text-[#38bdf8] font-bold ml-1" />}
        </div>
      </th>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2 flex items-center gap-3">
            <Users size={32} className="text-[#194775] dark:text-[#38bdf8]" />
            Gestão de Usuários & Permissões
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Gerencie acessos, atribua papéis e controle o status das contas da equipe JHE.
          </p>
        </div>
        <button 
          onClick={openNewUserModal}
          className="bg-[#194775] hover:bg-[#123659] dark:bg-[#38bdf8] dark:hover:bg-[#0284c7] text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold transition-all shadow-md flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Usuário
        </button>
      </div>

      <div className="bg-white dark:bg-[#020920] border border-slate-200 dark:border-white/10 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-white/5">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            Equipe Cadastrada
          </h2>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou e-mail..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#194775] dark:focus:ring-[#38bdf8] outline-none text-sm w-64 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Carregando usuários...</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                <tr>
                  {renderHeader('Nome Completo', 'nome')}
                  {renderHeader('E-mail', 'email')}
                  {renderHeader('Perfil', 'role')}
                  {renderHeader('Projetos Criados', 'projetos_criados')}
                  {renderHeader('Status', 'ativo')}
                  <th className="py-4 px-4 text-xs font-black uppercase tracking-wider text-slate-500 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {sortedUsers.length > 0 ? (
                  sortedUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                      <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200">
                        {u.nome}
                        {isCurrentUser(u.id) && (
                          <span className="ml-2 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#194775]/10 text-[#194775] dark:bg-[#38bdf8]/20 dark:text-[#38bdf8]">
                            Sua Conta
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          u.role === 'admin_master' 
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' 
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                        }`}>
                          {u.role === 'admin_master' ? 'Admin Master' : 'User'}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-black text-slate-600 dark:text-slate-300">
                        {u.projetos_criados || 0}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          u.ativo 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                          : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400'
                        }`}>
                          {u.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleResetPassword(u)}
                            disabled={isCurrentUser(u.id)}
                            title={isCurrentUser(u.id) ? "Para alterar sua senha, use a opção 'Alterar Senha' no menu lateral." : "Resetar Senha"}
                            className={`p-2 rounded-lg transition-colors ${
                              isCurrentUser(u.id) 
                              ? 'bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500 cursor-not-allowed'
                              : 'bg-orange-100 text-orange-600 hover:bg-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:hover:bg-orange-500/40'
                            }`}
                          >
                            <KeyRound size={16} />
                          </button>
                          
                          <button 
                            onClick={() => openEditModal(u)}
                            title="Editar Usuário"
                            className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/40 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          
                          <button 
                            onClick={() => handleToggleStatus(u)}
                            disabled={isCurrentUser(u.id)}
                            title={isCurrentUser(u.id) ? "Você não pode inativar seu próprio usuário." : u.ativo ? "Inativar Usuário" : "Ativar Usuário"}
                            className={`p-2 rounded-lg transition-colors ${
                              isCurrentUser(u.id)
                              ? 'bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500 cursor-not-allowed'
                              : u.ativo 
                                ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/40' 
                                : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/40'
                            }`}
                          >
                            {u.ativo ? <UserX size={16} /> : <UserCheck size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500">Nenhum usuário encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <UserModalForm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitUser}
        userToEdit={userToEdit}
        isCurrentUser={userToEdit && isCurrentUser(userToEdit.id)}
      />
    </div>
  );
};

export default UserManager;
