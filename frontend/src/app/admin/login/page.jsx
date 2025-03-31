"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaLock } from 'react-icons/fa';
import Image from 'next/image';

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Aquí iría la lógica de autenticación
      // Por ahora solo redirigimos
      router.push('/admin/dashboard');
    } catch (err) {
      setError('Credenciales inválidas');
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full mx-4">
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
                <div className="bg-red-50 text-red-500 p-4 rounded-lg text-sm text-center">
                  {error}
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
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg text-lg font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
              >
                Iniciar Sesión
              </button>
            </form>

            <div className="mt-6 text-center">
              <a
                href="#"
                className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </a>
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