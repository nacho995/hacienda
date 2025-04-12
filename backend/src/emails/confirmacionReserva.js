const emailConfirmacionReserva = (datos) => {
  // Verificación de seguridad para evitar errores con propiedades undefined
  const datosSeguro = datos || {};

  // Determinar el tipo de reserva basado en los campos disponibles
  let tipoReserva = 'desconocido';
  if (datosSeguro.tipoHabitacion) tipoReserva = 'habitacion';
  else if (datosSeguro.tipoEvento) tipoReserva = 'evento';
  else if (datosSeguro.tipoMasaje) tipoReserva = 'masaje';
  
  const formatearPrecio = (precio) => {
    return typeof precio === 'number' ? `€${precio.toFixed(2)}` : precio;
  };

  const obtenerDetallesMasajes = () => {
    if (!datosSeguro.serviciosAdicionales?.masajes?.length) return '';

    const masajes = datosSeguro.serviciosAdicionales.masajes;
    const totalMasajes = masajes.reduce((total, masaje) => total + (masaje.precio || 0), 0);

    return `
      <div class="masajes-section" style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
        <h4 style="color: #2c5282; margin-bottom: 15px;">Servicios de Masaje Incluidos</h4>
        <div style="margin-bottom: 15px;">
          ${masajes.map(masaje => `
            <div style="padding: 10px; background-color: white; margin-bottom: 10px; border-radius: 3px;">
              <div style="display: flex; justify-content: space-between;">
                <div>
                  <p style="font-weight: 600; color: #2d3748;">${masaje.tipo}</p>
                  <p style="color: #718096; font-size: 14px;">Duración: ${masaje.duracion}</p>
                </div>
                <p style="font-weight: 600;">${formatearPrecio(masaje.precio)}</p>
              </div>
            </div>
          `).join('')}
        </div>
        <div style="border-top: 1px solid #e2e8f0; padding-top: 10px;">
          <div style="display: flex; justify-content: space-between;">
            <p style="font-weight: 500;">Total Servicios de Masaje:</p>
            <p style="font-weight: 600; color: #2c5282;">${formatearPrecio(totalMasajes)}</p>
          </div>
        </div>
      </div>
    `;
  };
  
  const obtenerDetallesReserva = () => {
    switch(tipoReserva) {
      case 'habitacion':
        return `
          <div class="details">
            <h3>Detalles de su Reserva de Habitación</h3>
            <p><strong>Número de Confirmación:</strong> ${datosSeguro.numeroConfirmacion || 'Pendiente'}</p>
            <p><strong>Tipo de Habitación:</strong> ${datosSeguro.tipoHabitacion || 'No especificado'}</p>
            <p><strong>Número de Habitaciones:</strong> ${datosSeguro.numeroHabitaciones || '1'}</p>
            <p><strong>Fecha de Entrada:</strong> ${datosSeguro.fechaEntrada ? new Date(datosSeguro.fechaEntrada).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'No especificada'}</p>
            <p><strong>Fecha de Salida:</strong> ${datosSeguro.fechaSalida ? new Date(datosSeguro.fechaSalida).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'No especificada'}</p>
            <p><strong>Adultos:</strong> ${datosSeguro.numeroAdultos || '0'}</p>
            <p><strong>Niños:</strong> ${datosSeguro.numeroNinos || '0'}</p>
            <p><strong>Precio Total:</strong> ${formatearPrecio(datosSeguro.precioTotal)}</p>
            <p><strong>Estado:</strong> ${datosSeguro.estado === 'confirmada' ? 'Confirmada' : 'Pendiente de confirmación'}</p>
          </div>
        `;
      case 'evento':
        return `
          <div class="details">
            <h3>Detalles de su Reserva de Evento</h3>
            <p><strong>Número de Confirmación:</strong> ${datosSeguro.numeroConfirmacion || 'Pendiente'}</p>
            <p><strong>Tipo de Evento:</strong> ${datosSeguro.tipoEvento || 'No especificado'}</p>
            <p><strong>Nombre del Evento:</strong> ${datosSeguro.nombreEvento || 'No especificado'}</p>
            <p><strong>Fecha:</strong> ${datosSeguro.fecha ? new Date(datosSeguro.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'No especificada'}</p>
            <p><strong>Hora de Inicio:</strong> ${datosSeguro.horaInicio || 'No especificada'}</p>
            <p><strong>Hora de Fin:</strong> ${datosSeguro.horaFin || 'No especificada'}</p>
            <p><strong>Número de Invitados:</strong> ${datosSeguro.numeroInvitados || '0'}</p>
            <p><strong>Espacio Seleccionado:</strong> ${datosSeguro.espacioSeleccionado || 'No especificado'}</p>
            <p><strong>Presupuesto Estimado:</strong> ${formatearPrecio(datosSeguro.presupuestoEstimado)}</p>
            <p><strong>Estado:</strong> ${datosSeguro.estado === 'confirmada' ? 'Confirmada' : 'Pendiente de confirmación'}</p>
          </div>
          ${obtenerDetallesMasajes()}
        `;
      case 'masaje':
        return `
          <div class="details">
            <h3>Detalles de su Reserva de Masaje</h3>
            <p><strong>Número de Confirmación:</strong> ${datosSeguro.numeroConfirmacion || 'Pendiente'}</p>
            <p><strong>Tipo de Masaje:</strong> ${datosSeguro.tipoMasaje || 'No especificado'}</p>
            <p><strong>Fecha:</strong> ${datosSeguro.fecha ? new Date(datosSeguro.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'No especificada'}</p>
            <p><strong>Hora:</strong> ${datosSeguro.hora || 'No especificada'}</p>
            <p><strong>Duración:</strong> ${datosSeguro.duracion || '0'} minutos</p>
            <p><strong>Precio:</strong> ${formatearPrecio(datosSeguro.precio)}</p>
            <p><strong>Estado:</strong> ${datosSeguro.estado === 'confirmada' ? 'Confirmada' : 'Pendiente de confirmación'}</p>
          </div>
        `;
      default:
        return `
          <div class="details">
            <h3>Detalles de su Reserva</h3>
            <p><strong>Número de Confirmación:</strong> ${datosSeguro.numeroConfirmacion || 'Pendiente'}</p>
            <p><strong>Estado:</strong> ${datosSeguro.estado === 'confirmada' ? 'Confirmada' : 'Pendiente de confirmación'}</p>
          </div>
        `;
    }
  };
  
  // Obtener nombre y apellidos seguros
  const nombreMostrar = datosSeguro.nombreContacto || datosSeguro.nombre || 'Estimado/a Cliente';
  const apellidosMostrar = datosSeguro.apellidosContacto || datosSeguro.apellidos || '';
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Reserva - Hacienda San Carlos Borromeo</title>
  <style>
    /* Estilos generales (con fallbacks) */
    body { margin: 0; padding: 0; background-color: #FAF3E0; /* Crema claro */ font-family: Georgia, 'Times New Roman', Times, serif; }
    .email-container { max-width: 600px; margin: 20px auto; background-color: #FFFFFF; border: 1px solid #E0D8CC; /* Borde suave */ border-radius: 8px; overflow: hidden; }
    .header { background-color: #4E3629; /* Marrón oscuro */ padding: 20px; text-align: center; }
    .header img { max-width: 180px; height: auto; }
    .content { padding: 30px; color: #4E3629; /* Marrón oscuro */ font-size: 16px; line-height: 1.6; }
    .content h1 { color: #800020; /* Guinda/Vino */ font-family: Didot, Georgia, 'Times New Roman', serif; font-size: 24px; margin-top: 0; margin-bottom: 20px; font-weight: normal; text-align: center; }
    .content p { margin-bottom: 15px; }
    .details { background-color: #FDFBF5; /* Crema muy claro */ padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 3px solid #800020; }
    .details strong { color: #800020; }
    .button-container { text-align: center; margin-top: 30px; margin-bottom: 20px; }
    .button { background-color: #800020; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-family: Arial, Helvetica, sans-serif; font-size: 16px; }
    .footer { background-color: #FAF3E0; padding: 20px; text-align: center; font-size: 12px; color: #918174; /* Marrón grisáceo */ }
    .footer a { color: #800020; text-decoration: none; }
    /* Estilos específicos para tabla (máxima compatibilidad) */
    table { border-collapse: collapse; width: 100%; }
    td { padding: 0; vertical-align: top; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF3E0; font-family: Georgia, 'Times New Roman', Times, serif;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding: 20px 0;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E0D8CC; border-radius: 8px; overflow: hidden;" class="email-container">
          <!-- Header -->
          <tr>
            <td style="background-color: #4E3629; padding: 20px; text-align: center;" class="header">
              <img src="https://haciendabodas.com/logo.png" alt="Hacienda San Carlos Borromeo Logo" style="max-width: 180px; height: auto;">
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 30px; color: #4E3629; font-size: 16px; line-height: 1.6;" class="content">
              <h1 style="color: #800020; font-family: Didot, Georgia, 'Times New Roman', serif; font-size: 24px; margin-top: 0; margin-bottom: 20px; font-weight: normal; text-align: center;">Confirmación de su Reserva</h1>
              <p>Estimado/a ${nombreMostrar} ${apellidosMostrar},</p>
              <p>Le agradecemos por elegir <strong>Hacienda San Carlos Borromeo</strong> para su ${
                tipoReserva === 'habitacion' ? 'estancia' : 
                tipoReserva === 'evento' ? 'evento' : 
                'servicio de masaje'
              }. Nos complace confirmar que hemos recibido su reserva correctamente.</p>
              <div style="background-color: #FDFBF5; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 3px solid #800020;" class="details">
                <p><strong style="color: #800020;">Tipo de Reserva:</strong> ${tipoReserva === 'habitacion' ? 'Habitación' : tipoReserva === 'evento' ? 'Evento' : 'Masaje'}</p>
                <p><strong style="color: #800020;">Fecha:</strong> ${datosSeguro.fecha ? new Date(datosSeguro.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Fecha no especificada'}</p>
                <p><strong style="color: #800020;">Número de Confirmación:</strong> ${datosSeguro.numeroConfirmacion || 'N/A'}</p>
              </div>
              <p>Su reserva se encuentra actualmente en estado 'pendiente'. Nuestro equipo se pondrá en contacto con usted próximamente para finalizar todos los detalles y proceder con la confirmación final.</p>
              <p>Si lo desea, puede ver un resumen de su solicitud haciendo clic en el siguiente botón:</p>
              <div style="text-align: center; margin-top: 30px; margin-bottom: 20px;" class="button-container">
                <a href="${datosSeguro.urlConfirmacion || '#'}" target="_blank" style="background-color: #800020; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-family: Arial, Helvetica, sans-serif; font-size: 16px;" class="button">Ver Detalles de la Reserva</a>
              </div>
              <p>Si tiene alguna pregunta inmediata, no dude en contactarnos.</p>
              <p>Atentamente,</p>
              <p><strong>El Equipo de Hacienda San Carlos Borromeo</strong></p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #FAF3E0; padding: 20px; text-align: center; font-size: 12px; color: #918174;" class="footer">
              <p>&copy; ${new Date().getFullYear()} Hacienda San Carlos Borromeo. Todos los derechos reservados.</p>
              <p>Carretera Nacional Km 30, San Carlos, México</p>
              <p><a href="https://haciendabodas.com" target="_blank" style="color: #800020; text-decoration: none;">Visite nuestro sitio web</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

module.exports = emailConfirmacionReserva; 