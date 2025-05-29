import { motion } from 'framer-motion';

export default function GameTitle({ 
    categoryName, 
    categoryStyle, 
    gameMode, 
    MAX_ATTEMPTS, 
    timeLeft, 
    isTransitioning, 
    isCalculatingTime, 
    score, 
    streak, 
    gameOver, 
    onShowHints 
}) {
    return (
        <div className="relative z-10 w-full max-w-sm mx-auto mb-6 sm:mb-12">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
            >
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
                    <h1 
                        className="text-2xl sm:text-4xl font-black tracking-wider"
                        style={{ color: categoryStyle.primaryColor }}
                    >
                        {categoryName}
                    </h1>
                    {!gameOver && (
                        <button
                            onClick={onShowHints}
                            className="p-1.5 sm:p-2 rounded-lg bg-black/40 backdrop-blur-xl border border-white/5 hover:bg-white/5 transition-all duration-200"
                            title="Mostrar pistas"
                            style={{ color: categoryStyle.primaryColor }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                </div>
                {gameMode === 'daily' ? (
                    <>
                        <p className="text-white/60 text-xs sm:text-sm tracking-wide mb-1 sm:mb-2">
                            Adivina la palabra en {MAX_ATTEMPTS} intentos
                        </p>
                        <div className="text-white/80 text-xs sm:text-sm font-medium">
                            {gameOver ? (
                                <span style={{ color: categoryStyle.primaryColor }}>
                                    Próxima palabra disponible a las 00:00
                                </span>
                            ) : (
                                <>
                                    Siguiente palabra en: <span style={{ color: categoryStyle.primaryColor }}>
                                        {!timeLeft || isTransitioning ? (
                                            <motion.span
                                                initial={{ opacity: 0.5 }}
                                                animate={{ opacity: [0.5, 1, 0.5] }}
                                                transition={{
                                                    duration: 1,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                            >
                                                Cargando...
                                            </motion.span>
                                        ) : isCalculatingTime ? (
                                            <motion.span
                                                initial={{ opacity: 0.5 }}
                                                animate={{ opacity: [0.5, 1, 0.5] }}
                                                transition={{
                                                    duration: 1,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                            >
                                                Calculando...
                                            </motion.span>
                                        ) : (
                                            timeLeft
                                        )}
                                    </span>
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-white/60 text-xs sm:text-sm tracking-wide mb-1 sm:mb-2">
                            Modo Infinito - Adivina palabras sin límite
                        </p>
                        <div className="flex justify-center items-center gap-2 sm:gap-4 text-white/80 text-xs sm:text-sm font-medium">
                            <div>
                                Puntuación: <span className="text-green-400">{score}</span>
                            </div>
                            <div>
                                Racha: <span className="text-yellow-400">{streak}</span>
                            </div>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
} 