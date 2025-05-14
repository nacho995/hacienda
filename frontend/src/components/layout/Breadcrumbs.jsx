"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

// Componente de Breadcrumbs con soporte para Schema.org BreadcrumbList
const Breadcrumbs = () => {
  const pathname = usePathname();
  
  // Ignorar la página inicial
  if (pathname === '/') return null;
  
  // Dividir la ruta en segmentos y transformar para mostrar
  const pathSegments = pathname.split('/').filter(segment => segment !== '');
  
  // Generar las migas de pan para mostrar visualmente
  const breadcrumbItems = [
    { label: 'Inicio', path: '/' },
    ...pathSegments.map((segment, index) => {
      // Construir la ruta acumulativa para cada segmento
      const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
      
      // Transformar el segmento para que sea más legible
      let label = segment.charAt(0).toUpperCase() + segment.slice(1);
      // Reemplazar guiones por espacios
      label = label.replace(/-/g, ' ');
      
      return { label, path };
    })
  ];
  
  // Preparar datos estructurados para Schema.org
  const breadcrumbsSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@id': `https://www.hdasancarlosborromeo.com${item.path}`,
        'name': item.label
      }
    }))
  };
  
  return (
    <>
      {/* Datos estructurados para SEO */}
      <Script id="breadcrumbs-schema" type="application/ld+json">
        {JSON.stringify(breadcrumbsSchema)}
      </Script>
      
      {/* Migas de pan visibles */}
      <nav aria-label="Breadcrumb" className="container mx-auto px-4 py-3 text-sm">
        <ol className="flex flex-wrap items-center">
          {breadcrumbItems.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-gray-500">/</span>
              )}
              
              {index === breadcrumbItems.length - 1 ? (
                // Último elemento (actual)
                <span className="text-[#A5856A] font-semibold" aria-current="page">
                  {item.label}
                </span>
              ) : (
                // Elementos con enlace
                <Link href={item.path} className="text-gray-600 hover:text-[#A5856A] transition-colors">
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumbs;
