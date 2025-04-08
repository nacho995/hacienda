/**
 * Script para eliminar el índice numeroHabitacion_1 que está causando problemas
 */
const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

// Conectarse a la base de datos
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Error de conexión:'));
db.once('open', async () => {
  console.log('Conectado a MongoDB para eliminar índice');

  try {
    // Obtener la colección habitacions
    const habitacionCollection = db.collection('habitacions');
    
    // Listar índices actuales
    console.log('Índices actuales:');
    const indices = await habitacionCollection.indexes();
    console.log(indices);
    
    // Eliminar el índice problemático
    await habitacionCollection.dropIndex('numeroHabitacion_1');
    console.log('Índice numeroHabitacion_1 eliminado con éxito');
    
    // Listar índices después de eliminar
    console.log('Índices después de eliminar:');
    const indicesActualizados = await habitacionCollection.indexes();
    console.log(indicesActualizados);
    
    // Cerrar la conexión a la base de datos
    await mongoose.connection.close();
    console.log('Conexión a MongoDB cerrada');
    process.exit(0);
  } catch (error) {
    console.error('Error al eliminar índice:', error);
    process.exit(1);
  }
}); 