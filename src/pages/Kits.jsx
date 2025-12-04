import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Loader2, TrendingUp, AlertCircle, X, Copy, Share2 } from 'lucide-react';
import KitCard from '../components/social/KitCard';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import UI_LABELS from '../constants/uiLabels';

export default function Kits() {
  const { user } = useAuth();
  const [kits, setKits] = useState([]);
  const [loading, setLoading] = useState(true);
  const anonId = localStorage.getItem('toolfinder_anon_id');
  
  // Modal state
  const [selectedKit, setSelectedKit] = useState(null);
  const [showKitModal, setShowKitModal] = useState(false);

  const fetchKits = async () => {
    try {
      const { data: kitsData, error } = await supabase
        .rpc('get_kits_with_likes', { user_session_id: anonId })
        .order('likes_count', { ascending: false });

      if (error) {
        console.warn('RPC function not found, using fallback method');
        return await fetchKitsFallback();
      }

      setKits(kitsData || []);
    } catch (err) {
      console.error("Error cargando kits:", err);
      await fetchKitsFallback();
    } finally {
      setLoading(false);
    }
  };

  const fetchKitsFallback = async () => {
    try {
      const { data: kitsData, error } = await supabase
        .from('kits')
        .select(`
          *,
          kit_items (
            tools ( name, part_number, category )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const { data: likesData } = await supabase.from('kit_likes').select('kit_id, session_id');

      const processedKits = kitsData.map(kit => {
        const kitLikes = likesData?.filter(l => l.kit_id === kit.id) || [];
        return {
          ...kit,
          likes_count: kitLikes.length,
          is_liked_by_user: kitLikes.some(l => l.session_id === anonId)
        };
      });

      const sortedKits = processedKits.sort((a, b) => b.likes_count - a.likes_count);
      setKits(sortedKits);
    } catch (err) {
      console.error("Error en fallback:", err);
    }
  };

  useEffect(() => {
    fetchKits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleLike = async (kitId, isNowLiked) => {
    try {
      if (isNowLiked) {
        await supabase.from('kit_likes').insert([{ kit_id: kitId, session_id: anonId }]);
      } else {
        await supabase.from('kit_likes').delete().match({ kit_id: kitId, session_id: anonId });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      fetchKits();
    }
  };

  const handleDeleteKit = async (kitId) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta lista permanentemente?")) return;
    
    try {
      const { error } = await supabase.from('kits').delete().eq('id', kitId);
      if (error) throw error;
      
      setKits(prev => prev.filter(k => k.id !== kitId));
      toast.success("✅ Lista eliminada correctamente");
    } catch (err) {
      toast.error("⚠️ Error al borrar: " + err.message);
    }
  };

  const handleViewKit = (kit) => {
    setSelectedKit(kit);
    setShowKitModal(true);
  };

  const closeKitModal = () => {
    setShowKitModal(false);
    setSelectedKit(null);
  };

  // Generate clean text for sharing
  const generateKitText = (kit) => {
    if (!kit) return '';
    
    let text = `📋 ${kit.name}\n\n`;
    
    kit.kit_items?.forEach((item) => {
      const pn = item.tools?.part_number || 'N/A';
      const name = item.tools?.name || 'Sin nombre';
      text += `${pn} ${name}\n`;
    });
    
    return text;
  };

  const handleCopyKit = () => {
    const text = generateKitText(selectedKit);
    navigator.clipboard.writeText(text);
    toast.success('✅ Lista copiada al portapapeles');
  };

  const handleShareWhatsApp = () => {
    const text = generateKitText(selectedKit);
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* Header Social */}
      <div className="bg-slate-900 pt-8 pb-12 px-4 shadow-lg mb-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-slate-800 text-blue-400 px-3 py-1 rounded-full text-xs font-bold mb-3 border border-slate-700">
            <TrendingUp size={14} /> {UI_LABELS.KITS_BADGE}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{UI_LABELS.KITS_TITLE}</h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            {UI_LABELS.KITS_SUBTITLE}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : kits.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
            <AlertCircle className="mx-auto text-slate-300 mb-2" size={48} />
            <h3 className="text-lg font-bold text-slate-700">Aún no hay listas</h3>
            <p className="text-slate-500">¡Sé el primero en crear una!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {kits.map((kit, index) => (
              <KitCard 
                key={kit.id} 
                kit={kit} 
                rank={index} 
                onToggleLike={handleToggleLike}
                currentUserId={anonId}
                isAdmin={!!user}
                onDelete={() => handleDeleteKit(kit.id)}
                onViewKit={handleViewKit}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalles del Kit */}
      {showKitModal && selectedKit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeKitModal}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{selectedKit.name}</h2>
                <p className="text-slate-500 text-sm mt-1">{UI_LABELS.MODAL_BY_AUTHOR} {selectedKit.author_name || UI_LABELS.MODAL_BY_ANON}</p>
              </div>
              <button 
                onClick={closeKitModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Cerrar modal"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            
            {/* Contenedor con padding-bottom para el action bar */}
            <div className="mb-4 pb-24">
              <p className="text-sm font-bold text-slate-500 uppercase mb-3">
                Herramientas incluidas ({selectedKit.kit_items?.length || 0})
              </p>
              
              {/* Lista de TODAS las herramientas */}
              <div className="space-y-3">
                {selectedKit.kit_items?.map((item, index) => (
                  <div key={index} className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:bg-slate-100 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Nombre de la herramienta */}
                        <h3 className="text-lg font-bold text-slate-800 mb-2">
                          {item.tools?.name || 'Sin nombre'}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Part Number */}
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Part Number</p>
                            <code className="text-sm font-mono text-blue-600 font-bold">
                              {item.tools?.part_number || 'N/A'}
                            </code>
                          </div>
                          
                          {/* Categoría */}
                          {item.tools?.category && (
                            <div>
                              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Categoría</p>
                              <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                                {item.tools.category}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Número de item */}
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-slate-200 text-slate-600 rounded-full text-sm font-bold">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!selectedKit.kit_items || selectedKit.kit_items.length === 0) && (
                  <div className="text-center py-8 text-slate-400">
                    <p>Este kit no tiene herramientas</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Sticky Action Bar */}
            <div className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 p-4 flex items-center justify-between gap-3">
              <div className="flex gap-2">
                <button 
                  onClick={handleCopyKit}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm"
                >
                  <Copy size={16} />
                  {UI_LABELS.MODAL_ACTION_COPY}
                </button>
                
                <button 
                  onClick={handleShareWhatsApp}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium shadow-sm"
                >
                  <Share2 size={16} />
                  {UI_LABELS.MODAL_ACTION_WHATSAPP}
                </button>
              </div>
              
              <button 
                onClick={closeKitModal}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium"
              >
                {UI_LABELS.MODAL_ACTION_CLOSE}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}