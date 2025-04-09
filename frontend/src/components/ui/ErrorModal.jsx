import React from 'react';

const ErrorModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative z-10">
        <div className="flex items-center mb-4">
          <div className="bg-red-100 p-2 rounded-full">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-red-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold ml-2">Error</h3>
        </div>
        
        <p className="text-gray-600 mb-6">{message}</p>
        
        <button
          onClick={onClose}
          className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default ErrorModal;
