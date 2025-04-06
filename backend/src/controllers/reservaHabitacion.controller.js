const ReservaHabitacion = require('../models/ReservaHabitacion');
const User = require('../models/User');
const sendEmail = require('../utils/email');
const emailConfirmacionReserva = require('../emails/confirmacionReserva');

// @desc    Crear una nueva reserva de habitación
// @route   POST /api/reservas/habitaciones
// @access  Public
exports.crearReservaHabitacion = async (req, res) => {
  try {
    // Si hay un usuario autenticado, usar su ID
    if (req.user) {
      req.body.usuario = req.user.id;
    } else {
      // Si no hay usuario autenticado, crear la reserva con un ID temporal
      req.body.usuario = process.env.GUEST_USER_ID || '65f3829ead6cc5d7c8c26e62';
    }
    
    // Comprobar disponibilidad
    const { tipoHabitacion, habitacion, fechaEntrada, fechaSalida, numeroHabitaciones } = req.body;
    
    const disponibilidad = await ReservaHabitacion.comprobarDisponibilidad(
      tipoHabitacion,
      fechaEntrada,
      fechaSalida,
      numeroHabitaciones
    );
    
    if (!disponibilidad.disponible) {
      return res.status(400).json({
        success: false,
        message: disponibilidad.mensaje
      });
    }

    // Obtener el precio de la habitación
    const Habitacion = require('../models/Habitacion');
    const habitacionInfo = await Habitacion.findOne({ nombre: habitacion });

    if (!habitacionInfo) {
      return res.status(400).json({
        success: false,
        message: 'No se encontró la habitación especificada'
      });
    }

    // Calcular la duración de la estancia en días
    const fechaInicioObj = new Date(fechaEntrada);
    const fechaFinObj = new Date(fechaSalida);
    const duracionEstancia = Math.ceil((fechaFinObj - fechaInicioObj) / (1000 * 60 * 60 * 24));

    // Calcular el precio total
    const precioTotal = habitacionInfo.precio * duracionEstancia * numeroHabitaciones;

    // Crear la reserva con el precio total calculado
    const reserva = await ReservaHabitacion.create({
      ...req.body,
      precioTotal
    });
    
    // Enviar email de confirmación
    try {
      await sendEmail({
        email: reserva.email,
        subject: 'Confirmación de reserva - Hacienda San Carlos Borromeo',
        html: emailConfirmacionReserva('habitacion', reserva)
      });
    } catch (err) {
      console.error('Error al enviar email de confirmación:', err);
      // No impedimos que se complete la reserva si el email falla
    }
    
    res.status(201).json({
      success: true,
      data: reserva
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la reserva de habitación'
    });
  }
};

// @desc    Obtener todas las reservas de habitaciones
// @route   GET /api/reservas/habitaciones
// @access  Public/Private
exports.obtenerReservasHabitacion = async (req, res) => {
  try {
    let query = { estado: { $ne: 'cancelada' } };
    
    // Si el usuario está autenticado y es admin, puede ver reservas según filtros
    if (req.user && req.user.role === 'admin') {
      // Filtros para administradores
      if (req.query.misReservas === 'true') {
        // Ver solo las reservas asignadas al admin actual
        query.asignadoA = req.user.id;
      } else if (req.query.disponibles === 'true' || req.query.sinAsignar === 'true') {
        // Ver solo las reservas no asignadas (disponibles)
        query.asignadoA = null;
      } else {
        // Sin filtros específicos, mostrar tanto las asignadas a este admin como las sin asignar
        query = {
          estado: { $ne: 'cancelada' }, // mantener filtro de estado
          $or: [
            { asignadoA: req.user.id },
            { asignadoA: null }
          ]
        };
      }
    } else if (req.user) {
      // Usuario autenticado normal: ver sus propias reservas
      query = {
        estado: { $ne: 'cancelada' }, // mantener filtro de estado
        $or: [
          { usuario: req.user.id },
          { asignadoA: req.user.id }
        ]
      };
    } else {
      // Acceso público: solo ver reservas activas y futuras
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      query = {
        estado: { $ne: 'cancelada' },
        fechaSalida: { $gte: today }
      };
    }
    
    console.log('Consulta para obtener reservas de habitaciones:', JSON.stringify(query));
    
    // Ejecutar query
    const reservas = await ReservaHabitacion.find(query)
      .populate('usuario', 'nombre apellidos email telefono')
      .populate('asignadoA', 'nombre apellidos email')
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: reservas.length,
      data: reservas
    });
  } catch (error) {
    console.error('Error al obtener las reservas de habitación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las reservas de habitación',
      error: error.message
    });
  }
};

