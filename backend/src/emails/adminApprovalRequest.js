const adminApprovalRequestTemplate = ({ nuevoAdminNombre, nuevoAdminEmail, nuevoAdminTelefono, confirmUrl }) => {
  const logoUrl = process.env.LOGO_URL || 'https://via.placeholder.com/150x50?text=Hacienda+Logo'; // Reemplaza con la URL real de tu logo

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Solicitud de Aprobación de Cuenta Admin - Hacienda San Carlos Borromeo</title>
  <style>
    /* Estilos generales (iguales a otras plantillas) */
    body { margin: 0; padding: 0; background-color: #FAF3E0; font-family: Georgia, 'Times New Roman', Times, serif; }
    .email-container { max-width: 600px; margin: 20px auto; background-color: #FFFFFF; border: 1px solid #E0D8CC; border-radius: 8px; overflow: hidden; }
    .header { background-color: #4E3629; padding: 20px; text-align: center; }
    .header img { max-width: 180px; height: auto; }
    .content { padding: 30px; color: #4E3629; font-size: 16px; line-height: 1.6; }
    .content h1 { color: #800020; font-family: Didot, Georgia, 'Times New Roman', serif; font-size: 24px; margin-top: 0; margin-bottom: 20px; font-weight: normal; text-align: center; }
    .content p { margin-bottom: 15px; }
    .details { background-color: #FDFBF5; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 3px solid #800020; }
    .details strong { color: #800020; }
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
              <h1 style="color: #800020; font-family: Didot, Georgia, 'Times New Roman', serif; font-size: 24px; margin-top: 0; margin-bottom: 20px; font-weight: normal; text-align: center;">Solicitud de Aprobación de Cuenta de Administrador</h1>
              <p>Hola,</p>
              <p>Se ha recibido una nueva solicitud para crear una cuenta de administrador en el sistema de Hacienda San Carlos Borromeo.</p>
              <p><strong>Detalles del solicitante:</strong></p>
              <div style="background-color: #FDFBF5; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 3px solid #800020;" class="details">
                <p><strong style="color: #800020;">Nombre:</strong> ${nuevoAdminNombre || 'No especificado'}</p>
                <p><strong style="color: #800020;">Email:</strong> ${nuevoAdminEmail || 'No especificado'}</p>
                <p><strong style="color: #800020;">Teléfono:</strong> ${nuevoAdminTelefono || 'No especificado'}</p>
              </div>
              <p>Para aprobar esta solicitud y activar la cuenta de administrador, por favor haga clic en el siguiente botón:</p>
              <div style="text-align: center; margin-top: 30px; margin-bottom: 20px;" class="button-container">
                <a href="${confirmUrl || '#'}" target="_blank" style="background-color: #800020; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-family: Arial, Helvetica, sans-serif; font-size: 16px;" class="button">Aprobar Cuenta de Administrador</a>
              </div>
              <p>Si usted no reconoce esta solicitud o no desea aprobarla, puede ignorar este correo electrónico de forma segura.</p>
              <p>Atentamente,</p>
              <p><strong>El Sistema de Hacienda San Carlos Borromeo</strong></p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #FAF3E0; padding: 20px; text-align: center; font-size: 12px; color: #918174;" class="footer">
              <p>&copy; ${new Date().getFullYear()} Hacienda San Carlos Borromeo. Todos los derechos reservados.</p>
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

module.exports = adminApprovalRequestTemplate; 