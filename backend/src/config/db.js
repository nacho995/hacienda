const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    console.log('MONGO_URI en db.js:', process.env.MONGO_URI ? 'Disponible' : 'No disponible');
    
    if (!process.env.MONGO_URI) {
      console.error('Variable MONGO_URI no está definida. Utilizando cadena de conexión hardcoded para desarrollo.');
      await mongoose.connect('mongodb+srv://nacho995:eminem50cent@cluster0.o6i9n.mongodb.net/Hacienda?retryWrites=true&w=majority&appName=Cluster0');
    } else {
      await mongoose.connect(process.env.MONGO_URI);
    }
    
    console.log(`MongoDB conectado: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`Error al conectar a MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 