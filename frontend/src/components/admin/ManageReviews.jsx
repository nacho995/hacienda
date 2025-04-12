"use client";

import { useState, useEffect, useCallback } from 'react';
import { FaCheck, FaTimes, FaEdit, FaTrash, FaStar, FaPlus } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
// Importar el apiClient configurado
import apiClient from '../../services/apiClient'; // Ajusta la ruta si es necesario

// Componente Modal para Editar (simple)
const EditReviewModal = ({ review, onClose, onSave }) => {
  const [name, setName] = useState(review.name);
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Usar apiClient en lugar de fetch
      const response = await apiClient.put(`/reviews/admin/${review._id}`, { 
          name, 
          rating, 
          comment 
      });
      
      // apiClient puede lanzar error directamente o devolver success: false
      // Asumimos que si no lanza error, fue exitoso y devuelve { data: ... }
      onSave(response.data); 
      onClose();
    } catch (err) { // apiClient podría lanzar errores formateados
      const errorMsg = err.response?.data?.message || err.message || 'Error al guardar los cambios';
      setError(errorMsg);
      console.error("Error updating review via apiClient:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
        <h2 className="text-xl font-semibold mb-4">Editar Reseña</h2>
        {error && <p className="text-red-500 mb-3 text-sm">Error: {error}</p>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Puntuación (1-5)</label>
            <input 
              type="number"
              min="1"
              max="5"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Comentario</label>
            <textarea
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            ></textarea>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancelar
          </button>
          <button 
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- NUEVO: MODAL AÑADIR RESEÑA ---
const AddReviewModal = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5); // Default a 5 estrellas?
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAdd = async () => {
    setIsLoading(true);
    setError(null);
    // Validación simple
    if (!name || !comment || rating < 1 || rating > 5) {
        setError('Por favor, complete todos los campos y asegúrese de que la puntuación sea entre 1 y 5.');
        setIsLoading(false);
        return;
    }
    try {
      // Usar apiClient para POST a /api/reviews
      const response = await apiClient.post('/reviews', { name, rating, comment });
      
      // Llamar al callback onAdd para refrescar la lista en el componente padre
      onAdd(response.data.data); // Asumiendo que el backend devuelve la nueva reseña en response.data.data
      onClose(); // Cerrar el modal
    } catch (err) { 
      const errorMsg = err.response?.data?.message || err.message || 'Error al añadir la reseña';
      setError(errorMsg);
      console.error("Error adding review via apiClient:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
        <h2 className="text-xl font-semibold mb-4">Añadir Nueva Reseña</h2>
        {error && <p className="text-red-500 mb-3 text-sm">Error: {error}</p>}
        <div className="space-y-4">
          <div>
            <label htmlFor="add-name" className="block text-sm font-medium text-gray-700">Nombre</label>
            <input 
              type="text"
              id="add-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="add-rating" className="block text-sm font-medium text-gray-700">Puntuación (1-5)</label>
            <input 
              type="number"
              id="add-rating"
              min="1"
              max="5"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="add-comment" className="block text-sm font-medium text-gray-700">Comentario</label>
            <textarea
              id="add-comment"
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            ></textarea>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancelar
          </button>
          <button 
            type="button"
            onClick={handleAdd}
            disabled={isLoading}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
          >
            {isLoading ? 'Añadiendo...' : 'Añadir Reseña'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ManageReviews() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [isAddingReview, setIsAddingReview] = useState(false);
  // Ya no necesitamos extraer el token aquí si apiClient lo maneja
  const { user } = useAuth(); // Podríamos necesitar user si el layout no valida admin

  // Limpiamos logs anteriores
  // console.log('[ManageReviews] Renderizado. Token recibido de useAuth:', token);

  const fetchReviews = useCallback(async () => {
    // Ya no necesitamos verificar el token explícitamente aquí
    // console.log('[ManageReviews] fetchReviews INICIADO. Token actual:', token);
    
    setIsLoading(true);
    setError(null);
    console.log('[ManageReviews] fetchReviews: Intentando con apiClient a /reviews/admin/all');
    try {
      const response = await apiClient.get('/reviews/admin/all');
      console.log('[ManageReviews] fetchReviews: Respuesta apiClient recibida');

      // --- CORREGIDO: Verificar la estructura de la respuesta del backend --- 
      if (response && response.success === true && Array.isArray(response.data)) {
          setReviews(response.data); // Usar el array de datos directamente
          console.log('[ManageReviews] fetchReviews: Reseñas obtenidas con éxito:', response.count); // Usar response.count
      } else {
          // Manejar respuesta inesperada o no exitosa
          console.warn('[ManageReviews] fetchReviews: Respuesta no exitosa o formato inesperado:', response);
          setReviews([]);
          // Establecer error solo si la respuesta no fue explícitamente exitosa
          if (response?.success !== true) { 
              setError(response?.message || 'Error al obtener reseñas del servidor.');
          } else {
              // Si success es true pero data no es array, es un error de formato
              setError('Formato de datos inesperado del servidor.');
          }
      }

    } catch (err) {
      // apiClient puede lanzar errores formateados (ej: err.response.data.message)
      const errorMsg = err.response?.data?.message || err.message || 'No se pudieron cargar las reseñas';
      console.error('[ManageReviews] fetchReviews: Error con apiClient:', errorMsg, err.response || err);
      setError(errorMsg);
      setReviews([]);
    } finally {
      console.log('[ManageReviews] fetchReviews: Bloque finally, poniendo isLoading a false.');
      setIsLoading(false);
    }
  // La dependencia ahora es solo la función (podría eliminarse si no depende de nada externo)
  }, []); 

  useEffect(() => {
    // Ya no necesitamos verificar el token, solo llamar a fetch
    // console.log('[ManageReviews] useEffect EJECUTADO. Token actual:', token);
    // console.log('[ManageReviews] useEffect: Llamando a fetchReviews...');
    fetchReviews();
  // Quitar dependencias si fetchReviews ya no las necesita (como token)
  }, [fetchReviews]); 

  const handleUpdateStatus = async (id, status) => {
    // Ya no necesitamos verificar token si apiClient lo hace
    try {
      // Usar apiClient
      await apiClient.patch(`/reviews/admin/${id}/status`, { status });
      
      // Actualizar estado local
      setReviews(prevReviews => 
        prevReviews.map(r => r._id === id ? { ...r, status } : r)
      );
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || `Error al ${status === 'approved' ? 'aprobar' : 'rechazar'}`; 
      alert(`Error: ${errorMsg}`);
      console.error("Error updating status via apiClient:", err);
    }
  };

  const handleDelete = async (id) => {
    // Ya no necesitamos verificar token si apiClient lo hace
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
        return;
    }
    try {
      // Usar apiClient
      await apiClient.delete(`/reviews/admin/${id}`);
      
      // Actualizar estado local
      setReviews(prevReviews => prevReviews.filter(r => r._id !== id));
    } catch (err) {
       const errorMsg = err.response?.data?.message || err.message || 'Error al eliminar la reseña';
       alert(`Error: ${errorMsg}`);
       console.error("Error deleting review via apiClient:", err);
    }
  };

  const handleEditSave = (updatedReview) => {
      setReviews(prevReviews => 
        prevReviews.map(r => r._id === updatedReview._id ? updatedReview : r)
      );
  };

  // Callback para actualizar tabla tras añadir
  const handleAddReview = (newReview) => {
    // Simplemente volvemos a cargar todas las reseñas para incluir la nueva
    // (Alternativa: añadirla manualmente al estado `reviews`)
    fetchReviews(); 
  };

  // Limpiamos logs
  // ... (Lógica de renderizado con isLoading y error)
  if (isLoading) {
      // console.log('[ManageReviews] Render: Mostrando estado de carga (isLoading=true)');
      return <div className="p-6">Cargando reseñas...</div>;
  }
  if (error) {
      // console.log('[ManageReviews] Render: Mostrando estado de error:', error);
      return <div className="p-6 text-red-500">Error: {error}</div>;
  }
  
  // console.log('[ManageReviews] Render: Mostrando tabla/mensaje. Count: ' + reviews.length);
  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Gestionar Reseñas</h1>
        {/* --- BOTÓN AÑADIR RESEÑA --- */}
        <button
          onClick={() => setIsAddingReview(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <FaPlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Añadir Reseña
        </button>
      </div>
      {reviews.length === 0 ? (
        <p>No hay reseñas para mostrar.</p>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puntuación</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comentario</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reviews.map((review) => (
                <tr key={review._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{review.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      {[...Array(review.rating)].map((_, i) => <FaStar key={i} className="text-yellow-400" />)}
                      {[...Array(5 - review.rating)].map((_, i) => <FaStar key={i} className="text-gray-300" />)}
                      <span className="ml-1">({review.rating})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={review.comment}>{review.comment}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ 
                        review.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        review.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800' 
                    }`}>
                      {review.status === 'approved' ? 'Aprobado' : review.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center space-x-2">
                    {review.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleUpdateStatus(review._id, 'approved')} 
                          title="Aprobar"
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100 transition"
                        >
                          <FaCheck />
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(review._id, 'rejected')} 
                          title="Rechazar"
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100 transition"
                        >
                          <FaTimes />
                        </button>
                      </>
                    )}
                     {review.status === 'approved' && (
                         <button 
                           onClick={() => handleUpdateStatus(review._id, 'rejected')} 
                           title="Marcar como Rechazado"
                           className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100 transition"
                         >
                           <FaTimes />
                         </button>
                     )}
                     {review.status === 'rejected' && (
                         <button 
                           onClick={() => handleUpdateStatus(review._id, 'approved')} 
                           title="Marcar como Aprobado"
                           className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100 transition"
                         >
                           <FaCheck />
                         </button>
                     )}
                    <button 
                      onClick={() => setEditingReview(review)} 
                      title="Editar"
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-100 transition"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleDelete(review._id)} 
                      title="Eliminar"
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100 transition"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingReview && (
        <EditReviewModal 
          review={editingReview} 
          onClose={() => setEditingReview(null)} 
          onSave={handleEditSave} 
          // No necesitamos pasar token si apiClient lo maneja
        />
      )}

      {isAddingReview && (
        <AddReviewModal 
          onClose={() => setIsAddingReview(false)} 
          onAdd={handleAddReview} 
        />
      )}
    </div>
  );
} 