import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaTrashAlt } from 'react-icons/fa';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  iconType = 'warning', // 'warning', 'success', 'danger', 'delete'
}) => {
  
  const getIcon = () => {
    switch (iconType) {
      case 'success':
        return <FaCheckCircle className="h-6 w-6 text-green-600" aria-hidden="true" />;
      case 'danger':
        return <FaTimesCircle className="h-6 w-6 text-red-600" aria-hidden="true" />;
       case 'delete':
        return <FaTrashAlt className="h-6 w-6 text-red-600" aria-hidden="true" />;
      case 'warning':
      default:
        return <FaExclamationTriangle className="h-6 w-6 text-yellow-600" aria-hidden="true" />;
    }
  };

  const getConfirmButtonClass = () => {
     switch (iconType) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700 focus-visible:ring-green-500';
      case 'danger':
      case 'delete':
        return 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500';
      case 'warning':
      default:
        return 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500'; // Default action color
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex items-center"
                >
                 <span className="mr-2">{getIcon()}</span> 
                  {title || 'Confirmación Requerida'}
                </Dialog.Title>
                <div className="mt-3">
                  <p className="text-sm text-gray-600">
                    {message || '¿Estás seguro de que deseas realizar esta acción?'}
                  </p>
                </div>

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:col-start-2 sm:text-sm ${getConfirmButtonClass()}`}
                    onClick={() => {
                      onConfirm();
                      onClose(); // Close modal after confirm
                    }}
                  >
                    {confirmText}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                    onClick={onClose}
                  >
                    {cancelText}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ConfirmationModal; 