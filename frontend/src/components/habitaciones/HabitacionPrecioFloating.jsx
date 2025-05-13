import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaReceipt, FaChevronDown, FaChevronUp, FaTimes, FaChevronRight, FaPlusCircle, FaBed, FaAngleRight, FaAngleLeft } from 'react-icons/fa';
import { MdHotel, MdKeyboardArrowRight } from 'react-icons/md';

const HabitacionPrecioFloating = ({ 
    selectedRooms = [], 
    fechasPorHabitacion = {},
    isVisible = true,
    onAddRoom = () => {} // Callback para añadir habitación, si está disponible
}) => {
    // Iniciar minimizado para seguir la estrategia de transparencia gradual
    const [isMinimized, setIsMinimized] = useState(true);
    const [totalEstimado, setTotalEstimado] = useState(0);
    const [detallesHabitaciones, setDetallesHabitaciones] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(null); // Para animaciones
    const [shouldPulse, setShouldPulse] = useState(false); // Para animar la pestaña minimizada

    // Formatear fecha para mostrar en el panel - memoizado para evitar recreación en cada render
    const formatApiDate = useCallback((dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }, []);
    
    // Ref para evitar actualizaciones innecesarias
    const prevSelectedRoomsRef = useRef();
    
    // Depuración para ver qué habitaciones llegan al componente
    useEffect(() => {
        // Solo log cuando cambian las habitaciones seleccionadas
        if (JSON.stringify(prevSelectedRoomsRef.current) !== JSON.stringify(selectedRooms)) {
            console.log('HabitacionPrecioFloating recibió:', { 
                selectedRooms, 
                cantidadHabitaciones: selectedRooms.length 
            });
            
            prevSelectedRoomsRef.current = [...selectedRooms];
        }
        
        // Forzar procesamiento inmediato de las habitaciones seleccionadas
        // para asegurar que los detalles se actualicen
        if (selectedRooms.length > 0) {
            let nuevoTotal = 0;
            const nuevosDetalles = [];
            
            selectedRooms.forEach(room => {
                const precioPorNoche = parseFloat(room.precio || room.precioPorNoche || 2450);
                let diasEstancia = 1;
                
                // Obtener fechas para esta habitación
                const roomLetra = room.letra || room.id?.charAt(0)?.toUpperCase() || 'X';
                const fechasHabitacion = fechasPorHabitacion[roomLetra] || {};
                
                const fechaInicio = fechasHabitacion?.fechaEntrada ? new Date(fechasHabitacion.fechaEntrada) : null;
                const fechaFin = fechasHabitacion?.fechaSalida ? new Date(fechasHabitacion.fechaSalida) : null;
                
                // Calcular días de estancia si hay fechas seleccionadas
                if (fechaInicio && fechaFin) {
                    diasEstancia = Math.max(1, Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24)));
                }
                
                // Precio total para esta habitación
                const precioHabitacion = precioPorNoche * diasEstancia;
                nuevoTotal += precioHabitacion;
                
                nuevosDetalles.push({
                    letra: roomLetra,
                    diasEstancia,
                    precioTotal: precioHabitacion,
                    precioPorNoche: precioPorNoche,
                    fechaEntrada: fechaInicio ? formatApiDate(fechasHabitacion.fechaEntrada) : 'Pendiente',
                    fechaSalida: fechaFin ? formatApiDate(fechasHabitacion.fechaSalida) : 'Pendiente',
                    tipo: room.tipo || 'Estándar',
                    capacidad: room.capacidad || 2,
                    original: room
                });
            });
            
            setTotalEstimado(nuevoTotal);
            setDetallesHabitaciones(nuevosDetalles);
            // Log dentro de useEffect para evitar re-renders innecesarios
            console.log('Detalles actualizados:', nuevosDetalles);
        }
    }, [selectedRooms, fechasPorHabitacion, formatApiDate]);

    // Calcular precios y actualizar detalles cuando cambian las habitaciones o fechas
    // Este useEffect simplemente actualiza las animaciones cuando cambia el panel
    useEffect(() => {
        // Detectar cambios para animaciones
        if (selectedRooms.length > 0) {
            setLastUpdated(Date.now());
        }
        
        // Activar pulso en la pestaña minimizada para llamar la atención
        if (isMinimized && selectedRooms.length > 0) {
            setShouldPulse(true);
            const timer = setTimeout(() => setShouldPulse(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [isMinimized, selectedRooms.length]);

    // Solo ocultar si no es visible (no según la cantidad de habitaciones)
    if (!isVisible) return null;
    
    // Movemos los logs de depuración a un useEffect para evitar re-renders innecesarios
    useEffect(() => {
        console.log('Estado de HabitacionPrecioFloating:', {
            isVisible,
            habitacionesSeleccionadas: selectedRooms.length,
            detallesHabitaciones: detallesHabitaciones,
            totalEstimado
        });
    }, [isVisible, selectedRooms.length, detallesHabitaciones, totalEstimado]);

    return (
        <AnimatePresence>
            {isMinimized ? (
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ 
                        opacity: 1, 
                        x: 0,
                        scale: shouldPulse ? [1, 1.05, 1] : 1
                    }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.3 }}
                    className="fixed top-1/3 right-0 z-50 shadow-lg overflow-hidden bg-gradient-to-r from-[#E6DCC6] to-[#D1B59B] rounded-l-lg cursor-pointer hover:brightness-105 transition-all"
                    onClick={() => setIsMinimized(false)}
                >
                    <div className="flex items-center py-3 pl-3 pr-4 text-[#6D4C41]">
                        <FaAngleLeft className="text-lg mr-2" />
                        <div className="mr-2">
                            <FaReceipt className="text-lg" />
                        </div>
                        <span className="font-medium">Ver detalles</span>
                    </div>
                    {selectedRooms.length > 0 && (
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                            {selectedRooms.length}
                        </div>
                    )}
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.3 }}
                    className="fixed top-0 right-0 z-50 h-screen w-80 shadow-xl overflow-hidden flex flex-col bg-white border-l border-[#E6DCC6]"
                >
                <div className="relative bg-gradient-to-r from-[#E6DCC6] to-[#D1B59B] p-4 pb-5 flex justify-between items-center border-b border-[#D1B59B]">
                    <div className="flex items-center">
                        <FaReceipt className="text-[#6D4C41] mr-2" />
                        <h3 className="font-medium text-[#6D4C41]">
                            Resumen de Precio
                            {selectedRooms.length > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 bg-white text-[#6D4C41] rounded-full text-xs">
                                    {selectedRooms.length}
                                </span>
                            )}
                        </h3>
                    </div>
                    <button 
                        onClick={() => setIsMinimized(true)}
                        className="text-[#6D4C41] hover:text-[#8A6E52] transition-colors duration-200 flex items-center"
                    >
                        <span className="text-xs font-medium mr-1">Minimizar</span>
                        <FaAngleRight className="text-base" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-3 px-4 bg-white">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-[#6D4C41]">Habitaciones seleccionadas</h4>
                        <span className="text-xs font-medium bg-[#E6DCC6] text-[#6D4C41] px-2 py-0.5 rounded-full">
                            {selectedRooms.length} {selectedRooms.length === 1 ? 'habitación' : 'habitaciones'}
                        </span>
                    </div>
                        
                    {/* Si hay habitaciones seleccionadas, siempre mostraremos la lista */}
                    {selectedRooms.length === 0 ? (
                        <div className="text-center p-6 text-gray-400 flex flex-col items-center">
                            <FaBed className="text-gray-400 mb-2" size={24} />
                            Aún no has seleccionado habitaciones
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {detallesHabitaciones.map((habitacion) => (
                                <motion.div 
                                    key={habitacion.letra}
                                    className="p-3 bg-[#F8F5F0] rounded-lg border border-[#E6DCC6] relative overflow-hidden"
                                    animate={{ 
                                        scale: lastUpdated && habitacion.letra === detallesHabitaciones[detallesHabitaciones.length - 1]?.letra ? [1, 1.02, 1] : 1 
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {/* Indicador visual de última actualización */}
                                    {lastUpdated && habitacion.letra === detallesHabitaciones[detallesHabitaciones.length - 1]?.letra && (
                                        <motion.div 
                                            className="absolute inset-0 bg-[#D1B59B]/20" 
                                            initial={{ opacity: 1 }}
                                            animate={{ opacity: 0 }}
                                            transition={{ duration: 1 }}
                                        />
                                    )}
                                    
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="font-medium text-[#8A6E52]">Habitación {habitacion.letra}</span>
                                        <span className="text-xs font-medium text-[#6D4C41] bg-[#E6DCC6] px-2 py-0.5 rounded-full">
                                            ${habitacion.precioPorNoche.toLocaleString('es-MX')}/noche
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-600 flex flex-col space-y-0.5">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400 w-16">Entrada:</span>
                                            <span className="font-medium text-gray-600">{habitacion.fechaEntrada}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400 w-16">Salida:</span>
                                            <span className="font-medium text-gray-600">{habitacion.fechaSalida}</span>
                                        </div>
                                        {habitacion.diasEstancia > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-400 w-16">Estancia:</span>
                                                <span className="font-medium text-gray-600">{habitacion.diasEstancia} {habitacion.diasEstancia === 1 ? 'noche' : 'noches'}</span>
                                            </div>
                                        )}
                                    </div>
                                    {habitacion.diasEstancia > 0 && (
                                        <div className="flex justify-between mt-1.5 pt-1.5 border-t border-[#E6DCC6] text-sm font-medium">
                                            <span className="text-[#6D4C41]">Selección completada</span>
                                            <span className="text-[#6D4C41] flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </span>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                            
                            {/* Botón para añadir más habitaciones */}
                            <button 
                                onClick={onAddRoom}
                                className="w-full p-2 text-sm font-medium text-[#8A6E52] border border-dashed border-[#E6DCC6] rounded-lg hover:bg-[#E6DCC6]/10 transition-colors flex items-center justify-center mt-3"
                                aria-label="Añadir otra habitación"
                            >
                                <FaPlusCircle className="mr-2" />
                                Añadir otra habitación
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="border-t border-[#E6DCC6] p-4 bg-white">
                    <div className="flex justify-between items-center mb-1 text-xs text-gray-500">
                        <span>Subtotal habitaciones:</span>
                        <span>${totalEstimado.toLocaleString('es-MX')} MXN</span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-3 text-xl font-bold text-[#6D4C41]">
                        <span>Total Estimado:</span>
                        <span>${totalEstimado > 0 ? totalEstimado.toLocaleString('es-MX') : selectedRooms.length * 2450} MXN</span>
                    </div>
                    
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-200 mb-3">
                        <div className="flex">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#8A6E52] mr-1 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>
                                Los precios mostrados son estimaciones basadas en las fechas seleccionadas y pueden variar según disponibilidad.
                            </span>
                        </div>
                    </div>
                    
                    <button 
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-[#D1B59B] to-[#A5856A] text-white font-medium rounded-md flex items-center justify-center hover:from-[#A5856A] hover:to-[#8A6E52] transition-all shadow-sm"
                    >
                        <span>Continuar con la reserva</span>
                        <FaChevronRight className="ml-2" />
                    </button>
                </div>
            </motion.div>
            )}
        </AnimatePresence>
    );
};

export default HabitacionPrecioFloating;
