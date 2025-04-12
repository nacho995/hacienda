const express = require('express');
const { enviarFormularioContacto } = require('../controllers/contacto.controller');

const router = express.Router();

/**
 * @route   POST /api/contacto
 * @desc    Procesar formulario de contacto
 * @access  Public
 */
router.post('/', enviarFormularioContacto);

module.exports = router; 