/**
 * Clase que extiende Error para incluir el código de estado HTTP
 * Esto permite devolver errores más descriptivos en la API
 */
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ErrorResponse; 