import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCategory } from '../context/CategoryContext';

const categories = [
    { id: 'tecnologia', name: 'Tecnología', icon: '💻' },
    { id: 'programacion', name: 'Programación', icon: '👨‍💻' },
    { id: 'videojuegos', name: 'Videojuegos', icon: '🎮' },
    { id: 'anime', name: 'Anime', icon: '🎌' },
    { id: 'manga', name: 'Manga', icon: '📚' },
    { id: 'comics', name: 'Cómics', icon: '🦸' },
    { id: 'peliculas', name: 'Películas', icon: '🎬' },
    { id: 'series', name: 'Series', icon: '📺' },
    { id: 'hardware', name: 'Hardware', icon: '🔧' },
    { id: 'internet', name: 'Internet', icon: '🌐' }
];

const CategorySidebar = () => {
    const [isVisible, setIsVisible] = useState(true);
    const { selectedCategory, setSelectedCategory, getCategoryStyle } = useCategory();
    const currentStyle = getCategoryStyle(selectedCategory);

    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    return (
        <>
            <motion.button
                onClick={toggleVisibility}
                className="fixed left-8 top-24 z-50 bg-black/40 backdrop-blur-xl rounded-lg px-4 py-2.5 border border-white/5 hover:bg-white/5 transition-all duration-200 flex items-center gap-2 group shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <svg 
                    className="w-5 h-5"
                    style={{ color: currentStyle.primaryColor }}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors duration-200">
                    Categorías
                </span>
            </motion.button>

            <AnimatePresence mode="wait">
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, x: -100, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -100, scale: 0.95 }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 300, 
                            damping: 30
                        }}
                        className="fixed left-8 top-36 w-80 bg-black/40 backdrop-blur-xl rounded-xl border border-white/5 overflow-hidden shadow-2xl z-50"
                    >
                        <motion.div 
                            className="p-4 border-b border-white/5 bg-black/20"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <svg 
                                    className="w-5 h-5" 
                                    style={{ color: currentStyle.primaryColor }}
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                Selecciona una Categoría
                            </h2>
                        </motion.div>
                        <div className="h-[500px] overflow-y-auto custom-scrollbar">
                            {categories.map((category, index) => {
                                const categoryStyle = getCategoryStyle(category.id);
                                return (
                                    <motion.div
                                        key={category.id}
                                        initial={{ opacity: 0, x: -50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ 
                                            delay: 0.2 + (index * 0.02),
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 30
                                        }}
                                    >
                                        <motion.button
                                            onClick={() => setSelectedCategory(category.id)}
                                            className={`w-full p-3 flex items-center gap-3 border-b border-white/5 hover:bg-white/5 transition-colors duration-200 ${
                                                selectedCategory === category.id ? 'bg-opacity-10' : ''
                                            }`}
                                            style={{
                                                backgroundColor: selectedCategory === category.id 
                                                    ? `${categoryStyle.primaryColor}20` 
                                                    : 'transparent'
                                            }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <span className="text-2xl">{category.icon}</span>
                                            <span 
                                                className="font-medium text-base"
                                                style={{
                                                    color: selectedCategory === category.id 
                                                        ? categoryStyle.primaryColor 
                                                        : 'rgba(255, 255, 255, 0.8)'
                                                }}
                                            >
                                                {category.name}
                                            </span>
                                        </motion.button>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default CategorySidebar; 