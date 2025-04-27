"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { FaCalendarAlt, FaWifi, FaUserFriends, FaEnvelope, FaPhone, FaSpinner, FaBed, FaEuroSign, FaBuilding, FaCreditCard, FaUniversity, FaMoneyBillWave } from 'react-icons/fa';
import { toast } from 'sonner';
import { 
  createMultipleReservaciones, 
  createHabitacionReservation,
  verificarDisponibilidadHabitaciones // Importar si no estaba ya
} from '@/services/reservationService';
import { obtenerFechasOcupadas, verificarDisponibilidadHabitacion, obtenerTodasLasReservas, obtenerFechasOcupadasParaHabitacionEspecifica, obtenerFechasOcupadasEventosGlobales } from '@/services/disponibilidadService';
import { useAuth } from '@/context/AuthContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import { isSameDay, startOfDay, endOfDay, isValid, isWithinInterval, subDays, addDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import AvailabilityConflictModal from '@/components/modals/AvailabilityConflictModal';
import ReservaConfirmacionBox from './ReservaConfirmacionBox';

registerLocale('es', es);
setDefaultLocale('es');

// Función auxiliar para obtener la imagen de la habitación - CORREGIR RUTA
const getHabitacionImage = (letra) => {
  const placeholder = '/placeholder/room-default.svg'; // Placeholder genérico
  if (!letra || typeof letra !== 'string' || letra.length !== 1) {
    return placeholder;
  }
  const letterIndex = letra.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
  if (letterIndex < 0 || letterIndex > 13) { 
      return placeholder; 
  }
  const imageNumber = (letterIndex % 6) + 1;
  // Corregir ruta base:
  return `/Habitacion${imageNumber}.jpeg`; 
};

