const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const errorHandler = require('./middleware/error');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const tipoEventoRoutes = require('./routes/tipoEvento.routes');
const reservaRoutes = require('./routes/reserva.routes');
const habitacionRoutes = require('./routes/habitacion.routes');
const tipoHabitacionRoutes = require('./routes/tipoHabitacion.routes');
const configRoutes = require('./routes/config.routes');
const servicioRoutes = require('./routes/servicio.routes');
const adminRoutes = require('./routes/admin.routes');
const reviewRoutes = require('./routes/reviewRoutes');
const contactoRoutes = require('./routes/contacto.routes');
const publicRoutes = require('./routes/public.routes');

// Importar controlador de webhook
const { handleStripeWebhook } = require('./controllers/webhook.controller');

const app = express();

// Middleware para parsear el body
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Configuración de CORS basada en la variable de entorno
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS ? process.env.CORS_ALLOWED_ORIGINS.split(',') : [];

console.log('Orígenes CORS permitidos:', allowedOrigins); // Log para depuración

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir solicitudes sin origen (como Postman o curl) o si el origen está en la lista blanca
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.error(`Origen CORS no permitido: ${origin}`); // Log de error
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Webhook Route (ANTES de express.json())
app.post('/api/stripe-webhook', express.raw({type: 'application/json'}), handleStripeWebhook);

// Logging en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Sanitize data (NoSQL injection)
app.use(mongoSanitize());

// Set security headers (Helmet)
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

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
app.use('/api/contacto', contactoRoutes);
app.use('/api/public', publicRoutes);

// Log para verificar si se monta la ruta de reseñas
console.log('>>> Montando rutas en /api/reviews'); 
app.use('/api/reviews', reviewRoutes); // Montar rutas de reseñas

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