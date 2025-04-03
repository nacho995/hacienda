const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
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
  
  return info;
};

module.exports = sendEmail; 