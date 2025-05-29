import { motion } from 'framer-motion';

const keyboardLayout = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
];

const keyColors = {
    correct: 'bg-green-600 hover:bg-green-700',
    present: 'bg-yellow-500 hover:bg-yellow-600',
    absent: 'bg-gray-900 hover:bg-gray-950',
    unused: 'bg-gray-600 hover:bg-gray-700'
};

export default function VirtualKeyboard({
    isWordReady,
    isTransitioning,
    currentGuess,
    wordLength,
    activeKey,
    getKeyState,
    onKeyPress
}) {
    return (
        <motion.div
            className="fixed bottom-4 sm:bottom-8 w-full max-w-[500px] mx-auto left-0 right-0 py-2 sm:py-4 px-2 sm:px-4 z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            <div className="w-full mx-auto space-y-1 sm:space-y-2">
                {keyboardLayout.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex justify-center gap-0.5 sm:gap-1">
                        {row.map((key) => {
                            const keyState = getKeyState(key);
                            const isSpecialKey = key === 'ENTER' || key === '⌫';
                            const isActive = activeKey === key;
                            
                            return (
                                <motion.button
                                    key={key}
                                    whileHover={isWordReady && !isTransitioning ? { scale: 1.05 } : {}}
                                    whileTap={isWordReady && !isTransitioning ? { scale: 0.95 } : {}}
                                    animate={{
                                        scale: isActive && isWordReady && !isTransitioning ? 0.95 : 1
                                    }}
                                    onClick={() => onKeyPress(key)}
                                    disabled={!isWordReady || isTransitioning || (!isSpecialKey && currentGuess.length >= wordLength)}
                                    className={`px-2 sm:px-3 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-bold uppercase
                                        ${isSpecialKey ? 'w-16 sm:w-20' : 'w-8 sm:w-10'}
                                        ${isSpecialKey ? 'bg-gray-700/50 hover:bg-gray-600/50' : keyColors[keyState]}
                                        ${(!isSpecialKey && currentGuess.length >= wordLength) || !isWordReady || isTransitioning ? 'opacity-50 cursor-not-allowed' : ''}
                                        text-white transition-all duration-200 shadow-lg
                                        ${isActive ? 'ring-2 ring-white/50' : ''}
                                        font-mono tracking-wider relative`}
                                    style={{
                                        backgroundColor: !isWordReady || isTransitioning ? 'rgba(31, 41, 55, 0.5)' :
                                                       isActive ? 'rgba(255,255,255,0.2)' : 
                                                       isSpecialKey ? 'rgba(71, 85, 105, 0.5)' : 
                                                       keyState === 'correct' ? '#16a34a' :
                                                       keyState === 'present' ? '#eab308' :
                                                       keyState === 'absent' ? '#111827' :
                                                       'rgba(71, 85, 105, 0.5)',
                                        boxShadow: '0 0 10px rgba(255,255,255,0.1)'
                                    }}
                                >
                                    {key}
                                    {(!isWordReady || isTransitioning) && (
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-lg"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                ))}
            </div>
        </motion.div>
    );
} 