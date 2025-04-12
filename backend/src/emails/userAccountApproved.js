const userAccountApprovedTemplate = ({ nombreUsuario, loginUrl }) => {
  // Paleta de colores sofisticada
  const colors = {
    gold: '#D4AF37',           // Dorado elegante
    goldLight: '#E9D498',      // Dorado claro
    primary: '#8D6E63',        // Marrón principal
    darkBrown: '#5D4037',      // Marrón oscuro
    ivory: '#FFFFF0',          // Marfil para fondo
    creamLight: '#FFF8E1',     // Crema claro
    textDark: '#3E2723',       // Texto oscuro
    textLight: '#FFFFFF'       // Texto claro
  };

  // Elementos decorativos SVG
  const ornamentalCorner = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" style="position: absolute; top: 0; left: 0; opacity: 0.8;">
      <path d="M0,0 L100,0 L100,20 C70,20 30,30 20,100 L0,100 Z" fill="${colors.goldLight}" opacity="0.3"/>
      <path d="M0,0 L50,0 C50,30 30,50 0,50 Z" fill="${colors.gold}" opacity="0.4"/>
      <path fill="none" stroke="${colors.gold}" stroke-width="1" d="M0,15 Q20,20 25,0 M0,30 Q30,35 35,0 M0,45 Q40,50 45,0"/>
    </svg>
  `;

  const ornamentalCornerReverse = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" style="position: absolute; top: 0; right: 0; transform: scaleX(-1); opacity: 0.8;">
      <path d="M0,0 L100,0 L100,20 C70,20 30,30 20,100 L0,100 Z" fill="${colors.goldLight}" opacity="0.3"/>
      <path d="M0,0 L50,0 C50,30 30,50 0,50 Z" fill="${colors.gold}" opacity="0.4"/>
      <path fill="none" stroke="${colors.gold}" stroke-width="1" d="M0,15 Q20,20 25,0 M0,30 Q30,35 35,0 M0,45 Q40,50 45,0"/>
    </svg>
  `;

  // Sello premium
  const premiumSeal = `
    <div style="position: absolute; top: 20px; right: 20px; transform: rotate(10deg);">
      <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="${colors.gold}" stroke-width="2"/>
        <circle cx="50" cy="50" r="40" fill="none" stroke="${colors.gold}" stroke-width="1"/>
        <path d="M50,5 L52.5,15 L63,15 L55,25 L60,35 L50,27.5 L40,35 L45,25 L37,15 L47.5,15 Z" 
              fill="${colors.gold}" opacity="0.7"/>
        <text x="50" y="55" font-family="'Playfair Display', serif" font-size="10" text-anchor="middle" fill="${colors.gold}">APROBADO</text>
      </svg>
    </div>
  `;

  // Decorador divisor
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
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cuenta Aprobada - Hacienda San Carlos Borromeo</title>
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
          max-width: 650px;
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
        
        .status-badge {
          position: relative;
          background: linear-gradient(135deg, ${colors.gold} 0%, #B8860B 100%);
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
          margin-bottom: 40px;
          color: ${colors.textDark};
          text-align: center;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .login-button {
          display: inline-block;
          background: linear-gradient(135deg, ${colors.gold} 0%, #B8860B 100%);
          color: ${colors.textLight};
          text-decoration: none;
          padding: 15px 40px;
          border-radius: 50px;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 1px;
          box-shadow: 0 5px 15px rgba(212, 175, 55, 0.4);
          transition: all 0.3s;
          text-transform: uppercase;
        }
        
        .footer {
          background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.darkBrown} 100%);
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
          opacity: 0.1;
          background-image: radial-gradient(circle, ${colors.goldLight} 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        .footer-logo {
          font-family: 'Cormorant Garamond', 'Playfair Display', Georgia, serif;
          color: ${colors.textLight};
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 15px;
          letter-spacing: 2px;
        }
        
        .footer-logo:after {
          content: '';
          display: block;
          width: 50px;
          height: 1px;
          background: ${colors.gold};
          margin: 15px auto;
        }
        
        .footer-text {
          color: ${colors.textLight};
          font-size: 14px;
          line-height: 1.8;
          opacity: 0.9;
        }
        
        .copyright {
          margin-top: 20px;
          font-size: 12px;
          color: ${colors.textLight};
          opacity: 0.7;
        }
        
        @media screen and (max-width: 600px) {
          .main-wrapper {
            width: 100%;
            margin: 0;
          }
          .main-container {
            margin: 0;
            border: none;
          }
          .content {
            padding: 60px 20px 30px;
          }
          .header-title {
            font-size: 28px;
          }
          .status-badge {
            font-size: 16px;
            padding: 12px 30px;
          }
          .greeting {
            font-size: 24px;
          }
        }
      </style>
    </head>
    <body>
      <div class="main-wrapper">
        <div class="main-container">
          <div class="inner-border"></div>
          
          <!-- Ornamentos en las esquinas -->
          ${ornamentalCorner}
          ${ornamentalCornerReverse}
          
          <!-- Sello premium -->
          ${premiumSeal}
          
          <div class="header">
            <div class="header-bg"></div>
            <h1 class="header-title">Hacienda San Carlos Borromeo</h1>
            <p class="header-subtitle">Elegancia y tradición para momentos inolvidables</p>
          </div>
          
          <div style="text-align: center; background-color: transparent;">
            <div class="status-badge">
              ¡Cuenta Aprobada!
            </div>
          </div>
          
          <div class="content">
            <h2 class="greeting">Estimado/a ${nombreUsuario},</h2>
            
            <p class="message">
              Nos complace informarle que su cuenta ha sido <strong>aprobada</strong> satisfactoriamente. 
              Ahora puede acceder a todas las funciones y servicios exclusivos de Hacienda San Carlos Borromeo.
            </p>
            
            ${decorativeDivider}
            
            <p class="message">
              Para comenzar a disfrutar de nuestros servicios, inicie sesión con sus credenciales en nuestra plataforma.
              Le damos la bienvenida a nuestra exclusiva comunidad y esperamos poder atenderle pronto.
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${loginUrl}" class="login-button">
                Iniciar sesión
              </a>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-bg"></div>
            <div class="footer-logo">Hacienda San Carlos Borromeo</div>
            <div class="footer-text">
              Calle Ejemplo, 123 • 28001 Madrid<br>
              Tel: +34 912 345 678 • Email: info@hacienda-bodas.com<br>
              www.hacienda-bodas.com
            </div>
            <div class="copyright">
              &copy; ${new Date().getFullYear()} Hacienda San Carlos Borromeo. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = userAccountApprovedTemplate; 