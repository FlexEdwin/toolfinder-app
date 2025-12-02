import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Search, Filter, Loader2, PlusCircle } from 'lucide-react';
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
  const { count } = useKit();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Local UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  
  // Admin CRUD state
  const [showToolModal, setShowToolModal] = useState(false);
  const [showCatManager, setShowCatManager] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingToolId, setDeletingToolId] = useState(null);

  // React Query hooks
  const { data: tools = [], isLoading, isError, error } = useTools({
    search: searchTerm,
    category: selectedCategory,
    page: 1,
  });

  const { data: categoriesData = [], isLoading: loadingCats } = useCategories();

  // CRUD Functions
  const handleSaveTool = async (toolData) => {
    try {
      if (editingTool) {
        // UPDATE
        const { error } = await supabase
          .from('tools')
          .update(toolData)
          .eq('id', editingTool.id);

        if (error) throw error;

        toast.success("✅ Herramienta actualizada");
      } else {
        // CREATE
        const { data, error } = await supabase
          .from('tools')
          .insert([toolData])
          .select()
          .single();

        if (error) throw error;

        toast.success("✅ Herramienta creada con éxito");
        
        // Invalidate categories if new category was added
        if (toolData.category && !categoriesData.includes(toolData.category)) {
          queryClient.invalidateQueries({ queryKey: ['categories'] });
        }
      }

      // Invalidate tools query to refetch
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
      throw error; // Re-throw to keep modal open
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
      
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch (error) {
      toast.error("⚠️ Error al eliminar: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* --- SECCIÓN SUPERIOR OSCURA (Estilo Dashboard) --- */}
      <div className="bg-slate-900 pt-6 pb-12 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Título + Buscador */}
          <div className="max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-2xl font-bold">Catálogo Maestro</h2>
              
              {/* Botones Admin */}
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

          {/* Filtros de Categoría (Pill Shapes) */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {/* Botón "Todas" fijo */}
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
            
            {/* Categorías dinámicas */}
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

      {/* --- RESULTADOS (GRILLA) --- */}
      <div className="max-w-6xl mx-auto px-4 -mt-6">
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
            <div className="flex justify-between items-center mb-6 px-1">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg">
                  {!searchTerm && selectedCategory === "Todas" ? (
                    <span className="text-blue-900 font-bold text-sm sm:text-base">
                      Explorando Catálogo Maestro (+2,700 herramientas)
                    </span>
                  ) : tools.length === 20 ? (
                    <span className="text-blue-900 font-bold text-sm sm:text-base">
                      Mostrando las primeras 20 coincidencias...
                    </span>
                  ) : (
                    <>
                      <span className="text-blue-900 font-bold text-lg">{tools.length}</span>
                      <span className="text-blue-600 text-sm ml-2">
                        {tools.length === 1 ? 'herramienta encontrada' : 'herramientas encontradas'}
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map(tool => (
                <ToolCard 
                  key={tool.id} 
                  tool={tool}
                  isAdmin={!!user}
                  onEdit={handleEditTool}
                  onDelete={handleDeleteTool}
                />
              ))}
            </div>

            {tools.length === 0 && (
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

      {/* --- BARRA FLOTANTE DE CREACIÓN DE KIT --- */}
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