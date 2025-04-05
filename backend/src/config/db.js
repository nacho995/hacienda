const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Las opciones useNewUrlParser, useUnifiedTopology, etc. ya no son necesarias en las versiones recientes de Mongoose
    });

    console.log(`MongoDB conectado: ${conn.connection.host}`.cyan.underline.bold);
  } catch (error) {
    console.error(`Error al conectar a MongoDB: ${error.message}`.red.bold);
    // Salida forzada con código de error
    process.exit(1);
  }
};

module.exports = connectDB; 