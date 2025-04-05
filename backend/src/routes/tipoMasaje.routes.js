const express = require('express');
const router = express.Router();
const tipoMasajeController = require('../controllers/tipoMasaje.controller');
const authJwt = require('../middlewares/authJwt');

// Obtener todos los tipos de masaje
router.get('/', tipoMasajeController.getTiposMasaje);

// Crear nuevo tipo de masaje (solo admin)
router.post('/', [authJwt.verifyToken, authJwt.isAdmin], tipoMasajeController.createTipoMasaje);

// Actualizar tipo de masaje (solo admin)
router.put('/:id', [authJwt.verifyToken, authJwt.isAdmin], tipoMasajeController.updateTipoMasaje);

// Eliminar tipo de masaje (solo admin)
router.delete('/:id', [authJwt.verifyToken, authJwt.isAdmin], tipoMasajeController.deleteTipoMasaje);

module.exports = router; 