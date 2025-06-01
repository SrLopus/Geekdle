import { motion, AnimatePresence } from 'framer-motion';

export default function Toast({ message, type = 'info', isVisible, onClose }) {
    const variants = {
        hidden: { 
            opacity: 0, 
            scale: 0.8,
            y: window.innerWidth < 640 ? 50 : -100,
            x: '-50%'
        },
        visible: { 
            opacity: 1, 
            scale: 1,
            y: 0,
            x: '-50%',
            transition: {
                type: "spring",
                stiffness: 500,
                damping: 30
            }
        },
        exit: { 
            opacity: 0, 
            scale: 0.8,
            y: window.innerWidth < 640 ? 50 : -100,
            x: '-50%',
            transition: {
                duration: 0.2
            }
        }
    };

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300';
            case 'error':
                return 'bg-red-500/20 border-red-500/50 text-red-300';
            case 'warning':
                return 'bg-amber-500/20 border-amber-500/50 text-amber-300';
            default:
                return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    variants={variants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={`fixed ${
                        window.innerWidth < 640 
                            ? 'bottom-[200px]' 
                            : 'top-20'
                        } left-1/2 z-20
                        ${getTypeStyles()} 
                        px-4 sm:px-6 py-2 sm:py-3 rounded-xl
                        flex items-center gap-2 sm:gap-3 border
                        font-mono tracking-wider min-w-[280px] sm:min-w-[300px] max-w-[90vw]
                        backdrop-blur-xl bg-opacity-90
                        shadow-[0_0_50px_rgba(0,0,0,0.3)]`}
                    style={{
                        position: 'fixed',
                        zIndex: 20
                    }}
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        className="text-xl sm:text-2xl bg-white/10 p-1.5 sm:p-2 rounded-lg"
                    >
                        {type === 'success' && '🎮'}
                        {type === 'error' && '💀'}
                        {type === 'warning' && '⚠️'}
                        {type === 'info' && 'ℹ️'}
                    </motion.div>
                    <div className="flex flex-col">
                        <span className="text-sm sm:text-base font-black uppercase tracking-wider">{message}</span>
                        <span className="text-[10px] sm:text-xs opacity-70">
                            {type === 'success' && '¡Excelente trabajo!'}
                            {type === 'error' && '¡Inténtalo de nuevo!'}
                            {type === 'warning' && '¡Ten cuidado!'}
                            {type === 'info' && 'Información importante'}
                        </span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
} 