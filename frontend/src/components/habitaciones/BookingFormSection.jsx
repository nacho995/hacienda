"use client";

import { useState } from 'react';
import Image from 'next/image';
import { FaCalendarAlt, FaCheck, FaWifi, FaCoffee, FaTv, FaSnowflake } from 'react-icons/fa';
import { HABITACIONES } from './RoomListSection';

export default function BookingFormSection({ selectedRoom, onSelectRoom, formData, setFormData }) {
  const [isFormValid, setIsFormValid] = useState(false);
  const [showReservationSuccess, setShowReservationSuccess] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Aquí iría la lógica para enviar la reserva a un API
    console.log("Datos de reserva:", formData);
    
    // Mostrar mensaje de éxito sin hacer scroll
    setShowReservationSuccess(true);
    
    // Reset del formulario después de unos segundos
    setTimeout(() => {
      setShowReservationSuccess(false);
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
                  ¡Reserva Recibida!
                </h3>
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
                    >
                      {[...Array(4)].map((_, i) => (
                        <option key={i} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="habitacion" className="block text-sm font-medium text-gray-700">
                      Seleccionar habitación
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
                      {HABITACIONES.map((habitacion) => (
                        <option key={habitacion.id} value={habitacion.id}>
                          {habitacion.nombre} - ${habitacion.precio}/noche
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="md:col-span-2 space-y-1">
                    <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700">
                      Solicitudes especiales (opcional)
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
                  
                  <div className="md:col-span-2 mt-4">
                    <button 
                      type="submit" 
                      disabled={!isFormValid}
                      className={`w-full py-3 font-medium tracking-wide text-white transition-colors ${
                        isFormValid 
                          ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]' 
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Enviar Solicitud de Reserva
                    </button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Al enviar este formulario, acepta nuestros términos y condiciones de reserva.
                    </p>
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