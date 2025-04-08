import React from 'react';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaSync } from 'react-icons/fa';

const ErrorFallback = ({ error, resetErrorBoundary, retryAction }) => {
  // Determinar el tipo de error para mostrar mensajes personalizados
  const isNetworkError = error?.message?.includes('Network Error') || 
                         error?.status === 500 || 
                         error?.message?.includes('conexión');
                         
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg border-l-4 border-red-500"
        >
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 flex-shrink-0 rounded-full bg-red-100 flex items-center justify-center text-red-500">
              <FaExclamationTriangle size={24} />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {isNetworkError ? 'Error de conexión' : 'Algo salió mal'}
              </h2>
              <p className="text-gray-600">
                {isNetworkError 
                  ? 'No pudimos conectar con el servidor. Por favor, verifica tu conexión a internet.'
                  : 'Se produjo un error al cargar la información.'}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-gray-700">
              {isNetworkError 
                ? 'El servidor no está respondiendo en este momento. Esto puede deberse a problemas de red o a que el servidor está en mantenimiento.'
                : error?.message || 'Error desconocido'}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={retryAction || resetErrorBoundary}
              className="flex-1 bg-[var(--color-primary)] text-white px-6 py-3 rounded hover:bg-[var(--color-primary-dark)] transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" />
              Reintentar
            </button>
            {isNetworkError && (
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded hover:bg-gray-300 transition-colors"
              >
                Recargar página
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ErrorFallback; 