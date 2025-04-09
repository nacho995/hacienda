"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaCalendarAlt, FaCheck, FaWifi, FaCoffee, FaTv, FaSnowflake, FaUserFriends, FaDoorOpen, FaEnvelope, FaPhone, FaPen, FaSpinner } from 'react-icons/fa';
import { toast } from 'sonner';
import { createReservacion, createMultipleReservaciones, getHabitacionOccupiedDates } from '@/services/reservationService';
import { obtenerHabitaciones } from '@/services/habitaciones.service';
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
  onTipoReservaChange
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
  const [ocultarOpcionesCategoriaHabitacion, setOcultarOpcionesCategoriaHabitacion] = useState(false);
  const [esReservaMultiple, setEsReservaMultiple] = useState(false);

  const [categoriaHabitacion, setCategoriaHabitacion] = useState('doble');
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
  
  // Precios predeterminados según categoría
  const precioSencilla = 2400;
  const precioDoble = 2600;

  // Estado adicional para la confirmación de reserva múltiple
  const [multipleReservationConfirmations, setMultipleReservationConfirmations] = useState([]);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [processingMultipleRooms, setProcessingMultipleRooms] = useState(false);
  
  // Estado para el número de habitaciones para eventos
  const [totalHabitaciones, setTotalHabitaciones] = useState(7);

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
    
    if (name === 'totalHabitaciones') {
      const numValue = parseInt(value);
      if (numValue >= 7 && numValue <= 14) {
        setTotalHabitaciones(numValue);
        setFormData(prev => ({
          ...prev,
          totalHabitaciones: numValue
        }));
      }
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validar formulario
    const { nombre, apellidos, email, telefono } = {
      ...formData,
      [name]: value
    };
    setIsFormValid(
      nombre !== '' && 
      apellidos !== '' &&
      email !== '' && 
      telefono !== ''
    );
  };

  // Procesar pago con tarjeta
  const procesarPagoTarjeta = async () => {
    // Validar datos de la tarjeta
    if (!datosTarjeta.numeroTarjeta || !datosTarjeta.nombreTitular || !datosTarjeta.fechaExpiracion || !datosTarjeta.cvv) {
      setReservationError('Por favor, complete todos los campos obligatorios de la tarjeta');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Aquí se integraría con un procesador de pagos real
      console.log('Procesando pago con tarjeta:', datosTarjeta);
      
      // Simulamos un procesamiento exitoso
      // En una implementación real, aquí se enviarían los datos a un procesador de pagos
      
      // Preparar los datos para enviar al backend
      let reservaData = {
        ...formData,
        habitacion: selectedRoom?._id,
        tipoHabitacion: selectedRoom?.tipo,
        metodoPago: 'tarjeta',
        categoriaHabitacion: categoriaHabitacion,
        precioPorNoche: categoriaHabitacion === 'sencilla' ? precioSencilla : precioDoble,
        // Información de pago (en producción, no se enviarían datos sensibles como el CVV)
        infoPago: {
          ultimosDigitos: datosTarjeta.numeroTarjeta.slice(-4),
          titular: datosTarjeta.nombreTitular
        }
      };
      
      // Si es reserva múltiple, preparar datos de todas las habitaciones
      if (esReservaMultiple && selectedRooms.length > 0) {
        console.log('Procesando reserva múltiple con tarjeta:', selectedRooms.length, 'habitaciones');
        const reservas = [];
        
        for (const room of selectedRooms) {
          const reservaIndividual = {
            ...formData,
            habitacion: room._id,
            tipoHabitacion: room.tipo,
            numeroHabitaciones: 1,
            metodoPago: 'tarjeta',
                categoriaHabitacion: room.categoriaHabitacion || categoriaHabitacion,
            precioPorNoche: room.precio || (room.categoriaHabitacion === 'sencilla' ? precioSencilla : precioDoble),
            infoPago: {
              ultimosDigitos: datosTarjeta.numeroTarjeta.slice(-4),
              titular: datosTarjeta.nombreTitular
            }
          };
          reservas.push(reservaIndividual);
        }
        
        console.log('Datos de reservas múltiples con tarjeta:', reservas);
        const response = await createMultipleReservaciones(reservas);
        
        if (response.success) {
          setMultipleReservationConfirmations(response.data);
          setShowReservationSuccess(true);
          toast.success('Pago procesado correctamente. Sus habitaciones han sido reservadas con éxito');
        } else {
          console.error('Error en la respuesta:', response);
          setReservationError(response.message || 'Error al procesar su reserva');
        }
      } else {
        // Reserva individual
        console.log('Datos de reserva individual con tarjeta:', reservaData);
        const response = await createReservacion(reservaData);
        
        if (response.success) {
          setReservationConfirmation(response.data);
          setShowReservationSuccess(true);
          toast.success('Pago procesado correctamente. Su habitación ha sido reservada con éxito');
        } else {
          console.error('Error en la respuesta:', response);
          setReservationError(response.message || 'Error al procesar su reserva');
        }
      }
    } catch (error) {
      console.error('Error al procesar el pago con tarjeta:', error);
      setReservationError(error.message || 'Error al procesar el pago. Por favor, inténtelo de nuevo.');
    } finally {
      setIsSubmitting(false);
      setMostrarFormularioTarjeta(false);
    }
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
    
    // Verificar que se ha seleccionado al menos una habitación
    if (selectedRooms.length === 0 && !selectedRoom) {
      setReservationError('Por favor, seleccione al menos una habitación para reservar');
      return;
    }
    
    setMostrarPago(true);
  };

  // Procesar pago de la reserva
  const procesarPago = async (metodo) => {
    if (!formData.fechaEntrada || !formData.fechaSalida) {
      setReservationError('Por favor, seleccione fechas de entrada y salida');
      return;
    }
    
    setMetodoPago(metodo);
    setReservationError(null);
    
    // Si el método es tarjeta, mostrar el formulario de tarjeta
    if (metodo === 'tarjeta') {
      setMostrarFormularioTarjeta(true);
      return;
    }
    
    // Si es efectivo, continuar con el proceso normal
    setIsSubmitting(true);
    
    try {
      console.log('Procesando reserva con método:', metodo);
      
      // Calcular la duración de la estancia en días
      const fechaInicio = new Date(formData.fechaEntrada);
      const fechaFin = new Date(formData.fechaSalida);
      const duracionEstancia = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));

      // Calcular precios
      const precioPorNoche = categoriaHabitacion === 'sencilla' ? precioSencilla : precioDoble;
      const precioTotal = precioPorNoche * duracionEstancia;
      
      // Si hay múltiples habitaciones seleccionadas
      if (selectedRooms && selectedRooms.length > 0) {
        console.log('Procesando reserva con', selectedRooms.length, 'habitaciones');
        const reservas = [];
        
        for (const room of selectedRooms) {
          const precioPorNocheHab = room.precio || (room.categoriaHabitacion === 'sencilla' ? precioSencilla : precioDoble);
          const precioTotalHab = precioPorNocheHab * duracionEstancia;
          
          const reservaIndividual = {
            // Datos de contacto
            nombreContacto: formData.nombre,
            apellidosContacto: formData.apellidos,
            emailContacto: formData.email,
            telefonoContacto: formData.telefono,
            
            // Datos de la habitación
            habitacion: room.letra || 'A', // Usar letra en lugar de ID
            tipoHabitacion: room.tipo || 'doble',
            
            // Fechas
            fechaEntrada: formData.fechaEntrada,
            fechaSalida: formData.fechaSalida,
            
            // Detalles de la reserva
            numHuespedes: formData.huespedes || 1,
            numeroHabitaciones: 1,
            tipoReserva: 'hotel',
            estadoReserva: 'pendiente',
            
            // Detalles de pago
            metodoPago: metodo,
            estadoPago: 'pendiente',
            
            // Categoría y precios
            categoriaHabitacion: room.categoriaHabitacion || categoriaHabitacion,
            precioPorNoche: precioPorNocheHab,
            precio: precioTotalHab,
            
            // Información adicional
            mensaje: formData.mensaje || '',
            esReservaIndependiente: true
          };
          reservas.push(reservaIndividual);
        }
        
        console.log('Datos de reservas múltiples:', reservas);
        const response = await createMultipleReservaciones(reservas);
        
        if (response.success) {
          setMultipleReservationConfirmations(response.data);
          setShowReservationSuccess(true);
          
          if (response.errores && response.errores.length > 0) {
            // Algunas reservas fallaron
            toast.warning(`${response.message}. Revise los detalles para más información.`);
          } else {
            // Todas las reservas fueron exitosas
            toast.success('Sus habitaciones han sido reservadas con éxito');
          }
        } else {
          console.error('Error en la respuesta:', response);
          setReservationError(response.message || 'Error al procesar su reserva');
          toast.error(response.message || 'Error al procesar su reserva');
        }
      } else {
        // Reserva individual
        const reservaData = {
          // Datos de contacto
          nombreContacto: formData.nombre,
          apellidosContacto: formData.apellidos,
          emailContacto: formData.email,
          telefonoContacto: formData.telefono,
          
          // Datos de la habitación
          habitacion: selectedRoom?._id || 'Habitación estándar',
          tipoHabitacion: selectedRoom?.tipo || 'doble',
          
          // Fechas
          fechaEntrada: formData.fechaEntrada,
          fechaSalida: formData.fechaSalida,
          
          // Detalles de la reserva
          numHuespedes: formData.huespedes || 1,
          numeroHabitaciones: 1,
          tipoReserva: 'hotel',
          estadoReserva: 'pendiente',
          
          // Detalles de pago
          metodoPago: metodo,
          estadoPago: 'pendiente',
          
          // Categoría y precios
          categoriaHabitacion: categoriaHabitacion,
          precioPorNoche: precioPorNoche,
          precio: precioTotal,
          
          // Información adicional
          mensaje: formData.mensaje || '',
          esReservaIndependiente: true
        };
        
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

  return (
    <section id="reserva-form" className="py-16 bg-[var(--color-cream-light)]">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-[var(--font-display)] text-center text-black mb-4">
            {selectedRooms.length > 0 ? (
              <>
                Reservar Habitación{' '}
                {selectedRooms.map((room, index) => (
                  <React.Fragment key={room._id}>
                    <span className={room.tipo === 'sencilla' ? 'text-[var(--color-primary)]' : 'text-[var(--color-accent)]'}>
                      {room.letra}
                    </span>
                    {index < selectedRooms.length - 1 && ', '}
                  </React.Fragment>
                ))}
              </>
            ) : (
              'Completar Reserva'
            )}
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
                
                {multipleReservationConfirmations.length > 0 ? (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 text-[var(--color-accent)]">Detalle de habitaciones reservadas</h4>
                    <div className="space-y-4">
                      {multipleReservationConfirmations.map((confirmacion, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg text-left">
                          <p><span className="font-semibold">Habitación:</span> {selectedRooms[index]?.letra || 'N/A'} ({selectedRooms[index]?.tipo || 'N/A'})</p>
                          <p><span className="font-semibold">Número de reserva:</span> {confirmacion._id || 'N/A'}</p>
                          <p><span className="font-semibold">Fechas:</span> {new Date(formData.fechaEntrada).toLocaleDateString('es-ES')} - {new Date(formData.fechaSalida).toLocaleDateString('es-ES')}</p>
                          <p><span className="font-semibold">Método de pago:</span> {metodoPago === 'tarjeta' ? 'Tarjeta de crédito/débito' : 'Efectivo al llegar'}</p>
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
                    <p><span className="font-semibold">Número de reserva:</span> {reservationConfirmation?._id || 'N/A'}</p>
                    <p><span className="font-semibold">Habitación:</span> {selectedRoom?.nombre}</p>
                    <p><span className="font-semibold">Fechas:</span> {new Date(formData.fechaEntrada).toLocaleDateString('es-ES')} - {new Date(formData.fechaSalida).toLocaleDateString('es-ES')}</p>
                    <p><span className="font-semibold">Método de pago:</span> {metodoPago === 'tarjeta' ? 'Tarjeta de crédito/débito' : 'Efectivo al llegar'}</p>
                  </div>
                )}
                
                <p className="text-gray-600 text-sm">
                  Hemos enviado un correo electrónico con los detalles de su reserva.
                </p>
              </div>
            ) : mostrarFormularioTarjeta ? (
              <div className="py-10">
                <h3 className="text-2xl font-semibold text-[var(--color-primary)] mb-6 text-center">Pago con Tarjeta</h3>
                
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <div className="mb-4">
                    <label htmlFor="numeroTarjeta" className="block text-sm font-medium text-gray-700 mb-1">Número de Tarjeta *</label>
                    <input
                      type="text"
                      id="numeroTarjeta"
                      name="numeroTarjeta"
                      value={datosTarjeta.numeroTarjeta}
                      onChange={(e) => {
                        // Solo permitir números y limitar a 16 dígitos
                        const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                        setDatosTarjeta({...datosTarjeta, numeroTarjeta: value});
                      }}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-brown-medium)] focus:border-[var(--color-brown-medium)]"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="nombreTitular" className="block text-sm font-medium text-gray-700 mb-1">Nombre del Titular *</label>
                    <input
                      type="text"
                      id="nombreTitular"
                      name="nombreTitular"
                      value={datosTarjeta.nombreTitular}
                      onChange={(e) => setDatosTarjeta({...datosTarjeta, nombreTitular: e.target.value})}
                      placeholder="Como aparece en la tarjeta"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-brown-medium)] focus:border-[var(--color-brown-medium)]"
                      required
                    />
                  </div>
                  
                  <div className="flex space-x-4 mb-4">
                    <div className="flex-1">
                      <label htmlFor="fechaExpiracion" className="block text-sm font-medium text-gray-700 mb-1">Fecha de Expiración *</label>
                      <input
                        type="text"
                        id="fechaExpiracion"
                        name="fechaExpiracion"
                        value={datosTarjeta.fechaExpiracion}
                        onChange={(e) => {
                          // Formato MM/AA y validación
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length > 2) {
                            value = value.slice(0, 2) + '/' + value.slice(2, 4);
                          }
                          setDatosTarjeta({...datosTarjeta, fechaExpiracion: value});
                        }}
                        placeholder="MM/AA"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-brown-medium)] focus:border-[var(--color-brown-medium)]"
                        required
                      />
                    </div>
                    <div className="w-1/3">
                      <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">CVV *</label>
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        value={datosTarjeta.cvv}
                        onChange={(e) => {
                          // Solo permitir números y limitar a 3-4 dígitos
                          const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                          setDatosTarjeta({...datosTarjeta, cvv: value});
                        }}
                        placeholder="123"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-brown-medium)] focus:border-[var(--color-brown-medium)]"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">Dirección de Facturación *</label>
                    <input
                      type="text"
                      id="direccion"
                      name="direccion"
                      value={datosTarjeta.direccion}
                      onChange={(e) => setDatosTarjeta({...datosTarjeta, direccion: e.target.value})}
                      placeholder="Calle y número"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-brown-medium)] focus:border-[var(--color-brown-medium)]"
                      required
                    />
                  </div>
                  
                  <div className="flex space-x-4 mb-4">
                    <div className="w-1/3">
                      <label htmlFor="codigoPostal" className="block text-sm font-medium text-gray-700 mb-1">Código Postal *</label>
                      <input
                        type="text"
                        id="codigoPostal"
                        name="codigoPostal"
                        value={datosTarjeta.codigoPostal}
                        onChange={(e) => {
                          // Solo permitir números y limitar a 5 dígitos (México)
                          const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                          setDatosTarjeta({...datosTarjeta, codigoPostal: value});
                        }}
                        placeholder="12345"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-brown-medium)] focus:border-[var(--color-brown-medium)]"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label htmlFor="ciudad" className="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
                      <input
                        type="text"
                        id="ciudad"
                        name="ciudad"
                        value={datosTarjeta.ciudad}
                        onChange={(e) => setDatosTarjeta({...datosTarjeta, ciudad: e.target.value})}
                        placeholder="Ciudad"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-brown-medium)] focus:border-[var(--color-brown-medium)]"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                    <select
                      id="estado"
                      name="estado"
                      value={datosTarjeta.estado}
                      onChange={(e) => setDatosTarjeta({...datosTarjeta, estado: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-brown-medium)] focus:border-[var(--color-brown-medium)]"
                      required
                    >
                      <option value="">Seleccione un estado</option>
                      <option value="Aguascalientes">Aguascalientes</option>
                      <option value="Baja California">Baja California</option>
                      <option value="Baja California Sur">Baja California Sur</option>
                      <option value="Campeche">Campeche</option>
                      <option value="Chiapas">Chiapas</option>
                      <option value="Chihuahua">Chihuahua</option>
                      <option value="Ciudad de México">Ciudad de México</option>
                      <option value="Coahuila">Coahuila</option>
                      <option value="Colima">Colima</option>
                      <option value="Durango">Durango</option>
                      <option value="Estado de México">Estado de México</option>
                      <option value="Guanajuato">Guanajuato</option>
                      <option value="Guerrero">Guerrero</option>
                      <option value="Hidalgo">Hidalgo</option>
                      <option value="Jalisco">Jalisco</option>
                      <option value="Michoacán">Michoacán</option>
                      <option value="Morelos">Morelos</option>
                      <option value="Nayarit">Nayarit</option>
                      <option value="Nuevo León">Nuevo León</option>
                      <option value="Oaxaca">Oaxaca</option>
                      <option value="Puebla">Puebla</option>
                      <option value="Querétaro">Querétaro</option>
                      <option value="Quintana Roo">Quintana Roo</option>
                      <option value="San Luis Potosí">San Luis Potosí</option>
                      <option value="Sinaloa">Sinaloa</option>
                      <option value="Sonora">Sonora</option>
                      <option value="Tabasco">Tabasco</option>
                      <option value="Tamaulipas">Tamaulipas</option>
                      <option value="Tlaxcala">Tlaxcala</option>
                      <option value="Veracruz">Veracruz</option>
                      <option value="Yucatán">Yucatán</option>
                      <option value="Zacatecas">Zacatecas</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <button
                      onClick={() => {
                        setMostrarFormularioTarjeta(false);
                        setMostrarPago(true);
                      }}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Volver
                    </button>
                    
                    <button
                      onClick={procesarPagoTarjeta}
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-[var(--color-brown-medium)] text-black font-bold rounded-lg hover:bg-[var(--color-brown-dark)] transition-colors"
                    >
                      Confirmar Pago
                    </button>
                  </div>
                </div>
                
                <div className="text-center text-sm text-gray-600">
                  <p className="mb-2">Pago seguro con encriptación SSL</p>
                  <div className="flex justify-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Sus datos están protegidos</span>
                  </div>
                </div>
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
                      <div className={selectedRooms.length > 4 ? 'space-y-3 max-h-40 overflow-y-auto pr-2' : 'space-y-3'}>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Número de Habitaciones para Eventos (7-14)</label>
                      <select
                        id="totalHabitaciones"
                        name="totalHabitaciones"
                        value={totalHabitaciones}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--color-brown-medium)] focus:border-[var(--color-brown-medium)]"
                      >
                        {[7, 8, 9, 10, 11, 12, 13, 14].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
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
                    Continuar a Pago
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