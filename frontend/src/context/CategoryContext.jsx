import { createContext, useContext, useState } from 'react';

const CategoryContext = createContext();

const categoryStyles = {
    tecnologia: {
        primaryColor: '#10B981', // verde
        secondaryColor: '#059669',
        gradient: 'from-green-600 to-green-500',
        icon: '💻'
    },
    programacion: {
        primaryColor: '#3B82F6', // azul
        secondaryColor: '#2563EB',
        gradient: 'from-blue-600 to-blue-500',
        icon: '👨‍💻'
    },
    videojuegos: {
        primaryColor: '#8B5CF6', // morado
        secondaryColor: '#7C3AED',
        gradient: 'from-purple-600 to-purple-500',
        icon: '🎮'
    },
    anime: {
        primaryColor: '#EC4899', // rosa
        secondaryColor: '#DB2777',
        gradient: 'from-pink-600 to-pink-500',
        icon: '🎌'
    },
    manga: {
        primaryColor: '#F59E0B', // naranja
        secondaryColor: '#D97706',
        gradient: 'from-orange-600 to-orange-500',
        icon: '📚'
    },
    comics: {
        primaryColor: '#EF4444', // rojo
        secondaryColor: '#DC2626',
        gradient: 'from-red-600 to-red-500',
        icon: '🦸'
    },
    peliculas: {
        primaryColor: '#6366F1', // índigo
        secondaryColor: '#4F46E5',
        gradient: 'from-indigo-600 to-indigo-500',
        icon: '🎬'
    },
    series: {
        primaryColor: '#14B8A6', // teal
        secondaryColor: '#0D9488',
        gradient: 'from-teal-600 to-teal-500',
        icon: '📺'
    },
    hardware: {
        primaryColor: '#6B7280', // gris
        secondaryColor: '#4B5563',
        gradient: 'from-gray-600 to-gray-500',
        icon: '🔧'
    },
    internet: {
        primaryColor: '#06B6D4', // cyan
        secondaryColor: '#0891B2',
        gradient: 'from-cyan-600 to-cyan-500',
        icon: '🌐'
    }
};

export function CategoryProvider({ children }) {
    const [selectedCategory, setSelectedCategory] = useState('tecnologia');

    const getCategoryStyle = (category) => {
        return categoryStyles[category] || categoryStyles.tecnologia;
    };

    return (
        <CategoryContext.Provider value={{ 
            selectedCategory, 
            setSelectedCategory,
            getCategoryStyle,
            categoryStyles
        }}>
            {children}
        </CategoryContext.Provider>
    );
}

export function useCategory() {
    const context = useContext(CategoryContext);
    if (!context) {
        throw new Error('useCategory debe ser usado dentro de un CategoryProvider');
    }
    return context;
} 