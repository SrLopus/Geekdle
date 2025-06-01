import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameMode } from '../context/GameModeContext';
import { useCategory } from '../context/CategoryContext';
import logoVerde from '../assets/logo_verde.svg';
import logoAzul from '../assets/logo_azul.svg';
import logoMorado from '../assets/logo_morado.svg';
import logoNaranja from '../assets/logo_naranja.svg';
import logoRojo from '../assets/logo_rojo.svg';
import LevelUpAnimation from './LevelUpAnimation';

const Navegacion = () => {
    const { isAuthenticated, user, logout, checkAuth } = useAuth();
    const { gameMode, setGameMode } = useGameMode();
    const { selectedCategory, getCategoryStyle, setSelectedCategory } = useCategory();
    const categoryStyle = getCategoryStyle(selectedCategory);
    const navigate = useNavigate();
    const location = useLocation();
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [levelUpPoints, setLevelUpPoints] = useState(0);
    const [previousPoints, setPreviousPoints] = useState(null);
    const [showMenu, setShowMenu] = useState(false);
    const [showCategoryMenu, setShowCategoryMenu] = useState(false);
    const [showModeMenu, setShowModeMenu] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Verificar autenticación solo cuando cambia la ruta y no hay usuario
    useEffect(() => {
        const checkUserAuth = async () => {
            if (!user && isAuthenticated) {
                try {
                    await checkAuth();
                } catch (error) {
                    console.error('Error al verificar autenticación:', error);
                }
            }
        };
        
        checkUserAuth();
    }, [location.pathname, user, isAuthenticated, checkAuth]);

    // Manejar el estado del usuario
    useEffect(() => {
        if (user && previousPoints !== null && user.points > previousPoints) {
            setLevelUpPoints(user.points - previousPoints);
            setShowLevelUp(true);
            
            // Cerrar el popup después de 2 segundos
            const timer = setTimeout(() => {
                setShowLevelUp(false);
            }, 2000);

            return () => clearTimeout(timer);
        }
        setPreviousPoints(user?.points || 0);
    }, [user, previousPoints]);

    // Cerrar todos los menús al cambiar de ruta
    useEffect(() => {
        setShowMenu(false);
        setShowCategoryMenu(false);
        setShowModeMenu(false);
        setShowUserMenu(false);
    }, [location.pathname]);

    // Cerrar el menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showMenu && !event.target.closest('.menu-container') && !event.target.closest('button')) {
                setShowMenu(false);
                setShowCategoryMenu(false);
                setShowModeMenu(false);
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    const handleMenuToggle = () => {
        if (showMenu) {
            setShowMenu(false);
            setShowCategoryMenu(false);
            setShowModeMenu(false);
            setShowUserMenu(false);
        } else {
            setShowMenu(true);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/juego');
        setShowMenu(false);
        setShowCategoryMenu(false);
        setShowModeMenu(false);
        setShowUserMenu(false);
    };

    // Calcular el progreso del nivel
    const calculateLevelProgress = () => {
        if (!user) return 0;
        
        // Puntos necesarios para el nivel actual
        const pointsForCurrentLevel = (user.level - 1) * 100;
        // Puntos necesarios para el siguiente nivel
        const pointsForNextLevel = user.level * 100;
        // Puntos actuales en el nivel actual
        const currentPoints = user.points - pointsForCurrentLevel;
        // Puntos necesarios para subir de nivel
        const pointsNeeded = pointsForNextLevel - pointsForCurrentLevel;
        
        // Calcular el porcentaje de progreso
        return (currentPoints / pointsNeeded) * 100;
    };

    // Función para determinar el color según el nivel
    const getLevelColor = (level) => {
        if (level <= 10) return '#10B981';
        if (level <= 25) return '#3B82F6';
        if (level <= 50) return '#8B5CF6';
        if (level <= 100) return '#EC4899';
        return '#F59E0B';
    };

    // Función para obtener el logo según el color de la categoría
    const getLogoByColor = (color) => {
        // Asegurarse de que el color esté en formato hexadecimal
        const normalizedColor = color?.toLowerCase() || '#10B981';
        
        switch(normalizedColor) {
            case '#10b981': // tecnología (verde)
            case '#059669': // tecnología (verde oscuro)
                return logoVerde;
            case '#3b82f6': // programación (azul)
            case '#2563eb': // programación (azul oscuro)
                return logoAzul;
            case '#8b5cf6': // videojuegos (morado)
            case '#7c3aed': // videojuegos (morado oscuro)
                return logoMorado;
            case '#f59e0b': // manga (naranja)
            case '#d97706': // manga (naranja oscuro)
                return logoNaranja;
            case '#ef4444': // comics (rojo)
            case '#dc2626': // comics (rojo oscuro)
                return logoRojo;
            case '#ec4899': // anime (rosa)
            case '#db2777': // anime (rosa oscuro)
                return logoRojo;
            case '#6366f1': // películas (índigo)
            case '#4f46e5': // películas (índigo oscuro)
                return logoAzul;
            case '#14b8a6': // series (teal)
            case '#0d9488': // series (teal oscuro)
                return logoVerde;
            case '#6b7280': // hardware (gris)
            case '#4b5563': // hardware (gris oscuro)
                return logoVerde;
            case '#06b6d4': // internet (cyan)
            case '#0891b2': // internet (cyan oscuro)
                return logoAzul;
            default:
                return logoVerde;
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-xl border-b border-white/5">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-4 lg:gap-8">
                        <Link to="/" className="group flex items-center gap-2 lg:gap-3 transition-all duration-300">
                            <div className="bg-white/90 rounded-full p-2 lg:p-2.5 ring-2 ring-white/20 group-hover:bg-white group-hover:ring-white/30 transition-all duration-300 shadow-lg flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 relative"
                                style={{
                                    boxShadow: `0 0 20px ${categoryStyle.primaryColor}40`,
                                    borderColor: `${categoryStyle.primaryColor}40`
                                }}
                            >
                                <div className="absolute inset-[-2px] rounded-full border-2 transition-all duration-300"
                                    style={{
                                        borderColor: `${categoryStyle.primaryColor}40`
                                    }}
                                ></div>
                                <img 
                                    src={getLogoByColor(categoryStyle.primaryColor)} 
                                    alt="Geekdle" 
                                    className="w-6 h-6 lg:w-8 lg:h-8 drop-shadow-sm relative z-10" 
                                />
                                <div className="absolute inset-2 rounded-full border transition-all duration-300"
                                    style={{
                                        borderColor: `${categoryStyle.primaryColor}20`
                                    }}
                                ></div>
                            </div>
                            <span className="text-xl lg:text-2xl font-black tracking-wider text-white group-hover:text-white transition-colors duration-300"
                                style={{
                                    color: categoryStyle.primaryColor
                                }}
                            >
                                GEEKDLE
                            </span>
                        </Link>
                        <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-lg ring-1 ring-white/5">
                            <button
                                onClick={() => {
                                    setGameMode('daily');
                                    navigate('/juego');
                                }}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all duration-300
                                    ${gameMode === 'daily' 
                                        ? 'text-white shadow-lg' 
                                        : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                                style={{
                                    backgroundColor: gameMode === 'daily' ? categoryStyle.primaryColor : 'transparent',
                                    boxShadow: gameMode === 'daily' ? `0 0 20px ${categoryStyle.primaryColor}40` : 'none'
                                }}
                            >
                                Diario
                            </button>
                            <button
                                onClick={() => {
                                    setGameMode('infinite');
                                    navigate('/juego');
                                }}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all duration-300
                                    ${gameMode === 'infinite' 
                                        ? 'text-white shadow-lg' 
                                        : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                                style={{
                                    backgroundColor: gameMode === 'infinite' ? categoryStyle.primaryColor : 'transparent',
                                    boxShadow: gameMode === 'infinite' ? `0 0 20px ${categoryStyle.primaryColor}40` : 'none'
                                }}
                            >
                                Infinito
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-3">
                        {isAuthenticated ? (
                            <>
                                <div className="relative flex items-center gap-2">
                                    <NavLink 
                                        to="/perfil" 
                                        className={({ isActive }) => 
                                            `h-9 w-9 lg:h-10 lg:w-10 rounded-full flex items-center justify-center text-lg lg:text-xl font-black text-white transition-all duration-300 relative ${
                                                isActive 
                                                    ? 'ring-2 ring-emerald-400 shadow-lg shadow-emerald-400/20' 
                                                    : 'hover:ring-2 hover:ring-white/20 hover:shadow-lg hover:shadow-white/5'
                                            }`
                                        }
                                        style={{ 
                                            backgroundColor: user?.avatarColor || '#10B981',
                                            boxShadow: showLevelUp ? `0 0 25px ${getLevelColor(user.level)}50` : 'none',
                                            transition: 'box-shadow 0.3s ease-in-out'
                                        }}
                                    >
                                        {user?.username?.charAt(0).toUpperCase()}
                                        <div className="absolute -bottom-1 -left-1.5 lg:-bottom-1.5 lg:-left-2 w-5 h-5 lg:w-6 lg:h-6 bg-black rounded-full ring-2 ring-black">
                                            <svg className="w-full h-full" viewBox="0 0 36 36">
                                                <path
                                                    d="M18 2.0845
                                                        a 15.9155 15.9155 0 0 1 0 31.831
                                                        a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    fill="none"
                                                    stroke="#1F2937"
                                                    strokeWidth="2.5"
                                                />
                                                <motion.path
                                                    d="M18 2.0845
                                                        a 15.9155 15.9155 0 0 1 0 31.831
                                                        a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    fill="none"
                                                    stroke={getLevelColor(user.level)}
                                                    strokeWidth="2.5"
                                                    initial={{ strokeDasharray: "0, 100" }}
                                                    animate={{ 
                                                        strokeDasharray: `${calculateLevelProgress()}, 100`,
                                                        transition: { duration: 1, ease: "easeInOut" }
                                                    }}
                                                    style={{
                                                        filter: showLevelUp ? `drop-shadow(0 0 12px ${getLevelColor(user.level)})` : 'none',
                                                        transition: 'filter 0.3s ease-in-out'
                                                    }}
                                                />
                                            </svg>
                                            <motion.div 
                                                className="absolute inset-0 flex items-center justify-center font-bold"
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ 
                                                    opacity: 1, 
                                                    scale: 1,
                                                    transition: { duration: 0.3, delay: 0.2 }
                                                }}
                                                style={{ 
                                                    color: getLevelColor(user.level),
                                                    fontSize: `${user?.level >= 100 ? '7px' : user?.level >= 10 ? '8px' : '9px'}`,
                                                    filter: showLevelUp ? `drop-shadow(0 0 12px ${getLevelColor(user.level)})` : 'none',
                                                    transition: 'filter 0.3s ease-in-out'
                                                }}
                                            >
                                                {user?.level || 1}
                                            </motion.div>
                                        </div>
                                    </NavLink>
                                    {showLevelUp && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                            className="absolute -left-1/2 top-full mt-2 z-50"
                                        >
                                            <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-xl border border-white/5 rounded-full px-3 py-1 shadow-lg"
                                                style={{
                                                    boxShadow: `0 0 15px ${getLevelColor(user.level)}15`
                                                }}
                                            >
                                                <span className="text-xs font-medium" style={{ color: getLevelColor(user.level) }}>
                                                    +{levelUpPoints}
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                                <button
                                    onClick={handleMenuToggle}
                                    className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <svg 
                                        className="w-5 h-5 text-white/80" 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        stroke="currentColor"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d={showMenu ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                                        />
                                    </svg>
                                </button>
                                <div className="hidden lg:flex items-center gap-2">
                                    <NavLink 
                                        to="/amigos" 
                                        className={({ isActive }) => 
                                            `group flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium tracking-wider transition-all duration-300 ${
                                                isActive 
                                                    ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-400/50 shadow-lg shadow-emerald-400/10' 
                                                    : 'text-white/80 hover:text-emerald-400 hover:bg-white/5 hover:ring-1 hover:ring-white/10'
                                            }`
                                        }
                                    >
                                        <svg 
                                            className="w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={2} 
                                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
                                            />
                                        </svg>
                                        AMIGOS
                                    </NavLink>
                                    <NavLink 
                                        to="/historial" 
                                        className={({ isActive }) => 
                                            `group flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium tracking-wider transition-all duration-300 ${
                                                isActive 
                                                    ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-400/50 shadow-lg shadow-emerald-400/10' 
                                                    : 'text-white/80 hover:text-emerald-400 hover:bg-white/5 hover:ring-1 hover:ring-white/10'
                                            }`
                                        }
                                    >
                                        <svg 
                                            className="w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={2} 
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                                            />
                                        </svg>
                                        HISTORIAL
                                    </NavLink>
                                    {user.role === 'admin' && (
                                        <NavLink 
                                            to="/admin" 
                                            className={({ isActive }) => 
                                                `group flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium tracking-wider transition-all duration-300 ${
                                                    isActive 
                                                        ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-400/50 shadow-lg shadow-emerald-400/10' 
                                                        : 'text-white/80 hover:text-emerald-400 hover:bg-white/5 hover:ring-1 hover:ring-white/10'
                                                }`
                                            }
                                        >
                                            <svg 
                                                className="w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110" 
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24"
                                            >
                                                <path 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round" 
                                                    strokeWidth={2} 
                                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
                                                />
                                                <path 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round" 
                                                    strokeWidth={2} 
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                                                />
                                            </svg>
                                            ADMIN
                                        </NavLink>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2 sm:gap-3">
                                <NavLink 
                                    to="/login"
                                    className={({ isActive }) => 
                                        `group flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium tracking-wider transition-all duration-300 ${
                                            isActive 
                                                ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-400/50 shadow-lg shadow-emerald-400/10' 
                                                : 'text-white/80 hover:text-emerald-400 hover:bg-white/5 hover:ring-1 hover:ring-white/10'
                                        }`
                                    }
                                >
                                    <svg 
                                        className="w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" 
                                        />
                                    </svg>
                                    <span className="hidden sm:inline">INICIAR SESIÓN</span>
                                </NavLink>
                                <NavLink 
                                    to="/registro" 
                                    className={({ isActive }) => 
                                        `group flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium tracking-wider transition-all duration-300 ${
                                            isActive 
                                                ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-400/50 shadow-lg shadow-emerald-400/10' 
                                                : 'text-white/80 hover:text-emerald-400 hover:bg-white/5 hover:ring-1 hover:ring-white/10'
                                        }`
                                    }
                                >
                                    <svg 
                                        className="w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" 
                                        />
                                    </svg>
                                    <span className="hidden sm:inline">REGISTRARSE</span>
                                </NavLink>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Menú móvil */}
            <AnimatePresence>
                {showMenu && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleMenuToggle}
                            className="fixed top-16 inset-x-0 bottom-0 bg-black z-[100] lg:hidden"
                        />

                        {/* Panel de menú */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed top-16 left-0 right-0 bg-black border-b border-white/5 z-[101] lg:hidden menu-container"
                        >
                            <div className="container mx-auto px-4 py-4">
                                {/* Modo de juego - Móvil */}
                                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg ring-1 ring-white/5 mb-4">
                                    <button
                                        onClick={() => {
                                            setGameMode('daily');
                                            navigate('/juego');
                                            setShowMenu(false);
                                        }}
                                        className={`flex-1 px-4 py-2 rounded-md text-xs font-bold uppercase transition-all duration-300
                                            ${gameMode === 'daily' 
                                                ? 'text-white shadow-lg' 
                                                : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                                        style={{
                                            backgroundColor: gameMode === 'daily' ? categoryStyle.primaryColor : 'transparent',
                                            boxShadow: gameMode === 'daily' ? `0 0 20px ${categoryStyle.primaryColor}40` : 'none'
                                        }}
                                    >
                                        Diario
                                    </button>
                                    <button
                                        onClick={() => {
                                            setGameMode('infinite');
                                            navigate('/juego');
                                            setShowMenu(false);
                                        }}
                                        className={`flex-1 px-4 py-2 rounded-md text-xs font-bold uppercase transition-all duration-300
                                            ${gameMode === 'infinite' 
                                                ? 'text-white shadow-lg' 
                                                : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                                        style={{
                                            backgroundColor: gameMode === 'infinite' ? categoryStyle.primaryColor : 'transparent',
                                            boxShadow: gameMode === 'infinite' ? `0 0 20px ${categoryStyle.primaryColor}40` : 'none'
                                        }}
                                    >
                                        Infinito
                                    </button>
                                </div>

                                {/* Enlaces de navegación - Móvil */}
                                <div className="flex flex-col gap-2">
                                    {isAuthenticated ? (
                                        <>
                                            <NavLink 
                                                to="/amigos" 
                                                onClick={() => setShowMenu(false)}
                                                className={({ isActive }) => 
                                                    `group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium tracking-wider transition-all duration-300 ${
                                                        isActive 
                                                            ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-400/50 shadow-lg shadow-emerald-400/10' 
                                                            : 'text-white/80 hover:text-emerald-400 hover:bg-white/5 hover:ring-1 hover:ring-white/10'
                                                    }`
                                                }
                                            >
                                                <svg 
                                                    className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" 
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path 
                                                        strokeLinecap="round" 
                                                        strokeLinejoin="round" 
                                                        strokeWidth={2} 
                                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
                                                    />
                                                </svg>
                                                AMIGOS
                                            </NavLink>
                                            <NavLink 
                                                to="/historial" 
                                                onClick={() => setShowMenu(false)}
                                                className={({ isActive }) => 
                                                    `group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium tracking-wider transition-all duration-300 ${
                                                        isActive 
                                                            ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-400/50 shadow-lg shadow-emerald-400/10' 
                                                            : 'text-white/80 hover:text-emerald-400 hover:bg-white/5 hover:ring-1 hover:ring-white/10'
                                                    }`
                                                }
                                            >
                                                <svg 
                                                    className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" 
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path 
                                                        strokeLinecap="round" 
                                                        strokeLinejoin="round" 
                                                        strokeWidth={2} 
                                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                                                    />
                                                </svg>
                                                HISTORIAL
                                            </NavLink>
                                            {user.role === 'admin' && (
                                                <NavLink 
                                                    to="/admin" 
                                                    onClick={() => setShowMenu(false)}
                                                    className={({ isActive }) => 
                                                        `group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium tracking-wider transition-all duration-300 ${
                                                            isActive 
                                                                ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-400/50 shadow-lg shadow-emerald-400/10' 
                                                                : 'text-white/80 hover:text-emerald-400 hover:bg-white/5 hover:ring-1 hover:ring-white/10'
                                                        }`
                                                    }
                                                >
                                                    <svg 
                                                        className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" 
                                                        fill="none" 
                                                        stroke="currentColor" 
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path 
                                                            strokeLinecap="round" 
                                                            strokeLinejoin="round" 
                                                            strokeWidth={2} 
                                                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
                                                        />
                                                        <path 
                                                            strokeLinecap="round" 
                                                            strokeLinejoin="round" 
                                                            strokeWidth={2} 
                                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                                                        />
                                                    </svg>
                                                    ADMIN
                                                </NavLink>
                                            )}
                                            <button
                                                onClick={handleLogout}
                                                className="group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium tracking-wider text-white/80 hover:text-red-400 hover:bg-white/5 hover:ring-1 hover:ring-white/10 transition-all duration-300"
                                            >
                                                <svg 
                                                    className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" 
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path 
                                                        strokeLinecap="round" 
                                                        strokeLinejoin="round" 
                                                        strokeWidth={2} 
                                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                                                    />
                                                </svg>
                                                CERRAR SESIÓN
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <NavLink 
                                                to="/login" 
                                                onClick={() => setShowMenu(false)}
                                                className={({ isActive }) => 
                                                    `group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium tracking-wider transition-all duration-300 ${
                                                        isActive 
                                                            ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-400/50 shadow-lg shadow-emerald-400/10' 
                                                            : 'text-white/80 hover:text-emerald-400 hover:bg-white/5 hover:ring-1 hover:ring-white/10'
                                                    }`
                                                }
                                            >
                                                <svg 
                                                    className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" 
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path 
                                                        strokeLinecap="round" 
                                                        strokeLinejoin="round" 
                                                        strokeWidth={2} 
                                                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" 
                                                    />
                                                </svg>
                                                INICIAR SESIÓN
                                            </NavLink>
                                            <NavLink 
                                                to="/registro" 
                                                onClick={() => setShowMenu(false)}
                                                className={({ isActive }) => 
                                                    `group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium tracking-wider transition-all duration-300 ${
                                                        isActive 
                                                            ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-400/50 shadow-lg shadow-emerald-400/10' 
                                                            : 'text-white/80 hover:text-emerald-400 hover:bg-white/5 hover:ring-1 hover:ring-white/10'
                                                    }`
                                                }
                                            >
                                                <svg 
                                                    className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" 
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path 
                                                        strokeLinecap="round" 
                                                        strokeLinejoin="round" 
                                                        strokeWidth={2} 
                                                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" 
                                                    />
                                                </svg>
                                                REGISTRARSE
                                            </NavLink>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navegacion; 