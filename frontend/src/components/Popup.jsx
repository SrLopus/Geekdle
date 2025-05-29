import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Popup = ({
    isOpen,
    onClose,
    title,
    message,
    subMessage,
    icon,
    iconBgColor = "bg-red-500/20",
    iconColor = "text-red-400",
    buttons = [],
    children
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex items-center gap-3">
                                {icon && (
                                    <div className={`w-12 h-12 rounded-full ${iconBgColor} flex items-center justify-center`}>
                                        {icon}
                                    </div>
                                )}
                                <h2 className="text-2xl font-black tracking-wider text-white">
                                    {title}
                                </h2>
                            </div>
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                            {message && (
                                <p className="text-center text-white/80 tracking-wide text-lg">
                                    {message}
                                </p>
                            )}
                            {(subMessage || children) && (
                                <div className="bg-white/5 rounded-lg px-4 py-3 w-full">
                                    {subMessage && (
                                        <p className="text-center text-white/60 tracking-wide">
                                            {subMessage}
                                        </p>
                                    )}
                                    {children}
                                </div>
                            )}
                            {buttons.length > 0 && (
                                <div className="flex gap-3 mt-2 w-full">
                                    {buttons.map((button, index) => (
                                        <button
                                            key={index}
                                            onClick={button.onClick}
                                            className={`flex-1 px-6 py-2.5 ${button.className} backdrop-blur-xl border transition-all duration-200 flex items-center justify-center gap-2`}
                                        >
                                            {button.icon && button.icon}
                                            <span className="font-medium tracking-wide">{button.text}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Popup; 