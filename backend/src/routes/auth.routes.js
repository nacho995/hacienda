const express = require('express');
const {
  register,
  registerAdmin,
  login,
  logout,
  getMe,
  confirmAccount
} = require('../controllers/auth.controller');

const { protectRoute, authorize, protectAdminPanel } = require('../middleware/auth');

const router = express.Router();

// Rutas públicas
router.post('/register', register);
router.post('/login', login);
router.get('/confirm/:token', confirmAccount);

// Rutas protegidas
router.get('/me', protectRoute, getMe);
router.get('/logout', protectRoute, logout);

// Rutas de administrador
router.post('/register-admin', protectRoute, authorize('admin'), protectAdminPanel, registerAdmin);

module.exports = router; 