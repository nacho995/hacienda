'use client';

import React, { useState, useEffect } from 'react';
import { useReservation } from '@/context/ReservationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaReceipt, FaInfoCircle, FaPrint, FaFileDownload, FaTimes, FaBed, FaUtensils, FaUsers, FaCalendarAlt, FaAngleRight, FaAngleDown } from 'react-icons/fa';
import { MdKeyboardArrowRight, MdKeyboardArrowLeft, MdClose } from 'react-icons/md';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

const ReciboReservaGlobal = () => {
  const { formData } = useReservation();
  const [isMinimized, setIsMinimized] = useState(true);
  const [subtotal, setSubtotal] = useState({ base: 0, servicios: 0, habitaciones: 0, total: 0 });
  const [shouldPulse, setShouldPulse] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [detalleHabitaciones, setDetalleHabitaciones] = useState(false);
  const [detalleServicios, setDetalleServicios] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(null); // 'habitaciones' o 'servicios'

  useEffect(() => {
    calcularSubtotal();
    
    // Actualizar el timestamp para las animaciones
    setLastUpdated(Date.now());
    
    // Activar pulso en la pestaña minimizada para llamar la atención cuando cambia el precio
    if (isMinimized) {
      setShouldPulse(true);
      const timer = setTimeout(() => setShouldPulse(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [formData, isMinimized]);

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

    // Calcular precio de servicios (sumamos valores de referencia)
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
  
  // Funciones para minimizar/maximizar el panel
  const handleMinimize = () => setIsMinimized(true);
  const handleMaximize = () => setIsMinimized(false);

  // Formatear precio con separadores de miles
  const formatPrice = (price) => {
    return price.toLocaleString('es-ES') + '€';
  };

  return (
    <div className={`fixed top-0 right-0 h-full ${isMinimized ? 'w-14' : 'w-80'} transition-all duration-300 ease-in-out shadow-xl z-50 flex items-stretch`}>
      {/* Panel minimizado (tab lateral) */}
      {isMinimized && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            scale: shouldPulse ? [1, 1.05, 1] : 1
          }}
          transition={{ duration: 0.3 }}
          className="w-full flex flex-col justify-between cursor-pointer"
          onClick={handleMaximize}
        >
          {/* Tab superior - icono de recibo */}
          <div className="h-24 w-14 flex flex-col items-center justify-center bg-gradient-to-b from-[#A5856A] to-[#8A6E52] text-white rounded-bl-lg overflow-hidden shadow-md">
            <div className="relative">
              <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-white/10 animate-pulse delay-300"></div>
              <FaReceipt size={22} className="relative z-10" />
            </div>
            <span className="text-xs font-medium mt-2">Recibo</span>
          </div>
          
          {/* Cuerpo con diseño más elegante */}
          <div className="flex-grow w-full bg-[#E6DCC6]/30 flex flex-col items-center justify-center">
            {subtotal.total > 0 && (
              <div className="my-3 w-8 h-8 rounded-full flex items-center justify-center">
                <div className={`w-2 h-2 rounded-full ${shouldPulse ? 'bg-[#A5856A] animate-ping' : 'bg-[#A5856A]/50'}`}></div>
              </div>
            )}
            <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-[#A5856A]/30 to-transparent"></div>
          </div>
          
          {/* Tab inferior - precio total */}
          <div className="h-auto w-14 py-4 flex flex-col items-center justify-center bg-gradient-to-b from-[#A5856A] to-[#8A6E52] text-white rounded-tl-lg overflow-hidden shadow-md relative">
            <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            <div className="text-xs font-medium mb-1 uppercase tracking-wider">Total</div>
            <div className="text-sm font-bold whitespace-nowrap">
              {formatPrice(subtotal.total)}
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Panel Principal - Visible cuando NO está minimizado */}
      {!isMinimized && (
        <motion.div 
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 80 }}
          transition={{ duration: 0.3 }}
          className="flex-1 bg-white flex flex-col h-full overflow-hidden"
        >
          {/* Cabecera del Panel */}
          <div className="p-4 bg-gradient-to-r from-[#E6DCC6] to-[#D1B59B] flex justify-between items-center">
            <h3 className="font-medium text-[#6D4C41] text-lg flex items-center">
              <FaReceipt className="mr-2" />
              Mi Recibo
            </h3>
            <div className="flex items-center gap-2">
              <button 
                className="text-[#6D4C41] hover:text-[#8A6E52] transition-colors p-1 rounded-full hover:bg-white/20"
                title="Imprimir recibo"
                onClick={() => window.print()}
              >
                <FaPrint size={18} />
              </button>
              <button 
                onClick={handleMinimize}
                className="text-[#6D4C41] hover:text-[#8A6E52] transition-colors p-1 rounded-full hover:bg-white/20"
                aria-label="Minimizar panel"
              >
                <MdKeyboardArrowRight size={24} />
              </button>
            </div>
          </div>

          {/* Contenido del Panel */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {/* Resumen del evento */}
              <div className="border-b border-[#E6DCC6] pb-4 mb-4">
                <h4 className="font-bold text-[#6D4C41] mb-2">Detalles del Evento</h4>
                
                {formData.selectedTipoEvento && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Tipo de evento:</span>
                    <span className="text-sm font-medium">{formData.selectedTipoEvento.titulo}</span>
                  </div>
                )}
                
                {formData.fecha && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Fecha:</span>
                    <span className="text-sm font-medium">
                      {format(new Date(formData.fecha), 'dd MMMM yyyy', { locale: es })}
                    </span>
                  </div>
                )}
                
                {formData.modoReserva && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tipo de reserva:</span>
                    <span className="text-sm font-medium capitalize">
                      {formData.modoReserva === 'paquete' ? 'Todo incluido' : 'Hacienda'}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Elementos del recibo */}
              {subtotal.base > 0 && (
                <motion.div 
                  className="p-3 bg-[#F8F5F0] rounded-lg border border-[#E6DCC6]"
                  animate={{ 
                    scale: lastUpdated && formData.selectedTipoEvento ? [1, 1.02, 1] : 1 
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-medium text-[#8A6E52]">Precio base estimado</span>
                    <span className="text-xs font-medium text-[#6D4C41] bg-[#E6DCC6] px-2 py-0.5 rounded-full">
                      {formatPrice(subtotal.base)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    Evento tipo: {formData.selectedTipoEvento?.titulo || 'No seleccionado'}
                  </div>
                </motion.div>
              )}
              
              {subtotal.servicios > 0 && (
                <motion.div 
                  className="p-3 bg-[#F8F5F0] rounded-lg border border-[#E6DCC6]"
                  animate={{ 
                    scale: lastUpdated && formData.serviciosSeleccionados?.length > 0 ? [1, 1.02, 1] : 1 
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-medium text-[#8A6E52]">Servicios seleccionados</span>
                    <span className="text-xs font-medium text-[#6D4C41] bg-[#E6DCC6] px-2 py-0.5 rounded-full">
                      {formatPrice(subtotal.servicios)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 flex justify-between">
                    <span>{formData.serviciosSeleccionados?.length || 0} servicios añadidos</span>
                    {formData.serviciosSeleccionados?.length > 0 && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalDetalle('servicios');
                        }}
                        className="text-[#A5856A] hover:underline text-xs flex items-center"
                      >
                        Ver detalle <FaAngleRight size={12} className="ml-1" />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
              
              {subtotal.habitaciones > 0 && (
                <motion.div 
                  className="p-3 bg-[#F8F5F0] rounded-lg border border-[#E6DCC6]"
                  animate={{ 
                    scale: lastUpdated && formData.habitacionesSeleccionadas?.length > 0 ? [1, 1.02, 1] : 1 
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-medium text-[#8A6E52]">Habitaciones</span>
                    <span className="text-xs font-medium text-[#6D4C41] bg-[#E6DCC6] px-2 py-0.5 rounded-full">
                      {formatPrice(subtotal.habitaciones)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 flex justify-between">
                    <span>{formData.habitacionesSeleccionadas?.length || 0} habitaciones reservadas</span>
                    {formData.habitacionesSeleccionadas?.length > 0 && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalDetalle('habitaciones');
                        }}
                        className="text-[#A5856A] hover:underline text-xs flex items-center"
                      >
                        Ver detalle <FaAngleRight size={12} className="ml-1" />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
              
              {/* Mensaje informativo */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 flex items-start border border-gray-200">
                <FaInfoCircle className="mr-2 mt-0.5 flex-shrink-0 text-[#A5856A]" />
                <span>
                  Este recibo se actualiza automáticamente a medida que realizas selecciones en el proceso de reserva.
                </span>
              </div>
            </div>
          </div>
          
          {/* Panel Inferior con Totales */}
          <div className="border-t border-[#E6DCC6] p-4 bg-white">
            <div className="flex justify-between items-center mb-1 text-xs text-gray-500">
              <span>Subtotal:</span>
              <span>{formatPrice(subtotal.total)}</span>
            </div>
            
            <div className="flex justify-between items-center mb-3 text-xl font-bold text-[#6D4C41]">
              <span>Total Estimado:</span>
              <span>{formatPrice(subtotal.total)}</span>
            </div>
            
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-200 mb-3">
              <div className="flex">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#8A6E52] mr-1 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  Los precios mostrados son estimaciones basadas en sus selecciones y pueden variar según disponibilidad y temporada.
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Modal de detalles */}
      <AnimatePresence>
        {modalDetalle && (
          <motion.div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalDetalle(null)}
          >
            <motion.div 
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Cabecera del modal */}
              <div className="bg-gradient-to-r from-[#E6DCC6] to-[#D1B59B] p-4 flex justify-between items-center">
                <h3 className="font-medium text-[#6D4C41] text-lg flex items-center">
                  {modalDetalle === 'habitaciones' ? (
                    <>
                      <FaBed className="mr-2" /> Detalle de Habitaciones
                    </>
                  ) : (
                    <>
                      <FaUtensils className="mr-2" /> Detalle de Servicios
                    </>
                  )}
                </h3>
                <button 
                  onClick={() => setModalDetalle(null)}
                  className="text-[#6D4C41] hover:text-[#8A6E52] transition-colors rounded-full hover:bg-white/20 p-1"
                >
                  <MdClose size={24} />
                </button>
              </div>
              
              {/* Contenido del modal */}
              <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
                {modalDetalle === 'habitaciones' && (
                  <div className="space-y-4">
                    {formData.habitacionesSeleccionadas?.length > 0 ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {formData.habitacionesSeleccionadas.map((habitacion, index) => (
                            <div key={index} className="border border-[#E6DCC6] rounded-lg p-4 bg-[#F8F5F0]">
                              <div className="flex items-start">
                                <div className="w-10 h-10 rounded-full bg-[#A5856A] text-white flex items-center justify-center mr-3">
                                  <FaBed />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-[#6D4C41]">
                                    Habitación {habitacion.letra || habitacion.id || index + 1}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {habitacion.capacidad || 2} personas • {habitacion.tipo || 'Estándar'}
                                  </p>
                                  <div className="mt-2 pt-2 border-t border-[#E6DCC6]/50">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-gray-600">Precio por noche:</span>
                                      <span className="font-medium text-[#6D4C41]">
                                        {(habitacion.precioPorNoche || habitacion.precio || 2450).toLocaleString('es-ES')}€
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-6 p-4 bg-[#E6DCC6]/20 rounded-lg border border-[#E6DCC6]">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <FaCalendarAlt className="text-[#A5856A] mr-2" />
                              <span className="font-medium text-[#6D4C41]">
                                {formData.fecha && new Date(formData.fecha).toLocaleDateString('es-ES', { 
                                  day: 'numeric', month: 'long', year: 'numeric' 
                                })}
                                {formData.fechaFin && ` al ${new Date(formData.fechaFin).toLocaleDateString('es-ES', { 
                                  day: 'numeric', month: 'long', year: 'numeric' 
                                })}`}
                              </span>
                            </div>
                            <div className="font-bold text-[#6D4C41]">
                              {formatPrice(subtotal.habitaciones)}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <FaBed className="mx-auto h-12 w-12 text-gray-300" />
                        <p className="mt-2 text-gray-500">No hay habitaciones seleccionadas</p>
                      </div>
                    )}
                  </div>
                )}
                
                {modalDetalle === 'servicios' && (
                  <div className="space-y-4">
                    {formData.serviciosSeleccionados?.length > 0 ? (
                      <>
                        {formData.serviciosSeleccionados.map((servicio, index) => (
                          <div key={index} className="border border-[#E6DCC6] rounded-lg p-4 bg-[#F8F5F0] hover:shadow-md transition-shadow">
                            <div className="flex items-start">
                              <div className="w-10 h-10 rounded-full bg-[#A5856A] text-white flex items-center justify-center mr-3">
                                <FaUtensils />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-[#6D4C41]">{servicio.nombre}</h4>
                                <p className="text-sm text-gray-600 mt-1">{servicio.descripcion}</p>
                                
                                {servicio.caracteristicas && servicio.caracteristicas.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs text-gray-500 font-medium">Características:</p>
                                    <ul className="text-xs text-gray-600 mt-1 list-disc list-inside">
                                      {servicio.caracteristicas.map((item, i) => (
                                        <li key={i}>{item}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                <div className="mt-2 pt-2 border-t border-[#E6DCC6]/50 flex justify-between items-center">
                                  <span className="text-sm text-gray-600">{servicio.categoria || 'Servicio'}</span>
                                  <span className="font-medium text-[#6D4C41]">
                                    {formatPrice(typeof servicio.precio === 'string' 
                                      ? parseFloat(servicio.precio.replace(/[^\d.,]/g, '').replace(',', '.')) || 0
                                      : servicio.precio || 0)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <div className="mt-6 p-4 bg-[#E6DCC6]/20 rounded-lg border border-[#E6DCC6]">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <FaUsers className="text-[#A5856A] mr-2" />
                              <span className="font-medium text-[#6D4C41]">
                                {formData.serviciosSeleccionados.length} servicios seleccionados
                              </span>
                            </div>
                            <div className="font-bold text-[#6D4C41]">
                              {formatPrice(subtotal.servicios)}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <FaUtensils className="mx-auto h-12 w-12 text-gray-300" />
                        <p className="mt-2 text-gray-500">No hay servicios seleccionados</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Pie del modal */}
              <div className="bg-[#F8F5F0] p-4 border-t border-[#E6DCC6]">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Subtotal {modalDetalle === 'habitaciones' ? 'Habitaciones' : 'Servicios'}:
                  </span>
                  <span className="font-bold text-[#6D4C41]">
                    {formatPrice(modalDetalle === 'habitaciones' ? subtotal.habitaciones : subtotal.servicios)}
                  </span>
                </div>
                <button 
                  onClick={() => setModalDetalle(null)} 
                  className="mt-3 w-full py-2 px-4 bg-[#A5856A] text-white rounded-md hover:bg-[#8A6E52] transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReciboReservaGlobal;
