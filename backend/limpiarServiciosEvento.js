// limpiarServiciosEvento.js
const mongoose = require('mongoose');
const dotenv = require('dotenv'); // Para cargar variables de entorno

// Cargar variables de entorno desde .env en el directorio actual
dotenv.config(); 

// Importar modelos (asumiendo que están en ./src/models/ desde la raíz del backend)
const Servicio = require('./src/models/Servicio');
const ReservaEvento = require('./src/models/ReservaEvento');

// Usar MONGODB_URI 
const MONGODB_URI = process.env.MONGODB_URI;

// Comprobar MONGODB_URI 
if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI no está definida en el archivo .env o dotenv no pudo cargarlo.'); // Mensaje de error mejorado
  process.exit(1);
}

const connectDB = async () => {
  try {
    // Usar MONGODB_URI 
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Conectado para limpieza...');
  } catch (err) {
    console.error('Error conectando a MongoDB:', err.message);
    process.exit(1);
  }
};

const limpiarReferenciasServicios = async () => {
  console.log('Iniciando proceso de limpieza de referencias de servicios en ReservaEvento...');

  try {
    // 1. Obtener TODOS los IDs válidos de la colección 'servicios'
    const serviciosValidos = await Servicio.find().select('_id');
    // Convertir a un Set de strings para búsqueda rápida
    const idsServiciosValidos = new Set(serviciosValidos.map(s => s._id.toString()));
    console.log(`Encontrados ${idsServiciosValidos.size} IDs de servicios válidos.`);
    if (idsServiciosValidos.size === 0) {
        console.warn("Advertencia: No se encontraron servicios válidos en la colección 'servicios'. La limpieza no tendrá efecto.");
    }

    // 2. Obtener todas las reservas de evento que tengan servicios contratados
    const reservasConServicios = await ReservaEvento.find({
        serviciosContratados: { $exists: true, $not: { $size: 0 } }
    }).select('serviciosContratados nombreEvento numeroConfirmacion'); // Seleccionar solo lo necesario
    console.log(`Encontradas ${reservasConServicios.length} reservas de evento con servicios contratados para revisar.`);

    let modificadasCount = 0;
    let procesadasCount = 0;
    let referenciasInvalidasEliminadas = 0;

    // 3. Iterar sobre cada reserva y limpiar su array
    for (const reserva of reservasConServicios) {
      procesadasCount++;
      const originalServiciosContratados = reserva.serviciosContratados || [];
      let necesitaActualizacion = false;
      let eliminadasEnEstaReserva = 0;

      // Crear el nuevo array filtrado
      const serviciosLimpios = originalServiciosContratados.filter(item => {
        // Verificar que 'servicio' existe, es un ObjectId válido y está en el Set de IDs válidos
        const esValido = item.servicio &&
                         mongoose.Types.ObjectId.isValid(item.servicio) &&
                         idsServiciosValidos.has(item.servicio.toString());

        if (!esValido) {
             if(item.servicio !== null && item.servicio !== undefined) {
                 console.warn(`  [Evento ID: ${reserva._id}, Conf: ${reserva.numeroConfirmacion || 'N/A'}] Referencia inválida/inexistente encontrada y será eliminada: ${item.servicio}`);
             } else if (!item.hasOwnProperty('servicio')) {
                 console.warn(`  [Evento ID: ${reserva._id}, Conf: ${reserva.numeroConfirmacion || 'N/A'}] Entrada sin campo 'servicio' será eliminada.`);
             }
             necesitaActualizacion = true;
             eliminadasEnEstaReserva++;
        }

        return esValido;
      });

      // 4. Si el array filtrado es diferente al original, actualizar el documento
      if (necesitaActualizacion) {
        referenciasInvalidasEliminadas += eliminadasEnEstaReserva;
        console.log(`  Actualizando evento ID: ${reserva._id} (Conf: ${reserva.numeroConfirmacion || 'N/A'}). Refs inválidas eliminadas: ${eliminadasEnEstaReserva}. Quedan: ${serviciosLimpios.length}`);
        try {
           const updateResult = await ReservaEvento.updateOne(
                { _id: reserva._id },
                { $set: { serviciosContratados: serviciosLimpios } }
            );
             if (updateResult.modifiedCount > 0) {
                 modificadasCount++;
             } else {
                 console.warn(`   -> No se reportó modificación para ${reserva._id} a pesar de detectar necesidad. Verificar manualmente si necesario.`);
             }
        } catch (updateError) {
            console.error(`   -> Error actualizando documento ${reserva._id}:`, updateError);
        }
      }

      if (procesadasCount % 50 === 0) {
          console.log(`  ... ${procesadasCount} reservas procesadas ...`);
      }
    }

    console.log('-----------------------------------------');
    console.log('Proceso de limpieza finalizado.');
    console.log(`Total de reservas revisadas: ${reservasConServicios.length}`);
    console.log(`Total de referencias inválidas eliminadas: ${referenciasInvalidasEliminadas}`);
    console.log(`Total de reservas modificadas: ${modificadasCount}`);
    console.log('-----------------------------------------');

  } catch (error) {
    console.error('Error durante el proceso de limpieza:', error);
  } finally {
    // 5. Cerrar la conexión a la base de datos
    await mongoose.disconnect();
    console.log('Conexión a MongoDB cerrada.');
  }
};

// Ejecutar la función principal
connectDB().then(() => {
  limpiarReferenciasServicios();
});