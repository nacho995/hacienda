"use client";

import { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { useRouter } from 'next/navigation'; // Para posible redirección

// Componente simple de estrellas para la puntuación
const StarRating = ({ rating, setRating }) => {
  const [hover, setHover] = useState(null);

  return (
    <div className="flex space-x-1">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <label key={index}>
            <input
              type="radio"
              name="rating"
              value={ratingValue}
              onClick={() => setRating(ratingValue)}
              className="hidden" // Ocultar el radio button real
            />
            <FaStar
              className="cursor-pointer transition-colors duration-200"
              color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
              size={30}
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(null)}
            />
          </label>
        );
      })}
    </div>
  );
};

export default function EscribirResenaPage() {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage('');

    if (rating === 0) {
      setError('Por favor, selecciona una puntuación.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/reviews', { // Endpoint para crear reseña
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, rating, comment }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al enviar la reseña');
      }

      setSuccessMessage('¡Gracias por tu reseña! Será revisada pronto.');
      // Limpiar formulario
      setName('');
      setRating(0);
      setComment('');
      // Opcional: Redirigir después de un tiempo
      // setTimeout(() => router.push('/'), 3000); 

    } catch (err) {
      setError(err.message || 'Ocurrió un error inesperado.');
      console.error("Error submitting review:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white p-8 shadow-xl rounded-lg border border-gray-200">
        <h1 className="text-3xl font-bold text-center text-[var(--color-accent)] mb-8">
          Escribe tu Reseña
        </h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <p><strong>Error:</strong> {error}</p>
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <p>{successMessage}</p>
          </div>
        )}

        {!successMessage && ( // Ocultar formulario tras éxito
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Tu Nombre
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm"
                placeholder="Juan Pérez"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Puntuación
              </label>
              <StarRating rating={rating} setRating={setRating} />
            </div>

            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                Tu Comentario
              </label>
              <textarea
                id="comment"
                name="comment"
                rows="4"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm"
                placeholder="Describe tu experiencia..."
              ></textarea>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white ${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-[var(--color-primary)] hover:bg-[var(--color-accent)]'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition duration-150 ease-in-out`}
              >
                {isLoading ? 'Enviando...' : 'Enviar Reseña'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 