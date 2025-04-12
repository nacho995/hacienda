/**
 * Plantilla de email para confirmación de reserva de evento
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
  // Colores y fuentes consistentes con el sitio web
  const colorPrimario = '#795548'; // Marrón/tierra (color principal)
  const colorSecundario = '#4e342e'; // Marrón oscuro (para acentos)
  const colorTexto = '#3c3c3c'; // Texto oscuro pero no negro puro
  const colorTextoClaro = '#f5f5f5'; // Texto claro para fondos oscuros
  const colorFondo = '#f8f4e9'; // Beige claro (fondo de email)
  const colorBorde = '#d7ccc8'; // Beige medio para bordes
  const colorDestacado = '#8d6e63'; // Marrón medio para elementos destacados
  const colorExito = '#558b2f'; // Verde para confirmaciones
  
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
            <th style="text-align: left; padding: 8px; border-bottom: 1px solid ${colorBorde}; color: ${colorSecundario}; font-weight: 600; width: 40%;">${claveFormateada}</th>
            <td style="text-align: left; padding: 8px; border-bottom: 1px solid ${colorBorde}; color: ${colorTexto};">${valor}</td>
          </tr>
        `;
      }
    }
    
    return detallesHTML ? `
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px; background-color: white; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <tbody>
          ${detallesHTML}
        </tbody>
      </table>
    ` : '';
  };
  
  // Generar HTML para habitaciones reservadas
  const generarHabitacionesHTML = (habitaciones) => {
    if (!habitaciones || habitaciones.length === 0) return '';
    
    let habitacionesHTML = '';
    habitaciones.forEach((habitacion, index) => {
      habitacionesHTML += `
        <div style="background-color: white; border-radius: 4px; padding: 15px; margin-bottom: ${index < habitaciones.length - 1 ? '15px' : '0'}; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h4 style="font-family: 'Playfair Display', Georgia, serif; color: ${colorSecundario}; margin: 0 0 10px; font-size: 16px;">Habitación ${index + 1}: ${habitacion.tipoHabitacion || 'Estándar'}</h4>
          <table style="width: 100%; border-collapse: collapse;">
            ${habitacion.fechaEntrada ? `
            <tr>
              <td style="padding: 5px 0; color: ${colorSecundario}; font-weight: 600; width: 40%;">Check-in:</td>
              <td style="padding: 5px 0; color: ${colorTexto};">${formatearFecha(habitacion.fechaEntrada)}</td>
            </tr>` : ''}
            ${habitacion.fechaSalida ? `
            <tr>
              <td style="padding: 5px 0; color: ${colorSecundario}; font-weight: 600;">Check-out:</td>
              <td style="padding: 5px 0; color: ${colorTexto};">${formatearFecha(habitacion.fechaSalida)}</td>
            </tr>` : ''}
            ${habitacion.precio ? `
            <tr>
              <td style="padding: 5px 0; color: ${colorSecundario}; font-weight: 600;">Precio:</td>
              <td style="padding: 5px 0; color: ${colorTexto};">${formatearPrecio(habitacion.precio)}</td>
            </tr>` : ''}
          </table>
        </div>
      `;
    });
    
    return habitacionesHTML ? `
      <div style="margin-top: 25px;">
        <h3 style="font-family: 'Playfair Display', Georgia, serif; color: ${colorSecundario}; margin: 0 0 15px; font-size: 18px; border-bottom: 1px solid ${colorBorde}; padding-bottom: 10px;">Habitaciones Reservadas</h3>
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
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Open+Sans:wght@300;400;600&display=swap');
      </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Open Sans', Arial, sans-serif; background-color: ${colorFondo}; color: ${colorTexto};">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <!-- Encabezado -->
        <div style="background-color: ${colorPrimario}; padding: 30px; text-align: center;">
          <h1 style="font-family: 'Playfair Display', Georgia, serif; color: ${colorTextoClaro}; margin: 0; font-size: 28px;">Hacienda San Carlos Borromeo</h1>
          <p style="color: ${colorTextoClaro}; margin: 15px 0 0; font-size: 18px;">¡Su evento está confirmado! ${getIconoEvento(tipoEvento)}</p>
        </div>
        
        <!-- Banner de confirmación -->
        <div style="background-color: ${colorExito}; padding: 12px; text-align: center;">
          <p style="margin: 0; color: white; font-weight: 600; font-size: 16px;">Confirmación #${numeroConfirmacion}</p>
        </div>
        
        <!-- Saludo -->
        <div style="padding: 30px 25px 10px;">
          <h2 style="font-family: 'Playfair Display', Georgia, serif; color: ${colorPrimario}; margin: 0 0 20px; font-size: 22px;">Estimado/a ${nombreCliente},</h2>
          <p style="margin: 0 0 20px; line-height: 1.6;">Nos complace confirmar la reserva de su ${tipoEvento.toLowerCase()} en Hacienda San Carlos Borromeo. Hemos recibido su reserva y a continuación encontrará los detalles:</p>
        </div>
        
        <!-- Detalles principales del evento -->
        <div style="padding: 0 25px 20px;">
          <div style="background-color: ${colorFondo}; border-radius: 6px; padding: 20px; margin-bottom: 25px; border-left: 4px solid ${colorDestacado};">
            <h3 style="font-family: 'Playfair Display', Georgia, serif; color: ${colorSecundario}; margin: 0 0 15px; font-size: 18px; border-bottom: 1px solid ${colorBorde}; padding-bottom: 10px;">Detalles del Evento</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; width: 40%; color: ${colorSecundario}; font-weight: 600;">Tipo de Evento:</td>
                <td style="padding: 8px 0; color: ${colorTexto};">${tipoEvento}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: ${colorSecundario}; font-weight: 600;">Fecha:</td>
                <td style="padding: 8px 0; color: ${colorTexto};">${formatearFecha(fechaEvento)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: ${colorSecundario}; font-weight: 600;">Horario:</td>
                <td style="padding: 8px 0; color: ${colorTexto};">${horaInicio || '00:00'} - ${horaFin || '00:00'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: ${colorSecundario}; font-weight: 600;">Número de Invitados:</td>
                <td style="padding: 8px 0; color: ${colorTexto};">${numInvitados || 0}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: ${colorSecundario}; font-weight: 600;">Precio Total:</td>
                <td style="padding: 8px 0; color: ${colorTexto}; font-weight: 700;">${formatearPrecio(precioTotal)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: ${colorSecundario}; font-weight: 600;">Pago Inicial (${porcentajePago}%):</td>
                <td style="padding: 8px 0; color: ${colorTexto};">${formatearPrecio(pagoInicial)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: ${colorSecundario}; font-weight: 600;">Pago Restante:</td>
                <td style="padding: 8px 0; color: ${colorTexto};">${formatearPrecio(pagoRestante)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: ${colorSecundario}; font-weight: 600;">Método de Pago:</td>
                <td style="padding: 8px 0; color: ${colorTexto};">${metodoPago}</td>
              </tr>
            </table>
            
            <!-- Detalles adicionales si existen -->
            ${generarDetallesHTML(detallesEvento)}
          </div>
          
          <!-- Habitaciones reservadas si existen -->
          ${generarHabitacionesHTML(habitacionesReservadas)}
          
          <!-- Información adicional -->
          <div style="margin: 30px 0;">
            <h3 style="font-family: 'Playfair Display', Georgia, serif; color: ${colorSecundario}; margin: 0 0 15px; font-size: 18px;">Información importante</h3>
            <ul style="padding-left: 20px; margin: 0; color: ${colorTexto}; line-height: 1.6;">
              <li style="margin-bottom: 10px;">Nuestro equipo de coordinación se pondrá en contacto con usted para discutir los detalles específicos de su evento.</li>
              <li style="margin-bottom: 10px;">El pago restante debe realizarse al menos 30 días antes del evento.</li>
              <li style="margin-bottom: 10px;">Para cualquier solicitud especial o consulta, póngase en contacto con nuestro equipo de eventos.</li>
              <li style="margin-bottom: 10px;">Política de cancelación: Las cancelaciones realizadas con más de 90 días de antelación recibirán un reembolso del 50% del pago inicial. No se realizan reembolsos para cancelaciones con menos de 90 días de antelación.</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: ${colorFondo}; border-radius: 6px;">
            <p style="margin: 0 0 15px; font-style: italic; color: ${colorDestacado}; font-size: 18px;">¡Esperamos hacer de su evento un día inolvidable!</p>
            <p style="margin: 0; font-weight: 600;">Equipo de Eventos - Hacienda San Carlos Borromeo</p>
          </div>
        </div>
        
        <!-- Botón de contacto -->
        <div style="text-align: center; padding: 0 25px 30px;">
          <a href="mailto:eventos@hacienda-bodas.com" style="display: inline-block; background-color: ${colorPrimario}; color: white; text-decoration: none; padding: 12px 25px; border-radius: 4px; font-weight: 600; font-size: 16px;">Contactar con Eventos</a>
        </div>
        
        <!-- Pie de página -->
        <div style="background-color: ${colorSecundario}; padding: 20px; text-align: center; color: ${colorTextoClaro};">
          <p style="margin: 0 0 10px; font-size: 14px;">Hacienda San Carlos Borromeo</p>
          <p style="margin: 0 0 10px; font-size: 12px;">Calle Ejemplo, 123 - 28001 Madrid</p>
          <p style="margin: 0; font-size: 12px;">Teléfono: +34 912 345 678 | Email: info@hacienda-bodas.com</p>
          <p style="margin: 10px 0 0; font-size: 11px;">&copy; ${new Date().getFullYear()} Hacienda San Carlos Borromeo. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}; 