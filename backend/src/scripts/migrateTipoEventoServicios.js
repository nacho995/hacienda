// Script para migrar el campo serviciosDisponibles de TipoEvento de Array<String> a Array<ObjectId>
// IMPORTANTE: Haz una copia de seguridad de tu base de datos ANTES de ejecutar este script.

const path = require('path'); // Añadir para resolver rutas
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }); // Usar path.resolve para ruta más robusta
const mongoose = require('mongoose');
const TipoEvento = require('../models/TipoEvento'); // Ajusta la ruta si es necesario
const Servicio = require('../models/Servicio');   // Ajusta la ruta si es necesario

const MONGODB_URI = process.env.MONGODB_URI_DEV || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI no está definida en las variables de entorno.');
  process.exit(1);
}

// --- Lógica de Mapeo Manual (Ajustar según sea necesario) ---
// Si hay strings en serviciosDisponibles que no coinciden directamente con un 'id' de Servicio (ignorando mayúsculas/minúsculas)
// añádelos aquí. Ejemplo: si tienes "DJ" pero el id del servicio es "musica".
const manualMapping = {
  "dj": "musica", // Mapea el string "dj" (en minúsculas) al servicio con id "musica"
  "coordinador de bodas": "coordinador", // Asumiendo que tienes un servicio con id "coordinador"
  // Añade más mapeos si son necesarios:
  // "string_en_db_minusculas": "id_real_servicio",
};
// --- Fin Lógica de Mapeo Manual ---

