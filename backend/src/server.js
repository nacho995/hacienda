require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

// Verificar variables de entorno
console.log('MONGO_URI disponible:', !!process.env.MONGO_URI);

// Conectar a la base de datos
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  console.log('Apagando el servidor debido a un rechazo de promesa no manejado');
  process.exit(1);
}); 