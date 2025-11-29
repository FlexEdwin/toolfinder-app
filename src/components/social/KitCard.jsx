import { Heart, User, Calendar, Wrench, Trophy, Trash2 } from 'lucide-react';
import { useState, memo } from 'react';

const KitCard = memo(function KitCard({ kit, rank, onToggleLike, currentUserId, isAdmin, onDelete }) {
  // Validación de datos para prevenir errores
  if (!kit || !kit.id) {
    console.error('KitCard: Invalid kit data', kit);
    return null;
  }

  // Estado local para animación inmediata (Optimistic UI)
  const [isLiked, setIsLiked] = useState(kit.is_liked_by_user || false);
  const [likesCount, setLikesCount] = useState(kit.likes_count || 0);

  const handleLike = () => {
    // 1. Actualizar UI inmediatamente
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
    
    // 2. Avisar al padre para que actualice la BD
    if (onToggleLike) {
      onToggleLike(kit.id, newLikedState);
    }
  };

  // Color de medalla para el Top 3
  const getRankBadge = (index) => {
    if (index === 0) return <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 border-slate-50 shadow-lg z-10"><Trophy size={18} /></div>;
    if (index === 1) return <div className="absolute -top-3 -right-3 bg-slate-300 text-slate-700 w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 border-slate-50 shadow-lg z-10">2</div>;
    if (index === 2) return <div className="absolute -top-3 -right-3 bg-orange-300 text-orange-800 w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 border-slate-50 shadow-lg z-10">3</div>;
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-visible">
      
      {/* Badge de Ranking */}
      {getRankBadge(rank)}

      {/* BOTÓN ADMIN DE BORRADO */}
      {isAdmin && onDelete && (
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute top-2 right-2 p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors z-20 shadow-md"
          title="Borrar Lista (Admin)"
          aria-label={`Eliminar lista ${kit.name || 'esta lista'}`}
        >
          <Trash2 size={16} />
        </button>
      )}

      <div className="p-5">
        {/* Cabecera */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1">{kit.name || 'Lista sin nombre'}</h3>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><User size={12} /> {kit.author_name || 'Anónimo'}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar size={12} /> 
                {kit.created_at ? new Date(kit.created_at).toLocaleDateString() : 'Fecha desconocida'}
              </span>
            </div>
          </div>
        </div>

        {/* Vista Previa de Herramientas (Chips) */}
        <div className="mb-6">
          <p className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
            <Wrench size={12} /> Incluye ({kit.kit_items?.length || 0}):
          </p>
          <div className="flex flex-wrap gap-2">
            {kit.kit_items?.slice(0, 4).map((item, i) => (
              <span key={i} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded border border-slate-200">
                {item.tools?.name || 'Herramienta sin nombre'}
              </span>
            ))}
            {kit.kit_items?.length > 4 && (
              <span className="bg-slate-100 text-slate-400 text-xs px-2 py-1 rounded border border-slate-200">
                +{kit.kit_items.length - 4} más...
              </span>
            )}
          </div>
        </div>

        {/* Footer: Likes */}
        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
          <button 
            onClick={handleLike}
            aria-label={isLiked ? `Quitar voto de ${kit.name || 'esta lista'}` : `Votar por ${kit.name || 'esta lista'}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
              isLiked 
                ? 'bg-red-50 text-red-600 border border-red-200' 
                : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Heart size={16} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "animate-bounce" : ""} />
            {likesCount} <span className="font-normal hidden sm:inline">Votos</span>
          </button>

          <button 
            className="text-blue-600 text-sm font-medium hover:underline"
            aria-label={`Ver detalles de ${kit.name || 'esta lista'}`}
          >
            Ver detalles →
          </button>
        </div>
      </div>
    </div>
  );
});

export default KitCard;