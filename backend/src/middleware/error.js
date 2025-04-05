/**
 * Middleware para manejo de errores
 * Captura errores y envía respuestas formateadas
 */

const errorHandler = (err, req, res, next) => {
  console.error('Error global capturado:', err);

  // Crear objeto de error
  const error = {
    success: false,
    message: err.message || 'Error del servidor',
    status: err.statusCode || 500,
    errors: err.errors
  };

  // Manejar errores específicos
  
  // Error de Mongoose - ID de documento inválido
  if (err.name === 'CastError') {
    error.message = `Recurso no encontrado con el ID: ${err.value}`;
    error.status = 404;
  }

  // Error de Mongoose - Valores duplicados
  if (err.code === 11000) {
    error.message = `Valor duplicado encontrado para el campo: ${Object.keys(err.keyValue).join(', ')}`;
    error.status = 400;
  }

  // Error de Mongoose - Validación
  if (err.name === 'ValidationError') {
    error.message = Object.values(err.errors).map(val => val.message).join(', ');
    error.status = 400;
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Token no válido';
    error.status = 401;
  }

  // Error de JWT expirado
  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expirado';
    error.status = 401;
  }

  // Responder con el error
  res.status(error.status).json({
    success: error.success,
    message: error.message,
    errors: error.errors,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler; 