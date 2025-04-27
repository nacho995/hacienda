const express = require('express');
const router = express.Router();
const { protectRoute, authorize } = require('../middleware/auth'); // Necesitamos middleware de auth

// Importar los routers específicos
const reservaHabitacionRouter = require('./reservaHabitacion.routes');
const reservaEventoRouter = require('./reservaEvento.routes'); 
// Podríamos necesitar importar reservaEstado.routes si también se maneja aquí
// Importar el nuevo controlador del dashboard
const { getDashboardData } = require('../controllers/dashboardController');

// *** NUEVA RUTA para obtener datos del dashboard ***
// Manejará GET /api/reservas
router.get('/', protectRoute, authorize('admin', 'recepcionista'), getDashboardData);

// Delegar rutas a los routers específicos
router.use('/habitaciones', reservaHabitacionRouter);
router.use('/eventos', reservaEventoRouter);

// Si hubiera rutas que aplican a *ambos* tipos de reserva o a la reserva en general,
// podrían ir aquí. Por ejemplo:
// const { getAllReservasEstados } = require('../controllers/reservaEstado.controller');
// router.get('/estados', getAllReservasEstados); // Ejemplo

// --- ELIMINAR TODAS LAS DEFINICIONES DE RUTAS ESPECÍFICAS DE HABITACIÓN Y EVENTO DE AQUÍ ---
/*
// ========================
// RUTAS PARA HABITACIONES
// ========================
... (TODO ESTO SE VA) ...
// ==================
// RUTAS PARA EVENTOS
// ==================
... (TODO ESTO SE VA) ...
// ==========================
// RUTA PARA ACTUALIZAR ESTADO (ADMIN) - ¿Pertenece aquí o a un router específico? 
// Si es genérico, se queda. Si es específico de habitación, va a reservaHabitacion.routes.js
// Por ahora, lo comentamos para evitar conflictos hasta decidir dónde va.
// ==========================
// const { actualizarEstadoReservaHabitacion } = require('../controllers/reservaHabitacionController');
// const { protectRoute, authorize } = require('../middleware/auth');
// router.patch('/habitaciones/:id/estado', 
//   protectRoute, 
//   authorize('admin'), 
//   actualizarEstadoReservaHabitacion // Esta función es de habitación...
// );
*/

module.exports = router;