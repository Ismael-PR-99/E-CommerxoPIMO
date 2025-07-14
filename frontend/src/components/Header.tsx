import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Sistema de Gestión de Inventario
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notificaciones */}
            <button className="p-2 text-gray-400 hover:text-gray-500">
              <span className="sr-only">Ver notificaciones</span>
              🔔
            </button>

            {/* Perfil de usuario */}
            <div className="relative flex items-center">
              <button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <span className="sr-only">Abrir menú de usuario</span>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="ml-3 text-gray-700 font-medium">
                  {user?.fullName || 'Usuario'}
                </span>
              </button>
            </div>

            {/* Botón de logout */}
            <button 
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
