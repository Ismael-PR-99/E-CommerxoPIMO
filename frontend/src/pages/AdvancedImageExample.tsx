import React, { useState } from 'react';
import { ImageLoader } from '../components/ImageLoader';

const AdvancedImageExample: React.FC = () => {
  // Estado para simular el fallo de carga de una imagen
  const [forceFailure, setForceFailure] = useState(false);

  // Lista de productos con URLs (algunas correctas, algunas que fallarán)
  const productos = [
    {
      nombre: 'Carne Mechada',
      url: '/images/productos/carne-mechada.jpg'
    },
    {
      nombre: 'Chicharrón de Cádiz',
      // URL que probablemente no exista para mostrar el fallback
      url: forceFailure ? '/images/no-existe/chicharron.jpg' : '/images/productos/chicharron.jpg'
    },
    {
      nombre: 'Jamón Cocido',
      // Sin URL para mostrar directamente el fallback base64
      url: ''
    },
    {
      nombre: 'Pechuga de Pavo',
      url: '/images/productos/pechuga-pavo.jpg'
    },
    {
      nombre: 'Producto sin imagen conocida',
      url: '/images/productos/producto-generico.jpg'
    }
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Cargador Avanzado de Imágenes</h1>
      
      <div className="mb-6">
        <button 
          onClick={() => setForceFailure(!forceFailure)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {forceFailure ? 'Restaurar URLs' : 'Simular fallo de imagen'}
        </button>
        <p className="text-sm text-gray-500 mt-2">
          Este botón cambia la URL de algunas imágenes para simular fallos de carga
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productos.map((producto, index) => (
          <div 
            key={index}
            className="border rounded-lg overflow-hidden shadow-md"
          >
            {/* Ejemplo de uso del cargador de imágenes avanzado */}
            <div className="h-48">
              <ImageLoader 
                src={producto.url}
                productName={producto.nombre}
                className="w-full h-full"
                fallbackClassName="bg-gray-50"
              />
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-medium">{producto.nombre}</h3>
              <p className="text-gray-500 text-sm mt-1">
                URL: {producto.url || 'Sin URL (usa base64)'}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 p-6 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Funcionamiento del Componente</h2>
        <p className="mb-3">
          Este componente inteligente maneja múltiples escenarios:
        </p>
        <ol className="list-decimal pl-6 mb-4 space-y-2">
          <li>Si la URL existe y carga correctamente: muestra la imagen normal</li>
          <li>Si la URL falla al cargar: usa la imagen base64 guardada</li>
          <li>Si no hay URL definida: usa directamente la imagen base64</li>
          <li>Si no hay imagen base64 para ese producto: muestra un emoji como último recurso</li>
        </ol>
        <p className="font-medium">Ventajas:</p>
        <ul className="list-disc pl-6 mb-3">
          <li>Compatibilidad universal con cualquier navegador</li>
          <li>Cero errores de carga de imágenes</li>
          <li>Siempre muestra algún contenido al usuario</li>
          <li>Funciona offline (imágenes base64) y online (URLs)</li>
        </ul>
        <p className="text-sm text-gray-600 mt-4">
          Prueba a hacer clic en "Simular fallo de imagen" para ver cómo el componente
          cambia automáticamente a la versión base64 cuando una URL falla.
        </p>
      </div>
    </div>
  );
};

export default AdvancedImageExample;