import React, { useState, useEffect } from 'react';

// Constantes con las imágenes en base64 (solo ejemplos truncados)
export const IMAGE_PLACEHOLDERS = {
  carneMechada: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAIABJREFUeJzkvWmQZdl1Hvadce13X/LlXllrV1VX9d7dPaAHDdAAQRADQABBckRTokTKEiVZtD1hOcKWHY6QbMlWSPbYDtthh8Pyj1H4hw1RNi1KpBWUCIrYCRDsHgzdPb1XV+2VWVX5lt',
  chicharron: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAIABJREFUeJzlfXmUZVd13v7OfffN79WrqXpQT3K3BsvWgDEgGQkwNgbMLAcbwniJlx0SiLNWIAuI11riJCbLXnEcO8sxYDuYKWAb22DABgljW7KMLGmkltRSq7unu+p1VdV7777h',
  jamonCocido: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAIABJREFUeJztnXl4nVW1/z9r7/ec982cJG3TNmlLW6a2ZSyTKIICgkXwqoioXEXxeh3Qn1cZFHCA6/V6r+JVUcGrKHBBEKrIUJBZKKUUSlvahjbN0CbNdJI3w3n3Xu',
  pechugaPavo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAIABJREFUeJztnXecXVW5x7/POeN0ZpIwk5n0QAqhF0GUXqUrgnRFAfVeRa9XvegVRUWvFxXFAl69oBQFQaogIFVAuiC990BICIEkpEwyKdPuPnv',
  default: '📦' 
};

// Mapeo de nombres de productos a URLs de imágenes públicas
const getPublicImageUrl = (productName: string): string | null => {
  const normalizedName = productName.toLowerCase()
    .replace(/\s+/g, '')
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  
  // Mapeo directo a las imágenes disponibles en public/images/productos/
  if (normalizedName.includes('mechada') || normalizedName.includes('carne')) {
    return '/images/productos/carne-mechada.png';
  }
  if (normalizedName.includes('chicharron') || normalizedName.includes('cadiz')) {
    return '/images/productos/chicharron-de-cadiz.png';
  }
  if (normalizedName.includes('jamon') || normalizedName.includes('cocido')) {
    return '/images/productos/Jamon-cocido.png';
  }
  if (normalizedName.includes('pechuga') || normalizedName.includes('pavo')) {
    return '/images/productos/pechuga-de-pavo-asada.png';
  }
  
  return null; // No hay imagen pública disponible
};

// Fallback para cuando no hay imagen pública o falla la carga
const getFallbackContent = (productName: string): string => {
  const normalizedName = productName.toLowerCase()
    .replace(/\s+/g, '')
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  
  // Usar imágenes base64 si están disponibles
  if (normalizedName.includes('mechada') || normalizedName.includes('carne')) {
    return IMAGE_PLACEHOLDERS.carneMechada;
  }
  if (normalizedName.includes('chicharron') || normalizedName.includes('cadiz')) {
    return IMAGE_PLACEHOLDERS.chicharron;
  }
  if (normalizedName.includes('jamon') || normalizedName.includes('cocido')) {
    return IMAGE_PLACEHOLDERS.jamonCocido;
  }
  if (normalizedName.includes('pechuga') || normalizedName.includes('pavo')) {
    return IMAGE_PLACEHOLDERS.pechugaPavo;
  }
  
  // Emojis como último recurso
  if (normalizedName.includes('chorizo') || normalizedName.includes('bellota')) {
    return '🌭';
  }
  if (normalizedName.includes('lomo') || normalizedName.includes('embuchado')) {
    return '🥩';
  }
  if (normalizedName.includes('salchichon')) {
    return '🥖';
  }
  if (normalizedName.includes('morcilla')) {
    return '⚫';
  }
  if (normalizedName.includes('aceite') || normalizedName.includes('oliva')) {
    return '🫒';
  }
  
  return IMAGE_PLACEHOLDERS.default;
};

interface ProductImageProps {
  productName: string;
  altText?: string;
  className?: string;
  style?: React.CSSProperties;
}

// Componente híbrido que intenta imágenes públicas primero, luego fallback
export const SimpleProductImage: React.FC<ProductImageProps> = ({
  productName,
  altText,
  className = '',
  style = {}
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const publicImageUrl = getPublicImageUrl(productName);
  const fallbackContent = getFallbackContent(productName);
  
  // Reset error state cuando cambia el producto
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [productName]);

  // Si tenemos una URL pública y no hay error, intentamos cargarla
  if (publicImageUrl && !imageError) {
    return (
      <div style={{ position: 'relative', ...style }} className={className}>
        {/* Placeholder mientras carga */}
        {!imageLoaded && (
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
              fontSize: '2rem',
              color: '#9CA3AF'
            }}
          >
            🔄
          </div>
        )}
        
        {/* Imagen pública */}
        <img
          src={publicImageUrl}
          alt={altText || productName}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: imageLoaded ? 'block' : 'none'
          }}
          onLoad={() => {
            setImageLoaded(true);
            console.log('✅ Imagen pública cargada:', publicImageUrl);
          }}
          onError={() => {
            setImageError(true);
            console.log('❌ Error cargando imagen pública, usando fallback:', publicImageUrl);
          }}
        />
      </div>
    );
  }

  // Fallback: mostrar contenido base64 o emoji
  const isEmoji = !fallbackContent.startsWith('data:image');
  
  if (isEmoji) {
    return (
      <div 
        className={className}
        style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3rem',
          color: '#9CA3AF',
          backgroundColor: '#f3f4f6',
          ...style
        }}
      >
        {fallbackContent}
      </div>
    );
  }

  // Imagen base64
  return (
    <img
      src={fallbackContent}
      alt={altText || productName}
      className={className}
      style={{ 
        objectFit: 'cover',
        width: '100%',
        height: '100%',
        ...style 
      }}
    />
  );
};