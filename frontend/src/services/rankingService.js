import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://geekdle.com/api';

export const rankingService = {
    /**
     * Obtiene los mejores jugadores
     * @returns {Promise<Array>} Lista de los mejores jugadores
     */
    getTopPlayers: async () => {
        try {
            const response = await axios.get(`${API_URL}/users/top`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener el ranking:', error);
            throw new Error('No se pudo cargar el ranking');
        }
    },

    /**
     * Obtiene el ranking de una categoría específica
     * @param {string} category - Categoría del ranking
     * @returns {Promise<Array>} Lista de jugadores en la categoría
     */
    getCategoryRanking: async (category) => {
        try {
            const response = await axios.get(`${API_URL}/users/top/${category}`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener el ranking de la categoría:', error);
            throw new Error('No se pudo cargar el ranking de la categoría');
        }
    },

    /**
     * Obtiene el ranking de un modo específico
     * @param {string} mode - Modo de juego ('daily' o 'infinite')
     * @returns {Promise<Array>} Lista de jugadores en el modo
     */
    getModeRanking: async (mode) => {
        try {
            const response = await axios.get(`${API_URL}/users/top/mode/${mode}`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener el ranking del modo:', error);
            throw new Error('No se pudo cargar el ranking del modo');
        }
    },

    /**
     * Obtiene el ranking de un usuario específico
     * @param {number} userId - ID del usuario
     * @returns {Promise<Object>} Información del ranking del usuario
     */
    getUserRanking: async (userId) => {
        try {
            const response = await axios.get(`${API_URL}/users/${userId}/ranking`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener el ranking del usuario:', error);
            throw new Error('No se pudo cargar el ranking del usuario');
        }
    }
}; 