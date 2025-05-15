export default function FAQSection() {
  const faqs = [
    {
      pregunta: "¿Puedo solicitar una cama adicional?",
      respuesta: "Sí, se puede solicitar una cama adicional con un cargo extra de $500 MXN por noche, sujeto a disponibilidad y capacidad de la habitación."
    },
    {
      pregunta: "¿Aceptan mascotas?",
      respuesta: "Lamentablemente no aceptamos mascotas en nuestras habitaciones para garantizar el confort de todos nuestros huéspedes."
    },
    {
      pregunta: "¿Ofrecen transporte desde/hacia el aeropuerto?",
      respuesta: "Sí, ofrecemos servicio de transporte con costo adicional. Por favor indíquenos sus necesidades al realizar su reserva."
    },
    {
      pregunta: "¿Las habitaciones tienen caja fuerte?",
      respuesta: "Sí, todas nuestras habitaciones cuentan con caja fuerte para su tranquilidad y seguridad durante su estancia."
    }
  ];

  return (
    <section className="py-16">
      <div className="container-custom">
        <h2 className="font-[var(--font-display)] text-3xl text-center mb-12">
          Preguntas Frecuentes
        </h2>
        
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b pb-6 border-gray-200">
                <h3 className="text-lg font-medium text-[var(--color-accent)] mb-2">
                  {faq.pregunta}
                </h3>
                <p className="text-gray-600">
                  {faq.respuesta}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              ¿Tienes más preguntas? No dudes en contactarnos
            </p>
            <a 
              href="mailto:hdasancarlos@gmail.com"
              className="text-[var(--color-primary)] hover:underline font-medium"
            >
              hdasancarlos@gmail.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
} 