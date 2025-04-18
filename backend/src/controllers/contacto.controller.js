const asyncHandler = require('../middleware/async');
const { sendEmail } = require('../utils/email');
const contactFormConfirmation = require('../emails/contactFormConfirmation');
const notificacionGestionAdmin = require('../emails/notificacionGestionAdmin');

/**
 * @desc    Envía mensaje de contacto desde el formulario
 * @route   POST /api/contacto
 * @access  Public
 */
exports.enviarFormularioContacto = asyncHandler(async (req, res) => {
  console.log('>>> Petición POST recibida en /api/contacto');
  const { nombre, email, telefono, fecha, tipoEvento, invitados, mensaje } = req.body;
  
  if (!nombre || !email || !telefono || !tipoEvento) {
    console.log('>>> Faltan campos obligatorios en /api/contacto');
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
    
    console.log(`>>> [Contacto] Intentando enviar email de confirmación a: ${email}`);
    await sendEmail({
      email,
      subject: 'Hemos recibido su mensaje - Hacienda San Carlos Borromeo',
      html: htmlCliente
    });
    
    // Enviar notificación a los administradores
    const adminEmailsString = process.env.ADMIN_EMAIL;
    if (adminEmailsString) {
      // Dividir por comas, quitar espacios y filtrar vacíos. Puede ser un array o un string si solo hay uno.
      let adminEmails = adminEmailsString.split(',').map(email => email.trim()).filter(email => email);
      // Si después de filtrar solo queda un email, lo pasamos como string, si no, como array
      if (adminEmails.length === 1) {
        adminEmails = adminEmails[0];
      } else if (adminEmails.length === 0) {
        adminEmails = null; // No hay correos de admin válidos
      }
      
      if (adminEmails) { // Comprobamos si hay emails válidos (string o array no vacío)
        // Usar la plantilla notificacionGestionAdmin
        const htmlAdmin = notificacionGestionAdmin({
          tipo: 'info', // o 'contact'
          asunto: `Nuevo Contacto: ${nombreCompleto} (${tipoEvento || 'Sin especificar'})`,
          mensaje: `Se ha recibido un nuevo mensaje de contacto.<br/><br/>
                     <strong>Nombre:</strong> ${nombreCompleto}<br/>
                     <strong>Email:</strong> ${email}<br/>
                     <strong>Teléfono:</strong> ${telefono || 'No especificado'}<br/>
                     <strong>Fecha tentativa:</strong> ${fecha ? new Date(fecha).toLocaleDateString('es-ES') : 'No especificada'}<br/>
                     <strong>Tipo de evento:</strong> ${tipoEvento || 'No especificado'}<br/>
                     <strong>Invitados:</strong> ${invitados || 'No especificado'}<br/><br/>
                     <strong>Mensaje:</strong><br/>${mensaje || 'Sin mensaje adicional'}`,
          // Opcional: enlace para ver detalles en un panel de admin
          // enlaceAccion: `${process.env.FRONTEND_URL}/admin/mensajes`, 
          // textoEnlace: 'Ver Mensaje'
        });
        
        console.log(`>>> [Contacto] Intentando enviar email de notificación a administradores: ${adminEmails}`);
        await sendEmail({
          email: adminEmails, // Pasamos el string o el array
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