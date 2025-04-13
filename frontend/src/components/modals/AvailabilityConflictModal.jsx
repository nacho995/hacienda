"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle } from 'react-icons/fa';

const AvailabilityConflictModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
          onClick={onClose} // Close modal on backdrop click
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border-t-4 border-red-500"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <div className="flex items-center justify-center mb-4">
              <FaExclamationTriangle className="text-4xl text-red-500" />
            </div>

            <h2 className="text-xl font-semibold text-center text-gray-800 mb-3">
              Conflicto de Disponibilidad
            </h2>

            <p className="text-center text-gray-600 mb-6">
              {message || 'Lo sentimos, las fechas o habitaciones seleccionadas ya no están disponibles. Por favor, revisa el calendario e intenta nuevamente.'}
            </p>

            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Entendido
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AvailabilityConflictModal;