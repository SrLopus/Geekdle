import { createContext, useContext, useState, useEffect } from 'react';
import { useCategory } from './CategoryContext';

const GameModeContext = createContext();

export function GameModeProvider({ children }) {
    const [gameMode, setGameMode] = useState('daily');
    const { setSelectedCategory } = useCategory();

    // Efecto para manejar la inicialización del modo infinito
    useEffect(() => {
        if (gameMode === 'infinite') {
            setSelectedCategory('tecnologia');
        }
    }, [gameMode, setSelectedCategory]);

    const handleSetGameMode = (mode) => {
        setGameMode(mode);
    };

    return (
        <GameModeContext.Provider value={{ gameMode, setGameMode: handleSetGameMode }}>
            {children}
        </GameModeContext.Provider>
    );
}

export function useGameMode() {
    const context = useContext(GameModeContext);
    if (!context) {
        throw new Error('useGameMode debe ser usado dentro de un GameModeProvider');
    }
    return context;
} 