async function migrateServicios() {
  let connection;
  try {
    console.log('Conectando a MongoDB...');
    connection = await mongoose.connect(MONGODB_URI);
    console.log('MongoDB conectado.');

    console.log('Buscando todos los Tipos de Evento...');
    // Asegúrate de seleccionar explícitamente los campos necesarios
    const tiposEvento = await TipoEvento.find({}).select('_id titulo serviciosDisponibles');
    console.log(`Encontrados ${tiposEvento.length} Tipos de Evento.`);

    let tiposEventoActualizados = 0;
    let tiposEventoNoNecesitanActualizacion = 0;
    let tiposEventoConErrores = 0;

    for (const tipoEvento of tiposEvento) {
      console.log(`\nProcesando TipoEvento: ${tipoEvento.titulo} (ID: ${tipoEvento._id})`);
      const currentServicios = tipoEvento.serviciosDisponibles;

      // Verificar si el array ya contiene ObjectIds (en caso de re-ejecutar)
      if (currentServicios && currentServicios.length > 0 && mongoose.Types.ObjectId.isValid(currentServicios[0])) {
        console.log('-> Ya parece contener ObjectIds. Saltando.');
        tiposEventoNoNecesitanActualizacion++;
        continue;
      }

      // Verificar si es un array y si realmente contiene strings
      const isValidStringArray = Array.isArray(currentServicios) && currentServicios.length > 0 && currentServicios.every(s => typeof s === 'string');

      if (!isValidStringArray) {
        if (Array.isArray(currentServicios) && currentServicios.length === 0) {
             console.log('-> El array está vacío. No hay nada que migrar. Saltando.');
        } else {
            console.log('-> No contiene un array de strings válidos para migrar. Saltando. Valor actual:', currentServicios);
        }
        tiposEventoNoNecesitanActualizacion++;
        continue;
      }

      console.log('-> Servicios actuales (strings):', currentServicios);
      const newServiciosObjectIds = [];
      const notFoundStrings = [];

      for (const serviceString of currentServicios) {
        if (!serviceString || !serviceString.trim()) {
          console.warn(` -> Saltando entrada vacía o inválida en array: "${serviceString}"`);
          continue;
        }

        let searchId = serviceString.trim().toLowerCase();

        // Aplicar mapeo manual si existe
        if (manualMapping[searchId]) {
          const originalSearchId = searchId;
          searchId = manualMapping[searchId];
          console.log(` -> Mapeando "${originalSearchId}" a "${searchId}"`);
        }

        // Buscar Servicio por 'id' (asegúrate que el modelo Servicio tenga indexado el campo 'id' para eficiencia)
        try {
             const servicioEncontrado = await Servicio.findOne({ id: searchId }).select('_id'); // Solo necesitamos el _id

             if (servicioEncontrado) {
                newServiciosObjectIds.push(servicioEncontrado._id);
             } else {
                console.warn(` -> ¡ADVERTENCIA! Servicio NO encontrado para string: "${serviceString}" (buscado como id: "${searchId}")`);
                notFoundStrings.push(serviceString);
             }
        } catch (findError) {
            console.error(` -> Error buscando servicio para ID ${searchId}:`, findError);
            notFoundStrings.push(serviceString); // Marcar como no encontrado si hay error
        }
      }

      if (notFoundStrings.length > 0) {
        console.warn(` -> Resumen: No se encontraron servicios para: ${notFoundStrings.join(', ')}`);
        tiposEventoConErrores++;
      }

      // Determinar si es necesario actualizar
      // Comparamos los ObjectIds encontrados con los strings originales (ignorando los no encontrados)
      // La actualización es necesaria si: nº ObjectIds != nº strings originales O si hubo errores/no encontrados.
      const necesitaActualizacion = newServiciosObjectIds.length !== currentServicios.length || notFoundStrings.length > 0;

      if (necesitaActualizacion && newServiciosObjectIds.length > 0) {
          // Solo actualizamos si hay una diferencia Y tenemos al menos un ObjectId válido para guardar
          console.log(`-> Actualizando. ${newServiciosObjectIds.length} ObjectIds encontrados. ${notFoundStrings.length} strings no encontrados.`);
          try {
            // Usamos updateOne para mayor eficiencia si solo cambiamos un campo
            await TipoEvento.updateOne(
                { _id: tipoEvento._id },
                { $set: { serviciosDisponibles: newServiciosObjectIds } }
            );
            // tipoEvento.serviciosDisponibles = newServiciosObjectIds;
            // await tipoEvento.save(); // .save() puede ser menos eficiente y dispara más middleware
            tiposEventoActualizados++;
            console.log(`-> TipoEvento ${tipoEvento.titulo} actualizado.`);
          } catch (saveError) {
            console.error(` -> !! ERROR al actualizar TipoEvento ${tipoEvento.titulo}:`, saveError);
            tiposEventoConErrores++; // Contar como error si falla el guardado
          }
      } else if (newServiciosObjectIds.length === 0 && currentServicios.length > 0) {
          console.log('-> No se encontraron ObjectIds válidos para los strings existentes. No se realiza la actualización.');
          tiposEventoNoNecesitanActualizacion++;
          // Opcional: si quieres limpiar arrays que no pudieron ser mapeados:
          // console.log('-> Limpiando array de servicios inválidos.');
          // await TipoEvento.updateOne({ _id: tipoEvento._id }, { $set: { serviciosDisponibles: [] } });
      } else {
          console.log('-> No se detectaron cambios necesarios.');
          tiposEventoNoNecesitanActualizacion++;
      }
    }

    console.log(`\n--- Migración Finalizada ---`);
    console.log(`Tipos de Evento procesados: ${tiposEvento.length}`);
    console.log(`Tipos de Evento actualizados exitosamente: ${tiposEventoActualizados}`);
    console.log(`Tipos de Evento sin necesidad de actualización/ya migrados: ${tiposEventoNoNecesitanActualizacion}`);
    console.log(`Tipos de Evento con servicios no encontrados o errores: ${tiposEventoConErrores}`);

  } catch (error) {
    console.error('\nError general durante la migración:', error);
  } finally {
    if (connection) {
        console.log('Desconectando de MongoDB...');
        await mongoose.disconnect();
        console.log('Desconectado.');
    }
  }
}

// Ejecutar la función de migración
migrateServicios(); 