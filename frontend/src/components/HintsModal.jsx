import { motion } from 'framer-motion';

export default function HintsModal({
    isVisible,
    onClose,
    hints,
    guesses,
    categoryStyle
}) {
    if (!isVisible) return null;

    return (
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
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">💡</span>
                        <h2 
                            className="text-xl font-black tracking-wider"
                            style={{ color: categoryStyle.primaryColor }}
                        >
                            Pistas
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/60 hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="space-y-3">
                    {hints.map((hint, index) => {
                        const shouldShowHint = guesses.length >= index + 1;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`bg-white/5 rounded-lg p-4 border border-white/5 transition-all duration-300 ${
                                    shouldShowHint ? 'opacity-100' : 'opacity-40'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <span 
                                        className="text-sm font-medium mt-1"
                                        style={{ color: categoryStyle.primaryColor }}
                                    >
                                        {index + 1}.
                                    </span>
                                    <div className="flex-1">
                                        {shouldShowHint ? (
                                            <p className="text-white/80">{hint}</p>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <p className="text-white/40">
                                                    {`Pista disponible después del intento ${index + 1}`}
                                                </p>
                                                <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/40">
                                                    {guesses.length}/{index + 1}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        </motion.div>
    );
} 