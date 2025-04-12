const express = require('express');
const {
  getApprovedReviews,
  createReview,
  getAllReviews,
  updateReviewStatus,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');

// Middleware de protección de rutas
const { protectRoute, authorize } = require('../middleware/auth');

const router = express.Router();

// Log para verificar si este archivo se carga
console.log('>>> Cargando reviewRoutes.js'); 

// --- Rutas Públicas ---
router.route('/approved')
  .get(getApprovedReviews);

router.route('/')
  .post(createReview); // Cualquiera puede enviar una reseña

// --- Rutas de Administración --- 
// Comentamos la aplicación global del middleware
// router.use(protectRoute); 

router.route('/admin/all')
   // Aplicamos protectRoute y authorize aquí directamente
  .get(protectRoute, authorize('admin'), (req, res, next) => { 
    // Log para verificar si la solicitud llega a esta ruta específica
    console.log('>>> Solicitud GET recibida en /api/reviews/admin/all'); 
    // Pasar al controlador real
    getAllReviews(req, res, next); 
  }); // Solo admin puede ver todas

router.route('/admin/:id/status')
   // Aplicamos protectRoute y authorize aquí directamente
  .patch(protectRoute, authorize('admin'), updateReviewStatus); // Solo admin puede aprobar/rechazar

router.route('/admin/:id')
   // Aplicamos protectRoute y authorize aquí directamente
  .put(protectRoute, authorize('admin'), updateReview) // Solo admin puede editar
  .delete(protectRoute, authorize('admin'), deleteReview); // Solo admin puede eliminar

module.exports = router; 