// frontend/src/components/modals/ReservationSuccessModal.jsx
"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaBed, FaCalendarAlt, FaEuroSign, FaHashtag } from 'react-icons/fa';

// Helper function to format dates
const formatDate = (dateInput) => {
  if (!dateInput) return 'N/A';
  try {
    const date = new Date(dateInput);
    // Add time zone offset to prevent date shifting issues in different browsers/systems
    const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    if (isNaN(adjustedDate.getTime())) {
      console.warn("Invalid date format received for success modal:", dateInput);
      // Return the original string if it cannot be parsed, might be helpful for debugging
      return dateInput.toString();
    }
    return adjustedDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) {
    console.error("Error formatting date in success modal:", e);
    return 'Error fecha';
  }
};


export default function ReservationSuccessModal({ isOpen, onClose, reservationDetails = [] }) {
  // Don't render if not open or if details are missing/not an array
  if (!isOpen || !Array.isArray(reservationDetails) || reservationDetails.length === 0) {
    return null;
  }

  // Calculate total price from the details array
  const totalPrice = reservationDetails.reduce((sum, res) => sum + (res.precio || 0), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 backdrop-blur-sm" // Increased z-index
          onClick={onClose} // Allow closing by clicking the backdrop
        >
          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, y: -20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-2xl p-6 md:p-8 max-w-lg w-full text-gray-800 relative border border-[var(--color-primary-light)] overflow-hidden"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
          >
            {/* Close Button (Top Right) */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-[var(--color-primary)] transition-colors"
              aria-label="Cerrar modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* Header Section */}
            <div className="text-center mb-6">
              <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4 animate-pulse" />
              <h2 className="text-2xl font-semibold text-[var(--color-primary-dark)]" style={{ fontFamily: 'var(--font-display)' }}>¡Reserva Confirmada!</h2>
              <p className="text-gray-600 mt-2">Sus habitaciones han sido reservadas con éxito.</p>
              <p className="text-sm text-gray-500 mt-1">Recibirá un email con los detalles.</p>
            </div>

            {/* Scrollable Reservation Details Section */}
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 -mr-2 custom-scrollbar border-t border-b border-gray-200 py-4 my-4">
              {reservationDetails.map((res, index) => (
                <div key={res._id || index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-lg mb-2 text-[var(--color-primary)] flex items-center">
                    <FaBed className="mr-2 flex-shrink-0" /> Habitación {res.habitacion || 'N/A'}
                  </h4>
                  <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm text-gray-700 items-center">
                    {/* Confirmation Number */}
                    {res.numeroConfirmacion && (
                      <>
                        <div className="flex items-center font-medium text-gray-600">
                            <FaHashtag className="mr-1.5 text-gray-400" />
                            <span>Confirmación:</span>
                        </div>
                        <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded break-all">{res.numeroConfirmacion}</span>
                      </>
                    )}
                    {/* Check-in Date */}
                    <div className="flex items-center font-medium text-gray-600">
                      <FaCalendarAlt className="mr-1.5 text-gray-400" />
                      <span>Entrada:</span>
                    </div>
                    <span className="font-medium">{formatDate(res.fechaEntrada)}</span>
                    {/* Check-out Date */}
                    <div className="flex items-center font-medium text-gray-600">
                      <FaCalendarAlt className="mr-1.5 text-gray-400" />
                      <span>Salida:</span>
                    </div>
                    <span className="font-medium">{formatDate(res.fechaSalida)}</span>
                    {/* Price */}
                    <div className="flex items-center font-medium text-gray-600">
                      <FaEuroSign className="mr-1.5 text-gray-400" />
                      <span>Precio:</span>
                    </div>
                    <span className="font-semibold text-[var(--color-secondary)]">{res.precio?.toFixed(2) ?? '0.00'} €</span>
                  </div>
                </div>
              ))}
            </div>

             {/* Total Price (Displayed if more than one reservation or if needed) */}
             {totalPrice > 0 && reservationDetails.length > 1 && (
                <div className="text-right mt-4 pt-4">
                    <p className="text-lg font-semibold text-gray-800">Precio Total:
                        <span className="ml-2 text-[var(--color-primary-dark)] font-bold">{totalPrice.toFixed(2)} €</span>
                    </p>
                </div>
             )}

            {/* Action Button (Close) */}
            <button
              onClick={onClose}
              className="mt-6 w-full inline-flex justify-center rounded-lg border border-transparent shadow-lg px-6 py-3 bg-[var(--color-primary)] text-base font-medium text-white hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] sm:text-lg transition-all duration-300 transform hover:scale-[1.02]"
            >
              Entendido
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Basic CSS for custom scrollbar (optional, place in a global CSS file or use Tailwind plugins)
/*
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}
*/