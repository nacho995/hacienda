const express = require('express');
const { getReservaPublica } = require('../controllers/public.controller');

const router = express.Router();

// Ruta para obtener detalles públicos de una reserva por ID
router.get('/reserva/:id', getReservaPublica);

module.exports = router; 