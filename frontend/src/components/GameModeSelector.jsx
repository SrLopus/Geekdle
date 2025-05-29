import { motion } from 'framer-motion';
import { useGameMode } from '../context/GameModeContext';

export default function GameModeSelector() {
    const { setGameMode } = useGameMode();

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full space-y-8"
            >
                <div className="text-center">
                    <motion.h1 
                        className="text-4xl font-black tracking-wider text-white mb-2"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        GEEKDLE
                    </motion.h1>
                    <motion.p 
                        className="text-white/60 text-sm tracking-wide"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        Selecciona tu modo de juego
                    </motion.p>
                </div>

                <div className="space-y-4">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setGameMode('daily')}
                        className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-green-500 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-green-500/25 transition-all duration-300"
                    >
                        Modo Diario
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setGameMode('infinite')}
                        className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                    >
                        Modo Infinito
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
} 