import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useCategory } from '../context/CategoryContext';

const AnimatedBackground = () => {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const animationFrameRef = useRef(null);
    const { selectedCategory, getCategoryStyle } = useCategory();
    const categoryStyle = getCategoryStyle(selectedCategory);
    const isMobile = window.innerWidth <= 768;

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        // Aumentar el número de partículas
        const particleCount = isMobile ? 30 : 80; // Más partículas en ambos casos

        const createParticles = () => {
            particlesRef.current = Array.from({ length: particleCount }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.3 + 0.05
            }));
        };

        const updateParticles = () => {
            ctx.clearRect(0, 0, width, height);
            
            // Dibujar fondo negro
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, width, height);

            particlesRef.current.forEach(particle => {
                particle.x += particle.speedX;
                particle.y += particle.speedY;

                // Mantener las partículas dentro del canvas
                if (particle.x < 0) particle.x = width;
                if (particle.x > width) particle.x = 0;
                if (particle.y < 0) particle.y = height;
                if (particle.y > height) particle.y = 0;

                // Dibujar partícula con el color de la categoría
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = categoryStyle.primaryColor;
                ctx.globalAlpha = particle.opacity;
                ctx.fill();

                // Añadir efecto de brillo
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size * 1.5, 0, Math.PI * 2);
                ctx.fillStyle = categoryStyle.primaryColor;
                ctx.globalAlpha = particle.opacity * 0.3;
                ctx.fill();
            });

            animationFrameRef.current = requestAnimationFrame(updateParticles);
        };

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            createParticles();
        };

        createParticles();
        updateParticles();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [selectedCategory, categoryStyle.primaryColor, isMobile]);

    return (
        <motion.canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ zIndex: 0 }}
        />
    );
};

export default AnimatedBackground; 