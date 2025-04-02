# Backend para Hacienda San Carlos

Este backend proporciona servicios para subir, administrar y servir archivos multimedia a través de Cloudinary.

## Configuración

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**:
   - Copiar el archivo `.env.example` a `.env` (si no existe, crear uno nuevo)
   - Añadir las credenciales de Cloudinary:
     ```
     PORT=5000
     CLOUDINARY_CLOUD_NAME=tu_cloud_name
     CLOUDINARY_API_KEY=tu_api_key
     CLOUDINARY_API_SECRET=tu_api_secret
     ```

3. **Iniciar el servidor**:
   ```bash
   npm run dev
   ```

## Subir el video grande

Para subir el video grande a Cloudinary:

1. Asegúrate de que el servidor esté en ejecución (`npm run dev`)
2. Ejecuta el script de subida:
   ```bash
   node upload-client.js
   ```

El script subirá el archivo `frontend/public/ESPACIOS-HACIENDA-SAN-CARLOS.mp4` a Cloudinary y guardará la información en `video-info.json`.

## Integración con el frontend

Después de subir el video a Cloudinary:

1. Actualiza el ID público del video en `frontend/src/components/sections/IntroSection.jsx`:
   ```javascript
   const videoPublicId = 'el_id_generado_por_cloudinary';
   ```

2. Actualiza la variable de entorno en `frontend/.env.local`:
   ```
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu_cloud_name
   ```

3. Una vez hecho esto, puedes eliminar el archivo local grande y hacer push a GitHub sin problemas:
   ```bash
   git push
   ```

## API Endpoints

- **POST /api/cloudinary/upload**: Sube un archivo a Cloudinary
- **GET /api/cloudinary/videos**: Lista los videos almacenados
- **DELETE /api/cloudinary/delete/:publicId**: Elimina un video por su ID público 