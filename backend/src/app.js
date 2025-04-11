const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const errorHandler = require('./middleware/error');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const tipoEventoRoutes = require('./routes/tipoEvento.routes');
const reservaRoutes = require('./routes/reserva.routes');
const habitacionRoutes = require('./routes/habitacion.routes');
const tipoHabitacionRoutes = require('./routes/tipoHabitacion.routes');
const configRoutes = require('./routes/config.routes');
const servicioRoutes = require('./routes/servicio.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Middleware para parsear el body
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Habilitar CORS con opciones más específicas
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tipos-evento', tipoEventoRoutes);
app.use('/api/reservas', reservaRoutes);
app.use('/api/habitaciones', habitacionRoutes);
app.use('/api/tipos-habitacion', tipoHabitacionRoutes);
app.use('/api/config', configRoutes);
app.use('/api/servicios', servicioRoutes);
app.use('/api/admin', adminRoutes);

// Ruta para comprobar estado del servidor
app.get('/api/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date()
  });
});

// Middleware para rutas no encontradas
app.use((req, res, next) => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Middleware para manejar errores
app.use(errorHandler);

module.exports = app; 