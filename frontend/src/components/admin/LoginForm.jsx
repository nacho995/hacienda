'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { FaEnvelope, FaLock, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminLoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const { login } = useAuth();
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      // Limpiar mensajes de error anteriores
      setErrorMessage(null);
      setIsSubmitting(true);
      
      // Llamar a la función de login del contexto de autenticación
      const result = await login(data.email, data.password);
      
      if (result.success) {
        toast.success('Sesión iniciada correctamente');
        // Redirigir al dashboard después de un pequeño retraso
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 500);
      } else {
        // Mostrar error en el formulario y con toast
        setErrorMessage(result.message || 'Credenciales incorrectas');
        toast.error(result.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error en login:', error);
      setErrorMessage('Error al conectar con el servidor. Inténtelo de nuevo más tarde.');
      toast.error('Error al iniciar sesión. Inténtelo de nuevo más tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-2xl font-semibold text-center text-white mb-8 drop-shadow-md">
        Acceso Administrativo
      </h2>
      
      {/* Mensaje de error general */}
      {errorMessage && (
        <div className="bg-red-900/60 border border-red-600 p-3 rounded-lg text-red-200 text-sm flex items-start">
          <FaExclamationTriangle className="flex-shrink-0 mr-2 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
      
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-base font-medium text-white mb-2 drop-shadow-sm">
          Correo Electrónico
        </label>
        <div className="relative">
          <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" />
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
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-700 bg-black/50 text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base"
            disabled={isSubmitting}
            autoComplete="email"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-300 flex items-start font-medium drop-shadow-sm">
            <FaExclamationTriangle className="flex-shrink-0 mr-2 mt-0.5" />
            <span>{errors.email.message}</span>
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-base font-medium text-white mb-2 drop-shadow-sm">
          Contraseña
        </label>
        <div className="relative">
          <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" />
          <input
            type="password"
            id="password"
            {...register('password', { 
              required: 'La contraseña es obligatoria'
            })}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-700 bg-black/50 text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base"
            disabled={isSubmitting}
            autoComplete="current-password"
          />
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-300 flex items-start font-medium drop-shadow-sm">
            <FaExclamationTriangle className="flex-shrink-0 mr-2 mt-0.5" />
            <span>{errors.password.message}</span>
          </p>
        )}
      </div>

      <button
        type="submit"
        className={`w-full py-3 rounded-lg text-lg font-medium ${
          isSubmitting 
            ? 'bg-gray-600 cursor-not-allowed text-white/70' 
            : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-colors'
        }`}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </button>
    </form>
  );
} 