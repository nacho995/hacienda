const asyncHandler = require('../middleware/async');
const { sendEmail } = require('../utils/email');
const contactFormConfirmation = require('../emails/contactFormConfirmation');

/**
 * @desc    Envía mensaje de contacto desde el formulario
 * @route   POST /api/contacto
 * @access  Public
 */
exports.enviarFormularioContacto = asyncHandler(async (req, res) => {
  const { nombre, email, telefono, fecha, tipoEvento, invitados, mensaje } = req.body;
  
  if (!nombre || !email || !telefono || !tipoEvento) {
    return res.status(400).json({
      success: false,
      message: 'Por favor complete todos los campos obligatorios'
    });
  }

  try {
    // Formatear los datos para la plantilla
    const nombreCompleto = nombre.trim();
    const asunto = `Consulta sobre ${tipoEvento}`;
    const fechaContacto = new Date();
    
    // Enviar email de confirmación al cliente
    const htmlCliente = contactFormConfirmation({
      nombreCompleto,
      email,
      telefono,
      asunto,
      mensaje,
      fechaContacto
    });
    
    await sendEmail({
      email,
      subject: 'Hemos recibido su mensaje - Hacienda San Carlos Borromeo',
      html: htmlCliente
    });
    
    // Enviar notificación a los administradores
    const adminEmailsString = process.env.ADMIN_EMAIL;
    if (adminEmailsString) {
      const adminEmails = adminEmailsString.split(',').map(email => email.trim()).filter(email => email);
      
      if (adminEmails.length > 0) {
        const htmlAdmin = `
          <h1>Nuevo mensaje de contacto</h1>
          <p>Se ha recibido un nuevo mensaje de contacto con los siguientes detalles:</p>
          <ul>
            <li><strong>Nombre:</strong> ${nombreCompleto}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Teléfono:</strong> ${telefono}</li>
            <li><strong>Fecha tentativa:</strong> ${fecha || 'No especificada'}</li>
            <li><strong>Tipo de evento:</strong> ${tipoEvento}</li>
            <li><strong>Número de invitados:</strong> ${invitados || 'No especificado'}</li>
          </ul>
          <h2>Mensaje:</h2>
          <p>${mensaje || 'Sin mensaje adicional'}</p>
        `;
        
        await sendEmail({
          email: adminEmails,
          subject: `Nuevo contacto: ${nombreCompleto} - ${tipoEvento}`,
          html: htmlAdmin
        });
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Mensaje enviado correctamente. Nos pondremos en contacto pronto.'
    });
    
  } catch (error) {
    console.error('Error al enviar correo de contacto:', error);
    res.status(500).json({
      success: false,
      message: 'Hubo un problema al enviar el mensaje. Por favor intente de nuevo más tarde.'
    });
  }
}); 