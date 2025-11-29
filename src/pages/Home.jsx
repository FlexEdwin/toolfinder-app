import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Search, Filter, Loader2 } from 'lucide-react';
import ToolCard from '../components/tools/ToolCard';
import { Link } from 'react-router-dom';
import { useKit } from '../context/KitContext';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const { count } = useKit();
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");

  // 1. Cargar datos al iniciar
  useEffect(() => {
    async function fetchTools() {
      // Traemos TODO el catálogo. Si son miles, usaremos paginación luego.
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .order('name');
      
      if (!error) setTools(data);
      setLoading(false);
    }
    fetchTools();
  }, []);

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

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* --- SECCIÓN SUPERIOR OSCURA (Estilo Dashboard) --- */}
      <div className="bg-slate-900 pt-6 pb-12 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Título + Buscador */}
          <div className="max-w-3xl">
            <h2 className="text-white text-2xl font-bold mb-4">Catálogo Maestro</h2>
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
                onClick={() => setSelectedCategory(cat)}
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
            <div className="flex justify-between items-end mb-4 px-1">
              <p className="text-sm text-slate-500 font-medium">
                Mostrando {filteredTools.length} herramientas
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map(tool => (
                <ToolCard key={tool.id} tool={tool} />
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
    </div>
  );
}