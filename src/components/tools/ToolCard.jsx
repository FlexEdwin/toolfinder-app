import { Copy, Plus, Check, Zap, Shield, Wrench, Ruler, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useKit } from '../../context/KitContext';
import UI_LABELS from '../../constants/uiLabels';

/**
 * ToolCard Component - Ultra-Compact Mobile Design
 * Displays a tool in card format with actions (copy, select, edit, delete)
 * Optimized for mobile: fits 3 rows on screen
 * 
 * @param {Object} props - Component props
 * @param {Object} props.tool - Tool object with name, part_number, category, specs
 * @param {boolean} props.isAdmin - Whether current user has admin privileges
 * @param {Function} props.onEdit - Callback when edit button is clicked
 * @param {Function} props.onDelete - Callback when delete button is clicked
 * @returns {JSX.Element} Tool card component
 */

export default function ToolCard({ tool, isAdmin, onEdit, onDelete }) {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { selectedTools, toggleTool } = useKit();

  // Verificar si esta herramienta ya está en el carrito
  const isSelected = selectedTools.some(t => t.id === tool.id);

  /**
   * Get category icon based on category name
   * @param {string} category - Category name
   * @returns {JSX.Element} Icon component
   */
  const getIcon = (category) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('eléctrico') || cat.includes('electric')) return <Zap size={16} />;
    if (cat.includes('seguridad')) return <Shield size={16} />;
    if (cat.includes('medición')) return <Ruler size={16} />;
    return <Wrench size={16} />;
  };

  /**
   * Copy part number to clipboard and show feedback
   */
  const copyToClipboard = () => {
    navigator.clipboard.writeText(tool.part_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`bg-white rounded-xl border transition-all relative flex flex-col h-full group ${isSelected ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50 shadow-lg' : 'border-slate-200 shadow-sm hover:shadow-md'}`}>
      
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

      <div className="p-2 md:p-4 flex-grow">
        {/* Badge de Categoría - En flujo normal, alineado a la derecha */}
        <div className="w-full flex justify-end mb-1">
          <span className="inline-block px-1.5 md:px-2.5 py-0.5 text-[10px] font-bold rounded-lg uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
            {tool.category}
          </span>
        </div>

        {/* Image or Icon - Ultra compacto en móvil, sin margen superior */}
        {tool.image_url && !imageError ? (
          <div className="mb-2 w-full h-24 md:h-48 rounded-lg overflow-hidden bg-slate-100 mt-0">
            <img
              src={tool.image_url}
              alt={tool.name}
              className="w-full h-full object-contain"
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <div className="w-full flex justify-center items-center mb-1 h-8 md:h-48 md:bg-slate-50 md:rounded-lg mt-0">
            <div className={`w-7 h-7 md:w-9 md:h-9 rounded-lg flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
              {getIcon(tool.category)}
            </div>
          </div>
        )}

        <div className="mb-1">
          <h3 className="font-bold text-slate-800 leading-tight text-xs md:text-base">
            {tool.name}
          </h3>
        </div>

        {tool.specs && (
           <div className="mb-1 md:mb-2">
             <span className="inline-flex items-center text-[10px] md:text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
               ⚙️ {typeof tool.specs === 'object' ? JSON.stringify(tool.specs) : tool.specs}
             </span>
           </div>
        )}

        <div className="flex items-center gap-1 md:gap-2 mt-auto">
          <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">P/N:</span>
          <code className="font-mono text-blue-700 font-bold text-[10px] md:text-base select-all">
            {tool.part_number}
          </code>
        </div>
      </div>

      {/* Footer de Acciones - Ultra compacto */}
      <div className="p-2 border-t border-slate-100 flex gap-2 bg-slate-50/50 rounded-b-xl">
        <button 
          onClick={copyToClipboard}
          className={`flex-1 flex items-center justify-center gap-1 h-8 md:h-auto md:py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${copied ? 'bg-green-100 text-green-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
        >
          {copied ? UI_LABELS.TOOL_ACTION_COPIED : <><Copy size={12} className="md:w-3.5 md:h-3.5" /> {UI_LABELS.TOOL_ACTION_COPY}</>}
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
          className={`h-8 md:h-auto md:p-2 px-2 rounded-lg border transform transition-all duration-200 active:scale-95 ${
            isSelected 
              ? 'bg-green-600 text-white border-green-600 hover:bg-green-700' 
              : 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-100'
          }`}
          title={isSelected ? UI_LABELS.TOOL_ACTION_REMOVE : UI_LABELS.TOOL_ACTION_ADD}
        >
          {isSelected ? <Check size={16} className="md:w-4.5 md:h-4.5" /> : <Plus size={16} className="md:w-4.5 md:h-4.5" />}
        </button>
      </div>
    </div>
  );
}