const emailConfirmacionAdmin = (datos) => {
  // Verificación de seguridad para evitar errores con propiedades undefined
  const datosSeguro = datos || {};
  
  // Extraer datos con valores predeterminados
  const tipo = datosSeguro.tipo || 'reserva';
  const cliente = datosSeguro.cliente || 'Cliente';
  const email = datosSeguro.email || 'No especificado';
  const telefono = datosSeguro.telefono || 'No especificado';
  const fecha = datosSeguro.fecha ? new Date(datosSeguro.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'No especificada';
  const hora = datosSeguro.hora || 'No especificada';
  const detalles = datosSeguro.detalles || 'No hay detalles adicionales';
  const comentarios = datosSeguro.comentarios || 'No hay comentarios';
  
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nueva Reserva - Admin Notification</title>
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
      }
      h1 {
        color: #800020;
        font-size: 24px;
        margin-bottom: 20px;
        font-weight: normal;
        text-align: center;
      }
      h3 {
        color: #800020;
        font-size: 18px;
        margin-top: 25px;
        margin-bottom: 15px;
        font-weight: normal;
      }
      p {
        margin-bottom: 15px;
        font-size: 16px;
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
        text-align: center;
      }
      .divider {
        height: 1px;
        background: linear-gradient(to right, transparent, #800020, transparent);
        margin: 20px 0;
      }
      .details {
        background-color: #f9f5f0;
        padding: 20px;
        border-radius: 6px;
        margin: 25px 0;
      }
      .details p {
        margin: 10px 0;
      }
      .alert {
        background-color: #ff6b6b20;
        border-left: 4px solid #ff6b6b;
        padding: 15px;
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
        <h1>Nueva Reserva de ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}</h1>
        
        <div class="alert">
          <p>Se ha recibido una nueva solicitud de reserva que requiere atención.</p>
        </div>
        
        <div class="details">
          <h3>Detalles de la Reserva</h3>
          <p><strong>Cliente:</strong> ${cliente}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Teléfono:</strong> ${telefono}</p>
          <p><strong>Fecha:</strong> ${fecha}</p>
          <p><strong>Hora:</strong> ${hora}</p>
          <p><strong>Detalles:</strong> ${detalles}</p>
          <p><strong>Comentarios adicionales:</strong> ${comentarios}</p>
        </div>
        
        <p>Por favor revise esta reserva en el panel de administración y contacte al cliente lo antes posible para confirmar los detalles.</p>
        
        <div class="divider"></div>
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