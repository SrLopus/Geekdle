import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Variables para el caché
let historialCache = null;
let lastFetchTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

const historyService = {
    /**
     * Obtiene el historial de partidas del usuario
     * @returns {Promise<Array>} Array de partidas
     */
    async getGameHistory() {
        const now = Date.now();
        if (historialCache && lastFetchTime && (now - lastFetchTime < CACHE_DURATION)) {
            return historialCache;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/games/history`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            historialCache = response.data;
            lastFetchTime = now;
            return response.data;
        } catch (error) {
            console.error('Error fetching game history:', error);
            throw new Error(error.response?.data?.message || 'Error al obtener el historial de juegos');
        }
    },

    /**
     * Obtiene el historial filtrado por modo de juego
     * @param {string} mode - Modo de juego ('daily' o 'infinite')
     * @returns {Promise<Array>} Array de partidas filtradas
     */
    async getGameHistoryByMode(mode) {
        const history = await this.getGameHistory();
        return history.filter(game => game.mode === mode);
    },

    /**
     * Limpia el caché del historial
     */
    clearCache() {
        historialCache = null;
        lastFetchTime = null;
    }
};

export default historyService; 