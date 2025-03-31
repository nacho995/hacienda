"use client";

import { useState } from 'react';
import { FaCalendar, FaUsers, FaEnvelope, FaPhone } from 'react-icons/fa';

export default function ReservationSection() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    tipoEvento: 'boda',
    fechaEvento: '',
    numeroInvitados: '',
    mensaje: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el formulario
    console.log('Formulario enviado:', formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <section id="reservations" className="section-padding bg-[var(--color-cream-light)]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="elegant-title centered fade-in text-5xl md:text-6xl font-[var(--font-display)] text-[var(--color-accent)] mb-12 font-light">
            Haga su <span className="text-[var(--color-primary)] font-semibold">Reservación</span>
          </h2>
          <div className="gold-divider fade-in animate-delay-100"></div>
          <p className="text-xl md:text-2xl font-light fade-in animate-delay-200 mt-10 max-w-4xl mx-auto leading-relaxed">
            Permítanos ayudarle a planificar su evento especial. Complete el formulario y nos pondremos en contacto con usted.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Información Personal */}
            <div className="space-y-6">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Detalles del Evento */}
            <div className="space-y-6">
              <div>
                <label htmlFor="tipoEvento" className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Evento
                </label>
                <select
                  id="tipoEvento"
                  name="tipoEvento"
                  value={formData.tipoEvento}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  required
                >
                  <option value="boda">Boda</option>
                  <option value="corporativo">Evento Corporativo</option>
                  <option value="social">Evento Social</option>
                  <option value="ceremonia">Ceremonia Religiosa</option>
                </select>
              </div>

              <div>
                <label htmlFor="fechaEvento" className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha del Evento
                </label>
                <div className="relative">
                  <FaCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    id="fechaEvento"
                    name="fechaEvento"
                    value={formData.fechaEvento}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="numeroInvitados" className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Invitados
                </label>
                <div className="relative">
                  <FaUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    id="numeroInvitados"
                    name="numeroInvitados"
                    value={formData.numeroInvitados}
                    onChange={handleChange}
                    min="1"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mensaje */}
          <div className="mt-8">
            <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje o Requerimientos Especiales
            </label>
            <textarea
              id="mensaje"
              name="mensaje"
              value={formData.mensaje}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            ></textarea>
          </div>

          {/* Botón de Envío */}
          <div className="mt-8 text-center">
            <button
              type="submit"
              className="bg-[var(--color-primary)] text-white px-12 py-4 rounded-full text-lg font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              Enviar Solicitud
            </button>
          </div>
        </form>
      </div>
    </section>
  );
} 