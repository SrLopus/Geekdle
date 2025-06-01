import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCategory } from '../context/CategoryContext';
import { useAuth } from '../context/AuthContext';
import { checkPlayerProgress } from '../services/wordService';

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
    const [completedCategories, setCompletedCategories] = useState(new Set());
    const { selectedCategory, setSelectedCategory, getCategoryStyle } = useCategory();
    const { isAuthenticated } = useAuth();
    const currentStyle = getCategoryStyle(selectedCategory);

    useEffect(() => {
        const checkCompletedCategories = async () => {
            if (!isAuthenticated) return;

            const completed = new Set();
            for (const category of categories) {
                try {
                    const progress = await checkPlayerProgress('daily', category.id);
                    if (progress.has_played) {
                        completed.add(category.id);
                    }
                } catch (error) {
                    console.error(`Error al verificar categoría ${category.id}:`, error);
                }
            }
            setCompletedCategories(completed);
        };

        checkCompletedCategories();

        const handleCategoryCompleted = (event) => {
            const { category } = event.detail;
            setCompletedCategories(prev => {
                const newSet = new Set(prev);
                newSet.add(category);
                return newSet;
            });
        };

        window.addEventListener('categoryCompleted', handleCategoryCompleted);

        return () => {
            window.removeEventListener('categoryCompleted', handleCategoryCompleted);
        };
    }, [isAuthenticated]);

    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    return (
        <>
            {/* Botón de categorías - Visible en todas las pantallas */}
            <motion.button
                onClick={toggleVisibility}
                className="fixed left-4 lg:left-8 top-24 z-40 bg-black/40 backdrop-blur-xl rounded-lg px-3 lg:px-4 py-2 lg:py-2.5 border border-white/5 hover:bg-white/5 transition-all duration-200 flex items-center gap-2 group shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <svg 
                    className="w-4 h-4 lg:w-5 lg:h-5"
                    style={{ color: currentStyle.primaryColor }}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span className="hidden lg:inline text-sm font-medium text-white/80 group-hover:text-white transition-colors duration-200">
                    Categorías
                </span>
            </motion.button>

            <AnimatePresence mode="wait">
                {isVisible && (
                    <>
                        {/* Overlay para móvil */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={toggleVisibility}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
                        />

                        {/* Panel de categorías */}
                    <motion.div
                            initial={{ 
                                opacity: 0, 
                                x: window.innerWidth < 1024 ? 0 : -100,
                                y: window.innerWidth < 1024 ? '100%' : 0,
                                scale: 0.95 
                            }}
                            animate={{ 
                                opacity: 1, 
                                x: 0,
                                y: 0,
                                scale: 1 
                            }}
                            exit={{ 
                                opacity: 0, 
                                x: window.innerWidth < 1024 ? 0 : -100,
                                y: window.innerWidth < 1024 ? '100%' : 0,
                                scale: 0.95 
                            }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 300, 
                            damping: 30
                        }}
                            className={`fixed ${
                                window.innerWidth < 1024 
                                    ? 'bottom-0 left-0 right-0 w-full rounded-t-2xl' 
                                    : 'left-8 top-36 w-80 rounded-xl'
                            } bg-black/40 backdrop-blur-xl border border-white/5 overflow-hidden shadow-2xl z-40`}
                            style={{
                                maxHeight: window.innerWidth < 1024 ? '80vh' : '500px'
                            }}
                    >
                        <motion.div 
                                className="p-3 lg:p-4 border-b border-white/5 bg-black/20 flex items-center justify-between"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                                <h2 className="text-lg lg:text-xl font-bold text-white flex items-center gap-2">
                                <svg 
                                        className="w-4 h-4 lg:w-5 lg:h-5" 
                                    style={{ color: currentStyle.primaryColor }}
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                Selecciona una Categoría
                            </h2>
                                <button 
                                    onClick={toggleVisibility}
                                    className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                        </motion.div>
                            <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(80vh - 60px)' }}>
                                <div className="grid grid-cols-2 lg:grid-cols-1 gap-1 lg:gap-0">
                            {categories.map((category, index) => {
                                const categoryStyle = getCategoryStyle(category.id);
                                const isCompleted = completedCategories.has(category.id);
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
                                                    onClick={() => {
                                                        setSelectedCategory(category.id);
                                                        if (window.innerWidth < 1024) {
                                                            toggleVisibility();
                                                        }
                                                    }}
                                                    className={`w-full p-2 lg:p-3 flex items-center gap-2 lg:gap-3 border-b border-white/5 hover:bg-white/5 transition-colors duration-200 ${
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
                                            <div className="relative">
                                                        <span className="text-xl lg:text-2xl">{category.icon}</span>
                                                {isCompleted && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                                className="absolute -top-1 -right-1 w-3 h-3 lg:w-4 lg:h-4 bg-green-500 rounded-full flex items-center justify-center"
                                                    >
                                                                <svg className="w-2 h-2 lg:w-3 lg:h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </motion.div>
                                                )}
                                            </div>
                                            <span 
                                                        className="font-medium text-sm lg:text-base truncate"
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
                        </div>
                    </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default CategorySidebar; 