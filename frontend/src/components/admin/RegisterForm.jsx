"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';

export default function AdminRegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const { register: registerUser } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  const password = watch('password', '');

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Llamar a la función de registro del contexto de autenticación
      const result = await registerUser({
        nombre: data.nombre,
        apellidos: data.apellido,
        email: data.email,
        password: data.password,
        telefono: data.telefono,
        motivo: data.motivo,
        role: 'admin_pendiente'
      });
      
      if (result.success) {
        setRegistrationComplete(true);
        toast.success('Solicitud enviada correctamente');
      } else {
        toast.error(result.message || 'Error al registrar la solicitud');
      }
    } catch (error) {
      console.error('Error en registro:', error);
      toast.error('Error al registrar. Inténtelo de nuevo más tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (registrationComplete) {
    return (
      <div className="bg-black/60 backdrop-blur-md p-8 rounded-lg text-center">
        <div className="w-16 h-16 bg-green-100/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-white mb-4 drop-shadow-md">
          Solicitud Enviada
        </h2>
        <p className="text-gray-200 mb-4 drop-shadow-sm">
          Tu solicitud de registro ha sido enviada correctamente. Un administrador revisará tu información y aprobará tu cuenta tras verificar tu identidad.
        </p>
        <div className="bg-blue-900/40 p-4 rounded-lg mb-6">
          <p className="text-blue-200 text-sm font-medium">
            <strong>Importante:</strong> Por motivos de seguridad, se ha enviado una notificación a los administradores del sistema para verificar tu solicitud. Este proceso puede tardar hasta 24 horas hábiles.
          </p>
        </div>
        <p className="text-gray-200 mb-4 drop-shadow-sm">
          Recibirás un correo electrónico cuando tu cuenta sea activada.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-2xl font-semibold text-center text-white mb-8 drop-shadow-md">
        Solicitud de Registro Administrativo
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre */}
        <div>
          <label htmlFor="nombre" className="block text-base font-medium text-white mb-2 drop-shadow-sm">
            Nombre
          </label>
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" />
            <input
              type="text"
              id="nombre"
              {...register('nombre', { 
                required: 'El nombre es obligatorio'
              })}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-700 bg-black/50 text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base"
              disabled={isSubmitting}
            />
          </div>
          {errors.nombre && (
            <p className="mt-1 text-sm text-red-300 flex items-start font-medium drop-shadow-sm">
              <FaExclamationTriangle className="flex-shrink-0 mr-2 mt-0.5" />
              <span>{errors.nombre.message}</span>
            </p>
          )}
        </div>
          
        {/* Apellido */}
        <div>
          <label htmlFor="apellido" className="block text-base font-medium text-white mb-2 drop-shadow-sm">
            Apellido
          </label>
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" />
            <input
              type="text"
              id="apellido"
              {...register('apellido', { 
                required: 'El apellido es obligatorio'
              })}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-700 bg-black/50 text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base"
              disabled={isSubmitting}
            />
          </div>
          {errors.apellido && (
            <p className="mt-1 text-sm text-red-300 flex items-start font-medium drop-shadow-sm">
              <FaExclamationTriangle className="flex-shrink-0 mr-2 mt-0.5" />
              <span>{errors.apellido.message}</span>
            </p>
          )}
        </div>
      </div>
        
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
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-300 flex items-start font-medium drop-shadow-sm">
            <FaExclamationTriangle className="flex-shrink-0 mr-2 mt-0.5" />
            <span>{errors.email.message}</span>
          </p>
        )}
      </div>

      {/* Teléfono */}
      <div>
        <label htmlFor="telefono" className="block text-base font-medium text-white mb-2 drop-shadow-sm">
          Teléfono
        </label>
        <div className="relative">
          <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" />
          <input
            type="tel"
            id="telefono"
            {...register('telefono', { 
              required: 'El teléfono es obligatorio'
            })}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-700 bg-black/50 text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base"
            disabled={isSubmitting}
          />
        </div>
        {errors.telefono && (
          <p className="mt-1 text-sm text-red-300 flex items-start font-medium drop-shadow-sm">
            <FaExclamationTriangle className="flex-shrink-0 mr-2 mt-0.5" />
            <span>{errors.telefono.message}</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                required: 'La contraseña es obligatoria',
                minLength: {
                  value: 8,
                  message: 'La contraseña debe tener al menos 8 caracteres'
                }
              })}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-700 bg-black/50 text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base"
              disabled={isSubmitting}
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-300 flex items-start font-medium drop-shadow-sm">
              <FaExclamationTriangle className="flex-shrink-0 mr-2 mt-0.5" />
              <span>{errors.password.message}</span>
            </p>
          )}
        </div>
        
        {/* Confirmar Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-base font-medium text-white mb-2 drop-shadow-sm">
            Confirmar Contraseña
          </label>
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" />
            <input
              type="password"
              id="confirmPassword"
              {...register('confirmPassword', { 
                required: 'Debe confirmar la contraseña',
                validate: value => value === password || 'Las contraseñas no coinciden'
              })}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-700 bg-black/50 text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base"
              disabled={isSubmitting}
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-300 flex items-start font-medium drop-shadow-sm">
              <FaExclamationTriangle className="flex-shrink-0 mr-2 mt-0.5" />
              <span>{errors.confirmPassword.message}</span>
            </p>
          )}
        </div>
      </div>

      {/* Motivo */}
      <div>
        <label htmlFor="motivo" className="block text-base font-medium text-white mb-2 drop-shadow-sm">
          Motivo de la solicitud
        </label>
        <textarea
          id="motivo"
          {...register('motivo', { 
            required: 'Por favor explique el motivo de su solicitud'
          })}
          rows="4"
          className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-black/50 text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base"
          disabled={isSubmitting}
          placeholder="Explique brevemente por qué necesita acceso al panel de administración"
        ></textarea>
        {errors.motivo && (
          <p className="mt-1 text-sm text-red-300 flex items-start font-medium drop-shadow-sm">
            <FaExclamationTriangle className="flex-shrink-0 mr-2 mt-0.5" />
            <span>{errors.motivo.message}</span>
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
        {isSubmitting ? 'Enviando solicitud...' : 'Enviar Solicitud'}
      </button>
    </form>
  );
} 