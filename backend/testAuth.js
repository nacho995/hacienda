require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

// Datos para la prueba
const testCredentials = {
  email: 'admin@hacienda.com',
  password: 'admin123'
};

// Función para comparar contraseñas
const comparePasswords = async (plainPassword, hashedPassword) => {
  try {
    console.log('Comparando contraseñas:');
    console.log('- Contraseña plana:', plainPassword);
    console.log('- Hash almacenado:', hashedPassword);
    
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    console.log('Resultado de comparación:', isMatch ? 'COINCIDE ✅' : 'NO COINCIDE ❌');
    
    // Probar a generar un nuevo hash y compararlo
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(plainPassword, salt);
    console.log('Nuevo hash generado:', newHash);
    
    const testMatch = await bcrypt.compare(plainPassword, newHash);
    console.log('Prueba con nuevo hash:', testMatch ? 'FUNCIONA ✅' : 'FALLA ❌');
    
    return isMatch;
  } catch (error) {
    console.error('Error al comparar contraseñas:', error);
    return false;
  }
};

// Conectar a la base de datos
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Conexión a MongoDB establecida correctamente');
    
    try {
      // Buscar el usuario por email
      console.log(`Buscando usuario con email: ${testCredentials.email}`);
      const user = await User.findOne({ email: testCredentials.email }).select('+password');
      
      if (!user) {
        console.log('❌ Usuario no encontrado');
        return;
      }
      
      console.log('✅ Usuario encontrado:');
      console.log('- ID:', user._id);
      console.log('- Nombre:', user.nombre);
      console.log('- Apellidos:', user.apellidos);
      console.log('- Email:', user.email);
      console.log('- Rol:', user.role);
      console.log('- Confirmado:', user.confirmado ? 'Sí' : 'No');
      
      // Forzar la actualización de la contraseña
      console.log('\nActualizando contraseña a "admin123"...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // Actualizar usuario directamente
      await User.findByIdAndUpdate(user._id, { password: hashedPassword });
      console.log('✅ Contraseña actualizada directamente en la base de datos');
      
      // Buscar de nuevo el usuario para verificar
      const updatedUser = await User.findOne({ email: testCredentials.email }).select('+password');
      console.log('Hash guardado en la base de datos:', updatedUser.password);
      
      // Probar la autenticación
      console.log('\nProbando autenticación con la contraseña actualizada...');
      await comparePasswords('admin123', updatedUser.password);
      
    } catch (error) {
      console.error('Error durante la prueba de autenticación:', error);
    } finally {
      // Cerrar la conexión a la base de datos
      mongoose.connection.close();
      console.log('Conexión a MongoDB cerrada');
    }
  })
  .catch(err => {
    console.error('Error al conectar con MongoDB:', err);
  }); 