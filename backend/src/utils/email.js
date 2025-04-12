const nodemailer = require('nodemailer');
const confirmacionReservaEvento = require('../emails/confirmacionReservaEvento');
const confirmacionReservaHabitacion = require('../emails/confirmacionReservaHabitacion');
const notificacionGestionAdmin = require('../emails/notificacionGestionAdmin');

/**
 * Configura el transporter de nodemailer
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true', // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false // Permitir certificados autofirmados - solo para desarrollo
  }
});

/**
 * Envia un correo utilizando nodemailer
 * @param {Object} options - Opciones del correo
 * @param {string} options.email - Destinatario(s)
 * @param {string} options.subject - Asunto del correo
 * @param {string} options.html - Contenido HTML del correo
 * @returns {Promise}
 */
const sendEmail = async (options) => {
  try {
    const { email, subject, html } = options;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html
    };
    
    // Registrar parámetros (sin mostrar contraseñas)
    console.log('Enviando email con parámetros:', {
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      htmlLength: html?.length || 0,
      transporterConfig: {
        host: transporter?.options?.host,
        port: transporter?.options?.port,
        secure: transporter?.options?.secure,
        auth: { user: transporter?.options?.auth?.user || 'no-user' },
        tls: transporter?.options?.tls
      }
    });
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado con éxito:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error al enviar email:', error);
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

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Confirmación de reserva de ${tipoEvento} - Hacienda San Carlos Borromeo`,
    html: confirmacionReservaEvento({
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
    })
  };

  return transporter.sendMail(mailOptions);
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

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Confirmación de reserva de habitación - Hacienda San Carlos Borromeo`,
    html: confirmacionReservaHabitacion({
      nombreCliente,
      tipoHabitacion,
      numeroConfirmacion,
      fechaEntrada,
      fechaSalida,
      totalNoches,
      precio,
      metodoPago,
      detallesAdicionales
    })
  };

  return transporter.sendMail(mailOptions);
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

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: Array.isArray(destinatarios) ? destinatarios.join(',') : destinatarios,
    subject: `[${tipo.toUpperCase()}] ${asunto} - Hacienda San Carlos Borromeo`,
    html: notificacionGestionAdmin({
      tipo,
      asunto,
      mensaje,
      enlaceAccion,
      textoEnlace
    })
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendEmail,
  enviarConfirmacionReservaEvento,
  enviarConfirmacionReservaHabitacion,
  enviarNotificacionGestionAdmin
}; 