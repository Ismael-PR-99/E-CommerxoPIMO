import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, redirigir según el rol
  if (user?.role === 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  } else {
    return <Navigate to="/store" replace />;
  }
};

export default Home;