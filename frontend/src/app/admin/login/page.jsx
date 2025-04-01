"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaLock, FaExclamationTriangle } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

// Usuarios de administración predefinidos
const ADMIN_USERS = [
  {
    email: 'admin@haciendasancarlos.com',
    password: 'admin123', // En una aplicación real, esto debería estar hasheado
    role: 'Administrador',
    name: 'Admin Principal'
  },
  {
    email: 'manager@haciendasancarlos.com',
    password: 'manager123',
    role: 'Gestor',
    name: 'Gestor de Eventos'
  }
];

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (locked) {
      setError('Demasiados intentos fallidos. Por favor, espere 15 minutos antes de intentar nuevamente.');
      return;
    }
    
    setError('');

    try {
      // Verificar credenciales con la lista predefinida
      const user = ADMIN_USERS.find(user => 
        user.email === credentials.email && user.password === credentials.password
      );
      
      if (user) {
        // Crear objeto de sesión
        const sessionData = {
          email: user.email,
          role: user.role,
          name: user.name,
          authenticated: true,
          timestamp: new Date().getTime()
        };
        
        // Convertir a JSON string
        const sessionString = JSON.stringify(sessionData);
        
        // Establecer cookie de sesión (expira en 8 horas)
        document.cookie = `adminSession=${sessionString}; path=/; max-age=${60*60*8}`;
        
        console.log("Sesión establecida correctamente:", sessionString);
        
        // Redirigir directamente al dashboard
        router.push('/admin/dashboard');
      } else {
        // Incrementar contador de intentos fallidos
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        // Bloquear después de 5 intentos fallidos
        if (newAttempts >= 5) {
          setLocked(true);
          
          // Desbloquear después de 15 minutos
          setTimeout(() => {
            setLocked(false);
            setAttempts(0);
          }, 15 * 60 * 1000);
          
          setError('Demasiados intentos fallidos. Por favor, espere 15 minutos antes de intentar nuevamente.');
        } else {
          setError(`Credenciales inválidas. Intento ${newAttempts} de 5`);
        }
      }
    } catch (err) {
      console.error('Error en login:', err);
      setError('Error al iniciar sesión. Inténtelo de nuevo más tarde.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="admin-auth-page">
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full mx-4 my-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header con imagen */}
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
                Acceso Administrativo
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 text-red-500 p-4 rounded-lg text-sm flex items-start">
                    <FaExclamationTriangle className="flex-shrink-0 mr-2 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={credentials.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      required
                      disabled={locked}
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={credentials.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      required
                      disabled={locked}
                      autoComplete="off"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 rounded-lg text-lg font-medium ${
                    locked 
                      ? 'bg-gray-400 cursor-not-allowed text-white' 
                      : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-colors'
                  }`}
                  disabled={locked}
                >
                  Iniciar Sesión
                </button>
              </form>

              <div className="mt-6 text-center">
                <div className="text-sm text-red-600 font-semibold">
                  Acceso restringido solo para personal autorizado
                </div>
                <div className="mt-4">
                  <p className="text-gray-600 mb-4">
                    Sistema de administración interno
                  </p>
                  <div className="border-t pt-4">
                    <p className="text-gray-600 mb-2">¿No tienes una cuenta?</p>
                    <Link
                      href="/admin/registro"
                      className="inline-block px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Solicitar acceso
                    </Link>
                    <p className="text-xs text-gray-500 mt-2">
                      Tu solicitud será enviada a los administradores para aprobación
                    </p>
                  </div>
                </div>
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
    </div>
  );
} 