import { useState } from 'react';
import { useStore } from '../store/useStore';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { user } = useStore();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Productos', href: '/productos', icon: '📦' },
    { name: 'Órdenes', href: '/ordenes', icon: '📋' },
    { name: 'Inventario', href: '/inventario', icon: '📈' },
    { name: 'ML Analytics', href: '/analytics', icon: '🤖' },
  ];

  return (
    <div className={`bg-gray-800 text-white transition-all duration-300 ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h1 className={`text-xl font-bold ${isOpen ? 'block' : 'hidden'}`}>
            E-CommerxoPIMO
          </h1>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
          >
            {isOpen ? '←' : '→'}
          </button>
        </div>
      </div>

      <nav className="mt-8">
        <ul className="space-y-2 px-4">
          {navigation.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <span className="text-xl">{item.icon}</span>
                {isOpen && (
                  <span className="ml-3 text-sm font-medium">{item.name}</span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {isOpen && user && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
