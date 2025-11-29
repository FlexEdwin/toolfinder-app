import { Copy, FolderPlus, Check, Zap, Shield, Wrench, Ruler } from 'lucide-react'; // Importar Check
import { useState } from 'react';
import { useKit } from '../../context/KitContext'; // <--- Importar el hook

export default function ToolCard({ tool }) {
  const [copied, setCopied] = useState(false);
  const { selectedTools, toggleTool } = useKit(); // <--- Usar el contexto

  // Verificar si esta herramienta ya está en el carrito
  const isSelected = selectedTools.some(t => t.id === tool.id);

  const getIcon = (category) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('eléctrico') || cat.includes('electric')) return <Zap size={20} />;
    if (cat.includes('seguridad')) return <Shield size={20} />;
    if (cat.includes('medición')) return <Ruler size={20} />;
    return <Wrench size={20} />;
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
        <span className="inline-block px-3 py-1 text-[10px] font-bold rounded-bl-lg rounded-tr-lg uppercase tracking-wider bg-slate-100 text-slate-500 border-b border-l border-slate-200">
          {tool.category}
        </span>
      </div>

      <div className="p-5 flex-grow">
        <div className="mb-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
            {getIcon(tool.category)}
          </div>
          <h3 className="font-semibold text-slate-800 leading-tight text-lg">
            {tool.name}
          </h3>
        </div>

        {tool.specs && (
           <div className="mb-4">
             <span className="inline-flex items-center text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
               ⚙️ {typeof tool.specs === 'object' ? JSON.stringify(tool.specs) : tool.specs}
             </span>
           </div>
        )}

        <div className="flex items-center gap-2 mt-auto">
          <span className="text-xs font-bold text-slate-400 uppercase">P/N:</span>
          <code className="font-mono text-blue-700 font-bold text-lg select-all">
            {tool.part_number}
          </code>
        </div>
      </div>

      {/* Footer de Acciones */}
      <div className="p-3 border-t border-slate-100 flex gap-2 bg-slate-50/50 rounded-b-xl">
        <button 
          onClick={copyToClipboard}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${copied ? 'bg-green-100 text-green-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
        >
          {copied ? '¡Copiado!' : <><Copy size={16} /> Copiar</>}
        </button>

        {/* BOTÓN MÁGICO DE SELECCIÓN */}
        <button 
          onClick={() => toggleTool(tool)}
          className={`p-2 rounded-lg border transition-colors ${
            isSelected 
              ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
              : 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-100'
          }`}
          title={isSelected ? "Quitar de la lista" : "Agregar a lista"}
        >
          {isSelected ? <Check size={20} /> : <FolderPlus size={20} />}
        </button>
      </div>
    </div>
  );
}