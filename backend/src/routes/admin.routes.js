const express = require('express');
const mongoose = require('mongoose'); // DESCOMENTADO
const ReservaHabitacion = require('../models/ReservaHabitacion'); // DESCOMENTADO
const ReservaEvento = require('../models/ReservaEvento'); // DESCOMENTADO
const TipoEvento = require('../models/TipoEvento'); // DESCOMENTADO
const TipoHabitacion = require('../models/TipoHabitacion'); // <-- AÑADIDO
const User = require('../models/User'); // DESCOMENTADO
const Habitacion = require('../models/Habitacion'); // DESCOMENTADO
const { protectRoute, authorize } = require('../middleware/auth.js'); // DESCOMENTADO
const { getDashboardData } = require('../controllers/dashboardController'); // <-- AÑADIDO

console.log(">>> admin.routes.js - Archivo cargado (Restaurando Paso 2: Requires y Helpers)");

const router = express.Router();

// DESCOMENTADO - Helpers
const parseExcelDate = (excelDate) => {
  if (typeof excelDate === 'number') {
    // Ajuste para la diferencia entre Excel (base 1) y JS Date (base 0) y la diferencia de días
    // JavaScript Date lo trata como días desde 1 Jan 1900
    // Excel para Windows lo trata como días desde 1 Jan 1900 (con error de año bisiesto 1900)
    // Excel para Mac lo trata como días desde 1 Jan 1904
    // Asumimos el formato Windows por defecto
    const SECONDS_IN_DAY = 24 * 60 * 60;
    const excelEpoch = Date.UTC(1899, 11, 30); // 30 Dec 1899 para compensar el día 0 y el error de bisiesto
    const jsDate = new Date(excelEpoch + excelDate * SECONDS_IN_DAY * 1000);
    
    // Corrección potencial de zona horaria - esto asume que la fecha Excel está en UTC
    // y la convierte a la zona horaria del servidor. Ajustar si es necesario.
    // const offset = jsDate.getTimezoneOffset() * 60 * 1000;
    // return new Date(jsDate.getTime() - offset);
    return jsDate; 
  } else if (excelDate instanceof Date) {
    return excelDate;
  } else if (typeof excelDate === 'string') {
    // Intenta parsear formatos comunes si no es un número
    const parsed = new Date(excelDate);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    } 
  }
  // Retorna null o lanza error si no se puede parsear
  console.warn(`No se pudo parsear la fecha de Excel: ${excelDate}`);
  return null; 
};

// Helper para validar formato HH:MM
const isValidTimeFormat = (timeString) => {
    if (typeof timeString !== 'string') return false;
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(timeString);
};
// FIN DESCOMENTADO - Helpers

// RUTA GET DE PRUEBA (ACTIVA)
router.get('/test', (req, res) => {
  console.log(">>> Petición GET recibida en /api/admin/test (prueba en admin.routes)");
  res.status(200).json({ success: true, message: "Ruta GET de prueba /test en admin.routes funciona" });
});

/* // COMENTADO - RUTA POST SIMPLIFICADA
router.post(
  '/bulk-upload', 
  // Middlewares siguen comentados
  (req, res) => { // Handler síncrono y simple
    console.log(">>> Petición POST recibida en /api/admin/bulk-upload (HANDLER SIMPLIFICADO)"); 
    // Devolvemos la estructura mínima que el frontend podría esperar
    res.status(200).json({ 
      success: true, 
      message: "Ruta POST /bulk-upload SIMPLIFICADA funciona!",
      summary: { 
        roomsReceived: req.body?.rooms?.length || 0, roomsAdded: 0, roomErrorsCount: 0,
        eventsReceived: req.body?.events?.length || 0, eventsAdded: 0, eventErrorsCount: 0
      },
      errors: { rooms: [], events: [] } 
    });
  }
);
*/ // FIN COMENTADO - RUTA POST SIMPLIFICADA


