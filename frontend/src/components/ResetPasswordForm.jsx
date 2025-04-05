'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { FaLock, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import authService from '@/services/authService';
import Link from 'next/link';

export default function ResetPasswordForm({ token }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReset, setIsReset] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password', '');

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      if (data.password !== data.confirmPassword) {
        toast.error('Las contraseñas no coinciden');
        return;
      }
      
      const result = await authService.resetPassword(token, data.password);
      
      if (result.success) {
        setIsReset(true);
        toast.success(result.message || 'Contraseña restablecida exitosamente');
      } else {
        toast.error(result.message || 'Error al restablecer contraseña');
      }
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      toast.error('Error al restablecer contraseña. Inténtalo de nuevo más tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isReset) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center">
          <FaCheckCircle className="mx-auto text-green-500 text-5xl mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            ¡Contraseña Restablecida!
          </h2>
          <p className="text-gray-600 mb-6">
            Tu contraseña ha sido restablecida correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
          </p>
          <div className="mt-6">
            <Link 
              href="/login"
              className="inline-block px-6 py-3 bg-[var(--color-primary)] text-white font-medium rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Restablece tu Contraseña
        </h2>
        <p className="text-gray-600">
          Ingresa tu nueva contraseña para acceder a tu cuenta.
        </p>
      </div>
      
      {/* Nueva Contraseña */}
      <div>
        <label htmlFor="password" className="block text-base font-medium text-gray-700 mb-2">
          Nueva Contraseña
        </label>
        <div className="relative">
          <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="password"
            id="password"
            {...register('password', { 
              required: 'La contraseña es obligatoria',
              minLength: {
                value: 6,
                message: 'La contraseña debe tener al menos 6 caracteres'
              }
            })}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base"
            disabled={isSubmitting}
          />
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600 flex items-start font-medium">
            <FaExclamationTriangle className="flex-shrink-0 mr-2 mt-0.5" />
            <span>{errors.password.message}</span>
          </p>
        )}
      </div>

      {/* Confirmar Contraseña */}
      <div>
        <label htmlFor="confirmPassword" className="block text-base font-medium text-gray-700 mb-2">
          Confirmar Contraseña
        </label>
        <div className="relative">
          <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="password"
            id="confirmPassword"
            {...register('confirmPassword', { 
              required: 'Por favor confirma tu contraseña',
              validate: value => value === password || 'Las contraseñas no coinciden'
            })}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base"
            disabled={isSubmitting}
          />
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600 flex items-start font-medium">
            <FaExclamationTriangle className="flex-shrink-0 mr-2 mt-0.5" />
            <span>{errors.confirmPassword.message}</span>
          </p>
        )}
      </div>

      <button
        type="submit"
        className={`w-full py-3 rounded-lg text-lg font-medium ${
          isSubmitting 
            ? 'bg-gray-400 cursor-not-allowed text-white' 
            : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-colors'
        }`}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Procesando...' : 'Restablecer Contraseña'}
      </button>
      
      <div className="text-center mt-4">
        <Link 
          href="/login"
          className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors text-sm"
        >
          Volver a Iniciar Sesión
        </Link>
      </div>
    </form>
  );
} 