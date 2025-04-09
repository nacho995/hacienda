/**
 * Plantilla de email para notificar a los administradores cuando un cliente
 * selecciona que los organizadores gestionen los servicios y/o habitaciones
 */
const notificacionGestionAdmin = (datos) => {
  // Verificación de seguridad para evitar errores con propiedades undefined
  const datosSeguro = datos || {};
  
  // Extraer datos con valores predeterminados
  const tipoEvento = datosSeguro.tipoEvento || 'Evento';
  const cliente = `${datosSeguro.nombreContacto || ''} ${datosSeguro.apellidosContacto || ''}`.trim() || 'Cliente';
  const email = datosSeguro.emailContacto || 'No especificado';
  const telefono = datosSeguro.telefonoContacto || 'No especificado';
  const fecha = datosSeguro.fecha ? new Date(datosSeguro.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'No especificada';
  const modoGestionHabitaciones = datosSeguro.modoGestionHabitaciones || 'usuario';
  const modoGestionServicios = datosSeguro.modoGestionServicios || 'usuario';
  const mensaje = datosSeguro.peticionesEspeciales || 'No hay peticiones especiales';
  
  // Determinar si el cliente ha elegido que los organizadores gestionen algo
  const gestionPorOrganizadores = modoGestionHabitaciones === 'organizador' || modoGestionServicios === 'organizador';
  
  // Crear mensajes específicos según las opciones seleccionadas
  let mensajeHabitaciones = '';
  let mensajeServicios = '';
  
  if (modoGestionHabitaciones === 'organizador') {
    mensajeHabitaciones = '<p><strong>El cliente ha solicitado que los organizadores gestionen las habitaciones.</strong></p>';
  } else {
    mensajeHabitaciones = '<p>El cliente ha seleccionado las habitaciones por sí mismo.</p>';
  }
  
  if (modoGestionServicios === 'organizador') {
    mensajeServicios = '<p><strong>El cliente ha solicitado que los organizadores seleccionen los servicios adicionales.</strong></p>';
  } else {
    mensajeServicios = '<p>El cliente ha seleccionado los servicios adicionales por sí mismo.</p>';
  }
  
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notificación de Gestión - Admin</title>
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
      .highlight {
        background-color: #ffd70020;
        border-left: 4px solid #ffd700;
        padding: 15px;
        margin: 20px 0;
      }
      .action-required {
        background-color: #4CAF5020;
        border-left: 4px solid #4CAF50;
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
        <h1>Notificación de Gestión de Reserva</h1>
        
        ${gestionPorOrganizadores ? `
        <div class="action-required">
          <p><strong>¡Atención! Esta reserva requiere acción por parte de los organizadores.</strong></p>
        </div>
        ` : `
        <div class="highlight">
          <p>Nueva reserva recibida. El cliente ha gestionado todos los aspectos por sí mismo.</p>
        </div>
        `}
        
        <div class="details">
          <h3>Detalles de la Reserva</h3>
          <p><strong>Tipo de Evento:</strong> ${tipoEvento}</p>
          <p><strong>Cliente:</strong> ${cliente}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Teléfono:</strong> ${telefono}</p>
          <p><strong>Fecha:</strong> ${fecha}</p>
        </div>
        
        <div class="details">
          <h3>Preferencias de Gestión</h3>
          ${mensajeHabitaciones}
          ${mensajeServicios}
        </div>
        
        <div class="details">
          <h3>Mensaje del Cliente</h3>
          <p>${mensaje}</p>
        </div>
        
        ${gestionPorOrganizadores ? `
        <div class="alert">
          <p><strong>Acción requerida:</strong> Por favor, contacte al cliente lo antes posible para coordinar ${modoGestionHabitaciones === 'organizador' && modoGestionServicios === 'organizador' ? 'la selección de habitaciones y servicios' : modoGestionHabitaciones === 'organizador' ? 'la asignación de habitaciones' : 'la selección de servicios'}.</p>
        </div>
        ` : ''}
        
        <p>Revise esta reserva en el panel de administración para más detalles.</p>
        
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

module.exports = notificacionGestionAdmin;
