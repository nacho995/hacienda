const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para proteger rutas
exports.protectRoute = async (req, res, next) => {
  let token;

  // Verificar si hay token en los headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Obtener token de header Bearer
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    // Obtener token de cookie
    token = req.cookies.token;
  }

  // Verificar que el token existe
  if (!token) {
    console.log('No se proporcionó token de autenticación');
    return res.status(401).json({
      success: false,
      message: 'No autorizado para acceder a este recurso'
    });
  }

  try {
    // Verificar token
    console.log('Verificando token JWT...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verificado para usuario:', decoded.id);

    // Obtener usuario del token
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      console.log('Token válido pero usuario no encontrado');
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (!req.user.confirmado) {
      console.log('Usuario no confirmado intentando acceder a ruta protegida:', req.user.email);
      return res.status(403).json({
        success: false,
        message: 'Su cuenta aún no ha sido confirmada por un administrador'
      });
    }

    next();
  } catch (error) {
    console.error('Error al verificar token:', error.message);
    return res.status(401).json({
      success: false,
      message: 'No autorizado para acceder a este recurso'
    });
  }
};

// Middleware para autorizar roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado para acceder a este recurso'
      });
    }

    if (!roles.includes(req.user.role)) {
      console.log(`Usuario ${req.user.email} con rol ${req.user.role} intentó acceder a ruta restringida para ${roles.join(', ')}`);
      return res.status(403).json({
        success: false,
        message: 'No tiene los permisos necesarios para acceder a este recurso'
      });
    }
    next();
  };
};

// Middleware específico para proteger el panel de administración
exports.protectAdminPanel = (req, res, next) => {
  // Verificar si la solicitud proviene del panel de administración
  // usando un parámetro de consulta o cuerpo ya que los navegadores
  // no permiten modificar la cabecera Referer
  const fromAdmin = req.query.from_admin === 'true' || 
                   req.query.from_admin === true || 
                   (req.body && req.body.from_admin === true);
  
  if (!fromAdmin) {
    console.log('Intento de acceso a API de admin sin verificación de origen');
    return res.status(403).json({
      success: false,
      message: 'Acceso no autorizado'
    });
  }
  
  next();
}; 