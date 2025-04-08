"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaCalendarAlt, FaCheck, FaWifi, FaCoffee, FaTv, FaSnowflake, FaUserFriends, FaDoorOpen, FaEnvelope, FaPhone, FaPen, FaSpinner } from 'react-icons/fa';
import { createHabitacionReservation, getHabitacionOccupiedDates } from '@/services/reservationService';
import { obtenerHabitaciones } from '@/services/habitacionService';
import { useAuth } from '@/context/AuthContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import { motion, AnimatePresence } from 'framer-motion';

registerLocale('es', es);
setDefaultLocale('es');

export default function BookingFormSection({ 
  selectedRoom, 
  selectedRooms = [], 
  onSelectRoom, 
  formData, 
  setFormData, 
  tipoReservacionForzado = null,
  esReservaMultiple = false,
  onTipoReservaChange = null,
  ocultarOpcionesCategoriaHabitacion = false
}) {
  const { user } = useAuth();
  const [isFormValid, setIsFormValid] = useState(false);
  const [showReservationSuccess, setShowReservationSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservationError, setReservationError] = useState(null);
  const [reservationConfirmation, setReservationConfirmation] = useState(null);
  const [fechasOcupadas, setFechasOcupadas] = useState([]);
  const [fechaEntrada, setFechaEntrada] = useState(null);
  const [fechaSalida, setFechaSalida] = useState(null);
  const [tipoReservacion, setTipoReservacion] = useState(tipoReservacionForzado || 'individual');
  const [categoriaHabitacion, setCategoriaHabitacion] = useState('doble');
  const [metodoPago, setMetodoPago] = useState('');
  const [mostrarPago, setMostrarPago] = useState(false);
  
  // Precios predeterminados según categoría
  const precioSencilla = 2400;
  const precioDoble = 2600;

  // Estado adicional para la confirmación de reserva múltiple
  const [multipleReservationConfirmations, setMultipleReservationConfirmations] = useState([]);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [processingMultipleRooms, setProcessingMultipleRooms] = useState(false);
  
  // Efecto para actualizar formData cuando se selecciona una habitación
  useEffect(() => {
    if (selectedRoom) {
      setFormData(prev => ({
        ...prev,
        habitacion: selectedRoom._id,
        tipoHabitacion: selectedRoom.tipo,
        precioPorNoche: categoriaHabitacion === 'sencilla' ? precioSencilla : precioDoble
      }));
    }
  }, [selectedRoom, categoriaHabitacion, setFormData]);
  
  // Efecto para actualizar el precio cuando cambia la categoría
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      precioPorNoche: categoriaHabitacion === 'sencilla' ? precioSencilla : precioDoble,
      categoriaHabitacion
    }));
  }, [categoriaHabitacion]);
  
  // Efecto para actualizar el tipo de reservación
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      tipoReservacion
    }));
  }, [tipoReservacion]);

  // Efecto para forzar el tipo de reservación si se proporciona
  useEffect(() => {
    if (tipoReservacionForzado) {
      setTipoReservacion(tipoReservacionForzado);
    }
  }, [tipoReservacionForzado]);

  // Cargar fechas ocupadas desde el backend
  useEffect(() => {
    const cargarFechasOcupadas = async () => {
      if (!selectedRoom) return;

      try {
        const params = {
          tipoHabitacion: selectedRoom.tipo,
          habitacion: selectedRoom.nombre
        };
        
        const fechas = await getHabitacionOccupiedDates(params);
        if (Array.isArray(fechas) && fechas.length > 0) {
          setFechasOcupadas(fechas);
        }
      } catch (error) {
        console.error("Error al cargar fechas ocupadas:", error);
      }
    };
    
    cargarFechasOcupadas();
  }, [selectedRoom]);

  // Convertir fechas de entrada/salida a formato ISO para el formulario al seleccionarlas
  useEffect(() => {
    if (fechaEntrada) {
      setFormData(prev => ({
        ...prev,
        fechaEntrada: fechaEntrada.toISOString().split('T')[0]
      }));
    }
    
    if (fechaSalida) {
      setFormData(prev => ({
        ...prev,
        fechaSalida: fechaSalida.toISOString().split('T')[0]
      }));
    }
  }, [fechaEntrada, fechaSalida, setFormData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Validar formulario
    const { nombre, apellidos, email, telefono, fechaEntrada, fechaSalida } = {
      ...formData,
      [name]: value
    };
    setIsFormValid(
      nombre !== '' && 
      apellidos !== '' &&
      email !== '' && 
      telefono !== '' && 
      fechaEntrada !== '' && 
      fechaSalida !== '' && 
      selectedRoom !== null
    );
  };

  // Modificar handleSubmit para mostrar opciones de pago
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid || isSubmitting) return;
    
    // Validar que se ingresaron fechas de entrada y salida
    if (!formData.fechaEntrada || !formData.fechaSalida) {
      setReservationError('Por favor, seleccione fechas de entrada y salida');
      return;
    }
    
    // Si es reserva de tipo hotel, mostrar opciones de pago
    if (tipoReservacion === 'individual') {
      // Verificar que se ha seleccionado una habitación
      if (esReservaMultiple && selectedRooms.length === 0) {
        setReservationError('Por favor, seleccione al menos una habitación para reservar');
        return;
      } else if (!esReservaMultiple && !selectedRoom) {
        setReservationError('Por favor, seleccione una habitación para reservar');
        return;
      }
      
      setMostrarPago(true);
    } else {
      // Para tipo evento, redirigir a la página de eventos con parámetros
      const selectedRoomData = selectedRoom;
      
      if (!selectedRoomData) {
        setReservationError('Habitación no encontrada');
        return;
      }
      
      // Crear datos de habitación para pasar a la página de eventos
      const habitacionData = {
        id: selectedRoomData._id || Math.random().toString(36).substr(2, 9),
        nombre: selectedRoomData.nombre,
        tipo: selectedRoomData.tipo,
        fechaEntrada: formData.fechaEntrada,
        fechaSalida: formData.fechaSalida,
        precio: selectedRoomData.precio || (categoriaHabitacion === 'sencilla' ? precioSencilla : precioDoble),
        numHuespedes: parseInt(formData.huespedes) || 1
      };
      
      console.log('Datos de habitación para evento:', habitacionData);
      
      // Codificar datos para URL
      const habitacionesParam = encodeURIComponent(JSON.stringify([habitacionData]));
      
      // Redirigir a la página de eventos
      window.location.href = `/reservar?tipo=evento&habitaciones=${habitacionesParam}`;
    }
  };

  // Procesar pago de la reserva
  const procesarPago = async (metodo) => {
    if (!formData.fechaEntrada || !formData.fechaSalida) {
      setReservationError('Por favor, seleccione fechas de entrada y salida');
      return;
    }
    
    setMetodoPago(metodo);
    setIsSubmitting(true);
    setReservationError(null);
    
    try {
      console.log('Procesando reserva con método:', metodo);
      // Preparar los datos para enviar al backend
      let reservaData = {
        ...formData,
        habitacion: selectedRoom?._id,
        tipoHabitacion: selectedRoom?.tipo,
        metodoPago: metodo,
        tipoReservacion: tipoReservacion,
        categoriaHabitacion: categoriaHabitacion,
        precioPorNoche: categoriaHabitacion === 'sencilla' ? precioSencilla : precioDoble
      };
      
      // Si es reserva múltiple, preparar datos de todas las habitaciones
      if (esReservaMultiple && selectedRooms.length > 0) {
        console.log('Procesando reserva múltiple con', selectedRooms.length, 'habitaciones');
        const reservas = [];
        
        for (const room of selectedRooms) {
          const reservaIndividual = {
            ...formData,
            habitacion: room._id,
            tipoHabitacion: room.tipo,
            numeroHabitaciones: 1,
            metodoPago: metodo,
            tipoReservacion: tipoReservacion,
            categoriaHabitacion: room.categoriaHabitacion || categoriaHabitacion,
            precioPorNoche: room.precio || (room.categoriaHabitacion === 'sencilla' ? precioSencilla : precioDoble)
          };
          reservas.push(reservaIndividual);
        }
        
        console.log('Datos de reservas múltiples:', reservas);
        const response = await createMultipleReservaciones(reservas);
        
        if (response.success) {
          setMultipleReservationConfirmations(response.data);
          setShowReservationSuccess(true);
          toast.success('Sus habitaciones han sido reservadas con éxito');
        } else {
          console.error('Error en la respuesta:', response);
          setReservationError(response.message || 'Error al procesar su reserva');
        }
      } else {
        // Reserva individual
        console.log('Datos de reserva individual:', reservaData);
        const response = await createReservacion(reservaData);
        
        if (response.success) {
          setReservationConfirmation(response.data);
          setShowReservationSuccess(true);
          toast.success('Su habitación ha sido reservada con éxito');
        } else {
          console.error('Error en la respuesta:', response);
          setReservationError(response.message || 'Error al procesar su reserva');
        }
      }
    } catch (error) {
      console.error('Error al crear la reserva:', error);
      setReservationError(error.message || 'Error al procesar su reserva. Por favor, inténtelo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para verificar si una fecha está disponible
  const esDisponible = (date) => {
    // No permitir fechas pasadas
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (date < hoy) return false;
    
    // Verificar contra fechas ocupadas
    for (const reserva of fechasOcupadas) {
      const entrada = new Date(reserva.fechaEntrada);
      const salida = new Date(reserva.fechaSalida);
      
      // Normalizar fechas para comparación
      entrada.setHours(0, 0, 0, 0);
      salida.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      
      // Si la fecha está dentro del rango de una reserva, no está disponible
      if (date >= entrada && date <= salida) {
        return false;
      }
    }
    
    return true;
  };

  // Nuevo manejador para sincronizar el tipo de reserva con el componente padre
  const handleTipoReservacionChange = (tipo) => {
    setTipoReservacion(tipo);
    // Notificar al componente padre del cambio
    if (typeof onTipoReservaChange === 'function') {
      onTipoReservaChange(tipo);
    }
    // Actualizar formData
    setFormData(prev => ({
      ...prev,
      tipoReservacion: tipo
    }));
  };

  return (
    <section id="reserva-form" className="py-16 bg-[var(--color-cream-light)]">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-[var(--font-display)] text-3xl text-center mb-4">
            {selectedRoom && selectedRoom.nombre ? `Reservar ${selectedRoom.nombre}` : selectedRooms.length > 0 ? `Reservar Habitaciones (${selectedRooms.length})` : 'Haga su Reservación'}
          </h2>
          <div className="w-16 h-[1px] bg-[var(--color-primary)] mx-auto mb-8"></div>
          
          <div className="bg-white shadow-lg p-8 md:p-10 border border-gray-100">
            {!selectedRoom ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Seleccione una habitación para continuar con la reserva.</p>
              </div>
            ) : showReservationSuccess ? (
              <div className="text-center py-10">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-500">
                    <FaCheck size={24} />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-[var(--color-primary)] mb-3">¡Reserva Confirmada!</h3>
                <p className="text-gray-700 mb-6">Su reserva ha sido realizada con éxito.</p>
                
                {esReservaMultiple && multipleReservationConfirmations.length > 0 ? (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 text-[var(--color-accent)]">Detalle de habitaciones reservadas</h4>
                    <div className="space-y-4">
                      {multipleReservationConfirmations.map((confirmacion, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg text-left">
                          <p><span className="font-semibold">Habitación {index + 1}:</span> {selectedRooms[index]?.nombre || 'Habitación'}</p>
                          <p><span className="font-semibold">Número de reserva:</span> {confirmacion?.numeroConfirmacion || confirmacion?._id || 'N/A'}</p>
                          <p><span className="font-semibold">Fechas:</span> {new Date(formData.fechaEntrada).toLocaleDateString()} - {new Date(formData.fechaSalida).toLocaleDateString()}</p>
                        </div>
                      ))}
                      <div className="bg-[var(--color-primary)]/10 p-4 rounded-lg text-left">
                        <p className="font-semibold">Total habitaciones: {multipleReservationConfirmations.length}</p>
                        <p><span className="font-semibold">Método de pago:</span> {metodoPago === 'tarjeta' ? 'Tarjeta de crédito/débito' : 'Efectivo al llegar'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4 text-left">
                    <p><span className="font-semibold">Número de reserva:</span> {reservationConfirmation?.numeroConfirmacion || reservationConfirmation?._id || 'N/A'}</p>
                    <p><span className="font-semibold">Habitación:</span> {selectedRoom?.nombre}</p>
                    <p><span className="font-semibold">Fechas:</span> {new Date(formData.fechaEntrada).toLocaleDateString()} - {new Date(formData.fechaSalida).toLocaleDateString()}</p>
                    <p><span className="font-semibold">Método de pago:</span> {metodoPago === 'tarjeta' ? 'Tarjeta de crédito/débito' : 'Efectivo al llegar'}</p>
                  </div>
                )}
                
                <p className="text-gray-600 text-sm">
                  Hemos enviado un correo electrónico con los detalles de su reserva.
                </p>
              </div>
            ) : mostrarPago ? (
              <div className="py-10">
                <h3 className="text-2xl font-semibold text-[var(--color-primary)] mb-6 text-center">Seleccione método de pago</h3>
                
                <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
                  <button
                    onClick={() => procesarPago('tarjeta')}
                    disabled={isSubmitting}
                    className="flex-1 bg-white border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors rounded-lg p-6 flex flex-col items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                    <span className="font-semibold text-lg">Tarjeta de Crédito/Débito</span>
                    <span className="text-sm mt-2">Pago seguro en línea</span>
                  </button>
                  
                  <button
                    onClick={() => procesarPago('efectivo')}
                    disabled={isSubmitting}
                    className="flex-1 bg-white border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors rounded-lg p-6 flex flex-col items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="6" width="20" height="12" rx="2" />
                      <circle cx="12" cy="12" r="4" />
                    </svg>
                    <span className="font-semibold text-lg">Pago en Efectivo</span>
                    <span className="text-sm mt-2">Pago al llegar a la hacienda</span>
                  </button>
                </div>
                
                {isSubmitting && (
                  <div className="text-center py-4">
                    <FaSpinner className="mx-auto animate-spin text-[var(--color-brown-medium)]" size={30} />
                    <p className="mt-2 text-gray-600">Procesando su reserva...</p>
                  </div>
                )}
                
                {reservationError && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
                    <p>{reservationError}</p>
                  </div>
                )}
                
                <button
                  onClick={() => setMostrarPago(false)}
                  className="text-gray-600 hover:text-[var(--color-primary)] text-center w-full mt-4"
                >
                  Volver al formulario
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tipo de Reservación */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Reservación</label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-[var(--color-primary)]"
                        name="tipoReservacion"
                        value="individual"
                        checked={tipoReservacion === 'individual'}
                        onChange={() => handleTipoReservacionChange('individual')}
                      />
                      <span className="ml-2">Estancia Hotel</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-[var(--color-primary)]"
                        name="tipoReservacion"
                        value="evento"
                        checked={tipoReservacion === 'evento'}
                        onChange={() => handleTipoReservacionChange('evento')}
                      />
                      <span className="ml-2">Con Evento</span>
                    </label>
                  </div>
                  {tipoReservacion === 'evento' && (
                    <p className="text-sm text-gray-500 mt-2">
                      Al reservar con evento, será redirigido a nuestro formulario de eventos.
                    </p>
                  )}
                </div>

                {/* Resto del formulario */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-brown-medium)] focus:border-[var(--color-brown-medium)]"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                    <input
                      type="text"
                      id="apellidos"
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-brown-medium)] focus:border-[var(--color-brown-medium)]"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-brown-medium)] focus:border-[var(--color-brown-medium)]"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-brown-medium)] focus:border-[var(--color-brown-medium)]"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Entrada</label>
                    <div className="relative">
                      <DatePicker
                        selected={fechaEntrada}
                        onChange={date => setFechaEntrada(date)}
                        selectsStart
                        startDate={fechaEntrada}
                        endDate={fechaSalida}
                        minDate={new Date()}
                        filterDate={esDisponible}
                        dateFormat="dd/MM/yyyy"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-brown-medium)] focus:border-[var(--color-brown-medium)]"
                        placeholderText="Seleccione fecha de entrada"
                        required
                      />
                      <FaCalendarAlt className="absolute right-3 top-3 text-gray-400" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Salida</label>
                    <div className="relative">
                      <DatePicker
                        selected={fechaSalida}
                        onChange={date => setFechaSalida(date)}
                        selectsEnd
                        startDate={fechaEntrada}
                        endDate={fechaSalida}
                        minDate={fechaEntrada || new Date()}
                        filterDate={esDisponible}
                        dateFormat="dd/MM/yyyy"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-brown-medium)] focus:border-[var(--color-brown-medium)]"
                        placeholderText="Seleccione fecha de salida"
                        required
                      />
                      <FaCalendarAlt className="absolute right-3 top-3 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedRooms.length > 0 ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Huéspedes por Habitación</label>
                      <div className={`space-y-3 ${selectedRooms.length > 4 ? 'max-h-40 overflow-y-auto pr-2' : ''}`}>
                        {selectedRooms.map((room, index) => {
                          // Determinar la capacidad máxima de la habitación
                          const maxCapacidad = typeof room.capacidad === 'object' 
                            ? (room.capacidad.adultos + room.capacidad.ninos) 
                            : (room.capacidad || 4);
                            
                          // Obtener el valor actual de huéspedes para esta habitación o usar 1 como valor predeterminado
                          const huespedesActuales = formData.huespedesPorHabitacion && 
                            formData.huespedesPorHabitacion[room._id] ? 
                            formData.huespedesPorHabitacion[room._id] : 1;
                            
                          return (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md border border-gray-200">
                              <div className="flex-1">
                                <p className="font-medium text-gray-700">{room.nombre || room.tipo || `Habitación ${index + 1}`}</p>
                                <p className="text-xs text-gray-500">Máx. {maxCapacidad} huéspedes</p>
                              </div>
                              <div className="w-24">
                                <input
                                  type="number"
                                  min="1"
                                  max={maxCapacidad}
                                  value={huespedesActuales}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value) || 1;
                                    const newHuespedesPorHabitacion = {
                                      ...formData.huespedesPorHabitacion || {},
                                      [room._id]: Math.min(Math.max(1, value), maxCapacidad)
                                    };
                                    
                                    // Calcular el total de huéspedes
                                    const totalHuespedes = Object.values(newHuespedesPorHabitacion).reduce((sum, val) => sum + val, 0);
                                    
                                    setFormData({
                                      ...formData,
                                      huespedesPorHabitacion: newHuespedesPorHabitacion,
                                      huespedes: totalHuespedes
                                    });
                                  }}
                                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-[var(--color-brown-medium)] focus:border-[var(--color-brown-medium)] text-center"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="huespedes" className="block text-sm font-medium text-gray-700 mb-1">Número de Huéspedes</label>
                      <input
                        type="number"
                        id="huespedes"
                        name="huespedes"
                        min="1"
                        max="8"
                        value={formData.huespedes}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-brown-medium)] focus:border-[var(--color-brown-medium)]"
                      />
                    </div>
                  )}
                  
                  {!ocultarOpcionesCategoriaHabitacion && selectedRooms.length === 0 ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoría de Habitación</label>
                      <div className="flex space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio text-[var(--color-brown-medium)]"
                            name="categoriaHabitacion"
                            value="sencilla"
                            checked={categoriaHabitacion === 'sencilla'}
                            onChange={() => setCategoriaHabitacion('sencilla')}
                          />
                          <span className="ml-2">Sencilla (${precioSencilla}/noche)</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio text-[var(--color-brown-medium)]"
                            name="categoriaHabitacion"
                            value="doble"
                            checked={categoriaHabitacion === 'doble'}
                            onChange={() => setCategoriaHabitacion('doble')}
                          />
                          <span className="ml-2">Doble (${precioDoble}/noche)</span>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Habitaciones Seleccionadas</label>
                      <div className="px-4 py-3 border border-gray-200 rounded-md bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium text-[var(--color-brown-medium)]">{selectedRooms.length} habitación(es) seleccionada(s)</p>
                          <p className="text-[var(--color-brown-medium)] font-semibold">
                            Total: ${selectedRooms.reduce((total, room) => total + parseFloat(room.precio || 0), 0).toFixed(2)}
                          </p>
                        </div>
                        {selectedRooms.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className={`${selectedRooms.length > 4 ? 'max-h-40 overflow-y-auto' : ''}`}>
                              {selectedRooms.map((room, index) => (
                                <div key={index} className="py-2 border-b border-gray-100 last:border-b-0">
                                  <div className="flex justify-between items-center mb-1">
                                    <div className="font-medium text-gray-800">{room.nombre || room.tipo || `Habitación ${index + 1}`}</div>
                                    <div className="text-[var(--color-brown-medium)] font-semibold">${parseFloat(room.precio || 0).toFixed(2)}</div>
                                  </div>
                                  <div className="flex justify-between text-xs text-gray-500">
                                    <div>
                                      {typeof room.capacidad === 'object' 
                                        ? `${room.capacidad.adultos + room.capacidad.ninos} huéspedes (${room.capacidad.adultos} adultos, ${room.capacidad.ninos} niños)` 
                                        : `${room.capacidad || 2} huéspedes`}
                                    </div>
                                    <div>{room.tipo || 'Estándar'}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2">Las habitaciones ya están pre-seleccionadas según su elección anterior</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-1">Solicitudes Especiales</label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    rows="3"
                    value={formData.mensaje}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-brown-medium)] focus:border-[var(--color-brown-medium)]"
                    placeholder="Indique cualquier solicitud especial o comentario"
                  ></textarea>
                </div>
                
                <div className="mt-4">
                  <button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className={`w-full py-3 px-6 rounded-lg text-black font-bold transition-colors ${
                      isFormValid ? 'bg-[var(--color-brown-medium)] hover:bg-[var(--color-brown-dark)]' : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {tipoReservacion === 'individual' ? (
                      'Continuar a Pago'
                    ) : (
                      'Continuar a Reserva de Evento'
                    )}
                  </button>
                </div>
                
                {isSubmitting && (
                  <div className="text-center py-4">
                    <FaSpinner className="mx-auto animate-spin text-[var(--color-brown-medium)]" size={30} />
                    <p className="mt-2 text-gray-600">Procesando su solicitud...</p>
                  </div>
                )}
                
                {reservationError && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
                    <p>{reservationError}</p>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
} 