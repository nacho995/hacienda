const ReservaEvento = require('../models/ReservaEvento');
const User = require('../models/User');
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
      numeroInvitados,
      peticionesEspeciales,
      presupuestoEstimado
    } = req.body;
    
    // Validar campos obligatorios
    if (!nombreEvento || !tipoEvento || !nombreContacto || !apellidosContacto || !emailContacto || !telefonoContacto || !fecha || !numeroInvitados) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, proporcione todos los campos obligatorios'
      });
    }

    // Validar que tipoEvento tenga un valor válido
    const tiposEventoValidos = ['Boda', 'Cumpleaños', 'Corporativo', 'Aniversario', 'Otro'];
    if (!tiposEventoValidos.includes(tipoEvento)) {
      return res.status(400).json({
        success: false,
        message: `El tipo de evento '${tipoEvento}' no es válido. Tipos válidos: ${tiposEventoValidos.join(', ')}`
      });
    }

    // Verificar disponibilidad para la fecha y hora solicitadas
    const disponible = await ReservaEvento.comprobarDisponibilidad(
      espacioSeleccionado || 'Jardín Principal',
      fecha,
      horaInicio || '12:00',
      horaFin || '18:00'
    );

    if (!disponible.disponible) {
      return res.status(400).json({
        success: false,
        message: disponible.mensaje || 'El espacio no está disponible para la fecha y hora solicitadas'
      });
    }
    
    // Crear objeto para guardar
    const reservaData = {
      // Solo incluir usuario si está autenticado
      ...(req.user && req.user.id ? { usuario: req.user.id } : {}),
      nombreEvento,
      tipoEvento,
      nombreContacto,
      apellidosContacto,
      emailContacto,
      telefonoContacto,
      fecha,
      horaInicio: horaInicio || '12:00',
      horaFin: horaFin || '18:00',
      espacioSeleccionado: espacioSeleccionado || 'Jardín Principal',
      numeroInvitados,
      peticionesEspeciales: peticionesEspeciales || '',
      presupuestoEstimado: presupuestoEstimado || 0
    };

    // Calcular precio base según el tipo de evento
    let precioBase = 0;
    switch (tipoEvento) {
      case 'Boda':
        precioBase = 50000; // Precio base para bodas
        break;
      case 'Cumpleaños':
        precioBase = 25000; // Precio base para cumpleaños
        break;
      case 'Corporativo':
        precioBase = 35000; // Precio base para eventos corporativos
        break;
      case 'Aniversario':
        precioBase = 30000; // Precio base para aniversarios
        break;
      default:
        precioBase = 20000; // Precio base para otros eventos
    }

    // Calcular precio por invitado
    const precioPorInvitado = 350; // $350 por invitado
    const precioInvitados = numeroInvitados * precioPorInvitado;

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
        precioMenu = numeroInvitados * 800;
        break;
      case 'Deluxe':
        precioMenu = numeroInvitados * 1200;
        break;
      case 'Personalizado':
        precioMenu = numeroInvitados * 1500;
        break;
      case 'Básico':
        precioMenu = numeroInvitados * 500;
        break;
    }

    // Calcular precio total
    const precioTotal = precioBase + precioInvitados + precioServicios + precioMenu;

    // Actualizar el objeto de reserva con el precio total
    reservaData.precio = precioTotal;

    // Crear la reserva
    const reserva = await ReservaEvento.create(reservaData);

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
          espacioSeleccionado: espacioSeleccionado || 'Jardín Principal',
          numeroInvitados: numeroInvitados,
          numeroConfirmacion: reserva.numeroConfirmacion,
          estadoReserva: reserva.estadoReserva,
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
          detalles: `Tipo de evento: ${tipoEvento}, Número de personas: ${numeroInvitados}`,
          comentarios: peticionesEspeciales || 'No hay comentarios adicionales'
        })
      });
    } catch (emailError) {
      console.error('Error al enviar emails de confirmación:', emailError);
      // Continuamos con la respuesta aunque falle el envío de emails
    }

    res.status(201).json({
      success: true,
      data: reserva
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
    }
    
    // Filtros opcionales
    if (req.query.fecha) {
      // Formato ISO YYYY-MM-DD
      const fechaInicio = new Date(req.query.fecha);
      fechaInicio.setHours(0, 0, 0, 0);
      
      const fechaFin = new Date(req.query.fecha);
      fechaFin.setHours(23, 59, 59, 999);
      
      query.fechaEvento = {
        $gte: fechaInicio,
        $lte: fechaFin
      };
    }

    // Filtro opcional para mostrar solo reservas sin asignar
    if (req.query.sinAsignar === 'true') {
      query.asignadoA = null;
    }
    
    const reservas = await ReservaEvento.find(query)
      .populate('usuario', 'nombre apellidos email telefono')
      .populate('asignadoA', 'nombre apellidos email')
      .sort({ fechaEvento: 1, horaInicio: 1 });
      
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
    
    // Si se cambia la fecha u hora, verificar disponibilidad
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
        espacio,
        fecha,
        horaInicio,
        horaFin,
        reserva._id // Excluir la reserva actual de la verificación
      );
      
      if (!disponible.disponible) {
        return res.status(400).json({
          success: false,
          message: disponible.mensaje || 'El espacio no está disponible para la fecha y hora solicitadas'
        });
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
    const { fechaEvento, horaInicio, horaFin, espacioSeleccionado } = req.body;
    
    // Verificar todos los parámetros requeridos
    if (!fechaEvento || !horaInicio || !horaFin) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona fecha, hora de inicio y hora de fin'
      });
    }
    
    // Si no se especifica el espacio, usar el predeterminado
    const espacio = espacioSeleccionado || 'Jardín Principal';
    
    // Verificar disponibilidad
    const disponible = await ReservaEvento.comprobarDisponibilidad(
      espacio,
      fechaEvento,
      horaInicio,
      horaFin
    );
    
    res.status(200).json({
      success: true,
      disponible
    });
  } catch (error) {
    console.error('Error al comprobar disponibilidad de evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al comprobar disponibilidad',
      error: error.message
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
    
    if (!usuarioId) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, proporcione el ID del usuario al que se asignará la reserva'
      });
    }
    
    // Verificar que el usuario existe
    const usuario = await User.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
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
    reserva.asignadoA = usuarioId;
    await reserva.save();
    
    res.status(200).json({
      success: true,
      data: reserva
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