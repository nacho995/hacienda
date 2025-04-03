const express = require('express');
const { protectRoute, authorize, protectAdminPanel } = require('../middleware/auth');

// NOTA: Este es un archivo de rutas para usuarios. 
// Los controladores específicos deberán ser implementados antes de descomentar estas rutas.

const {
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  getMe
} = require('../controllers/user.controller');

const router = express.Router();

// Rutas para obtener el perfil propio
router.get('/profile', protectRoute, getMe);

// Rutas para actualizar el perfil propio
router.put('/:id', protectRoute, updateUser);

// Rutas administrativas protegidas
router.get('/', protectRoute, authorize('admin'), protectAdminPanel, getAllUsers);
router.get('/:id', protectRoute, authorize('admin'), protectAdminPanel, getSingleUser);
router.delete('/:id', protectRoute, authorize('admin'), protectAdminPanel, deleteUser);

module.exports = router; 