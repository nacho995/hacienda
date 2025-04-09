const express = require('express');
const {
  getServicios,
  getServicio,
  createServicio,
  updateServicio,
  deleteServicio,
  getServiciosPorEvento
} = require('../controllers/servicioController');

const { protectRoute, authorize } = require('../middleware/auth');

const router = express.Router();

// Rutas públicas
router.get('/', getServicios);
router.get('/por-evento/:tipoEvento', getServiciosPorEvento);
router.get('/:id', getServicio);

// Rutas protegidas (solo admin)
router.post('/', protectRoute, authorize('admin'), createServicio);
router.put('/:id', protectRoute, authorize('admin'), updateServicio);
router.delete('/:id', protectRoute, authorize('admin'), deleteServicio);

module.exports = router;
