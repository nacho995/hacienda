/**
 * Plantilla de email para notificaciones de gestión administrativa
 * Diseño premium y elegante
 */

const notificacionGestionAdmin = ({ tipo, asunto, mensaje, enlaceAccion, textoEnlace }) => {
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
    
    // Colores de estado
    info: '#3498db',           // Azul para información
    success: '#2ecc71',        // Verde para éxito
    warning: '#f39c12',        // Naranja para advertencia
    error: '#e74c3c'           // Rojo para error
  };

  // Obtener color según tipo de notificación
  const getTypeColor = () => {
    switch(tipo?.toLowerCase()) {
      case 'info': return colors.info;
      case 'success': return colors.success;
      case 'warning': return colors.warning;
      case 'error': return colors.error;
      default: return colors.gold;
    }
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

  // Icono de notificación según tipo
  const getNotificationIcon = () => {
    const color = getTypeColor();
    
    const typeIcons = {
      info: `
        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 8L12 12"></path>
          <path d="M12 16L12.01 16"></path>
        </svg>
      `,
      success: `
        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      `,
      warning: `
        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <path d="M12 9L12 13"></path>
          <path d="M12 17L12.01 17"></path>
        </svg>
      `,
      error: `
        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      `,
      default: `
        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="${colors.gold}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6L6 18"></path>
          <path d="M6 6L18 18"></path>
        </svg>
      `
    };

    return typeIcons[tipo?.toLowerCase()] || typeIcons.default;
  };

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
      <title>${asunto || 'Notificación Administrativa'} - Hacienda San Carlos Borromeo</title>
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
        
        .notification-badge {
          position: relative;
          background: linear-gradient(135deg, ${getTypeColor()} 0%, ${colors.gold} 100%);
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
        
        .notification-icon {
          margin: 0 auto 30px;
          text-align: center;
        }
        
        .notification-subject {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 26px;
          color: ${colors.darkBrown};
          margin-bottom: 30px;
          text-align: center;
          font-weight: 700;
        }
        
        .notification-message {
          margin-bottom: 20px;
          line-height: 1.8;
          color: ${colors.textDark};
          background-color: ${colors.creamLight};
          border-left: 3px solid ${getTypeColor()};
          padding: 20px 25px;
        }
        
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, ${getTypeColor()} 0%, ${colors.goldDark} 100%);
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
          
          .notification-badge {
            padding: 12px 30px;
            font-size: 16px;
          }
          
          .notification-subject {
            font-size: 24px;
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
            <p class="header-subtitle">Centro de Administración</p>
          </header>
          
          <div style="text-align: center;">
            <div class="notification-badge">${tipo || 'Notificación'}</div>
          </div>
          
          <div class="content">
            <div class="notification-icon">
              ${getNotificationIcon()}
            </div>
            
            <div class="notification-subject">${asunto || 'Notificación Administrativa'}</div>
            
            <div class="notification-message">
              ${mensaje || 'No hay información adicional para esta notificación.'}
            </div>
            
            ${decorativeDivider}
            
            ${enlaceAccion ? `
            <div style="text-align: center;">
              <a href="${enlaceAccion}" target="_blank" class="cta-button">${textoEnlace || 'Ver Detalles'}</a>
            </div>
            ` : ''}
            
            <div class="additional-info">
              <p><strong>Información importante:</strong></p>
              <p>• Esta es una notificación automática del sistema de administración.</p>
              <p>• Por favor, no responda directamente a este correo electrónico.</p>
              <p>• Si requiere asistencia, contacte con el administrador del sistema.</p>
            </div>
            
            ${decorativeDivider}
            
            <div class="signature-section">
              <p>Atentamente,</p>
              <p class="signature-name">Sistema de Administración</p>
              <p>Hacienda San Carlos Borromeo</p>
            </div>
          </div>
          
          <footer class="footer">
            <div class="footer-border"></div>
            <div class="footer-logo">Hacienda San Carlos Borromeo</div>
            <div class="footer-address">Carretera de Andalucía, Km 25.5, 28300 Aranjuez, Madrid</div>
            <div class="footer-contact">
              Tel: <a href="tel:+34918754321">+34 91 875 43 21</a> | Email: <a href="mailto:admin@hacienda-bodas.com">admin@hacienda-bodas.com</a>
            </div>
            <div class="social-links">
              <a href="https://facebook.com/haciendabodas" class="social-link">Facebook</a> |
              <a href="https://instagram.com/haciendabodas" class="social-link">Instagram</a> |
              <a href="https://twitter.com/haciendabodas" class="social-link">Twitter</a>
            </div>
            <div class="fine-print">
              Este email contiene información confidencial y está destinado únicamente para uso administrativo interno.
            </div>
          </footer>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = notificacionGestionAdmin;
