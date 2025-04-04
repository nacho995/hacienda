const Config = require('../models/Config');

// Obtener la configuración actual
exports.getConfig = async (req, res) => {
  try {
    let config = await Config.findOne();
    
    // Si no existe configuración, crear una con valores por defecto
    if (!config) {
      config = await Config.create({});
    }
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error al obtener la configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la configuración',
      error: error.message
    });
  }
};

// Actualizar la configuración
exports.updateConfig = async (req, res) => {
  try {
    const { general, reservacion, pagos, metadata } = req.body;
    
    let config = await Config.findOne();
    
    // Si no existe configuración, crear una nueva
    if (!config) {
      config = new Config({});
    }
    
    // Actualizar solo los campos proporcionados
    if (general) config.general = { ...config.general, ...general };
    if (reservacion) config.reservacion = { ...config.reservacion, ...reservacion };
    if (pagos) config.pagos = { ...config.pagos, ...pagos };
    if (metadata) config.metadata = { ...config.metadata, ...metadata };
    
    await config.save();
    
    res.json({
      success: true,
      message: 'Configuración actualizada correctamente',
      data: config
    });
  } catch (error) {
    console.error('Error al actualizar la configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la configuración',
      error: error.message
    });
  }
};

// Restaurar configuración por defecto
exports.resetConfig = async (req, res) => {
  try {
    // Eliminar la configuración actual
    await Config.deleteOne();
    
    // Crear una nueva configuración con valores por defecto
    const config = await Config.create({});
    
    res.json({
      success: true,
      message: 'Configuración restaurada a valores por defecto',
      data: config
    });
  } catch (error) {
    console.error('Error al restaurar la configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error al restaurar la configuración',
      error: error.message
    });
  }
}; 