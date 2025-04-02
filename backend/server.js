const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cloudinaryRoutes = require('./routes/cloudinaryRoutes');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/cloudinary', cloudinaryRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.send('API de Hacienda San Carlos funcionando correctamente');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
}); 