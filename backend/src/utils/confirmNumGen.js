const crypto = require('crypto');

/**
 * Genera un número de confirmación único y fácil de leer.
 * Ejemplo: HSCB-A1B2C3D4
 * @returns {string} El número de confirmación generado.
 */
function generarNumeroConfirmacion() {
  // Genera 4 bytes aleatorios seguros
  const randomBytes = crypto.randomBytes(4);
  // Convierte los bytes a una cadena hexadecimal (8 caracteres)
  const hexString = randomBytes.toString('hex').toUpperCase();
  // Añade un prefijo para identificación
  const prefijo = 'HSCB-'; // Hacienda San Carlos Borromeo

  return `${prefijo}${hexString}`;
}

module.exports = generarNumeroConfirmacion; 