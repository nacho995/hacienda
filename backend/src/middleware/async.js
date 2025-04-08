/**
 * Función middleware que envuelve los controladores async para evitar try/catch repetitivos
 * Permite que los errores sean capturados por el middleware de errores
 */
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler; 