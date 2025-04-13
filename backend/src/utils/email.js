const sgMail = require('@sendgrid/mail');
const confirmacionReservaEvento = require('../emails/confirmacionReservaEvento');
const confirmacionReservaHabitacion = require('../emails/confirmacionReservaHabitacion');
const notificacionGestionAdmin = require('../emails/notificacionGestionAdmin');

// Configurar SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Envia un correo utilizando SendGrid
 * @param {Object} options - Opciones del correo
 * @param {string} options.email - Destinatario(s)
 * @param {string} options.subject - Asunto del correo
 * @param {string} options.html - Contenido HTML del correo
 * @returns {Promise}
 */
const sendEmail = async (options) => {
  try {
    const { email, subject, html } = options;
    
    const msg = {
      to: email, // Change to your recipient
      from: process.env.EMAIL_FROM, // Change to your verified sender
      subject: subject,
      html: html,
    };
    
    // Registrar parámetros (sin mostrar contraseñas ni API Key)
    console.log('Enviando email con SendGrid:', {
      to: email,
      from: msg.from,
      subject,
      htmlLength: html?.length || 0,
    });
    
    const info = await sgMail.send(msg);
    console.log('Email enviado con éxito a través de SendGrid. Message ID:', info[0]?.headers?.['x-message-id']);
    return info;
  } catch (error) {
    console.error('Error al enviar email con SendGrid:', error);
    if (error.response) {
      console.error('Detalles del error de SendGrid:', error.response.body)
    }
    throw error;
  }
};

/**
 * Envía un correo de confirmación al cliente para una reserva de evento
 * @param {Object} datos - Datos del evento y cliente
 * @returns {Promise}
 */
const enviarConfirmacionReservaEvento = async (datos) => {
  const {
    email,
    nombreCliente,
    tipoEvento,
    numeroConfirmacion,
    fechaEvento,
    horaInicio,
    horaFin,
    numInvitados,
    precioTotal,
    porcentajePago,
    metodoPago,
    detallesEvento,
    habitacionesReservadas
  } = datos;

  const htmlContent = confirmacionReservaEvento({
    nombreCliente,
    tipoEvento,
    numeroConfirmacion,
    fechaEvento,
    horaInicio,
    horaFin,
    numInvitados,
    precioTotal,
    porcentajePago,
    metodoPago,
    detallesEvento,
    habitacionesReservadas
  });

  return sendEmail({
    email,
    subject: `Confirmación de reserva de ${tipoEvento} - Hacienda San Carlos Borromeo`,
    html: htmlContent
  });
};

/**
 * Envía un correo de confirmación al cliente para una reserva de habitación
 * @param {Object} datos - Datos de la habitación y cliente
 * @returns {Promise}
 */
const enviarConfirmacionReservaHabitacion = async (datos) => {
  const {
    email,
    nombreCliente,
    tipoHabitacion,
    numeroConfirmacion,
    fechaEntrada,
    fechaSalida,
    precio,
    metodoPago,
    detallesAdicionales = {}
  } = datos;

  // Calcular el número de noches
  const entrada = new Date(fechaEntrada);
  const salida = new Date(fechaSalida);
  const diferenciaDias = Math.round((salida - entrada) / (1000 * 60 * 60 * 24));
  const totalNoches = diferenciaDias > 0 ? diferenciaDias : 1;

  const htmlContent = confirmacionReservaHabitacion({
    nombreCliente,
    tipoHabitacion,
    numeroConfirmacion,
    fechaEntrada,
    fechaSalida,
    totalNoches,
    precio,
    metodoPago,
    detallesAdicionales
  });

  return sendEmail({
    email,
    subject: `Confirmación de reserva de habitación - Hacienda San Carlos Borromeo`,
    html: htmlContent
  });
};

/**
 * Envía una notificación de gestión administrativa
 * @param {Object} datos - Datos de la notificación
 * @returns {Promise}
 */
const enviarNotificacionGestionAdmin = async (datos) => {
  const {
    destinatarios,
    tipo = 'info',
    asunto,
    mensaje,
    enlaceAccion,
    textoEnlace
  } = datos;

  if (!destinatarios || !asunto || !mensaje) {
    throw new Error('Se requieren destinatarios, asunto y mensaje para enviar la notificación');
  }

  const htmlContent = notificacionGestionAdmin({
    tipo,
    asunto,
    mensaje,
    enlaceAccion,
    textoEnlace
  });

  return sendEmail({
    email: destinatarios,
    subject: `[${tipo.toUpperCase()}] ${asunto} - Hacienda San Carlos Borromeo`,
    html: htmlContent
  });
};

module.exports = {
  sendEmail,
  enviarConfirmacionReservaEvento,
  enviarConfirmacionReservaHabitacion,
  enviarNotificacionGestionAdmin
}; 