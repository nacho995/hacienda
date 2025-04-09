const Habitacion = require('../models/Habitacion');

// @desc    Obtener todas las habitaciones
// @route   GET /api/habitaciones
// @access  Public
exports.obtenerHabitaciones = async (req, res) => {
  try {
    const habitaciones = await Habitacion.find().populate({
      path: 'tipoHabitacion',
      strictPopulate: false
    });
    
    res.status(200).json({
      success: true,
      count: habitaciones.length,
      data: habitaciones
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las habitaciones'
    });
  }
};

// @desc    Obtener todas las habitaciones por planta
// @route   GET /api/habitaciones/planta/:planta
// @access  Public
exports.obtenerHabitacionesPorPlanta = async (req, res) => {
  try {
    const habitaciones = await Habitacion.find({ planta: req.params.planta }).populate({
      path: 'tipoHabitacion',
      strictPopulate: false
    });
    
    res.status(200).json({
      success: true,
      count: habitaciones.length,
      data: habitaciones
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las habitaciones por planta'
    });
  }
};

// @desc    Obtener una habitación por letra
// @route   GET /api/habitaciones/:letra
// @access  Public
exports.obtenerHabitacion = async (req, res) => {
  try {
    const habitacion = await Habitacion.findOne({ letra: req.params.letra }).populate({
      path: 'tipoHabitacion',
      strictPopulate: false
    });
    
    if (!habitacion) {
      return res.status(404).json({
        success: false,
        message: `No se encontró la habitación con la letra ${req.params.letra}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: habitacion
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la habitación'
    });
  }
};

// @desc    Crear una nueva habitación
// @route   POST /api/habitaciones
// @access  Private/Admin
exports.crearHabitacion = async (req, res) => {
  try {
    const habitacion = await Habitacion.create(req.body);
    
    res.status(201).json({
      success: true,
      data: habitacion
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la habitación'
    });
  }
};

// @desc    Actualizar una habitación
// @route   PUT /api/habitaciones/:letra
// @access  Private/Admin
exports.actualizarHabitacion = async (req, res) => {
  try {
    const habitacion = await Habitacion.findOneAndUpdate(
      { letra: req.params.letra },
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate({
      path: 'tipoHabitacion',
      strictPopulate: false
    });
    
    if (!habitacion) {
      return res.status(404).json({
        success: false,
        message: `No se encontró la habitación con la letra ${req.params.letra}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: habitacion
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la habitación'
    });
  }
};

// @desc    Eliminar una habitación
// @route   DELETE /api/habitaciones/:letra
// @access  Private/Admin
exports.eliminarHabitacion = async (req, res) => {
  try {
    const habitacion = await Habitacion.findOneAndDelete({ letra: req.params.letra });
    
    if (!habitacion) {
      return res.status(404).json({
        success: false,
        message: `No se encontró la habitación con la letra ${req.params.letra}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la habitación'
    });
  }
};

// @desc    Obtener habitaciones disponibles para un evento
// @route   GET /api/habitaciones/disponibles
// @access  Public
exports.obtenerHabitacionesDisponibles = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, planta } = req.query;
    
    // Construir la consulta base
    let query = {
      estado: 'Disponible'
    };
    
    // Si se especifica una planta, agregar al filtro
    if (planta) {
      query.planta = planta;
    }
    
    const habitaciones = await Habitacion.find(query).populate({
      path: 'tipoHabitacion',
      strictPopulate: false
    });
    
    res.status(200).json({
      success: true,
      count: habitaciones.length,
      data: habitaciones
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las habitaciones disponibles'
    });
  }
};