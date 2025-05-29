import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Configuración base de axios
const axiosInstance = axios.create({
    baseURL: `${API_URL}/api`,
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
});

// Interceptor para manejar errores
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            delete axiosInstance.defaults.headers.common['Authorization'];
        }
        return Promise.reject(error);
    }
);

// Función para configurar el token de autorización
export const setAuthToken = (token) => {
    if (token) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('token', token);
    } else {
        delete axiosInstance.defaults.headers.common['Authorization'];
        localStorage.removeItem('token');
    }
};

// Función para obtener el token CSRF
export const getCsrfToken = async () => {
    try {
        const response = await axiosInstance.get('/sanctum/csrf-cookie');
        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1];
        
        if (token) {
            axiosInstance.defaults.headers.common['X-XSRF-TOKEN'] = decodeURIComponent(token);
        }
        return token;
    } catch (error) {
        console.error('Error al obtener el token CSRF:', error);
        throw error;
    }
};

export default axiosInstance; 