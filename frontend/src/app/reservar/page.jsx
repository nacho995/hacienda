"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaUsers, FaChevronRight, FaCheck, FaRegClock, FaExclamationTriangle, FaTrash, FaCheckCircle } from 'react-icons/fa';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { 
  createEventoReservation, 
  checkEventoAvailability, 
  getEventoOccupiedDates, 
  createMasajeReservation, 
  checkMasajeAvailability
} from '../../services/reservationService';
import { getTiposEvento } from '../../services/eventoService';
import apiClient from '../../services/apiClient';
import { toast } from 'sonner';

// Importar componentes
import DatePicker, { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import "react-datepicker/dist/react-datepicker.css";
import { useSimpleReservation } from '../../context/SimpleReservationContext';
import RoomListSection from '@/components/habitaciones/RoomListSection';

// Registrar el locale español para DatePicker
registerLocale('es', es);

export default function ReservarPage() {
  // Estados para el formulario
  const [formData, setFormData] = useState({
    tipoEvento: '',
    fecha: null,
    invitados: 50,
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    comentarios: '',
    espacioSeleccionado: 'jardin'
  });
  
  // Usar el contexto de reservaciones
  const { 
    habitacionesSeleccionadas, 
    eliminarHabitacion: eliminarHabitacionSeleccionada, 
    calcularTotalHabitaciones,
    calcularTotalReserva,
    limpiarReserva,
    agregarHabitacion
  } = useSimpleReservation();

  const [tiposEvento, setTiposEvento] = useState([]); // Estado para tipos de evento
  const [loading, setLoading] = useState(true); // Nuevo estado para manejar la carga
  
  const [paso, setPaso] = useState(1);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);
  const [fechasOcupadas, setFechasOcupadas] = useState([]);
  const [fechasDestacadas, setFechasDestacadas] = useState([]);
  const [espaciosDisponibles, setEspaciosDisponibles] = useState([
    { id: 'jardin', nombre: 'Jardín Principal' },
    { id: 'salon', nombre: 'Salón de Eventos' },
    { id: 'terraza', nombre: 'Terraza Panorámica' }
  ]);
  
  const [nivelReserva, setNivelReserva] = useState(1);
  const [habitacionPrincipal, setHabitacionPrincipal] = useState(null);
  const [necesitaHabitaciones, setNecesitaHabitaciones] = useState(false);
  
  // Añadir un estado para las habitaciones seleccionadas
  const [habitacionesSeleccionadasManual, setHabitacionesSeleccionadasManual] = useState([]);
  
  // Añadir console.log para depurar
  useEffect(() => {
    console.log("Estado del contexto de reservación:", { 
      habitacionesSeleccionadas 
    });
  }, [habitacionesSeleccionadas]);
  
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
    // Definimos una función que no dependa de agregarMasaje ni agregarHabitacion
    const procesarParametrosURL = () => {
      if (typeof window === 'undefined') return; // No ejecutar en SSR

      const searchParams = new URLSearchParams(window.location.search);
      const tipo = searchParams.get('tipo');
      const habitacionesParam = searchParams.get('habitaciones');
      
      console.log('Parámetros URL:', { tipo, habitacionesParam });

      // Procesar habitaciones
      if (habitacionesParam) {
        try {
          const habitacionesData = JSON.parse(decodeURIComponent(habitacionesParam));
          console.log('Habitaciones decodificadas:', habitacionesData);
          
          if (Array.isArray(habitacionesData) && habitacionesData.length > 0) {
            const habitacionesProcesadas = habitacionesData.map(habitacion => ({
              id: habitacion.id || Math.random().toString(36).substr(2, 9),
              nombre: habitacion.nombre,
              fechaEntrada: habitacion.fechaEntrada || new Date().toISOString().split('T')[0],
              fechaSalida: habitacion.fechaSalida || new Date().toISOString().split('T')[0],
              precio: parseFloat(habitacion.precio || 0)
            }));
            
            // Añadir habitaciones al contexto
            habitacionesProcesadas.forEach(habitacion => {
              agregarHabitacion(habitacion);
            });
            
            toast.success(`${habitacionesProcesadas.length} habitación(es) añadida(s)`);
            
            // Programar un desplazamiento al elemento después de que se procesen los datos
            setTimeout(() => {
              const serviciosElement = document.getElementById('servicios-adicionales');
              if (serviciosElement) {
                serviciosElement.scrollIntoView({ behavior: 'smooth' });
              }
            }, 500);
          }
        } catch (error) {
          console.error('Error al procesar habitaciones:', error);
          toast.error('Error al procesar las habitaciones seleccionadas');
        }
      }
    };

    // Llamamos a la función
    procesarParametrosURL();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dejamos el array de dependencias vacío para que solo se ejecute al montar
  
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
  
  const handleSelectTipoEvento = (tipo) => {
    console.log('Tipo de evento seleccionado:', tipo);
    // Buscar por id en lugar de _id
    const tipoEventoSeleccionado = tiposEvento.find(t => t.id === tipo || t._id === tipo);
    console.log('Objeto tipo evento completo:', tipoEventoSeleccionado);
    
    if (!tipoEventoSeleccionado) {
      console.error('No se encontró el tipo de evento:', tipo);
      toast.error('Error al seleccionar el tipo de evento');
      return;
    }
    
    // Determinar espacios disponibles según el tipo de evento
    let espaciosPermitidos = [];
    switch (tipoEventoSeleccionado.id) {
      case 'boda':
        espaciosPermitidos = ['jardin', 'salon'];
        break;
      case 'aniversario':
        espaciosPermitidos = ['jardin', 'salon', 'terraza'];
        break;
      case 'corporativo':
        espaciosPermitidos = ['salon', 'terraza'];
        break;
      case 'social':
        espaciosPermitidos = ['jardin', 'salon', 'terraza'];
        break;
      default:
        espaciosPermitidos = ['salon'];
    }
    
    // Actualizar espacios disponibles
    setEspaciosDisponibles(prevEspacios => 
      prevEspacios.filter(espacio => espaciosPermitidos.includes(espacio.id))
    );
    
    setFormData(prev => {
      const newFormData = { 
        ...prev, 
        tipoEvento: tipoEventoSeleccionado._id || tipoEventoSeleccionado.id,
        espacioSeleccionado: espaciosPermitidos[0] // Seleccionar el primer espacio disponible por defecto
      };
      console.log('Nuevo estado del formulario:', newFormData);
      return newFormData;
    });
    
    setPaso(2);
    setTimeout(() => {
      const elementoPaso2 = document.getElementById('paso-2');
      if (elementoPaso2) {
        elementoPaso2.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
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
    // Añadir comprobación de existencia para evitar errores
    setTimeout(() => {
      const elementoPaso3 = document.getElementById('paso-3');
      if (elementoPaso3) {
        elementoPaso3.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Validar datos mínimos necesarios
    if (!formData.nombre || !formData.apellidos || !formData.email || !formData.telefono) {
      setSubmitError('Por favor complete todos los campos obligatorios');
      toast.error('Por favor complete todos los campos obligatorios');
      return;
    }
    
    // Validar tipo de evento y fecha
    if (!formData.tipoEvento || !formData.fecha) {
      setSubmitError('Por favor seleccione un tipo de evento y fecha');
      toast.error('Por favor seleccione un tipo de evento y fecha');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      // Verificar disponibilidad primero
      const disponibilidad = await checkEventoAvailability({
        fecha: formData.fecha.toISOString().split('T')[0],
        tipoEvento: formData.tipoEvento
      });
      
      if (!disponibilidad.disponible) {
        setSubmitError(disponibilidad.mensaje || 'Esta fecha ya no está disponible');
        toast.error(disponibilidad.mensaje || 'Esta fecha ya no está disponible');
        setIsSubmitting(false);
        return;
      }
      
      // Preparar datos adicionales para las habitaciones seleccionadas manualmente
      let habitacionesEvento = [];
      
      if (habitacionesSeleccionadasManual.length > 0) {
        habitacionesEvento = habitacionesSeleccionadasManual.map(hab => ({
          id: hab._id || hab.id,
          nombre: hab.nombre,
          tipo: hab.tipo,
          fechaEntrada: hab.fechaEntrada,
          fechaSalida: hab.fechaSalida || hab.fechaEntrada,
          precio: parseFloat(hab.precio || 0)
        }));
      }
      
      // Preparar datos para la reserva
      const reservaData = {
        tipoEvento: formData.tipoEvento,
        fecha: formData.fecha.toISOString().split('T')[0],
        invitados: parseInt(formData.invitados, 10),
        nombreContacto: formData.nombre,
        apellidosContacto: formData.apellidos,
        emailContacto: formData.email,
        telefonoContacto: formData.telefono,
        comentarios: formData.comentarios,
        espacioSeleccionado: formData.espacioSeleccionado || 'jardin',
        necesitaHabitaciones: necesitaHabitaciones && habitacionesSeleccionadasManual.length > 0,
        habitacionesEvento: habitacionesEvento
      };
      
      // Si hay habitaciones en el contexto, añadirlas también
      if (habitacionesSeleccionadas && habitacionesSeleccionadas.length > 0) {
        // Combinar las habitaciones del contexto con las seleccionadas manualmente
        const habitacionesContexto = habitacionesSeleccionadas.map(hab => ({
          id: hab.id,
          nombre: hab.nombre,
          tipo: hab.tipo || 'standard',
          fechaEntrada: hab.fechaEntrada,
          fechaSalida: hab.fechaSalida,
          precio: parseFloat(hab.precio || 0)
        }));
        
        // Si ya se habían agregado habitaciones manuales, añadir las del contexto
        if (reservaData.habitacionesEvento.length > 0) {
          reservaData.habitacionesEvento = [...reservaData.habitacionesEvento, ...habitacionesContexto];
        } else {
          reservaData.habitacionesEvento = habitacionesContexto;
          reservaData.necesitaHabitaciones = true;
        }
      }
      
      console.log('Datos de la reserva a enviar:', reservaData);
      
      // Crear la reserva
      const response = await createEventoReservation(reservaData);
      
      if (response.success) {
        // Actualizar el estado con los datos de confirmación
        setConfirmationData(response.data);
        
        // Establecer el paso como confirmación
        setPaso(4);
        
        // Limpiar el estado de reserva en el contexto
        limpiarReserva && limpiarReserva();
        
        // Scroll al inicio de la confirmación
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      } else {
        setSubmitError(response.message || 'Error al crear la reserva');
        toast.error(response.message || 'Error al crear la reserva');
      }
    } catch (error) {
      console.error('Error al crear reserva:', error);
      setSubmitError(error.message || 'Error al procesar la solicitud');
      toast.error('Error al procesar su solicitud. Por favor intente nuevamente.');
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
  
  // Función para manejar la selección de habitaciones desde RoomListSection
  const handleSelectRoom = (habitacion) => {
    if (habitacion.accion === 'deseleccionar') {
      // Eliminar la habitación de las seleccionadas
      setHabitacionesSeleccionadasManual(prevHabitaciones => 
        prevHabitaciones.filter(h => h._id !== habitacion._id)
      );
      // Actualizar también en el contexto
      eliminarHabitacionSeleccionada && eliminarHabitacionSeleccionada(habitacion._id);
      return;
    }
    
    // Añadir la habitación a las seleccionadas
    const habitacionFormateada = {
      ...habitacion,
      id: habitacion._id,
      nombre: habitacion.nombre,
      fechaEntrada: habitacion.fechaEntrada || formData.fecha?.toISOString().split('T')[0],
      fechaSalida: habitacion.fechaSalida || formData.fecha?.toISOString().split('T')[0],
      precio: habitacion.precio || 0
    };
    
    setHabitacionesSeleccionadasManual(prevHabitaciones => {
      const existe = prevHabitaciones.some(h => h._id === habitacion._id);
      if (!existe) {
        toast.success(`${habitacion.nombre} añadida a la selección`);
        return [...prevHabitaciones, habitacionFormateada];
      }
      return prevHabitaciones;
    });
    
    // Añadir también al contexto si está disponible
    agregarHabitacion && agregarHabitacion(habitacionFormateada);
  };
  
  // Renderizar el paso 1 (tipos de evento)
  const renderPaso1 = () => {
    if (loading) {
      return (
        <section className="w-full mb-12">
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
        <section className="w-full mb-12">
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
      <section id="paso-1" className="w-full mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl font-bold mb-4 text-[var(--color-primary)]">
            Seleccione el tipo de evento
          </h2>
          <p className="text-xl max-w-3xl mx-auto text-gray-700">
            Elija el tipo de evento que desea realizar en nuestras instalaciones
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {tiposEvento.map((tipo) => (
            <motion.div 
              key={tipo._id || tipo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className={`relative bg-white rounded-lg shadow-xl cursor-pointer overflow-hidden h-[380px] border-2 transition-all ${
                formData.tipoEvento === (tipo._id || tipo.id) ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/50' : 'border-transparent hover:shadow-2xl'
              }`}
              onClick={() => handleSelectTipoEvento(tipo._id || tipo.id)}
              onMouseEnter={() => setHoveredCard(tipo._id || tipo.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="relative h-[250px] overflow-hidden">
                <Image
                  src={tipo.imagen || '/images/placeholder/gallery1.svg'}
                  alt={tipo.titulo}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20"></div>
                
                {formData.tipoEvento === tipo.id && (
                  <div className="absolute top-3 right-3 w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center z-10 shadow-lg">
                    <FaCheck className="text-white text-sm" />
                  </div>
                )}
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <h3 className="text-2xl font-[var(--font-display)] mb-2 shadow-text-strong">{tipo.titulo}</h3>
                <p className="text-white/90 text-sm mb-3 shadow-text line-clamp-2">{tipo.descripcion}</p>
                
                <div className="flex justify-between items-center pt-2 opacity-90">
                  <div className="flex items-center space-x-1 text-sm bg-black/30 px-2 py-1 rounded-full">
                    <FaUsers className="text-[var(--color-primary)]" />
                    <span>{tipo.capacidad} invitados</span>
                  </div>
                  <div className="text-sm font-medium bg-[var(--color-primary)]/90 px-3 py-1 rounded-full">{tipo.precio}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    );
  };
  
  // Renderizar el paso 2 (detalles del evento)
  const renderPaso2 = () => {
    return (
      <div id="paso-2" className="flex flex-col">
        <h3 className="text-2xl font-semibold mb-6">Detalles del Evento</h3>
        
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h4 className="text-lg font-semibold text-[var(--color-accent)] mb-4">Fecha y tipo de evento</h4>
            
            <div className="mb-8">
            <div className="text-gray-700 mb-3 font-medium">
              Seleccione la fecha de su evento
              </div>
            <div className="mt-2 transition-all">
              <div className="p-4 border rounded-lg max-w-md mx-auto">
                  <DatePicker
                  selected={formData.fecha}
                    onChange={handleFechaChange}
                    inline
                    minDate={new Date()}
                    className="w-full"
                  locale="es"
                  dateFormat="dd/MM/yyyy"
                  excludeDates={fechasOcupadas}
                  // Usar array vacío si fechasDestacadas no está definido
                  highlightDates={fechasDestacadas || []}
                  dayClassName={date => {
                    return esDisponible(date) ? '' : 'text-red-300';
                  }}
                />
                </div>
              </div>
            </div>
            
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <div>
              <label className="block text-gray-700 mb-2">Fecha seleccionada:</label>
              <div className="flex items-center">
                <DatePicker
                  selected={formData.fecha}
                  onChange={handleFechaChange}
                  dateFormat="dd/MM/yyyy"
                  className="w-full p-2 border border-gray-300 rounded"
                  minDate={new Date()}
                  locale="es"
                  excludeDates={fechasOcupadas}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Número aproximado de invitados:</label>
                <input 
                  type="number"
                min="10"
                max="500"
                  value={formData.invitados}
                  onChange={handleInvitadosChange}
                className="w-full p-2 border border-gray-300 rounded"
                />
            </div>
          </div>

          <div className="mt-8">
            <h5 className="text-lg text-gray-700 mb-4">Seleccione el tipo de evento</h5>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tiposEvento.map((tipo) => (
                <div
                  key={tipo.id || tipo._id}
                  className={`border p-4 rounded-lg cursor-pointer transition-all ${
                    formData.tipoEvento === tipo.id || formData.tipoEvento === tipo._id
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                      : 'border-gray-200 hover:border-[var(--color-primary)]/50'
                  }`}
                  onClick={() => handleSelectTipoEvento(tipo.id || tipo._id)}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                      <Image
                        src={tipo.icono || '/images/placeholder/event.jpg'}
                        alt={tipo.titulo}
                        width={64}
                        height={64}
                        className="object-contain"
                      />
                    </div>
                    <h3 className="font-medium text-lg mb-1">{tipo.titulo}</h3>
                    <p className="text-sm text-gray-500">{tipo.descripcionCorta}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Sección de selección de habitaciones */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h4 className="text-lg font-semibold text-[var(--color-accent)] mb-4">Habitaciones para el evento</h4>
          
          <div className="mb-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={necesitaHabitaciones}
                onChange={() => setNecesitaHabitaciones(!necesitaHabitaciones)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="text-gray-700">Necesito habitaciones para los invitados de mi evento</span>
            </label>
          </div>
          
          {necesitaHabitaciones && (
            <div className="border rounded-lg p-6 bg-white shadow-sm">
              {formData.fecha ? (
                <>
                  <RoomListSection 
                    onSelectRoom={handleSelectRoom}
                    fechaEntrada={formData.fecha}
                    fechaSalida={formData.fecha}
                    tipoEvento={formData.tipoEvento}
                    mostrarTodas={true}
                    selectedRooms={habitacionesSeleccionadasManual}
                    hidePrice={true}
                    modoEvento={true}
                  />
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-amber-600 mb-3">Por favor, seleccione primero la fecha del evento</p>
                  <button 
                    onClick={() => document.getElementById('fechaInicio')?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-4 py-2 bg-[var(--color-accent)] text-white rounded hover:bg-[var(--color-accent)]/90"
                  >
                    Ir a selección de fecha
                  </button>
                </div>
              )}
              
              {/* Resumen de habitaciones seleccionadas */}
              {habitacionesSeleccionadasManual.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h5 className="text-lg font-medium text-gray-800 mb-2">Habitaciones seleccionadas:</h5>
                  <div className="divide-y divide-gray-200 max-h-[300px] overflow-y-auto">
                    {habitacionesSeleccionadasManual.map((hab) => (
                      <div key={hab._id || hab.id} className="py-3 flex justify-between items-center">
                        <div>
                          <span className="text-gray-700 font-medium">{hab.nombre}</span>
                          <p className="text-sm text-gray-500">
                            {new Date(hab.fechaEntrada).toLocaleDateString('es-MX')}
                            {hab.fechaEntrada !== hab.fechaSalida && ` - ${new Date(hab.fechaSalida).toLocaleDateString('es-MX')}`}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600">Incluido en paquete</span>
                          <button 
                            onClick={() => handleSelectRoom({...hab, accion: 'deseleccionar'})}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex justify-between font-semibold">
                      <span>Total habitaciones:</span>
                      <span>{habitacionesSeleccionadasManual.length}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Las habitaciones forman parte del paquete del evento. Recibirá un presupuesto completo.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Mostrar servicios adicionales si hay */}
        {(habitacionesSeleccionadas.length > 0) && (
          <div id="servicios-adicionales" className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-xl font-semibold mb-4 text-[var(--color-primary)]">
              Servicios adicionales seleccionados
            </h3>
            
            {habitacionesSeleccionadas.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700">Habitaciones: {habitacionesSeleccionadas.length}</h4>
                <div className="mt-2 text-sm text-gray-600">
                  Total habitaciones: ${calcularTotalHabitaciones().toFixed(2)}
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 mt-4">
              <Link href="/habitaciones" className="text-sm text-[var(--color-primary)] hover:underline">
                Agregar habitaciones
              </Link>
              <span className="text-gray-300">|</span>
              <a 
                href="#servicios-adicionales" 
                className="text-sm text-[var(--color-primary)] hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('servicios-adicionales').scrollIntoView({behavior: 'smooth'});
                }}
              >
                Ver detalles
              </a>
            </div>
          </div>
        )}
        
        <div className="flex justify-end mt-4">
          <div className="flex gap-4">
            <button
              onClick={() => setPaso(1)}
              className="px-6 py-2 border-2 border-[var(--color-primary)] text-[var(--color-primary)] rounded hover:bg-[var(--color-primary)]/5"
            >
              Anterior
            </button>
            <button
              onClick={handleProceedToPaso3}
              className="px-6 py-2 bg-[var(--color-accent)] text-white rounded hover:bg-[var(--color-accent)]/90"
              disabled={!formData.tipoEvento || !formData.fecha}
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Renderizar el paso 3 (información personal y resumen)
  const renderPaso3 = () => {
    // Calcular el total de habitaciones manual
    const totalHabitacionesManual = habitacionesSeleccionadasManual.length; 
    
    return (
      <div id="paso-3" className="mb-12">
        <h3 className="text-2xl font-semibold text-[var(--color-accent)] mb-6">
          Confirmar Cotización
        </h3>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h4 className="text-xl font-semibold text-[var(--color-primary)] mb-4">
            Detalles del Evento
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-gray-700 font-medium">Tipo de Evento:</p>
              <p className="text-gray-900">
                {tiposEvento.find(t => t.id === formData.tipoEvento || t._id === formData.tipoEvento)?.titulo || 'No seleccionado'}
              </p>
            </div>
            
            <div>
              <p className="text-gray-700 font-medium">Fecha:</p>
              <p className="text-gray-900">
                {formData.fecha ? formData.fecha.toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }) : 'No seleccionada'}
              </p>
            </div>
            
            <div>
              <p className="text-gray-700 font-medium">Número de Invitados:</p>
              <p className="text-gray-900">{formData.invitados}</p>
            </div>
            
            <div>
              <p className="text-gray-700 font-medium">Precio Base:</p>
              <p className="text-gray-900 font-semibold">
                ${tiposEvento.find(t => t.id === formData.tipoEvento || t._id === formData.tipoEvento)?.precio || '0.00'}
              </p>
            </div>
          </div>
          
          {/* Servicios Adicionales */}
          <div className="mt-8 mb-6">
            <h4 className="text-lg font-semibold text-[var(--color-primary)] mb-4 pb-2 border-b border-gray-200">
              Servicios Adicionales
            </h4>
            
            {/* Habitaciones seleccionadas del contexto */}
            {habitacionesSeleccionadas.length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-gray-700 mb-2">Habitaciones (desde selección previa):</h5>
                <div className="space-y-2">
                  {habitacionesSeleccionadas.map((habitacion) => (
                    <div key={habitacion.id} className="flex justify-between items-start bg-gray-50 p-2 rounded">
                      <div>
                        <span className="font-medium">{habitacion.nombre}</span>
                        <span className="text-sm text-gray-600 ml-2">
                          ({new Date(habitacion.fechaEntrada).toLocaleDateString()} - {new Date(habitacion.fechaSalida).toLocaleDateString()})
                        </span>
                      </div>
                      <p className="font-semibold">${parseFloat(habitacion.precio).toFixed(2)}</p>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Total Habitaciones (selección previa):</p>
                      <p className="font-semibold text-[var(--color-primary)]">${calcularTotalHabitaciones().toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Habitaciones seleccionadas manualmente */}
            {habitacionesSeleccionadasManual.length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-gray-700 mb-2">Habitaciones para invitados:</h5>
                <div className="space-y-2">
                  {habitacionesSeleccionadasManual.map((habitacion) => (
                    <div key={habitacion._id || habitacion.id} className="flex justify-between items-start bg-gray-50 p-2 rounded">
                      <div>
                        <span className="font-medium">{habitacion.nombre}</span>
                        <span className="text-sm text-gray-600 ml-2">
                          {new Date(habitacion.fechaEntrada).toLocaleDateString()}
                          {habitacion.fechaEntrada !== habitacion.fechaSalida && 
                            ` - ${new Date(habitacion.fechaSalida).toLocaleDateString()}`}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Incluido en paquete</p>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Total Habitaciones para invitados:</p>
                      <p className="font-semibold text-[var(--color-primary)]">{totalHabitacionesManual}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Total general */}
            {(habitacionesSeleccionadas.length > 0 || habitacionesSeleccionadasManual.length > 0) && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total Servicios Adicionales:</span>
                  <span>${calcularTotalReserva().toFixed(2)}</span>
                </div>
              </div>
            )}
            
            {habitacionesSeleccionadas.length === 0 && habitacionesSeleccionadasManual.length === 0 && (
              <p className="text-gray-500 italic">No se han seleccionado servicios adicionales.</p>
            )}
          </div>
        </div>
        
        {/* Formulario de contacto */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h4 className="text-xl font-semibold text-[var(--color-primary)] mb-4">
            Información de Contacto
          </h4>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre*
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                required
              />
            </div>
            
            <div>
              <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 mb-1">
                Apellidos*
              </label>
              <input
                type="text"
                id="apellidos"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico*
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                required
              />
            </div>
            
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono*
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                required
              />
            </div>
            
            <div>
              <label htmlFor="comentarios" className="block text-sm font-medium text-gray-700 mb-1">
                Comentarios o Peticiones Especiales
              </label>
              <textarea
                id="comentarios"
                name="comentarios"
                value={formData.comentarios}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              ></textarea>
            </div>
          </div>
          
          {submitError && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
              {submitError}
            </div>
          )}
          
          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={() => setPaso(2)}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Anterior
            </button>
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Solicitud de Cotización'}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Paso 4: Confirmación - Solo se muestra cuando paso es 4
  const renderPaso4 = () => {
    return paso === 4 ? (
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
                  <p><strong>Tipo de evento:</strong> {formData.tipoEvento && tiposEvento.find(t => t.id === formData.tipoEvento || t._id === formData.tipoEvento)?.titulo}</p>
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
              
              {/* Habitaciones del contexto */}
              {habitacionesSeleccionadas.length > 0 && (
                <div>
                  <h4 className="font-medium text-[var(--color-accent)] mb-2">Habitaciones (selección previa)</h4>
                  <div className="space-y-3">
                    {habitacionesSeleccionadas.map((habitacion, index) => (
                      <div key={index} className="p-3 bg-white rounded shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{habitacion.nombre}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(habitacion.fechaEntrada).toLocaleDateString()} - 
                              {new Date(habitacion.fechaSalida).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="font-semibold">${parseFloat(habitacion.precio).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <p className="font-medium">Total Habitaciones:</p>
                        <p className="font-semibold text-[var(--color-primary)]">${calcularTotalHabitaciones().toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Habitaciones seleccionadas manualmente */}
              {habitacionesSeleccionadasManual.length > 0 && (
                <div>
                  <h4 className="font-medium text-[var(--color-accent)] mb-2">Habitaciones para Invitados</h4>
                  <div className="space-y-3">
                    {habitacionesSeleccionadasManual.map((habitacion, index) => (
                      <div key={index} className="p-3 bg-white rounded shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{habitacion.nombre}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(habitacion.fechaEntrada).toLocaleDateString()}
                              {habitacion.fechaEntrada !== habitacion.fechaSalida && 
                                ` - ${new Date(habitacion.fechaSalida).toLocaleDateString()}`}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600">Incluido en paquete</p>
                        </div>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <p className="font-medium">Total Habitaciones para Invitados:</p>
                        <p className="font-semibold text-[var(--color-primary)]">{habitacionesSeleccionadasManual.length}</p>
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
    ) : null;
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
          
          {/* Contenido del header */}
          <div className="container mx-auto px-6 relative z-20 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-[var(--font-display)] leading-tight tracking-tight mb-4 transform-style-preserve-3d">
                <span className="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]">Reserva </span>
                <span style={{fontFamily: "'Trajan Pro', 'Cinzel', 'Didot', serif", color: "var(--color-primary)", textShadow: "0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB", transform: "translateZ(20px)", display: "inline-block"}}>TU EVENTO</span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto mb-8 perspective-[1000px] transform-style-preserve-3d">
                <span className="text-white drop-shadow-[0_0_3px_rgba(110,70,20,0.9)]">Crea momentos inolvidables en un entorno único con servicios personalizados para cada ocasión</span>
              </p>
            </div>
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
            {/* SVG del medallón */}
            <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              {/* Este contenido se mantiene igual */}
              <defs>
                <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="black" floodOpacity="0.8" />
                </filter>
              </defs>
              <circle cx="250" cy="250" r="225" fill="rgba(0,0,0,0.3)" />
              <circle cx="250" cy="250" r="245" fill="none" stroke="#FFFAF0" strokeWidth="1" strokeDasharray="8,8" opacity="0.3" />
              <circle cx="250" cy="250" r="230" fill="none" stroke="#FFFAF0" strokeWidth="1" strokeDasharray="5,5" opacity="0.4" />
              <path d="M250,30 
                     C330,30 400,90 430,170
                     C460,250 440,350 370,410
                     C300,470 200,470 130,410
                     C60,350 40,250 70,170
                     C100,90 170,30 250,30 Z" 
                  fill="none" stroke="#800020" strokeWidth="2" opacity="0.5" />
              <circle cx="250" cy="250" r="150" fill="none" stroke="#800020" strokeWidth="1" opacity="0.3" />
              <circle cx="250" cy="250" r="120" fill="none" stroke="#800020" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
              <line x1="250" y1="100" x2="250" y2="25" stroke="#800020" strokeWidth="1" opacity="0.5" />
              <line x1="100" y1="250" x2="25" y2="250" stroke="#800020" strokeWidth="1" opacity="0.5" />
              <line x1="250" y1="400" x2="250" y2="475" stroke="#800020" strokeWidth="1" opacity="0.5" />
              <line x1="400" y1="250" x2="475" y2="250" stroke="#800020" strokeWidth="1" opacity="0.5" />
              <line x1="175" y1="175" x2="125" y2="125" stroke="#800020" strokeWidth="1" opacity="0.5" />
              <line x1="325" y1="175" x2="375" y2="125" stroke="#800020" strokeWidth="1" opacity="0.5" />
              <line x1="175" y1="325" x2="125" y2="375" stroke="#800020" strokeWidth="1" opacity="0.5" />
              <line x1="325" y1="325" x2="375" y2="375" stroke="#800020" strokeWidth="1" opacity="0.5" />
              <path d="M250,180 
                     C270,150 310,150 310,180 
                     C310,210 250,240 250,240 
                     C250,240 190,210 190,180 
                     C190,150 230,150 250,180 Z" 
                  fill="none" stroke="#800020" strokeWidth="2" opacity="0.6" />
              <rect x="200" y="270" width="100" height="90" rx="5" fill="none" stroke="#FFFAF0" strokeWidth="1.5" opacity="0.8" />
              <line x1="220" y1="270" x2="220" y2="260" stroke="#FFFAF0" strokeWidth="1.5" opacity="0.8" />
              <line x1="280" y1="270" x2="280" y2="260" stroke="#FFFAF0" strokeWidth="1.5" opacity="0.8" />
              <line x1="200" y1="295" x2="300" y2="295" stroke="#FFFAF0" strokeWidth="1" opacity="0.6" />
              <text x="250" y="330" textAnchor="middle" fontFamily="serif" fontSize="32" fill="#FFFAF0" fontWeight="bold" opacity="0.9" filter="url(#textShadow)">
                ✓
              </text>
              <g transform="translate(250, 200)">
                <text textAnchor="middle" fontFamily="'Trajan Pro', 'Cinzel', 'Didot', serif" fontSize="26" fill="#FFFAF0" fontWeight="light" opacity="0.95" letterSpacing="3" filter="url(#textShadow)">
                  RESERVA
                </text>
              </g>
              <g transform="translate(250, 250)" className="text-white">
                <text textAnchor="middle" fontFamily="'Trajan Pro', 'Cinzel', 'Didot', serif" fontSize="48" fontWeight="900" fill="#FFFFFF" opacity="0.95" filter="url(#textShadow)" style={{ textShadow: '0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB' }}>
                  COTIZACIÓN
                </text>
                <text textAnchor="middle" fontFamily="'Trajan Pro', 'Cinzel', 'Didot', serif" fontSize="24" fontWeight="900" fill="#FFFFFF" opacity="0.95" filter="url(#textShadow)" y="50" style={{ textShadow: '0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB' }}>
                  DE EVENTOS
                </text>
                <text textAnchor="middle" fontFamily="'Trajan Pro', 'Cinzel', 'Didot', serif" fontSize="18" fontWeight="normal" fill="#FFFFFF" opacity="0.95" filter="url(#textShadow)" y="100" style={{ textShadow: '0px 0px 3px rgba(0,0,0,0.9), 0px 0px 6px rgba(0,0,0,0.7), 2px 2px 0px #8B0000, -1px -1px 0px #FFDBDB' }}>
                  Reserva tu espacio para celebraciones únicas
                </text>
              </g>
            </svg>
          </div>
          
          {/* Elementos decorativos */}
          <div className="absolute top-20 left-20 w-32 h-32 border border-white/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-32 right-20 w-48 h-48 border border-[var(--color-primary)]/30 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-40 right-40 w-20 h-20 border border-[var(--color-primary)]/40 rounded-full animate-pulse delay-500"></div>
        </section>
        
        {/* Formulario de reserva en formato vertical */}
        <div id="formulario-reserva" className="py-16 relative z-10 bg-[var(--color-cream-light)]">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="mx-auto">
              <h2 className="text-3xl font-bold text-center mb-10 text-[var(--color-primary)]">
                Formulario de Reserva
              </h2>
              
              {/* Sección 1: Selección de Tipo de Evento */}
              <div className="mb-16">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                  <h3 className="text-2xl font-semibold text-[var(--color-accent)] mb-6">
                    1. Seleccione el tipo de evento
                  </h3>
                  <div className="w-full overflow-hidden">
                    {renderPaso1()}
                  </div>
                </div>
              </div>
                
              {/* Sección 2: Detalles del Evento */}
              <div className="mb-16">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                  <h3 className="text-2xl font-semibold text-[var(--color-accent)] mb-6">
                    2. Detalles del Evento
                  </h3>
                  {renderPaso2()}
                </div>
              </div>
                
              {/* Sección 3: Información Personal y Resumen */}
              <div className="mb-16">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                  <h3 className="text-2xl font-semibold text-[var(--color-accent)] mb-6">
                    3. Información de Contacto y Confirmación
                  </h3>
                  {renderPaso3()}
                </div>
              </div>
              
              {/* Sección 4: Confirmación (Solo visible cuando se envía correctamente) */}
              {paso === 4 && (
                <div className="mb-16">
                  <div className="bg-white p-8 rounded-lg shadow-lg">
                    <h3 className="text-2xl font-semibold text-[var(--color-accent)] mb-6">
                      4. Confirmación de Reserva
                    </h3>
                    {renderPaso4()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}