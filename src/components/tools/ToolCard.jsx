import { Copy, Plus, Check, Zap, Shield, Wrench, Ruler, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useKit } from '../../context/KitContext';

export default function ToolCard({ tool, isAdmin, onEdit, onDelete }) {
  const [copied, setCopied] = useState(false);
  const { selectedTools, toggleTool } = useKit();

  // Verificar si esta herramienta ya está en el carrito
  const isSelected = selectedTools.some(t => t.id === tool.id);

  const getIcon = (category) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('eléctrico') || cat.includes('electric')) return <Zap size={18} />;
    if (cat.includes('seguridad')) return <Shield size={18} />;
    if (cat.includes('medición')) return <Ruler size={18} />;
    return <Wrench size={18} />;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tool.part_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`bg-white rounded-xl border transition-all relative flex flex-col h-full group ${isSelected ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50 shadow-lg' : 'border-slate-200 shadow-sm hover:shadow-md'}`}>
      
      {/* Badge de Categoría */}
      <div className="absolute top-0 right-0">
        <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-bl-lg rounded-tr-lg uppercase tracking-wider bg-slate-100 text-slate-500 border-b border-l border-slate-200">
          {tool.category}
        </span>
      </div>

      {/* Admin Controls */}
      {isAdmin && (onEdit || onDelete) && (
        <div className="absolute top-2 left-2 flex gap-1 z-10">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(tool);
              }}
              className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors shadow-sm"
              title="Editar herramienta"
            >
              <Pencil size={13} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(tool.id);
              }}
              className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors shadow-sm"
              title="Eliminar herramienta"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      )}

      <div className="p-4 flex-grow">
        <div className="mb-2.5">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
            {getIcon(tool.category)}
          </div>
          <h3 className="font-semibold text-slate-800 leading-tight text-base">
            {tool.name}
          </h3>
        </div>

        {tool.specs && (
           <div className="mb-3">
             <span className="inline-flex items-center text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
               ⚙️ {typeof tool.specs === 'object' ? JSON.stringify(tool.specs) : tool.specs}
             </span>
           </div>
        )}

        <div className="flex items-center gap-2 mt-auto">
          <span className="text-xs font-bold text-slate-400 uppercase">P/N:</span>
          <code className="font-mono text-blue-700 font-bold text-base select-all">
            {tool.part_number}
          </code>
        </div>
      </div>

      {/* Footer de Acciones */}
      <div className="p-2.5 border-t border-slate-100 flex gap-2 bg-slate-50/50 rounded-b-xl">
        <button 
          onClick={copyToClipboard}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-medium transition-all ${copied ? 'bg-green-100 text-green-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
        >
          {copied ? '¡Copiado!' : <><Copy size={14} /> Copiar</>}
        </button>

        {/* BOTÓN MÁGICO DE SELECCIÓN */}
        <button 
          onClick={() => {
            // Haptic feedback for mobile devices
            if (navigator.vibrate) {
              navigator.vibrate(50);
            }
            toggleTool(tool);
          }}
          className={`p-2 rounded-lg border transform transition-all duration-200 active:scale-95 ${
            isSelected 
              ? 'bg-green-600 text-white border-green-600 hover:bg-green-700' 
              : 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-100'
          }`}
          title={isSelected ? "Quitar de la lista" : "Agregar a lista"}
        >
          {isSelected ? <Check size={18} /> : <Plus size={18} />}
        </button>
      </div>
    </div>
  );
}