import { useState } from 'react';
import { X, Edit2, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'sonner';

export default function CategoryManagerModal({ isOpen, onClose, categories, onRefresh }) {
  const [loading, setLoading] = useState(false);

  const handleRename = async (oldName) => {
    const newName = prompt(`Nuevo nombre para "${oldName}":`, oldName);
    if (!newName || newName === oldName || !newName.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.rpc('rename_category', { 
        old_name: oldName, 
        new_name: newName.trim() 
      });

      if (error) throw error;

      toast.success(`✅ Categoría renombrada a "${newName}"`);
      onRefresh();
    } catch (error) {
      console.error(error);
      toast.error("⚠️ Error al renombrar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`¿Seguro que quieres eliminar la categoría "${category}"? \n\nLas herramientas quedarán sin categoría.`)) return;

    setLoading(true);
    try {
      const { error } = await supabase.rpc('delete_category', { 
        target_name: category 
      });

      if (error) throw error;

      toast.success(`✅ Categoría "${category}" eliminada`);
      onRefresh();
    } catch (error) {
      console.error(error);
      toast.error("⚠️ Error al eliminar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Edit2 size={18} className="text-blue-600" />
            Gestionar Categorías
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto p-4 space-y-2">
          {categories.filter(c => c !== "Todas").length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No hay categorías para gestionar.</p>
            </div>
          ) : (
            categories.filter(c => c !== "Todas").map(cat => (
              <div key={cat} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg hover:border-blue-200 hover:shadow-sm transition-all group">
                <span className="font-medium text-slate-700">{cat}</span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleRename(cat)}
                    disabled={loading}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"
                    title="Renombrar"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(cat)}
                    disabled={loading}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-start gap-2">
          <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-500" />
          <p>
            Los cambios afectan a todas las herramientas de la categoría. 
            Eliminar una categoría dejará sus herramientas "Sin categoría".
          </p>
        </div>
      </div>
    </div>
  );
}
