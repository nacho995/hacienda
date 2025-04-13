const {
  createReservaEvento,
  getAllReservasEvento,
  getReservaEventoById,
  updateReservaEvento,
  deleteReservaEvento,
  getReservasEventoAdmin,
  updateEstadoReservaEvento,
  getReservasCliente,
  cancelarReservaEventoCliente,
  getDetallesReservaEventoCliente,
  verificarDisponibilidadEvento,
  getEventDatesInRange
} = require('../controllers/reservaEvento.controller');

const ReservaEvento = require('../models/ReservaEvento');

// Nueva ruta pública para obtener fechas de eventos en rango
router.get('/eventos/fechas-en-rango', getEventDatesInRange);

// Rutas existentes para eventos...
router.route('/eventos')
  .post(protect, createReservaEvento) // Proteger creación si es necesario
  .get(getAllReservasEvento); // Puede ser pública o protegida

// ... resto de las rutas ... 