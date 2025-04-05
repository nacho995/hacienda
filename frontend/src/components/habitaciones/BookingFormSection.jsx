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

export default function BookingFormSection({ selectedRoom, onSelectRoom, formData, setFormData }) {
  const { user } = useAuth();
  const [isFormValid, setIsFormValid] = useState(false);
  const [showReservationSuccess, setShowReservationSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservationError, setReservationError] = useState(null);
  const [reservationConfirmation, setReservationConfirmation] = useState(null);
  const [fechasOcupadas, setFechasOcupadas] = useState([]);
  const [fechaEntrada, setFechaEntrada] = useState(null);
  const [fechaSalida, setFechaSalida] = useState(null);
  const [habitaciones, setHabitaciones] = useState([]);
  const [loadingHabitaciones, setLoadingHabitaciones] = useState(true);

  // Cargar habitaciones desde la API
  useEffect(() => {
    const cargarHabitaciones = async () => {
      try {
        const data = await obtenerHabitaciones();
        setHabitaciones(data);
        setLoadingHabitaciones(false);
      } catch (error) {
        console.error('Error al cargar habitaciones:', error);
        setLoadingHabitaciones(false);
      }
    };

    cargarHabitaciones();
  }, []);

  // Cargar fechas ocupadas desde el backend
  useEffect(() => {
    const cargarFechasOcupadas = async () => {
      try {
        // Si hay una habitación seleccionada, filtrar por tipo
        const params = {};
        if (selectedRoom) {
          params.tipoHabitacion = selectedRoom.tipo;
        }
        
        const fechas = await getHabitacionOccupiedDates(params);
        if (Array.isArray(fechas) && fechas.length > 0) {
          setFechasOcupadas(fechas);
        }
      } catch (error) {
        console.error("Error al cargar fechas ocupadas de habitaciones:", error);
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
    
    // Si se selecciona una habitación desde el select, actualizar el selectedRoom
    if (name === 'habitacion' && value !== '') {
      const room = habitaciones.find(h => h._id === value);
      onSelectRoom(room);
    }
    
    // Validar formulario
    const { nombre, apellidos, email, telefono, fechaEntrada, fechaSalida, habitacion } = {
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
      habitacion !== ''
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid || isSubmitting) return;
    
    setIsSubmitting(true);
    setReservationError(null);
    
    try {
      // Preparar datos para la API
      const selectedRoomData = habitaciones.find(h => h._id === formData.habitacion);
      
      if (!selectedRoomData) {
        throw new Error('Habitación no encontrada');
      }
      
      const fechaEntrada = new Date(formData.fechaEntrada);
      const fechaSalida = new Date(formData.fechaSalida);
      
      // Calcular número de noches
      const diferenciaMs = fechaSalida - fechaEntrada;
      const numeroNoches = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
      
      // Calcular precio total
      const precioTotal = selectedRoomData.precio * numeroNoches;
      
      // Crear objeto de reserva
      const reservaData = {
        usuario: user?._id || null, // El usuario puede estar autenticado o no
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        email: formData.email,
        telefono: formData.telefono,
        tipoHabitacion: selectedRoomData.tipo,
        habitacion: selectedRoomData.nombre, // Asignamos el nombre específico de la habitación
        numeroHabitaciones: 1,
        fechaEntrada: formData.fechaEntrada,
        fechaSalida: formData.fechaSalida,
        numeroAdultos: parseInt(formData.huespedes) || 1,
        numeroNinos: 0,
        peticionesEspeciales: formData.mensaje || '',
        precioTotal: precioTotal,
        // Otros campos se completarán con valores por defecto en el backend
      };
      
      // Enviar a la API
      const response = await createHabitacionReservation(reservaData);
      
      // Guardar confirmación
      setReservationConfirmation(response);
      
      // Mostrar mensaje de éxito
      setShowReservationSuccess(true);
      
      // Reset del formulario después de unos segundos
      setTimeout(() => {
        setFormData({
          nombre: '',
          apellidos: '',
          email: '',
          telefono: '',
          fechaEntrada: '',
          fechaSalida: '',
          huespedes: 1,
          habitacion: '',
          mensaje: ''
        });
        onSelectRoom(null);
      }, 5000);
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

  if (loadingHabitaciones) {
    return (
      <div className="py-16 text-center">
        <FaSpinner className="animate-spin text-4xl text-[var(--color-primary)] mx-auto" />
        <p className="mt-4 text-gray-600">Cargando habitaciones...</p>
      </div>
    );
  }

  return (
    <section id="reserva-form" className="py-16 bg-[var(--color-cream-light)]">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-[var(--font-display)] text-3xl text-center mb-4">
            Haga su Reservación
          </h2>
          <div className="w-16 h-[1px] bg-[var(--color-primary)] mx-auto mb-8"></div>
          
          <div className="bg-white shadow-lg p-8 md:p-10 border border-gray-100">
            {showReservationSuccess ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaCheck className="text-green-600 text-2xl" />
                </div>
                <h3 className="text-2xl font-[var(--font-display)] text-[var(--color-accent)] mb-4">
                  ¡Reserva Confirmada!
                </h3>
                {reservationConfirmation && (
                  <div className="mb-6 p-4 bg-[var(--color-primary-5)] border border-[var(--color-primary-20)] rounded">
                    <p className="font-medium mb-2">Número de confirmación:</p>
                    <p className="text-xl font-bold text-[var(--color-primary)]">
                      {reservationConfirmation.numeroConfirmacion || 'Pendiente'}
                    </p>
                  </div>
                )}
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  Gracias por su reserva. Hemos recibido su solicitud y nos pondremos en contacto con usted a la brevedad para confirmar los detalles.
                </p>
                <button 
                  onClick={() => setShowReservationSuccess(false)}
                  className="btn-primary"
                >
                  Realizar otra reserva
                </button>
              </div>
            ) : (
              <>
                {selectedRoom && (
                  <div className="mb-8 p-4 bg-[var(--color-primary-5)] border border-[var(--color-primary-20)] rounded-sm">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="relative w-full md:w-1/3 h-40 overflow-hidden">
                        <Image 
                          src={selectedRoom.imagen}
                          alt={selectedRoom.nombre}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                      <div className="md:w-2/3">
                        <h3 className="font-[var(--font-display)] text-xl mb-2">
                          {selectedRoom.nombre}
                        </h3>
                        <div className="text-[var(--color-primary)] font-semibold mb-2">
                          ${selectedRoom.precio} <span className="text-sm font-normal text-gray-500">/ noche</span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {selectedRoom.tamaño} | {selectedRoom.camas} | Máx. {selectedRoom.capacidad} personas
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {selectedRoom.amenidades.slice(0, 4).map((amenidad, index) => (
                            <div key={index} className="flex items-center">
                              <FaCheck className="mr-2 text-xs text-[var(--color-primary)]" />
                              {amenidad}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                        Nombre
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700">
                        Apellidos
                      </label>
                      <input
                        type="text"
                        id="apellidos"
                        name="apellidos"
                        value={formData.apellidos}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                        required
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Correo electrónico
                      </label>
                      <input 
                        type="email" 
                        id="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                        required
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
                        Teléfono
                      </label>
                      <input 
                        type="tel" 
                        id="telefono" 
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                        required
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label htmlFor="huespedes" className="block text-sm font-medium text-gray-700">
                        Número de huéspedes
                      </label>
                      <select 
                        id="huespedes" 
                        name="huespedes"
                        value={formData.huespedes}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                        required
                      >
                        {[...Array(selectedRoom ? selectedRoom.capacidad : 4).keys()].map(i => (
                          <option key={i+1} value={i+1}>{i+1} {i === 0 ? 'persona' : 'personas'}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-1">
                      <label htmlFor="habitacion" className="block text-sm font-medium text-gray-700">
                        Habitación
                      </label>
                      <select 
                        id="habitacion" 
                        name="habitacion"
                        value={formData.habitacion}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                        required
                      >
                        <option value="">Seleccione una habitación</option>
                        {habitaciones.map(h => (
                          <option key={h._id} value={h.nombre}>
                            {h.nombre} - ${h.precio}/noche
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Fechas de estancia
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DatePicker
                        selected={fechaEntrada}
                        onChange={date => setFechaEntrada(date)}
                        selectsStart
                        startDate={fechaEntrada}
                        endDate={fechaSalida}
                        minDate={new Date()}
                        filterDate={esDisponible}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Fecha de entrada"
                        className="w-full p-2 border border-gray-300 focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                        required
                      />
                      <DatePicker
                        selected={fechaSalida}
                        onChange={date => setFechaSalida(date)}
                        selectsEnd
                        startDate={fechaEntrada}
                        endDate={fechaSalida}
                        minDate={fechaEntrada}
                        filterDate={esDisponible}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Fecha de salida"
                        className="w-full p-2 border border-gray-300 focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700">
                      Peticiones especiales (opcional)
                    </label>
                    <textarea 
                      id="mensaje" 
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full p-2 border border-gray-300 focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                    ></textarea>
                  </div>
                  
                  {reservationError && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                      <p>{reservationError}</p>
                    </div>
                  )}
                  
                  <button 
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className={`w-full py-3 font-medium tracking-wide transition-colors duration-300 ${
                      isFormValid && !isSubmitting
                        ? 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-primary)]'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <FaSpinner className="animate-spin mr-2" />
                        Procesando...
                      </span>
                    ) : (
                      'Confirmar Reserva'
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
} 