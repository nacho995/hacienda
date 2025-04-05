const express = require('express');
const router = express.Router();
const tipoEventoController = require('../controllers/tipoEvento.controller');
const authJwt = require('../middlewares/authJwt');

// Obtener todos los tipos de evento
router.get('/', tipoEventoController.getTiposEvento);

// Crear nuevo tipo de evento (solo admin)
router.post('/', [authJwt.verifyToken, authJwt.isAdmin], tipoEventoController.createTipoEvento);

// Actualizar tipo de evento (solo admin)
router.put('/:id', [authJwt.verifyToken, authJwt.isAdmin], tipoEventoController.updateTipoEvento);

// Eliminar tipo de evento (solo admin)
router.delete('/:id', [authJwt.verifyToken, authJwt.isAdmin], tipoEventoController.deleteTipoEvento);

module.exports = router; 