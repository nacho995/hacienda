// Script para depurar problemas de autenticación

import apiClient from './client'; // Asegúrate que la ruta es correcta

export const runAuthDiagnostics = async () => {
  // console.log('==== INICIO DIAGNÓSTICO DE AUTENTICACIÓN ====');

  // Variables de entorno
  // console.log('Variables de entorno:');
  // console.log('- NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);

  // LocalStorage
  // console.log('\nLocalStorage:');
  // console.log('- authToken:', localStorage.getItem('authToken') ? 'Presente' : 'No existe');
  // console.log('- user:', localStorage.getItem('user') ? 'Presente' : 'No existe');

  // Prueba de conexión básica al backend
  // console.log('\nRealizando petición de prueba al backend...');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  // console.log('URL base para peticiones:', apiUrl);
  
  try {
    const response = await fetch(`${apiUrl}/health`);
    // console.log('Status de respuesta:', response.status);
    if (response.ok) {
      const data = await response.json();
      // console.log('Respuesta:', data);
      // console.log('✅ Conexión con el backend establecida correctamente');
    } else {
      // console.log('❌ Error en la respuesta del backend');
      const errorText = await response.text();
      // console.log('Detalle del error:', errorText);
    }
  } catch (fetchError) {
    // console.log('❌ Error al conectar con el backend:', fetchError.message);
  }

  // Prueba de login directo
  // console.log('\nProbando login directo con fetch...');
  if (apiUrl) {
    try {
      const loginResponse = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@hacienda.com',
          password: 'admin123'
        })
      });
      
      // console.log('Status de login:', loginResponse.status);
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        // console.log('Respuesta login:', loginData);
        // console.log('✅ Login exitoso en prueba directa');
      } else {
        // console.log('❌ Error en login directo');
        const errorText = await loginResponse.text();
        // console.log('Detalle del error:', errorText);
      }
    } catch (loginError) {
      // console.log('❌ Error al realizar login directo:', loginError.message);
    }
  }

  // console.log('==== FIN DIAGNÓSTICO DE AUTENTICACIÓN ====');
};

export default { runAuthDiagnostics }; 