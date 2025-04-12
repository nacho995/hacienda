const userAccountApprovedTemplate = ({ nombreUsuario, loginUrl }) => {
  const logoUrl = process.env.LOGO_URL || 'https://via.placeholder.com/150x50?text=Hacienda+Logo'; // Reemplaza con la URL real de tu logo

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡Cuenta Aprobada! - Hacienda San Carlos Borromeo</title>
  <style>
    /* Estilos generales (iguales a otras plantillas) */
    body { margin: 0; padding: 0; background-color: #FAF3E0; font-family: Georgia, 'Times New Roman', Times, serif; }
    .email-container { max-width: 600px; margin: 20px auto; background-color: #FFFFFF; border: 1px solid #E0D8CC; border-radius: 8px; overflow: hidden; }
    .header { background-color: #4E3629; padding: 20px; text-align: center; }
    .header img { max-width: 180px; height: auto; }
    .content { padding: 30px; color: #4E3629; font-size: 16px; line-height: 1.6; }
    .content h1 { color: #800020; font-family: Didot, Georgia, 'Times New Roman', serif; font-size: 24px; margin-top: 0; margin-bottom: 20px; font-weight: normal; text-align: center; }
    .content p { margin-bottom: 15px; }
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
              <h1 style="color: #800020; font-family: Didot, Georgia, 'Times New Roman', serif; font-size: 24px; margin-top: 0; margin-bottom: 20px; font-weight: normal; text-align: center;">¡Bienvenido/a! Su Cuenta Ha Sido Aprobada</h1>
              <p>Estimado/a ${nombreUsuario || 'Usuario'},</p>
              <p>¡Buenas noticias! Su solicitud de cuenta en Hacienda San Carlos Borromeo ha sido revisada y aprobada.</p>
              <p>Ya puede acceder a su cuenta y comenzar a explorar nuestros servicios. Haga clic en el botón de abajo para iniciar sesión:</p>
              <div style="text-align: center; margin-top: 30px; margin-bottom: 20px;" class="button-container">
                <a href="${loginUrl || '#'}" target="_blank" style="background-color: #800020; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-family: Arial, Helvetica, sans-serif; font-size: 16px;" class="button">Iniciar Sesión</a>
              </div>
              <p>Si tiene alguna pregunta, no dude en contactarnos.</p>
              <p>¡Le esperamos!</p>
              <p><strong>El Equipo de Hacienda San Carlos Borromeo</strong></p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #FAF3E0; padding: 20px; text-align: center; font-size: 12px; color: #918174;" class="footer">
              <p>&copy; ${new Date().getFullYear()} Hacienda San Carlos Borromeo. Todos los derechos reservados.</p>
              <p>Carretera Nacional Km 30, San Carlos, México</p>
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

module.exports = userAccountApprovedTemplate; 