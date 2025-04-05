const dotenv = require('dotenv');
const colors = require('colors');
const connectDB = require('./config/db');

// Cargar variables de entorno antes de importar app.js
dotenv.config();

// Verificar variables de entorno críticas
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'JWT_EXPIRE', 'JWT_COOKIE_EXPIRE'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`Error: Variables de entorno faltantes: ${missingVars.join(', ')}`.red);
  process.exit(1);
}

console.log(`MONGODB_URI disponible: ${!!process.env.MONGODB_URI}`.cyan);
console.log(`JWT_SECRET disponible: ${!!process.env.JWT_SECRET}`.cyan);
console.log(`JWT_EXPIRE disponible: ${!!process.env.JWT_EXPIRE}`.cyan);

// Conectar a la base de datos
connectDB();

// Importar la aplicación Express ya configurada
const app = require('./app');

// Puerto
const PORT = process.env.PORT || 5000;

// Comprobar si el puerto está en uso
const net = require('net');
const testServer = net.createServer()
  .once('error', err => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Puerto ${PORT} está en uso, intentando usar el puerto ${PORT + 1}`.yellow);
      startServer(PORT + 1);
    } else {
      console.error(`Error al iniciar servidor: ${err.message}`.red);
      process.exit(1);
    }
  })
  .once('listening', () => {
    testServer.close();
    startServer(PORT);
  })
  .listen(PORT);

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`Servidor ejecutándose en modo ${process.env.NODE_ENV || 'development'} en el puerto ${port}`.yellow.bold);
  });

  // Manejar rechazos de promesas no capturadas
  process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    server.close(() => process.exit(1));
  });
} 