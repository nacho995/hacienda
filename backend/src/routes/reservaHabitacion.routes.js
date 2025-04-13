const express = require('express');
const router = express.Router();
const {
    createReservaHabitacion,
    getReservaHabitacionById,
    updateReservaHabitacion,
    deleteReservaHabitacion,
    getHabitacionOccupiedDates,
    verificarDisponibilidadHabitaciones,
    getReservasHabitacionUsuario,
    cancelarReservaHabitacionUsuario,
    createMultipleReservacionesHabitacion,
    getGlobalOccupiedDates
} = require('../controllers/reservaHabitacionController');
const { protectRoute } = require('../middleware/auth');

// Nueva ruta pública para obtener fechas ocupadas globalmente
router.get('/habitaciones/fechas-ocupadas-global', getGlobalOccupiedDates);

// Ruta para obtener fechas ocupadas de una habitación específica
router.get('/habitaciones/fechas-ocupadas', getHabitacionOccupiedDates);

// Ruta para verificar disponibilidad antes de reservar
router.post('/habitaciones/verificar-disponibilidad', verificarDisponibilidadHabitaciones);

// --- NUEVA RUTA PARA CREACIÓN MÚLTIPLE ---
router.post('/reservas/habitaciones/batch', createMultipleReservacionesHabitacion);

// --- RUTA SINGULAR ---
router.post('/reservas/habitaciones', createReservaHabitacion);

// --- RUTAS PROTEGIDAS PARA USUARIOS LOGUEADOS ---
// (Las rutas GET /usuario, POST /usuario/:id/cancelar deben seguir protegidas)
router.get('/reservas/habitaciones/usuario', protectRoute, getReservasHabitacionUsuario);
router.post('/reservas/habitaciones/usuario/:id/cancelar', protectRoute, cancelarReservaHabitacionUsuario);

// --- OTRAS RUTAS (Revisar si necesitan protección) ---
router.get('/reservas/habitaciones/:id', getReservaHabitacionById); // ¿Debería ser pública o protegida?
router.put('/reservas/habitaciones/:id', protectRoute, updateReservaHabitacion); // Probablemente protegida (Admin?)
router.delete('/reservas/habitaciones/:id', protectRoute, deleteReservaHabitacion); // Probablemente protegida (Admin?)

module.exports = router; 