// @desc    Obtener una reserva de habitación por ID
// @route   GET /api/reservas/habitaciones/:id
// @access  Private
exports.obtenerReservaHabitacion = async (req, res) => {
  try {
    const reserva = await ReservaHabitacion.findById(req.params.id).populate({
      path: 'usuario',
      select: 'nombre apellidos email telefono'
    });
    
    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró la reserva con ese ID'
      });
    }
    
    // Asegurarse de que el usuario es propietario de la reserva o es admin
    if (reserva.usuario.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No está autorizado para acceder a esta reserva'
      });
    }
    
    res.status(200).json({
      success: true,
      data: reserva
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la reserva de habitación'
    });
  }
};

// @desc    Actualizar una reserva de habitación
// @route   PUT /api/reservas/habitaciones/:id
// @access  Private
exports.actualizarReservaHabitacion = async (req, res) => {
  try {
    let reserva = await ReservaHabitacion.findById(req.params.id);
    
    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró la reserva con ese ID'
      });
    }
    
    // Asegurarse de que el usuario es propietario de la reserva o es admin
    if (reserva.usuario.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No está autorizado para actualizar esta reserva'
      });
    }
    
    // Si se está cambiando la fecha, tipo o número de habitaciones, verificar disponibilidad
    if (
      req.body.tipoHabitacion || 
      req.body.fechaEntrada || 
      req.body.fechaSalida || 
      req.body.numeroHabitaciones
    ) {
      const tipoHabitacion = req.body.tipoHabitacion || reserva.tipoHabitacion;
      const fechaEntrada = req.body.fechaEntrada || reserva.fechaEntrada;
      const fechaSalida = req.body.fechaSalida || reserva.fechaSalida;
      const numeroHabitaciones = req.body.numeroHabitaciones || reserva.numeroHabitaciones;
      
      const disponibilidad = await ReservaHabitacion.comprobarDisponibilidad(
        tipoHabitacion,
        fechaEntrada,
        fechaSalida,
        numeroHabitaciones
      );
      
      if (!disponibilidad.disponible) {
        return res.status(400).json({
          success: false,
          message: disponibilidad.mensaje
        });
      }
    }
    
    // No permitir cambiar el usuario de la reserva
    delete req.body.usuario;
    
    reserva = await ReservaHabitacion.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: reserva
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la reserva de habitación'
    });
  }
};

// @desc    Eliminar una reserva de habitación
// @route   DELETE /api/reservas/habitaciones/:id
// @access  Private
exports.eliminarReservaHabitacion = async (req, res) => {
  try {
    console.log('Intentando eliminar reserva de habitación con ID:', req.params.id);
    
    // Validar que el ID sea válido para MongoDB
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('ID de reserva no válido:', req.params.id);
      return res.status(400).json({
        success: false,
        message: 'ID de reserva no válido'
      });
    }
    
    const reserva = await ReservaHabitacion.findById(req.params.id);
    
    if (!reserva) {
      console.log('Reserva no encontrada con ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'No se encontró la reserva con ese ID'
      });
    }
    
    console.log('Datos de la reserva encontrada:', {
      id: reserva._id,
      habitacion: reserva.habitacion,
      usuario: reserva.usuario,
      fechaEntrada: reserva.fechaEntrada,
      fechaSalida: reserva.fechaSalida
    });
    
    // Asegurarse de que el usuario es propietario de la reserva o es admin
    // Verificación segura para evitar error "Cannot read properties of undefined"
    if ((reserva.usuario && reserva.usuario.toString() !== req.user.id) && req.user.role !== 'admin') {
      console.log('Usuario sin autorización. Usuario actual:', req.user.id, 'Usuario de la reserva:', reserva.usuario);
      return res.status(403).json({
        success: false,
        message: 'No está autorizado para eliminar esta reserva'
      });
    }
    
    await reserva.deleteOne();
    console.log('Reserva eliminada exitosamente');
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error al eliminar reserva de habitación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la reserva de habitación'
    });
  }
};

