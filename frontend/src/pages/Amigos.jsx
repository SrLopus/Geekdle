import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FriendsList from '../components/FriendsList';
import FriendSearch from '../components/FriendSearch';
import { useCategory } from '../context/CategoryContext';
import { toast } from 'react-hot-toast';
import AnimatedBackground from '../components/AnimatedBackground';

const Amigos = () => {
    const [activeTab, setActiveTab] = useState('friends');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const { getCategoryStyle } = useCategory();
    const categoryStyle = getCategoryStyle();

    const handleRequestSent = useCallback(() => {
        toast.success('Solicitud enviada');
        setRefreshTrigger(prev => prev + 1);
        setActiveTab('friends');
    }, []);

    const handleFriendRemoved = useCallback(() => {
        toast.success('Amigo eliminado');
        setRefreshTrigger(prev => prev + 1);
    }, []);

    const handleRequestAccepted = useCallback(() => {
        toast.success('Solicitud aceptada');
        setRefreshTrigger(prev => prev + 1);
    }, []);

    const handleRequestRejected = useCallback(() => {
        toast.success('Solicitud rechazada');
        setRefreshTrigger(prev => prev + 1);
    }, []);

    return (
        <div className="min-h-screen relative">
            <AnimatedBackground />
            
            <div className="relative z-10 min-h-screen flex items-start justify-center p-4 pt-16">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-2xl bg-black/40 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl shadow-black/20 flex flex-col h-[600px] mt-8"
                >
                    <div className="p-6 border-b border-white/5 bg-black/20 rounded-t-2xl">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-black/20 border border-white/5 flex items-center justify-center">
                                <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Amigos</h1>
                                <p className="text-sm text-white/60">Gestiona tus amistades y encuentra nuevos amigos</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex border-b border-white/5">
                        <button
                            onClick={() => setActiveTab('friends')}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-300 ${
                                activeTab === 'friends'
                                    ? 'text-white border-b-2'
                                    : 'text-white/60 hover:text-white'
                            }`}
                            style={{
                                borderColor: activeTab === 'friends' ? categoryStyle.primaryColor : 'transparent'
                            }}
                        >
                            Mis Amigos
                        </button>
                        <button
                            onClick={() => setActiveTab('search')}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-300 ${
                                activeTab === 'search'
                                    ? 'text-white border-b-2'
                                    : 'text-white/60 hover:text-white'
                            }`}
                            style={{
                                borderColor: activeTab === 'search' ? categoryStyle.primaryColor : 'transparent'
                            }}
                        >
                            Buscar Amigos
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <AnimatePresence mode="wait">
                            {activeTab === 'friends' ? (
                                <motion.div
                                    key="friends"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                    className="h-full"
                                >
                                    <FriendsList 
                                        key={refreshTrigger}
                                        onFriendRemoved={handleFriendRemoved}
                                        onRequestAccepted={handleRequestAccepted}
                                        onRequestRejected={handleRequestRejected}
                                    />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="search"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="h-full"
                                >
                                    <FriendSearch 
                                        key={refreshTrigger}
                                        onRequestSent={handleRequestSent}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Amigos; 