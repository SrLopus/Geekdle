import { motion } from 'framer-motion';

export default function GameBoard({
    wordLength,
    MAX_ATTEMPTS,
    guesses,
    currentGuess,
    shakeRow,
    revealRow,
    isInitialLoad,
    isTransitioning,
    getLetterState
}) {
    return (
        <motion.div 
            className="relative z-10 w-full mx-auto"
            style={{
                maxWidth: `min(95vw, ${wordLength * 4}rem)`,
                padding: '0 0.5rem',
                marginTop: 'env(safe-area-inset-top)'
            }}
            initial={{ opacity: 0.5 }}
            animate={{
                opacity: isInitialLoad || isTransitioning ? [0.5, 0.8, 0.5] : 1,
                scale: isInitialLoad || isTransitioning ? [1, 1.02, 1] : 1
            }}
            transition={{
                duration: isInitialLoad || isTransitioning ? 1.5 : 0.3,
                repeat: isInitialLoad || isTransitioning ? Infinity : 0,
                ease: "easeInOut"
            }}
        >
            <div className="grid grid-rows-6 gap-1 sm:gap-2 md:gap-3">
                {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIndex) => (
                    <motion.div
                        key={rowIndex}
                        className="grid"
                        style={{ 
                            gridTemplateColumns: `repeat(${wordLength}, 1fr)`,
                            gap: `min(0.25rem, ${100 / (wordLength * 3)}vw)`
                        }}
                        animate={shakeRow === rowIndex ? {
                            x: [0, -10, 10, -10, 10, 0],
                            transition: {
                                duration: 0.3,
                                ease: "easeInOut"
                            }
                        } : {}}
                    >
                        {Array.from({ length: wordLength }).map((_, colIndex) => {
                            const letter = guesses[rowIndex]?.[colIndex] || 
                                         (rowIndex === guesses.length ? currentGuess[colIndex] : '');
                            const state = getLetterState(letter, colIndex, rowIndex);
                            
                            return (
                                <motion.div
                                    key={colIndex}
                                    initial={false}
                                    animate={{
                                        ...(revealRow === rowIndex && {
                                            scale: [1, 1.2, 1],
                                            transition: {
                                                duration: 0.3,
                                                delay: colIndex * 0.1
                                            }
                                        })
                                    }}
                                    transition={{ duration: 0.3 }}
                                    className={`aspect-square flex items-center justify-center font-black uppercase
                                        ${letter ? state : shakeRow === rowIndex ? 'border-2 border-red-400' : 'border-2 border-white/20'} 
                                        ${letter ? 'text-white' : 'text-transparent'}
                                        font-mono tracking-wider relative
                                        ${isInitialLoad || isTransitioning ? 'bg-gray-800/50' : ''}
                                        sm:border-[3px] md:border-4`}
                                    style={{
                                        boxShadow: letter ? '0 0 10px rgba(255,255,255,0.1)' : 'none',
                                        backgroundColor: isInitialLoad || isTransitioning ? 'rgba(31, 41, 55, 0.5)' : 
                                                       letter ? '' : 'transparent',
                                        fontSize: `clamp(1rem, ${100 / (wordLength * 1.5)}vw, ${wordLength > 5 ? '1.25rem' : '1.5rem'})`
                                    }}
                                >
                                    {letter}
                                    {(isInitialLoad || isTransitioning) && (
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-gray-800/50"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        />
                                    )}
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
} 