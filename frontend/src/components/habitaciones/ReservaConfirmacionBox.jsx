"use client";

import React from 'react';
import { FaCheckCircle, FaBed, FaCalendarAlt, FaHashtag, FaEuroSign } from 'react-icons/fa';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Función auxiliar para formatear fecha si no está ya formateada
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    // Intentar crear fecha, puede ser string ISO o ya Date
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Si no es válida, devolver original
    // Formatear a 'dd MMM yyyy' (ej. 15 May 2025)
    return format(date, 'dd MMM yyyy', { locale: es });
  } catch (e) {
    console.error("Error formateando fecha:", dateString, e);
    return dateString; // Devolver original en caso de error
  }
};

const ReservaConfirmacionBox = ({ reservations = [] }) => {
  if (!reservations || reservations.length === 0) {
    return null; // No renderizar si no hay datos
  }

  return (
    <div className="mt-10 p-6 md:p-8 bg-green-50 border-l-4 border-green-500 rounded-r-lg shadow-lg animate-fadeIn">
      <div className="flex items-center mb-4">
        <FaCheckCircle className="text-3xl text-green-600 mr-3" />
        <h3 className="text-2xl font-semibold text-green-800 font-[var(--font-display)]">
          ¡Reserva Confirmada con Éxito!
        </h3>
      </div>
      <p className="text-green-700 mb-6">
        Gracias por elegir Hacienda San Carlos Borromeo. Hemos recibido tu solicitud de reserva. Recibirás un correo electrónico con todos los detalles y los próximos pasos según tu método de pago seleccionado.
      </p>

      {/* Detalles de cada reserva */}
      <div className="space-y-4">
        {reservations.map((reserva, index) => (
          <div key={reserva._id || index} className="p-4 bg-white rounded-md border border-green-200 shadow-sm">
            <h4 className="text-lg font-semibold text-[var(--color-primary-dark)] mb-3 flex items-center">
              <FaBed className="mr-2" /> Habitación {reserva.letraHabitacion || reserva.habitacion || 'N/A'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700">
              <div className="flex items-center">
                <FaCalendarAlt className="mr-2 text-gray-500" />
                <span>Fechas:</span>
                <strong className="ml-1">{formatDate(reserva.fechaEntrada)} - {formatDate(reserva.fechaSalida)}</strong>
              </div>
              <div className="flex items-center">
                <FaHashtag className="mr-2 text-gray-500" />
                <span>Confirmación #:</span>
                <strong className="ml-1">{reserva.numeroConfirmacion || 'Pendiente'}</strong>
              </div>
              <div className="flex items-center">
                <FaEuroSign className="mr-2 text-gray-500" />
                <span>Precio Total:</span>
                <strong className="ml-1">${reserva.precio ? reserva.precio.toFixed(2) : 'N/A'} MXN</strong>
              </div>
               {/* Puedes añadir más detalles si son relevantes y están disponibles */}
               {/* <p><strong>Método Pago:</strong> {reserva.metodoPago || 'N/A'}</p> */}
               {/* <p><strong>Estado Pago:</strong> {reserva.estadoPago || 'N/A'}</p> */}
            </div>
          </div>
        ))}
      </div>

       <p className="mt-6 text-sm text-gray-600">
         Si tienes alguna pregunta, no dudes en <a href="/contacto" className="text-[var(--color-primary)] hover:underline font-medium">contactarnos</a>.
       </p>
    </div>
  );
};

// Añadir una animación simple de fadeIn (requiere configuración en tailwind.config.js si no existe)
// Ejemplo para tailwind.config.js (dentro de theme.extend.keyframes y theme.extend.animation):
// keyframes: { fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } } },
// animation: { fadeIn: 'fadeIn 0.5s ease-out forwards' }

export default ReservaConfirmacionBox; 