'use client';

import React, { useState, useEffect } from 'react';
import { useReservation } from '@/context/ReservationContext';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaUsers, FaBed, FaUtensils, FaCheck, FaInfoCircle } from 'react-icons/fa';
import Image from 'next/image';

const ResumenReserva = ({ onConfirm, loading }) => {
  const { formData } = useReservation();
  const [subtotal, setSubtotal] = useState({ base: 0, servicios: 0, habitaciones: 0, total: 0 });
  const [showPriceDetails, setShowPriceDetails] = useState(true);

  // Calcular el subtotal cuando cambian los datos del formulario
  useEffect(() => {
    calcularSubtotal();
  }, [formData]);

  const calcularSubtotal = () => {
    // Valores base según tipo de evento (estimados)
    const precioBaseEvento = {
      'boda': 15000,
      'corporativo': 8000,
      'social': 10000,
      'otro': 9000
    };

    // Precio base según tipo de evento seleccionado
    const tipoEvento = formData.selectedTipoEvento?.titulo?.toLowerCase();
    const precioBase = tipoEvento ? (precioBaseEvento[tipoEvento] || 8000) : 0;

    // Calcular precio de servicios
    let precioServicios = 0;
    if (Array.isArray(formData.serviciosSeleccionados)) {
      formData.serviciosSeleccionados.forEach(servicio => {
        // Extraer valor numérico de strings como "Desde €450"
        if (typeof servicio.precio === 'string') {
          const numeroPrecio = parseFloat(servicio.precio.replace(/[^\d.,]/g, '').replace(',', '.'));
          if (!isNaN(numeroPrecio)) {
            precioServicios += numeroPrecio;
          }
        } 
        // O usar valor por defecto si no se puede extraer
        else {
          precioServicios += 500; // Valor por defecto
        }
      });
    }

    // Calcular precio de habitaciones (si hay)
    let precioHabitaciones = 0;
    if (Array.isArray(formData.habitacionesSeleccionadas)) {
      // Multiplicamos por días si tenemos fecha inicio y fin
      const diasEstancia = formData.fechaFin && formData.fecha 
        ? Math.max(1, Math.ceil((new Date(formData.fechaFin) - new Date(formData.fecha)) / (1000 * 60 * 60 * 24)))
        : 1;
        
      formData.habitacionesSeleccionadas.forEach(habitacion => {
        const precioPorNoche = habitacion.precioPorNoche || habitacion.precio || 2400;
        const numeroPrecio = typeof precioPorNoche === 'string' 
          ? parseFloat(precioPorNoche.replace(/[^\d.,]/g, '').replace(',', '.'))
          : precioPorNoche;
          
        if (!isNaN(numeroPrecio)) {
          precioHabitaciones += numeroPrecio * diasEstancia;
        }
      });
    }

    // Calculamos el total
    const total = precioBase + precioServicios + precioHabitaciones;

    // Actualizamos el estado
    setSubtotal({
      base: precioBase,
      servicios: precioServicios,
      habitaciones: precioHabitaciones,
      total: total
    });
  };

  // Formatear precio con separadores de miles
  const formatPrice = (price) => {
    return price.toLocaleString('es-ES') + '€';
  };

  // Formatear fecha
  const formatFecha = (fecha) => {
    if (!fecha) return 'No especificada';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-lg overflow-hidden border border-[#E6DCC6]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Encabezado */}
      <div className="bg-gradient-to-r from-[#E6DCC6] to-[#D1B59B] px-6 py-4">
        <h2 className="text-2xl font-bold text-[#6D4C41]">Resumen de su Reserva</h2>
        <p className="text-[#8A6E52]">Por favor, revise los detalles antes de confirmar</p>
      </div>

      {/* Contenido */}
      <div className="px-6 py-4">
        {/* Información del evento */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-[#6D4C41] flex items-center">
            <FaCalendarAlt className="mr-2 text-[#A5856A]" />
            Detalles del Evento
          </h3>
          <div className="bg-[#F8F5F0] p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Tipo de Evento</p>
                <p className="font-medium">{formData.selectedTipoEvento?.titulo || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha</p>
                <p className="font-medium">{formatFecha(formData.fecha)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Modo de Reserva</p>
                <p className="font-medium">{formData.modoReserva === 'hacienda' ? 'Hacienda Completa' : 'Evento'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Número de Invitados</p>
                <p className="font-medium">{formData.numeroInvitados || 'No especificado'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Servicios seleccionados */}
        {formData.serviciosSeleccionados && formData.serviciosSeleccionados.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3 text-[#6D4C41] flex items-center">
              <FaUtensils className="mr-2 text-[#A5856A]" />
              Servicios Seleccionados
            </h3>
            <div className="bg-[#F8F5F0] p-4 rounded-lg">
              <ul className="space-y-2">
                {formData.serviciosSeleccionados.map((servicio, index) => (
                  <li key={index} className="flex justify-between items-center border-b border-[#E6DCC6] pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center">
                      <FaCheck className="text-green-500 mr-2" />
                      <span>{servicio.nombre}</span>
                    </div>
                    {showPriceDetails && (
                      <span className="text-[#8A6E52] font-medium">{servicio.precio}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Habitaciones seleccionadas */}
        {formData.habitacionesSeleccionadas && formData.habitacionesSeleccionadas.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3 text-[#6D4C41] flex items-center">
              <FaBed className="mr-2 text-[#A5856A]" />
              Habitaciones Seleccionadas
            </h3>
            <div className="bg-[#F8F5F0] p-4 rounded-lg">
              <ul className="space-y-4">
                {formData.habitacionesSeleccionadas.map((habitacion, index) => (
                  <li key={index} className="flex justify-between items-center border-b border-[#E6DCC6] pb-3 last:border-0 last:pb-0">
                    <div className="flex items-start">
                      <div className="h-16 w-16 relative rounded-md overflow-hidden mr-3 border border-[#D1B59B]">
                        {habitacion.imagen ? (
                          <Image 
                            src={habitacion.imagen} 
                            alt={habitacion.nombre}
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="h-full w-full bg-[#E6DCC6] flex items-center justify-center">
                            <FaBed className="text-[#A5856A] text-2xl" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{habitacion.nombre}</p>
                        <p className="text-sm text-gray-500">
                          {habitacion.tipoHabitacion} • Capacidad: {habitacion.capacidad} personas
                        </p>
                      </div>
                    </div>
                    {showPriceDetails && (
                      <span className="text-xs font-medium text-[#6D4C41] bg-[#E6DCC6] px-2 py-0.5 rounded-full">
                        {habitacion.tipo || 'Estándar'}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Resumen de precio */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-[#6D4C41] flex items-center">
            <FaInfoCircle className="mr-2 text-[#A5856A]" />
            Resumen de Precio
          </h3>
          <div className="bg-[#F8F5F0] p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Precio base estimado:</span>
                <span>{formatPrice(subtotal.base)}</span>
              </div>
              
              {subtotal.servicios > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Servicios seleccionados:</span>
                  <span>{formatPrice(subtotal.servicios)}</span>
                </div>
              )}
              
              {subtotal.habitaciones > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Habitaciones:</span>
                  <span>{formatPrice(subtotal.habitaciones)}</span>
                </div>
              )}
              
              {/* Línea divisoria */}
              <div className="border-t border-gray-300 pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total estimado:</span>
                  <span className="text-[#8A6E52]">{formatPrice(subtotal.total)}</span>
                </div>
              </div>
              
              {/* Mensaje informativo */}
              <div className="mt-3 text-sm text-gray-500 flex items-start">
                <FaInfoCircle className="mr-1 mt-0.5 flex-shrink-0 text-[#A5856A]" />
                <span>
                  Este es un precio estimado. Se aplicarán los precios vigentes al momento de 
                  la confirmación. Para cambios o preguntas, contacte directamente con nosotros.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4 mt-6">
          <button 
            className="px-4 py-2 border border-[#A5856A] text-[#A5856A] rounded hover:bg-[#F8F5F0] transition-colors"
            onClick={() => setShowPriceDetails(!showPriceDetails)}
          >
            {showPriceDetails ? 'Ocultar detalles de precio' : 'Mostrar detalles de precio'}
          </button>
          <button 
            className="px-6 py-2 bg-gradient-to-r from-[#A5856A] to-[#8A6E52] text-white rounded-md hover:from-[#8A6E52] hover:to-[#6D4C41] transition-colors shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </>
            ) : (
              'Confirmar Reserva'
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ResumenReserva;