// DESCOMENTADO - Bloque POST original completo
router.post(
  '/bulk-upload', 
  protectRoute,
  authorize('admin'),
  async (req, res) => { 
    const { rooms, events } = req.body;
    const results = { 
      rooms: { received: Array.isArray(rooms) ? rooms.length : 0, added: 0, errors: [] }, 
      events: { received: Array.isArray(events) ? events.length : 0, added: 0, errors: [] } 
    };
    const userId = req.user?._id;
        
    if (!userId) {
        return res.status(401).json({ message: 'No autorizado. ID de usuario no encontrado.' });
    }
    
    if ((!Array.isArray(rooms) || rooms.length === 0) && (!Array.isArray(events) || events.length === 0)) { // Permitir subir solo uno
      return res.status(400).json({ message: 'Formato de datos inválido. Se esperan arrays para rooms y/o events.' });
    }
    
    // Inicializar contadores
    results.rooms.received = Array.isArray(rooms) ? rooms.length : 0;
    results.events.received = Array.isArray(events) ? events.length : 0;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // --- Procesar Habitaciones --- 
      if (Array.isArray(rooms)) {
          for (let i = 0; i < rooms.length; i++) {
             const roomData = rooms[i];
             const rowNum = i + 2; // Asumiendo que los datos empiezan en la fila 2 del Excel
             try {
                // --- 1. Leer y Validar Datos Obligatorios --- 
                const habitacionLetra = roomData['Habitación'];
                const tipoHabitacionNombre = roomData['Tipo Habitación'];
                const fechaEntradaRaw = roomData['Fecha Entrada'];
                const fechaSalidaRaw = roomData['Fecha Salida'];
                const precioTotalRaw = roomData['Precio Total'];

                if (!habitacionLetra) throw new Error('Columna "Habitación" (con la letra) es requerida.');
                if (!tipoHabitacionNombre) throw new Error('Columna "Tipo Habitación" es requerida.');
                if (!fechaEntradaRaw) throw new Error('Columna "Fecha Entrada" es requerida.');
                if (!fechaSalidaRaw) throw new Error('Columna "Fecha Salida" es requerida.');
                if (precioTotalRaw === undefined || precioTotalRaw === null) throw new Error('Columna "Precio Total" es requerida.');

                const fechaEntrada = parseExcelDate(fechaEntradaRaw);
                const fechaSalida = parseExcelDate(fechaSalidaRaw);
                if (!fechaEntrada) throw new Error('Formato inválido para "Fecha Entrada".');
                if (!fechaSalida) throw new Error('Formato inválido para "Fecha Salida".');
                if (fechaSalida <= fechaEntrada) throw new Error('La "Fecha Salida" debe ser posterior a la "Fecha Entrada".');

                const precioTotal = parseFloat(precioTotalRaw);
                if (isNaN(precioTotal)) throw new Error('Formato inválido para "Precio Total". Debe ser un número.');

                // --- 2. Buscar Documentos Relacionados --- 
                const habitacionDoc = await Habitacion.findOne({ letra: habitacionLetra }).session(session).lean();
                if (!habitacionDoc) {
                    throw new Error(`Habitación con letra "${habitacionLetra}" no encontrada en el sistema.`);
                }
                const habitacionObjectId = habitacionDoc._id;

                // Flexible TipoHabitacion lookup
                const tipoHabitacionNombreExcel = roomData['Tipo Habitación']; // e.g., "Doble estándar con balcón"
                const categoriaExcel = roomData['Categoría']?.trim(); // e.g., "doble"

                let tipoHabDoc = null;

                // Attempt 1: Find by exact name from 'Tipo Habitación' column
                if (tipoHabitacionNombreExcel) {
                    tipoHabDoc = await TipoHabitacion.findOne({ nombre: tipoHabitacionNombreExcel }).session(session).lean();
                }

                // Attempt 2: If not found and 'Categoría' exists, try finding by 'Categoría' (capitalized)
                if (!tipoHabDoc && categoriaExcel) {
                    const categoriaCapitalized = categoriaExcel.charAt(0).toUpperCase() + categoriaExcel.slice(1).toLowerCase(); // "doble" -> "Doble"
                    console.log(`[Bulk Upload Row ${rowNum}] TipoHabitación not found by exact name '${tipoHabitacionNombreExcel}'. Trying by Categoría '${categoriaCapitalized}'...`); // Add log
                    tipoHabDoc = await TipoHabitacion.findOne({ nombre: categoriaCapitalized }).session(session).lean();
                }
                
                // Check if found after all attempts
                if (!tipoHabDoc) {
                    // Throw a more general error if still not found
                    let errorMsg = `Tipo de habitación no encontrado. `;
                    if (tipoHabitacionNombreExcel) errorMsg += `No se encontró '${tipoHabitacionNombreExcel}'. `;
                    if (categoriaExcel) errorMsg += `Tampoco se encontró por categoría '${categoriaExcel}'.`;
                    throw new Error(errorMsg); 
                    // Original more restrictive error:
                    // throw new Error(`Tipo de habitación "${tipoHabitacionNombre}" no es válido o no existe. Tipos válidos: Sencilla, Doble, Triple, Cuadruple.`);
                }
                const tipoHabitacionId = tipoHabDoc._id;

                // --- 3. Verificar Disponibilidad --- 
                const existingReservation = await ReservaHabitacion.findOne({
                  habitacion: habitacionObjectId,
                  estadoReserva: { $in: ['confirmada', 'pendiente', 'pendiente_pago'] }, // Estados activos
                  fechaEntrada: { $lt: fechaSalida },
                  fechaSalida: { $gt: fechaEntrada }
                }).session(session);

                if (existingReservation) {
                  throw new Error(`Conflicto de fechas. La habitación ${habitacionLetra} ya está reservada entre ${existingReservation.fechaEntrada.toLocaleDateString()} y ${existingReservation.fechaSalida.toLocaleDateString()}.`);
                }

                // --- 4. Leer Datos Opcionales --- 
                const nombreContacto = roomData['Nombre Contacto'] || '';
                const apellidosContacto = roomData['Apellidos Contacto'] || '';
                const emailContacto = roomData['Email Contacto'] || '';
                const telefonoContacto = roomData['Teléfono Contacto'] || '';
                const fechaReservaRaw = roomData['Fecha Reserva'];
                const metodoPago = roomData['Método Pago']?.toLowerCase() || 'pendiente';
                const estadoPago = roomData['Estado Pago']?.toLowerCase() || 'pendiente';
                const estadoReserva = roomData['Estado Reserva']?.toLowerCase() || 'confirmada'; // O 'pendiente'? Revisar default deseado
                const numHuespedesRaw = roomData['Huéspedes'];
                const nombreHuespedesRaw = roomData['Nombre Huéspedes'] || ''; // String crudo
                const notas = roomData['Notas'] || '';
                // const numConfirmacionExcel = roomData['Num Confirmación Hab']; // No usar, dejar que el modelo genere

                const fechaReserva = fechaReservaRaw ? parseExcelDate(fechaReservaRaw) : new Date();
                const numHuespedes = numHuespedesRaw ? parseInt(numHuespedesRaw, 10) : 2; // Default a 2 si no se especifica
                if (isNaN(numHuespedes) || numHuespedes < 1) throw new Error('Valor inválido para "Huéspedes". Debe ser un número positivo.');

                // Procesar nombres de huéspedes: Asumir separados por coma, quitar espacios
                console.log(`[Bulk Upload Row ${rowNum}] Raw 'Nombre Huéspedes':`, nombreHuespedesRaw); // <-- LOG 1
                const nombresHuespedesArray = nombreHuespedesRaw
                                                .split(',')          // Dividir por comas
                                                .map(name => name.trim()) // Quitar espacios en blanco
                                                .filter(name => name);    // Eliminar nombres vacíos
                console.log(`[Bulk Upload Row ${rowNum}] Processed 'nombresHuespedesArray':`, nombresHuespedesArray); // <-- LOG 2

                // --- 5. Construir Objeto para Guardar --- 
                const newRoomReservationData = {
                  habitacion: habitacionObjectId,
                  tipoHabitacion: tipoHabitacionId,
                  fechaEntrada: fechaEntrada,
                  fechaSalida: fechaSalida,
                  precio: precioTotal,
                  nombreContacto: nombreContacto,
                  apellidosContacto: apellidosContacto,
                  emailContacto: emailContacto,
                  telefonoContacto: telefonoContacto,
                  fechaReserva: fechaReserva,
                  metodoPago: metodoPago,
                  estadoPago: estadoPago,
                  estadoReserva: estadoReserva,
                  numHuespedes: numHuespedes, // Usar campo correcto del modelo
                  infoHuespedes: {          // Usar campo correcto del modelo
                      nombres: nombresHuespedesArray, // Array procesado
                      detalles: '' // Añadir detalles si hay columna en Excel
                  },
                  notas: notas,
                  // numeroConfirmacion: Se generará automáticamente por el pre-hook
                  creadoPor: userId, // ID del admin que sube el archivo
                  // Campos adicionales del modelo (opcional si vienen del Excel)
                  numeroHabitaciones: 1, // Asumir 1 si no viene del Excel
                  tipoReserva: 'hotel', // Asumir tipo hotel si no se especifica
                  letraHabitacion: habitacionDoc.letra // Guardar la letra por conveniencia
                  // categoriaHabitacion: ¿Mapear desde tipoHabDoc.nombre? 
                  // Ejemplo: categoriaHabitacion: tipoHabDoc.nombre === 'Sencilla' ? 'sencilla' : 'doble' // Cuidado con otros tipos
                };
                console.log(`[Bulk Upload Row ${rowNum}] Data to save:`, JSON.stringify(newRoomReservationData).substring(0, 500) + '...'); // <-- LOG 3 (truncado)
                
                // --- 6. Validar y Guardar --- 
                const newRoomReservation = new ReservaHabitacion(newRoomReservationData);
                await newRoomReservation.validate(); // Validar contra el Schema
                await newRoomReservation.save({ session });
                results.rooms.added++;
             } catch (error) {
                // Log más detallado del error específico de la fila
                console.error(`[Bulk Upload Row ${rowNum}] ERROR processing room:`, { errorMsg: error.message, rawData: roomData, stack: error.stack?.substring(0, 300) }); // <-- LOG 4 (Error)
                results.rooms.errors.push({ row: rowNum, data: roomData, error: error.message || 'Error desconocido' });
             }
          } // Fin for rooms
      } // Fin if (Array.isArray(rooms))

      // --- Procesar Eventos (similar lógica robusta) --- 
      if (Array.isArray(events)) {
          for (let i = 0; i < events.length; i++) {
            const eventData = events[i];
            const rowNum = i + 2;
            try {
                // *** IMPLEMENTAR LÓGICA ROBUSTA PARA EVENTOS ***
                // 1. Leer y Validar datos obligatorios
                // 2. Buscar TipoEvento por ID o Nombre (MANEJAR AMBOS CASOS)
                // 3. Validar disponibilidad de fecha
                // 4. Leer datos opcionales
                // 5. Construir objeto ReservaEvento
                // 6. Validar y Guardar

                // --- Ejemplo búsqueda TipoEvento --- 
                const tipoEventoIdOrName = eventData['ID o Nombre Tipo Evento'];
                let tipoEventoDoc = null;
                if (mongoose.Types.ObjectId.isValid(tipoEventoIdOrName)) {
                    tipoEventoDoc = await TipoEvento.findById(tipoEventoIdOrName).session(session).lean();
                } else {
                    tipoEventoDoc = await TipoEvento.findOne({ titulo: tipoEventoIdOrName }).session(session).lean();
                }
                if (!tipoEventoDoc) throw new Error(`Tipo de evento no encontrado: ${tipoEventoIdOrName}`);
                // ... resto de la lógica ...
                
                // --- Marcador de posición (reemplazar con lógica real) ---
                // Simulación simple para evitar error "no implementado"
                if (!eventData['Nombre Evento']) throw new Error("Falta Nombre Evento");
                console.warn(`[Excel Import] Procesamiento de Evento Fila ${rowNum} (Lógica aún por implementar completamente)`);
                // results.events.added++; // Descomentar cuando se implemente
                // throw new Error("Procesamiento de eventos aún no implementado"); // Opcional: forzar error hasta que esté listo

            } catch (error) {
                console.error(`Error procesando evento fila ${rowNum}:`, eventData, error);
                results.events.errors.push({ row: rowNum, data: eventData, error: error.message || 'Error desconocido' });
            }
          } // Fin for events
      } // Fin if (Array.isArray(events))

      // --- Finalizar Transacción --- 
      if (results.rooms.errors.length > 0 || results.events.errors.length > 0) {
         // Si hubo algún error en CUALQUIER fila, abortar toda la transacción
         // Podrías decidir hacer commit parcial si prefieres, pero abortar es más seguro
         // para evitar datos inconsistentes.
         console.warn('Errores detectados durante la subida. Abortando transacción.');
         await session.abortTransaction(); 
         // Nota: No lanzar error aquí necesariamente, la respuesta indicará los errores.
      } else {
         // Si no hubo errores, confirmar la transacción
         await session.commitTransaction();
         console.log('Transacción completada exitosamente.');
      }

    } catch (error) {
      // Error general durante la transacción (ej. problema de conexión, error no capturado antes)
      console.error('Error durante la transacción de subida masiva:', error);
      await session.abortTransaction();
      // Devolver un error 500 genérico, los errores específicos ya están en results.errors
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor durante el procesamiento del archivo.',
        summary: results, // Enviar el resumen parcial si es útil
        errors: { rooms: results.rooms.errors, events: results.events.errors } // Enviar errores detallados
      });
    } finally {
      session.endSession();
    }

    // --- Enviar Respuesta --- 
    // Determinar el estado de la respuesta basado en si hubo errores
    const statusCode = (results.rooms.errors.length > 0 || results.events.errors.length > 0) ? 400 : 200;
    const successStatus = statusCode === 200;
    let responseMessage = successStatus 
      ? 'Archivo procesado exitosamente.' 
      : 'Archivo procesado con errores.';
      
    if(results.rooms.added === 0 && results.events.added === 0 && (results.rooms.errors.length > 0 || results.events.errors.length > 0)) {
        responseMessage = 'No se pudo añadir ninguna entrada debido a errores.';
    } else if (results.rooms.errors.length > 0 || results.events.errors.length > 0) {
        responseMessage = `Se añadieron ${results.rooms.added} habitaciones y ${results.events.added} eventos, pero se encontraron errores en otras filas.`;
    }

    res.status(statusCode).json({
      success: successStatus,
      message: responseMessage,
      summary: {
        roomsReceived: results.rooms.received,
        roomsAdded: results.rooms.added,
        roomErrorsCount: results.rooms.errors.length,
        eventsReceived: results.events.received,
        eventsAdded: results.events.added, // Actualizar cuando se implemente
        eventErrorsCount: results.events.errors.length
      },
      // Devolver los errores detallados
      errors: { 
        rooms: results.rooms.errors,
        events: results.events.errors
      }
    });
  }
);
// FIN DESCOMENTADO - Bloque POST original completo

// RUTA GET PARA DASHBOARD (ACTIVA)
router.get('/dashboard-data', protectRoute, authorize('admin'), getDashboardData);

console.log(">>> admin.routes.js - Antes de module.exports (Restaurando Paso 4: Lógica POST completa)");
module.exports = router; 