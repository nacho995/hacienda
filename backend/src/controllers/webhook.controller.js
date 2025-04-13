const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const ReservaEvento = require('../models/ReservaEvento');
const ReservaHabitacion = require('../models/ReservaHabitacion');
const ErrorResponse = require('../utils/errorResponse');
const { enviarConfirmacionReservaEvento, enviarNotificacionGestionAdmin } = require('../utils/email');

// Endpoint secret obtenido del Dashboard de Stripe
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * @desc    Manejar eventos webhook de Stripe
 * @route   POST /api/stripe-webhook
 * @access  Public (Verificación por firma de Stripe)
 */
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Es crucial usar req.rawBody o el buffer original, no req.body parseado por express.json()
    // Asegúrate que en tu app.js tengas configurado express.raw({type: 'application/json'}) ANTES de express.json()
    // para la ruta del webhook.
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    console.log('>>> [Webhook Stripe] Evento recibido y verificado:', event.type);
  } catch (err) {
    console.error(`>>> [Webhook Stripe] Error verificación firma: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar el evento
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object;
      console.log(`>>> [Webhook Stripe] PaymentIntent ${paymentIntentSucceeded.id} fue exitoso!`);
      // Lógica para actualizar la reserva en tu DB
      await handlePaymentIntentSucceeded(paymentIntentSucceeded);
      break;
    case 'payment_intent.payment_failed':
      const paymentIntentFailed = event.data.object;
      console.log(`>>> [Webhook Stripe] PaymentIntent ${paymentIntentFailed.id} falló.`);
      // Lógica si el pago falla (ej. notificar al usuario/admin)
      await handlePaymentIntentFailed(paymentIntentFailed);
      break;
    // ... manejar otros tipos de eventos si es necesario
    // ej. 'charge.succeeded', 'checkout.session.completed'
    default:
      console.log(`>>> [Webhook Stripe] Evento no manejado tipo ${event.type}`);
  }

  // Devolver una respuesta 200 a Stripe para confirmar recepción
  res.status(200).json({ received: true });
};

// --- Funciones auxiliares para manejar eventos ---

async function handlePaymentIntentSucceeded(paymentIntent) {
  const reservaId = paymentIntent.metadata.reservaId;
  const tipoReserva = paymentIntent.metadata.tipoReserva || 'evento'; // Asumir evento si no existe

  if (!reservaId) {
    console.error('>>> [Webhook Stripe] Faltó reservaId en metadata del PaymentIntent!', paymentIntent.id);
    return;
  }

  try {
    let reserva;
    if (tipoReserva === 'evento') {
      reserva = await ReservaEvento.findById(reservaId);
    } else if (tipoReserva === 'habitacion') {
      reserva = await ReservaHabitacion.findById(reservaId);
    }

    if (!reserva) {
      console.error(`>>> [Webhook Stripe] Reserva ${tipoReserva} con ID ${reservaId} no encontrada.`);
      return;
    }

    // Actualizar estado de la reserva
    if (reserva.estadoReserva !== 'confirmada') {
      reserva.estadoReserva = 'confirmada';
      reserva.metodoPago = 'tarjeta'; // Asegurarse que esté como tarjeta
      reserva.stripePaymentIntentId = paymentIntent.id; // Guardar ID de Stripe (Asegúrate que este campo exista en tu modelo ReservaEvento/Habitacion)
      await reserva.save();
      console.log(`>>> [Webhook Stripe] Reserva ${tipoReserva} ${reservaId} actualizada a confirmada.`);

      // Opcional: Enviar correo de confirmación final al cliente
      if (reserva.emailContacto) {
         if (tipoReserva === 'evento') {
           // Asegúrate de pasar todos los datos que espera tu plantilla
           await enviarConfirmacionReservaEvento({
             email: reserva.emailContacto,
             nombreCliente: `${reserva.nombreContacto || 'Cliente'} ${reserva.apellidosContacto || ''}`.trim(),
             tipoEvento: reserva.nombreEvento || 'Evento',
             numeroConfirmacion: reserva.numeroConfirmacion,
             fechaEvento: reserva.fecha.toLocaleDateString(),
             horaInicio: reserva.horaInicio,
             horaFin: reserva.horaFin,
             numInvitados: reserva.numInvitados,
             precioTotal: reserva.precio,
             metodoPago: 'Tarjeta (Pagado)', // Indicar pagado
             // Añade aquí otros campos que use la plantilla, ej:
             // detallesEvento: { ... },
             // habitacionesReservadas: [...]
           });
           console.log(`>>> [Webhook Stripe] Email de confirmación final enviado para evento ${reservaId}`);
         }
         // else if (tipoReserva === 'habitacion') {
         //   await enviarConfirmacionReservaHabitacion({...}); // Necesitarías plantilla y función similar
         // }
      }
    } else {
      console.log(`>>> [Webhook Stripe] Reserva ${tipoReserva} ${reservaId} ya estaba confirmada.`);
    }

  } catch (error) {
    console.error(`>>> [Webhook Stripe] Error actualizando reserva ${reservaId} tras pago:`, error);
    // Considerar reenviar el webhook o loguear para revisión manual
  }
}

async function handlePaymentIntentFailed(paymentIntent) {
  const reservaId = paymentIntent.metadata.reservaId;
  const tipoReserva = paymentIntent.metadata.tipoReserva || 'evento';
  const lastPaymentError = paymentIntent.last_payment_error;

  console.warn(`>>> [Webhook Stripe] Pago fallido para ${tipoReserva} ${reservaId}. PaymentIntent: ${paymentIntent.id}. Razón: ${lastPaymentError?.message}`);

  if (!reservaId) {
    console.error('>>> [Webhook Stripe] Faltó reservaId en metadata de PaymentIntent fallido!');
    return;
  }

  try {
    let reserva;
    let ReservaModel;
    if (tipoReserva === 'evento') {
      ReservaModel = ReservaEvento;
    } else if (tipoReserva === 'habitacion') {
      ReservaModel = ReservaHabitacion;
    } else {
      console.error(`>>> [Webhook Stripe] Tipo de reserva desconocido: ${tipoReserva}`);
      return;
    }

    reserva = await ReservaModel.findById(reservaId);

    if (!reserva) {
      console.error(`>>> [Webhook Stripe] Reserva ${tipoReserva} con ID ${reservaId} no encontrada para manejar fallo.`);
      return;
    }

    // 1. Actualizar estado de la reserva (si no está ya confirmada o cancelada)
    if (reserva.estadoReserva !== 'confirmada' && reserva.estadoReserva !== 'cancelada') {
      reserva.estadoReserva = 'pago_fallido';
      // Guardar el mensaje de error de Stripe si existe
      if (lastPaymentError?.message) {
         // Asegúrate que tu modelo tenga un campo como 'stripeLastError' o similar
         // reserva.stripeLastError = lastPaymentError.message;
      }
      await reserva.save();
      console.log(`>>> [Webhook Stripe] Reserva ${tipoReserva} ${reservaId} actualizada a pago_fallido.`);
    } else {
      console.log(`>>> [Webhook Stripe] Reserva ${tipoReserva} ${reservaId} ya estaba ${reserva.estadoReserva}, no se actualiza por fallo.`);
      return; // No enviar notificaciones si ya estaba resuelta
    }

    // 2. Enviar notificación al cliente
    if (reserva.emailContacto) {
      try {
        const asuntoCliente = `Problema con el pago de tu reserva #${reserva.numeroConfirmacion}`;
        const mensajeCliente = `Hola ${reserva.nombreContacto || 'Cliente'}, 
Lamentamos informarte que hubo un problema al procesar el pago con tarjeta para tu reserva #${reserva.numeroConfirmacion}.

Motivo: ${lastPaymentError?.message || 'Error desconocido'}

Por favor, revisa los datos de tu tarjeta o intenta con otro método de pago desde tu área de cliente o contactándonos directamente.

Si crees que esto es un error, por favor contáctanos.

Gracias,
Equipo de Hacienda San Carlos Borromeo`;

        await enviarNotificacionGestionAdmin({
          destinatarios: reserva.emailContacto,
          tipo: 'error',
          asunto: asuntoCliente,
          mensaje: mensajeCliente,
          enlaceAccion: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/reservas/${tipoReserva === 'evento' ? 'eventos' : 'habitaciones'}/${reserva._id}`,
          textoEnlace: 'Ver Reserva en Admin'
        });
        console.log(`>>> [Webhook Stripe] Notificación de pago fallido enviada a cliente ${reserva.emailContacto}`);
      } catch (emailError) {
        console.error(`>>> [Webhook Stripe] Error enviando email de fallo a cliente ${reserva.emailContacto}:`, emailError);
      }
    }

    // 3. Enviar notificación al administrador
    const adminEmailsString = process.env.ADMIN_EMAIL;
    if (adminEmailsString) {
      try {
         await enviarNotificacionGestionAdmin({
           destinatarios: adminEmailsString,
           tipo: 'error',
           asunto: `Fallo en pago con tarjeta - Reserva #${reserva.numeroConfirmacion}`,
           mensaje: `Ha fallado el pago con tarjeta para la reserva ${tipoReserva} #${reserva.numeroConfirmacion} (${reserva.nombreContacto || 'Cliente'}).
Motivo: ${lastPaymentError?.message || 'Error desconocido'}
PaymentIntent ID: ${paymentIntent.id}
Se ha marcado la reserva como 'pago_fallido'. Se ha notificado al cliente.`,
           enlaceAccion: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/reservas/${tipoReserva === 'evento' ? 'eventos' : 'habitaciones'}/${reserva._id}`,
           textoEnlace: 'Ver Reserva en Admin'
         });
         console.log(`>>> [Webhook Stripe] Notificación de pago fallido enviada a admin(es).`);
      } catch (adminEmailError) {
        console.error(">>> [Webhook Stripe] Error enviando notificación de fallo a admin:", adminEmailError);
      }
    }

  } catch (error) {
    console.error(`>>> [Webhook Stripe] Error general en handlePaymentIntentFailed para reserva ${reservaId}:`, error);
  }
}


module.exports = {
  handleStripeWebhook
};