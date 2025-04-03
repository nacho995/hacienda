const User = require('../models/User');

/**
 * @desc    Obtener todos los usuarios
 * @route   GET /api/users
 * @access  Private/Admin
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -resetPasswordToken -resetPasswordExpire -confirmacionToken');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener un usuario por ID
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
exports.getSingleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -resetPasswordToken -resetPasswordExpire -confirmacionToken');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener datos del usuario actual
 * @route   GET /api/users/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -resetPasswordToken -resetPasswordExpire -confirmacionToken');
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos del usuario',
      error: error.message
    });
  }
};

/**
 * @desc    Actualizar datos de usuario
 * @route   PUT /api/users/:id
 * @access  Private
 */
exports.updateUser = async (req, res) => {
  try {
    // Verificar que solo el propio usuario o un admin pueda actualizar datos
    if (req.params.id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para actualizar los datos de este usuario'
      });
    }
    
    // Campos permitidos para actualización
    const allowedFields = {
      nombre: req.body.nombre,
      apellidos: req.body.apellidos,
      telefono: req.body.telefono,
      direccion: req.body.direccion
    };
    
    // Filtrar campos no definidos
    const fieldsToUpdate = Object.fromEntries(
      Object.entries(allowedFields).filter(([_, v]) => v !== undefined)
    );
    
    // Si el usuario es admin, permitir actualizar el rol
    if (req.user.role === 'admin' && req.body.role) {
      fieldsToUpdate.role = req.body.role;
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    ).select('-password -resetPasswordToken -resetPasswordExpire -confirmacionToken');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: error.message
    });
  }
};

/**
 * @desc    Eliminar usuario
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    await user.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: error.message
    });
  }
}; 