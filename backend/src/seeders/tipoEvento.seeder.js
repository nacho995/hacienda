require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const TipoEvento = require('../models/TipoEvento');
const Servicio = require('../models/Servicio');

const MONGODB_URI = process.env.MONGODB_URI;

// Asociaciones de IDs de Servicios (reales) para cada Tipo de Evento
// Revisa estas asociaciones y ajústalas si es necesario según tu lógica de negocio.
const serviciosPorTipo = {
  boda: ['catering', 'decoracion', 'musica', 'fotografia', 'video', 'bar', 'flores', 'carpas', 'tarimas'], // Servicios individuales relevantes
  'ceremonia-religiosa': ['decoracion', 'musica', 'fotografia', 'video', 'flores'], // Enfocado en ceremonia
  'evento-corporativo': ['catering', 'decoracion', 'musica', 'fotografia', 'bar', 'carpas', 'tarimas'], // Servicios comunes para corporativos
  aniversario: ['catering', 'decoracion', 'musica', 'fotografia', 'bar', 'flores', 'tacos-pastor', 'carro-churros', 'carro-papas', 'carro-shots'], // Incluye algunos adicionales
  cumpleanos: ['catering', 'decoracion', 'musica', 'fotografia', 'bar', 'tacos-pastor', 'carro-churros', 'carro-papas', 'mampara-donas', 'carro-shots'] // Enfocado en fiesta
  // Nota: Los paquetes y servicios muy específicos como 'sandalias-pantuflas' se omiten aquí,
  // asumiendo que se añaden de otra forma o no son parte de la oferta inicial del tipo de evento.
};

// Datos base de los Tipos de Evento (sin serviciosDisponibles inicialmente)
const tiposEventoData = [
  {
    id: 'boda',
    titulo: 'Boda',
    descripcion: 'Celebra tu boda en nuestros elegantes espacios con vistas panorámicas',
    imagen: '/images/eventos/boda.jpg',
    capacidad: '50-200 personas',
    precio: 'Desde $50,000',
  },
  {
    id: 'ceremonia-religiosa',
    titulo: 'Ceremonia Religiosa',
    descripcion: 'Celebra tu ceremonia religiosa en nuestra hermosa capilla o jardín',
    imagen: '/images/eventos/ceremonia-religiosa.jpg',
    capacidad: '20-150 personas',
    precio: 'Desde $30,000',
  },
  {
    id: 'evento-corporativo',
    titulo: 'Evento Corporativo',
    descripcion: 'Espacios versátiles para conferencias, reuniones y eventos empresariales',
    imagen: '/images/eventos/corporativo.jpg',
    capacidad: '20-180 personas',
    precio: 'Desde $35,000',
  },
  {
    id: 'aniversario',
    titulo: 'Aniversario',
    descripcion: 'Celebra tus momentos especiales en un entorno único y memorable',
    imagen: '/images/eventos/aniversario.jpg',
    capacidad: '30-150 personas',
    precio: 'Desde $40,000',
  },
  {
    id: 'cumpleanos',
    titulo: 'Cumpleaños',
    descripcion: 'Festeja tu cumpleaños con una celebración única y memorable',
    imagen: '/images/eventos/cumpleanos.jpg',
    capacidad: '20-100 personas',
    precio: 'Desde $25,000',
  }
];

async function seedTiposEvento() {
  try {
    // Conectar a MongoDB
    if (!MONGODB_URI) {
      throw new Error("La variable de entorno MONGODB_URI no está definida.");
    }
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado a MongoDB para seeder TipoEvento');

    // Limpiar colección TipoEvento
    await TipoEvento.deleteMany({});
    console.log('Tipos de evento existentes eliminados');

    // Asegurarse de que los servicios existan (NO los crea este seeder, asume que ya existen)
    // Obtener todos los IDs de servicios únicos que necesitamos de todas las listas
    const todosLosIdsServiciosNecesarios = [...new Set(Object.values(serviciosPorTipo).flat())];

    // Buscar en la BD los servicios que coincidan con esos IDs
    const serviciosEncontrados = await Servicio.find({ id: { $in: todosLosIdsServiciosNecesarios } }).select('_id id');

    // Crear un mapa de id (string) -> _id (ObjectId) para fácil acceso
    const mapaServiciosId = serviciosEncontrados.reduce((map, servicio) => {
      map[servicio.id] = servicio._id;
      return map;
    }, {});

    // Verificar si faltó algún servicio
    const idsEncontrados = serviciosEncontrados.map(s => s.id);
    const idsFaltantes = todosLosIdsServiciosNecesarios.filter(id => !idsEncontrados.includes(id));

    if (idsFaltantes.length > 0) {
      console.warn("ADVERTENCIA: Los siguientes IDs de servicio definidos en 'serviciosPorTipo' no fueron encontrados en la colección 'Servicio':");
      console.warn(idsFaltantes);
      console.warn("Estos servicios no serán asociados. Asegúrate de que los IDs sean correctos y los servicios existan en la BD.");
    } else {
        console.log("Todos los servicios referenciados fueron encontrados en la BD.")
    }

    // Preparar los datos finales para insertar, añadiendo los ObjectIds de los servicios
    const tiposEventoParaInsertar = tiposEventoData.map(tipoData => {
      const idsServiciosParaEsteTipo = serviciosPorTipo[tipoData.id] || []; // Obtiene la lista de IDs para este tipo de evento
      const objectIdsServicios = idsServiciosParaEsteTipo
        .map(idServicio => mapaServiciosId[idServicio]) // Busca el ObjectId correspondiente en el mapa
        .filter(objectId => objectId !== undefined); // Filtra los que no se encontraron (ya se advirtió antes)

      // Devolvemos el objeto completo con los serviciosDisponibles poblados con ObjectIds
      return {
        ...tipoData,
        serviciosDisponibles: objectIdsServicios
      };
    });

    // Insertar los nuevos tipos de evento con las referencias correctas
    const tiposEventoCreados = await TipoEvento.insertMany(tiposEventoParaInsertar);
    console.log(`${tiposEventoCreados.length} Tipos de evento creados/actualizados con servicios asociados.`);

    // Desconectar de MongoDB
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');

    process.exit(0); // Salir con éxito

  } catch (error) {
    console.error('Error al sembrar tipos de evento:', error);
    // Asegurarse de desconectar incluso si hay error
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('Desconectado de MongoDB tras error.');
    }
    process.exit(1); // Salir con código de error
  }
}

// Ejecutar la función del seeder
seedTiposEvento();
