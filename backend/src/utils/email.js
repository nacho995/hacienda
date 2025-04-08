/**
 * Función de utilidad para enviar emails
 * Es un placeholder que debería reemplazarse con una implementación real como nodemailer
 */
const sendEmail = async (options) => {
  // Por ahora solo registramos en consola que se enviaría un email
  console.log('---------------- EMAIL MOCK ----------------');
  console.log(`To: ${options.email}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Content: ${options.html ? '[HTML Content]' : options.text}`);
  console.log('------------------------------------------');

  // En un entorno real, aquí se implementaría el envío de email 
  // usando nodemailer u otra librería

  return { 
    success: true, 
    message: 'Email logged to console (mock)' 
  };
};

module.exports = sendEmail; 