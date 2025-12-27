import { useState } from 'react';
import { PlusCircle, Filter, Copy, Plus, Check } from 'lucide-react';
import { useKit } from '../../context/KitContext';
import ImageZoomModal from './ImageZoomModal';

/**
 * ToolListRow Component
 * Displays a tool in compact list format for list view mode
 * 
 * @param {Object} props - Component props
 * @param {Object} props.tool - Tool object with name, part_number, category
 * @param {boolean} props.isAdmin - Whether current user has admin privileges
 * @param {Function} props.onEdit - Callback when edit button is clicked
 * @param {Function} props.onDelete - Callback when delete button is clicked
 * @returns {JSX.Element} Tool list row component
 */
export default function ToolListRow({ tool, isAdmin, onEdit, onDelete }) {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const { selectedTools, toggleTool } = useKit();
  const isSelected = selectedTools.some(t => t.id === tool.id);

  /**
   * Copy part number to clipboard
   */
  const copyToClipboard = () => {
    navigator.clipboard.writeText(tool.part_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Get emoji icon based on category
   * @param {string} category - Category name
   * @returns {string} Emoji icon
   */
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
      {/* Left: Icon/Image + Content (responsive layout) */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Image or Emoji Icon */}
        {tool.image_url && !imageError ? (
          <button
            type="button"
            onClick={() => setShowZoom(true)}
            className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <img
              src={tool.image_url}
              alt={tool.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          </button>
        ) : (
          <span className="text-2xl flex-shrink-0">{getIcon(tool.category)}</span>
        )}
        
        {/* Content container - changes from column (mobile) to row (desktop) */}
        <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center md:gap-4">
          {/* Name + Category */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-800 truncate text-sm">{tool.name}</h3>
            {/* Category - only visible on desktop */}
            <span className="hidden md:inline-block text-xs text-gray-400">{tool.category}</span>
          </div>
          
          {/* Part Number - ALWAYS VISIBLE */}
          <div className="mt-1 md:mt-0 flex-shrink-0">
            <code className="font-mono text-sm font-bold text-blue-700 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
              {tool.part_number}
            </code>
          </div>
        </div>
      </div>

      {/* Right: Action Buttons */}
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
          onClick={() => {
            // Haptic feedback for mobile devices
            if (navigator.vibrate) {
              navigator.vibrate(50);
            }
            toggleTool(tool);
          }}
          className={`p-2 rounded transform transition-all duration-200 active:scale-95 ${
            isSelected 
              ? 'bg-green-600 text-white' 
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          }`}
          title={isSelected ? "Quitar" : "Agregar"}
        >
          {isSelected ? <Check size={16} /> : <Plus size={16} />}
        </button>
      </div>

      {/* Image Zoom Modal */}
      <ImageZoomModal
        isOpen={showZoom}
        onClose={() => setShowZoom(false)}
        imageUrl={tool.image_url}
        altText={tool.name}
      />
    </div>
  );
}
