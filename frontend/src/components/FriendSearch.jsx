import React, { useState, useEffect, useCallback } from 'react';
import { searchUsers, sendFriendRequest } from '../services/friendService';
import { useCategory } from '../context/CategoryContext';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const UserCard = ({ user, onSendRequest, isSending, categoryStyle }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/20 rounded-xl border border-white/5 p-4 flex items-center justify-between group hover:bg-black/30 transition-all duration-300"
    >
        <div className="flex items-center gap-3">
            <div 
                className="w-12 h-12 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center"
                style={{ backgroundColor: user.avatarColor || categoryStyle.primaryColor }}
            >
                <span className="text-lg font-bold text-white">
                    {user.username.charAt(0).toUpperCase()}
                </span>
            </div>
            <div>
                <h4 className="font-medium text-white group-hover:text-emerald-400 transition-colors duration-300">
                    {user.username}
                </h4>
                <p className="text-xs text-white/60">Nivel {user.level}</p>
            </div>
        </div>
        <motion.button
            onClick={() => onSendRequest(user.id)}
            disabled={user.requestSent || isSending}
            className={`relative px-4 py-2 rounded-xl text-xs font-medium tracking-wider transition-all duration-300 ${
                user.requestSent
                    ? 'bg-white/10 text-white/40 cursor-not-allowed'
                    : 'text-white hover:scale-105'
            }`}
            style={{
                backgroundColor: user.requestSent ? 'transparent' : categoryStyle.primaryColor,
                boxShadow: user.requestSent ? 'none' : `0 0 20px ${categoryStyle.primaryColor}40`
            }}
            whileHover={!user.requestSent && !isSending ? { scale: 1.05 } : {}}
            whileTap={!user.requestSent && !isSending ? { scale: 0.95 } : {}}
        >
            <span className="relative z-10 flex items-center gap-1">
                {isSending ? (
                    <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        ENVIANDO...
                    </>
                ) : user.requestSent ? (
                    <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        ENVIADA
                    </>
                ) : (
                    <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        AGREGAR
                    </>
                )}
            </span>
        </motion.button>
    </motion.div>
);

const FriendSearch = ({ onRequestSent }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [sendingRequests, setSendingRequests] = useState({});
    const [error, setError] = useState(null);
    const { getCategoryStyle } = useCategory();
    const categoryStyle = getCategoryStyle();
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [sentRequests, setSentRequests] = useState([]);
    const [showSentRequestsMenu, setShowSentRequestsMenu] = useState(false);

    const performSearch = useCallback(async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            const response = await searchUsers(query);
            setSearchResults(response?.users || []);
            setSentRequests(response?.sent_requests || []);
        } catch (error) {
            const errorMessage = error.message === 'No autorizado. Por favor, inicia sesión nuevamente.'
                ? 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
                : 'Error al buscar usuarios';
            setError(errorMessage);
            toast.error(errorMessage);
            setSearchResults([]);
        }
    }, []);

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        setIsLoading(true);

        // Cancelar la búsqueda anterior si existe
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Establecer un nuevo timeout para la búsqueda
        const timeout = setTimeout(() => {
            performSearch(query);
            setIsLoading(false);
        }, 300);

        setSearchTimeout(timeout);
    };

    const handleSendRequest = async (userId) => {
        if (sendingRequests[userId]) return;
        
        try {
            setSendingRequests(prev => ({ ...prev, [userId]: true }));
            await sendFriendRequest(userId);
            setSearchResults(prev =>
                prev.map(user =>
                    user.id === userId ? { ...user, requestSent: true } : user
                )
            );
            if (onRequestSent) {
                onRequestSent();
            }
        } catch (error) {
            const errorMessage = error.message === 'No autorizado. Por favor, inicia sesión nuevamente.'
                ? 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
                : 'Error al enviar solicitud';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setSendingRequests(prev => ({ ...prev, [userId]: false }));
        }
    };

    // Limpiar el timeout al desmontar el componente
    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    return (
        <div className="h-full flex flex-col">
            <div className="p-6 border-b border-white/5 bg-black/20">
                <div className="mb-4">
                    <h2 className="text-lg font-bold text-white mb-1">Buscar Amigos</h2>
                    <p className="text-xs text-white/60">Encuentra y agrega nuevos amigos</p>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Buscar por nombre de usuario..."
                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300"
                    />
                    {isLoading && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: categoryStyle.primaryColor }}></div>
                        </div>
                    )}
                </div>
                {error && (
                    <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-xs">
                        {error}
                    </div>
                )}
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                <div className="space-y-3">
                    {searchResults.length > 0 ? (
                        searchResults.map(user => (
                            <UserCard
                                key={user.id}
                                user={user}
                                onSendRequest={handleSendRequest}
                                isSending={sendingRequests[user.id]}
                                categoryStyle={categoryStyle}
                            />
                        ))
                    ) : searchQuery.trim() ? (
                        <div className="text-center py-8">
                            <p className="text-sm text-white/60">No se encontraron usuarios</p>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-sm text-white/60">Escribe un nombre de usuario para buscar</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FriendSearch; 