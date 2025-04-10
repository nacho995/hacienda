"use client";

import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

/**
 * Modal que se muestra cuando el usuario intenta seleccionar más de un paquete a la vez
 */
const ModalPaqueteUnico = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
            <FaExclamationTriangle className="text-yellow-500 text-xl" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Selección de Paquete</h2>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Solo puede seleccionar un paquete a la vez. Si desea cambiar de paquete, primero debe deseleccionar el paquete actual.
          </p>
          <p className="text-sm text-gray-600 italic">
            Los paquetes incluyen una selección predefinida de servicios y no pueden combinarse entre sí.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalPaqueteUnico;
