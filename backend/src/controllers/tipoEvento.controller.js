const TipoEvento = require('../models/TipoEvento');

// Obtener todos los tipos de eventos activos
exports.getTiposEvento = async (req, res) => {
  try {
    const tiposEvento = await TipoEvento.find({ activo: true });
    res.json(tiposEvento);
  } catch (error) {
    console.error('Error al obtener tipos de evento:', error);
    res.status(500).json({ message: 'Error al obtener tipos de evento' });
  }
};

// Crear un nuevo tipo de evento
exports.createTipoEvento = async (req, res) => {
  try {
    const { id, titulo, descripcion, imagen, capacidad, precio, serviciosDisponibles } = req.body;
    
    const nuevoTipoEvento = new TipoEvento({
      id,
      titulo,
      descripcion,
      imagen,
      capacidad,
      precio,
      serviciosDisponibles
    });
    
    await nuevoTipoEvento.save();
    res.status(201).json(nuevoTipoEvento);
  } catch (error) {
    console.error('Error al crear tipo de evento:', error);
    res.status(500).json({ message: 'Error al crear tipo de evento' });
  }
};

// Actualizar un tipo de evento
exports.updateTipoEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const tipoEvento = await TipoEvento.findOneAndUpdate(
      { id: id },
      req.body,
      { new: true }
    );
    
    if (!tipoEvento) {
      return res.status(404).json({ message: 'Tipo de evento no encontrado' });
    }
    
    res.json(tipoEvento);
  } catch (error) {
    console.error('Error al actualizar tipo de evento:', error);
    res.status(500).json({ message: 'Error al actualizar tipo de evento' });
  }
};

// Eliminar un tipo de evento (soft delete)
exports.deleteTipoEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const tipoEvento = await TipoEvento.findOneAndUpdate(
      { id: id },
      { activo: false },
      { new: true }
    );
    
    if (!tipoEvento) {
      return res.status(404).json({ message: 'Tipo de evento no encontrado' });
    }
    
    res.json({ message: 'Tipo de evento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar tipo de evento:', error);
    res.status(500).json({ message: 'Error al eliminar tipo de evento' });
  }
}; 