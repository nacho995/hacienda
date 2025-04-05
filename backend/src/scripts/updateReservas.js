const mongoose = require('mongoose');
const ReservaHabitacion = require('../models/ReservaHabitacion');
const Habitacion = require('../models/Habitacion');
require('dotenv').config();

const updateReservas = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/hacienda-bodas');
    console.log('Conectado a MongoDB');

    // Obtener todas las reservas sin habitación asignada
    const reservas = await ReservaHabitacion.find({
      $or: [
        { habitacion: { $exists: false } },
        { habitacion: null }
      ]
    });

    console.log(`Encontradas ${reservas.length} reservas para actualizar`);

    // Obtener todas las habitaciones
    const habitaciones = await Habitacion.find();
    
    // Actualizar cada reserva
    for (const reserva of reservas) {
      // Encontrar una habitación del mismo tipo
      const habitacionesDelTipo = habitaciones.filter(h => h.tipo === reserva.tipoHabitacion);
      
      if (habitacionesDelTipo.length > 0) {
        // Asignar la primera habitación disponible de ese tipo
        const habitacion = habitacionesDelTipo[0];
        
        await ReservaHabitacion.findByIdAndUpdate(
          reserva._id,
          { habitacion: habitacion.nombre }
        );
        
        console.log(`Reserva ${reserva._id} actualizada con habitación ${habitacion.nombre}`);
      }
    }

    console.log('Proceso completado');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateReservas(); 