module.exports = {
  secret: process.env.JWT_SECRET || "hacienda-bodas-secret-key",
  // Tiempo de expiración del token: 24 horas
  jwtExpiration: 86400
}; 