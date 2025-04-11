"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCalendarAlt, FaBed, FaUtensils, FaUser, FaCheck, FaChevronLeft, FaChevronRight, FaEnvelope, FaPhone, FaIdCard, FaMapMarkerAlt, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'sonner';

import ModoSeleccionEvento from '@/components/reservas/ModoSeleccionEvento';
import ModoGestionServicios from '@/components/reservas/ModoGestionServicios';
import ModoGestionHabitaciones from '@/components/reservas/ModoGestionHabitaciones';
import ModalModoGestionHabitaciones from '@/components/reservas/ModalModoGestionHabitaciones';
import CalendarioReserva from '@/components/reservas/CalendarioReserva';
import { useReservation } from '@/context/ReservationContext';
import NavbarReservar from '@/components/layout/NavbarReservar';
import Footer from '@/components/layout/Footer';
import { crearReservaEvento } from '@/services/reservas.service';

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
  const { formData, updateFormSection } = useReservation();
  const [currentStep, setCurrentStep] = useState(1);
  const [showModoSeleccionServiciosModal, setShowModoSeleccionServiciosModal] = useState(false);
  const [showModoSeleccionHabitacionesModal, setShowModoSeleccionHabitacionesModal] = useState(false);
  // Estados para el nuevo modal de validación
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrorMessage, setValidationErrorMessage] = useState('');
  const [validationRedirectStep, setValidationRedirectStep] = useState(null);
  // Mantener el objeto completo para la selección, pero manejar el renderizado con cuidado
  const [selectedEventType, setSelectedEventType] = useState(formData.tipoEvento || null);
  const router = useRouter();

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
    
    // Si estamos en el paso 1 y no hay un modo de gestión de servicios seleccionado,
    // mostramos el modal en lugar de avanzar al siguiente paso
    if (currentStep === 1 && !formData.modoGestionServicios) {
      setShowModoSeleccionServiciosModal(true);
      return;
    }
    
    // Si estamos en el paso 2 y no hay un modo de gestión de habitaciones seleccionado,
    // mostramos el modal en lugar de avanzar al siguiente paso
    if (currentStep === 2 && !formData.modoGestionHabitaciones) {
      setShowModoSeleccionHabitacionesModal(true);
      return;
    }
    
    // Si estamos en el paso 4 (servicios) y no hay servicios seleccionados
    if (currentStep === 4 && formData.modoGestionServicios === 'usuario' && formData.serviciosSeleccionados.length === 0) {
      toast.error('Por favor, seleccione al menos un servicio');
      return;
    }
    
    // Si estamos en el paso 5 (contacto) validamos los campos requeridos
    if (currentStep === 5) {
      const { nombre, apellidos, email, telefono } = formData.datosContacto;
      if (!nombre || !apellidos || !email || !telefono) {
        toast.error('Por favor, complete todos los campos obligatorios');
        return;
      }
      
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error('Por favor, ingrese un email válido');
        return;
      }
      
      // Validar formato de teléfono (al menos 9 dígitos)
      const telefonoRegex = /^\d{9,}$/;
      if (!telefonoRegex.test(telefono.replace(/\s+/g, ''))) {
        toast.error('Por favor, ingrese un número de teléfono válido (mínimo 9 dígitos)');
        return;
      }
    }
    
    // Si estamos en el paso 6 (resumen), enviamos el formulario
    if (currentStep === 6) {
      handleSubmit();
      return;
    }
    
    // Avanzar al siguiente paso
    setCurrentStep(prev => prev + 1);
  };

  const handleServicesSelect = (servicios) => {
    updateFormSection('serviciosSeleccionados', servicios);
  };
  
  const handleModoServiciosSelect = (modo) => {
    updateFormSection('modoGestionServicios', modo);
    setShowModoSeleccionServiciosModal(false);
    setCurrentStep(prev => prev + 1);
  };
  
  const handleModoHabitacionesSelect = (modo) => {
    updateFormSection('modoGestionHabitaciones', modo);
    setShowModoSeleccionHabitacionesModal(false);
    setCurrentStep(prev => prev + 1);
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
      // Preparar datos de la reserva
      const reservaData = {
        tipo_evento: typeof formData.tipoEvento === 'object' ? formData.tipoEvento.titulo : formData.tipoEvento,
        fecha: formData.fecha,
        nombre_contacto: formData.datosContacto.nombre,
        apellidos_contacto: formData.datosContacto.apellidos,
        email_contacto: formData.datosContacto.email,
        telefono_contacto: formData.datosContacto.telefono,
        mensaje: formData.datosContacto.mensaje,
        habitaciones: formData.habitacionesSeleccionadas?.map(hab => {
          // Calcular fecha de salida (día siguiente a la entrada)
          const entrada = new Date(formData.fecha);
          const salida = new Date(entrada);
          salida.setDate(entrada.getDate() + 1);
          
          return {
            habitacion: hab.letra || '', // Usar la letra, default a string vacío si no existe
            tipoHabitacion: hab.tipoHabitacion?.nombre || hab.tipo || 'Estándar', // Usar el nombre del objeto tipoHabitacion, o el tipo simple, o default
            precio: parseFloat(hab.tipoHabitacion?.precio) || parseFloat(hab.precioPorNoche) || 0, // Usar el precio del objeto tipoHabitacion, o precioPorNoche, o default 0
            fechaEntrada: entrada,
            fechaSalida: salida,
            numHuespedes: hab.capacidad || 2 // Añadir numHuespedes (usar capacidad o default 2)
          };
        }) || [],
        modo_gestion_habitaciones: formData.modoGestionHabitaciones,
        modo_gestion_servicios: formData.modoGestionServicios,
        serviciosContratados: formData.serviciosSeleccionados
      };

      // Enviar datos al backend
      const response = await crearReservaEvento(reservaData);
      
      if (response.success) {
        toast.success('Reserva creada exitosamente');
        // Redirigir a la página de confirmación usando la estructura correcta
        router.push(`/reservar/confirmacion?id=${response.data.data.reserva._id}`);
      } else {
        throw new Error(response.message || 'Error al crear la reserva');
      }
    } catch (err) {
      console.error('Error al enviar formulario:', err);
      // Comprobar si es un error de validación del backend
      const errorMessage = err.message || 'Error desconocido';
      // Busca mensajes que indiquen fallo de validación o datos faltantes
      if (errorMessage.toLowerCase().includes('validation failed') || 
          errorMessage.toLowerCase().includes('faltan datos') || 
          errorMessage.toLowerCase().includes('required')) { 
        // Mensaje específico para el modal
        setValidationErrorMessage(
          'Faltan datos requeridos para completar la reserva. Por favor, revise los pasos anteriores y asegúrese de que toda la información esté completa.'
        );
        setValidationRedirectStep(5);
        setShowValidationModal(true);
      } else {
        // Otro tipo de error, mostrar toast genérico
        toast.error('Error al crear la reserva. Por favor, inténtelo de nuevo.');
      }
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
        // Paso 2: Selección de fecha y número de habitaciones
        const isEvento = selectedEventType && 
          (typeof selectedEventType === 'object' ? 
            (selectedEventType.titulo !== 'hospedaje' && selectedEventType.nombre !== 'hospedaje') : 
            selectedEventType !== 'hospedaje');
        const minHabitaciones = isEvento ? 7 : 1;
        const maxHabitaciones = isEvento ? 14 : 20;
        
        // Generar opciones para el selector de habitaciones
        const habitacionesOptions = [];
        for (let i = minHabitaciones; i <= maxHabitaciones; i++) {
          habitacionesOptions.push(
            <option key={i} value={i}>{i} habitaciones</option>
          );
        }
        
        return (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-[#F0E8DC] to-[#E6DCC6] p-6 rounded-xl shadow-md mb-8 border border-[#D1B59B]">
              <h3 className="text-xl font-semibold text-[#5D4B3A] mb-4">Detalles del evento</h3>
              
              <div className="mb-6">
                <label className="block text-[#5D4B3A] font-medium mb-2">Fecha del evento</label>
                <CalendarioReserva 
                  value={formData.fecha || ''}
                  onChange={(fecha) => updateFormSection('fecha', fecha)}
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-sm text-[#8A6E52] mt-2 italic">
                  Seleccione la fecha en la que desea celebrar su {typeof selectedEventType === 'object' ? selectedEventType?.titulo?.toLowerCase() || 'evento' : 'evento'}
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-[#5D4B3A] font-medium mb-2">Número de habitaciones</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaBed className="text-[#A5856A]" />
                  </div>
                  {isEvento ? (
                    <select
                      value={formData.numeroHabitaciones || minHabitaciones}
                      onChange={(e) => updateFormSection('numeroHabitaciones', parseInt(e.target.value))}
                      className="w-full pl-10 p-3 bg-white/80 backdrop-blur-sm border border-[#D1B59B] rounded-lg focus:ring-2 focus:ring-[#A5856A] focus:border-transparent transition-all duration-300 shadow-sm hover:shadow appearance-none"
                    >
                      {habitacionesOptions}
                    </select>
                  ) : (
                    <input 
                      type="number" 
                      value={formData.numeroHabitaciones || 1} 
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        updateFormSection('numeroHabitaciones', Math.max(1, Math.min(value, 20)));
                      }}
                      min="1"
                      max="20"
                      className="w-full pl-10 p-3 bg-white/80 backdrop-blur-sm border border-[#D1B59B] rounded-lg focus:ring-2 focus:ring-[#A5856A] focus:border-transparent transition-all duration-300 shadow-sm hover:shadow"
                    />
                  )}
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <div className="text-[#A5856A] text-sm font-medium">
                      {isEvento ? '7-14' : '1-20'}
                    </div>
                  </div>
                </div>
                {isEvento ? (
                  <p className="text-sm text-[#8A6E52] mt-2 italic">
                    Para eventos, se requiere un mínimo de 7 y un máximo de 14 habitaciones
                  </p>
                ) : (
                  <p className="text-sm text-[#8A6E52] mt-2 italic">
                    Seleccione el número de habitaciones que necesitará
                  </p>
                )}
              </div>
            </div>
            
            <div className="bg-[#F5F0E8] border-l-4 border-[#A5856A] rounded-lg p-5 shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaCalendarAlt className="h-5 w-5 text-[#A5856A]" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-[#5D4B3A]">Información importante</h3>
                  <div className="mt-2 text-sm text-[#8A6E52]">
                    <p>
                      La disponibilidad de habitaciones está sujeta a confirmación. Nuestro equipo se pondrá en contacto con usted para confirmar la reserva.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 3:
        // Paso 3: Gestión de habitaciones
        return (
          <ModoGestionHabitaciones
            onModeSelect={() => setCurrentStep(prev => prev + 1)}
            numeroHabitaciones={formData.numeroHabitaciones}
          />
        );
        
      case 4:
        // Paso 4: Selección de servicios adicionales
        return (
          <ModoGestionServicios 
            tipoEvento={typeof formData.tipoEvento === 'object' ? formData.tipoEvento.titulo : formData.tipoEvento}
            onServicesSelect={handleServicesSelect}
            modoGestion={formData.modoGestionServicios}
            serviciosSeleccionados={formData.serviciosSeleccionados}
          />
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
                      {typeof formData.tipoEvento === 'object' ? 
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
        {/* Modal para selección de modo de gestión de servicios */}
        {showModoSeleccionServiciosModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl p-6 max-w-4xl w-full">
              <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-4">
                Selección de Servicios
              </h2>
              <p className="text-gray-600 mb-6">
                ¿Cómo desea gestionar la selección de servicios para su evento?
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Opción 1: Selección por el usuario */}
                <div
                  onClick={() => handleModoServiciosSelect('usuario')}
                  className="p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 border-gray-200 hover:border-[var(--color-primary)]/50"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mr-4">
                      <FaUser className="w-8 h-8 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Seleccionar servicios ahora</h3>
                      <p className="text-sm text-gray-500">Usted elige los servicios que desea para su evento</p>
                    </div>
                  </div>
                  
                  <ul className="space-y-2 text-gray-600 mb-4">
                    <li className="flex items-start">
                      <span className="w-5 h-5 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></span>
                      </span>
                      <span>Elija entre nuestros paquetes y servicios individuales</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-5 h-5 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></span>
                      </span>
                      <span>Vea precios y descripciones detalladas</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-5 h-5 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></span>
                      </span>
                      <span>Personalice su evento según sus preferencias</span>
                    </li>
                  </ul>
                  
                  <div className="text-sm text-gray-500 italic">
                    Recomendado si ya tiene una idea clara de lo que desea para su evento
                  </div>
                </div>

                {/* Opción 2: Gestión por la hacienda */}
                <div
                  onClick={() => handleModoServiciosSelect('hacienda')}
                  className="p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 border-gray-200 hover:border-[var(--color-primary)]/50"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center mr-4">
                      <FaUtensils className="w-8 h-8 text-[var(--color-accent)]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Consultar con la Hacienda</h3>
                      <p className="text-sm text-gray-500">Nuestro equipo le asesorará sobre los servicios</p>
                    </div>
                  </div>
                  
                  <ul className="space-y-2 text-gray-600 mb-4">
                    <li className="flex items-start">
                      <span className="w-5 h-5 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]"></span>
                      </span>
                      <span>Un coordinador de eventos se pondrá en contacto con usted</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-5 h-5 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]"></span>
                      </span>
                      <span>Reciba asesoramiento personalizado según su presupuesto</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-5 h-5 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]"></span>
                      </span>
                      <span>Flexibilidad para modificar servicios más adelante</span>
                    </li>
                  </ul>
                  
                  <div className="text-sm text-gray-500 italic">
                    Recomendado si prefiere recibir orientación profesional
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Modal para selección de modo de gestión de habitaciones */}
        <ModalModoGestionHabitaciones 
          isOpen={showModoSeleccionHabitacionesModal} 
          onClose={() => setShowModoSeleccionHabitacionesModal(false)} 
          onModeSelect={handleModoHabitacionesSelect} 
        />
        
        {/* --- Modal de Error de Validación --- */}
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