import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { usePopularKits } from '../../hooks/usePopularKits';
import { Link } from 'react-router-dom';

export default function FeaturedKits() {
  const { data: kits, isLoading } = usePopularKits();

  if (!isLoading && (!kits || kits.length === 0)) {
    return null;
  }

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <Sparkles size={14} className="text-amber-500" />
          <h3>Kits Destacados</h3>
        </div>
        {!isLoading && (
          <Link to="/kits" className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1">
            Ver todos <ArrowRight size={12} />
          </Link>
        )}
      </div>
      
      {/* 
        Container responding to layout requirements:
        Mobile: flex overflow-x-auto gap-3 pb-2 snap-x no-scrollbar
        Desktop (md): grid grid-cols-4 gap-4 
      */}
      <div className="flex overflow-x-auto gap-3 pb-2 snap-x no-scrollbar md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
        
        {isLoading ? (
          // Loading Skeleton
          <>
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i}
                className="min-w-[160px] w-[160px] md:w-auto bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2 h-24 animate-pulse"
              >
                <div className="flex justify-between items-start">
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                  <div className="h-4 bg-slate-200 rounded w-8"></div>
                </div>
                <div className="mt-auto flex flex-col gap-2">
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </>
        ) : (
          // Real Data
          kits.map((kit) => (
            <Link 
              to="/kits"
              key={kit.id}
              className="min-w-[160px] w-[160px] md:w-auto bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2 snap-start shrink-0 hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <span className="font-bold text-sm truncate text-slate-800 flex-1 pr-2 group-hover:text-blue-700 transition-colors" title={kit.name}>
                  {kit.name}
                </span>
                <span className="text-[10px] bg-white border border-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full whitespace-nowrap shadow-sm">
                  {kit.tool_count} 🛠️
                </span>
              </div>
              
              <div className="flex flex-col gap-1 mt-auto">
                <span className="text-[10px] text-slate-400 font-medium">
                  Por {kit.author_name || 'Anónimo'}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
