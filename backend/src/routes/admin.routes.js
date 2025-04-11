const express = require('express');
const mongoose = require('mongoose');
const ReservaHabitacion = require('../models/ReservaHabitacion');
const ReservaEvento = require('../models/ReservaEvento');
const TipoEvento = require('../models/TipoEvento'); // Importar modelo TipoEvento
const User = require('../models/User'); // Importar modelo User
// Importar middleware de autenticación
const { protectRoute, authorize } = require('../middleware/auth.js'); // Corregir nombres de funciones importadas

const router = express.Router();

// Helper para parsear fechas de Excel (considera zona horaria y formatos)
// Excel almacena fechas como números de días desde 1900 o 1904.
// Esta función es una simplificación, puede necesitar ajustes.
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

// POST /api/admin/bulk-upload
// Aplicar middlewares de autenticación y autorización con los nombres correctos
router.post('/bulk-upload', protectRoute, authorize('admin'), async (req, res) => { // Usar protectRoute y authorize('admin')
  const { rooms, events } = req.body;
  const results = { 
      rooms: { received: Array.isArray(rooms) ? rooms.length : 0, added: 0, errors: [] }, 
      events: { received: Array.isArray(events) ? events.length : 0, added: 0, errors: [] } 
  };
  const userId = req.user?._id; // Obtener ID del admin autenticado

  if (!userId) {
      return res.status(401).json({ message: 'No autorizado. ID de usuario no encontrado.' });
  }

  if (!Array.isArray(rooms) || !Array.isArray(events)) {
    return res.status(400).json({ message: 'Formato de datos inválido. Se esperan arrays para rooms y events.' });
  }
  
  // Agregar received count al inicio
  results.rooms.received = rooms.length;
  results.events.received = events.length;


  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // --- Procesar Habitaciones --- 
    for (let i = 0; i < rooms.length; i++) {
      const roomData = rooms[i];
      const rowNum = i + 2; // Asumiendo que la fila 1 es encabezado en Excel
      try {
        // *** AJUSTA los nombres de las columnas del Excel aquí ***
        const habitacion = roomData['Habitación'];
        const tipoHabitacion = roomData['Tipo Habitación'];
        const fechaEntradaRaw = roomData['Fecha Entrada'];
        const fechaSalidaRaw = roomData['Fecha Salida'];
        const precioRaw = roomData['Precio Total'];
        const nombreContacto = roomData['Nombre Contacto'];
        const apellidosContacto = roomData['Apellidos Contacto'];
        const emailContacto = roomData['Email Contacto'];
        const telefonoContacto = roomData['Teléfono Contacto'];

        // --- Validación Robusta Habitación ---
        if (!habitacion) throw new Error('Columna "Habitación" es requerida.');
        if (!tipoHabitacion) throw new Error('Columna "Tipo Habitación" es requerida.');
        if (!fechaEntradaRaw) throw new Error('Columna "Fecha Entrada" es requerida.');
        if (!fechaSalidaRaw) throw new Error('Columna "Fecha Salida" es requerida.');
        if (precioRaw === undefined || precioRaw === null) throw new Error('Columna "Precio Total" es requerida.');
        if (isNaN(parseFloat(precioRaw)) || parseFloat(precioRaw) < 0) throw new Error('Columna "Precio Total" debe ser un número positivo.');
        
        const fechaEntrada = parseExcelDate(fechaEntradaRaw);
        const fechaSalida = parseExcelDate(fechaSalidaRaw);
        const fechaReserva = roomData['Fecha Reserva'] ? parseExcelDate(roomData['Fecha Reserva']) : new Date();

        if (!fechaEntrada) throw new Error('Formato inválido para "Fecha Entrada".');
        if (!fechaSalida) throw new Error('Formato inválido para "Fecha Salida".');
        if (fechaSalida <= fechaEntrada) throw new Error('"Fecha Salida" debe ser posterior a "Fecha Entrada".');
        
        const metodoPago = roomData['Método Pago']?.toLowerCase();
        const estadoPago = roomData['Estado Pago']?.toLowerCase();
        const estadoReserva = roomData['Estado Reserva']?.toLowerCase() || 'confirmada';
        const tipoReserva = roomData['Tipo Reserva']?.toLowerCase();
        const categoriaHabitacion = roomData['Categoría']?.toLowerCase();

        if (metodoPago && !['efectivo', 'tarjeta', 'transferencia', 'pendiente'].includes(metodoPago)) throw new Error('Valor inválido para "Método Pago".');
        if (estadoPago && !['pendiente', 'procesando', 'completado', 'fallido', 'reembolsado'].includes(estadoPago)) throw new Error('Valor inválido para "Estado Pago".');
        if (estadoReserva && !['pendiente', 'confirmada', 'cancelada', 'completada'].includes(estadoReserva)) throw new Error('Valor inválido para "Estado Reserva".');
        if (tipoReserva && !['hotel', 'evento'].includes(tipoReserva)) throw new Error('Valor inválido para "Tipo Reserva". Debe ser "hotel" o "evento".');
        if (categoriaHabitacion && !['sencilla', 'doble'].includes(categoriaHabitacion)) throw new Error('Valor inválido para "Categoría". Debe ser "sencilla" o "doble".');

        const numHab = roomData['Num Hab'] ? parseInt(roomData['Num Hab'], 10) : 1;
        const numHuespedes = roomData['Huéspedes'] ? parseInt(roomData['Huéspedes'], 10) : 1; // Default a 1 si no se especifica
        if (isNaN(numHab) || numHab < 1) throw new Error('"Num Hab" debe ser un número mayor o igual a 1.');
        if (isNaN(numHuespedes) || numHuespedes < 1) throw new Error('"Huéspedes" debe ser un número mayor o igual a 1.');


        const newRoomReservation = new ReservaHabitacion({
          habitacion: habitacion,
          tipoHabitacion: tipoHabitacion,
          fechaEntrada: fechaEntrada,
          fechaSalida: fechaSalida,
          numeroHabitaciones: numHab,
          numHuespedes: numHuespedes,
          nombreHuespedes: roomData['Nombre Huéspedes'] || '', // Default a ''
          precio: parseFloat(precioRaw),
          nombreContacto: nombreContacto,
          apellidosContacto: apellidosContacto,
          emailContacto: emailContacto,
          telefonoContacto: telefonoContacto,
          metodoPago: metodoPago || 'pendiente',
          estadoPago: estadoPago || 'pendiente',
          estadoReserva: estadoReserva,
          fechaReserva: fechaReserva,
          tipoReserva: tipoReserva === 'evento' ? 'evento' : 'hotel',
          creadoPor: userId, // Asignar admin autenticado
          notas: roomData['Notas'],
          categoriaHabitacion: categoriaHabitacion || 'doble', // Default a 'doble' si no se especifica
          precioPorNoche: roomData['Precio Noche'] ? parseFloat(roomData['Precio Noche']) : undefined, // Solo si existe y es número
          letraHabitacion: roomData['Letra Hab'],
          numeroConfirmacion: roomData['Num Confirmación Hab'] 
        });

        // Ejecutar validaciones de Mongoose explícitamente
        await newRoomReservation.validate(); 

        await newRoomReservation.save({ session });
        results.rooms.added++;
      } catch (error) {
        console.error(`Error procesando habitación fila ${rowNum}:`, roomData, error);
        results.rooms.errors.push({ 
            row: rowNum,
            data: roomData, 
            error: error.message || 'Error desconocido al guardar habitación' 
        });
      }
    }

    // --- Procesar Eventos --- 
    for (let i = 0; i < events.length; i++) {
       const eventData = events[i];
       const rowNum = i + 2; // Asumiendo encabezado en fila 1
       try {
        // *** AJUSTA los nombres de las columnas del Excel aquí ***
        const nombreContacto = eventData['Nombre Contacto'];
        const apellidosContacto = eventData['Apellidos Contacto'];
        const emailContacto = eventData['Email Contacto'];
        const telefonoContacto = eventData['Teléfono Contacto'];
        const fechaEventoRaw = eventData['Fecha Evento'];
        const precioRaw = eventData['Precio Evento'];
        const tipoEventoIdOrName = eventData['ID o Nombre Tipo Evento']; // Columna puede tener ID o nombre
        const nombreEvento = eventData['Nombre Evento'];
        const horaInicio = eventData['Hora Inicio'];
        const horaFin = eventData['Hora Fin'];
        const numInvitadosRaw = eventData['Num Invitados'];
        const espacio = eventData['Espacio']?.toLowerCase();

        // --- Validación Robusta Evento ---
        if (!nombreContacto) throw new Error('Columna "Nombre Contacto" es requerida.');
        if (!apellidosContacto) throw new Error('Columna "Apellidos Contacto" es requerida.');
        if (!emailContacto) throw new Error('Columna "Email Contacto" es requerida.');
        if (!telefonoContacto) throw new Error('Columna "Teléfono Contacto" es requerida.');
        if (!fechaEventoRaw) throw new Error('Columna "Fecha Evento" es requerida.');
        if (precioRaw === undefined || precioRaw === null) throw new Error('Columna "Precio Evento" es requerida.');
        if (isNaN(parseFloat(precioRaw)) || parseFloat(precioRaw) < 0) throw new Error('Columna "Precio Evento" debe ser un número positivo.');
        if (!tipoEventoIdOrName) throw new Error('Columna "ID o Nombre Tipo Evento" es requerida.');
        if (!nombreEvento) throw new Error('Columna "Nombre Evento" es requerido.');
        if (!horaInicio) throw new Error('Columna "Hora Inicio" es requerida.');
        if (!horaFin) throw new Error('Columna "Hora Fin" es requerida.');
        if (!isValidTimeFormat(horaInicio)) throw new Error('Formato inválido para "Hora Inicio" (debe ser HH:MM).');
        if (!isValidTimeFormat(horaFin)) throw new Error('Formato inválido para "Hora Fin" (debe ser HH:MM).');
        if (!numInvitadosRaw) throw new Error('Columna "Num Invitados" es requerida.');
        const numInvitados = parseInt(numInvitadosRaw, 10);
        if (isNaN(numInvitados) || numInvitados < 1) throw new Error('"Num Invitados" debe ser un número mayor o igual a 1.'); // Ajustar mínimo si es necesario (modelo dice 10?)
        if (!espacio) throw new Error('Columna "Espacio" es requerida.');
        if (!['salon', 'jardin', 'terraza'].includes(espacio)) throw new Error('Valor inválido para "Espacio". Debe ser "salon", "jardin" o "terraza".');

        // Validar horas
        const inicioMinutos = parseInt(horaInicio.split(':')[0], 10) * 60 + parseInt(horaInicio.split(':')[1], 10);
        const finMinutos = parseInt(horaFin.split(':')[0], 10) * 60 + parseInt(horaFin.split(':')[1], 10);
        if (finMinutos <= inicioMinutos) throw new Error('"Hora Fin" debe ser posterior a "Hora Inicio".');

        const fechaEvento = parseExcelDate(fechaEventoRaw);
        if (!fechaEvento) throw new Error('Formato inválido para "Fecha Evento".');

        // Buscar TipoEvento por ID (preferido) o por nombre
        let tipoEventoObj = null;
        if (mongoose.Types.ObjectId.isValid(tipoEventoIdOrName)) {
             tipoEventoObj = await TipoEvento.findById(tipoEventoIdOrName).session(session);
             if (!tipoEventoObj) throw new Error(`Tipo de evento con ID "${tipoEventoIdOrName}" no encontrado.`);
        } else {
            // Si no es un ID válido, buscar por nombre (case-insensitive)
            tipoEventoObj = await TipoEvento.findOne({ nombre: { $regex: new RegExp(`^${tipoEventoIdOrName}$`, 'i') } }).session(session);
             if (!tipoEventoObj) throw new Error(`Tipo de evento con nombre "${tipoEventoIdOrName}" no encontrado.`);
        }


        const estadoReserva = eventData['Estado Reserva Evento']?.toLowerCase() || 'confirmada';
        const metodoPago = eventData['Método Pago Evento']?.toLowerCase() || 'pendiente';
        if (estadoReserva && !['pendiente', 'confirmada', 'pagada', 'cancelada', 'completada'].includes(estadoReserva)) throw new Error('Valor inválido para "Estado Reserva Evento".');
        if (metodoPago && !['tarjeta', 'transferencia', 'efectivo', 'pendiente'].includes(metodoPago)) throw new Error('Valor inválido para "Método Pago Evento".');


        const newEventReservation = new ReservaEvento({
          nombreContacto: nombreContacto,
          apellidosContacto: apellidosContacto,
          emailContacto: emailContacto,
          telefonoContacto: telefonoContacto,
          fecha: fechaEvento,
          estadoReserva: estadoReserva,
          precio: parseFloat(precioRaw),
          metodoPago: metodoPago,
          adelanto: eventData['Adelanto Evento'] ? parseFloat(eventData['Adelanto Evento']) : 0,
          peticionesEspeciales: eventData['Peticiones Evento'],
          // --- Campos específicos de Evento ---
          tipoEvento: tipoEventoObj._id, // Usar el ID encontrado
          nombreEvento: nombreEvento,
          horaInicio: horaInicio, 
          horaFin: horaFin,     
          numInvitados: numInvitados,
          espacioSeleccionado: espacio, 
          creadoPor: userId, // Asignar admin
          numeroConfirmacion: eventData['Num Confirmación Evento'] 
          // serviciosContratados: [...] // Mapear servicios si vienen en el Excel
        });

        // Validar explícitamente
        await newEventReservation.validate();

        await newEventReservation.save({ session });
        results.events.added++;
      } catch (error) {
        console.error(`Error procesando evento fila ${rowNum}:`, eventData, error);
        results.events.errors.push({ 
            row: rowNum,
            data: eventData, 
            error: error.message || 'Error desconocido al guardar evento' 
        });
      }
    }

    // Si hubo errores en alguna inserción, aborta la transacción
    if (results.rooms.errors.length > 0 || results.events.errors.length > 0) {
       // Lanzar error para que sea capturado por el catch general y se haga rollback
       // El mensaje indicará que hubo errores y no se guardó nada.
       throw new Error(`Se encontraron ${results.rooms.errors.length + results.events.errors.length} errores durante la importación. Ningún dato fue guardado.`);
    }

    // Si todo fue bien, confirma la transacción
    await session.commitTransaction();
    res.status(200).json({
      message: 'Datos importados con éxito.',
      summary: {
        roomsReceived: results.rooms.received,
        roomsAdded: results.rooms.added,
        roomErrorsCount: results.rooms.errors.length, // Cambiado nombre para claridad
        eventsReceived: results.events.received,
        eventsAdded: results.events.added,
        eventErrorsCount: results.events.errors.length // Cambiado nombre para claridad
      },
      // Devolver arrays vacíos si no hubo errores
      errors: { 
          rooms: results.rooms.errors,
          events: results.events.errors
      }
    });

  } catch (error) {
    // Abortar transacción si no se ha hecho ya (por el throw dentro del try)
    if (session.inTransaction()) {
        await session.abortTransaction();
    }
    console.error('Error en la transacción bulk upload:', error);
    // Devolver un resumen con los errores encontrados hasta el momento del fallo
    res.status(500).json({ 
        message: error.message || 'Error interno del servidor al procesar el archivo.',
        summary: { 
            roomsReceived: results.rooms.received,
            roomsAdded: results.rooms.added,
            roomErrorsCount: results.rooms.errors.length,
            eventsReceived: results.events.received,
            eventsAdded: results.events.added,
            eventErrorsCount: results.events.errors.length
        },
        // Devuelve los errores acumulados
        errors: { 
            rooms: results.rooms.errors,
            events: results.events.errors
        }
    });
  } finally {
    // Siempre finalizar la sesión
    await session.endSession();
  }
});

module.exports = router; 