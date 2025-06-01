import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getFriends, acceptFriendRequest, removeFriend } from '../services/friendService';
import { useCategory } from '../context/CategoryContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const FriendCard = ({ friend, onRemove, isProcessing, categoryStyle }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/20 rounded-xl border border-white/5 p-4 flex items-center justify-between group hover:bg-black/30 transition-all duration-300"
    >
        <div className="flex items-center gap-3">
            <div 
                className="w-12 h-12 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center"
                style={{ backgroundColor: friend.avatarColor || categoryStyle.primaryColor }}
            >
                <span className="text-lg font-bold text-white">
                    {friend.username.charAt(0).toUpperCase()}
                </span>
            </div>
            <div>
                <h4 className="font-medium text-white group-hover:text-emerald-400 transition-colors duration-300">
                    {friend.username}
                </h4>
                <p className="text-xs text-white/60">Nivel {friend.level}</p>
            </div>
        </div>
        <motion.button
            onClick={() => onRemove(friend.id)}
            disabled={isProcessing}
            className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all duration-300"
            whileHover={!isProcessing ? { scale: 1.05 } : {}}
            whileTap={!isProcessing ? { scale: 0.95 } : {}}
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        </motion.button>
    </motion.div>
);

const PendingRequestCard = ({ request, onAccept, onReject, isProcessing, categoryStyle }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/20 rounded-xl border border-white/5 p-4 flex items-center justify-between group hover:bg-black/30 transition-all duration-300"
    >
        <div className="flex items-center gap-3">
            <div 
                className="w-12 h-12 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center"
                style={{ backgroundColor: request.avatarColor || categoryStyle.primaryColor }}
            >
                <span className="text-lg font-bold text-white">
                    {request.username.charAt(0).toUpperCase()}
                </span>
            </div>
            <div>
                <h4 className="font-medium text-white group-hover:text-emerald-400 transition-colors duration-300">
                    {request.username}
                </h4>
                <p className="text-xs text-white/60">Nivel {request.level}</p>
            </div>
        </div>
        <div className="flex gap-2">
            <motion.button
                onClick={() => onAccept(request.id)}
                disabled={isProcessing}
                className="p-2 rounded-xl text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all duration-300"
                whileHover={!isProcessing ? { scale: 1.05 } : {}}
                whileTap={!isProcessing ? { scale: 0.95 } : {}}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </motion.button>
            <motion.button
                onClick={() => onReject(request.id)}
                disabled={isProcessing}
                className="p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300"
                whileHover={!isProcessing ? { scale: 1.05 } : {}}
                whileTap={!isProcessing ? { scale: 0.95 } : {}}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </motion.button>
        </div>
    </motion.div>
);

