"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaCalendarAlt, FaBed, FaUtensils, FaUser, FaCheck, FaChevronLeft, FaChevronRight, FaEnvelope, FaPhone, FaIdCard, FaMapMarkerAlt, FaInfoCircle, FaUsers, FaUserCog, FaCreditCard, FaUniversity, FaMoneyBillWave, FaSpinner } from 'react-icons/fa';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext'; 
import { useReservation } from '@/context/ReservationContext'; 
import { getTiposEvento } from '@/services/tiposEvento.service';
import { 
    createEventoReservation, 
    seleccionarMetodoPagoEvento,
    createEventoPaymentIntent
} from '@/services/reservationService'; 
import { obtenerFechasBloqueadasGlobales } from '@/services/disponibilidadService';
import { isSameDay, startOfDay, endOfDay, isValid } from 'date-fns';

import ModoSeleccionEvento from '@/components/reservas/ModoSeleccionEvento';
import ModoGestionServicios from '@/components/reservas/ModoGestionServicios';
import ModoGestionHabitaciones from '@/components/reservas/ModoGestionHabitaciones';
import ModalModoGestionHabitaciones from '@/components/reservas/ModalModoGestionHabitaciones';
import CalendarioReserva from '@/components/reservas/CalendarioReserva';
import NavbarReservar from '@/components/layout/NavbarReservar';
import Footer from '@/components/layout/Footer';
import ReciboReservaGlobal from '@/components/reservas/ReciboReservaGlobal';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '@/components/reservas/CheckoutForm';

// Cargar Stripe fuera del render para evitar recargas
// Usa tu clave pública de Stripe (debería estar en variables de entorno)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'TU_CLAVE_PUBLICA_DE_STRIPE'); 

// --- Helper Functions ---
// Función auxiliar para formatear fecha para la API (consistentemente YYYY-MM-DD)
const formatApiDate = (date) => {
  if (!date || !(date instanceof Date)) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- Componente Principal y Wizard ---
const ReservarPage = () => {
  // Opciones para el Elements provider (puedes personalizar apariencia, etc.)
  const options = {
    // clientSecret: se pasará más adelante cuando creemos el PaymentIntent
    // appearance: { theme: 'stripe' }, 
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Envolver el Wizard con Elements */}
      <Elements stripe={stripePromise} options={options}>
        <ReciboReservaGlobal />
        <ReservaWizard />
      </Elements>
    </div>
  );
};

export default ReservarPage;

