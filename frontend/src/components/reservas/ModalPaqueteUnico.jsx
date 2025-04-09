"use client";

import React, { useEffect, useState } from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

/**
 * Modal que se muestra cuando el usuario intenta seleccionar más de un paquete a la vez
 */
const ModalPaqueteUnico = ({ isOpen, onClose }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  
  useEffect(() => {
    if (isOpen) {
      // Capturar la posición actual de desplazamiento cuando se abre el modal
      setScrollPosition(window.scrollY);
    }
  }, [isOpen]);
  
  if (!isOpen) return null;

  // Calcular el estilo para posicionar el modal en la posición actual
  const modalStyle = {
    top: `${scrollPosition + 100}px`, // 100px debajo de la posición actual de desplazamiento
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden transform transition-all mt-4"
        style={modalStyle}>
        <div className="absolute top-0 right-0 pt-4 pr-4">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <FaExclamationTriangle className="text-amber-600" size={24} />
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-[#0F0F0F] text-center mb-4">
            Solo un paquete permitido
          </h3>
          
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-2">
              Solo puede seleccionar un paquete de evento a la vez.
            </p>
            <p className="text-gray-600">
              Por favor, deseleccione el paquete actual antes de seleccionar otro.
            </p>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-[#A5856A] to-[#D1B59B] text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalPaqueteUnico;
