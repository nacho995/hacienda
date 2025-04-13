// frontend/src/components/reservas/CheckoutForm.jsx
import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import { toast } from 'sonner';
import { FaSpinner } from 'react-icons/fa'; // Asegúrate de importar FaSpinner

export default function CheckoutForm({ clientSecret, reservaId, onPaymentSuccess, onPaymentProcessing }) {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStripeLoading, setIsStripeLoading] = useState(true); // Para carga inicial

  useEffect(() => {
    if (!stripe || !elements || !clientSecret) {
      console.log("CheckoutForm: Stripe.js, elements, o clientSecret no listos.");
      setIsStripeLoading(true); // Mantener cargando si falta algo
      return;
    }
    console.log("CheckoutForm: Stripe.js y Elements listos.");
    // No necesitamos hacer nada con el clientSecret aquí, Elements lo usa.
    // setIsStripeLoading(false); // Se maneja mejor con onReady de PaymentElement

  }, [stripe, elements, clientSecret]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setMessage("Stripe no está listo. Por favor, espere.");
      return;
    }

    // Validar si los elementos están montados (una comprobación extra)
    const paymentElement = elements.getElement(PaymentElement);
    if (!paymentElement) {
        setMessage("El formulario de pago no se ha cargado correctamente.");
        return;
    }

    setIsLoading(true);
    setMessage(null);
    if (onPaymentProcessing) onPaymentProcessing(true);

    // URL a la que Stripe redirigirá después del pago (exitóso o fallido si requiere acción)
    // DEBES crear esta página en tu frontend
    const returnUrl = `${window.location.origin}/confirmacion-pago?reserva_id=${reservaId}`; // Cambia la ruta si es necesario

    try {
        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: returnUrl,
          },
          // redirect: 'if_required' // Stripe decide si redirigir o no
        });

        // Este punto SÓLO se alcanza si hay un error INMEDIATO (ej. datos inválidos, red)
        // O si la redirección no fue necesaria y el pago falló aquí mismo.
        // Si se requiere autenticación 3DS, el usuario será redirigido a returnUrl.
        if (error) {
          if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message || "Error en los datos de la tarjeta.");
            toast.error(error.message || "Error en los datos de la tarjeta.");
          } else {
            setMessage("Ocurrió un error inesperado al procesar el pago.");
            toast.error("Ocurrió un error inesperado al procesar el pago.");
          }
          setIsLoading(false);
          if (onPaymentProcessing) onPaymentProcessing(false);
        } else {
          // Si no hay error Y no hubo redirección, el pago podría estar procesándose
          // o incluso haber sido exitoso sin necesidad de 3DS.
          // El webhook es la fuente definitiva de verdad para el éxito.
          setMessage("Procesando pago...");
          // No cambiamos isLoading a false aquí, el webhook confirmará.
          if (onPaymentProcessing) onPaymentProcessing(true);
          // Podrías llamar a onPaymentSuccess aquí si estás *muy* seguro
          // que no habrá redirección ni webhooks, pero es menos robusto.
          // if (onPaymentSuccess) onPaymentSuccess();
        }
    } catch (submitError) {
        // Capturar cualquier otro error durante la confirmación
        console.error("Error en confirmPayment:", submitError);
        setMessage("Ocurrió un error técnico al intentar el pago.");
        toast.error("Ocurrió un error técnico al intentar el pago.");
        setIsLoading(false);
        if (onPaymentProcessing) onPaymentProcessing(false);
    }
  };

  const paymentElementOptions = {
    layout: "tabs", // o 'accordion'
    // fields: { billingDetails: { name: 'never', email: 'never' } } // Opcional: ocultar campos
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-4">
      {isStripeLoading && (
         <div className="flex justify-center items-center py-4 text-gray-600">
            <FaSpinner className="animate-spin text-xl text-gray-500 mr-2" />
            <span>Cargando formulario de pago seguro...</span>
         </div>
      )}
      {/* El PaymentElement se muestra una vez que Stripe.js ha cargado */}
      <PaymentElement
          id="payment-element"
          options={paymentElementOptions}
          onReady={() => {
              console.log("PaymentElement listo.");
              setIsStripeLoading(false);
          }}
          onChange={(e) => {
             // Puedes escuchar cambios, por ejemplo, si el formulario está completo
             // console.log('PaymentElement change:', e);
          }}
      />
      <button
        disabled={isLoading || !stripe || !elements || isStripeLoading}
        id="submit"
        className={`w-full px-6 py-3 rounded-lg text-white font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
          (isLoading || !stripe || !elements || isStripeLoading)
            ? 'bg-gray-400 cursor-not-allowed opacity-70'
            : 'bg-gradient-to-r from-[#A5856A] to-[#8B6B4F] hover:shadow-lg transform hover:-translate-y-0.5' // Usa tus clases de botón primario aquí
        }`}
      >
        {isLoading ? (
           <FaSpinner className="animate-spin text-xl" />
        ) : (
          <span>Pagar ahora</span>
        )}
      </button>
      {/* Muestra mensajes de error */}
      {message && <div id="payment-message" className="text-red-600 text-sm text-center mt-2 font-medium">{message}</div>}
    </form>
  );
}