// --- Nuevo componente Modal ---
const ValidationModal = ({ isOpen, onClose, message, setCurrentStep, redirectToStep }) => {
  if (!isOpen) return null;

  const handleGoToStep = () => {
    if (setCurrentStep && redirectToStep) {
      setCurrentStep(redirectToStep);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
        <div className="flex items-center mb-4">
          <FaInfoCircle className="text-red-500 text-2xl mr-3" />
          <h3 className="text-lg font-semibold text-gray-800">Error de Validación</h3>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex space-x-4">
          <button
            onClick={onClose}
            className="w-1/2 px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
          >
            Entendido
          </button>
          {redirectToStep && (
            <button
              onClick={handleGoToStep}
              className="w-1/2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Ir a Corregir
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
// --- Fin nuevo componente Modal ---

const ReservaWizard = () => {
  const { formData, updateFormSection, resetForm } = useReservation();
  const [currentStep, setCurrentStep] = useState(1);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrorMessage, setValidationErrorMessage] = useState('');
  const [validationRedirectStep, setValidationRedirectStep] = useState(null);
  const [selectedEventType, setSelectedEventType] = useState(formData.tipoEvento || null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const wizardContentRef = useRef(null);
  const [createdReservationId, setCreatedReservationId] = useState(null);
  
  // --- Estados para fechas bloqueadas (MODIFICADO) --- 
  // const [fechasBloqueadasAplanadas, setFechasBloqueadasAplanadas] = useState([]); // ELIMINADO
  const [occupiedDateRangesState, setOccupiedDateRangesState] = useState([]); // NUEVO: Guarda los rangos
  const [loadingFechasBloqueadas, setLoadingFechasBloqueadas] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState('');
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // --- Función para cargar fechas bloqueadas GLOBALES (MODIFICADA) --- 
  const cargarFechasBloqueadas = useCallback(async () => {
    setLoadingFechasBloqueadas(true);
    try {
      // 1. Obtener los RANGOS bloqueados
      const blockedRanges = await obtenerFechasBloqueadasGlobales();

      // 2. VALIDAR y almacenar los rangos DIRECTAMENTE
      const validRanges = blockedRanges
        .map(range => {
          // Convertir a Date y validar
          const inicio = new Date(range.inicio);
          const fin = new Date(range.fin);
          if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
            console.warn("[ReservaWizard] Rango inválido recibido:", range);
            return null;
          }
          // Asegurarse que inicio <= fin (opcional, pero bueno)
          if (inicio > fin) {
              console.warn("[ReservaWizard] Rango con inicio > fin recibido:", range);
              return null;
          }
          return { ...range, inicio, fin }; // Devolver con objetos Date
        })
        .filter(Boolean); // Filtrar nulos

      console.log("[ReservaWizard] Rangos de Fechas Bloqueadas recibidos:", validRanges);
      setOccupiedDateRangesState(validRanges || []); // Guardar los rangos válidos
      
    } catch (error) {
      console.error('Error cargando fechas bloqueadas globales:', error);
      toast.error('Error al cargar la disponibilidad del calendario.');
      setOccupiedDateRangesState([]); // Resetear en caso de error
    } finally {
      setLoadingFechasBloqueadas(false);
    }
  // Asegúrate que obtenerFechasBloqueadasGlobales sea estable o quita la dependencia si es importado directamente
  }, []); // Quitar dependencia si obtenerFechasBloqueadasGlobales es un import estático

  // --- Efecto para cargar fechas bloqueadas al inicio --- 
  useEffect(() => {
    cargarFechasBloqueadas();
  }, [cargarFechasBloqueadas]); // Ejecutar al montar

  // AÑADIDO: useEffect para resetear el formulario al montar el componente
  useEffect(() => {
    console.log("Reseteando formulario de reserva al montar ReservaWizard...");
    resetForm();
  }, [resetForm]); // Dependencia para evitar warnings de lint, asumiendo que resetForm es estable

  // *** NUEVO: Efecto para establecer default de habitaciones en Paso 2 ***
  useEffect(() => {
    if (currentStep === 2 && (!formData.numeroHabitaciones || formData.numeroHabitaciones < 7)) {
      console.log("[ReservaWizard Step 2 Effect] Estableciendo numeroHabitaciones default a 7");
      updateFormSection('numeroHabitaciones', 7);
    }
    // Ejecutar solo cuando el paso cambie a 2 o si el valor cambia mientras estamos en el paso 2
  }, [currentStep, formData.numeroHabitaciones, updateFormSection]);

  // Estilos para el contenedor principal del wizard
  const wizardContainerStyle = {
    background: 'linear-gradient(145deg, rgba(230,220,198,0.95), rgba(209,181,155,0.95))',
  };

  const steps = [
    {
      title: 'Tipo de Evento',
      description: 'Seleccione el tipo de evento que desea celebrar',
      icon: FaCalendarAlt
    },
    {
      title: 'Fecha y Habitaciones',
      description: 'Seleccione la fecha y el número de habitaciones necesarias',
      icon: FaCalendarAlt
    },
    {
      title: 'Gestión de Habitaciones',
      description: 'Asigne las habitaciones para sus huéspedes',
      icon: FaBed
    },
    {
      title: 'Servicios Adicionales',
      description: 'Seleccione los servicios adicionales para su evento',
      icon: FaUtensils
    },
    {
      title: 'Información de Contacto',
      description: 'Por favor, proporcione sus datos de contacto',
      icon: FaUser
    },
    {
      title: 'Resumen de la Reserva',
      description: 'Revise los detalles de su reserva',
      icon: FaCheck
    },
    {
      title: 'Seleccionar Método de Pago',
      description: 'Elija cómo desea pagar su reserva',
      icon: FaCreditCard
    }
  ];

  const handleNextStep = () => {
    // Validación según el paso actual
    if (currentStep === 1 && !selectedEventType) {
      toast.error('Por favor, seleccione un tipo de evento');
      return;
    }
    
    // MODIFICADO: Validar rango de fechas contra fechas bloqueadas GLOBALES
    if (currentStep === 2) {
      if (!formData.fechaInicio || !formData.fechaFin) {
        toast.error('Por favor, seleccione un rango de fechas para su evento');
        return;
      }
      
      // *** VALIDACIÓN CON RANGOS ***
      const selectedStart = startOfDay(new Date(formData.fechaInicio + 'T00:00:00'));
      const selectedEnd = endOfDay(new Date(formData.fechaFin + 'T00:00:00')); // Usar fin del día para incluirlo
      
      let isBlocked = false;
      for (const blockedRange of occupiedDateRangesState) {
          // Asegurar que tenemos fechas válidas en el rango bloqueado
          const blockedStart = startOfDay(blockedRange.inicio);
          const blockedEnd = endOfDay(blockedRange.fin);
          if (!isValid(blockedStart) || !isValid(blockedEnd)) continue; // Saltar rango inválido

          // Comprobar solapamiento: (StartA <= EndB) and (EndA >= StartB)
          if (selectedStart <= blockedEnd && selectedEnd >= blockedStart) {
              isBlocked = true;
              const formattedBlockedStart = blockedStart.toLocaleDateString('es-ES');
              const formattedBlockedEnd = blockedEnd.toLocaleDateString('es-ES');
              toast.error(`El rango seleccionado (${selectedStart.toLocaleDateString('es-ES')} - ${selectedEnd.toLocaleDateString('es-ES')}) incluye fechas ya ocupadas (${formattedBlockedStart} - ${formattedBlockedEnd}).`);
              break; // Salir del bucle si se encuentra un conflicto
          }
      }

      if (isBlocked) {
          return; // Detener si hay conflicto
      }
      
      // Si pasa la validación de fechas, continuar...
      if (!formData.numeroHabitaciones || formData.numeroHabitaciones < 1) {
        toast.error('Por favor, especifique el número de habitaciones (mínimo 1)');
        return;
      }  
    }

    // AÑADIDO: Validación para asegurar que se elija un modo en paso 3 antes de avanzar con 'Siguiente'
    if (currentStep === 3 && !formData.modoGestionHabitaciones) {
       toast.error('Por favor, seleccione un modo de gestión para las habitaciones.');
       return;
    }
    
    // Validación si modo organizador está seleccionado en paso 3 (Podrías añadir más validaciones aquí si ModoGestionHabitaciones lo requiere)
    if (currentStep === 3 && formData.modoGestionHabitaciones === 'usuario' && (!formData.habitacionesSeleccionadas || formData.habitacionesSeleccionadas.length === 0)) {
       toast.warning('Se recomienda seleccionar al menos una habitación si gestiona usted mismo.');
       // Permitimos avanzar pero con aviso, o podrías poner return; si es obligatorio.
    }
    
    // AÑADIDO: Validación para asegurar que se elija un modo en paso 4 antes de avanzar con 'Siguiente'
    if (currentStep === 4 && !formData.modoGestionServicios) {
       toast.error('Por favor, seleccione un modo de gestión para los servicios.');
       return;
    }

    // Validación si modo organizador está seleccionado en paso 4
    if (currentStep === 4 && formData.modoGestionServicios === 'usuario' && (!formData.serviciosSeleccionados || formData.serviciosSeleccionados.length === 0)) {
      toast.warning('No ha seleccionado ningún servicio adicional.');
      // Permitimos avanzar pero con aviso.
    }
    
    if (currentStep === 5) {
      const { nombre, apellidos, email, telefono } = formData.datosContacto;
      if (!nombre || !apellidos || !email || !telefono) {
        toast.error('Por favor, complete todos los campos obligatorios de contacto');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error('Por favor, ingrese un email válido');
        return;
      }
      // --- VALIDACIÓN TELÉFONO MX/ES ---
      const telefonoLimpio = telefono.replace(/\s+/g, ''); // Quitar espacios
      const mexicoRegex = /^\d{10}$/; // 10 dígitos MX
      const españaRegex = /^[6789]\d{8}$/; // 9 dígitos ES (empieza por 6, 7, 8 o 9)

      if (!mexicoRegex.test(telefonoLimpio) && !españaRegex.test(telefonoLimpio)) {
        toast.error('Por favor, ingrese un número de teléfono válido (10 dígitos para MX o 9 dígitos para ES)');
        return;
      }
      // ---------------------------------
    }
    
    if (currentStep === 6) {
      handleSubmit();
      return;
    }
    
    // Si todas las validaciones pasan, limpiar estado del modal (por si acaso)
    setShowValidationModal(false);
    setValidationErrorMessage('');
    // setValidationRedirectStep(null);
    
    setCurrentStep(prev => prev + 1);
  };

  // Añadido: Manejador para el cambio de rango de fechas
  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    // Validar si el rango seleccionado contiene alguna fecha bloqueada
    if (start && end) {
      let current = new Date(start);
      let conflict = false;
      while (current <= end) {
        if (occupiedDateRangesState.some(range => isSameDay(current, range.inicio) || isSameDay(current, range.fin))) {
          conflict = true;
          break;
        }
        current.setDate(current.getDate() + 1);
      }
      
      if (conflict) {
        toast.error('El rango seleccionado incluye días no disponibles. Por favor, elija otras fechas.');
        // Opcional: resetear fechas si hay conflicto
        // updateFormSection('fechaInicio', null);
        // updateFormSection('fechaFin', null);
        return; // No actualizar si hay conflicto
      }
    }
    
    // Actualizar fechas en el contexto/estado global si no hay conflicto
    updateFormSection('fechaInicio', start ? formatApiDate(start) : null);
    updateFormSection('fechaFin', end ? formatApiDate(end) : null);
  };

  const handleServicesSelect = (servicios) => {
    updateFormSection('serviciosSeleccionados', servicios);
  };
  
  // AÑADIDO: Manejador para selección directa de modo habitaciones
  const handleModoHabitacionesSelectDirect = (mode) => {
    updateFormSection('modoGestionHabitaciones', mode);
    if (mode === 'hacienda') {
      // Saltar al siguiente paso si eligen la hacienda
      setCurrentStep(prev => prev + 1); 
    }
    // Si es 'usuario', no hacemos nada aquí, el componente se mostrará
  };

  // AÑADIDO: Manejador para selección directa de modo servicios
  const handleModoServiciosSelectDirect = (mode) => {
    updateFormSection('modoGestionServicios', mode);
    if (mode === 'hacienda') {
      // Saltar al siguiente paso si eligen la hacienda
      setCurrentStep(prev => prev + 1); 
    }
    // Si es 'usuario', no hacemos nada aquí, el componente se mostrará
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Asegurarse de que fechaInicio es un objeto Date antes de formatear
      const fechaInicioDate = formData.fechaInicio instanceof Date 
                              ? formData.fechaInicio 
                              : (formData.fechaInicio ? new Date(formData.fechaInicio) : null);
                              
      const fechaISO = fechaInicioDate && !isNaN(fechaInicioDate) 
                       ? fechaInicioDate.toISOString().split('T')[0] 
                       : null;

      if (!fechaISO) {
        // Si después de intentar convertir sigue sin ser válida, lanzar error
        toast.error('La fecha de inicio de la reserva no es válida.');
        setLoading(false);
        return; 
      }
                       
      const apiData = {
        tipo_evento: formData.tipoEvento, 
        fecha: fechaISO, // Usar la fecha formateada y validada
        nombre_contacto: formData.datosContacto?.nombre,
        apellidos_contacto: formData.datosContacto?.apellidos,
        email_contacto: formData.datosContacto?.email,
        telefono_contacto: formData.datosContacto?.telefono,
        mensaje: formData.datosContacto?.mensaje,
        modo_gestion_habitaciones: formData.modoGestionHabitaciones,
        habitaciones: formData.modoGestionHabitaciones === 'usuario' 
          ? formData.habitacionesSeleccionadas?.map(hab => ({
              // Campos que el backend espera para crear una ReservaHabitacion asociada a un evento
              tipoHabitacion: hab.id, // Este es el ObjectId del TipoHabitacion
              habitacion: hab.letra || hab.nombre, // Letra o nombre de la habitación específica
              // Las fechas de la reserva de habitación serán las mismas que las del evento en este contexto
              fechaEntrada: fechaISO, 
              fechaSalida: formData.fechaFin ? new Date(formData.fechaFin).toISOString().split('T')[0] : fechaISO, // Asegurar fechaFin
              // Si tienes un precio específico por habitación seleccionada, úsalo.
              // Sino, el backend podría calcularlo o podrías omitirlo si no es mandatorio aquí.
              precio: hab.precio, 
              // Campos del contacto principal del evento, se podrían replicar o dejar que el backend los asocie
              nombreContacto: formData.datosContacto?.nombre,
              apellidosContacto: formData.datosContacto?.apellidos,
              emailContacto: formData.datosContacto?.email,
              telefonoContacto: formData.datosContacto?.telefono,
              estadoReserva: 'pendiente', // Estado inicial para la reserva de habitación
              // Otros campos que pudieras tener en tu `ReservaHabitacion` y que sean relevantes aquí
              // numHuespedes: hab.capacidad, // Podrías usar la capacidad por defecto
            }))
          : undefined,
        modo_gestion_servicios: formData.modoGestionServicios,
        serviciosContratados: formData.modoGestionServicios === 'usuario' ? formData.serviciosSeleccionados?.map(s => s._id) : undefined,
        _serviciosCompletosParaPrecio: formData.modoGestionServicios === 'usuario' ? formData.serviciosSeleccionados : undefined,
        numInvitados: formData.numeroInvitados || 50,
      };

      console.log(">>> Datos EXACTOS a enviar a createEventoReservation:", JSON.stringify(apiData, null, 2));

      // Llamar a la API
      const response = await createEventoReservation(apiData);

      console.log("Respuesta de la API:", response);

      if (response.success && response.data) {
        toast.success(response.message || '¡Reserva creada con éxito! Nos pondremos en contacto pronto.');
        setCreatedReservationId(response.data._id);
        setCurrentStep(7);
      } else {
        // --- MANEJO DE ERROR 409 y OTROS --- 
        if (response.status === 409) {
          setValidationErrorMessage(response.message || 'La habitación o fecha seleccionada ya no está disponible.');
          setShowValidationModal(true);
          setValidationRedirectStep(2); // Ofrecer volver al paso de fechas
        } else {
          toast.error(response.message || 'Error al crear la reserva.');
        }
        // --- FIN MANEJO ERROR --- 
      }
    } catch (error) {
      console.error('Error al enviar la reserva:', error);
      // --- MANEJO DE ERROR 409 y OTROS (Bloque Catch) --- 
      if (error.response && error.response.status === 409) {
        setValidationErrorMessage(error.response.data?.message || 'La habitación o fecha seleccionada ya no está disponible.');
        setShowValidationModal(true);
        setValidationRedirectStep(2); // Ofrecer volver al paso de fechas
      } else {
        toast.error(error.message || 'Ocurrió un error inesperado al intentar crear la reserva.');
      }
      // --- FIN MANEJO ERROR --- 
    } finally {
      setLoading(false);
    }
  };

  const handleEventTypeSelect = (eventType) => {
    // Guardar el objeto completo para mantener la referencia
    setSelectedEventType(eventType);
    updateFormSection('tipoEvento', eventType);
  };

  // Función para manejar el éxito del pago desde CheckoutForm (opcional)
  const handlePaymentSuccess = () => {
    toast.success('¡Pago realizado con éxito!');
    // Podrías redirigir a la página de confirmación aquí si no usas return_url
    // router.push(`/reserva-confirmada?reservaId=${createdReservationId}`);
    // O simplemente mostrar un mensaje y actualizar UI
     setShowCheckoutForm(false); // Ocultar formulario de pago
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-[#F0E8DC] to-[#E6DCC6] p-6 rounded-xl shadow-md mb-8 border border-[#D1B59B]">
              <h3 className="text-xl font-semibold text-[#5D4B3A] mb-4">Seleccione el tipo de evento</h3>
              <p className="text-[#8A6E52] mb-6 italic">Elija el tipo de evento que desea celebrar en nuestra hacienda</p>
              
              <ModoSeleccionEvento
                selectedEventType={selectedEventType}
                onEventTypeSelect={handleEventTypeSelect}
              />
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Selecciona Fecha y Habitaciones</h3>
            {/* Componente Calendario */}
            <div>
              <label htmlFor="date-range" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha del Evento
              </label>
              <CalendarioReserva
                // Usar new Date() para asegurar que pasamos objetos Date
                // Añadir T00:00:00 para evitar problemas de zona horaria al crear Date
                startDate={formData.fechaInicio ? new Date(formData.fechaInicio + 'T00:00:00') : null}
                endDate={formData.fechaFin ? new Date(formData.fechaFin + 'T00:00:00') : null}
                onChange={handleDateRangeChange} // Usar el handler actualizado
                occupiedDateRanges={occupiedDateRangesState} // <<< PROP CORRECTA CON RANGOS
                loadingOccupiedDates={loadingFechasBloqueadas} // <<< Pasar el estado de carga
                placeholderText="Seleccione inicio y fin del evento"
                // No necesitamos onMonthChange aquí si no hacemos carga dinámica por mes
              />
            </div>
            {/* Input Número de Habitaciones */}
            <div>
              <label htmlFor="numeroHabitaciones" className="block text-sm font-medium text-gray-700 mb-1">
                Número de Habitaciones Estimadas
              </label>
              <input
                type="number"
                id="numeroHabitaciones"
                name="numeroHabitaciones"
                min="1" // Mínimo 1 habitación
                value={formData.numeroHabitaciones || ''}
                onChange={(e) => updateFormSection('numeroHabitaciones', parseInt(e.target.value, 10) || 1)} // Asegurar mínimo 1
                className="w-full p-3 bg-white/80 backdrop-blur-sm border border-[#D1B59B] rounded-lg focus:ring-2 focus:ring-[#A5856A] focus:border-transparent transition-all duration-300 shadow-sm"
                placeholder="Ej: 7"
              />
              <p className="text-xs text-gray-500 mt-1">Mínimo 7 habitaciones para reservar el salón. Puedes ajustar esto más tarde.</p>
            </div>
          </div>
        );
      
      case 3:
        return (
          <ModoGestionHabitaciones 
            numeroHabitaciones={formData.numeroHabitaciones || 7}
            onModeSelect={handleNextStep}
          />
        );
        
      case 4:
         // --- Paso 4: Gestión de servicios MODIFICADO ---
        return (
          <div>
            {!formData.modoGestionServicios ? (
              // Mostrar selección de modo si aún no se ha elegido
               <div className="max-w-2xl mx-auto">
                 <h3 className="text-xl font-semibold text-[#5D4B3A] mb-4">¿Cómo desea gestionar los servicios adicionales?</h3>
                 <p className="text-[#8A6E52] mb-6 italic">Elija si desea seleccionar los servicios ahora o consultarlo con nosotros.</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Opción 1: Gestión por el Organizador */}
                    <div
                      onClick={() => handleModoServiciosSelectDirect('usuario')}
                      className="p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 border-gray-200 hover:border-[var(--color-primary)]/50 bg-white/80 backdrop-blur-sm shadow-md"
                    >
                      <div className="flex items-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mr-4">
                          <FaUser className="w-8 h-8 text-[var(--color-primary)]" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold">Seleccionar servicios ahora</h4>
                          <p className="text-sm text-gray-500">Elegiré los servicios que deseo</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 italic mt-2">
                        Puede ver y añadir servicios a su reserva.
                      </div>
                    </div>
                    {/* Opción 2: Gestión por la Hacienda */}
                    <div
                      onClick={() => handleModoServiciosSelectDirect('hacienda')}
                      className="p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 border-gray-200 hover:border-[var(--color-accent)]/50 bg-white/80 backdrop-blur-sm shadow-md"
                    >
                      <div className="flex items-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center mr-4">
                          <FaUtensils className="w-8 h-8 text-[var(--color-accent)]" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold">Consultar con la Hacienda</h4>
                          <p className="text-sm text-gray-500">El personal me asesorará</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 italic mt-2">
                        Un coordinador de eventos le contactará para definir los servicios.
                      </div>
                    </div>
                 </div>
               </div>
            ) : formData.modoGestionServicios === 'usuario' ? (
              // Mostrar componente de gestión si se eligió 'usuario'
              <ModoGestionServicios 
                tipoEvento={formData.tipoEvento && typeof formData.tipoEvento === 'object' ? formData.tipoEvento.titulo : formData.tipoEvento}
                onServicesSelect={handleServicesSelect}
                modoGestion={formData.modoGestionServicios}
                serviciosSeleccionados={formData.serviciosSeleccionados}
              />
            ) : (
              // Mostrar mensaje si se eligió 'hacienda' (el paso ya avanzó)
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                 <FaInfoCircle className="text-blue-500 text-2xl mx-auto mb-2" />
                 <p className="text-blue-700">
                   Ha seleccionado consultar los servicios con la Hacienda.
                   Continuando al siguiente paso...
                 </p>
              </div>
            )}
          </div>
        );
      
      case 5:
        // Paso 5: Información de contacto
        return (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-[#F0E8DC] to-[#E6DCC6] p-6 rounded-xl shadow-md mb-8 border border-[#D1B59B]">
              <h3 className="text-xl font-semibold text-[#5D4B3A] mb-4">Información de contacto</h3>
              <p className="text-[#8A6E52] mb-6 italic">Por favor, proporcione sus datos para que podamos contactarle</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-[#5D4B3A] font-medium mb-2">Nombre *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FaUser className="text-[#A5856A]" />
                    </div>
                    <input 
                      type="text" 
                      value={formData.datosContacto?.nombre || ''} 
                      onChange={(e) => updateFormSection('datosContacto', {...formData.datosContacto, nombre: e.target.value})}
                      className="w-full pl-10 p-3 bg-white/80 backdrop-blur-sm border border-[#D1B59B] rounded-lg focus:ring-2 focus:ring-[#A5856A] focus:border-transparent transition-all duration-300 shadow-sm hover:shadow"
                      placeholder="Introduzca su nombre"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[#5D4B3A] font-medium mb-2">Apellidos *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FaUser className="text-[#A5856A]" />
                    </div>
                    <input 
                      type="text" 
                      value={formData.datosContacto?.apellidos || ''} 
                      onChange={(e) => updateFormSection('datosContacto', {...formData.datosContacto, apellidos: e.target.value})}
                      className="w-full pl-10 p-3 bg-white/80 backdrop-blur-sm border border-[#D1B59B] rounded-lg focus:ring-2 focus:ring-[#A5856A] focus:border-transparent transition-all duration-300 shadow-sm hover:shadow"
                      placeholder="Introduzca sus apellidos"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-[#5D4B3A] font-medium mb-2">Email *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FaEnvelope className="text-[#A5856A]" />
                    </div>
                    <input 
                      type="email" 
                      value={formData.datosContacto?.email || ''} 
                      onChange={(e) => updateFormSection('datosContacto', {...formData.datosContacto, email: e.target.value})}
                      className="w-full pl-10 p-3 bg-white/80 backdrop-blur-sm border border-[#D1B59B] rounded-lg focus:ring-2 focus:ring-[#A5856A] focus:border-transparent transition-all duration-300 shadow-sm hover:shadow"
                      placeholder="ejemplo@correo.com"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[#5D4B3A] font-medium mb-2">Teléfono *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#A5856A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <input 
                      type="tel" 
                      value={formData.datosContacto?.telefono || ''} 
                      onChange={(e) => updateFormSection('datosContacto', {...formData.datosContacto, telefono: e.target.value})}
                      className="w-full pl-10 p-3 bg-white/80 backdrop-blur-sm border border-[#D1B59B] rounded-lg focus:ring-2 focus:ring-[#A5856A] focus:border-transparent transition-all duration-300 shadow-sm hover:shadow"
                      placeholder="Ej. 600123456"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-[#5D4B3A] font-medium mb-2">Mensaje o comentarios adicionales</label>
                <div className="relative">
                  <textarea 
                    value={formData.datosContacto?.mensaje || ''} 
                    onChange={(e) => updateFormSection('datosContacto', {...formData.datosContacto, mensaje: e.target.value})}
                    className="w-full p-4 bg-white/80 backdrop-blur-sm border border-[#D1B59B] rounded-lg focus:ring-2 focus:ring-[#A5856A] focus:border-transparent transition-all duration-300 shadow-sm hover:shadow"
                    placeholder="Indique cualquier información adicional que considere relevante"
                    rows="4"
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div className="bg-[#F5F0E8] p-6 rounded-xl shadow-md border border-[#D1B59B]">
              <h4 className="text-lg font-semibold text-[#5D4B3A] mb-4">Términos y condiciones</h4>
              
              <div className="mb-4">
                <label className="flex items-start cursor-pointer group relative z-10">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      id="privacidad"
                      checked={formData.aceptaPoliticas || false}
                      onChange={(e) => updateFormSection('aceptaPoliticas', e.target.checked)}
                      className="opacity-0 absolute h-5 w-5 cursor-pointer z-20"
                      required
                    />
                    <div className={`w-5 h-5 border-2 ${formData.aceptaPoliticas ? 'bg-[#A5856A] border-[#A5856A]' : 'border-[#A5856A] bg-white'} rounded mr-3 flex items-center justify-center transition-all`}>
                      <svg className={`w-3 h-3 text-white ${formData.aceptaPoliticas ? 'opacity-100' : 'opacity-0'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-sm text-[#5D4B3A] leading-tight">
                    He leído y acepto la <a href="/politica-privacidad" target="_blank" className="text-[#A5856A] hover:text-[#8B6B4F] hover:underline transition-colors">política de privacidad</a> *
                  </span>
                </label>
              </div>
            </div>
          </div>
        );
      
      case 6:
        // Paso 6: Resumen de la reserva
        return (
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-r from-[#F0E8DC] to-[#E6DCC6] p-6 rounded-xl shadow-md mb-8 border border-[#D1B59B]">
              <h3 className="text-xl font-semibold text-[#5D4B3A] mb-4">Resumen de su reserva</h3>
              <p className="text-[#8A6E52] mb-6 italic">Por favor, revise los detalles de su reserva antes de confirmar</p>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-5 mb-6 shadow-sm border border-[#D1B59B]/50">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#A5856A]/20 flex items-center justify-center mr-3">
                    <FaCalendarAlt className="text-[#A5856A]" />
                  </div>
                  <h4 className="text-lg font-semibold text-[#5D4B3A]">Detalles del evento</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-12">
                  <div className="border-l-2 border-[#D1B59B]/30 pl-4">
                    <p className="text-[#8A6E52] text-sm font-medium">Tipo de evento</p>
                    <p className="font-semibold text-[#5D4B3A] capitalize">
                      {typeof formData.tipoEvento === 'object' && formData.tipoEvento ? 
                        (formData.tipoEvento.titulo || formData.tipoEvento.nombre || 'No especificado') : 
                        (formData.tipoEvento || 'No especificado')}
                    </p>
                  </div>
                  
                  <div className="border-l-2 border-[#D1B59B]/30 pl-4">
                    <p className="text-[#8A6E52] text-sm font-medium">Fecha</p>
                    <p className="font-semibold text-[#5D4B3A]">
                      {formData.fechaInicio ? 
                        new Date(formData.fechaInicio).toLocaleDateString('es-ES', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })
                        : 'No especificada'}
                      {formData.fechaFin && formData.fechaFin !== formData.fechaInicio ?
                        ` - ${new Date(formData.fechaFin).toLocaleDateString('es-ES', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}`
                        : ''} 
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-5 mb-6 shadow-sm border border-[#D1B59B]/50">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#A5856A]/20 flex items-center justify-center mr-3">
                    <FaBed className="text-[#A5856A]" />
                  </div>
                  <h4 className="text-lg font-semibold text-[#5D4B3A]">Habitaciones</h4>
                </div>
                
                <div className="pl-12">
                  <div className="border-l-2 border-[#D1B59B]/30 pl-4 mb-4">
                    <p className="text-[#8A6E52] text-sm font-medium">Modo de gestión</p>
                    <p className="font-semibold text-[#5D4B3A]">
                      {formData.modoGestionHabitaciones === 'usuario' 
                        ? 'Gestión por el organizador' 
                        : 'Gestión por la hacienda'}
                    </p>
                  </div>
                  
                  {formData.modoGestionHabitaciones === 'usuario' && formData.habitacionesSeleccionadas?.length > 0 && (
                    <div className="border-l-2 border-[#D1B59B]/30 pl-4">
                      <p className="text-[#8A6E52] text-sm font-medium mb-2">Habitaciones seleccionadas:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {formData.habitacionesSeleccionadas.map((habitacion, index) => (
                          <div key={index} className="flex items-center py-1 px-2 rounded bg-[#F5F0E8] mb-1">
                            <FaBed className="text-[#A5856A] mr-2 flex-shrink-0" />
                            <span className="text-sm text-[#5D4B3A]">{habitacion.nombre} - {habitacion.precio}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-[#8A6E52] text-sm mt-2">
                        Total: {formData.habitacionesSeleccionadas.length} habitaciones
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-5 mb-6 shadow-sm border border-[#D1B59B]/50">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#A5856A]/20 flex items-center justify-center mr-3">
                    <FaUtensils className="text-[#A5856A]" />
                  </div>
                  <h4 className="text-lg font-semibold text-[#5D4B3A]">Servicios</h4>
                </div>
                
                <div className="pl-12">
                  <div className="border-l-2 border-[#D1B59B]/30 pl-4 mb-4">
                    <p className="text-[#8A6E52] text-sm font-medium">Modo de gestión</p>
                    <p className="font-semibold text-[#5D4B3A]">
                      {formData.modoGestionServicios === 'usuario' 
                        ? 'Selección por el organizador' 
                        : 'Consulta con la hacienda'}
                    </p>
                  </div>
                  
                  {formData.modoGestionServicios === 'usuario' && formData.serviciosSeleccionados?.length > 0 && (
                    <div className="border-l-2 border-[#D1B59B]/30 pl-4">
                      <p className="text-[#8A6E52] text-sm font-medium mb-2">Servicios seleccionados:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {formData.serviciosSeleccionados.map((servicio, index) => (
                          <div key={index} className="flex items-center py-1 px-2 rounded bg-[#F5F0E8] mb-1">
                            <FaUtensils className="text-[#A5856A] mr-2 flex-shrink-0" />
                            <span className="text-sm text-[#5D4B3A]">
                              {typeof servicio === 'object' ? 
                                (servicio.titulo || servicio.nombre || `Servicio ${index + 1}`) : 
                                `Servicio ${servicio}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-5 shadow-sm border border-[#D1B59B]/50">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#A5856A]/20 flex items-center justify-center mr-3">
                    <FaUser className="text-[#A5856A]" />
                  </div>
                  <h4 className="text-lg font-semibold text-[#5D4B3A]">Datos de contacto</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-12">
                  <div className="border-l-2 border-[#D1B59B]/30 pl-4">
                    <p className="text-[#8A6E52] text-sm font-medium">Nombre completo</p>
                    <p className="font-semibold text-[#5D4B3A]">{formData.datosContacto?.nombre} {formData.datosContacto?.apellidos}</p>
                  </div>
                  
                  <div className="border-l-2 border-[#D1B59B]/30 pl-4">
                    <p className="text-[#8A6E52] text-sm font-medium">Email</p>
                    <p className="font-semibold text-[#5D4B3A]">{formData.datosContacto?.email}</p>
                  </div>
                  
                  <div className="border-l-2 border-[#D1B59B]/30 pl-4">
                    <p className="text-[#8A6E52] text-sm font-medium">Teléfono</p>
                    <p className="font-semibold text-[#5D4B3A]">{formData.datosContacto?.telefono}</p>
                  </div>
                </div>
                
                {formData.datosContacto?.mensaje && (
                  <div className="pl-12 mt-4">
                    <div className="border-l-2 border-[#D1B59B]/30 pl-4">
                      <p className="text-[#8A6E52] text-sm font-medium">Mensaje</p>
                      <p className="font-semibold text-[#5D4B3A]">{formData.datosContacto.mensaje}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <FaCalendarAlt className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Confirmación pendiente</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Al completar la reserva, recibirá un email de confirmación con los detalles. Nuestro equipo se pondrá en contacto con usted para confirmar la disponibilidad y los detalles finales.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 7:
        const handlePaymentSelection = async (metodo) => {
          setLoading(true); 
          setIsProcessingPayment(false); // Resetear procesamiento
          setShowCheckoutForm(false); // Ocultar form por defecto
          setStripeClientSecret(''); // Limpiar secret

          if (!createdReservationId) {
            toast.error('Error: No se encontró el ID de la reserva creada.');
            setLoading(false);
            return;
          }

          // Lógica separada por método
          if (metodo === 'tarjeta') {
            let loadingToastId = toast.loading('Preparando pago seguro...');
            try {
              // Llamar al backend para crear PaymentIntent
              // Asegúrate que la función importada sea correcta y esté disponible
              const response = await createEventoPaymentIntent(createdReservationId);
              toast.dismiss(loadingToastId);

              if (response && response.clientSecret) {
                setStripeClientSecret(response.clientSecret);
                setShowCheckoutForm(true); // Mostrar el formulario de Stripe
                toast.info('Por favor, introduce los datos de tu tarjeta.');
              } else {
                // Si response existe pero no tiene clientSecret o success es false
                toast.error(response?.message || 'No se pudo iniciar el pago con tarjeta. Respuesta inesperada del servidor.');
              }
            } catch (error) {
              toast.dismiss(loadingToastId);
              console.error("Error creando PaymentIntent:", error);
              // Mostrar mensaje de error más específico si está disponible
              const errorMessage = error.response?.data?.message || error.message || 'Error al preparar el pago con tarjeta.';
              toast.error(errorMessage);
              // Asegurarse de limpiar el clientSecret si falla
              setStripeClientSecret(''); 
            } finally {
              setLoading(false);
            }
            
          } else { // Transferencia o Efectivo
            let initialToastId = null;
            if (metodo === 'transferencia') {
              initialToastId = toast.loading('Enviando instrucciones de pago a tu correo...');
            } else if (metodo === 'efectivo') {
              initialToastId = toast.loading('Confirmando selección de pago en efectivo...');
            }

            try {
              // Llamar al servicio para seleccionar el método (AHORA PÚBLICO)
              const response = await seleccionarMetodoPagoEvento(createdReservationId, metodo);
              if(initialToastId) toast.dismiss(initialToastId);

              if (response.success) {
                // Éxito: Mostrar mensaje y actualizar estado si es necesario
                if (metodo === 'transferencia') {
                  toast.success('Instrucciones enviadas a tu correo.');
                } else if (metodo === 'efectivo') {
                  toast.success('Selección confirmada. Paga en recepción.');
                }
                updateFormSection('metodoPago', metodo); // Actualizar estado local
                // Opcional: Podríamos ir a un paso de "Gracias" o mostrar resumen final
                // setCurrentStep(prev => prev + 1); 
              } else {
                // Fallo reportado por la API
                toast.error(response.message || 'Error al procesar la selección de pago.');
              }
            } catch (error) {
              // Error en la llamada (red, 404, 500, etc.)
              if(initialToastId) toast.dismiss(initialToastId);
              console.error(`Error seleccionando ${metodo}:`, error);
              const errorMessage = error.response?.data?.message || error.message || 'Error al procesar la selección de pago.';
              toast.error(errorMessage);
            } finally {
              setLoading(false);
            }
          }
        };

        return (
          <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-[#D1B59B]">
            <h3 className="text-2xl font-semibold text-[#5D4B3A] mb-6 text-center">
              {showCheckoutForm ? 'Completa el Pago con Tarjeta' : 'Seleccione un Método de Pago'}
            </h3>
            {createdReservationId && !showCheckoutForm && 
              <p className="text-center text-sm text-gray-500 mb-4">Reserva #{createdReservationId.slice(-6)} creada.</p>}
            
            {/* Mostrar formulario de Stripe si clientSecret existe */}
            {showCheckoutForm && stripeClientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret }}>
                <CheckoutForm 
                  clientSecret={stripeClientSecret} 
                  reservaId={createdReservationId} 
                  onPaymentSuccess={handlePaymentSuccess} 
                  onPaymentProcessing={setIsProcessingPayment} // Pasar callback para estado
                />
              </Elements>
            ) : (
              /* Mostrar botones de selección si no se muestra el form */
              <div className="flex flex-col space-y-4">
                <button 
                  onClick={() => handlePaymentSelection('tarjeta')}
                  disabled={loading || isProcessingPayment} // Deshabilitar si carga o procesa
                  className={`w-full ... (estilos botón tarjeta habilitado)`} // <-- APLICAR ESTILOS DE BOTÓN HABILITADO
                >
                  <FaCreditCard />
                  <span>Pagar con Tarjeta</span>
                </button>
                <button 
                  onClick={() => handlePaymentSelection('transferencia')}
                   disabled={loading || isProcessingPayment}
                  className={`w-full ... (estilos botón transferencia)`} // <-- APLICAR ESTILOS
                >
                  <FaUniversity /> 
                  <span>Pagar por Transferencia Bancaria</span>
                </button>
                <button 
                  onClick={() => handlePaymentSelection('efectivo')}
                   disabled={loading || isProcessingPayment}
                  className={`w-full ... (estilos botón efectivo)`} // <-- APLICAR ESTILOS
                >
                  <FaMoneyBillWave /> 
                  <span>Pagar en Efectivo (en Recepción)</span>
                </button>
              </div>
            )}
            
            {!showCheckoutForm &&
              <p className="text-center text-sm text-gray-500 mt-6 italic">
                Su reserva ha sido creada. Complete el pago para confirmarla.
              </p>
            }
          </div>
        );
      
      // --- NUEVO CASO PARA LA CONFIRMACIÓN FINAL MÁS ELEGANTE ---
      case 8: // Asumiendo que el paso 8 es la confirmación final
        return (
          <div className="text-center max-w-lg mx-auto bg-gradient-to-br from-[#FDFBFB] to-[#EBEDEE]/80 backdrop-blur-sm p-8 md:p-12 rounded-xl shadow-xl border border-[#A5856A]/30">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-400 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FaCheck className="text-white text-4xl" />
            </div>
            <h3 className="text-3xl font-bold text-[#5D4B3A] mb-3 font-serif">
              ¡Reserva Confirmada!
            </h3>
            <p className="text-gray-600 mb-6">
              Gracias por elegir Hacienda San Carlos Borromeo. Su reserva ha sido procesada exitosamente.
            </p>
            
            {createdReservationId && (
              <div className="mb-6 bg-[#F5F0E8] inline-block px-6 py-2 rounded-full border border-[#D1B59B]/50">
                <p className="text-sm text-[#8A6E52]">Número de Confirmación:</p>
                <p className="text-lg font-semibold text-[#5D4B3A]">{createdReservationId.slice(-10)}</p> 
              </div>
            )}
            
            <p className="text-sm text-gray-500 mb-8">
              Hemos enviado un correo electrónico con todos los detalles de su reserva a la dirección proporcionada.
              Si eligió pagar por transferencia, encontrará las instrucciones en el correo.
            </p>
            
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => router.push('/')} // Asumiendo que tienes 'router' de useRouter
                className="px-6 py-2 rounded-lg bg-[#A5856A] text-white font-medium hover:bg-[#8B6B4F] transition-colors duration-200 shadow-md"
              >
                Volver al Inicio
              </button>
              {/* Opcional: Botón a "Mis Reservas" si existe esa página 
              <button 
                onClick={() => router.push('/mis-reservas')} 
                className="px-6 py-2 rounded-lg border border-[#A5856A] text-[#A5856A] font-medium hover:bg-[#A5856A]/10 transition-colors duration-200"
              >
                Ver Mis Reservas
              </button>
              */}
            </div>
          </div>
        );
        
      default:
        // Mantener el default original por si acaso
        return <div>Paso desconocido</div>;
    }
  };

  return (
    <>
      <div className="min-h-screen relative">
        <div 
          className="fixed inset-0 z-0" 
          style={{
            backgroundImage: 'url(/images/imagendron3.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            filter: 'brightness(0.3)'
          }}
        />
        <NavbarReservar />
        <main className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
          <div className="flex-grow max-w-7xl mx-auto w-full">
          
            {/* --- Modal de Error de Validación (se mantiene) --- */}
            <ValidationModal
              isOpen={showValidationModal}
              onClose={() => setShowValidationModal(false)}
              message={validationErrorMessage}
              setCurrentStep={setCurrentStep}
              redirectToStep={validationRedirectStep}
            />

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-[#A5856A]/20" 
                style={wizardContainerStyle}>
              <h1 className="text-3xl font-extrabold text-[#0F0F0F] mb-8">
                Reservar Evento
              </h1>
              
              {/* Wizard Steps */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-4">
                  {steps.map((step, index) => (
                    <div 
                      key={index}
                      className={`flex items-center ${index !== steps.length - 1 ? 'mr-4' : ''}`}
                    >
                      <div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center transform transition-all duration-300 shadow-lg ${
                          currentStep > index + 1 
                            ? 'bg-[#A5856A] text-white' 
                            : currentStep === index + 1 
                              ? 'bg-[var(--color-primary)] text-white'
                              : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {currentStep > index + 1 ? (
                          <FaCheck className="w-5 h-5" />
                        ) : (
                          <span className="font-bold text-black">{index + 1}</span>
                        )}
                      </div>
                      {index !== steps.length - 1 && (
                        <div className={`w-10 h-0.5 ${currentStep > index + 1 ? 'bg-[#A5856A]' : 'bg-gray-200'}`}></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Step Content */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#0F0F0F] mb-4">
                  {currentStep <= steps.length ? steps[currentStep - 1].title : 'Confirmación'}
                </h2>
                <p className="text-gray-600 mb-6 font-medium">
                  {currentStep <= steps.length ? steps[currentStep - 1].description : 'Su reserva ha sido confirmada'}
                </p>
                
                {renderStepContent()}
              </div>
              
              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8">
                <div>
                  {currentStep > 1 && currentStep <= steps.length + 1 && (
                    <button
                      onClick={() => setCurrentStep(prev => prev - 1)}
                      className="px-6 py-3 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
                    >
                      <div className="flex items-center">
                        <FaChevronLeft className="mr-2" />
                        <span>Anterior</span>
                      </div>
                    </button>
                  )}
                </div>

                {currentStep <= steps.length && (
                  <button
                    onClick={handleNextStep}
                    className="px-8 py-3 rounded-lg transition-all duration-300 flex items-center space-x-2 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5" style={{
                      background: 'linear-gradient(145deg, #A5856A, #8B6B4F)',
                    }}
                    disabled={(currentStep === 3 && !formData.modoGestionHabitaciones) || (currentStep === 4 && !formData.modoGestionServicios)}
                  >
                    <span>{currentStep === steps.length ? 'Finalizar Reserva' : 'Siguiente'}</span>
                    <FaChevronRight />
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};