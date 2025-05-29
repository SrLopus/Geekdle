import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LevelUpAnimation = ({ points, onComplete }) => {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                    scale: 1, 
                    opacity: 1,
                    transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                    }
                }}
                exit={{ 
                    scale: 0, 
                    opacity: 0,
                    transition: {
                        duration: 0.2
                    }
                }}
                className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
                onAnimationComplete={() => {
                    setTimeout(onComplete, 1500);
                }}
            >
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ 
                        y: 0, 
                        opacity: 1,
                        transition: {
                            type: "spring",
                            stiffness: 400,
                            damping: 10
                        }
                    }}
                    className="text-2xl font-black tracking-wider"
                    style={{ color: '#10b981' }}
                >
                    +{points} pts
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default LevelUpAnimation; 