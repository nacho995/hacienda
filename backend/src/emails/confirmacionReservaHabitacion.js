/**
 * Plantilla de email para confirmación de reserva de habitación
 */

module.exports = function({
  nombreCliente,
  tipoHabitacion,
  numeroConfirmacion,
  fechaEntrada,
  fechaSalida,
  totalNoches,
  precio,
  metodoPago,
  detallesAdicionales = {}
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
  
  // Formatear fechas para mostrar
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
  
  // Generar detalles adicionales
  const generarDetallesHTML = (detalles) => {
    if (!detalles || Object.keys(detalles).length === 0) return '';
    
    let detallesHTML = '';
    for (const [clave, valor] of Object.entries(detalles)) {
      if (valor) {
        const claveFormateada = clave.charAt(0).toUpperCase() + clave.slice(1).replace(/([A-Z])/g, ' $1');
        detallesHTML += `
          <tr>
            <th style="text-align: left; padding: 8px; border-bottom: 1px solid ${colorBorde}; color: ${colorSecundario}; font-weight: 600;">${claveFormateada}</th>
            <td style="text-align: left; padding: 8px; border-bottom: 1px solid ${colorBorde}; color: ${colorTexto};">${valor}</td>
          </tr>
        `;
      }
    }
    
    return detallesHTML ? `
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px; background-color: white; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <tbody>
          ${detallesHTML}
        </tbody>
      </table>
    ` : '';
  };
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Reserva - Hacienda San Carlos Borromeo</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Open+Sans:wght@300;400;600&display=swap');
      </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Open Sans', Arial, sans-serif; background-color: ${colorFondo}; color: ${colorTexto};">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <!-- Encabezado -->
        <div style="background-color: ${colorPrimario}; padding: 25px; text-align: center;">
          <h1 style="font-family: 'Playfair Display', Georgia, serif; color: ${colorTextoClaro}; margin: 0; font-size: 28px;">Hacienda San Carlos Borromeo</h1>
          <p style="color: ${colorTextoClaro}; margin: 10px 0 0; font-size: 18px;">¡Su reserva está confirmada!</p>
        </div>
        
        <!-- Banner de confirmación -->
        <div style="background-color: ${colorExito}; padding: 12px; text-align: center;">
          <p style="margin: 0; color: white; font-weight: 600; font-size: 16px;">Confirmación #${numeroConfirmacion}</p>
        </div>
        
        <!-- Saludo -->
        <div style="padding: 30px 25px 10px;">
          <h2 style="font-family: 'Playfair Display', Georgia, serif; color: ${colorPrimario}; margin: 0 0 20px; font-size: 22px;">Estimado/a ${nombreCliente},</h2>
          <p style="margin: 0 0 20px; line-height: 1.6;">Nos complace confirmar su reserva en Hacienda San Carlos Borromeo. A continuación encontrará los detalles de su estancia:</p>
        </div>
        
        <!-- Detalles principales de la reserva -->
        <div style="padding: 0 25px 20px;">
          <div style="background-color: ${colorFondo}; border-radius: 6px; padding: 20px; margin-bottom: 25px; border-left: 4px solid ${colorDestacado};">
            <h3 style="font-family: 'Playfair Display', Georgia, serif; color: ${colorSecundario}; margin: 0 0 15px; font-size: 18px; border-bottom: 1px solid ${colorBorde}; padding-bottom: 10px;">Detalles de su Reserva</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; width: 40%; color: ${colorSecundario}; font-weight: 600;">Tipo de Habitación:</td>
                <td style="padding: 8px 0; color: ${colorTexto};">${tipoHabitacion}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: ${colorSecundario}; font-weight: 600;">Fecha de Entrada:</td>
                <td style="padding: 8px 0; color: ${colorTexto};">${formatearFecha(fechaEntrada)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: ${colorSecundario}; font-weight: 600;">Fecha de Salida:</td>
                <td style="padding: 8px 0; color: ${colorTexto};">${formatearFecha(fechaSalida)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: ${colorSecundario}; font-weight: 600;">Noches:</td>
                <td style="padding: 8px 0; color: ${colorTexto};">${totalNoches}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: ${colorSecundario}; font-weight: 600;">Precio Total:</td>
                <td style="padding: 8px 0; color: ${colorTexto}; font-weight: 700;">${formatearPrecio(precio)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: ${colorSecundario}; font-weight: 600;">Método de Pago:</td>
                <td style="padding: 8px 0; color: ${colorTexto};">${metodoPago}</td>
              </tr>
            </table>
            
            <!-- Detalles adicionales si existen -->
            ${generarDetallesHTML(detallesAdicionales)}
          </div>
          
          <!-- Información adicional -->
          <div style="margin-bottom: 30px;">
            <h3 style="font-family: 'Playfair Display', Georgia, serif; color: ${colorSecundario}; margin: 0 0 15px; font-size: 18px;">Información importante</h3>
            <ul style="padding-left: 20px; margin: 0; color: ${colorTexto}; line-height: 1.6;">
              <li style="margin-bottom: 10px;">El check-in está disponible a partir de las 15:00h.</li>
              <li style="margin-bottom: 10px;">El check-out debe realizarse antes de las 12:00h.</li>
              <li style="margin-bottom: 10px;">Para cualquier solicitud especial, póngase en contacto con nosotros al menos 48 horas antes de su llegada.</li>
              <li style="margin-bottom: 10px;">En caso de necesitar cancelar su reserva, por favor contacte con nosotros con al menos 72 horas de antelación.</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="margin: 0 0 20px; font-style: italic; color: ${colorDestacado};">¡Esperamos darle la bienvenida pronto!</p>
            <p style="margin: 0; font-weight: 600;">Equipo de Hacienda San Carlos Borromeo</p>
          </div>
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