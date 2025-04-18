const Config = require('../models/Config');

/**
 * @desc    Obtener la configuración actual
 * @route   GET /api/config
 * @access  Private/Admin
 */
exports.getConfig = async (req, res) => {
  try {
    console.log('Buscando configuración...');
    let config = await Config.findOne();
    
    // Si no existe configuración, crear una con valores por defecto
    if (!config) {
      console.log('No se encontró configuración, creando una nueva...');
      config = await Config.create({});
    }
    
    console.log('Configuración encontrada/creada:', config);
    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la configuración',
      error: error.message
    });
  }
};

/**
 * @desc    Actualizar la configuración
 * @route   PUT /api/config
 * @access  Private/Admin
 */
exports.updateConfig = async (req, res) => {
  try {
    console.log('Actualizando configuración con datos:', req.body);
    let config = await Config.findOne();
    
    // Si no existe configuración, crear una nueva
    if (!config) {
      console.log('No se encontró configuración, creando una nueva...');
      config = await Config.create(req.body);
    } else {
      // Actualizar la configuración existente
      config = await Config.findOneAndUpdate(
        {},
        req.body,
        { new: true, runValidators: true }
      );
    }
    
    console.log('Configuración actualizada:', config);
    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la configuración',
      error: error.message
    });
  }
};

/**
 * @desc    Restablecer la configuración a valores por defecto
 * @route   POST /api/config/reset
 * @access  Private/Admin
 */
exports.resetConfig = async (req, res) => {
  try {
    console.log('Restableciendo configuración a valores por defecto...');
    // Eliminar la configuración actual
    await Config.deleteMany({});
    
    // Crear nueva configuración con valores por defecto
    const config = await Config.create({});
    
    console.log('Configuración restablecida:', config);
    res.status(200).json({
      success: true,
      data: config,
      message: 'Configuración restablecida a valores por defecto'
    });
  } catch (error) {
    console.error('Error al restablecer configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error al restablecer la configuración',
      error: error.message
    });
  }
}; 