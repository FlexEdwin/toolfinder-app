import { useEffect, useState, useMemo } from 'react';
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

export default function Home() {
  const { count } = useKit();
  const { user } = useAuth();
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("null");
  
  // Admin CRUD state
  const [showToolModal, setShowToolModal] = useState(false);
  const [showCatManager, setShowCatManager] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingToolId, setDeletingToolId] = useState(null);

  // 1. Cargar datos al iniciar
  useEffect(() => {
    fetchTools();
  }, []);

  async function fetchTools() {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .order('name')
      .range(0, 2800);
    
    if (!error) setTools(data);
    setLoading(false);
  }

  // 2. Extraer categorías únicas dinámicamente
  const categories = useMemo(() => {
    const cats = new Set(tools.map(t => t.category).filter(Boolean));
    return ["Todas", ...Array.from(cats)];
  }, [tools]);

  // 3. Filtrar en tiempo real (Buscador + Categoría)
  const filteredTools = tools.filter(tool => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      tool.name?.toLowerCase().includes(searchLower) || 
      tool.part_number?.toLowerCase().includes(searchLower) ||
      tool.keywords?.toLowerCase().includes(searchLower);
    
    const matchesCategory = selectedCategory === "Todas" || tool.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

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

        // Update local state
        setTools(prev => prev.map(t => 
          t.id === editingTool.id ? { ...t, ...toolData } : t
        ));
        toast.success("✅ Herramienta actualizada");
      } else {
        // CREATE
        const { data, error } = await supabase
          .from('tools')
          .insert([toolData])
          .select()
          .single();

        if (error) throw error;

        // Add to local state
        setTools(prev => [...prev, data]);
        toast.success("✅ Herramienta creada con éxito");
      }

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

      // Remove from local state
      setTools(prev => prev.filter(t => t.id !== deletingToolId));
      toast.success("✅ Herramienta eliminada");
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
            </div>
          </div>

          {/* Filtros de Categoría (Pill Shapes) */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- RESULTADOS (GRILLA) --- */}
      <div className="max-w-6xl mx-auto px-4 -mt-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6 px-1">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg">
                  <span className="text-blue-900 font-bold text-lg">{filteredTools.length}</span>
                  <span className="text-blue-600 text-sm ml-2">
                    {filteredTools.length === 1 ? 'herramienta encontrada' : 'herramientas encontradas'}
                  </span>
                </div>
                {(searchTerm || selectedCategory !== "Todas") && (
                  <button
                    onClick={() => {setSearchTerm(""); setSelectedCategory("Todas")}}
                    className="text-slate-500 hover:text-slate-700 text-sm font-medium underline"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map(tool => (
                <ToolCard 
                  key={tool.id} 
                  tool={tool}
                  isAdmin={!!user}
                  onEdit={handleEditTool}
                  onDelete={handleDeleteTool}
                />
              ))}
            </div>

            {filteredTools.length === 0 && (
              <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
                <Filter className="mx-auto text-slate-300 mb-2" size={48} />
                <p className="text-slate-500">No encontramos herramientas con ese criterio.</p>
                <button 
                  onClick={() => {setSearchTerm(""); setSelectedCategory("Todas")}}
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
        existingCategories={categories.filter(c => c !== "Todas")}
      />

      <CategoryManagerModal
        isOpen={showCatManager}
        onClose={() => setShowCatManager(false)}
        categories={categories}
        onRefresh={fetchTools}
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