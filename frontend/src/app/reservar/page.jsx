"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaCalendarAlt, FaBed, FaUtensils, FaUser, FaCheck, FaChevronLeft, FaChevronRight, FaEnvelope, FaPhone, FaIdCard, FaMapMarkerAlt, FaInfoCircle, FaUsers, FaUserCog } from 'react-icons/fa';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext'; 
import { useReservation } from '@/context/ReservationContext'; 
import { getTiposEvento } from '@/services/tiposEvento.service';
import { // crearReservaEvento, // Comentado temporalmente
         createHabitacionReservation,
         createEventoReservation // Posible reemplazo
       } from '@/services/reservationService'; 

import ModoSeleccionEvento from '@/components/reservas/ModoSeleccionEvento';
import ModoGestionServicios from '@/components/reservas/ModoGestionServicios';
import ModoGestionHabitaciones from '@/components/reservas/ModoGestionHabitaciones';
import ModalModoGestionHabitaciones from '@/components/reservas/ModalModoGestionHabitaciones';
import CalendarioReserva from '@/components/reservas/CalendarioReserva';
import NavbarReservar from '@/components/layout/NavbarReservar';
import Footer from '@/components/layout/Footer';

const ReservarPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <ReservaWizard />
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
  
  // --- Estados para fechas ocupadas por EVENTOS --- 
  const [occupiedEventDates, setOccupiedEventDates] = useState([]);
  const [loadingOccupiedEventDates, setLoadingOccupiedEventDates] = useState(false);

  // --- Función para cargar fechas ocupadas por EVENTOS --- 
  const fetchOccupiedEventDates = useCallback(async (fechaInicioVisible, fechaFinVisible) => {
    setLoadingOccupiedEventDates(true);
    try {
      const formatApiDate = (date) => date.toISOString().split('T')[0];
      const params = {
        fechaInicio: formatApiDate(fechaInicioVisible),
        fechaFin: formatApiDate(fechaFinVisible),
      };
      // La función del servicio devuelve directamente el array de fechas ocupadas
      const occupiedDatesArray = await getEventoOccupiedDates(params); 

      // MODIFICADO: Verificar si la respuesta es un array 
      if (Array.isArray(occupiedDatesArray)) {
        // La conversión a Date ya se hace en el servicio
        // const occupiedDates = occupiedDatesArray.map(dateString => new Date(dateString)); <-- Ya no es necesario
        // Asegurarse de que el array contiene objetos Date válidos
        const validDates = occupiedDatesArray
          .map(item => item?.fecha) // Extraer la fecha del objeto devuelto por el servicio
          .filter(date => date instanceof Date && !isNaN(date.getTime()));
          
        setOccupiedEventDates(validDates);
      } else {
        // Esto no debería ocurrir si el servicio siempre devuelve un array
        console.error('Respuesta inesperada al obtener fechas ocupadas de eventos (no es un array):', occupiedDatesArray);
        setOccupiedEventDates([]);
      }
    } catch (error) {
      // Captura errores de la llamada al servicio o del procesamiento
      console.error('Excepción al obtener fechas ocupadas de eventos:', error);
      setOccupiedEventDates([]);
    } finally {
      setLoadingOccupiedEventDates(false);
    }
  }, []);

  // --- Efecto para cargar fechas ocupadas al inicio --- 
  useEffect(() => {
    // Cargar fechas para los próximos 6 meses por defecto
    const hoy = new Date();
    const seisMesesDespues = new Date(hoy.getFullYear(), hoy.getMonth() + 6, hoy.getDate());
    fetchOccupiedEventDates(hoy, seisMesesDespues);
  }, [fetchOccupiedEventDates]);

  // AÑADIDO: useEffect para resetear el formulario al montar el componente
  useEffect(() => {
    console.log("Reseteando formulario de reserva al montar ReservaWizard...");
    resetForm();
  }, [resetForm]); // Dependencia para evitar warnings de lint, asumiendo que resetForm es estable

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
    }
  ];

  const handleNextStep = () => {
    // Validación según el paso actual
    if (currentStep === 1 && !selectedEventType) {
      toast.error('Por favor, seleccione un tipo de evento');
      return;
    }
    
    if (currentStep === 2 && !formData.fecha) {
      toast.error('Por favor, seleccione una fecha para su evento');
      return;
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
      const telefonoRegex = /^\d{9,}$/;
      if (!telefonoRegex.test(telefono.replace(/\s+/g, ''))) {
        toast.error('Por favor, ingrese un número de teléfono válido (mínimo 9 dígitos)');
        return;
      }
    }
    
    if (currentStep === 6) {
      handleSubmit();
      return;
    }
    
    setCurrentStep(prev => prev + 1);
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
    // --- Inicio: Añadir validación y log ---
    if (!formData.fecha || isNaN(new Date(formData.fecha).getTime())) {
      toast.error('La fecha seleccionada no es válida. Por favor, selecciónela de nuevo.');
      setCurrentStep(2); // Volver al paso de fecha
      return;
    }
    console.log('Datos de habitaciones seleccionadas antes de mapear:', JSON.stringify(formData.habitacionesSeleccionadas, null, 2));
    // --- Fin: Añadir validación y log ---
    
    try {
      // Comentar uso temporalmente
      /*
      if (modoReserva === 'hacienda') {
        response = await crearReservaEvento({ 
            // ... datos 
        });
      } else {
         // Lógica para reserva cliente (asumiendo que usa createHabitacionReservation)
         response = await createHabitacionReservation({ 
             // ... datos 
         });
      }
      */
     console.log("Lógica de submit comentada temporalmente debido a importación faltante de crearReservaEvento");
     toast.info("Funcionalidad de envío deshabilitada temporalmente.")
      // ... resto de la lógica de submit (manejo de respuesta) ...
    } catch (error) {
      // ... manejo de error ...
    }
  };

  const handleEventTypeSelect = (eventType) => {
    // Guardar el objeto completo para mantener la referencia
    setSelectedEventType(eventType);
    updateFormSection('tipoEvento', eventType);
  };

  // Renderizar el contenido según el paso actual
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
            <h3 className="text-xl font-semibold text-[#5C4A3C] mb-4">Selección de Fecha y Huéspedes</h3>
            <p className="text-sm text-[#8A6E52] mb-6">Seleccione la fecha principal para su evento y estime el número de huéspedes.</p>
            
            <CalendarioReserva
              selectedDate={formData.fecha ? new Date(formData.fecha) : null}
              onDateChange={(date) => updateFormSection('fecha', date)}
              occupiedDates={occupiedEventDates}
              loadingOccupiedDates={loadingOccupiedEventDates}
              placeholderText="Seleccione la fecha del evento"
            />
            
            <div className="mt-6 pt-6 border-t border-[#D1B59B]/50">
              <label htmlFor="numHuespedesEvento" className="block text-[#5D4B3A] font-medium mb-2">Número Estimado de Huéspedes</label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                   <FaUsers className="text-[#A5856A]" />
                 </div>
                 <input 
                   type="number" 
                   id="numHuespedesEvento"
                   value={formData.numHuespedes || ''} 
                   onChange={(e) => {
                     const value = parseInt(e.target.value) || 0;
                     updateFormSection('numHuespedes', Math.max(0, value)); // Permitir 0 o más
                   }}
                   min="0"
                   className="w-full pl-10 p-3 bg-white/80 backdrop-blur-sm border border-[#D1B59B] rounded-lg focus:ring-2 focus:ring-[#A5856A] focus:border-transparent transition-all duration-300 shadow-sm hover:shadow"
                   placeholder="Ej: 50"
                 />
              </div>
              <p className="text-sm text-[#8A6E52] mt-2 italic">
                Indique una estimación del total de asistentes al evento.
              </p>
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
                tipoEvento={typeof formData.tipoEvento === 'object' ? formData.tipoEvento.titulo : formData.tipoEvento}
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
                      {formData.fecha ? new Date(formData.fecha).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : 'No especificada'}
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
      
      case 6:
        // Paso 6: Confirmación
        return (
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <FaCheck className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-primary)]">
              ¡Reserva Confirmada!
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Hemos recibido su solicitud de reserva. En breve recibirá un correo electrónico con los detalles y los siguientes pasos a seguir.
            </p>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 max-w-md mx-auto text-left">
              <p><span className="font-medium">Número de Reserva:</span> {Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</p>
              <p><span className="font-medium">Evento:</span> {formData.tipoEvento}</p>
              <p><span className="font-medium">Fecha:</span> {formData.fecha}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
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
                <span>{currentStep === steps.length ? 'Finalizar' : 'Siguiente'}</span>
                <FaChevronRight />
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);
};