// Función auxiliar para comparar fechas ignorando hora/zona horaria (simplificado)
const isSameDate = (d1, d2) => {
  if (!d1 || !d2 || !(d1 instanceof Date) || !(d2 instanceof Date)) return false;
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

// Función auxiliar para formatear fecha para la API (consistentemente YYYY-MM-DD)
const formatApiDate = (date) => {
  if (!date || !(date instanceof Date)) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function BookingFormSection({ 
  selectedRooms = [], 
  isLoadingDetails,
  formData, 
  setFormData,
}) {
  const { user } = useAuth();
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservationError, setReservationError] = useState(null);
  const [fechasPorHabitacion, setFechasPorHabitacion] = useState({}); // Fechas seleccionadas por el usuario
  
  // Estados para las fechas ocupadas (MODIFICADO)
  // const [fechasOcupadasSoloHabitacion, setFechasOcupadasSoloHabitacion] = useState({}); // ELIMINADO
  const [occupiedDateRangesPerRoom, setOccupiedDateRangesPerRoom] = useState({}); // NUEVO: Guarda rangos por letra { K: [{inicio, fin}], L: [...] }
  const [loadingFechasHabitacion, setLoadingFechasHabitacion] = useState({}); // { K: true/false }
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictMessage, setConflictMessage] = useState('');

  // Estados del formulario y pago (sin cambios relevantes aquí)
  const [metodoPago, setMetodoPago] = useState('');
  const [mostrarPago, setMostrarPago] = useState(false);
  const [mostrarFormularioTarjeta, setMostrarFormularioTarjeta] = useState(false);
  const [datosTarjeta, setDatosTarjeta] = useState({
    numeroTarjeta: '',
    nombreTitular: '',
    fechaExpiracion: '',
    cvv: '',
    direccion: '',
    codigoPostal: '',
    ciudad: '',
    estado: ''
  });
  
  // *** NUEVO ESTADO para guardar detalles de la reserva confirmada ***
  const [reservaConfirmadaDetalles, setReservaConfirmadaDetalles] = useState(null); 

  // --- Helper para deshabilitar fechas en DatePicker ---
  const isDateDisabledForRoom = useCallback((date, roomLetra) => {
    const today = startOfDay(new Date());
    const currentDate = startOfDay(date);

    // Deshabilitar fechas pasadas
    if (currentDate < today) {
      return true;
    }
    
    // Obtener los rangos ocupados para esta habitación específica
    const ranges = occupiedDateRangesPerRoom[roomLetra] || [];
    
    // Verificar si la fecha cae dentro de ALGUNO de los rangos ocupados
    return ranges.some(range => {
      // Ya deberíamos tener Dates validados y normalizados en el estado
      if (!range || !range.inicio || !range.fin) return false;
      // No necesitamos re-validar aquí si confiamos en fetchFechasSoloHabitacion
      // const start = range.inicio;
      // const end = range.fin; 
      
      // Usar isWithinInterval
      return isWithinInterval(currentDate, { start: range.inicio, end: range.fin });
    });
  }, [occupiedDateRangesPerRoom]); // Dependencia del estado que contiene los rangos

  // --- Fetch de Fechas Ocupadas (ACTUALIZADO Y SIMPLIFICADO) ---

  // Fetch fechas ocupadas ESPECÍFICAS de cada habitación seleccionada (incluye eventos)
  const fetchFechasSoloHabitacion = useCallback(async (roomId) => {
    if (!roomId) return;
    console.log(`%c[${roomId}] Iniciando fetchFechasSoloHabitacion...`, 'color: blue; font-weight: bold;');
    setLoadingFechasHabitacion(prev => ({ ...prev, [roomId]: true }));
    try {
        // 1. Obtener fechas de eventos GLOBALES
        console.log(`[${roomId}] Llamando a obtenerFechasOcupadasEventosGlobales...`);
        const eventosGlobalesTyped = await obtenerFechasOcupadasEventosGlobales();
        console.log(`[${roomId}] Eventos Globales recibidos:`, JSON.stringify(eventosGlobalesTyped)); // Log como string para ver formato

        // 2. Obtener fechas de reserva específicas para ESTA habitación
        console.log(`[${roomId}] Llamando a obtenerFechasOcupadasParaHabitacionEspecifica(${roomId})...`);
        const reservasHabitacionTyped = await obtenerFechasOcupadasParaHabitacionEspecifica(roomId);
        console.log(`[${roomId}] Reservas Habitación específicas recibidas:`, JSON.stringify(reservasHabitacionTyped)); // Log como string

        // 3. Combinar ambos arrays tipados
        const combinedRangesTyped = [...eventosGlobalesTyped, ...reservasHabitacionTyped];
        console.log(`[${roomId}] Rangos Combinados (antes de buffer):`, JSON.stringify(combinedRangesTyped));

        // 4. VALIDAR, APLICAR BUFFER CONDICIONAL y almacenar los rangos
        const validRanges = combinedRangesTyped
            .map(range => {
                if (!range || !range.inicio || !range.fin || !range.tipo) return null; 
                
                let inicioOriginal = new Date(range.inicio);
                let finOriginal = new Date(range.fin);
                
                if (isNaN(inicioOriginal.getTime()) || isNaN(finOriginal.getTime())) {
                    console.warn(`[${roomId}] Rango inválido recibido:`, range);
                    return null;
                }
                if (inicioOriginal > finOriginal) {
                   console.warn(`[${roomId}] Rango con inicio > fin recibido:`, range);
                   return null;
                }

                let finalInicio = inicioOriginal;
                let finalFin = finOriginal;

                // Aplicar BUFFER solo si es tipo 'evento'
                if (range.tipo === 'evento') {
                   finalInicio = subDays(inicioOriginal, 1);
                   finalFin = addDays(finOriginal, 1);
                   // console.log(`[${roomId}] Aplicando buffer a evento: ${range.inicio} -> ${finalInicio}, ${range.fin} -> ${finalFin}`); // Log opcional de buffer
                }
                
                return { 
                    inicio: startOfDay(finalInicio),
                    fin: endOfDay(finalFin),
                    tipo: range.tipo
                }; 
            })
            .filter(Boolean);

        // 5. Guardar el array de RANGOS válidos y combinados en el estado
        console.log(`%c[${roomId}] Rangos Ocupados FINALES (con Buffer aplicado a eventos) Guardados:`, 'color: green; font-weight: bold;', validRanges); 
        setOccupiedDateRangesPerRoom(prev => ({ 
            ...prev, 
            [roomId]: validRanges || [] 
        }));

    } catch (error) {
        console.error(`Error fetching combined occupied dates for room ${roomId}:`, error);
        setOccupiedDateRangesPerRoom(prev => ({ ...prev, [roomId]: [] }));
    } finally {
        setLoadingFechasHabitacion(prev => ({ ...prev, [roomId]: false }));
    }
  }, [obtenerFechasOcupadasEventosGlobales, obtenerFechasOcupadasParaHabitacionEspecifica]); // Dependencias correctas

  // Efecto para cargar datos cuando cambian las habitaciones seleccionadas
  useEffect(() => {
    if (isLoadingDetails) return;

    // Cargar fechas específicas para cada habitación seleccionada
    const currentRoomLetras = new Set();
    selectedRooms.forEach(room => {
      if (room && room.letra) {
        const roomLetra = room.letra;
        // Solo recargar si no existen datos de rangos para esa letra
        if (!occupiedDateRangesPerRoom.hasOwnProperty(roomLetra)) { 
          fetchFechasSoloHabitacion(roomLetra);
        }
        currentRoomLetras.add(roomLetra);
      }
    });

    // Limpiar RANGOS de habitaciones que ya no están seleccionadas
    setOccupiedDateRangesPerRoom(prev => {
      const newState = { ...prev };
      Object.keys(newState).forEach(roomLetra => {
        if (!currentRoomLetras.has(roomLetra)) {
          delete newState[roomLetra];
        }
      });
      return newState;
    });

  }, [selectedRooms, isLoadingDetails, fetchFechasSoloHabitacion]); // Dependencias actualizadas

  // --- Lógica del Formulario (Manejo de Inputs y Fechas) ---

  // Inicializar fechas cuando cambian las habitaciones seleccionadas
  useEffect(() => {
    const initialFechas = {};
    selectedRooms.forEach(room => {
      initialFechas[room.letra] = fechasPorHabitacion[room.letra] || { fechaEntrada: null, fechaSalida: null };
    });
    setFechasPorHabitacion(initialFechas);
    // La validación se recalcula en el useEffect de calcularPrecioTotal
  }, [selectedRooms]); 

  // Calcular precio total (sin cambios relevantes aquí)
  const calcularPrecioTotal = () => {
    let precioTotalCalculado = 0;
    let todasFechasValidas = true;

    if (selectedRooms.length === 0) return 0;

    selectedRooms.forEach(room => {
      const fechas = fechasPorHabitacion[room.letra];
      if (fechas && fechas.fechaEntrada && fechas.fechaSalida) {
        if (fechas.fechaSalida > fechas.fechaEntrada) {
          const noches = Math.ceil((fechas.fechaSalida - fechas.fechaEntrada) / (1000 * 60 * 60 * 24));
          if (noches > 0) {
            precioTotalCalculado += (room.precioPorNoche || 0) * noches;
          } else {
            todasFechasValidas = false; // Fecha salida <= fecha entrada
          }
        } else {
          todasFechasValidas = false; // Fecha salida <= fecha entrada
        }
      } else {
        todasFechasValidas = false; // Fechas no seleccionadas
      }
    });

    return todasFechasValidas ? precioTotalCalculado : 0;
  };

  // Validar formulario general
  const validateForm = (currentFormData, currentFechasPorHabitacion) => {
    const { nombre, apellidos, email, telefono } = currentFormData;
    let allDatesSetAndValid = selectedRooms.length > 0;
    
    if (selectedRooms.length === 0) {
        allDatesSetAndValid = false;
    } else {
        selectedRooms.forEach(room => {
          const fechas = currentFechasPorHabitacion[room.letra];
          // Asegurar que ambas fechas existen y salida es posterior a entrada
          if (!fechas || !fechas.fechaEntrada || !fechas.fechaSalida || fechas.fechaSalida <= fechas.fechaEntrada) {
            allDatesSetAndValid = false;
          }
        });
    }

    // --- VALIDACIÓN TELÉFONO MX/ES (en validateForm) ---
    const telefonoLimpio = telefono?.trim().replace(/\s+/g, '') || ''; 
    const mexicoRegex = /^\d{10}$/;
    const españaRegex = /^[6789]\d{8}$/;
    const isTelefonoValid = mexicoRegex.test(telefonoLimpio) || españaRegex.test(telefonoLimpio);
    // -----------------------------------------------------

    const isValid = 
      nombre?.trim() !== '' && 
      apellidos?.trim() !== '' &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.trim() || '') && // Validación básica email
      isTelefonoValid && // <-- Usar la nueva validación
      allDatesSetAndValid &&
      metodoPago !== ''; // Asegurar que se eligió método de pago
      
    setIsFormValid(isValid);
    return isValid;
  };
  
  // Recalcular precio y validar cuando cambian datos clave
  useEffect(() => {
    const precio = calcularPrecioTotal();
    setFormData(prev => ({ ...prev, precioTotal: precio }));
    validateForm(formData, fechasPorHabitacion);
  }, [fechasPorHabitacion, formData.nombre, formData.apellidos, formData.email, formData.telefono, metodoPago, selectedRooms]); // Añadir selectedRooms y metodoPago

  // Manejador input general (sin cambios)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    // La validación se dispara en el useEffect
  };

  // *** MODIFICADO: Manejador de cambio de fechas para una habitación ***
  const handleFechasHabitacionChange = (roomLetra, dates) => {
    const [start, end] = dates;
    const currentFechas = { fechaEntrada: start, fechaSalida: end };

    // VALIDACIÓN DE CONFLICTO CON RANGOS
    if (start && end && start < end) { // Solo validar si hay un rango válido seleccionado
      const rangesBloqueados = occupiedDateRangesPerRoom[roomLetra] || [];
      let currentDate = startOfDay(new Date(start));
      const finalDate = startOfDay(new Date(end)); // No incluir el día de salida en la validación de ocupación
      let conflict = false;

      while (currentDate < finalDate) { // Iterar hasta el día ANTES de la salida
        const dateToCheck = currentDate;
        if (isDateDisabledForRoom(dateToCheck, roomLetra)) { // Reutilizar la lógica del filtro
            conflict = true;
            toast.error(`Conflicto: El día ${dateToCheck.toLocaleDateString()} no está disponible para Habitación ${roomLetra}.`);
            break;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (conflict) {
        // Resetear fechas para esta habitación si hay conflicto
        setFechasPorHabitacion(prev => ({
          ...prev,
          [roomLetra]: { fechaEntrada: null, fechaSalida: null }
        }));
        return; // Detener la actualización
      }
    }
    // FIN VALIDACIÓN

    // Actualizar fechas si no hay conflicto (o si el rango es inválido por ahora)
    setFechasPorHabitacion(prev => ({
      ...prev,
      [roomLetra]: currentFechas
    }));
  };

  // Manejador cambio método pago (sin cambios)
  const handleMetodoPagoChange = (e) => {
      setMetodoPago(e.target.value);
      setMostrarPago(true); 
      setMostrarFormularioTarjeta(e.target.value === 'tarjeta');
      // Validar formulario de nuevo
      validateForm(formData, fechasPorHabitacion); 
  };
  
  // Manejador input tarjeta (sin cambios)
  const handleCardInputChange = (e) => {
    // ... (lógica existente)
    const { name, value } = e.target;
    setDatosTarjeta(prev => ({ ...prev, [name]: value }));
  };

  // --- Lógica de Envío ---

  // Función auxiliar para la verificación final de disponibilidad ANTES del pago/submit (ACTUALIZADO)
  const runAvailabilityCheck = async (reservationsData) => {
    if (!reservationsData || reservationsData.length === 0) {
      console.warn('[runAvailabilityCheck] No hay datos de reservaciones para verificar.');
      return true;
    }

    try {
      // Verificar disponibilidad para cada habitación y rango
      for (const reservation of reservationsData) {
        const disponible = await verificarDisponibilidadHabitacion(
          reservation.habitacionId,
          new Date(reservation.fechaEntrada),
          new Date(reservation.fechaSalida)
        );
        
        if (!disponible) {
          // Si alguna no está disponible, mostrar conflicto y terminar
          setConflictMessage(`La habitación ${reservation.habitacionLetra} ya no está disponible en las fechas seleccionadas.`);
          setShowConflictModal(true);
          return false;
        }
      }
      
      // Si llegamos aquí, todas están disponibles
      return true;
      
    } catch (error) {
        console.error('Error en la verificación de disponibilidad previa:', error);
        setConflictMessage(error.response?.data?.error || error.message || 'Error inesperado al verificar disponibilidad.');
        setShowConflictModal(true);
        return false; // Indicar fallo
    }
  };

  // Manejador principal de envío (REVISADO SIN RELANZAR ERROR EN SERVICIO)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- VALIDACIÓN TELÉFONO MX/ES (en handleSubmit) ---
    const telefonoLimpioSubmit = formData.telefono?.trim().replace(/\s+/g, '') || '';
    const mexicoRegexSubmit = /^\d{10}$/;
    const españaRegexSubmit = /^[6789]\d{8}$/;
    if (!mexicoRegexSubmit.test(telefonoLimpioSubmit) && !españaRegexSubmit.test(telefonoLimpioSubmit)) {
        toast.error('Por favor, ingrese un número de teléfono válido (10 dígitos para MX o 9 dígitos para ES)');
        return; 
    }
    // -----------------------------------------------------

    if (!validateForm(formData, fechasPorHabitacion)) {
      // La validación ya incluye el teléfono, pero podemos mostrar un mensaje genérico
      toast.error('Por favor, complete todos los campos requeridos, seleccione fechas válidas y un método de pago.');
      return;
    }
    if (!metodoPago) {
      toast.error('Por favor, seleccione un método de pago.');
      return;
    }

    setIsSubmitting(true);
    setReservationError(null);
    setReservaConfirmadaDetalles(null); 

    const formattedReservations = selectedRooms.map(room => {
      const fechas = fechasPorHabitacion[room.letra];
      return {
        habitacionLetra: room.letra,
        tipoHabitacion: room.tipo,
        precioPorNoche: room.precioPorNoche,
        numHuespedes: formData[`numHuespedes_${room.letra}`] || 1,
        fechaEntrada: formatApiDate(fechas.fechaEntrada),
        fechaSalida: formatApiDate(fechas.fechaSalida),
        nombreContacto: formData.nombre,
        apellidosContacto: formData.apellidos,
        emailContacto: formData.email,
        telefonoContacto: formData.telefono,
        peticionesEspeciales: formData.peticionesEspeciales,
        metodoPago: metodoPago,
        estadoPago: metodoPago === 'tarjeta' ? 'procesando' : 'pendiente',
        tipoReserva: 'hotel',
        categoriaHabitacion: room.capacidad > 2 ? 'doble' : 'sencilla',
      };
    });

    let response = null; // Variable para guardar la respuesta/error

    try {
        // Verificación de disponibilidad ANTES de intentar crear
        const availabilityCheckPassed = await runAvailabilityCheck(formattedReservations);
        if (!availabilityCheckPassed) {
            // runAvailabilityCheck ya muestra el modal
            return; // Detener si hay conflicto previo
        }

        // Intentar crear la reserva
        if (formattedReservations.length === 1) {
            response = await createHabitacionReservation(formattedReservations[0]);
        } else {
            response = await createMultipleReservaciones(formattedReservations);
        }

        // <<< LOG: VER RESPUESTA/ERROR RECIBIDO DEL SERVICIO >>>
        console.log('Respuesta/Error recibido del servicio:', response);

        // *** MANEJO DE RESPUESTA DIRECTA ***
        if (response && response.success === true && response.data) {
            // ÉXITO
            const confirmations = Array.isArray(response.data) ? response.data : [response.data];
            console.log('Estableciendo reservaConfirmadaDetalles con:', confirmations);
            setReservaConfirmadaDetalles(confirmations); 
            toast.success('¡Reserva(s) creada(s) exitosamente!');
            // Opcional: Limpiar formulario
        } else {
            // FALLO (o respuesta inesperada)
            const errMsg = response?.message || 'Error desconocido al procesar la reserva.';
            const errStatus = response?.status;
            console.error('Respuesta API no exitosa o datos faltantes:', response);
            
            // *** MOVER LA LÓGICA DEL MODAL PRIMERO ***
            if (errStatus === 409 || errMsg.toLowerCase().includes('conflicto')) {
                console.log('<<< DETECTADO CONFLICTO 409 en respuesta (antes de toast) >>>');
                
                // *** PROCESAR MENSAJE PARA EL MODAL ***
                let finalConflictMsg = errMsg;
                const stateMarker = "Estado reserva existente:";
                if (finalConflictMsg.includes(stateMarker)) {
                   // Dividir por el marcador y tomar la primera parte
                   finalConflictMsg = finalConflictMsg.split(stateMarker)[0].trim(); 
                   // Añadir un punto final si se quitó
                   if (!finalConflictMsg.endsWith('.') && !finalConflictMsg.endsWith('?') && !finalConflictMsg.endsWith('!')) {
                      finalConflictMsg += '.';
                   }
                }
                // *** FIN PROCESAMIENTO ***
                
                setConflictMessage(finalConflictMsg); // <-- Usar el mensaje procesado
                
                setTimeout(() => {
                   console.log('<<< LLAMANDO setShowConflictModal(true) desde setTimeout >>>');
                   setShowConflictModal(true); 
                }, 0); 
            } else {
                 console.log('<<< ERROR NO DETECTADO COMO CONFLICTO 409 en respuesta (antes de toast) >>>');
            }
            
            // Mostrar error general después de intentar activar el modal
            setReservationError(errMsg);
            toast.error(`Error: ${errMsg}`);
        }

    } catch (error) {
        // Este catch ahora SÓLO debería atrapar errores INESPERADOS 
        // (ej. error de red ANTES de la llamada, error JS en el try, etc.)
        // porque los errores de API 4xx/5xx deberían ser DEVUELTOS por el servicio
        // como {success: false, ...} y manejados en el bloque anterior.
        console.error('Error CATCH INESPERADO en handleSubmit:', error);
        const errMsg = error.message || 'Ocurrió un error muy inesperado.';
        setReservationError(errMsg);
        toast.error(`Error inesperado: ${errMsg}`);
        // Podríamos opcionalmente mostrar el modal de conflicto aquí también como fallback?
        // setConflictMessage('Ocurrió un error inesperado al procesar tu solicitud.');
        // setShowConflictModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Renderizado del Componente (ACTUALIZADO) ---
  console.log('Renderizando BookingFormSection. reservaConfirmadaDetalles:', reservaConfirmadaDetalles);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto p-4 md:p-8 bg-[var(--color-cream-light)] rounded-lg shadow-lg"
    >
      <h2 className="text-3xl font-[var(--font-display)] text-[var(--color-brown-dark)] mb-6 text-center">
        {selectedRooms.length > 1 ? 'Detalles de tu Reserva' : 'Detalles de la Habitación'}
      </h2>

      {isLoadingDetails ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-[var(--color-primary)]" />
          <p className="ml-4 text-lg text-[var(--color-brown-medium)]">Cargando detalles...</p>
        </div>
      ) : selectedRooms.length > 0 ? (
        // *** Renderizar Formulario O Confirmación ***
        <>
          {/* Mostrar formulario SOLO si NO hay detalles de confirmación */} 
          {!reservaConfirmadaDetalles && (
             <form onSubmit={handleSubmit}>
                {/* --- SECCIÓN DE HABITACIONES SELECCIONADAS (Ahora ocupa todo el ancho) --- */}
                <div className="mb-8 space-y-6"> {/* Añadido margen inferior */}
                    {selectedRooms.map((room, index) => (
                      <motion.div 
                        key={room.letra || index} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="bg-white p-4 rounded-md shadow-md border border-gray-200"
                      >
                         <div className="flex flex-col sm:flex-row gap-4">
                              <div className="flex-shrink-0 w-full sm:w-40 h-32 relative rounded overflow-hidden">
                                {room.letra ? (
                                  <Image 
                                    src={getHabitacionImage(room.letra)} 
                                    alt={`Habitación ${room.letra}`} 
                                    layout="fill" 
                                    objectFit="cover" 
                                  />
                                ) : (
                                   <div className="bg-gray-200 h-full flex items-center justify-center">
                                       <FaBed className="text-gray-400 text-3xl"/>
                                   </div> 
                                )}
                              </div>
                              <div className="flex-grow">
                                <h3 className="text-xl font-semibold text-[var(--color-brown-dark)] mb-2">
                                  Habitación {room.letra || 'Desconocida'} ({room.tipo || 'Estándar'})
                                </h3>
                                 <div className="flex items-center text-sm text-gray-600 mb-1">
                                   <FaUserFriends className="mr-2 text-[var(--color-primary)]"/> Capacidad: {room.capacidad || 'N/A'} personas
                                 </div>
                                 <div className="flex items-center text-sm text-gray-600 mb-3">
                                   <FaEuroSign className="mr-2 text-green-600"/> Precio por noche: ${room.precioPorNoche ? room.precioPorNoche.toFixed(2) : 'N/A'} MXN
                                 </div>

                                {/* DatePicker específico para esta habitación */}
                                <div className="mb-3">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fechas de Estancia (Habitación {room.letra})
                                  </label>
                                  <DatePicker
                                    selected={fechasPorHabitacion[room.letra]?.fechaEntrada}
                                    onChange={(dates) => handleFechasHabitacionChange(room.letra, dates)}
                                    startDate={fechasPorHabitacion[room.letra]?.fechaEntrada}
                                    endDate={fechasPorHabitacion[room.letra]?.fechaSalida}
                                    minDate={new Date()} // No permitir fechas pasadas
                                    filterDate={date => !isDateDisabledForRoom(date, room.letra)}
                                    selectsRange
                                    inline={false} // O true si prefieres mostrarlo siempre
                                    monthsShown={2} // Mostrar dos meses
                                    locale="es"
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="Selecciona Check-in y Check-out"
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    calendarClassName="custom-datepicker-calendar" // Clase para estilos personalizados
                                    wrapperClassName="w-full" 
                                    // *** Lógica de filtrado de fechas ***
                                    dayClassName={date => {
                                      const isRoomOccupied = (occupiedDateRangesPerRoom[room.letra] || []).some(range => 
                                        date >= range.inicio && date <= range.fin
                                      );
                                      
                                      if (isRoomOccupied) return 'react-datepicker__day--disabled room-occupied-visual'; // Clase específica si habitación ocupada
                                      return undefined; // Día normal
                                    }}
                                    // Mostrar indicador de carga mientras se obtienen fechas
                                    isLoading={loadingFechasHabitacion[room.letra]} 
                                  />
                                   {loadingFechasHabitacion[room.letra] && (
                                      <div className="text-xs text-gray-500 mt-1 flex items-center">
                                         <FaSpinner className="animate-spin mr-1" /> Verificando disponibilidad...
                                      </div>
                                   )}
                                </div>
                              </div>
                           </div>
                      </motion.div>
                    ))}
                </div>
                {/* --- FIN SECCIÓN DE HABITACIONES --- */}

                {/* --- NUEVO CONTENEDOR HORIZONTAL PARA DETALLES, PAGO Y RESUMEN --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                  
                  {/* Tarjeta "Tus Datos" */}
                  <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="bg-white p-6 rounded-md shadow-md border border-gray-200"
                  >
                    <h3 className="text-xl font-semibold text-[var(--color-brown-dark)] mb-4 border-b pb-2">Tus Datos</h3>
                    {/* Campos del formulario: Nombre, Apellidos, Email, Teléfono */}
                     <div className="mb-4">
                        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md"/>
                     </div>
                     <div className="mb-4">
                         <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                         <input type="text" id="apellidos" name="apellidos" value={formData.apellidos} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md"/>
                     </div>
                     <div className="mb-4">
                         <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                         <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md"/>
                     </div>
                     <div className="mb-4">
                         <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                         <input type="tel" id="telefono" name="telefono" value={formData.telefono} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md"/>
                     </div>
                  </motion.div>

                  {/* Tarjeta "Método de Pago" */}
                  <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      className="bg-white p-6 rounded-md shadow-md border border-gray-200"
                   >
                       <h3 className="text-xl font-semibold text-[var(--color-brown-dark)] mb-4 border-b pb-2">Método de Pago</h3>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           {/* Botón/Tarjeta Transferencia */}
                           <button
                               type="button"
                               onClick={() => {
                                   setMetodoPago('transferencia');
                                   setMostrarPago(true);
                                   setMostrarFormularioTarjeta(false);
                                   validateForm(formData, fechasPorHabitacion);
                               }}
                               className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                                   metodoPago === 'transferencia' 
                                   ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] shadow-md ring-2 ring-[var(--color-primary)]' 
                                   : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                               }`}
                           >
                               <FaUniversity className={`text-3xl mb-2 ${metodoPago === 'transferencia' ? 'text-[var(--color-primary)]' : 'text-gray-500'}`} />
                               <span className={`text-sm font-medium ${metodoPago === 'transferencia' ? 'text-[var(--color-primary-dark)]' : 'text-gray-700'}`}>
                                   Transferencia
                               </span>
                           </button>

                           {/* Botón/Tarjeta Tarjeta */}
                           <button
                               type="button"
                               onClick={() => {
                                   setMetodoPago('tarjeta');
                                   setMostrarPago(true);
                                   setMostrarFormularioTarjeta(true);
                                   validateForm(formData, fechasPorHabitacion);
                               }}
                               className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                                   metodoPago === 'tarjeta' 
                                   ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] shadow-md ring-2 ring-[var(--color-primary)]' 
                                   : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                               }`}
                           >
                               <FaCreditCard className={`text-3xl mb-2 ${metodoPago === 'tarjeta' ? 'text-[var(--color-primary)]' : 'text-gray-500'}`} />
                               <span className={`text-sm font-medium ${metodoPago === 'tarjeta' ? 'text-[var(--color-primary-dark)]' : 'text-gray-700'}`}>
                                   Tarjeta
                               </span>
                           </button>

                           {/* Botón/Tarjeta Efectivo */}
                           <button
                               type="button"
                               onClick={() => {
                                   setMetodoPago('efectivo');
                                   setMostrarPago(true);
                                   setMostrarFormularioTarjeta(false);
                                   validateForm(formData, fechasPorHabitacion);
                               }}
                               className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                                   metodoPago === 'efectivo' 
                                   ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] shadow-md ring-2 ring-[var(--color-primary)]' 
                                   : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                               }`}
                           >
                               <FaMoneyBillWave className={`text-3xl mb-2 ${metodoPago === 'efectivo' ? 'text-[var(--color-primary)]' : 'text-gray-500'}`} />
                               <span className={`text-sm font-medium ${metodoPago === 'efectivo' ? 'text-[var(--color-primary-dark)]' : 'text-gray-700'}`}>
                                   Efectivo
                               </span>
                               <span className="text-xs text-gray-500 mt-1">(Pagar al llegar)</span>
                           </button>
                       </div>

                       {/* Formulario Tarjeta (Condicional - sin cambios en su lógica interna) */}
                       <AnimatePresence>
                           {mostrarFormularioTarjeta && (
                               <motion.div 
                                   initial={{ opacity: 0, height: 0 }}
                                   animate={{ opacity: 1, height: 'auto' }}
                                   exit={{ opacity: 0, height: 0 }}
                                   transition={{ duration: 0.3 }}
                                   className="mt-6 border-t pt-4"
                               >
                                   <h4 className="text-md font-medium text-gray-800 mb-3">Datos de la Tarjeta</h4>
                                   {/* Campos tarjeta: numero, titular, expiracion, cvv, etc. */}
                                   {/* Simplificado - añadir validaciones y campos necesarios */}
                                    <div className="mb-3">
                                        <label htmlFor="numeroTarjeta" className="text-sm font-medium text-gray-600 block mb-1">Número</label>
                                        <input type="text" id="numeroTarjeta" name="numeroTarjeta" value={datosTarjeta.numeroTarjeta} onChange={handleCardInputChange} className="w-full p-2 border rounded-md text-sm" placeholder="**** **** **** ****"/>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="nombreTitular" className="text-sm font-medium text-gray-600 block mb-1">Nombre del Titular</label>
                                        <input type="text" id="nombreTitular" name="nombreTitular" value={datosTarjeta.nombreTitular} onChange={handleCardInputChange} className="w-full p-2 border rounded-md text-sm"/>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div>
                                           <label htmlFor="fechaExpiracion" className="text-sm font-medium text-gray-600 block mb-1">Expira (MM/AA)</label>
                                           <input type="text" id="fechaExpiracion" name="fechaExpiracion" value={datosTarjeta.fechaExpiracion} onChange={handleCardInputChange} className="w-full p-2 border rounded-md text-sm" placeholder="MM/AA"/>
                                        </div>
                                         <div>
                                           <label htmlFor="cvv" className="text-sm font-medium text-gray-600 block mb-1">CVV</label>
                                           <input type="text" id="cvv" name="cvv" value={datosTarjeta.cvv} onChange={handleCardInputChange} className="w-full p-2 border rounded-md text-sm" placeholder="***"/>
                                        </div>
                                    </div>
                               </motion.div>
                           )}
                       </AnimatePresence>
                   </motion.div>

                  {/* Tarjeta "Resumen" */}
                  <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      className="bg-white p-6 rounded-md shadow-md border border-gray-200 h-fit" // añadido h-fit para que no se estire innecesariamente
                  >
                      <h3 className="text-xl font-semibold text-[var(--color-brown-dark)] mb-4 border-b pb-2">Resumen</h3>
                      {selectedRooms.map(room => (
                          <div key={room.letra} className="text-sm mb-2 flex justify-between">
                              <span>Habitación {room.letra} ({fechasPorHabitacion[room.letra]?.fechaEntrada ? formatApiDate(fechasPorHabitacion[room.letra].fechaEntrada) : 'N/A'} - {fechasPorHabitacion[room.letra]?.fechaSalida ? formatApiDate(fechasPorHabitacion[room.letra].fechaSalida) : 'N/A'})</span>
                              {/* Podríamos calcular el precio por habitación aquí si es necesario */}
                          </div>
                      ))}
                      <div className="text-lg font-bold text-[var(--color-brown-dark)] mt-4 pt-4 border-t flex justify-between items-center">
                          <span>Total Estimado:</span>
                          <span>${formData.precioTotal ? formData.precioTotal.toFixed(2) : '0.00'} MXN</span>
                      </div>
                      
                      {reservationError && (
                          <p className="text-red-600 text-sm mt-4">{reservationError}</p>
                      )}

                      <button 
                          type="submit" 
                          disabled={!isFormValid || isSubmitting || isLoadingDetails} 
                          className={`w-full mt-6 py-3 px-4 rounded-md text-white font-semibold transition-colors duration-200 flex items-center justify-center ${(!isFormValid || isSubmitting || isLoadingDetails) ? 'bg-gray-400 cursor-not-allowed' : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'}`}
                      >
                          {isSubmitting ? (
                              <FaSpinner className="animate-spin mr-2" /> 
                          ) : (
                              <FaCalendarAlt className="mr-2" />
                          )}
                          {isSubmitting ? 'Procesando Reserva...' : 'Confirmar Reserva'}
                      </button>
                  </motion.div>

                </div>
                {/* --- FIN CONTENEDOR HORIZONTAL --- */}

              </form>
          )}

          {/* Mostrar el Box de Confirmación si HAY detalles */} 
          {reservaConfirmadaDetalles && (
            <ReservaConfirmacionBox reservations={reservaConfirmadaDetalles} />
          )}
        </>
      ) : (
        <div className="text-center py-10">
           <FaBed className="text-5xl text-gray-400 mx-auto mb-4"/>
           <p className="text-lg text-[var(--color-brown-medium)]">
               Selecciona una o más habitaciones en la sección anterior para comenzar tu reserva.
           </p>
        </div>
      )}

      {/* --- Modales (Solo el de conflicto ahora) --- */}
      {/* ELIMINAR AnimatePresence y Modal de Éxito */}
      {/* 
      <AnimatePresence>
        {showReservationSuccess && multipleReservationConfirmations.length > 0 && (
          <ReservationSuccessModal 
            isOpen={showReservationSuccess} 
            onClose={() => setShowReservationSuccess(false)}
            reservations={multipleReservationConfirmations} 
          />
        )}
      </AnimatePresence>
      */}
      
      <AnimatePresence>
         {showConflictModal && (
             <AvailabilityConflictModal
                 isOpen={showConflictModal}
                 onClose={() => {
                     setShowConflictModal(false);
                     // Opcional: Forzar recarga de fechas al cerrar el modal de conflicto
                     // const hoy = new Date();
                     // const fechaFinRango = new Date(hoy.getFullYear(), hoy.getMonth() + 3, 0);
                     // fetchFechasDeEventos(hoy, fechaFinRango);
                     // selectedRooms.forEach(room => fetchFechasSoloHabitacion(room.letra, hoy, fechaFinRango));
                 }}
                 message={conflictMessage}
             />
         )}
      </AnimatePresence>

    </motion.div>
  );
}

export default BookingFormSection;

// Estilos CSS en globales o específicos del componente para:
// .react-datepicker__day--disabled.room-occupied-visual { background-color: #fecaca; color: #991b1b; } /* Rojo claro */
// .react-datepicker__day--disabled.event-day-visual { background-color: #bfdbfe; color: #1e40af; } /* Azul claro */