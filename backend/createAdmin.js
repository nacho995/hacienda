require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Datos del nuevo administrador
const adminData = {
  nombre: 'Nacho',
  apellidos: 'Desarrollo',
  email: 'admin@desarrollo.com',
  password: 'admin123',
  telefono: '123456789',
  role: 'admin',
  confirmado: true
};

// Conectar a la base de datos
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Conexión a MongoDB establecida correctamente');
    
    // Importar el modelo de Usuario
    const User = require('./src/models/User');
    
    try {
      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ email: adminData.email });
      
      if (existingUser) {
        console.log('El usuario ya existe, actualizando contraseña...');
        
        // Generar hash de contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminData.password, salt);
        
        // Actualizar usuario
        existingUser.password = hashedPassword;
        existingUser.confirmado = true;
        
        await existingUser.save();
        console.log('Contraseña actualizada correctamente');
      } else {
        console.log('Creando nuevo usuario administrador...');
        
        // Crear nuevo usuario
        await User.create(adminData);
        console.log('Usuario administrador creado correctamente');
      }
      
      console.log('Ahora puedes iniciar sesión con:');
      console.log(`Email: ${adminData.email}`);
      console.log(`Contraseña: ${adminData.password}`);
      
    } catch (error) {
      console.error('Error al crear/actualizar administrador:', error);
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