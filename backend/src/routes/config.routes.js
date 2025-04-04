const express = require('express');
const { protectRoute, authorize, protectAdminPanel } = require('../middleware/auth');
const router = express.Router();

// Importar controladores
const {
  getConfig,
  updateConfig,
  resetConfig
} = require('../controllers/config.controller');

// Rutas protegidas para administradores
router.get('/', protectRoute, authorize('admin'), protectAdminPanel, getConfig);
router.put('/', protectRoute, authorize('admin'), protectAdminPanel, updateConfig);
router.post('/reset', protectRoute, authorize('admin'), protectAdminPanel, resetConfig);

module.exports = router; 