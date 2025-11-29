import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Wrench, LogIn, User, Menu, PlusCircle } from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const { user } = useAuth(); // Solo usamos 'user' para saber si eres Tú (Admin)
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* --- HEADER --- */}
      <header className="bg-slate-900 text-white sticky top-0 z-50 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight hover:text-blue-400 transition-colors">
            <Wrench className="text-blue-500" size={24} />
            ToolFinder <span className="text-xs bg-slate-700 px-1.5 py-0.5 rounded text-slate-300 ml-1 font-mono">OPEN</span>
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium hover:text-white text-slate-300 transition-colors">Buscador</Link>
            <Link to="/kits" className="text-sm font-medium hover:text-white text-slate-300 transition-colors">Listas de la Comunidad</Link>
            
            {/* Botón de Acción Principal (Ahora visible para todos) */}
            <Link 
              to="/create" 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-bold transition-all shadow-lg shadow-blue-900/50"
            >
              <PlusCircle size={16} /> Crear Lista
            </Link>

            {/* Solo mostramos Avatar si eres Admin/Logueado */}
            {user && (
              <div className="ml-4 pl-4 border-l border-slate-700 text-xs text-green-400 font-mono">
                ADMIN: ON
              </div>
            )}
          </nav>

          {/* Botón Menú Móvil */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu size={24} />
          </button>
        </div>

        {/* Menú Móvil */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-800 border-t border-slate-700 p-4 space-y-4">
            <Link to="/" className="block text-slate-300" onClick={() => setIsMenuOpen(false)}>Buscador</Link>
            <Link to="/kits" className="block text-slate-300" onClick={() => setIsMenuOpen(false)}>Ver Listas</Link>
            <Link to="/create" className="block text-blue-400 font-bold" onClick={() => setIsMenuOpen(false)}>+ Crear Lista Nueva</Link>
          </div>
        )}
      </header>

      {/* --- CONTENIDO --- */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          
          <div className="text-center md:text-left">
            <h4 className="text-white font-bold flex items-center gap-2 justify-center md:justify-start">
              <Wrench size={14} /> ToolFinder
            </h4>
            <p className="mt-1 opacity-70">Acceso libre para estandarización operativa.</p>
          </div>

          <div className="text-center md:text-right">
            <p className="mb-1">Desarrollado por <span className="text-white font-bold">FLEX</span></p>
            <a href="mailto:flexedwin@hotmail.com" className="hover:text-blue-400 transition-colors">
              Soporte: flexedwin@hotmail.com
            </a>
            {/* Link discreto para que TU entres como admin */}
            <div className="mt-2">
                <Link to="/login" className="text-slate-700 hover:text-slate-500">Admin Access</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}