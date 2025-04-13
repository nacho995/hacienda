/**
 * Plantilla de email para enviar instrucciones de pago por transferencia bancaria.
 */

const bankTransferInstructionsTemplate = ({ nombreCliente, numeroConfirmacion, montoTotal, detallesBancarios }) => {
    // Paleta de colores (manteniendo la temática)
    const colors = {
      primary: '#8D6E63', // Marrón medio
      secondary: '#A1887F', // Marrón claro
      accent: '#BCAAA4', // Beige
      darkBrown: '#5D4037', // Marrón oscuro
      ivory: '#F8F5F2', // Un marfil/crema más suave para el fondo general
      textDark: '#3E2723', // Marrón muy oscuro para texto
      textLight: '#FFFFFF', // Blanco
      gold: '#C0A062', // Un dorado menos brillante, más elegante
      goldLight: '#E0D6C1', // Dorado muy pálido para bordes/fondos sutiles
      success: '#4CAF50', // Verde para confirmación (opcional)
      warning: '#FFA000', // Naranja/ámbar para advertencias
    };
  
    // Estilos en línea refinados para consistencia y legibilidad
    const styles = {
      body: `font-family: 'Lato', Arial, sans-serif; margin: 0; padding: 0; background-color: ${colors.ivory}; color: ${colors.textDark}; line-height: 1.6; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;`,
      wrapper: `max-width: 600px; margin: 30px auto; background-color: ${colors.textLight}; border: 1px solid ${colors.goldLight}; border-radius: 10px; overflow: hidden; box-shadow: 0 6px 18px rgba(0,0,0,0.08);`,
      header: `background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.darkBrown} 100%); padding: 35px 25px; text-align: center; color: ${colors.textLight}; border-bottom: 3px solid ${colors.gold};`,
      headerTitle: `font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 700; margin: 0; letter-spacing: 1.5px; text-shadow: 1px 1px 3px rgba(0,0,0,0.25);`,
      content: `padding: 35px 40px;`, // Mayor padding
      greeting: `font-size: 19px; color: ${colors.darkBrown}; margin-bottom: 25px; font-weight: bold;`,
      paragraph: `margin-bottom: 18px; color: ${colors.textDark}; font-size: 16px;`, // Ligeramente más grande
      highlight: `color: ${colors.primary}; font-weight: 700;`, // Usar 700 para bold de Lato
      link: `color: ${colors.primary}; text-decoration: none; font-weight: 700;`, // Estilo para enlaces si se añaden
      bankDetailsBox: `background-color: ${colors.ivory}; border: 1px dashed ${colors.gold}; padding: 25px; margin: 30px 0; border-radius: 8px;`,
      bankDetailsTitle: `font-size: 17px; font-weight: 700; color: ${colors.darkBrown}; margin-bottom: 18px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid ${colors.goldLight}; padding-bottom: 8px;`,
      bankDetailItem: `margin-bottom: 10px; font-size: 15px; line-height: 1.5;`,
      bankDetailKey: `font-weight: 700; color: ${colors.darkBrown}; display: inline-block; min-width: 100px; margin-right: 5px;`, // Estilo para la clave
      importantNote: `font-size: 14px; color: ${colors.darkBrown}; background-color: ${colors.goldLight}4D; /* Opacidad ligera */ padding: 20px; border-left: 5px solid ${colors.warning}; margin-top: 30px; border-radius: 5px;`, // Usar color warning
      footer: `text-align: center; padding: 25px; font-size: 13px; color: ${colors.secondary}; border-top: 1px solid ${colors.goldLight}; margin-top: 30px; background-color: ${colors.ivory};`,
    };
  
    // Parsear detalles bancarios con claves estilizadas
    const renderBankDetails = () => {
      if (!detallesBancarios) return '<p style="color: red;">Error: Datos bancarios no configurados.</p>';
  
      return detallesBancarios.split(',').map(detail => {
          const parts = detail.trim().split(':');
          if (parts.length >= 2) {
              const key = parts[0].trim();
              const value = parts.slice(1).join(':').trim();
              // Añadir span con estilo para la clave
              return `<div style="${styles.bankDetailItem}"><span style="${styles.bankDetailKey}">${key}:</span> ${value}</div>`;
          }
          return '';
      }).join('');
    };
  
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Instrucciones de Pago por Transferencia - Hacienda San Carlos</title>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&family=Lato:wght@400;700&display=swap" rel="stylesheet">
        <style>
          /* Estilos adicionales para clientes de email que no soportan todo inline */
          body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
          a { color: ${styles.link.color || colors.primary}; text-decoration: none; } /* Fallback color */
        </style>
      </head>
      <body style="${styles.body}">
        <div style="${styles.wrapper}">
          <div style="${styles.header}">
            <h1 style="${styles.headerTitle}">Hacienda San Carlos Borromeo</h1>
          </div>
          <div style="${styles.content}">
            <p style="${styles.greeting}">Estimado/a ${nombreCliente || 'Cliente'},</p>
            <p style="${styles.paragraph}">Gracias por realizar su reserva con nosotros. Su número de confirmación es <strong style="${styles.highlight}">${numeroConfirmacion || 'N/A'}</strong>.</p>
            <p style="${styles.paragraph}">Ha seleccionado pagar mediante transferencia bancaria. Para confirmar su reserva, por favor realice el depósito del monto total de <strong style="${styles.highlight}">$${montoTotal ? montoTotal.toFixed(2) : '0.00'} MXN</strong> a la siguiente cuenta:</p>
  
            <div style="${styles.bankDetailsBox}">
              <h3 style="${styles.bankDetailsTitle}">Datos Bancarios</h3>
              ${renderBankDetails()}
            </div>
  
            <p style="${styles.paragraph}"><strong>Importante:</strong> Una vez realizada la transferencia, por favor envíe su comprobante de pago a nuestro correo electrónico <a href="mailto:hdasancarlos@gmail.com" style="${styles.link}">hdasancarlos@gmail.com</a> o respondiendo a este mensaje, incluyendo su número de confirmación (<strong style="${styles.highlight}">${numeroConfirmacion || 'N/A'}</strong>) para que podamos identificar su pago rápidamente.</p>
  
            <div style="${styles.importantNote}">
              Su reserva se encuentra actualmente como <strong style="${styles.highlight}">pendiente de pago</strong> y será confirmada una vez que recibamos y verifiquemos su comprobante. Si no recibimos el comprobante dentro de los próximos <strong>7 dias</strong>, su reserva podría ser cancelada.
            </div>
  
            <p style="${styles.paragraph}; margin-top: 30px;">Si tiene alguna duda o necesita asistencia, no dude en contactarnos.</p>
            <p style="${styles.paragraph}">¡Esperamos darle la bienvenida pronto!</p>
          </div>
          <div style="${styles.footer}">
            © ${new Date().getFullYear()} Hacienda San Carlos Borromeo. Todos los derechos reservados.
          </div>
        </div>
      </body>
      </html>
    `;
  };
  
  module.exports = bankTransferInstructionsTemplate;