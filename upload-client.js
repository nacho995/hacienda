const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

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

// Crear el FormData
const formData = new FormData();
formData.append('video', fs.createReadStream(videoPath));

// URL del API (asume que el servidor está en ejecución)
const apiUrl = 'http://localhost:5000/api/cloudinary/upload';

async function uploadVideo() {
  try {
    console.log('Iniciando la subida del video a Cloudinary...');
    console.log('Este proceso puede tardar varios minutos dependiendo del tamaño del archivo y tu conexión a Internet.');
    console.log('API URL:', apiUrl);
    
    const response = await axios.post(apiUrl, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    console.log('Video subido exitosamente a Cloudinary.');
    console.log('URL del video:', response.data.url);
    console.log('ID público:', response.data.public_id);
    
    // Guardar la información en un archivo para referencia futura
    fs.writeFileSync(
      path.join(__dirname, 'video-info.json'), 
      JSON.stringify(response.data, null, 2)
    );
    
    console.log('Información guardada en video-info.json');
    
    return response.data;
  } catch (error) {
    console.error('Error al subir el video:');
    console.error(error);
    
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
      console.error('Código de estado:', error.response.status);
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor');
      console.error('¿Está el servidor en ejecución en el puerto 5000?');
    } else {
      console.error('Error de configuración de la solicitud:', error.message);
    }
    
    console.error('URL del API:', apiUrl);
    console.error('Comprueba que las credenciales de Cloudinary sean correctas en el archivo .env');
    process.exit(1);
  }
}

uploadVideo(); 