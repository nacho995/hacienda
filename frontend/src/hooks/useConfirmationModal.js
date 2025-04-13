'use client';

import { useConfirmationModalContext } from '@/context/ConfirmationModalContext';

/**
 * Hook personalizado para mostrar un modal de confirmación global.
 * @returns {{ showConfirmation: (config: { title: string, message: string, confirmText?: string, cancelText?: string, onConfirm: () => Promise<void> | void, iconType?: 'warning' | 'success' | 'danger' | 'delete' }) => void }}
 */
export const useConfirmationModal = () => {
  const { showConfirmation } = useConfirmationModalContext();
  return { showConfirmation };
}; 