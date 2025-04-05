'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { FaEnvelope, FaExclamationTriangle } from 'react-icons/fa';
import authService from '@/services/authService';
import Link from 'next/link';

export default function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      const result = await authService.forgotPassword(data.email);
      
      if (result.success) {
        setEmailSent(true);
        toast.success(result.message || 'Instrucciones enviadas a tu correo electrónico');
      } else {
        toast.error(result.message || 'Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('Error en recuperación de contraseña:', error);
      toast.error('Error al procesar la solicitud. Inténtalo de nuevo más tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (emailSent) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Instrucciones Enviadas
          </h2>
          <p className="text-gray-600 mb-6">
            Hemos enviado instrucciones para restablecer tu contraseña al correo electrónico proporcionado. 
            Por favor, revisa tu bandeja de entrada y sigue las instrucciones para completar el proceso.
          </p>
          <div className="mt-6">
            <Link 
              href="/login"
              className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors"
            >
              Volver a Iniciar Sesión
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
          ¿Olvidaste tu contraseña?
        </h2>
        <p className="text-gray-600">
          Ingresa tu correo electrónico y te enviaremos instrucciones para restablecerla.
        </p>
      </div>
      
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-base font-medium text-gray-700 mb-2">
          Correo Electrónico
        </label>
        <div className="relative">
          <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            id="email"
            {...register('email', { 
              required: 'El correo electrónico es obligatorio',
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: 'Formato de email inválido'
              }
            })}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base"
            disabled={isSubmitting}
            autoComplete="email"
            placeholder="tu@email.com"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600 flex items-start font-medium">
            <FaExclamationTriangle className="flex-shrink-0 mr-2 mt-0.5" />
            <span>{errors.email.message}</span>
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
        {isSubmitting ? 'Enviando...' : 'Enviar Instrucciones'}
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