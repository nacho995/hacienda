'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useReservation } from '@/context/ReservationContext';
import { useRouter } from 'next/navigation';
import ModoSeleccionEvento from './ModoSeleccionEvento';
import EventDateSelector from './EventDateSelector';
import ModoGestionServicios from './ModoGestionServicios';
import EventoMapaHabitacionesNuevo from './EventoMapaHabitacionesNuevo';
import ContactoForm from './ContactoForm';
import ReservacionResumen from './ReservacionResumen';
import { toast } from 'sonner';
import { crearReservaEvento } from '@/services/reservas.service';

const ReservaWizard = () => {
  const router = useRouter();
  const { formData, updateFormSection, resetForm } = useReservation();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  
  // Referencias para el scroll
  const wizardContainerRef = useRef(null);
  const stepContentRef = useRef(null);

  // Definir los pasos del wizard
  const steps = [
    { id: 1, title: 'Tipo de Evento' },
    { id: 2, title: 'Fecha' },
    { id: 3, title: 'Habitaciones' },
    { id: 4, title: 'Servicios' },
    { id: 5, title: 'Contacto' },
    { id: 6, title: 'Confirmación' }
  ];
  
  // Método simple para hacer scroll a un elemento por ID
  const scrollToElement = (id) => {
    try {
      // Usar window.location.hash para aprovechar la navegación nativa del navegador
      // Esto funciona como una ancla HTML tradicional
      window.location.hash = id;
      
      // También aplicamos un pequeño offset usando scrollBy para ajustar la posición
      setTimeout(() => {
        window.scrollBy(0, -100); // Desplazamiento hacia arriba para ver bien el encabezado
      }, 100);
    } catch (error) {
      console.error('Error al intentar hacer scroll:', error);
    }
  };
  
  // Efecto para asegurar el scroll al cambiar de paso
  useEffect(() => {
    // Hacer scroll al paso actual usando el ID "wizard-step-{n}"
    const stepId = `wizard-step-${currentStep}`;
    scrollToElement(stepId);
  }, [currentStep]);
  
  // Manejadores de eventos para los pasos del wizard
  const handleEventTypeSelect = (tipo) => {
    updateFormSection('tipoEvento', tipo);
  };
  
  const handleDateSelect = (fecha) => {
    updateFormSection('fecha', fecha);
  };
  
  const handleRoomSelect = (rooms) => {
    setSelectedRooms(rooms);
    updateFormSection('habitaciones', rooms);
  };
  
  const handleServiceSelect = (services) => {
    setSelectedServices(services);
    updateFormSection('servicios', services);
  };
  
  const handleContactDataChange = (data) => {
    updateFormSection('contacto', data);
  };
  
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNextStep = async () => {
    // Validaciones específicas para cada paso
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.tipoEvento) {
          toast.error('Seleccione un tipo de evento');
          return false;
        }
        break;
      case 2:
        if (!formData.fecha) {
          toast.error('Seleccione una fecha para el evento');
          return false;
        }
        break;
      case 3:
        // La selección de habitaciones es opcional
        break;
      case 4:
        // La selección de servicios es opcional
        break;
      case 5:
        if (!formData.contacto || !formData.contacto.nombre || !formData.contacto.email || !formData.contacto.telefono) {
          toast.error('Todos los datos de contacto son obligatorios');
          return false;
        }
        break;
    }
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Crear objeto con todos los datos del formulario
      const reservaData = {
        ...formData,
        habitaciones: selectedRooms,
        servicios: selectedServices
      };
      
      const response = await crearReservaEvento(reservaData);
      
      if (response.success) {
        toast.success('¡Reserva creada con éxito!');
        resetForm(); // Resetear el formulario después de enviar
        
        // Redirección a página de confirmación o agradecimiento
        router.push('/reserva/confirmacion');
      } else {
        toast.error('Error al crear la reserva', {
          description: response.message || 'Por favor, intente nuevamente'
        });
      }
    } catch (error) {
      console.error('Error al procesar la reserva:', error);
      toast.error('Error inesperado', {
        description: 'Ocurrió un error al procesar la reserva'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div id="reserva-wizard-container" ref={wizardContainerRef} className="max-w-7xl mx-auto px-4 py-8 relative">
      {/* Barra de progreso */}
      <div className="mb-8">
        <div className="flex justify-between">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex-1 ${step.id < currentStep
                ? 'bg-[var(--color-primary)]'
                : step.id === currentStep
                  ? 'bg-[var(--color-primary)]/60'
                  : 'bg-gray-200'
              } h-2 rounded-full mx-1 transition-all duration-300`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`text-sm ${step.id <= currentStep ? 'text-[var(--color-primary)]' : 'text-gray-400'}`}
            >
              {step.title}
            </div>
          ))}
        </div>
      </div>

      {/* Contenido del paso actual */}
      {currentStep === 1 && (
        <div id="wizard-step-1" className="mb-8" ref={stepContentRef}>
          <h3 className="text-2xl font-semibold mb-6">Selecciona el tipo de evento</h3>
          <ModoSeleccionEvento
            onEventTypeSelect={handleEventTypeSelect}
            selectedEventType={formData.tipoEvento}
          />
        </div>
      )}

      {currentStep === 2 && (
        <div id="wizard-step-2" className="mb-8" ref={stepContentRef}>
          <h3 className="text-2xl font-semibold mb-6">Selecciona la fecha de tu evento</h3>
          <EventDateSelector 
            onDateSelect={handleDateSelect} 
            selectedDate={formData.fecha}
            selectedEventType={formData.tipoEvento}
          />
        </div>
      )}

      {currentStep === 3 && (
        <div id="wizard-step-3" className="mb-8" ref={stepContentRef}>
          <h3 className="text-2xl font-semibold mb-6">Selecciona las habitaciones</h3>
          <EventoMapaHabitacionesNuevo
            onRoomSelect={handleRoomSelect}
            date={formData.fecha}
            selectedRooms={selectedRooms}
          />
        </div>
      )}

      {currentStep === 4 && (
        <div id="wizard-step-4" className="mb-8" ref={stepContentRef}>
          <h3 className="text-2xl font-semibold mb-6">Selecciona servicios adicionales</h3>
          <ModoGestionServicios
            onServiceSelect={handleServiceSelect}
            selectedServices={selectedServices}
            eventType={formData.tipoEvento}
          />
        </div>
      )}

      {currentStep === 5 && (
        <div id="wizard-step-5" className="mb-8" ref={stepContentRef}>
          <h3 className="text-2xl font-semibold mb-6">Datos de contacto</h3>
          <ContactoForm
            userData={formData.contacto}
            onUserDataChange={handleContactDataChange}
          />
        </div>
      )}

      {currentStep === 6 && (
        <div id="wizard-step-6" className="mb-8" ref={stepContentRef}>
          <h3 className="text-2xl font-semibold mb-6">Confirma tu reserva</h3>
          <ReservacionResumen
            formData={formData}
            habitaciones={selectedRooms}
            servicios={selectedServices}
          />
        </div>
      )}

      {/* Botones de navegación */}
      <div className="flex justify-between mt-8">
        <button
          onClick={handlePrevStep}
          disabled={currentStep === 1 || loading}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
        >
          Anterior
        </button>
        <button
          onClick={handleNextStep}
          disabled={loading}
          className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
        >
          {loading ? 'Procesando...' : currentStep === steps.length ? 'Finalizar' : 'Siguiente'}
        </button>
      </div>
    </div>
  );
};

export default ReservaWizard;
