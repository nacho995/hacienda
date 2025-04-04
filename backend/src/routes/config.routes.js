const express = require('express');
const { protectRoute, authorize } = require('../middleware/auth');
const router = express.Router();

// Importar controladores
const {
  getConfig,
  updateConfig,
  resetConfig
} = require('../controllers/config.controller');

// Rutas protegidas para administradores
router.get('/', protectRoute, authorize('admin'), getConfig);
router.put('/', protectRoute, authorize('admin'), updateConfig);
router.post('/reset', protectRoute, authorize('admin'), resetConfig);

module.exports = router; 