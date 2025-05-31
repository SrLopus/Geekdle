import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import Toast from '../components/Toast';
import Popup from '../components/Popup';
import { AnimatePresence, motion } from 'framer-motion';
import adminService from '../services/adminService';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('info');
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        role: '',
        is_active: true,
        level: 0,
        points: 0,
        avatarColor: '#10B981'
    });
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user, token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }
        if (token) {
            adminService.setAuthToken(token);
            fetchUsers();
        }
    }, [user, token, navigate]);

    useEffect(() => {
        const filtered = users.filter(user => 
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.role.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(filtered);
    }, [searchTerm, users]);

    const fetchUsers = async () => {
        try {
            const data = await adminService.getUsers();
            setUsers(data);
            setFilteredUsers(data);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            if (error.status === 401) {
                navigate('/login');
            }
            setToastMessage('Error al cargar los usuarios');
            setToastType('error');
            setShowToast(true);
        }
    };

    const handleEdit = async (user) => {
        setSelectedUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            role: user.role,
            is_active: user.is_active,
            level: user.level,
            points: user.points,
            avatarColor: user.avatarColor
        });
        setEditMode(true);
    };

    const handleDelete = async (userId) => {
        const userToDelete = users.find(u => u.id === userId);
        setUserToDelete(userToDelete);
        setShowDeletePopup(true);
    };

    const confirmDelete = async () => {
        try {
            await adminService.deleteUser(userToDelete.id);
            setToastMessage('Usuario eliminado con éxito');
            setToastType('success');
            setShowToast(true);
            setShowDeletePopup(false);
            setUserToDelete(null);
            fetchUsers();
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            setToastMessage(error.message || 'No se pudo eliminar el usuario');
            setToastType('error');
            setShowToast(true);
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.username.trim()) {
            errors.username = 'El nombre de usuario es requerido';
        }
        if (!formData.email.trim()) {
            errors.email = 'El email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'El email no es válido';
        }
        if (!formData.role) {
            errors.role = 'El rol es requerido';
        }
        if (formData.level < 0) {
            errors.level = 'El nivel no puede ser negativo';
        }
        if (formData.points < 0) {
            errors.points = 'Los puntos no pueden ser negativos';
        }
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            setToastMessage('Por favor, corrige los errores en el formulario');
            setToastType('error');
            setShowToast(true);
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await adminService.updateUser(selectedUser.id, formData);
            
            if (response.message) {
                setToastMessage('Usuario actualizado correctamente');
                setToastType('success');
                setShowToast(true);
                setFormErrors({});
            }
            
            setEditMode(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            if (error.errors) {
                setFormErrors(error.errors);
                const errorMessages = Object.values(error.errors).flat();
                setToastMessage(`Errores de validación:\n${errorMessages.join('\n')}`);
            } else {
                setToastMessage(error.message || 'No se pudo actualizar el usuario');
            }
            setToastType('error');
            setShowToast(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    if (!user || user.role !== 'admin') {
        return null;
    }

    return (
        <div className="min-h-screen bg-black text-white p-8 pt-8 pb-32 relative">
            <AnimatedBackground />
            <div className="max-w-7xl mx-auto relative z-10 mt-4">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-black tracking-wider bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                            Panel de Administración
                        </h1>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-sm text-emerald-400">Modo Administrador</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-white/60">
                            <span className="text-emerald-400">{users.length}</span> usuarios registrados
                        </div>
                    </div>
                </div>
                
                {editMode ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gray-900/50 backdrop-blur-xl rounded-xl mb-16 border border-white/5 shadow-xl max-w-4xl mx-auto mt-4"
                    >
                        {/* Header del panel de edición */}
                        <div className="p-4 border-b border-white/5 bg-gradient-to-r from-gray-900/50 to-emerald-900/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="h-10 w-10 rounded-xl flex items-center justify-center text-lg font-black text-white shadow-lg"
                                        style={{ backgroundColor: formData.avatarColor }}
                                    >
                                        {formData.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-emerald-400">Editar Usuario</h2>
                                        <p className="text-xs text-white/60">ID: {selectedUser.id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        formData.is_active 
                                            ? 'bg-emerald-500/20 text-emerald-400' 
                                            : 'bg-red-500/20 text-red-400'
                                    }`}>
                                        {formData.is_active ? 'Activo' : 'Inactivo'}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        formData.role === 'admin' 
                                            ? 'bg-emerald-500/20 text-emerald-400' 
                                            : formData.role === 'moderator'
                                            ? 'bg-blue-500/20 text-blue-400'
                                            : 'bg-gray-500/20 text-gray-400'
                                    }`}>
                                        {formData.role}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Columna izquierda - Información básica */}
                                <div className="space-y-4">
                                    <div className="bg-gray-800/30 rounded-xl p-4 border border-white/5">
                                        <h3 className="text-sm font-medium text-emerald-400 mb-3">Información Básica</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block mb-1 text-sm font-medium text-white/60">Username</label>
                                                <input
                                                    type="text"
                                                    name="username"
                                                    value={formData.username}
                                                    onChange={handleChange}
                                                    className={`w-full p-2 rounded-lg bg-gray-800/50 border ${
                                                        formErrors.username 
                                                            ? 'border-red-500/50 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50' 
                                                            : 'border-white/5 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50'
                                                    } transition-all duration-300`}
                                                />
                                                {formErrors.username && (
                                                    <p className="mt-1 text-xs text-red-400">{formErrors.username}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block mb-1 text-sm font-medium text-white/60">Email</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className={`w-full p-2 rounded-lg bg-gray-800/50 border ${
                                                        formErrors.email 
                                                            ? 'border-red-500/50 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50' 
                                                            : 'border-white/5 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50'
                                                    } transition-all duration-300`}
                                                />
                                                {formErrors.email && (
                                                    <p className="mt-1 text-xs text-red-400">{formErrors.email}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block mb-1 text-sm font-medium text-white/60">Rol</label>
                                                <select
                                                    name="role"
                                                    value={formData.role}
                                                    onChange={handleChange}
                                                    className={`w-full p-2 rounded-lg bg-gray-800/50 border ${
                                                        formErrors.role 
                                                            ? 'border-red-500/50 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50' 
                                                            : 'border-white/5 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50'
                                                    } transition-all duration-300`}
                                                >
                                                    <option value="">Seleccionar rol</option>
                                                    <option value="user">Usuario</option>
                                                    <option value="moderator">Moderador</option>
                                                    <option value="admin">Administrador</option>
                                                </select>
                                                {formErrors.role && (
                                                    <p className="mt-1 text-xs text-red-400">{formErrors.role}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-800/30 rounded-xl p-4 border border-white/5">
                                        <h3 className="text-sm font-medium text-emerald-400 mb-3">Estado del Usuario</h3>
                                        <div className="flex items-center p-2 rounded-lg bg-gray-800/50 border border-white/5">
                                            <input
                                                type="checkbox"
                                                name="is_active"
                                                checked={formData.is_active}
                                                onChange={handleChange}
                                                className="w-4 h-4 rounded border-white/20 text-emerald-500 focus:ring-emerald-500/50"
                                            />
                                            <label className="ml-2 text-sm font-medium text-white/60">Usuario Activo</label>
                                        </div>
                                    </div>
                                </div>

                                {/* Columna derecha - Progreso y Personalización */}
                                <div className="space-y-4">
                                    <div className="bg-gray-800/30 rounded-xl p-4 border border-white/5">
                                        <h3 className="text-sm font-medium text-emerald-400 mb-3">Progreso</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block mb-1 text-sm font-medium text-white/60">Nivel</label>
                                                <input
                                                    type="number"
                                                    name="level"
                                                    value={formData.level}
                                                    onChange={handleChange}
                                                    min="0"
                                                    className={`w-full p-2 rounded-lg bg-gray-800/50 border ${
                                                        formErrors.level 
                                                            ? 'border-red-500/50 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50' 
                                                            : 'border-white/5 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50'
                                                    } transition-all duration-300`}
                                                />
                                                {formErrors.level && (
                                                    <p className="mt-1 text-xs text-red-400">{formErrors.level}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block mb-1 text-sm font-medium text-white/60">Puntos</label>
                                                <input
                                                    type="number"
                                                    name="points"
                                                    value={formData.points}
                                                    onChange={handleChange}
                                                    min="0"
                                                    className={`w-full p-2 rounded-lg bg-gray-800/50 border ${
                                                        formErrors.points 
                                                            ? 'border-red-500/50 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50' 
                                                            : 'border-white/5 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50'
                                                    } transition-all duration-300`}
                                                />
                                                {formErrors.points && (
                                                    <p className="mt-1 text-xs text-red-400">{formErrors.points}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-800/30 rounded-xl p-4 border border-white/5">
                                        <h3 className="text-sm font-medium text-emerald-400 mb-3">Personalización</h3>
                                        <div>
                                            <label className="block mb-1 text-sm font-medium text-white/60">Color de Avatar</label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="color"
                                                    name="avatarColor"
                                                    value={formData.avatarColor}
                                                    onChange={handleChange}
                                                    className="w-10 h-10 rounded-lg cursor-pointer border border-white/5"
                                                />
                                                <div className="flex-1 p-2 rounded-lg bg-gray-800/50 border border-white/5">
                                                    <span className="text-xs text-white/60">{formData.avatarColor}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Botones de acción */}
                            <div className="flex space-x-3 pt-4 mt-4 border-t border-white/5">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-300 shadow-lg ${
                                        isSubmitting
                                            ? 'bg-gray-500 cursor-not-allowed'
                                            : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 hover:shadow-emerald-500/30'
                                    }`}
                                >
                                    {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditMode(false);
                                        setSelectedUser(null);
                                        setFormErrors({});
                                    }}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white bg-gray-800 hover:bg-gray-700 transition-all duration-300"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gray-900/50 backdrop-blur-xl rounded-lg border border-white/5 shadow-xl overflow-hidden"
                    >
                        <div className="p-4 border-b border-white/5">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, email o rol..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full p-3 pl-10 rounded-lg bg-gray-800/50 border border-white/5 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-300"
                                />
                                <svg 
                                    className="w-5 h-5 text-white/40 absolute left-3 top-1/2 transform -translate-y-1/2" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                                    />
                                </svg>
                            </div>
                        </div>
                        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                            {filteredUsers.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="text-white/40 text-lg mb-2">
                                        {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
                                    </div>
                                    <div className="text-white/20 text-sm">
                                        {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Los usuarios aparecerán aquí cuando se registren'}
                                    </div>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="p-4 text-left text-sm font-medium text-white/60">Username</th>
                                            <th className="p-4 text-left text-sm font-medium text-white/60">Email</th>
                                            <th className="p-4 text-left text-sm font-medium text-white/60">Rol</th>
                                            <th className="p-4 text-left text-sm font-medium text-white/60">Nivel</th>
                                            <th className="p-4 text-left text-sm font-medium text-white/60">Puntos</th>
                                            <th className="p-4 text-left text-sm font-medium text-white/60">Estado</th>
                                            <th className="p-4 text-left text-sm font-medium text-white/60">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map(user => (
                                            <motion.tr 
                                                key={user.id} 
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="border-b border-white/5 hover:bg-white/5 transition-colors duration-300"
                                            >
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div 
                                                            className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-black text-white"
                                                            style={{ backgroundColor: user.avatarColor || '#10B981' }}
                                                        >
                                                            {user.username.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span>{user.username}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">{user.email}</td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        user.role === 'admin' 
                                                            ? 'bg-emerald-500/20 text-emerald-400' 
                                                            : user.role === 'moderator'
                                                            ? 'bg-blue-500/20 text-blue-400'
                                                            : 'bg-gray-500/20 text-gray-400'
                                                    }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="p-4">{user.level}</td>
                                                <td className="p-4">{user.points}</td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        user.is_active 
                                                            ? 'bg-emerald-500/20 text-emerald-400' 
                                                            : 'bg-red-500/20 text-red-400'
                                                    }`}>
                                                        {user.is_active ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleEdit(user)}
                                                            className="bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-500/30 transition-colors duration-300"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(user.id)}
                                                            className="bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-colors duration-300"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
            
            {/* Toast de feedback */}
            <AnimatePresence>
                {showToast && (
                    <Toast
                        message={toastMessage}
                        type={toastType}
                        isVisible={showToast}
                        onClose={() => setShowToast(false)}
                    />
                )}
            </AnimatePresence>

            {/* Popup de confirmación de eliminación */}
            <Popup
                isOpen={showDeletePopup}
                onClose={() => {
                    setShowDeletePopup(false);
                    setUserToDelete(null);
                }}
                title="Confirmar Eliminación"
                message="¿Estás seguro de que deseas eliminar al usuario?"
                subMessage={userToDelete?.username}
                icon={
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                }
                buttons={[
                    {
                        text: "Cancelar",
                        onClick: () => {
                            setShowDeletePopup(false);
                            setUserToDelete(null);
                        },
                        className: "bg-black/40 border-white/5 hover:bg-white/5 text-white"
                    },
                    {
                        text: "Eliminar",
                        onClick: confirmDelete,
                        className: "bg-red-500/20 border-red-500/20 hover:bg-red-500/30 text-red-400",
                        icon: (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        )
                    }
                ]}
            >
                <p className="text-center text-white/40 text-sm mt-1">
                    Esta acción no se puede deshacer
                </p>
            </Popup>
        </div>
    );
};

export default AdminPanel; 