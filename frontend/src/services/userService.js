import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const updateAvatarColor = async (avatarColor) => {
    try {
        const response = await axios.put(`${API_URL}/user/avatar-color`, {
            avatarColor
        }, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Accept': 'application/json'
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error al actualizar el color:', error);
        throw error;
    }
}; 