const ReservaEvento = require('../models/ReservaEvento');
const User = require('../models/User');
const TipoEvento = require('../models/TipoEvento');
const ReservaHabitacion = require('../models/ReservaHabitacion');
const Habitacion = require('../models/Habitacion');
const mongoose = require('mongoose');
const { sendEmail, enviarConfirmacionReservaEvento } = require('../utils/email');
const confirmacionTemplate = require('../emails/confirmacionReserva');
const confirmacionAdminTemplate = require('../emails/confirmacionAdmin');
const notificacionGestionAdmin = require('../emails/notificacionGestionAdmin');
const Servicio = require('../models/Servicio');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const generarNumeroConfirmacion = require('../utils/confirmNumGen');

/**
 * @desc    Crear una reserva de evento
 * @route   POST /api/reservas/eventos
 * @access  Public
 */
const createReservaEvento = asyncHandler(async (req, res, next) => {
  const session = await mongoose.startSession(); // Iniciar sesión
  let reservaCreada;
  const habitacionesCreadas = [];

  try {
    await session.withTransaction(async () => {
      const {
        tipo_evento,
        fecha,
        nombre_contacto,
        apellidos_contacto,
        email_contacto,
        telefono_contacto,
        mensaje,
        habitaciones,
        modo_gestion_habitaciones,
        modo_gestion_servicios,
        serviciosContratados,
        _serviciosCompletosParaPrecio // Asumiendo que esto viene del frontend
      } = req.body;

      // --- Validaciones Iniciales (dentro de la transacción) ---
      if (!tipo_evento || !fecha || !nombre_contacto || !email_contacto || !telefono_contacto) {
        throw new ErrorResponse('Por favor, proporcione todos los campos obligatorios', 400);
      }

      const tipoEventoDoc = await TipoEvento.findOne({ 
        titulo: { $regex: new RegExp(tipo_evento, 'i') }
      }).session(session); // <-- Incluir sesión

      if (!tipoEventoDoc) {
        throw new ErrorResponse('Tipo de evento no válido', 400);
      }

      const fechaEvento = new Date(fecha);
      if (isNaN(fechaEvento.getTime())) {
        throw new ErrorResponse('Fecha no válida', 400);
      }
      const fechaInicioDia = new Date(fechaEvento.setHours(0, 0, 0, 0));
      const fechaFinDia = new Date(fechaEvento.setHours(23, 59, 59, 999));

      // --- Re-Verificación de Disponibilidad de Evento DENTRO de la Transacción ---
      const eventoSolapado = await ReservaEvento.findOne({
        fecha: {
          $gte: fechaInicioDia,
          $lt: fechaFinDia
        },
        estadoReserva: { $ne: 'cancelada' }
      }).session(session); // <-- Incluir sesión

      if (eventoSolapado) {
        throw new ErrorResponse('La fecha seleccionada ya no está disponible para eventos', 409); // 409 Conflicto
      }

      // --- Cálculo de Precio (Se mantiene igual) ---
      const precioBaseEvento = Number(tipoEventoDoc.precioBase) || 0;
      let precioServicios = 0;
      if (Array.isArray(_serviciosCompletosParaPrecio)) {
        precioServicios = _serviciosCompletosParaPrecio.reduce((sum, servicio) => {
          const precioServicio = Number(servicio?.precio) || 0;
          return sum + precioServicio;
        }, 0);
      }
      const precioTotalCalculado = precioBaseEvento + precioServicios;
      const totalHabitaciones = (modo_gestion_habitaciones === 'hacienda') ? 14 : (habitaciones?.length || 0);

      // --- Crear ReservaEvento DENTRO de la Transacción ---
      const reservaData = {
        ...(req.user && req.user.id ? { usuario: req.user.id } : {}),
        tipoEvento: tipoEventoDoc._id,
        nombreEvento: tipoEventoDoc.nombre || tipoEventoDoc.titulo || 'Evento sin nombre',
        nombreContacto: nombre_contacto,
        apellidosContacto: apellidos_contacto,
        emailContacto: email_contacto,
        telefonoContacto: telefono_contacto,
        fecha: fechaEvento, // Usar la fecha validada
        horaInicio: '12:00',
        horaFin: '18:00',
        espacioSeleccionado: 'jardin',
        numInvitados: 50, 
        precio: precioTotalCalculado,
        peticionesEspeciales: mensaje || '',
        estadoReserva: 'pendiente',
        metodoPago: 'pendiente',
        modoGestionHabitaciones: modo_gestion_habitaciones || 'usuario',
        modoGestionServicios: modo_gestion_servicios || 'usuario',
        totalHabitaciones,
        serviciosContratados: Array.isArray(serviciosContratados) ? serviciosContratados : [],
        numeroConfirmacion: generarNumeroConfirmacion(),
        fechaHoraCreacion: new Date(),
      };

      const [reservaEventoCreada] = await ReservaEvento.create([reservaData], { session }); // <-- Incluir sesión
      if (!reservaEventoCreada) {
        throw new ErrorResponse('No se pudo crear la reserva del evento', 500);
      }
      reservaCreada = reservaEventoCreada; // Guardar para uso fuera de transacción

      // --- Crear Reservas de Habitaciones Asociadas DENTRO de la Transacción ---
      let referenciasHabitaciones = []; // Array para guardar las referencias
      if (modo_gestion_habitaciones === 'hacienda') {
        const habitacionesEstandar = await Habitacion.find({ estado: 'Disponible' })
           .limit(14)
           .select('letra tipo capacidad precioPorNoche _id')
           .session(session); // <-- Incluir sesión
           
        if (habitacionesEstandar.length < 14) {
           console.warn(`[Transacción] Se esperaban 14 habitaciones estándar, pero se encontraron ${habitacionesEstandar.length}`);
           // Considerar lanzar error si es crítico: throw new ErrorResponse('No se encontraron suficientes habitaciones estándar.', 500);
        }

        for (const habInfo of habitacionesEstandar) {
            const letraHab = habInfo?.letra;
            const habitacionValor = letraHab || 'SinLetra_' + (habInfo?._id || 'IDDesconocido');
            const entrada = new Date(fechaEvento); // Re-calcular por si acaso
            const salida = new Date(entrada);
            salida.setDate(entrada.getDate() + 1);

            const reservaHabitacionData = {
              tipoReserva: 'evento',
              reservaEvento: reservaCreada._id,
              habitacion: habitacionValor, 
              letraHabitacion: letraHab || null, 
              tipoHabitacion: habInfo?.tipo || 'Estándar', 
              categoriaHabitacion: (habInfo?.capacidad <= 2) ? 'sencilla' : 'doble', 
              precio: habInfo?.precioPorNoche || 0, 
              numHuespedes: habInfo?.capacidad || 2, 
              fechaEntrada: entrada,
              fechaSalida: salida,
              estadoReserva: 'pendiente',
              nombreContacto: nombre_contacto,
              apellidosContacto: apellidos_contacto,
              emailContacto: email_contacto,
              telefonoContacto: telefono_contacto,
              fecha: fechaEvento, 
            };
            
            const [habCreada] = await ReservaHabitacion.create([reservaHabitacionData], { session }); // <-- Incluir sesión
            if (!habCreada) {
                 throw new ErrorResponse(`Error al crear habitación asociada ${habitacionValor}. Abortando.`, 500);
            }
            habitacionesCreadas.push(habCreada);
            // AÑADIDO: Guardar referencia para actualizar el evento
            referenciasHabitaciones.push({
              reservaHabitacionId: habCreada._id,
              tipo: habCreada.tipoHabitacion || 'Estándar',
              noches: 1, // Asumiendo 1 noche por defecto para gestión hacienda
              precio: habCreada.precio || 0
            });
        }
      } else if (Array.isArray(habitaciones) && habitaciones.length > 0) { // modo_gestion_habitaciones === 'usuario'
          for (const hab of habitaciones) {
              let entrada, salida;
              if (hab.fechaEntrada) {
                 entrada = new Date(hab.fechaEntrada);
                 salida = new Date(entrada);
                 salida.setDate(entrada.getDate() + (hab.noches || 1));
              } else {
                 entrada = new Date(fechaEvento); // Re-calcular
                 salida = new Date(entrada);
                 salida.setDate(entrada.getDate() + 1);
              }
              if (!hab.letra) { // Validación crucial
                 console.error(`[Transacción] Intento de crear hab sin letra: ${JSON.stringify(hab)}`);
                 throw new ErrorResponse(`Falta identificador (letra) para una de las habitaciones seleccionadas.`, 400);
              }
              const reservaHabitacionData = {
                  tipoReserva: 'evento',
                  reservaEvento: reservaCreada._id,
                  habitacion: hab.letra,
                  tipoHabitacion: hab.tipoHabitacion?.nombre || hab.tipoHabitacion || 'Estándar',
                  categoriaHabitacion: (hab.capacidad <= 2) ? 'sencilla' : 'doble',
                  precio: hab.precioPorNoche || hab.precio || 0,
                  numHuespedes: hab.capacidad || 2,
                  fechaEntrada: entrada,
                  fechaSalida: salida,
                  estadoReserva: 'pendiente',
                  nombreContacto: nombre_contacto,
                  apellidosContacto: apellidos_contacto,
                  emailContacto: email_contacto,
                  telefonoContacto: telefono_contacto,
                  fecha: fechaEvento,
                  letraHabitacion: hab.letra
              };
              const [habCreada] = await ReservaHabitacion.create([reservaHabitacionData], { session }); // <-- Incluir sesión
              if (!habCreada) {
                  throw new ErrorResponse(`Error al crear habitación asociada ${hab.letra}. Abortando.`, 500);
              }
              habitacionesCreadas.push(habCreada);
              // AÑADIDO: Guardar referencia para actualizar el evento
              referenciasHabitaciones.push({
                reservaHabitacionId: habCreada._id,
                tipo: habCreada.tipoHabitacion || 'Estándar',
                noches: hab.noches || 1,
                precio: habCreada.precio || 0
              });
          }
      }
      
      // AÑADIDO: Actualizar el Evento con las referencias a las habitaciones creadas
      if (referenciasHabitaciones.length > 0) {
          console.log(`[Transacción] Actualizando evento ${reservaCreada._id} con ${referenciasHabitaciones.length} referencias de habitación.`);
          // Asegurarse de que serviciosAdicionales exista
          if (!reservaCreada.serviciosAdicionales) {
             reservaCreada.serviciosAdicionales = { habitaciones: [], masajes: [] };
          }
          reservaCreada.serviciosAdicionales.habitaciones = referenciasHabitaciones;
          // Guardar el evento actualizado DENTRO de la transacción
          await reservaCreada.save({ session }); 
      } else {
          console.log(`[Transacción] No se crearon referencias de habitación para evento ${reservaCreada._id}. No se actualiza el array.`);
      }
      // Si llegamos aquí sin errores, la transacción se confirmará automáticamente

    }); // Fin de session.withTransaction

    // --- Operaciones Post-Transacción (Email y Respuesta) ---
    if (reservaCreada) {
       // Usar directamente el email de contacto guardado en la reserva
       const emailCliente = reservaCreada.emailContacto;
       const nombreCliente = reservaCreada.nombreContacto;

       if (emailCliente) {
          // Enviar correo de confirmación al cliente usando la nueva plantilla
          console.log(`>>> [Evento] Intentando enviar confirmación a cliente: ${emailCliente}`);
          try {
            await enviarConfirmacionReservaEvento({
              email: emailCliente,
              nombreCliente: nombreCliente || 'Cliente',
              tipoEvento: reservaCreada.nombreEvento || 'Evento Especial',
              numeroConfirmacion: reservaCreada.numeroConfirmacion,
              fechaEvento: reservaCreada.fecha,
              horaInicio: reservaCreada.horaInicio || '12:00',
              horaFin: reservaCreada.horaFin || '00:00',
              numInvitados: reservaCreada.numeroInvitados || 0,
              precioTotal: reservaCreada.precio || 0,
              porcentajePago: 30, // Porcentaje de pago inicial - ajustar según política
              metodoPago: reservaCreada.metodoPago || 'No especificado',
              detallesEvento: {
                tipoComida: reservaCreada.tipoComida || 'No especificado',
                serviciosAdicionales: reservaCreada.serviciosContratados?.join(', ') || 'Ninguno',
                estado: reservaCreada.estadoReserva || 'Pendiente de confirmación'
              },
              habitacionesReservadas: habitacionesCreadas.map(hab => ({
                tipoHabitacion: hab.tipoHabitacion || 'Estándar',
                fechaEntrada: hab.fechaEntrada,
                fechaSalida: hab.fechaSalida,
                precio: hab.precio || 0
              }))
            });
            console.log(`Correo de confirmación enviado a ${emailCliente}`);
          } catch (error) {
            console.error(`Error al enviar correo de confirmación al cliente ${emailCliente}:`, error);
            // No lanzar error aquí, la reserva ya se creó. Solo registrar el fallo.
          }
       }

       // Notificar a los administradores
       const adminEmailsString = process.env.ADMIN_EMAIL;
       if (adminEmailsString) {
          try {
              // Dividir por comas y eliminar espacios en blanco
              const adminEmails = adminEmailsString.split(',').map(email => email.trim());
              
              console.log(`>>> [Evento] Intentando enviar notificación a admin: ${adminEmails}`);
              // Usar el template de notificación para admin
              await sendEmail({
                email: adminEmails,
                subject: `Nueva Reserva de Evento #${reservaCreada.numeroConfirmacion}`,
                html: notificacionGestionAdmin({
                  accion: "Nueva Reserva",
                  tipoReserva: reservaCreada.nombreEvento || "Evento",
                  numeroConfirmacion: reservaCreada.numeroConfirmacion,
                  nombreCliente: `${nombreCliente || 'Cliente'} ${reservaCreada.apellidosContacto || ''}`,
                  emailCliente: emailCliente || 'No disponible',
                  detallesAdicionales: {
                    fecha: new Date(reservaCreada.fecha).toLocaleDateString('es-ES'),
                    telefono: reservaCreada.telefonoContacto || 'No disponible',
                    invitados: reservaCreada.numInvitados || 'No especificado',
                    precio: `${reservaCreada.precio || 0} MXN`,
                    habitaciones: `${habitacionesCreadas.length} asignadas`,
                    estado: reservaCreada.estadoReserva || 'pendiente',
                    notas: reservaCreada.peticionesEspeciales || 'Ninguna',
                    servicios: reservaCreada.modoGestionServicios === 'hacienda' ? 
                      'Gestión por hacienda' : 
                      (reservaCreada.serviciosContratados?.length > 0 ? 
                        `${reservaCreada.serviciosContratados.length} seleccionados` : 'Ninguno')
                  },
                  urlGestionReserva: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/reservas/${reservaCreada._id}`
                })
              });
          } catch (error) {
              console.error(`Error al enviar email de notificación a los administradores:`, error);
              // No lanzar error, la reserva ya se creó
          }
       }

       // --- Respuesta Final ---
       // Poblar detalles antes de responder si es necesario (opcional)
       const reservaConDetalles = await ReservaEvento.findById(reservaCreada._id)
           .populate('tipoEvento', 'titulo'); // Ejemplo: Poblar el título del tipo de evento
           // .populate('serviciosContratados') // Si necesitas detalles de servicios
           // .populate('usuario', 'nombre email'); // Si necesitas detalles del usuario (si existe)

       res.status(201).json({
         success: true,
         message: 'Reserva de evento creada con éxito. Se ha enviado un correo de confirmación.',
         data: reservaConDetalles || reservaCreada
       });
        
       return; // Terminar aquí para evitar la duplicación de respuesta

    } else {
      // Esto no debería ocurrir si la transacción tuvo éxito y reservaCreada se asignó
      console.error("Error crítico: La transacción pareció tener éxito pero reservaCreada está vacía.");
      next(new ErrorResponse('Error al procesar la reserva después de la creación', 500));
    }

  } catch (error) {
    // El error puede venir de las validaciones o de la transacción
    console.error('Error durante la transacción de creación de reserva de evento:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Error al crear la reserva del evento';
    res.status(statusCode).json({ success: false, message: message });

  } finally {
    // Siempre terminar la sesión
    await session.endSession();
  }
});

/**
 * @desc    Obtener todas las reservas de eventos
 * @route   GET /api/reservas/eventos
 * @access  Private
 */
exports.obtenerReservasEvento = async (req, res) => {
  try {
    let query = {};
    
    // Si no es admin, solo ver sus propias reservas
    if (req.user.role !== 'admin') {
      // Ver tanto las reservas propias como las asignadas a este usuario
      query = {
        $or: [
          { usuario: req.user.id },
          { asignadoA: req.user.id }
        ]
      };
    } else {
      // Para administradores, filtrar según los parámetros
      if (req.query.misReservas === 'true') {
        // Ver solo las reservas asignadas al admin actual
        query.asignadoA = req.user.id;
      } else if (req.query.disponibles === 'true' || req.query.sinAsignar === 'true') {
        // Ver solo las reservas no asignadas (disponibles)
        query.asignadoA = null;
      } else {
        // Sin filtros específicos, mostrar tanto las asignadas a este admin como las sin asignar
        query = {
          $or: [
            { asignadoA: req.user.id },
            { asignadoA: null }
          ]
        };
      }
    }
    
    // Añadir filtro por fecha si se proporciona
    if (req.query.fecha) {
      // Formato ISO YYYY-MM-DD
      const fechaInicio = new Date(req.query.fecha);
      fechaInicio.setHours(0, 0, 0, 0);
      
      const fechaFin = new Date(req.query.fecha);
      fechaFin.setHours(23, 59, 59, 999);
      
      query.fecha = {
        $gte: fechaInicio,
        $lte: fechaFin
      };
    }
    
    // Añadir filtro por espacio/lugar si se proporciona
    if (req.query.espacio) {
      query.espacio = req.query.espacio;
    }
    
    console.log('Consulta para obtener reservas de eventos:', JSON.stringify(query));
    
    // Ejecutar la consulta
    const reservas = await ReservaEvento.find(query)
      .populate({
        path: 'usuario',
        select: 'nombre apellidos email telefono',
        strictPopulate: false
      })
      .populate({
        path: 'asignadoA',
        select: 'nombre apellidos email',
        strictPopulate: false
      })
      .populate({
        path: 'tipoEvento',
        strictPopulate: false
      })
      .sort({ fecha: 1, horaInicio: 1 });
      
    res.status(200).json({
      success: true,
      count: reservas.length,
      data: reservas // Enviar las reservas como vienen
    });
  } catch (error) {
    console.error('Error al obtener reservas de eventos:', error);
    res.status(500).json({
      success: false,
      message: 'No se pudieron obtener las reservas',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener una reserva de evento por ID
 * @route   GET /api/reservas/eventos/:id
 * @access  Private
 */
exports.obtenerReservaEvento = async (req, res) => {
  try {
    // Buscar la reserva de evento con los datos básicos populados
    const reserva = await ReservaEvento.findById(req.params.id)
      .select('+precio +nombreEvento +nombreContacto +apellidosContacto +emailContacto +telefonoContacto +fecha +horaInicio +horaFin +numeroInvitados +espacioSeleccionado +peticionesEspeciales +estadoReserva +numInvitados')
      .populate({
        path: 'usuario',
        select: 'nombre apellidos email telefono',
        strictPopulate: false
      })
      .populate({
        path: 'asignadoA',
        select: 'nombre apellidos email',
        strictPopulate: false
      })
      .populate({
        path: 'tipoEvento',
        strictPopulate: false
      });
      
    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }
    
    // --- NUEVO: Buscar y popular las habitaciones asociadas ---
    const habitacionesAsociadas = await ReservaHabitacion.find({ reservaEvento: reserva._id })
      .populate({
        path: 'habitacion', // Popular la referencia a la habitación física
        select: 'letra nombre tipo', // Seleccionar campos específicos si es necesario
        strictPopulate: false
      })
      .populate({
        path: 'tipoHabitacion', // Popular la referencia al tipo de habitación
        strictPopulate: false
      });
      
    // Convertir la reserva a un objeto plano para poder añadirle propiedades
    const reservaObj = reserva.toObject();
    // Añadir las habitaciones encontradas al objeto de respuesta
    reservaObj.habitaciones = habitacionesAsociadas;
    // --- FIN NUEVO ---

    res.status(200).json({
      success: true,
      // Enviar el objeto modificado que incluye las habitaciones
      data: reservaObj 
    });
  } catch (error) {
    console.error('Error al obtener reserva de evento:', error);
    res.status(500).json({
      success: false,
      message: 'No se pudo obtener la reserva',
      error: error.message
    });
  }
};

/**
 * @desc    Actualizar una reserva de evento
 * @route   PUT /api/reservas/eventos/:id
 * @access  Private
 */
exports.actualizarReservaEvento = async (req, res) => {
  try {
    let reserva = await ReservaEvento.findById(req.params.id);
    
    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }
    
    // --- INICIO: Verificación de Permiso de Asignación ---
    if (!req.user || !req.user.id) {
       console.error("Error: req.user no está definido en actualizarReservaEvento.");
       return res.status(500).json({ success: false, message: 'Error interno del servidor (Autenticación)' });
    }
    const asignadoAId = reserva.asignadoA ? reserva.asignadoA.toString() : null;
    const userId = req.user.id.toString(); 
    if (asignadoAId && asignadoAId !== userId) {
      // Permitir actualizar solo si el único cambio es el estado a 'cancelada' por si acaso
      // O si se está asignando/desasignando (esto se maneja en otros endpoints)
      // Comprobamos si solo se actualiza el estado y si es a 'cancelada'
      const updateKeys = Object.keys(req.body);
      const isOnlyStatusUpdateToCancelled = updateKeys.length === 1 && updateKeys[0] === 'estadoReserva' && req.body.estadoReserva === 'cancelada';
      // Podríamos añadir más excepciones si son necesarias
      
      // Si NO es una excepción permitida, denegar
      if (!isOnlyStatusUpdateToCancelled) { 
         return res.status(403).json({
           success: false,
           message: 'No tienes permiso para actualizar esta reserva porque está asignada a otro administrador.'
         });
      }
    }
    // --- FIN: Verificación de Permiso de Asignación ---

    // Detectar si es una operación de eliminación de habitación por la bandera especial
    const esOperacionEliminacionHabitacion = req.body._operacion_eliminacion_habitacion === true;
    
    if (esOperacionEliminacionHabitacion) {
      console.log('Detectada operación de eliminación de habitación. Omitiendo verificación de disponibilidad.');
      
      // Eliminar la bandera especial antes de guardar
      delete req.body._operacion_eliminacion_habitacion;
    } else {
      // Verificación normal de disponibilidad si se cambia fecha/hora/espacio
      if (
        (req.body.fecha && req.body.fecha !== reserva.fecha.toISOString().split('T')[0]) ||
        (req.body.horaInicio && req.body.horaInicio !== reserva.horaInicio) ||
        (req.body.horaFin && req.body.horaFin !== reserva.horaFin) ||
        (req.body.espacioSeleccionado && req.body.espacioSeleccionado !== reserva.espacioSeleccionado)
      ) {
        const fecha = req.body.fecha || reserva.fecha;
        const horaInicio = req.body.horaInicio || reserva.horaInicio;
        const horaFin = req.body.horaFin || reserva.horaFin;
        const espacio = req.body.espacioSeleccionado || reserva.espacioSeleccionado;
        
        const disponible = await ReservaEvento.comprobarDisponibilidad(
          fecha,
          espacio,
          horaInicio,
          horaFin,
          reserva._id // Excluir la reserva actual de la verificación
        );
        
        if (!disponible) {
          return res.status(400).json({
            success: false,
            message: 'El espacio no está disponible para la fecha y hora solicitadas'
          });
        }
      }
    }
    
    // Detectar si se están modificando las habitaciones
    if (req.body.serviciosAdicionales?.habitaciones) {
      console.log('Actualizando habitaciones del evento:', req.params.id);
      console.log('Habitaciones actuales:', reserva.serviciosAdicionales?.habitaciones?.length || 0);
      console.log('Nuevas habitaciones:', req.body.serviciosAdicionales.habitaciones.length);
      
      // Si se están eliminando habitaciones, mostrar detalle
      if (reserva.serviciosAdicionales?.habitaciones?.length > req.body.serviciosAdicionales.habitaciones.length) {
        console.log('Eliminando habitaciones:');
        console.log('  - Antes:', JSON.stringify(reserva.serviciosAdicionales.habitaciones));
        console.log('  - Después:', JSON.stringify(req.body.serviciosAdicionales.habitaciones));
      }
    }
    
    // Ensure correct casing (lowercase) if 'estadoReserva' is being updated
    if (req.body.estadoReserva) {
        const estadoInput = String(req.body.estadoReserva).toLowerCase(); // Convert to string and lowercase
        if (['pendiente', 'confirmada', 'pagada', 'cancelada', 'completada'].includes(estadoInput)) {
           // Set the lowercase version directly
           req.body.estadoReserva = estadoInput;
        } else {
           // If input is not a valid enum value, maybe don't update or return error?
           // For now, let's keep the original invalid value to let validation handle it.
           // Or delete it: delete req.body.estadoReserva; 
           console.warn(`[actualizarReservaEvento] Estado '${req.body.estadoReserva}' no es un valor enum válido.`);
        }
        console.log(`[actualizarReservaEvento] Estado normalizado a: ${req.body.estadoReserva}`);
    }

    // Actualizar la reserva
    reserva = await ReservaEvento.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate({
      path: 'usuario',
      select: 'nombre apellidos email telefono',
      strictPopulate: false
    }).populate({
      path: 'asignadoA',
      select: 'nombre apellidos email',
      strictPopulate: false
    }).populate({
      path: 'tipoEvento',
      strictPopulate: false
    });
    
    console.log('Evento actualizado correctamente:', req.params.id);
    
    res.status(200).json({
      success: true,
      data: reserva
    });
  } catch (error) {
    console.error('Error al actualizar reserva de evento:', error);
    res.status(500).json({
      success: false,
      message: 'No se pudo actualizar la reserva',
      error: error.message
    });
  }
};

/**
 * @desc    Eliminar una reserva de evento
 * @route   DELETE /api/reservas/eventos/:id
 * @access  Private
 */
exports.eliminarReservaEvento = async (req, res) => {
  try {
    const reserva = await ReservaEvento.findById(req.params.id);
    
    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }
    
    // --- INICIO: Verificación de Permiso de Asignación ---
    if (!req.user || !req.user.id) {
       console.error("Error: req.user no está definido en eliminarReservaEvento.");
       return res.status(500).json({ success: false, message: 'Error interno del servidor (Autenticación)' });
    }
    const asignadoAId = reserva.asignadoA ? reserva.asignadoA.toString() : null;
    const userId = req.user.id.toString(); 
    if (asignadoAId && asignadoAId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar esta reserva porque está asignada a otro administrador.'
      });
    }
    // --- FIN: Verificación de Permiso de Asignación ---

    // --- Añadido: Eliminar habitaciones asociadas ANTES de eliminar el evento --- 
    const ReservaHabitacion = require('../models/ReservaHabitacion'); // Asegurarse de importar el modelo
    const deleteResult = await ReservaHabitacion.deleteMany({ reservaEvento: reserva._id });
    console.log(`Eliminadas ${deleteResult.deletedCount} habitaciones asociadas al evento ${reserva._id}`);
    // -------------------------------------------------------------------------
    
    // Ahora eliminar el evento
    await reserva.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Reserva eliminada correctamente',
      data: {}
    });
  } catch (error) {
    console.error('Error al eliminar reserva de evento:', error);
    res.status(500).json({
      success: false,
      message: 'No se pudo eliminar la reserva',
      error: error.message
    });
  }
};

/**
 * @desc    Comprobar disponibilidad de eventos
 * @route   POST /api/reservas/eventos/disponibilidad
 * @access  Public
 */
exports.checkEventoAvailability = async (req, res) => {
  try {
    const { fecha, tipo_evento, total_habitaciones } = req.body;

    console.log('Verificando disponibilidad con datos:', { fecha, tipo_evento, total_habitaciones });

    // Validar campos requeridos
    if (!fecha || !tipo_evento) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, proporcione la fecha y el tipo de evento'
      });
    }

    // Validar que la fecha sea futura
    const fechaReserva = new Date(fecha);
    const hoy = new Date();
    
    // Establecer las horas a 0 para comparar solo las fechas
    fechaReserva.setHours(0, 0, 0, 0);
    hoy.setHours(0, 0, 0, 0);
    
    console.log('Fecha reserva:', fechaReserva.toISOString());
    console.log('Fecha hoy:', hoy.toISOString());
    
    if (fechaReserva <= hoy) {
      return res.status(400).json({
        success: false,
        message: 'La fecha debe ser posterior a hoy'
      });
    }

    // Validar tipo de evento
    const tipoEventoDoc = await TipoEvento.findOne({ 
      titulo: { $regex: new RegExp(tipo_evento, 'i') }
    });

    if (!tipoEventoDoc) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de evento no válido'
      });
    }

    // Validar número de habitaciones
    const habitacionesRequeridas = total_habitaciones || 7;
    if (habitacionesRequeridas < 7 || habitacionesRequeridas > 14) {
      return res.status(400).json({
        success: false,
        message: 'El número de habitaciones debe estar entre 7 y 14'
      });
    }

    // Buscar reservas existentes para la fecha
    const inicioDelDia = new Date(fechaReserva);
    inicioDelDia.setHours(0, 0, 0, 0);
    
    const finDelDia = new Date(fechaReserva);
    finDelDia.setHours(23, 59, 59, 999);
    
    const reservasExistentes = await ReservaEvento.find({
      fecha: {
        $gte: inicioDelDia,
        $lt: finDelDia
      },
      estadoReserva: { $ne: 'cancelada' }
    });
    
    console.log('Buscando reservas entre:', inicioDelDia.toISOString(), 'y', finDelDia.toISOString());

    // Si hay reservas en la fecha, verificar disponibilidad
    if (reservasExistentes.length > 0) {
      return res.status(200).json({
        success: true,
        available: false,
        message: 'La fecha seleccionada no está disponible'
      });
    }

    res.status(200).json({
      success: true,
      available: true,
      message: 'Fecha disponible para el evento'
    });
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar disponibilidad',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener fechas ocupadas para eventos
 * @route   GET /api/reservas/eventos/fechas-ocupadas
 * @access  Public
 */
exports.getEventoOccupiedDates = async (req, res) => {
  try {
    // Parámetros opcionales para filtrar por espacio y fechas
    const { espacioSeleccionado, fechaInicio, fechaFin } = req.query;
    
    // Construir el query
    const query = {
      estadoReserva: { $ne: 'cancelada' }
    };
    
    // Si se especifica un espacio, filtrar por él
    if (espacioSeleccionado) {
      query.espacioSeleccionado = espacioSeleccionado;
    }
    
    // Si hay fechas de inicio y fin, filtrar el rango
    if (fechaInicio && fechaFin) {
      const fechaInicioObj = new Date(fechaInicio);
      const fechaFinObj = new Date(fechaFin);
      
      query.fecha = {
        $gte: fechaInicioObj,
        $lte: fechaFinObj
      };
    }
    
    // Proyectar solo los campos necesarios
    const reservas = await ReservaEvento.find(query, 'fecha horaInicio horaFin espacioSeleccionado')
      .sort({ fecha: 1, horaInicio: 1 });
    
    // Preparar datos para el frontend
    const fechasOcupadas = reservas.map(reserva => ({
      fecha: reserva.fecha,
      horaInicio: reserva.horaInicio,
      horaFin: reserva.horaFin,
      espacioSeleccionado: reserva.espacioSeleccionado
    }));
    
    res.status(200).json({
      success: true,
      data: fechasOcupadas
    });
  } catch (error) {
    console.error('Error al obtener fechas ocupadas de eventos:', error);
    res.status(500).json({
      success: false,
      message: 'No se pudieron obtener las fechas ocupadas',
      error: error.message
    });
  }
};

/**
 * @desc    Asignar reserva de evento a un usuario
 * @route   PUT /api/reservas/eventos/:id/asignar
 * @access  Private
 */
exports.assignReservaEvento = async (req, res) => {
  try {
    const { usuarioId } = req.body;
    
    // Si no se proporciona un ID de usuario, asignar al usuario actual
    const idUsuarioAsignar = usuarioId || req.user.id;
    
    // Verificar que el usuario existe (solo si se proporcionó un ID específico)
    if (usuarioId) {
      const usuario = await User.findById(usuarioId);
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
    }
    
    // Buscar la reserva y actualizarla
    const reserva = await ReservaEvento.findById(req.params.id);
    
    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró la reserva con ese ID'
      });
    }
    
    // Actualizar asignación
    reserva.asignadoA = idUsuarioAsignar;
    await reserva.save();
    
    res.status(200).json({
      success: true,
      data: reserva,
      message: 'Reserva asignada exitosamente'
    });
  } catch (error) {
    console.error('Error al asignar la reserva de evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al asignar la reserva de evento',
      error: error.message
    });
  }
};

/**
 * @desc    Desasignar una reserva de evento
 * @route   PUT /api/reservas/eventos/:id/desasignar
 * @access  Private
 */
exports.unassignReservaEvento = async (req, res) => {
  try {
    // Buscar la reserva
    const reserva = await ReservaEvento.findById(req.params.id);
    
    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró la reserva con ese ID'
      });
    }
    
    // Desasignar reserva
    reserva.asignadoA = null;
    await reserva.save();
    
    res.status(200).json({
      success: true,
      data: reserva,
      message: 'Reserva de evento desasignada exitosamente'
    });
  } catch (error) {
    console.error('Error al desasignar la reserva de evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al desasignar la reserva de evento',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener todas las habitaciones asignadas a un evento
 * @route   GET /api/reservas/eventos/:id/habitaciones
 * @access  Private (admin o propietario)
 */
exports.obtenerHabitacionesEvento = async (req, res) => {
  try {
    const eventoId = req.params.id;

    // Validar que el ID sea válido para MongoDB
    if (!eventoId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'ID de evento no válido'
      });
    }

    // Verificar que el evento existe (populamos datos necesarios para contexto)
    const evento = await ReservaEvento.findById(eventoId)
      .populate({
        path: 'usuario',
        select: 'nombre apellidos email telefono',
        strictPopulate: false // Permite populación aunque no esté definido en el schema
      })
      .populate({
        path: 'tipoEvento', // Populamos el tipo de evento
        strictPopulate: false
      })
      .populate({
        path: 'asignadoA', // Populamos el usuario asignado
        select: 'nombre email',
        strictPopulate: false
      })
      .select('+numInvitados'); // Asegurarse de seleccionar numInvitados si es necesario mostrarlo

    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    // Verificar autorización (admin o propietario del evento)
    // (Asumiendo que req.user está disponible desde protectRoute)
    const esPropietario = evento.usuario && evento.usuario._id.toString() === req.user.id;
    const estaAsignado = evento.asignadoA && evento.asignadoA._id.toString() === req.user.id;
    const esAdmin = req.user.role === 'admin';

    if (!esPropietario && !estaAsignado && !esAdmin) {
        return res.status(403).json({
            success: false,
            message: 'No está autorizado para ver las habitaciones de este evento'
        });
    }

    // Buscar las reservaciones de habitación asociadas a este evento
    const habitaciones = await ReservaHabitacion.find({ reservaEvento: eventoId })
      .populate({ // Popular la información de la habitación física
        path: 'habitacion', // Campo que referencia al modelo Habitacion
        select: 'letra nombre tipo', // Seleccionar campos deseados
        strictPopulate: false
      })
      .populate({ // Popular la información del tipo de habitación
        path: 'tipoHabitacion', // Campo que referencia al modelo TipoHabitacion
        select: 'nombre precio -_id', // Seleccionar campos deseados
        strictPopulate: false
      })
      .populate({ // Popular usuario asignado si existe
        path: 'asignadoA',
        select: 'nombre email',
        strictPopulate: false
      })
      .lean(); // Usar lean() para obtener objetos JS planos si no se necesita modificar

    res.status(200).json({
      success: true,
      data: {
        evento, // Devolver el evento para contexto si es necesario en el frontend
        habitaciones // Devolver las habitaciones encontradas
      }
    });
  } catch (error) {
    console.error('Error al obtener las habitaciones del evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener las habitaciones del evento.',
      error: error.message // Devolver mensaje de error en desarrollo
    });
  }
};

/**
 * @desc    Actualizar información de huéspedes para una habitación de evento
 * @route   PUT /api/reservas/eventos/:eventoId/habitaciones/:letraHabitacion
 * @access  Private
 */
exports.actualizarHabitacionEvento = async (req, res) => {
  try {
    const { eventoId, letraHabitacion } = req.params;
    const { infoHuespedes } = req.body;
    
    // Validar que el ID sea válido para MongoDB
    if (!eventoId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'ID de evento no válido'
      });
    }
    
    // Verificar que el evento existe
    const evento = await ReservaEvento.findById(eventoId)
      .populate({
        path: 'usuario',
        select: 'nombre apellidos email telefono',
        strictPopulate: false
      })
      .populate({
        path: 'tipoEvento',
        strictPopulate: false
      });
    
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }
    
    // Verificar que el usuario es propietario del evento o admin
    if (
      evento.usuario && 
      evento.usuario.toString() !== req.user.id && 
      (!evento.asignadoA || evento.asignadoA.toString() !== req.user.id) && 
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'No está autorizado para actualizar las habitaciones de este evento'
      });
    }
    
    // Buscar la habitación por letra y evento
    const ReservaHabitacion = require('../models/ReservaHabitacion');
    let habitacion = await ReservaHabitacion.findOne({ 
      reservaEvento: eventoId,
      letraHabitacion: letraHabitacion
    });
    
    // Si no existe la habitación, crearla
    if (!habitacion) {
      // Determinar el tipo de habitación y precio según la letra
      let tipoHabitacion = 'Dos matrimoniales';
      let categoriaHabitacion = 'doble';
      let precioPorNoche = 2600;
      
      // Habitaciones sencillas (A, B, K, L, M, O)
      if (['A', 'B', 'K', 'L', 'M', 'O'].includes(letraHabitacion)) {
        tipoHabitacion = '1 cama king size';
        categoriaHabitacion = 'sencilla';
        precioPorNoche = 2400;
      }
      
      habitacion = await ReservaHabitacion.create({
        tipoHabitacion,
        categoriaHabitacion,
        precioPorNoche,
        letraHabitacion,
        numHuespedes: 2,
        infoHuespedes: infoHuespedes || { nombres: [], detalles: '' },
        tipoReservacion: 'evento',
        reservaEvento: eventoId,
        numeroHabitaciones: 1,
        fechaEntrada: evento.fecha,
        fechaSalida: new Date(evento.fecha.getTime() + 24 * 60 * 60 * 1000), // +1 día
        habitacion: `Habitación ${letraHabitacion}`,
        estado: 'pendiente',
        nombreContacto: evento.nombreContacto,
        apellidosContacto: evento.apellidosContacto,
        emailContacto: evento.emailContacto,
        telefonoContacto: evento.telefonoContacto,
        fecha: evento.fecha,
        precio: 0, // El precio se maneja a nivel de evento
        precioTotal: 0
      });
    } else {
      // Actualizar la información de huéspedes
      habitacion = await ReservaHabitacion.findOneAndUpdate(
        { 
          reservaEvento: eventoId,
          letraHabitacion: letraHabitacion
        },
        { infoHuespedes },
        { new: true, runValidators: true }
      );
    }
    
    res.status(200).json({
      success: true,
      data: habitacion
    });
  } catch (error) {
    console.error('Error al actualizar habitación del evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la habitación del evento',
      error: error.message
    });
  }
};

// Función para ajustar la duración al valor permitido más cercano
const ajustarDuracionValida = (duracion) => {
  const duracionesValidas = [30, 60, 90, 120];
  
  // Si la duración ya es válida, la devolvemos tal cual
  if (duracionesValidas.includes(duracion)) {
    return duracion;
  }
  
  // Si no, encontramos el valor más cercano
  let duracionAjustada = duracionesValidas.reduce((prev, curr) => {
    return (Math.abs(curr - duracion) < Math.abs(prev - duracion) ? curr : prev);
  });
  
  console.log(`Ajustando duración inválida: ${duracion} min → ${duracionAjustada} min (valor permitido más cercano)`);
  return duracionAjustada;
};

/**
 * @desc    Obtener los servicios contratados para un evento
 * @route   GET /api/reservas/eventos/:id/servicios
 * @access  Private (Admin)
 */
exports.getEventoServicios = async (req, res, next) => {
  try {
    const reserva = await ReservaEvento.findById(req.params.id).populate('serviciosContratados');

    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: `Reserva de evento no encontrada con ID ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      count: reserva.serviciosContratados.length,
      data: reserva.serviciosContratados
    });
  } catch (error) {
    console.error('Error al obtener servicios del evento:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

/**
 * @desc    Añadir un servicio a una reserva de evento
 * @route   POST /api/reservas/eventos/:id/servicios
 * @access  Private (Admin)
 */
exports.addEventoServicio = async (req, res, next) => {
  const { servicioId } = req.body;

  if (!servicioId) {
    return res.status(400).json({ success: false, message: 'Falta el ID del servicio' });
  }

  // Validar que el servicioId es válido y existe
  if (!mongoose.Types.ObjectId.isValid(servicioId)) {
      return res.status(400).json({ success: false, message: 'ID de servicio no válido' });
  }
  const servicioExists = await Servicio.findById(servicioId);
  if (!servicioExists) {
      return res.status(404).json({ success: false, message: 'Servicio no encontrado' });
  }

  try {
    const reserva = await ReservaEvento.findById(req.params.id);

    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: `Reserva de evento no encontrada con ID ${req.params.id}`
      });
    }

    // Verificar si el servicio ya está añadido
    if (reserva.serviciosContratados.includes(servicioId)) {
      return res.status(400).json({
        success: false,
        message: 'El servicio ya está contratado para este evento'
      });
    }

    // Añadir el servicio al array
    reserva.serviciosContratados.push(servicioId);
    await reserva.save();
    
    // Popular los servicios antes de devolver para dar la lista completa
    await reserva.populate('serviciosContratados');

    res.status(200).json({
      success: true,
      message: 'Servicio añadido al evento',
      data: reserva.serviciosContratados // Devolver la lista actualizada
    });
  } catch (error) {
    console.error('Error al añadir servicio al evento:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

/**
 * @desc    Eliminar un servicio de una reserva de evento
 * @route   DELETE /api/reservas/eventos/:id/servicios/:servicioId
 * @access  Private (Admin)
 */
exports.removeEventoServicio = async (req, res, next) => {
  const { id: eventoId, servicioId } = req.params;

  // Validar IDs
  if (!mongoose.Types.ObjectId.isValid(eventoId) || !mongoose.Types.ObjectId.isValid(servicioId)) {
      return res.status(400).json({ success: false, message: 'ID de evento o servicio no válido' });
  }

  try {
    const reserva = await ReservaEvento.findById(eventoId);

    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: `Reserva de evento no encontrada con ID ${eventoId}`
      });
    }

    // Verificar si el servicio existe en el array
    const servicioIndex = reserva.serviciosContratados.findIndex(id => id.toString() === servicioId);

    if (servicioIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'El servicio no se encontró contratado para este evento'
      });
    }

    // Eliminar el servicio del array
    reserva.serviciosContratados.splice(servicioIndex, 1);
    await reserva.save();
    
    // Popular los servicios antes de devolver
    await reserva.populate('serviciosContratados');

    res.status(200).json({
      success: true,
      message: 'Servicio eliminado del evento',
      data: reserva.serviciosContratados // Devolver la lista actualizada
    });
  } catch (error) {
    console.error('Error al eliminar servicio del evento:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

/**
 * @desc    Añadir una reserva de habitación a una reserva de evento existente
 * @route   POST /api/reservas/eventos/:eventoId/habitaciones
 * @access  Admin
 */
exports.addHabitacionAEvento = async (req, res) => {
  const { eventoId } = req.params;
  const habitacionData = req.body; // Datos de la nueva habitación (ej: { letraHabitacion, tipoHabitacion, numHuespedes, fechaEntrada, fechaSalida, precio })

  try {
    const evento = await ReservaEvento.findById(eventoId);
    if (!evento) {
      return res.status(404).json({ success: false, message: 'Reserva de evento no encontrada.' });
    }

    // Validar datos de la habitación (puedes añadir más validaciones)
    if (!habitacionData.letraHabitacion || !habitacionData.tipoHabitacion || !habitacionData.numHuespedes || !habitacionData.fechaEntrada || !habitacionData.fechaSalida || habitacionData.precio === undefined) {
      return res.status(400).json({ success: false, message: 'Faltan datos obligatorios para la habitación.' });
    }

    // TODO: Verificar disponibilidad de la habitación para las fechas dadas
    // (Implementar lógica similar a la de crearReservaHabitacion si es necesario)

    // Crear la nueva reserva de habitación
    const nuevaReservaHabitacion = await ReservaHabitacion.create({
      ...habitacionData, // Incluye letra, tipo, huespedes, fechas, precio
      reservaEvento: eventoId, // Asociar con el evento
      tipoReserva: 'evento', // Asegurar el tipo correcto
      // Copiar datos de contacto del evento principal
      nombreContacto: evento.nombreContacto,
      apellidosContacto: evento.apellidosContacto,
      emailContacto: evento.emailContacto,
      telefonoContacto: evento.telefonoContacto,
      fecha: evento.fecha, // Usar fecha del evento si aplica
      estadoReserva: 'pendiente' // Estado inicial
    });

    // Añadir la referencia de la nueva reserva de habitación al array del evento
    // (Asegurándonos de que serviciosAdicionales existe y es un array)
    if (!Array.isArray(evento.serviciosAdicionales)) {
        evento.serviciosAdicionales = [];
    }
    evento.serviciosAdicionales.push({
      reservaHabitacionId: nuevaReservaHabitacion._id,
      tipoHabitacion: nuevaReservaHabitacion.tipoHabitacion,
      precio: nuevaReservaHabitacion.precio
      // Podrías añadir más detalles si son útiles aquí
    });
    
    // Actualizar el contador si lo usas
    evento.totalHabitaciones = (evento.totalHabitaciones || 0) + 1;
    
    await evento.save();

    res.status(201).json({ success: true, data: nuevaReservaHabitacion });

  } catch (error) {
    console.error('Error añadiendo habitación a evento:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.', error: error.message });
  }
};

/**
 * @desc    Eliminar una reserva de habitación asociada a un evento
 * @route   DELETE /api/reservas/eventos/:eventoId/habitaciones/:habitacionId
 * @access  Admin
 */
exports.removeHabitacionDeEvento = async (req, res) => {
  const { eventoId, habitacionId } = req.params;

  try {
    // 1. Verificar que la reserva de habitación exista y esté asociada al evento
    const reservaHabitacion = await ReservaHabitacion.findOne({
      _id: habitacionId,
      reservaEvento: eventoId
    });

    if (!reservaHabitacion) {
      return res.status(404).json({ success: false, message: 'Reserva de habitación no encontrada o no pertenece a este evento.' });
    }

    // 2. Eliminar la reserva de habitación
    await ReservaHabitacion.findByIdAndDelete(habitacionId);

    // 3. Quitar la referencia de la reserva de habitación del array del evento
    const evento = await ReservaEvento.findByIdAndUpdate(
      eventoId,
      { 
        $pull: { serviciosAdicionales: { reservaHabitacionId: habitacionId } },
        $inc: { totalHabitaciones: -1 } // Decrementar contador si lo usas
      },
      { new: true } // Opcional: devolver el evento actualizado
    );
    
    if (!evento) {
         console.warn(`Evento ${eventoId} no encontrado al intentar quitar referencia de habitación ${habitacionId}, pero la habitación fue eliminada.`);
         // La habitación se eliminó, así que consideramos la operación exitosa
    }

    res.status(200).json({ success: true, message: 'Habitación eliminada del evento correctamente.' });

  } catch (error) {
    console.error('Error eliminando habitación de evento:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.', error: error.message });
  }
};

/**
 * @desc    Asignar una reserva de evento a un administrador
 * @route   PUT /api/reservas/eventos/:id/asignar
 * @access  Private (Admin)
 */
exports.asignarEventoAdmin = async (req, res) => {
  try {
    const eventoId = req.params.id;
    const adminId = req.user.id; // ID del admin haciendo la petición

    // 1. Buscar el evento
    const evento = await ReservaEvento.findById(eventoId);
    if (!evento) {
      return res.status(404).json({ success: false, message: 'Reserva de evento no encontrada.' });
    }

    // 2. Asignar el evento al admin
    evento.asignadoA = adminId;
    await evento.save();
    console.log(`Evento ${eventoId} asignado a admin ${adminId}`);

    // 3. Buscar y asignar habitaciones asociadas
    const ReservaHabitacion = require('../models/ReservaHabitacion'); // Asegurar que el modelo está disponible
    const updateResult = await ReservaHabitacion.updateMany(
      { reservaEvento: eventoId }, // Condición: que pertenezcan a este evento
      { $set: { asignadoA: adminId } } // Actualización: asignar al mismo admin
    );
    console.log(`Actualizadas ${updateResult.modifiedCount} habitaciones asociadas al evento ${eventoId} para asignar a admin ${adminId}`);

    res.status(200).json({ 
      success: true, 
      message: 'Evento y habitaciones asociadas asignadas correctamente.', 
      data: evento // Opcional: devolver el evento actualizado
    });

  } catch (error) {
    console.error('Error asignando evento y habitaciones a admin:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.', error: error.message });
  }
};

/**
 * @desc    Obtener fechas ocupadas por eventos en un rango
 * @route   GET /api/reservas/eventos/fechas-en-rango
 * @access  Public
 */
const getEventDatesInRange = asyncHandler(async (req, res, next) => {
  const { fechaInicio, fechaFin } = req.query;

  if (!fechaInicio || !fechaFin) {
    return next(new ErrorResponse('Se requieren fechaInicio y fechaFin como parámetros query', 400));
  }

  const inicio = new Date(fechaInicio);
  inicio.setUTCHours(0, 0, 0, 0); // Asegurar inicio del día en UTC
  const fin = new Date(fechaFin);
  fin.setUTCHours(23, 59, 59, 999); // Asegurar fin del día en UTC

  if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
    return next(new ErrorResponse('Formato de fecha inválido', 400));
  }

  // Buscar eventos cuya fecha única caiga dentro del rango.
  // Incluimos eventos pendientes y confirmados.
  const eventos = await ReservaEvento.find({
    fecha: {
      $gte: inicio,
      $lte: fin
    },
    estadoReserva: { $in: ['pendiente', 'confirmada', 'pago_parcial'] } // Estados activos
  }).select('fecha'); // Solo necesitamos la fecha

  // Extraer las fechas y formatearlas a YYYY-MM-DD en UTC
  const occupiedDates = eventos.map(evento => {
    const date = new Date(evento.fecha);
    // Formatear a YYYY-MM-DD asegurando UTC para evitar problemas de zona horaria
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  // Devolver un array único de fechas
  res.status(200).json({
    success: true,
    count: [...new Set(occupiedDates)].length,
    data: [...new Set(occupiedDates)], // Asegurar fechas únicas
  });
});

module.exports = {
    createReservaEvento,
    obtenerReservasEvento: exports.obtenerReservasEvento,
    obtenerReservaEvento: exports.obtenerReservaEvento,
    actualizarReservaEvento: exports.actualizarReservaEvento,
    eliminarReservaEvento: exports.eliminarReservaEvento,
    checkEventoAvailability: exports.checkEventoAvailability,
    getEventoOccupiedDates: exports.getEventoOccupiedDates,
    assignReservaEvento: exports.assignReservaEvento,
    unassignReservaEvento: exports.unassignReservaEvento,
    obtenerHabitacionesEvento: exports.obtenerHabitacionesEvento,
    actualizarHabitacionEvento: exports.actualizarHabitacionEvento,
    getEventoServicios: exports.getEventoServicios,
    addEventoServicio: exports.addEventoServicio,
    removeEventoServicio: exports.removeEventoServicio,
    addHabitacionAEvento: exports.addHabitacionAEvento,
    removeHabitacionDeEvento: exports.removeHabitacionDeEvento,
    asignarEventoAdmin: exports.asignarEventoAdmin,
    getEventDatesInRange
};