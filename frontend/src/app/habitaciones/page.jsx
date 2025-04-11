"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { obtenerHabitaciones } from '@/services/habitaciones.service'; // Import service

// Importar componentes de layout
const Navbar = dynamic(() => import('@/components/layout/Navbar'), { ssr: false });
const Footer = dynamic(() => import('@/components/layout/Footer'), { ssr: false });

// Importar componentes de la página de hotel
const HeroSection = dynamic(() => import('@/components/habitaciones/HeroSection'), { ssr: false });
const IntroSection = dynamic(() => import('@/components/habitaciones/IntroSection'), { ssr: false });
// Import the NEW map selector
const HotelMapaHabitaciones = dynamic(() => import('@/components/reservas/HotelMapaHabitaciones'), { ssr: false });
const BookingFormSection = dynamic(() => import('@/components/habitaciones/BookingFormSection'), { ssr: false });
const PoliciesSection = dynamic(() => import('@/components/habitaciones/PoliciesSection'), { ssr: false });
const FAQSection = dynamic(() => import('@/components/habitaciones/FAQSection'), { ssr: false });

export default function HotelPage() {
  // State for selected room IDs
  const [selectedRoomIds, setSelectedRoomIds] = useState([]);
  // State for the detailed info of selected rooms
  const [selectedRoomDetails, setSelectedRoomDetails] = useState([]);
  // State to hold all available rooms for the map
  const [allHotelRooms, setAllHotelRooms] = useState([]);

  // Keep original formData structure, but remove room-specific fields
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    huespedes: 1,
    mensaje: '',
    tipoReservacion: 'hotel' // Default to hotel
    // Removed habitacion, tipoHabitacion, totalHabitaciones
  });

  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Function to toggle room selection (passed to map)
  const handleToggleRoom = (roomId) => {
    console.log('Toggling room ID:', roomId); // Log incoming ID
    // Simple toast feedback
    const isCurrentlySelected = selectedRoomIds.includes(roomId);
    if (isCurrentlySelected) {
      toast.info(`Habitación deseleccionada.`);
    } else {
      toast.success(`Habitación seleccionada.`);
    }

    setSelectedRoomIds((prevSelected) => {
      let newSelectedIds;
      if (prevSelected.includes(roomId)) {
        newSelectedIds = prevSelected.filter(id => id !== roomId);
      } else {
        newSelectedIds = [...prevSelected, roomId];
      }
      console.log('New selectedRoomIds:', newSelectedIds); // Log updated state
      return newSelectedIds;
    });
  };

  // Function to set all rooms info when loaded by the map component
  const handleHabitacionesLoad = (habitaciones) => {
    console.log("[HotelPage] handleHabitacionesLoad called with:", habitaciones); // Log when called
    setAllHotelRooms(habitaciones);
  };

  // Effect to get details ONLY for the selected rooms
  useEffect(() => {
    if (allHotelRooms.length === 0) return; // Don't run if all rooms haven't loaded

    if (selectedRoomIds.length === 0) {
      setSelectedRoomDetails([]);
      return;
    }
    
    // Filter details from the already loaded allHotelRooms list
    const details = allHotelRooms.filter(room => selectedRoomIds.includes(room._id));
    setSelectedRoomDetails(details);
    
    // No async call needed here anymore, just filtering

  }, [selectedRoomIds, allHotelRooms]); // Re-run when selection or all rooms change

  console.log(`[HotelPage] Rendering...`); // Simplified log
  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <HeroSection />

        {/* Resto del contenido */}
        <div className="section-padding">
          <div className="container-custom">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <IntroSection scrollY={scrollY} />
              
              {/* Render the Map Selector Component directly */}
              {/* It handles its own internal loading state */}
              <HotelMapaHabitaciones 
                selectedRoomIds={selectedRoomIds}
                onToggleRoom={handleToggleRoom}
                onHabitacionesLoad={handleHabitacionesLoad} // Pass the handler
              />

              {/* Log before conditional rendering */}
              {console.log('Checking condition to render form. selectedRoomIds:', selectedRoomIds, 'Length:', selectedRoomIds.length)}
              {/* Conditionally render BookingForm only when rooms are selected */}
              {selectedRoomIds.length > 0 && (
                <BookingFormSection
                  formData={formData}
                  setFormData={setFormData}
                  selectedRooms={selectedRoomDetails} 
                />
              )}
            </div>
          </div>
        </div>

        <PoliciesSection scrollY={scrollY} />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}