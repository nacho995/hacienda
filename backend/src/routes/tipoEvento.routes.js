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

// --- NUEVAS RUTAS PARA SERVICIOS ASOCIADOS ---

// Obtener servicios de un tipo de evento específico
router.get('/:id/servicios', tipoEventoController.getServiciosDeTipoEvento);

// Añadir un servicio a un tipo de evento (Admin)
router.post('/:id/servicios', [authJwt.verifyToken, authJwt.isAdmin], tipoEventoController.addServicioATipoEvento);

// Eliminar un servicio de un tipo de evento (Admin)
router.delete('/:id/servicios/:servicioId', [authJwt.verifyToken, authJwt.isAdmin], tipoEventoController.removeServicioDeTipoEvento);

module.exports = router; 