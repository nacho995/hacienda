const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar que el usuario está autenticado
exports.protectRoute = async (req, res, next) => {
  console.log('Verificando autenticación...');
  console.log('Headers:', req.headers);
  console.log('Cookies:', req.cookies);
  
  let token;

  // Verificar si el token existe en los headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extraer el token del header (Bearer TOKEN)
    token = req.headers.authorization.split(' ')[1];
    console.log('Token encontrado en headers:', token ? 'Sí' : 'No');
  } else if (req.cookies && req.cookies.token) {
    // Si no está en el header, verificar si está en las cookies
    token = req.cookies.token;
    console.log('Token encontrado en cookies:', token ? 'Sí' : 'No');
  }

  // Verificar que el token existe
  if (!token) {
    console.log('No se encontró token');
    return res.status(401).json({
      success: false,
      message: 'No está autorizado para acceder a esta ruta'
    });
  }

  try {
    // Verificar el token
    console.log('Verificando token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decodificado:', decoded);

    // Buscar al usuario con ese id
    console.log('Buscando usuario...');
    const user = await User.findById(decoded.id);
    console.log('Usuario encontrado:', user ? 'Sí' : 'No');

    // Verificar que el usuario existe
    if (!user) {
      console.log('Usuario no encontrado');
      return res.status(401).json({
        success: false,
        message: 'No se encuentra el usuario con este token'
      });
    }

    // Verificar que el usuario está confirmado
    if (!user.confirmado) {
      console.log('Usuario no confirmado');
      return res.status(401).json({
        success: false,
        message: 'Por favor, espera a que tu cuenta sea aprobada por un administrador'
      });
    }

    // Añadir el usuario a la request
    req.user = user;
    console.log('Usuario autenticado correctamente');
    next();
  } catch (err) {
    console.error('Error en autenticación:', err);
    return res.status(401).json({
      success: false,
      message: 'No está autorizado para acceder a esta ruta',
      error: err.message
    });
  }
};

// Middleware para verificar roles de usuario
exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log('Verificando roles...');
    console.log('Roles permitidos:', roles);
    console.log('Rol del usuario:', req.user?.role);
    
    if (!req.user) {
      console.log('No hay usuario en la request');
      return res.status(401).json({
        success: false,
        message: 'No está autorizado para acceder a esta ruta'
      });
    }

    // Verificar si el rol del usuario está incluido en los roles autorizados
    if (!roles.includes(req.user.role)) {
      console.log('Rol no autorizado');
      return res.status(403).json({
        success: false,
        message: `El rol ${req.user.role} no está autorizado para acceder a esta ruta`
      });
    }

    console.log('Rol autorizado');
    next();
  };
};

// Middleware específico para proteger el panel de administración
exports.protectAdminPanel = async (req, res, next) => {
  try {
    // Verificar si el usuario está autenticado
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No está autorizado para acceder al panel de administración'
      });
    }
    
    // Verificar si el usuario es administrador
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Sólo los administradores pueden acceder a esta área'
      });
    }
    
    // Verificar si la cuenta está confirmada
    if (!req.user.confirmado) {
      return res.status(401).json({
        success: false,
        message: 'Su cuenta de administrador debe ser aprobada antes de acceder al panel'
      });
    }
    
    // Verificar IP o añadir otras capas de seguridad si es necesario
    // (Esto sería una implementación adicional para mayor seguridad)
    
    next();
  } catch (error) {
    console.error('Error en protección de panel admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al verificar permisos de administrador'
    });
  }
}; 