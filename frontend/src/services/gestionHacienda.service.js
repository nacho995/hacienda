import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const crearReservaHacienda = async (reservaData) => {
  try {
    const response = await axios.post(`${API_URL}/reservas/hacienda`, {
      ...reservaData,
      tipo: 'gestion_hacienda'
    });

    // Enviar correo informativo
    await enviarCorreoInformativo(reservaData.datosContacto.email, response.data.id);

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error al crear la reserva gestionada por hacienda:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al crear la reserva'
    };
  }
};

export const actualizarGestionHabitaciones = async (reservaId, habitacionesData) => {
  try {
    const response = await axios.put(`${API_URL}/reservas/hacienda/${reservaId}/habitaciones`, {
      habitaciones: habitacionesData
    });

    toast.success('Habitaciones actualizadas', {
      description: 'La asignación de habitaciones ha sido actualizada correctamente.'
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error al actualizar habitaciones:', error);
    toast.error('Error al actualizar', {
      description: error.response?.data?.message || 'Error al actualizar las habitaciones'
    });
    return {
      success: false,
      message: error.response?.data?.message || 'Error al actualizar las habitaciones'
    };
  }
};

export const actualizarGestionServicios = async (reservaId, serviciosData) => {
  try {
    const response = await axios.put(`${API_URL}/reservas/hacienda/${reservaId}/servicios`, {
      servicios: serviciosData
    });

    toast.success('Servicios actualizados', {
      description: 'La asignación de servicios ha sido actualizada correctamente.'
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error al actualizar servicios:', error);
    toast.error('Error al actualizar', {
      description: error.response?.data?.message || 'Error al actualizar los servicios'
    });
    return {
      success: false,
      message: error.response?.data?.message || 'Error al actualizar los servicios'
    };
  }
};

const enviarCorreoInformativo = async (email, reservaId) => {
  try {
    await axios.post(`${API_URL}/correos/reserva-hacienda`, {
      email,
      reservaId
    });
    
    toast.success('Correo enviado', {
      description: 'Se ha enviado un correo informativo sobre el proceso de reserva.'
    });
  } catch (error) {
    console.error('Error al enviar correo informativo:', error);
    toast.error('Error al enviar correo', {
      description: 'No se pudo enviar el correo informativo, pero la reserva se ha creado correctamente.'
    });
  }
}; 