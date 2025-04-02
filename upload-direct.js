const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Ruta al archivo de video
const videoPath = path.join(__dirname, '../frontend/public/ESPACIOS-HACIENDA-SAN-CARLOS.mp4');

// Verificar que el archivo existe
if (!fs.existsSync(videoPath)) {
  console.error('Error: El archivo de video no existe en la ruta especificada.');
  console.error('Ruta verificada:', videoPath);
  process.exit(1);
}

console.log('Archivo de video encontrado:', videoPath);
console.log('Tamaño del archivo:', (fs.statSync(videoPath).size / (1024 * 1024)).toFixed(2), 'MB');
console.log('Credenciales Cloudinary:');
console.log('  Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('  API Key:', process.env.CLOUDINARY_API_KEY);
console.log('  API Secret:', process.env.CLOUDINARY_API_SECRET.substring(0, 4) + '...');

// Función para subir el video
async function uploadVideo() {
  try {
    console.log('\nIniciando la subida directa a Cloudinary...');
    console.log('Este proceso puede tardar varios minutos dependiendo del tamaño del archivo y tu conexión a Internet.');
    
    // Usar Cloudinary para subir el archivo
    const result = await cloudinary.uploader.upload(videoPath, {
      resource_type: 'video',
      folder: 'hacienda-videos',
      use_filename: true,
      unique_filename: true
    });

    console.log('\nVideo subido exitosamente a Cloudinary!');
    console.log('URL del video:', result.secure_url);
    console.log('ID público:', result.public_id);
    
    // Guardar la información en un archivo para referencia futura
    fs.writeFileSync(
      path.join(__dirname, 'video-info.json'), 
      JSON.stringify(result, null, 2)
    );
    
    console.log('Información guardada en video-info.json');
    
    return result;
  } catch (error) {
    console.error('\nError al subir el video a Cloudinary:');
    console.error(error);
    process.exit(1);
  }
}

uploadVideo(); 