import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useCartStore } from '../store';

export const Navigation: React.FC = () => {
    const { user, logout } = useAuthStore();
    const { items } = useCartStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0);

    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link
                            to="/"
                            className="flex-shrink-0 flex items-center text-xl font-bold text-blue-600"
                        >
                            E-CommerxoPIMO
                        </Link>

                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                to="/products"
                                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
                            >
                                Productos
                            </Link>
                            
                            {user && user.role === 'ADMIN' && (
                                <>
                                    <Link
                                        to="/dashboard"
                                        className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/admin/products"
                                        className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
                                    >
                                        Gestionar Productos
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center">
                        <Link
                            to="/cart"
                            className="relative p-2 text-gray-600 hover:text-blue-600 mr-4"
                        >
                            <span className="sr-only">Carrito</span>
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                            {cartItemsCount > 0 && (
                                <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-blue-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                                    {cartItemsCount}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <div className="ml-3 relative flex items-center space-x-4">
                                <span className="text-gray-700">{user.fullName}</span>
                                <button
                                    onClick={handleLogout}
                                    className="text-gray-600 hover:text-red-600"
                                >
                                    Cerrar sesión
                                </button>
                            </div>
                        ) : (
                            <div className="space-x-4">
                                <Link
                                    to="/login"
                                    className="text-gray-600 hover:text-blue-600"
                                >
                                    Iniciar sesión
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    Registrarse
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};
