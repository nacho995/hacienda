const ReservaEvento = require('../models/ReservaEvento');
const User = require('../models/User');
const TipoEvento = require('../models/TipoEvento');
const ReservaMasaje = require('../models/ReservaMasaje');
const ReservaHabitacion = require('../models/ReservaHabitacion');
const mongoose = require('mongoose');
const sendEmail = require('../utils/email');
const confirmacionTemplate = require('../emails/confirmacionReserva');
const confirmacionAdminTemplate = require('../emails/confirmacionAdmin');

/**
 * @desc    Crear una reserva de evento
 * @route   POST /api/reservas/eventos
 * @access  Public
 */
exports.crearReservaEvento = async (req, res) => {
  try {
    const { 
      nombreEvento,
      tipoEvento,
      nombreContacto,
      apellidosContacto,
      emailContacto,
      telefonoContacto,
      fecha,
      horaInicio,
      horaFin,
      espacioSeleccionado,
      numInvitados,
      peticionesEspeciales,
      presupuestoEstimado
    } = req.body;
    
    // Validar campos obligatorios
    if (!nombreEvento || !tipoEvento || !nombreContacto || !apellidosContacto || !emailContacto || !telefonoContacto || !fecha || !numInvitados) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, proporcione todos los campos obligatorios'
      });
    }

    // Buscar el tipo de evento por su ID
    const tipoEventoDoc = await TipoEvento.findById(tipoEvento);
    if (!tipoEventoDoc) {
      return res.status(400).json({
        success: false,
        message: `El tipo de evento no es válido`
      });
    }

    // Verificar disponibilidad para la fecha y hora solicitadas
    const disponible = await ReservaEvento.comprobarDisponibilidad(
      fecha,
      espacioSeleccionado || 'jardin',
      horaInicio || '12:00',
      horaFin || '18:00'
    );

    if (!disponible) {
      return res.status(400).json({
        success: false,
        message: 'El espacio no está disponible para la fecha y hora solicitadas'
      });
    }
    
    // Crear objeto para guardar
    const reservaData = {
      // Solo incluir usuario si está autenticado
      ...(req.user && req.user.id ? { usuario: req.user.id } : {}),
      nombreEvento,
      tipoEvento: tipoEventoDoc._id, // Usar el ObjectId del tipo de evento
      nombreContacto,
      apellidosContacto,
      emailContacto,
      telefonoContacto,
      fecha,
      horaInicio: horaInicio || '12:00',
      horaFin: horaFin || '18:00',
      espacioSeleccionado: espacioSeleccionado || 'jardin',
      numInvitados: parseInt(numInvitados),
      peticionesEspeciales: peticionesEspeciales || '',
      presupuestoEstimado: presupuestoEstimado || 0,
      serviciosAdicionales: {
        masajes: req.body.serviciosAdicionales?.masajes?.map(masaje => ({
          tipo: masaje.titulo,
          duracion: parseInt(masaje.duracion),
          precio: parseFloat(masaje.precio)
        })) || [],
        habitaciones: req.body.serviciosAdicionales?.habitaciones?.map(habitacion => ({
          tipoHabitacion: habitacion.tipoHabitacion,
          nombre: habitacion.nombre,
          fechaEntrada: habitacion.fechaEntrada,
          fechaSalida: habitacion.fechaSalida,
          numeroHabitaciones: habitacion.numeroHabitaciones,
          numHuespedes: habitacion.numHuespedes,
          precio: parseFloat(habitacion.precio)
        })) || []
      }
    };

    // Calcular precio base usando el precio del tipo de evento
    const precioBase = parseFloat(tipoEventoDoc.precio) || 0;

    // Calcular precio por invitado
    const precioPorInvitado = 350; // $350 por invitado
    const precioInvitados = parseInt(numInvitados) * precioPorInvitado;

    // Calcular precio por servicios adicionales
    let precioServicios = 0;
    if (req.body.serviciosAdicionales) {
      if (req.body.serviciosAdicionales.decoracion) precioServicios += 15000;
      if (req.body.serviciosAdicionales.musica) precioServicios += 12000;
      if (req.body.serviciosAdicionales.fotografo) precioServicios += 8000;
      if (req.body.serviciosAdicionales.transporte) precioServicios += 5000;
    }

    // Calcular precio por menú seleccionado
    let precioMenu = 0;
    switch (req.body.menuSeleccionado) {
      case 'Premium':
        precioMenu = parseInt(numInvitados) * 800;
        break;
      case 'Deluxe':
        precioMenu = parseInt(numInvitados) * 1200;
        break;
      case 'Personalizado':
        precioMenu = parseInt(numInvitados) * 1500;
        break;
      case 'Básico':
        precioMenu = parseInt(numInvitados) * 500;
        break;
    }

    // Calcular precio total
    const precioTotal = precioBase + precioInvitados + precioServicios + precioMenu;

    // Actualizar el objeto de reserva con el precio total
    reservaData.precio = precioTotal;

    // Crear la reserva del evento
    const reservaEvento = await ReservaEvento.create(reservaData);

    // Si hay masajes seleccionados, crear las reservas de masajes
    if (req.body.serviciosAdicionales?.masajes?.length > 0) {
      console.log('Procesando masajes:', JSON.stringify(req.body.serviciosAdicionales.masajes));
      
      try {
        // Procesar los masajes uno por uno en secuencia con mejor manejo de errores
        for (const masaje of req.body.serviciosAdicionales.masajes) {
          try {
            // Validar que tipoMasaje y precio estén presentes y sean válidos
            if (!masaje.tipoMasaje) {
              console.error('Error: masaje sin tipoMasaje', masaje);
              throw new Error('El tipo de masaje es requerido');
            }
            
            // Asegurarse que el precio es un número válido
            let precio;
            try {
              precio = parseFloat(masaje.precio);
              if (isNaN(precio) || precio <= 0) {
                precio = 0; // Valor por defecto para evitar error
                console.error('Error: precio del masaje inválido, estableciendo default', { 
                  precio: masaje.precio,
                  parseado: precio,
                  masaje: JSON.stringify(masaje)
                });
              }
            } catch (error) {
              precio = 0; // Valor por defecto para evitar error
              console.error('Error al parsear precio:', error);
            }
            
            console.log('Creando reserva de masaje con datos:', {
              tipoMasaje: masaje.tipoMasaje,
              duracion: ajustarDuracionValida(parseInt(masaje.duracion || 60)),
              hora: masaje.hora || horaInicio,
              fecha: masaje.fecha || fecha,
              precio
            });
            
            // Crear el documento de reserva de masaje
            const nuevoMasaje = {
              tipoMasaje: masaje.tipoMasaje,
              duracion: ajustarDuracionValida(parseInt(masaje.duracion || 60)),
              hora: masaje.hora || horaInicio || '10:00',
              fecha: masaje.fecha || fecha || new Date().toISOString().split('T')[0],
              nombreContacto: nombreContacto || '',
              apellidosContacto: apellidosContacto || '',
              emailContacto: emailContacto || '',
              telefonoContacto: telefonoContacto || '',
              precio: precio || 0, // Usar precio validado o 0 como fallback
              reservaEvento: reservaEvento._id,
              tipoReserva: 'Masaje' // Establecer explícitamente el discriminador
            };
            
            // Verificar que todos los campos de texto necesarios estén definidos para evitar errores de charAt()
            Object.keys(nuevoMasaje).forEach(key => {
              // Si el valor es undefined o null y esperamos una cadena, asignar una cadena vacía
              if ((nuevoMasaje[key] === undefined || nuevoMasaje[key] === null) && 
                 (key === 'hora' || key === 'fecha' || key === 'nombreContacto' || 
                  key === 'apellidosContacto' || key === 'emailContacto' || key === 'telefonoContacto')) {
                console.log(`Campo ${key} indefinido, asignando valor por defecto`);
                nuevoMasaje[key] = '';
              }
            });
            
            console.log('Objeto masaje validado antes de crear:', nuevoMasaje);
            
            // Crear el masaje y esperar a que se complete antes de continuar con el siguiente
            await ReservaMasaje.create(nuevoMasaje);
            console.log('✅ Masaje creado correctamente');
            
          } catch (masajeError) {
            console.error('Error al procesar masaje individual:', masajeError);
            console.error('Stack trace:', masajeError.stack);
            // Continuar con el siguiente masaje en lugar de detener todo el proceso
            // pero registramos un error detallado para diagnóstico
          }
        }
      } catch (masajesError) {
        console.error('Error al procesar grupo de masajes:', masajesError);
        console.error('Stack trace:', masajesError.stack);
        throw new Error(`Error al crear masajes: ${masajesError.message}`);
      }
    }

    // Si hay habitaciones seleccionadas, crear las reservas de habitaciones
    if (req.body.serviciosAdicionales?.habitaciones?.length > 0) {
      console.log('[DEBUG] Procesando habitaciones:', JSON.stringify(req.body.serviciosAdicionales.habitaciones, null, 2));
      console.log('[DEBUG] Total de habitaciones a procesar:', req.body.serviciosAdicionales.habitaciones.length);
      
      try {
        // Usar el método estático del modelo para procesar las habitaciones
        const datosEvento = {
          nombreContacto, 
          apellidosContacto, 
          emailContacto, 
          telefonoContacto,
          fecha
        };
        
        // Procesar las habitaciones una por una en secuencia con manejo de errores
        for (const habitacion of req.body.serviciosAdicionales.habitaciones) {
          try {
            console.log('[DEBUG] Procesando habitación individual:', JSON.stringify(habitacion, null, 2));
            
            // Validar que tipoHabitacion y precio estén presentes y sean válidos
            if (!habitacion.tipoHabitacion) {
              console.error('[ERROR] Habitación sin tipoHabitacion:', habitacion);
              throw new Error('El tipo de habitación es requerido');
            }
            
            // Asegurarse que el precio es un número válido
            let precio;
            try {
              precio = parseFloat(habitacion.precio);
              if (isNaN(precio) || precio <= 0) {
                precio = 0; // Valor por defecto para evitar error
                console.warn('[WARN] Precio de habitación inválido, estableciendo default:', { 
                  precio: habitacion.precio,
                  parseado: precio
                });
              }
            } catch (error) {
              precio = 0; // Valor por defecto para evitar error
              console.error('[ERROR] Error al parsear precio de habitación:', error);
            }

            // Crear la habitación usando el método estático del modelo
            const nuevaHabitacion = await ReservaHabitacion.crearDesdeReservaEvento(
              habitacion, 
              datosEvento, 
              reservaEvento._id
            );
            
            console.log('[DEBUG] Habitación creada correctamente:', nuevaHabitacion._id);
          } catch (habitacionError) {
            console.error('[ERROR] Error al procesar habitación individual:', habitacionError);
            console.error('[ERROR] Stack trace:', habitacionError.stack);
            // Continuar con la siguiente habitación en lugar de detener todo el proceso
          }
        }
      } catch (habitacionesError) {
        console.error('[ERROR] Error al procesar grupo de habitaciones:', habitacionesError);
        console.error('[ERROR] Stack trace:', habitacionesError.stack);
        throw new Error(`Error al crear habitaciones: ${habitacionesError.message}`);
      }
    }

    // Enviar email de confirmación al usuario
    try {
      await sendEmail({
        email: emailContacto,
        subject: 'Confirmación de Reserva de Evento - Hacienda San Carlos Borromeo',
        html: confirmacionTemplate({
          nombreContacto: nombreContacto,
          apellidosContacto: apellidosContacto,
          tipoEvento: tipoEvento,
          nombreEvento: nombreEvento,
          fecha: fecha,
          horaInicio: horaInicio || '12:00',
          horaFin: horaFin || '18:00',
          espacioSeleccionado: espacioSeleccionado || 'jardin',
          numeroInvitados: numInvitados,
          numeroConfirmacion: reservaEvento.numeroConfirmacion,
          estadoReserva: reservaEvento.estadoReserva,
          presupuestoEstimado: presupuestoEstimado || 0
        })
      });
  
      // Enviar email de notificación al administrador
      await sendEmail({
        email: process.env.EMAIL_ADMIN || 'admin@hacienda-sancarlos.com',
        subject: 'Nueva Reserva de Evento - Hacienda San Carlos Borromeo',
        html: confirmacionAdminTemplate({
          tipo: 'evento',
          cliente: `${nombreContacto} ${apellidosContacto}`,
          email: emailContacto,
          telefono: telefonoContacto,
          fecha: fecha,
          hora: `${horaInicio || '12:00'} - ${horaFin || '18:00'}`,
          detalles: `Tipo de evento: ${tipoEvento}, Número de personas: ${numInvitados}`,
          comentarios: peticionesEspeciales || 'No hay comentarios adicionales'
        })
      });
    } catch (emailError) {
      console.error('Error al enviar emails de confirmación:', emailError);
      // Continuamos con la respuesta aunque falle el envío de emails
    }

    res.status(201).json({
      success: true,
      data: reservaEvento
    });
  } catch (error) {
    console.error('Error al crear reserva de evento:', error);
    res.status(500).json({
      success: false,
      message: 'No se pudo crear la reserva',
      error: error.message
    });
  }
};

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
      .populate('usuario', 'nombre apellidos email telefono')
      .populate('tipoEvento', 'titulo descripcion imagen')
      .populate('asignadoA', 'nombre apellidos email')
      .sort({ fecha: 1, horaInicio: 1 });
      
    res.status(200).json({
      success: true,
      count: reservas.length,
      data: reservas
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
    const reserva = await ReservaEvento.findById(req.params.id)
      .populate('usuario', 'nombre apellidos email telefono')
      .populate('asignadoA', 'nombre apellidos email');
      
    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }
    
    // Temporalmente desactivada la verificación de permisos para debugging
    // Comentado: Verificar que el usuario tenga acceso a esta reserva
    // if (reserva.usuario && reserva.usuario._id && 
    //     reserva.usuario._id.toString() !== req.user.id && 
    //     req.user.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'No tienes permiso para ver esta reserva'
    //   });
    // }
    
    res.status(200).json({
      success: true,
      data: reserva
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
    
    // Temporalmente desactivada la verificación de permisos para debugging
    // if (reserva.usuario && reserva.usuario.toString() !== req.user.id && req.user.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'No tienes permiso para actualizar esta reserva'
    //   });
    // }
    
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
    
    // Actualizar la reserva
    reserva = await ReservaEvento.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('usuario', 'nombre apellidos email telefono')
     .populate('asignadoA', 'nombre apellidos email');
    
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
    
    // Temporalmente desactivada la verificación de permisos para debugging
    // if (reserva.usuario && reserva.usuario.toString() !== req.user.id && req.user.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'No tienes permiso para eliminar esta reserva'
    //   });
    // }
    
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
 * @desc    Comprobar disponibilidad de espacios para eventos
 * @route   POST /api/reservas/eventos/disponibilidad
 * @access  Public
 */
exports.comprobarDisponibilidadEvento = async (req, res) => {
  try {
    const { fecha, espacio, horaInicio, horaFin } = req.body;
    
    // Verificar todos los parámetros requeridos
    if (!fecha || !horaInicio || !horaFin) {
      return res.status(400).json({
        success: false,
        disponible: false,
        mensaje: 'Por favor proporciona fecha, hora de inicio y hora de fin'
      });
    }
    
    // Si no se especifica el espacio, usar el predeterminado
    const espacioSeleccionado = espacio || 'jardin';
    
    // Verificar que el espacio sea válido
    if (!['salon', 'jardin', 'terraza'].includes(espacioSeleccionado)) {
      return res.status(400).json({
        success: false,
        disponible: false,
        mensaje: 'Espacio no válido. Los espacios válidos son: salon, jardin, terraza'
      });
    }
    
    // Verificar disponibilidad
    const disponible = await ReservaEvento.comprobarDisponibilidad(
      fecha,
      espacioSeleccionado,
      horaInicio,
      horaFin
    );
    
    // Enviar respuesta con formato consistente
    res.status(200).json({
      success: true,
      disponible: disponible,
      mensaje: disponible ? 'El espacio está disponible' : 'El espacio no está disponible para la fecha y hora seleccionadas'
    });
  } catch (error) {
    console.error('Error al comprobar disponibilidad de evento:', error);
    res.status(500).json({
      success: false,
      disponible: false,
      mensaje: error.message || 'Error al comprobar disponibilidad'
    });
  }
};

/**
 * @desc    Asignar reserva de evento a un usuario
 * @route   PUT /api/reservas/eventos/:id/asignar
 * @access  Private/Admin
 */
exports.asignarReservaEvento = async (req, res) => {
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
 * @desc    Asignar una reserva a un usuario
 * @route   PUT /api/reservas/eventos/:id/asignar
 * @access  Private
 */
exports.asignarReserva = async (req, res) => {
  try {
    const reserva = await ReservaEvento.findById(req.params.id);

    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }

    // Asignar al usuario actual
    reserva.asignadoA = req.user.id;
    await reserva.save();

    res.status(200).json({
      success: true,
      data: reserva,
      message: 'Reserva asignada exitosamente'
    });
  } catch (error) {
    console.error('Error al asignar reserva:', error);
    res.status(500).json({
      success: false,
      message: 'No se pudo asignar la reserva',
      error: error.message
    });
  }
};

/**
 * @desc    Desasignar una reserva
 * @route   PUT /api/reservas/eventos/:id/desasignar
 * @access  Private
 */
exports.desasignarReserva = async (req, res) => {
  try {
    const reserva = await ReservaEvento.findById(req.params.id);

    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }

    // Verificar que el usuario actual es quien tiene asignada la reserva
    if (reserva.asignadoA && reserva.asignadoA.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para desasignar esta reserva'
      });
    }

    // Desasignar reserva
    reserva.asignadoA = null;
    await reserva.save();

    res.status(200).json({
      success: true,
      data: reserva,
      message: 'Reserva desasignada exitosamente'
    });
  } catch (error) {
    console.error('Error al desasignar reserva:', error);
    res.status(500).json({
      success: false,
      message: 'No se pudo desasignar la reserva',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener fechas ocupadas para eventos
 * @route   GET /api/reservas/eventos/fechas-ocupadas
 * @access  Public
 */
exports.obtenerFechasOcupadas = async (req, res) => {
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
      query.fecha = {
        $gte: new Date(fechaInicio),
        $lte: new Date(fechaFin)
      };
    } else if (fechaInicio) {
      // Solo hay fecha de inicio
      query.fecha = { $gte: new Date(fechaInicio) };
    } else if (fechaFin) {
      // Solo hay fecha de fin
      query.fecha = { $lte: new Date(fechaFin) };
    } else {
      // Si no hay fechas, establecer un rango por defecto (próximos 12 meses)
      const hoy = new Date();
      const finPeriodo = new Date();
      finPeriodo.setFullYear(hoy.getFullYear() + 1);
      
      query.fecha = {
        $gte: hoy,
        $lte: finPeriodo
      };
    }
    
    // Proyectar solo los campos necesarios: fecha, horaInicio, horaFin, espacioSeleccionado
    const reservas = await ReservaEvento.find(query, 'fecha horaInicio horaFin espacioSeleccionado')
      .sort({ fecha: 1, horaInicio: 1 });
    
    // Agrupar por fechas para enviar un formato más simple al frontend
    const fechasOcupadas = reservas.map(reserva => ({
      fecha: reserva.fecha,
      espacioSeleccionado: reserva.espacioSeleccionado,
      horaInicio: reserva.horaInicio,
      horaFin: reserva.horaFin
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