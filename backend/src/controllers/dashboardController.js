const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const ReservaHabitacion = require('../models/ReservaHabitacion');
const ReservaEvento = require('../models/ReservaEvento');
// Importar otros modelos si se necesitan para populate, ej: Habitacion, User, TipoEvento
const Habitacion = require('../models/Habitacion');
const User = require('../models/User');
const TipoEvento = require('../models/TipoEvento');
const mongoose = require('mongoose'); // Importar mongoose para ObjectId check

/**
 * @desc    Obtener todos los datos necesarios para el dashboard de administración
 * @route   GET /api/reservas
 * @access  Private (Admin, Recepcionista)
 * @version Optimizada con carga masiva y mapas
 */
exports.getDashboardData = asyncHandler(async (req, res, next) => {
  const excludedStates = ['completada', 'completado'];
  // Placeholders con estructura completa
  const placeholderInvalidHabitacion = { _id: null, letra: '?', nombre: 'Inválida/Antigua', tipo: 'Desconocido' };
  const placeholderInvalidEventoRef = { _id: null, nombreEvento: 'Evento Inválido/No Encontrado', fecha: null };
  const placeholderInvalidTipoEvento = { _id: null, nombre: 'Tipo Inválido/No Encontrado', titulo: 'Inválido' };
  const placeholderInvalidReservaHabRef = { _id: null, habitacion: null, fechaEntrada: null, fechaSalida: null }; // Placeholder para reserva referenciada
  const placeholderInvalidUser = { _id: null, nombre: 'Usuario Desc.', apellidos: '', email: '' }; // <<< Placeholder para User >>>
  const placeholderInvalidAdmin = { _id: null, nombre: 'Admin Desc.', apellidos: '', email: '' }; // <<< Placeholder para Admin asignado >>>

  try {
    // Calcular la fecha de hace SEIS días (para excluir el séptimo día)
    const hoy = new Date();
    const fechaDesdeHaceSeisDias = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 6); // <-- Cambiado de 7 a 6
    fechaDesdeHaceSeisDias.setHours(0, 0, 0, 0); // Ajustar a medianoche

    // --- 1. Carga Inicial (sin populate) ---
    const rawReservasHabitacion = await ReservaHabitacion.find({ 
        estadoReserva: { $nin: excludedStates },
        fechaSalida: { $gte: fechaDesdeHaceSeisDias } // <<< Usar el nuevo cálculo de fecha
      })
      .select('_id fechaEntrada fechaSalida estadoReserva habitacion reservaEvento nombreContacto apellidosContacto usuario asignadoA') // Seleccionar campos necesarios + referencias
      .lean();

    const rawReservasEvento = await ReservaEvento.find({
        estadoReserva: { $nin: excludedStates },
        fecha: { $gte: fechaDesdeHaceSeisDias } // <<< Usar el nuevo cálculo de fecha
      })
      .select('_id fecha fechaFin estadoReserva tipoEvento serviciosAdicionales nombreEvento nombreContacto apellidosContacto usuario asignadoA') // Seleccionar campos necesarios + referencias
      .lean();

    // --- 2. Recolectar IDs Válidos --- 
    const habitacionIds = new Set();
    const eventoRefIds = new Set(); // IDs de ReservaEvento referenciados desde ReservaHabitacion
    const tipoEventoIds = new Set();
    const reservaHabRefIds = new Set(); // IDs de ReservaHabitacion referenciados desde servicios de ReservaEvento
    const userIds = new Set(); // <<< Set para User IDs (clientes) >>>
    const adminIds = new Set(); // <<< NUEVO Set para Admin IDs (asignados) >>>

    rawReservasHabitacion.forEach(r => {
      if (r.habitacion && mongoose.Types.ObjectId.isValid(r.habitacion)) {
        habitacionIds.add(r.habitacion.toString());
      }
      if (r.reservaEvento && mongoose.Types.ObjectId.isValid(r.reservaEvento)) {
        eventoRefIds.add(r.reservaEvento.toString());
      }
      if (r.usuario && mongoose.Types.ObjectId.isValid(r.usuario)) {
        userIds.add(r.usuario.toString());
      }
      // <<< Recolectar Admin ID >>>
      if (r.asignadoA && mongoose.Types.ObjectId.isValid(r.asignadoA)) {
        adminIds.add(r.asignadoA.toString());
      }
    });

    rawReservasEvento.forEach(r => {
      if (r.tipoEvento && mongoose.Types.ObjectId.isValid(r.tipoEvento)) {
        tipoEventoIds.add(r.tipoEvento.toString());
      }
      if (r.serviciosAdicionales?.habitaciones) {
        r.serviciosAdicionales.habitaciones.forEach(h => {
          if (h.reservaHabitacionId && mongoose.Types.ObjectId.isValid(h.reservaHabitacionId)) {
            reservaHabRefIds.add(h.reservaHabitacionId.toString());
          }
        });
      }
      if (r.usuario && mongoose.Types.ObjectId.isValid(r.usuario)) {
        userIds.add(r.usuario.toString());
      }
       // <<< Recolectar Admin ID >>>
      if (r.asignadoA && mongoose.Types.ObjectId.isValid(r.asignadoA)) {
        adminIds.add(r.asignadoA.toString());
      }
    });
    
    // --- 2b. Recolectar IDs de Habitación desde las Reservas de Habitación referenciadas ---
    // Necesitamos los IDs de habitación *dentro* de las reservas referenciadas por eventos
    let habitacionIdsFromEventRefs = new Set();
    if (reservaHabRefIds.size > 0) {
        const reservasHabReferenciadas = await ReservaHabitacion.find({
            _id: { $in: [...reservaHabRefIds].map(id => new mongoose.Types.ObjectId(id)) }
        })
        .select('habitacion') // Solo necesitamos el ID de la habitación
        .lean();

        reservasHabReferenciadas.forEach(r => {
            if (r.habitacion && mongoose.Types.ObjectId.isValid(r.habitacion)) {
                habitacionIdsFromEventRefs.add(r.habitacion.toString());
            }
        });
    }

    // Unir todos los IDs de habitación necesarios
    const allHabitacionIds = new Set([...habitacionIds, ...habitacionIdsFromEventRefs]);

    // --- 3. Búsquedas Masivas --- 
    // Combinar User IDs y Admin IDs para una sola búsqueda eficiente
    const allUserAndAdminIds = new Set([...userIds, ...adminIds]);

    const [habitacionesData, eventoRefData, tipoEventoData, reservasHabRefData, allUsersData] = await Promise.all([
      allHabitacionIds.size > 0 ? Habitacion.find({ _id: { $in: [...allHabitacionIds].map(id => new mongoose.Types.ObjectId(id)) } }).select('_id letra nombre tipo').lean() : Promise.resolve([]),
      eventoRefIds.size > 0 ? ReservaEvento.find({ _id: { $in: [...eventoRefIds].map(id => new mongoose.Types.ObjectId(id)) } }).select('_id nombreEvento fecha').lean() : Promise.resolve([]),
      tipoEventoIds.size > 0 ? TipoEvento.find({ _id: { $in: [...tipoEventoIds].map(id => new mongoose.Types.ObjectId(id)) } }).select('_id titulo nombre').lean() : Promise.resolve([]),
      reservaHabRefIds.size > 0 ? ReservaHabitacion.find({ _id: { $in: [...reservaHabRefIds].map(id => new mongoose.Types.ObjectId(id)) } }).select('_id habitacion fechaEntrada fechaSalida estadoReserva letraHabitacion').lean() : Promise.resolve([]),
      allUserAndAdminIds.size > 0 ? User.find({ _id: { $in: [...allUserAndAdminIds].map(id => new mongoose.Types.ObjectId(id)) } }).select('_id nombre apellidos email').lean() : Promise.resolve([])
    ]);

    // <<< NUEVO LOG: Verificar datos de TipoEvento recuperados >>>
    // console.log('[Dashboard] Datos TipoEvento recuperados (primeros 5):', tipoEventoData.slice(0, 5));
    // <<< FIN NUEVO LOG >>>
    // <<< NUEVO LOG: Verificar datos de User/Admin recuperados >>>
    // console.log('[Dashboard] Datos User/Admin recuperados (primeros 5):', allUsersData.slice(0, 5));
    // <<< FIN NUEVO LOG >>>

    // --- 4. Crear Mapas --- 
    const habitacionesMap = new Map(habitacionesData.map(h => [h._id.toString(), h]));
    const eventoRefMap = new Map(eventoRefData.map(e => [e._id.toString(), e]));
    const tipoEventoMap = new Map(tipoEventoData.map(t => [t._id.toString(), t]));
    const reservasHabRefMap = new Map(reservasHabRefData.map(r => [r._id.toString(), r]));
    // <<< Mapa unificado para usuarios y admins >>>
    const allUsersMap = new Map(allUsersData.map(u => [u._id.toString(), u]));

    // --- 5. Procesamiento Final --- 
    const processedReservasHabitacion = rawReservasHabitacion.map(r => {
      let habitacionDetails; // Declarar fuera para que esté disponible en todos los casos
      
      // Intenta buscar por ObjectId si es válido
      if (r.habitacion && mongoose.Types.ObjectId.isValid(r.habitacion)) {
        const foundHabitacion = habitacionesMap.get(r.habitacion.toString());
        if (foundHabitacion) {
             // Encontrado por ObjectId (caso esperado)
             habitacionDetails = { ...placeholderInvalidHabitacion, ...foundHabitacion };
        } else {
            // ObjectId válido pero no encontrado en el mapa (raro, podría ser un dato huérfano)
            // console.warn(`[Dashboard][Hab ${r._id}] ObjectId habitación '${r.habitacion}' válido pero no encontrado en mapa. Usando placeholder.`);
            habitacionDetails = placeholderInvalidHabitacion;
        }
      } 
      // Si no es ObjectId válido, PERO es un string (probablemente la letra)
      else if (r.habitacion && typeof r.habitacion === 'string') { 
        // console.log(`[Dashboard][Hab ${r._id}] Campo 'habitacion' no es ObjectId, intentando buscar por letra: '${r.habitacion}'...`);
        // Fallback: Buscar por letra en el array original `habitacionesData`
        const foundHabitacionByLetter = habitacionesData.find(h => h.letra?.toUpperCase() === r.habitacion.toUpperCase());
        if (foundHabitacionByLetter) {
            // Encontrado por letra (fallback exitoso)
            // console.log(`[Dashboard][Hab ${r._id}] Fallback exitoso: Encontrada habitación por letra '${r.habitacion}'.`);
            habitacionDetails = { ...placeholderInvalidHabitacion, ...foundHabitacionByLetter };
        } else {
             // No encontrado ni por ObjectId ni por letra
             // console.warn(`[Dashboard][Hab ${r._id}] Fallback fallido: No se encontró habitación con letra '${r.habitacion}'. Usando placeholder.`);
             habitacionDetails = placeholderInvalidHabitacion;
        }
      } 
      // Caso por defecto: r.habitacion no existe o no es ni ObjectId ni string
      else { 
        if (r.habitacion) { // Loguear si había algo pero no era manejable
            // console.warn(`[Dashboard][Hab ${r._id}] Valor inesperado en campo 'habitacion' (${typeof r.habitacion}): ${r.habitacion}. Usando placeholder.`);
        }
        habitacionDetails = placeholderInvalidHabitacion;
      }

      let reservaEventoDetails = null; // Default a null si no hay referencia
      if (r.reservaEvento) {
          if (mongoose.Types.ObjectId.isValid(r.reservaEvento)) {
              const foundEvent = eventoRefMap.get(r.reservaEvento.toString());
              if (foundEvent) {
                  reservaEventoDetails = { ...placeholderInvalidEventoRef, ...foundEvent }; // Asegurar estructura
              } else {
                  // console.warn(`[Dashboard][Hab->EvRef] ID evento '${r.reservaEvento}' no encontrado en mapa para R.Hab ${r._id}. Usando placeholder.`);
                  reservaEventoDetails = placeholderInvalidEventoRef;
              }
          } else {
              // console.warn(`[Dashboard][Hab->EvRef] ID evento inválido ('${r.reservaEvento}') en R.Hab ${r._id}. Usando placeholder.`);
              reservaEventoDetails = placeholderInvalidEventoRef;
          }
      }
      
      let usuarioDetails = placeholderInvalidUser;
      if (r.usuario && mongoose.Types.ObjectId.isValid(r.usuario)) {
        const foundUser = allUsersMap.get(r.usuario.toString());
        if (foundUser) {
          usuarioDetails = { ...placeholderInvalidUser, ...foundUser };
        } else {
          // console.warn(`[Dashboard][Hab->User] ID usuario '${r.usuario}' no encontrado en mapa para R.Hab ${r._id}.`);
          // usuarioDetails ya es placeholder
        }
      } else if (r.usuario) {
         // console.warn(`[Dashboard][Hab->User] ID usuario inválido ('${r.usuario}') en R.Hab ${r._id}.`);
         // usuarioDetails ya es placeholder
      }
      
      // <<< Procesar Admin Asignado >>>
      let asignadoADetails = null; // Default a null si no está asignado
      if (r.asignadoA) {
        if (mongoose.Types.ObjectId.isValid(r.asignadoA)) {
            const foundAdmin = allUsersMap.get(r.asignadoA.toString());
            if (foundAdmin) {
                asignadoADetails = { ...placeholderInvalidAdmin, ...foundAdmin }; // Asegurar estructura
            } else {
                // console.warn(`[Dashboard][Hab->Admin] ID admin '${r.asignadoA}' no encontrado en mapa para R.Hab ${r._id}. Usando placeholder.`);
                asignadoADetails = placeholderInvalidAdmin; // Usar placeholder si no se encuentra (raro)
            }
        } else {
            // console.warn(`[Dashboard][Hab->Admin] ID admin inválido ('${r.asignadoA}') en R.Hab ${r._id}. Usando placeholder.`);
            asignadoADetails = placeholderInvalidAdmin; // Usar placeholder si el ID es inválido
        }
      }
      // <<< Fin Procesar Admin Asignado >>>

      return { 
          ...r, 
          habitacion: r.habitacion, // Mantener ID original
          reservaEvento: r.reservaEvento, // Mantener ID original
          usuario: r.usuario, // Mantener ID original de usuario
          asignadoA: r.asignadoA, // <<< Mantener ID original de asignadoA >>>
          habitacionDetails, 
          reservaEventoDetails, 
          usuarioDetails, // <<< Detalles de usuario cliente >>>
          asignadoADetails, // <<< NUEVO: Detalles del admin asignado >>>
          tipo: 'habitacion', 
          nombreContacto: r.nombreContacto,
          apellidosContacto: r.apellidosContacto
      };
    });

    const processedReservasEvento = rawReservasEvento.map(r => {
        let tipoEventoDetails;
        if (r.tipoEvento && mongoose.Types.ObjectId.isValid(r.tipoEvento)) {
            const foundTipo = tipoEventoMap.get(r.tipoEvento.toString());
            if (foundTipo) {
                tipoEventoDetails = foundTipo;
            } else {
                 // console.warn(`[Dashboard][Ev->TipoEv] ID tipoEvento '${r.tipoEvento}' no encontrado en mapa para R.Ev ${r._id}. Usando placeholder.`);
                 tipoEventoDetails = placeholderInvalidTipoEvento;
            }
        } else {
            if (r.tipoEvento) { // Log solo si había ID pero era inválido
                // console.warn(`[Dashboard][Ev->TipoEv] ID tipoEvento inválido ('${r.tipoEvento}') en R.Ev ${r._id}. Usando placeholder.`);
            }
            tipoEventoDetails = placeholderInvalidTipoEvento;
        }

        let processedServiciosHabitaciones = [];
        if (r.serviciosAdicionales?.habitaciones) {
            processedServiciosHabitaciones = r.serviciosAdicionales.habitaciones.map((h, index) => {
                // <<< LOG INICIO PROCESAMIENTO HABITACIÓN DE SERVICIO >>>
                // console.log(`[Dashboard][Ev ${r._id}][ServHab ${index}] Procesando servicio hab: ID Ref=${h.reservaHabitacionId}`);
                // <<< FIN LOG >>>

                let letraHab = '?';
                let reservaHabDetails = placeholderInvalidReservaHabRef; // Start with placeholder
                
                if (h.reservaHabitacionId && mongoose.Types.ObjectId.isValid(h.reservaHabitacionId)) {
                        const reservaHabRef = reservasHabRefMap.get(h.reservaHabitacionId.toString());
                        if (reservaHabRef) {
                        // <<< LOG RESERVA HAB ENCONTRADA >>>
                        // console.log(`[Dashboard][Ev ${r._id}][ServHab ${index}] ReservaHab Ref encontrada (ID: ${h.reservaHabitacionId}):`, reservaHabRef);
                        // <<< FIN LOG >>>

                        // Found the referenced ReservaHabitacion document
                        reservaHabDetails = { ...placeholderInvalidReservaHabRef, ...reservaHabRef }; // Use its details

                        // <<< CORRECCIÓN: Usar letraHabitacion de la reserva referenciada >>>
                        letraHab = reservaHabRef.letraHabitacion || '?'; 
                        
                        // Ya no necesitamos el fallback complejo anterior basado en el campo 'habitacion'
                        /* 
                        let habitacionDeReservaRef = reservaHabRef.habitacion; 
                        if (habitacionDeReservaRef && mongoose.Types.ObjectId.isValid(habitacionDeReservaRef)) {
                           const habRealDetails = habitacionesMap.get(habitacionDeReservaRef.toString());
                           letraHab = habRealDetails?.letra || '?';
                        } else {
                            console.log(`[Dashboard][Ev ${r._id}][ServHab ${index}][HabRef ${h.reservaHabitacionId}] Campo 'habitacion' en ReservaHab (${reservaHabRef.habitacion}) NO es ObjectId válido. Intentando fallback letra.`);
                            letraHab = reservaHabRef.habitacion || '?'; 
                        }
                        */
                    } else {
                        // ReservaHabitacion document itself not found in map (deleted?)
                        // console.warn(`[Dashboard][Ev ${r._id}][ServHab ${index}] ID R.Hab referenciada '${h.reservaHabitacionId}' NO encontrada en mapa. Usando letra '?' y detalles placeholder.`);
                        // letraHab remains '?', reservaHabDetails remains placeholder
                    }
                } else {
                    // The reservaHabitacionId from the event's service array is invalid
                    if (h.reservaHabitacionId) { // Log only if ID was present but invalid
                        // console.warn(`[Dashboard][Ev ${r._id}][ServHab ${index}] ID R.Hab inválido ('${h.reservaHabitacionId}'). Usando letra '?' y detalles placeholder.`);
                    } else {
                        // console.warn(`[Dashboard][Ev ${r._id}][ServHab ${index}] No hay ID R.Hab en servicio. Usando letra '?' y detalles placeholder.`);
                    }
                    // letraHab remains '?', reservaHabDetails remains placeholder
                }
                
                // <<< LOG RESULTADO FINAL PARA ESTA HABITACIÓN DE SERVICIO >>>
                // console.log(`[Dashboard][Ev ${r._id}][ServHab ${index}] Resultado final: letraHab=${letraHab}, reservaHabDetails=`, reservaHabDetails);
                // <<< FIN LOG >>>

                return { 
                    reservaHabitacionId: h.reservaHabitacionId, // Keep original ID 
                    letraHabitacion: letraHab, // The determined letter (from Habitacion or fallback)
                    reservaHabitacionDetails: reservaHabDetails, // Details of the ReservaHabitacion (placeholder if not found)
                };
            });
        }

        let usuarioDetails = placeholderInvalidUser;
        if (r.usuario && mongoose.Types.ObjectId.isValid(r.usuario)) {
            const foundUser = allUsersMap.get(r.usuario.toString());
            if (foundUser) {
                usuarioDetails = { ...placeholderInvalidUser, ...foundUser };
            } else {
                // console.warn(`[Dashboard][Ev->User] ID usuario '${r.usuario}' no encontrado en mapa para R.Ev ${r._id}.`);
                // usuarioDetails ya es placeholder
            }
        } else if (r.usuario) {
             // console.warn(`[Dashboard][Ev->User] ID usuario inválido ('${r.usuario}') en R.Ev ${r._id}.`);
             // usuarioDetails ya es placeholder
        }

        // <<< Procesar Admin Asignado >>>
        let asignadoADetails = null; // Default a null si no está asignado
        if (r.asignadoA) {
            if (mongoose.Types.ObjectId.isValid(r.asignadoA)) {
                const foundAdmin = allUsersMap.get(r.asignadoA.toString());
                if (foundAdmin) {
                    asignadoADetails = { ...placeholderInvalidAdmin, ...foundAdmin }; // Asegurar estructura
                } else {
                    // console.warn(`[Dashboard][Ev->Admin] ID admin '${r.asignadoA}' no encontrado en mapa para R.Ev ${r._id}. Usando placeholder.`);
                    asignadoADetails = placeholderInvalidAdmin;
                }
            } else {
                // console.warn(`[Dashboard][Ev->Admin] ID admin inválido ('${r.asignadoA}') en R.Ev ${r._id}. Usando placeholder.`);
                 asignadoADetails = placeholderInvalidAdmin;
            }
        }
        // <<< Fin Procesar Admin Asignado >>>

        return {
            ...r,
            tipoEvento: r.tipoEvento, // Mantener ID original
            tipoEventoDetails,
            usuario: r.usuario, // Mantener ID original de usuario
            asignadoA: r.asignadoA, // <<< Mantener ID original de asignadoA >>>
            usuarioDetails, // <<< Detalles de usuario cliente >>>
            asignadoADetails, // <<< NUEVO: Detalles del admin asignado >>>
            serviciosAdicionales: {
                ...(r.serviciosAdicionales || {}),
                habitaciones: processedServiciosHabitaciones // Reemplazar con las procesadas
            },
            tipo: 'evento',
            nombreContacto: r.nombreContacto,
            apellidosContacto: r.apellidosContacto
        };
    });

    // --- 6. Combinar y Ordenar --- 
    const combinedReservations = [
      ...processedReservasHabitacion,
      ...processedReservasEvento
    ];

    combinedReservations.sort((a, b) => {
      const dateA = new Date(a.fechaEntrada || a.fecha);
      const dateB = new Date(b.fechaEntrada || b.fecha);
      if (isNaN(dateA)) return 1;
      if (isNaN(dateB)) return -1;
      return dateA - dateB;
    });

    // <<< NUEVO LOG BACKEND: Verificar los primeros elementos ANTES de enviar >>>
    // console.log('[Dashboard Controller] Primeros 5 elementos a enviar (incluyendo asignadoADetails):',
    //   combinedReservations.slice(0, 5).map(r => ({ _id: r._id, tipo: r.tipo, asignadoA: r.asignadoA, asignadoADetails: r.asignadoADetails }))
    // );
    // <<< FIN NUEVO LOG BACKEND >>>

    // <<< LOG DETALLADO ANTES DE ENVIAR >>>
    /* Eliminado temporalmente para limpiar logs
    console.log('[Dashboard Controller] Datos FINALES a enviar (Detalle Eventos):');
    combinedReservations.forEach((reserva, index) => {
      if (reserva.tipo === 'evento') {
        console.log(`  Evento[${index}] ID: ${reserva._id}`);
        if (reserva.serviciosAdicionales?.habitaciones && reserva.serviciosAdicionales.habitaciones.length > 0) {
           console.log(`    Habitaciones Procesadas (${reserva.serviciosAdicionales.habitaciones.length}):`);
           reserva.serviciosAdicionales.habitaciones.forEach((habRef, habIndex) => {
             console.log(`      [${habIndex}] Letra: ${habRef.letraHabitacion}, ID ReservaHab: ${habRef.reservaHabitacionId}, Detalles ReservaHab Encontrados: ${!!habRef.reservaHabitacionDetails?._id}`);
             // Opcional: loggear más detalles de reservaHabitacionDetails si es necesario
             // console.log(`        Detalles:`, JSON.stringify(habRef.reservaHabitacionDetails));
           });
        } else {
          console.log('    Sin habitaciones procesadas.');
        }
      }
    });
    */
    // <<< FIN LOG DETALLADO >>>

    // --- 7. Enviar Respuesta ---
    res.status(200).json({
      success: true,
      count: combinedReservations.length,
      data: combinedReservations
    });

  } catch (error) {
    // console.error("[Dashboard] Error general procesando datos:", error); 
    // Devolver un error genérico o usar el manejador de errores
    next(new ErrorResponse('Error al obtener datos del dashboard', 500)); 
  }
}); 