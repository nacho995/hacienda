import React from 'react';
import Image from 'next/image';

// Componente para optimizar imágenes y mejorar SEO y rendimiento
const OptimizedImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  priority = false,
  className = '', 
  fill = false,
  sizes = '100vw',
  quality = 85,
  ...props 
}) => {
  // Asegurarse de que siempre haya un texto alternativo descriptivo (importante para SEO)
  const safeAlt = alt || 'Imagen de Hacienda San Carlos Borromeo';

  return (
    <figure className={`relative ${className}`}>
      {fill ? (
        <Image
          src={src}
          alt={safeAlt}
          fill={true}
          sizes={sizes}
          quality={quality}
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          {...props}
        />
      ) : (
        <Image
          src={src}
          alt={safeAlt}
          width={width}
          height={height}
          quality={quality}
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          {...props}
        />
      )}
    </figure>
  );
};

export default OptimizedImage;
