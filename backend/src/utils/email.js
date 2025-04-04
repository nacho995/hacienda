const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // Verificar si las credenciales de correo están configuradas
    if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD || !process.env.EMAIL_SERVICE) {
      console.warn('Configuración de email incompleta. No se enviará el correo.');
      return { sent: false, reason: 'missing_config' };
    }
    
    // Crear el transporte para nodemailer
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Opciones del email
    const mailOptions = {
      from: `Hacienda San Carlos Borromeo <${process.env.EMAIL_USERNAME}>`,
      to: options.email,
      subject: options.subject,
      html: options.html
    };

    // Enviar el email
    const info = await transporter.sendMail(mailOptions);
    
    return { sent: true, info };
  } catch (error) {
    console.error('Error al enviar el email:', error);
    return { sent: false, error: error.message };
  }
};

module.exports = sendEmail; 