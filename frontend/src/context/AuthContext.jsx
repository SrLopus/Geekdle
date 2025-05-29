import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance, { setAuthToken, getCsrfToken } from '../config/axios';
import LoadingScreen from '../components/LoadingScreen';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);

    const fetchUserData = useCallback(async () => {
        try {
            const response = await axiosInstance.get('/me');
            setUser(response.data);
            setIsAuthenticated(true);
            return response.data;
        } catch (error) {
            console.error('Error al obtener datos del usuario:', error);
            setAuthToken(null);
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('token');
            return null;
        }
    }, []);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    setAuthToken(token);
                    await fetchUserData();
                }
            } catch (error) {
                console.error('Error en initializeAuth:', error);
            } finally {
                setLoading(false);
                setInitialized(true);
            }
        };

        initializeAuth();
    }, [fetchUserData]);

    const checkAuth = useCallback(async () => {
        if (!initialized) return;
        
        const token = localStorage.getItem('token');
        if (!token) {
            setAuthToken(null);
            setUser(null);
            setIsAuthenticated(false);
            return;
        }

        if (!user) {
            await fetchUserData();
        }
    }, [initialized, user, fetchUserData]);

    const register = async (userData) => {
        try {
            await getCsrfToken();
            const response = await axiosInstance.post('/register', userData);
            
            const { token, user } = response.data;
            setAuthToken(token);
            setUser(user);
            setIsAuthenticated(true);
            
            return true;
        } catch (error) {
            console.error('Error en register:', error);
            if (error.response?.data?.errors) {
                throw error.response.data;
            } else if (error.response?.data?.message) {
                throw { errors: { general: [error.response.data.message] } };
            } else {
                throw { errors: { general: ['Error al registrar usuario'] } };
            }
        }
    };

    const login = async (email, password) => {
        try {
            await getCsrfToken();
            const response = await axiosInstance.post('/login', { email, password });
            
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setAuthToken(token);
            setUser(user);
            setIsAuthenticated(true);
            
            await fetchUserData();
            
            return true;
        } catch (error) {
            console.error('Error en login:', error);
            setAuthToken(null);
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('token');
            
            if (error.response) {
                const { status, data } = error.response;
                
                switch (status) {
                    case 422:
                        throw { 
                            errors: data.errors || { 
                                general: ['Por favor, verifica los datos ingresados'] 
                            }
                        };
                    case 401:
                        throw { 
                            errors: { 
                                general: ['Credenciales incorrectas. Por favor, verifica tu email y contraseña'] 
                            }
                        };
                    case 429:
                        throw { 
                            errors: { 
                                general: ['Demasiados intentos. Por favor, espera unos minutos antes de intentar nuevamente'] 
                            }
                        };
                    case 500:
                        throw { 
                            errors: { 
                                general: ['Error del servidor. Por favor, intenta más tarde'] 
                            }
                        };
                    default:
                        throw { 
                            errors: { 
                                general: [data.message || 'Error al iniciar sesión. Por favor, intenta nuevamente'] 
                            }
                        };
                }
            }
            
            throw { 
                errors: { 
                    general: ['No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet'] 
                }
            };
        }
    };

    const logout = async () => {
        try {
            await axiosInstance.post('/logout');
        } catch (error) {
            console.error('Error en logout:', error);
        } finally {
            setAuthToken(null);
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const updateUser = (userData) => {
        setUser(prevUser => ({
            ...prevUser,
            ...userData
        }));
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            user, 
            token: localStorage.getItem('token'),
            login, 
            register, 
            logout, 
            updateUser,
            checkAuth
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext); 