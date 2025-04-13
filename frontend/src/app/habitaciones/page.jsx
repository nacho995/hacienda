"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { obtenerHabitaciones } from '@/services/habitaciones.service'; // Import service
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { 
    createHabitacionPaymentIntent,
    seleccionarMetodoPagoHabitacion
} from '@/services/reservationService';
import { FaCreditCard, FaUniversity, FaMoneyBillWave } from 'react-icons/fa';

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
const CheckoutForm = dynamic(() => import('@/components/reservas/CheckoutForm'), { ssr: false });

// Cargar Stripe fuera del render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'TU_CLAVE_PUBLICA_AQUI');

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

  // --- NUEVOS ESTADOS PARA PAGO --- 
  const [createdReservationId, setCreatedReservationId] = useState(null);
  const [stripeClientSecret, setStripeClientSecret] = useState('');
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [currentPaymentStep, setCurrentPaymentStep] = useState('form'); // 'form', 'payment', 'success'
  // ------------------------------- 

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

  // --- NUEVAS FUNCIONES PARA MANEJAR PAGO --- 
  const handleBookingSuccess = (reservaId) => {
    setCreatedReservationId(reservaId);
    setCurrentPaymentStep('payment'); // Avanzar al paso de selección de pago
    toast.success('Reserva creada. Por favor, selecciona un método de pago.')
  };

  const handlePaymentSelection = async (metodo) => {
     if (!createdReservationId) {
        toast.error('Error: ID de reserva no encontrado.');
        return;
     }
     setIsProcessingPayment(true);
     setShowCheckoutForm(false); 
     setStripeClientSecret('');

     if (metodo === 'tarjeta') {
       let loadingToast = toast.loading('Preparando pago seguro...');
       try {
         const response = await createHabitacionPaymentIntent(createdReservationId);
         toast.dismiss(loadingToast);
         if (response?.clientSecret) {
            setStripeClientSecret(response.clientSecret);
            setShowCheckoutForm(true);
            toast.info('Introduce los datos de tu tarjeta.');
         } else {
            toast.error(response?.message || 'No se pudo iniciar el pago con tarjeta.');
         }
       } catch (error) {
         toast.dismiss(loadingToast);
         toast.error(error.response?.data?.message || 'Error preparando pago.');
       } finally {
         setIsProcessingPayment(false);
       }
     } else { // Efectivo o Transferencia 
        let initialToastId = null;
        if (metodo === 'transferencia') {
          initialToastId = toast.loading('Enviando instrucciones de pago...');
        } else if (metodo === 'efectivo') {
          initialToastId = toast.loading('Confirmando selección...');
        }
        
        try {
          const response = await seleccionarMetodoPagoHabitacion(createdReservationId, metodo);
          if(initialToastId) toast.dismiss(initialToastId);

          if (response.success) {
             if (metodo === 'transferencia') { toast.success('Instrucciones enviadas.'); }
             else if (metodo === 'efectivo') { toast.success('Selección confirmada. Paga en recepción.'); }
             setCurrentPaymentStep('success'); // Avanzar a pantalla de éxito
          } else {
             toast.error(response.message || `Error al seleccionar ${metodo}.`);
          }
        } catch (error) {
           if(initialToastId) toast.dismiss(initialToastId);
           console.error(`Error seleccionando ${metodo} para habitación:`, error);
           toast.error(error.response?.data?.message || 'Error procesando selección.');
        } finally {
           setIsProcessingPayment(false);
        }
     }
  };

  const handlePaymentSuccess = () => {
     toast.success('¡Pago completado con éxito!');
     setCurrentPaymentStep('success'); // Mostrar mensaje de éxito final
     setShowCheckoutForm(false);
     // Quizás limpiar selección de habitaciones, etc.
     setSelectedRoomIds([]);
  };
  // ---------------------------------------

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

              {/* --- Lógica Condicional de Renderizado --- */}
              {selectedRoomIds.length > 0 && currentPaymentStep === 'form' && (
                <BookingFormSection
                  formData={formData}
                  setFormData={setFormData}
                  selectedRooms={selectedRoomDetails}
                  onBookingSuccess={handleBookingSuccess} // Pasar callback
                />
              )}
              
              {currentPaymentStep === 'payment' && (
                 <div className="mt-12 bg-white p-8 rounded-lg shadow-xl border border-gray-200">
                    <h3 className="text-2xl font-semibold text-center mb-6 text-gray-800">
                      {showCheckoutForm ? 'Completa el Pago Seguro' : 'Selecciona Método de Pago'}
                    </h3>
                    {showCheckoutForm && stripeClientSecret ? (
                       <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret }}>
                          <CheckoutForm 
                             clientSecret={stripeClientSecret} 
                             reservaId={createdReservationId} 
                             onPaymentSuccess={handlePaymentSuccess} 
                             onPaymentProcessing={setIsProcessingPayment}
                          />
                       </Elements>
                    ) : (
                       <div className="flex flex-col md:flex-row justify-center gap-4">
                          {/* Botones de pago (habilitar/deshabilitar según isProcessingPayment) */}
                          <button 
                            onClick={() => handlePaymentSelection('tarjeta')}
                            disabled={isProcessingPayment} 
                            className={`w-full md:w-auto px-6 py-3 rounded-lg text-white font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${isProcessingPayment ? 'bg-gray-400 cursor-not-allowed opacity-70' : 'bg-gradient-to-r from-[#A5856A] to-[#8B6B4F] hover:shadow-lg transform hover:-translate-y-0.5'}`}>
                             <FaCreditCard className="mr-2"/> Pagar con Tarjeta
                          </button>
                          <button 
                            onClick={() => handlePaymentSelection('transferencia')}
                            disabled={isProcessingPayment} 
                            className={`w-full md:w-auto px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${isProcessingPayment ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-70' : 'bg-gradient-to-r from-[#BCAAA4] to-[#A1887F] text-[#3E2723] hover:shadow-lg transform hover:-translate-y-0.5'}`}>
                            <FaUniversity className="mr-2"/> Transferencia
                          </button>
                          <button 
                            onClick={() => handlePaymentSelection('efectivo')}
                            disabled={isProcessingPayment} 
                            className={`w-full md:w-auto px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${isProcessingPayment ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-70' : 'bg-gradient-to-r from-[#E0E0E0] to-[#BDBDBD] text-gray-700 hover:shadow-lg transform hover:-translate-y-0.5'}`}>
                            <FaMoneyBillWave className="mr-2"/> Efectivo
                          </button>
                       </div>
                    )}
                 </div>
              )}

              {currentPaymentStep === 'success' && (
                 <div className="mt-12 bg-green-50 p-8 rounded-lg shadow-lg text-center border border-green-200">
                     <h3 className="text-2xl font-bold text-green-700 mb-4">¡Reserva Confirmada!</h3>
                     <p className="text-green-600">Gracias por tu reserva. Hemos enviado los detalles a tu correo electrónico.</p>
                     {/* Podrías añadir un botón para ver la reserva o volver al inicio */}
                 </div>
              )}
              {/* ------------------------------------------ */}

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