// @desc    Comprobar disponibilidad de habitaciones
// @route   POST /api/reservas/habitaciones/disponibilidad
// @access  Public
exports.comprobarDisponibilidadHabitacion = async (req, res) => {
  try {
    console.log('Comprobando disponibilidad de habitación:', req.body);
    
    const { 
      tipoHabitacion, 
      habitacion,
      fechaEntrada, 
      fechaSalida,
      numeroHabitaciones = 1
    } = req.body;
    
    if (!tipoHabitacion && !habitacion) {
      return res.status(400).json({
        success: false,
        disponible: false,
        mensaje: 'Debe proporcionar un tipo de habitación o una habitación específica'
      });
    }
    
    if (!fechaEntrada || !fechaSalida) {
      return res.status(400).json({
        success: false,
        disponible: false,
        mensaje: 'Debe proporcionar fechas de entrada y salida'
      });
    }
    
    // Buscar la habitación en la base de datos, ya sea por tipo o por nombre específico
    let habitacionQuery = {};
    
    if (habitacion) {
      // Buscar por número de habitación o nombre
      habitacionQuery = {
        $or: [
          { nombre: habitacion },
          { numeroHabitacion: habitacion }
        ]
      };
    } else if (tipoHabitacion) {
      // Buscar por tipo de habitación
      habitacionQuery = { tipo: tipoHabitacion };
    }
    
    const Habitacion = require('../models/Habitacion');
    const habitaciones = await Habitacion.find(habitacionQuery);
    
    console.log(`Encontradas ${habitaciones.length} habitaciones que coinciden con la consulta`);
    
    if (habitaciones.length === 0) {
      return res.status(404).json({
        success: false,
        disponible: false,
        mensaje: habitacion 
          ? `No se encontró la habitación ${habitacion}` 
          : `No se encontraron habitaciones de tipo ${tipoHabitacion}`
      });
    }
    
    // Si tenemos un habitación específica, verificar solo esa
    const habitacionesAVerificar = habitacion ? [habitaciones[0]] : habitaciones;
    
    const habitacionesDisponibles = [];
    
    // Para cada habitación que coincide con el criterio, verificar si está disponible
    for (const habitacionInfo of habitacionesAVerificar) {
      const ReservaHabitacion = require('../models/ReservaHabitacion');
      
      // Buscar reservas que se solapan con las fechas solicitadas
      const reservas = await ReservaHabitacion.find({
        $or: [
          // Reservas que tienen esta habitación específica asignada
          { habitacion: habitacionInfo.nombre },
          { habitacion: habitacionInfo.numeroHabitacion },
          
          // O reservas que son del mismo tipo y no tienen una habitación específica asignada
          { 
            tipoHabitacion: habitacionInfo.tipo,
            habitacion: { $exists: false }
          },
          {
            tipoHabitacion: habitacionInfo.tipo,
            habitacion: null
          }
        ],
        // No incluir reservas canceladas
        estado: { $ne: 'cancelada' },
        // Verificar solapamiento de fechas
        $or: [
          {
            fechaEntrada: { $lte: new Date(fechaSalida) },
            fechaSalida: { $gte: new Date(fechaEntrada) }
          }
        ]
      });
      
      console.log(`Habitación ${habitacionInfo.nombre} (${habitacionInfo.numeroHabitacion}): ${reservas.length} reservas encontradas para las fechas solicitadas`);
      
      // Si no hay reservas que se solapen, esta habitación está disponible
      if (reservas.length === 0) {
        habitacionesDisponibles.push(habitacionInfo);
      }
    }
    
    console.log(`Total de habitaciones disponibles: ${habitacionesDisponibles.length}`);
    
    // Verificar si tenemos suficientes habitaciones disponibles
    const hayDisponibilidad = habitacionesDisponibles.length >= numeroHabitaciones;
    
    const respuesta = {
      success: true,
      disponible: hayDisponibilidad,
      mensaje: hayDisponibilidad
        ? `Hay ${habitacionesDisponibles.length} habitaciones disponibles`
        : `Lo sentimos, solo quedan ${habitacionesDisponibles.length} habitaciones disponibles`,
      habitacionesRestantes: habitacionesDisponibles.length,
      // Incluir información de las habitaciones disponibles
      habitacionesDisponibles: habitacionesDisponibles.map(h => ({
        id: h._id,
        nombre: h.nombre,
        tipo: h.tipo,
        numero: h.numeroHabitacion
      }))
    };
    
    console.log('Enviando respuesta:', respuesta);
    res.status(200).json(respuesta);
  } catch (error) {
    console.error('Error al comprobar disponibilidad:', error);
    res.status(500).json({
      success: false,
      disponible: false,
      mensaje: 'Error al comprobar disponibilidad: ' + error.message
    });
  }
};

