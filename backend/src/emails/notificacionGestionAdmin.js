/**
 * Plantilla de email para notificar a los administradores cuando un cliente
 * selecciona que los organizadores gestionen los servicios y/o habitaciones
 */
const notificacionGestionAdmin = ({
  accion, // Ej: "Confirmación", "Cancelación", "Modificación"
  tipoReserva, // Ej: "Evento", "Habitación"
  numeroConfirmacion,
  nombreCliente,
  emailCliente,
  detallesAdicionales, // Un objeto o string con detalles específicos de la acción
  urlGestionReserva // Enlace al panel de admin para ver la reserva
}) => {
  // Paleta de colores (consistente)
  const colors = {
    bgPage: '#f8f8f8',
    bgContainer: '#FFFFFF',
    border: '#A5856A',
    textPrimary: '#333333',
    textSecondary: '#8A6E52',
    textHeader: '#7B5C44',
    accent: '#D1B59B',
    accentLight: '#F0E8DC',
    buttonText: '#FFFFFF',
    // Colores específicos para estado (opcional)
    colorConfirmacion: '#28a745', // Verde
    colorCancelacion: '#dc3545', // Rojo
    colorModificacion: '#ffc107' // Amarillo
  };

  // Fuentes
  const fonts = {
    body: "'Montserrat', Helvetica, Arial, sans-serif",
    header: "'Cormorant Garamond', Georgia, 'Times New Roman', serif"
  };

  // Determinar el color del título basado en la acción
  let titleColor = colors.textHeader;
  if (accion?.toLowerCase().includes('confirmada')) titleColor = colors.colorConfirmacion;
  if (accion?.toLowerCase().includes('cancelada')) titleColor = colors.colorCancelacion;
  if (accion?.toLowerCase().includes('modificada')) titleColor = colors.colorModificacion;

  // Formatear detalles adicionales si es un objeto
  let detallesHtml = '';
  if (typeof detallesAdicionales === 'string') {
    detallesHtml = `<p class="details-item" style="padding: 5px 0; color: ${colors.textSecondary}; font-size: 15px;">${detallesAdicionales}</p>`;
  } else if (typeof detallesAdicionales === 'object' && detallesAdicionales !== null) {
    detallesHtml = Object.entries(detallesAdicionales)
      .map(([key, value]) => `<p class="details-item" style="padding: 5px 0; color: ${colors.textSecondary}; font-size: 15px;"><strong style="color: ${colors.textPrimary}; font-weight: 700;">${key}:</strong> ${value}</p>`)
      .join('');
  }

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
  <title>Notificación de Gestión: ${accion || 'Acción'} - Reserva ${numeroConfirmacion || 'N/A'}</title>
  <style>
    body { font-family: ${fonts.body}; margin: 0; padding: 0; background-color: ${colors.bgPage}; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
    a { color: ${colors.border}; text-decoration: underline; }
    .email-wrapper { padding: 20px 0; }
    .email-container { background-color: ${colors.bgContainer}; border: 1px solid #e0e0e0; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin: 0 auto; max-width: 600px; text-align: center; border-top: 5px solid ${colors.border}; }
    .header-cell { padding: 30px 30px 20px 30px; text-align: center; }
    .header-title { font-family: ${fonts.header}; font-size: 28px; font-weight: 600; margin: 0; }
    .content-cell { color: ${colors.textPrimary}; font-size: 16px; line-height: 1.7; padding: 20px 40px; text-align: left; }
    .content-cell p { margin: 0 0 18px 0; }
    .section-title { font-size: 18px; font-weight: bold; color: ${colors.textHeader}; margin-bottom: 15px; border-bottom: 1px solid ${colors.accent}; padding-bottom: 8px; }
    .details-section { background-color: ${colors.accentLight}; padding: 20px 30px; margin: 15px 0 25px 0; text-align: left; border-radius: 4px; }
    .details-item { padding: 5px 0; color: ${colors.textSecondary}; font-size: 15px; }
    .details-item strong { color: ${colors.textPrimary}; font-weight: 700; }
    .button-cell { padding: 15px 0 30px 0; text-align: center; }
    .button-link { display: inline-block; background-color: ${colors.border}; color: ${colors.buttonText}; padding: 14px 35px; text-decoration: none; font-weight: bold; border-radius: 4px; font-family: ${fonts.body}; font-size: 16px; transition: background-color 0.3s ease; }
    .footer-cell { font-size: 12px; color: ${colors.textSecondary}; padding: 25px 30px; border-top: 1px solid #e0e0e0; text-align: center; line-height: 1.5; }

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
              <p class="header-title" style="font-family: ${fonts.header}; font-size: 28px; font-weight: 600; margin: 0; color: ${titleColor};">Reserva ${accion || 'Gestionada'}</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td class="content-cell" style="color: ${colors.textPrimary}; font-size: 16px; line-height: 1.7; padding: 20px 40px; text-align: left;">
              <p style="margin: 0 0 18px 0;">Se ha realizado una acción de gestión sobre una reserva:</p>
              
              <p class="section-title" style="font-size: 18px; font-weight: bold; color: ${colors.textHeader}; margin-bottom: 15px; border-bottom: 1px solid ${colors.accent}; padding-bottom: 8px;">Detalles de la Reserva Afectada</p>
              <table class="details-section" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${colors.accentLight}; padding: 20px 30px; margin: 15px 0 25px 0; text-align: left; border-radius: 4px;">
                <tr>
                  <td>
                    <p class="details-item" style="padding: 5px 0; color: ${colors.textSecondary}; font-size: 15px;"><strong style="color: ${colors.textPrimary}; font-weight: 700;">Acción Realizada:</strong> ${accion || 'No especificada'}</p>
                    <p class="details-item" style="padding: 5px 0; color: ${colors.textSecondary}; font-size: 15px;"><strong style="color: ${colors.textPrimary}; font-weight: 700;">Tipo de Reserva:</strong> ${tipoReserva || 'No especificado'}</p>
                    <p class="details-item" style="padding: 5px 0; color: ${colors.textSecondary}; font-size: 15px;"><strong style="color: ${colors.textPrimary}; font-weight: 700;">Confirmación #:</strong> ${numeroConfirmacion || 'N/A'}</p>
                    <p class="details-item" style="padding: 5px 0; color: ${colors.textSecondary}; font-size: 15px;"><strong style="color: ${colors.textPrimary}; font-weight: 700;">Cliente:</strong> ${nombreCliente || 'No especificado'} (<a href="mailto:${emailCliente || '#'}" style="color: ${colors.border}; text-decoration: underline;">${emailCliente || 'N/A'}</a>)</p>
                    ${detallesHtml} <!-- Detalles adicionales específicos de la acción -->
                  </td>
                </tr>
              </table>

            </td>
          </tr>
          <!-- Button (Optional - if URL exists) -->
          ${urlGestionReserva ? `
          <tr>
            <td class="button-cell" style="padding: 15px 0 30px 0; text-align: center;">
              <a href="${urlGestionReserva}" target="_blank" class="button-link" style="display: inline-block; background-color: ${colors.border}; color: ${colors.buttonText}; padding: 14px 35px; text-decoration: none; font-weight: bold; border-radius: 4px; font-family: ${fonts.body}; font-size: 16px;">
                Ver Reserva en Panel
              </a>
            </td>
          </tr>
          ` : ''}
          <!-- Footer -->
          <tr>
            <td class="footer-cell" style="font-size: 12px; color: ${colors.textSecondary}; padding: 25px 30px; border-top: 1px solid #e0e0e0; text-align: center; line-height: 1.5;">
              <p style="margin: 0;">Notificación automática del sistema de gestión de reservas.</p>
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

module.exports = notificacionGestionAdmin;
