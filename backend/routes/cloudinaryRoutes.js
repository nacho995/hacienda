const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configurar multer para almacenamiento temporal
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Filtrar solo archivos de video
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de video'), false);
  }
};

// Crear directorio uploads si no existe
if (!fs.existsSync('uploads/')) {
  fs.mkdirSync('uploads/');
}

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1000 * 1024 * 1024 // 1GB
  }
});

// Ruta para subir un archivo a Cloudinary
router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }

    // Subir archivo a Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'video',
      folder: 'hacienda-videos',
      use_filename: true,
      unique_filename: true
    });

    // Eliminar archivo temporal
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'Archivo subido correctamente',
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error('Error al subir archivo a Cloudinary:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener un listado de videos
router.get('/videos', async (req, res) => {
  try {
    const result = await cloudinary.search
      .expression('folder:hacienda-videos')
      .sort_by('public_id', 'desc')
      .max_results(30)
      .execute();

    res.json(result.resources);
  } catch (error) {
    console.error('Error al obtener videos de Cloudinary:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para eliminar un archivo de Cloudinary
router.delete('/delete/:publicId', async (req, res) => {
  try {
    const publicId = req.params.publicId;
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
    res.json({
      message: 'Archivo eliminado correctamente',
      result
    });
  } catch (error) {
    console.error('Error al eliminar archivo de Cloudinary:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 