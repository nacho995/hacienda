"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaCalendarAlt, FaWifi, FaUserFriends, FaEnvelope, FaPhone, FaSpinner, FaBed, FaEuroSign, FaBuilding } from 'react-icons/fa';
import { toast } from 'sonner';
import { createMultipleReservaciones } from '@/services/reservationService';
import { useAuth } from '@/context/AuthContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import { motion, AnimatePresence } from 'framer-motion';

registerLocale('es', es);
setDefaultLocale('es');

export default function BookingFormSection({ 
  selectedRooms = [], 
  isLoadingDetails,
  formData, 
  setFormData,
}) {
  const { user } = useAuth();
  const [isFormValid, setIsFormValid] = useState(false);
  const [showReservationSuccess, setShowReservationSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservationError, setReservationError] = useState(null);
  const [fechasPorHabitacion, setFechasPorHabitacion] = useState({});
  const [metodoPago, setMetodoPago] = useState('');
  const [mostrarPago, setMostrarPago] = useState(false);
  const [mostrarFormularioTarjeta, setMostrarFormularioTarjeta] = useState(false);
  const [datosTarjeta, setDatosTarjeta] = useState({
    numeroTarjeta: '',
    nombreTitular: '',
    fechaExpiracion: '',
    cvv: '',
    direccion: '',
    codigoPostal: '',
    ciudad: '',
    estado: ''
  });
  
  const [multipleReservationConfirmations, setMultipleReservationConfirmations] = useState([]);
  
  useEffect(() => {
    const initialFechas = {};
    selectedRooms.forEach(room => {
      initialFechas[room._id] = fechasPorHabitacion[room._id] || { fechaEntrada: null, fechaSalida: null };
    });
    setFechasPorHabitacion(initialFechas);
    validateForm(formData, initialFechas);
  }, [selectedRooms]);

  const calcularPrecioTotal = () => {
    let precioTotalCalculado = 0;
    let todasFechasValidas = true;

    if (selectedRooms.length === 0) return 0;

    selectedRooms.forEach(room => {
      const fechas = fechasPorHabitacion[room._id];
      if (fechas && fechas.fechaEntrada && fechas.fechaSalida) {
        if (fechas.fechaSalida > fechas.fechaEntrada) {
          const noches = Math.ceil((fechas.fechaSalida - fechas.fechaEntrada) / (1000 * 60 * 60 * 24));
          if (noches > 0) {
            precioTotalCalculado += (room.precio || 0) * noches;
          } else {
            todasFechasValidas = false;
          }
        } else {
          todasFechasValidas = false;
        }
      } else {
        todasFechasValidas = false;
      }
    });

    return todasFechasValidas ? precioTotalCalculado : 0;
  };

  useEffect(() => {
    const precio = calcularPrecioTotal();
    setFormData(prev => ({ ...prev, precioTotal: precio }));
    validateForm(formData, fechasPorHabitacion);
  }, [fechasPorHabitacion, formData.nombre, formData.apellidos, formData.email, formData.telefono, formData.huespedes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    validateForm(newFormData, fechasPorHabitacion);
  };

  const handleFechasHabitacionChange = (roomId, dates) => {
    const [start, end] = dates;
    const newFechasPorHabitacion = {
      ...fechasPorHabitacion,
      [roomId]: { fechaEntrada: start, fechaSalida: end },
    };
    setFechasPorHabitacion(newFechasPorHabitacion);
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    setDatosTarjeta(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (currentFormData, currentFechasPorHabitacion) => {
    const { nombre, apellidos, email, telefono, huespedes } = currentFormData;
    let allDatesSetAndValid = selectedRooms.length > 0;
    
    if (selectedRooms.length === 0) {
        allDatesSetAndValid = false;
    } else {
        selectedRooms.forEach(room => {
          const fechas = currentFechasPorHabitacion[room._id];
          if (!fechas || !fechas.fechaEntrada || !fechas.fechaSalida || fechas.fechaSalida <= fechas.fechaEntrada) {
            allDatesSetAndValid = false;
          }
        });
    }

    const isValid = 
      nombre?.trim() !== '' && 
      apellidos?.trim() !== '' &&
      email?.trim() !== '' && 
      telefono?.trim() !== '' &&
      huespedes > 0 && 
      allDatesSetAndValid;
      
    setIsFormValid(isValid);
    return isValid;
  };

  const procesarPagoTarjeta = async () => {
    if (!datosTarjeta.numeroTarjeta || !datosTarjeta.nombreTitular || !datosTarjeta.fechaExpiracion || !datosTarjeta.cvv) {
      setReservationError('Por favor, complete todos los campos obligatorios de la tarjeta');
      return;
    }
    
    setIsSubmitting(true);
    setReservationError(null);
    
    try {
      const reservas = selectedRooms.map(room => {
        const fechas = fechasPorHabitacion[room._id];
        if (!fechas || !fechas.fechaEntrada || !fechas.fechaSalida || fechas.fechaSalida <= fechas.fechaEntrada) {
           throw new Error(`Fechas inválidas o faltantes para la habitación ${room.nombre}`);
        }
        const noches = Math.ceil((fechas.fechaSalida - fechas.fechaEntrada) / (1000 * 60 * 60 * 24));
        const precioTotalHabitacion = (room.precio || 0) * noches;

        return {
          nombreContacto: formData.nombre,
          apellidosContacto: formData.apellidos,
          emailContacto: formData.email,
          telefonoContacto: formData.telefono,
          numHuespedes: formData.huespedes,
          mensaje: formData.mensaje,
          habitacion: room.letra,
          tipoHabitacion: room.tipoHabitacion,
          precioPorNoche: room.precio,
          fechaEntrada: fechas.fechaEntrada.toISOString().split('T')[0],
          fechaSalida: fechas.fechaSalida.toISOString().split('T')[0],
          precioTotal: precioTotalHabitacion,
            numeroHabitaciones: 1,
            metodoPago: 'tarjeta',
          tipoReserva: 'hotel',
          estadoReserva: 'confirmada',
            infoPago: {
              ultimosDigitos: datosTarjeta.numeroTarjeta.slice(-4),
              titular: datosTarjeta.nombreTitular
            }
          };
      });
        
      console.log('Datos de reservas múltiples con tarjeta (fechas individuales):', reservas);
        const response = await createMultipleReservaciones(reservas);
        
      if (response.success && Array.isArray(response.data)) {
          setMultipleReservationConfirmations(response.data);
          setShowReservationSuccess(true);
          toast.success('Pago procesado correctamente. Sus habitaciones han sido reservadas con éxito');
        } else {
          console.error('Error en la respuesta:', response);
        setReservationError(response.message || 'Error al procesar su reserva múltiple');
        toast.error(response.message || 'Error al procesar la reserva múltiple');
      }
    } catch (error) {
      console.error('Error al preparar o procesar el pago múltiple con tarjeta:', error);
      setReservationError(error.message || 'Error al procesar el pago. Verifique las fechas e inténtelo de nuevo.');
      toast.error(error.message || 'Error de red o datos inválidos al procesar el pago');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(formData, fechasPorHabitacion)) {
      toast.warning('Por favor, complete todos los campos requeridos y seleccione fechas válidas (salida posterior a entrada) para todas las habitaciones.');
      return;
    }
    setMostrarPago(true);
  };

  const procesarPago = async (metodo) => {
    setIsSubmitting(true);
    setReservationError(null);
    
    try {
       const reservas = selectedRooms.map(room => {
         const fechas = fechasPorHabitacion[room._id];
         if (!fechas || !fechas.fechaEntrada || !fechas.fechaSalida || fechas.fechaSalida <= fechas.fechaEntrada) {
            throw new Error(`Fechas inválidas o faltantes para la habitación ${room.nombre}`);
         }
         const noches = Math.ceil((fechas.fechaSalida - fechas.fechaEntrada) / (1000 * 60 * 60 * 24));
         const precioTotalHabitacion = (room.precio || 0) * noches;

         return {
            nombreContacto: formData.nombre,
            apellidosContacto: formData.apellidos,
            emailContacto: formData.email,
            telefonoContacto: formData.telefono,
            numHuespedes: formData.huespedes,
            mensaje: formData.mensaje,
            habitacion: room.letra,
            tipoHabitacion: room.tipoHabitacion,
            precioPorNoche: room.precio,
            fechaEntrada: fechas.fechaEntrada.toISOString().split('T')[0],
            fechaSalida: fechas.fechaSalida.toISOString().split('T')[0],
            precioTotal: precioTotalHabitacion,
            numeroHabitaciones: 1,
            metodoPago: metodo,
            tipoReserva: 'hotel',
            estadoReserva: 'pendiente',
         };
      });
       
       console.log(`Datos de reservas múltiples con ${metodo} (fechas individuales):`, reservas);
        const response = await createMultipleReservaciones(reservas);
        
       if (response.success && Array.isArray(response.data)) {
          setMultipleReservationConfirmations(response.data);
          setShowReservationSuccess(true);
         toast.success(`Reserva con ${metodo} registrada. Recibirá instrucciones por correo.`);
        } else {
          console.error('Error en la respuesta:', response);
         setReservationError(response.message || 'Error al procesar su reserva múltiple');
         toast.error(response.message || 'Error al procesar la reserva múltiple');
      }
    } catch (error) {
       console.error(`Error al preparar o procesar reserva múltiple con ${metodo}:`, error);
       setReservationError(error.message || `Error al registrar la reserva con ${metodo}. Verifique las fechas.`);
       toast.error(error.message || `Error de red o datos inválidos al registrar la reserva con ${metodo}`);
    } finally {
      setIsSubmitting(false);
       setMostrarPago(false);
    }
  };

  if (showReservationSuccess) {
    const formatDate = (dateInput) => {
        if (!dateInput) return 'N/A';
        try {
            // Intenta crear la fecha directamente desde la entrada
            const date = new Date(dateInput);
            // Comprueba si la fecha es válida
            if (isNaN(date.getTime())) {
                console.warn("Formato de fecha inválido recibido para la vista de éxito:", dateInput);
                // Devolver el string original si no se puede parsear, podría ser útil para debug
                return dateInput.toString(); 
            }
            return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch (e) {
            console.error("Error formateando fecha en vista de éxito:", e);
            return 'Error fecha'; 
        }
  };

  return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto my-12 p-8 bg-green-50 rounded-lg shadow-lg text-center border border-green-200"
      >
        <h2 className="text-2xl font-semibold text-green-800 mb-4">¡Reserva Exitosa!</h2>
        <p className="text-green-700 mb-6">Sus habitaciones han sido reservadas. Recibirá un correo de confirmación pronto.</p>
        <h3 className="text-lg font-medium text-gray-700 mb-3">Detalles de la Reserva:</h3>
        <div className="space-y-4 text-left bg-white p-4 rounded shadow-sm max-h-60 overflow-y-auto">
          {multipleReservationConfirmations.map((conf, index) => (
            <div key={conf._id || index} className="border-b pb-2 mb-2">
              <p><strong>Habitación:</strong> {conf.habitacion || `Habitación ${index + 1}`}</p>
              <p><strong>Fechas:</strong> {formatDate(conf.fechaEntrada)} - {formatDate(conf.fechaSalida)}</p>
              <p><strong>Huéspedes:</strong> {conf.numHuespedes || formData.huespedes}</p>
              <p><strong>Precio:</strong> ${typeof conf.precio === 'number' ? conf.precio.toFixed(2) : 'N/A'}</p>
              <p><strong>Método Pago:</strong> {conf.metodoPago}</p>
              <p className="text-xs text-gray-500">ID: {conf._id}</p>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.section 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="booking-form-section py-12 bg-gradient-to-b from-gray-50 to-white mt-[-1px]"
    >
      <div className="container-custom max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-[var(--color-primary)]">Completa tu Reserva</h2>

        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-blue-800 mb-4">Habitaciones Seleccionadas</h3>
          {isLoadingDetails ? (
            <div className="flex items-center justify-center text-blue-600">
              <FaSpinner className="animate-spin mr-2" /> Cargando detalles...
                  </div>
          ) : selectedRooms.length > 0 ? (
            <ul className="space-y-5">
              {selectedRooms.map(room => {
                const roomDates = fechasPorHabitacion[room._id] || { fechaEntrada: null, fechaSalida: null };
                const hasValidDates = roomDates.fechaEntrada && roomDates.fechaSalida && roomDates.fechaSalida > roomDates.fechaEntrada;

                return (
                  <li key={room._id} className={`p-4 bg-white rounded shadow-sm border ${!hasValidDates && roomDates.fechaEntrada ? 'border-red-300' : 'border-gray-100'}`}>
                     <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-3">
                       <div className="flex-shrink-0 w-20 h-20 rounded overflow-hidden border border-gray-200">
                          <Image 
                            src={room.imagen || '/images/placeholder/room.jpg'} 
                            alt={room.nombre}
                            width={80}
                            height={80}
                            className="object-cover"
                    />
                  </div>
                       <div className="flex-grow">
                         <p className="font-semibold text-gray-800 text-lg">{room.nombre}</p>
                         <p className="text-sm text-gray-600">Tipo: {room.tipo}</p>
                         <p className="font-semibold text-[var(--color-primary)] mt-1">${room.precio || 0} / noche</p>
                    </div>
                       <div className="w-full md:w-auto md:min-w-[280px]">
                          <label htmlFor={`fechas-${room._id}`} className="block text-xs font-medium text-gray-600 mb-1">Fechas para {room.nombre} *</label>
                          <DatePicker
                            selected={roomDates.fechaEntrada}
                            onChange={(dates) => handleFechasHabitacionChange(room._id, dates)}
                            startDate={roomDates.fechaEntrada}
                            endDate={roomDates.fechaSalida}
                            selectsRange
                            monthsShown={1}
                            locale="es"
                            dateFormat="dd/MM/yyyy"
                            minDate={new Date()}
                            placeholderText="Entrada - Salida"
                            className={`w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm ${!hasValidDates && roomDates.fechaEntrada ? 'border-red-500' : 'border-gray-300'}`}
                            wrapperClassName="w-full"
                            calendarClassName="shadow-lg border rounded-lg bg-white text-xs"
                            popperPlacement="bottom-end"
                        required
                      />
                          {!hasValidDates && roomDates.fechaEntrada && (
                              <p className="text-xs text-red-600 mt-1">La fecha de salida debe ser posterior a la de entrada.</p>
                          )}
                    </div>
                  </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-center text-gray-500 italic">No has seleccionado ninguna habitación aún.</p>
          )}
           {selectedRooms.length > 0 && !isLoadingDetails && (
             <div className="mt-5 pt-4 border-t border-blue-200 text-right">
                <p className="text-lg font-semibold text-gray-800">Precio Total Estimado: 
                   <span className={`ml-2 ${calcularPrecioTotal() > 0 ? 'text-[var(--color-primary)]' : 'text-gray-500'}`}>
                      ${calcularPrecioTotal().toFixed(2)}
                   </span>
                </p>
                <p className="text-xs text-gray-500">
                    {calcularPrecioTotal() > 0 ? '(Suma de todas las habitaciones y noches)' : '(Selecciona fechas válidas para todas las habitaciones)'}
                </p>
                  </div>
           )}
                  </div>
                  
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-lg border border-gray-200">
           <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-5">Datos del Contacto Principal</h3>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input type="text" name="nombre" id="nombre" required value={formData.nombre} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
              <div>
                <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
                <input type="text" name="apellidos" id="apellidos" required value={formData.apellidos} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
              <div>
                 <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico *</label>
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaEnvelope className="h-5 w-5 text-gray-400"/></div>
                    <input type="email" name="email" id="email" required value={formData.email} onChange={handleInputChange} className="w-full p-3 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
              </div>
              <div>
                 <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaPhone className="h-5 w-5 text-gray-400"/></div>
                    <input type="tel" name="telefono" id="telefono" required value={formData.telefono} onChange={handleInputChange} className="w-full p-3 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
              </div>
                  </div>
                  
                  <div>
             <label htmlFor="huespedes" className="block text-sm font-medium text-gray-700 mb-1">Número Total de Huéspedes *</label>
                    <input
               type="number" 
               name="huespedes" 
               id="huespedes" 
               min="1" 
               max={selectedRooms.reduce((acc, room) => {
                   const capacity = typeof room.capacidad === 'object' 
                                    ? (room.capacidad.adultos || 0) + (room.capacidad.ninos || 0)
                                    : (typeof room.capacidad === 'number' ? room.capacidad : 2);
                   return acc + capacity; 
               }, 0) || 1}
                      required
               value={formData.huespedes}
                      onChange={handleInputChange}
               className="w-full md:w-1/2 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
               placeholder="Total de personas"
                    />
             <p className="text-xs text-gray-500 mt-1">Indica el número total de personas que se hospedarán en todas las habitaciones seleccionadas.</p>
                  </div>
                  
                  <div>
             <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-1">Mensaje Adicional (opcional)</label>
             <textarea name="mensaje" id="mensaje" rows="4" value={formData.mensaje} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="Alergias, preferencias, hora estimada de llegada..."></textarea>
                  </div>

           <div className="text-center pt-4">
             <button 
               type="submit" 
               disabled={!isFormValid || isSubmitting || isLoadingDetails}
               className="w-full md:w-auto px-10 py-3 bg-[var(--color-primary)] text-white text-lg font-semibold rounded-full shadow-lg hover:bg-[var(--color-primary-dark)] transition-colors duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
             >
               {isSubmitting ? <FaSpinner className="animate-spin"/> : (isLoadingDetails ? 'Cargando...' : 'Continuar al Pago')}
             </button>
             {!isFormValid && selectedRooms.length > 0 && !isLoadingDetails && (
                 <p className="text-xs text-red-500 mt-2">Completa los datos y selecciona fechas válidas para continuar.</p>
             )}
                </div>
                
           {reservationError && !mostrarPago && (
             <p className="text-red-600 text-center mt-4">Error: {reservationError}</p>
           )}
         </form>

         <AnimatePresence>
           {mostrarPago && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }} 
               animate={{ opacity: 1, scale: 1 }} 
               exit={{ opacity: 0, scale: 0.9 }} 
               transition={{ duration: 0.3 }}
               className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4"
             >
                <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-auto relative">
                   <button onClick={() => {setMostrarPago(false); setMostrarFormularioTarjeta(false); setReservationError(null);}} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 z-10">
                     &times;
                   </button>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Selecciona Método de Pago</h3>
                  <p className="text-center text-lg font-semibold text-gray-700 mb-4">Total: ${calcularPrecioTotal().toFixed(2)}</p>
                  
                  {reservationError && (
                     <p className="text-red-600 text-center mb-4">{reservationError}</p>
                   )}
                  
                  <div className="space-y-4">
                     <button 
                        onClick={() => { setMostrarFormularioTarjeta(true); setReservationError(null); }}
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                     >
                        Pagar con Tarjeta
                     </button>
                     
                     <AnimatePresence>
                       {mostrarFormularioTarjeta && (
                         <motion.div 
                           initial={{ height: 0, opacity: 0 }} 
                           animate={{ height: 'auto', opacity: 1 }} 
                           exit={{ height: 0, opacity: 0 }} 
                           transition={{ duration: 0.3 }}
                           className="overflow-hidden"
                         >
                           <div className="space-y-4 border p-4 rounded-md bg-gray-50 mt-4">
                             <h4 className="text-md font-medium text-gray-700">Datos de la Tarjeta</h4>
                    <div>
                                <label htmlFor="numeroTarjeta" className="block text-sm font-medium text-gray-700 mb-1">Número Tarjeta *</label>
                                <input type="text" name="numeroTarjeta" id="numeroTarjeta" required value={datosTarjeta.numeroTarjeta} onChange={handleCardInputChange} className="w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                              </div>
                              <div>
                                <label htmlFor="nombreTitular" className="block text-sm font-medium text-gray-700 mb-1">Nombre Titular *</label>
                                <input type="text" name="nombreTitular" id="nombreTitular" required value={datosTarjeta.nombreTitular} onChange={handleCardInputChange} className="w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                              </div>
                             <div className="grid grid-cols-2 gap-4">
                    <div>
                                 <label htmlFor="fechaExpiracion" className="block text-sm font-medium text-gray-700 mb-1">Expiración (MM/AA) *</label>
                                 <input type="text" name="fechaExpiracion" id="fechaExpiracion" placeholder="MM/AA" required value={datosTarjeta.fechaExpiracion} onChange={handleCardInputChange} className="w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                                 <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">CVV *</label>
                                 <input type="text" name="cvv" id="cvv" required value={datosTarjeta.cvv} onChange={handleCardInputChange} className="w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                      </div>
                    </div>
                              
                             <button 
                               onClick={procesarPagoTarjeta} 
                               disabled={isSubmitting}
                               className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                             >
                               {isSubmitting ? <FaSpinner className="animate-spin" /> : 'Confirmar Pago'}
                             </button>
                    </div>
                         </motion.div>
                      )}
                     </AnimatePresence>
                    
                    <button 
                       onClick={() => procesarPago('transferencia')}
                       disabled={isSubmitting || mostrarFormularioTarjeta}
                       className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                       Pagar por Transferencia
                    </button>
                    
                  <button
                       onClick={() => procesarPago('efectivo')}
                       disabled={isSubmitting || mostrarFormularioTarjeta}
                       className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                       Pagar en Efectivo (en Hacienda)
                  </button>
                 </div>
                </div>
               </motion.div>
           )}
         </AnimatePresence>
      </div>
    </motion.section>
  );
} 