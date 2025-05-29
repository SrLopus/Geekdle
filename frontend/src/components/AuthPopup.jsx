import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function AuthPopup({ isVisible, onClose, isWin }) {
    const navigate = useNavigate();

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-xl p-6 max-w-md w-full shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="text-center">
                            <div className="mb-6">
                                <span className="text-4xl">
                                    {isWin ? '🎉' : '🎮'}
                                </span>
                            </div>
                            <h2 className="text-2xl font-black tracking-wider text-white mb-4">
                                {isWin ? '¡Enhorabuena!' : '¡Sigue jugando!'}
                            </h2>
                            <p className="text-white/80 mb-8">
                                {isWin 
                                    ? 'Para ser parte de la comunidad y guardar tu progreso, inicia sesión.'
                                    : 'Inicia sesión para guardar tu progreso y competir con otros jugadores.'}
                            </p>
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                                >
                                    Iniciar Sesión
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
} 