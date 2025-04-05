"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaUsers, FaChevronRight, FaCheck, FaRegClock, FaExclamationTriangle } from 'react-icons/fa';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { createEventoReservation, checkEventoAvailability, getEventoOccupiedDates, createMasajeReservation, checkMasajeAvailability } from '@/services/reservationService';
import { getTiposMasaje } from '@/services/masajeService';
import { getTiposEvento } from '@/services/eventoService';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

// Importar componentes
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default function ReservarPage() {
  const [formData, setFormData] = useState({
    tipoEvento: '',
    fecha: null,
    invitados: 50,
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    comentarios: '',
    masajesSeleccionados: [],
    masajePreseleccionado: null
  });

  const [tiposEvento, setTiposEvento] = useState([]); // Estado para tipos de evento
  const [tiposMasaje, setTiposMasaje] = useState([]); // Estado para tipos de masaje
  const [loading, setLoading] = useState(true); // Nuevo estado para manejar la carga
  
  const [paso, setPaso] = useState(1);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);
  const [fechasOcupadas, setFechasOcupadas] = useState([]);
  
  // Cargar fechas ocupadas desde el backend al montar el componente
  useEffect(() => {
    const cargarFechasOcupadas = async () => {
      try {
        // Obtener fechas ocupadas de eventos
        const fechas = await getEventoOccupiedDates();
        if (Array.isArray(fechas) && fechas.length > 0) {
          // Convertir a fechas simples para el calendario
          const fechasSimples = fechas.map(item => item.fecha);
          setFechasOcupadas(fechasSimples);
        }
      } catch (error) {
        console.error("Error al cargar fechas ocupadas:", error);
        toast.error("No se pudieron cargar las fechas ocupadas");
      }
    };
    
    cargarFechasOcupadas();
  }, []);
  
  // Efecto para manejar los parámetros de URL al cargar la página
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tipo') === 'masaje') {
      const masajePreseleccionado = {
        id: params.get('id'),
        titulo: params.get('nombre'),
        duracion: params.get('duracion'),
        precio: parseInt(params.get('precio')) || 0
      };
      
      setFormData(prev => ({
        ...prev,
        masajePreseleccionado
      }));

      // Mostrar mensaje informativo
      toast.info('Seleccione un tipo de evento para continuar con la reserva del masaje');
    }
  }, []);
  
  // Cargar tipos de evento al montar el componente
  useEffect(() => {
    const cargarTiposEvento = async () => {
      try {
        setLoading(true);
        const tipos = await getTiposEvento();
        if (Array.isArray(tipos)) {
          setTiposEvento(tipos);
        } else {
          console.error('Los tipos de evento no son un array:', tipos);
          toast.error('Error al cargar los tipos de evento');
        }
      } catch (error) {
        console.error('Error al cargar tipos de evento:', error);
        toast.error('No se pudieron cargar los tipos de evento');
      } finally {
        setLoading(false);
      }
    };

    cargarTiposEvento();
  }, []);
  
  // Cargar tipos de masaje al montar el componente
  useEffect(() => {
    const cargarTiposMasaje = async () => {
      try {
        const tipos = await getTiposMasaje();
        setTiposMasaje(tipos);
      } catch (error) {
        console.error('Error al cargar tipos de masaje:', error);
        toast.error('No se pudieron cargar los tipos de masaje');
      }
    };

    cargarTiposMasaje();
  }, []);
  
  const handleSelectTipoEvento = (tipo) => {
    setFormData(prev => {
      const newFormData = { ...prev, tipoEvento: tipo };
      
      // Si hay un masaje preseleccionado, lo agregamos a masajesSeleccionados
      if (prev.masajePreseleccionado && !prev.masajesSeleccionados.some(m => m.id === prev.masajePreseleccionado.id)) {
        newFormData.masajesSeleccionados = [prev.masajePreseleccionado];
      }
      
      return newFormData;
    });
    
    setPaso(2);
    document.getElementById('paso-2').scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleFechaChange = (date) => {
    setFechaSeleccionada(date);
    setFormData(prev => ({ ...prev, fecha: date }));
  };
  
  const handleInvitadosChange = (e) => {
    const valor = parseInt(e.target.value);
    setFormData(prev => ({ ...prev, invitados: valor }));
  };
  
  const handleProceedToPaso3 = () => {
    setPaso(3);
    document.getElementById('paso-3').scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmitMasaje = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);
    
    try {
      if (!formData.fecha || !formData.nombre || !formData.apellidos || !formData.email || !formData.telefono) {
        setSubmitError('Por favor, completa todos los campos obligatorios.');
        toast.error('Faltan datos obligatorios');
        return;
      }

      const fechaReserva = formData.fecha instanceof Date ? formData.fecha : new Date(formData.fecha);
      
      const reservaMasajeData = {
        tipoMasaje: formData.masajePreseleccionado.id,
        duracion: parseInt(formData.masajePreseleccionado.duracion),
        fecha: fechaReserva.toISOString().split('T')[0],
        hora: '10:00', // Hora por defecto
        nombreContacto: formData.nombre,
        apellidosContacto: formData.apellidos,
        emailContacto: formData.email,
        telefonoContacto: formData.telefono,
        comentarios: formData.comentarios
      };

      // Verificar disponibilidad
      const disponibilidadResponse = await checkMasajeAvailability({
        fecha: reservaMasajeData.fecha,
        hora: reservaMasajeData.hora,
        duracion: reservaMasajeData.duracion
      });

      if (!disponibilidadResponse.disponible) {
        setSubmitError('El horario seleccionado no está disponible.');
        toast.error('Horario no disponible');
        return;
      }

      // Crear la reserva
      const response = await createMasajeReservation(reservaMasajeData);
      setConfirmationData(response.data);
      toast.success('Reserva de masaje creada con éxito');
      setPaso(4);
    } catch (error) {
      console.error('Error al crear la reserva de masaje:', error);
      setSubmitError(error.response?.data?.message || 'Error al crear la reserva');
      toast.error('Error al crear la reserva');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      // Validar campos obligatorios
      if (!formData.fecha || !formData.nombre || !formData.apellidos || !formData.email || !formData.telefono) {
        setSubmitError('Por favor, completa todos los campos obligatorios.');
        toast.error('Faltan datos obligatorios');
        return;
      }

      // Validar tipo de evento
      if (!formData.tipoEvento) {
        setSubmitError('Por favor, seleccione un tipo de evento.');
        toast.error('Seleccione un tipo de evento');
        return;
      }

      // Validar número de invitados
      if (formData.invitados < 10) {
        setSubmitError('El número mínimo de invitados es 10.');
        toast.error('Número de invitados inválido');
        return;
      }

      const fechaEvento = formData.fecha instanceof Date ? formData.fecha : new Date(formData.fecha);
      
      // Obtener el tipo de evento seleccionado
      const tipoEventoSeleccionado = tiposEvento.find(t => t.id === formData.tipoEvento);
      if (!tipoEventoSeleccionado) {
        setSubmitError('Tipo de evento no válido');
        toast.error('Tipo de evento inválido');
        return;
      }

      // Verificar disponibilidad
      const disponibilidadData = {
        fecha: fechaEvento.toISOString().split('T')[0],
        horaInicio: "09:00",
        horaFin: "21:00",
        espacio: tipoEventoSeleccionado.espacio || 'jardin'
      };

      console.log('Verificando disponibilidad con datos:', disponibilidadData);
      const disponibilidadResponse = await checkEventoAvailability(disponibilidadData);
      console.log('Respuesta de verificación de disponibilidad:', disponibilidadResponse);

      if (!disponibilidadResponse || !disponibilidadResponse.success || !disponibilidadResponse.disponible) {
        const errorMsg = disponibilidadResponse?.mensaje || 'El espacio no está disponible para la fecha seleccionada.';
        console.error('Error de disponibilidad:', errorMsg);
        setSubmitError(errorMsg);
        toast.error(errorMsg);
        setIsSubmitting(false);
        return;
      }

      // Si llegamos aquí, el espacio está disponible
      console.log('Espacio disponible, procediendo con la reserva');

      // Crear objeto de reserva
      const reservaData = {
        tipoEvento: tipoEventoSeleccionado._id,
        nombreEvento: `${formData.nombre} ${formData.apellidos}`,
        fecha: fechaEvento.toISOString().split('T')[0],
        horaInicio: "09:00",
        horaFin: "21:00",
        espacioSeleccionado: tipoEventoSeleccionado.espacio || 'jardin',
        numInvitados: parseInt(formData.invitados),
        nombreContacto: formData.nombre,
        apellidosContacto: formData.apellidos,
        emailContacto: formData.email,
        telefonoContacto: formData.telefono,
        comentarios: formData.comentarios || '',
        serviciosAdicionales: formData.masajesSeleccionados.map(masaje => ({
          tipo: 'masaje',
          id: masaje.id,
          titulo: masaje.titulo,
          precio: masaje.precio
        }))
      };

      console.log('Enviando reserva:', reservaData);
      const response = await createEventoReservation(reservaData);
      
      if (response && response.success) {
        const confirmationData = {
          ...response.data,
          tipoEvento: tipoEventoSeleccionado.titulo,
          fecha: fechaEvento,
          invitados: formData.invitados,
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          email: formData.email,
          telefono: formData.telefono,
          masajesSeleccionados: formData.masajesSeleccionados
        };
        
        setConfirmationData(confirmationData);
        toast.success('Reserva creada con éxito');
        setPaso(4);
      } else {
        const errorMessage = response?.mensaje || response?.message || 'No se pudo procesar la reserva';
        setSubmitError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error al crear la reserva:', error);
      const errorMessage = error.mensaje || error.message || 'Error al crear la reserva';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Deshabilitar fechas pasadas y fechas ocupadas
  const esDisponible = (date) => {
    // Deshabilitar fechas pasadas
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (date < hoy) return false;
    
    // Deshabilitar días ocupados
    return !fechasOcupadas.some(fechaOcupada => 
      date.getDate() === fechaOcupada.getDate() && 
      date.getMonth() === fechaOcupada.getMonth() && 
      date.getFullYear() === fechaOcupada.getFullYear()
    );
  };
  
  // Función para manejar la selección de masajes
  const handleMasajeSelection = (masaje) => {
    setFormData(prev => {
      const masajesActuales = [...prev.masajesSeleccionados];
      const index = masajesActuales.findIndex(m => m.id === masaje.id);
      
      if (index >= 0) {
        masajesActuales.splice(index, 1);
      } else {
        masajesActuales.push(masaje);
      }
      
      return {
        ...prev,
        masajesSeleccionados: masajesActuales
      };
    });
  };
  
  const renderResumenMasajes = () => {
    if (!formData.masajesSeleccionados || formData.masajesSeleccionados.length === 0) {
      return null;
    }

    const totalMasajes = formData.masajesSeleccionados.reduce((total, masaje) => total + masaje.precio, 0);

    return (
      <div className="mt-6 p-4 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30">
        <h4 className="text-lg font-[var(--font-display)] mb-4 text-[var(--color-primary)]">
          Servicios de Masaje Seleccionados
        </h4>
        <div className="space-y-3">
          {formData.masajesSeleccionados.map((masaje, index) => (
            <div key={index} className="flex justify-between items-start p-3 bg-white/50">
              <div>
                <p className="font-medium text-[var(--color-accent)]">{masaje.titulo}</p>
                <p className="text-sm text-gray-600">Duración: {masaje.duracion}</p>
              </div>
              <p className="font-semibold">${masaje.precio}</p>
            </div>
          ))}
          <div className="pt-3 border-t border-[var(--color-primary)]/20">
            <div className="flex justify-between items-center">
              <p className="font-medium">Total Servicios de Masaje:</p>
              <p className="font-semibold text-[var(--color-primary)]">${totalMasajes}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Función para renderizar el masaje preseleccionado
  const renderMasajePreseleccionado = () => {
    if (!formData.masajePreseleccionado) return null;

    return (
      <div className="container-custom mb-8">
        <div className="bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 p-6 rounded-lg">
          <h3 className="text-xl font-[var(--font-display)] text-[var(--color-primary)] mb-4">
            Masaje Preseleccionado
          </h3>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium text-[var(--color-accent)]">{formData.masajePreseleccionado.titulo}</p>
              <p className="text-sm text-gray-600">Duración: {formData.masajePreseleccionado.duracion}</p>
            </div>
            <p className="font-semibold">${formData.masajePreseleccionado.precio}</p>
          </div>
          <p className="mt-4 text-sm text-[var(--color-primary)]">
            * Este masaje se agregará automáticamente como servicio adicional al seleccionar un tipo de evento
          </p>
        </div>
      </div>
    );
  };
  
  // Modificar el renderizado para mostrar información específica de masajes
  const renderPaso1 = () => {
    if (loading) {
      return (
        <section className="container-custom mb-24">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando tipos de eventos...</p>
            </div>
          </div>
        </section>
      );
    }

    if (!tiposEvento || tiposEvento.length === 0) {
      return (
        <section className="container-custom mb-24">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <FaExclamationTriangle className="text-4xl text-yellow-500 mx-auto mb-4" />
              <p className="text-gray-600">No hay tipos de eventos disponibles en este momento.</p>
              <p className="text-sm text-gray-500 mt-2">Por favor, inténtelo más tarde.</p>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="container-custom mb-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 text-[var(--color-primary)]">
            Seleccione el tipo de evento
          </h2>
          <p className="text-xl max-w-3xl mx-auto text-gray-700">
            Elija el tipo de evento que desea realizar en nuestras instalaciones
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {tiposEvento.map((tipo) => (
            <motion.div 
              key={tipo._id || tipo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
              className={`relative bg-white shadow-xl cursor-pointer overflow-hidden h-[400px] border-2 transition-colors ${
                formData.tipoEvento === tipo.id ? 'border-[var(--color-primary)]' : 'border-transparent'
              }`}
              onClick={() => handleSelectTipoEvento(tipo.id)}
              onMouseEnter={() => setHoveredCard(tipo.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="relative h-full">
                <Image
                  src={tipo.imagen || '/images/placeholder/gallery1.svg'}
                  alt={tipo.titulo}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20"></div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-[var(--font-display)] mb-2 shadow-text-strong">{tipo.titulo}</h3>
                <p className="text-white/90 text-sm mb-2 shadow-text line-clamp-2">{tipo.descripcion}</p>
                
                <div className="flex justify-between items-center pt-2 opacity-90">
                  <div className="flex items-center space-x-1 text-xs">
                    <FaUsers className="text-[var(--color-primary)]" />
                    <span>{tipo.capacidad} invitados</span>
                  </div>
                  <div className="text-sm font-medium">{tipo.precio}</div>
                </div>
              </div>
              
              {formData.tipoEvento === tipo.id && (
                <div className="absolute top-3 right-3 w-7 h-7 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                  <FaCheck className="text-white text-sm" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>
    );
  };
  
  // Modificar el renderizado del paso 2 para incluir la selección de masajes
  const renderPaso2 = () => {
    return (
      <section id="paso-2" className={`container-custom mb-24 transition-opacity duration-500 ${paso >= 2 ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={paso >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 text-[var(--color-primary)]">
            Seleccione la fecha y servicios adicionales
          </h2>
          <p className="text-xl max-w-3xl mx-auto text-gray-700">
            Elija la fecha para su {formData.tipoEvento && (tiposEvento.find(t => t.id === formData.tipoEvento)?.titulo || 'evento').toLowerCase()} y los servicios que desee incluir
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Calendario y número de invitados (código existente) */}
          <div className="bg-white p-8 shadow-xl">
            <h3 className="text-2xl font-[var(--font-display)] text-[var(--color-accent)] mb-6 text-center">Seleccionar Fecha</h3>
            
            <div className="mb-8">
              <div 
                className="relative cursor-pointer border border-gray-300 p-4 rounded-lg flex items-center"
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              >
                <FaCalendarAlt className="text-[var(--color-primary)] mr-3" />
                <input 
                  type="text"
                  className="w-full border-none focus:outline-none pointer-events-none bg-transparent"
                  value={fechaSeleccionada ? fechaSeleccionada.toLocaleDateString() : 'Seleccionar fecha'}
                  readOnly
                />
                <FaChevronRight className={`transition-transform duration-300 ${isCalendarOpen ? 'rotate-90' : ''}`} />
              </div>
              
              <div className={`mt-2 transition-all duration-300 overflow-hidden ${isCalendarOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-4 border border-gray-200 rounded-lg shadow-md">
                  <DatePicker
                    selected={fechaSeleccionada}
                    onChange={handleFechaChange}
                    inline
                    filterDate={esDisponible}
                    minDate={new Date()}
                    className="w-full"
                  />
                  
                  <div className="flex justify-between items-center mt-4 text-xs text-gray-500 border-t border-gray-200 pt-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-[var(--color-primary)]/20 border border-[var(--color-primary)] mr-2"></div>
                      <span>Disponible</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-200 border border-gray-300 mr-2"></div>
                      <span>No disponible</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-6 text-sm">
              <div className="flex items-center text-[var(--color-primary)]">
                <FaRegClock className="mr-2" />
                <span>Horario disponible: 9:00 AM - 11:00 PM</span>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Invitados
              </label>
              <div className="relative">
                <FaUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-primary)]" />
                <input 
                  type="number"
                  name="invitados"
                  value={formData.invitados}
                  onChange={handleInvitadosChange}
                  min="10"
                  max="300"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent rounded-lg"
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>Mínimo: 10 invitados</span>
                <span>Máximo: 300 invitados</span>
              </div>
            </div>
          </div>

          {/* Servicios adicionales y resumen */}
          <div className="bg-[var(--color-accent)] text-white p-8 shadow-xl">
            <h3 className="text-2xl font-[var(--font-display)] mb-6">Servicios de Masaje Disponibles</h3>
            
            <div className="space-y-4 mb-8">
              {tiposMasaje.map((masaje) => (
                <div
                  key={masaje.id}
                  className={`p-4 border transition-all cursor-pointer ${
                    formData.masajesSeleccionados.some(m => m.id === masaje.id)
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/20'
                      : 'border-white/20 hover:border-[var(--color-primary)]/50'
                  }`}
                  onClick={() => handleMasajeSelection(masaje)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{masaje.titulo}</h4>
                      <p className="text-sm text-white/80">{masaje.descripcion}</p>
                      <p className="text-sm mt-2">Duración: {masaje.duracion}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${masaje.precio}</p>
                      {formData.masajesSeleccionados.some(m => m.id === masaje.id) && (
                        <FaCheck className="text-[var(--color-primary)] mt-2" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen del evento y servicios seleccionados */}
            <div className="border-t border-white/20 pt-6 mt-6">
              <h4 className="text-lg font-semibold mb-4">Resumen de su selección</h4>
              
              <div className="space-y-2">
                <p>
                  <span className="text-white/80">Evento:</span>{' '}
                  {tiposEvento.find(t => t.id === formData.tipoEvento)?.titulo}
                </p>
                <p>
                  <span className="text-white/80">Fecha:</span>{' '}
                  {formData.fecha ? formData.fecha.toLocaleDateString() : 'No seleccionada'}
                </p>
                <p>
                  <span className="text-white/80">Invitados:</span>{' '}
                  {formData.invitados}
                </p>
                
                {formData.masajesSeleccionados.length > 0 && (
                  <div className="mt-4">
                    <p className="text-white/80">Masajes seleccionados:</p>
                    <ul className="list-disc list-inside mt-2">
                      {formData.masajesSeleccionados.map(masaje => (
                        <li key={masaje.id} className="text-sm">
                          {masaje.titulo} - {masaje.duracion} - ${masaje.precio}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-sm text-gray-600">
                      Total servicios de masaje: ${formData.masajesSeleccionados.reduce((total, masaje) => total + masaje.precio, 0)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleProceedToPaso3}
              disabled={!fechaSeleccionada}
              className={`w-full mt-8 py-4 px-6 text-center font-medium text-lg transition-all duration-300 ${
                fechaSeleccionada 
                  ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] cursor-pointer' 
                  : 'bg-gray-500 cursor-not-allowed opacity-70'
              }`}
            >
              Continuar
            </button>
          </div>
        </div>
      </section>
    );
  };
  
  return (  
    <>
    <Navbar />
    <main className="min-h-screen bg-[var(--color-cream-light)]">
      {/* Hero section con imagen de fondo */}
      <section className="relative h-[85vh] min-h-[700px] flex items-center justify-center pt-32">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/reserve.png"
            alt="Hacienda San Carlos - Reservaciones"
            fill
            sizes="100vw"
            className="object-cover transform scale-[1.15] animate-ken-burns"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-[var(--color-accent)]/60 to-black/50 z-0"></div>
        </div>
        
        {/* Overlay decorativo */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 opacity-60" style={{ borderColor: 'var(--color-primary-30)' }}></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 opacity-60" style={{ borderColor: 'var(--color-primary-30)' }}></div>
        </div>
        
        {/* Medallón decorativo */}
        <div 
          className="absolute top-[140px] md:top-[150px] lg:top-[180px] left-[10px] md:left-[40px] lg:left-[80px] transform z-20 pointer-events-none w-[180px] h-[180px] md:w-[220px] md:h-[220px] lg:w-[260px] lg:h-[260px] hidden sm:block"
          style={{ 
            transition: 'transform 0.4s ease-out, opacity 0.4s ease-out'
          }}
        >
          <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Definiciones para filtros */}
            <defs>
              <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="black" floodOpacity="0.8" />
              </filter>
            </defs>
            
            {/* Fondo semitransparente del medallón */}
            <circle cx="250" cy="250" r="225" fill="rgba(0,0,0,0.3)" />
            
            {/* Círculos decorativos externos */}
            <circle cx="250" cy="250" r="245" fill="none" stroke="#FFFAF0" strokeWidth="1" strokeDasharray="8,8" opacity="0.3" />
            <circle cx="250" cy="250" r="230" fill="none" stroke="#FFFAF0" strokeWidth="1" strokeDasharray="5,5" opacity="0.4" />
            
            {/* Forma de medallón radiante */}
            <path d="M250,30 
                   C330,30 400,90 430,170
                   C460,250 440,350 370,410
                   C300,470 200,470 130,410
                   C60,350 40,250 70,170
                   C100,90 170,30 250,30 Z" 
                fill="none" stroke="#800020" strokeWidth="2" opacity="0.5" />
            
            {/* Adorno medallón interno */}
            <circle cx="250" cy="250" r="150" fill="none" stroke="#800020" strokeWidth="1" opacity="0.3" />
            <circle cx="250" cy="250" r="120" fill="none" stroke="#800020" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
            
            {/* Rayos decorativos */}
            <line x1="250" y1="100" x2="250" y2="25" stroke="#800020" strokeWidth="1" opacity="0.5" />
            <line x1="100" y1="250" x2="25" y2="250" stroke="#800020" strokeWidth="1" opacity="0.5" />
            <line x1="250" y1="400" x2="250" y2="475" stroke="#800020" strokeWidth="1" opacity="0.5" />
            <line x1="400" y1="250" x2="475" y2="250" stroke="#800020" strokeWidth="1" opacity="0.5" />
            <line x1="175" y1="175" x2="125" y2="125" stroke="#800020" strokeWidth="1" opacity="0.5" />
            <line x1="325" y1="175" x2="375" y2="125" stroke="#800020" strokeWidth="1" opacity="0.5" />
            <line x1="175" y1="325" x2="125" y2="375" stroke="#800020" strokeWidth="1" opacity="0.5" />
            <line x1="325" y1="325" x2="375" y2="375" stroke="#800020" strokeWidth="1" opacity="0.5" />
            
            {/* Elementos decorativos de celebración */}
            <path d="M250,180 
                   C270,150 310,150 310,180 
                   C310,210 250,240 250,240 
                   C250,240 190,210 190,180 
                   C190,150 230,150 250,180 Z" 
                fill="none" stroke="#800020" strokeWidth="2" opacity="0.6" />
            
            {/* Calendario decorativo */}
            <rect x="200" y="270" width="100" height="90" rx="5" fill="none" stroke="#FFFAF0" strokeWidth="1.5" opacity="0.8" />
            <line x1="220" y1="270" x2="220" y2="260" stroke="#FFFAF0" strokeWidth="1.5" opacity="0.8" />
            <line x1="280" y1="270" x2="280" y2="260" stroke="#FFFAF0" strokeWidth="1.5" opacity="0.8" />
            <line x1="200" y1="295" x2="300" y2="295" stroke="#FFFAF0" strokeWidth="1" opacity="0.6" />
            <text x="250" y="330" textAnchor="middle" fontFamily="serif" fontSize="32" fill="#FFFAF0" fontWeight="bold" opacity="0.9" filter="url(#textShadow)">
              ✓
            </text>
            
            {/* Texto elegante en el centro */}
            <g transform="translate(250, 200)">
              <text textAnchor="middle" fontFamily="serif" fontSize="26" fill="#FFFAF0" fontWeight="light" opacity="0.95" letterSpacing="3" filter="url(#textShadow)">
                RESERVA
              </text>
            </g>
          </svg>
        </div>
        
        <div className="relative z-10 container-custom text-center text-white">
          {/* Decorador superior elegante */}
          <div className="flex flex-col items-center mb-6 md:mb-8 animate-delay-100">
            <div className="w-24 md:w-32 lg:w-40 h-[1px] bg-[var(--color-primary)] mx-auto mb-3"></div>
            <div className="relative inline-block mb-2 text-sm md:text-base uppercase tracking-[0.3em] md:tracking-[0.4em] text-[var(--color-primary)] font-extrabold z-10 transform-style-preserve-3d">
              <span style={{fontFamily: "'Trajan Pro', 'Cinzel', 'Didot', serif", color: "white", textShadow: "0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB", transform: "translateZ(10px)", display: "inline-block"}}>
                Eventos Exclusivos
              </span>
              <div className="absolute inset-0 filter blur-[4px] bg-white/15 -z-10" style={{ clipPath: 'inset(0 -6px -6px -6px round 6px)' }}></div>
            </div>
            <div className="relative inline-block text-base md:text-lg text-white tracking-wide font-medium drop-shadow-[0_0_3px_rgba(110,70,20,0.9)] z-10">
              Celebraciones Inolvidables
              <div className="absolute inset-0 filter blur-[4px] bg-white/15 -z-10" style={{ clipPath: 'inset(0 -6px -8px -6px round 6px)' }}></div>
            </div>
            <div className="w-24 md:w-32 lg:w-40 h-[1px] bg-[var(--color-primary)] mx-auto mt-3"></div>
          </div>
          
          {/* Título principal - Reserve su Evento */}
          <div className="relative inline-block mb-8 z-10 w-full text-center perspective-[1000px]">
            <motion.h1 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-5xl md:text-7xl font-[var(--font-display)] leading-tight tracking-tight relative px-3 md:px-4 mb-6 inline-block transform-style-preserve-3d"
            >
              <span className="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]">Reserve su</span> <span className="font-bold text-[var(--color-primary)] transform-style-preserve-3d" style={{fontFamily: "'Trajan Pro', 'Cinzel', 'Didot', serif", color: "var(--color-primary)", textShadow: "0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB", transform: "translateZ(20px)", display: "inline-block"}}>Evento</span>
              <div className="absolute inset-0 filter blur-[8px] bg-white/15 -z-10" style={{ clipPath: 'inset(-15px -25px -35px -25px round 16px)' }}></div>
            </motion.h1>
          </div>
          
          {/* Subtítulo debajo del título principal */}
          <div className="relative inline-block text-lg sm:text-xl md:text-2xl font-[var(--font-display)] mb-12 max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto z-10 tracking-wide px-4 text-center perspective-[1000px]">
            <span className="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]">Haga realidad su evento soñado en nuestra exclusiva hacienda. Seleccione una fecha y deje que nuestro </span><span className="font-bold transform-style-preserve-3d" style={{fontFamily: "'Trajan Pro', 'Cinzel', 'Didot', serif", color: "white", textShadow: "0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB", transform: "translateZ(20px)", display: "inline-block"}}>equipo</span><span className="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]"> se encargue de todos los detalles.</span>
            <div className="absolute inset-0 filter blur-[6px] bg-white/15 -z-10" style={{ clipPath: 'inset(-10px -20px -25px -20px round 10px)' }}></div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.2 }}
          >
            <a 
              href="#paso-1" 
              className="px-10 py-4 bg-[var(--color-primary)] text-white text-lg font-medium hover:bg-[var(--color-primary-dark)] inline-block shadow-xl transform hover:scale-105 transition-transform duration-300"
            >
              Comenzar Reservación
            </a>
          </motion.div>
        </div>
        
        {/* Elementos decorativos */}
        <div className="absolute top-20 left-20 w-32 h-32 border border-white/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 right-20 w-48 h-48 border border-[var(--color-primary)]/30 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-40 right-40 w-20 h-20 border border-[var(--color-primary)]/40 rounded-full animate-pulse delay-500"></div>
      </section>
      
      {/* Sistema de reservas en pasos */}
      <div className="py-16 relative z-10 bg-[var(--color-cream-light)]">
        {/* Indicador de progreso */}
        <div className="container-custom mb-16">
          <div className="flex flex-col md:flex-row justify-between items-center max-w-4xl mx-auto">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center mb-4 md:mb-0">
                <div 
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold border-2 transition-all ${
                    paso >= stepNum 
                      ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' 
                      : 'bg-white text-gray-500 border-gray-300'
                  }`}
                >
                  {paso > stepNum ? <FaCheck className="text-white" /> : stepNum}
                </div>
                
                <span className={`ml-3 font-medium transition-colors ${
                  paso >= stepNum ? 'text-[var(--color-primary)]' : 'text-gray-500'
                }`}>
                  {stepNum === 1 ? 'Tipo de Evento' : 
                   stepNum === 2 ? 'Fecha y Detalles' : 
                   stepNum === 3 ? 'Sus Datos' :
                   'Confirmación'}
                </span>
                
                {stepNum < 4 && (
                  <div className="hidden md:block w-12 border-t-2 border-gray-300 mx-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Paso 1: Selección de tipo de evento */}
        <section id="paso-1" className={`mb-16 ${paso !== 1 ? 'opacity-50' : ''}`}>
          <h2 className="text-3xl font-[var(--font-display)] text-center mb-8">
            Seleccione el tipo de evento
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Elija el tipo de evento que desea realizar en nuestras instalaciones
            {formData.masajePreseleccionado && (
              <span className="block mt-2 text-[var(--color-primary)]">
                * Se incluirá el masaje seleccionado en su reserva
              </span>
            )}
          </p>
          {renderMasajePreseleccionado()}
          {renderPaso1()}
        </section>
        
        {/* Paso 2: Selección de fecha y detalles */}
        <section id="paso-2" className={`container-custom mb-24 transition-opacity duration-500 ${paso >= 2 ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={paso >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-[var(--color-primary)]">
              Seleccione la fecha y número de invitados
            </h2>
            <p className="text-xl max-w-3xl mx-auto text-gray-700">
              Elija la fecha para su {formData.tipoEvento && (tiposEvento.find(t => t.id === formData.tipoEvento)?.titulo || 'evento').toLowerCase()} y el número de invitados
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Calendario */}
            <div className="bg-white p-8 shadow-xl">
              <h3 className="text-2xl font-[var(--font-display)] text-[var(--color-accent)] mb-6 text-center">Seleccionar Fecha</h3>
              
              <div className="mb-8">
                <div 
                  className="relative cursor-pointer border border-gray-300 p-4 rounded-lg flex items-center"
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                >
                  <FaCalendarAlt className="text-[var(--color-primary)] mr-3" />
                  <input 
                    type="text"
                    className="w-full border-none focus:outline-none pointer-events-none bg-transparent"
                    value={fechaSeleccionada ? fechaSeleccionada.toLocaleDateString() : 'Seleccionar fecha'}
                    readOnly
                  />
                  <FaChevronRight className={`transition-transform duration-300 ${isCalendarOpen ? 'rotate-90' : ''}`} />
                </div>
                
                <div className={`mt-2 transition-all duration-300 overflow-hidden ${isCalendarOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-4 border border-gray-200 rounded-lg shadow-md">
                    <DatePicker
                      selected={fechaSeleccionada}
                      onChange={handleFechaChange}
                      inline
                      filterDate={esDisponible}
                      minDate={new Date()}
                      className="w-full"
                    />
                    
                    <div className="flex justify-between items-center mt-4 text-xs text-gray-500 border-t border-gray-200 pt-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-[var(--color-primary)]/20 border border-[var(--color-primary)] mr-2"></div>
                        <span>Disponible</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-gray-200 border border-gray-300 mr-2"></div>
                        <span>No disponible</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-6 text-sm">
                <div className="flex items-center text-[var(--color-primary)]">
                  <FaRegClock className="mr-2" />
                  <span>Horario disponible: 9:00 AM - 11:00 PM</span>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Invitados
                </label>
                <div className="relative">
                  <FaUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-primary)]" />
                  <input 
                    type="number"
                    name="invitados"
                    value={formData.invitados}
                    onChange={handleInvitadosChange}
                    min="10"
                    max="300"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent rounded-lg"
                  />
                </div>
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>Mínimo: 10 invitados</span>
                  <span>Máximo: 300 invitados</span>
                </div>
              </div>
            </div>
            
            {/* Resumen */}
            <div className="bg-[var(--color-accent)] text-white p-8 shadow-xl">
              <h3 className="text-2xl font-[var(--font-display)] mb-6 text-center">Resumen de su Evento</h3>
              
              {formData.tipoEvento && (
                <div className="space-y-6">
                  <div className="p-4 border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10">
                    <h4 className="text-xl font-[var(--font-display)] mb-4">
                      {tiposEvento.find(t => t.id === formData.tipoEvento)?.titulo || 'Evento'}
                    </h4>
                    <p className="text-white/80 mb-4">
                      {tiposEvento.find(t => t.id === formData.tipoEvento)?.descripcion || 'Descripción no disponible'}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-[var(--color-primary)]">Precio:</span>
                        <p className="font-medium">{tiposEvento.find(t => t.id === formData.tipoEvento)?.precio || 'A consultar'}</p>
                      </div>
                      <div>
                        <span className="text-[var(--color-primary)]">Capacidad:</span>
                        <p className="font-medium">{tiposEvento.find(t => t.id === formData.tipoEvento)?.capacidad || '1'} invitados</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 p-4 border border-white/20">
                    <div className="flex justify-between">
                      <span className="text-white/80">Fecha seleccionada:</span>
                      <span className="font-medium">{fechaSeleccionada ? fechaSeleccionada.toLocaleDateString() : 'No seleccionada'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">Número de invitados:</span>
                      <span className="font-medium">{formData.invitados}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleProceedToPaso3}
                    disabled={!fechaSeleccionada}
                    className={`w-full py-4 px-6 text-center font-medium text-lg transition-all duration-300 ${
                      fechaSeleccionada 
                        ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] cursor-pointer' 
                        : 'bg-gray-500 cursor-not-allowed opacity-70'
                    }`}
                  >
                    Continuar
                  </button>
                  
                  {!fechaSeleccionada && (
                    <p className="text-center text-sm text-[var(--color-primary)]/80 mt-2">
                      Por favor, seleccione una fecha para continuar.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
        
        {/* Paso 3: Información personal */}
        <section id="paso-3" className={`container-custom mb-24 transition-opacity duration-500 ${paso >= 3 ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={paso >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-[var(--font-display)] text-[var(--color-accent)] mb-6">
              Complete sus <span className="text-[var(--color-primary)] font-semibold">Datos</span>
            </h2>
            <p className="text-xl max-w-3xl mx-auto text-gray-700">
              Proporcione su información de contacto para confirmar su reserva
            </p>
          </motion.div>
          
          <div className="max-w-2xl mx-auto bg-white p-8 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre completo
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent rounded-lg"
                />
              </div>
              
              <div>
                <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 mb-2">
                  Apellidos
                </label>
                <input
                  type="text"
                  id="apellidos"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent rounded-lg"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent rounded-lg"
                />
              </div>
              
              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent rounded-lg"
                />
              </div>
              
              <div>
                <label htmlFor="comentarios" className="block text-sm font-medium text-gray-700 mb-2">
                  Comentarios o peticiones especiales
                </label>
                <textarea
                  id="comentarios"
                  name="comentarios"
                  value={formData.comentarios}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent rounded-lg"
                ></textarea>
              </div>
              
              <div className="mt-10">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-[var(--color-primary)] text-white py-4 text-lg font-medium transition-colors rounded-lg shadow-lg ${
                    isSubmitting 
                      ? 'opacity-70 cursor-not-allowed' 
                      : 'hover:bg-[var(--color-primary-dark)]'
                  }`}
                >
                  {isSubmitting ? 'Procesando...' : 'Confirmar Reserva'}
                </button>
                
                {submitError && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start">
                    <FaExclamationTriangle className="flex-shrink-0 mt-1 mr-2" />
                    <p>{submitError}</p>
                  </div>
                )}
              </div>
            </form>
          </div>
        </section>
        
        {/* Paso 4: Confirmación - Solo se muestra cuando paso es 4 */}
        {paso === 4 && (
          <section id="paso-4" className="container-custom mb-24">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, height: 0 }}
              animate={{ opacity: 1, scale: 1, height: 'auto' }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl mx-auto text-center bg-white p-12 shadow-xl"
            >
              <div className="w-20 h-20 rounded-full bg-green-100 mx-auto flex items-center justify-center mb-8">
                <FaCheck className="text-green-600 text-3xl" />
              </div>
              
              <h2 className="text-4xl font-[var(--font-display)] text-[var(--color-accent)] mb-6">
                ¡Reserva Enviada!
              </h2>
              
              <p className="text-xl text-gray-700 mb-8">
                Gracias por su interés en la Hacienda San Carlos. Hemos recibido su solicitud de reserva y nos pondremos en contacto con usted a la brevedad.
              </p>
              
              <div className="bg-gray-50 p-6 mb-8 text-left rounded-lg">
                <h3 className="text-lg font-medium mb-4 text-[var(--color-primary)]">Detalles de su reserva:</h3>
                
                <div className="space-y-6">
                  {/* Detalles del Evento */}
                  <div>
                    <h4 className="font-medium text-[var(--color-accent)] mb-2">Información del Evento</h4>
                    <div className="space-y-2 text-gray-700">
                      <p><strong>Número de confirmación:</strong> {confirmationData?.numeroConfirmacion || 'Pendiente'}</p>
                      <p><strong>Tipo de evento:</strong> {formData.tipoEvento && tiposEvento.find(t => t.id === formData.tipoEvento).titulo}</p>
                      <p><strong>Fecha:</strong> {formData.fecha && formData.fecha.toLocaleDateString()}</p>
                      <p><strong>Invitados:</strong> {formData.invitados}</p>
                    </div>
                  </div>

                  {/* Información de Contacto */}
                  <div>
                    <h4 className="font-medium text-[var(--color-accent)] mb-2">Información de Contacto</h4>
                    <div className="space-y-2 text-gray-700">
                      <p><strong>Nombre:</strong> {formData.nombre}</p>
                      <p><strong>Email:</strong> {formData.email}</p>
                      <p><strong>Teléfono:</strong> {formData.telefono}</p>
                    </div>
                  </div>
                  
                  {/* Servicios de Masaje */}
                  {formData.masajesSeleccionados.length > 0 && (
                    <div>
                      <h4 className="font-medium text-[var(--color-accent)] mb-2">Servicios de Masaje</h4>
                      <div className="space-y-3">
                        {formData.masajesSeleccionados.map((masaje, index) => (
                          <div key={index} className="p-3 bg-white rounded shadow-sm">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{masaje.titulo}</p>
                                <p className="text-sm text-gray-600">Duración: {masaje.duracion}</p>
                              </div>
                              <p className="font-semibold">${masaje.precio}</p>
                            </div>
                          </div>
                        ))}
                        <div className="pt-3 border-t">
                          <div className="flex justify-between items-center">
                            <p className="font-medium">Total Servicios de Masaje:</p>
                            <p className="font-semibold text-[var(--color-primary)]">
                              ${formData.masajesSeleccionados.reduce((total, masaje) => total + masaje.precio, 0)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-gray-600 mb-8">
                Un representante se comunicará con usted en un plazo máximo de 24 horas para confirmar la disponibilidad y proporcionarle más información.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  href="/"
                  className="px-8 py-3 bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 transition-colors rounded-lg"
                >
                  Volver a inicio
                </Link>
                
                <button
                  onClick={() => window.print()}
                  className="px-8 py-3 bg-[var(--color-accent)] text-white font-medium hover:bg-[var(--color-accent-dark)] transition-colors rounded-lg"
                >
                  Imprimir detalles
                </button>
              </div>
            </motion.div>
          </section>
        )}
      </div>
      
      {/* Sección decorativa con flores SVG */}
      <section className="relative py-16 bg-[var(--color-cream-light)] overflow-hidden">
        {/* Fondo con gradiente suave */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F8F4F1] via-[#F5EDE8] to-[#F8F4F1] opacity-90"></div>
        
        <div className="relative z-10 container-custom">
          {/* Estructura SVG - texto - SVG */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
            {/* Primer bloque SVG (izquierda) */}
            <div className="w-full md:w-1/3">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 800 600" className="w-full h-auto" style={{ fill: '#8B0516' }}>
                <g>
                  <path d="M538.281,369.396c0.44,1.499,0.856,2.917,1.062,4.382c0.091,0.637,0.556,1.159,1.181,1.324
                    c0.134,0.034,0.27,0.05,0.403,0.05c0.492,0,0.967-0.228,1.274-0.631c4.145-5.46,7.293-14.29,7.832-21.977
                    c0.289-4.123-0.492-7.178-2.386-9.336c-0.995-1.143-2.261-1.556-3.401-1.118c-0.679,0.272-1.082,0.778-1.295,1.043
                    c-5.488,6.831-7.443,16.32-5.102,24.763L538.281,369.396z"/>
                  <path d="M529.447,366.941c0.07,0.003,0.141,0.006,0.209,0.006c0.851,0,1.634-0.325,2.274-0.946
                    c1.682-1.637,2.363-5.407,2.143-11.86c-0.225-6.606-2.8-12.397-7.07-15.892c-0.286-0.234-0.95-0.703-1.907-0.771
                    c-0.754,0.012-1.805,0.372-2.529,1.999c-2.068,4.685-2.246,10.435-0.429,16.42C523.749,361.234,525.878,366.725,529.447,366.941z"/>
                  <path d="M683.893,405.378c0.931,0.54,1.723,1.003,2.276,1.359c2.549,1.649,5.546,3.504,8.858,4.648
                    c0.525,0.181,1.701,0.587,3.031,0.587c0.859,0,1.784-0.169,2.638-0.678c2.41-1.431,2.811-4.588,2.14-7.087
                    c-1.424-5.307-6.18-8.764-10.162-11.182c-0.002,0-0.002,0-0.002,0c-5.38-3.258-12.197-6.828-17.193-5.544
                    c-1.802,0.465-3.186,1.521-4.112,3.133C668.149,396.217,678.003,401.952,683.893,405.378z"/>
                  <path d="M580.707,420.193c0.597-1.568,0.437-3.258-0.462-4.888c-3.551-6.447-17.974-3.842-22.309-2.892
                    c-9,1.968-17.301,6.872-23.368,13.809c-0.326,0.372-0.461,0.875-0.365,1.362c0.097,0.487,0.412,0.9,0.854,1.121
                    c4.192,2.093,9.016,3.139,14.34,3.139c5.781,0,12.149-1.234,18.928-3.695l0.8-0.284
                    C572.622,426.627,579.135,424.325,580.707,420.193z"/>
                  <path d="M497.768,394.808c0.8,2.243,3.161,3.876,6.016,4.16c0.35,0.037,0.7,0.053,1.048,0.053
                    c2.789,0,5.433-1.062,7.484-2.027c4.437-2.083,8.549-4.782,12.342-8.121c2.494-2.196,7.685-6.766,6.359-10.795
                    c-1.259-3.823-6.314-3.408-9.659-3.117c-0.593,0.05-1.132,0.094-1.571,0.106c-2.772,0.072-5.086,0.259-7.37,0.95
                    c-5.093,1.534-9.542,5.469-13.226,11.694c-0.896,1.513-1.949,3.669-1.691,5.883c-0.008,0.047-0.038,0.086-0.028,0.136
                    c0.006,0.031,0.033,0.048,0.044,0.075C497.567,394.14,497.648,394.474,497.768,394.808z"/>
                  <path d="M629.254,380.031c-0.67,2.196-1.126,14.377,2.988,16.776c0.386,0.225,0.94,0.447,1.632,0.447
                    c0.984,0,2.246-0.447,3.689-1.965c5.867-6.181,2.11-23.22,0.782-27.443c-0.189-0.603-0.712-1.034-1.337-1.109
                    c-0.625-0.094-1.234,0.222-1.559,0.762C633.086,371.417,630.642,375.471,629.254,380.031z"/>
                  <path d="M654.018,353.107c0.37,0.072,0.751,0.106,1.137,0.106c1.585,0,3.258-0.59,4.737-1.696
                    c0.954-0.715,1.609-1.477,1.997-2.327c0.829-1.802,0.476-4.089-0.967-6.266c-0.679-1.025-1.402-1.777-2.21-2.302
                    c-0.002,0-0.002-0.003-0.003-0.003c-2.799-1.812-6.208-0.275-8.463,1.765c-0.395,0.356-0.965,0.918-1.348,1.677
                    c-0.673,1.334-0.65,2.999,0.065,4.691C649.928,351.027,651.865,352.695,654.018,353.107z"/>
                  <path d="M678.834,481.791c0.497,0.325,1.206,0.634,2.101,0.634c0.475,0,1.004-0.087,1.581-0.306
                    c4.69-1.771,9.2-6.047,12.606-9.573c2.408-2.493,4.204-4.866,5.49-7.262c2.492-4.648,3.347-9.836,4.174-14.855
                    c0.518-3.158,1.057-6.425,2.001-9.452c0.212-0.681-0.055-1.424-0.653-1.815c-0.601-0.393-1.387-0.331-1.926,0.134
                    c-2.73,2.383-5.83,4.535-8.83,6.616c-5.683,3.945-11.56,8.024-15.472,13.987c-1.571,2.396-2.827,5.11-3.732,8.071
                    c-0.404,1.327-0.859,3.089-0.767,4.913C675.489,474.5,675.979,479.923,678.834,481.791z"/>
                  <path d="M466.502,351.144c0.37,0.072,0.751,0.106,1.137,0.106c1.585,0,3.258-0.59,4.737-1.696
                    c0.954-0.715,1.609-1.477,1.997-2.327c0.829-1.802,0.476-4.089-0.967-6.266c-0.679-1.025-1.402-1.777-2.21-2.302
                    c-0.002,0-0.002-0.003-0.003-0.003c-2.799-1.812-6.208-0.275-8.463,1.765c-0.395,0.356-0.965,0.918-1.348,1.677
                    c-0.673,1.334-0.65,2.999,0.065,4.691C462.412,349.064,464.349,350.732,466.502,351.144z"/>
                  <path d="M553.742,371.433c0.44,1.499,0.856,2.917,1.062,4.382c0.091,0.637,0.556,1.159,1.181,1.324
                    c0.134,0.034,0.27,0.05,0.403,0.05c0.492,0,0.967-0.228,1.274-0.631c4.145-5.46,7.293-14.29,7.832-21.977
                    c0.289-4.123-0.492-7.178-2.386-9.336c-0.995-1.143-2.261-1.556-3.401-1.118c-0.679,0.272-1.082,0.778-1.295,1.043
                    c-5.488,6.831-7.443,16.32-5.102,24.763L553.742,371.433z"/>
                  <path d="M644.908,435.23c0.597-1.568,0.437-3.258-0.462-4.888c-3.551-6.447-17.974-3.842-22.309-2.892
                    c-9,1.968-17.301,6.872-23.368,13.809c-0.326,0.372-0.461,0.875-0.365,1.362c0.097,0.487,0.412,0.9,0.854,1.121
                    c4.192,2.093,9.016,3.139,14.34,3.139c5.781,0,12.149-1.234,18.928-3.695l0.8-0.284
                    C636.823,441.664,643.336,439.362,644.908,435.23z"/>
                  <path d="M589.167,477.792c0.497,0.325,1.206,0.634,2.101,0.634c0.475,0,1.004-0.087,1.581-0.306
                    c4.69-1.771,9.2-6.047,12.606-9.573c2.408-2.493,4.204-4.866,5.49-7.262c2.492-4.648,3.347-9.836,4.174-14.855
                    c0.518-3.158,1.057-6.425,2.001-9.452c0.212-0.681-0.055-1.424-0.653-1.815c-0.601-0.393-1.387-0.331-1.926,0.134
                    c-2.73,2.383-5.83,4.535-8.83,6.616c-5.683,3.945-11.56,8.024-15.472,13.987c-1.571,2.396-2.827,5.11-3.732,8.071
                    c-0.404,1.327-0.859,3.089-0.767,4.913C585.822,470.501,586.312,475.924,589.167,477.792z"/>
                </g>
              </svg>
            </div>
            
            {/* Texto central */}
            <div className="w-full md:w-1/3 bg-white/80 px-6 py-6 rounded-xl shadow-md backdrop-blur-sm">
              <h2 className="text-3xl md:text-4xl font-[var(--font-display)] text-[#8B0516] mb-4 text-center">
                Su Evento <span className="font-semibold">Perfecto</span>
              </h2>
              <p className="text-lg text-[#3A3330] mb-4 text-center">
                Reserve su fecha especial y déjenos crear una experiencia inolvidable 
                diseñada exclusivamente para usted
              </p>
              <div className="flex justify-center mt-4">
                <Link
                  href="/contact"
                  className="px-6 py-2 bg-[#8B0516] text-white font-medium hover:bg-[#6b0411] transition-colors rounded-lg"
                >
                  Contáctenos
                </Link>
              </div>
            </div>
            
            {/* Segundo bloque SVG (derecha) */}
            <div className="w-full md:w-1/3">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 800 600" className="w-full h-auto" style={{ fill: '#8B0516' }}>
                <g>
                  <path d="M654.018,353.107c0.37,0.072,0.751,0.106,1.137,0.106c1.585,0,3.258-0.59,4.737-1.696
                    c0.954-0.715,1.609-1.477,1.997-2.327c0.829-1.802,0.476-4.089-0.967-6.266c-0.679-1.025-1.402-1.777-2.21-2.302
                    c-0.002,0-0.002-0.003-0.003-0.003c-2.799-1.812-6.208-0.275-8.463,1.765c-0.395,0.356-0.965,0.918-1.348,1.677
                    c-0.673,1.334-0.65,2.999,0.065,4.691C649.928,351.027,651.865,352.695,654.018,353.107z"/>
                  <path d="M683.893,405.378c0.931,0.54,1.723,1.003,2.276,1.359c2.549,1.649,5.546,3.504,8.858,4.648
                    c0.525,0.181,1.701,0.587,3.031,0.587c0.859,0,1.784-0.169,2.638-0.678c2.41-1.431,2.811-4.588,2.14-7.087
                    c-1.424-5.307-6.18-8.764-10.162-11.182c-0.002,0-0.002,0-0.002,0c-5.38-3.258-12.197-6.828-17.193-5.544
                    c-1.802,0.465-3.186,1.521-4.112,3.133C668.149,396.217,678.003,401.952,683.893,405.378z"/>
                  <path d="M629.254,380.031c-0.67,2.196-1.126,14.377,2.988,16.776c0.386,0.225,0.94,0.447,1.632,0.447
                    c0.984,0,2.246-0.447,3.689-1.965c5.867-6.181,2.11-23.22,0.782-27.443c-0.189-0.603-0.712-1.034-1.337-1.109
                    c-0.625-0.094-1.234,0.222-1.559,0.762C633.086,371.417,630.642,375.471,629.254,380.031z"/>
                  <path d="M678.834,481.791c0.497,0.325,1.206,0.634,2.101,0.634c0.475,0,1.004-0.087,1.581-0.306
                    c4.69-1.771,9.2-6.047,12.606-9.573c2.408-2.493,4.204-4.866,5.49-7.262c2.492-4.648,3.347-9.836,4.174-14.855
                    c0.518-3.158,1.057-6.425,2.001-9.452c0.212-0.681-0.055-1.424-0.653-1.815c-0.601-0.393-1.387-0.331-1.926,0.134
                    c-2.73,2.383-5.83,4.535-8.83,6.616c-5.683,3.945-11.56,8.024-15.472,13.987c-1.571,2.396-2.827,5.11-3.732,8.071
                    c-0.404,1.327-0.859,3.089-0.767,4.913C675.489,474.5,675.979,479.923,678.834,481.791z"/>
                  <path d="M466.502,351.144c0.37,0.072,0.751,0.106,1.137,0.106c1.585,0,3.258-0.59,4.737-1.696
                    c0.954-0.715,1.609-1.477,1.997-2.327c0.829-1.802,0.476-4.089-0.967-6.266c-0.679-1.025-1.402-1.777-2.21-2.302
                    c-0.002,0-0.002-0.003-0.003-0.003c-2.799-1.812-6.208-0.275-8.463,1.765c-0.395,0.356-0.965,0.918-1.348,1.677
                    c-0.673,1.334-0.65,2.999,0.065,4.691C462.412,349.064,464.349,350.732,466.502,351.144z"/>
                  <path d="M553.742,371.433c0.44,1.499,0.856,2.917,1.062,4.382c0.091,0.637,0.556,1.159,1.181,1.324
                    c0.134,0.034,0.27,0.05,0.403,0.05c0.492,0,0.967-0.228,1.274-0.631c4.145-5.46,7.293-14.29,7.832-21.977
                    c0.289-4.123-0.492-7.178-2.386-9.336c-0.995-1.143-2.261-1.556-3.401-1.118c-0.679,0.272-1.082,0.778-1.295,1.043
                    c-5.488,6.831-7.443,16.32-5.102,24.763L553.742,371.433z"/>
                  <path d="M644.908,435.23c0.597-1.568,0.437-3.258-0.462-4.888c-3.551-6.447-17.974-3.842-22.309-2.892
                    c-9,1.968-17.301,6.872-23.368,13.809c-0.326,0.372-0.461,0.875-0.365,1.362c0.097,0.487,0.412,0.9,0.854,1.121
                    c4.192,2.093,9.016,3.139,14.34,3.139c5.781,0,12.149-1.234,18.928-3.695l0.8-0.284
                    C636.823,441.664,643.336,439.362,644.908,435.23z"/>
                  <path d="M589.167,477.792c0.497,0.325,1.206,0.634,2.101,0.634c0.475,0,1.004-0.087,1.581-0.306
                    c4.69-1.771,9.2-6.047,12.606-9.573c2.408-2.493,4.204-4.866,5.49-7.262c2.492-4.648,3.347-9.836,4.174-14.855
                    c0.518-3.158,1.057-6.425,2.001-9.452c0.212-0.681-0.055-1.424-0.653-1.815c-0.601-0.393-1.387-0.331-1.926,0.134
                    c-2.73,2.383-5.83,4.535-8.83,6.616c-5.683,3.945-11.56,8.024-15.472,13.987c-1.571,2.396-2.827,5.11-3.732,8.071
                    c-0.404,1.327-0.859,3.089-0.767,4.913C585.822,470.501,586.312,475.924,589.167,477.792z"/>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </section>
    </main>
    <Footer />
    </>
  );
} 