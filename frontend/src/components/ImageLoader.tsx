import React, { useState, useEffect } from 'react';
import { SimpleProductImage } from './SimpleProductImage.tsx';

interface ImageLoaderProps {
  src?: string;
  productName: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  fallbackClassName?: string;
  fallbackStyle?: React.CSSProperties;
  width?: number | string;
  height?: number | string;
  showPlaceholder?: boolean;
}

/**
 * Componente avanzado para cargar imágenes con fallback universal
 * Soporta tanto imágenes base64 como URLs
 */
export const ImageLoader: React.FC<ImageLoaderProps> = ({
  src,
  productName,
  alt = '',
  className = '',
  style = {},
  fallbackClassName = '',
  fallbackStyle = {},
  width,
  height,
  showPlaceholder = true
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Resetear estados si cambia la fuente
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [src]);

  // Dimensiones para el contenedor
  const containerStyle: React.CSSProperties = {
    width: width || '100%',
    height: height || '100%',
    position: 'relative',
    ...style
  };

  // Si tenemos un src y no hay error, intentamos cargar la imagen normal
  if (src && !imageError) {
    return (
      <div style={containerStyle} className={className}>
        {/* Placeholder mientras carga */}
        {!imageLoaded && showPlaceholder && (
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f3f4f6',
              ...fallbackStyle
            }}
            className={fallbackClassName}
          >
            <span style={{ fontSize: '1.5rem', color: '#9CA3AF' }}>🔄</span>
          </div>
        )}
        
        {/* Imagen real */}
        <img
          src={src}
          alt={alt || productName}
          style={{
            objectFit: 'cover',
            width: '100%',
            height: '100%',
            display: imageLoaded ? 'block' : 'none'
          }}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Si hay error o no tenemos src, usamos el fallback de base64
  return (
    <div style={containerStyle} className={className}>
      <SimpleProductImage
        productName={productName}
        altText={alt}
        className={fallbackClassName}
        style={{
          width: '100%',
          height: '100%',
          ...fallbackStyle
        }}
      />
    </div>
  );
};