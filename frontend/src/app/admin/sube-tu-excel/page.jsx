"use client";

import { useState } from 'react';
// Importar la librería para leer Excel
import * as XLSX from 'xlsx'; 

// Componente para mostrar la tabla de errores
function ErrorTable({ errors, type }) {
  if (!errors || errors.length === 0) return null;

  // Obtener todas las claves (columnas) de los datos de error
  const allKeys = errors.reduce((keys, error) => {
    if (error.data) {
      Object.keys(error.data).forEach(key => {
        if (!keys.includes(key)) {
          keys.push(key);
        }
      });
    }
    return keys;
  }, []);

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold text-red-700 mb-2">Errores en {type === 'rooms' ? 'Habitaciones' : 'Eventos'}:</h3>
      <div className="overflow-x-auto border border-red-300 rounded-md">
        <table className="min-w-full divide-y divide-red-200 text-sm">
          <thead className="bg-red-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-red-800">Fila Excel</th>
              <th className="px-4 py-2 text-left font-medium text-red-800">Error</th>
              {allKeys.map(key => (
                <th key={key} className="px-4 py-2 text-left font-medium text-red-800 whitespace-nowrap">{key}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-red-100">
            {errors.map((error, index) => (
              <tr key={index} className="hover:bg-red-50">
                <td className="px-4 py-2 text-red-900">{error.row || 'N/A'}</td>
                <td className="px-4 py-2 text-red-700 font-medium">{error.error}</td>
                {allKeys.map(key => (
                  <td key={key} className="px-4 py-2 text-gray-700 whitespace-nowrap">
                    {error.data?.[key] !== undefined && error.data?.[key] !== null ? String(error.data[key]) : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SubeTuExcelPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadResult, setUploadResult] = useState(null); // Para guardar el resumen y errores
  const [currentTask, setCurrentTask] = useState(''); // Para mostrar qué se está haciendo

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setMessage('');
    setUploadResult(null); // Limpiar resultados anteriores
    setCurrentTask('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Por favor, selecciona un archivo Excel.');
      setUploadResult(null);
      return;
    }

    setIsLoading(true);
    setUploadResult(null);
    setMessage('');

    try {
      setCurrentTask('Leyendo archivo Excel...');
      const data = await readFileData(selectedFile);
      console.log('Datos leídos del Excel:', data);

      setCurrentTask('Enviando datos al servidor...');
      const result = await sendDataToBackend(data);
      console.log('Respuesta del servidor:', result);
      
      setUploadResult(result); // Guardar resultado para mostrar resumen/errores

      // Determinar mensaje final basado en errores
      if (result.errors?.rooms?.length > 0 || result.errors?.events?.length > 0) {
          setMessage('Proceso completado con errores. Revisa los detalles abajo.');
      } else {
          setMessage('¡Archivo procesado y datos subidos con éxito!');
      }
      
      setSelectedFile(null); // Opcional: Limpiar selección después de procesar

    } catch (error) {
      console.error('Error en el proceso de carga:', error);
      // Si el error viene del fetch y tiene una estructura específica
      if (error.responseJson && error.responseJson.message) {
        setMessage(`Error: ${error.responseJson.message}`);
        setUploadResult(error.responseJson); // Mostrar resumen/errores aunque falle la transacción
      } else {
        setMessage(`Error: ${error.message || 'Ocurrió un error inesperado.'}`);
        setUploadResult(null);
      }
    } finally {
      setIsLoading(false);
      setCurrentTask('');
    }
  };

  // Función para leer datos del Excel usando XLSX
  const readFileData = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = event.target.result;
          const workbook = XLSX.read(data, { type: 'array' }); 
          
          const roomSheetName = 'Habitaciones';
          const eventSheetName = 'Eventos';
          
          if (!workbook.SheetNames.includes(roomSheetName)) {
            throw new Error(`El archivo no contiene la hoja requerida: '${roomSheetName}'.`);
          }
           if (!workbook.SheetNames.includes(eventSheetName)) {
            throw new Error(`El archivo no contiene la hoja requerida: '${eventSheetName}'.`);
          }

          const roomSheet = workbook.Sheets[roomSheetName]; 
          const eventSheet = workbook.Sheets[eventSheetName];

          // header: 1 para obtener array de arrays y manejar mejor filas vacías
          // defval: null para representar celdas vacías explícitamente
          // blankrows: false para omitir filas completamente vacías
          const roomData = XLSX.utils.sheet_to_json(roomSheet, { header: 1, defval: null, blankrows: false });
          const eventData = XLSX.utils.sheet_to_json(eventSheet, { header: 1, defval: null, blankrows: false });
          
          // Convertir array de arrays a array de objetos usando la primera fila como encabezados
          const processSheetData = (sheetData) => {
            if (!sheetData || sheetData.length < 2) return []; // Necesita encabezado y al menos una fila de datos
            const headers = sheetData[0].map(header => String(header).trim()); // Limpiar encabezados
            return sheetData.slice(1).map(row => {
                const rowData = {};
                headers.forEach((header, index) => {
                    if (header) { // Solo añadir si el encabezado no está vacío
                       rowData[header] = row[index]; // Mantener valor (null si celda vacía)
                    }
                });
                // Omitir filas donde todos los valores son null o undefined
                if (Object.values(rowData).every(val => val === null || val === undefined)) {
                    return null;
                }
                return rowData;
            }).filter(row => row !== null); // Filtrar filas completamente vacías
          };

          resolve({ rooms: processSheetData(roomData), events: processSheetData(eventData) });
        } catch (e) {
          console.error("Error leyendo el archivo Excel:", e);
          reject(e); // Propagar el error
        }
      };
      reader.onerror = (error) => {
        console.error("Error con FileReader:", error);
        reject(new Error('Error al leer el archivo localmente.')); // Mensaje más genérico
      };
      reader.readAsArrayBuffer(file); 
    });
  };

  // Función para enviar datos al backend
  const sendDataToBackend = async (data) => {
    try {
      const response = await fetch('/api/admin/bulk-upload', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Incluir token de autorización si es necesario
          // 'Authorization': `Bearer ${your_auth_token}` 
        },
        body: JSON.stringify(data),
      });

      const responseJson = await response.json();

      if (!response.ok) {
          // Crear un error que contenga la respuesta JSON para mostrar detalles
          const error = new Error(responseJson.message || `Error del servidor: ${response.status} ${response.statusText}`);
          error.responseJson = responseJson; // Adjuntar JSON al objeto de error
          throw error; 
      }
      
      return responseJson; // Devolver el resultado exitoso

    } catch (error) {
      console.error('Error al enviar datos al backend:', error);
      // Si ya tiene responseJson, lo propagamos. Si no, creamos un error genérico.
      if (error.responseJson) {
        throw error; 
      } else {
        // Error de red u otro problema antes de recibir respuesta
        throw new Error(`Error de comunicación con el servidor: ${error.message}`); 
      }
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-[var(--color-brown-dark)]">Subir Datos de Reservas desde Excel</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
        <p className="mb-4 text-gray-700">
          Selecciona un archivo Excel (.xlsx, .xls) que contenga las hojas 'Habitaciones' y 'Eventos' con los datos de las reservas.
        </p>
        
        <div className="mb-4">
          <label htmlFor="excel-upload" className="block text-sm font-medium text-gray-700 mb-2">
            Archivo Excel:
          </label>
          <input 
            type="file" 
            id="excel-upload"
            accept=".xlsx, .xls" 
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-brown-light)] file:text-[var(--color-brown-dark)] hover:file:bg-[var(--color-brown-medium)] disabled:opacity-50"
            disabled={isLoading}
          />
          {selectedFile && <p className="text-sm text-gray-600 mt-2">Archivo seleccionado: {selectedFile.name}</p>}
        </div>

        <button 
          onClick={handleUpload}
          disabled={isLoading || !selectedFile}
          className={`px-6 py-2 rounded-md text-white font-semibold transition-colors duration-200 flex items-center justify-center min-w-[200px] ${
            isLoading || !selectedFile 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {currentTask || 'Procesando...'}
            </>
          ) : (
            'Subir y Procesar Archivo'
          )}
        </button>

        {/* Mensaje General */} 
        {message && !isLoading && (
            <p className={`mt-4 text-sm font-semibold ${message.toLowerCase().includes('error') ? 'text-red-600' : 'text-green-600'}`}>
                {message}
            </p>
        )}
      </div>

      {/* Resumen de Resultados */} 
      {uploadResult && !isLoading && (
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Resumen de la Importación</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {/* Resumen Habitaciones */}
                  <div className="bg-white p-4 rounded border border-gray-100">
                      <h3 className="font-medium text-gray-700 mb-2">Habitaciones</h3>
                      <p>Recibidas: <span className="font-semibold">{uploadResult.summary?.roomsReceived ?? 'N/A'}</span></p>
                      <p className="text-green-600">Añadidas: <span className="font-semibold">{uploadResult.summary?.roomsAdded ?? 'N/A'}</span></p>
                      <p className={uploadResult.summary?.roomErrorsCount > 0 ? 'text-red-600' : 'text-gray-500'}>
                          Errores: <span className="font-semibold">{uploadResult.summary?.roomErrorsCount ?? 'N/A'}</span>
                      </p>
                  </div>
                  {/* Resumen Eventos */}
                  <div className="bg-white p-4 rounded border border-gray-100">
                      <h3 className="font-medium text-gray-700 mb-2">Eventos</h3>
                      <p>Recibidos: <span className="font-semibold">{uploadResult.summary?.eventsReceived ?? 'N/A'}</span></p>
                      <p className="text-green-600">Añadidos: <span className="font-semibold">{uploadResult.summary?.eventsAdded ?? 'N/A'}</span></p>
                       <p className={uploadResult.summary?.eventErrorsCount > 0 ? 'text-red-600' : 'text-gray-500'}>
                          Errores: <span className="font-semibold">{uploadResult.summary?.eventErrorsCount ?? 'N/A'}</span>
                      </p>
                  </div>
              </div>
          </div>
      )}

      {/* Tabla de Errores */} 
      {uploadResult && !isLoading && (
          <>
              <ErrorTable errors={uploadResult.errors?.rooms} type="rooms" />
              <ErrorTable errors={uploadResult.errors?.events} type="events" />
          </>
      )}

      {/* Instrucciones Actualizadas */} 
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 shadow-sm">
        {/* === INICIO NUEVO TEXTO INSTRUCCIONES === */}
        <h2 className="font-semibold mb-3 text-lg text-blue-900">¡Prepara tu Archivo Excel Fácilmente!</h2>

        <p className="mb-4 text-sm">Sigue estos pasos para asegurarte de que tu archivo Excel se cargue sin problemas:</p>

        <div className="space-y-4 text-sm">
          <div>
            <strong className="text-blue-800">1. Dos Hojas Obligatorias:</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>Tu archivo Excel debe tener exactamente dos hojas.</li>
              <li>La primera hoja DEBE llamarse <code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Habitaciones</code> (¡con la H mayúscula!).</li>
              <li>La segunda hoja DEBE llamarse <code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Eventos</code> (¡con la E mayúscula!).</li>
            </ul>
          </div>

          <div>
            <strong className="text-blue-800">2. Encabezados Exactos (¡Muy Importante!):</strong>
            <p className="mt-1">La primera fila de cada hoja debe tener los títulos de columna EXACTAMENTE como se muestran a continuación. Copia y pega si es necesario. El orden no importa, pero los nombres sí.</p>
          </div>

          <div>
            <strong className="text-blue-800">3. Columnas para la Hoja "Habitaciones":</strong>
            <ul className="list-disc list-inside ml-4 mt-1 columns-1 sm:columns-2 gap-x-6">
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Habitación</code> (Texto, ej: "Doble 1") - <span className="font-semibold">Requerido</span></li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Tipo Habitación</code> (Texto, ej: "Doble Estándar") - <span className="font-semibold">Requerido</span></li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Fecha Entrada</code> (Fecha, ej: 01/12/2024) - <span className="font-semibold">Requerido</span></li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Fecha Salida</code> (Fecha, posterior a Entrada) - <span className="font-semibold">Requerido</span></li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Precio Total</code> (Número, ej: 250.50) - <span className="font-semibold">Requerido</span></li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Nombre Contacto</code> (Texto) - Opcional</li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Apellidos Contacto</code> (Texto) - Opcional</li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Email Contacto</code> (Email) - Opcional</li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Teléfono Contacto</code> (Texto/Número) - Opcional</li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Fecha Reserva</code> (Fecha) - Opcional</li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Método Pago</code> (Texto: 'efectivo', 'tarjeta', 'transferencia', 'pendiente') - Opcional</li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Estado Pago</code> (Texto: 'pendiente', 'procesando', 'completado', 'fallido', 'reembolsado') - Opcional</li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Estado Reserva</code> (Texto: 'pendiente', 'confirmada', 'cancelada', 'completada') - Opcional</li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Tipo Reserva</code> (Texto: 'hotel' o 'evento') - Opcional</li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Categoría</code> (Texto: 'sencilla' o 'doble') - Opcional</li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Num Hab</code> (Número &ge; 1) - Opcional</li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Huéspedes</code> (Número &ge; 1) - Opcional</li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Nombre Huéspedes</code> (Texto) - Opcional</li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Notas</code> (Texto) - Opcional</li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Precio Noche</code> (Número) - Opcional</li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Letra Hab</code> (Texto) - Opcional</li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Num Confirmación Hab</code> (Texto) - Opcional</li>
            </ul>
            <p className="mt-1 text-xs text-gray-600">Las columnas marcadas como <span className="font-semibold">Requerido</span> deben tener SIEMPRE un valor en cada fila.</p>
          </div>

           <div>
            <strong className="text-blue-800">4. Columnas para la Hoja "Eventos":</strong>
             <ul className="list-disc list-inside ml-4 mt-1 columns-1 sm:columns-2 gap-x-6">
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Nombre Contacto</code> (Texto) - <span className="font-semibold">Requerido</span></li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Apellidos Contacto</code> (Texto) - <span className="font-semibold">Requerido</span></li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Email Contacto</code> (Email) - <span className="font-semibold">Requerido</span></li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Teléfono Contacto</code> (Texto/Número) - <span className="font-semibold">Requerido</span></li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Fecha Evento</code> (Fecha) - <span className="font-semibold">Requerido</span></li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Precio Evento</code> (Número) - <span className="font-semibold">Requerido</span></li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">ID o Nombre Tipo Evento</code> (Texto ID o Nombre) - <span className="font-semibold">Requerido</span></li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Nombre Evento</code> (Texto) - <span className="font-semibold">Requerido</span></li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Hora Inicio</code> (Texto HH:MM) - <span className="font-semibold">Requerido</span></li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Hora Fin</code> (Texto HH:MM, posterior a Inicio) - <span className="font-semibold">Requerido</span></li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Num Invitados</code> (Número &ge; 1) - <span className="font-semibold">Requerido</span></li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Espacio</code> (Texto: 'salon', 'jardin', 'terraza') - <span className="font-semibold">Requerido</span></li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Estado Reserva Evento</code> (Texto: 'pendiente', 'confirmada', 'pagada', 'cancelada', 'completada') - Opcional</li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Método Pago Evento</code> (Texto: 'tarjeta', 'transferencia', 'efectivo', 'pendiente') - Opcional</li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Adelanto Evento</code> (Número) - Opcional</li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Peticiones Evento</code> (Texto) - Opcional</li>
              <li className="mb-1"><code className="bg-blue-100 px-1 rounded text-blue-900 font-mono">Num Confirmación Evento</code> (Texto) - Opcional</li>
            </ul>
             <p className="mt-1 text-xs text-gray-600">Las columnas marcadas como <span className="font-semibold">Requerido</span> deben tener SIEMPRE un valor en cada fila.</p>
          </div>

          <div>
            <strong className="text-blue-800">5. Formato de Datos:</strong>
             <ul className="list-disc list-inside ml-4 mt-1">
                <li><span className="font-semibold">Fechas:</span> Usa un formato claro como DD/MM/AAAA o AAAA-MM-DD. Excel debería reconocerlo.</li>
                <li><span className="font-semibold">Horas:</span> Usa SIEMPRE el formato HH:MM (ej: 09:30, 14:00).</li>
                <li><span className="font-semibold">Números:</span> Escribe solo el número, sin símbolos (€, $, etc.). Usa el punto (.) para decimales si es necesario (ej: 125.50).</li>
                <li><span className="font-semibold">Textos con Opciones Fijas:</span> Para columnas como 'Método Pago', 'Estado Reserva', 'Espacio', etc., escribe EXACTAMENTE una de las opciones permitidas (en minúsculas).</li>
                <li><span className="font-semibold">ID o Nombre Tipo Evento:</span> Si conoces el ID interno del tipo de evento (es una cadena larga de letras y números), ponlo aquí. Si no, escribe el nombre COMPLETO y EXACTO del tipo de evento (ej: "Boda Civil", "Bautizo"). El sistema intentará encontrarlo.</li>
             </ul>
          </div>

          <div>
            <strong className="text-blue-800">6. ¡Sin Filas Vacías Raras!:</strong>
            <p className="mt-1">Asegúrate de que no haya filas completamente vacías entre tus datos.</p>
          </div>

          <div>
            <strong className="text-blue-800">Consejo Final:</strong>
            <p className="mt-1">Si tienes dudas, empieza con un archivo pequeño (2-3 filas por hoja) para probar que todo funciona antes de subir un archivo grande.</p>
          </div>

        </div>
         {/* === FIN NUEVO TEXTO INSTRUCCIONES === */}
      </div>
    </div>
  );
} 