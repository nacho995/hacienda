'use client';

import React from 'react';

/**
 * Este componente ha sido reemplazado por ReciboReservaGlobal
 * @description Se mantiene por compatibilidad pero no muestra nada en la UI
 */
const HabitacionesPrecioResumen = () => {
  // Este componente ha sido reemplazado por ReciboReservaGlobal
  // Retornamos null para que no se muestre en la UI y no tape el botón de continuar
  return null;

  // Calcular el subtotal cuando cambian los datos del formulario
  useEffect(() => {
    calcularSubtotal();
  }, [formData]);

  const calcularSubtotal = () => {
    // Calcular precio de habitaciones
    let precioHabitacionesBase = 0;
    let cantidadNoches = 1;
    
    // Cálculo de noches si tenemos fechas
    if (formData.fechaFin && formData.fecha) {
      cantidadNoches = Math.max(1, Math.ceil(
        (new Date(formData.fechaFin) - new Date(formData.fecha)) / (1000 * 60 * 60 * 24)
      ));
    }
    
    // Calcular precios de habitaciones seleccionadas
    if (Array.isArray(formData.habitacionesSeleccionadas)) {
      formData.habitacionesSeleccionadas.forEach(habitacion => {
        const precioPorNoche = habitacion.precioPorNoche || habitacion.precio || 2400;
        const numeroPrecio = typeof precioPorNoche === 'string' 
          ? parseFloat(precioPorNoche.replace(/[^\d.,]/g, '').replace(',', '.'))
          : precioPorNoche;
          
        if (!isNaN(numeroPrecio)) {
          precioHabitacionesBase += numeroPrecio;
        }
      });
    }

    // Precio servicios extra (estimado)
    const precioServiciosExtra = 0; // Por implementar cuando haya servicios extra en habitaciones
    
    // Descuentos (si aplican)
    const descuentos = 0; // Por implementar cuando haya descuentos
    
    // Calculamos el total por noche y el total general
    const porNoche = precioHabitacionesBase;
    const total = (precioHabitacionesBase * cantidadNoches) + precioServiciosExtra - descuentos;

    // Actualizamos el estado
    setSubtotal({
      habitacionesBase: precioHabitacionesBase,
      serviciosExtra: precioServiciosExtra,
      descuentos: descuentos,
      total: total,
      porNoche: porNoche,
      noches: cantidadNoches
    });
  };

  // Formatear precio con separadores de miles
  const formatPrice = (price) => {
    return price.toLocaleString('es-ES') + '€';
  };

  // Determinar qué información mostrar según el paso actual
  const getMensajeContextual = () => {
    if (!formData.habitacionesSeleccionadas || formData.habitacionesSeleccionadas.length === 0) {
      return "Seleccione habitaciones para ver el precio estimado";
    }
    
    if (subtotal.noches > 1) {
      return `Total para ${subtotal.noches} noches con ${formData.habitacionesSeleccionadas.length} habitación(es)`;
    } else {
      return `Precio por noche con ${formData.habitacionesSeleccionadas.length} habitación(es)`;
    }
  };

  // Siempre mostramos el panel, incluso si no hay habitaciones seleccionadas
  // para que sea visible durante todo el proceso

  return (
    <AnimatePresence>
      <motion.div 
        className={`${showModal ? "" : "fixed bottom-5 right-5 z-[9999] mb-4 mr-4"} shadow-xl rounded-lg overflow-hidden bg-white border-2 border-[#A5856A]`}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ 
          maxWidth: isExpanded ? '350px' : '220px',
          border: '1px solid #E6DCC6',
          boxShadow: '0 4px 20px rgba(165, 133, 106, 0.15)'
        }}
      >
        {/* Encabezado */}
        <div 
          className="bg-gradient-to-r from-[#E6DCC6] to-[#D1B59B] px-4 py-3 cursor-pointer flex justify-between items-center"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h3 className="text-[#0F0F0F] font-medium text-sm md:text-base flex items-center">
            <FaBed className="mr-2" /> Resumen de Precio
          </h3>
          <div className="flex items-center">
            <span className="font-bold mr-2 text-[#0F0F0F]">
              {formatPrice(subtotal.total)}
            </span>
            {isExpanded ? <FaChevronDown /> : <FaChevronUp />}
          </div>
        </div>

        {/* Contenido expandible */}
        {isExpanded && (
          <motion.div 
            className="px-4 py-3 bg-white"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-sm space-y-2">
              {/* Detalle de habitaciones */}
              <div className="flex justify-between">
                <span className="text-gray-600">Precio por noche:</span>
                <span>{formatPrice(subtotal.porNoche)}</span>
              </div>
              
              {/* Mostrar duración de estancia solo si es más de 1 noche */}
              {subtotal.noches > 1 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Duración de estancia:</span>
                  <span>{subtotal.noches} noches</span>
                </div>
              )}
              
              {/* Mostrar servicios extra si hay */}
              {subtotal.serviciosExtra > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Servicios adicionales:</span>
                  <span>{formatPrice(subtotal.serviciosExtra)}</span>
                </div>
              )}
              
              {/* Mostrar descuentos si hay */}
              {subtotal.descuentos > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Descuentos aplicados:</span>
                  <span>-{formatPrice(subtotal.descuentos)}</span>
                </div>
              )}
              
              {/* Línea divisoria */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between font-medium">
                  <span>Total estimado:</span>
                  <span>{formatPrice(subtotal.total)}</span>
                </div>
              </div>
              
              {/* Mensaje contextual */}
              <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500 flex items-start">
                <FaInfoCircle className="mr-1 mt-0.5 flex-shrink-0 text-[#A5856A]" />
                <span>{getMensajeContextual()}</span>
              </div>
              
              <div className="text-xs text-[#8A6E52] italic mt-1 flex items-center">
                <FaCalendarAlt className="mr-1" size={10} />
                <span>*Los precios son estimados y pueden variar según temporada</span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default HabitacionesPrecioResumen;
