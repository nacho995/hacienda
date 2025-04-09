const { exec } = require('child_process');
const path = require('path');

console.log('Iniciando carga de todos los servicios...');

const scripts = [
  'seedPaquetesEventos.js',
  'seedServiciosAdicionales.js',
  'seedCoctelBrunchBebidas.js',
  'seedMontajeFotoCoordinacion.js'
];

// Ejecutar scripts en secuencia
async function runScriptsSequentially() {
  for (const script of scripts) {
    console.log(`\nEjecutando ${script}...`);
    try {
      await runScript(script);
      console.log(`✅ ${script} ejecutado correctamente`);
    } catch (error) {
      console.error(`❌ Error al ejecutar ${script}:`, error);
      process.exit(1);
    }
  }
  console.log('\n✅✅✅ Todos los servicios cargados correctamente');
}

// Función para ejecutar un script
function runScript(scriptName) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, scriptName);
    const child = exec(`node ${scriptPath}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      console.log(stdout);
      if (stderr) {
        console.error(stderr);
      }
      resolve();
    });
  });
}

runScriptsSequentially();
