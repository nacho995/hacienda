"use client";

import { useState, useEffect } from 'react';
import { FaUtensils, FaMusic, FaCamera, FaWineGlassAlt, FaCheck, FaChevronRight, FaTimes, FaInfoCircle, FaGlassCheers, FaChair, FaCalendarCheck } from 'react-icons/fa';
import { MdRestaurant, MdOutlineDining, MdLocalFlorist, MdOutlineRestaurant } from 'react-icons/md';
import { IoMusicalNotes } from 'react-icons/io5';
import { BsCameraVideo } from 'react-icons/bs';
import { getAllServicios, getServiciosPorEvento } from '@/services/servicios.service';
import { useReservation } from '@/context/ReservationContext';
import { toast } from 'sonner';

// Helper function to format price display
const formatPrice = (price) => {
  if (typeof price === 'object' && price !== null) {
    if (price.min && price.max) {
      return `Desde ${price.min}€ hasta ${price.max}€`; // Adjust currency/format as needed
    } else if (price.min) {
      return `Desde ${price.min}€`;
    } else if (price.max) {
      return `Hasta ${price.max}€`;
    }
    // Fallback if object format is unexpected
    return 'Precio no disponible'; 
  }
  // Return as is if it's a string or number
  return price;
};

const ModoGestionServicios = ({ onServicesSelect, tipoEvento }) => {
  const { formData, updateFormSection } = useReservation();
  const [selectedServices, setSelectedServices] = useState(formData.serviciosSeleccionados?.map(s => s?.id).filter(Boolean) || []); // Store only IDs
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [servicioDetallado, setServicioDetallado] = useState(null);

  // Estado para servicios agrupados por categorías
  const [serviciosPorCategoria, setServiciosPorCategoria] = useState({
    paquete_evento: [],
    servicio_adicional: [],
    coctel_brunch: [],
    bebidas: [],
    montaje: [],
    foto_video: [],
    coordinacion: []
  });

  // Cargar servicios desde la API
  useEffect(() => {
    const fetchServicios = async () => {
      try {
        setLoading(true);
        let response; // Rename variable
        
        if (tipoEvento) {
          // Si hay un tipo de evento seleccionado, obtener servicios recomendados
          console.log('Obteniendo servicios para evento:', tipoEvento);
          response = await getServiciosPorEvento(tipoEvento);
        } else {
          // Si no, obtener todos los servicios
          console.log('Obteniendo todos los servicios');
          response = await getAllServicios();
        }
        
        console.log('Datos recibidos de la API:', response);

        // Check if response is successful and data is an array
        let serviciosData = [];
        if (response && response.success && Array.isArray(response.data)) {
          serviciosData = response.data;
        } else if (Array.isArray(response)) { // Fallback if API directly returns array
           console.warn('La API devolvió un array directamente, usando ese array.');
           serviciosData = response;
        } else {
           console.warn('La respuesta de la API de servicios no tiene el formato esperado o falló:', response);
           // Using fallback data as before
            serviciosData = [
              {
                id: 'catering_premium',
                nombre: 'Catering Premium',
                descripcion: 'Menú gourmet personalizado con opciones para todos los gustos y necesidades dietéticas',
                precio: 'Desde €450 por persona',
                iconType: 'restaurante',
                categoria: 'servicio_adicional',
                subcategoria: 'comida',
                recomendadoPara: ['Boda', 'Evento Corporativo', 'Aniversario', 'Comunión', 'Bautizo'],
                color: '#D1B59B'
              },
              {
                id: 'decoracion_personalizada',
                nombre: 'Decoración Personalizada',
                descripcion: 'Diseño y montaje de decoración elegante adaptada al estilo de su evento',
                precio: 'Desde €3,500',
                iconType: 'decoracion',
                categoria: 'servicio_adicional',
                subcategoria: 'decoracion',
                recomendadoPara: ['Boda', 'Aniversario', 'Comunión', 'Bautizo'],
                color: '#D1B59B'
              },
              {
                id: 'musica_vivo',
                nombre: 'Música en Vivo',
                descripcion: 'Grupo musical o DJ profesional con equipo de sonido incluido',
                precio: 'Desde €2,800',
                iconType: 'musica',
                categoria: 'servicio_adicional',
                subcategoria: 'entretenimiento',
                recomendadoPara: ['Boda', 'Evento Corporativo', 'Aniversario'],
                color: '#D1B59B'
              },
              {
                id: 'foto_video',
                nombre: 'Fotografía y Video',
                descripcion: 'Servicio profesional de fotografía y videografía para capturar todos los momentos especiales',
                precio: 'Desde €1,800',
                iconType: 'camara',
                categoria: 'foto_video',
                subcategoria: 'multimedia',
                recomendadoPara: ['Boda', 'Comunión', 'Bautizo', 'Aniversario'],
                color: '#D1B59B'
              },
              {
                id: 'barra_libre',
                nombre: 'Barra Libre Premium',
                descripcion: 'Selección de bebidas premium y cócteles personalizados para su evento',
                precio: 'Desde €35 por persona',
                iconType: 'bebidas',
                categoria: 'bebidas',
                subcategoria: 'alcohol',
                recomendadoPara: ['Boda', 'Evento Corporativo', 'Aniversario'],
                color: '#D1B59B'
              },
              {
                id: 'coordinacion_evento',
                nombre: 'Coordinación del Evento',
                descripcion: 'Servicio profesional de coordinación el día del evento para asegurar que todo salga perfecto',
                precio: 'Desde €1,200',
                iconType: 'coordinacion',
                categoria: 'coordinacion',
                subcategoria: 'planificacion',
                recomendadoPara: ['Boda', 'Evento Corporativo', 'Aniversario', 'Comunión', 'Bautizo'],
                color: '#D1B59B'
              }
            ];
            console.log('Usando datos de respaldo:', serviciosData);
        }
        
        // Agrupar servicios por categoría usando serviciosData
        const serviciosAgrupados = {
          paquete_evento: [],
          servicio_adicional: [],
          coctel_brunch: [],
          bebidas: [],
          montaje: [],
          foto_video: [],
          coordinacion: []
        };
        
        serviciosData.forEach(servicio => {
          if (servicio.categoria && serviciosAgrupados[servicio.categoria]) {
            serviciosAgrupados[servicio.categoria].push(servicio);
          } else {
            // Si no tiene categoría, asumimos que es un servicio adicional
            serviciosAgrupados.servicio_adicional.push(servicio);
          }
        });
        
        setServiciosPorCategoria(serviciosAgrupados);
        setServicios(serviciosData); // Set the actual array of services
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar servicios:', err);
        setError('No se pudieron cargar los servicios. Por favor, inténtelo de nuevo más tarde.');
        setLoading(false);
        
        // Usar datos de respaldo en caso de error
        const datosRespaldo = [
          {
            id: 'catering',
            nombre: 'Catering Premium',
            descripcion: 'Menú gourmet personalizado con opciones para todos los gustos y necesidades dietéticas',
            precio: 'Desde $450 por persona',
            iconType: 'restaurante',
            categoria: 'servicio_adicional',
            subcategoria: 'comida',
            recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños', 'Ceremonia Religiosa'],
            color: '#D1B59B'
          },
          {
            id: 'decoracion',
            nombre: 'Decoración Personalizada',
            descripcion: 'Diseño y montaje de decoración elegante adaptada al estilo de su evento',
            precio: 'Desde $3,500',
            iconType: 'decoracion',
            categoria: 'servicio_adicional',
            subcategoria: 'decoracion',
            recomendadoPara: ['Boda', 'Cumpleaños', 'Ceremonia Religiosa'],
            color: '#D1B59B'
          },
          {
            id: 'musica',
            nombre: 'Música en Vivo',
            descripcion: 'Grupo musical o DJ profesional con equipo de sonido incluido',
            precio: 'Desde $2,800',
            iconType: 'musica',
            categoria: 'servicio_adicional',
            subcategoria: 'entretenimiento',
            recomendadoPara: ['Boda', 'Evento Corporativo', 'Cumpleaños'],
            color: '#D1B59B'
          }
        ];
        setServicios(datosRespaldo);
        setError(null); // Limpiar el error ya que mostramos datos de respaldo
      }
    };

    fetchServicios();
  }, [tipoEvento]);

  const toggleService = (serviceId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const servicioSeleccionado = servicios.find(s => s.id === serviceId);
    if (!servicioSeleccionado) {
      console.error('Servicio no encontrado:', serviceId);
      return;
    }

    let nuevosServiciosSeleccionados = [...selectedServices];
    const isSelected = selectedServices.includes(serviceId);

    if (isSelected) {
      // Deselecting: just remove it
      nuevosServiciosSeleccionados = nuevosServiciosSeleccionados.filter(id => id !== serviceId);
    } else {
      // Selecting: Check for single-selection categories/subcategories
      const singleSelectionCategories = ['paquete_evento', 'coctel_brunch', 'bebidas', 'montaje'];
      const singleSelectionSubcategories = ['catering']; // Assuming 'catering' is a subcategory

      const isSingleSelectionCategory = singleSelectionCategories.includes(servicioSeleccionado.categoria);
      // Check subcategory if it exists and is relevant
      const isSingleSelectionSubcategory = servicioSeleccionado.subcategoria && singleSelectionSubcategories.includes(servicioSeleccionado.subcategoria);

      if (isSingleSelectionCategory || isSingleSelectionSubcategory) {
        // Find and remove existing service of the same type before adding the new one
        const serviciosCompletosActuales = servicios.filter(s => nuevosServiciosSeleccionados.includes(s.id));

        serviciosCompletosActuales.forEach(servicioExistente => {
          // Check if existing service is of the same single-selection type as the one being added
          const isSameCategoryType = isSingleSelectionCategory && servicioExistente.categoria === servicioSeleccionado.categoria;
          const isSameSubcategoryType = isSingleSelectionSubcategory && servicioExistente.subcategoria === servicioSeleccionado.subcategoria;

          if (isSameCategoryType || isSameSubcategoryType) {
            // Remove the existing one of the same type
            nuevosServiciosSeleccionados = nuevosServiciosSeleccionados.filter(id => id !== servicioExistente.id);
             // Optionally, notify the user about the replacement
             // toast.info(`Servicio "${servicioExistente.nombre}" reemplazado por "${servicioSeleccionado.nombre}".`);
          }
        });
      }
      
      // Add the new service ID
      nuevosServiciosSeleccionados.push(serviceId);
    }

    setSelectedServices(nuevosServiciosSeleccionados);

    // Pass the full service objects back to the parent/context
    const serviciosSeleccionadosCompletos = servicios.filter(servicio =>
      nuevosServiciosSeleccionados.includes(servicio.id)
    );
    onServicesSelect(serviciosSeleccionadosCompletos); 
    // Ensure context is updated if needed (might be redundant if parent handles it via onServicesSelect)
    // updateFormSection('serviciosSeleccionados', serviciosSeleccionadosCompletos);
  };

  const handleContinue = () => {
    // Guardar servicios seleccionados (IDs or full objects depending on what parent expects)
    const serviciosCompletos = servicios.filter(s => selectedServices.includes(s.id));
    updateFormSection('serviciosSeleccionados', serviciosCompletos); // Save full objects to context
    updateFormSection('modoGestionServicios', 'usuario');
    // onServicesSelect might be redundant if context is updated directly here
    onServicesSelect(serviciosCompletos); 
  };

  // Función para mostrar detalles de un servicio
  const mostrarDetalles = (servicio) => {
    setServicioDetallado(servicio);
  };
  
  // Función para cerrar el modal de detalles
  const cerrarDetalles = () => {
    setServicioDetallado(null);
  };

  // Función para renderizar el icono correcto según el tipo
  const renderIcon = (iconType) => {
    switch(iconType) {
      case 'restaurante':
        return <MdOutlineRestaurant className="w-7 h-7 text-[var(--color-primary)]" />;
      case 'decoracion':
        return <FaChair className="w-7 h-7 text-[var(--color-primary)]" />;
      case 'musica':
        return <IoMusicalNotes className="w-7 h-7 text-[var(--color-primary)]" />;
      case 'fotografia':
        return <FaCamera className="w-7 h-7 text-[var(--color-primary)]" />;
      case 'video':
        return <BsCameraVideo className="w-7 h-7 text-[var(--color-primary)]" />;
      case 'bebidas':
        return <FaWineGlassAlt className="w-7 h-7 text-[var(--color-primary)]" />;
      case 'flores':
        return <MdLocalFlorist className="w-7 h-7 text-[var(--color-primary)]" />;
      case 'coordinacion':
        return <FaCalendarCheck className="w-7 h-7 text-[var(--color-primary)]" />;
      default:
        return <FaUtensils className="w-7 h-7 text-[var(--color-primary)]" />;
    }
  };

  // Estado para filtros
  const [filtroActivo, setFiltroActivo] = useState('paquete_evento');
  const [busqueda, setBusqueda] = useState('');
  
  // Función para filtrar servicios por categoría
  const filtrarServicios = (categoria, e) => {
    // Prevenir comportamiento por defecto para evitar que el evento se propague
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setFiltroActivo(categoria);
  };
  
  // Función para manejar la búsqueda
  const handleBusqueda = (e) => {
    // Prevenir comportamiento por defecto para evitar que el evento se propague
    e.preventDefault();
    e.stopPropagation();
    setBusqueda(e.target.value);
  };
  
  // Filtrar servicios según la búsqueda
  const filtrarPorBusqueda = (servicios) => {
    if (!busqueda) return servicios;
    
    const terminoBusqueda = busqueda.toLowerCase();
    return servicios.filter(servicio => 
      servicio.nombre.toLowerCase().includes(terminoBusqueda) ||
      servicio.descripcion.toLowerCase().includes(terminoBusqueda) ||
      (servicio.detalles && servicio.detalles.toLowerCase().includes(terminoBusqueda))
    );
  };
  
  // Obtener todas las categorías disponibles
  const categorias = [
    { id: 'paquete_evento', nombre: 'Paquetes completos' },
    { id: 'servicio_adicional', nombre: 'Servicios adicionales' },
    { id: 'coctel_brunch', nombre: 'Cóctel y brunch' },
    { id: 'montaje', nombre: 'Montaje' },
    { id: 'foto_video', nombre: 'Fotografía y video' },
    { id: 'coordinacion', nombre: 'Coordinación' }
  ];
  
  // Filtrar categorías que tienen servicios
  const categoriasFiltradas = categorias.filter(cat => {
    return serviciosPorCategoria[cat.id] && serviciosPorCategoria[cat.id].length > 0;
  });
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Nueva sección de mensaje destacado */}
      <div className="mb-8">
        <div className="bg-[#E6DCC6] p-6 rounded-lg shadow-sm border border-[#D1B59B]">
          <h2 className="text-2xl font-bold text-[#000000] mb-4">
            Explora todos nuestros servicios
          </h2>
          <p className="text-lg font-bold text-[#000000] mb-6">
            Descubre todos los detalles de nuestros servicios y encuentra las mejores opciones para tu evento.
          </p>
          <button
            onClick={() => window.open('/servicios', '_blank')}
            className="px-8 py-3 text-xl font-bold bg-[#D1B59B] text-[#000000] rounded-lg hover:bg-[#A5856A] transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Ver en detalle todos nuestros servicios
          </button>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-[#000000] mb-4">Seleccione los servicios para su evento</h2>
      
      <div className="bg-[#F9F5F0] border border-[#D1B59B] rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="text-[#A5856A] mr-3 mt-1">
            <FaInfoCircle size={20} />
          </div>
          <div>
            <h3 className="font-medium text-[#000000] mb-1">¿Cómo funciona?</h3>
            <p className="text-sm text-[#000000]">
              Hemos seleccionado los servicios más recomendados para su tipo de evento: <span className="font-medium">{typeof tipoEvento === 'object' ? (tipoEvento?.titulo || 'Evento') : (tipoEvento || 'Evento')}</span>. 
              Puede seleccionar los servicios haciendo clic en los iconos o ver más detalles con el botón de información. 
              Los servicios seleccionados aparecerán en el resumen al final de la página.
            </p>
          </div>
        </div>
      </div>
      
      {/* Filtros y búsqueda */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          {/* Filtros de categoría */}
          <div className="overflow-x-auto">
            <div className="flex space-x-2 pb-2">
              {categoriasFiltradas.map(categoria => (
                <button
                  key={categoria.id}
                  onClick={(e) => filtrarServicios(categoria.id, e)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filtroActivo === categoria.id ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {categoria.nombre}
                </button>
              ))}
            </div>
          </div>
          
          {/* Barra de búsqueda */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Buscar servicios..."
              value={busqueda}
              onChange={handleBusqueda}
              className="w-full px-4 py-2 pl-10 border border-[#D1B59B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A5856A]/50"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8A6E52]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {busqueda && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setBusqueda('');
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8A6E52] hover:text-[var(--color-primary)] transition-colors"
              >
                <FaTimes size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
      
      <p className="mb-6 font-bold text-[#000000]">
        Seleccione los servicios para su evento
      </p>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : (
        <div className="space-y-10">
          {/* Paquetes de Eventos */}
          {serviciosPorCategoria.paquete_evento.length > 0 && filtroActivo === 'paquete_evento' && (
            <div>
              <h3 className="text-xl font-bold text-[#000000] mb-4">Paquetes Completos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtrarPorBusqueda(serviciosPorCategoria.paquete_evento).map((servicio) => (
                  <div
                    key={servicio.id}
                    onClick={(e) => toggleService(servicio.id, e)}
                    className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 relative ${
                      selectedServices.includes(servicio.id)
                        ? 'bg-gradient-to-r from-[#E6DCC6] to-[#D1B59B] border-[#A5856A] text-[#0F0F0F] shadow-md'
                        : 'border-gray-200 hover:border-[var(--color-primary)]/50'
                    }`}
                  >
                    {selectedServices.includes(servicio.id) && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#A5856A] flex items-center justify-center">
                        <FaCheck className="text-white text-xs" />
                      </div>
                    )}
                    
                    <div className="flex items-center mb-4">
                      <div className="w-14 h-14 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mr-4">
                        {renderIcon(servicio.iconType)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{servicio.nombre}</h3>
                        <p className="text-sm font-medium text-[#8A6E52]">{formatPrice(servicio.precio)}</p>
                      </div>
                      <div className="ml-auto">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            mostrarDetalles(servicio);
                          }}
                          className="p-2 text-[#8A6E52] hover:text-[var(--color-primary)] transition-colors"
                        >
                          <FaInfoCircle />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {servicio.descripcion}
                    </p>
                    
                    {servicio.recomendadoPara && servicio.recomendadoPara.includes(tipoEvento) && (
                      <div className="text-xs text-[#8A6E52] mt-2 italic">
                        Recomendado para {typeof tipoEvento === 'object' ? (tipoEvento?.titulo || 'este evento') : (tipoEvento || 'este evento')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Servicios Adicionales */}
          {serviciosPorCategoria.servicio_adicional.length > 0 && filtroActivo === 'servicio_adicional' && (
            <div>
              <h3 className="text-xl font-bold text-[#000000] mb-4">Servicios Adicionales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtrarPorBusqueda(serviciosPorCategoria.servicio_adicional).map((servicio) => (
                  <div
                    key={servicio.id}
                    onClick={(e) => toggleService(servicio.id, e)}
                    className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 relative ${
                      selectedServices.includes(servicio.id)
                        ? 'bg-gradient-to-r from-[#E6DCC6] to-[#D1B59B] border-[#A5856A] text-[#0F0F0F] shadow-md'
                        : 'border-gray-200 hover:border-[var(--color-primary)]/50'
                    }`}
                  >
                    {selectedServices.includes(servicio.id) && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#A5856A] flex items-center justify-center">
                        <FaCheck className="text-white text-xs" />
                      </div>
                    )}
                    
                    <div className="flex items-center mb-4">
                      <div className="w-14 h-14 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mr-4">
                        {renderIcon(servicio.iconType)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{servicio.nombre}</h3>
                        <p className="text-sm font-medium text-[#8A6E52]">{formatPrice(servicio.precio)}</p>
                      </div>
                      <div className="ml-auto">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            mostrarDetalles(servicio);
                          }}
                          className="p-2 text-[#8A6E52] hover:text-[var(--color-primary)] transition-colors"
                        >
                          <FaInfoCircle />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {servicio.descripcion}
                    </p>
                    
                    {servicio.recomendadoPara && servicio.recomendadoPara.includes(tipoEvento) && (
                      <div className="text-xs text-[#8A6E52] mt-2 italic">
                        Recomendado para {typeof tipoEvento === 'object' ? (tipoEvento?.titulo || 'este evento') : (tipoEvento || 'este evento')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Cóctel y Brunch */}
          {serviciosPorCategoria.coctel_brunch.length > 0 && filtroActivo === 'coctel_brunch' && (
            <div>
              <h3 className="text-xl font-bold text-[#000000] mb-4">Opciones de Cóctel y Brunch</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtrarPorBusqueda(serviciosPorCategoria.coctel_brunch).map((servicio) => (
                  <div
                    key={servicio.id}
                    onClick={(e) => toggleService(servicio.id, e)}
                    className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 relative ${
                      selectedServices.includes(servicio.id)
                        ? 'bg-gradient-to-r from-[#E6DCC6] to-[#D1B59B] border-[#A5856A] text-[#0F0F0F] shadow-md'
                        : 'border-gray-200 hover:border-[var(--color-primary)]/50'
                    }`}
                  >
                    {selectedServices.includes(servicio.id) && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#A5856A] flex items-center justify-center">
                        <FaCheck className="text-white text-xs" />
                      </div>
                    )}
                    
                    <div className="flex items-center mb-4">
                      <div className="w-14 h-14 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mr-4">
                        {renderIcon(servicio.iconType)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{servicio.nombre}</h3>
                        <p className="text-sm font-medium text-[#8A6E52]">{formatPrice(servicio.precio)}</p>
                      </div>
                      <div className="ml-auto">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            mostrarDetalles(servicio);
                          }}
                          className="p-2 text-[#8A6E52] hover:text-[var(--color-primary)] transition-colors"
                        >
                          <FaInfoCircle />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {servicio.descripcion}
                    </p>
                    
                    {servicio.recomendadoPara && servicio.recomendadoPara.includes(tipoEvento) && (
                      <div className="text-xs text-[#8A6E52] mt-2 italic">
                        Recomendado para {typeof tipoEvento === 'object' ? (tipoEvento?.titulo || 'este evento') : (tipoEvento || 'este evento')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Bebidas */}
          {serviciosPorCategoria.bebidas.length > 0 && (filtroActivo === 'todos' || filtroActivo === 'bebidas') && (
            <div>
              <h3 className="text-xl font-bold text-[#000000] mb-4">Opciones de Bebidas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtrarPorBusqueda(serviciosPorCategoria.bebidas).map((servicio) => (
                  <div
                    key={servicio.id}
                    onClick={(e) => toggleService(servicio.id, e)}
                    className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 relative ${
                      selectedServices.includes(servicio.id)
                        ? 'bg-gradient-to-r from-[#E6DCC6] to-[#D1B59B] border-[#A5856A] text-[#0F0F0F] shadow-md'
                        : 'border-gray-200 hover:border-[var(--color-primary)]/50'
                    }`}
                  >
                    {selectedServices.includes(servicio.id) && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#A5856A] flex items-center justify-center">
                        <FaCheck className="text-white text-xs" />
                      </div>
                    )}
                    
                    <div className="flex items-center mb-4">
                      <div className="w-14 h-14 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mr-4">
                        {renderIcon(servicio.iconType)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{servicio.nombre}</h3>
                        <p className="text-sm font-medium text-[#8A6E52]">{formatPrice(servicio.precio)}</p>
                      </div>
                      <div className="ml-auto">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            mostrarDetalles(servicio);
                          }}
                          className="p-2 text-[#8A6E52] hover:text-[var(--color-primary)] transition-colors"
                        >
                          <FaInfoCircle />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {servicio.descripcion}
                    </p>
                    
                    {servicio.recomendadoPara && servicio.recomendadoPara.includes(tipoEvento) && (
                      <div className="text-xs text-[#8A6E52] mt-2 italic">
                        Recomendado para {typeof tipoEvento === 'object' ? (tipoEvento?.titulo || 'este evento') : (tipoEvento || 'este evento')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Montaje */}
          {serviciosPorCategoria.montaje.length > 0 && filtroActivo === 'montaje' && (
            <div>
              <h3 className="text-xl font-bold text-[#000000] mb-4">Opciones de Montaje</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtrarPorBusqueda(serviciosPorCategoria.montaje).map((servicio) => (
                  <div
                    key={servicio.id}
                    onClick={(e) => toggleService(servicio.id, e)}
                    className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 relative ${
                      selectedServices.includes(servicio.id)
                        ? 'bg-gradient-to-r from-[#E6DCC6] to-[#D1B59B] border-[#A5856A] text-[#0F0F0F] shadow-md'
                        : 'border-gray-200 hover:border-[var(--color-primary)]/50'
                    }`}
                  >
                    {selectedServices.includes(servicio.id) && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#A5856A] flex items-center justify-center">
                        <FaCheck className="text-white text-xs" />
                      </div>
                    )}
                    
                    <div className="flex items-center mb-4">
                      <div className="w-14 h-14 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mr-4">
                        {renderIcon(servicio.iconType)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{servicio.nombre}</h3>
                        <p className="text-sm font-medium text-[#8A6E52]">{formatPrice(servicio.precio)}</p>
                      </div>
                      <div className="ml-auto">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            mostrarDetalles(servicio);
                          }}
                          className="p-2 text-[#8A6E52] hover:text-[var(--color-primary)] transition-colors"
                        >
                          <FaInfoCircle />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {servicio.descripcion}
                    </p>
                    
                    {servicio.recomendadoPara && servicio.recomendadoPara.includes(tipoEvento) && (
                      <div className="text-xs text-[#8A6E52] mt-2 italic">
                        Recomendado para {typeof tipoEvento === 'object' ? (tipoEvento?.titulo || 'este evento') : (tipoEvento || 'este evento')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Fotografía y Video */}
          {serviciosPorCategoria.foto_video.length > 0 && filtroActivo === 'foto_video' && (
            <div>
              <h3 className="text-xl font-bold text-[#000000] mb-4">Fotografía y Video</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtrarPorBusqueda(serviciosPorCategoria.foto_video).map((servicio) => (
                  <div
                    key={servicio.id}
                    onClick={(e) => toggleService(servicio.id, e)}
                    className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 relative ${
                      selectedServices.includes(servicio.id)
                        ? 'bg-gradient-to-r from-[#E6DCC6] to-[#D1B59B] border-[#A5856A] text-[#0F0F0F] shadow-md'
                        : 'border-gray-200 hover:border-[var(--color-primary)]/50'
                    }`}
                  >
                    {selectedServices.includes(servicio.id) && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#A5856A] flex items-center justify-center">
                        <FaCheck className="text-white text-xs" />
                      </div>
                    )}
                    
                    <div className="flex items-center mb-4">
                      <div className="w-14 h-14 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mr-4">
                        {renderIcon(servicio.iconType)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{servicio.nombre}</h3>
                        <p className="text-sm font-medium text-[#8A6E52]">{formatPrice(servicio.precio)}</p>
                      </div>
                      <div className="ml-auto">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            mostrarDetalles(servicio);
                          }}
                          className="p-2 text-[#8A6E52] hover:text-[var(--color-primary)] transition-colors"
                        >
                          <FaInfoCircle />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {servicio.descripcion}
                    </p>
                    
                    {servicio.recomendadoPara && servicio.recomendadoPara.includes(tipoEvento) && (
                      <div className="text-xs text-[#8A6E52] mt-2 italic">
                        Recomendado para {typeof tipoEvento === 'object' ? (tipoEvento?.titulo || 'este evento') : (tipoEvento || 'este evento')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Coordinación */}
          {serviciosPorCategoria.coordinacion.length > 0 && filtroActivo === 'coordinacion' && (
            <div>
              <h3 className="text-xl font-bold text-[#000000] mb-4">Coordinación de Eventos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtrarPorBusqueda(serviciosPorCategoria.coordinacion).map((servicio) => (
                  <div
                    key={servicio.id}
                    onClick={(e) => toggleService(servicio.id, e)}
                    className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 relative ${
                      selectedServices.includes(servicio.id)
                        ? 'bg-gradient-to-r from-[#E6DCC6] to-[#D1B59B] border-[#A5856A] text-[#0F0F0F] shadow-md'
                        : 'border-gray-200 hover:border-[var(--color-primary)]/50'
                    }`}
                  >
                    {selectedServices.includes(servicio.id) && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#A5856A] flex items-center justify-center">
                        <FaCheck className="text-white text-xs" />
                      </div>
                    )}
                    
                    <div className="flex items-center mb-4">
                      <div className="w-14 h-14 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mr-4">
                        {renderIcon(servicio.iconType)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{servicio.nombre}</h3>
                        <p className="text-sm font-medium text-[#8A6E52]">{formatPrice(servicio.precio)}</p>
                      </div>
                      <div className="ml-auto">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            mostrarDetalles(servicio);
                          }}
                          className="p-2 text-[#8A6E52] hover:text-[var(--color-primary)] transition-colors"
                        >
                          <FaInfoCircle />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {servicio.descripcion}
                    </p>
                    
                    {servicio.recomendadoPara && servicio.recomendadoPara.includes(tipoEvento) && (
                      <div className="text-xs text-[#8A6E52] mt-2 italic">
                        Recomendado para {typeof tipoEvento === 'object' ? (tipoEvento?.titulo || 'este evento') : (tipoEvento || 'este evento')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de detalles del servicio */}
      {servicioDetallado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-[var(--color-primary)]">{servicioDetallado.nombre}</h2>
                <button 
                  onClick={cerrarDetalles}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="flex items-center mb-4">
                <div className="w-14 h-14 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mr-4">
                  {renderIcon(servicioDetallado.iconType)}
                </div>
                <div>
                  <p className="text-lg font-medium text-[#8A6E52]">{formatPrice(servicioDetallado.precio)}</p>
                  {servicioDetallado.duracion && (
                    <p className="text-sm text-gray-600">Duración: {servicioDetallado.duracion}</p>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-700">{servicioDetallado.descripcion}</p>
              </div>
              
              {servicioDetallado.detalles && (
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Detalles</h3>
                  <p className="text-gray-700">{servicioDetallado.detalles}</p>
                </div>
              )}
              
              {servicioDetallado.incluye && servicioDetallado.incluye.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Incluye</h3>
                  <ul className="list-disc pl-5">
                    {servicioDetallado.incluye.map((item, index) => (
                      <li key={index} className="text-gray-700">{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {servicioDetallado.preciosPorRango && servicioDetallado.preciosPorRango.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Precios por rango</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {servicioDetallado.preciosPorRango.map((rango, index) => (
                      <div key={index} className="border rounded p-2">
                        <p className="font-medium">{rango.rango}</p>
                        <p className="text-[#8A6E52]">{rango.precio}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {servicioDetallado.opciones && servicioDetallado.opciones.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Opciones disponibles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {servicioDetallado.opciones.map((opcion, index) => (
                      <div key={index} className="border rounded p-2">
                        <p className="font-medium">{opcion.nombre}</p>
                        <p className="text-[#8A6E52]">{opcion.precio}</p>
                        {opcion.descripcion && <p className="text-sm text-gray-600">{opcion.descripcion}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {servicioDetallado.requisitos && servicioDetallado.requisitos.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Requisitos</h3>
                  <ul className="list-disc pl-5">
                    {servicioDetallado.requisitos.map((req, index) => (
                      <li key={index} className="text-gray-700">{req}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {servicioDetallado.notas && servicioDetallado.notas.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Notas importantes</h3>
                  <ul className="list-disc pl-5">
                    {servicioDetallado.notas.map((nota, index) => (
                      <li key={index} className="text-gray-700">{nota}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {servicioDetallado.disponibilidad && (
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Disponibilidad</h3>
                  <p className="text-gray-700">{servicioDetallado.disponibilidad}</p>
                </div>
              )}
              
              {servicioDetallado.tiempoAnticipacion && (
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Tiempo de anticipación</h3>
                  <p className="text-gray-700">{servicioDetallado.tiempoAnticipacion}</p>
                </div>
              )}
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={(e) => {
                    toggleService(servicioDetallado.id, e);
                    cerrarDetalles();
                  }}
                  className={`px-6 py-2 rounded-md transition-colors ${selectedServices.includes(servicioDetallado.id) ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90'}`}
                >
                  {selectedServices.includes(servicioDetallado.id) ? 'Quitar selección' : 'Seleccionar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resumen de servicios seleccionados */}
      {selectedServices.length > 0 && (
        <div className="mt-10 pt-6 border-t border-[#D1B59B]">
          <h3 className="text-xl font-semibold text-[#000000] mb-4">Servicios seleccionados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {servicios.filter(s => selectedServices.includes(s.id)).map(servicio => (
              <div key={servicio.id} className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-[#D1B59B]/50 flex items-center justify-between">
                <div className='flex items-center'>
                  <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mr-3 flex-shrink-0">
                    {renderIcon(servicio.iconType)}
                  </div>
                  <div>
                    <p className="font-medium text-[#5D4B3A]">{servicio.nombre}</p>
                    <p className="text-xs text-[#8A6E52]">{formatPrice(servicio.precio)}</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => toggleService(servicio.id, e)}
                  className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-100"
                  aria-label={`Quitar ${servicio.nombre}`}
                >
                  <FaTimes size={14}/>
                </button>
              </div>
            ))}
          </div>
          <p className="text-sm text-[#000000] mt-4 italic">
            Total: {selectedServices.length} servicio(s) seleccionado(s).
          </p>
        </div>
      )}
    </div>
  );
};

export default ModoGestionServicios;