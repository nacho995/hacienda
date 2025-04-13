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
router.post('/habitaciones/batch', protectRoute, createMultipleReservacionesHabitacion);

// --- Añadir ruta singular si no estaba definida explícitamente antes ---
// Asumiendo que la ruta base para crear una sola es POST /habitaciones
router.post('/habitaciones', protectRoute, createReservaHabitacion);

// ... resto de las rutas ...

module.exports = router; 