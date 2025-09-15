import React from 'react';
import { SimpleProductImage } from '../components/SimpleProductImage.tsx';

const ImageExample: React.FC = () => {
  // Lista de productos para probar diferentes imágenes
  const productos = [
    'Carne Mechada',
    'Chicharrón de Cádiz',
    'Jamón Cocido',
    'Pechuga de Pavo',
    'Producto sin imagen conocida'
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Ejemplos de Imágenes de Productos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productos.map((producto, index) => (
          <div 
            key={index}
            className="border rounded-lg overflow-hidden shadow-md"
          >
            {/* Ejemplo de uso del componente de imagen simple */}
            <div className="h-48 bg-gray-50">
              <SimpleProductImage 
                productName={producto}
                className="w-full h-full"
              />
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-medium">{producto}</h3>
              <p className="text-gray-500 text-sm mt-2">
                Imagen renderizada con SimpleProductImage
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">¿Cómo funciona?</h2>
        <p className="mb-3">
          Este componente usa imágenes codificadas en base64 directamente en el código,
          lo que elimina la necesidad de cargar archivos externos.
        </p>
        <p className="mb-3">
          Ventajas:
        </p>
        <ul className="list-disc pl-6 mb-3">
          <li>Compatible con cualquier navegador moderno</li>
          <li>Sin problemas de carga de archivos externos</li>
          <li>Funciona aunque las imágenes originales no estén disponibles</li>
          <li>No requiere configuraciones especiales en el servidor</li>
        </ul>
        <p className="mb-3">
          En una implementación real, necesitarías convertir tus imágenes a base64
          y almacenarlas en el componente o en un archivo separado.
        </p>
      </div>
    </div>
  );
};

export default ImageExample;