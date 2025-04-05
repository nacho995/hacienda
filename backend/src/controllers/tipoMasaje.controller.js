const TipoMasaje = require('../models/TipoMasaje');

// Obtener todos los tipos de masaje
exports.getTiposMasaje = async (req, res) => {
  try {
    const tiposMasaje = await TipoMasaje.find({ activo: true });
    res.json(tiposMasaje);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear nuevo tipo de masaje
exports.createTipoMasaje = async (req, res) => {
  try {
    const { id, titulo, descripcion, duracion, precio } = req.body;
    
    const tipoMasaje = new TipoMasaje({
      id,
      titulo,
      descripcion,
      duracion,
      precio,
      activo: true
    });

    const nuevoTipoMasaje = await tipoMasaje.save();
    res.status(201).json(nuevoTipoMasaje);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Actualizar tipo de masaje
exports.updateTipoMasaje = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, duracion, precio, activo } = req.body;

    const tipoMasaje = await TipoMasaje.findById(id);
    if (!tipoMasaje) {
      return res.status(404).json({ message: 'Tipo de masaje no encontrado' });
    }

    tipoMasaje.titulo = titulo || tipoMasaje.titulo;
    tipoMasaje.descripcion = descripcion || tipoMasaje.descripcion;
    tipoMasaje.duracion = duracion || tipoMasaje.duracion;
    tipoMasaje.precio = precio || tipoMasaje.precio;
    tipoMasaje.activo = activo !== undefined ? activo : tipoMasaje.activo;

    const tipoMasajeActualizado = await tipoMasaje.save();
    res.json(tipoMasajeActualizado);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Eliminar tipo de masaje (soft delete)
exports.deleteTipoMasaje = async (req, res) => {
  try {
    const { id } = req.params;
    const tipoMasaje = await TipoMasaje.findById(id);
    
    if (!tipoMasaje) {
      return res.status(404).json({ message: 'Tipo de masaje no encontrado' });
    }

    tipoMasaje.activo = false;
    await tipoMasaje.save();
    
    res.json({ message: 'Tipo de masaje eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 