const RemoveFriendDialog = ({ isOpen, onClose, onConfirm, friendName, isProcessing }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-black/90 border border-white/10 rounded-2xl p-6 max-w-xs w-full mx-4"
                >
                    <h3 className="text-xl font-bold text-white mb-3">Eliminar Amigo</h3>
                    <p className="text-sm text-white/60 mb-6">
                        ¿Estás seguro de que quieres eliminar a {friendName} de tu lista de amigos?
                    </p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            disabled={isProcessing}
                            className="px-4 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all duration-300"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isProcessing}
                            className="px-4 py-2 rounded-xl text-sm text-white bg-red-500 hover:bg-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                    Eliminando...
                                </div>
                            ) : (
                                'Eliminar'
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

const FriendsList = ({ onFriendRemoved, onRequestAccepted, onRequestRejected }) => {
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [removeDialog, setRemoveDialog] = useState({ isOpen: false, friendId: null, friendName: '' });
    const [showRequestsMenu, setShowRequestsMenu] = useState(false);
    const [showSentRequestsMenu, setShowSentRequestsMenu] = useState(false);
    const menuRef = useRef(null);
    const sentMenuRef = useRef(null);
    const { getCategoryStyle } = useCategory();
    const categoryStyle = getCategoryStyle();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowRequestsMenu(false);
            }
            if (sentMenuRef.current && !sentMenuRef.current.contains(event.target)) {
                setShowSentRequestsMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const loadFriends = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getFriends();
            setFriends(response?.friends || []);
            setPendingRequests(response?.pending_requests || []);
            setSentRequests(response?.sent_requests || []);
        } catch (error) {
            const errorMessage = error.message === 'No autorizado. Por favor, inicia sesión nuevamente.'
                ? 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
                : 'Error al cargar amigos';
            setError(errorMessage);
            toast.error(errorMessage);
            setFriends([]);
            setPendingRequests([]);
            setSentRequests([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadFriends();
    }, [loadFriends]);

    useEffect(() => {
        const interval = setInterval(() => {
            loadFriends();
        }, 30000);

        return () => clearInterval(interval);
    }, [loadFriends]);

    const handleAcceptRequest = async (requestId) => {
        if (isProcessing) return;
        
        setIsProcessing(true);
        try {
            await acceptFriendRequest(requestId);
            setPendingRequests(prev => prev.filter(request => request.id !== requestId));
            if (onRequestAccepted) {
                onRequestAccepted();
            }
            await loadFriends();
        } catch (error) {
            const errorMessage = error.message === 'No autorizado. Por favor, inicia sesión nuevamente.'
                ? 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
                : 'Error al aceptar solicitud';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRejectRequest = async (requestId) => {
        if (isProcessing) return;
        
        setIsProcessing(true);
        try {
            await removeFriend(requestId);
            setPendingRequests(prev => prev.filter(request => request.id !== requestId));
            if (onRequestRejected) {
                onRequestRejected();
            }
            await loadFriends();
        } catch (error) {
            const errorMessage = error.message === 'No autorizado. Por favor, inicia sesión nuevamente.'
                ? 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
                : 'Error al rechazar solicitud';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRemoveFriend = (friendId) => {
        const friend = friends.find(f => f.id === friendId);
        if (friend) {
            setRemoveDialog({
                isOpen: true,
                friendId,
                friendName: friend.username
            });
        }
    };

    const confirmRemoveFriend = async () => {
        if (isProcessing) return;
        
        setIsProcessing(true);
        try {
            await removeFriend(removeDialog.friendId);
            setFriends(prev => prev.filter(friend => friend.id !== removeDialog.friendId));
            if (onFriendRemoved) {
                onFriendRemoved();
            }
            setRemoveDialog({ isOpen: false, friendId: null, friendName: '' });
        } catch (error) {
            const errorMessage = error.message === 'No autorizado. Por favor, inicia sesión nuevamente.'
                ? 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
                : 'Error al eliminar amigo';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="p-6 border-b border-white/5 bg-black/20">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-white mb-1">Mis Amigos</h2>
                        <p className="text-xs text-white/60">Gestiona tu lista de amigos y solicitudes pendientes</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setShowRequestsMenu(!showRequestsMenu)}
                                className="relative p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all duration-300"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {pendingRequests.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                                        {pendingRequests.length}
                                    </span>
                                )}
                            </button>
                            <AnimatePresence>
                                {showRequestsMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 mt-2 w-72 bg-black/90 border border-white/10 rounded-xl shadow-lg z-50 backdrop-blur-sm"
                                    >
                                        <div className="p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-sm font-medium text-white/60">Solicitudes Recibidas</h3>
                                                {pendingRequests.length > 0 && (
                                                    <span className="text-xs text-white/40">{pendingRequests.length} nueva(s)</span>
                                                )}
                                            </div>
                                            {pendingRequests.length > 0 ? (
                                                <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                                                    {pendingRequests.map(request => (
                                                        <PendingRequestCard
                                                            key={request.id}
                                                            request={request}
                                                            onAccept={handleAcceptRequest}
                                                            onReject={handleRejectRequest}
                                                            isProcessing={isProcessing}
                                                            categoryStyle={categoryStyle}
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-4">
                                                    <svg className="w-8 h-8 mx-auto mb-2 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                    </svg>
                                                    <p className="text-sm text-white/60">No hay solicitudes pendientes</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="relative" ref={sentMenuRef}>
                            <button
                                onClick={() => setShowSentRequestsMenu(!showSentRequestsMenu)}
                                className="relative p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all duration-300"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                {sentRequests.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {sentRequests.length}
                                    </span>
                                )}
                            </button>
                            <AnimatePresence>
                                {showSentRequestsMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 mt-2 w-72 bg-black/90 border border-white/10 rounded-xl shadow-lg z-50 backdrop-blur-sm"
                                    >
                                        <div className="p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-sm font-medium text-white/60">Solicitudes Enviadas</h3>
                                                {sentRequests.length > 0 && (
                                                    <span className="text-xs text-white/40">{sentRequests.length} pendiente(s)</span>
                                                )}
                                            </div>
                                            {sentRequests.length > 0 ? (
                                                <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                                                    {sentRequests.map(request => (
                                                        <motion.div
                                                            key={request.id}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="bg-black/20 rounded-xl border border-white/5 p-4 flex items-center justify-between group hover:bg-black/30 transition-all duration-300"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div 
                                                                    className="w-12 h-12 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center"
                                                                    style={{ backgroundColor: request.avatarColor || categoryStyle.primaryColor }}
                                                                >
                                                                    <span className="text-lg font-bold text-white">
                                                                        {request.username.charAt(0).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-medium text-white group-hover:text-emerald-400 transition-colors duration-300">
                                                                        {request.username}
                                                                    </h4>
                                                                    <p className="text-xs text-white/60">Nivel {request.level}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-xs text-white/40">
                                                                Pendiente
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-4">
                                                    <svg className="w-8 h-8 mx-auto mb-2 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                    </svg>
                                                    <p className="text-sm text-white/60">No hay solicitudes enviadas</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="bg-black/40 rounded-xl px-3 py-1.5 border border-white/5 flex items-center gap-2">
                            <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="text-sm text-white/60">Amigos: </span>
                            <span className="text-sm font-medium text-white">{friends.length}</span>
                        </div>
                    </div>
                </div>
                
                {error && (
                    <div className="mb-3 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-xs">
                        {error}
                    </div>
                )}
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: categoryStyle.primaryColor }}></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {friends.length > 0 ? (
                            <div>
                                <h3 className="text-sm font-medium text-white/60 mb-3">Lista de Amigos</h3>
                                <div className="space-y-3">
                                    {friends.map(friend => (
                                        <FriendCard
                                            key={friend.id}
                                            friend={friend}
                                            onRemove={handleRemoveFriend}
                                            isProcessing={isProcessing}
                                            categoryStyle={categoryStyle}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-sm text-white/60">No tienes amigos aún</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <RemoveFriendDialog
                isOpen={removeDialog.isOpen}
                onClose={() => setRemoveDialog({ isOpen: false, friendId: null, friendName: '' })}
                onConfirm={confirmRemoveFriend}
                friendName={removeDialog.friendName}
                isProcessing={isProcessing}
            />
        </div>
    );
};

export default FriendsList; 