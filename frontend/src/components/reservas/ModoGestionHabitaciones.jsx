"use client";

import { useState } from 'react';
import { FaUserCog, FaUsers, FaChevronRight, FaEnvelope, FaFileExcel } from 'react-icons/fa';

const ModoGestionHabitaciones = ({ onModeSelect }) => {
  const [selectedMode, setSelectedMode] = useState(null);

  const handleSelectMode = (mode) => {
    setSelectedMode(mode);
  };

  const handleContinue = () => {
    if (selectedMode) {
      onModeSelect(selectedMode);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-4">
          Gestión de Habitaciones
        </h2>
        <p className="text-gray-600 mb-6">
          Seleccione cómo desea gestionar la asignación de habitaciones para su evento.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Opción 1: Gestión por el usuario */}
        <div
          onClick={() => handleSelectMode('usuario')}
          className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
            selectedMode === 'usuario'
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
              : 'border-gray-200 hover:border-[var(--color-primary)]/50'
          }`}
        >
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mr-4">
              <FaUsers className="w-8 h-8 text-[var(--color-primary)]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Gestión por el Organizador</h3>
              <p className="text-sm text-gray-500">Usted asigna las habitaciones y huéspedes</p>
            </div>
          </div>
          
          <ul className="space-y-2 text-gray-600 mb-4">
            <li className="flex items-start">
              <span className="w-5 h-5 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></span>
              </span>
              <span>Usted asigna las habitaciones para cada huésped</span>
            </li>
            <li className="flex items-start">
              <span className="w-5 h-5 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></span>
              </span>
              <span>Usted establece las fechas de entrada y salida</span>
            </li>
            <li className="flex items-start">
              <span className="w-5 h-5 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></span>
              </span>
              <span>Información completa en la confirmación de reserva</span>
            </li>
          </ul>
          
          <div className="text-sm text-gray-500 italic">
            Recomendado si ya tiene la información de todos los huéspedes
          </div>
        </div>

        {/* Opción 2: Gestión por la hacienda */}
        <div
          onClick={() => handleSelectMode('hacienda')}
          className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
            selectedMode === 'hacienda'
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
              : 'border-gray-200 hover:border-[var(--color-primary)]/50'
          }`}
        >
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center mr-4">
              <FaUserCog className="w-8 h-8 text-[var(--color-accent)]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Gestión por la Hacienda</h3>
              <p className="text-sm text-gray-500">El personal de la hacienda gestiona los detalles</p>
            </div>
          </div>
          
          <ul className="space-y-2 text-gray-600 mb-4">
            <li className="flex items-start">
              <span className="w-5 h-5 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]"></span>
              </span>
              <span>El personal asignará las habitaciones según disponibilidad</span>
            </li>
            <li className="flex items-start">
              <span className="w-5 h-5 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]"></span>
              </span>
              <span>Recibirá un email con un enlace para proporcionar los datos de huéspedes</span>
            </li>
            <li className="flex items-start">
              <span className="w-5 h-5 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]"></span>
              </span>
              <span>Posibilidad de cargar datos mediante Excel o formulario</span>
            </li>
          </ul>
          
          <div className="text-sm text-gray-500 italic">
            Recomendado si aún no tiene la información completa de los huéspedes
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center mt-8">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!selectedMode}
          className={`px-8 py-3 rounded-lg transition-all duration-300 flex items-center space-x-2 ${
            selectedMode 
              ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white' 
              : 'bg-gray-200 cursor-not-allowed text-gray-500'
          }`}
        >
          <span className="font-medium">Continuar</span>
          <FaChevronRight />
        </button>
      </div>

      {selectedMode === 'hacienda' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <FaEnvelope className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-700">Información importante</h4>
              <p className="text-sm text-blue-600 mt-1">
                Al seleccionar esta opción, se enviará un correo electrónico al personal de la hacienda con los detalles de su reserva.
                Ellos se pondrán en contacto con usted para gestionar la asignación de habitaciones y recopilar la información de los huéspedes.
              </p>
              <div className="mt-3 flex items-center text-sm text-blue-600">
                <FaFileExcel className="mr-2" />
                <span>También podrá cargar un archivo Excel con los datos de los huéspedes a través del panel de administración.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModoGestionHabitaciones;
