const nodemailer = require('nodemailer');

/**
 * Función de utilidad para enviar emails usando nodemailer
 */
const sendEmail = async (options) => {
  // 1. Crear un transportador reutilizable usando la configuración SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports (like 587 with TLS)
    auth: {
      user: process.env.EMAIL_USER, // usuario de email
      pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS, // contraseña de email
    },
    // Para Gmail con puerto 587, a menudo se necesita esto:
    ...(process.env.EMAIL_HOST === 'smtp.gmail.com' && parseInt(process.env.EMAIL_PORT || '587', 10) === 587 && {
      requireTLS: true,
      tls: {
        ciphers: 'SSLv3',
      },
    }),
  });

  // 2. Definir las opciones del correo
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Hacienda San Carlos Borromeo'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`, // dirección del remitente
    to: options.email, // lista de destinatarios
    subject: options.subject, // Asunto
    text: options.text, // cuerpo del texto plano
    html: options.html, // cuerpo del html
  };

  try {
    // 3. Enviar el correo
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado: %s', info.messageId);
    return {
      success: true,
      message: `Correo enviado exitosamente a ${options.email}`,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    // Considerar lanzar el error o devolver un objeto de error más detallado
    return {
      success: false,
      message: `Error al enviar correo a ${options.email}: ${error.message}`,
      error: error // Opcional: incluir el objeto de error completo para depuración interna
    };
  }
};

module.exports = sendEmail; 