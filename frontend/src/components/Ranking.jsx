import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCategory } from '../context/CategoryContext';
import { rankingService } from '../services/rankingService';
import { getFriendsRanking } from '../services/friendService';

const Ranking = ({ topUsers: propTopUsers }) => {
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

    // Efecto para actualizar cuando cambian los topUsers de las props
    useEffect(() => {
        if (propTopUsers && propTopUsers.length > 0) {
            setTopPlayers(propTopUsers);
        }
    }, [propTopUsers]);

    // Efecto para cargar el ranking inicial y actualizarlo periódicamente
    useEffect(() => {
        if (isVisible) {
            if (activeTab === 'global') {
            fetchTopPlayers();
            } else {
                fetchFriendsRanking();
            }
            // Actualizar el ranking cada 30 segundos
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

    const getLevelColor = (level) => {
        if (level <= 10) return '#10B981';
        if (level <= 25) return '#3B82F6';
        if (level <= 50) return '#8B5CF6';
        if (level <= 100) return '#EC4899';
        return '#F59E0B';
    };

    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    return (
        <>
            <motion.button
                onClick={toggleVisibility}
                className="fixed right-8 top-24 z-50 bg-black/40 backdrop-blur-xl rounded-lg px-4 py-2.5 border border-white/5 hover:bg-white/5 transition-all duration-200 flex items-center gap-2 group shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2" style={{ borderColor: categoryStyle.primaryColor }}></div>
                ) : (
                    <svg 
                        className="w-5 h-5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        style={{ color: categoryStyle.primaryColor }}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                )}
                <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors duration-200">
                    Ranking
                </span>
            </motion.button>

            <AnimatePresence>
                {isVisible && !loading && (
                    <motion.div
                        initial={{ opacity: 0, x: 100, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.95 }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 300, 
                            damping: 30,
                            duration: 0.3
                        }}
                        className="fixed right-8 top-36 w-80 bg-black/40 backdrop-blur-xl rounded-xl border border-white/5 overflow-hidden shadow-2xl"
                        style={{
                            boxShadow: `0 0 20px ${categoryStyle.primaryColor}20`
                        }}
                    >
                        <motion.div 
                            className="p-4 border-b border-white/5 bg-black/20"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-white">Ranking</h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setActiveTab('global')}
                                        className={`px-3 py-1 rounded-lg text-sm transition-colors duration-200 ${
                                            activeTab === 'global'
                                                ? 'bg-white/10 text-white'
                                                : 'text-white/60 hover:text-white'
                                        }`}
                                    >
                                        Global
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('friends')}
                                        className={`px-3 py-1 rounded-lg text-sm transition-colors duration-200 ${
                                            activeTab === 'friends'
                                                ? 'bg-white/10 text-white'
                                                : 'text-white/60 hover:text-white'
                                        }`}
                                    >
                                        Amigos
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                        <div className="h-[500px] overflow-y-auto custom-scrollbar">
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
                                        className={`p-3 flex items-center gap-3 border-b border-white/5 hover:bg-white/5 transition-colors duration-200 ${
                                            user?.id === player.id ? 'bg-opacity-10' : ''
                                        }`}
                                        style={{
                                            backgroundColor: user?.id === player.id ? `${categoryStyle.primaryColor}20` : 'transparent'
                                        }}
                                    >
                                        <div className="w-8 h-8 flex items-center justify-center">
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
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                        index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                                                        index === 1 ? 'bg-gray-400/20 text-gray-400' :
                                                        'bg-amber-600/20 text-amber-600'
                                                    }`}
                                                >
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                </motion.div>
                                            ) : (
                                                <span className="text-sm font-medium" style={{ color: categoryStyle.primaryColor }}>{index + 1}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-white truncate">{player.username}</span>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
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
                                                        className={`p-3 flex items-center gap-3 border-b border-white/5 hover:bg-white/5 transition-colors duration-200 ${
                                                            user?.id === player.id ? 'bg-opacity-10' : ''
                                                        }`}
                                                        style={{
                                                            backgroundColor: user?.id === player.id ? `${categoryStyle.primaryColor}20` : 'transparent'
                                                        }}
                                                    >
                                                        <div className="w-8 h-8 flex items-center justify-center">
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
                                                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                                        index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                                                                        index === 1 ? 'bg-gray-400/20 text-gray-400' :
                                                                        'bg-amber-600/20 text-amber-600'
                                                                    }`}
                                                                >
                                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                    </svg>
                                                                </motion.div>
                                                            ) : (
                                                                <span className="text-sm font-medium" style={{ color: categoryStyle.primaryColor }}>{index + 1}</span>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-white truncate">{player.username}</span>
                                                                <div className="flex items-center gap-1">
                                                                    <div className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
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
                )}
            </AnimatePresence>
        </>
    );
};

export default Ranking; 