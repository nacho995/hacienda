"use client";

import Image from 'next/image';
import { FaCheck, FaBed, FaUserFriends } from 'react-icons/fa';

// Datos simulados de habitaciones
const HABITACIONES = [
  {
    id: 1,
    nombre: "Suite Hacienda Principal",
    descripcion: "Elegante suite con vistas panorámicas a los jardines, decorada con muebles de época y detalles auténticos de hacienda mexicana.",
    precio: 3500,
    capacidad: 2,
    tamaño: "45m²",
    camas: "1 King Size",
    imagen: "/images/placeholder/room1.jpg.svg",
    amenidades: ["WiFi gratis", "Desayuno incluido", "TV de pantalla plana", "Aire acondicionado", "Baño privado de lujo", "Artículos de tocador premium"]
  },
  {
    id: 2,
    nombre: "Suite Tradición Colonial",
    descripcion: "Espaciosa habitación con elementos coloniales, techos altos y una combinación perfecta entre la comodidad moderna y el encanto histórico.",
    precio: 2800,
    capacidad: 2,
    tamaño: "38m²",
    camas: "1 Queen Size",
    imagen: "/images/placeholder/room2.jpg.svg",
    amenidades: ["WiFi gratis", "Desayuno incluido", "TV de pantalla plana", "Aire acondicionado", "Baño privado", "Terraza privada"]
  },
  {
    id: 3,
    nombre: "Habitación Deluxe Jardín",
    descripcion: "Acogedora habitación con acceso directo a los jardines, ideal para disfrutar de la tranquilidad y belleza natural de la hacienda.",
    precio: 2400,
    capacidad: 2,
    tamaño: "32m²",
    camas: "2 Individuales o 1 King Size",
    imagen: "/images/placeholder/room3.jpg.svg",
    amenidades: ["WiFi gratis", "Desayuno incluido", "TV de pantalla plana", "Aire acondicionado", "Baño privado", "Vista al jardín"]
  },
  {
    id: 4,
    nombre: "Suite Familiar Hacienda",
    descripcion: "Amplia suite diseñada para familias, con espacios separados y todas las comodidades para una estancia inolvidable en un entorno histórico.",
    precio: 4200,
    capacidad: 4,
    tamaño: "60m²",
    camas: "1 King Size + 2 Individuales",
    imagen: "/images/placeholder/room4.jpg.svg",
    amenidades: ["WiFi gratis", "Desayuno incluido", "TV de pantalla plana", "Aire acondicionado", "2 Baños privados", "Sala de estar", "Minibar"]
  }
];

export { HABITACIONES };

export default function RoomListSection({ onSelectRoom }) {
  return (
    <section id="habitaciones" className="py-16">
      <div className="container-custom">
        <h2 className="font-[var(--font-display)] text-3xl text-center mb-12">
          Encuentra tu Habitación Ideal
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {HABITACIONES.map((habitacion) => (
            <div 
              key={habitacion.id} 
              className="border-decorative group hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative h-80 overflow-hidden">
                <div className="absolute inset-0 bg-black/20 z-10 transition-opacity group-hover:opacity-0"></div>
                <Image 
                  src={habitacion.imagen}
                  alt={habitacion.nombre}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-[var(--font-display)] text-2xl text-[var(--color-accent)]">
                    {habitacion.nombre}
                  </h3>
                  <div className="text-[var(--color-primary)] font-semibold">
                    ${habitacion.precio} <span className="text-sm font-normal text-gray-500">/ noche</span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6">
                  {habitacion.descripcion}
                </p>
                
                <div className="flex flex-wrap gap-x-6 gap-y-3 mb-8 text-sm text-gray-700">
                  <div className="flex items-center">
                    <FaBed className="mr-2 text-[var(--color-primary)]" />
                    {habitacion.camas}
                  </div>
                  <div className="flex items-center">
                    <FaUserFriends className="mr-2 text-[var(--color-primary)]" />
                    {habitacion.capacidad} personas
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2 text-[var(--color-primary)]">&#x33A1;</span>
                    {habitacion.tamaño}
                  </div>
                </div>
                
                <div className="space-y-2 mb-8">
                  <h4 className="font-semibold mb-3 text-[var(--color-accent)]">Amenidades:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {habitacion.amenidades.slice(0, 6).map((amenidad, index) => (
                      <div key={index} className="flex items-center">
                        <FaCheck className="mr-2 text-xs text-[var(--color-primary)]" />
                        {amenidad}
                      </div>
                    ))}
                  </div>
                </div>
                
                <button 
                  onClick={() => onSelectRoom(habitacion)}
                  className="w-full py-3 bg-[var(--color-accent)] text-white font-medium tracking-wide hover:bg-[var(--color-primary)] transition-colors duration-300"
                >
                  Reservar Ahora
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 