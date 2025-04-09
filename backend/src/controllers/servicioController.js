const Servicio = require('../models/Servicio');

/**
 * @desc    Obtener todos los servicios
 * @route   GET /api/servicios
 * @access  Public
 */
exports.getServicios = async (req, res) => {
  try {
    const servicios = await Servicio.find({ activo: true });
    
    res.status(200).json({
      success: true,
      count: servicios.length,
      data: servicios
    });
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los servicios',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener un servicio por ID
 * @route   GET /api/servicios/:id
 * @access  Public
 */
exports.getServicio = async (req, res) => {
  try {
    const servicio = await Servicio.findOne({ id: req.params.id, activo: true });
    
    if (!servicio) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: servicio
    });
  } catch (error) {
    console.error('Error al obtener servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el servicio',
      error: error.message
    });
  }
};

/**
 * @desc    Crear un nuevo servicio
 * @route   POST /api/servicios
 * @access  Private/Admin
 */
exports.createServicio = async (req, res) => {
  try {
    const servicio = await Servicio.create(req.body);
    
    res.status(201).json({
      success: true,
      data: servicio
    });
  } catch (error) {
    console.error('Error al crear servicio:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un servicio con ese ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al crear el servicio',
      error: error.message
    });
  }
};

/**
 * @desc    Actualizar un servicio
 * @route   PUT /api/servicios/:id
 * @access  Private/Admin
 */
exports.updateServicio = async (req, res) => {
  try {
    let servicio = await Servicio.findOne({ id: req.params.id });
    
    if (!servicio) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }
    
    servicio = await Servicio.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: servicio
    });
  } catch (error) {
    console.error('Error al actualizar servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el servicio',
      error: error.message
    });
  }
};

/**
 * @desc    Eliminar un servicio (desactivar)
 * @route   DELETE /api/servicios/:id
 * @access  Private/Admin
 */
exports.deleteServicio = async (req, res) => {
  try {
    const servicio = await Servicio.findOne({ id: req.params.id });
    
    if (!servicio) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }
    
    // Desactivar en lugar de eliminar
    await Servicio.findOneAndUpdate(
      { id: req.params.id },
      { activo: false },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Servicio desactivado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el servicio',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener servicios por tipo de evento
 * @route   GET /api/servicios/por-evento/:tipoEvento
 * @access  Public
 */
exports.getServiciosPorEvento = async (req, res) => {
  try {
    const { tipoEvento } = req.params;
    
    if (!tipoEvento) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el tipo de evento'
      });
    }
    
    const servicios = await Servicio.find({ 
      activo: true,
      recomendadoPara: { $in: [tipoEvento] }
    });
    
    res.status(200).json({
      success: true,
      count: servicios.length,
      data: servicios
    });
  } catch (error) {
    console.error('Error al obtener servicios por tipo de evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los servicios por tipo de evento',
      error: error.message
    });
  }
};
