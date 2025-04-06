"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaUsers, FaChevronRight, FaCheck, FaRegClock, FaExclamationTriangle, FaTrash, FaCheckCircle } from 'react-icons/fa';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { createEventoReservation, checkEventoAvailability, getEventoOccupiedDates, createMasajeReservation, checkMasajeAvailability } from '@/services/reservationService';
import { getTiposMasaje } from '@/services/masajeService';
import { getTiposEvento } from '@/services/eventoService';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

// Importar componentes
import DatePicker, { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import "react-datepicker/dist/react-datepicker.css";
import { useReservation } from '@/context/ReservationContext';

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
    // Eliminar estos campos ya que se usan los del contexto
    masajesSeleccionados: [],
    habitacionesSeleccionadas: [],
    espacioSeleccionado: 'jardin'
  });
  
  // Usar el contexto de reservaciones
  const { 
    masajesSeleccionados, 
    habitacionesSeleccionadas, 
    eliminarMasaje: eliminarMasajeSeleccionado, 
    eliminarHabitacion: eliminarHabitacionSeleccionada, 
    calcularTotalMasajes,
    calcularTotalHabitaciones,
    calcularTotalReserva,
    limpiarReserva,
    agregarMasaje,
    agregarHabitacion
  } = useReservation();

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
  const [fechasDestacadas, setFechasDestacadas] = useState([]);
  const [espaciosDisponibles, setEspaciosDisponibles] = useState([
    { id: 'jardin', nombre: 'Jardín Principal' },
    { id: 'salon', nombre: 'Salón de Eventos' },
    { id: 'terraza', nombre: 'Terraza Panorámica' }
  ]);
  
  // Añadir console.log para depurar
  useEffect(() => {
    console.log("Estado del contexto de reservación:", { 
      masajesSeleccionados, 
      habitacionesSeleccionadas 
    });
  }, [masajesSeleccionados, habitacionesSeleccionadas]);
  
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
      const masajesParam = searchParams.get('masajes');
      const habitacionesParam = searchParams.get('habitaciones');
      
      console.log('Parámetros URL:', { tipo, masajesParam, habitacionesParam });

      // Procesar masajes
      if (masajesParam) {
        try {
          const masajesData = JSON.parse(decodeURIComponent(masajesParam));
          console.log('Masajes decodificados:', masajesData);
          
          if (Array.isArray(masajesData) && masajesData.length > 0) {
            const masajesProcesados = masajesData.map(masaje => ({
              id: masaje.id || Math.random().toString(36).substr(2, 9),
              titulo: masaje.titulo || masaje.nombre || 'Masaje sin nombre',
              duracion: masaje.duracion || 0,
              precio: typeof masaje.precio === 'number' ? masaje.precio : parseFloat(masaje.precio || 0)
            }));
            
            // Añadir masajes al contexto
            masajesProcesados.forEach(masaje => {
              agregarMasaje(masaje);
            });
            
            toast.success(`${masajesProcesados.length} masaje(s) añadido(s)`);
            
            // Programar un desplazamiento al elemento después de que se procesen los datos
            setTimeout(() => {
              const serviciosElement = document.getElementById('servicios-adicionales');
              if (serviciosElement) {
                serviciosElement.scrollIntoView({ behavior: 'smooth' });
              }
            }, 500);
          }
        } catch (error) {
          console.error('Error al procesar masajes:', error);
          toast.error('Error al procesar los masajes seleccionados');
        }
      } 
      
      // Procesar habitaciones
      if (habitacionesParam) {
        try {
          const habitacionesData = JSON.parse(decodeURIComponent(habitacionesParam));
          console.log('Habitaciones decodificadas:', habitacionesData);
          
          if (Array.isArray(habitacionesData) && habitacionesData.length > 0) {
            const habitacionesProcesadas = habitacionesData.map(habitacion => ({
              id: habitacion.id || Math.random().toString(36).substr(2, 9),
              nombre: habitacion.nombre || 'Habitación sin nombre',
              fechaEntrada: habitacion.fechaEntrada || new Date().toISOString().split('T')[0],
              fechaSalida: habitacion.fechaSalida || new Date().toISOString().split('T')[0],
              precio: typeof habitacion.precio === 'number' ? habitacion.precio : parseFloat(habitacion.precio || 0)
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

      // Procesar tipo de masaje preseleccionado
      if (tipo === 'masaje') {
        const masajePreseleccionado = {
          id: searchParams.get('id') || Math.random().toString(36).substr(2, 9),
          titulo: searchParams.get('nombre') || 'Masaje',
          duracion: searchParams.get('duracion') || '60',
          precio: parseInt(searchParams.get('precio')) || 0
        };
        
        // Añadir al contexto
        agregarMasaje(masajePreseleccionado);
      toast.info('Seleccione un tipo de evento para continuar con la reserva del masaje');
    }
      // Procesar tipo de habitación preseleccionada
      else if (tipo === 'habitacion') {
        const habitacionPreseleccionada = {
          id: searchParams.get('id') || Math.random().toString(36).substr(2, 9),
          nombre: searchParams.get('nombre') || 'Habitación',
          fechaEntrada: searchParams.get('fechaEntrada') || new Date().toISOString().split('T')[0],
          fechaSalida: searchParams.get('fechaSalida') || new Date().toISOString().split('T')[0],
          precio: parseInt(searchParams.get('precio')) || 0
        };
        
        // Añadir al contexto
        agregarHabitacion(habitacionPreseleccionada);
        toast.info('Seleccione un tipo de evento para continuar con la reserva de la habitación');
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

  // Al cargar el componente, ir directamente a la sección de servicios si hay un fragmento en la URL
  useEffect(() => {
    // Verificar si hay un fragmento de servicios-adicionales en la URL
    if (window.location.hash === '#servicios-adicionales') {
      setTimeout(() => {
        const serviciosElement = document.getElementById('servicios-adicionales');
        if (serviciosElement) {
          serviciosElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, []);

  // Renderizar el resumen de servicios (masajes y habitaciones)
  const renderResumenServicios = () => {
    console.log('Renderizando resumen de servicios (función principal):', {
      masajes: masajesSeleccionados,
      habitaciones: habitacionesSeleccionadas
    });

    // Verificar si los datos están vacíos
    if (masajesSeleccionados.length === 0 && habitacionesSeleccionadas.length === 0) {
      console.log('No hay servicios seleccionados');
      return (
        <section id="servicios-adicionales" className="mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h4 className="text-lg font-semibold text-[var(--color-accent)] mb-4">
              Servicios Adicionales
            </h4>
            <p className="text-gray-500 italic">No hay servicios adicionales seleccionados.</p>
            <div className="mt-4 flex gap-2">
              <Link href="/masajes" className="text-[var(--color-primary)] hover:underline">
                Agregar masajes
              </Link>
              <span className="text-gray-400">|</span>
              <Link href="/habitaciones" className="text-[var(--color-primary)] hover:underline">
                Agregar habitaciones
              </Link>
            </div>
          </div>
        </section>
      );
    }

    try {
      const totalMasajes = calcularTotalMasajes();
      const totalHabitaciones = calcularTotalHabitaciones();
      const totalGeneral = calcularTotalReserva();

      return (
        <section id="servicios-adicionales" className="mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h4 className="text-lg font-semibold text-[var(--color-accent)] mb-4">
              Servicios Adicionales
            </h4>
            
            {masajesSeleccionados.length > 0 && (
              <div className="mb-6">
                <h5 className="font-medium text-gray-700 mb-2">Masajes seleccionados:</h5>
                <div className="space-y-3">
                  {masajesSeleccionados.map((masaje) => (
                    <div key={masaje.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-gray-50">
                      <div>
                        <div className="font-medium">{masaje.titulo || masaje.nombre}</div>
                        <div className="text-sm text-gray-600">
                          Duración: {masaje.duracion} min | Precio: ${parseFloat(masaje.precio).toFixed(2)}
                        </div>
                      </div>
                      <button
                        onClick={() => eliminarMasajeSeleccionado(masaje.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Eliminar masaje"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-right font-medium">
                  Total masajes: ${totalMasajes.toFixed(2)}
                </div>
              </div>
            )}
            
            {habitacionesSeleccionadas.length > 0 && (
              <div className="mb-6">
                <h5 className="font-medium text-gray-700 mb-2">Habitaciones seleccionadas:</h5>
                <div className="space-y-3">
                  {habitacionesSeleccionadas.map((habitacion) => (
                    <div key={habitacion.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-gray-50">
                      <div>
                        <div className="font-medium">{habitacion.nombre}</div>
                        <div className="text-sm text-gray-600">
                          Fechas tentativas: {new Date(habitacion.fechaEntrada).toLocaleDateString()} - {new Date(habitacion.fechaSalida).toLocaleDateString()} | 
                          Precio: ${parseFloat(habitacion.precio).toFixed(2)}
                        </div>
                      </div>
                      <button
                        onClick={() => eliminarHabitacionSeleccionada(habitacion.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Eliminar habitación"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-right font-medium">
                  Total habitaciones: ${totalHabitaciones.toFixed(2)}
                </div>
                <div className="mt-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                  <strong>Nota:</strong> Las fechas definitivas de hospedaje se ajustarán automáticamente según la fecha del evento seleccionada.
                </div>
              </div>
            )}
            
            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center font-semibold text-lg">
                <span>Total servicios adicionales:</span>
                <span>${totalGeneral.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/masajes" className="px-4 py-2 text-sm border border-[var(--color-primary)] text-[var(--color-primary)] rounded hover:bg-[var(--color-primary)]/5">
                Agregar más masajes
              </Link>
              <Link href="/habitaciones" className="px-4 py-2 text-sm border border-[var(--color-primary)] text-[var(--color-primary)] rounded hover:bg-[var(--color-primary)]/5">
                Agregar más habitaciones
              </Link>
            </div>
          </div>
        </section>
      );
    } catch (error) {
      console.error('Error al renderizar el resumen de servicios:', error);
      toast.error('Error al mostrar los servicios seleccionados');
      
      return (
        <section id="servicios-adicionales" className="mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h4 className="text-lg font-semibold text-[var(--color-accent)] mb-4">
              Servicios Adicionales
            </h4>
            <p className="text-red-500">
              Ocurrió un error al mostrar los servicios seleccionados. Por favor, intente nuevamente.
            </p>
            <div className="mt-4 flex gap-2">
              <Link href="/masajes" className="text-[var(--color-primary)] hover:underline">
                Agregar masajes
              </Link>
              <span className="text-gray-400">|</span>
              <Link href="/habitaciones" className="text-[var(--color-primary)] hover:underline">
                Agregar habitaciones
              </Link>
            </div>
          </div>
        </section>
      );
    }
  };

  // Función para verificar disponibilidad del espacio
  const verificarDisponibilidadEspacio = async (espacio, fecha, horaInicio, horaFin) => {
    try {
      console.log('Verificando disponibilidad:', { espacio, fecha, horaInicio, horaFin });
      
      const response = await apiClient.post('/reservas/eventos/disponibilidad', {
        fecha: fecha instanceof Date ? fecha.toISOString().split('T')[0] : fecha,
        espacio,
        horaInicio,
        horaFin
      });

      console.log('Respuesta de disponibilidad:', response);
      
      // Si no hay respuesta o no tiene la propiedad disponible, asumimos que no está disponible
      if (!response || typeof response.disponible !== 'boolean') {
        console.error('Respuesta inválida del servidor:', response);
        return false;
      }
      
      return response.disponible;
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      // Si hay un error 404, significa que el endpoint no existe
      if (error.response?.status === 404) {
        // Por ahora, asumimos que está disponible si el endpoint no existe
        console.warn('Endpoint de disponibilidad no implementado, asumiendo disponible');
        return true;
      }
      return false;
    }
  };

  // Modificar handleSubmit para verificar disponibilidad
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validaciones iniciales
      if (!formData.fecha) {
        throw new Error('Por favor, seleccione una fecha para el evento');
      }

      if (!formData.tipoEvento) {
        throw new Error('Por favor, seleccione un tipo de evento');
      }

      // Formatear la fecha del evento una sola vez
      const fechaEvento = formData.fecha.toISOString().split('T')[0];

      // Informar al usuario si hay habitaciones que se ajustarán a la fecha del evento
      if (habitacionesSeleccionadas.length > 0) {
        // Formatear fecha para mostrar al usuario
        const fechaEventoFormateada = formData.fecha.toLocaleDateString();
        const fechaSalidaAux = new Date(formData.fecha);
        fechaSalidaAux.setDate(fechaSalidaAux.getDate() + 1);
        const fechaSalidaFormateada = fechaSalidaAux.toLocaleDateString();
        
        toast.info(`Las fechas de las habitaciones se ajustarán a la fecha del evento: entrada ${fechaEventoFormateada}, salida ${fechaSalidaFormateada}`);
      }

      // Verificar disponibilidad del espacio
      console.log('Verificando disponibilidad para:', {
        espacio: formData.espacioSeleccionado,
        fecha: fechaEvento,
        horaInicio: "10:00",
        horaFin: "21:00"
      });

      const espacioDisponible = await verificarDisponibilidadEspacio(
        formData.espacioSeleccionado,
        fechaEvento,
        "10:00",
        "21:00"
      );

      if (!espacioDisponible) {
        toast.error('El espacio seleccionado no está disponible para la fecha y hora indicadas');
        setLoading(false);
        return;
      }

      // Validar masajes seleccionados de forma explícita
      const masajesValidados = [];
      
      for (const masaje of masajesSeleccionados) {
        // Verificación de ID
        const tipoMasajeId = masaje.tipoMasaje || masaje._id;
        if (!tipoMasajeId) {
          console.error('Masaje sin ID válido para tipoMasaje:', masaje);
          throw new Error('Tipo de masaje no válido');
        }
        
        // Verificación de precio
        let precio;
        try {
          precio = parseFloat(masaje.precio);
          if (isNaN(precio) || precio <= 0) {
            console.error('Precio de masaje inválido:', masaje.precio);
            throw new Error(`Precio de masaje no válido: ${masaje.precio}`);
          }
        } catch (err) {
          console.error('Error al parsear precio:', err);
          throw new Error(`Error al procesar el precio del masaje: ${masaje.precio}`);
        }
        
        // Construir objeto de masaje verificado
        const masajeValidado = {
          tipoMasaje: tipoMasajeId,
          titulo: masaje.titulo || masaje.nombre || 'Masaje sin nombre',
          // Ajustar la duración a uno de los valores permitidos en el enum [30, 60, 90, 120]
          duracion: ajustarDuracionValida(parseInt(masaje.duracion || 60)),
          hora: masaje.hora || "10:00",
          fecha: masaje.fecha || fechaEvento,
          nombreContacto: formData.nombre,
          apellidosContacto: formData.apellidos,
          emailContacto: formData.email,
          telefonoContacto: formData.telefono,
          precio: precio,
          estadoReserva: 'pendiente'
        };
        
        console.log('Masaje validado:', masajeValidado);
        masajesValidados.push(masajeValidado);
      }

      // Obtener y validar el tipo de evento
      const tipoEventoSeleccionado = tiposEvento.find(tipo => tipo._id === formData.tipoEvento);
      
      if (!tipoEventoSeleccionado) {
        throw new Error('El tipo de evento seleccionado no es válido');
      }

      // Construir el objeto de reserva
      const reservaData = {
        nombreEvento: `${tipoEventoSeleccionado.titulo || 'Evento'} - ${formData.nombre} ${formData.apellidos}`,
        tipoEvento: tipoEventoSeleccionado._id,
        fecha: fechaEvento,
        horaInicio: "10:00",
        horaFin: "21:00",
        espacioSeleccionado: formData.espacioSeleccionado,
        numInvitados: parseInt(formData.invitados),
        nombreContacto: formData.nombre,
        apellidosContacto: formData.apellidos,
        emailContacto: formData.email,
        telefonoContacto: formData.telefono,
        peticionesEspeciales: formData.comentarios || '',
        presupuestoEstimado: parseFloat(tipoEventoSeleccionado.precio || 0),
        serviciosAdicionales: {
          masajes: masajesValidados.map(masaje => {
            // Asegurarnos que el masaje tenga un ID válido y un precio válido
            if (!masaje.tipoMasaje) {
              console.error('Error: masaje sin tipoMasaje válido:', masaje);
              throw new Error('Tipo de masaje no válido');
            }
            
            // Validar precio
            let precioMasaje;
            try {
              precioMasaje = parseFloat(masaje.precio);
              if (isNaN(precioMasaje) || precioMasaje <= 0) {
                console.error('Error: precio de masaje inválido:', masaje.precio);
                throw new Error('Precio de masaje no válido');
              }
            } catch (error) {
              console.error('Error al parsear precio de masaje:', error);
              throw new Error('Error al procesar precio de masaje');
            }
            
            return {
              tipoMasaje: masaje.tipoMasaje,  // Campo obligatorio para el modelo
              titulo: masaje.titulo || masaje.nombre,
              duracion: ajustarDuracionValida(parseInt(masaje.duracion || 60)),
              hora: masaje.hora || "10:00",
              fecha: masaje.fecha || fechaEvento,
              nombreContacto: formData.nombre,
              apellidosContacto: formData.apellidos,
              emailContacto: formData.email,
              telefonoContacto: formData.telefono,
              precio: precioMasaje,  // Campo obligatorio para el modelo
              estadoReserva: 'pendiente'
            };
          }),
          habitaciones: habitacionesSeleccionadas.map(habitacion => {
            console.log('Procesando habitación para envío:', habitacion);
            
            // Usar la fecha del evento como la fecha de entrada
            const fechaEntrada = fechaEvento;
            
            // Calcular la fecha de salida como el día siguiente al evento
            const fechaSalida = new Date(fechaEvento);
            fechaSalida.setDate(fechaSalida.getDate() + 1);
            const fechaSalidaStr = fechaSalida.toISOString().split('T')[0];
            
            return {
              tipoHabitacion: habitacion.tipoHabitacion || habitacion.id,
              nombre: habitacion.nombre,
              fechaEntrada: fechaEntrada, // Fecha del evento
              fechaSalida: fechaSalidaStr, // Día después del evento
              precio: parseFloat(habitacion.precio),
              numeroHabitaciones: habitacion.numeroHabitaciones || 1,
              numHuespedes: habitacion.numHuespedes || 2
            };
          })
        }
      };

      console.log('Datos de reserva a enviar:', JSON.stringify(reservaData, null, 2));
      console.log('Habitaciones seleccionadas que se enviarán:', JSON.stringify(reservaData.serviciosAdicionales.habitaciones, null, 2));
      
      try {
        // Hacer la petición al backend
      const response = await createEventoReservation(reservaData);
        console.log('Respuesta del servidor:', response);
        
        if (response && (response.data || response.id)) {
          // Guardar los datos de confirmación para mostrarlos en la siguiente pantalla
          setConfirmationData({
            numeroReserva: response.data?.id || response.id,
          tipoEvento: tipoEventoSeleccionado.titulo,
            fecha: formData.fecha.toLocaleDateString(),
          invitados: formData.invitados,
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          email: formData.email,
          telefono: formData.telefono,
            masajes: masajesSeleccionados,
            habitaciones: habitacionesSeleccionadas,
            totalMasajes: calcularTotalMasajes(),
            totalHabitaciones: calcularTotalHabitaciones(),
            total: calcularTotalReserva()
          });
          
          // Limpiar el formulario después de enviar
          setFormData({
            tipoEvento: '',
            fecha: null,
            invitados: 50,
            nombre: '',
            apellidos: '',
            email: '',
            telefono: '',
            comentarios: ''
          });
          
          // Limpiar la selección en el contexto
          limpiarReserva();
          
          // Mostrar mensaje de éxito
          toast.success('¡Solicitud de cotización enviada con éxito!');
          
          // Avanzar al paso de confirmación
        setPaso(4);
      } else {
          throw new Error('No se recibió confirmación del servidor');
      }
    } catch (error) {
        console.error('Error detallado:', error);
        let mensajeError = 'Error desconocido al procesar la solicitud.';
        
        if (error.response?.data?.message) {
          mensajeError = error.response.data.message;
        } else if (error.message) {
          mensajeError = error.message;
        }
        
        setSubmitError(`Hubo un problema al enviar la solicitud: ${mensajeError}`);
        toast.error(mensajeError);
      }
    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
      setSubmitError(`Hubo un problema al enviar la solicitud: ${error.message || 'Error desconocido'}. Por favor, intente nuevamente.`);
      toast.error('Error al enviar la solicitud');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
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
    console.log('Masaje recibido para selección:', masaje);
    
    // Verificar que el masaje sea válido
    if (!masaje || typeof masaje !== 'object') {
      console.error('Masaje inválido:', masaje);
      toast.error('Error: Masaje inválido');
      return;
    }

    // Verificar que tenga un ID válido
    if (!masaje._id) {
      console.error('Error: Masaje sin ID de MongoDB:', masaje);
      toast.error('Error: Masaje sin ID válido');
      return;
    }

    // Verificar si ya está seleccionado
    const estaSeleccionado = masajesSeleccionados.some(m => m._id === masaje._id);
    
    if (estaSeleccionado) {
      // Si ya está seleccionado, lo removemos
      eliminarMasajeSeleccionado(masaje._id);
      toast.success(`${masaje.titulo || masaje.nombre} removido de la selección`);
    } else {
      // Validar precio
      const precio = parseFloat(masaje.precio || 0);
      if (isNaN(precio) || precio <= 0) {
        console.error('Error: Precio de masaje inválido:', masaje.precio);
        toast.error('Error: Precio de masaje inválido');
        return;
      }

      // Crear el objeto del masaje con todos los campos necesarios
      const nuevoMasaje = {
        _id: masaje._id,
        tipoMasaje: masaje._id, // Campo tipoMasaje debe ser el ID de MongoDB del masaje
        titulo: masaje.titulo || masaje.nombre || 'Masaje sin nombre',
        duracion: ajustarDuracionValida(parseInt(masaje.duracion || 60)),
        precio: precio, // Asegurar que precio sea un número
        hora: "10:00",
        fecha: formData.fecha ? formData.fecha.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        estadoReserva: 'pendiente',
        nombreContacto: formData.nombre || '',
        apellidosContacto: formData.apellidos || '',
        emailContacto: formData.email || '',
        telefonoContacto: formData.telefono || ''
      };
      
      console.log('Agregando nuevo masaje con estructura:', nuevoMasaje);
      agregarMasaje(nuevoMasaje);
      toast.success(`${masaje.titulo || masaje.nombre} agregado a la selección`);
    }
  };
  
  // Función para manejar la selección de habitaciones
  const handleHabitacionSelection = (habitacion) => {
    console.log('Habitación seleccionada:', habitacion);
    
    // Verificar si ya está seleccionada
    const estaSeleccionada = habitacionesSeleccionadas.some(h => h.id === habitacion._id);
    
    if (estaSeleccionada) {
      // Si ya está seleccionada, la removemos
      const nuevasHabitaciones = habitacionesSeleccionadas.filter(h => h.id !== habitacion._id);
      setHabitacionesSeleccionadas(nuevasHabitaciones);
      toast.success(`${habitacion.nombre} removida de la selección`);
    } else {
      // Si no está seleccionada, la agregamos
      const nuevaHabitacion = {
        id: habitacion._id, // Asegurarnos de usar el _id de MongoDB
        nombre: habitacion.nombre,
        fechaEntrada: habitacion.fechaEntrada || formData.fecha?.toISOString().split('T')[0],
        fechaSalida: habitacion.fechaSalida || formData.fecha?.toISOString().split('T')[0],
        precio: parseFloat(habitacion.precio || 0)
      };
      setHabitacionesSeleccionadas([...habitacionesSeleccionadas, nuevaHabitacion]);
      toast.success(`${habitacion.nombre} agregada a la selección`);
    }
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
  
  // Renderizar resumen de habitaciones
  const renderResumenHabitaciones = () => {
    if (!formData.habitacionesSeleccionadas || formData.habitacionesSeleccionadas.length === 0) {
      return null;
    }

    const totalHabitaciones = formData.habitacionesSeleccionadas.reduce((total, hab) => total + hab.precio, 0);

    return (
      <div className="mt-6 p-4 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30">
        <h4 className="text-lg font-[var(--font-display)] mb-4 text-[var(--color-primary)]">
          Habitaciones Seleccionadas
        </h4>
        <div className="space-y-3">
          {formData.habitacionesSeleccionadas.map((habitacion, index) => (
            <div key={index} className="flex justify-between items-start p-3 bg-white/50">
              <div>
                <p className="font-medium text-[var(--color-accent)]">{habitacion.nombre}</p>
                <p className="text-sm text-gray-600">
                  Fechas tentativas: {new Date(habitacion.fechaEntrada).toLocaleDateString()} - {new Date(habitacion.fechaSalida).toLocaleDateString()} | 
                  Precio: ${parseFloat(habitacion.precio).toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => eliminarHabitacionSeleccionada(habitacion.id)}
                className="text-red-500 hover:text-red-700"
                title="Eliminar habitación"
              >
                <FaTrash size={16} />
              </button>
            </div>
          ))}
          <div className="pt-3 border-t border-[var(--color-primary)]/20">
            <div className="flex justify-between items-center">
              <p className="font-medium">Total Habitaciones:</p>
              <p className="font-semibold text-[var(--color-primary)]">${totalHabitaciones}</p>
            </div>
          </div>
        </div>
        <div className="mt-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
          <strong>Nota:</strong> Las fechas definitivas de hospedaje se ajustarán automáticamente según la fecha del evento seleccionada.
        </div>
      </div>
    );
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
  
  // Modificar el renderizado del paso 2 para incluir la selección de masajes
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
        
        {/* Mostrar servicios adicionales si hay */}
        {(masajesSeleccionados.length > 0 || habitacionesSeleccionadas.length > 0) && (
          <div id="servicios-adicionales-resumen" className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-xl font-semibold mb-4 text-[var(--color-primary)]">
              Servicios adicionales seleccionados
            </h3>
            
            {masajesSeleccionados.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700">Masajes: {masajesSeleccionados.length}</h4>
                <div className="mt-2 text-sm text-gray-600">
                  Total masajes: ${calcularTotalMasajes().toFixed(2)}
                </div>
              </div>
            )}
            
            {habitacionesSeleccionadas.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700">Habitaciones: {habitacionesSeleccionadas.length}</h4>
                <div className="mt-2 text-sm text-gray-600">
                  Total habitaciones: ${calcularTotalHabitaciones().toFixed(2)}
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 mt-4">
              <Link href="/masajes" className="text-sm text-[var(--color-primary)] hover:underline">
                Agregar masajes
              </Link>
              <span className="text-gray-300">|</span>
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
  
  // Función para eliminar un masaje de la selección
  const handleRemoveMasaje = (id) => {
    console.log('Eliminando masaje con id:', id);
    eliminarMasajeSeleccionado(id);
    toast.success('Masaje eliminado de la selección');
  };

  // Función para eliminar una habitación de la selección
  const handleRemoveHabitacion = (id) => {
    console.log('Eliminando habitación con id:', id);
    eliminarHabitacionSeleccionada(id);
    toast.success('Habitación eliminada de la selección');
  };

  // Función para renderizar el resumen completo de servicios (masajes y habitaciones)
  const renderResumenServiciosFormData = () => {
    console.log('Renderizando resumen de servicios:', {
      masajes: masajesSeleccionados,
      habitaciones: habitacionesSeleccionadas
    });

    // Verificar si los datos están vacíos
    if (masajesSeleccionados.length === 0 && habitacionesSeleccionadas.length === 0) {
      console.log('No hay servicios seleccionados');
      return (
        <div id="servicios-adicionales" className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h4 className="text-lg font-semibold text-[var(--color-accent)] mb-4">
            Servicios Adicionales
          </h4>
          <p className="text-gray-500 italic">No hay servicios adicionales seleccionados.</p>
          <div className="mt-4 flex gap-2">
            <Link href="/masajes" className="text-[var(--color-primary)] hover:underline">
              Agregar masajes
            </Link>
            <span className="text-gray-400">|</span>
            <Link href="/habitaciones" className="text-[var(--color-primary)] hover:underline">
              Agregar habitaciones
            </Link>
          </div>
        </div>
      );
    }

    try {
      const totalMasajes = calcularTotalMasajes();
      const totalHabitaciones = calcularTotalHabitaciones();
      const totalGeneral = calcularTotalReserva();

      return (
        <div id="servicios-adicionales" className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h4 className="text-lg font-semibold text-[var(--color-accent)] mb-4">
            Servicios Adicionales
          </h4>
          
          {masajesSeleccionados.length > 0 && (
            <div className="mb-6">
              <h5 className="font-medium text-gray-700 mb-2">Masajes seleccionados:</h5>
              <div className="space-y-3">
                {masajesSeleccionados.map((masaje) => (
                  <div key={masaje.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div>
                      <div className="font-medium">{masaje.titulo || masaje.nombre}</div>
                      <div className="text-sm text-gray-600">
                        Duración: {masaje.duracion} min | Precio: ${parseFloat(masaje.precio).toFixed(2)}
                    </div>
                    </div>
                    <button
                      onClick={() => eliminarMasajeSeleccionado(masaje.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Eliminar masaje"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-right font-medium">
                Total masajes: ${totalMasajes.toFixed(2)}
              </div>
            </div>
          )}
          
          {habitacionesSeleccionadas.length > 0 && (
            <div className="mb-6">
              <h5 className="font-medium text-gray-700 mb-2">Habitaciones seleccionadas:</h5>
              <div className="space-y-3">
                {habitacionesSeleccionadas.map((habitacion) => (
                  <div key={habitacion.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div>
                      <div className="font-medium">{habitacion.nombre}</div>
                      <div className="text-sm text-gray-600">
                        Fechas tentativas: {new Date(habitacion.fechaEntrada).toLocaleDateString()} - {new Date(habitacion.fechaSalida).toLocaleDateString()} | 
                        Precio: ${parseFloat(habitacion.precio).toFixed(2)}
                      </div>
                    </div>
                    <button
                      onClick={() => eliminarHabitacionSeleccionada(habitacion.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Eliminar habitación"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-right font-medium">
                Total habitaciones: ${totalHabitaciones.toFixed(2)}
              </div>
              <div className="mt-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                <strong>Nota:</strong> Las fechas definitivas de hospedaje se ajustarán automáticamente según la fecha del evento seleccionada.
              </div>
            </div>
          )}
          
          <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center font-semibold text-lg">
              <span>Total servicios adicionales:</span>
              <span>${totalGeneral.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/masajes" className="px-4 py-2 text-sm border border-[var(--color-primary)] text-[var(--color-primary)] rounded hover:bg-[var(--color-primary)]/5">
              Agregar más masajes
            </Link>
            <Link href="/habitaciones" className="px-4 py-2 text-sm border border-[var(--color-primary)] text-[var(--color-primary)] rounded hover:bg-[var(--color-primary)]/5">
              Agregar más habitaciones
            </Link>
          </div>
        </div>
      );
    } catch (error) {
      console.error('Error al renderizar el resumen de servicios desde formData:', error);
      toast.error('Error al mostrar los servicios seleccionados');
      
      return (
        <div id="servicios-adicionales" className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h4 className="text-lg font-semibold text-[var(--color-accent)] mb-4">
            Servicios Adicionales
          </h4>
          <p className="text-red-500">
            Ocurrió un error al mostrar los servicios seleccionados. Por favor, intente nuevamente.
          </p>
          <div className="mt-4 flex gap-2">
            <Link href="/masajes" className="text-[var(--color-primary)] hover:underline">
              Agregar masajes
            </Link>
            <span className="text-gray-400">|</span>
            <Link href="/habitaciones" className="text-[var(--color-primary)] hover:underline">
              Agregar habitaciones
            </Link>
          </div>
        </div>
      );
    }
  };
  
  // Función para renderizar el paso 3 (información personal y resumen)
  const renderPaso3 = () => {
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
            
            {/* Masajes seleccionados */}
            {masajesSeleccionados.length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-gray-700 mb-2">Masajes:</h5>
                <div className="space-y-2">
                  {masajesSeleccionados.map((masaje) => (
                    <div key={masaje.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <div className="flex-1">
                        <span className="font-medium">{masaje.titulo || masaje.nombre}</span>
                        <span className="text-sm text-gray-600 ml-2">({masaje.duracion} min)</span>
                      </div>
                      <div className="text-gray-900 font-medium">
                        ${parseFloat(masaje.precio).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-right mt-2 font-medium">
                  Subtotal Masajes: ${calcularTotalMasajes().toFixed(2)}
                </div>
                  </div>
                )}
            
            {/* Habitaciones seleccionadas */}
            {habitacionesSeleccionadas.length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-gray-700 mb-2">Habitaciones:</h5>
                <div className="space-y-2">
                  {habitacionesSeleccionadas.map((habitacion) => (
                    <div key={habitacion.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <div className="flex-1">
                        <span className="font-medium">{habitacion.nombre}</span>
                        <span className="text-sm text-gray-600 ml-2">
                          ({new Date(habitacion.fechaEntrada).toLocaleDateString()} - {new Date(habitacion.fechaSalida).toLocaleDateString()})
                        </span>
              </div>
                      <div className="text-gray-900 font-medium">
                        ${parseFloat(habitacion.precio).toFixed(2)}
            </div>
                    </div>
                  ))}
                </div>
                <div className="text-right mt-2 font-medium">
                  Subtotal Habitaciones: ${calcularTotalHabitaciones().toFixed(2)}
                </div>
              </div>
            )}
            
            {/* Total general */}
            {(masajesSeleccionados.length > 0 || habitacionesSeleccionadas.length > 0) && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total Servicios Adicionales:</span>
                  <span>${calcularTotalReserva().toFixed(2)}</span>
                </div>
              </div>
            )}
            
            {masajesSeleccionados.length === 0 && habitacionesSeleccionadas.length === 0 && (
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
                required
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
                <p><strong>Tipo de evento:</strong> {formData.tipoEvento && tiposEvento.find(t => t.id === formData.tipoEvento || t._id === formData.tipoEvento).titulo}</p>
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
            {masajesSeleccionados.length > 0 && (
              <div>
                <h4 className="font-medium text-[var(--color-accent)] mb-2">Servicios de Masaje</h4>
                <div className="space-y-3">
                  {masajesSeleccionados.map((masaje, index) => (
                    <div key={index} className="p-3 bg-white rounded shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{masaje.titulo || masaje.nombre}</p>
                          <p className="text-sm text-gray-600">Duración: {masaje.duracion} min</p>
                        </div>
                        <p className="font-semibold">${parseFloat(masaje.precio).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Total Servicios de Masaje:</p>
                      <p className="font-semibold text-[var(--color-primary)]">
                        ${calcularTotalMasajes().toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Habitaciones */}
            {habitacionesSeleccionadas.length > 0 && (
              <div>
                <h4 className="font-medium text-[var(--color-accent)] mb-2">Habitaciones</h4>
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
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Total Habitaciones:</p>
                      <p className="font-semibold text-[var(--color-primary)]">
                        ${calcularTotalHabitaciones().toFixed(2)}
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
              href="#formulario-reserva" 
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
      
      {/* Formulario de reserva en formato vertical */}
      <div id="formulario-reserva" className="py-16 relative z-10 bg-[var(--color-cream-light)]">
        <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mx-auto">
            <h2 className="text-4xl font-bold text-center mb-10 text-[var(--color-primary)]">
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
              
            {/* Sección 3: Servicios Adicionales */}
            <div className="mb-16">
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold text-[var(--color-accent)] mb-6">
                  3. Servicios Adicionales
                </h3>
                {renderResumenServicios()}
              </div>
            </div>
            
            {/* Sección 4: Información Personal y Confirmación */}
            <div className="mb-16">
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold text-[var(--color-accent)] mb-6">
                  4. Información de Contacto y Confirmación
                </h3>
                {renderPaso3()}
                    </div>
                  </div>
                  
            {/* Sección de Confirmación (Solo visible cuando se envía correctamente) */}
        {paso === 4 && (
              <div className="mb-16">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                  <h3 className="text-2xl font-semibold text-[var(--color-accent)] mb-6">
                    5. Confirmación de Reserva
                  </h3>
                  <section id="paso-4" className="container-custom mb-12">
            <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
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
                      <p><strong>Tipo de evento:</strong> {formData.tipoEvento && tiposEvento.find(t => t.id === formData.tipoEvento || t._id === formData.tipoEvento).titulo}</p>
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
                          {masajesSeleccionados.length > 0 && (
                    <div>
                      <h4 className="font-medium text-[var(--color-accent)] mb-2">Servicios de Masaje</h4>
                      <div className="space-y-3">
                                {masajesSeleccionados.map((masaje, index) => (
                          <div key={index} className="p-3 bg-white rounded shadow-sm">
                            <div className="flex justify-between items-start">
                              <div>
                                        <p className="font-medium">{masaje.titulo || masaje.nombre}</p>
                                        <p className="text-sm text-gray-600">Duración: {masaje.duracion} min</p>
                              </div>
                                      <p className="font-semibold">${parseFloat(masaje.precio).toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                        <div className="pt-3 border-t">
                          <div className="flex justify-between items-center">
                            <p className="font-medium">Total Servicios de Masaje:</p>
                            <p className="font-semibold text-[var(--color-primary)]">
                                      ${calcularTotalMasajes().toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                          
                          {/* Habitaciones */}
                          {habitacionesSeleccionadas.length > 0 && (
                            <div>
                              <h4 className="font-medium text-[var(--color-accent)] mb-2">Habitaciones</h4>
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
                                <div className="pt-3 border-t">
                                  <div className="flex justify-between items-center">
                                    <p className="font-medium">Total Habitaciones:</p>
                                    <p className="font-semibold text-[var(--color-primary)]">
                                      ${calcularTotalHabitaciones().toFixed(2)}
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

// Función para ajustar la duración al valor permitido más cercano
const ajustarDuracionValida = (duracion) => {
  const duracionesValidas = [30, 60, 90, 120];
  
  // Si la duración ya es válida, la devolvemos tal cual
  if (duracionesValidas.includes(duracion)) {
    return duracion;
  }
  
  // Si no, encontramos el valor más cercano
  let duracionAjustada = duracionesValidas.reduce((prev, curr) => {
    return (Math.abs(curr - duracion) < Math.abs(prev - duracion) ? curr : prev);
  });
  
  console.log(`Ajustando duración inválida: ${duracion} min → ${duracionAjustada} min (valor permitido más cercano)`);
  return duracionAjustada;
};