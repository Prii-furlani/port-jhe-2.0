import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, X } from 'lucide-react';
import ProjectCard from '../components/ProjectCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedService, setSelectedService] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [sortOrder, setSortOrder] = useState('recentes'); // recentes, a-z

  // Paginação simples
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projRes, servRes] = await Promise.all([
          fetch('http://localhost:5000/api/projects'),
          fetch('http://localhost:5000/api/services')
        ]);
        
        const projData = await projRes.json();
        const servData = await servRes.json();

        if (projData.success) setProjects(projData.data);
        if (servData.success) setServices(servData.data);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Debounce da busca
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedService('Todos');
    setStatusFilter('Todos');
    setVisibleCount(6);
  };

  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    // Busca textual
    if (debouncedSearch) {
      const lowerSearch = debouncedSearch.toLowerCase();
      filtered = filtered.filter(p => 
        (p.title && p.title.toLowerCase().includes(lowerSearch)) ||
        (p.client_name && p.client_name.toLowerCase().includes(lowerSearch)) ||
        (p.description && p.description.toLowerCase().includes(lowerSearch))
      );
    }

    // Filtro de Serviço
    if (selectedService !== 'Todos') {
      // Como servico_id no BD é ID, e nós pegamos o nome, 
      // precisamos encontrar o ID do serviço selecionado
      const serviceObj = services.find(s => s.nome === selectedService);
      if (serviceObj) {
        filtered = filtered.filter(p => p.servico_id === serviceObj.id);
      }
    }

    // Filtro de Status
    if (statusFilter !== 'Todos') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Ordenação
    if (sortOrder === 'a-z') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // Mais recentes (consideramos ID maior ou data de início maior)
      filtered.sort((a, b) => b.id - a.id);
    }

    return filtered;
  }, [projects, services, debouncedSearch, selectedService, statusFilter, sortOrder]);

  const visibleProjects = filteredProjects.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020920] flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 px-4 max-w-7xl mx-auto w-full">
        {/* Cabeçalho */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">Catálogo de Projetos</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">
            Explore nossa trajetória de sucesso e descubra as soluções que desenvolvemos para os nossos clientes em diversas áreas de atuação.
          </p>
        </div>

        {/* Barra de Busca e Filtros */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por título, cliente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl text-sm focus:ring-2 focus:ring-[#194775] dark:focus:ring-[#38bdf8] outline-none text-slate-700 dark:text-white transition-all"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto flex-wrap">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-[#194775] dark:focus:ring-[#38bdf8] outline-none cursor-pointer"
            >
              <option value="Todos">Status: Todos</option>
              <option value="Em Andamento">Em Andamento</option>
              <option value="Concluído">Concluído</option>
              <option value="Planejamento">Planejamento</option>
            </select>

            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-[#194775] dark:focus:ring-[#38bdf8] outline-none cursor-pointer"
            >
              <option value="recentes">Mais Recentes</option>
              <option value="a-z">Ordem Alfabética (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Tags de Serviços (Pills) */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button 
            onClick={() => setSelectedService('Todos')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors duration-200 ${
              selectedService === 'Todos' 
              ? 'bg-[#194775] text-white dark:bg-[#38bdf8] dark:text-slate-950' 
              : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            Todos
          </button>
          {services.map(s => (
            <button 
              key={s.id}
              onClick={() => setSelectedService(s.nome)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors duration-200 ${
                selectedService === s.nome 
                ? 'bg-[#194775] text-white dark:bg-[#38bdf8] dark:text-slate-950' 
                : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {s.nome}
            </button>
          ))}
        </div>

        {/* Grade de Projetos ou Estado Vazio */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-full h-[400px] bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-white/10">
            <Filter size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-700 dark:text-white mb-2">Nenhum projeto encontrado</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Não encontramos resultados para os filtros selecionados.</p>
            <button 
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X size={18} />
              Limpar Filtros
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleProjects.map(proj => (
                <ProjectCard key={proj.id} project={proj} />
              ))}
            </div>

            {/* Paginação */}
            {visibleCount < filteredProjects.length && (
              <div className="flex justify-center mt-12">
                <button 
                  onClick={() => setVisibleCount(prev => prev + 6)}
                  className="px-8 py-3 rounded-xl font-bold text-[#194775] dark:text-[#38bdf8] border-2 border-[#194775] dark:border-[#38bdf8] hover:bg-[#194775] hover:text-white dark:hover:bg-[#38bdf8] dark:hover:text-slate-950 transition-colors duration-300"
                >
                  Carregar Mais
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProjectsList;
