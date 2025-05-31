const API_URL = 'https://geekdle.com/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
};

export const getFriends = async () => {
    try {
        const response = await fetch(`${API_URL}/friends`, {
            method: 'GET',
            headers: getAuthHeader(),
            credentials: 'include'
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en getFriends:', error);
        throw error;
    }
};

export const searchUsers = async (query) => {
    try {
        const response = await fetch(`${API_URL}/friends/search?query=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: getAuthHeader(),
            credentials: 'include'
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
            }
            if (response.status === 404) {
                return { users: [] }; // Retornar lista vacía si no hay resultados
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en searchUsers:', error);
        if (error.message.includes('404')) {
            return { users: [] }; // Retornar lista vacía si hay error 404
        }
        throw error;
    }
};

export const sendFriendRequest = async (userId) => {
    try {
        const response = await fetch(`${API_URL}/friends`, {
            method: 'POST',
            headers: getAuthHeader(),
            credentials: 'include',
            body: JSON.stringify({ friend_id: userId })
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en sendFriendRequest:', error);
        throw error;
    }
};

export const acceptFriendRequest = async (requestId) => {
    try {
        const response = await fetch(`${API_URL}/friends/accept`, {
            method: 'POST',
            headers: getAuthHeader(),
            credentials: 'include',
            body: JSON.stringify({ friend_id: requestId })
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en acceptFriendRequest:', error);
        throw error;
    }
};

export const removeFriend = async (friendId) => {
    try {
        const response = await fetch(`${API_URL}/friends/${friendId}`, {
            method: 'DELETE',
            headers: getAuthHeader(),
            credentials: 'include'
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en removeFriend:', error);
        throw error;
    }
}; 

export const getFriendsRanking = async () => {
    try {
        const response = await fetch(`${API_URL}/friends/ranking`, {
            method: 'GET',
            headers: getAuthHeader(),
            credentials: 'include'
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener ranking de amigos:', error);
        throw error;
    }
}; 