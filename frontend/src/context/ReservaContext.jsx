"use client";

import { createContext, useContext, useState, useEffect } from 'react';

// Crear el contexto
const ReservaContext = createContext();

// Hook personalizado para usar el contexto
export const useReserva = () => {
  const context = useContext(ReservaContext);
  if (!context) {
    throw new Error('useReserva debe usarse dentro de un ReservaProvider');
  }
  return context;
};

// Proveedor del contexto
export const ReservaProvider = ({ children }) => {
  // Estado inicial del formulario
  const [formData, setFormData] = useState({
    tipoEvento: '',
    fecha: '',
    numeroHabitaciones: 0,
    modoGestionHabitaciones: '',
    habitacionesSeleccionadas: [],
    modoGestionServicios: 'usuario',
    serviciosSeleccionados: [],
    aceptaPoliticas: false,
    datosContacto: {
      nombre: '',
      apellidos: '',
      email: '',
      telefono: '',
      mensaje: ''
    }
  });

  // Función para actualizar una sección específica del formulario
  const updateFormSection = (section, value) => {
    setFormData(prevData => ({
      ...prevData,
      [section]: value
    }));
  };

  // Función para reiniciar el formulario
  const resetForm = () => {
    setFormData({
      tipoEvento: '',
      fecha: '',
      numeroHabitaciones: 0,
      modoGestionHabitaciones: '',
      habitacionesSeleccionadas: [],
      modoGestionServicios: 'usuario',
      serviciosSeleccionados: [],
      datosContacto: {
        nombre: '',
        apellidos: '',
        email: '',
        telefono: '',
        mensaje: ''
      }
    });
  };

  // Cargar datos del formulario desde localStorage al iniciar
  useEffect(() => {
    const savedFormData = localStorage.getItem('reservaFormData');
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setFormData(parsedData);
      } catch (error) {
        console.error('Error al parsear los datos guardados:', error);
      }
    }
  }, []);

  // Guardar datos del formulario en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem('reservaFormData', JSON.stringify(formData));
  }, [formData]);

  // Valor del contexto que se proporcionará
  const value = {
    formData,
    updateFormSection,
    resetForm
  };

  return (
    <ReservaContext.Provider value={value}>
      {children}
    </ReservaContext.Provider>
  );
};
