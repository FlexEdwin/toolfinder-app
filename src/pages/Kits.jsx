import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import KitCard from '../components/social/KitCard';

export default function Kits() {
  const [kits, setKits] = useState([]);
  const [loading, setLoading] = useState(true);
  const anonId = localStorage.getItem('toolfinder_anon_id');

  const fetchKits = async () => {
    try {
      // Llamada optimizada usando RPC function de Supabase
      // Esta función SQL cuenta los likes directamente en la base de datos
      const { data: kitsData, error } = await supabase
        .rpc('get_kits_with_likes', { user_session_id: anonId })
        .order('likes_count', { ascending: false });

      if (error) {
        // Si la función RPC no existe, fallback al método manual
        console.warn('RPC function not found, using fallback method');
        return await fetchKitsFallback();
      }

      setKits(kitsData || []);
    } catch (err) {
      console.error("Error cargando kits:", err);
      // Intentar método fallback en caso de error
      await fetchKitsFallback();
    } finally {
      setLoading(false);
    }
  };

  // Método fallback (el código original) por si la función RPC no está disponible
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

  // Lógica de Like con manejo de errores
  const handleToggleLike = async (kitId, isNowLiked) => {
    try {
      if (isNowLiked) {
        await supabase.from('kit_likes').insert([{ kit_id: kitId, session_id: anonId }]);
      } else {
        await supabase.from('kit_likes').delete().match({ kit_id: kitId, session_id: anonId });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Recargar kits en caso de error para sincronizar el estado
      fetchKits();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* Header Social */}
      <div className="bg-slate-900 pt-8 pb-12 px-4 shadow-lg mb-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-slate-800 text-blue-400 px-3 py-1 rounded-full text-xs font-bold mb-3 border border-slate-700">
            <TrendingUp size={14} /> Ranking en Tiempo Real
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Conocimiento Colectivo</h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Descubre las listas de herramientas más votadas por los expertos de la planta.
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}