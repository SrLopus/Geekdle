import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCategory } from '../context/CategoryContext';
import { rankingService } from '../services/rankingService';
import { getFriendsRanking } from '../services/friendService';

const Ranking = () => {
    const [topPlayers, setTopPlayers] = useState([]);
    const [friendsRanking, setFriendsRanking] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isVisible, setIsVisible] = useState(true);
    const [activeTab, setActiveTab] = useState('global');
    const { user } = useAuth();
    const { selectedCategory, getCategoryStyle } = useCategory();
    const categoryStyle = getCategoryStyle(selectedCategory);

    const fetchTopPlayers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await rankingService.getTopPlayers();
            setTopPlayers(data);
        } catch (error) {
            console.error('Error fetching top players:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchFriendsRanking = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getFriendsRanking();
            setFriendsRanking(data);
        } catch (error) {
            console.error('Error fetching friends ranking:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isVisible) {
            if (activeTab === 'global') {
                fetchTopPlayers();
            } else {
                fetchFriendsRanking();
            }
            const interval = setInterval(() => {
                if (activeTab === 'global') {
                    fetchTopPlayers();
                } else {
                    fetchFriendsRanking();
                }
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [isVisible, activeTab]);

    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    return (
        <>
            {/* Botón de ranking - Visible en todas las pantallas */}
            <motion.button
                onClick={toggleVisibility}
                className="fixed right-4 lg:right-8 top-24 z-40 bg-black/40 backdrop-blur-xl rounded-lg px-3 lg:px-4 py-2 lg:py-2.5 border border-white/5 hover:bg-white/5 transition-all duration-200 flex items-center gap-2 group shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2" style={{ borderColor: categoryStyle.primaryColor }}></div>
                ) : (
                    <svg 
                        className="w-4 h-4 lg:w-5 lg:h-5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        style={{ color: categoryStyle.primaryColor }}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                )}
                <span className="hidden lg:inline text-sm font-medium text-white/80 group-hover:text-white transition-colors duration-200">
                    Ranking
                </span>
            </motion.button>

            <AnimatePresence mode="wait">
                {isVisible && (
                    <>
                        {/* Overlay para móvil */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={toggleVisibility}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
                        />

                        {/* Panel de ranking */}
                        <motion.div
                            initial={{ 
                                opacity: 0, 
                                x: window.innerWidth < 1024 ? 0 : 100,
                                y: window.innerWidth < 1024 ? '100%' : 0,
                                scale: 0.95 
                            }}
                            animate={{ 
                                opacity: 1, 
                                x: 0,
                                y: 0,
                                scale: 1 
                            }}
                            exit={{ 
                                opacity: 0, 
                                x: window.innerWidth < 1024 ? 0 : 100,
                                y: window.innerWidth < 1024 ? '100%' : 0,
                                scale: 0.95 
                            }}
                            transition={{ 
                                type: "spring", 
                                stiffness: 300, 
                                damping: 30
                            }}
                            className={`fixed ${
                                window.innerWidth < 1024 
                                    ? 'bottom-0 left-0 right-0 w-full rounded-t-2xl' 
                                    : 'right-8 top-36 w-80 rounded-xl'
                            } bg-black/40 backdrop-blur-xl border border-white/5 overflow-hidden shadow-2xl z-40`}
                            style={{
                                maxHeight: window.innerWidth < 1024 ? '80vh' : '500px'
                            }}
                        >
                            <motion.div 
                                className="p-3 lg:p-4 border-b border-white/5 bg-black/20 flex items-center justify-between"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg lg:text-xl font-bold text-white flex items-center gap-2">
                                        <svg 
                                            className="w-4 h-4 lg:w-5 lg:h-5" 
                                            style={{ color: categoryStyle.primaryColor }}
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Ranking
                                    </h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1 sm:gap-2">
                                        <button
                                            onClick={() => setActiveTab('global')}
                                            className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm transition-colors duration-200 ${
                                                activeTab === 'global'
                                                    ? 'bg-white/10 text-white'
                                                    : 'text-white/60 hover:text-white'
                                            }`}
                                        >
                                            Global
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('friends')}
                                            className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm transition-colors duration-200 ${
                                                activeTab === 'friends'
                                                    ? 'bg-white/10 text-white'
                                                    : 'text-white/60 hover:text-white'
                                            }`}
                                        >
                                            Amigos
                                        </button>
                                    </div>
                                    <button 
                                        onClick={toggleVisibility}
                                        className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
                                    >
                                        <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </motion.div>

                            <div className="overflow-y-auto custom-scrollbar" style={{ 
                                maxHeight: window.innerWidth < 1024 ? 'calc(80vh - 60px)' : 'calc(500px - 60px)',
                                height: '100%'
                            }}>
                                {error ? (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="p-4 text-center text-white/60"
                                    >
                                        <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: categoryStyle.primaryColor }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p>{error}</p>
                                    </motion.div>
                                ) : (
                                    <AnimatePresence mode="wait">
                                        {activeTab === 'global' ? (
                                            <motion.div 
                                                key="global"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="divide-y divide-white/5"
                                            >
                                                {topPlayers.length === 0 ? (
                                                    <div className="p-4 text-center text-white/60">
                                                        No hay jugadores en el ranking
                                                    </div>
                                                ) : (
                                                    topPlayers.map((player, index) => (
                                                        <motion.div
                                                            key={player.id}
                                                            initial={{ opacity: 0, x: 50 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ 
                                                                delay: 0.2 + (index * 0.02),
                                                                type: "spring",
                                                                stiffness: 300,
                                                                damping: 30
                                                            }}
                                                            className={`p-2 sm:p-3 flex items-center gap-2 sm:gap-3 border-b border-white/5 hover:bg-white/5 transition-colors duration-200 ${
                                                                user?.id === player.id ? 'bg-opacity-10' : ''
                                                            }`}
                                                            style={{
                                                                backgroundColor: user?.id === player.id ? `${categoryStyle.primaryColor}20` : 'transparent'
                                                            }}
                                                        >
                                                            <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                                                                {index < 3 ? (
                                                                    <motion.div 
                                                                        initial={{ scale: 0 }}
                                                                        animate={{ scale: 1 }}
                                                                        transition={{ 
                                                                            delay: 0.3 + (index * 0.1),
                                                                            type: "spring",
                                                                            stiffness: 400,
                                                                            damping: 20
                                                                        }}
                                                                        className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                                                                            index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                                                                            index === 1 ? 'bg-gray-400/20 text-gray-400' :
                                                                            'bg-amber-600/20 text-amber-600'
                                                                        }`}
                                                                    >
                                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                        </svg>
                                                                    </motion.div>
                                                                ) : (
                                                                    <span className="text-xs sm:text-sm font-medium" style={{ color: categoryStyle.primaryColor }}>{index + 1}</span>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium text-sm sm:text-base text-white truncate">{player.username}</span>
                                                                    <div className="flex items-center gap-1">
                                                                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-bold"
                                                                             style={{ 
                                                                                 backgroundColor: `${categoryStyle.primaryColor}20`,
                                                                                 color: categoryStyle.primaryColor
                                                                             }}>
                                                                            {player.level}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-xs text-white/60">
                                                                    {player.points.toLocaleString()} puntos
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))
                                                )}
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="friends"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="divide-y divide-white/5"
                                            >
                                                {friendsRanking.length === 0 ? (
                                                    <div className="p-4 text-center text-white/60">
                                                        <svg className="w-12 h-12 mx-auto mb-2 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                        <p>No tienes amigos agregados</p>
                                                        <p className="text-sm mt-1">¡Agrega amigos para ver su ranking!</p>
                                                    </div>
                                                ) : (
                                                    friendsRanking.map((player, index) => (
                                                        <motion.div
                                                            key={player.id}
                                                            initial={{ opacity: 0, x: 50 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ 
                                                                delay: 0.2 + (index * 0.02),
                                                                type: "spring",
                                                                stiffness: 300,
                                                                damping: 30
                                                            }}
                                                            className={`p-2 sm:p-3 flex items-center gap-2 sm:gap-3 border-b border-white/5 hover:bg-white/5 transition-colors duration-200 ${
                                                                user?.id === player.id ? 'bg-opacity-10' : ''
                                                            }`}
                                                            style={{
                                                                backgroundColor: user?.id === player.id ? `${categoryStyle.primaryColor}20` : 'transparent'
                                                            }}
                                                        >
                                                            <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                                                                {index < 3 ? (
                                                                    <motion.div 
                                                                        initial={{ scale: 0 }}
                                                                        animate={{ scale: 1 }}
                                                                        transition={{ 
                                                                            delay: 0.3 + (index * 0.1),
                                                                            type: "spring",
                                                                            stiffness: 400,
                                                                            damping: 20
                                                                        }}
                                                                        className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                                                                            index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                                                                            index === 1 ? 'bg-gray-400/20 text-gray-400' :
                                                                            'bg-amber-600/20 text-amber-600'
                                                                        }`}
                                                                    >
                                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                        </svg>
                                                                    </motion.div>
                                                                ) : (
                                                                    <span className="text-xs sm:text-sm font-medium" style={{ color: categoryStyle.primaryColor }}>{index + 1}</span>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium text-sm sm:text-base text-white truncate">{player.username}</span>
                                                                    <div className="flex items-center gap-1">
                                                                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-bold"
                                                                             style={{ 
                                                                                 backgroundColor: `${categoryStyle.primaryColor}20`,
                                                                                 color: categoryStyle.primaryColor
                                                                             }}>
                                                                            {player.level}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-xs text-white/60">
                                                                    {player.points.toLocaleString()} puntos
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Ranking; 