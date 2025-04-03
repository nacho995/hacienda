"use client";

import { useState } from 'react';
import Image from 'next/image';
import { FaCalendarAlt, FaCheck, FaWifi, FaCoffee, FaTv, FaSnowflake } from 'react-icons/fa';
import { HABITACIONES } from './RoomListSection';
import { createHabitacionReservation } from '@/services/reservationService';
import { useAuth } from '@/contexts/AuthContext';

export default function BookingFormSection({ selectedRoom, onSelectRoom, formData, setFormData }) {
  const { user } = useAuth();
  const [isFormValid, setIsFormValid] = useState(false);
  const [showReservationSuccess, setShowReservationSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservationError, setReservationError] = useState(null);
  const [reservationConfirmation, setReservationConfirmation] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Si se selecciona una habitación desde el select, actualizar el selectedRoom
    if (name === 'habitacion' && value !== '') {
      const roomId = parseInt(value);
      const room = HABITACIONES.find(h => h.id === roomId);
      onSelectRoom(room);
    }
    
    // Validar formulario
    const { nombre, email, telefono, fechaEntrada, fechaSalida, habitacion } = {
      ...formData,
      [name]: value
    };
    setIsFormValid(
      nombre !== '' && 
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
      const selectedRoomData = HABITACIONES.find(h => h.id.toString() === formData.habitacion);
      
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
        apellidos: formData.nombre.split(' ').slice(1).join(' ') || "No proporcionado", // Aproximación simple
        email: formData.email,
        telefono: formData.telefono,
        tipoHabitacion: selectedRoomData.tipoHabitacion,
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
                        <div className="flex flex-wrap gap-x-4 text-xs text-gray-700">
                          <div className="flex items-center">
                            <FaWifi className="mr-1 text-[var(--color-primary)]" />
                            WiFi
                          </div>
                          <div className="flex items-center">
                            <FaCoffee className="mr-1 text-[var(--color-primary)]" />
                            Desayuno
                          </div>
                          <div className="flex items-center">
                            <FaTv className="mr-1 text-[var(--color-primary)]" />
                            TV
                          </div>
                          <div className="flex items-center">
                            <FaSnowflake className="mr-1 text-[var(--color-primary)]" />
                            A/C
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {reservationError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                    <p className="font-medium">Error:</p>
                    <p>{reservationError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Datos personales */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium text-[var(--color-accent)] mb-4 pb-2 border-b border-gray-200">
                      Información Personal
                    </h3>
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                      Nombre completo
                    </label>
                    <input 
                      type="text" 
                      id="nombre" 
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 focus:border-[var(--color-primary)] focus:outline-none transition-colors" 
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
                      Teléfono de contacto
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
                  
                  <div></div>
                  
                  {/* Datos de reserva */}
                  <div className="md:col-span-2 mt-4">
                    <h3 className="text-lg font-medium text-[var(--color-accent)] mb-4 pb-2 border-b border-gray-200">
                      Detalles de Reserva
                    </h3>
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="fechaEntrada" className="block text-sm font-medium text-gray-700">
                      Fecha de entrada
                    </label>
                    <div className="relative">
                      <input 
                        type="date" 
                        id="fechaEntrada" 
                        name="fechaEntrada"
                        value={formData.fechaEntrada}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full p-2 pl-3 pr-10 border border-gray-300 focus:border-[var(--color-primary)] focus:outline-none transition-colors cursor-pointer"
                        required
                        onClick={(e) => {
                          // Asegurarse de que el calendario se abre al hacer clic en cualquier parte del contenedor
                          e.currentTarget.showPicker && e.currentTarget.showPicker();
                        }}
                      />
                      <div className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                        <FaCalendarAlt />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="fechaSalida" className="block text-sm font-medium text-gray-700">
                      Fecha de salida
                    </label>
                    <div className="relative">
                      <input 
                        type="date" 
                        id="fechaSalida" 
                        name="fechaSalida"
                        value={formData.fechaSalida}
                        onChange={handleInputChange}
                        min={formData.fechaEntrada || new Date().toISOString().split('T')[0]}
                        className="w-full p-2 pl-3 pr-10 border border-gray-300 focus:border-[var(--color-primary)] focus:outline-none transition-colors cursor-pointer"
                        required
                        onClick={(e) => {
                          // Asegurarse de que el calendario se abre al hacer clic en cualquier parte del contenedor
                          e.currentTarget.showPicker && e.currentTarget.showPicker();
                        }}
                      />
                      <div className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                        <FaCalendarAlt />
                      </div>
                    </div>
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
                      Tipo de habitación
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
                      {HABITACIONES.map(h => (
                        <option key={h.id} value={h.id}>
                          {h.nombre} - ${h.precio}/noche
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-1">
                      Peticiones especiales
                    </label>
                    <textarea 
                      id="mensaje" 
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleInputChange}
                      rows="4" 
                      className="w-full p-2 border border-gray-300 focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                      placeholder="Indique cualquier petición especial, alergias, necesidades de accesibilidad, etc."
                    ></textarea>
                  </div>
                  
                  <div className="md:col-span-2 mt-4 text-center">
                    <button 
                      type="submit"
                      disabled={!isFormValid || isSubmitting}
                      className={`btn-primary px-10 ${(!isFormValid || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isSubmitting ? 'Procesando...' : 'Confirmar Reserva'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
} 