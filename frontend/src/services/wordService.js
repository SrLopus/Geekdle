import axiosInstance from '../config/axios';

export const checkPlayerProgress = async (mode = 'daily', category = null) => {
    try {
        const response = await axiosInstance.get('/word/check-progress', {
            params: { 
                mode, 
                category: category || 'tecnologia'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al verificar progreso del jugador:', error);
        throw error;
    }
};

export const getDailyWord = async (mode = 'daily', category = null, prompt = null) => {
    try {
        const response = await axiosInstance.get(`/word`, {
            params: {
                mode,
                category,
                prompt: prompt ? JSON.stringify(prompt) : null
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener la palabra:', error);
        throw error;
    }
};

export const checkWord = async (word, mode = 'daily', category = null) => {
    try {
        const response = await axiosInstance.post('/word/check', {
            word
        }, {
            params: { 
                mode, 
                category: category || 'tecnologia'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al verificar la palabra:', error);
        throw error;
    }
};

export const updateProgress = async (mode = 'daily', category = null, word = null, attempts = 0, timeTaken = 0, boardMapping = [], isCorrect = false) => {
    try {
        const data = {
            mode,
            category: category || 'tecnologia',
            word,
            attempts,
            time_taken: timeTaken,
            is_win: isCorrect,
            board_mapping: boardMapping
        };
        
        const response = await axiosInstance.post('/games/save-result', data, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        // Asegurarse de que la respuesta tenga el formato correcto
        if (response.data) {
            return {
                points_earned: response.data.points_earned || 0,
                current_points: response.data.current_points || 0,
                current_level: response.data.current_level || 1,
                game_result: response.data.game_result
            };
        }
        
        return response.data;
    } catch (error) {
        console.error('Error al actualizar progreso:', error.response?.data || error.message);
        throw error;
    }
};

export const generateDailyWords = async () => {
    try {
        const response = await axiosInstance.post('/word/generate-daily');
        return response.data;
    } catch (error) {
        console.error('Error al generar palabras diarias:', error);
        throw error;
    }
};