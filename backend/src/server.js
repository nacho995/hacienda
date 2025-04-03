const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/db');

// Importar rutas
const reservaRoutes = require('./routes/reserva.routes');
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');

// Verificar variables de entorno
console.log('MONGO_URI disponible:', !!process.env.MONGO_URI);

// Conectar a la base de datos
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas API
app.use('/api/reservas', reservaRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// En producción, servir archivos estáticos
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../frontend/build', 'index.html'));
  });
}

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