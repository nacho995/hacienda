const Habitacion = require('../models/Habitacion');

// @desc    Obtener todas las habitaciones
// @route   GET /api/habitaciones
// @access  Public
exports.obtenerHabitaciones = async (req, res) => {
  try {
    const habitaciones = await Habitacion.find();
    
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

// @desc    Obtener una habitación por ID
// @route   GET /api/habitaciones/:id
// @access  Public
exports.obtenerHabitacion = async (req, res) => {
  try {
    const habitacion = await Habitacion.findById(req.params.id);
    
    if (!habitacion) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró la habitación con ese ID'
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
// @route   PUT /api/habitaciones/:id
// @access  Private/Admin
exports.actualizarHabitacion = async (req, res) => {
  try {
    const habitacion = await Habitacion.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!habitacion) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró la habitación con ese ID'
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
// @route   DELETE /api/habitaciones/:id
// @access  Private/Admin
exports.eliminarHabitacion = async (req, res) => {
  try {
    const habitacion = await Habitacion.findByIdAndDelete(req.params.id);
    
    if (!habitacion) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró la habitación con ese ID'
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