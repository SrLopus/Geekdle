import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import LoadingScreen from '../components/LoadingScreen';
import { motion } from 'framer-motion';

export default function Perfil() {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [selectedColor, setSelectedColor] = useState(user?.avatarColor || '#10B981');
    const [tempColor, setTempColor] = useState(user?.avatarColor || '#10B981');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('perfil');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            fetchStats();
        }
    }, [user, navigate]);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.get('https://geekdle.com/api/game/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            setStats(response.data);
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const colors = [
        '#10B981', // verde
        '#3B82F6', // azul
        '#8B5CF6', // violeta
        '#EC4899', // rosa
        '#F59E0B', // naranja
        '#EF4444', // rojo
        '#6366F1', // índigo
        '#14B8A6', // turquesa
    ];

    const handleColorSelect = (color) => {
        setTempColor(color);
    };

    const handleSaveColor = async () => {
        try {
            setIsUpdating(true);
            setIsLoading(true);
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            const response = await axios.put('https://geekdle.com/api/user/avatar-color', 
                { avatarColor: tempColor },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            if (response.data.user) {
                setSelectedColor(tempColor);
                updateUser(response.data.user);
            }
        } catch (error) {
            console.error('Error al actualizar el color:', error);
            if (error.response) {
                console.error('Respuesta del servidor:', error.response.data);
            }
        } finally {
            setIsUpdating(false);
            setIsLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        if (tab === activeTab || isTransitioning) return;
        setIsTransitioning(true);
        setActiveTab(tab);
        setTimeout(() => setIsTransitioning(false), 300);
    };

    if (!user) {
        return null;
    }

    if (isLoading) {
        return <LoadingScreen />;
    }

    const getLevelColor = (level) => {
        if (level <= 10) return '#10B981';
        if (level <= 25) return '#3B82F6';
        if (level <= 50) return '#8B5CF6';
        if (level <= 100) return '#EC4899';
        return '#F59E0B';
    };

    const levelColor = getLevelColor(user?.level);

    // Función para generar el gradiente del fondo
    const getBackgroundGradient = (color) => {
        return `linear-gradient(135deg, ${color}15 0%, ${color}05 25%, black 100%)`;
    };

    // Función para generar el color de texto con mejor contraste
    const getTextColor = (color) => {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 128 ? '#000000' : '#FFFFFF';
    };

    return (
        <div 
            className="min-h-screen pt-4 pb-12 px-4 transition-all duration-700 relative overflow-hidden flex items-start justify-center"
            style={{ 
                background: getBackgroundGradient(tempColor),
            }}
        >
            {/* Grid Sci-fi con neón */}
            <div 
                className="absolute inset-0 opacity-15"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, ${tempColor}15 1px, transparent 1px),
                        linear-gradient(to bottom, ${tempColor}15 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px',
                    boxShadow: `0 0 15px ${tempColor}15 inset`
                }}
            />

            {/* Efectos de partículas con neón */}
            <div 
                className="absolute inset-0"
                style={{
                    backgroundImage: `
                        radial-gradient(circle at 20% 20%, ${tempColor}20 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, ${tempColor}20 0%, transparent 50%),
                        radial-gradient(circle at 50% 50%, ${tempColor}15 0%, transparent 70%)
                    `,
                    filter: 'blur(40px)',
                    boxShadow: `0 0 30px ${tempColor}15 inset`
                }}
            />

            {/* Líneas de energía con neón */}
            <div 
                className="absolute inset-0 opacity-25"
                style={{
                    background: `
                        linear-gradient(45deg, transparent 0%, ${tempColor}20 25%, transparent 50%),
                        linear-gradient(-45deg, transparent 0%, ${tempColor}20 25%, transparent 50%),
                        linear-gradient(90deg, transparent 0%, ${tempColor}20 25%, transparent 50%),
                        linear-gradient(-90deg, transparent 0%, ${tempColor}20 25%, transparent 50%)
                    `,
                    backgroundSize: '200% 200%',
                    animation: 'energyFlow 12s linear infinite',
                    boxShadow: `0 0 20px ${tempColor}15 inset`
                }}
            />

            {/* Efecto de escaneo con neón */}
            <div 
                className="absolute inset-0 opacity-10"
                style={{
                    background: `linear-gradient(to bottom, 
                        transparent 0%,
                        ${tempColor}20 50%,
                        transparent 100%
                    )`,
                    animation: 'scan 6s linear infinite',
                    boxShadow: `0 0 25px ${tempColor}15 inset`
                }}
            />

            {/* Efecto de borde neón */}
            <div 
                className="absolute inset-0"
                style={{
                    boxShadow: `0 0 60px ${tempColor}15 inset`,
                    animation: 'pulse 6s ease-in-out infinite'
                }}
            />

            <style>
                {`
                    @keyframes energyFlow {
                        0% { background-position: 0% 0%; }
                        100% { background-position: 200% 200%; }
                    }
                    @keyframes scan {
                        0% { transform: translateY(-100%); }
                        100% { transform: translateY(100%); }
                    }
                    @keyframes pulse {
                        0% { box-shadow: 0 0 60px ${tempColor}15 inset; }
                        50% { box-shadow: 0 0 80px ${tempColor}20 inset; }
                        100% { box-shadow: 0 0 60px ${tempColor}15 inset; }
                    }
                `}
            </style>

            <div className="w-full max-w-3xl lg:max-w-4xl space-y-4 sm:space-y-6 lg:space-y-8 relative z-10 mt-2 sm:mt-4">
                {/* Header del Perfil */}
                <div className="relative">
                    <div 
                        className="absolute inset-0 blur-2xl lg:blur-3xl transition-all duration-700"
                        style={{ 
                            background: `radial-gradient(circle at center, ${tempColor}25 0%, transparent 70%)`,
                            boxShadow: `0 0 20px ${tempColor}20`
                        }}
                    />
                    <div 
                        className="relative bg-white/5 backdrop-blur-xl rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-white/10 transition-all duration-500"
                        style={{
                            boxShadow: `0 0 20px ${tempColor}20, 0 0 10px ${tempColor}10 inset`
                        }}
                    >
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-3 sm:gap-4 lg:gap-6">
                            {/* Avatar y Nombre */}
                            <div className="flex flex-col items-center md:items-start gap-2 sm:gap-3 lg:gap-4">
                                <div 
                                    className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 rounded-xl lg:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl lg:text-4xl font-black text-white transition-all duration-500 hover:scale-105 hover:rotate-3 shadow-lg"
                                    style={{ 
                                        backgroundColor: tempColor,
                                        boxShadow: `0 0 20px ${tempColor}40`
                                    }}
                                >
                                    {user?.username?.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-center md:text-left">
                                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-wider text-white">
                                        {user?.username}
                                    </h1>
                                    <p className="text-white/60 text-xs sm:text-sm tracking-wide mt-0.5">{user?.email}</p>
                                </div>
                            </div>

                            {/* Estadísticas */}
                            <div className="flex-1 grid grid-cols-3 gap-2 sm:gap-3 mt-3 md:mt-0">
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.1 }}
                                    className="bg-white/5 rounded-lg p-2 sm:p-3 border border-white/10 transition-all duration-500 hover:bg-white/10"
                                    style={{
                                        boxShadow: `0 0 15px ${tempColor}10`
                                    }}
                                >
                                    <p className="text-white/40 text-xs sm:text-sm">Nivel</p>
                                    <motion.p 
                                        key={stats?.user?.level || 1}
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                        className="text-base sm:text-lg lg:text-xl font-bold text-white mt-0.5"
                                    >
                                        {stats ? stats.user?.level : ''}
                                    </motion.p>
                                </motion.div>
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="bg-white/5 rounded-lg p-2 sm:p-3 border border-white/10 transition-all duration-500 hover:bg-white/10"
                                    style={{
                                        boxShadow: `0 0 15px ${tempColor}10`
                                    }}
                                >
                                    <p className="text-white/40 text-xs sm:text-sm">Puntos</p>
                                    <motion.p 
                                        key={stats?.user?.points || 0}
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.5, delay: 0.3 }}
                                        className="text-base sm:text-lg lg:text-xl font-bold text-white mt-0.5"
                                    >
                                        {stats ? stats.user?.points : ''}
                                    </motion.p>
                                </motion.div>
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.3 }}
                                    className="bg-white/5 rounded-lg p-2 sm:p-3 border border-white/10 transition-all duration-500 hover:bg-white/10"
                                    style={{
                                        boxShadow: `0 0 15px ${tempColor}10`
                                    }}
                                >
                                    <p className="text-white/40 text-xs sm:text-sm">Total Victorias</p>
                                    <motion.p 
                                        key={stats?.stats?.total_wins || 0}
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.5, delay: 0.4 }}
                                        className="text-base sm:text-lg lg:text-xl font-bold text-white mt-0.5"
                                    >
                                        {stats ? stats.stats?.total_wins : ''}
                                    </motion.p>
                                </motion.div>
                            </div>
                        </div>

                        {/* Barra de Progresión */}
                        <div className="mt-4 sm:mt-5 lg:mt-6">
                            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                                <span className="text-white/80 text-xs sm:text-sm font-medium">Progreso al siguiente nivel</span>
                                <div className="flex flex-col items-end">
                                    <span className="text-white/60 text-xs sm:text-sm">
                                        {stats?.user?.points - ((stats?.user?.level - 1) * 100)}/100 pts
                                    </span>
                                    <span className="text-white/40 text-xs sm:text-sm">
                                        Total: {stats?.user?.points} pts
                                    </span>
                                </div>
                            </div>
                            <div className="h-1.5 sm:h-2 lg:h-3 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                    className="h-full transition-all duration-700 ease-out"
                                    style={{ 
                                        width: `${((stats?.user?.points - ((stats?.user?.level - 1) * 100)) / 100) * 100}%`,
                                        backgroundColor: levelColor,
                                        boxShadow: `0 0 15px ${levelColor}40`
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs y Contenido */}
                <div 
                    className="bg-white/5 backdrop-blur-xl rounded-xl lg:rounded-2xl border border-white/10 overflow-hidden transition-all duration-500"
                    style={{
                        boxShadow: `0 0 30px ${tempColor}15`
                    }}
                >
                    {/* Tabs */}
                    <div className="flex border-b border-white/10">
                        <button
                            onClick={() => handleTabChange('estadisticas')}
                            className={`flex-1 px-4 py-3 lg:px-6 lg:py-4 text-sm font-medium transition-all duration-300 relative ${
                                activeTab === 'estadisticas'
                                    ? 'text-white'
                                    : 'text-white/60 hover:text-white/80'
                            }`}
                        >
                            Estadísticas
                            {activeTab === 'estadisticas' && (
                                <div 
                                    className="absolute bottom-0 left-0 w-full h-0.5 bg-white transition-all duration-300"
                                    style={{
                                        boxShadow: `0 0 8px ${tempColor}`
                                    }}
                                />
                            )}
                        </button>
                        <button
                            onClick={() => handleTabChange('perfil')}
                            className={`flex-1 px-4 py-3 lg:px-6 lg:py-4 text-sm font-medium transition-all duration-300 relative ${
                                activeTab === 'perfil'
                                    ? 'text-white'
                                    : 'text-white/60 hover:text-white/80'
                            }`}
                        >
                            Perfil
                            {activeTab === 'perfil' && (
                                <div 
                                    className="absolute bottom-0 left-0 w-full h-0.5 bg-white transition-all duration-300"
                                    style={{
                                        boxShadow: `0 0 8px ${tempColor}`
                                    }}
                                />
                            )}
                        </button>
                    </div>

                    {/* Contenido de las pestañas */}
                    <div className="p-3 sm:p-4 lg:p-6">
                        <div 
                            className={`transition-all duration-300 ${
                                isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                            }`}
                        >
                            {activeTab === 'estadisticas' && (
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                        <div 
                                            className="bg-white/5 rounded-lg p-2 sm:p-3 border border-white/10 transition-all duration-500 hover:bg-white/10"
                                            style={{
                                                boxShadow: `0 0 15px ${tempColor}10`
                                            }}
                                        >
                                            <h3 className="text-white/80 text-xs sm:text-sm font-medium mb-2">Modo Diario</h3>
                                            <div className="space-y-1 sm:space-y-1.5">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-white/60 text-xs sm:text-sm">Victorias</span>
                                                    <span className="text-white text-xs sm:text-sm font-medium">{stats?.stats?.daily_wins || 0}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-white/60 text-xs sm:text-sm">Mejor racha</span>
                                                    <span className="text-white text-xs sm:text-sm font-medium">{stats?.stats?.best_daily_streak || 0} días</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-white/60 text-xs sm:text-sm">Racha actual</span>
                                                    <span className="text-white text-xs sm:text-sm font-medium">{stats?.stats?.daily_current_streak || 0} días</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div 
                                            className="bg-white/5 rounded-lg p-2 sm:p-3 border border-white/10 transition-all duration-500 hover:bg-white/10"
                                            style={{
                                                boxShadow: `0 0 15px ${tempColor}10`
                                            }}
                                        >
                                            <h3 className="text-white/80 text-xs sm:text-sm font-medium mb-2">Modo Infinito</h3>
                                            <div className="space-y-1 sm:space-y-1.5">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-white/60 text-xs sm:text-sm">Victorias</span>
                                                    <span className="text-white text-xs sm:text-sm font-medium">{stats?.stats?.infinite_wins || 0}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-white/60 text-xs sm:text-sm">Mejor racha</span>
                                                    <span className="text-white text-xs sm:text-sm font-medium">{stats?.stats?.best_infinite_streak || 0} palabras</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-white/60 text-xs sm:text-sm">Racha actual</span>
                                                    <span className="text-white text-xs sm:text-sm font-medium">{stats?.stats?.infinite_current_streak || 0} palabras</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2 sm:gap-3">
                                        <div 
                                            className="bg-white/5 rounded-lg p-2 sm:p-3 border border-white/10 transition-all duration-500 hover:bg-white/10"
                                            style={{
                                                boxShadow: `0 0 15px ${tempColor}10`
                                            }}
                                        >
                                            <h3 className="text-white/80 text-xs sm:text-sm font-medium mb-2">Rendimiento</h3>
                                            <div className="space-y-1 sm:space-y-1.5">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-white/60 text-xs sm:text-sm">Promedio de intentos</span>
                                                    <span className="text-white text-xs sm:text-sm font-medium">
                                                        {Number(stats?.stats?.avg_attempts_win || 0).toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-white/60 text-xs sm:text-sm">Tiempo promedio</span>
                                                    <span className="text-white text-xs sm:text-sm font-medium">
                                                        {Number(stats?.stats?.avg_time_win || 0).toFixed(2)}s
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-white/60 text-xs sm:text-sm">Total de juegos</span>
                                                    <span className="text-white text-xs sm:text-sm font-medium">{stats?.stats?.total_games || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'perfil' && (
                                <div className="space-y-4 sm:space-y-6">
                                    <div>
                                        <h2 className="text-white/80 text-xs sm:text-sm font-medium mb-3 sm:mb-4">Color de perfil</h2>
                                        <div className="grid grid-cols-4 gap-3 sm:gap-4">
                                            {colors.map((color) => (
                                                <button
                                                    key={color}
                                                    onClick={() => handleColorSelect(color)}
                                                    disabled={isUpdating}
                                                    className={`group relative h-12 sm:h-16 rounded-lg sm:rounded-xl transition-all duration-300 overflow-hidden ${
                                                        tempColor === color 
                                                            ? 'ring-2 ring-white scale-105' 
                                                            : 'hover:scale-102'
                                                    }`}
                                                    style={{ 
                                                        backgroundColor: color,
                                                        boxShadow: tempColor === color ? `0 0 15px ${color}40` : 'none'
                                                    }}
                                                >
                                                    <div 
                                                        className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                        style={{ backgroundColor: color }}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                        
                                        <button
                                            onClick={handleSaveColor}
                                            disabled={isUpdating || tempColor === selectedColor}
                                            className={`mt-4 sm:mt-6 w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
                                                isUpdating || tempColor === selectedColor
                                                    ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                                                    : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40'
                                            }`}
                                        >
                                            {isUpdating ? 'Guardando...' : 'Guardar Color'}
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm tracking-wide transition-all duration-300 border border-red-500/20 hover:border-red-500/40"
                                    >
                                        Cerrar Sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 