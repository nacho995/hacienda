'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaUser, FaEnvelope, FaLock, FaBuilding, FaPhone, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

export default function AdminRegistro() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    empresa: '',
    telefono: '',
    motivo: ''
  });
  
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores al editar
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Validación básica
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    
    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es obligatorio';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    }
    
    if (!formData.motivo.trim()) {
      newErrors.motivo = 'Por favor explique el motivo de su solicitud';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setSubmitting(true);
      
      // Simulamos una petición a la API
      setTimeout(() => {
        setSubmitting(false);
        setRegistrationComplete(true);
        
        // Redirigir después de 5 segundos
        setTimeout(() => {
          router.push('/admin/login');
        }, 5000);
      }, 1500);
    }
  };
  
  if (registrationComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="text-green-500 text-2xl" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Solicitud Enviada
          </h2>
          <p className="text-gray-600 mb-6">
            Tu solicitud de registro ha sido enviada correctamente. Un administrador revisará tu información y aprobará tu cuenta.
          </p>
          <p className="text-gray-600 mb-8">
            Recibirás un correo electrónico cuando tu cuenta sea activada.
          </p>
          <div className="text-sm text-gray-500">
            Redireccionando a la página de inicio de sesión en 5 segundos...
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-xl w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="relative h-32 bg-[var(--color-primary)]">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-3xl font-[var(--font-display)] text-white text-center">
                Hacienda San Carlos
              </h1>
            </div>
          </div>

          {/* Formulario */}
          <div className="p-8">
            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-8">
              Solicitud de Registro Administrativo
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre */}
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                        errors.nombre ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[var(--color-primary)]'
                      } focus:border-transparent focus:ring-2`}
                    />
                  </div>
                  {errors.nombre && (
                    <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                  )}
                </div>
                
                {/* Apellido */}
                <div>
                  <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="apellido"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                        errors.apellido ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[var(--color-primary)]'
                      } focus:border-transparent focus:ring-2`}
                    />
                  </div>
                  {errors.apellido && (
                    <p className="mt-1 text-sm text-red-600">{errors.apellido}</p>
                  )}
                </div>
              </div>
              
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[var(--color-primary)]'
                    } focus:border-transparent focus:ring-2`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                        errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[var(--color-primary)]'
                      } focus:border-transparent focus:ring-2`}
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>
                
                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                        errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[var(--color-primary)]'
                      } focus:border-transparent focus:ring-2`}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Empresa */}
                <div>
                  <label htmlFor="empresa" className="block text-sm font-medium text-gray-700 mb-1">
                    Empresa/Organización (Opcional)
                  </label>
                  <div className="relative">
                    <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="empresa"
                      name="empresa"
                      value={formData.empresa}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    />
                  </div>
                </div>
                
                {/* Teléfono */}
                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <div className="relative">
                    <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                        errors.telefono ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[var(--color-primary)]'
                      } focus:border-transparent focus:ring-2`}
                    />
                  </div>
                  {errors.telefono && (
                    <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
                  )}
                </div>
              </div>
              
              {/* Motivo */}
              <div>
                <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo de Solicitud
                </label>
                <textarea
                  id="motivo"
                  name="motivo"
                  rows="4"
                  value={formData.motivo}
                  onChange={handleChange}
                  className={`w-full pl-4 pr-4 py-3 rounded-lg border ${
                    errors.motivo ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[var(--color-primary)]'
                  } focus:border-transparent focus:ring-2`}
                  placeholder="Por favor, explica por qué necesitas acceso al panel administrativo..."
                ></textarea>
                {errors.motivo && (
                  <p className="mt-1 text-sm text-red-600">{errors.motivo}</p>
                )}
              </div>
              
              {/* Nota Informativa */}
              <div className="bg-blue-50 p-4 rounded-lg flex items-start">
                <FaExclamationTriangle className="text-blue-500 mr-3 mt-1 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  La solicitud será revisada por un administrador. Recibirás un correo electrónico cuando tu cuenta sea aprobada.
                </p>
              </div>
              
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg text-lg font-medium hover:bg-[var(--color-primary-dark)] transition-colors flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Enviando...
                  </>
                ) : 'Enviar Solicitud'}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                ¿Ya tienes una cuenta?{' '}
                <Link href="/admin/login" className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors">
                  Iniciar Sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} Hacienda San Carlos Borromeo.
          <br />
          Todos los derechos reservados.
        </div>
      </div>
    </div>
  );
} 