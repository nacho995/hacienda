"use client";

import { useEffect, useState, useRef } from 'react';

export default function AnimatedBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });
  
  // Referencias para los elementos animados
  const elementsRef = useRef([]);
  
  // Inicializar valores en el cliente
  useEffect(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);
  
  // Actualizar posición del ratón y tamaño de ventana
  useEffect(() => {
    // Manejar evento de movimiento del ratón
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    // Manejar evento de cambio de tamaño de ventana
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    // Escuchar eventos
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    
    // Ejecutar handler de resize inmediatamente
    handleResize();
    
    // Limpiar event listeners
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Configuración de los elementos decorativos
  const decorativeElements = [
    // Sellos decorativos
    {
      type: 'selo',
      position: { x: '5%', y: '15%' },
      size: 180,
      rotation: 15,
      moveFactorX: 0.02,
      moveFactorY: 0.01,
      rotateOnMove: true,
      color: 'var(--color-primary)',
      opacity: 0.08
    },
    {
      type: 'selo', 
      position: { x: '85%', y: '75%' },
      size: 160,
      rotation: -20,
      moveFactorX: -0.015,
      moveFactorY: 0.025,
      rotateOnMove: true,
      color: 'var(--color-primary)',
      opacity: 0.06
    },
    {
      type: 'selo', 
      position: { x: '92%', y: '25%' },
      size: 110,
      rotation: 35,
      moveFactorX: -0.03,
      moveFactorY: 0.015,
      rotateOnMove: true,
      color: 'var(--color-primary)',
      opacity: 0.05
    },
    {
      type: 'selo', 
      position: { x: '20%', y: '90%' },
      size: 130,
      rotation: -10,
      moveFactorX: 0.025,
      moveFactorY: -0.01,
      rotateOnMove: true,
      color: 'var(--color-primary)',
      opacity: 0.07
    },
    
    // Rectángulos (invitaciones/sobres)
    {
      type: 'rect',
      position: { x: '75%', y: '15%' },
      width: 140,
      height: 100,
      rotation: 25,
      moveFactorX: -0.01,
      moveFactorY: -0.02,
      color: 'var(--color-primary)',
      opacity: 0.05,
      border: true
    },
    {
      type: 'rect',
      position: { x: '15%', y: '60%' },
      width: 120,
      height: 90,
      rotation: -15,
      moveFactorX: 0.015,
      moveFactorY: -0.01,
      color: 'var(--color-primary)',
      opacity: 0.07,
      border: true
    },
    {
      type: 'rect',
      position: { x: '60%', y: '85%' },
      width: 110,
      height: 80,
      rotation: 8,
      moveFactorX: -0.018,
      moveFactorY: 0.022,
      color: 'var(--color-primary)',
      opacity: 0.045,
      border: true
    },
    
    // Círculos decorativos
    {
      type: 'circle',
      position: { x: '50%', y: '30%' },
      size: 200,
      moveFactorX: -0.005,
      moveFactorY: 0.005,
      color: 'var(--color-primary)',
      opacity: 0.04,
      dashed: true
    },
    {
      type: 'circle',
      position: { x: '80%', y: '50%' },
      size: 150,
      moveFactorX: 0.007,
      moveFactorY: -0.008,
      color: 'var(--color-primary)',
      opacity: 0.03,
      dashed: true
    },
    {
      type: 'circle',
      position: { x: '30%', y: '40%' },
      size: 180,
      moveFactorX: 0.009,
      moveFactorY: 0.006,
      color: 'var(--color-primary)',
      opacity: 0.035,
      dashed: true
    },
    
    // Elementos de diamante
    {
      type: 'diamond',
      position: { x: '40%', y: '70%' },
      size: 60,
      rotation: 0,
      moveFactorX: 0.012,
      moveFactorY: -0.009,
      color: 'var(--color-primary)',
      opacity: 0.06
    },
    {
      type: 'diamond',
      position: { x: '70%', y: '30%' },
      size: 70,
      rotation: 45,
      moveFactorX: -0.01,
      moveFactorY: 0.014,
      color: 'var(--color-primary)',
      opacity: 0.05
    }
  ];
  
  // Efecto para animar los elementos
  useEffect(() => {
    if (elementsRef.current.length === 0) return;
    
    decorativeElements.forEach((element, index) => {
      const el = elementsRef.current[index];
      if (!el) return;
      
      // Calcular movimiento basado en la posición del ratón
      const moveX = mousePosition.x * element.moveFactorX;
      const moveY = mousePosition.y * element.moveFactorY;
      
      // Aplicar transformación
      let transform = `translate(${moveX}px, ${moveY}px)`;
      
      // Añadir rotación si está habilitada
      if (element.rotateOnMove) {
        const rotateAmount = (moveX * 0.05);
        transform += ` rotate(${element.rotation + rotateAmount}deg)`;
      } else {
        transform += ` rotate(${element.rotation || 0}deg)`;
      }
      
      el.style.transform = transform;
    });
  }, [mousePosition, decorativeElements]);
  
  // Renderizar elementos decorativos
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {decorativeElements.map((element, index) => {
        // Posiciones en píxeles (convertir desde porcentajes)
        const x = (parseFloat(element.position.x) / 100) * windowSize.width;
        const y = (parseFloat(element.position.y) / 100) * windowSize.height;
        
        if (element.type === 'selo') {
          return (
            <div
              key={`selo-${index}`}
              ref={el => elementsRef.current[index] = el}
              className="absolute transition-transform duration-1000 ease-out"
              style={{
                left: x,
                top: y,
                width: element.size,
                height: element.size,
                transform: `rotate(${element.rotation}deg)`,
              }}
            >
              <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <circle cx="250" cy="250" r="240" fill="none" stroke={element.color} strokeWidth="5" strokeDasharray="5,10" opacity={element.opacity} />
                <circle cx="250" cy="250" r="220" fill="none" stroke={element.color} strokeWidth="2" opacity={element.opacity} />
                
                {/* Bordes dentados */}
                {Array.from({ length: 40 }).map((_, i) => {
                  const angle = (i * 9) * Math.PI / 180;
                  const r1 = 240;
                  const r2 = 260;
                  const x1 = 250 + r1 * Math.cos(angle);
                  const y1 = 250 + r1 * Math.sin(angle);
                  const x2 = 250 + r2 * Math.cos(angle);
                  const y2 = 250 + r2 * Math.sin(angle);
                  return (
                    <line 
                      key={i} 
                      x1={x1} 
                      y1={y1} 
                      x2={x2} 
                      y2={y2} 
                      stroke={element.color}
                      strokeWidth="2" 
                      opacity={element.opacity} 
                    />
                  );
                })}
                
                {/* Texto circular */}
                <path id={`textCircle-${index}`} d="M 250,100 A 150,150 0 0 1 250,400 A 150,150 0 0 1 250,100" fill="none" />
                <text>
                  <textPath xlinkHref={`#textCircle-${index}`} startOffset="0%" textAnchor="middle" className="text-xs tracking-widest font-serif" fill={element.color} opacity={element.opacity}>
                    • HACIENDA SAN CARLOS • BODAS • EVENTOS •
                  </textPath>
                </text>
              </svg>
            </div>
          );
        }
        
        if (element.type === 'rect') {
          return (
            <div
              key={`rect-${index}`}
              ref={el => elementsRef.current[index] = el}
              className="absolute transition-transform duration-1000 ease-out"
              style={{
                left: x,
                top: y,
                width: element.width,
                height: element.height,
                transform: `rotate(${element.rotation}deg)`,
              }}
            >
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <rect
                  x="5"
                  y="5"
                  width="90"
                  height="90"
                  fill="none"
                  stroke={element.color}
                  strokeWidth={element.border ? "2" : "0"}
                  opacity={element.opacity}
                  rx="3"
                />
                {element.border && (
                  <>
                    <line x1="20" y1="30" x2="80" y2="30" stroke={element.color} strokeWidth="1" opacity={element.opacity * 0.8} />
                    <line x1="20" y1="50" x2="80" y2="50" stroke={element.color} strokeWidth="1" opacity={element.opacity * 0.8} />
                    <line x1="20" y1="70" x2="80" y2="70" stroke={element.color} strokeWidth="1" opacity={element.opacity * 0.8} />
                  </>
                )}
              </svg>
            </div>
          );
        }
        
        if (element.type === 'circle') {
          return (
            <div
              key={`circle-${index}`}
              ref={el => elementsRef.current[index] = el}
              className="absolute transition-transform duration-1000 ease-out"
              style={{
                left: x,
                top: y,
                width: element.size,
                height: element.size,
                transform: `rotate(${element.rotation || 0}deg)`,
              }}
            >
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={element.color}
                  strokeWidth="1"
                  strokeDasharray={element.dashed ? "4,4" : "none"}
                  opacity={element.opacity}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="30"
                  fill="none"
                  stroke={element.color}
                  strokeWidth="0.5"
                  strokeDasharray={element.dashed ? "3,3" : "none"}
                  opacity={element.opacity * 0.8}
                />
              </svg>
            </div>
          );
        }
        
        if (element.type === 'diamond') {
          return (
            <div
              key={`diamond-${index}`}
              ref={el => elementsRef.current[index] = el}
              className="absolute transition-transform duration-1000 ease-out"
              style={{
                left: x,
                top: y,
                width: element.size,
                height: element.size,
                transform: `rotate(${element.rotation}deg)`,
              }}
            >
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <rect
                  x="10"
                  y="10"
                  width="80"
                  height="80"
                  fill="none" 
                  stroke={element.color}
                  strokeWidth="1"
                  opacity={element.opacity}
                  transform="rotate(45, 50, 50)"
                />
                <rect
                  x="20"
                  y="20"
                  width="60"
                  height="60"
                  fill="none" 
                  stroke={element.color}
                  strokeWidth="0.7"
                  opacity={element.opacity * 0.8}
                  transform="rotate(45, 50, 50)"
                />
              </svg>
            </div>
          );
        }
        
        return null;
      })}
    </div>
  );
} 