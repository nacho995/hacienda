const emailConfirmacionAdmin = (nombre, url) => {
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Cuenta Admin</title>
    <style>
      body {
        font-family: 'Didot', 'Times New Roman', serif;
        line-height: 1.6;
        color: #333;
        margin: 0;
        padding: 0;
        background-color: #f9f5f0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      .header {
        text-align: center;
        padding: 20px 0;
        border-bottom: 2px solid #800020;
      }
      .header img {
        max-width: 150px;
        height: auto;
      }
      .content {
        padding: 30px 20px;
        text-align: center;
      }
      h1 {
        color: #800020;
        font-size: 24px;
        margin-bottom: 20px;
        font-weight: normal;
      }
      p {
        margin-bottom: 15px;
        font-size: 16px;
      }
      .btn {
        display: inline-block;
        padding: 12px 24px;
        background-color: #800020;
        color: #fff;
        text-decoration: none;
        border-radius: 4px;
        font-size: 16px;
        margin: 20px 0;
        transition: background-color 0.3s;
      }
      .btn:hover {
        background-color: #600018;
      }
      .footer {
        text-align: center;
        padding: 20px;
        font-size: 12px;
        color: #666;
        border-top: 1px solid #eee;
      }
      .address {
        margin-top: 15px;
        font-style: italic;
      }
      .quote {
        font-style: italic;
        padding: 15px;
        background-color: #f9f5f0;
        border-left: 3px solid #800020;
        margin: 20px 0;
      }
      .divider {
        height: 1px;
        background: linear-gradient(to right, transparent, #800020, transparent);
        margin: 20px 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="https://haciendabodas.com/logo.png" alt="Hacienda San Carlos Borromeo">
      </div>
      
      <div class="content">
        <h1>Bienvenido/a al Equipo Administrativo</h1>
        
        <p>Estimado/a <strong>${nombre}</strong>,</p>
        
        <div class="quote">
          "Cada piedra de esta hacienda cuenta una historia, cada rincón guarda un recuerdo, y ahora, usted forma parte de este legado centenario de elegancia y tradición."
        </div>
        
        <p>Es un placer darle la bienvenida al equipo administrativo de <strong>Hacienda San Carlos Borromeo</strong>. Su cuenta ha sido creada con éxito, pero necesita ser confirmada para comenzar a gestionar nuestros servicios.</p>
        
        <p>Por favor, haga clic en el siguiente botón para activar su cuenta:</p>
        
        <a href="${url}" class="btn">Confirmar Mi Cuenta</a>
        
        <div class="divider"></div>
        
        <p>Si tiene alguna pregunta o necesita asistencia, no dude en contactarnos:</p>
        <p><strong>Email:</strong> hdasancarlos@gmail.com</p>
        <p><strong>Teléfono:</strong> +52 (123) 456-7890</p>
        
        <p>Este enlace expirará en 24 horas por motivos de seguridad.</p>
      </div>
      
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Hacienda San Carlos Borromeo. Todos los derechos reservados.</p>
        <p class="address">Carretera Nacional Km 30, San Carlos, México</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

module.exports = emailConfirmacionAdmin; 