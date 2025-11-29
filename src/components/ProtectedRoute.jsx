import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, redirectIfAuth = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  // Si redirectIfAuth es true, redirige a home si ya está autenticado (para /login)
  if (redirectIfAuth && user) {
    return <Navigate to="/" replace />;
  }

  // Si no está autenticado y la ruta requiere auth, redirige a login
  if (!redirectIfAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
