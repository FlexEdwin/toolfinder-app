import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Search, Filter, Loader2, PlusCircle, LayoutGrid, List, Copy, FolderPlus, Check } from 'lucide-react';
import ToolCard from '../components/tools/ToolCard';
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
import { useQueryClient } from '@tanstack/react-query';

export default function Home() {
  const { count, selectedTools, toggleTool } = useKit();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('toolfinder_view_mode') || 'grid';
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

  // Dismiss keyboard on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (document.activeElement.tagName === 'INPUT') {
        document.activeElement.blur();
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('touchmove', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchmove', handleScroll);
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
        toast.success("✅ Herramienta actualizada");
      } else {
        const { data, error } = await supabase
          .from('tools')
          .insert([toolData])
          .select()
          .single();

        if (error) throw error;
        toast.success("✅ Herramienta creada con éxito");
        
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
        toast.error("⚠️ Ya existe una herramienta con ese Part Number");
      } else {
        toast.error("⚠️ Error al guardar: " + error.message);
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

      toast.success("✅ Herramienta eliminada");
      setShowDeleteConfirm(false);
      
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch (error) {
      toast.error("⚠️ Error al eliminar: " + error.message);
    }
  };

  // List view row component
  const ToolListRow = ({ tool, isAdmin, onEdit, onDelete }) => {
    const [copied, setCopied] = useState(false);
    const isSelected = selectedTools.some(t => t.id === tool.id);

    const copyToClipboard = () => {
      navigator.clipboard.writeText(tool.part_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    const getIcon = (category) => {
      const cat = category?.toLowerCase() || '';
      if (cat.includes('eléctrico') || cat.includes('electric')) return '⚡';
      if (cat.includes('seguridad')) return '🛡️';
      if (cat.includes('medición')) return '📏';
      return '🔧';
    };

    return (
      <div className={`flex items-center gap-3 p-3 bg-white rounded-lg border transition-all hover:shadow-md ${
        isSelected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'
      }`}>
        {/* Icon + Name */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-2xl flex-shrink-0">{getIcon(tool.category)}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-800 truncate text-sm">{tool.name}</h3>
            <span className="text-xs text-slate-500">{tool.category}</span>
          </div>
        </div>

        {/* Part Number */}
        <code className="font-mono text-blue-700 font-bold text-sm flex-shrink-0 hidden sm:block">
          {tool.part_number}
        </code>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {isAdmin && (
            <>
              <button
                onClick={() => onEdit(tool)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Editar"
              >
                <PlusCircle size={14} />
              </button>
              <button
                onClick={() => onDelete(tool.id)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Eliminar"
              >
                <Filter size={14} />
              </button>
            </>
          )}
          
          <button
            onClick={copyToClipboard}
            className={`p-1.5 rounded transition-colors ${
              copied ? 'bg-green-50 text-green-600' : 'hover:bg-slate-100 text-slate-600'
            }`}
            title="Copiar P/N"
          >
            <Copy size={14} />
          </button>

          <button
            onClick={() => toggleTool(tool)}
            className={`p-1.5 rounded transition-colors ${
              isSelected 
                ? 'bg-blue-600 text-white' 
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
            title={isSelected ? "Quitar" : "Agregar"}
          >
            {isSelected ? <Check size={16} /> : <FolderPlus size={16} />}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* SECCIÓN SUPERIOR */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm pt-6 pb-6 px-4 shadow-md transition-all">
        <div className="max-w-6xl mx-auto space-y-6">
          
          <div className="max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-2xl font-bold">Catálogo Maestro</h2>
              
              {user && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCatManager(true)}
                    className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-lg text-sm font-bold transition-all border border-slate-600"
                  >
                    <Filter size={16} />
                    Gestionar Categorías
                  </button>
                  <button
                    onClick={() => {
                      setEditingTool(null);
                      setShowToolModal(true);
                    }}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg"
                  >
                    <PlusCircle size={18} />
                    Nueva Herramienta
                  </button>
                </div>
              )}
            </div>

            <div className="relative group">
              <input
                type="text"
                placeholder="Buscar herramienta, P/N, o descripción..."
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
              Todas
            </button>
            
            {loadingCats ? (
              <span className="text-slate-400 text-sm px-4 py-1.5">Cargando filtros...</span>
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
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-red-200">
            <Filter className="text-red-500 mb-4" size={48} />
            <h3 className="text-lg font-bold text-red-700 mb-2">Error al cargar herramientas</h3>
            <p className="text-red-600 text-sm">{error?.message || 'Ocurrió un error inesperado'}</p>
          </div>
        ) : (
          <>
            {/* Results counter + View toggle */}
            <div className="flex justify-between items-center mb-6 px-1">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg">
                  {!searchTerm && selectedCategory === "Todas" && allTools.length === 20 ? (
                    <span className="text-blue-900 font-bold text-sm sm:text-base">
                      Explorando Catálogo Maestro (+2,700 herramientas)
                    </span>
                  ) : (
                    <>
                      <span className="text-blue-900 font-bold text-lg">{allTools.length}</span>
                      <span className="text-blue-600 text-sm ml-2">
                        {allTools.length === 1 ? 'herramienta encontrada' : 'herramientas encontradas'}
                      </span>
                    </>
                  )}
                </div>
                {(searchTerm || selectedCategory !== "Todas") && (
                  <button
                    onClick={() => {setSearchTerm(""); setSelectedCategory("Todas");}}
                    className="text-slate-500 hover:text-slate-700 text-sm font-medium underline"
                  >
                    Limpiar filtros
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
                    'Cargar más herramientas...'
                  )}
                </button>
              </div>
            )}

            {allTools.length === 0 && (
              <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
                <Filter className="mx-auto text-slate-300 mb-2" size={48} />
                <p className="text-slate-500">No encontramos herramientas con ese criterio.</p>
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