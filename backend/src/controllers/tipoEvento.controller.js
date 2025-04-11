const TipoEvento = require('../models/TipoEvento');
const Servicio = require('../models/Servicio');
const mongoose = require('mongoose');

// Obtener todos los tipos de eventos activos
exports.getTiposEvento = async (req, res) => {
  try {
    const tiposEvento = await TipoEvento.find({ activo: true })
      .populate({ 
          path: 'serviciosDisponibles',
          select: '_id'
      })
      .sort({ titulo: 1 });

    res.status(200).json({
      success: true,
      data: tiposEvento
    });
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

/**
 * Obtener todos los servicios asociados a un tipo de evento específico.
 * Utiliza populate para cargar los documentos Servicio completos.
 */
exports.getServiciosDeTipoEvento = async (req, res) => {
  // console.log(`---> Entrando a getServiciosDeTipoEvento para ID: ${req.params.id}`); // Log de debug eliminado
  try {
    const tipoEventoId = req.params.id;

    // 1. Buscar el TipoEvento por su _id y popular los servicios asociados
    const tipoEventoConServicios = await TipoEvento.findById(tipoEventoId)
                                             .populate('serviciosDisponibles'); // <-- USAR POPULATE

    if (!tipoEventoConServicios) {
      // console.warn(`Tipo de evento no encontrado para ID: ${tipoEventoId}`); // Log de debug eliminado
      return res.status(404).json({ success: false, message: 'Tipo de evento no encontrado' });
    }

    // 2. Los servicios ya están poblados en tipoEventoConServicios.serviciosDisponibles
    const servicios = tipoEventoConServicios.serviciosDisponibles || [];
    // console.log(`Servicios poblados encontrados: ${servicios.length}`); // Log de debug eliminado

    // 3. Devolver el array de objetos Servicio completos
    res.status(200).json({ success: true, data: servicios });

  } catch (error) {
    console.error(`Error al obtener servicios para tipo de evento ${req.params.id}:`, error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};

// --- Funciones para añadir/eliminar servicios (Revisar si funcionan con ObjectIds) ---

/**
 * Añadir un servicio a un tipo de evento.
 * Espera el ObjectId del servicio en el body.
 */
exports.addServicioATipoEvento = async (req, res) => {
    const { tipoEventoId } = req.params;
    const { servicioId } = req.body; // Espera el ObjectId del servicio

    if (!mongoose.Types.ObjectId.isValid(tipoEventoId) || !mongoose.Types.ObjectId.isValid(servicioId)) {
        return res.status(400).json({ success: false, message: 'IDs inválidos proporcionados.' });
    }

    try {
        // Verificar que ambos existan
        const tipoEvento = await TipoEvento.findById(tipoEventoId);
        const servicio = await Servicio.findById(servicioId);

        if (!tipoEvento || !servicio) {
            return res.status(404).json({ success: false, message: 'Tipo de evento o Servicio no encontrado.' });
        }

        // Añadir el ObjectId del servicio si no está ya presente
        const updateResult = await TipoEvento.updateOne(
            { _id: tipoEventoId },
            { $addToSet: { serviciosDisponibles: servicioId } } // $addToSet evita duplicados
        );

        if (updateResult.nModified === 0 && !tipoEvento.serviciosDisponibles.includes(servicioId)) {
           // Si no se modificó pero tampoco estaba, podría haber un problema raro
           console.warn(`addServicioATipoEvento: No se modificó ${tipoEventoId} pero ${servicioId} no estaba.`);
        } else if (updateResult.nModified > 0) {
           console.log(`Servicio ${servicioId} añadido a TipoEvento ${tipoEventoId}`);
        }

        // Devolver el tipo de evento actualizado (opcional, requiere volver a buscar o confiar)
        // Para simplificar, solo devolvemos éxito
        res.status(200).json({ success: true, message: 'Servicio añadido correctamente.' });

    } catch (error) {
        console.error('Error añadiendo servicio a tipo de evento:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

/**
 * Eliminar un servicio de un tipo de evento.
 * Espera el ObjectId del servicio como parámetro en la URL.
 */
exports.removeServicioDeTipoEvento = async (req, res) => {
    const { tipoEventoId, servicioId } = req.params; // servicioId debe ser ObjectId

    if (!mongoose.Types.ObjectId.isValid(tipoEventoId) || !mongoose.Types.ObjectId.isValid(servicioId)) {
        return res.status(400).json({ success: false, message: 'IDs inválidos proporcionados.' });
    }

    try {
        // Usar $pull para quitar el ObjectId del array
        const updateResult = await TipoEvento.updateOne(
            { _id: tipoEventoId },
            { $pull: { serviciosDisponibles: servicioId } }
        );

        if (updateResult.nModified > 0) {
            console.log(`Servicio ${servicioId} eliminado de TipoEvento ${tipoEventoId}`);
            res.status(200).json({ success: true, message: 'Servicio eliminado correctamente.' });
        } else {
            // Puede que el servicio no estuviera asociado o el tipo de evento no exista
            console.log(`removeServicioDeTipoEvento: No se modificó ${tipoEventoId}, puede que ${servicioId} no estuviera asociado.`);
            // Verificamos si el tipo de evento existe para dar un mensaje más preciso
            const tipoEventoExists = await TipoEvento.findById(tipoEventoId).select('_id');
            if (!tipoEventoExists) {
                 return res.status(404).json({ success: false, message: 'Tipo de evento no encontrado.' });
            }
            // Si el tipo existe pero no se modificó, el servicio no estaba
            res.status(404).json({ success: false, message: 'Servicio no encontrado en este tipo de evento.' });
        }

    } catch (error) {
        console.error('Error eliminando servicio de tipo de evento:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
}; 