/**
 * @desc    Asignar reserva de habitación a un usuario
 * @route   PUT /api/reservas/habitaciones/:id/asignar
 * @access  Private/Admin
 */
exports.asignarReservaHabitacion = async (req, res) => {
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
    const reserva = await ReservaHabitacion.findById(req.params.id);
    
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
    console.error('Error al asignar la reserva de habitación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al asignar la reserva de habitación',
      error: error.message
    });
  }
};

/**
 * @desc    Desasignar una reserva de habitación
 * @route   PUT /api/reservas/habitaciones/:id/desasignar
 * @access  Private/Admin
 */
exports.desasignarReservaHabitacion = async (req, res) => {
  try {
    // Buscar la reserva
    const reserva = await ReservaHabitacion.findById(req.params.id);
    
    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró la reserva con ese ID'
      });
    }
    
    // Verificar que el usuario actual es quien tiene asignada la reserva o es admin
    if (reserva.asignadoA && reserva.asignadoA.toString() !== req.user.id && req.user.role !== 'admin') {
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
      message: 'Reserva de habitación desasignada exitosamente'
    });
  } catch (error) {
    console.error('Error al desasignar la reserva de habitación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al desasignar la reserva de habitación',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener fechas ocupadas para habitaciones
 * @route   GET /api/reservas/habitaciones/fechas-ocupadas
 * @access  Public
 */
exports.obtenerFechasOcupadas = async (req, res) => {
  try {
    // Parámetros opcionales para filtrar por tipo de habitación y fechas
    const { tipoHabitacion, fechaInicio, fechaFin } = req.query;
    
    // Construir el query
    const query = {
      estadoReserva: { $ne: 'cancelada' }
    };
    
    // Si se especifica un tipo de habitación, filtrar por él
    if (tipoHabitacion) {
      query.tipoHabitacion = tipoHabitacion;
    }
    
    // Si hay fechas de inicio y fin, filtrar el rango
    if (fechaInicio && fechaFin) {
      // Para habitaciones, hay que considerar todo el rango de fechas (entrada a salida)
      query.$or = [
        // Fecha entrada está dentro del rango solicitado
        {
          fechaEntrada: {
            $gte: new Date(fechaInicio),
            $lte: new Date(fechaFin)
          }
        },
        // Fecha salida está dentro del rango solicitado
        {
          fechaSalida: {
            $gte: new Date(fechaInicio),
            $lte: new Date(fechaFin)
          }
        },
        // El rango solicitado está completamente dentro de la estancia
        {
          fechaEntrada: { $lte: new Date(fechaInicio) },
          fechaSalida: { $gte: new Date(fechaFin) }
        }
      ];
    } else if (fechaInicio) {
      // Solo hay fecha de inicio (buscar reservas desde esa fecha)
      query.fechaSalida = { $gte: new Date(fechaInicio) };
    } else if (fechaFin) {
      // Solo hay fecha de fin (buscar reservas hasta esa fecha)
      query.fechaEntrada = { $lte: new Date(fechaFin) };
    } else {
      // Si no hay fechas, establecer un rango por defecto (próximos 12 meses)
      const hoy = new Date();
      const finPeriodo = new Date();
      finPeriodo.setFullYear(hoy.getFullYear() + 1);
      
      query.$or = [
        { fechaEntrada: { $gte: hoy, $lte: finPeriodo } },
        { fechaSalida: { $gte: hoy, $lte: finPeriodo } },
        { fechaEntrada: { $lte: hoy }, fechaSalida: { $gte: finPeriodo } }
      ];
    }
    
    // Proyectar solo los campos necesarios
    const reservas = await ReservaHabitacion.find(query, 'fechaEntrada fechaSalida tipoHabitacion numeroHabitaciones')
      .sort({ fechaEntrada: 1 });
    
    // Preparar datos para el frontend
    const fechasOcupadas = reservas.map(reserva => ({
      fechaEntrada: reserva.fechaEntrada,
      fechaSalida: reserva.fechaSalida,
      tipoHabitacion: reserva.tipoHabitacion,
      numeroHabitaciones: reserva.numeroHabitaciones
    }));
    
    res.status(200).json({
      success: true,
      data: fechasOcupadas
    });
  } catch (error) {
    console.error('Error al obtener fechas ocupadas de habitaciones:', error);
    res.status(500).json({
      success: false,
      message: 'No se pudieron obtener las fechas ocupadas',
      error: error.message
    });
  }
}; 