import { API_BASE_URL, DEFAULT_OPTIONS, FETCH_TIMEOUT } from './config';

// Función para manejar el timeout de las peticiones
const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const { signal } = controller;
  
  const timeout = setTimeout(() => {
    controller.abort();
  }, FETCH_TIMEOUT);
  
  try {
    const response = await fetch(url, { ...options, signal });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      throw new Error('La petición ha excedido el tiempo límite');
    }
    throw error;
  }
};

// Cliente API básico
const apiClient = {
  // Obtener el token JWT del localStorage
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  },
  
  // Establecer token JWT en el localStorage
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  },
  
  // Eliminar token JWT del localStorage
  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  },
  
  // Petición GET
  get: async (endpoint, customOptions = {}) => {
    const token = apiClient.getToken();
    const headers = { ...DEFAULT_OPTIONS.headers };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = {
      ...DEFAULT_OPTIONS,
      ...customOptions,
      method: 'GET',
      headers,
    };
    
    const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Error al procesar la respuesta',
      }));
      throw { status: response.status, ...error };
    }
    
    return response.json();
  },
  
  // Petición POST
  post: async (endpoint, data = {}, customOptions = {}) => {
    const token = apiClient.getToken();
    const headers = { ...DEFAULT_OPTIONS.headers };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = {
      ...DEFAULT_OPTIONS,
      ...customOptions,
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    };
    
    const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Error al procesar la respuesta',
      }));
      throw { status: response.status, ...error };
    }
    
    return response.json();
  },
  
  // Petición PUT
  put: async (endpoint, data = {}, customOptions = {}) => {
    const token = apiClient.getToken();
    const headers = { ...DEFAULT_OPTIONS.headers };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = {
      ...DEFAULT_OPTIONS,
      ...customOptions,
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    };
    
    const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Error al procesar la respuesta',
      }));
      throw { status: response.status, ...error };
    }
    
    return response.json();
  },
  
  // Petición DELETE
  delete: async (endpoint, customOptions = {}) => {
    const token = apiClient.getToken();
    const headers = { ...DEFAULT_OPTIONS.headers };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = {
      ...DEFAULT_OPTIONS,
      ...customOptions,
      method: 'DELETE',
      headers,
    };
    
    const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Error al procesar la respuesta',
      }));
      throw { status: response.status, ...error };
    }
    
    return response.json();
  },
};

export default apiClient; 