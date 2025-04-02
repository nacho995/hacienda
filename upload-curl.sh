#!/bin/bash

# Obtener credenciales del archivo .env
CLOUD_NAME=$(grep CLOUDINARY_CLOUD_NAME .env | cut -d '=' -f2)
API_KEY=$(grep CLOUDINARY_API_KEY .env | cut -d '=' -f2)
API_SECRET=$(grep CLOUDINARY_API_SECRET .env | cut -d '=' -f2)

echo "Usando credenciales de Cloudinary:"
echo "Cloud Name: $CLOUD_NAME"
echo "API Key: $API_KEY"
echo "API Secret: $API_SECRET (primeros 4 caracteres)"

# Ruta al archivo de video
VIDEO_PATH="../frontend/public/ESPACIOS-HACIENDA-SAN-CARLOS.mp4"

# Verificar que el archivo existe
if [ ! -f "$VIDEO_PATH" ]; then
  echo "Error: El archivo de video no existe en la ruta especificada: $VIDEO_PATH"
  exit 1
fi

# Tamaño del archivo en MB
FILE_SIZE=$(du -m "$VIDEO_PATH" | cut -f1)
echo "Archivo encontrado: $VIDEO_PATH"
echo "Tamaño: $FILE_SIZE MB"

echo -e "\nSubiendo directamente a Cloudinary..."
echo "Este proceso puede tardar varios minutos dependiendo del tamaño del archivo y tu conexión a Internet."

# Subir directamente a Cloudinary usando curl
TIMESTAMP=$(date +%s)
curl -X POST \
  -F "file=@$VIDEO_PATH" \
  -F "timestamp=$TIMESTAMP" \
  -F "api_key=$API_KEY" \
  -F "folder=hacienda-videos" \
  -F "resource_type=video" \
  "https://api.cloudinary.com/v1_1/$CLOUD_NAME/video/upload"

echo -e "\nProceso completado!" 