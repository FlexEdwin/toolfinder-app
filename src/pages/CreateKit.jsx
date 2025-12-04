import {useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKit } from '../context/KitContext';
import { supabase } from '../lib/supabaseClient';
import { Save, User, Package, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import UI_LABELS from '../constants/uiLabels';
import notify from '../utils/notifications';

export default function CreateKit() {
  const { selectedTools, toggleTool, clearKit } = useKit();
  const navigate = useNavigate();
  
  const [kitName, setKitName] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load author name from localStorage on mount
  useEffect(() => {
    const savedAuthor = localStorage.getItem('lastAuthorName');
    if (savedAuthor) {
      setAuthorName(savedAuthor);
    }
  }, []);

  // Si no hay herramientas, mostrar aviso
  if (selectedTools.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-slate-100 p-6 rounded-full mb-4">
          <Package size={48} className="text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Tu lista está vacía</h2>
        <p className="text-slate-500 mb-6">Selecciona herramientas del buscador antes de crear un kit.</p>
        <button onClick={() => navigate('/')} className="text-blue-600 font-bold hover:underline">
          Volver al Buscador
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!kitName.trim() || !authorName.trim()) {
      notify.formIncomplete();
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Crear el KIT (Cabecera)
      const { data: kitData, error: kitError } = await supabase
        .from('kits')
        .insert([
          { 
            name: kitName, 
            author_name: authorName,
            description: description || null,
          }
        ])
        .select()
        .single();

      if (kitError) throw kitError;

      // 2. Crear los ITEMS (Detalle)
      const itemsToInsert = selectedTools.map(tool => ({
        kit_id: kitData.id,
        tool_id: tool.id
      }));

      const { error: itemsError } = await supabase
        .from('kit_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // 3. Save author name to localStorage
      localStorage.setItem('lastAuthorName', authorName);

      // 4. Éxito: Limpiar y Redirigir
      notify.kitCreated();
      clearKit();
      navigate('/kits');
      
    } catch (error) {
      console.error(error);
      notify.error(error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors">
        <ArrowLeft size={18} /> Volver a buscar
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Publicar Nueva Lista</h1>
          <p className="text-slate-500 mb-6 text-sm">Comparte tu conocimiento con el equipo. Esta lista será visible para todos.</p>

          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            
            {/* Nombre del Kit */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Nombre de la Lista</label>
              <input 
                autoFocus
                type="text" 
                placeholder="Ej: Cambio de Ruedas b787 med"
                className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={kitName}
                onChange={e => setKitName(e.target.value)}
              />
            </div>

            {/* Autor */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Creado por</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Tu nombre (ej: eduin)"
                  className="w-full pl-10 p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={authorName}
                  onChange={e => setAuthorName(e.target.value)}
                />
                <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
              </div>
            </div>

            {/* Descripción (Opcional) */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Notas / Descripción (opcional)</label>
              <textarea 
                rows={3}
                placeholder="Ej: Para mantenimiento preventivo mensual..."
                className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={18} />}
              {isSubmitting ? "Guardando..." : "Publicar Lista"}
            </button>
          </form>
        </div>

        {/* COLUMNA DERECHA: RESUMEN DE HERRAMIENTAS */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <Package className="text-blue-500" size={20} />
              Herramientas ({selectedTools.length})
            </h3>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden max-h-[500px] overflow-y-auto">
            {selectedTools.map((tool) => (
              <div key={tool.id} className="p-3 border-b border-slate-200 bg-white flex justify-between items-center last:border-0 hover:bg-slate-50">
                <div>
                  <p className="font-medium text-slate-800 text-sm">{tool.name}</p>
                  <code className="text-xs font-mono text-blue-600 font-bold">{tool.part_number}</code>
                </div>
                <button 
                  onClick={() => toggleTool(tool)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="Quitar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}