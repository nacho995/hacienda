"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaCalendarAlt, FaBed, FaUtensils, FaUser, FaCheck, FaChevronLeft, FaChevronRight, FaEnvelope, FaPhone, FaIdCard, FaMapMarkerAlt, FaInfoCircle, FaUsers, FaUserCog, FaCreditCard, FaUniversity, FaMoneyBillWave, FaCheckCircle, FaClock } from 'react-icons/fa';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext'; 
import { useReservation } from '@/context/ReservationContext'; 
import { getTiposEvento } from '@/services/tiposEvento.service';
import { 
    createEventoReservation, 
    getFechasOcupadasGlobales,
    seleccionarMetodoPago,
    createEventoPaymentIntent
} from '@/services/reservationService'; 

import ModoSeleccionEvento from '@/components/reservas/ModoSeleccionEvento';
import ModoGestionServicios from '@/components/reservas/ModoGestionServicios';
import ModoGestionHabitaciones from '@/components/reservas/ModoGestionHabitaciones';
import ModalModoGestionHabitaciones from '@/components/reservas/ModalModoGestionHabitaciones';
import CalendarioReserva from '@/components/reservas/CalendarioReserva';
import NavbarReservar from '@/components/layout/NavbarReservar';
import Footer from '@/components/layout/Footer';
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
  
  // --- Estados para fechas ocupadas globales --- 
  const [occupiedDates, setOccupiedDates] = useState([]); // Almacena objetos Date
  const [loadingOccupiedDates, setLoadingOccupiedDates] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState('');
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // --- Función para cargar fechas ocupadas GLOBALES --- 
  const fetchGlobalOccupiedDates = useCallback(async (fechaInicioVisible, fechaFinVisible) => {
    setLoadingOccupiedDates(true);
    try {
      const inicioStr = formatApiDate(fechaInicioVisible);
      const finStr = formatApiDate(fechaFinVisible);
      
      // Llamar al nuevo servicio global
      const globalOccupiedDates = await getFechasOcupadasGlobales(inicioStr, finStr); 
      
      setOccupiedDates(globalOccupiedDates || []); // El servicio ya devuelve objetos Date
      
    } catch (error) {
      console.error('Excepción al obtener fechas ocupadas globales:', error);
      toast.error('Error al cargar la disponibilidad del calendario.');
      setOccupiedDates([]); // Resetear en caso de error
    } finally {
      setLoadingOccupiedDates(false);
    }
  }, []); // Dependencia vacía

  // --- Efecto para cargar fechas ocupadas al inicio --- 
  useEffect(() => {
    // Cargar fechas para los próximos 6 meses por defecto
    const hoy = new Date();
    const seisMesesDespues = new Date(hoy.getFullYear(), hoy.getMonth() + 6, hoy.getDate());
    fetchGlobalOccupiedDates(hoy, seisMesesDespues);
  }, [fetchGlobalOccupiedDates]); // Ejecutar al montar y si la función cambia (poco probable)

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
    
    // MODIFICADO: Validar rango de fechas contra fechas ocupadas GLOBALES
    if (currentStep === 2) {
      if (!formData.fechaInicio || !formData.fechaFin) {
        toast.error('Por favor, seleccione un rango de fechas para su evento');
        return;
      }

      // Crear un set de fechas ocupadas GLOBALES (en formato YYYY-MM-DD para comparación fácil)
      const occupiedSet = new Set(
        occupiedDates.map(date => {
          // Asegurarse de que 'date' sea un objeto Date válido
          if (date instanceof Date && !isNaN(date.getTime())) {
            return formatApiDate(date); // Usar helper
          }
          return null; // Ignorar fechas inválidas
        }).filter(Boolean) // Filtrar nulos
      );

      // Iterar sobre el rango seleccionado por el usuario
      let currentDate = new Date(formData.fechaInicio);
      const endDate = new Date(formData.fechaFin);
      currentDate.setHours(0, 0, 0, 0); // Normalizar hora para la comparación
      endDate.setHours(0, 0, 0, 0); // Normalizar hora

      let conflictFound = false;
      while (currentDate <= endDate) {
        const dateString = formatApiDate(currentDate);

        if (occupiedSet.has(dateString)) {
          toast.error(`Conflicto de fechas: El día ${dateString} no está disponible. Por favor, elija otro rango.`);
          conflictFound = true;
          break; // Salir del bucle al encontrar el primer conflicto
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (conflictFound) {
        return; // Detener si se encontró conflicto
      }
      
      // Resto de validaciones del paso 2 (ej. número de habitaciones si aplica)
      // if (!formData.numeroHabitaciones || formData.numeroHabitaciones < 1) {
      //   toast.error('Por favor, indique el número de habitaciones');
      //   return;
      // }
    }

    // AÑADIDO: Validación para asegurar que se elija un modo en paso 3 antes de avanzar con 'Siguiente'
    if (currentStep === 3 && !formData.modoGestionHabitaciones) {
       toast.error('Por favor, seleccione un modo de gestión para las habitaciones.');
       return;
    }
    
    // Validación si modo organizador está seleccionado en paso 3 (Podrías añadir más validaciones aquí si ModoGestionHabitaciones lo requiere)
    if (currentStep === 3 && formData.modoGestionHabitaciones === 'usuario' && (!formData.habitacionesSeleccionadas || formData.habitacionesSeleccionadas.length === 0)) {
       toast.warn('Se recomienda seleccionar al menos una habitación si gestiona usted mismo.');
       // Permitimos avanzar pero con aviso, o podrías poner return; si es obligatorio.
    }
    
    // AÑADIDO: Validación para asegurar que se elija un modo en paso 4 antes de avanzar con 'Siguiente'
    if (currentStep === 4 && !formData.modoGestionServicios) {
       toast.error('Por favor, seleccione un modo de gestión para los servicios.');
       return;
    }

    // Validación si modo organizador está seleccionado en paso 4
    if (currentStep === 4 && formData.modoGestionServicios === 'usuario' && (!formData.serviciosSeleccionados || formData.serviciosSeleccionados.length === 0)) {
      toast.warn('No ha seleccionado ningún servicio adicional.');
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
    console.log("[handleDateRangeChange] Fechas recibidas:", dates);
    const [start, end] = dates;
    // Asegurarse de que las fechas sean válidas antes de actualizar
    const startDate = start instanceof Date && !isNaN(start) ? start : null;
    const endDate = end instanceof Date && !isNaN(end) ? end : null;
    
    console.log("[handleDateRangeChange] Actualizando estado con:", { startDate, endDate });

    updateFormSection('fechaInicio', startDate);
    updateFormSection('fechaFin', endDate);
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
      const apiData = {
        tipo_evento: formData.tipoEvento, 
        fecha: formData.fechaInicio ? formData.fechaInicio.toISOString().split('T')[0] : null,
        nombre_contacto: formData.datosContacto?.nombre,
        apellidos_contacto: formData.datosContacto?.apellidos,
        email_contacto: formData.datosContacto?.email,
        telefono_contacto: formData.datosContacto?.telefono,
        mensaje: formData.datosContacto?.mensaje,
        modo_gestion_habitaciones: formData.modoGestionHabitaciones,
        habitaciones: formData.modoGestionHabitaciones === 'usuario' ? formData.habitacionesSeleccionadas : undefined,
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Columna Izquierda: Calendario */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-[#D1B59B]">
              <h3 className="text-xl font-semibold text-[#5D4B3A] mb-4">Seleccione las fechas</h3>
              <p className="text-[#8A6E52] mb-6 italic">Elija la fecha de inicio y fin de su evento.</p>
              <CalendarioReserva 
                occupiedDates={occupiedDates} // Pasar fechas ocupadas GLOBALES
                loadingDates={loadingOccupiedDates} // Pasar estado de carga
                onChange={handleDateRangeChange} // <- Nombre correcto
                startDate={formData.fechaInicio} // <- Cambiado de initialStartDate
                endDate={formData.fechaFin}       // <- Cambiado de initialEndDate
                onMonthChange={(startDate, endDate) => fetchGlobalOccupiedDates(startDate, endDate)} // Recargar fechas globales al cambiar mes
              />
              {loadingOccupiedDates && <p className="text-sm text-gray-500 mt-2">Cargando disponibilidad...</p>}
              {!loadingOccupiedDates && occupiedDates.length > 0 && 
                <p className="text-sm text-gray-500 mt-2 italic">Los días marcados pueden no estar disponibles.</p>
              }
            </div>
            
            {/* Columna Derecha: Input Número de Habitaciones */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-[#D1B59B]">
               <h3 className="text-xl font-semibold text-[#5D4B3A] mb-4">Número de Habitaciones</h3>
               <p className="text-[#8A6E52] mb-6 italic">Indique cuántas habitaciones estima necesitar (7-14).</p>
               <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaBed className="text-[#A5856A]" />
                  </div>
                  <input 
                    type="number"
                    min="7"
                    max="14" // Límite máximo según la descripción
                    value={formData.numeroHabitaciones || ''} 
                    onChange={(e) => {
                       const value = parseInt(e.target.value, 10);
                       if (!isNaN(value) && value >= 1 && value <= 14) { // Validar rango aquí también
                         updateFormSection('numeroHabitaciones', value);
                       } else if (e.target.value === '') { // Permitir borrar
                         updateFormSection('numeroHabitaciones', '');
                       }
                    }}
                    className="w-full pl-10 p-3 bg-white/80 backdrop-blur-sm border border-[#D1B59B] rounded-lg focus:ring-2 focus:ring-[#A5856A] focus:border-transparent transition-all duration-300 shadow-sm hover:shadow"
                    placeholder="Ej. 10"
                    required
                  />
               </div>
               <p className="text-xs text-gray-500 mt-2">Se reservarán hasta 14 habitaciones estándar si selecciona la gestión por la Hacienda.</p>
               {/* Mensaje de error si el número está fuera de rango */}
               {(formData.numeroHabitaciones !== '' && (formData.numeroHabitaciones < 7 || formData.numeroHabitaciones > 14)) && (
                 <p className="text-red-500 text-sm mt-2">Por favor, introduzca un número entre 7 y 14.</p>
               )}
            </div>
          </div>
        );
      
      case 3:
        // --- Paso 3: Gestión de habitaciones MODIFICADO ---
        return (
          <div>
            {!formData.modoGestionHabitaciones ? (
              // Mostrar selección de modo si aún no se ha elegido
              <div className="max-w-2xl mx-auto">
                <h3 className="text-xl font-semibold text-[#5D4B3A] mb-4">¿Cómo desea gestionar las habitaciones?</h3>
                <p className="text-[#8A6E52] mb-6 italic">Elija quién se encargará de la asignación de habitaciones.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Opción 1: Gestión por el Organizador */}
                  <div
                    onClick={() => handleModoHabitacionesSelectDirect('usuario')}
                    className="p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 border-gray-200 hover:border-[var(--color-primary)]/50 bg-white/80 backdrop-blur-sm shadow-md"
                  >
                    <div className="flex items-center mb-4">
                       <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mr-4">
                          <FaUsers className="w-8 h-8 text-[var(--color-primary)]" />
                       </div>
                       <div>
                          <h4 className="text-lg font-semibold">Gestionar yo mismo</h4>
                          <p className="text-sm text-gray-500">Asignaré las habitaciones a mis huéspedes</p>
                       </div>
                    </div>
                    <div className="text-sm text-gray-500 italic mt-2">
                       Ideal si ya sabe quién se alojará en cada habitación.
                    </div>
                  </div>
                  {/* Opción 2: Gestión por la Hacienda */}
                  <div
                    onClick={() => handleModoHabitacionesSelectDirect('hacienda')}
                    className="p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 border-gray-200 hover:border-[var(--color-accent)]/50 bg-white/80 backdrop-blur-sm shadow-md"
                  >
                     <div className="flex items-center mb-4">
                       <div className="w-16 h-16 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center mr-4">
                          <FaUserCog className="w-8 h-8 text-[var(--color-accent)]" />
                       </div>
                       <div>
                          <h4 className="text-lg font-semibold">Que gestione la Hacienda</h4>
                          <p className="text-sm text-gray-500">El personal asignará las habitaciones</p>
                       </div>
                    </div>
                     <div className="text-sm text-gray-500 italic mt-2">
                        Nos pondremos en contacto para los detalles de los huéspedes.
                     </div>
                  </div>
                </div>
              </div>
            ) : formData.modoGestionHabitaciones === 'usuario' ? (
              // Mostrar componente de gestión si se eligió 'usuario'
              <ModoGestionHabitaciones
                numeroHabitaciones={formData.numeroHabitaciones}
              />
            ) : (
              // Mostrar mensaje si se eligió 'hacienda' (el paso ya avanzó)
               <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                 <FaInfoCircle className="text-blue-500 text-2xl mx-auto mb-2" />
                 <p className="text-blue-700">
                   Ha seleccionado que la Hacienda gestione las habitaciones.
                   Continuando al siguiente paso...
                 </p>
               </div>
            )}
          </div>
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
        return (
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-r from-[#F0E8DC] to-[#E6DCC6] p-6 rounded-xl shadow-md border border-[#D1B59B]">
              <h3 className="text-xl font-semibold text-[#5D4B3A] mb-4">Resumen de su reserva</h3>
              <p className="text-[#8A6E52] mb-6 italic">Por favor, revise los detalles antes de proceder al pago.</p>
              {/* Añadir aquí más detalles del formData si es necesario */}
              <p>Tipo Evento: {typeof formData.tipoEvento === 'object' ? formData.tipoEvento?.titulo : formData.tipoEvento}</p>
              <p>Fechas: {formData.fechaInicio ? formatApiDate(formData.fechaInicio) : 'N/A'} - {formData.fechaFin ? formatApiDate(formData.fechaFin) : 'N/A'}</p>
              <p>Contacto: {formData.datosContacto?.nombre} {formData.datosContacto?.apellidos}</p>
              {/* ... más detalles ... */}
            </div>
             <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
               <div className="flex items-start">
                 <div className="flex-shrink-0">
                   <FaInfoCircle className="h-5 w-5 text-yellow-500" />
                 </div>
                 <div className="ml-3">
                   <h3 className="text-sm font-medium text-yellow-800">Confirmación pendiente</h3>
                   <div className="mt-2 text-sm text-yellow-700">
                     <p>
                       Al completar la reserva, recibirá un email. Nuestro equipo se pondrá en contacto para confirmar disponibilidad y detalles finales.
                     </p>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        );
      
      case 7:
        // Función para manejar la selección de pago (simplificada, asumiendo que existe fuera)
        const handlePaymentSelection = async (metodo) => {
          updateFormSection('metodoPago', metodo); // Asegúrate que esta variable de estado exista
          setStripeClientSecret(''); 
          setShowCheckoutForm(false);
          setIsProcessingPayment(false);

          if (!createdReservationId) {
            toast.error('Error: No se encontró el ID de la reserva creada.');
            return;
          }

          if (metodo === 'tarjeta') {
            setLoading(true);
            let loadingToastId = toast.loading('Preparando pago seguro...');
            try {
              const response = await createEventoPaymentIntent(createdReservationId);
              toast.dismiss(loadingToastId);
              if (response && response.clientSecret) {
                setStripeClientSecret(response.clientSecret);
                setShowCheckoutForm(true);
                toast.info('Por favor, introduce los datos de tu tarjeta.');
              } else {
                toast.error(response.message || 'No se pudo iniciar el pago con tarjeta.');
              }
            } catch (error) {
              toast.dismiss(loadingToastId);
              console.error("Error creando PaymentIntent:", error);
              toast.error(error.response?.data?.message || error.message || 'Error al preparar el pago con tarjeta.');
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
              setLoading(true); 
              try {
                 const response = await seleccionarMetodoPago(createdReservationId, metodo);
                 if(initialToastId) toast.dismiss(initialToastId);
                 if (response.success) {
                    // Avanzar al paso de confirmación después de seleccionar transferencia/efectivo
                    setCurrentStep(prev => prev + 1);
                    if (metodo === 'transferencia') { toast.success('Instrucciones enviadas. Su reserva está pendiente de pago.'); }
                    else if (metodo === 'efectivo') { toast.success('Selección confirmada. Su reserva está pendiente de pago.'); }
                 } else { toast.error(response.message || 'Error al procesar.'); }
              } catch (error) {
                 if(initialToastId) toast.dismiss(initialToastId);
                 console.error(`Error seleccionando ${metodo}:`, error);
                 toast.error(error.response?.data?.message || 'Error al procesar.');
              } finally { setLoading(false); }
          }
        };

        return (
          <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-[#D1B59B]">
            <h3 className="text-2xl font-semibold text-[#5D4B3A] mb-6 text-center">
              {showCheckoutForm ? 'Completa el Pago con Tarjeta' : 'Seleccione un Método de Pago'}
            </h3>
            {createdReservationId && !showCheckoutForm && 
              <p className="text-center text-sm text-gray-500 mb-4">Reserva #{createdReservationId.slice(-6)} creada.</p>}
            
            {showCheckoutForm && stripeClientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret }}>
                <CheckoutForm 
                  clientSecret={stripeClientSecret} 
                  onPaymentSuccess={handlePaymentSuccess} 
                  onPaymentProcessing={setIsProcessingPayment}
                />
              </Elements>
            ) : (
              <div className="flex flex-col space-y-4">
                {/* Botones de pago (ajustar estilos si es necesario) */}
                <button onClick={() => handlePaymentSelection('tarjeta')} disabled={loading || isProcessingPayment} className={`w-full flex items-center justify-center px-6 py-3 rounded-lg shadow-md transition-all duration-300 ${loading || isProcessingPayment ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#A5856A] to-[#8B6B4F] text-white hover:shadow-lg'}`}> <FaCreditCard className="mr-2" /> Pagar con Tarjeta </button>
                <button onClick={() => handlePaymentSelection('transferencia')} disabled={loading || isProcessingPayment} className={`w-full flex items-center justify-center px-6 py-3 rounded-lg shadow-md transition-all duration-300 ${loading || isProcessingPayment ? 'bg-gray-400 cursor-not-allowed' : 'bg-white text-[#5D4B3A] border border-[#D1B59B] hover:bg-gray-50'}`}> <FaUniversity className="mr-2" /> Pagar por Transferencia </button>
                <button onClick={() => handlePaymentSelection('efectivo')} disabled={loading || isProcessingPayment} className={`w-full flex items-center justify-center px-6 py-3 rounded-lg shadow-md transition-all duration-300 ${loading || isProcessingPayment ? 'bg-gray-400 cursor-not-allowed' : 'bg-white text-[#5D4B3A] border border-[#D1B59B] hover:bg-gray-50'}`}> <FaMoneyBillWave className="mr-2" /> Pagar en Efectivo </button>
              </div>
            )}
            
            {!showCheckoutForm &&
              <p className="text-center text-sm text-gray-500 mt-6 italic">
                Su reserva ha sido creada. Complete el pago o seleccione un método para finalizar.
              </p>
            }
          </div>
        );

      case 8:
        let confirmationIcon = <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />;
        let confirmationTitle = "¡Reserva Confirmada!";
        let confirmationMessage = "";
        const confirmationNumber = createdReservationId ? createdReservationId.slice(-6) : 'N/A'; // O usar el número de confirmación real si lo tienes

        // Determinar mensaje según el método de pago usado (asumiendo que está en formData.metodoPago)
        switch (formData.metodoPago) {
          case 'tarjeta': // Asumiendo que onPaymentSuccess te trajo aquí
            confirmationMessage = `El pago con tarjeta ha sido procesado exitosamente. Recibirá un correo con todos los detalles. Su número de referencia es #${confirmationNumber}.`;
            break;
          case 'transferencia':
            confirmationIcon = <FaClock className="text-blue-500 text-5xl mx-auto mb-4" />;
            confirmationTitle = "Reserva Pendiente de Pago";
            confirmationMessage = `Hemos recibido su solicitud de reserva. Por favor, revise su correo electrónico (${formData.datosContacto?.email || 'su email'}) donde encontrará las instrucciones para completar el pago mediante transferencia bancaria. Su número de referencia es #${confirmationNumber}.`;
            break;
          case 'efectivo':
            confirmationIcon = <FaCash className="text-emerald-500 text-5xl mx-auto mb-4" />;
            confirmationTitle = "Reserva Confirmada - Pago en Efectivo";
            confirmationMessage = `¡Su reserva ha sido realizada con éxito! El pago se realizará en efectivo al momento de su llegada en la recepción de la Hacienda. Por favor, tenga a mano su número de referencia: #${confirmationNumber}. ¡Le esperamos!`;
            break;
          default: // Caso inesperado
             confirmationIcon = <FaCheckCircle className="text-gray-500 text-5xl mx-auto mb-4" />;
             confirmationTitle = "Reserva Recibida";
             confirmationMessage = `Hemos recibido su solicitud de reserva con referencia #${confirmationNumber}. Recibirá más detalles por correo electrónico.`;
        }

        return (
          <div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-white to-gray-50 p-8 rounded-xl shadow-lg border border-gray-200">
            {confirmationIcon}
            <h3 className="text-2xl font-semibold text-[var(--color-brown-dark)] mb-3">
              {confirmationTitle}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {confirmationMessage}
            </p>
            {/* Podrías añadir botones para "Ver mis reservas" o "Volver al inicio" aquí */}
            {/* Ejemplo:
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/usuario/reservas" className="px-6 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-colors">
                Ver Mis Reservas
              </Link>
              <Link href="/" className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">
                Volver al Inicio
              </Link>
            </div>
            */}
          </div>
        );

      default:
        // Si currentStep es inesperado (no debería ocurrir ahora)
        console.warn("Estado de paso inesperado:", currentStep);
        return <div>Paso desconocido ({currentStep})</div>; 
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