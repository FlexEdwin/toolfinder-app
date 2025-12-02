import { useState, useEffect } from 'react';
import { X, Construction } from 'lucide-react';

export default function SystemAnnouncement() {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 border border-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-xl border border-amber-200">
              <Construction className="text-amber-600" size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Estado del Proyecto
              </h2>
              <p className="text-amber-600 font-bold text-sm uppercase tracking-wider">
                🚧 Versión Beta / En Construcción
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
            aria-label="Cerrar anuncio"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 mb-8">
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 text-slate-700 leading-relaxed">
            <p className="mb-4">
              <span className="font-bold text-slate-900">Bienvenido a ToolFinder.</span> Actualmente estamos en una fase de despliegue activo y optimización. Es posible que encuentres intermitencias o errores puntuales mientras mejoramos la plataforma.
            </p>
            <p>
              <span className="font-bold text-slate-900">Tu colaboración es fundamental:</span> si detectas fallos, tienes ideas de mejora o deseas contribuir, por favor contacta al administrador. Recordemos que esta herramienta la construimos entre todos para el beneficio de todos.
            </p>
          </div>

          <p className="text-slate-600 text-center font-medium italic">
            "¡Saludos y felices fiestas!"
          </p>
        </div>

        {/* Signature */}
        <div className="flex justify-end mb-6">
          <div className="text-right border-r-4 border-slate-200 pr-4">
            <p className="text-slate-800 font-bold text-lg leading-none mb-1">
              <span translate="no" className="notranslate">Flex</span>
            </p>
            <p className="text-slate-500 text-sm font-serif italic">
              Lead Developer
            </p>
          </div>
        </div>

        {/* Footer Button */}
        <div className="flex justify-center">
          <button
            onClick={handleDismiss}
            className="w-full sm:w-auto px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Entendido, continuar
          </button>
        </div>
      </div>
    </div>
  );
}
