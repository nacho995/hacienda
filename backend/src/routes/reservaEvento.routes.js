const express = require('express');
const {
  // Importar TODAS las funciones necesarias del controlador CONSOLIDADO
  createEvento,
  getAllReservasEvento,
  getEventoById,
  updateEvento,
  deleteEvento,
  getEventoHabitaciones,
  addHabitacionToEvento,
  removeHabitacionFromEvento,
  asignarEventoAdmin,
  desasignarEventoAdmin,
  getEventDatesInRange,
  seleccionarMetodoPagoEvento,
  assignReservaEvento,
  updateReservaEventoEstado,
  getPublicOccupiedEventDates
} = require('../controllers/reservaEventoController');

const { protectRoute, authorize } = require('../middleware/auth');

const router = express.Router();

// --- RUTAS CONSOLIDADAS ---

// Rutas base para /api/reservas/eventos
router.route('/')
  .post(protectRoute, authorize('admin', 'user'), createEvento) // Crear evento
  .get(protectRoute, authorize('admin'), getAllReservasEvento); // Obtener todos los eventos (Admin)

// Rutas públicas para obtener fechas ocupadas en rango
router.get('/fechas-en-rango', getEventDatesInRange);
router.route('/public/fechas-ocupadas-eventos')
    .get(getPublicOccupiedEventDates);

// Rutas específicas para un evento por ID: /api/reservas/eventos/:id
router.route('/:id')
  .get(protectRoute, authorize('admin', 'user'), getEventoById) // Obtener detalles (Admin/User?)
  .put(protectRoute, authorize('admin'), updateEvento) // Actualizar evento (Admin)
  .delete(protectRoute, authorize('admin'), deleteEvento); // Eliminar evento (Admin)

// Rutas para habitaciones dentro de un evento: /api/reservas/eventos/:id/habitaciones
router.route('/:id/habitaciones')
  .get(protectRoute, authorize('admin'), getEventoHabitaciones) // Obtener habitaciones del evento
  .post(protectRoute, authorize('admin'), addHabitacionToEvento); // Añadir habitación al evento

// Ruta para eliminar una habitación específica de un evento: /api/reservas/eventos/:id/habitaciones/:habId
router.delete('/:id/habitaciones/:habId', protectRoute, authorize('admin'), removeHabitacionFromEvento);

// Rutas de gestión/estado del evento
router.put('/:id/seleccionar-pago', protectRoute, seleccionarMetodoPagoEvento); // User selecciona método
router.put('/:id/asignar', protectRoute, authorize('admin'), assignReservaEvento); // Admin asigna a User
router.patch('/:id/estado', protectRoute, authorize('admin'), updateReservaEventoEstado); // Admin cambia estado

// Rutas para asignar/desasignar admin
router.put('/:id/asignar-admin', protectRoute, authorize('admin'), asignarEventoAdmin);
router.put('/:id/desasignar-admin', protectRoute, authorize('admin'), desasignarEventoAdmin);

module.exports = router; 