import React, { useState } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  width = '100%',
  height = '100%',
  className = '',
  style = {}
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = () => {
    console.log('✅ Imagen cargada:', src);
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    console.error('❌ Error cargando imagen:', src);
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={{
          width,
          height,
          fontSize: '3rem',
          color: '#9CA3AF',
          ...style
        }}
      >
        📦
      </div>
    );
  }

  return (
    <div
      className={`relative ${className}`}
      style={{ width, height, ...style }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      />
    </div>
  );
};