import axios from 'axios';

const API_URL = 'http://localhost:8000/api/admin';

class AdminService {
    constructor() {
        this.api = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
    }

    // Configurar el token para las peticiones
    setAuthToken(token) {
        if (token) {
            this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete this.api.defaults.headers.common['Authorization'];
        }
    }

    // Obtener todos los usuarios
    async getUsers() {
        try {
            const response = await this.api.get('/users');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener un usuario específico
    async getUser(userId) {
        try {
            const response = await this.api.get(`/users/${userId}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Actualizar un usuario
    async updateUser(userId, userData) {
        try {
            const response = await this.api.put(`/users/${userId}`, userData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Eliminar un usuario
    async deleteUser(userId) {
        try {
            const response = await this.api.delete(`/users/${userId}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Actualizar contraseña de usuario
    async updateUserPassword(userId, passwordData) {
        try {
            const response = await this.api.put(`/users/${userId}/password`, passwordData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Manejo de errores
    handleError(error) {
        if (error.response) {
            // El servidor respondió con un código de estado fuera del rango 2xx
            return {
                status: error.response.status,
                message: error.response.data.message || 'Error en la operación',
                errors: error.response.data.errors || null
            };
        } else if (error.request) {
            // La petición fue hecha pero no se recibió respuesta
            return {
                status: 0,
                message: 'No se pudo conectar con el servidor',
                errors: null
            };
        } else {
            // Algo ocurrió al configurar la petición
            return {
                status: 0,
                message: 'Error al procesar la petición',
                errors: null
            };
        }
    }
}

export default new AdminService(); 