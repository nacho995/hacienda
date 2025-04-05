require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Conectar a la base de datos
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Conexión a MongoDB establecida correctamente');
    
    // Importar el modelo de Usuario
    const User = require('./src/models/User');
    
    try {
      // Buscar el usuario por email
      const user = await User.findOne({ email: 'admin@desarrollo.com' });
      
      if (!user) {
        console.log('Usuario no encontrado');
        process.exit(1);
      }
      
      console.log('Usuario encontrado:', user.email, user._id);
      
      // Generar nuevo hash de contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // Actualizar la contraseña y asegurar que la cuenta está confirmada
      user.password = hashedPassword;
      user.confirmado = true;
      
      await user.save();
      
      console.log('Contraseña actualizada correctamente');
      console.log('Ahora puedes iniciar sesión con:');
      console.log('Email: admin@desarrollo.com');
      console.log('Contraseña: admin123');
      
    } catch (error) {
      console.error('Error al actualizar la contraseña:', error);
    } finally {
      // Cerrar la conexión a la base de datos
      mongoose.connection.close();
      process.exit(0);
    }
  })
  .catch(err => {
    console.error('Error al conectar con MongoDB:', err);
    process.exit(1);
  }); 