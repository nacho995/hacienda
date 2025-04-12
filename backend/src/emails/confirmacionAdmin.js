const confirmacionAdminTemplate = (datos) => {
  // Datos esperados: nombreCliente, emailCliente, telefonoCliente, tipoEvento, fechaEvento, numeroInvitados, estadoReserva, numeroConfirmacion, modoGestionHabitaciones, totalHabitaciones
  const datosSeguro = datos || {};

  const nombreCliente = datosSeguro.nombreCliente || 'No especificado';
  const emailCliente = datosSeguro.emailCliente || 'No especificado';
  const telefonoCliente = datosSeguro.telefonoCliente || 'No especificado';
  const tipoEvento = datosSeguro.tipoEvento || 'Evento Especial';
  const fechaFormateada = datosSeguro.fechaEvento ? new Date(datosSeguro.fechaEvento).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Fecha no especificada';
  const numeroInvitados = datosSeguro.numeroInvitados || 'No especificado';
  const estadoReserva = datosSeguro.estadoReserva || 'Pendiente';
  const numeroConfirmacion = datosSeguro.numeroConfirmacion || 'N/A';
  const modoGestionHab = datosSeguro.modoGestionHabitaciones || 'No especificado';
  const totalHabitaciones = datosSeguro.totalHabitaciones || 0;
  const logoUrl = process.env.LOGO_URL || 'https://via.placeholder.com/150x50?text=Hacienda+Logo'; // Reemplaza con la URL real de tu logo
  const adminPanelUrl = process.env.ADMIN_PANEL_URL || '#'; // URL al panel de admin

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Reserva de Evento Recibida - Hacienda San Carlos Borromeo</title>
  <style>
    /* Estilos generales (iguales a la plantilla de cliente) */
    body { margin: 0; padding: 0; background-color: #FAF3E0; font-family: Georgia, 'Times New Roman', Times, serif; }
    .email-container { max-width: 600px; margin: 20px auto; background-color: #FFFFFF; border: 1px solid #E0D8CC; border-radius: 8px; overflow: hidden; }
    .header { background-color: #4E3629; padding: 20px; text-align: center; }
    .header img { max-width: 180px; height: auto; }
    .content { padding: 30px; color: #4E3629; font-size: 16px; line-height: 1.6; }
    .content h1 { color: #800020; font-family: Didot, Georgia, 'Times New Roman', serif; font-size: 24px; margin-top: 0; margin-bottom: 20px; font-weight: normal; text-align: center; }
    .content p { margin-bottom: 15px; }
    .details { background-color: #FDFBF5; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 3px solid #800020; }
    .details strong { color: #800020; }
    .alert { background-color: #FFF3CD; border-left: 4px solid #FFC107; padding: 10px 15px; margin: 15px 0; color: #664D03; }
    .button-container { text-align: center; margin-top: 30px; margin-bottom: 20px; }
    .button { background-color: #800020; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-family: Arial, Helvetica, sans-serif; font-size: 16px; }
    .footer { background-color: #FAF3E0; padding: 20px; text-align: center; font-size: 12px; color: #918174; }
    .footer a { color: #800020; text-decoration: none; }
    table { border-collapse: collapse; width: 100%; }
    td { padding: 0; vertical-align: top; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF3E0; font-family: Georgia, 'Times New Roman', Times, serif;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding: 20px 0;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E0D8CC; border-radius: 8px; overflow: hidden;" class="email-container">
          <!-- Header -->
          <tr>
            <td style="background-color: #4E3629; padding: 20px; text-align: center;" class="header">
              <img src="${logoUrl}" alt="Hacienda San Carlos Borromeo Logo" style="max-width: 180px; height: auto;">
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 30px; color: #4E3629; font-size: 16px; line-height: 1.6;" class="content">
              <h1 style="color: #800020; font-family: Didot, Georgia, 'Times New Roman', serif; font-size: 24px; margin-top: 0; margin-bottom: 20px; font-weight: normal; text-align: center;">Nueva Reserva de Evento Recibida</h1>
              <p>Se ha registrado una nueva solicitud de reserva de evento en el sistema:</p>
              <div style="background-color: #FDFBF5; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 3px solid #800020;" class="details">
                <p><strong style="color: #800020;">Número de Confirmación:</strong> ${numeroConfirmacion}</p>
                <p><strong style="color: #800020;">Cliente:</strong> ${nombreCliente}</p>
                <p><strong style="color: #800020;">Email:</strong> <a href="mailto:${emailCliente}" style="color: #800020; text-decoration: underline;">${emailCliente}</a></p>
                <p><strong style="color: #800020;">Teléfono:</strong> ${telefonoCliente}</p>
                <p><strong style="color: #800020;">Tipo de Evento:</strong> ${tipoEvento}</p>
                <p><strong style="color: #800020;">Fecha:</strong> ${fechaFormateada}</p>
                <p><strong style="color: #800020;">Invitados (Aprox):</strong> ${numeroInvitados}</p>
                <p><strong style="color: #800020;">Estado Actual:</strong> ${estadoReserva}</p>
                <p><strong style="color: #800020;">Gestión Habitaciones:</strong> ${modoGestionHab}</p>
                <p><strong style="color: #800020;">Total Habitaciones:</strong> ${totalHabitaciones}</p>
              </div>
              <div style="background-color: #FFF3CD; border-left: 4px solid #FFC107; padding: 10px 15px; margin: 15px 0; color: #664D03;" class="alert">
                <strong>Acción Requerida:</strong> Por favor, revise esta reserva en el panel de administración y contacte al cliente para confirmar detalles y próximos pasos.
              </div>
              <div style="text-align: center; margin-top: 30px; margin-bottom: 20px;" class="button-container">
                <a href="${adminPanelUrl}" target="_blank" style="background-color: #800020; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-family: Arial, Helvetica, sans-serif; font-size: 16px;" class="button">Ir al Panel de Administración</a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #FAF3E0; padding: 20px; text-align: center; font-size: 12px; color: #918174;" class="footer">
              <p>&copy; ${new Date().getFullYear()} Hacienda San Carlos Borromeo</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

module.exports = confirmacionAdminTemplate; 