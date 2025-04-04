const express = require('express');
const router = express.Router();
const { getConfig, updateConfig, resetConfig } = require('../controllers/configController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Rutas públicas
router.get('/', getConfig);

// Rutas protegidas (solo admin)
router.put('/', verifyToken, isAdmin, updateConfig);
router.post('/reset', verifyToken, isAdmin, resetConfig);

module.exports = router; 