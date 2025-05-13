"use client";

import { useEffect, useRef, useCallback } from 'react';

export default function AnimatedBackground() {
  // Use a ref for mouse position instead of state to avoid re-renders on every mouse move
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const windowSizeRef = useRef({
    width: 0,
    height: 0,
  });
  
  // Referencias para los elementos animados
  const elementsRef = useRef([]);
  
  // Configuración de los elementos decorativos
  const decorativeElements = [
    // Sellos decorativos
    {
      type: 'selo',
      position: { x: '10%', y: '15%' },
      size: 260,
      rotation: 15,
      moveFactorX: 0.03,
      moveFactorY: 0.02,
      rotateOnMove: true,
      color: 'var(--color-primary)',
      opacity: 0.15
    },
    {
      type: 'selo', 
      position: { x: '85%', y: '75%' },
      size: 220,
      rotation: -20,
      moveFactorX: -0.025,
      moveFactorY: 0.035,
      rotateOnMove: true,
      color: 'var(--color-primary)',
      opacity: 0.13
    },
    {
      type: 'selo', 
      position: { x: '90%', y: '25%' },
      size: 180,
      rotation: 35,
      moveFactorX: -0.03,
      moveFactorY: 0.015,
      rotateOnMove: true,
      color: 'var(--color-primary)',
      opacity: 0.12
    },
    {
      type: 'selo', 
      position: { x: '20%', y: '80%' },
      size: 200,
      rotation: -10,
      moveFactorX: 0.025,
      moveFactorY: -0.02,
      rotateOnMove: true,
      color: 'var(--color-primary)',
      opacity: 0.14
    },
    {
      type: 'selo', 
      position: { x: '50%', y: '50%' },
      size: 300,
      rotation: 25,
      moveFactorX: -0.01,
      moveFactorY: 0.01,
      rotateOnMove: true,
      color: 'var(--color-primary)',
      opacity: 0.08
    },
    // Rectángulos (invitaciones/sobres)
    {
      type: 'rect',
      position: { x: '75%', y: '15%' },
      width: 180,
      height: 140,
      rotation: 25,
      moveFactorX: -0.015,
      moveFactorY: -0.025,
      color: 'var(--color-primary)',
      opacity: 0.1,
      border: true
    },
    {
      type: 'rect',
      position: { x: '15%', y: '60%' },
      width: 160,
      height: 120,
      rotation: -15,
      moveFactorX: 0.02,
      moveFactorY: -0.015,
      color: 'var(--color-primary)',
      opacity: 0.12,
      border: true
    },
    {
      type: 'rect',
      position: { x: '60%', y: '85%' },
      width: 150,
      height: 120,
      rotation: 8,
      moveFactorX: -0.02,
      moveFactorY: 0.025,
      color: 'var(--color-primary)',
      opacity: 0.09,
      border: true
    },
    {
      type: 'rect',
      position: { x: '35%', y: '25%' },
      width: 170,
      height: 130,
      rotation: 12,
      moveFactorX: 0.018,
      moveFactorY: 0.012,
      color: 'var(--color-primary)',
      opacity: 0.11,
      border: true
    },
    // Círculos decorativos
    {
      type: 'circle',
      position: { x: '50%', y: '30%' },
      size: 250,
      moveFactorX: -0.01,
      moveFactorY: 0.01,
      color: 'var(--color-primary)',
      opacity: 0.09,
      dashed: true
    },
    {
      type: 'circle',
      position: { x: '80%', y: '50%' },
      size: 200,
      moveFactorX: 0.012,
      moveFactorY: -0.015,
      color: 'var(--color-primary)',
      opacity: 0.08,
      dashed: true
    },
    {
      type: 'circle',
      position: { x: '30%', y: '40%' },
      size: 220,
      moveFactorX: 0.015,
      moveFactorY: 0.01,
      color: 'var(--color-primary)',
      opacity: 0.085,
      dashed: true
    },
    {
      type: 'circle',
      position: { x: '25%', y: '70%' },
      size: 180,
      moveFactorX: -0.008,
      moveFactorY: -0.01,
      color: 'var(--color-primary)',
      opacity: 0.075,
      dashed: true
    },
    // Elementos de diamante
    {
      type: 'diamond',
      position: { x: '40%', y: '70%' },
      size: 100,
      rotation: 0,
      moveFactorX: 0.018,
      moveFactorY: -0.012,
      color: 'var(--color-primary)',
      opacity: 0.1
    },
    {
      type: 'diamond',
      position: { x: '70%', y: '30%' },
      size: 120,
      rotation: 45,
      moveFactorX: -0.015,
      moveFactorY: 0.02,
      color: 'var(--color-primary)',
      opacity: 0.11
    },
    {
      type: 'diamond',
      position: { x: '20%', y: '40%' },
      size: 90,
      rotation: 22,
      moveFactorX: 0.01,
      moveFactorY: 0.015,
      color: 'var(--color-primary)',
      opacity: 0.095
    }
  ];
  
  // Inicializar valores en el cliente
  useEffect(() => {
    windowSizeRef.current = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }, []);
  
  // Define handlers with useCallback to prevent recreating functions on each render
  const handleMouseMove = useCallback((e) => {
    // Update ref instead of state - no re-render triggered
    mousePositionRef.current = { x: e.clientX, y: e.clientY };
    
    // Apply the movement effect directly to elements
    elementsRef.current.forEach((el, index) => {
      if (el && decorativeElements[index]) {
        const element = decorativeElements[index];
        const moveX = (mousePositionRef.current.x - (windowSizeRef.current.width / 2)) * element.moveFactorX;
        const moveY = (mousePositionRef.current.y - (windowSizeRef.current.height / 2)) * element.moveFactorY;
        
        let rotation = element.rotation || 0;
        if (element.rotateOnMove) {
          rotation += (moveX + moveY) * 0.05;
        }
        
        el.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${rotation}deg)`;
      }
    });
  }, []);
  
  // Handle resize event
  const handleResize = useCallback(() => {
    windowSizeRef.current = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }, []);
  
  // Setup event listeners
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    
    // Execute resize handler immediately
    handleResize();
    
    // Cleanup event listeners
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [handleMouseMove, handleResize]);
  
  // Renderizar elementos decorativos
  return (
    <div className="fixed inset-0 w-full h-full z-[-1] pointer-events-none overflow-hidden">
      {decorativeElements.map((element, index) => {
        // Calcular posición base en porcentajes (solo la posición inicial)
        const baseX = parseFloat(element.position.x) / 100 * windowSizeRef.current.width;
        const baseY = parseFloat(element.position.y) / 100 * windowSizeRef.current.height;
        
        // Posición inicial (el movimiento será aplicado por el event handler)
        const x = `${baseX}px`;
        const y = `${baseY}px`;
        
        // Rotación inicial (el movimiento de rotación será aplicado por el event handler si es necesario)
        const initialRotation = element.rotation || 0;
        
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
                transform: `rotate(${initialRotation}deg)`,
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
                  const x1 = Math.round((250 + r1 * Math.cos(angle)) * 100) / 100;
                  const y1 = Math.round((250 + r1 * Math.sin(angle)) * 100) / 100;
                  const x2 = Math.round((250 + r2 * Math.cos(angle)) * 100) / 100;
                  const y2 = Math.round((250 + r2 * Math.sin(angle)) * 100) / 100;
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
                transform: `rotate(${initialRotation}deg)`,
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
                    <line x1="20" y1="30" x2="80" y2="30" stroke={element.color} strokeWidth="1" opacity={element.opacity * 0.9} />
                    <line x1="20" y1="50" x2="80" y2="50" stroke={element.color} strokeWidth="1" opacity={element.opacity * 0.9} />
                    <line x1="20" y1="70" x2="80" y2="70" stroke={element.color} strokeWidth="1" opacity={element.opacity * 0.9} />
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
                transform: `rotate(${initialRotation}deg)`,
              }}
            >
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={element.color}
                  strokeWidth="1.5"
                  strokeDasharray={element.dashed ? "4,4" : "none"}
                  opacity={element.opacity}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="30"
                  fill="none"
                  stroke={element.color}
                  strokeWidth="1"
                  strokeDasharray={element.dashed ? "3,3" : "none"}
                  opacity={element.opacity * 0.9}
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
                transform: `rotate(${initialRotation}deg)`,
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
                  strokeWidth="1.5"
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
                  strokeWidth="1"
                  opacity={element.opacity * 0.9}
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
