import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import { motion, AnimatePresence } from 'framer-motion';
import historyService from '../services/historyService';

// Componente para las tarjetas de carga
const LoadingCard = ({ index }) => (
    <motion.div
        key={index}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: index * 0.2
        }}
        className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl p-4 border border-white/10 shadow-lg backdrop-blur-sm"
    >
        <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-gradient-to-r from-white/10 to-white/5 rounded-full animate-pulse"></div>
                <div className="h-4 w-16 bg-gradient-to-r from-white/10 to-white/5 rounded-full animate-pulse"></div>
            </div>
            <div className="border-t border-white/10 pt-3">
                <div className="h-6 w-32 bg-gradient-to-r from-white/10 to-white/5 rounded-full animate-pulse mx-auto"></div>
            </div>
        </div>
    </motion.div>
);

// Componente para las tarjetas de juego
const GameCard = ({ game, index }) => {
    const getGameStatusColor = (status) => {
        switch (status) {
            case 'won': return 'text-emerald-400';
            case 'lost': return 'text-red-400';
            default: return 'text-white/60';
        }
    };

    const getGameStatusText = (status) => {
        switch (status) {
            case 'won': return 'Victoria';
            case 'lost': return 'Derrota';
            default: return 'En progreso';
        }
    };

    const getStatusGradient = (status) => {
        switch (status) {
            case 'won': return 'from-emerald-500/20 to-emerald-500/5';
            case 'lost': return 'from-red-500/20 to-red-500/5';
            default: return 'from-white/10 to-white/5';
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                transition: {
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                    delay: index * 0.05
                }
            }}
            whileHover={{ 
                scale: 1.01,
                transition: { duration: 0.1 }
            }}
            className={`bg-gradient-to-br ${getStatusGradient(game.status)} rounded-xl p-4 border border-white/10 shadow-lg backdrop-blur-sm transition-all duration-150 hover:shadow-xl hover:border-white/20 origin-center`}
        >
            <motion.div 
                className="flex flex-col space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 + 0.1 }}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <motion.h3 
                            className="text-white/90 text-sm font-medium tracking-wide"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 + 0.2 }}
                        >
                            {new Date(game.date).toLocaleDateString()}
                        </motion.h3>
                        <motion.p 
                            className="text-white/50 text-xs mt-1 font-light"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 + 0.3 }}
                        >
                            Categoría: {game.category}
                        </motion.p>
                    </div>
                    <div className="text-right">
                        <motion.p 
                            className={`text-sm font-medium tracking-wide ${getGameStatusColor(game.status)}`}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 + 0.2 }}
                        >
                            {getGameStatusText(game.status)}
                        </motion.p>
                        <motion.p 
                            className="text-white/50 text-xs mt-1 font-light"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 + 0.3 }}
                        >
                            Intentos: {game.attempts}
                        </motion.p>
                    </div>
                </div>
                <motion.div 
                    className="border-t border-white/10 pt-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 + 0.4 }}
                >
                    <p className="text-xl font-bold text-white text-center tracking-wider bg-gradient-to-r from-transparent via-white/10 to-transparent py-2 rounded-lg">
                        {game.word}
                    </p>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

// Componente para el mensaje de lista vacía
const EmptyListMessage = () => (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8"
    >
        <div className="inline-block p-4 rounded-full bg-white/5 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        </div>
        <p className="text-white/40 text-sm font-light">No hay juegos en este modo</p>
    </motion.div>
);

export default function Historial() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [historial, setHistorial] = useState([]);
    const [activeTab, setActiveTab] = useState('diario');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [error, setError] = useState(null);

    const fetchHistorial = useCallback(async () => {
        try {
            setError(null);
            setIsLoading(true);
            setHistorial([]);
            historyService.clearCache();
            const data = await historyService.getGameHistory();
            console.log('Historial cargado:', data);
            setHistorial(data);
        } catch (error) {
            console.error('Error al obtener el historial:', error);
            setError(error.message || 'No se pudo cargar el historial. Por favor, intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Efecto para cargar el historial al montar el componente
    useEffect(() => {
        console.log('Componente montado, usuario:', user);
        if (user) {
            console.log('Iniciando carga del historial...');
            fetchHistorial();
        }
    }, []);

    // Efecto para redirigir si no hay usuario
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleTabChange = (tab) => {
        if (tab === activeTab || isTransitioning) return;
        setIsTransitioning(true);
        setActiveTab(tab);
        setTimeout(() => setIsTransitioning(false), 300);
    };

    const handleRetry = () => {
        setIsLoading(true);
        fetchHistorial();
    };

    if (!user) return null;

    const filteredGames = historial.filter(game => 
        game.mode === (activeTab === 'diario' ? 'daily' : 'infinite')
    );

    return (
        <>
            <AnimatedBackground />
            <div className="min-h-screen pt-16 pb-12 px-4 relative z-10 flex items-start justify-center">
                <div className="max-w-2xl w-full mt-8">
                    <motion.div 
                        className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Tabs */}
                        <div className="flex border-b border-white/10 bg-gradient-to-r from-black/40 to-black/20">
                            {['diario', 'infinito'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => handleTabChange(tab)}
                                    className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 relative ${
                                        activeTab === tab
                                            ? 'text-white'
                                            : 'text-white/60 hover:text-white/80'
                                    }`}
                                >
                                    <span className="relative z-10">
                                        Modo {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </span>
                                    {activeTab === tab && (
                                        <motion.div 
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Contenido */}
                        <div className="p-6">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                >
                                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                        {error ? (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-center py-8"
                                            >
                                                <div className="inline-block p-4 rounded-full bg-red-500/10 mb-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <p className="text-red-400 mb-4 font-medium">{error}</p>
                                                <button
                                                    onClick={handleRetry}
                                                    className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all duration-200 font-medium tracking-wide hover:scale-105"
                                                >
                                                    Reintentar
                                                </button>
                                            </motion.div>
                                        ) : isLoading ? (
                                            [...Array(3)].map((_, index) => (
                                                <LoadingCard key={index} index={index} />
                                            ))
                                        ) : filteredGames.length === 0 ? (
                                            <EmptyListMessage />
                                        ) : (
                                            <div className="space-y-4 px-1">
                                                {filteredGames.map((game, index) => (
                                                    <GameCard key={index} game={game} index={index} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    );
} 