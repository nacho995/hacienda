"use client";

import { useState } from 'react';
// Importar la librería para leer Excel
import * as XLSX from 'xlsx'; 
import { useAuth } from '@/context/AuthContext';

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
  const { token } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadResult, setUploadResult] = useState(null);
  const [currentTask, setCurrentTask] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalErrorData, setModalErrorData] = useState([]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setMessage('');
    setUploadResult(null);
    setCurrentTask('');
    setShowErrorModal(false);
    setModalErrorData([]);
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
    setShowErrorModal(false);
    setModalErrorData([]);

    try {
      setCurrentTask('Leyendo archivo Excel...');
      const data = await readFileData(selectedFile);
      console.log('Datos leídos del Excel:', data);

      setCurrentTask('Enviando datos al servidor...');
      const result = await sendDataToBackend(data);
      console.log('Respuesta del servidor:', result);
      
      setUploadResult(result);

      // Combinar errores para el modal
      const allErrors = [];
      if (result.errors?.rooms?.length > 0) {
        result.errors.rooms.forEach(err => allErrors.push({ ...err, type: 'Habitación' }));
      }
      if (result.errors?.events?.length > 0) {
         result.errors.events.forEach(err => allErrors.push({ ...err, type: 'Evento' }));
      }

      // Determinar mensaje final y mostrar modal si hay errores
      if (allErrors.length > 0) {
          setMessage(`Error: Se encontraron ${allErrors.length} errores durante la importación. Ningún dato fue guardado.`);
          setModalErrorData(allErrors);
          setShowErrorModal(true);
      } else {
          setMessage('¡Archivo procesado y datos subidos con éxito!');
      }
      
      setSelectedFile(null);

    } catch (error) {
      console.error('Error en el proceso de carga:', error);
      if (error.responseJson && (error.responseJson.errors?.rooms?.length > 0 || error.responseJson.errors?.events?.length > 0)) {
          const allErrors = [];
          error.responseJson.errors.rooms?.forEach(err => allErrors.push({ ...err, type: 'Habitación' }));
          error.responseJson.errors.events?.forEach(err => allErrors.push({ ...err, type: 'Evento' }));
          setModalErrorData(allErrors);
          setShowErrorModal(true);
          setMessage(`Error: ${error.responseJson.message || 'Ocurrió un error con errores detallados.'}`);
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
    if (!token) {
      throw new Error('No estás autenticado. Por favor, inicia sesión.');
    }
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      };

      const response = await fetch('http://localhost:3001/api/admin/bulk-upload', { 
        method: 'POST',
        headers: headers,
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
        <p className="mb-4 text-gray-700 text-sm leading-relaxed">
          Selecciona un archivo Excel (.xlsx, .xls) con dos hojas obligatorias: <strong>'Habitaciones'</strong> y <strong>'Eventos'</strong>.
        </p>
        <ul className="list-disc list-inside space-y-2 mb-4 text-sm text-gray-600">
            <li>La hoja <strong>'Habitaciones'</strong> debe contener únicamente reservas de habitaciones de hotel <strong>independientes</strong> (que NO forman parte de un evento listado en la otra hoja).</li>
            <li>La hoja <strong>'Eventos'</strong> es para registrar los eventos principales. Si un evento incluye habitaciones reservadas como parte del paquete (ej: habitaciones 7 a 14 para una boda), debes especificar las letras de esas habitaciones en la columna <strong>'Habitación'</strong> de la fila del evento correspondiente (separadas por comas si son varias, ej: "F, G, H"). <strong>No añadas estas habitaciones de evento a la hoja 'Habitaciones'.</strong></li>
            <li>El sistema creará automáticamente las reservas para las habitaciones especificadas en la hoja 'Eventos' y las <strong>enlazará</strong> al evento principal. Esto permite gestionarlas conjuntamente (ej: asignar el evento completo a un administrador).</li>
        </ul>
        
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

      {/* Instrucciones Simplificadas */} 
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 shadow-sm">
        <h2 className="font-semibold mb-3 text-lg text-blue-900">Cómo Preparar tu Excel para Subirlo</h2>

        <p className="mb-4 text-sm">Sigue estos 3 pasos clave para que tu archivo Excel funcione aquí:</p>

        <div className="space-y-5 text-sm">
          {/* PASO 1: Nombres de Hojas */}
          <div>
            <strong className="text-blue-800 block mb-1"><span className="inline-flex items-center justify-center bg-blue-600 text-white rounded-full w-5 h-5 mr-2 text-xs font-bold">1</span>Nombres de las Hojas:</strong>
            <p className="ml-7">Tu archivo Excel DEBE tener exactamente dos hojas. Ni más, ni menos.</p>
            <ul className="list-none ml-7 mt-1 space-y-1">
              <li>➡️ La primera hoja tiene que llamarse <strong className="font-semibold">Habitaciones</strong> (¡Ojo con la H mayúscula!)</li>
              <li>➡️ La segunda hoja tiene que llamarse <strong className="font-semibold">Eventos</strong> (¡Ojo con la E mayúscula!)</li>
            </ul>
             <p className="ml-7 mt-1 text-xs text-gray-600">Si los nombres no son EXACTOS, no funcionará.</p>
          </div>

          {/* PASO 2: Encabezados */}
          <div>
            <strong className="text-blue-800 block mb-1"><span className="inline-flex items-center justify-center bg-blue-600 text-white rounded-full w-5 h-5 mr-2 text-xs font-bold">2</span>Títulos de Columna (Encabezados):</strong>
            <p className="ml-7">La <strong className="font-semibold">primera fila</strong> de cada hoja debe contener los títulos EXACTOS de las columnas que te indicamos abajo. ¡No cambies ni una letra!</p>
            <p className="ml-7 mt-1 text-xs text-gray-600">Puedes copiar y pegar los nombres para no equivocarte. El orden de las columnas no importa.</p>
          </div>

          {/* PASO 3: Contenido */}
          <div>
             <strong className="text-blue-800 block mb-1"><span className="inline-flex items-center justify-center bg-blue-600 text-white rounded-full w-5 h-5 mr-2 text-xs font-bold">3</span>Contenido de las Columnas:</strong>
             <div className="ml-7 mt-2 space-y-4">
                {/* Habitaciones */}
                <div>
                    <p className="font-medium text-blue-700 mb-1">Hoja "Habitaciones":</p>
                    {/* Usar columns-1 sm:columns-2 para mejor distribución en pantallas anchas */}
                    <ul className="list-disc list-inside space-y-1 columns-1 sm:columns-2 gap-x-6">
                      {/* Obligatorios */}
                      <li><strong className="font-semibold">Habitación</strong> (Texto - La LETRA exacta: A, B, K, etc.) - <span className="text-red-600 font-medium">Obligatorio</span></li>
                      <li><strong className="font-semibold">Tipo Habitación</strong> (Texto - Nombre descriptivo, ej: "Sencilla", "Doble", "Doble con balcón") - <span className="text-red-600 font-medium">Obligatorio</span></li>
                      <li><strong className="font-semibold">Fecha Entrada</strong> (Fecha - ej: 01/12/2024) - <span className="text-red-600 font-medium">Obligatorio</span></li>
                      <li><strong className="font-semibold">Fecha Salida</strong> (Fecha - posterior a Entrada) - <span className="text-red-600 font-medium">Obligatorio</span></li>
                      <li><strong className="font-semibold">Precio Total</strong> (Número - ej: 250.50) - <span className="text-red-600 font-medium">Obligatorio</span></li>
                      {/* Opcionales */}
                      <li>Nombre Contacto (Texto) - <span className="text-gray-500">Opcional</span></li>
                      <li>Apellidos Contacto (Texto) - <span className="text-gray-500">Opcional</span></li>
                      <li>Email Contacto (Email - ej: mail@ejemplo.com) - <span className="text-gray-500">Opcional</span></li>
                      <li>Teléfono Contacto (Texto o Número) - <span className="text-gray-500">Opcional</span></li>
                      <li>Fecha Reserva (Fecha) - <span className="text-gray-500">Opcional</span></li>
                      <li>Método Pago (Texto - 'efectivo', 'tarjeta', etc.) - <span className="text-gray-500">Opcional</span></li>
                      <li>Estado Pago (Texto - 'pendiente', 'completado', etc.) - <span className="text-gray-500">Opcional</span></li>
                      <li>Estado Reserva (Texto - 'pendiente', 'confirmada', etc.) - <span className="text-gray-500">Opcional</span></li>
                      <li>Categoría (Texto - 'sencilla' o 'doble'. Usado para filtros internos) - <span className="text-gray-500">Opcional</span></li>
                      <li>Huéspedes (Número - ej: 2) - <span className="text-gray-500">Opcional</span></li>
                      <li>Nombre Huéspedes (Texto - nombres completos) - <span className="text-gray-500">Opcional</span></li>
                      <li>Notas (Texto - cualquier detalle extra) - <span className="text-gray-500">Opcional</span></li>
                      <li>Precio Noche (Número - ej: 120.50) - <span className="text-gray-500">Opcional</span></li>
                      <li>Num Confirmación Hab (Texto - código de confirmación) - <span className="text-gray-500">Opcional</span></li>
                    </ul>
                    <p className="mt-1 text-xs text-gray-600">(<span className="text-red-600 font-medium">Obligatorio</span> significa que la casilla NO puede estar vacía).</p>
                </div>
                {/* Eventos */}
                <div>
                    <p className="font-medium text-blue-700 mb-1">Hoja "Eventos":</p>
                    {/* Usar columns-1 sm:columns-2 para mejor distribución */}
                     <ul className="list-disc list-inside space-y-1 columns-1 sm:columns-2 gap-x-6">
                        {/* Obligatorios */}
                        <li><strong className="font-semibold">Nombre Contacto</strong> (Texto) - <span className="text-red-600 font-medium">Obligatorio</span></li>
                        <li><strong className="font-semibold">Apellidos Contacto</strong> (Texto) - <span className="text-red-600 font-medium">Obligatorio</span></li>
                        <li><strong className="font-semibold">Email Contacto</strong> (Email - ej: mail@ejemplo.com) - <span className="text-red-600 font-medium">Obligatorio</span></li>
                        <li><strong className="font-semibold">Teléfono Contacto</strong> (Texto o Número) - <span className="text-red-600 font-medium">Obligatorio</span></li>
                        <li><strong className="font-semibold">Fecha Evento</strong> (Fecha - ej: 05/10/2024) - <span className="text-red-600 font-medium">Obligatorio</span></li>
                        <li><strong className="font-semibold">Precio Evento</strong> (Número - ej: 1500) - <span className="text-red-600 font-medium">Obligatorio</span></li>
                        <li><strong className="font-semibold">ID o Nombre Tipo Evento</strong> (Texto - ej: "Boda", "Aniversario", "Evento Corporativo", "Ceremonia Religiosa", "Cumpleaños" o el ID) - <span className="text-red-600 font-medium">Obligatorio</span></li>
                        <li><strong className="font-semibold">Nombre Evento</strong> (Texto - ej: "Boda Juan y María") - <span className="text-red-600 font-medium">Obligatorio</span></li>
                        <li><strong className="font-semibold">Hora Inicio</strong> (Hora - formato HH:MM, ej: 09:30) - <span className="text-red-600 font-medium">Obligatorio</span></li>
                        <li><strong className="font-semibold">Hora Fin</strong> (Hora - HH:MM, posterior a inicio) - <span className="text-red-600 font-medium">Obligatorio</span></li>
                        <li><strong className="font-semibold">Num Invitados</strong> (Número - ej: 50) - <span className="text-red-600 font-medium">Obligatorio</span></li>
                        <li><strong className="font-semibold">Habitación</strong> (Texto - Letras de habitaciones incluidas en el evento, separadas por coma si son varias, ej: "F, G, H") - <span className="text-red-600 font-medium">Obligatorio</span></li>
                        {/* Mover Habitación aquí */}
                        {/* Opcionales */}
                        <li>Estado Reserva Evento (Texto - 'pendiente', 'confirmada', etc.) - <span className="text-gray-500">Opcional</span></li>
                        <li>Método Pago Evento (Texto - 'tarjeta', 'transferencia', etc.) - <span className="text-gray-500">Opcional</span></li>
                        <li>Adelanto Evento (Número - ej: 500) - <span className="text-gray-500">Opcional</span></li>
                        <li>Peticiones Evento (Texto - detalles especiales) - <span className="text-gray-500">Opcional</span></li>
                        <li>Num Confirmación Evento (Texto - código de confirmación) - <span className="text-gray-500">Opcional</span></li>
                    </ul>
                    <p className="mt-1 text-xs text-gray-600">(<span className="text-red-600 font-medium">Obligatorio</span> significa que la casilla NO puede estar vacía).</p>
                </div>
                 {/* Formato Datos */}
                 <div>
                    <p className="font-medium text-blue-700 mb-1">Formato de los Datos:</p>
                     <ul className="list-disc list-inside ml-4 mt-1">
                        <li><span className="font-semibold">Fechas:</span> Normal, como DD/MM/AAAA o AAAA-MM-DD.</li>
                        <li><span className="font-semibold">Horas:</span> Siempre dos dígitos para hora y minutos, con dos puntos en medio (HH:MM), como 14:00 o 08:30.</li>
                        <li><span className="font-semibold">Números:</span> Solo el número, sin símbolos (€, $, etc.). Para decimales, usa punto (.) como en 99.95.</li>
                        <li><span className="font-semibold">Textos específicos</span> (como Método Pago, Estado): Escribe exactamente una de las opciones permitidas (en minúsculas si se indica).</li>
                     </ul>
                </div>
             </div>
          </div>

          {/* CONSEJO */}
          <div>
            <strong className="text-blue-800 block mb-1">⭐ Consejo Extra:</strong>
            <p className="ml-7">Si es la primera vez o tienes muchas filas, <strong className="font-semibold">prueba subiendo un archivo con solo 2 o 3 filas</strong> en cada hoja para ver si funciona bien antes de subir el archivo completo.</p>
          </div>
        </div>
      </div>

      {/* Modal de Errores */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                 <h2 className="text-xl font-semibold text-red-700">Errores Encontrados en el Archivo</h2>
                 <button 
                   onClick={() => setShowErrorModal(false)}
                   className="text-gray-400 hover:text-gray-600 text-2xl"
                 >
                   &times; {/* Símbolo de cierre */}
                 </button>
             </div>
            {/* Reutilizamos ErrorTable aquí, pasando los errores combinados */}
            {/* Pasamos un 'type' genérico o podríamos adaptar ErrorTable */} 
            <ErrorTable errors={modalErrorData} type="combined" /> 
            <div className="mt-6 text-right">
                <button 
                  onClick={() => setShowErrorModal(false)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Cerrar
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
} 