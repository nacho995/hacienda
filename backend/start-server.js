const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

console.log('\x1b[36m%s\x1b[0m', '=================================');
console.log('\x1b[36m%s\x1b[0m', '  Hacienda San Carlos Backend   ');
console.log('\x1b[36m%s\x1b[0m', '=================================');
console.log('');

// Verificar si el archivo .env existe
if (!fs.existsSync(path.join(__dirname, '.env'))) {
  console.log('\x1b[31m%s\x1b[0m', 'ERROR: Archivo .env no encontrado');
  console.log('\x1b[33m%s\x1b[0m', 'Por favor, crea un archivo .env con el siguiente contenido:');
  console.log(`
PORT=5000
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
  `);
  process.exit(1);
}

console.log('\x1b[32m%s\x1b[0m', '✓ Archivo .env encontrado');

// Iniciar el servidor
console.log('\x1b[33m%s\x1b[0m', 'Iniciando el servidor...');
const server = spawn('npm', ['run', 'dev'], { stdio: 'inherit' });

// Manejar la finalización del servidor
server.on('close', (code) => {
  if (code !== 0) {
    console.log('\x1b[31m%s\x1b[0m', `El servidor se cerró con código ${code}`);
  }
});

// Crear el gestor de entrada
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n\x1b[36m%s\x1b[0m', 'Comandos disponibles:');
console.log('\x1b[36m%s\x1b[0m', '  - upload: Sube el video grande a Cloudinary');
console.log('\x1b[36m%s\x1b[0m', '  - exit: Detiene el servidor y sale');
console.log('\n\x1b[33m%s\x1b[0m', 'Escribe un comando:');

rl.on('line', (input) => {
  const command = input.trim().toLowerCase();
  
  if (command === 'upload') {
    console.log('\x1b[33m%s\x1b[0m', 'Iniciando carga del video...');
    const upload = spawn('node', ['upload-client.js'], { stdio: 'inherit' });
    
    upload.on('close', (code) => {
      if (code === 0) {
        console.log('\x1b[32m%s\x1b[0m', 'Video subido exitosamente!');
      } else {
        console.log('\x1b[31m%s\x1b[0m', `Error al subir el video (código ${code})`);
      }
      console.log('\n\x1b[33m%s\x1b[0m', 'Escribe un comando:');
    });
  } else if (command === 'exit') {
    console.log('\x1b[33m%s\x1b[0m', 'Deteniendo servidor...');
    server.kill();
    rl.close();
    process.exit(0);
  } else {
    console.log('\x1b[31m%s\x1b[0m', 'Comando no reconocido');
    console.log('\n\x1b[33m%s\x1b[0m', 'Escribe un comando:');
  }
}); 