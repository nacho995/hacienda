const {
    createReservaHabitacion,
    getReservaHabitacionById,
    updateReservaHabitacion,
    deleteReservaHabitacion,
    getHabitacionOccupiedDates,
    verificarDisponibilidadHabitaciones,
    getReservasHabitacionUsuario,
    cancelarReservaHabitacionUsuario,
    createMultipleReservaciones,
    getGlobalOccupiedDates
} = require('../controllers/reservaHabitacionController');

// Nueva ruta pública para obtener fechas ocupadas globalmente
router.get('/habitaciones/fechas-ocupadas-global', getGlobalOccupiedDates);

// Ruta para obtener fechas ocupadas de una habitación específica
router.get('/habitaciones/fechas-ocupadas', getHabitacionOccupiedDates);

// Ruta para verificar disponibilidad antes de reservar
router.post('/habitaciones/verificar-disponibilidad', verificarDisponibilidadHabitaciones);

// ... resto de las rutas ... 