/**
 * Plantilla de email para solicitud de aprobación de cuenta admin
 * Diseño premium y elegante
 */

const adminApprovalRequestTemplate = ({ nuevoAdminNombre, nuevoAdminEmail, nuevoAdminTelefono, token }) => {
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

  // Sello administrativo
  const adminSeal = `
    <div style="position: absolute; top: 20px; right: 20px; transform: rotate(12deg);">
      <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="${colors.gold}" stroke-width="2"/>
        <circle cx="50" cy="50" r="40" fill="none" stroke="${colors.gold}" stroke-width="1"/>
        <path d="M50,5 
                L52.5,15 L63,15 L55,25 L60,35 L50,27.5 L40,35 L45,25 L37,15 L47.5,15 Z" 
              fill="${colors.gold}" opacity="0.7"/>
        <path d="M50,95 
                L52.5,85 L63,85 L55,75 L60,65 L50,72.5 L40,65 L45,75 L37,85 L47.5,85 Z" 
              fill="${colors.gold}" opacity="0.7"/>
        <text x="50" y="45" font-family="'Playfair Display', serif" font-size="10" text-anchor="middle" fill="${colors.gold}">ADMIN</text>
        <text x="50" y="60" font-family="'Playfair Display', serif" font-size="8" text-anchor="middle" fill="${colors.gold}">APPROVAL</text>
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

  // Base URL para los enlaces de aprobación
  const baseURL = `${process.env.CLIENT_URL}/admin/approve/${token}`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Solicitud de Aprobación de Cuenta Admin - Hacienda San Carlos Borromeo</title>
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
        
        .approval-badge {
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
        
        .intro-text {
          margin-bottom: 30px;
          line-height: 1.8;
          color: ${colors.textDark};
        }
        
        .details-section {
          margin: 40px 0;
          padding: 30px;
          position: relative;
          background-color: ${colors.creamLight};
          border-radius: 4px;
          border: 1px solid ${colors.goldLight};
        }
        
        .section-title {
          font-family: 'Cormorant Garamond', 'Playfair Display', Georgia, serif;
          font-size: 24px;
          color: ${colors.darkBrown};
          margin-bottom: 20px;
          font-weight: 700;
          text-align: center;
          position: relative;
        }
        
        .section-title:before, .section-title:after {
          content: '';
          display: inline-block;
          width: 30px;
          height: 1px;
          background: ${colors.gold};
          margin: 0 15px;
          vertical-align: middle;
        }
        
        .details-item {
          padding: 10px 0;
          border-bottom: 1px dashed ${colors.goldLight};
        }
        
        .details-item:last-child {
          border-bottom: none;
        }
        
        .details-label {
          font-weight: 600;
          color: ${colors.darkBrown};
          display: inline-block;
          width: 100px;
        }
        
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .cta-button {
          display: inline-block;
          padding: 12px 25px;
          margin: 8px;
          font-family: 'Lato', Arial, sans-serif;
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          border-radius: 4px;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
        }
        .cta-button-admin {
          background: linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldDark} 100%);
          color: ${colors.textLight};
          border: 1px solid ${colors.goldDark};
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .cta-button-admin:hover {
          background: linear-gradient(135deg, ${colors.goldDark} 0%, ${colors.gold} 100%);
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }
        .cta-button-editor {
          background: linear-gradient(135deg, ${colors.secondary} 0%, ${colors.primary} 100%);
          color: ${colors.textLight};
          border: 1px solid ${colors.primary};
        }
        .cta-button-editor:hover {
          background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
        }
        .cta-button-user {
          background-color: #f0f0f0;
          color: ${colors.textDark};
          border: 1px solid #ccc;
        }
        .cta-button-user:hover {
          background-color: #e0e0e0;
        }
        
        .additional-info {
          background-color: ${colors.creamLight};
          padding: 25px;
          margin: 30px 0;
          border-left: 3px solid ${colors.gold};
          line-height: 1.8;
        }
        
        .signature-section {
          margin-top: 50px;
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
          
          .approval-badge {
            padding: 12px 30px;
            font-size: 16px;
          }
          
          .greeting {
            font-size: 22px;
          }
          
          .details-section {
            padding: 20px;
          }
          
          .section-title:before, .section-title:after {
            width: 20px;
            margin: 0 10px;
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
            <p class="header-subtitle">Sistema de Gestión de Administradores</p>
          </header>
          
          ${adminSeal}
          
          <div style="text-align: center;">
            <div class="approval-badge">Solicitud de Aprobación</div>
          </div>
          
          <div class="content">
            <p class="greeting">Estimado Administrador,</p>
            
            <p class="intro-text">Se ha recibido una nueva solicitud para crear una cuenta de administrador en el sistema de Hacienda San Carlos Borromeo. A continuación, encontrará los detalles del solicitante:</p>
            
            ${decorativeDivider}
            
            <div class="details-section">
              <h3 class="section-title">Datos del Solicitante</h3>
              
              <div class="details-item">
                <span class="details-label">Nombre:</span>
                <span>${nuevoAdminNombre || 'No especificado'}</span>
              </div>
              
              <div class="details-item">
                <span class="details-label">Email:</span>
                <span>${nuevoAdminEmail || 'No especificado'}</span>
              </div>
              
              <div class="details-item">
                <span class="details-label">Teléfono:</span>
                <span>${nuevoAdminTelefono || 'No especificado'}</span>
              </div>
            </div>
            
            <p class="intro-text">Por favor, seleccione el rol con el que desea aprobar esta solicitud:</p>
            
            <div class="button-container">
              <a href="${baseURL}?role=admin" class="cta-button cta-button-admin">Aprobar como Administrador</a>
              <a href="${baseURL}?role=editor" class="cta-button cta-button-editor">Aprobar como Editor</a>
              <a href="${baseURL}?role=usuario" class="cta-button cta-button-user">Aprobar como Usuario</a>
            </div>
            
            <div class="additional-info">
              <p><strong>Aviso importante:</strong></p>
              <p>• Aprobar como <strong>Administrador</strong> otorga permisos completos.</p>
              <p>• Aprobar como <strong>Editor</strong> otorga permisos limitados de gestión de contenido.</p>
              <p>• Aprobar como <strong>Usuario</strong> otorga permisos básicos de cliente.</p>
              <p>• Si usted no reconoce esta solicitud o no desea aprobarla, puede ignorar este correo electrónico de forma segura.</p>
              <p>• Si tiene alguna pregunta, contacte al administrador principal del sistema.</p>
            </div>
            
            <p style="text-align:center; margin-top: 30px; font-size: 12px; color: #888;">
              ID de Solicitud (Token): ${token ? token.substring(0, 8) + '...' : 'N/A'}
            </p>
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

module.exports = adminApprovalRequestTemplate; 