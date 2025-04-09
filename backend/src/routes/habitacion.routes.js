const express = require('express');
const router = express.Router();
const { protectRoute, authorize } = require('../middleware/auth');
const habitacionController = require('../controllers/habitacion.controller');

// Rutas públicas
router.get('/', habitacionController.obtenerHabitaciones);
router.get('/planta/:planta', habitacionController.obtenerHabitacionesPorPlanta);
router.get('/disponibles', habitacionController.obtenerHabitacionesDisponibles);
router.get('/:letra', habitacionController.obtenerHabitacion);

// Rutas protegidas para administradores
router.post('/', protectRoute, authorize('admin'), habitacionController.crearHabitacion);
router.put('/:letra', protectRoute, authorize('admin'), habitacionController.actualizarHabitacion);
router.delete('/:letra', protectRoute, authorize('admin'), habitacionController.eliminarHabitacion);

module.exports = router; 