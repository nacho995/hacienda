/**
 * Plantilla de email para notificaciones administrativas
 * Esta plantilla es utilizada para enviar notificaciones al personal
 * administrativo sobre diferentes acciones relacionadas con reservas.
 */

module.exports = function({
  accion,
  tipoReserva,
  numeroConfirmacion,
  nombreCliente,
  emailCliente,
  detallesAdicionales = {}
}) {
  // Colores y fuentes consistentes con el sitio web
  const colorPrimario = '#795548'; // Marrón/tierra (color principal)
  const colorSecundario = '#4e342e'; // Marrón oscuro (para acentos)
  const colorTexto = '#3c3c3c'; // Texto oscuro pero no negro puro
  const colorTextoClaro = '#f5f5f5'; // Texto claro para fondos oscuros
  const colorFondo = '#f8f4e9'; // Beige claro (fondo de email)
  const colorBorde = '#d7ccc8'; // Beige medio para bordes
  const colorAlerta = '#e64a19'; // Naranja oscuro para alertas o acciones importantes
  
  // Función para determinar el color de la acción
  const getColorAccion = (accion) => {
    switch(accion.toLowerCase()) {
      case 'nueva reserva':
        return '#558b2f'; // Verde
      case 'cancelación':
        return '#c62828'; // Rojo
      case 'modificación':
        return '#f57c00'; // Naranja
      default:
        return colorAlerta; // Por defecto
    }
  };
  
  // Formatear detalles adicionales como lista
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
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px; background-color: white; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <tbody>
          ${detallesHTML}
        </tbody>
      </table>
    ` : '';
  };
  
  // Color específico basado en el tipo de acción
  const colorAccion = getColorAccion(accion);
  
  // Construir el HTML completo
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Notificación Administrativa - Hacienda San Carlos Borromeo</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Open+Sans:wght@300;400;600&display=swap');
      </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Open Sans', Arial, sans-serif; background-color: ${colorFondo}; color: ${colorTexto};">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <!-- Encabezado -->
        <div style="background-color: ${colorPrimario}; padding: 20px; text-align: center;">
          <h1 style="font-family: 'Playfair Display', Georgia, serif; color: ${colorTextoClaro}; margin: 0; font-size: 24px;">Hacienda San Carlos Borromeo</h1>
          <p style="color: ${colorTextoClaro}; margin: 5px 0 0; font-size: 16px;">Notificación Administrativa</p>
        </div>
        
        <!-- Contenido Principal -->
        <div style="padding: 30px 20px;">
          <!-- Detalles de la acción -->
          <div style="background-color: ${colorAccion}; color: white; padding: 10px 15px; border-radius: 4px; margin-bottom: 20px;">
            <h2 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 18px;">${accion} - ${tipoReserva}</h2>
          </div>
          
          <!-- Información básica -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <tr>
              <th style="text-align: left; padding: 8px; border-bottom: 2px solid ${colorBorde}; color: ${colorSecundario}; width: 40%; font-weight: 600;">Número de Confirmación</th>
              <td style="text-align: left; padding: 8px; border-bottom: 2px solid ${colorBorde}; font-weight: bold; color: ${colorTexto};">${numeroConfirmacion}</td>
            </tr>
            <tr>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid ${colorBorde}; color: ${colorSecundario}; font-weight: 600;">Cliente</th>
              <td style="text-align: left; padding: 8px; border-bottom: 1px solid ${colorBorde}; color: ${colorTexto};">${nombreCliente}</td>
            </tr>
            <tr>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid ${colorBorde}; color: ${colorSecundario}; font-weight: 600;">Email</th>
              <td style="text-align: left; padding: 8px; border-bottom: 1px solid ${colorBorde}; color: ${colorTexto};">${emailCliente}</td>
            </tr>
          </table>
          
          <!-- Detalles adicionales -->
          ${generarDetallesHTML(detallesAdicionales)}
          
          <!-- Botón de acción si se proporciona URL -->
          ${detallesAdicionales.urlGestionReserva ? `
          <div style="text-align: center; margin-top: 30px; margin-bottom: 20px;">
            <a href="${detallesAdicionales.urlGestionReserva}" style="display: inline-block; background-color: ${colorAccion}; color: white; text-decoration: none; padding: 12px 25px; border-radius: 4px; font-weight: 600;">
              Ver detalles en el sistema
            </a>
          </div>
          ` : ''}
        </div>
        
        <!-- Pie de página -->
        <div style="background-color: ${colorSecundario}; padding: 15px; text-align: center; color: ${colorTextoClaro}; font-size: 12px;">
          <p>Este es un mensaje automático. Por favor no responda a este correo.</p>
          <p>&copy; ${new Date().getFullYear()} Hacienda San Carlos Borromeo. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
