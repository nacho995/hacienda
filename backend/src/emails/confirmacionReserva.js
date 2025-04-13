const confirmacionReserva = ({ nombreCliente, tipoEvento, fechaEvento, numeroConfirmacion, urlConfirmacion }) => {
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
    textLight: '#FFFFFF'       // Texto claro
  };

  // Ornamentos decorativos
  const ornamentalCorner = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" style="position: absolute; top: 0; left: 0; opacity: 0.8;">
      <path d="M0,0 L100,0 L100,20 C70,20 30,30 20,100 L0,100 Z" fill="${colors.goldLight}" opacity="0.3"/>
      <path d="M0,0 L50,0 C50,30 30,50 0,50 Z" fill="${colors.gold}" opacity="0.4"/>
      <path fill="none" stroke="${colors.goldDark}" stroke-width="1" d="M0,15 Q20,20 25,0 M0,30 Q30,35 35,0 M0,45 Q40,50 45,0"/>
    </svg>
  `;

  const ornamentalCornerReverse = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" style="position: absolute; top: 0; right: 0; transform: scaleX(-1); opacity: 0.8;">
      <path d="M0,0 L100,0 L100,20 C70,20 30,30 20,100 L0,100 Z" fill="${colors.goldLight}" opacity="0.3"/>
      <path d="M0,0 L50,0 C50,30 30,50 0,50 Z" fill="${colors.gold}" opacity="0.4"/>
      <path fill="none" stroke="${colors.goldDark}" stroke-width="1" d="M0,15 Q20,20 25,0 M0,30 Q30,35 35,0 M0,45 Q40,50 45,0"/>
    </svg>
  `;

  const ornamentalBottom = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" style="position: absolute; bottom: 0; left: 0; transform: rotate(180deg); opacity: 0.8;">
      <path d="M0,0 L100,0 L100,20 C70,20 30,30 20,100 L0,100 Z" fill="${colors.goldLight}" opacity="0.3"/>
      <path d="M0,0 L50,0 C50,30 30,50 0,50 Z" fill="${colors.gold}" opacity="0.4"/>
      <path fill="none" stroke="${colors.goldDark}" stroke-width="1" d="M0,15 Q20,20 25,0 M0,30 Q30,35 35,0 M0,45 Q40,50 45,0"/>
    </svg>
  `;

  const ornamentalBottomReverse = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" style="position: absolute; bottom: 0; right: 0; transform: rotate(180deg) scaleX(-1); opacity: 0.8;">
      <path d="M0,0 L100,0 L100,20 C70,20 30,30 20,100 L0,100 Z" fill="${colors.goldLight}" opacity="0.3"/>
      <path d="M0,0 L50,0 C50,30 30,50 0,50 Z" fill="${colors.gold}" opacity="0.4"/>
      <path fill="none" stroke="${colors.goldDark}" stroke-width="1" d="M0,15 Q20,20 25,0 M0,30 Q30,35 35,0 M0,45 Q40,50 45,0"/>
    </svg>
  `;

  // Sello de confirmación
  const confirmationSeal = `
    <div style="position: absolute; top: 20px; right: 20px; transform: rotate(12deg);">
      <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="${colors.gold}" stroke-width="2"/>
        <circle cx="50" cy="50" r="40" fill="none" stroke="${colors.gold}" stroke-width="1"/>
        
        <!-- Sello de confirmación -->
        <path d="M36,50 L45,60 L65,40" fill="none" stroke="${colors.gold}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        
        <text x="50" y="75" font-family="'Playfair Display', serif" font-size="8" text-anchor="middle" fill="${colors.gold}">CONFIRMADO</text>
      </svg>
          </div>
        `;

  // Divider decorativo
  const decorativeDivider = `
    <div style="text-align: center; margin: 30px 0;">
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="20" viewBox="0 0 200 20">
        <line x1="0" y1="10" x2="80" y2="10" stroke="${colors.gold}" stroke-width="1"/>
        <line x1="120" y1="10" x2="200" y2="10" stroke="${colors.gold}" stroke-width="1"/>
        <circle cx="100" cy="10" r="8" fill="none" stroke="${colors.gold}" stroke-width="1"/>
        <circle cx="100" cy="10" r="4" fill="${colors.gold}"/>
        <circle cx="80" cy="10" r="3" fill="${colors.gold}" opacity="0.6"/>
        <circle cx="120" cy="10" r="3" fill="${colors.gold}" opacity="0.6"/>
      </svg>
          </div>
        `;
  
  return `
  <!DOCTYPE html>
    <html>
  <head>
      <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Reserva - Hacienda San Carlos Borromeo</title>
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
          max-width: 700px;
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
        
        .reservation-badge {
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
          border-radius: 2px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        
      .content {
          padding: 60px 40px 40px;
          position: relative;
      }
        
        .greeting {
          font-family: 'Cormorant Garamond', Georgia, serif;
        font-size: 24px;
          color: ${colors.darkBrown};
          margin-bottom: 30px;
        }
        
        .greeting strong {
          color: ${colors.darkBrown};
          font-weight: 700;
        }
        
        .intro-text {
          margin-bottom: 20px;
          line-height: 1.8;
          color: ${colors.textDark};
        }
        
        .confirmation-number {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 28px;
          font-weight: 700;
          color: ${colors.darkBrown};
          margin: 25px 0;
          padding: 20px;
          text-align: center;
          background-color: rgba(212, 175, 55, 0.1);
          border: 1px dashed ${colors.gold};
          display: block;
          letter-spacing: 1px;
        }
        
        .details-container {
          background-color: ${colors.creamLight};
          border: 1px solid ${colors.goldLight};
          padding: 25px;
          margin: 30px 0;
          border-radius: 4px;
        }
        
        .details-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 22px;
          color: ${colors.darkBrown};
          margin-top: 0;
        margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid ${colors.goldLight};
          font-weight: 700;
        }
        
        .details-item {
          margin-bottom: 12px;
          padding-bottom: 10px;
          border-bottom: 1px dashed ${colors.goldLight};
          display: flex;
          flex-wrap: wrap;
        }
        
        .details-item:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }
        
        .details-label {
          font-weight: 700;
          color: ${colors.darkBrown};
          width: 45%;
          padding-right: 5%;
        }
        
        .details-value {
          color: ${colors.textDark};
          width: 50%;
        }
        
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldDark} 100%);
          color: white;
          text-decoration: none;
          padding: 15px 40px;
          margin: 30px 0;
          border-radius: 2px;
          font-family: 'Lato', Arial, sans-serif;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        text-align: center;
          transition: all 0.3s;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        }
        
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(0,0,0,0.15);
        }
        
        .additional-info {
          background-color: ${colors.creamLight};
          padding: 25px;
          margin: 30px 0;
          border-left: 3px solid ${colors.gold};
          line-height: 1.8;
        }
        
        .additional-info p {
          margin: 10px 0;
        }
        
        .signature-section {
          margin-top: 40px;
          font-style: italic;
          text-align: center;
          color: ${colors.darkBrown};
          font-family: 'Cormorant Garamond', 'Playfair Display', Georgia, serif;
        font-size: 18px;
        }
        
        .signature-name {
          font-weight: 700;
          margin-top: 5px;
          font-style: normal;
          font-size: 20px;
        }
        
        .footer {
          background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.darkBrown} 100%);
          color: ${colors.textLight};
          padding: 30px 40px;
          text-align: center;
          position: relative;
        }
        
        .footer-border {
          position: absolute;
          top: 5px;
          left: 5px;
          right: 5px;
          bottom: 5px;
          border: 1px solid rgba(255,255,255,0.2);
          pointer-events: none;
        }
        
        .footer-logo {
        margin-bottom: 15px;
          font-family: 'Cormorant Garamond', 'Playfair Display', Georgia, serif;
          font-size: 20px;
          letter-spacing: 3px;
          font-weight: 700;
          text-transform: uppercase;
          color: ${colors.textLight};
        }
        
        .footer-address {
          font-size: 14px;
          opacity: 0.9;
        margin-bottom: 15px;
        }
        
        .footer-contact {
          font-size: 14px;
          margin-bottom: 20px;
        }
        
        .footer-contact a {
          color: ${colors.gold};
          text-decoration: none;
        }
        
        .social-links {
          margin-top: 15px;
        }
        
        .social-link {
        display: inline-block;
          margin: 0 10px;
          color: ${colors.textLight};
        text-decoration: none;
          opacity: 0.8;
          transition: opacity 0.3s;
        }
        
        .social-link:hover {
          opacity: 1;
        }
        
        .fine-print {
        font-size: 12px;
          opacity: 0.7;
          margin-top: 25px;
        }
        
        @media only screen and (max-width: 600px) {
          .content {
            padding: 50px 20px 30px;
          }
          
          .header-title {
            font-size: 30px;
          }
          
          .header-subtitle {
            font-size: 16px;
          }
          
          .reservation-badge {
            padding: 12px 30px;
            font-size: 16px;
          }
          
          .greeting {
            font-size: 22px;
          }
          
          .confirmation-number {
            font-size: 24px;
        padding: 15px;
          }
          
          .details-label, .details-value {
            width: 100%;
            padding-right: 0;
          }
          
          .details-label {
            margin-bottom: 5px;
          }
          
          .footer {
            padding: 25px 20px;
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
          ${ornamentalBottom}
          ${ornamentalBottomReverse}
          
          <header class="header">
            <div class="header-bg"></div>
            <h1 class="header-title">Hacienda San Carlos Borromeo</h1>
            <p class="header-subtitle">Elegancia y tradición para momentos únicos</p>
          </header>
          
          ${confirmationSeal}
          
          <div style="text-align: center;">
            <div class="reservation-badge">Confirmación de Reserva</div>
      </div>
      
      <div class="content">
            <p class="greeting">Estimado/a <strong>${nombreCliente || 'Cliente'}</strong>,</p>
            
            <p class="intro-text">Es un placer confirmar la recepción de su solicitud de reserva en <strong>Hacienda San Carlos Borromeo</strong>. Le agradecemos haber elegido nuestras instalaciones para su evento especial.</p>
            
            <p class="intro-text">Hemos registrado su interés para un <strong>${tipoEvento || 'Evento Especial'}</strong> en la fecha <strong>${fechaEvento || 'indicada'}</strong>. A continuación, encontrará los detalles de su reserva:</p>
            
            <div class="confirmation-number">
              Número de Confirmación: <strong>${numeroConfirmacion || 'Pendiente'}</strong>
              <div style="font-size: 14px; margin-top: 10px; font-weight: normal;">Por favor, guarde este número para futuras referencias.</div>
            </div>
            
            ${decorativeDivider}
            
            <div class="details-container">
              <h3 class="details-title">Resumen de su Solicitud:</h3>
              
              <div class="details-item">
                <div class="details-label">Tipo de Evento:</div>
                <div class="details-value">${tipoEvento || 'No especificado'}</div>
              </div>
              
              <div class="details-item">
                <div class="details-label">Fecha Solicitada:</div>
                <div class="details-value">${fechaEvento || 'No especificada'}</div>
              </div>
              
              <div class="details-item">
                <div class="details-label">Número de Confirmación:</div>
                <div class="details-value">${numeroConfirmacion || 'Pendiente'}</div>
              </div>
              
              <div class="details-item">
                <div class="details-label">Estado Actual:</div>
                <div class="details-value">Pendiente de Revisión</div>
              </div>
        </div>
        
            <div class="additional-info">
              <p><strong>Información importante:</strong></p>
              <p>• Uno de nuestros coordinadores de eventos se pondrá en contacto con usted en las próximas 48 horas para confirmar los detalles y responder cualquier pregunta que tenga.</p>
              <p>• Para cualquier consulta inmediata, no dude en contactarnos a través de nuestros canales oficiales mencionados al pie de este correo.</p>
              <p>• Este correo es generado automáticamente, por favor no responda a este mensaje.</p>
            </div>
            
            ${urlConfirmacion ? `
            <div style="text-align: center;">
              <a href="${urlConfirmacion}" target="_blank" class="cta-button">Ver Detalles en Línea</a>
            </div>
            ` : ''}
            
            ${decorativeDivider}
            
            <div class="signature-section">
              <p>Esperamos tener el honor de servirle pronto,</p>
              <p class="signature-name">Equipo de Hacienda San Carlos Borromeo</p>
        </div>
      </div>
      
          <footer class="footer">
            <div class="footer-border"></div>
            <div class="footer-logo">Hacienda San Carlos Borromeo</div>
            <div class="footer-address">Carretera de Andalucía, Km 25.5, 28300 Aranjuez, Madrid</div>
            <div class="footer-contact">
              Tel: <a href="tel:+34918754321">+34 91 875 43 21</a> | Email: <a href="mailto:info@hacienda-bodas.com">info@hacienda-bodas.com</a>
            </div>
            <div class="social-links">
              <a href="https://facebook.com/haciendabodas" class="social-link">Facebook</a> |
              <a href="https://instagram.com/haciendabodas" class="social-link">Instagram</a> |
              <a href="https://twitter.com/haciendabodas" class="social-link">Twitter</a>
            </div>
            <div class="fine-print">
              Este email contiene información confidencial. Si ha recibido este mensaje por error, por favor elimínelo y notifique al remitente.
            </div>
          </footer>
      </div>
    </div>
  </body>
  </html>
  `;
};

module.exports = confirmacionReserva; 