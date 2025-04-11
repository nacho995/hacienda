'use client';

import React, { useState, useEffect } from 'react';
import { useReservation } from '@/context/ReservationContext';
import { useRouter } from 'next/navigation';
import ModoSeleccionReserva from './ModoSeleccionReserva';
import ModoSeleccionEvento from './ModoSeleccionEvento';
import ModoGestionServicios from './ModoGestionServicios';
import EventoMapaHabitacionesNuevo from './EventoMapaHabitacionesNuevo';
import { toast } from 'sonner';
import { crearReservaEvento } from '@/services/reservas.service';
import { crearReservaHacienda } from '@/services/gestionHacienda.service';

const ReservaWizard = () => {
  const router = useRouter();
  const { formData, updateFormSection, resetForm } = useReservation();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Definir los pasos del wizard
  const steps = [
    { id: 1, title: 'Tipo de Evento' },
    { id: 2, title: 'Fecha' },
    { id: 3, title: 'Modo de Reserva' },
    { id: 4, title: 'Servicios' },
    { id: 5, title: 'Habitaciones' },
    { id: 6, title: 'Confirmación' }
  ];

  const handleEventTypeSelect = (tipo) => {
    console.log('Tipo de evento seleccionado:', tipo);
    updateFormSection('selectedTipoEvento', tipo);
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
        if (!formData.selectedTipoEvento) {
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
        if (!formData.modoReserva) {
          toast.error('Seleccione un modo de reserva');
          return false;
        }
        break;
      case 4:
        if (formData.serviciosSeleccionados.length === 0) {
          toast.error('Seleccione al menos un servicio');
          return false;
        }
        break;
      case 5:
        if (formData.habitacionesSeleccionadas.length === 0) {
          toast.error('Seleccione al menos una habitación');
          return false;
        }
        break;
      default:
        break;
    }
    return true;
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      let response;

      const dataToSend = {
        ...formData,
        tipo_evento: formData.selectedTipoEvento?.titulo,
        selectedTipoEvento: undefined
      };

      if (formData.modoReserva === 'hacienda') {
        response = await crearReservaHacienda({
          ...dataToSend,
          estado: 'pendiente_gestion'
        });
      } else {
        response = await crearReservaEvento(dataToSend);
      }

      if (response.success) {
        // Mostrar mensaje de éxito específico según el modo
        if (formData.modoReserva === 'hacienda') {
          toast.success('Reserva creada con éxito', {
            description: 'Recibirá un correo con los detalles y nuestro equipo se pondrá en contacto con usted pronto.'
          });
        } else {
          toast.success('Reserva creada con éxito', {
            description: 'Se ha enviado un correo de confirmación con los detalles de su reserva.'
          });
        }
        
        // --- Resetear estado y localStorage ANTES de redirigir ---
        resetForm(); 
        localStorage.removeItem('reservaFormData'); // Limpieza explícita
        console.log('Formulario reseteado y localStorage limpiado.'); // Log para confirmar
        // ---------------------------------------------------------

        // Redirigir a la página de confirmación
        const reservaId = response.data?.id || response.data?.reserva?._id;
        if (reservaId) {
            router.push(`/reservar/confirmacion?id=${reservaId}`);
        } else {
            // Manejar caso donde no hay ID (poco probable si success es true)
            console.error('No se encontró ID en la respuesta exitosa', response.data);
            toast.warning('Reserva creada, pero hubo un problema al redirigir.');
            router.push('/'); // Redirigir a inicio como fallback
        }

      } else {
        toast.error('Error al crear la reserva', {
          description: response.message
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error inesperado', {
        description: 'Ocurrió un error al procesar la reserva'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ModoSeleccionEvento 
                 selectedEventType={formData.selectedTipoEvento} 
                 onEventTypeSelect={handleEventTypeSelect} 
               />;
      case 2:
        return <div>Componente de Fecha</div>;
      case 3:
        return <ModoSeleccionReserva />;
      case 4:
        return (
          <ModoGestionServicios 
            tipoEvento={formData.selectedTipoEvento}
            onServicesSelect={(servicios) => updateFormSection('serviciosSeleccionados', servicios)}
          />
        );
      case 5:
        return (
          <EventoMapaHabitacionesNuevo 
            onRoomsChange={(habitaciones) => updateFormSection('habitacionesSeleccionadas', habitaciones)}
            eventDate={formData.fecha}
          />
        );
      case 6:
        return <div>Componente de Confirmación</div>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex-1 ${
                step.id < currentStep
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
              className={`text-sm ${
                step.id <= currentStep ? 'text-[var(--color-primary)]' : 'text-gray-400'
              }`}
            >
              {step.title}
            </div>
          ))}
        </div>
      </div>

      {/* Current step content */}
      <div className="mb-8">{renderStep()}</div>

      {/* Navigation buttons */}
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