// frontend/src/api/hasseService.js
import axios from 'axios';

// Vite inyectará la URL en producción, pero en tu PC usará localhost:8000
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const generarDiagrama = async (entrada) => {
  try {
    const response = await axios.get(`${API_URL}/diagrama`, {
      params: { entrada: entrada }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.detail);
    }
    throw new Error('Error al conectar con el servidor de matemáticas.');
  }
};

// NUEVA FUNCIÓN: Para el análisis de subretículas
export const analizarSubconjunto = async (nodos_padre, subconjunto) => {
    try {
      const response = await axios.post(`${API_URL}/analizar-subconjunto`, { nodos_padre, subconjunto });
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Error al analizar el subconjunto.');
    }
  };