const confirmacionReserva = ({ nombreCliente, tipoEvento, fechaEvento, numeroConfirmacion, urlConfirmacion }) => {
  // Paleta de colores refinada (basada en globals.css)
  const colors = {
    bgPage: '#f8f8f8', // Fondo general gris muy claro, casi blanco
    bgContainer: '#FFFFFF', // Contenedor blanco puro para elegancia
    border: '#A5856A', // Marrón oscuro para el borde principal
    textPrimary: '#333333', // Gris oscuro para texto principal (mejor legibilidad)
    textSecondary: '#8A6E52', // Marrón texto para detalles y footer
    textHeader: '#7B5C44', // Marrón oscuro para el título principal
    accent: '#D1B59B', // Marrón medio para acentos (bordes sutiles, botón)
    accentLight: '#F0E8DC', // Marrón muy claro para fondos de sección
    buttonText: '#FFFFFF' // Texto blanco para el botón (contraste)
  };

  // Fuentes (con fallbacks para emails)
  const fonts = {
    body: "'Montserrat', Helvetica, Arial, sans-serif",
    header: "'Cormorant Garamond', Georgia, 'Times New Roman', serif"
  };

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
  <title>Confirmación de Reserva - Hacienda San Carlos Borromeo</title>
  <style>
    body { font-family: ${fonts.body}; margin: 0; padding: 0; background-color: ${colors.bgPage}; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
    a { color: ${colors.border}; text-decoration: underline; }
    .email-wrapper { padding: 20px 0; }
    .email-container { background-color: ${colors.bgContainer}; border: 1px solid #e0e0e0; /* Borde más sutil */ box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin: 0 auto; max-width: 600px; text-align: center; border-top: 5px solid ${colors.border}; /* Borde superior grueso */ }
    .header-cell { padding: 30px 30px 20px 30px; text-align: center; }
    .header-title { font-family: ${fonts.header}; color: ${colors.textHeader}; font-size: 32px; font-weight: 600; margin: 0; }
    .content-cell { color: ${colors.textPrimary}; font-size: 16px; line-height: 1.7; padding: 20px 40px; text-align: left; }
    .content-cell p { margin: 0 0 18px 0; }
    .confirmation-number { font-size: 22px; font-weight: bold; color: ${colors.textHeader}; margin: 10px 0 25px 0; display: block; text-align: center; }
    .details-section { background-color: ${colors.accentLight}; padding: 20px 30px; margin: 15px 0 25px 0; text-align: left; }
    .details-title { font-weight: bold; color: ${colors.textHeader}; margin-bottom: 15px; font-size: 17px; }
    .details-item { padding: 4px 0; color: ${colors.textSecondary}; font-size: 15px; }
    .details-item strong { color: ${colors.textPrimary}; font-weight: 700; }
    .button-cell { padding: 15px 0 30px 0; text-align: center; }
    .button-link { display: inline-block; background-color: ${colors.border}; /* Botón marrón oscuro */ color: ${colors.buttonText}; padding: 14px 35px; text-decoration: none; font-weight: bold; border-radius: 4px; font-family: ${fonts.body}; font-size: 16px; transition: background-color 0.3s ease; }
    .footer-cell { font-size: 12px; color: ${colors.textSecondary}; padding: 25px 30px; border-top: 1px solid #e0e0e0; text-align: center; line-height: 1.5; }
    .footer-cell p { margin: 0 0 8px 0; }
    .footer-cell a { color: ${colors.border}; text-decoration: underline; }

    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; border-radius: 0 !important; border-left: none; border-right: none; }
      .content-cell { padding: 20px; }
      .header-cell { padding: 25px 20px 15px 20px; }
      .details-section { padding: 15px 20px; }
    }
  </style>
</head>
<body style="font-family: ${fonts.body}; margin: 0; padding: 0; background-color: ${colors.bgPage};">
  <table class="email-wrapper" width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 20px 0;">
    <tr>
      <td align="center">
        <table class="email-container" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: ${colors.bgContainer}; border: 1px solid #e0e0e0; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin: 0 auto; max-width: 600px; text-align: center; border-top: 5px solid ${colors.border};">
          <!-- Header -->
          <tr>
            <td class="header-cell" style="padding: 30px 30px 20px 30px; text-align: center;">
              <p class="header-title" style="font-family: ${fonts.header}; color: ${colors.textHeader}; font-size: 32px; font-weight: 600; margin: 0;">Hacienda San Carlos Borromeo</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td class="content-cell" style="color: ${colors.textPrimary}; font-size: 16px; line-height: 1.7; padding: 20px 40px; text-align: left;">
              <p style="margin: 0 0 18px 0;">Estimado/a ${nombreCliente || 'Cliente'},</p>
              <p style="margin: 0 0 18px 0;">Es un placer confirmar la recepción de su solicitud de reserva en <strong>Hacienda San Carlos Borromeo</strong>.</p>
              <p style="margin: 0 0 18px 0;">Hemos registrado su interés para un <strong>${tipoEvento || 'Evento Especial'}</strong> en la fecha <strong>${fechaEvento || 'indicada'}</strong>.</p>
              <p style="margin: 0;">Su número de confirmación es:</p>
              <span class="confirmation-number" style="font-size: 22px; font-weight: bold; color: ${colors.textHeader}; margin: 10px 0 25px 0; display: block; text-align: center;">${numeroConfirmacion || 'N/A'}</span>
              <p style="margin: 0; text-align: center;">Guarde este número para futuras referencias.</p>
            </td>
          </tr>
          <!-- Details Section -->
          <tr>
            <td style="padding: 0 40px;">
              <table class="details-section" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${colors.accentLight}; padding: 20px 30px; margin: 15px 0 25px 0; text-align: left;">
                <tr>
                  <td>
                    <p class="details-title" style="font-weight: bold; color: ${colors.textHeader}; margin-bottom: 15px; font-size: 17px;">Resumen de su Solicitud:</p>
                    <p class="details-item" style="padding: 4px 0; color: ${colors.textSecondary}; font-size: 15px;"><strong style="color: ${colors.textPrimary}; font-weight: 700;">Tipo de Evento:</strong> ${tipoEvento || 'No especificado'}</p>
                    <p class="details-item" style="padding: 4px 0; color: ${colors.textSecondary}; font-size: 15px;"><strong style="color: ${colors.textPrimary}; font-weight: 700;">Fecha Solicitada:</strong> ${fechaEvento || 'No especificada'}</p>
                    <p class="details-item" style="padding: 4px 0; color: ${colors.textSecondary}; font-size: 15px;"><strong style="color: ${colors.textPrimary}; font-weight: 700;">Número Confirmación:</strong> ${numeroConfirmacion || 'N/A'}</p>
                    <p class="details-item" style="padding: 4px 0; color: ${colors.textSecondary}; font-size: 15px;"><strong style="color: ${colors.textPrimary}; font-weight: 700;">Estado Actual:</strong> Pendiente de Revisión</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Button (Optional - if URL exists) -->
          ${urlConfirmacion ? `
          <tr>
            <td class="button-cell" style="padding: 15px 0 30px 0; text-align: center;">
              <a href="${urlConfirmacion}" target="_blank" class="button-link" style="display: inline-block; background-color: ${colors.border}; color: ${colors.buttonText}; padding: 14px 35px; text-decoration: none; font-weight: bold; border-radius: 4px; font-family: ${fonts.body}; font-size: 16px;">
                Ver Detalles en Línea
              </a>
            </td>
          </tr>
          ` : ''}
          <!-- Footer -->
          <tr>
            <td class="footer-cell" style="font-size: 12px; color: ${colors.textSecondary}; padding: 25px 30px; border-top: 1px solid #e0e0e0; text-align: center; line-height: 1.5;">
              <p style="margin: 0 0 8px 0;">Este correo ha sido generado automáticamente. Para cualquier consulta, por favor, contacte con nosotros a través de los canales oficiales.</p>
              <p style="margin: 0 0 8px 0;">Hacienda San Carlos Borromeo</p>
              <p style="margin: 0;"><a href="${process.env.FRONTEND_URL || 'https://hacienda-bodas.com'}" target="_blank" style="color: ${colors.border}; text-decoration: underline;">hacienda-bodas.com</a> | Teléfono de contacto</p>
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

module.exports = confirmacionReserva; 