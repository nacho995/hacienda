const emailConfirmacionReserva = (tipoReserva, datos) => {
  
  const obtenerDetallesReserva = () => {
    switch(tipoReserva) {
      case 'habitacion':
        return `
          <div class="details">
            <h3>Detalles de su Reserva de Habitación</h3>
            <p><strong>Número de Confirmación:</strong> ${datos.numeroConfirmacion}</p>
            <p><strong>Tipo de Habitación:</strong> ${datos.tipoHabitacion}</p>
            <p><strong>Número de Habitaciones:</strong> ${datos.numeroHabitaciones}</p>
            <p><strong>Fecha de Entrada:</strong> ${new Date(datos.fechaEntrada).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Fecha de Salida:</strong> ${new Date(datos.fechaSalida).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Adultos:</strong> ${datos.numeroAdultos}</p>
            <p><strong>Niños:</strong> ${datos.numeroNinos}</p>
            <p><strong>Precio Total:</strong> €${datos.precioTotal}</p>
            <p><strong>Estado:</strong> ${datos.estado === 'confirmada' ? 'Confirmada' : 'Pendiente de confirmación'}</p>
          </div>
        `;
      
      case 'evento':
        return `
          <div class="details">
            <h3>Detalles de su Reserva de Evento</h3>
            <p><strong>Número de Confirmación:</strong> ${datos.numeroConfirmacion}</p>
            <p><strong>Nombre del Evento:</strong> ${datos.nombreEvento}</p>
            <p><strong>Tipo de Evento:</strong> ${datos.tipoEvento}</p>
            <p><strong>Fecha:</strong> ${new Date(datos.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Horario:</strong> De ${datos.horaInicio} a ${datos.horaFin}</p>
            <p><strong>Espacio:</strong> ${datos.espacioSeleccionado}</p>
            <p><strong>Número de Invitados:</strong> ${datos.numeroInvitados}</p>
            <p><strong>Presupuesto Estimado:</strong> €${datos.presupuestoEstimado}</p>
            <p><strong>Estado:</strong> ${datos.estadoReserva === 'confirmada' ? 'Confirmada' : 'Pendiente de confirmación'}</p>
          </div>
        `;
      
      case 'masaje':
        return `
          <div class="details">
            <h3>Detalles de su Reserva de Masaje</h3>
            <p><strong>Número de Confirmación:</strong> ${datos.numeroConfirmacion}</p>
            <p><strong>Tipo de Masaje:</strong> ${datos.tipoMasaje}</p>
            <p><strong>Duración:</strong> ${datos.duracion} minutos</p>
            <p><strong>Fecha:</strong> ${new Date(datos.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Hora:</strong> ${datos.hora}</p>
            <p><strong>Número de Personas:</strong> ${datos.numeroPersonas}</p>
            <p><strong>Precio Total:</strong> €${datos.precioTotal}</p>
            <p><strong>Estado:</strong> ${datos.estado === 'confirmada' ? 'Confirmada' : 'Pendiente de confirmación'}</p>
          </div>
        `;
      
      default:
        return '<p>Detalles de su reserva no disponibles.</p>';
    }
  };
  
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Reserva - Hacienda San Carlos Borromeo</title>
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
      .contact {
        text-align: center;
        margin-top: 30px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="https://haciendabodas.com/logo.png" alt="Hacienda San Carlos Borromeo">
      </div>
      
      <div class="content">
        <h1>¡Su Reserva ha sido Recibida!</h1>
        
        <p>Estimado/a <strong>${datos.nombre} ${datos.apellidos || datos.apellidosContacto || ''}</strong>,</p>
        
        <p>Gracias por elegir <strong>Hacienda San Carlos Borromeo</strong> para su ${
          tipoReserva === 'habitacion' ? 'estancia' : 
          tipoReserva === 'evento' ? 'evento' : 
          'servicio de masaje'
        }. Nos complace confirmar que hemos recibido su reserva correctamente.</p>
        
        <div class="quote">
          "Cada piedra de esta hacienda cuenta una historia, cada rincón guarda un recuerdo, y ahora, usted será parte de este legado centenario de elegancia y tradición."
        </div>
        
        ${obtenerDetallesReserva()}
        
        <p>
          ${
            datos.estado === 'confirmada' || datos.estadoReserva === 'confirmada' 
              ? 'Su reserva ha sido confirmada. ¡Le esperamos con gran ilusión!' 
              : 'Estamos procesando su reserva y le enviaremos una confirmación definitiva en breve.'
          }
        </p>
        
        <div class="divider"></div>
        
        <div class="contact">
          <p>Si tiene alguna pregunta o necesita hacer cambios en su reserva, no dude en contactarnos:</p>
          <p><strong>Email:</strong> hdasancarlos@gmail.com</p>
          <p><strong>Teléfono:</strong> +52 (123) 456-7890</p>
        </div>
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

module.exports = emailConfirmacionReserva; 