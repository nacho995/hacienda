'use client';

import React, { createContext, useState, useContext, useCallback } from 'react';

const ConfirmationModalContext = createContext();

export const useConfirmationModalContext = () => {
  const context = useContext(ConfirmationModalContext);
  if (!context) {
    throw new Error('useConfirmationModalContext debe usarse dentro de un ConfirmationModalProvider');
  }
  return context;
};

export const ConfirmationModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    config: null, // { title, message, confirmText, cancelText, onConfirm, iconType }
  });

  const showConfirmation = useCallback((config) => {
    setModalState({ isOpen: true, config });
  }, []);

  const hideConfirmation = useCallback(() => {
    setModalState({ isOpen: false, config: null });
  }, []);

  const handleConfirm = useCallback(async () => {
    if (modalState.config?.onConfirm) {
      try {
        await modalState.config.onConfirm();
      } catch (error) {
        // El error debería manejarse donde se define onConfirm (usualmente con toast)
        console.error('Error al ejecutar onConfirm del modal:', error);
      } finally {
        hideConfirmation();
      }
    } else {
      hideConfirmation();
    }
  }, [modalState.config, hideConfirmation]);

  const value = {
    isOpen: modalState.isOpen,
    config: modalState.config,
    showConfirmation,
    hideConfirmation, // Renombrado de onClose a hideConfirmation para claridad interna
    handleConfirm // Renombrado de onConfirm a handleConfirm para claridad interna
  };

  return (
    <ConfirmationModalContext.Provider value={value}>
      {children}
    </ConfirmationModalContext.Provider>
  );
}; 