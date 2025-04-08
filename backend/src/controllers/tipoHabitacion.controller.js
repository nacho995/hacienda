const TipoHabitacion = require('../models/TipoHabitacion');

// @desc    Obtener todos los tipos de habitaciones
// @route   GET /api/tiposhabitacion
// @access  Public
exports.obtenerTiposHabitacion = async (req, res) => {
  try {
    const tiposHabitacion = await TipoHabitacion.find();
    
    res.status(200).json({
      success: true,
      count: tiposHabitacion.length,
      data: tiposHabitacion
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los tipos de habitaciones'
    });
  }
};

// @desc    Obtener un tipo de habitación por ID
// @route   GET /api/tiposhabitacion/:id
// @access  Public
exports.obtenerTipoHabitacion = async (req, res) => {
  try {
    const tipoHabitacion = await TipoHabitacion.findById(req.params.id);
    
    if (!tipoHabitacion) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró el tipo de habitación con ese ID'
      });
    }
    
    res.status(200).json({
      success: true,
      data: tipoHabitacion
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el tipo de habitación'
    });
  }
};

// @desc    Crear un nuevo tipo de habitación
// @route   POST /api/tiposhabitacion
// @access  Private/Admin
exports.crearTipoHabitacion = async (req, res) => {
  try {
    const tipoHabitacion = await TipoHabitacion.create(req.body);
    
    res.status(201).json({
      success: true,
      data: tipoHabitacion
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el tipo de habitación'
    });
  }
};

// @desc    Actualizar un tipo de habitación
// @route   PUT /api/tiposhabitacion/:id
// @access  Private/Admin
exports.actualizarTipoHabitacion = async (req, res) => {
  try {
    const tipoHabitacion = await TipoHabitacion.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!tipoHabitacion) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró el tipo de habitación con ese ID'
      });
    }
    
    res.status(200).json({
      success: true,
      data: tipoHabitacion
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el tipo de habitación'
    });
  }
};

// @desc    Eliminar un tipo de habitación
// @route   DELETE /api/tiposhabitacion/:id
// @access  Private/Admin
exports.eliminarTipoHabitacion = async (req, res) => {
  try {
    const tipoHabitacion = await TipoHabitacion.findByIdAndDelete(req.params.id);
    
    if (!tipoHabitacion) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró el tipo de habitación con ese ID'
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
      message: 'Error al eliminar el tipo de habitación'
    });
  }
}; 