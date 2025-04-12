const confirmacionAdmin = ({
  nombreCliente,
  apellidosCliente,
  emailCliente,
  telefonoCliente,
  tipoEvento,
  fechaEvento,
  numeroConfirmacion,
  mensajeCliente,
  urlGestionReserva // Opcional: Enlace al panel de admin
}) => {
  // Paleta de colores (consistente con confirmacionReserva)
  const colors = {
    bgPage: '#f8f8f8',
    bgContainer: '#FFFFFF',
    border: '#A5856A',
    textPrimary: '#333333',
    textSecondary: '#8A6E52',
    textHeader: '#7B5C44',
    accent: '#D1B59B',
    accentLight: '#F0E8DC',
    buttonText: '#FFFFFF'
  };

  // Fuentes
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
  <title>Nueva Solicitud de Reserva de Evento - ${numeroConfirmacion || 'Pendiente'}</title>
  <style>
    body { font-family: ${fonts.body}; margin: 0; padding: 0; background-color: ${colors.bgPage}; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
    a { color: ${colors.border}; text-decoration: underline; }
    .email-wrapper { padding: 20px 0; }
    .email-container { background-color: ${colors.bgContainer}; border: 1px solid #e0e0e0; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin: 0 auto; max-width: 600px; text-align: center; border-top: 5px solid ${colors.border}; }
    .header-cell { padding: 30px 30px 20px 30px; text-align: center; }
    .header-title { font-family: ${fonts.header}; color: ${colors.textHeader}; font-size: 28px; font-weight: 600; margin: 0; }
    .content-cell { color: ${colors.textPrimary}; font-size: 16px; line-height: 1.7; padding: 20px 40px; text-align: left; }
    .content-cell p { margin: 0 0 18px 0; }
    .section-title { font-size: 18px; font-weight: bold; color: ${colors.textHeader}; margin-bottom: 15px; border-bottom: 1px solid ${colors.accent}; padding-bottom: 8px; }
    .details-section { background-color: ${colors.accentLight}; padding: 20px 30px; margin: 15px 0 25px 0; text-align: left; border-radius: 4px; }
    .details-item { padding: 5px 0; color: ${colors.textSecondary}; font-size: 15px; }
    .details-item strong { color: ${colors.textPrimary}; font-weight: 700; }
    .mensaje-cliente { margin-top: 20px; padding: 15px; border: 1px dashed ${colors.accent}; background-color: #fffdf9; border-radius: 4px; }
    .mensaje-cliente strong { display: block; margin-bottom: 8px; color: ${colors.textHeader}; }
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
              <p class="header-title" style="font-family: ${fonts.header}; color: ${colors.textHeader}; font-size: 28px; font-weight: 600; margin: 0;">Nueva Solicitud de Reserva</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td class="content-cell" style="color: ${colors.textPrimary}; font-size: 16px; line-height: 1.7; padding: 20px 40px; text-align: left;">
              <p style="margin: 0 0 18px 0;">Se ha recibido una nueva solicitud de reserva de evento a través del sitio web.</p>
              
              <p class="section-title" style="font-size: 18px; font-weight: bold; color: ${colors.textHeader}; margin-bottom: 15px; border-bottom: 1px solid ${colors.accent}; padding-bottom: 8px;">Detalles del Evento</p>
              <table class="details-section" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${colors.accentLight}; padding: 20px 30px; margin: 15px 0 25px 0; text-align: left; border-radius: 4px;">
                <tr>
                  <td>
                    <p class="details-item" style="padding: 5px 0; color: ${colors.textSecondary}; font-size: 15px;"><strong style="color: ${colors.textPrimary}; font-weight: 700;">Confirmación #:</strong> ${numeroConfirmacion || 'N/A'}</p>
                    <p class="details-item" style="padding: 5px 0; color: ${colors.textSecondary}; font-size: 15px;"><strong style="color: ${colors.textPrimary}; font-weight: 700;">Tipo de Evento:</strong> ${tipoEvento || 'No especificado'}</p>
                    <p class="details-item" style="padding: 5px 0; color: ${colors.textSecondary}; font-size: 15px;"><strong style="color: ${colors.textPrimary}; font-weight: 700;">Fecha Solicitada:</strong> ${fechaEvento || 'No especificada'}</p>
                     <!-- Aquí puedes añadir más detalles del evento si los tienes: hora, invitados, espacio, etc. -->
                  </td>
                </tr>
              </table>

              <p class="section-title" style="font-size: 18px; font-weight: bold; color: ${colors.textHeader}; margin-bottom: 15px; border-bottom: 1px solid ${colors.accent}; padding-bottom: 8px;">Datos del Cliente</p>
               <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                 <tr>
                   <td style="padding-right: 10px; vertical-align: top; width: 50%;">
                     <p class="details-item" style="padding: 5px 0; color: ${colors.textSecondary}; font-size: 15px;"><strong style="color: ${colors.textPrimary}; font-weight: 700;">Nombre:</strong> ${nombreCliente || 'No especificado'}</p>
                     <p class="details-item" style="padding: 5px 0; color: ${colors.textSecondary}; font-size: 15px;"><strong style="color: ${colors.textPrimary}; font-weight: 700;">Apellidos:</strong> ${apellidosCliente || 'No especificado'}</p>
                   </td>
                   <td style="padding-left: 10px; vertical-align: top; width: 50%;">
                      <p class="details-item" style="padding: 5px 0; color: ${colors.textSecondary}; font-size: 15px;"><strong style="color: ${colors.textPrimary}; font-weight: 700;">Email:</strong> <a href="mailto:${emailCliente || '#'}" style="color: ${colors.border}; text-decoration: underline;">${emailCliente || 'No especificado'}</a></p>
                      <p class="details-item" style="padding: 5px 0; color: ${colors.textSecondary}; font-size: 15px;"><strong style="color: ${colors.textPrimary}; font-weight: 700;">Teléfono:</strong> ${telefonoCliente || 'No especificado'}</p>
                   </td>
                 </tr>
               </table>

              ${mensajeCliente ? `
              <div class="mensaje-cliente" style="margin-top: 20px; padding: 15px; border: 1px dashed ${colors.accent}; background-color: #fffdf9; border-radius: 4px;">
                <strong style="display: block; margin-bottom: 8px; color: ${colors.textHeader};">Mensaje del Cliente:</strong>
                <p style="margin: 0; font-style: italic; color: ${colors.textSecondary};">${mensajeCliente}</p>
              </div>
              ` : ''}

            </td>
          </tr>
          <!-- Button (Optional - if URL exists) -->
          ${urlGestionReserva ? `
          <tr>
            <td class="button-cell" style="padding: 15px 0 30px 0; text-align: center;">
              <a href="${urlGestionReserva}" target="_blank" class="button-link" style="display: inline-block; background-color: ${colors.border}; color: ${colors.buttonText}; padding: 14px 35px; text-decoration: none; font-weight: bold; border-radius: 4px; font-family: ${fonts.body}; font-size: 16px;">
                Gestionar Reserva en Panel
              </a>
            </td>
          </tr>
          ` : ''}
          <!-- Footer -->
          <tr>
            <td class="footer-cell" style="font-size: 12px; color: ${colors.textSecondary}; padding: 25px 30px; border-top: 1px solid #e0e0e0; text-align: center; line-height: 1.5;">
              <p style="margin: 0;">Este es un correo de notificación automático.</p>
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

module.exports = confirmacionAdmin; 