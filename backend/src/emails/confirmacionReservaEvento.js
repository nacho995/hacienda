/**
 * Plantilla de email para confirmación de reserva de evento
 * Diseño premium y elegante
 */

module.exports = function({
  nombreCliente,
  tipoEvento,
  numeroConfirmacion,
  fechaEvento,
  horaInicio,
  horaFin,
  numInvitados,
  precioTotal,
  porcentajePago,
  metodoPago,
  detallesEvento = {},
  habitacionesReservadas = []
}) {
  // Paleta de colores sofisticada
  const colors = {
    gold: '#D4AF37',           // Dorado elegante
    goldLight: '#E9D498',      // Dorado claro
    goldDark: '#B8860B',       // Dorado oscuro
    primary: '#8D6E63',        // Marrón principal
    secondary: '#A1887F',      // Marrón secundario
    accent: '#BCAAA4',         // Acento
    darkBrown: '#5D4037',      // Marrón oscuro
    ivory: '#FFFFF0',          // Marfil para fondo
    creamLight: '#FFF8E1',     // Crema claro
    textDark: '#3E2723',       // Texto oscuro
    textLight: '#FFFFFF',      // Texto claro
    success: '#558B2F'         // Verde éxito
  };

  // Ornamentos decorativos
  const ornamentalCorner = `
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" style="position: absolute; top: 0; left: 0; opacity: 0.8;">
      <path d="M0,0 L120,0 L120,30 C80,30 40,40 30,120 L0,120 Z" fill="${colors.goldLight}" opacity="0.3"/>
      <path d="M0,0 L60,0 C60,40 40,60 0,60 Z" fill="${colors.gold}" opacity="0.4"/>
      <path fill="none" stroke="${colors.goldDark}" stroke-width="1" d="M0,20 Q25,25 30,0 M0,40 Q40,45 45,0 M0,60 Q50,65 65,0"/>
      <path fill="none" stroke="${colors.gold}" stroke-width="1" d="M15,0 Q20,20 0,25 M30,0 Q35,30 0,35 M45,0 Q50,40 0,45"/>
    </svg>
  `;

  const ornamentalCornerReverse = `
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" style="position: absolute; top: 0; right: 0; transform: scaleX(-1); opacity: 0.8;">
      <path d="M0,0 L120,0 L120,30 C80,30 40,40 30,120 L0,120 Z" fill="${colors.goldLight}" opacity="0.3"/>
      <path d="M0,0 L60,0 C60,40 40,60 0,60 Z" fill="${colors.gold}" opacity="0.4"/>
      <path fill="none" stroke="${colors.goldDark}" stroke-width="1" d="M0,20 Q25,25 30,0 M0,40 Q40,45 45,0 M0,60 Q50,65 65,0"/>
      <path fill="none" stroke="${colors.gold}" stroke-width="1" d="M15,0 Q20,20 0,25 M30,0 Q35,30 0,35 M45,0 Q50,40 0,45"/>
    </svg>
  `;

  // Sello premium de evento
  const eventSeal = `
    <div style="position: absolute; top: 20px; right: 20px; transform: rotate(10deg);">
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="${colors.gold}" stroke-width="2"/>
        <circle cx="50" cy="50" r="40" fill="none" stroke="${colors.gold}" stroke-width="1"/>
        <path d="M50,5 
                L52.5,15 L63,15 L55,25 L60,35 L50,27.5 L40,35 L45,25 L37,15 L47.5,15 Z" 
              fill="${colors.gold}" opacity="0.7"/>
        <path d="M50,95 
                L52.5,85 L63,85 L55,75 L60,65 L50,72.5 L40,65 L45,75 L37,85 L47.5,85 Z" 
              fill="${colors.gold}" opacity="0.7"/>
        <text x="50" y="45" font-family="'Playfair Display', serif" font-size="12" text-anchor="middle" fill="${colors.gold}">EVENTO</text>
        <text x="50" y="60" font-family="'Playfair Display', serif" font-size="10" text-anchor="middle" fill="${colors.gold}">EXCLUSIVO</text>
      </svg>
    </div>
  `;

  // Divider decorativo
  const decorativeDivider = `
    <div style="text-align: center; margin: 30px 0;">
      <svg xmlns="http://www.w3.org/2000/svg" width="250" height="25" viewBox="0 0 250 25">
        <line x1="0" y1="12.5" x2="100" y2="12.5" stroke="${colors.gold}" stroke-width="1"/>
        <line x1="150" y1="12.5" x2="250" y2="12.5" stroke="${colors.gold}" stroke-width="1"/>
        <circle cx="125" cy="12.5" r="10" fill="none" stroke="${colors.gold}" stroke-width="1.5"/>
        <circle cx="125" cy="12.5" r="5" fill="${colors.gold}"/>
        <circle cx="100" cy="12.5" r="3" fill="${colors.gold}" opacity="0.6"/>
        <circle cx="150" cy="12.5" r="3" fill="${colors.gold}" opacity="0.6"/>
      </svg>
    </div>
  `;

  // Obtener icono según tipo de evento
  const getIconoEvento = (tipo) => {
    const tipoLower = tipo.toLowerCase();
    if (tipoLower.includes('boda')) return '💍';
    if (tipoLower.includes('corporativo')) return '🏢';
    if (tipoLower.includes('cumpleaños')) return '🎂';
    if (tipoLower.includes('aniversario')) return '💝';
    return '🎉'; // Icono predeterminado
  };
  
  // Formatear fecha para mostrar
  const formatearFecha = (fechaString) => {
    if (!fechaString) return 'No especificada';
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Formatear precio
  const formatearPrecio = (valor) => {
    if (!valor && valor !== 0) return 'A consultar';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(valor);
  };
  
  // Generar detalles adicionales del evento
  const generarDetallesHTML = (detalles) => {
    if (!detalles || Object.keys(detalles).length === 0) return '';
    
    let detallesHTML = '';
    for (const [clave, valor] of Object.entries(detalles)) {
      if (valor) {
        const claveFormateada = clave.charAt(0).toUpperCase() + clave.slice(1).replace(/([A-Z])/g, ' $1');
        detallesHTML += `
          <tr>
            <th style="text-align: left; padding: 12px 20px 12px 0; color: ${colors.darkBrown}; font-weight: 600; width: 40%; border-bottom: 1px dashed ${colors.accent};">${claveFormateada}:</th>
            <td style="padding: 12px 0; color: ${colors.textDark}; border-bottom: 1px dashed ${colors.accent};">${valor}</td>
          </tr>
        `;
      }
    }
    
    return detallesHTML ? `
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid ${colors.goldLight};">
        <p style="margin: 0 0 15px; font-family: 'Cormorant Garamond', Georgia, serif; color: ${colors.darkBrown}; font-size: 18px; font-weight: 600;">Detalles adicionales</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>
            ${detallesHTML}
          </tbody>
        </table>
      </div>
    ` : '';
  };
  
  // Generar HTML para habitaciones reservadas
  const generarHabitacionesHTML = (habitaciones) => {
    if (!habitaciones || habitaciones.length === 0) return '';
    
    let habitacionesHTML = '';
    habitaciones.forEach((habitacion, index) => {
      habitacionesHTML += `
        <div style="background-color: ${colors.ivory}; border-radius: 10px; padding: 20px; margin-bottom: ${index < habitaciones.length - 1 ? '15px' : '0'}; box-shadow: 0 3px 10px rgba(0,0,0,0.05); position: relative; overflow: hidden; border-left: 3px solid ${colors.gold};">
          <div style="position: absolute; top: 0; right: 0; width: 40px; height: 40px; background-color: ${colors.goldLight}; opacity: 0.2; border-radius: 0 0 0 40px;"></div>
          <h4 style="font-family: 'Cormorant Garamond', Georgia, serif; color: ${colors.darkBrown}; margin: 0 0 15px; font-size: 18px; border-bottom: 1px solid ${colors.goldLight}; padding-bottom: 8px;">Habitación ${index + 1}: ${habitacion.tipoHabitacion || 'Estándar'}</h4>
          <table style="width: 100%; border-collapse: collapse;">
            ${habitacion.fechaEntrada ? `
            <tr>
              <td style="padding: 5px 0; color: ${colors.darkBrown}; font-weight: 600; width: 40%;">Check-in:</td>
              <td style="padding: 5px 0; color: ${colors.textDark};">${formatearFecha(habitacion.fechaEntrada)}</td>
            </tr>` : ''}
            ${habitacion.fechaSalida ? `
            <tr>
              <td style="padding: 5px 0; color: ${colors.darkBrown}; font-weight: 600;">Check-out:</td>
              <td style="padding: 5px 0; color: ${colors.textDark};">${formatearFecha(habitacion.fechaSalida)}</td>
            </tr>` : ''}
            ${habitacion.precio ? `
            <tr>
              <td style="padding: 5px 0; color: ${colors.darkBrown}; font-weight: 600;">Precio:</td>
              <td style="padding: 5px 0; color: ${colors.textDark};">${formatearPrecio(habitacion.precio)}</td>
            </tr>` : ''}
          </table>
        </div>
      `;
    });
    
    return habitacionesHTML ? `
      <div style="margin-top: 40px;">
        <h3 style="font-family: 'Cormorant Garamond', Georgia, serif; color: ${colors.darkBrown}; margin: 0 0 20px; font-size: 24px; position: relative; padding-bottom: 10px;">
          Habitaciones Reservadas
          <span style="position: absolute; bottom: 0; left: 0; width: 80px; height: 2px; background-color: ${colors.gold};"></span>
        </h3>
        ${habitacionesHTML}
      </div>
    ` : '';
  };
  
  // Calcular pago inicial y restante
  const pagoInicial = precioTotal * (porcentajePago / 100);
  const pagoRestante = precioTotal - pagoInicial;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Evento - Hacienda San Carlos Borromeo</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        
        body { 
          font-family: 'Lato', Arial, sans-serif; 
          margin: 0; 
          padding: 0; 
          background-color: ${colors.ivory};
          color: ${colors.textDark};
          -webkit-font-smoothing: antialiased; 
          line-height: 1.6;
        }
        
        .main-wrapper {
          max-width: 750px;
          margin: 20px auto;
          background: linear-gradient(to bottom, ${colors.ivory} 0%, ${colors.creamLight} 100%);
        }
        
        .main-container {
          position: relative;
          border: 1px solid ${colors.gold};
          margin: 10px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        
        .inner-border {
          position: absolute;
          top: 10px;
          left: 10px;
          right: 10px;
          bottom: 10px;
          border: 1px solid ${colors.gold};
          pointer-events: none;
          z-index: 2;
        }
        
        .header {
          background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.darkBrown} 100%);
          padding: 40px 20px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .header-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0.1;
          background-image: radial-gradient(circle, ${colors.goldLight} 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        .header-title {
          font-family: 'Cormorant Garamond', 'Playfair Display', Georgia, serif;
          color: ${colors.textLight};
          font-size: 36px;
          font-weight: 700;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 3px;
          position: relative;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        
        .header-title:after {
          content: '';
          display: block;
          width: 100px;
          height: 2px;
          background: ${colors.gold};
          margin: 15px auto;
        }
        
        .header-subtitle {
          font-family: 'Lato', Arial, sans-serif;
          color: ${colors.textLight};
          font-size: 18px;
          font-weight: 300;
          margin: 10px 0 0;
          font-style: italic;
          opacity: 0.9;
          letter-spacing: 1px;
        }
        
        .confirmation-badge {
          position: relative;
          background: linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldDark} 100%);
          color: ${colors.textLight};
          font-weight: 700;
          padding: 15px 40px;
          font-size: 18px;
          display: inline-block;
          margin-top: -30px;
          z-index: 3;
          box-shadow: 0 5px 20px rgba(0,0,0,0.2);
          letter-spacing: 1px;
          font-family: 'Playfair Display', Georgia, serif;
          transform: translateY(-50%);
          border-radius: 50px;
        }
        
        .content {
          padding: 60px 40px 40px;
          position: relative;
          z-index: 1;
        }
        
        .greeting {
          font-family: 'Cormorant Garamond', 'Playfair Display', Georgia, serif;
          font-size: 28px;
          margin-bottom: 30px;
          color: ${colors.primary};
          font-weight: 600;
          text-align: center;
        }
        
        .message {
          font-size: 16px;
          line-height: 1.8;
          margin-bottom: 30px;
          color: ${colors.textDark};
          text-align: center;
        }
        
        .details-section {
          background-color: ${colors.creamLight};
          border-radius: 10px;
          padding: 30px;
          margin: 30px 0;
          position: relative;
          box-shadow: 0 5px 30px rgba(0,0,0,0.05);
          border-left: 4px solid ${colors.gold};
          overflow: hidden;
        }
        
        .details-section-title {
          font-family: 'Cormorant Garamond', 'Playfair Display', Georgia, serif;
          font-size: 22px;
          color: ${colors.primary};
          font-weight: 600;
          margin: 0 0 20px;
          border-bottom: 1px solid ${colors.goldLight};
          padding-bottom: 10px;
          position: relative;
        }
        
        .details-section-title:after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 60px;
          height: 2px;
          background-color: ${colors.gold};
        }
        
        .details-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .details-table td, .details-table th {
          padding: 12px 4px;
          text-align: left;
          border-bottom: 1px dotted ${colors.accent};
          vertical-align: top;
        }
        
        .details-table th {
          color: ${colors.darkBrown};
          font-weight: 600;
          width: 40%;
        }
        
        .details-table td {
          color: ${colors.textDark};
        }
        
        .price-row td, .price-row th {
          font-weight: 700;
          border-top: 2px solid ${colors.gold};
          border-bottom: 2px solid ${colors.gold};
          padding-top: 15px;
          padding-bottom: 15px;
          background-color: rgba(212, 175, 55, 0.05);
        }
        
        .additional-info {
          margin: 40px 0;
          position: relative;
        }
        
        .additional-info-title {
          font-family: 'Cormorant Garamond', 'Playfair Display', Georgia, serif;
          font-size: 22px;
          color: ${colors.primary};
          font-weight: 600;
          margin: 0 0 20px;
          position: relative;
          padding-bottom: 10px;
        }
        
        .additional-info-title:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 60px;
          height: 2px;
          background-color: ${colors.gold};
        }
        
        .info-list {
          padding-left: 20px;
          margin: 0;
          color: ${colors.textDark};
        }
        
        .info-list li {
          margin-bottom: 12px;
          line-height: 1.8;
          position: relative;
          padding-left: 5px;
        }
        
        .info-list li::marker {
          color: ${colors.goldDark};
        }
        
        .signature-section {
          text-align: center;
          margin: 40px 0;
          padding: 30px;
          background-color: rgba(233, 212, 152, 0.2);
          border-radius: 10px;
          position: relative;
          overflow: hidden;
        }
        
        .signature-section:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, ${colors.goldLight}, ${colors.gold}, ${colors.goldLight});
        }
        
        .signature-text {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-style: italic;
          color: ${colors.primary};
          font-size: 20px;
          margin: 0 0 15px;
          position: relative;
          z-index: 1;
        }
        
        .signature-name {
          font-weight: 600;
          margin: 0;
          color: ${colors.darkBrown};
          position: relative;
          z-index: 1;
        }
        
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.darkBrown} 100%);
          color: ${colors.textLight};
          text-decoration: none;
          padding: 14px 30px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 16px;
          margin-top: 20px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          position: relative;
          overflow: hidden;
          z-index: 1;
          border: 1px solid ${colors.gold};
        }
        
        .cta-button:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldDark} 100%);
          opacity: 0;
          z-index: -1;
          transition: opacity 0.3s ease;
        }
        
        .cta-button:hover:before {
          opacity: 1;
        }
        
        .footer {
          background: linear-gradient(135deg, ${colors.darkBrown} 0%, ${colors.primary} 100%);
          padding: 40px 20px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .footer-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0.04;
          background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.9' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E");
        }
        
        .footer-content {
          position: relative;
          z-index: 1;
        }
        
        .footer-logo {
          font-family: 'Cormorant Garamond', 'Playfair Display', Georgia, serif;
          color: ${colors.textLight};
          font-size: 24px;
          margin: 0 0 15px;
          letter-spacing: 1px;
        }
        
        .footer-info {
          color: ${colors.textLight};
          opacity: 0.9;
          font-size: 14px;
          margin: 5px 0;
        }
        
        .footer-social {
          margin-top: 20px;
        }
        
        .social-icon {
          display: inline-block;
          margin: 0 5px;
          width: 32px;
          height: 32px;
          background-color: ${colors.textLight};
          opacity: 0.8;
          border-radius: 50%;
          text-align: center;
          line-height: 32px;
          transition: opacity 0.3s ease;
        }
        
        .social-icon:hover {
          opacity: 1;
        }
        
        .corner-decoration-bottom-left {
          position: absolute;
          bottom: 0;
          left: 0;
          transform: rotate(270deg);
          opacity: 0.4;
        }
        
        .corner-decoration-bottom-right {
          position: absolute;
          bottom: 0;
          right: 0;
          transform: rotate(180deg);
          opacity: 0.4;
        }
        
        @media only screen and (max-width: 600px) {
          .content {
            padding: 40px 20px 30px;
          }
          
          .header-title {
            font-size: 28px;
          }
          
          .header-subtitle {
            font-size: 16px;
          }
          
          .confirmation-badge {
            font-size: 16px;
            padding: 12px 30px;
          }
          
          .greeting {
            font-size: 24px;
          }
          
          .details-section {
            padding: 20px;
          }
          
          .signature-text {
            font-size: 18px;
          }
          
          .main-wrapper {
            margin: 0;
          }
          
          .ornamental-corner, .ornamental-corner-reverse {
            width: 80px;
            height: 80px;
          }
        }
      </style>
    </head>
    <body>
      <div class="main-wrapper">
        <div class="main-container">
          <div class="inner-border"></div>
          ${ornamentalCorner}
          ${ornamentalCornerReverse}
          
          <div class="header">
            <div class="header-bg"></div>
            <h1 class="header-title">Hacienda San Carlos Borromeo</h1>
            <p class="header-subtitle">Elegancia y tradición para su evento especial</p>
          </div>
          
          <div style="text-align: center;">
            <div class="confirmation-badge">
              Confirmación #${numeroConfirmacion} ${getIconoEvento(tipoEvento)}
            </div>
          </div>
          
          <div class="content">
            ${eventSeal}
            
            <p class="greeting">Estimado/a ${nombreCliente},</p>
            
            <p class="message">
              Nos complace confirmar la reserva de su ${tipoEvento.toLowerCase()} en Hacienda San Carlos Borromeo. 
              Hemos recibido su reserva y a continuación encontrará los detalles:
            </p>
            
            ${decorativeDivider}
            
            <div class="details-section">
              <h3 class="details-section-title">Detalles del Evento</h3>
              
              <table class="details-table">
                <tr>
                  <th>Tipo de Evento:</th>
                  <td>${tipoEvento}</td>
                </tr>
                <tr>
                  <th>Fecha:</th>
                  <td>${formatearFecha(fechaEvento)}</td>
                </tr>
                <tr>
                  <th>Horario:</th>
                  <td>${horaInicio || '00:00'} - ${horaFin || '00:00'}</td>
                </tr>
                <tr>
                  <th>Número de Invitados:</th>
                  <td>${numInvitados || 0}</td>
                </tr>
                <tr>
                  <th>Método de Pago:</th>
                  <td>${metodoPago}</td>
                </tr>
                <tr class="price-row">
                  <th>Precio Total:</th>
                  <td>${formatearPrecio(precioTotal)}</td>
                </tr>
                <tr>
                  <th>Pago Inicial (${porcentajePago}%):</th>
                  <td>${formatearPrecio(pagoInicial)}</td>
                </tr>
                <tr>
                  <th>Pago Restante:</th>
                  <td>${formatearPrecio(pagoRestante)}</td>
                </tr>
              </table>
            </div>
            
            ${detallesEvento ? generarDetallesHTML(detallesEvento) : ''}
            
            ${habitacionesReservadas && habitacionesReservadas.length > 0 ? generarHabitacionesHTML(habitacionesReservadas) : ''}
            
            <div class="additional-info">
              <h3 class="additional-info-title">Información importante</h3>
              <ul class="info-list">
                <li>Nuestro equipo de coordinación se pondrá en contacto con usted para discutir los detalles específicos de su evento.</li>
                <li>El pago restante debe realizarse al menos 30 días antes del evento.</li>
                <li>Si necesita realizar algún cambio en su reserva, póngase en contacto con nuestro departamento de eventos lo antes posible.</li>
                <li>Puede cancelar su reserva hasta 60 días antes del evento con una penalización del 50% del anticipo. Después de este plazo, no se realizarán reembolsos.</li>
              </ul>
            </div>
            
            ${decorativeDivider}
            
            <div class="signature-section">
              <p class="signature-text">¡Esperamos hacer de su evento un día inolvidable!</p>
              <p class="signature-name">Equipo de Eventos - Hacienda San Carlos Borromeo</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="mailto:eventos@hacienda-bodas.com" class="cta-button">
                Contactar con Eventos
              </a>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-bg"></div>
            <div class="corner-decoration-bottom-left">
              ${ornamentalCorner}
            </div>
            <div class="corner-decoration-bottom-right">
              ${ornamentalCorner}
            </div>
            <div class="footer-content">
              <p class="footer-logo">Hacienda San Carlos Borromeo</p>
              <p class="footer-info">Email: eventos@haciendasancarlos.com</p>
              <p class="footer-info">Teléfono: 735 1556114 / 5529199212</p>
              <p class="footer-info">Hacienda San Carlos - Todos los derechos reservados &copy; ${new Date().getFullYear()}</p>
              <p class="footer-text">Síguenos en nuestras redes:</p>
              <p class="social-links">
                <a href="https://www.facebook.com/HaciendaSanCarlos" class="social-link">Facebook</a> |
                <a href="https://www.instagram.com/hdasancarlos/" class="social-link">Instagram</a> |
                <a href="#" class="social-link">Twitter</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}; 