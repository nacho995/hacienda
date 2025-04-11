#!/bin/bash

# Nombre del archivo zip de salida
ZIP_FILENAME="backend-deploy.zip"
# Directorio del backend relativo al script
BACKEND_DIR="backend"
# Ruta al archivo zip de salida (en el directorio raíz del workspace)
OUTPUT_ZIP_PATH="../$ZIP_FILENAME"

# --- Inicio del Script ---

# 1. Navegar al directorio del backend
echo "Navegando al directorio '$BACKEND_DIR'..."
cd "$BACKEND_DIR" || { echo "Error: No se pudo encontrar el directorio '$BACKEND_DIR'. Asegúrate de ejecutar este script desde la raíz de tu proyecto."; exit 1; }

# 2. Eliminar zip anterior si existe (opcional, para evitar añadir al existente)
if [ -f "$OUTPUT_ZIP_PATH" ]; then
  echo "Eliminando archivo zip anterior: $ZIP_FILENAME"
  rm "$OUTPUT_ZIP_PATH"
fi

# 3. Crear el nuevo archivo zip desde dentro del directorio backend
echo "Creando '$ZIP_FILENAME' en el directorio superior..."
# El comando 'zip -r ../archivo.zip .' zipea el contenido del directorio actual (.)
# y lo guarda en 'archivo.zip' en el directorio padre (../)
# Usamos -x para excluir patrones
zip -r "$OUTPUT_ZIP_PATH" . -x "node_modules/*" "*.env*" ".git/*" ".gitignore" "*.zip" ".vscode/*" "dist/*" "build/*"

# 4. Verificar si el zip se creó correctamente
if [ $? -eq 0 ]; then
  echo "-----------------------------------------------------"
  echo "¡Archivo zip '$ZIP_FILENAME' creado exitosamente!"
  echo "Ubicación: $(cd .. && pwd)/$ZIP_FILENAME"
  echo "Puedes subir este archivo a AWS Elastic Beanstalk."
  echo "-----------------------------------------------------"
else
  echo "Error: Falló la creación del archivo zip."
  cd .. # Volver al directorio original antes de salir
  exit 1
fi

# 5. Volver al directorio original
echo "Volviendo al directorio original..."
cd ..

exit 0