import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Search, Filter, Loader2, PlusCircle, LayoutGrid, List, Copy, Plus, Check, AlertCircle, RefreshCw } from 'lucide-react';
import ToolCard from '../components/tools/ToolCard';
import ToolListRow from '../components/tools/ToolListRow';
import FeaturedKits from '../components/kits/FeaturedKits';
import { Link } from 'react-router-dom';
import { useKit } from '../context/KitContext';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import ToolFormModal from '../components/tools/ToolFormModal';
import CategoryManagerModal from '../components/tools/CategoryManagerModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useTools } from '../hooks/useTools';
import { useCategories } from '../hooks/useCategories';
import { useToolCount } from '../hooks/useToolCount';
import { useQueryClient } from '@tanstack/react-query';
import UI_LABELS from '../constants/uiLabels';
import notify from '../utils/notifications';

export default function Home() {
  const { count, selectedTools, toggleTool } = useKit();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('toolfinder_view_mode') || 'list';
  });
  
  // Local UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  
  // Admin CRUD state
  const [showToolModal, setShowToolModal] = useState(false);
  const [showCatManager, setShowCatManager] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingToolId, setDeletingToolId] = useState(null);

  // Persist view mode changes to localStorage
  useEffect(() => {
    localStorage.setItem('toolfinder_view_mode', viewMode);
  }, [viewMode]);

  // Dismiss keyboard on touchmove (user drag)
  useEffect(() => {
    const handleTouchMove = () => {
      if (document.activeElement.tagName === 'INPUT') {
        document.activeElement.blur();
      }
    };


    window.addEventListener('touchmove', handleTouchMove);

    return () => {

      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // React Query hooks
  const { 
    data, 
    isLoading, 
    isError, 
    error, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useTools({
    search: searchTerm,
    category: selectedCategory,
  });

  const { data: categoriesData = [], isLoading: loadingCats } = useCategories();

  // Get total count from database
  const { data: totalCount = 0, isLoading: loadingCount } = useToolCount({
    search: searchTerm,
    category: selectedCategory,
  });

  // Flatten pages into a single array of tools
  const allTools = data?.pages.flat() || [];

  // CRUD Functions
  const handleSaveTool = async (toolData) => {
    try {
      if (editingTool) {
        const { error } = await supabase
          .from('tools')
          .update(toolData)
          .eq('id', editingTool.id);

        if (error) throw error;
        notify.toolUpdated();
      } else {
        const { data, error } = await supabase
          .from('tools')
          .insert([toolData])
          .select()
          .single();

        if (error) throw error;
        notify.toolCreated();
        
        if (toolData.category && !categoriesData.includes(toolData.category)) {
          queryClient.invalidateQueries({ queryKey: ['categories'] });
        }
      }

      queryClient.invalidateQueries({ queryKey: ['tools'] });
      setShowToolModal(false);
      setEditingTool(null);
    } catch (error) {
      console.error('Error saving tool:', error);
      if (error.code === '23505') {
        notify.duplicatePN();
      } else {
        notify.error(error.message);
      }
      throw error;
    }
  };

  const handleEditTool = (tool) => {
    setEditingTool(tool);
    setShowToolModal(true);
  };

  const handleDeleteTool = (toolId) => {
    setDeletingToolId(toolId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const { error } = await supabase
        .from('tools')
        .delete()
        .eq('id', deletingToolId);

      if (error) throw error;

      notify.toolDeleted();
      setShowDeleteConfirm(false);
      
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch (error) {
      notify.error(error.message);
    }
  };



  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* SECCIÓN SUPERIOR */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm pt-6 pb-6 px-4 shadow-md transition-all">
        <div className="max-w-6xl mx-auto space-y-6">
          
          <div className="max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-2xl font-bold">{UI_LABELS.HOME_TITLE}</h2>
              
              {user && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCatManager(true)}
                    className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-lg text-sm font-bold transition-all border border-slate-600"
                  >
                    <Filter size={16} />
                    {UI_LABELS.ACTION_MANAGE_CATEGORIES}
                  </button>
                  <button
                    onClick={() => {
                      setEditingTool(null);
                      setShowToolModal(true);
                    }}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg"
                  >
                    <PlusCircle size={18} />
                    {UI_LABELS.ACTION_NEW_TOOL}
                  </button>
                </div>
              )}
            </div>

            <div className="relative group">
              <input
                type="text"
                placeholder={UI_LABELS.HOME_SEARCH_PLACEHOLDER}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-400 transition-colors" size={24} />
              {isLoading && (
                <Loader2 className="absolute right-4 top-4 text-blue-400 animate-spin" size={24} />
              )}
            </div>
          </div>

          {/* Filtros de Categoría */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => setSelectedCategory("Todas")}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedCategory === "Todas" 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {UI_LABELS.CATEGORY_ALL}
            </button>
            
            {loadingCats ? (
              <span className="text-slate-400 text-sm px-4 py-1.5">{UI_LABELS.CATEGORY_LOADING}</span>
            ) : (
              categoriesData.map(cat => (
                <button
                  key={cat.category}
                  onClick={() => setSelectedCategory(cat.category)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat.category 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  {cat.category}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RESULTADOS */}
      <div className="max-w-6xl mx-auto px-4">
        {!searchTerm && selectedCategory === "Todas" && (
          <div className="mt-4 pb-4 border-b border-slate-100 mb-6">
            <FeaturedKits />
          </div>
        )}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-red-200 shadow-lg">
            <div className="bg-red-100 p-4 rounded-full mb-4">
              <AlertCircle className="text-red-600" size={48} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Error de Conexión</h3>
            <p className="text-slate-600 text-center max-w-md mb-1">
              No pudimos cargar las herramientas. Verifica tu conexión a internet.
            </p>
            <p className="text-sm text-slate-500 mb-6">
              {error?.message || 'Ocurrió un error inesperado'}
            </p>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg active:scale-95"
            >
              <RefreshCw size={18} />
              Reintentar
            </button>
          </div>
        ) : (
          <>
            {/* Results counter + View toggle */}
            <div className="flex justify-between items-center mb-6 px-1">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg">
                  {loadingCount ? (
                    <span className="text-blue-600 text-sm">Contando...</span>
                  ) : (
                    <span className="text-blue-900 font-bold text-sm sm:text-base">
                      Mostrando {allTools.length} de {totalCount.toLocaleString()} {totalCount === 1 ? 'herramienta' : 'herramientas'}
                    </span>
                  )}
                </div>
                {(searchTerm || selectedCategory !== "Todas") && (
                  <button
                    onClick={() => {setSearchTerm(""); setSelectedCategory("Todas");}}
                    className="text-slate-500 hover:text-slate-700 text-sm font-medium underline"
                  >
                    {UI_LABELS.RESULTS_CLEAR_FILTERS}
                  </button>
                )}
              </div>

              {/* View Toggle Buttons */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                  title="Vista de Grilla"
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-all ${
                    viewMode === 'list' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                  title="Vista de Lista"
                >
                  <List size={18} />
                </button>
              </div>
            </div>

            {/* Conditional rendering based on view mode */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {allTools.map(tool => (
                  <ToolCard 
                    key={tool.id} 
                    tool={tool}
                    isAdmin={!!user}
                    onEdit={handleEditTool}
                    onDelete={handleDeleteTool}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {allTools.map(tool => (
                  <ToolListRow
                    key={tool.id}
                    tool={tool}
                    isAdmin={!!user}
                    onEdit={handleEditTool}
                    onDelete={handleDeleteTool}
                  />
                ))}
              </div>
            )}

            {/* Load More Button */}
            {hasNextPage && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-lg font-bold text-base transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center gap-3"
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Cargando...
                    </>
                  ) : (
                    UI_LABELS.ACTION_LOAD_MORE
                  )}
                </button>
              </div>
            )}

            {allTools.length === 0 && (
              <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
                <Filter className="mx-auto text-slate-300 mb-2" size={48} />
                <p className="text-slate-500">{UI_LABELS.RESULTS_NO_TOOLS}</p>
                <button 
                  onClick={() => {setSearchTerm(""); setSelectedCategory("Todas");}}
                  className="mt-2 text-blue-600 font-medium hover:underline"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* BARRA FLOTANTE DE CREACIÓN DE KIT */}
      {count > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-40 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="max-w-xl mx-auto bg-slate-900 text-white rounded-2xl shadow-2xl p-4 flex items-center justify-between border border-slate-700">
            <div className="flex items-center gap-3">
              <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                {count}
              </span>
              <div className="flex flex-col">
                <span className="font-bold text-sm">Herramientas seleccionadas</span>
                <span className="text-xs text-slate-400">Listas para compartir</span>
              </div>
            </div>
            
            <Link 
              to="/create" 
              className="bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
              Crear Lista <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* Modals */}
      <ToolFormModal
        isOpen={showToolModal}
        onClose={() => {
          setShowToolModal(false);
          setEditingTool(null);
        }}
        tool={editingTool}
        onSave={handleSaveTool}
        existingCategories={categoriesData.map(c => c.category)}
      />

      <CategoryManagerModal
        isOpen={showCatManager}
        onClose={() => setShowCatManager(false)}
        categories={["Todas", ...categoriesData.map(c => c.category)]}
        onRefresh={() => {
          queryClient.invalidateQueries({ queryKey: ['tools'] });
          queryClient.invalidateQueries({ queryKey: ['categories'] });
        }}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="¿Eliminar herramienta?"
        message="Esta acción es permanente y no se puede deshacer. La herramienta será eliminada del catálogo."
      />
    </div>
  );
}
