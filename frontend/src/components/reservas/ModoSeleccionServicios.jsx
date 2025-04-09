"use client";

import React from 'react';
import { FaUserFriends, FaUserTie, FaArrowRight } from 'react-icons/fa';

const ModoSeleccionServicios = ({ onModoSeleccionado }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold text-[var(--color-primary)] mb-4">¿Quién seleccionará los servicios para su evento?</h2>
      
      <div className="bg-[#F9F5F0] border border-[#D1B59B] rounded-lg p-4 mb-6">
        <p className="text-[#8A6E52]">
          Puede elegir entre seleccionar usted mismo los servicios para su evento o dejar que nuestros organizadores profesionales se encarguen de todo.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Opción: Cliente selecciona */}
        <div 
          onClick={() => onModoSeleccionado('cliente')}
          className="border-2 border-[#D1B59B] rounded-xl p-6 hover:bg-[#F9F5F0] transition-colors cursor-pointer"
        >
          <div className="flex items-center mb-4">
            <div className="w-14 h-14 rounded-full bg-[#F0E8DC] flex items-center justify-center mr-4">
              <FaUserFriends className="text-2xl text-[#A5856A]" />
            </div>
            <h3 className="text-xl font-semibold text-[#5D4B3A]">Selección por el cliente</h3>
          </div>
          
          <p className="text-gray-600 mb-4">
            Usted seleccionará todos los servicios que desea para su evento. Tendrá acceso a nuestro catálogo completo con descripciones detalladas y precios.
          </p>
          
          <div className="bg-[#F0E8DC] p-3 rounded-lg">
            <h4 className="font-medium text-[#5D4B3A] mb-2">Recomendado si:</h4>
            <ul className="list-disc pl-5 text-[#8A6E52] space-y-1">
              <li>Tiene preferencias específicas para su evento</li>
              <li>Desea explorar todas las opciones disponibles</li>
              <li>Quiere personalizar cada detalle de su evento</li>
            </ul>
          </div>
          
          <div className="mt-4 text-right">
            <button className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg flex items-center ml-auto">
              <span>Seleccionar</span>
              <FaArrowRight className="ml-2" />
            </button>
          </div>
        </div>
        
        {/* Opción: Organizadores seleccionan */}
        <div 
          onClick={() => onModoSeleccionado('organizador')}
          className="border-2 border-[#D1B59B] rounded-xl p-6 hover:bg-[#F9F5F0] transition-colors cursor-pointer"
        >
          <div className="flex items-center mb-4">
            <div className="w-14 h-14 rounded-full bg-[#F0E8DC] flex items-center justify-center mr-4">
              <FaUserTie className="text-2xl text-[#A5856A]" />
            </div>
            <h3 className="text-xl font-semibold text-[#5D4B3A]">Selección por organizadores</h3>
          </div>
          
          <p className="text-gray-600 mb-4">
            Nuestros organizadores profesionales se pondrán en contacto con usted para conocer sus preferencias y se encargarán de seleccionar los servicios más adecuados para su evento.
          </p>
          
          <div className="bg-[#F0E8DC] p-3 rounded-lg">
            <h4 className="font-medium text-[#5D4B3A] mb-2">Recomendado si:</h4>
            <ul className="list-disc pl-5 text-[#8A6E52] space-y-1">
              <li>Prefiere un proceso más sencillo y guiado</li>
              <li>Desea aprovechar la experiencia de nuestros profesionales</li>
              <li>No tiene tiempo para revisar todas las opciones disponibles</li>
            </ul>
          </div>
          
          <div className="mt-4 text-right">
            <button className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg flex items-center ml-auto">
              <span>Seleccionar</span>
              <FaArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModoSeleccionServicios;
