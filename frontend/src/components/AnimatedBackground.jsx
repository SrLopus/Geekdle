import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCategory } from '../context/CategoryContext';

const Star = ({ x, y, size, delay, color }) => (
    <motion.div
        initial={{ opacity: 0.2, scale: 0.8 }}
        animate={{ 
            opacity: [0.2, 1, 0.2],
            scale: [0.8, 1.5, 0.8]
        }}
        transition={{
            duration: 2,
            delay,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "loop"
        }}
        className="absolute rounded-full pointer-events-none"
        style={{
            left: `${x}%`,
            top: `${y}%`,
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: color,
            boxShadow: `0 0 20px ${color}, 0 0 40px ${color}40`,
            filter: 'blur(0.5px)'
        }}
    />
);

const ExplosionStar = ({ x, y, angle, distance, color }) => (
    <motion.div
        initial={{ 
            x: 0,
            y: 0,
            scale: 0,
            opacity: 1
        }}
        animate={{ 
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
            scale: [0, 1.5, 0],
            opacity: [1, 1, 0]
        }}
        transition={{
            duration: 1.5,
            ease: [0.25, 0.1, 0.25, 1],
            times: [0, 0.5, 1]
        }}
        className="absolute rounded-full pointer-events-none"
        style={{
            left: `${x}%`,
            top: `${y}%`,
            width: '3px',
            height: '3px',
            backgroundColor: color,
            boxShadow: `0 0 20px ${color}, 0 0 40px ${color}40`,
            filter: 'blur(0.5px)'
        }}
    />
);

export default function AnimatedBackground() {
    const [stars, setStars] = useState([]);
    const [explosions, setExplosions] = useState([]);
    const [isClicking, setIsClicking] = useState(false);
    const { selectedCategory, getCategoryStyle } = useCategory();
    const categoryStyle = getCategoryStyle(selectedCategory);

    useEffect(() => {
        // Generar menos estrellas para mejor rendimiento
        const newStars = Array.from({ length: 150 }, () => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2 + 1,
            delay: Math.random() * 2
        }));
        setStars(newStars);

        // Actualizar las estrellas cada 2 segundos
        const interval = setInterval(() => {
            setStars(prevStars => 
                prevStars.map(star => ({
                    ...star,
                    delay: Math.random() * 2
                }))
            );
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    // Limpiar explosiones antiguas
    useEffect(() => {
        const cleanupInterval = setInterval(() => {
            setExplosions(prev => prev.filter(exp => Date.now() - exp.id < 1500));
        }, 1000);

        return () => clearInterval(cleanupInterval);
    }, []);

    const handleClick = useCallback((e) => {
        if (isClicking) return;
        
        setIsClicking(true);
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // Crear nueva explosión con más estrellas y mayor distancia
        const newExplosion = {
            id: Date.now(),
            x: x,
            y: y,
            stars: Array.from({ length: 25 }, () => ({
                angle: Math.random() * Math.PI * 2,
                distance: Math.random() * 300 + 100
            }))
        };

        setExplosions(prev => [...prev.slice(-2), newExplosion]);

        // Resetear el estado de clic después de un breve delay
        setTimeout(() => {
            setIsClicking(false);
        }, 100);
    }, [isClicking]);

    return (
        <div 
            className="fixed inset-0 pointer-events-auto overflow-hidden bg-black z-0"
            onClick={handleClick}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 0,
                pointerEvents: 'auto'
            }}
        >
            {stars.map((star, index) => (
                <Star key={index} {...star} color={categoryStyle.primaryColor} />
            ))}
            <AnimatePresence>
                {explosions.map(explosion => (
                    <div key={explosion.id}>
                        {explosion.stars.map((star, index) => (
                            <ExplosionStar key={index} {...star} x={explosion.x} y={explosion.y} color={categoryStyle.primaryColor} />
                        ))}
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
} 