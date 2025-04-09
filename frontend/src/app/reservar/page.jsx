"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FaUserFriends, FaCalendarAlt, FaHotel, FaChevronRight, FaBirthdayCake, FaBed, FaUserCog, FaUtensils, FaMusic, FaCamera, FaWineGlassAlt, FaCheck } from 'react-icons/fa';
import WizardSteps from '@/components/reservas/WizardSteps';
import EventDateSelector from '@/components/reservas/EventDateSelector';
import EventoMapaHabitaciones from '@/components/reservas/EventoMapaHabitaciones';
import ModoGestionHabitaciones from '@/components/reservas/ModoGestionHabitaciones';
import { createEventoReservation, checkEventoAvailability } from '@/services/reservationService';
import ErrorModal from '@/components/ui/ErrorModal';

// Importar componentes de layout
import NavbarReservar from '@/components/layout/NavbarReservar';
import Footer from '@/components/layout/Footer';

export default function ReservarPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    tipoEvento: '',
    fechaEvento: null,
    totalHabitaciones: 7,
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    mensaje: '',
    habitaciones: [],
    modoGestionHabitaciones: '', // 'usuario' o 'hacienda'
    servicios: [] // Array de servicios seleccionados
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ show: false, message: '' });

  const handleRoomsChange = (rooms) => {
    setFormData({
      ...formData,
      habitaciones: rooms,
      totalHabitaciones: rooms.length
    });
  };

  // Definición de servicios disponibles agrupados por categorías
  const serviciosDisponibles = {
    banquetes: [
      { id: 'banquete_basico', nombre: 'Banquete Básico', descripcion: 'Menú de 3 tiempos con opciones tradicionales', precio: 'Desde $350 por persona' },
      { id: 'banquete_premium', nombre: 'Banquete Premium', descripcion: 'Menú gourmet de 4 tiempos con opciones internacionales', precio: 'Desde $550 por persona' },
      { id: 'barra_libre_platinum', nombre: 'Barra Libre Platinum', descripcion: 'Incluye ron, brandy, tequila, vodka, whiskey, ginebra y cerveza', precio: 'Desde $250 por persona' },
      { id: 'barra_libre_oro', nombre: 'Barra Libre Oro', descripcion: 'Incluye licores premium y cocteles especiales', precio: 'Desde $350 por persona' }
    ],
    montaje: [
      { id: 'montaje_incluido', nombre: 'Montaje Incluido', descripcion: 'Sillas, mesas, mantelería, cristalería y cubiertos básicos', precio: 'Incluido en paquete básico' },
      { id: 'montaje_premium', nombre: 'Montaje Premium', descripcion: 'Mesas de cristal o mármol, sillas especiales y cubiertos premium', precio: 'Desde $5,000 adicionales' }
    ],
    fotografia: [
      { id: 'foto_basico', nombre: 'Paquete Fotográfico Básico', descripcion: 'Cobertura del evento con 1 fotógrafo, 300 fotos editadas', precio: 'Desde $8,000' },
      { id: 'foto_premium', nombre: 'Paquete Fotográfico Premium', descripcion: '2 fotógrafos, 500 fotos editadas, álbum impreso y sesión pre-boda', precio: 'Desde $15,000' },
      { id: 'video', nombre: 'Video del Evento', descripcion: 'Video editado de 15-20 minutos con los mejores momentos', precio: 'Desde $10,000' }
    ],
    adicionales: [
      { id: 'dj', nombre: 'DJ Profesional', descripcion: 'DJ con equipo completo de audio e iluminación', precio: 'Desde $8,000' },
      { id: 'musica_vivo', nombre: 'Música en Vivo', descripcion: 'Mariachi, banda, saxofonista, trío o marimba', precio: 'Desde $5,000' },
      { id: 'tacos', nombre: 'Taquiza', descripcion: 'Servicio de tacos al pastor para la hora de la fiesta', precio: 'Desde $80 por persona' },
      { id: 'churros', nombre: 'Carro de Churros', descripcion: 'Churros recién hechos con diferentes opciones de relleno', precio: 'Desde $3,000' },
      { id: 'cabina_fotos', nombre: 'Cabina de Fotos', descripcion: 'Cabina fotográfica con props y recuerdos impresos', precio: 'Desde $4,500' },
      { id: 'cotillon', nombre: 'Cotillón para Fiesta', descripcion: 'Accesorios divertidos para animar la pista de baile', precio: 'Desde $2,500' }
    ],
    coordinacion: [
      { id: 'wedding_planner', nombre: 'Wedding Planner', descripcion: 'Coordinación completa antes y durante el evento', precio: 'Desde $15,000' },
      { id: 'coordinador_dia', nombre: 'Coordinador del Día', descripcion: 'Coordinación solo el día del evento', precio: 'Desde $5,000' },
      { id: 'tramites', nombre: 'Asistencia en Trámites', descripcion: 'Ayuda con trámites civiles y/o religiosos', precio: 'Desde $3,000' }
    ]
  };

  const steps = [
    {
      title: 'Tipo de Evento',
      description: 'Seleccione el tipo de evento que desea celebrar',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-4">
            ¿Qué tipo de evento desea celebrar?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              onClick={() => setFormData({ ...formData, tipoEvento: 'Boda' })}
              className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                formData.tipoEvento === 'Boda'
                  ? 'bg-[#F8E8E0] border-[var(--color-primary)] shadow-md'
                  : 'hover:bg-gray-50 border-gray-200'
              }`}
            >
              <div className={`flex items-center justify-center w-16 h-16 rounded-full mb-4 ${formData.tipoEvento === 'Boda' ? 'bg-white' : 'bg-[var(--color-primary)]/10'}`}>
                <FaUserFriends className={`w-8 h-8 ${formData.tipoEvento === 'Boda' ? 'text-[var(--color-primary)]' : 'text-[var(--color-primary)]'}`} />
              </div>
              <h3 className={`text-lg font-bold ${formData.tipoEvento === 'Boda' ? 'text-black' : ''}`}>Bodas</h3>
              <p className={`mt-2 ${formData.tipoEvento === 'Boda' ? 'text-black font-medium' : 'text-gray-600'}`}>
                Celebraciones íntimas o grandes bodas con todo lo necesario para un día inolvidable
              </p>
            </div>
            
            <div
              onClick={() => setFormData({ ...formData, tipoEvento: 'Ceremonia Religiosa' })}
              className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                formData.tipoEvento === 'Ceremonia Religiosa'
                  ? 'bg-[#F8E8E0] border-[var(--color-primary)] shadow-md'
                  : 'hover:bg-gray-50 border-gray-200'
              }`}
            >
              <div className={`flex items-center justify-center w-16 h-16 rounded-full mb-4 ${formData.tipoEvento === 'Ceremonia Religiosa' ? 'bg-white' : 'bg-[var(--color-primary)]/10'}`}>
                <FaCalendarAlt className={`w-8 h-8 ${formData.tipoEvento === 'Ceremonia Religiosa' ? 'text-[var(--color-primary)]' : 'text-[var(--color-primary)]'}`} />
              </div>
              <h3 className={`text-lg font-bold ${formData.tipoEvento === 'Ceremonia Religiosa' ? 'text-black' : ''}`}>Ceremonias Religiosas</h3>
              <p className={`mt-2 ${formData.tipoEvento === 'Ceremonia Religiosa' ? 'text-black font-medium' : 'text-gray-600'}`}>
                Espacios adecuados para ceremonias religiosas con la serenidad y privacidad necesarias
              </p>
            </div>
            
            <div
              onClick={() => setFormData({ ...formData, tipoEvento: 'Evento Corporativo' })}
              className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                formData.tipoEvento === 'Evento Corporativo'
                  ? 'bg-[#F8E8E0] border-[var(--color-primary)] shadow-md'
                  : 'hover:bg-gray-50 border-gray-200'
              }`}
            >
              <div className={`flex items-center justify-center w-16 h-16 rounded-full mb-4 ${formData.tipoEvento === 'Evento Corporativo' ? 'bg-white' : 'bg-[var(--color-primary)]/10'}`}>
                <FaHotel className={`w-8 h-8 ${formData.tipoEvento === 'Evento Corporativo' ? 'text-[var(--color-primary)]' : 'text-[var(--color-primary)]'}`} />
              </div>
              <h3 className={`text-lg font-bold ${formData.tipoEvento === 'Evento Corporativo' ? 'text-black' : ''}`}>Eventos Corporativos</h3>
              <p className={`mt-2 ${formData.tipoEvento === 'Evento Corporativo' ? 'text-black font-medium' : 'text-gray-600'}`}>
                Espacios modernos y equipados para reuniones de negocio, presentaciones y conferencias
              </p>
            </div>
            
            <div
              onClick={() => setFormData({ ...formData, tipoEvento: 'Cumpleaños' })}
              className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                formData.tipoEvento === 'Cumpleaños'
                  ? 'bg-[#F8E8E0] border-[var(--color-primary)] shadow-md'
                  : 'hover:bg-gray-50 border-gray-200'
              }`}
            >
              <div className={`flex items-center justify-center w-16 h-16 rounded-full mb-4 ${formData.tipoEvento === 'Cumpleaños' ? 'bg-white' : 'bg-[var(--color-primary)]/10'}`}>
                <FaBirthdayCake className={`w-8 h-8 ${formData.tipoEvento === 'Cumpleaños' ? 'text-[var(--color-primary)]' : 'text-[var(--color-primary)]'}`} />
              </div>
              <h3 className={`text-lg font-bold ${formData.tipoEvento === 'Cumpleaños' ? 'text-black' : ''}`}>Cumpleaños</h3>
              <p className={`mt-2 ${formData.tipoEvento === 'Cumpleaños' ? 'text-black font-medium' : 'text-gray-600'}`}>
                Celebraciones especiales para niños y adultos con todo lo necesario para una fiesta inolvidable
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Fecha y Habitaciones',
      description: 'Seleccione la fecha y el número de habitaciones necesarias',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-4">
            Seleccione la fecha y el número de habitaciones
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Fecha del Evento</label>
              <EventDateSelector
                selectedDate={formData.fechaEvento}
                onDateSelect={(date) => setFormData({ ...formData, fechaEvento: date })}
              />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Número de Habitaciones</label>
              <select
                value={formData.totalHabitaciones}
                onChange={(e) => setFormData({ ...formData, totalHabitaciones: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
              >
                {[7, 8, 9, 10, 11, 12, 13, 14].map(num => (
                  <option key={num} value={num}>
                    {num} habitaciones
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Nota: El número mínimo de habitaciones es 7 y el máximo es 14, dependiendo del tipo de evento seleccionado
          </p>
        </div>
      )
    },
    {
      title: 'Información de Contacto',
      description: 'Por favor, proporcione sus datos de contacto',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-4">
            Información de Contacto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                required
              />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Apellido</label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                required
              />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                required
              />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                required
              />
            </div>
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Mensaje Adicional (opcional)</label>
            <textarea
              value={formData.mensaje}
              onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
              rows="3"
              placeholder="Indique cualquier detalle o preferencia especial que tenga para su evento"
            />
          </div>
        </div>
      )
    },
    {
      title: 'Modo de Gestión',
      description: 'Elija cómo gestionar las habitaciones',
      icon: FaUserCog,
      content: (
        <ModoGestionHabitaciones 
          onModeSelect={(mode) => {
            setFormData({
              ...formData,
              modoGestionHabitaciones: mode
            });
            handleNextStep();
          }} 
        />
      )
    },
    {
      title: 'Servicios',
      description: 'Seleccione los servicios adicionales para su evento',
      content: (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-6">
            Seleccione los servicios para su evento
          </h2>
          
          {/* Banquetes y Bebidas */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-[var(--color-primary-dark)] mb-4 flex items-center">
              <FaUtensils className="mr-2" /> Banquetes y Bebidas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {serviciosDisponibles.banquetes.map((servicio) => (
                <div 
                  key={servicio.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${formData.servicios.includes(servicio.id) ? 'border-[var(--color-primary)] bg-[#F8E8E0]' : 'border-gray-200 hover:border-[var(--color-primary-light)]'}`}
                  onClick={() => {
                    const serviciosActualizados = formData.servicios.includes(servicio.id)
                      ? formData.servicios.filter(id => id !== servicio.id)
                      : [...formData.servicios, servicio.id];
                    setFormData({ ...formData, servicios: serviciosActualizados });
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold">{servicio.nombre}</h4>
                      <p className="text-sm text-gray-600 mt-1">{servicio.descripcion}</p>
                    </div>
                    <div className="ml-4">
                      {formData.servicios.includes(servicio.id) && (
                        <div className="w-6 h-6 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                          <FaCheck className="text-white text-xs" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-sm font-medium text-[var(--color-primary-dark)]">{servicio.precio}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Montaje */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-[var(--color-primary-dark)] mb-4 flex items-center">
              <FaWineGlassAlt className="mr-2" /> Montaje y Decoración
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {serviciosDisponibles.montaje.map((servicio) => (
                <div 
                  key={servicio.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${formData.servicios.includes(servicio.id) ? 'border-[var(--color-primary)] bg-[#F8E8E0]' : 'border-gray-200 hover:border-[var(--color-primary-light)]'}`}
                  onClick={() => {
                    const serviciosActualizados = formData.servicios.includes(servicio.id)
                      ? formData.servicios.filter(id => id !== servicio.id)
                      : [...formData.servicios, servicio.id];
                    setFormData({ ...formData, servicios: serviciosActualizados });
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold">{servicio.nombre}</h4>
                      <p className="text-sm text-gray-600 mt-1">{servicio.descripcion}</p>
                    </div>
                    <div className="ml-4">
                      {formData.servicios.includes(servicio.id) && (
                        <div className="w-6 h-6 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                          <FaCheck className="text-white text-xs" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-sm font-medium text-[var(--color-primary-dark)]">{servicio.precio}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Fotografía y Video */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-[var(--color-primary-dark)] mb-4 flex items-center">
              <FaCamera className="mr-2" /> Fotografía y Video
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {serviciosDisponibles.fotografia.map((servicio) => (
                <div 
                  key={servicio.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${formData.servicios.includes(servicio.id) ? 'border-[var(--color-primary)] bg-[#F8E8E0]' : 'border-gray-200 hover:border-[var(--color-primary-light)]'}`}
                  onClick={() => {
                    const serviciosActualizados = formData.servicios.includes(servicio.id)
                      ? formData.servicios.filter(id => id !== servicio.id)
                      : [...formData.servicios, servicio.id];
                    setFormData({ ...formData, servicios: serviciosActualizados });
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold">{servicio.nombre}</h4>
                      <p className="text-sm text-gray-600 mt-1">{servicio.descripcion}</p>
                    </div>
                    <div className="ml-4">
                      {formData.servicios.includes(servicio.id) && (
                        <div className="w-6 h-6 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                          <FaCheck className="text-white text-xs" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-sm font-medium text-[var(--color-primary-dark)]">{servicio.precio}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Servicios Adicionales */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-[var(--color-primary-dark)] mb-4 flex items-center">
              <FaMusic className="mr-2" /> Servicios Adicionales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {serviciosDisponibles.adicionales.map((servicio) => (
                <div 
                  key={servicio.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${formData.servicios.includes(servicio.id) ? 'border-[var(--color-primary)] bg-[#F8E8E0]' : 'border-gray-200 hover:border-[var(--color-primary-light)]'}`}
                  onClick={() => {
                    const serviciosActualizados = formData.servicios.includes(servicio.id)
                      ? formData.servicios.filter(id => id !== servicio.id)
                      : [...formData.servicios, servicio.id];
                    setFormData({ ...formData, servicios: serviciosActualizados });
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold">{servicio.nombre}</h4>
                      <p className="text-sm text-gray-600 mt-1">{servicio.descripcion}</p>
                    </div>
                    <div className="ml-4">
                      {formData.servicios.includes(servicio.id) && (
                        <div className="w-6 h-6 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                          <FaCheck className="text-white text-xs" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-sm font-medium text-[var(--color-primary-dark)]">{servicio.precio}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Coordinación */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-[var(--color-primary-dark)] mb-4 flex items-center">
              <FaCalendarAlt className="mr-2" /> Coordinación y Planeación
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {serviciosDisponibles.coordinacion.map((servicio) => (
                <div 
                  key={servicio.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${formData.servicios.includes(servicio.id) ? 'border-[var(--color-primary)] bg-[#F8E8E0]' : 'border-gray-200 hover:border-[var(--color-primary-light)]'}`}
                  onClick={() => {
                    const serviciosActualizados = formData.servicios.includes(servicio.id)
                      ? formData.servicios.filter(id => id !== servicio.id)
                      : [...formData.servicios, servicio.id];
                    setFormData({ ...formData, servicios: serviciosActualizados });
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold">{servicio.nombre}</h4>
                      <p className="text-sm text-gray-600 mt-1">{servicio.descripcion}</p>
                    </div>
                    <div className="ml-4">
                      {formData.servicios.includes(servicio.id) && (
                        <div className="w-6 h-6 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                          <FaCheck className="text-white text-xs" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-sm font-medium text-[var(--color-primary-dark)]">{servicio.precio}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-[var(--color-primary-light)]/10 p-4 rounded-lg border border-[var(--color-primary-light)]/30">
            <p className="text-sm text-[var(--color-primary-dark)]">
              <strong>Nota:</strong> Los precios son aproximados y pueden variar según la temporada y los detalles específicos de su evento. Un asesor se pondrá en contacto con usted para confirmar los precios finales.            
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Habitaciones',
      description: 'Seleccione las habitaciones para el evento',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-4">
            Asignación de Habitaciones
          </h2>
          {formData.modoGestionHabitaciones === 'usuario' ? (
            <>
              <p className="text-gray-600">
                Asigne las habitaciones para los invitados al evento. Puede seleccionar habitaciones del plano del hotel y especificar los huéspedes para cada una.
              </p>
              <EventoMapaHabitaciones onRoomsChange={handleRoomsChange} eventDate={formData.fechaEvento ? formData.fechaEvento.toISOString().split('T')[0] : ''} />
            </>
          ) : (
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Gestión por la Hacienda</h3>
              <p className="text-blue-700 mb-4">
                Ha seleccionado que el personal de la hacienda gestione la asignación de habitaciones. Una vez completada la reserva, recibirá un correo electrónico con instrucciones para proporcionar la información de los huéspedes.  
              </p>
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-gray-800 mb-2">Resumen:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    </span>
                    <span>El personal de la hacienda se encargará de asignar las habitaciones</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    </span>
                    <span>Recibirá un enlace para proporcionar los datos de los huéspedes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    </span>
                    <span>Podrá cargar un archivo Excel con los datos o completar un formulario</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Modo de Gestión',
      description: 'Elija cómo gestionar las habitaciones',
      icon: FaUserCog,
      content: (
        <ModoGestionHabitaciones 
          onModeSelect={(mode) => {
            setFormData({
              ...formData,
              modoGestionHabitaciones: mode
            });
            handleNextStep();
          }} 
        />
      )
    },
  ];

  const handleNextStep = async () => {
    if (currentStep === 0 && !formData.tipoEvento) {
      toast.error('Por favor, seleccione el tipo de evento');
      return;
    }

    if (currentStep === 1 && !formData.fechaEvento) {
      toast.error('Por favor, seleccione una fecha para su evento');
      return;
    }

    if (currentStep === 2 && (!formData.nombre || !formData.correo || !formData.telefono)) {
      toast.error('Por favor, complete todos los campos de contacto');
      return;
    }

    if (currentStep === 3 && !formData.servicios.length) {
      toast.error('Por favor, seleccione al menos un servicio');
      return;
    }

    setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que todos los campos requeridos estén completos
    if (!formData.tipoEvento) {
      toast.error('Por favor, seleccione el tipo de evento');
      return;
    }

    if (!formData.fechaEvento) {
      toast.error('Por favor, seleccione una fecha para el evento');
      return;
    }

    if (!formData.nombre || !formData.correo || !formData.telefono) {
      toast.error('Por favor, complete todos los campos de contacto');
      return;
    }
    
    if (!formData.modoGestionHabitaciones) {
      toast.error('Por favor, seleccione el modo de gestión de habitaciones');
      return;
    }

    if (!formData.servicios.length) {
      toast.error('Por favor, seleccione al menos un servicio');
      return;
    }

    try {
      setLoading(true);
      setError({ show: false, message: '' });

      // Formatear la fecha para la API
      const fechaFormateada = formData.fechaEvento instanceof Date 
        ? formData.fechaEvento.toISOString().split('T')[0]
        : null;

      if (!fechaFormateada) {
        setError({ show: true, message: 'Fecha inválida' });
        return;
      }

      // Verificar disponibilidad
      try {
        const availability = await checkEventoAvailability({
          fecha: fechaFormateada,
          tipoEvento: formData.tipoEvento,
          totalHabitaciones: formData.totalHabitaciones
        });

        if (!availability.available) {
          setError({ show: true, message: availability.message || 'No hay disponibilidad para estas fechas' });
          return;
        }
      } catch (availabilityError) {
        console.error('Error al verificar disponibilidad:', availabilityError);
        setError({ show: true, message: 'Error al verificar disponibilidad. Por favor, inténtelo de nuevo.' });
        return;
      }

      // Crear la reserva
      try {
        const reservationData = {
          tipo_evento: formData.tipoEvento,
          fecha_evento: fechaFormateada,
          nombre: formData.nombre,
          apellido: formData.apellido,
          correo: formData.correo,
          telefono: formData.telefono,
          mensaje: formData.mensaje,
          modo_gestion_habitaciones: formData.modoGestionHabitaciones,
          servicios: formData.servicios,
          habitaciones: formData.modoGestionHabitaciones === 'usuario' ? formData.habitaciones.map(room => ({
            fecha_entrada: room.checkIn,
            fecha_salida: room.checkOut || room.checkIn, // Usar fecha de entrada como fallback si no hay fecha de salida
            huespedes: room.guests.map(guest => ({
              nombre: guest.name,
              numero_personas: guest.guests
            }))
          })) : []
        };

        const reservation = await createEventoReservation(reservationData);

        if (!reservation || !reservation._id) {
          throw new Error('Error al crear la reserva');
        }

        toast.success('Reserva creada exitosamente');
        router.push(`/admin/reservaciones/eventos/${reservation._id}`);
      } catch (reservationError) {
        console.error('Error al crear la reserva:', reservationError);
        setError({ show: true, message: reservationError.message || 'Error al crear la reserva. Por favor, inténtelo de nuevo.' });
      } finally {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error en el proceso de reserva:', err);
      setError({ show: true, message: err.message || 'Error al procesar la reserva' });
    }
  };

  return (
    <>
      <NavbarReservar />
      <div className="min-h-screen pt-96 pb-24 px-4 sm:px-6 lg:px-8 relative">
        {/* Imagen de fondo con overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40"></div>
          <img 
            src="/images/imagendron3.jpg" 
            alt="Fondo Hacienda" 
            className="w-full h-full object-cover opacity-25"
            style={{ filter: 'blur(2px)' }}
          />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <ErrorModal 
            isOpen={error.show}
            onClose={() => setError({ show: false, message: '' })}
            message={error.message}
          />
          
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
            <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-8">
              Reservar Evento
            </h1>
            
            <WizardSteps currentStep={currentStep} steps={steps} />

            <form onSubmit={handleSubmit} className="space-y-8">
              {steps[currentStep].content}

              <div className="flex justify-end mt-8">
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    className="px-6 py-3 mr-4 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
                  >
                    Atrás
                  </button>
                )}
                {currentStep === steps.length - 1 ? (
                  <button
                    type="submit"
                    disabled={loading || !formData.tipoEvento || !formData.fechaEvento || !formData.nombre || !formData.correo || !formData.telefono || !formData.modoGestionHabitaciones}
                    className="px-8 py-3 rounded-lg transition-all duration-300 flex items-center space-x-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]"
                  >
                    <span className="text-white font-medium">Finalizar</span>
                    <FaChevronRight className="text-white" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-8 py-3 rounded-lg transition-all duration-300 flex items-center space-x-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]"
                  >
                    <span className="text-white font-medium">Siguiente</span>
                    <FaChevronRight className="text-white" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
