'use client';

import { useState, useEffect } from 'react';
import { FaSave, FaUndo, FaCalendarAlt, FaEnvelope, FaShieldAlt, FaImage, FaMoneyBillWave, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'sonner';
import configService from '@/services/configService';

export default function AdminConfiguracion() {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [generalSettings, setGeneralSettings] = useState({
    nombreSitio: '',
    direccion: '',
    telefono: '',
    email: '',
    horarioAtencion: '',
    notificaciones: {
      nuevaReservacion: true,
      nuevoPago: true
    }
  });
  
  const [reservacionSettings, setReservacionSettings] = useState({
    minDiasAnticipacion: 14,
    maxDiasAnticipacion: 180,
    horaInicioDisponible: '10:00',
    horaFinDisponible: '23:00',
    tiempoMinimoEvento: 4,
    diasNoDisponibles: [],
  });
  
  const [pagosSettings, setPagosSettings] = useState({
    requeridoAnticipo: true,
    porcentajeAnticipo: 30,
    metodosAceptados: [],
    impuestos: 21,
  });

  const [metadataSettings, setMetadataSettings] = useState({
    siteTitle: '',
    siteDescription: '',
    keywords: '',
  });

  // Cargar configuración inicial
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        const response = await configService.getConfig();
        console.log('Configuración obtenida:', response);
        
        if (response && response.success && response.data) {
          // En caso de que la estructura de datos sea plana,
          // organizamos los datos en las categorías esperadas
          const config = response.data;
          
          setGeneralSettings({
            nombreSitio: config.nombreSitio || '',
            direccion: config.direccion || '',
            telefono: config.telefono || '',
            email: config.email || '',
            horarioAtencion: config.horarioAtencion || '',
            notificaciones: {
              nuevaReservacion: config.notificacionesEmail || true,
              nuevoPago: config.notificacionesEmail || true
            }
          });
          
          setReservacionSettings({
            minDiasAnticipacion: config.minDiasAnticipacion || 14,
            maxDiasAnticipacion: config.maxDiasAnticipacion || 180,
            horaInicioDisponible: config.horaInicioDisponible || '10:00',
            horaFinDisponible: config.horaFinDisponible || '23:00',
            tiempoMinimoEvento: config.tiempoMinimoEvento || 4,
            diasNoDisponibles: config.diasNoDisponibles || [],
          });
          
          setPagosSettings({
            requeridoAnticipo: config.requeridoAnticipo || true,
            porcentajeAnticipo: config.porcentajeAnticipo || 30,
            metodosAceptados: config.metodosAceptados || ['efectivo', 'transferencia'],
            impuestos: config.impuestos || 21,
          });
          
          setMetadataSettings({
            siteTitle: config.siteTitle || '',
            siteDescription: config.siteDescription || '',
            keywords: config.keywords?.join(', ') || '',
          });
        }
      } catch (error) {
        console.error('Error al cargar la configuración:', error);
        toast.error('Error al cargar la configuración');
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  // Validar fechas no disponibles
  const validateDates = (dates) => {
    return dates.every(date => {
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      if (!regex.test(date)) return false;
      const d = new Date(date);
      return d instanceof Date && !isNaN(d);
    });
  };

  // Guardar configuración
  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);

      // Validaciones
      if (pagosSettings.metodosAceptados.length === 0) {
        toast.error('Debe seleccionar al menos un método de pago');
        return;
      }

      if (!validateDates(reservacionSettings.diasNoDisponibles)) {
        toast.error('Hay fechas no disponibles con formato inválido');
        return;
      }

      const configData = {
        general: generalSettings,
        reservacion: reservacionSettings,
        pagos: pagosSettings,
        metadata: metadataSettings
      };

      await configService.updateConfig(configData);
      
      setSaveSuccess(true);
      toast.success('Configuración guardada correctamente');
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error al guardar la configuración:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Restaurar configuración por defecto
  const resetSettings = async () => {
    if (window.confirm('¿Estás seguro de que deseas restaurar la configuración por defecto? Esta acción no se puede deshacer.')) {
      try {
        setIsLoading(true);
        await configService.resetConfig();
        const defaultConfig = await configService.getConfig();
        
        setGeneralSettings(defaultConfig.general);
        setReservacionSettings(defaultConfig.reservacion);
        setPagosSettings(defaultConfig.pagos);
        setMetadataSettings(defaultConfig.metadata);
        
        toast.success('Configuración restaurada correctamente');
      } catch (error) {
        console.error('Error al restaurar la configuración:', error);
        toast.error('Error al restaurar la configuración');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Manejadores de cambios
  const handleGeneralChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('notificaciones.')) {
      const notificationKey = name.split('.')[1];
      setGeneralSettings(prev => ({
        ...prev,
        notificaciones: {
          ...prev.notificaciones,
          [notificationKey]: checked
        }
      }));
    } else {
      setGeneralSettings(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };
  
  const handleReservacionChange = (e) => {
    const { name, value } = e.target;
    if (name === 'diasNoDisponibles') {
      const dates = value.split(',').map(date => date.trim());
      setReservacionSettings(prev => ({
        ...prev,
        [name]: dates
      }));
    } else {
      setReservacionSettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handlePagosChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPagosSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleMetadataChange = (e) => {
    const { name, value } = e.target;
    setMetadataSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-[var(--font-display)] text-gray-800">
            Configuración
          </h1>
          <p className="text-gray-600 mt-2">
            Administra los ajustes y parámetros del sitio
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={resetSettings}
            className="px-4 py-2 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FaUndo />
            <span>Restaurar</span>
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-4 py-2 flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <FaSave />
            )}
            <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </div>
      
      {saveSuccess && (
        <div className="bg-green-100 text-green-800 p-4 rounded-lg flex items-center">
          <FaCheckCircle className="mr-2" />
          Configuración guardada correctamente
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex border-b">
          <button
            className={`py-4 px-6 font-medium ${activeTab === 'general' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button
            className={`py-4 px-6 font-medium ${activeTab === 'reservacion' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('reservacion')}
          >
            Reservaciones
          </button>
          <button
            className={`py-4 px-6 font-medium ${activeTab === 'pagos' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('pagos')}
          >
            Pagos
          </button>
          <button
            className={`py-4 px-6 font-medium ${activeTab === 'seo' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('seo')}
          >
            SEO
          </button>
        </div>
        
        <div className="p-6">
          {/* Pestaña de Configuración General */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center space-x-2 text-gray-800">
                  <FaImage className="text-[var(--color-primary)]" />
                  <h2 className="text-xl font-semibold">Información General</h2>
                </div>
                <p className="text-gray-600 mt-2 mb-6">
                  Configura la información básica de tu negocio, incluyendo datos de contacto y preferencias de notificaciones. 
                  Esta información se mostrará en diferentes secciones del sitio web y se utilizará para las comunicaciones con los clientes.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Sitio
                  </label>
                  <input
                    type="text"
                    name="nombreSitio"
                    value={generalSettings.nombreSitio}
                    onChange={handleGeneralChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={generalSettings.direccion}
                    onChange={handleGeneralChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    name="telefono"
                    value={generalSettings.telefono}
                    onChange={handleGeneralChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={generalSettings.email}
                    onChange={handleGeneralChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horario de Atención
                  </label>
                  <input
                    type="text"
                    name="horarioAtencion"
                    value={generalSettings.horarioAtencion}
                    onChange={handleGeneralChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Este horario se mostrará en la página de contacto y el pie de página.
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-gray-700 flex items-center mb-2">
                  <FaEnvelope className="mr-2 text-[var(--color-primary)]" />
                  <h3 className="font-medium">Notificaciones por correo</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notifyNewReservation"
                      className="w-4 h-4 text-[var(--color-primary)] border-gray-300 rounded focus:ring-[var(--color-primary)]"
                      checked={generalSettings.notificaciones.nuevaReservacion}
                      onChange={(e) => handleGeneralChange({ target: { name: 'notificaciones.nuevaReservacion', checked: e.target.checked } })}
                    />
                    <label htmlFor="notifyNewReservation" className="ml-2 text-sm text-gray-700">
                      Recibir notificación cuando se cree una nueva reservación
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notifyNewPayment"
                      className="w-4 h-4 text-[var(--color-primary)] border-gray-300 rounded focus:ring-[var(--color-primary)]"
                      checked={generalSettings.notificaciones.nuevoPago}
                      onChange={(e) => handleGeneralChange({ target: { name: 'notificaciones.nuevoPago', checked: e.target.checked } })}
                    />
                    <label htmlFor="notifyNewPayment" className="ml-2 text-sm text-gray-700">
                      Recibir notificación cuando se registre un pago
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Pestaña de Configuración de Reservaciones */}
          {activeTab === 'reservacion' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center space-x-2 text-gray-800">
                  <FaCalendarAlt className="text-[var(--color-primary)]" />
                  <h2 className="text-xl font-semibold">Configuración de Reservaciones</h2>
                </div>
                <p className="text-gray-600 mt-2 mb-6">
                  Establece las reglas y límites para las reservaciones, como el tiempo mínimo de anticipación, horarios disponibles y fechas bloqueadas. 
                  Estas configuraciones afectarán directamente a las opciones que verán los clientes al realizar una reserva en el sitio web.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mínimo de días de anticipación
                  </label>
                  <input
                    type="number"
                    name="minDiasAnticipacion"
                    value={reservacionSettings.minDiasAnticipacion}
                    onChange={handleReservacionChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Cuántos días antes se puede hacer una reservación como mínimo.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Máximo de días de anticipación
                  </label>
                  <input
                    type="number"
                    name="maxDiasAnticipacion"
                    value={reservacionSettings.maxDiasAnticipacion}
                    onChange={handleReservacionChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Cuántos días antes se puede hacer una reservación como máximo.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora de inicio disponible
                  </label>
                  <input
                    type="time"
                    name="horaInicioDisponible"
                    value={reservacionSettings.horaInicioDisponible}
                    onChange={handleReservacionChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora de fin disponible
                  </label>
                  <input
                    type="time"
                    name="horaFinDisponible"
                    value={reservacionSettings.horaFinDisponible}
                    onChange={handleReservacionChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiempo mínimo de evento (horas)
                  </label>
                  <input
                    type="number"
                    name="tiempoMinimoEvento"
                    value={reservacionSettings.tiempoMinimoEvento}
                    onChange={handleReservacionChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-gray-700 flex items-center mb-2">
                  <FaCalendarAlt className="mr-2 text-[var(--color-primary)]" />
                  <h3 className="font-medium">Fechas no disponibles</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <textarea
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      placeholder="Ingresa las fechas separadas por comas (YYYY-MM-DD)"
                      value={reservacionSettings.diasNoDisponibles.join(', ')}
                      onChange={(e) => setReservacionSettings(prev => ({
                        ...prev,
                        diasNoDisponibles: e.target.value.split(',').map(date => date.trim())
                      }))}
                    ></textarea>
                  </div>
                  <p className="text-sm text-gray-500">
                    Estas fechas no estarán disponibles para reservaciones. Formato: YYYY-MM-DD
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Pestaña de Configuración de Pagos */}
          {activeTab === 'pagos' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center space-x-2 text-gray-800">
                  <FaMoneyBillWave className="text-[var(--color-primary)]" />
                  <h2 className="text-xl font-semibold">Configuración de Pagos</h2>
                </div>
                <p className="text-gray-600 mt-2 mb-6">
                  Define las políticas de pago, incluyendo anticipos requeridos, métodos de pago aceptados e impuestos aplicables. 
                  Estas configuraciones determinarán cómo se manejan los pagos y depósitos para las reservaciones.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="requireDeposit"
                      className="w-4 h-4 text-[var(--color-primary)] border-gray-300 rounded focus:ring-[var(--color-primary)]"
                      checked={pagosSettings.requeridoAnticipo}
                      onChange={(e) => handlePagosChange({ target: { name: 'requeridoAnticipo', checked: e.target.checked } })}
                    />
                    <label htmlFor="requireDeposit" className="ml-2 text-sm font-medium text-gray-700">
                      Requerir anticipo para confirmar reservación
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Porcentaje de anticipo
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      name="porcentajeAnticipo"
                      value={pagosSettings.porcentajeAnticipo}
                      onChange={handlePagosChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      min="0"
                      max="100"
                      disabled={!pagosSettings.requeridoAnticipo}
                    />
                    <span className="ml-2">%</span>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Métodos de pago aceptados
                  </label>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="metodoPagoEfectivo"
                        checked={pagosSettings.metodosAceptados.includes('Efectivo')}
                        onChange={(e) => {
                          const newMetodos = e.target.checked
                            ? [...pagosSettings.metodosAceptados, 'Efectivo']
                            : pagosSettings.metodosAceptados.filter(m => m !== 'Efectivo');
                          setPagosSettings(prev => ({ ...prev, metodosAceptados: newMetodos }));
                        }}
                        className="w-4 h-4 text-[var(--color-primary)] border-gray-300 rounded focus:ring-[var(--color-primary)]"
                      />
                      <label htmlFor="metodoPagoEfectivo" className="ml-2 text-sm text-gray-700">
                        Efectivo
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="metodoPagoTransferencia"
                        checked={pagosSettings.metodosAceptados.includes('Transferencia bancaria')}
                        onChange={(e) => {
                          const newMetodos = e.target.checked
                            ? [...pagosSettings.metodosAceptados, 'Transferencia bancaria']
                            : pagosSettings.metodosAceptados.filter(m => m !== 'Transferencia bancaria');
                          setPagosSettings(prev => ({ ...prev, metodosAceptados: newMetodos }));
                        }}
                        className="w-4 h-4 text-[var(--color-primary)] border-gray-300 rounded focus:ring-[var(--color-primary)]"
                      />
                      <label htmlFor="metodoPagoTransferencia" className="ml-2 text-sm text-gray-700">
                        Transferencia bancaria
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="metodoPagoTarjeta"
                        checked={pagosSettings.metodosAceptados.includes('Tarjeta de crédito')}
                        onChange={(e) => {
                          const newMetodos = e.target.checked
                            ? [...pagosSettings.metodosAceptados, 'Tarjeta de crédito']
                            : pagosSettings.metodosAceptados.filter(m => m !== 'Tarjeta de crédito');
                          setPagosSettings(prev => ({ ...prev, metodosAceptados: newMetodos }));
                        }}
                        className="w-4 h-4 text-[var(--color-primary)] border-gray-300 rounded focus:ring-[var(--color-primary)]"
                      />
                      <label htmlFor="metodoPagoTarjeta" className="ml-2 text-sm text-gray-700">
                        Tarjeta de crédito
                      </label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Porcentaje de impuestos
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      name="impuestos"
                      value={pagosSettings.impuestos}
                      onChange={handlePagosChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      min="0"
                      max="100"
                    />
                    <span className="ml-2">%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Pestaña de Configuración SEO */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center space-x-2 text-gray-800">
                  <FaShieldAlt className="text-[var(--color-primary)]" />
                  <h2 className="text-xl font-semibold">Configuración SEO</h2>
                </div>
                <p className="text-gray-600 mt-2 mb-6">
                  Optimiza la visibilidad de tu sitio web en los motores de búsqueda configurando títulos, descripciones y palabras clave. 
                  Estas configuraciones son cruciales para mejorar el posicionamiento en Google y otros buscadores, ayudando a que más clientes potenciales encuentren tu negocio.
                </p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título del sitio (SEO)
                  </label>
                  <input
                    type="text"
                    name="siteTitle"
                    value={metadataSettings.siteTitle}
                    onChange={handleMetadataChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Este título se mostrará en los resultados de búsqueda y en la pestaña del navegador.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción del sitio (SEO)
                  </label>
                  <textarea
                    name="siteDescription"
                    value={metadataSettings.siteDescription}
                    onChange={handleMetadataChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  ></textarea>
                  <p className="mt-1 text-sm text-gray-500">
                    Esta descripción se mostrará en los resultados de búsqueda.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Palabras clave (SEO)
                  </label>
                  <input
                    type="text"
                    name="keywords"
                    value={metadataSettings.keywords}
                    onChange={handleMetadataChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    placeholder="Palabras clave separadas por comas"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Estas palabras clave ayudarán a mejorar el posicionamiento en buscadores.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 